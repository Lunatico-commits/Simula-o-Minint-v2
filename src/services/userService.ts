import { 
  collection, 
  getDocs, 
  getCountFromServer, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, MININTBranch, AcademicLevel, isRealHumanCandidate } from '../types';
import { PROVINCES_ANGOLA, normalizeProvinceName } from '../data/branches';

/**
 * Normalizes a raw Firestore user document into a valid, complete UserProfile.
 * Handles legacy/old accounts without new fields (e.g. missing provincia, branch, or academicLevel)
 * by displaying 'Não informado' instead of generating fake data ("Candidato") or hiding the user.
 */
export function normalizeUserProfile(data: DocumentData | any, docId?: string): UserProfile {
  const uid = data?.uid || docId || '';
  
  // Normalização do Ramo com valor real ou 'Não informado' se ausente
  const rawBranch = (data?.branch || data?.ramo || '').toString().trim().toUpperCase();
  const validBranches: MININTBranch[] = ['PNA', 'SIC', 'SME', 'SP', 'SPCB'];
  const branch: MININTBranch = validBranches.includes(rawBranch as MININTBranch)
    ? (rawBranch as MININTBranch)
    : ('Não informado' as any);

  // Normalização da Província com seletores de reserva (fallback para 'Luanda' se ausente)
  const rawProvince = (data?.provincia || data?.province || data?.location || '').toString().trim();
  let province = 'Luanda';
  if (rawProvince && rawProvince !== 'Não Especificada' && rawProvince !== 'Não informado') {
    const matched = PROVINCES_ANGOLA.find(
      (p) => normalizeProvinceName(p) === normalizeProvinceName(rawProvince)
    );
    province = matched || rawProvince;
  }

  // Normalização do Nível Académico com seletores de reserva (fallback para 'high_school' / 'Ensino Médio')
  const rawLevel = (data?.nivelAcademico || data?.academicLevel || data?.escolaridade || data?.level_academic || '').toString().trim().toLowerCase();
  let academicLevel: AcademicLevel = 'high_school';
  if (rawLevel === '9th_grade' || rawLevel === '9a_classe' || rawLevel === '9' || rawLevel === '9ª classe' || rawLevel.includes('9')) {
    academicLevel = '9th_grade';
  } else if (rawLevel === 'higher_education' || rawLevel === 'superior' || rawLevel === 'licenciatura' || rawLevel === 'ensino superior' || rawLevel.includes('superior')) {
    academicLevel = 'higher_education';
  } else {
    academicLevel = 'high_school';
  }

  // Normalização de Avatar e Acessórios
  const avatarAccessories = data?.avatarAccessories || {
    frame: data?.equippedFrame || 'frame_none',
    background: data?.equippedBackground || 'bg_default',
    badge: 'badge_none',
  };

  // Normalização do Nome com seletores de reserva (fallback para 'Candidato MININT' se ausente)
  const rawName = (data?.displayName || data?.name || data?.nome || data?.userName || '').toString().trim();
  const emailIdentifier = data?.email ? data.email.split('@')[0] : '';
  const displayName = (rawName && rawName !== 'Não informado') 
    ? rawName 
    : (emailIdentifier || 'Candidato MININT');
  
  const totalXp = Number(data?.totalXp ?? data?.xp ?? 0);
  const safeXp = isNaN(totalXp) ? 0 : totalXp;
  const minintCoins = Number(data?.minintCoins ?? data?.coins ?? 0);

  return {
    uid,
    displayName,
    branch,
    gender: data?.gender || 'male',
    avatarId: data?.avatarId || 'avatar_pna_male_1',
    equippedUniform: data?.equippedUniform,
    equippedFrame: data?.equippedFrame || avatarAccessories.frame,
    equippedBackground: data?.equippedBackground || avatarAccessories.background,
    equippedFaceAccessory: data?.equippedFaceAccessory,
    avatarAccessories,
    province,
    academicLevel,
    rankTitle: data?.rankTitle || data?.titulo || 'Não informado',
    totalXp: safeXp,
    xp: safeXp,
    previousRank: data?.previousRank,
    minintCoins: isNaN(minintCoins) ? 0 : minintCoins,
    streakFreezeCount: Number(data?.streakFreezeCount ?? 0),
    extraHintsCount: Number(data?.extraHintsCount ?? 0),
    purchasedItems: Array.isArray(data?.purchasedItems) ? data.purchasedItems : [],
    level: Number(data?.level ?? 1),
    duelsPlayed: Number(data?.duelsPlayed ?? 0),
    duelsWon: Number(data?.duelsWon ?? 0),
    multiplayerDuelsPlayed: Number(data?.multiplayerDuelsPlayed ?? 0),
    multiplayerDuelsWon: Number(data?.multiplayerDuelsWon ?? 0),
    duelLeague: data?.duelLeague || 'bronze',
    weeklyDuelPoints: Number(data?.weeklyDuelPoints ?? 0),
    lastLeagueResetWeek: data?.lastLeagueResetWeek,
    leagueHistory: Array.isArray(data?.leagueHistory) ? data.leagueHistory : [],
    quizzesCompleted: Number(data?.quizzesCompleted ?? 0),
    correctAnswersCount: Number(data?.correctAnswersCount ?? 0),
    totalQuestionsAnswered: Number(data?.totalQuestionsAnswered ?? 0),
    categoryStats: data?.categoryStats || {},
    referralCode: data?.referralCode,
    referredBy: data?.referredBy,
    referralsCount: Number(data?.referralsCount ?? 0),
    following: Array.isArray(data?.following) ? data.following : [],
    emailOrPhone: data?.emailOrPhone || data?.email || data?.phone || '',
    role: data?.role || 'candidate',
    isBot: Boolean(data?.isBot),
    isAi: Boolean(data?.isAi),
    isTestAccount: Boolean(data?.isTestAccount),
    isVipSupporter: Boolean(data?.isVipSupporter),
    dailyStreak: Number(data?.dailyStreak ?? 0),
    lastDailyDate: data?.lastDailyDate,
    dailyChallengesCompleted: Number(data?.dailyChallengesCompleted ?? 0),
    unlockedBadges: Array.isArray(data?.unlockedBadges) ? data.unlockedBadges : [],
    unlockedBadgeDates: data?.unlockedBadgeDates || {},
    createdAt: data?.createdAt || new Date().toISOString(),
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
}

/**
 * Realiza a contagem REAL e precisa de todos os documentos existentes na coleção 'users' do Firestore.
 * Utiliza getCountFromServer (consulta agregada count()), com fallback para getDocs caso offline.
 */
export async function getTotalUsersRealCount(): Promise<number> {
  try {
    const usersColl = collection(db, 'users');
    const snap = await getCountFromServer(usersColl);
    return snap.data().count;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users/count');
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.size;
    } catch (fallbackErr) {
      console.warn('Erro ao obter contagem real de utilizadores:', fallbackErr);
      return 0;
    }
  }
}

