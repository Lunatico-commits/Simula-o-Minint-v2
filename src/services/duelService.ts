import { 
  ref as rtdbRef, 
  set as rtdbSet, 
  update as rtdbUpdate, 
  get as rtdbGet, 
  remove as rtdbRemove,
  onValue as rtdbOnValue,
  off as rtdbOff,
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
import { db, rtdb, auth } from '../lib/firebase';
import { DuelRoom, DuelPlayer } from '../types';
import { getRandomQuestions } from '../utils/questionSelector';

/** Maximum room age in milliseconds for open lobby rooms (2 minutes) */
export const MAX_OPEN_ROOM_AGE_MS = 2 * 60 * 1000;

/** Maximum inactivity threshold in milliseconds before considering a player/host offline (25 seconds) */
export const MAX_INACTIVITY_MS = 25 * 1000;

/**
 * Normaliza e valida a estrutura de uma sala de duelo, garantindo que
 * o array de perguntas ('questions') esteja sempre presente e pré-carregado.
 */
export function normalizeRoomData(raw: any): DuelRoom | null {
  if (!raw || typeof raw !== 'object') return null;
  const room = { ...raw };

  // 1. Normalizar questions (caso o Firebase RTDB tenha armazenado como objeto {0: {...}, 1: {...}})
  if (room.questions) {
    if (Array.isArray(room.questions)) {
      room.questions = room.questions.filter(Boolean);
    } else if (typeof room.questions === 'object') {
      room.questions = Object.values(room.questions).filter(Boolean);
    }
  }

  // 2. Garantir que a lista de perguntas venha pré-carregada e nunca vazia
  if (!room.questions || !Array.isArray(room.questions) || room.questions.length === 0) {
    room.questions = getRandomQuestions({
      category: (room.category as any) || 'misto',
      count: 5,
      modeKey: 'duel',
    });
  }

  // 3. Normalizar código e IDs
  const cleanCode = cleanRoomCode(room.id || room.code || room.roomCode);
  if (cleanCode) {
    room.id = cleanCode;
    room.code = cleanCode;
    room.roomCode = cleanCode;
  }

  return room as DuelRoom;
}

/**
 * Recursively strips any `undefined` values from payloads before writing to Firebase Realtime Database.
 * Realtime Database rejects payloads with `undefined` values (e.g. `equippedUniform: undefined`).
 */
export function sanitizeForRTDB<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForRTDB(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForRTDB(value);
    }
  }
  return clean as T;
}

/**
 * 1. Padronização Obrigatória do Código da Sala (Helper Universal):
 * Função utilitária única para tratar códigos:
 * const formatCode = (code: string) => code.trim().toUpperCase();
 * NUNCA remove o hífen "MNT-" nem altera a string original gerada.
 * O código gerado (ex: "MNT-LLLW") DEVE ser a chave exata no Realtime Database.
 */
export const formatCode = (code?: string | null): string => {
  if (!code) return '';
  const trimmed = code.toString().trim().toUpperCase().replace(/\s+/g, '');
  if (!trimmed.startsWith('MNT-') && trimmed.startsWith('MNT')) {
    return `MNT-${trimmed.slice(3)}`;
  }
  // Se o usuário digitou apenas os 4 caracteres finais sem o prefixo (ex: "LLLW")
  if (!trimmed.startsWith('MNT-') && trimmed.length === 4) {
    return `MNT-${trimmed}`;
  }
  return trimmed;
};

export const cleanRoomCode = formatCode;

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
 * Grava uma sala de duelo no Realtime Database usando a chave limpa 'duels/${cleanCode}'
 * com timeout de conexão.
 */
