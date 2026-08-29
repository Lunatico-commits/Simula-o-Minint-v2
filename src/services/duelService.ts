import { 
  ref as rtdbRef, 
  set as rtdbSet, 
  update as rtdbUpdate, 
  get as rtdbGet, 
  remove as rtdbRemove,
  onValue as rtdbOnValue,
  onDisconnect as rtdbOnDisconnect
} from 'firebase/database';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, rtdb } from '../lib/firebase';
import { DuelRoom, DuelPlayer } from '../types';

/** Maximum room age in milliseconds for open lobby rooms (2 minutes) */
export const MAX_OPEN_ROOM_AGE_MS = 2 * 60 * 1000;

/** Maximum inactivity threshold in milliseconds before considering a player/host offline (25 seconds) */
export const MAX_INACTIVITY_MS = 25 * 1000;

/**
 * Padroniza o código de sala limpando espaços e convertendo para MAIÚSCULAS
 */
export function cleanRoomCode(code?: string | null): string {
  if (!code) return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/^(INVITE_|SALA:|CODE:|DUEL:)/i, '')
    .replace(/\s+/g, '');
}

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
  status: 'waiting' | 'active' | 'matched' | 'finished';
  opponentUid?: string;
}) {
  if (!roomId || !userUid) return;

  const cleanCode = cleanRoomCode(roomId);
  if (!cleanCode) return;

  try {
    const playerKey = isHost ? 'player1' : 'player2';

    // 1. Presence node onDisconnect
    const userPresenceRef = rtdbRef(rtdb, `duels/${cleanCode}/presence/${userUid}`);
    const presenceDisconnect = rtdbOnDisconnect(userPresenceRef);
    presenceDisconnect.set({
      isConnected: false,
      lastActive: Date.now(),
      disconnectedAt: Date.now(),
    });

    // 2. Player isConnected node onDisconnect
    const playerConnectedRef = rtdbRef(rtdb, `duels/${cleanCode}/${playerKey}/isConnected`);
    const playerConnDisconnect = rtdbOnDisconnect(playerConnectedRef);
    playerConnDisconnect.set(false);

    const playerLastActiveRef = rtdbRef(rtdb, `duels/${cleanCode}/${playerKey}/lastActive`);
    const playerLastActiveDisconnect = rtdbOnDisconnect(playerLastActiveRef);
    playerLastActiveDisconnect.set(Date.now());

    // 3. Room status onDisconnect:
    // When the room is waiting for an opponent, if the creator/host loses connection, closes the tab,
    // or exits the app, the entire room node is immediately deleted from RTDB via onDisconnect().remove()
    const roomRef = rtdbRef(rtdb, `duels/${cleanCode}`);
    if (status === 'waiting' && isHost) {
      rtdbOnDisconnect(roomRef).remove().catch((err) => {
        console.error('[duelService] Erro ao registrar onDisconnect.remove() no RTDB:', err);
      });
    } else if (status === 'active' || status === 'matched') {
      // In active duels, cancel automatic room deletion so mobile jitter doesn't drop the active match
      rtdbOnDisconnect(roomRef).cancel().catch(() => {});
    }
  } catch (error) {
    console.error('[duelService] Erro ao registrar onDisconnect no RTDB:', error);
  }
}

/**
 * Cancel or clear RTDB onDisconnect handlers when transitioning state
 */
export async function clearRoomOnDisconnect(roomId: string, userUid?: string) {
  if (!roomId) return;
  const cleanCode = cleanRoomCode(roomId);
  try {
    if (userUid) {
      const userPresenceRef = rtdbRef(rtdb, `duels/${cleanCode}/presence/${userUid}`);
      await rtdbOnDisconnect(userPresenceRef).cancel();
    }
    const roomRef = rtdbRef(rtdb, `duels/${cleanCode}`);
    await rtdbOnDisconnect(roomRef).cancel();
  } catch (e) {
    console.error('[duelService] Erro ao limpar onDisconnect:', e);
  }
}

/**
 * Grava uma sala de duelo diretamente no Realtime Database usando a chave limpa 'duels/${cleanCode}'
 */
export async function saveRoomToRTDB(code: string, roomData: DuelRoom): Promise<void> {
  const cleanCode = cleanRoomCode(code || roomData.roomCode || roomData.code || roomData.id);
  if (!cleanCode) {
    throw new Error('Código de sala inválido para gravação no Realtime Database');
  }

  try {
    await rtdbSet(rtdbRef(rtdb, `duels/${cleanCode}`), {
      ...roomData,
      id: cleanCode,
      code: cleanCode,
      roomCode: cleanCode,
    });
  } catch (error) {
    console.error(`[duelService] Erro ao gravar sala no RTDB duels/${cleanCode}:`, error);
    throw error;
  }
}

