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

export type QuestionCategory = 
  | 'legislacao_minint' 
  | 'direito_constituicao' 
  | 'historia_cultura_geral' 
  | 'portugues_raciocinio'
  | 'informatica_basica'
  | 'lingua_portuguesa' 
  | 'cultura_geral' 
  | 'direito_penal' 
  | 'raciocinio_logico';

export function normalizeCategory(cat: string): 'legislacao_minint' | 'direito_constituicao' | 'historia_cultura_geral' | 'portugues_raciocinio' | 'informatica_basica' {
  if (!cat) return 'legislacao_minint';
  const c = cat.toLowerCase();
  if (c === 'informatica_basica' || c === 'informatica' || c === 'informatica_e_raciocinio') {
    return 'informatica_basica';
  }
  if (c === 'lingua_portuguesa' || c === 'raciocinio_logico' || c === 'portugues_raciocinio') {
    return 'portugues_raciocinio';
  }
  if (c === 'cultura_geral' || c === 'historia_cultura_geral') {
    return 'historia_cultura_geral';
  }
  if (c === 'direito_penal' || c === 'direito_constituicao') {
    return 'direito_constituicao';
  }
  return 'legislacao_minint';
}

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryName: string;
  academicLevel?: AcademicLevel | 'todos';
  academicLevelLabel?: string;
  question: string;
  options: string[];
  correctIndex: number;
  lawReference: string;
  explanation: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  branch: MININTBranch;
  avatarId: string;
  province: string;
  academicLevel?: AcademicLevel;
  rankTitle: string;
  totalXp: number;
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
  categoryStats: Record<QuestionCategory, { correct: number; total: number }>;
  referralCode?: string;
  referredBy?: string;
  referralsCount?: number;
  emailOrPhone?: string;
  password?: string;
  role?: 'admin' | 'candidate';
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

export interface SavedAccount {
  uid: string;
  displayName: string;
  branch: MININTBranch;
  avatarId: string;
  province: string;
  academicLevel?: AcademicLevel;
  rankTitle: string;
  role?: 'candidate' | 'admin';
  totalXp: number;
  referralCode?: string;
  emailOrPhone?: string;
  password?: string;
  isVipSupporter?: boolean;
  lastLoginAt: string;
}

export interface DuelPlayer {
  uid: string;
  displayName: string;
  branch: MININTBranch;
  avatarId: string;
  province?: string;
  photoURL?: string;
  isVipSupporter?: boolean;
  isBot?: boolean;
  score: number;
  currentQuestionIndex: number;
  answers: Record<number, { chosenIndex: number; isCorrect: boolean; timeSeconds: number }>;
  isReady: boolean;
  isConnected: boolean;
}

export type DuelStatus = 'waiting' | 'active' | 'finished' | 'cancelled' | 'abandoned';

export interface DuelRoom {
  id: string;
  code?: string;
  roomCode: string;
  hostId?: string;
  hostUid: string;
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
  createdAt: number | any;
}

export interface DuelHistoryEntry {
  id: string;
  roomCode: string;
  timestamp: number;
  dateFormatted: string;
  category: QuestionCategory | 'misto';
  categoryName: string;
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
