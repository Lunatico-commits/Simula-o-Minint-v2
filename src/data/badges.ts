import { UserProfile } from '../types';
import { 
  Award, 
  Sparkles, 
  Trophy, 
  Swords, 
  Crown, 
  BookOpen, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Shield, 
  Scale, 
  Globe, 
  GraduationCap, 
  Medal, 
  Star 
} from 'lucide-react';

export type BadgeCategory = 'estudo' | 'duelo' | 'oficial' | 'especial';
export type BadgeRarity = 'COMUM' | 'RARO' | 'ÉPICO' | 'LENDÁRIO';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  iconName: string;
  category: BadgeCategory;
  categoryLabel: string;
  rarity: BadgeRarity;
  xpReward: number;
  gradient: string;
  borderLight: string;
  bgLight: string;
  textColor: string;
  condition: (profile: UserProfile) => boolean;
  getProgress: (profile: UserProfile) => { current: number; max: number; unit: string };
}

export const BADGE_RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  weight: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorderUnlocked: string;
  glowClass: string;
}> = {
  COMUM: {
    label: 'COMUM',
    weight: 1,
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeBorder: 'border-slate-300 dark:border-slate-600',
    badgeText: 'text-slate-600 dark:text-slate-400',
    cardBorderUnlocked: 'border-slate-300 dark:border-slate-700',
    glowClass: '',
  },
  RARO: {
    label: 'RARO',
    weight: 2,
    badgeBg: 'bg-blue-500/15 dark:bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-600 dark:text-blue-400 font-bold',
    cardBorderUnlocked: 'border-blue-500/60 dark:border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    glowClass: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]',
  },
  ÉPICO: {
    label: 'ÉPICO',
    weight: 3,
    badgeBg: 'bg-purple-500/15 dark:bg-purple-500/20',
    badgeBorder: 'border-purple-500/50',
    badgeText: 'text-purple-600 dark:text-purple-300 font-extrabold',
    cardBorderUnlocked: 'border-purple-500/70 dark:border-purple-400/70 shadow-[0_0_16px_rgba(168,85,247,0.35)]',
    glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.45)]',
  },
  LENDÁRIO: {
    label: 'LENDÁRIO',
    weight: 4,
    badgeBg: 'bg-amber-500/20 dark:bg-amber-500/30',
    badgeBorder: 'border-amber-500/60 dark:border-amber-400/60',
    badgeText: 'text-amber-600 dark:text-amber-300 font-black tracking-wider',
    cardBorderUnlocked: 'border-amber-400 dark:border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50',
    glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.6)] animate-pulse',
  },
};