export async function saveRoomToRTDB(code: string, roomData: DuelRoom): Promise<void> {
  const cleanCode = cleanRoomCode(code || roomData.roomCode || roomData.code || roomData.id);
  if (!cleanCode) {
    throw new Error('Código de sala inválido para gravação');
  }

  const sanitizedPayload = sanitizeForRTDB({
    ...roomData,
    id: cleanCode,
    code: cleanCode,
    roomCode: cleanCode,
  });

  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Timeout de conexão com RTDB.'));
    }, 4500);
  });

  try {
    const writePromise = rtdbSet(rtdbRef(rtdb, `duels/${cleanCode}`), sanitizedPayload);
    await Promise.race([writePromise, timeoutPromise]);
  } catch (error: any) {
    console.warn(`[duelService] Aviso ao gravar sala no RTDB duels/${cleanCode}:`, error?.message || error);
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export interface CreateRoomResult {
  success: boolean;
  room?: DuelRoom;
  errorMessage?: string;
}

/**
 * 2. Escrita Uniforme no 'createRoom' ('duelService.ts'):
 * Ao criar a sala, grava os dados EXATAMENTE no nó:
 * ref(rtdb, `duels/${formatCode(roomCode)}`)
 * Garante que o nó contenha:
 * {
 *   code: formatCode(roomCode),
 *   hostUid: currentUser.uid,
 *   hostName: currentUser.displayName,
 *   status: "waiting",
 *   questions: [...],
 *   createdAt: Date.now()
 * }
 */
export async function createRoom({
  roomCode,
  roomData,
  profile,
}: {
  roomCode: string;
  roomData: DuelRoom;
  profile?: any;
}): Promise<CreateRoomResult> {
  const cleanCode = formatCode(roomCode || roomData.roomCode || roomData.code || roomData.id);
  if (!cleanCode) {
    return {
      success: false,
      errorMessage: 'Código de sala inválido.',
    };
  }

  const currentUser = auth.currentUser;
  const hostUid = currentUser?.uid || profile?.uid || roomData.hostUid || roomData.hostId || 'anon';
  const hostName = (currentUser?.displayName || profile?.displayName || profile?.name || roomData.hostName || 'Anfitrião').toString().trim();

  const questions = (roomData.questions && Array.isArray(roomData.questions) && roomData.questions.length > 0)
    ? roomData.questions
    : getRandomQuestions({ category: (roomData.category as any) || 'misto', count: 5, modeKey: 'duel' });

  const now = Date.now();

  const roomToSave: DuelRoom = {
    ...roomData,
    id: cleanCode,
    code: cleanCode,
    roomCode: cleanCode,
    hostId: hostUid,
    hostUid: hostUid,
    hostName: hostName,
    status: 'waiting',
    questions,
    currentQuestionIndex: 0,
    questionStartTime: null,
    timePerQuestion: roomData.timePerQuestion || (roomData.mode === 'relampago' ? 30 : 20),
    player1: roomData.player1 || {
      uid: hostUid,
      name: hostName,
      displayName: hostName,
      branch: profile?.branch || 'PNA',
      avatarId: profile?.avatarId || 'policia',
      province: profile?.province || 'Luanda',
      score: 0,
      currentQuestionIndex: 0,
      answers: {},
      isReady: true,
      isConnected: true,
      lastActive: now,
    },
    player2: undefined,
    createdAt: now,
  };

  // Garante os campos obrigatórios gravados exatamente no nó RTDB
  const rtdbPayload = sanitizeForRTDB({
    ...roomToSave,
    code: cleanCode,
    hostUid,
    hostName,
    status: 'waiting' as const,
    questions,
    createdAt: now,
  });

  try {
    // Gravação EXATA no nó ref(rtdb, `duels/${formatCode(roomCode)}`)
    const targetRoomRef = rtdbRef(rtdb, `duels/${cleanCode}`);
    await rtdbSet(targetRoomRef, rtdbPayload);

    // Configura desconexão automática do anfitrião
    setupRoomOnDisconnect({
      roomId: cleanCode,
      userUid: hostUid,
      isHost: true,
      status: 'waiting',
    });

    // Gravação no Firestore em segundo plano para persistência
    try {
      const roomDocRef = doc(db, 'duels', cleanCode);
      setDoc(roomDocRef, {
        ...roomToSave,
        createdAt: now,
        player2: null,
      }, { merge: true }).catch(() => {});
    } catch (fsErr) {
      console.warn('[duelService] Aviso ao persistir sala no Firestore:', fsErr);
    }

    return {
      success: true,
      room: roomToSave,
    };
  } catch (error: any) {
    console.error('[duelService] Falha na criação da sala:', error);
    return {
      success: false,
      errorMessage: error?.message || 'Falha ao criar sala. Verifique a conexão.',
    };
  }
}

/**
 * Busca de forma ultrarrápida e não bloqueante a sala tanto no RTDB quanto no Firestore
 */
export async function fetchRoomFast(cleanCode: string): Promise<DuelRoom | null> {
  if (!cleanCode) return null;

  // 1. RTDB fetch com timeout de 3.5 segundos
  const rtdbTask = new Promise<DuelRoom | null>((resolve) => {
    try {
      const timer = setTimeout(() => resolve(null), 3500);
      rtdbGet(rtdbRef(rtdb, `duels/${cleanCode}`))
        .then((snap) => {
          clearTimeout(timer);
          if (snap && snap.exists()) {
            resolve(snap.val() as DuelRoom);
          } else {
            resolve(null);
          }
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(null);
        });
    } catch {
      resolve(null);
    }
  });

  // 2. Firestore direct doc fetch com timeout de 3.5 segundos
  const firestoreDocTask = new Promise<DuelRoom | null>((resolve) => {
    try {
      const timer = setTimeout(() => resolve(null), 3500);
      getDoc(doc(db, 'duels', cleanCode))
        .then((snap) => {
          clearTimeout(timer);
          if (snap && snap.exists()) {
            resolve(snap.data() as DuelRoom);
          } else {
            resolve(null);
          }
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(null);
        });
    } catch {
      resolve(null);
    }
  });

  // Retorna assim que QUALQUER uma das fontes responder com dados válidos
  const quickResult = await Promise.race([
    rtdbTask.then((r) => (r ? r : new Promise<never>(() => {}))),
    firestoreDocTask.then((r) => (r ? r : new Promise<never>(() => {}))),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3800)),
  ]);

  if (quickResult) {
    return normalizeRoomData(quickResult);
  }

  // Fallback: se nenhum doc direto com id cleanCode retornou, tenta buscar por query do roomCode no Firestore
  try {
    const q = query(
      collection(db, 'duels'),
      where('roomCode', '==', cleanCode),
      limit(1)
    );
    const qSnap = await Promise.race([
      getDocs(q),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (qSnap && !qSnap.empty) {
      return normalizeRoomData(qSnap.docs[0].data() as DuelRoom);
    }
  } catch (err) {
    console.warn('[duelService] Erro na query de fallback Firestore:', err);
  }

  return null;
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
    const roomData = await fetchRoomFast(cleanCode);

    // Se o nó não existir
    if (!roomData) {
      return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
    }

    const roomDocId = cleanCode;

    // Se o utilizador é o próprio host ou o convidado que já estava na sala reconectando
    const isHost = roomData.player1?.uid === joiningUserUid || roomData.hostUid === joiningUserUid;
    const isReturningPlayer2 = roomData.player2?.uid === joiningUserUid;

    if (isHost || isReturningPlayer2) {
      return { isValid: true, room: roomData, docId: roomDocId };
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
      cleanupGhostRoom(roomDocId).catch(() => {});
      return { isValid: false, errorMessage: 'Sala não encontrada ou código incorreto.' };
    }

    return {
      isValid: true,
      room: roomData,
      docId: roomDocId,
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
 * Filtra salas abertas para a listagem do lobby.
 * Exibe apenas salas com status === 'waiting', sem player2 e exclui salas criadas pelo próprio usuário.
 */
export function filterValidLobbyRooms(rooms: DuelRoom[], currentUserId?: string | null): DuelRoom[] {
  const now = Date.now();
  const cutoffTime = now - MAX_OPEN_ROOM_AGE_MS;

  return (rooms || []).filter((room) => {
    if (!room || room.status !== 'waiting') return false;
    if (room.player2) return false;

    // Filtra para NÃO exibir salas criadas pelo próprio usuário
    if (currentUserId) {
      if (
        room.hostUid === currentUserId ||
        room.player1?.uid === currentUserId ||
        room.hostId === currentUserId
      ) {
        return false;
      }
    }

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
 * 3. Leitura Uniforme no 'joinRoom' ('duelService.ts'):
 * Ao procurar a sala com o código digitado pelo Convidado (ex: "MNT-LLLW"):
 * 1. Obtenha o código formatado: 'const cleanCode = formatCode(inputCode)'.
 * 2. Verifique o nó exato: 'get(ref(rtdb, `duels/${cleanCode}`))'.
 * 3. Se 'snapshot.exists()' for verdadeiro e 'status === "waiting"', atualize o nó com 'status: "matched"' e os dados do 'guest'.
 * 4. Se não existir, retorne o erro apropriado: "Sala não encontrada. Verifique o código inserido."
 */
export async function joinRoom(
  roomIdOrCode: string,
  playerProfile: any,
  timeoutMs: number = 18000
): Promise<{
  success: boolean;
  cleanCode?: string;
  room?: DuelRoom;
  docId?: string;
  errorMessage?: string;
}> {
  // 1. Obtenha o código formatado: const cleanCode = formatCode(inputCode)
  const cleanCode = formatCode(roomIdOrCode);
  if (!cleanCode) {
    return {
      success: false,
      errorMessage: 'Sala não encontrada. Verifique o código inserido.',
    };
  }

  // Timeout razoável de 15-20s gerido sem mensagens artificiais de erro
  const timeoutPromise = new Promise<{
    success: boolean;
    errorMessage: string;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        errorMessage: 'Sala não encontrada. Verifique o código inserido.',
      });
    }, timeoutMs);
  });

  const joinAction = async (): Promise<{
    success: boolean;
    cleanCode?: string;
    room?: DuelRoom;
    docId?: string;
    errorMessage?: string;
  }> => {
    try {
      const currentUser = auth.currentUser;
      const userUid = currentUser?.uid || playerProfile?.uid || playerProfile?.id || 'anon';
      const guestName = (currentUser?.displayName || playerProfile?.displayName || playerProfile?.name || playerProfile?.nome || 'Candidato MININT').toString().trim();
      const guestPhoto = playerProfile?.photoURL || playerProfile?.avatar || '';

      // 2. Verifique o nó exato: get(ref(rtdb, `duels/${cleanCode}`))
      const roomRef = rtdbRef(rtdb, `duels/${cleanCode}`);
      let snap = await rtdbGet(roomRef).catch((rtdbErr) => {
        console.warn(`[duelService] Aviso ao ler RTDB duels/${cleanCode}:`, rtdbErr);
        return null;
      });

      let roomData = snap && snap.exists() ? snap.val() : null;

      // Fallback de contingência caso o RTDB ainda esteja sincronizando com o Firestore
      if (!roomData) {
        try {
          const fsDoc = await getDoc(doc(db, 'duels', cleanCode));
          if (fsDoc.exists()) {
            roomData = fsDoc.data();
          }
        } catch (fsErr) {
          console.warn('[duelService] Fallback Firestore na busca de sala:', fsErr);
        }
      }

      // 4. Se não existir, retorne o erro apropriado: "Sala não encontrada. Verifique o código inserido."
      if (!roomData) {
        return {
          success: false,
          errorMessage: 'Sala não encontrada. Verifique o código inserido.',
        };
      }

      // Se o usuário é o próprio anfitrião ou o convidado já cadastrado reconectando
      const isHost = roomData.player1?.uid === userUid || roomData.hostUid === userUid;
      const isReturningGuest = roomData.player2?.uid === userUid || (roomData as any)?.guest?.uid === userUid;

      if (!isHost && !isReturningGuest) {
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
      }

      // Estruturação dos dados do Convidado (guestData)
      const guestPlayer: DuelPlayer = sanitizeForRTDB({
        uid: userUid,
        name: guestName,
        displayName: guestName,
        photoURL: guestPhoto || '',
        branch: playerProfile?.branch || 'PNA',
        avatarId: playerProfile?.avatarId || 'policia',
        province: playerProfile?.province || 'Luanda',
        isVipSupporter: !!playerProfile?.isVipSupporter,
        equippedFrame: playerProfile?.equippedFrame || playerProfile?.avatarAccessories?.frame || null,
        equippedBackground: playerProfile?.equippedBackground || playerProfile?.avatarAccessories?.background || null,
        equippedUniform: playerProfile?.equippedUniform || null,
        avatarAccessories: playerProfile?.avatarAccessories || null,
        score: 0,
        currentQuestionIndex: 0,
        answers: {},
        isReady: true,
        isConnected: true,
        lastActive: Date.now(),
      });

      const guestData = {
        uid: userUid,
        name: guestName,
        displayName: guestName,
        photoURL: guestPhoto,
        branch: playerProfile?.branch || 'PNA',
        avatarId: playerProfile?.avatarId || 'policia',
        province: playerProfile?.province || 'Luanda',
      };

      // 3. Se 'snapshot.exists()' for verdadeiro e 'status === "waiting"', atualize o nó com 'status: "matched"' e os dados do 'guest'.
      const matchedPayload = sanitizeForRTDB({
        status: 'matched' as const,
        guestUid: userUid,
        guestName: guestName,
        guest: guestData,
        player2: guestPlayer,
        questionStartTime: Date.now(),
      });

      const updatedRoom: DuelRoom = normalizeRoomData({
        ...roomData,
        ...matchedPayload,
        questions: (roomData?.questions && Array.isArray(roomData.questions) && roomData.questions.length > 0)
          ? roomData.questions
          : getRandomQuestions({ category: (roomData?.category as any) || 'misto', count: 5, modeKey: 'duel' }),
      })!;

      const rtdbPayload = sanitizeForRTDB({
        ...matchedPayload,
        questions: updatedRoom.questions,
      });

      // Atualiza imediatamente o nó duels/${cleanCode} no Realtime Database
      await rtdbUpdate(roomRef, rtdbPayload);

      // Sincronização em background no Firestore para persistência
      try {
        setDoc(doc(db, 'duels', cleanCode), {
          guest: guestData,
          player2: guestPlayer,
          status: 'matched',
          questionStartTime: Date.now(),
        }, { merge: true }).catch(() => {});
      } catch (fsErr) {
        console.warn('[duelService] Aviso ao sincronizar Firestore:', fsErr);
      }

      // Configura presença onDisconnect para o convidado
      setupRoomOnDisconnect({
        roomId: cleanCode,
        userUid: userUid,
        isHost: false,
        status: 'matched',
        opponentUid: roomData.player1?.uid || roomData.hostUid,
      });

      // Retorna cleanCode e dados para acionar a navegação reativa
      return {
        success: true,
        cleanCode,
        room: updatedRoom,
        docId: cleanCode,
      };
    } catch (innerErr: any) {
      console.error('[duelService] Erro interno em joinAction:', innerErr);
      return {
        success: false,
        errorMessage: 'Sala não encontrada. Verifique o código inserido.',
      };
    }
  };

  try {
    const result = await Promise.race([joinAction(), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error('[duelService] Erro em joinRoom:', error);
    return {
      success: false,
      errorMessage: 'Sala não encontrada. Verifique o código inserido.',
    };
  }
}

/**
 * 4. Atualização da Lista "Salas Abertas em Tempo Real":
 * Escuta 'ref(rtdb, "duels")' para listar automaticamente todas as salas ativas com
 * 'status === "waiting"' e 'hostUid !== currentUser.uid', permitindo entrada direta com 1 clique.
 */
export function listenToOpenRooms(
  currentUserId: string | null | undefined,
  callback: (rooms: DuelRoom[]) => void
): () => void {
  const duelsRtdbRef = rtdbRef(rtdb, 'duels');
  const unsubscribe = rtdbOnValue(duelsRtdbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const rtdbVal = snapshot.val();
    if (!rtdbVal || typeof rtdbVal !== 'object') {
      callback([]);
      return;
    }

    const rtdbRooms: DuelRoom[] = [];
    Object.entries(rtdbVal).forEach(([key, val]: [string, any]) => {
      if (
        val &&
        val.status === 'waiting' &&
        !val.player2 &&
        (!currentUserId || (val.hostUid !== currentUserId && val.hostId !== currentUserId && val.player1?.uid !== currentUserId))
      ) {
        const cleanKey = formatCode(val.code || val.roomCode || key);
        const hostName = (val.hostName || val.player1?.displayName || val.player1?.name || 'Candidato').toString().trim();
        rtdbRooms.push({
          ...val,
          id: cleanKey,
          code: cleanKey,
          roomCode: cleanKey,
          hostUid: val.hostUid,
          hostName,
          player1: val.player1 || {
            uid: val.hostUid,
            displayName: hostName,
            name: hostName,
            branch: val.player1?.branch || 'PNA',
            avatarId: val.player1?.avatarId || 'policia',
            province: val.player1?.province || 'Luanda',
          },
        });
      }
    });

    callback(filterValidLobbyRooms(rtdbRooms, currentUserId));
  }, (error) => {
    console.warn('[duelService] Erro ao escutar salas no RTDB:', error);
    callback([]);
  });

  return () => {
    try {
      unsubscribe();
    } catch {}
  };
}

/**
 * 3. Escutador em Tempo Real e Redirecionamento Automático:
 * - Escuta as mudanças no nó 'duels/${cleanCode}'.
 * - Notifica instantaneamente qualquer atualização para que Host e Convidado sejam redirecionados.
 * - Trata erros de conexão via try/catch detalhados e console.error.
 */
export function listenToRoom(
  roomIdOrCode: string,
  onUpdate: (room: DuelRoom | null, rawSnapshot?: any) => void,
  onError?: (error: any) => void
): () => void {
  const cleanCode = cleanRoomCode(roomIdOrCode);
  if (!cleanCode) {
    console.error('[duelService] Código de sala inválido para escutador');
    onUpdate(null, null);
    return () => {};
  }

  let unsubscribed = false;
  let unsubscribeRtdb: (() => void) | null = null;
  const targetRtdbRef = rtdbRef(rtdb, `duels/${cleanCode}`);

  // 1. Escuta em tempo real estrita e eficiente no Realtime Database: duels/${cleanCode}
  // (Elimina o onSnapshot contínuo do Firestore para zerar consumo de cotas de leituras diárias)
  try {
    unsubscribeRtdb = rtdbOnValue(
      targetRtdbRef,
      (snapshot) => {
        if (unsubscribed) return;
        try {
          if (!snapshot.exists()) {
            onUpdate(null, null);
            return;
          }
          const rawData = snapshot.val();
          const normalizedData = normalizeRoomData(rawData);
          onUpdate(normalizedData, rawData);
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

  // Retorno obrigatório de limpeza com destruição do escutador via off(roomRef)
  return () => {
    unsubscribed = true;
    if (typeof unsubscribeRtdb === 'function') {
      try {
        unsubscribeRtdb();
      } catch (err) {
        console.error('[duelService] Erro ao desinscrever RTDB listener:', err);
      }
    }
    try {
      rtdbOff(targetRtdbRef);
    } catch (err) {
      // Ignorar se já desvinculado
    }
  };
}

/**
 * 4. Submissão e Sincronização em Tempo Real de Respostas no Duelo:
 * - Escreve no nó específico: duels/${cleanCode}/answers/${questionIndex}/${uid}
 * - Atualiza o jogador no RTDB (player1 ou player2)
 * - Sincroniza em background com o Firestore
 */
export async function submitDuelAnswer({
  roomIdOrCode,
  questionIndex,
  uid,
  chosenIndex,
  isCorrect,
  timeSeconds,
  newScore,
  isHost,
}: {
  roomIdOrCode: string;
  questionIndex: number;
  uid: string;
  chosenIndex: number;
  isCorrect: boolean;
  timeSeconds: number;
  newScore: number;
  isHost: boolean;
}): Promise<void> {
  const cleanCode = cleanRoomCode(roomIdOrCode);
  if (!cleanCode || !uid) return;

  const answerPayload = sanitizeForRTDB({
    uid,
    chosenIndex,
    isCorrect,
    timeSeconds,
    score: newScore,
    answeredAt: Date.now(),
  });

  const playerKey = isHost ? 'player1' : 'player2';

  try {
    // 1. Escreve no nó específico de respostas em tempo real
    const answerNodeRef = rtdbRef(rtdb, `duels/${cleanCode}/answers/${questionIndex}/${uid}`);
    rtdbSet(answerNodeRef, answerPayload).catch((err) => {
      console.warn(`[duelService] Erro ao gravar resposta em duels/${cleanCode}/answers/${questionIndex}/${uid}:`, err);
    });

    // 2. Atualiza o objeto do jogador correspondente no RTDB
    const playerAnswerRef = rtdbRef(rtdb, `duels/${cleanCode}/${playerKey}/answers/${questionIndex}`);
    rtdbSet(playerAnswerRef, sanitizeForRTDB({ chosenIndex, isCorrect, timeSeconds })).catch(() => {});

    const playerScoreRef = rtdbRef(rtdb, `duels/${cleanCode}/${playerKey}/score`);
    rtdbSet(playerScoreRef, newScore).catch(() => {});

    const playerLastActiveRef = rtdbRef(rtdb, `duels/${cleanCode}/${playerKey}/lastActive`);
    rtdbSet(playerLastActiveRef, Date.now()).catch(() => {});

    // 3. Sincroniza com o Firestore
    const fsDocRef = doc(db, 'duels', cleanCode);
    setDoc(
      fsDocRef,
      {
        [`answers.${questionIndex}.${uid}`]: answerPayload,
        [`${playerKey}.answers.${questionIndex}`]: { chosenIndex, isCorrect, timeSeconds },
        [`${playerKey}.score`]: newScore,
        [`${playerKey}.lastActive`]: Date.now(),
      },
      { merge: true }
    ).catch((fsErr) => {
      console.warn('[duelService] Aviso ao sincronizar resposta no Firestore:', fsErr);
    });
  } catch (err) {
    console.error('[duelService] Erro ao submeter resposta no duelo:', err);
  }
}

/**
 * Atualiza nós parciais da sala no RTDB e Firestore de forma rápida
 */
export async function updateDuelRoomNode(roomIdOrCode: string, payload: Partial<DuelRoom>): Promise<void> {
  const cleanCode = cleanRoomCode(roomIdOrCode);
  if (!cleanCode) return;

  const sanitized = sanitizeForRTDB(payload);

  try {
    const targetRtdbRef = rtdbRef(rtdb, `duels/${cleanCode}`);
    rtdbUpdate(targetRtdbRef, sanitized).catch((err) => {
      console.warn(`[duelService] Erro ao atualizar nó RTDB duels/${cleanCode}:`, err);
    });

    const docRef = doc(db, 'duels', cleanCode);
    setDoc(docRef, sanitized, { merge: true }).catch((err) => {
      console.warn(`[duelService] Erro ao atualizar documento Firestore duels/${cleanCode}:`, err);
    });
  } catch (err) {
    console.error('[duelService] Erro em updateDuelRoomNode:', err);
  }
}

