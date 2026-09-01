export type MININTBranch = 'PNA' | 'SIC' | 'SME' | 'SP' | 'SPCB';

export type AcademicLevel = '9th_grade' | 'high_school' | 'higher_education';

export interface AcademicLevelOption {
  id: AcademicLevel;
  label: string;
  sublabel: string;
  description: string;
  targetRank: string;
}

export const ACADEMIC_LEVELS: AcademicLevelOption[] = [
  {
    id: '9th_grade',
    label: '9.ª Classe',
    sublabel: 'Agentes / Carreiras de Apoio',
    description: 'Português básico, Matemática elementar, História/Geografia e Legislação Básica',
    targetRank: 'Agentes de 2.ª Classe'
  },
  {
    id: 'high_school',
    label: 'Ensino Médio',
    sublabel: 'Subchefes / Técnicos',
    description: 'Raciocínio Lógico, Informática, Administração Pública e Legislação Orgânica (DP 32/18)',
    targetRank: 'Subchefes & Técnicos'
  },
  {
    id: 'higher_education',
    label: 'Ensino Superior',
    sublabel: 'Oficiais / Especialistas',
    description: 'Direito Constitucional (CRA), Lei n.º 26/22 (LGTFP), Ética & Deontologia',
    targetRank: 'Oficiais & Especialistas'
  }
];

export interface BranchInfo {
  id: MININTBranch;
  name: string;
  fullName: string;
  motto: string;
  color: string;
  badgeBg: string;
  accentColor: string;
  description: string;
  iconName: string;
  avatarSvg: string;
}

export type OfficialSubjectId = 
  | 'historia_angola'
  | 'organizacao_politica_cra'
  | 'nocoes_administracao_publica'
  | 'legislacao_minint'
  | 'patriotismo_valores_civicos';

export type QuestionCategory = 
  | OfficialSubjectId
  | 'direito_constituicao' 
  | 'historia_cultura_geral' 
  | 'portugues_raciocinio'
  | 'informatica_basica'
  | 'lingua_portuguesa' 
  | 'cultura_geral' 
  | 'direito_penal' 
  | 'raciocinio_logico';

export function normalizeCategory(cat: string): OfficialSubjectId {
  if (!cat) return 'legislacao_minint';
  const c = cat.toLowerCase();
  
  if (
    c === 'historia_angola' || 
    c === 'historia' || 
    c === 'historia_cultura_geral' || 
    c === 'cultura_geral'
  ) {
    return 'historia_angola';
  }
  
  if (
    c === 'organizacao_politica_cra' || 
    c === 'organizacao_politica' || 
    c === 'direito_constituicao' || 
    c === 'direito_penal' || 
    c === 'cra' || 
    c === 'constituicao'
  ) {
    return 'organizacao_politica_cra';
  }
  
  if (
    c === 'nocoes_administracao_publica' || 
    c === 'administracao_publica' || 
    c === 'administracao' || 
    c === 'portugues_raciocinio' || 
    c === 'lingua_portuguesa' || 
    c === 'raciocinio_logico' || 
    c === 'informatica_basica' || 
    c === 'informatica'
  ) {
    return 'nocoes_administracao_publica';
  }

  if (
    c === 'patriotismo_valores_civicos' || 
    c === 'patriotismo' || 
    c === 'valores_civicos' || 
    c === 'civismo'
  ) {
    return 'patriotismo_valores_civicos';
  }

  return 'legislacao_minint';
}

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryName: string;
  branch?: MININTBranch | 'GERAL' | string;
  academicLevel?: AcademicLevel | 'todos';
  academicLevelLabel?: string;
  question: string;
  options: string[];
  correctIndex: number;
  lawReference: string;
  explanation: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
}

