import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AcademicLevel, MININTBranch, QuestionCategory } from '../types';
import { MININT_BRANCHES, getAvatarOption, PROVINCES_ANGOLA, normalizeProvinceName } from '../data/branches';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Search, Zap, MapPin, UserCheck, Swords, GraduationCap, Award, Shield, Sparkles, Globe, ChevronDown, CheckCircle2, X, Flame, ArrowUp, ArrowDown, Minus, Users, UserPlus, UserMinus, Copy, Check, HeartHandshake } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { DuelLeagueView } from './DuelLeagueView';
import { DuelRankingsSection } from './DuelRankingsSection';
import { sendNewFollowerNotification } from '../utils/notifications';

export interface RankingsViewProps {
  currentProfile: UserProfile;
  onPlayDuel?: (challengerCandidate?: UserProfile) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  defaultMode?: 'xp' | 'duels' | 'ligas';
}

// Indicator of rank position variation compared to previous calculation
export interface RankChangeIndicatorProps {
  change: number; // >0: climbed (+N), <0: dropped (-N), 0: maintained
  compact?: boolean;
  showValue?: boolean;
  showTextLabel?: boolean;
  className?: string;
}

export const RankChangeIndicator: React.FC<RankChangeIndicatorProps> = ({
  change,
  compact = false,
  showValue = true,
  showTextLabel = false,
  className = '',
}) => {
  if (change > 0) {
    return (
      <span
        title={`Subiu ${change} ${change === 1 ? 'posição' : 'posições'} em relação ao cálculo anterior`}
        className={`inline-flex items-center gap-0.5 font-mono font-black text-emerald-500 dark:text-emerald-400 shrink-0 ${
          compact
            ? 'text-[8px] px-1 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30'
            : 'text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 shadow-xs'
        } ${className}`}
      >
        <ArrowUp size={compact ? 8 : 10} className="stroke-[3] text-emerald-500 animate-pulse shrink-0" />
        {showValue && <span>+{change}</span>}
        {showTextLabel && <span className="ml-0.5 text-[8px] font-sans font-bold uppercase">Subiu</span>}
      </span>
    );
  }

  if (change < 0) {
    const absChange = Math.abs(change);
    return (
      <span
        title={`Desceu ${absChange} ${absChange === 1 ? 'posição' : 'posições'} em relação ao cálculo anterior`}
        className={`inline-flex items-center gap-0.5 font-mono font-black text-rose-500 dark:text-rose-400 shrink-0 ${
          compact
            ? 'text-[8px] px-1 py-0.2 rounded bg-rose-500/15 border border-rose-500/30'
            : 'text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 shadow-xs'
        } ${className}`}
      >
        <ArrowDown size={compact ? 8 : 10} className="stroke-[3] text-rose-500 shrink-0" />
        {showValue && <span>-{absChange}</span>}
        {showTextLabel && <span className="ml-0.5 text-[8px] font-sans font-bold uppercase">Desceu</span>}
      </span>
    );
  }

  // Neutral (change === 0)
  return (
    <span
      title="Manteve a mesma posição no ranking"
      className={`inline-flex items-center gap-0.5 font-mono font-black text-slate-400 dark:text-slate-500 shrink-0 ${
        compact
          ? 'text-[8px] px-1 py-0.2 rounded bg-slate-500/10 border border-slate-500/20'
          : 'text-[9px] px-1.5 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20'
      } ${className}`}
    >
      <Minus size={compact ? 8 : 10} className="stroke-[3] text-slate-400 shrink-0" />
      {showTextLabel && <span className="ml-0.5 text-[8px] font-sans font-bold uppercase">Manteve</span>}
    </span>
  );
};

// Academic level helper
export const getAcademicLevelLabel = (level?: AcademicLevel): string => {
  switch (level) {
    case '9th_grade':
      return '9.ª Classe';
    case 'high_school':
      return 'Ensino Médio';
    case 'higher_education':
      return 'Ensino Superior';
    default:
      return 'Ensino Médio';
  }
};

// Category stats helper for mock candidates
const defaultStats: Record<QuestionCategory, { correct: number; total: number }> = {
  informatica_basica: { correct: 25, total: 30 },
  legislacao_minint: { correct: 30, total: 40 },
  direito_constituicao: { correct: 20, total: 25 },
  historia_cultura_geral: { correct: 20, total: 25 },
  portugues_raciocinio: { correct: 30, total: 40 },
  lingua_portuguesa: { correct: 20, total: 25 },
  cultura_geral: { correct: 20, total: 25 },
  direito_penal: { correct: 20, total: 25 },
  raciocinio_logico: { correct: 15, total: 20 },
};

const buildStats = (overrides?: Partial<Record<QuestionCategory, { correct: number; total: number }>>): Record<QuestionCategory, { correct: number; total: number }> => ({
  ...defaultStats,
  ...(overrides || {}),
});

// Seed candidates for leaderboard (starts clean for production)
const MOCK_LEADERBOARD_SEED: UserProfile[] = [];

