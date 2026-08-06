import { UserProfile, MININTBranch } from '../types';

export type DuelLeague = 'bronze' | 'prata' | 'ouro';

export interface LeagueInfo {
  id: DuelLeague;
  name: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  description: string;
  promotionThresholdText: string;
  relegationThresholdText: string;
}

export const LEAGUES_CONFIG: Record<DuelLeague, LeagueInfo> = {
  bronze: {
    id: 'bronze',
    name: 'Liga Bronze',
    badge: '🥉',
    color: '#D97706', // amber-600
    bgColor: 'from-amber-950/60 via-slate-900 to-amber-950/40',
    borderColor: 'border-amber-600/50',
    glowColor: 'rgba(217, 119, 6, 0.3)',
    textColor: 'text-amber-400',
    description: 'Nível de entrada para Recrutas e Candidatos em fase de preparação inicial.',
    promotionThresholdText: 'Top 25% sobem para a Liga Prata 🥈 (com >0 Pts)',
    relegationThresholdText: 'Sem despromoção (Nível de base)',
  },
  prata: {
    id: 'prata',
    name: 'Liga Prata',
    badge: '🥈',
    color: '#94A3B8', // slate-400
    bgColor: 'from-slate-800/80 via-slate-900 to-slate-800/60',
    borderColor: 'border-slate-400/50',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    textColor: 'text-slate-300',
    description: 'Nível intermédio para candidatos que demonstram consistência em acertos e vitórias nos Duelos Semanais.',
    promotionThresholdText: 'Top 25% sobem para a Liga Ouro 🥇 (com >0 Pts)',
    relegationThresholdText: 'Últimos 25% descem para a Liga Bronze 🥉',
  },
  ouro: {
    id: 'ouro',
    name: 'Liga Ouro',
    badge: '🥇',
    color: '#EAB308', // yellow-500
    bgColor: 'from-amber-900/80 via-slate-900 to-amber-900/60',
    borderColor: 'border-yellow-500/60',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    textColor: 'text-yellow-400',
    description: 'A Elite do MININT! Apenas os melhores estrategistas e Oficiais competem aqui.',
    promotionThresholdText: 'N.º 1 ganha o título "Campeão de Elite" + 300 XP 👑',
    relegationThresholdText: 'Últimos 30% descem para a Liga Prata 🥈',
  },
};

/**
 * Returns current ISO week string in format "YYYY-Www" (e.g. "2026-W31")
 */