export const BADGES_LIST: Badge[] = [
  {
    id: 'primeiro_simulado',
    title: 'Recruta Aprovado',
    description: 'Concluiu o seu primeiro simulado de preparação.',
    emoji: '🔰',
    iconName: 'BookOpen',
    category: 'estudo',
    categoryLabel: 'Estudos',
    rarity: 'COMUM',
    xpReward: 50,
    gradient: 'from-blue-500 to-sky-600',
    borderLight: 'border-blue-500/40',
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    condition: (p) => (p.quizzesCompleted || 0) >= 1,
    getProgress: (p) => ({
      current: Math.min(1, p.quizzesCompleted || 0),
      max: 1,
      unit: 'simulado'
    })
  },
  {
    id: 'estudioso_bronze',
    title: 'Primeiro Passo',
    description: 'Acertou a 10 questões em simulados do MININT.',
    emoji: '🥉',
    iconName: 'Award',
    category: 'estudo',
    categoryLabel: 'Estudos',
    rarity: 'COMUM',
    xpReward: 50,
    gradient: 'from-amber-600 to-amber-800',
    borderLight: 'border-amber-700/40',
    bgLight: 'bg-amber-700/10',
    textColor: 'text-amber-600',
    condition: (p) => (p.correctAnswersCount || 0) >= 10,
    getProgress: (p) => ({
      current: Math.min(10, p.correctAnswersCount || 0),
      max: 10,
      unit: 'questões certas'
    })
  },
  {
    id: 'estudioso_prata',
    title: 'Estudioso Dedicado',
    description: 'Acertou a 50 questões em simulados.',
    emoji: '🥈',
    iconName: 'Award',
    category: 'estudo',
    categoryLabel: 'Estudos',
    rarity: 'RARO',
    xpReward: 150,
    gradient: 'from-slate-300 to-slate-500',
    borderLight: 'border-slate-400/40',
    bgLight: 'bg-slate-400/10',
    textColor: 'text-slate-300',
    condition: (p) => (p.correctAnswersCount || 0) >= 50,
    getProgress: (p) => ({
      current: Math.min(50, p.correctAnswersCount || 0),
      max: 50,
      unit: 'questões certas'
    })
  },
  {
    id: 'estudioso_ouro',
    title: 'Estudioso de Ouro',
    description: 'Atingiu a marca de 150 respostas corretas!',
    emoji: '🥇',
    iconName: 'Sparkles',
    category: 'estudo',
    categoryLabel: 'Estudos',
    rarity: 'ÉPICO',
    xpReward: 300,
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    borderLight: 'border-amber-500/50',
    bgLight: 'bg-amber-500/15',
    textColor: 'text-amber-500',
    condition: (p) => (p.correctAnswersCount || 0) >= 150,
    getProgress: (p) => ({
      current: Math.min(150, p.correctAnswersCount || 0),
      max: 150,
      unit: 'questões certas'
    })
  },
  {
    id: 'mestre_duelo',
    title: 'Mestre do Duelo',
    description: 'Venceu 5 duelos multiplayer contra outros candidatos.',
    emoji: '⚔️',
    iconName: 'Swords',
    category: 'duelo',
    categoryLabel: 'Duelos',
    rarity: 'RARO',
    xpReward: 200,
    gradient: 'from-purple-500 to-indigo-600',
    borderLight: 'border-purple-500/40',
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    condition: (p) => (p.multiplayerDuelsWon || 0) >= 5,
    getProgress: (p) => ({
      current: Math.min(5, p.multiplayerDuelsWon || 0),
      max: 5,
      unit: 'vitórias multiplayer'
    })
  },
  {
    id: 'gladiador_invicto',
    title: 'Gladiador do MININT',
    description: 'Venceu 15 duelos e conquistou autoridade militar.',
    emoji: '👑',
    iconName: 'Crown',
    category: 'duelo',
    categoryLabel: 'Duelos',
    rarity: 'LENDÁRIO',
    xpReward: 500,
    gradient: 'from-rose-500 to-red-700',
    borderLight: 'border-rose-500/40',
    bgLight: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    condition: (p) => (p.duelsWon || 0) >= 15,
    getProgress: (p) => ({
      current: Math.min(15, p.duelsWon || 0),
      max: 15,
      unit: 'vitórias em duelo'
    })
  },
  {
    id: 'chama_diaria',
    title: 'Disciplinado',
    description: 'Manteve uma sequência diária de 3 dias de estudo.',
    emoji: '🔥',
    iconName: 'Flame',
    category: 'oficial',
    categoryLabel: 'Consistência',
    rarity: 'COMUM',
    xpReward: 100,
    gradient: 'from-orange-500 to-amber-600',
    borderLight: 'border-orange-500/40',
    bgLight: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    condition: (p) => (p.dailyStreak || 0) >= 3,
    getProgress: (p) => ({
      current: Math.min(3, p.dailyStreak || 0),
      max: 3,
      unit: 'dias seguidos'
    })
  },
  {
    id: 'foco_inabalavel',
    title: 'Foco Inabalável',
    description: 'Manteve uma sequência diária ininterrupta de 7 dias.',
    emoji: '⚡',
    iconName: 'Zap',
    category: 'oficial',
    categoryLabel: 'Consistência',
    rarity: 'RARO',
    xpReward: 300,
    gradient: 'from-yellow-400 to-orange-500',
    borderLight: 'border-yellow-500/40',
    bgLight: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
    condition: (p) => (p.dailyStreak || 0) >= 7,
    getProgress: (p) => ({
      current: Math.min(7, p.dailyStreak || 0),
      max: 7,
      unit: 'dias seguidos'
    })
  },
  {
    id: 'especialista_legislacao',
    title: 'Especialista em Legislação',
    description: 'Acertou 30+ questões em Legislação Orgânica do MININT.',
    emoji: '🛡️',
    iconName: 'Shield',
    category: 'estudo',
    categoryLabel: 'Matérias',
    rarity: 'RARO',
    xpReward: 200,
    gradient: 'from-sky-500 to-blue-600',
    borderLight: 'border-sky-500/40',
    bgLight: 'bg-sky-500/10',
    textColor: 'text-sky-500',
    condition: (p) => {
      const stats = p.categoryStats?.legislacao_minint?.correct || 0;
      return stats >= 30;
    },
    getProgress: (p) => ({
      current: Math.min(30, p.categoryStats?.legislacao_minint?.correct || 0),
      max: 30,
      unit: 'acertos na matéria'
    })
  },
  {
    id: 'jurista_constituicao',
    title: 'Jurista Constitucional',
    description: 'Acertou 30+ questões em Direito e Constituição (CRA).',
    emoji: '⚖️',
    iconName: 'Scale',
    category: 'estudo',
    categoryLabel: 'Matérias',
    rarity: 'RARO',
    xpReward: 200,
    gradient: 'from-purple-500 to-violet-600',
    borderLight: 'border-purple-500/40',
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    condition: (p) => {
      const c1 = p.categoryStats?.direito_constituicao?.correct || 0;
      const c2 = p.categoryStats?.direito_penal?.correct || 0;
      return (c1 + c2) >= 30;
    },
    getProgress: (p) => {
      const c1 = p.categoryStats?.direito_constituicao?.correct || 0;
      const c2 = p.categoryStats?.direito_penal?.correct || 0;
      return {
        current: Math.min(30, c1 + c2),
        max: 30,
        unit: 'acertos na matéria'
      };
    }
  },
  {
    id: 'historiador_patriota',
    title: 'Historiador Patriota',
    description: 'Acertou 30+ questões em História e Cultura Geral de Angola.',
    emoji: '🇦🇴',
    iconName: 'Globe',
    category: 'estudo',
    categoryLabel: 'Matérias',
    rarity: 'RARO',
    xpReward: 200,
    gradient: 'from-emerald-500 to-teal-600',
    borderLight: 'border-emerald-500/40',
    bgLight: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    condition: (p) => {
      const c1 = p.categoryStats?.historia_cultura_geral?.correct || 0;
      const c2 = p.categoryStats?.cultura_geral?.correct || 0;
      return (c1 + c2) >= 30;
    },
    getProgress: (p) => {
      const c1 = p.categoryStats?.historia_cultura_geral?.correct || 0;
      const c2 = p.categoryStats?.cultura_geral?.correct || 0;
      return {
        current: Math.min(30, c1 + c2),
        max: 30,
        unit: 'acertos na matéria'
      };
    }
  },
  {
    id: 'mestre_portugues',
    title: 'Mestre da Língua & Lógica',
    description: 'Acertou 30+ questões em Português e Raciocínio Lógico.',
    emoji: '✍️',
    iconName: 'GraduationCap',
    category: 'estudo',
    categoryLabel: 'Matérias',
    rarity: 'RARO',
    xpReward: 200,
    gradient: 'from-blue-600 to-indigo-700',
    borderLight: 'border-blue-600/40',
    bgLight: 'bg-blue-600/10',
    textColor: 'text-blue-600',
    condition: (p) => {
      const c1 = p.categoryStats?.portugues_raciocinio?.correct || 0;
      const c2 = p.categoryStats?.lingua_portuguesa?.correct || 0;
      const c3 = p.categoryStats?.raciocinio_logico?.correct || 0;
      return (c1 + c2 + c3) >= 30;
    },
    getProgress: (p) => {
      const c1 = p.categoryStats?.portugues_raciocinio?.correct || 0;
      const c2 = p.categoryStats?.lingua_portuguesa?.correct || 0;
      const c3 = p.categoryStats?.raciocinio_logico?.correct || 0;
      return {
        current: Math.min(30, c1 + c2 + c3),
        max: 30,
        unit: 'acertos na matéria'
      };
    }
  },
  {
    id: 'veterano_minint',
    title: 'Lenda do Concurso',
    description: 'Acumulou mais de 50.000 XP na jornada de preparação.',
    emoji: '🎖️',
    iconName: 'Medal',
    category: 'oficial',
    categoryLabel: 'Patentes',
    rarity: 'LENDÁRIO',
    xpReward: 400,
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    borderLight: 'border-amber-500/50',
    bgLight: 'bg-amber-500/15',
    textColor: 'text-amber-500',
    condition: (p) => (p.totalXp || 0) >= 50000,
    getProgress: (p) => ({
      current: Math.min(50000, p.totalXp || 0),
      max: 50000,
      unit: 'XP'
    })
  },
  {
    id: 'apoiador_vip',
    title: 'Patriota Apoiador',
    description: 'Apoiou o projecto e tornou-se Candidato VIP.',
    emoji: '⭐',
    iconName: 'Star',
    category: 'especial',
    categoryLabel: 'Especial',
    rarity: 'LENDÁRIO',
    xpReward: 500,
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    borderLight: 'border-amber-400/50',
    bgLight: 'bg-amber-400/20',
    textColor: 'text-amber-400',
    condition: (p) => p.isVipSupporter === true,
    getProgress: (p) => ({
      current: p.isVipSupporter ? 1 : 0,
      max: 1,
      unit: 'Apoio VIP'
    })
  }
];

export function checkUnlockedBadges(profile: UserProfile): {
  unlockedBadgeIds: string[];
  unlockedBadgeDates: Record<string, string>;
  newlyUnlockedBadges: Badge[];
  totalBonusXp: number;
} {
  const currentUnlocked = new Set(profile.unlockedBadges || []);
  const dates = { ...(profile.unlockedBadgeDates || {}) };
  const newlyUnlockedBadges: Badge[] = [];
  let totalBonusXp = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  BADGES_LIST.forEach((badge) => {
    if (!currentUnlocked.has(badge.id)) {
      if (badge.condition(profile)) {
        currentUnlocked.add(badge.id);
        dates[badge.id] = todayStr;
        newlyUnlockedBadges.push(badge);
        totalBonusXp += badge.xpReward;
      }
    }
  });

  return {
    unlockedBadgeIds: Array.from(currentUnlocked),
    unlockedBadgeDates: dates,
    newlyUnlockedBadges,
    totalBonusXp
  };
}
