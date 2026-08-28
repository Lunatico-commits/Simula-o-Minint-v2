import { 
  ref as rtdbRef, 
  set as rtdbSet, 
  update as rtdbUpdate, 
  get as rtdbGet, 
  remove as rtdbRemove,
  onDisconnect as rtdbOnDisconnect
} from 'firebase/database';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, rtdb } from '../lib/firebase';
import { DuelRoom, DuelPlayer } from '../types';

/** Maximum room age in milliseconds for open lobby rooms (2 minutes) */
export const MAX_OPEN_ROOM_AGE_MS = 2 * 60 * 1000;

/** Maximum inactivity threshold in milliseconds before considering a player/host offline (25 seconds) */
export const MAX_INACTIVITY_MS = 25 * 1000;

/**
 * Configure Firebase Realtime Database onDisconnect triggers for automatic cleanup
 * When host/guest loses connection, closes the app or navigates away.
 */
export function setupRoomOnDisconnect({
  roomId,
  userUid,
  isHost,
  status,
  opponentUid,
}: {
  roomId: string;
  userUid: string;
  isHost: boolean;
  status: 'waiting' | 'active' | 'finished';
  opponentUid?: string;
}) {
  if (!roomId || !userUid) return;

  try {
    const playerKey = isHost ? 'player1' : 'player2';

    // 1. Presence node onDisconnect
    const userPresenceRef = rtdbRef(rtdb, `duels/${roomId}/presence/${userUid}`);
    const presenceDisconnect = rtdbOnDisconnect(userPresenceRef);
    presenceDisconnect.set({
      isConnected: false,
      lastActive: Date.now(),
      disconnectedAt: Date.now(),
    });

    // 2. Player isConnected node onDisconnect
    const playerConnectedRef = rtdbRef(rtdb, `duels/${roomId}/${playerKey}/isConnected`);
    const playerConnDisconnect = rtdbOnDisconnect(playerConnectedRef);
    playerConnDisconnect.set(false);

    const playerLastActiveRef = rtdbRef(rtdb, `duels/${roomId}/${playerKey}/lastActive`);
    const playerLastActiveDisconnect = rtdbOnDisconnect(playerLastActiveRef);
    playerLastActiveDisconnect.set(Date.now());

    // 3. Room status onDisconnect:
    // When the room is waiting for an opponent, if the creator/host loses connection, closes the tab,
    // or exits the app, the entire room node is immediately deleted from RTDB via onDisconnect().remove()
    const roomRef = rtdbRef(rtdb, `duels/${roomId}`);
    if (status === 'waiting' && isHost) {
      rtdbOnDisconnect(roomRef).remove().catch((err) => {
        console.warn('[duelService] Erro ao registrar onDisconnect.remove() no RTDB:', err);
      });
    } else if (status === 'active') {
      // In active duels, cancel automatic room deletion so mobile jitter doesn't drop the active match
      rtdbOnDisconnect(roomRef).cancel().catch(() => {});
    }
  } catch (error) {
    console.warn('[duelService] Erro ao registrar onDisconnect no RTDB:', error);
  }
}

/**
 * Cancel or clear RTDB onDisconnect handlers when transitioning state
 */
export async function clearRoomOnDisconnect(roomId: string, userUid?: string) {
  if (!roomId) return;
  try {
    if (userUid) {
      const userPresenceRef = rtdbRef(rtdb, `duels/${roomId}/presence/${userUid}`);
      await rtdbOnDisconnect(userPresenceRef).cancel();
    }
    const roomRef = rtdbRef(rtdb, `duels/${roomId}`);
    await rtdbOnDisconnect(roomRef).cancel();
  } catch (e) {
    // Ignore cancellation errors
  }
}

/**
 * Validates if a room exists, is open, and if the creator/host is STILL ONLINE and active.
 * If the room is expired (> 2 min) or the creator is offline, cleans it up and returns invalid.
 */