export function getCurrentISOWeek(d = new Date()): string {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Returns time remaining until Sunday midnight (end of current week) in days & hours
 */
export function getTimeUntilWeeklyReset(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const endOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const diffMs = endOfWeek.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

/**
 * Calculates duel league points earned from a match outcome and correct answers
 * Rules: +20 Pts Base (Participação), +15 Pts por Pergunta Certa, +50 Pts Bónus por Vitória
 */
export function calculateDuelLeaguePoints(isWin: boolean | undefined, correctAnswers: number): number {
  const basePoints = 20; // Participation
  const answerPoints = Math.max(0, correctAnswers) * 15; // 15 pts per correct answer
  const winBonus = isWin === true ? 50 : 0; // 50 bonus for win, 0 for loss/draw
  return basePoints + answerPoints + winBonus;
}

export interface WeeklyLeagueEvaluationResult {
  hasReset: boolean;
  oldLeague: DuelLeague;
  newLeague: DuelLeague;
  outcome: 'promoted' | 'relegated' | 'maintained';
  weeklyPoints: number;
  rankInLeague: number;
  totalInLeague: number;
  weekFormatted: string;
}

/**
 * Evaluates whether a candidate profile needs a weekly league update, and calculates promotion/relegation.
 * Weekly reset occurs on Sunday Midnight.
 * Promotion Criteria: Top 25% AND weeklyPoints > 0.
 * Inactive users (0 Pts) NEVER promote and REMAIN in current league.
 */
export function evaluateWeeklyLeagueStatus(
  profile: UserProfile,
  allCandidates: UserProfile[]
): { updatedProfile: UserProfile; result: WeeklyLeagueEvaluationResult | null } {
  const currentWeek = getCurrentISOWeek();
  const userLastWeek = profile.lastLeagueResetWeek;

  // If user profile does not have lastLeagueResetWeek set yet (new user or missing field),
  // initialize it without triggering a reset/promotion modal.
  if (!userLastWeek) {
    const initializedProfile: UserProfile = {
      ...profile,
      duelLeague: profile.duelLeague || 'bronze',
      weeklyDuelPoints: profile.weeklyDuelPoints || 0,
      lastLeagueResetWeek: currentWeek,
    };
    return { updatedProfile: initializedProfile, result: null };
  }

  // If user is already on the current week, no reset needed
  if (userLastWeek === currentWeek) {
    return { updatedProfile: profile, result: null };
  }

  const currentLeague: DuelLeague = profile.duelLeague || 'bronze';
  const weeklyPts = profile.weeklyDuelPoints || 0;

  // Filter candidates in the same league for ranking calculation
  const sameLeagueCandidates = allCandidates
    .filter((c) => (c.duelLeague || 'bronze') === currentLeague)
    .sort((a, b) => (b.weeklyDuelPoints || 0) - (a.weeklyDuelPoints || 0));

  let rank = sameLeagueCandidates.findIndex((c) => c.uid === profile.uid) + 1;
  if (rank === 0) rank = sameLeagueCandidates.length + 1;
  const totalInLeague = Math.max(1, sameLeagueCandidates.length);

  let newLeague: DuelLeague = currentLeague;
  let outcome: 'promoted' | 'relegated' | 'maintained' = 'maintained';

  const rankPercentile = (rank / totalInLeague) * 100;

  // PROMOTION CRITERIA: TOP 25% AND weeklyPts > 0
  if (currentLeague === 'bronze') {
    if (weeklyPts > 0 && rankPercentile <= 25) {
      newLeague = 'prata';
      outcome = 'promoted';
    }
  } else if (currentLeague === 'prata') {
    if (weeklyPts > 0 && rankPercentile <= 25) {
      newLeague = 'ouro';
      outcome = 'promoted';
    } else if (totalInLeague >= 4 && rankPercentile >= 75) {
      newLeague = 'bronze';
      outcome = 'relegated';
    }
  } else if (currentLeague === 'ouro') {
    if (totalInLeague >= 3 && rankPercentile >= 70) {
      newLeague = 'prata';
      outcome = 'relegated';
    }
  }

  // Record history
  const historyEntry = {
    week: userLastWeek,
    league: currentLeague,
    points: weeklyPts,
    rank,
    outcome,
  };

  const updatedProfile: UserProfile = {
    ...profile,
    duelLeague: newLeague,
    weeklyDuelPoints: 0, // Reset points for new week
    lastLeagueResetWeek: currentWeek,
    leagueHistory: [...(profile.leagueHistory || []), historyEntry],
  };

  const evalResult: WeeklyLeagueEvaluationResult = {
    hasReset: true,
    oldLeague: currentLeague,
    newLeague,
    outcome,
    weeklyPoints: weeklyPts,
    rankInLeague: rank,
    totalInLeague,
    weekFormatted: userLastWeek,
  };

  return { updatedProfile, result: evalResult };
}

/**
 * Gets candidate's zone in their league: 'promotion' | 'maintenance' | 'relegation'
 */
export function getCandidateLeagueZone(
  rank: number,
  totalCandidates: number,
  league: DuelLeague,
  weeklyPoints: number = 0
): 'promotion' | 'maintenance' | 'relegation' {
  const total = Math.max(1, totalCandidates);
  const percentile = (rank / total) * 100;

  // Inactive users with 0 points NEVER get promoted
  if (weeklyPoints <= 0) {
    if (league === 'prata' && total >= 4 && percentile >= 75) return 'relegation';
    if (league === 'ouro' && total >= 3 && percentile >= 70) return 'relegation';
    return 'maintenance';
  }

  if (league === 'bronze') {
    if (percentile <= 25) return 'promotion';
    return 'maintenance';
  }

  if (league === 'prata') {
    if (percentile <= 25) return 'promotion';
    if (total >= 4 && percentile >= 75) return 'relegation';
    return 'maintenance';
  }

  // Ouro
  if (total >= 3 && percentile >= 70) return 'relegation';
  return 'maintenance';
}