/**
 * Valida a existência e disponibilidade da sala e do anfitrião
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
  if (!roomIdOrCode || !roomIdOrCode.trim()) {
    return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
  }

  const cleanCode = cleanRoomCode(roomIdOrCode);
  const now = Date.now();

  try {
    let roomData: DuelRoom | null = null;
    let roomDocId: string | null = null;

    // 1. Busca direta no RTDB pelo nó 'duels/${cleanCode}'
    try {
      const rtdbSnapshot = await rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}`));
      if (rtdbSnapshot.exists()) {
        roomData = rtdbSnapshot.val() as DuelRoom;
        roomDocId = cleanCode;
      }
    } catch (e) {
      console.error(`[duelService] Erro ao buscar duels/${cleanCode} no RTDB:`, e);
    }

    // 2. Fallback de busca no Firestore se não encontrado no RTDB
    if (!roomData) {
      try {
        const firestoreSnap = await getDoc(doc(db, 'duels', cleanCode));
        if (firestoreSnap.exists()) {
          roomData = firestoreSnap.data() as DuelRoom;
          roomDocId = firestoreSnap.id;
        } else {
          const q = query(
            collection(db, 'duels'),
            where('roomCode', '==', cleanCode),
            limit(1)
          );
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const firstDoc = qSnap.docs[0];
            roomData = firstDoc.data() as DuelRoom;
            roomDocId = firstDoc.id;
          }
        }
      } catch (e) {
        console.error('[duelService] Erro ao buscar sala no Firestore:', e);
      }
    }

    // Se o nó não existir
    if (!roomData) {
      return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
    }

    // Se o utilizador é o próprio host ou o convidado que já estava na sala reconectando
    const isHost = roomData.player1?.uid === joiningUserUid || roomData.hostUid === joiningUserUid;
    const isReturningPlayer2 = roomData.player2?.uid === joiningUserUid;

    if (isHost || isReturningPlayer2) {
      return { isValid: true, room: roomData, docId: roomDocId || cleanCode };
    }

    // Se a sala já está em andamento, cheia ou terminada
    const status = (roomData.status as string) || '';
    if (
      status === 'matched' ||
      status === 'active' ||
      status === 'in_progress' ||
      status === 'playing' ||
      status === 'full' ||
      (roomData.player2 && roomData.player2.uid && roomData.player2.uid !== joiningUserUid)
    ) {
      return { isValid: false, errorMessage: 'Esta sala já está em andamento.' };
    }

    if (
      status === 'abandoned' ||
      status === 'cancelled' ||
      status === 'closed' ||
      status === 'finished'
    ) {
      return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
    }

    // Verifica tempo de criação (máximo 2 minutos para salas em espera)
    let createdTime = now;
    if (typeof roomData.createdAt === 'number') {
      createdTime = roomData.createdAt;
    } else if ((roomData.createdAt as any)?.toMillis) {
      createdTime = (roomData.createdAt as any).toMillis();
    } else if ((roomData.createdAt as any)?.seconds) {
      createdTime = (roomData.createdAt as any).seconds * 1000;
    }

    if (now - createdTime > MAX_OPEN_ROOM_AGE_MS) {
      cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
      return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
    }

    // Verifica presença do anfitrião no RTDB
    const hostUid = roomData.player1?.uid || roomData.hostUid;
    if (hostUid) {
      try {
        const presenceSnap = await rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}/presence/${hostUid}`));
        if (presenceSnap.exists()) {
          const presence = presenceSnap.val();
          if (presence.isConnected === false) {
            cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
            return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
          }
          if (typeof presence.lastActive === 'number') {
            const inactiveDuration = now - presence.lastActive;
            if (inactiveDuration > MAX_INACTIVITY_MS) {
              cleanupGhostRoom(roomDocId || cleanCode).catch(() => {});
              return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
            }
          }
        }
      } catch (e) {
        console.error('[duelService] Erro ao verificar presença do host:', e);
      }
    }

    return {
      isValid: true,
      room: roomData,
      docId: roomDocId || cleanCode,
    };
  } catch (error) {
    console.error('[duelService] Erro ao validar sala:', error);
    return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
  }
}

/**
 * Remove sala fantasma / abandonada
 */
export async function cleanupGhostRoom(roomId: string) {
  if (!roomId) return;
  const cleanCode = cleanRoomCode(roomId);
  try {
    rtdbRemove(rtdbRef(rtdb, `duels/${cleanCode}`)).catch(() => {});
    const roomDoc = doc(db, 'duels', cleanCode);
    deleteDoc(roomDoc).catch(() => {});
  } catch (e) {
    console.error('[duelService] Erro ao limpar sala fantasma:', e);
  }
}