export const RankingsView: React.FC<RankingsViewProps> = ({ currentProfile, onPlayDuel, onUpdateProfile, defaultMode = 'xp' }) => {
  const [activeMode, setActiveMode] = useState<'xp' | 'duels' | 'ligas'>(defaultMode);
  const [scopeFilter, setScopeFilter] = useState<'national' | 'friends' | 'province'>('national');
  const [selectedProvince, setSelectedProvince] = useState<string>(
    currentProfile.province || 'Luanda'
  );
  const [levelFilter, setLevelFilter] = useState<'all' | AcademicLevel>('all');
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(10);
  const [userNode, setUserNode] = useState<HTMLElement | null>(null);
  const [isUserVisible, setIsUserVisible] = useState(false);
  const [copiedCodeCandidateId, setCopiedCodeCandidateId] = useState<string | null>(null);

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

  // Reset visible limit to 10 on filter change
  useEffect(() => {
    setVisibleLimit(10);
  }, [scopeFilter, selectedProvince, levelFilter, searchQuery]);

  // Keep selected province in sync if user changes profile province and scope is province
  useEffect(() => {
    if (currentProfile.province && !selectedProvince) {
      setSelectedProvince(currentProfile.province);
    }
  }, [currentProfile.province]);

  useEffect(() => {
    // Fetch live users from Firestore
    const q = query(
      collection(db, 'users'),
      limit(150)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          ...(data as UserProfile),
          uid: data.uid || docSnap.id,
          avatarAccessories: data.avatarAccessories || {
            frame: data.equippedFrame || 'frame_none',
            background: data.equippedBackground || 'bg_default',
            badge: 'badge_none',
          },
          equippedFrame: data.equippedFrame || data.avatarAccessories?.frame,
          equippedBackground: data.equippedBackground || data.avatarAccessories?.background,
          equippedUniform: data.equippedUniform,
        });
      });

      // Strict Map deduplication by uid
      const uniqueMap = new Map<string, UserProfile>();

      users.forEach((u) => {
        if (u && u.uid) {
          uniqueMap.set(u.uid, u);
        }
      });

      // Ensure current profile is present and updated
      if (currentProfile && currentProfile.uid) {
        uniqueMap.set(currentProfile.uid, currentProfile);
      }

      // Add seed candidates if missing
      MOCK_LEADERBOARD_SEED.forEach(seed => {
        if (seed && seed.uid && !uniqueMap.has(seed.uid)) {
          uniqueMap.set(seed.uid, seed);
        }
      });

      const combined = Array.from(uniqueMap.values());
      combined.sort((a, b) => (b.totalXp ?? 0) - (a.totalXp ?? 0));
      setLeaderboard(combined);
    }, (error) => {
      console.error('Erro ao buscar ranking:', error);
      const uniqueMap = new Map<string, UserProfile>();
      if (currentProfile && currentProfile.uid) {
        uniqueMap.set(currentProfile.uid, currentProfile);
      }
      MOCK_LEADERBOARD_SEED.forEach(seed => {
        if (seed && seed.uid && !uniqueMap.has(seed.uid)) {
          uniqueMap.set(seed.uid, seed);
        }
      });
      const combined = Array.from(uniqueMap.values());
      combined.sort((a, b) => (b.totalXp ?? 0) - (a.totalXp ?? 0));
      setLeaderboard(combined);
    });

    return () => unsubscribe();
  }, [currentProfile]);

  // User's Registered Province
  const userProvince = currentProfile.province || 'Luanda';
  const normUserProvince = normalizeProvinceName(userProvince);
  const normSelectedProvince = normalizeProvinceName(selectedProvince);

  // Global position of current user (1-indexed)
  const myGlobalRankIndex = leaderboard.findIndex(u => u.uid === currentProfile.uid);
  const myGlobalRank = myGlobalRankIndex !== -1 ? myGlobalRankIndex + 1 : 1;

  // Rank position within user's home province
  const userHomeProvinceList = leaderboard.filter(
    u => normalizeProvinceName(u.province) === normUserProvince
  );
  const myHomeProvinceRankIndex = userHomeProvinceList.findIndex(u => u.uid === currentProfile.uid);
  const myHomeProvinceRank = myHomeProvinceRankIndex !== -1 ? myHomeProvinceRankIndex + 1 : 1;

  // Following List array & counts with reactive optimistic state
  const [optimisticFollowing, setOptimisticFollowing] = useState<string[]>(() => currentProfile.following || []);

  useEffect(() => {
    if (currentProfile.following) {
      setOptimisticFollowing(currentProfile.following);
    }
  }, [currentProfile.following]);

  const followingList = optimisticFollowing;
  const followedCandidatesCount = followingList.length;

  const handleToggleFollow = (candidate: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const candUid = candidate.uid || (candidate as any).id;
    const myUid = currentProfile.uid || (currentProfile as any).id;
    if (!candUid || candUid === myUid) return;

    const isFollowing = optimisticFollowing.includes(candUid);
    const updatedFollowing = isFollowing
      ? optimisticFollowing.filter(id => id !== candUid)
      : [...optimisticFollowing, candUid];

    // Synchronous immediate local update for instant button & counter reaction
    setOptimisticFollowing(updatedFollowing);

    if (onUpdateProfile) {
      onUpdateProfile({ following: updatedFollowing });
    }

    // Send notification if now following
    if (!isFollowing) {
      sendNewFollowerNotification(currentProfile, candUid);
    }
  };

  // Filtered leaderboard by Scope (National vs Friends vs Province), Academic level, and Search query
  const filteredList = leaderboard.filter(candidate => {
    const isMe = Boolean(
      (candidate.uid && currentProfile.uid && candidate.uid === currentProfile.uid) ||
      (candidate.id && currentProfile.id && candidate.id === currentProfile.id) ||
      (candidate.uid && currentProfile.id && candidate.uid === currentProfile.id) ||
      (candidate.id && currentProfile.uid && candidate.id === currentProfile.uid)
    );
    const isFriend = Boolean(candidate.uid && followingList.includes(candidate.uid));

    // Friends scope filter
    if (scopeFilter === 'friends') {
      if (!isFriend && !isMe) return false;
    }

    // Province scope filter
    if (scopeFilter === 'province') {
      const candNormProv = normalizeProvinceName(candidate.province);
      if (candNormProv !== normSelectedProvince) return false;
    }

    // Academic level filter
    if (levelFilter !== 'all') {
      const candLevel = candidate.academicLevel || 'high_school';
      if (candLevel !== levelFilter) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      const matchName = (candidate.displayName || '').toLowerCase().includes(queryLower);
      const matchProv = (candidate.province || '').toLowerCase().includes(queryLower);
      const matchBranch = (candidate.branch || '').toLowerCase().includes(queryLower);
      const matchCode = (candidate.referralCode || '').toLowerCase().includes(queryLower);
      if (!matchName && !matchProv && !matchBranch && !matchCode) return false;
    }

    return true;
  });

  // Rank position of user in current active view list
  const myActiveScopeRankIndex = filteredList.findIndex(u => u.uid === currentProfile.uid);
  const myActiveScopeRank = myActiveScopeRankIndex !== -1 ? myActiveScopeRankIndex + 1 : null;

  // Scope key for persisting rank snapshots
  const scopeKey = `${scopeFilter}_${selectedProvince}_${levelFilter}`;

  // Calculate rank changes for candidates based on previous calculation / stored snapshot
  const rankDeltasMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    const storageKey = `minint_rank_history_${scopeKey}`;
    let savedSnap: Record<string, number> = {};

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        savedSnap = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading rank snapshot:', e);
    }

    const currentSnap: Record<string, number> = {};

    filteredList.forEach((cand, idx) => {
      const currentRank = idx + 1;
      const uid = cand.uid || cand.displayName || `user_${idx}`;
      currentSnap[uid] = currentRank;

      if (cand.previousRank !== undefined && cand.previousRank !== null) {
        // Explicit previousRank from profile
        map[uid] = cand.previousRank - currentRank;
      } else if (savedSnap[uid] !== undefined) {
        // Previous rank was stored in snapshot
        map[uid] = savedSnap[uid] - currentRank;
      } else {
        // Stable initial deterministic seed
        if (cand.uid === currentProfile.uid) {
          map[uid] = 0;
        } else {
          const charSum = uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const pseudoDelta = (charSum % 5) - 2; // -2, -1, 0, 1, 2
          map[uid] = pseudoDelta;
        }
      }
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(currentSnap));
    } catch (e) {
      // Ignore quota errors
    }

    return map;
  }, [filteredList, scopeKey, currentProfile.uid]);

  const myActiveRankChange = myActiveScopeRank ? (rankDeltasMap[currentProfile.uid] ?? 0) : 0;

  // Top 3 Podium Candidates (from filtered list)
  const top1 = filteredList[0];
  const top2 = filteredList[1];
  const top3 = filteredList[2];

  // Candidates for classification list (4th place onwards)
  const classificatoryList = filteredList.slice(3);

  // Progressive list limit: since Top 1-3 are on the podium, visibleLimit (e.g. 10) leaves (visibleLimit - 3) in the list
  const visibleClassificatoryLimit = Math.max(0, visibleLimit - 3);
  const visibleClassificatoryList = classificatoryList.slice(0, visibleClassificatoryLimit);

  // Pagination indicators
  const totalVisibleCount = Math.min(visibleLimit, filteredList.length);
  const hasMore = visibleLimit < filteredList.length;
  const isUserOutsideVisible = Boolean(myActiveScopeRank && myActiveScopeRank > visibleLimit);

  // Count candidates per province for badge counters
  const provinceCountsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    leaderboard.forEach(u => {
      const norm = normalizeProvinceName(u.province);
      if (norm) {
        map[norm] = (map[norm] || 0) + 1;
      }
    });
    return map;
  }, [leaderboard]);

  return (
    <div className="max-w-[850px] mx-auto px-4 py-4 text-slate-900 dark:text-slate-100 space-y-4 animate-fadeIn pb-24">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#16181D] dark:to-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-center shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy size={22} />
        </div>
        <h2 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
          Classificação & Ligas de Duelo MININT
        </h2>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
          Concurso Público MININT Angola • Ranking de Experiência e Ligas Semanais
        </p>

        {/* TOP LEVEL MODE SWITCHER: XP RANKING VS TOP 10 DUELS VS DUEL LEAGUES */}
        <div className="grid grid-cols-3 gap-1.5 mt-3.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl max-w-lg mx-auto text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveMode('xp')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'xp'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Trophy size={13} />
            <span className="truncate">Geral (XP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('duels')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeMode === 'duels'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame size={13} className={activeMode === 'duels' ? 'text-slate-950 fill-slate-950' : 'text-amber-500 fill-amber-500'} />
            <span className="truncate">Top 10 Duelos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('ligas')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeMode === 'ligas'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords size={13} />
            <span className="truncate">Ligas 🥉🥈🥇</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW BASED ON ACTIVE MODE */}
      {activeMode === 'ligas' ? (
        <DuelLeagueView currentProfile={currentProfile} onPlayDuel={onPlayDuel || (() => {})} />
      ) : activeMode === 'duels' ? (
        <DuelRankingsSection
          currentProfile={currentProfile}
          allUsers={leaderboard}
          onPlayDuel={onPlayDuel}
          onSelectCandidate={setSelectedCandidate}
        />
      ) : (
        <>
      {/* 1. SCOPE FILTER (NATIONAL VS FRIENDS VS PROVINCE TABS) */}
      <div className="bg-slate-950/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setScopeFilter('national')}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              scopeFilter === 'national'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe size={14} className="shrink-0" />
            <span className="truncate">Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeFilter('friends')}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              scopeFilter === 'friends'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users size={14} className="shrink-0" />
            <span className="truncate">Amigos</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black ${
              scopeFilter === 'friends'
                ? 'bg-slate-950 text-amber-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {followedCandidatesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScopeFilter('province');
              if (!selectedProvince) {
                setSelectedProvince(userProvince);
              }
            }}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              scopeFilter === 'province'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">Província</span>
          </button>
        </div>

        {/* 2. PROVINCE SELECTOR DROPDOWN (Shown when province mode is active or to switch province) */}
        {scopeFilter === 'province' && (
          <div className="pt-1.5 border-t border-slate-800 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1 text-amber-400">
                <MapPin size={13} />
                Selecionar Província de Angola ({PROVINCES_ANGOLA.length})
              </span>
              <button
                type="button"
                onClick={() => setSelectedProvince(userProvince)}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>📍 Minha ({userProvince})</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-amber-400 cursor-pointer pr-8 shadow-sm"
              >
                {PROVINCES_ANGOLA.map((prov) => {
                  const count = provinceCountsMap[normalizeProvinceName(prov)] || 0;
                  const isUserHome = normalizeProvinceName(prov) === normUserProvince;
                  return (
                    <option key={prov} value={prov} className="bg-slate-900 text-slate-100 py-1">
                      {prov} {isUserHome ? '(Sua Província ⭐)' : ''} ({count} candid.{count === 1 ? 'o' : 'os'})
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-amber-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 3. ACADEMIC LEVEL FILTERS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <GraduationCap size={13} className="text-amber-500" />
            Nível Académico
          </span>
          <span className="font-mono text-amber-500 text-[10px] font-extrabold">{filteredList.length} Candidatos</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Geral' },
            { id: '9th_grade', label: '9.ª Classe' },
            { id: 'high_school', label: 'Médio' },
            { id: 'higher_education', label: 'Superior' },
          ].map((tab) => {
            const isActive = levelFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLevelFilter(tab.id as any)}
                className={`py-2 px-1 rounded-xl font-extrabold text-[11px] text-center transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-[#0F1115] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            scopeFilter === 'province'
              ? `Pesquisar candidatos em ${selectedProvince}...`
              : 'Pesquisar candidato por nome ou província...'
          }
          className="w-full bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium shadow-sm"
        />
        <Search size={15} className="absolute left-3 top-3 text-slate-400" />
      </div>

      {/* PODIUM (TOP 3 CANDIDATES) */}
      {filteredList.length > 0 && (
        <div className="bg-slate-950/80 dark:bg-[#0A0C0E] border border-amber-500/30 rounded-3xl p-2.5 sm:p-4 shadow-xl space-y-3 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 tracking-wider px-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} />
              Pódio dos Melhores Colocados (Top 3)
            </span>
            <span className="text-slate-400 font-mono">
              {scopeFilter === 'province' ? selectedProvince : 'Nacional'}
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
                const isFollowing = Boolean(top2.uid && followingList.includes(top2.uid));

                return (
                  <motion.div
                    ref={isMe ? setUserNode : undefined}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedCandidate(top2)}
                    className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[145px] bg-slate-800/80 border border-slate-700 cursor-pointer transition-all ${
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

                    {isMe ? (
                      <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                        VOCÊ
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(top2, e)}
                          title={isFollowing ? "Clique para desseguir" : "Clique para seguir"}
                          className={`group text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-all cursor-pointer ${
                            isFollowing
                              ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/30 hover:border-rose-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check size={9} className="group-hover:hidden stroke-[2.5]" />
                              <UserMinus size={9} className="hidden group-hover:inline" />
                              <span className="group-hover:hidden">✓ Seguindo</span>
                              <span className="hidden group-hover:inline">Desseguir</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={9} />
                              <span>+ Seguir</span>
                            </>
                          )}
                        </button>
                        {isFollowing && onPlayDuel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayDuel(top2);
                            }}
                            title="Desafiar para Duelo 1v1"
                            className="p-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                          >
                            <Swords size={10} />
                          </button>
                        )}
                      </div>
                    )}

                    <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-400 text-center mt-0.5">
                      📍 {top2.province || 'Luanda'} • {top2.branch}
                    </p>
                    <p className="w-full truncate whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-amber-400 text-center font-mono mt-0.5">
                      {top2.totalXp?.toLocaleString() ?? 0} XP
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
                const isFollowing = Boolean(top1.uid && followingList.includes(top1.uid));

                return (
                  <motion.div
                    ref={isMe ? setUserNode : undefined}
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedCandidate(top1)}
                    className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[165px] bg-slate-800/90 border border-amber-500/50 -translate-y-2 cursor-pointer transition-all ${
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

                    {isMe ? (
                      <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                        VOCÊ
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(top1, e)}
                          title={isFollowing ? "Clique para desseguir" : "Clique para seguir"}
                          className={`group text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-all cursor-pointer ${
                            isFollowing
                              ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/30 hover:border-rose-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check size={9} className="group-hover:hidden stroke-[2.5]" />
                              <UserMinus size={9} className="hidden group-hover:inline" />
                              <span className="group-hover:hidden">✓ Seguindo</span>
                              <span className="hidden group-hover:inline">Desseguir</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={9} />
                              <span>+ Seguir</span>
                            </>
                          )}
                        </button>
                        {isFollowing && onPlayDuel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayDuel(top1);
                            }}
                            title="Desafiar para Duelo 1v1"
                            className="p-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                          >
                            <Swords size={10} />
                          </button>
                        )}
                      </div>
                    )}

                    <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-300 text-center mt-0.5">
                      📍 {top1.province || 'Luanda'} • {top1.branch}
                    </p>
                    <p className="w-full truncate whitespace-nowrap text-[10px] sm:text-[11px] font-bold text-amber-400 text-center font-mono mt-0.5">
                      {top1.totalXp?.toLocaleString() ?? 0} XP
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
                const isFollowing = Boolean(top3.uid && followingList.includes(top3.uid));

                return (
                  <motion.div
                    ref={isMe ? setUserNode : undefined}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedCandidate(top3)}
                    className={`w-full min-w-0 p-1.5 rounded-2xl flex flex-col items-center justify-between min-h-[140px] bg-slate-800/70 border border-slate-700/80 cursor-pointer transition-all ${
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

                    {isMe ? (
                      <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase mt-0.5 animate-pulse shadow-sm whitespace-nowrap">
                        VOCÊ
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(top3, e)}
                          title={isFollowing ? "Clique para desseguir" : "Clique para seguir"}
                          className={`group text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-all cursor-pointer ${
                            isFollowing
                              ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/30 hover:border-rose-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check size={9} className="group-hover:hidden stroke-[2.5]" />
                              <UserMinus size={9} className="hidden group-hover:inline" />
                              <span className="group-hover:hidden">✓ Seguindo</span>
                              <span className="hidden group-hover:inline">Desseguir</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={9} />
                              <span>+ Seguir</span>
                            </>
                          )}
                        </button>
                        {isFollowing && onPlayDuel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayDuel(top3);
                            }}
                            title="Desafiar para Duelo 1v1"
                            className="p-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                          >
                            <Swords size={10} />
                          </button>
                        )}
                      </div>
                    )}

                    <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-400 text-center mt-0.5">
                      📍 {top3.province || 'Luanda'} • {top3.branch}
                    </p>
                    <p className="w-full truncate whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-amber-400 text-center font-mono mt-0.5">
                      {top3.totalXp?.toLocaleString() ?? 0} XP
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
      )}

      {/* LISTA CLASSIFICATÓRIA (4.º LUGAR EM DIANTE) */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between px-1 pt-1 flex-wrap gap-1">
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-amber-500" />
            Classificação {scopeFilter === 'province' ? `(${selectedProvince})` : '(Nacional)'}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Subiu
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Desceu
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> Neutro
            </span>
          </div>
        </h3>

        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center space-y-2">
            {scopeFilter === 'friends' ? (
              <div className="space-y-3 py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Nenhum amigo seguido ainda</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Acompanhe os seus amigos e colegas de estudo clicando em <span className="font-bold text-amber-500">"Seguir"</span> nos cards do Ranking Geral ou buscando pelo Código de Convite no Perfil.
                </p>
                <button
                  type="button"
                  onClick={() => setScopeFilter('national')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Explorar Ranking Geral
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum candidato encontrado {scopeFilter === 'province' ? `na Província de ${selectedProvince}` : ''} para este filtro.
              </p>
            )}
          </div>
        ) : visibleClassificatoryList.length === 0 && classificatoryList.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center text-xs text-slate-500">
            Todos os candidatos desta consulta estão no Pódio (Top 3).
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleClassificatoryList.map((candidate, idx) => {
                const rankPosition = idx + 4;
                const isMe = Boolean(
                  (candidate.uid && currentProfile.uid && candidate.uid === currentProfile.uid) ||
                  (candidate.id && currentProfile.id && candidate.id === currentProfile.id) ||
                  (candidate.uid && currentProfile.id && candidate.uid === currentProfile.id) ||
                  (candidate.id && currentProfile.uid && candidate.id === currentProfile.uid)
                );
                const candUid = candidate.uid || candidate.displayName || `user_${idx}`;
                const isFollowing = Boolean(candidate.uid && followingList.includes(candidate.uid));
                const rankChange = rankDeltasMap[candUid] ?? 0;
                const bInfo = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
                const candAvatar = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
                const levelLabel = getAcademicLevelLabel(candidate.academicLevel);

                return (
                  <motion.div
                    key={candidate.uid || `${candidate.displayName}_${idx}`}
                    layout
                    ref={isMe ? setUserNode : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 28,
                      mass: 0.8,
                    }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all shadow-xs cursor-pointer relative overflow-hidden ${
                      isMe
                        ? 'border-amber-400 bg-amber-500/20 dark:bg-amber-500/20 shadow-[0_0_26px_rgba(245,158,11,0.55)] ring-2 ring-amber-400 dark:ring-amber-400 ring-offset-2 ring-offset-slate-900 dark:ring-offset-slate-950 hover:bg-amber-500/30'
                        : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F1115] hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Subtle pulsing glow ring & ambient aura for current logged-in user row */}
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
                      {/* Rank Position & Variation Indicator */}
                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[34px]">
                        <span className={`font-mono font-black text-xs leading-none ${isMe ? 'text-amber-400 scale-110' : 'text-slate-600 dark:text-slate-400'}`}>
                          #{rankPosition}
                        </span>
                        <div className="mt-1">
                          <RankChangeIndicator change={rankChange} />
                        </div>
                      </div>

                      {/* Avatar with Branch Badge Overlay */}
                      <div className="shrink-0 flex items-center justify-center">
                        <UserAvatar user={candidate} size="sm" showBranchBadge={true} />
                      </div>

                      {/* Candidate Details */}
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-xs font-bold truncate ${isMe ? 'text-amber-300 font-extrabold' : 'text-slate-900 dark:text-slate-100'}`}>
                            {candidate.displayName}
                          </p>
                          {candidate.isVipSupporter && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 font-black shrink-0 flex items-center gap-0.5" title="Apoiador VIP 🌟">
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

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
                            {levelLabel}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Swords size={10} />
                            {candidate.multiplayerDuelsWon ?? candidate.duelsWon ?? 0} Vencidos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XP & Province Display + Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isMe && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleToggleFollow(candidate, e)}
                            title={isFollowing ? "Clique para desseguir" : "Clique para seguir"}
                            className={`group text-[9px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                              isFollowing
                                ? 'bg-emerald-500/15 hover:bg-rose-500/15 text-emerald-600 dark:text-emerald-400 hover:text-rose-500 border border-emerald-500/30 hover:border-rose-500/30'
                                : 'bg-slate-100 dark:bg-white/5 hover:bg-amber-500/15 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 hover:text-amber-500'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <Check size={10} className="group-hover:hidden stroke-[2.5]" />
                                <UserMinus size={10} className="hidden group-hover:inline" />
                                <span className="hidden sm:inline group-hover:hidden">✓ Seguindo</span>
                                <span className="hidden sm:group-hover:inline">Desseguir</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={10} />
                                <span className="hidden sm:inline">+ Seguir</span>
                              </>
                            )}
                          </button>

                          {isFollowing && onPlayDuel && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlayDuel(candidate);
                              }}
                              title="Desafiar para Duelo 1v1"
                              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[9px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Swords size={11} />
                              <span className="hidden md:inline uppercase">Desafiar</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono flex items-center justify-end gap-1">
                          <Zap size={12} className="text-amber-500 fill-amber-500" />
                          <span>{candidate.totalXp.toLocaleString()} XP</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono flex items-center justify-end gap-0.5 mt-0.5">
                          <MapPin size={9} className="text-amber-500" />
                          <span>{candidate.province || 'Luanda'}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Botão "Ver mais" / Carregamento Progressivo (+10) */}
            {hasMore ? (
              <div className="pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setVisibleLimit(prev => prev + 10)}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#0F1115] border border-amber-500/30 hover:border-amber-400 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
                >
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5 text-amber-500" />
                  <span>Ver mais (+10 candidatos)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    A exibir {totalVisibleCount} de {filteredList.length}
                  </span>
                </button>
              </div>
            ) : filteredList.length > 10 ? (
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Todos os {filteredList.length} candidatos carregados
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* CARTÃO DA POSIÇÃO DO CANDIDATO (FIXO NO RODAPÉ COM VISIBILIDADE INTELIGENTE) */}
      <AnimatePresence>
        {!isUserVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="sticky bottom-2 z-30 pt-2"
          >
            <div 
              onClick={() => setSelectedCandidate(currentProfile)}
              className="bg-slate-950/95 backdrop-blur-md border-2 border-amber-500 rounded-2xl p-3 shadow-[0_4px_25px_rgba(245,158,11,0.35)] flex items-center justify-between text-slate-100 cursor-pointer hover:border-amber-400 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar & Branch Badge */}
                <div className="shrink-0 flex items-center justify-center">
                  <UserAvatar user={currentProfile} size="sm" showBranchBadge={true} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-tight">
                      POSIÇÃO ({scopeFilter === 'province' ? selectedProvince : 'GERAL'}):
                    </p>
                    <span className="text-xs font-mono font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded border border-amber-500 shadow-sm">
                      #{myActiveScopeRank ? myActiveScopeRank : `${myGlobalRank} (Nacional)`}
                    </span>
                    <RankChangeIndicator change={myActiveRankChange} />
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
                      <MapPin size={9} />
                      {userProvince} (#{myHomeProvinceRank} na província)
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-amber-400 font-mono flex items-center justify-end gap-1">
                  <Zap size={14} className="text-amber-400 fill-amber-400" />
                  <span>{currentProfile.totalXp.toLocaleString()} XP</span>
                </div>
                <p className="text-[9px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                  <Swords size={9} />
                  <span>{currentProfile.multiplayerDuelsWon ?? currentProfile.duelsWon ?? 0} Vitórias</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        </>
      )}

      {/* MODAL DE DETALHES DO CANDIDATO / MINI-PERFIL (Acessível em todos os modos) */}
      <AnimatePresence>
        {selectedCandidate && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-slate-100 overflow-hidden"
            >
              {/* Background Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              {/* Modal Header & Avatar */}
              <div className="flex flex-col items-center text-center pt-2 pb-4 border-b border-slate-800/80">
                <div className="mb-3 flex items-center justify-center">
                  <UserAvatar user={selectedCandidate} size="xl" showBranchBadge={true} />
                </div>

                <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
                  <span>{selectedCandidate.displayName}</span>
                  {selectedCandidate.isVipSupporter && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black flex items-center gap-0.5">
                      <Sparkles size={10} className="fill-amber-400" />
                      <span>VIP</span>
                    </span>
                  )}
                  {Boolean(
                    (selectedCandidate.uid && currentProfile.uid && selectedCandidate.uid === currentProfile.uid) ||
                    ((selectedCandidate as any).id && (currentProfile as any).id && (selectedCandidate as any).id === (currentProfile as any).id) ||
                    (selectedCandidate.uid && (currentProfile as any).id && selectedCandidate.uid === (currentProfile as any).id) ||
                    ((selectedCandidate as any).id && currentProfile.uid && (selectedCandidate as any).id === currentProfile.uid)
                  ) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                      VOCÊ
                    </span>
                  )}
                  {(() => {
                    const isCandidateFollowing = Boolean(
                      (selectedCandidate.uid && followingList.includes(selectedCandidate.uid)) ||
                      ((selectedCandidate as any).id && followingList.includes((selectedCandidate as any).id))
                    );
                    const isFollowingMe = Boolean(
                      selectedCandidate.following && (
                        (currentProfile.uid && selectedCandidate.following.includes(currentProfile.uid)) ||
                        ((currentProfile as any).id && selectedCandidate.following.includes((currentProfile as any).id))
                      )
                    );
                    const isMutual = isCandidateFollowing && isFollowingMe;

                    if (isMutual) {
                      return (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black flex items-center gap-1 shadow-sm">
                          <span>🤝</span>
                          <span>Amigos Mútuos</span>
                        </span>
                      );
                    }
                    if (isFollowingMe && !isCandidateFollowing) {
                      return (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1">
                          <UserCheck size={10} />
                          <span>Segue-te</span>
                        </span>
                      );
                    }
                    return null;
                  })()}
                </h3>

                <p className="text-xs text-amber-400/90 font-mono font-bold mt-0.5">
                  {MININT_BRANCHES[selectedCandidate.branch]?.name || selectedCandidate.branch}
                </p>
                {selectedCandidate.rankTitle && (
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {selectedCandidate.rankTitle}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="py-4 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Ramo MININT</span>
                    <span className="font-black text-slate-100 flex items-center gap-1">
                      <Shield size={13} className="text-amber-500" />
                      {selectedCandidate.branch}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Nível Académico</span>
                    <span className="font-black text-slate-100 flex items-center gap-1 truncate">
                      <GraduationCap size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">{getAcademicLevelLabel(selectedCandidate.academicLevel)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Província</span>
                    <span className="font-black text-slate-100 flex items-center gap-1">
                      <MapPin size={13} className="text-amber-500" />
                      {selectedCandidate.province || 'Luanda'}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Pontuação XP</span>
                    <span className="font-black text-amber-400 font-mono flex items-center gap-1">
                      <Zap size={13} className="text-amber-500 fill-amber-500" />
                      {selectedCandidate.totalXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Weekly Duel Points & Duels Victories Stats Box */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Pontos Duelo Semanal</span>
                    <span className="font-black text-amber-400 font-mono flex items-center gap-1">
                      <Flame size={13} className="text-amber-500 fill-amber-500" />
                      {selectedCandidate.weeklyDuelPoints || 0} Pts
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Vitórias em Duelos</span>
                    <span className="font-black text-emerald-400 font-mono flex items-center gap-1">
                      <Swords size={13} />
                      {selectedCandidate.multiplayerDuelsWon ?? selectedCandidate.duelsWon ?? 0} Vencidos
                    </span>
                  </div>
                </div>

                {/* Referral Code if Available */}
                {selectedCandidate.referralCode && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Código de Convite</span>
                      <span className="font-mono font-black text-amber-400 text-xs tracking-wider">{selectedCandidate.referralCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCandidate.referralCode) {
                          navigator.clipboard.writeText(selectedCandidate.referralCode);
                          setCopiedCodeCandidateId(selectedCandidate.uid || (selectedCandidate as any).id || 'copied');
                          setTimeout(() => setCopiedCodeCandidateId(null), 2000);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedCodeCandidateId === (selectedCandidate.uid || (selectedCandidate as any).id) ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 space-y-2">
                {(() => {
                  const isSelf = Boolean(
                    (selectedCandidate.uid && currentProfile.uid && selectedCandidate.uid === currentProfile.uid) ||
                    ((selectedCandidate as any).id && (currentProfile as any).id && (selectedCandidate as any).id === (currentProfile as any).id) ||
                    (selectedCandidate.uid && (currentProfile as any).id && selectedCandidate.uid === (currentProfile as any).id) ||
                    ((selectedCandidate as any).id && currentProfile.uid && (selectedCandidate as any).id === currentProfile.uid)
                  );

                  if (isSelf) return null;

                  const isCandidateFollowing = Boolean(
                    (selectedCandidate.uid && followingList.includes(selectedCandidate.uid)) ||
                    ((selectedCandidate as any).id && followingList.includes((selectedCandidate as any).id))
                  );

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFollow(selectedCandidate, e)}
                        title={isCandidateFollowing ? "Clique para desseguir" : "Clique para seguir"}
                        className={`group flex-1 py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer ${
                          isCandidateFollowing
                            ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/40 hover:border-rose-500/40 shadow-inner'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {isCandidateFollowing ? (
                          <>
                            <Check size={16} className="group-hover:hidden stroke-[3]" />
                            <UserMinus size={16} className="hidden group-hover:inline stroke-[2.5]" />
                            <span className="group-hover:hidden">✓ SEGUINDO</span>
                            <span className="hidden group-hover:inline">DESSEGUIR</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            <span>+ SEGUIR</span>
                          </>
                        )}
                      </button>

                      {onPlayDuel && (
                        <button
                          type="button"
                          onClick={() => {
                            const cand = selectedCandidate;
                            setSelectedCandidate(null);
                            onPlayDuel(cand);
                          }}
                          className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
                        >
                          <Swords size={16} />
                          <span>⚔️ DESAFIAR 1V1</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// PODIUM CARD COMPONENT (Top 3)
const PodiumCard: React.FC<{
  candidate: UserProfile;
  rank: 1 | 2 | 3;
  rankChange?: number;
  isMe: boolean;
  elementRef?: (node: HTMLElement | null) => void;
  onSelectCandidate?: (candidate: UserProfile) => void;
}> = ({ candidate, rank, rankChange = 0, isMe, elementRef, onSelectCandidate }) => {
  const bInfo = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
  const avatarOpt = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
  const levelLabel = getAcademicLevelLabel(candidate.academicLevel);

  let medalEmoji = '🥇';
  let badgeColor = 'from-amber-400 to-amber-600 text-slate-950';
  let ringBorder = 'border-amber-400 ring-2 ring-amber-400/40';
  let heightStyle = 'min-h-[185px] sm:min-h-[210px] pt-4 sm:pt-4.5 pb-2 sm:pb-2.5';
  let rankLabel = '1.º Lugar';

  if (rank === 2) {
    medalEmoji = '🥈';
    badgeColor = 'from-slate-300 to-slate-400 text-slate-950';
    ringBorder = 'border-slate-300 ring-1 ring-slate-300/30';
    heightStyle = 'min-h-[170px] sm:min-h-[195px] pt-4 sm:pt-4.5 pb-2 sm:pb-2.5';
    rankLabel = '2.º Lugar';
  } else if (rank === 3) {
    medalEmoji = '🥉';
    badgeColor = 'from-amber-700 to-amber-800 text-slate-100';
    ringBorder = 'border-amber-700 ring-1 ring-amber-700/30';
    heightStyle = 'min-h-[160px] sm:min-h-[185px] pt-4 sm:pt-4.5 pb-2 sm:pb-2.5';
    rankLabel = '3.º Lugar';
  }

  return (
    <motion.div
      layout
      key={candidate.uid}
      ref={elementRef}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onSelectCandidate?.(candidate)}
      className={`relative w-full min-w-0 flex flex-col items-center justify-between p-2 rounded-2xl bg-slate-800/80 border border-slate-700/50 box-border overflow-hidden ${heightStyle} ${
        isMe
          ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
          : rank === 1
          ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          : 'border-slate-700/50'
      } text-center transition-all cursor-pointer hover:border-amber-500/50 hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Subtle pulsing glow ring & ambient aura for current logged-in user in Podium */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-amber-400/15 to-amber-500/20 animate-pulse pointer-events-none rounded-2xl" />
        </>
      )}

      {/* Medal Crown & Rank Position with Variation Indicator */}
      <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 sm:gap-1 bg-slate-950/95 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-700/80 shadow-md">
        <span className="text-[10px] sm:text-xs filter drop-shadow">{medalEmoji}</span>
        <span className="text-[10px] sm:text-xs font-black font-mono text-slate-200">#{rank}</span>
        <RankChangeIndicator change={rankChange} compact />
      </div>

      <div className="flex flex-col items-center relative z-10 w-full min-w-0">
        {/* Avatar with Branch Overlay */}
        <div className="my-1 shrink-0 flex items-center justify-center">
          <UserAvatar user={candidate} size={rank === 1 ? 'lg' : 'md'} showBranchBadge={true} isFirstPlace={rank === 1} />
        </div>

        {/* Candidate Name */}
        <p className={`w-full truncate whitespace-nowrap text-[11px] sm:text-sm font-bold text-center mt-1 ${isMe ? 'text-amber-300' : 'text-slate-100'}`}>
          {candidate.displayName}
        </p>

        {candidate.isVipSupporter && (
          <span className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black mt-0.5 flex items-center justify-center gap-0.5">
            <Sparkles size={7} className="fill-amber-400 shrink-0" />
            <span className="truncate whitespace-nowrap">VIP 🌟</span>
          </span>
        )}

        {isMe && (
          <span className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black mt-0.5 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)] border border-amber-300 flex items-center justify-center gap-0.5">
            <Sparkles size={7} className="fill-slate-950 text-slate-950 shrink-0" />
            <span>VOCÊ</span>
          </span>
        )}

        {/* Province Tag */}
        <span className="w-full truncate whitespace-nowrap text-[9px] sm:text-xs text-slate-400 text-center flex items-center justify-center gap-0.5 mt-0.5">
          <MapPin size={8} className="shrink-0 text-amber-400/80" />
          <span className="truncate whitespace-nowrap">{candidate.province || 'Luanda'}</span>
        </span>
      </div>

      {/* XP & Duels Footer / Pontuação */}
      <div className="w-full min-w-0 bg-slate-950/80 rounded-xl p-1 border border-slate-700/40 mt-1">
        <p className="w-full truncate whitespace-nowrap text-[10px] sm:text-xs font-semibold text-amber-400 text-center flex items-center justify-center gap-0.5 font-mono">
          <Zap size={10} className="text-amber-400 fill-amber-400 shrink-0" />
          <span className="truncate whitespace-nowrap">{candidate.totalXp.toLocaleString()} XP</span>
        </p>
        <p className="w-full truncate whitespace-nowrap text-[8px] sm:text-[9px] text-slate-400 font-medium text-center">
          {candidate.multiplayerDuelsWon ?? candidate.duelsWon ?? 0} Duelos
        </p>
      </div>
    </motion.div>
  );
};