export async function validateRoomAndHostAvailability(
  roomIdOrCode: string,
  joiningUserUid: string
): Promise<{
  isValid: boolean;
  errorMessage?: string;
  room?: DuelRoom;
  docId?: string;
}> {
  const UNAVAILABLE_MSG = 'Esta sala já não está disponível';

  if (!roomIdOrCode || !roomIdOrCode.trim()) {
    return { isValid: false, errorMessage: 'Código de sala inválido.' };
  }

  const cleanCode = roomIdOrCode.trim().toUpperCase().replace(/\s+/g, '');
  const now = Date.now();

  try {
    let roomData: DuelRoom | null = null;
    let roomDocId: string | null = null;

    // 1. Check RTDB first for instant, real-time live status
    try {
      const rtdbSnapshot = await rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}`));
      if (rtdbSnapshot.exists()) {
        roomData = rtdbSnapshot.val() as DuelRoom;
        roomDocId = cleanCode;
      }
    } catch (e) {
      console.warn('[duelService] Falha ao ler RTDB:', e);
    }

    // 2. Check Firestore if not found in RTDB directly
    if (!roomData) {
      try {
        const firestoreSnap = await getDoc(doc(db, 'duels', cleanCode));
        if (firestoreSnap.exists()) {
          roomData = firestoreSnap.data() as DuelRoom;
          roomDocId = firestoreSnap.id;
        }
      } catch (e) {
        console.warn('[duelService] Falha ao ler Firestore:', e);
      }
    }

    if (!roomData) {
      return { isValid: false, errorMessage: UNAVAILABLE_MSG };
    }

    // Check if the joining user is the host or player2 returning
    const isHost = roomData.player1?.uid === joiningUserUid || roomData.hostUid === joiningUserUid;
    const isReturningPlayer2 = roomData.player2?.uid === joiningUserUid;

    if (isHost || isReturningPlayer2) {
      return { isValid: true, room: roomData, docId: roomDocId || cleanCode };
    }

    // Check room status
    const status = (roomData.status as string) || '';
    if (
      status === 'abandoned' ||
      status === 'cancelled' ||
      status === 'closed' ||
      status === 'finished' ||
      status === 'playing' ||
      status === 'full'
    ) {
      return { isValid: false, errorMessage: UNAVAILABLE_MSG };
    }

    // If room already has a player 2
    if (roomData.player2 && roomData.player2.uid && roomData.player2.uid !== joiningUserUid) {
      return { isValid: false, errorMessage: UNAVAILABLE_MSG };
    }

    // Verify room creation time (cannot be older than 2 minutes for open waiting rooms)
    let createdTime = now;
    if (typeof roomData.createdAt === 'number') {
      createdTime = roomData.createdAt;
    } else if ((roomData.createdAt as any)?.toMillis) {
      createdTime = (roomData.createdAt as any).toMillis();
    } else if ((roomData.createdAt as any)?.seconds) {
      createdTime = (roomData.createdAt as any).seconds * 1000;
    }

    if (now - createdTime > MAX_OPEN_ROOM_AGE_MS) {
      // Room is expired (> 2 minutes) - mark as abandoned & reject
      cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
      return { isValid: false, errorMessage: UNAVAILABLE_MSG };
    }

    // Verify creator / host presence and activity in RTDB
    const hostUid = roomData.player1?.uid || roomData.hostUid;
    if (hostUid) {
      try {
        const presenceSnap = await rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}/presence/${hostUid}`));
        if (presenceSnap.exists()) {
          const presence = presenceSnap.val();
          if (presence.isConnected === false) {
            // Creator has explicitly disconnected!
            cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
            return { isValid: false, errorMessage: UNAVAILABLE_MSG };
          }
          if (typeof presence.lastActive === 'number') {
            const inactiveDuration = now - presence.lastActive;
            if (inactiveDuration > MAX_INACTIVITY_MS) {
              // Creator heartbeat is stale (> 25s inactive)
              cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
              return { isValid: false, errorMessage: UNAVAILABLE_MSG };
            }
          }
        }
      } catch (e) {
        console.warn('[duelService] Verificação de presença do host falhou:', e);
      }
    }

    return {
      isValid: true,
      room: roomData,
      docId: roomDocId || cleanCode,
    };
  } catch (error) {
    console.error('[duelService] Erro ao validar sala:', error);
    return { isValid: false, errorMessage: UNAVAILABLE_MSG };
  }
}

/**
 * Cleans up ghost, expired, or abandoned rooms in Firestore and RTDB
 */
export async function cleanupGhostRoom(roomId: string) {
  if (!roomId) return;
  try {
    // 1. RTDB immediate removal
    rtdbRemove(rtdbRef(rtdb, `duels/${roomId}`)).catch(() => {});

    // 2. Firestore immediate deletion
    const roomDoc = doc(db, 'duels', roomId);
    deleteDoc(roomDoc).catch(() => {});
  } catch (e) {
    console.warn('[duelService] Erro ao limpar sala fantasma:', e);
  }
}

/**
 * Filters open rooms for lobby display:
 * 1. Must be in 'waiting' status
 * 2. Must not be older than 2 minutes (MAX_OPEN_ROOM_AGE_MS)
 * 3. Creator must not be marked disconnected
 */