/**
 * Busca TODOS os utilizadores reais da coleção 'users' sem depender de índices do Firestore.
 * Lê a coleção completa e ordena os dados diretamente em memória JavaScript por XP decrescente.
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const usersColl = collection(db, 'users');
    const snapshot = await getDocs(usersColl);
    const users: UserProfile[] = [];

    snapshot.forEach((docSnap) => {
      const normalized = normalizeUserProfile(docSnap.data(), docSnap.id);
      users.push(normalized);
    });

    // Ordenação do ranking diretamente em memória JavaScript após receber os dados
    users.sort((a, b) => (Number(b.xp ?? b.totalXp) || 0) - (Number(a.xp ?? a.totalXp) || 0));
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    console.error('Erro ao buscar utilizadores da coleção users:', error);
    return [];
  }
}

/**
 * Consulta global da coleção 'users' do Firestore ('getUsers()').
 * Lê a coleção 'users' COMPLETA e retorna os candidatos ordenados por XP de forma decrescente em memória.
 */
export async function getUsers(): Promise<UserProfile[]> {
  return fetchAllUsers();
}

/**
 * Assina atualizações em tempo real de TODOS os utilizadores na coleção 'users' sem depender de índices no Firestore.
 * Realiza a ordenação do ranking diretamente em JavaScript em memória após receber os dados.
 */
export function subscribeToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const q = query(collection(db, 'users'));
    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const users: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const normalized = normalizeUserProfile(docSnap.data(), docSnap.id);
          users.push(normalized);
        });
        // Ordenação do ranking diretamente em memória JavaScript após receber os dados
        users.sort((a, b) => (Number(b.xp ?? b.totalXp) || 0) - (Number(a.xp ?? a.totalXp) || 0));
        onUpdate(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        console.error('Erro na subscrição em tempo real de utilizadores:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Erro ao configurar listener de utilizadores:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Assina especificamente os Rankings globais reais do Firestore ordenados por XP de forma decrescente.
 */
export function subscribeToRankings(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
): () => void {
  return subscribeToAllUsers(onUpdate, onError);
}

/**
 * Busca o perfil de um utilizador específico pelo UID.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return normalizeUserProfile(snap.data(), snap.id);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
}

/**
 * Guarda ou atualiza o perfil de um utilizador no Firestore com merge seguro.
 */
export async function saveOrUpdateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    throw error;
  }
}

/**
 * Helper para calcular estatísticas agregadas de províncias, ramos e níveis académicos
 * a partir de uma lista de utilizadores normalizados.
 */
export function calculateUserDemographics(users: UserProfile[]) {
  const branchBreakdown: Record<string, number> = { PNA: 0, SIC: 0, SME: 0, SP: 0, SPCB: 0, 'Não informado': 0 };
  const levelBreakdown: Record<string, number> = { '9th_grade': 0, 'high_school': 0, 'higher_education': 0, 'Não informado': 0 };
  const provinceBreakdown: Record<string, number> = {};

  // Inicializar todas as 21 províncias de Angola
  PROVINCES_ANGOLA.forEach((p) => {
    provinceBreakdown[p] = 0;
  });
  provinceBreakdown['Não informado'] = 0;

  let totalXp = 0;
  let totalDuels = 0;
  let totalQuizzes = 0;

  users.forEach((u) => {
    totalXp += u.totalXp || 0;
    totalDuels += u.duelsPlayed || 0;
    totalQuizzes += u.quizzesCompleted || 0;

    // Ramo
    const b = u.branch && ['PNA', 'SIC', 'SME', 'SP', 'SPCB'].includes(u.branch) ? u.branch : 'Não informado';
    branchBreakdown[b] = (branchBreakdown[b] || 0) + 1;

    // Nível Académico
    const lvl = u.academicLevel || 'Não informado';
    levelBreakdown[lvl] = (levelBreakdown[lvl] || 0) + 1;

    // Província
    const prov = u.province || 'Não informado';
    provinceBreakdown[prov] = (provinceBreakdown[prov] || 0) + 1;
  });

  return {
    totalUsers: users.length,
    totalXp,
    totalDuels,
    totalQuizzes,
    branchBreakdown,
    levelBreakdown,
    provinceBreakdown,
  };
}
