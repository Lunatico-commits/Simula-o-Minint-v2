import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MININTBranch } from '../types';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { LEAGUES_CONFIG, getTimeUntilWeeklyReset, DuelLeague } from '../utils/league';
import { RankChangeIndicator } from './RankingsView';
import { UserAvatar } from './UserAvatar';
import {
  Trophy,
  Swords,
  Flame,
  Clock,
  Zap,
  MapPin,
  Sparkles,
  Search,
  Crown,
  Medal,
  Shield,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';

interface DuelRankingsSectionProps {
  currentProfile: UserProfile;
  allUsers: UserProfile[];
  onPlayDuel?: () => void;
  onSelectCandidate: (candidate: UserProfile) => void;
}

export const DuelRankingsSection: React.FC<DuelRankingsSectionProps> = ({
  currentProfile,
  allUsers,
  onPlayDuel,
  onSelectCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilWeeklyReset());
  const [visibleLimit, setVisibleLimit] = useState<number>(10);
  const [userNode, setUserNode] = useState<HTMLElement | null>(null);
  const [isUserVisible, setIsUserVisible] = useState(false);

  // Intelligent Visibility: observe if the user's card/row is inside viewport
  useEffect(() => {
    if (!userNode) {
      setIsUserVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(userNode);
    return () => observer.disconnect();
  }, [userNode]);

  // Update countdown timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilWeeklyReset());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Deduplicate and sort all users by weeklyDuelPoints desc
  const sortedDuelLeaderboard = React.useMemo(() => {
    const map = new Map<string, UserProfile>();

    allUsers.forEach((u) => {
      if (u && u.uid) {
        map.set(u.uid, u);
      }
    });

    // Ensure current profile is up to date
    if (currentProfile && currentProfile.uid) {
      map.set(currentProfile.uid, currentProfile);
    }

    const list = Array.from(map.values());
    list.sort((a, b) => {
      const ptsA = a.weeklyDuelPoints ?? 0;
      const ptsB = b.weeklyDuelPoints ?? 0;
      if (ptsB !== ptsA) return ptsB - ptsA;

      const wonA = a.multiplayerDuelsWon ?? a.duelsWon ?? 0;
      const wonB = b.multiplayerDuelsWon ?? b.duelsWon ?? 0;
      if (wonB !== wonA) return wonB - wonA;

      return (b.totalXp ?? 0) - (a.totalXp ?? 0);
    });

    return list;
  }, [allUsers, currentProfile]);

  // Reset pagination limit on search
  useEffect(() => {
    setVisibleLimit(10);
  }, [searchQuery]);

  // Current user's global duel position
  const myDuelRankIndex = sortedDuelLeaderboard.findIndex(
    (u) =>
      u.uid === currentProfile.uid ||
      (u.id && currentProfile.id && u.id === currentProfile.id)
  );
  const myDuelRank = myDuelRankIndex >= 0 ? myDuelRankIndex + 1 : 1;
  const isMeInTop10 = myDuelRank <= 10;
  const isUserOutsideVisible = myDuelRank > visibleLimit;

  // Filter list by search query
  const filteredDuelLeaderboard = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedDuelLeaderboard;
    const q = searchQuery.toLowerCase();
    return sortedDuelLeaderboard.filter((c) => {
      const nameMatch = (c.displayName || '').toLowerCase().includes(q);
      const provMatch = (c.province || '').toLowerCase().includes(q);
      const branchMatch = (c.branch || '').toLowerCase().includes(q);
      return nameMatch || provMatch || branchMatch;
    });
  }, [sortedDuelLeaderboard, searchQuery]);

  // Calculate rank deltas map for duel rankings
  const duelRankDeltasMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    const storageKey = 'minint_duel_rank_history';
    let savedSnap: Record<string, number> = {};

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedSnap = JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }

    const currentSnap: Record<string, number> = {};

    filteredDuelLeaderboard.forEach((cand, idx) => {
      const currentRank = idx + 1;
      const uid = cand.uid || cand.displayName || `user_${idx}`;
      currentSnap[uid] = currentRank;

      if (cand.previousRank !== undefined && cand.previousRank !== null) {
        map[uid] = cand.previousRank - currentRank;
      } else if (savedSnap[uid] !== undefined) {
        map[uid] = savedSnap[uid] - currentRank;
      } else {
        if (cand.uid === currentProfile.uid) {
          map[uid] = 0;
        } else {
          const charSum = uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          map[uid] = (charSum % 5) - 2;
        }
      }
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(currentSnap));
    } catch (e) {}

    return map;
  }, [filteredDuelLeaderboard, currentProfile.uid]);

  const myDuelRankChange = myDuelRankIndex >= 0 ? (duelRankDeltasMap[currentProfile.uid] ?? 0) : 0;

  // Top 3 Podium
  const top1 = filteredDuelLeaderboard[0];
  const top2 = filteredDuelLeaderboard[1];
  const top3 = filteredDuelLeaderboard[2];

  // List from position 4 onwards according to visibleLimit
  const classificatoryList = filteredDuelLeaderboard.slice(3);
  const visibleClassificatory = filteredDuelLeaderboard.slice(3, visibleLimit);
  const hasMore = visibleLimit < filteredDuelLeaderboard.length;
  const totalVisibleCount = Math.min(visibleLimit, filteredDuelLeaderboard.length);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. HERO BANNER: WEEKLY RESET & SPOTLIGHT */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 p-5 text-slate-100 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wide uppercase shadow-xs">
              <Flame size={14} className="fill-amber-400 animate-pulse text-amber-400" />
              <span>Ranking Global de Duelos • Top 10 Semanal</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
              Elite dos Duelos MININT
            </h3>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Dispute partidas multiplayer, acumule <span className="text-amber-400 font-bold">Pontos de Duelo Semanais (weeklyDuelPoints)</span> e conquiste seu lugar no Top 10 de Angola!
            </p>
          </div>

          {/* Weekly Countdown Card */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 shrink-0 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={20} className="animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">
                Reinício Semanal em
              </span>
              <span className="font-mono text-sm font-black text-amber-400 flex items-center gap-1">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Quick Duel Stats Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-amber-500/20 text-center">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Sua Posição</span>
            <span className="text-xs font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              #{myDuelRank} {isMeInTop10 && <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-black">TOP 10</span>}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Seus Pontos</span>
            <span className="text-xs font-black text-amber-300 font-mono flex items-center justify-center gap-1">
              <Flame size={12} className="text-amber-400 fill-amber-400" />
              {currentProfile.weeklyDuelPoints || 0} Pts
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Total de Duelos</span>
            <span className="text-xs font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
              <Swords size={12} />
              {currentProfile.multiplayerDuelsWon ?? currentProfile.duelsWon ?? 0} Vencidos
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          placeholder="Pesquisar combatente por nome, província ou ramo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
        />
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* 3. PODIUM TOP 3 COMBATENTES (DUEL CHAMPIONS) */}
      <div className="bg-slate-950/80 dark:bg-[#0A0C0E] border border-amber-500/30 rounded-3xl p-2.5 sm:p-4 shadow-xl space-y-3 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 tracking-wider px-1">
          <span className="flex items-center gap-1">
            <Crown size={12} className="text-amber-400 fill-amber-400" />
            Pódio dos Campeões • Top 3 da Semana
          </span>
          <span className="text-slate-400 font-mono">
            Duelos Semanais
          </span>
        </div>

        <div className="w-full max-w-full overflow-hidden px-1">
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-full px-1 items-end my-4">
            {/* 2º LUGAR */}
            {top2 ? (() => {
              const isMe = Boolean(
                (top2.uid && currentProfile.uid && top2.uid === currentProfile.uid) ||
                (top2.id && currentProfile.id && top2.id === currentProfile.id) ||
                (top2.uid && currentProfile.id && top2.uid === currentProfile.id) ||
                (top2.id && currentProfile.uid && top2.id === currentProfile.uid)
              );

              return (
                <motion.div
                  ref={isMe ? setUserNode : undefined}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onSelectCandidate?.(top2)}
                  className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[140px] bg-slate-800/80 border border-slate-700 cursor-pointer transition-all ${
                    isMe
                      ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">🥈 #2</span>
                  <div className="my-1 shrink-0 flex items-center justify-center">
                    <UserAvatar user={top2} size="md" showBranchBadge={true} />
                  </div>

                  <p className={`w-full truncate whitespace-nowrap text-[10px] font-bold text-center ${isMe ? 'text-amber-300' : 'text-white'}`}>
                    {top2.displayName || 'Candidato'}
                  </p>

                  {isMe && (
                    <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                      VOCÊ
                    </span>
                  )}

                  <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-400 text-center mt-0.5">
                    📍 {top2.province || 'Luanda'} • {top2.multiplayerDuelsWon ?? top2.duelsWon ?? 0} Vits
                  </p>
                  <p className="w-full truncate whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-amber-400 text-center font-mono mt-0.5">
                    {top2.weeklyDuelPoints || 0} Pts
                  </p>
                </motion.div>
              );
            })() : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[140px] bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 w-full min-w-0"
              >
                2.º Lugar
              </motion.div>
            )}

            {/* 1º LUGAR */}
            {top1 ? (() => {
              const isMe = Boolean(
                (top1.uid && currentProfile.uid && top1.uid === currentProfile.uid) ||
                (top1.id && currentProfile.id && top1.id === currentProfile.id) ||
                (top1.uid && currentProfile.id && top1.uid === currentProfile.id) ||
                (top1.id && currentProfile.uid && top1.id === currentProfile.uid)
              );

              return (
                <motion.div
                  ref={isMe ? setUserNode : undefined}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onSelectCandidate?.(top1)}
                  className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[160px] bg-slate-800/90 border border-amber-500/50 -translate-y-2 cursor-pointer transition-all ${
                    isMe
                      ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                      : 'hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  <span className="text-[11px] font-black text-amber-400 whitespace-nowrap">👑 #1</span>
                  <div className="my-1 shrink-0 flex items-center justify-center">
                    <UserAvatar user={top1} size="lg" showBranchBadge={true} isFirstPlace={true} />
                  </div>

                  <p className="w-full truncate whitespace-nowrap text-[11px] font-bold text-center text-amber-300">
                    {top1.displayName || 'Candidato'}
                  </p>

                  {isMe && (
                    <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                      VOCÊ
                    </span>
                  )}

                  <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-300 text-center mt-0.5">
                    📍 {top1.province || 'Luanda'} • {top1.multiplayerDuelsWon ?? top1.duelsWon ?? 0} Vits
                  </p>
                  <p className="w-full truncate whitespace-nowrap text-[10px] sm:text-[11px] font-bold text-amber-400 text-center font-mono mt-0.5">
                    {top1.weeklyDuelPoints || 0} Pts
                  </p>
                </motion.div>
              );
            })() : (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[160px] bg-slate-800/90 rounded-2xl border border-amber-500/50 -translate-y-2 flex items-center justify-center text-[10px] text-slate-500 w-full min-w-0"
              >
                1.º Lugar
              </motion.div>
            )}

            {/* 3º LUGAR */}
            {top3 ? (() => {
              const isMe = Boolean(
                (top3.uid && currentProfile.uid && top3.uid === currentProfile.uid) ||
                (top3.id && currentProfile.id && top3.id === currentProfile.id) ||
                (top3.uid && currentProfile.id && top3.uid === currentProfile.id) ||
                (top3.id && currentProfile.uid && top3.id === currentProfile.uid)
              );

              return (
                <motion.div
                  ref={isMe ? setUserNode : undefined}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onSelectCandidate?.(top3)}
                  className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[125px] bg-slate-800/70 border border-slate-700/80 cursor-pointer transition-all ${
                    isMe
                      ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-amber-600 whitespace-nowrap">🥉 #3</span>
                  <div className="my-1 shrink-0 flex items-center justify-center">
                    <UserAvatar user={top3} size="md" showBranchBadge={true} />
                  </div>

                  <p className={`w-full truncate whitespace-nowrap text-[10px] font-bold text-center ${isMe ? 'text-amber-300' : 'text-white'}`}>
                    {top3.displayName || 'Candidato'}
                  </p>

                  {isMe && (
                    <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                      VOCÊ
                    </span>
                  )}

                  <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-400 text-center mt-0.5">
                    📍 {top3.province || 'Luanda'} • {top3.multiplayerDuelsWon ?? top3.duelsWon ?? 0} Vits
                  </p>
                  <p className="w-full truncate whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-amber-400 text-center font-mono mt-0.5">
                    {top3.weeklyDuelPoints || 0} Pts
                  </p>
                </motion.div>
              );
            })() : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[125px] bg-slate-800/70 rounded-2xl border border-slate-700/80 flex items-center justify-center text-[10px] text-slate-500 w-full min-w-0"
              >
                3.º Lugar
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 4. LISTA DE CLASSIFICAÇÃO DOS DEMAIS COMBATENTES (#4+) COM CARREGAMENTO PROGRESSIVO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Medal size={15} className="text-amber-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Classificação dos Combatentes (#4+)
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold font-mono">
            {classificatoryList.length} Combatentes
          </span>
        </div>

        {filteredDuelLeaderboard.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            Nenhum combatente encontrado para esta pesquisa.
          </div>
        ) : visibleClassificatory.length === 0 && classificatoryList.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center text-xs text-slate-500">
            Todos os combatentes desta lista estão no Pódio (Top 3).
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleClassificatory.map((candidate, idx) => {
                const rankPos = idx + 4;
                const isMe = Boolean(
                  (candidate.uid && currentProfile.uid && candidate.uid === currentProfile.uid) ||
                  (candidate.id && currentProfile.id && candidate.id === currentProfile.id) ||
                  (candidate.uid && currentProfile.id && candidate.uid === currentProfile.id) ||
                  (candidate.id && currentProfile.uid && candidate.id === currentProfile.uid)
                );
                const isTop10 = rankPos <= 10;
                const bInfo = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
                const avatar = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
                const leagueInfo = LEAGUES_CONFIG[candidate.duelLeague || 'bronze'] || LEAGUES_CONFIG.bronze;

                return (
                  <motion.div
                    layout
                    key={candidate.uid || idx}
                    ref={isMe ? setUserNode : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={() => onSelectCandidate(candidate)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
                      isMe
                        ? 'border-amber-400 bg-amber-500/20 dark:bg-amber-500/20 shadow-[0_0_26px_rgba(245,158,11,0.55)] ring-2 ring-amber-400 dark:ring-amber-400 ring-offset-2 ring-offset-slate-900 dark:ring-offset-slate-950 hover:bg-amber-500/30'
                        : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F1115] hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Subtle pulsing glow ring & ambient aura for current logged-in user */}
                    {isMe && (
                      <>
                        <motion.div
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(245, 158, 11, 0.45)',
                              '0 0 0 5px rgba(245, 158, 11, 0.15)',
                              '0 0 0 0 rgba(245, 158, 11, 0.45)',
                            ],
                            opacity: [0.75, 1, 0.75],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 rounded-2xl pointer-events-none border border-amber-400/80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 animate-pulse pointer-events-none rounded-2xl" />
                      </>
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                      {/* Rank badge with indicator */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-8">
                        <div className="flex items-center gap-0.5">
                          <span className={`text-xs font-black font-mono ${isTop10 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            #{rankPos}
                          </span>
                          <RankChangeIndicator change={duelRankDeltasMap[candidate.uid || candidate.displayName || `cand_${idx}`] ?? 0} compact />
                        </div>
                        {isTop10 && (
                          <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                            TOP 10
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="shrink-0 flex items-center justify-center">
                        <UserAvatar user={candidate} size="sm" showBranchBadge={true} />
                      </div>

                      {/* Candidate info */}
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`text-xs font-bold truncate ${
                              isMe ? 'text-amber-300 font-extrabold' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {candidate.displayName}
                          </p>
                          {candidate.isVipSupporter && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 font-black shrink-0 flex items-center gap-0.5">
                              <Sparkles size={9} className="fill-amber-500" />
                              <span>VIP</span>
                            </span>
                          )}
                          {isMe && (
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black shrink-0 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-300 flex items-center gap-0.5">
                              <Sparkles size={9} className="fill-slate-950 text-slate-950" />
                              <span>VOCÊ</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-400/90 font-medium flex items-center gap-0.5">
                            <MapPin size={9} />
                            {candidate.province || 'Luanda'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-400 flex items-center gap-0.5">
                            <span>{leagueInfo.badge}</span>
                            <span>{leagueInfo.name}</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                            <Swords size={10} />
                            {candidate.multiplayerDuelsWon ?? candidate.duelsWon ?? 0}V
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly duel points */}
                    <div className="text-right shrink-0 relative z-10">
                      <div className="text-xs font-black text-amber-500 dark:text-amber-400 font-mono flex items-center justify-end gap-1">
                        <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                        <span>{candidate.weeklyDuelPoints || 0} Pts</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        {candidate.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Botão "Ver mais (+10 combatentes)" */}
            {hasMore ? (
              <div className="pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 10)}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#0F1115] border border-amber-500/30 hover:border-amber-400 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
                >
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5 text-amber-500" />
                  <span>Ver mais (+10 combatentes)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    A exibir {totalVisibleCount} de {filteredDuelLeaderboard.length}
                  </span>
                </button>
              </div>
            ) : filteredDuelLeaderboard.length > 10 ? (
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Todos os {filteredDuelLeaderboard.length} combatentes carregados
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 5. CURRENT USER STICKY FOOTER BAR (COM VISIBILIDADE INTELIGENTE) */}
      <AnimatePresence>
        {!isUserVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="sticky bottom-2 z-30 pt-2"
          >
            <div className="bg-slate-950/95 backdrop-blur-md border-2 border-amber-500 rounded-2xl p-3 shadow-[0_4px_25px_rgba(245,158,11,0.35)] flex items-center justify-between text-slate-100 transition-all">
              <div
                onClick={() => onSelectCandidate(currentProfile)}
                className="flex items-center gap-3 min-w-0 cursor-pointer"
              >
                <div className="shrink-0 flex items-center justify-center">
                  <UserAvatar user={currentProfile} size="sm" showBranchBadge={true} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-tight">
                      POSIÇÃO DUELO (TOP 10 SEMANAL):
                    </p>
                    <span className="text-xs font-mono font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded border border-amber-500 shadow-sm flex items-center gap-1">
                      #{myDuelRank}
                      {isMeInTop10 && <span className="text-[9px] font-black">🔥 TOP 10</span>}
                    </span>
                    <RankChangeIndicator change={myDuelRankChange} />
                    {isUserOutsideVisible && (
                      <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Fora do Top {visibleLimit}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5 flex items-center gap-1">
                    <span>{currentProfile.displayName}</span>
                    {currentProfile.isVipSupporter && (
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-0.5 shrink-0">
                        <Sparkles size={8} />
                        <span>VIP 🌟</span>
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-amber-300 font-semibold flex items-center gap-0.5">
                      <Flame size={10} className="fill-amber-400 text-amber-400" />
                      {currentProfile.weeklyDuelPoints || 0} Pts Semanais
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onPlayDuel && (
                  <button
                    type="button"
                    onClick={onPlayDuel}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Swords size={14} />
                    <span>Jogar Duelo</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