export interface AvatarAccessories {
  frame?: string;
  background?: string;
  badge?: string;
  faceAccessory?: string;
  headAccessory?: string;
  face?: string;
  frames?: string;
  backgrounds?: string;
  badges?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  branch: MININTBranch;
  gender?: 'male' | 'female';
  avatarId: string;
  equippedUniform?: string;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedFaceAccessory?: string;
  avatarAccessories?: AvatarAccessories;
  province: string;
  academicLevel?: AcademicLevel;
  rankTitle: string;
  totalXp: number;
  xp?: number;
  previousRank?: number;
  minintCoins?: number;
  streakFreezeCount?: number;
  extraHintsCount?: number;
  purchasedItems?: string[];
  level: number;
  duelsPlayed: number;
  duelsWon: number;
  multiplayerDuelsPlayed?: number;
  multiplayerDuelsWon?: number;
  duelLeague?: 'bronze' | 'prata' | 'ouro';
  weeklyDuelPoints?: number;
  lastLeagueResetWeek?: string;
  leagueHistory?: Array<{
    week: string;
    league: 'bronze' | 'prata' | 'ouro';
    points: number;
    rank: number;
    outcome: 'promoted' | 'relegated' | 'maintained';
  }>;
  quizzesCompleted: number;
  correctAnswersCount: number;
  totalQuestionsAnswered: number;
  categoryStats?: Partial<Record<QuestionCategory, { correct: number; total: number }>> | Record<string, { correct: number; total: number }>;
  referralCode?: string;
  referredBy?: string;
  referralsCount?: number;
  following?: string[];
  emailOrPhone?: string;
  password?: string;
  role?: 'admin' | 'candidate' | 'bot';
  isBot?: boolean;
  isAi?: boolean;
  isTestAccount?: boolean;
  isVipSupporter?: boolean;
  dailyStreak?: number;
  lastDailyDate?: string;
  dailyChallengesCompleted?: number;
  unlockedBadges?: string[];
  unlockedBadgeDates?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface DailyChallengeEntry {
  id: string;
  uid: string;
  displayName: string;
  branch: MININTBranch;
  province: string;
  avatarId?: string;
  isVipSupporter?: boolean;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedUniform?: string;
  equippedFaceAccessory?: string;
  avatarAccessories?: AvatarAccessories;
  date: string;
  score: number;
  totalQuestions: number;
  totalTimeSeconds: number;
  xpEarned: number;
  completedAt: string;
}

export function isAdminUser(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  const email = (profile.emailOrPhone || '').toLowerCase().trim();
  const adminEmails = [
    'antonioedson939606343@gmail.com',
    'antoniopimenteledson@gmail.com',
    'admin@minint.gov.ao'
  ];
  return adminEmails.includes(email);
}

/**
 * Validates if a user/candidate is a genuine human registered user,
 * filtering out ghost/corrupt records, test accounts, AI bots or simulation placeholders.
 */
export function isRealHumanCandidate(candidate?: Partial<UserProfile> | null | any): boolean {
  if (!candidate) return false;

  // 1. UID validation - must have a valid non-empty UID (ignore ghost and guest accounts)
  const rawUid = String(candidate.uid || candidate.id || '').trim();
  if (!rawUid || rawUid === 'undefined' || rawUid === 'null' || rawUid === 'guest_user' || rawUid.length < 3) {
    return false;
  }

  // 2. Email / account identifier validation - rejeitar contas sem email/telefone nem uid válidos
  const rawEmail = String(candidate.email || candidate.emailOrPhone || candidate.userEmail || '').trim();
  if (!rawEmail && rawUid.length < 5) {
    return false;
  }

  // 3. Propriedades explícitas: isMock, isBot, isTest, isDummy (e suas variações)
  if (candidate.isMock === true || candidate.is_mock === true || candidate.isMock === 'true') return false;
  if (candidate.isBot === true || candidate.is_bot === true || candidate.isBot === 'true') return false;
  if (candidate.isAi === true || candidate.isAI === true || candidate.is_ai === true) return false;
  if (candidate.isTestAccount === true || candidate.isTest === true || candidate.is_test === true || candidate.isTest === 'true') return false;
  if (candidate.isDummy === true || candidate.is_dummy === true || candidate.isDummy === 'true') return false;

  // 4. Roles não humanas
  const role = String(candidate.role || '').toLowerCase().trim();
  if (role === 'bot' || role === 'ai' || role === 'test' || role === 'ia' || role === 'dummy' || role === 'mock') return false;

  // 5. Prefixos de UID de bots, testes, mocks ou dummies
  const uid = rawUid.toLowerCase();
  if (
    uid.startsWith('bot_') ||
    uid.startsWith('bot-') ||
    uid.startsWith('ai_') ||
    uid.startsWith('ai-') ||
    uid.startsWith('ia_') ||
    uid.startsWith('ia-') ||
    uid.startsWith('mock_') ||
    uid.startsWith('mock-') ||
    uid.startsWith('test_') ||
    uid.startsWith('test-') ||
    uid.startsWith('dummy_') ||
    uid.startsWith('dummy-') ||
    uid.startsWith('simulated_') ||
    uid === 'bot_candidate_ai' ||
    uid === 'guest_user'
  ) {
    return false;
  }

  // 6. Verificação do nome: filtrar qualquer conta cujo nome seja estritamente "Candidato MININT" ou variantes genéricas/bots
  const rawName = String(candidate.displayName || candidate.nome || candidate.name || candidate.userName || '').trim();
  const name = rawName.toLowerCase();

  if (
    name === 'candidato minint' ||
    name === 'candidato minint angola' ||
    name === 'candidato' ||
    name === 'não informado' ||
    name === 'desconhecido' ||
    name === 'anónimo' ||
    name === 'anonimo' ||
    name === ''
  ) {
    return false;
  }

  if (
    name.includes('[bot]') ||
    name.includes('[ia]') ||
    name.includes('[test]') ||
    name.includes('[mock]') ||
    name.includes('[dummy]') ||
    name.includes('(bot)') ||
    name.includes('(ia)') ||
    name.includes('(test)') ||
    name.includes('(mock)') ||
    name.includes('(dummy)') ||
    name.startsWith('bot ') ||
    name.startsWith('ia ') ||
    name.startsWith('robô ') ||
    name.startsWith('robot ') ||
    name === 'bot' ||
    name === 'ia' ||
    name === 'robo' ||
    name === 'robô'
  ) {
    return false;
  }

  return true;
}

export interface SavedAccount {
  uid: string;
  displayName: string;
  branch: MININTBranch;
  gender?: 'male' | 'female';
  avatarId: string;
  province: string;
  academicLevel?: AcademicLevel;
  rankTitle: string;
  role?: 'candidate' | 'admin' | 'bot';
  totalXp: number;
  referralCode?: string;
  emailOrPhone?: string;
  password?: string;
  isVipSupporter?: boolean;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedUniform?: string;
  equippedFaceAccessory?: string;
  avatarAccessories?: AvatarAccessories;
  lastLoginAt: string;
}

export interface DuelPlayer {
  uid: string;
  displayName: string;
  name?: string;
  branch: MININTBranch;
  avatarId: string;
  province?: string;
  photoURL?: string;
  isVipSupporter?: boolean;
  isBot?: boolean;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedUniform?: string;
  equippedFaceAccessory?: string;
  avatarAccessories?: AvatarAccessories;
  score: number;
  currentQuestionIndex: number;
  answers: Record<number, { chosenIndex: number; isCorrect: boolean; timeSeconds: number }>;
  isReady: boolean;
  isConnected: boolean;
  lastActive?: number;
}

export type DuelStatus = 'waiting' | 'matched' | 'in_progress' | 'active' | 'finished' | 'cancelled' | 'abandoned';

export interface DuelRoom {
  id: string;
  code?: string;
  roomCode: string;
  hostId?: string;
  hostUid: string;
  hostName?: string;
  guestUid?: string;
  guestName?: string;
  guest?: { uid: string; name: string; photoURL?: string };
  status: DuelStatus;
  category: QuestionCategory | 'misto';
  mode?: 'padrao' | 'relampago';
  academicLevel?: AcademicLevel | 'todos';
  questions: Question[];
  currentQuestionIndex: number;
  questionStartTime: number | null; // timestamp
  timePerQuestion: number; // e.g. 30 seconds for Relâmpago, 20 seconds for standard
  player1: DuelPlayer;
  player2?: DuelPlayer;
  winnerUid?: string | 'draw';
  answers?: Record<number, Record<string, { chosenIndex: number; isCorrect: boolean; timeSeconds: number; score?: number; answeredAt?: number }>>;
  createdAt: number | any;
  presence?: Record<string, { isConnected: boolean; lastActive: number; disconnectedAt?: number }>;
  forfeitedBy?: string;
  forfeitReason?: 'opponent_left' | 'inactivity' | 'timeout' | string;
  isForfeit?: boolean;
  rewardClaimed?: boolean;
  rewardClaimedBy?: Record<string, boolean>;
}

export interface DuelHistoryEntry {
  id: string;
  roomCode: string;
  timestamp: number;
  dateFormatted: string;
  category: QuestionCategory | 'misto';
  categoryName: string;
  userId?: string;
  myUid?: string;
  player1Id?: string;
  player2Id?: string;
  myScore: number;
  opponentScore: number;
  opponentUid: string;
  opponentName: string;
  opponentBranch: MININTBranch;
  opponentAvatarId: string;
  opponentProvince?: string;
  isOpponentBot?: boolean;
  result: 'win' | 'loss' | 'draw';
  totalQuestions: number;
  isForfeit?: boolean;
  forfeitReason?: string;
}

export interface AIExplanationResponse {
  explanation: string;
  legalArticles: string[];
  studyTips: string;
}

export interface Testimonial {
  id: string;
  name: string;
  province: string;
  branch: MININTBranch;
  rating: number;
  comment: string;
  isVip?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  date?: string;
  createdAt?: string;
}