/**
 * Filtra salas abertas para a listagem do lobby
 */
export function filterValidLobbyRooms(rooms: DuelRoom[]): DuelRoom[] {
  const now = Date.now();
  const cutoffTime = now - MAX_OPEN_ROOM_AGE_MS;

  return (rooms || []).filter((room) => {
    if (!room || room.status !== 'waiting') return false;
    if (room.player2) return false;

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

    if (room.player1 && room.player1.isConnected === false) {
      return false;
    }

    return true;
  });
}

/**
 * 2. Função joinRoom Robusta:
 * - Busca diretamente o nó ref(rtdb, `duels/${cleanCode}`).
 * - Verifica se snapshot.exists():
 *   * Se NÃO existir: retorna/informa "Sala não encontrada ou código incorreto.".
 *   * Se existir e o status for "waiting": atualiza o nó com status: "matched" e adiciona os dados do guest/player2 (uid, name, photoURL, etc.).
 *   * Se a sala já estiver cheia ou em jogo: informa "Esta sala já está em andamento.".
 */
export async function joinRoom(
  roomIdOrCode: string,
  playerProfile: any,
  timeoutMs: number = 6000
): Promise<{
  success: boolean;
  room?: DuelRoom;
  docId?: string;
  errorMessage?: string;
}> {
  const cleanCode = cleanRoomCode(roomIdOrCode);
  if (!cleanCode) {
    return {
      success: false,
      errorMessage: 'Sala não encontrada ou código incorreto.',
    };
  }

  const timeoutPromise = new Promise<{
    success: false;
    errorMessage: string;
  }>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Tempo limite esgotado ao tentar conectar à sala.'));
    }, timeoutMs);
  });

  const joinAction = async (): Promise<{
    success: boolean;
    room?: DuelRoom;
    docId?: string;
    errorMessage?: string;
  }> => {
    try {
      const userUid = playerProfile?.uid || playerProfile?.id || 'anon';
      const guestName = (playerProfile?.displayName || playerProfile?.name || playerProfile?.nome || 'Candidato MININT').toString().trim();
      const guestPhoto = playerProfile?.photoURL || playerProfile?.avatar || '';

      // 1. Busca direta no Realtime Database no nó 'duels/${cleanCode}'
      let rtdbSnapshot;
      try {
        rtdbSnapshot = await rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}`));
      } catch (rtdbReadError) {
        console.error(`[duelService] Erro ao ler duels/${cleanCode} no RTDB:`, rtdbReadError);
      }

      let roomData: DuelRoom | null = null;
      if (rtdbSnapshot && rtdbSnapshot.exists()) {
        roomData = rtdbSnapshot.val() as DuelRoom;
      } else {
        // Fallback: verificar se existe no Firestore
        try {
          const fsDoc = await getDoc(doc(db, 'duels', cleanCode));
          if (fsDoc.exists()) {
            roomData = fsDoc.data() as DuelRoom;
          }
        } catch (fsError) {
          console.error('[duelService] Erro ao ler Firestore na busca de sala:', fsError);
        }
      }

      // Se o nó NÃO existir:
      if (!roomData) {
        return {
          success: false,
          errorMessage: 'Sala não encontrada ou código incorreto.',
        };
      }

      // Se o usuário é o próprio anfitrião ou o convidado já cadastrado reconectando
      const isHost = roomData.player1?.uid === userUid || roomData.hostUid === userUid;
      const isReturningGuest = roomData.player2?.uid === userUid || (roomData as any)?.guest?.uid === userUid;

      if (isHost || isReturningGuest) {
        return {
          success: true,
          room: roomData,
          docId: cleanCode,
        };
      }

      // Se a sala já estiver cheia ou em andamento
      if (
        roomData.status !== 'waiting' ||
        (roomData.player2 && roomData.player2.uid && roomData.player2.uid !== userUid)
      ) {
        return {
          success: false,
          errorMessage: 'Esta sala já está em andamento.',
        };
      }

      // Estruturação dos dados do Convidado / Player 2
      const guestData: DuelPlayer = {
        uid: userUid,
        name: guestName,
        displayName: guestName,
        photoURL: guestPhoto,
        branch: playerProfile?.branch || 'PNA',
        avatarId: playerProfile?.avatarId || 'policia',
        province: playerProfile?.province || 'Luanda',
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

      const matchedPayload = {
        guest: {
          uid: userUid,
          name: guestName,
          photoURL: guestPhoto,
        },
        player2: guestData,
        status: 'matched' as const,
        questionStartTime: Date.now(),
      };

      const updatedRoom: DuelRoom = {
        ...roomData,
        ...matchedPayload,
      };

      // Atualiza o nó duels/${cleanCode} no Realtime Database com status: "matched"
      try {
        await rtdbUpdate(rtdbRef(rtdb, `duels/${cleanCode}`), matchedPayload);
      } catch (rtdbUpdateError) {
        console.error(`[duelService] Erro ao atualizar nó duels/${cleanCode} no RTDB:`, rtdbUpdateError);
        throw rtdbUpdateError;
      }

      // Atualiza também o documento no Firestore para sincronização
      try {
        const roomRef = doc(db, 'duels', cleanCode);
        await setDoc(roomRef, {
          guest: {
            uid: userUid,
            name: guestName,
            photoURL: guestPhoto,
          },
          player2: guestData,
          status: 'matched',
          questionStartTime: Date.now(),
        }, { merge: true });
      } catch (fsErr) {
        console.error('[duelService] Aviso ao sincronizar Firestore ao entrar na sala:', fsErr);
      }

      // Configura presença onDisconnect para o convidado
      setupRoomOnDisconnect({
        roomId: cleanCode,
        userUid: userUid,
        isHost: false,
        status: 'matched',
        opponentUid: roomData.player1?.uid || roomData.hostUid,
      });

      return {
        success: true,
        room: updatedRoom,
        docId: cleanCode,
      };
    } catch (innerErr: any) {
      console.error('[duelService] Erro interno em joinAction:', innerErr);
      return {
        success: false,
        errorMessage: innerErr?.message || 'Sala não encontrada ou código incorreto.',
      };
    }
  };

  try {
    const result = await Promise.race([joinAction(), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error('[duelService] Erro/Timeout em joinRoom:', error);
    return {
      success: false,
      errorMessage: error?.message || 'Sala não encontrada ou código incorreto.',
    };
  }
}

/**
 * 3. Escutador em Tempo Real e Redirecionamento Automático:
 * - Escuta as mudanças no nó 'duels/${cleanCode}'.
 * - Notifica instantaneamente qualquer atualização para que Host e Convidado sejam redirecionados.
 * - Trata erros de conexão via try/catch detalhados e console.error.
 */
export function listenToRoom(
  roomIdOrCode: string,
  onUpdate: (room: DuelRoom | null) => void,
  onError?: (error: any) => void
): () => void {
  const cleanCode = cleanRoomCode(roomIdOrCode);
  if (!cleanCode) {
    console.error('[duelService] Código de sala inválido para escutador');
    onUpdate(null);
    return () => {};
  }

  let unsubscribed = false;
  let unsubscribeRtdb: (() => void) | null = null;
  let unsubscribeFirestore: (() => void) | null = null;

  // 1. Escuta em tempo real no Realtime Database: duels/${cleanCode}
  try {
    const targetRtdbRef = rtdbRef(rtdb, `duels/${cleanCode}`);
    unsubscribeRtdb = rtdbOnValue(
      targetRtdbRef,
      (snapshot) => {
        if (unsubscribed) return;
        try {
          if (!snapshot.exists()) {
            onUpdate(null);
            return;
          }
          const data = snapshot.val() as DuelRoom;
          onUpdate(data);
        } catch (parseError) {
          console.error('[duelService] Erro ao processar snapshot RTDB:', parseError);
        }
      },
      (rtdbError) => {
        console.error(`[duelService] Erro no listener RTDB duels/${cleanCode}:`, rtdbError);
        if (onError) onError(rtdbError);
      }
    );
  } catch (e) {
    console.error('[duelService] Falha ao configurar listener RTDB da sala:', e);
    if (onError) onError(e);
  }

  // 2. Escuta auxiliar no Firestore para redundância
  try {
    const docRef = doc(db, 'duels', cleanCode);
    unsubscribeFirestore = onSnapshot(
      docRef,
      (docSnap) => {
        if (unsubscribed) return;
        try {
          if (docSnap.exists()) {
            const data = docSnap.data() as DuelRoom;
            onUpdate(data);
          }
        } catch (fsParseErr) {
          console.error('[duelService] Erro ao processar snapshot Firestore:', fsParseErr);
        }
      },
      (fsError) => {
        console.error(`[duelService] Erro no listener Firestore duels/${cleanCode}:`, fsError);
      }
    );
  } catch (fsInitErr) {
    console.error('[duelService] Falha ao configurar listener Firestore da sala:', fsInitErr);
  }

  return () => {
    unsubscribed = true;
    if (typeof unsubscribeRtdb === 'function') {
      try {
        unsubscribeRtdb();
      } catch (err) {
        console.error('[duelService] Erro ao desinscrever RTDB listener:', err);
      }
    }
    if (typeof unsubscribeFirestore === 'function') {
      try {
        unsubscribeFirestore();
      } catch (err) {
        console.error('[duelService] Erro ao desinscrever Firestore listener:', err);
      }
    }
  };
}