export function filterValidLobbyRooms(rooms: DuelRoom[]): DuelRoom[] {
  const now = Date.now();
  const cutoffTime = now - MAX_OPEN_ROOM_AGE_MS; // strictly 2 minutes ago

  return (rooms || []).filter((room) => {
    if (!room || room.status !== 'waiting') return false;
    if (room.player2) return false;

    // Check creation timestamp
    let createdTime = 0;
    if (typeof room.createdAt === 'number') {
      createdTime = room.createdAt;
    } else if ((room.createdAt as any)?.toMillis) {
      createdTime = (room.createdAt as any).toMillis();
    } else if ((room.createdAt as any)?.seconds) {
      createdTime = (room.createdAt as any).seconds * 1000;
    } else {
      createdTime = now;
    }

    if (createdTime < cutoffTime) {
      return false;
    }

    // Check creator connection flag if present
    if (room.player1 && room.player1.isConnected === false) {
      return false;
    }

    return true;
  });
}

/**
 * Joins an existing duel room:
 * 1. Validates the room existence and host online availability.
 * 2. Prepares player2 data.
 * 3. Updates the room node in Firestore and RTDB with status: "matched" and adds 2nd player data.
 * 4. Configures RTDB onDisconnect for player2.
 */
export async function joinRoom(
  roomIdOrCode: string,
  playerProfile: any
): Promise<{
  success: boolean;
  room?: DuelRoom;
  docId?: string;
  errorMessage?: string;
}> {
  try {
    const userUid = playerProfile?.uid || playerProfile?.id || 'anon';
    const validation = await validateRoomAndHostAvailability(roomIdOrCode, userUid);

    if (!validation.isValid || !validation.room) {
      return {
        success: false,
        errorMessage: validation.errorMessage || 'Esta sala já não está disponível.',
      };
    }

    const roomData = validation.room;
    const roomDocId = validation.docId || roomIdOrCode;

    // Check if user is returning host or returning player2
    if (roomData.player1?.uid === userUid || roomData.hostUid === userUid || roomData.player2?.uid === userUid) {
      return {
        success: true,
        room: roomData,
        docId: roomDocId,
      };
    }

    // Build safe player2 data
    const player2Data: DuelPlayer = {
      uid: userUid,
      displayName: playerProfile?.displayName || playerProfile?.name || 'Candidato',
      branch: playerProfile?.branch || 'PNA',
      avatarId: playerProfile?.avatarId || 'policia',
      province: playerProfile?.province || 'Luanda',
      photoURL: playerProfile?.photoURL || playerProfile?.avatar || '',
      isVipSupporter: !!playerProfile?.isVipSupporter,
      equippedFrame: playerProfile?.equippedFrame || playerProfile?.avatarAccessories?.frame,
      equippedBackground: playerProfile?.equippedBackground || playerProfile?.avatarAccessories?.background,
      equippedUniform: playerProfile?.equippedUniform,
      avatarAccessories: playerProfile?.avatarAccessories,
      score: 0,
      currentQuestionIndex: 0,
      answers: {},
      isReady: true,
      isConnected: true,
      lastActive: Date.now(),
    };

    const updatedRoom: DuelRoom = {
      ...roomData,
      player2: player2Data,
      status: 'matched',
      questionStartTime: Date.now(),
    };

    const targetId = roomDocId || updatedRoom.id || roomIdOrCode;

    // 1. Update Firestore with status: "matched" and player2
    const roomRef = doc(db, 'duels', targetId);
    await setDoc(roomRef, {
      player2: player2Data,
      status: 'matched',
      questionStartTime: Date.now(),
    }, { merge: true });

    // 2. Update Realtime Database
    try {
      await rtdbUpdate(rtdbRef(rtdb, `duels/${targetId}`), {
        player2: player2Data,
        status: 'matched',
        questionStartTime: Date.now(),
      });
    } catch (rtdbErr) {
      console.warn('[duelService] Erro ao atualizar RTDB ao entrar na sala:', rtdbErr);
    }

    // 3. Setup onDisconnect for player2
    setupRoomOnDisconnect({
      roomId: targetId,
      userUid: userUid,
      isHost: false,
      status: 'active',
      opponentUid: roomData.player1?.uid,
    });

    return {
      success: true,
      room: updatedRoom,
      docId: targetId,
    };
  } catch (error: any) {
    console.error('[duelService] Erro ao executar joinRoom:', error);
    return {
      success: false,
      errorMessage: error?.message || 'Falha ao conectar à sala de duelo.',
    };
  }
}
