import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AcademicLevel, MININTBranch, QuestionCategory } from '../types';
import { MININT_BRANCHES, getAvatarOption, PROVINCES_ANGOLA, normalizeProvinceName } from '../data/branches';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Search, Zap, MapPin, UserCheck, Swords, GraduationCap, Award, Shield, Sparkles, Globe, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { DuelLeagueView } from './DuelLeagueView';

interface RankingsViewProps {
  currentProfile: UserProfile;
  onPlayDuel?: () => void;
  defaultMode?: 'xp' | 'ligas';
}

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

export const RankingsView: React.FC<RankingsViewProps> = ({ currentProfile, onPlayDuel, defaultMode = 'xp' }) => {
  const [activeMode, setActiveMode] = useState<'xp' | 'ligas'>(defaultMode);
  const [scopeFilter, setScopeFilter] = useState<'national' | 'province'>('national');
  const [selectedProvince, setSelectedProvince] = useState<string>(
    currentProfile.province || 'Luanda'
  );
  const [levelFilter, setLevelFilter] = useState<'all' | AcademicLevel>('all');
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);

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
      orderBy('totalXp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as UserProfile);
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

  // Filtered leaderboard by Scope (National vs Province), Academic level, and Search query
  const filteredList = leaderboard.filter(candidate => {
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
      const queryLower = searchQuery.toLowerCase();
      const matchName = (candidate.displayName || '').toLowerCase().includes(queryLower);
      const matchProv = (candidate.province || '').toLowerCase().includes(queryLower);
      const matchBranch = (candidate.branch || '').toLowerCase().includes(queryLower);
      if (!matchName && !matchProv && !matchBranch) return false;
    }

    return true;
  });

  // Rank position of user in current active view list
  const myActiveScopeRankIndex = filteredList.findIndex(u => u.uid === currentProfile.uid);
  const myActiveScopeRank = myActiveScopeRankIndex !== -1 ? myActiveScopeRankIndex + 1 : null;

  // Top 3 Podium Candidates (from filtered list)
  const top1 = filteredList[0];
  const top2 = filteredList[1];
  const top3 = filteredList[2];

  // Candidates for classification list (4th place onwards)
  const classificatoryList = filteredList.slice(3);

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

        {/* TOP LEVEL MODE SWITCHER: XP RANKING VS DUEL LEAGUES */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl max-w-md mx-auto text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveMode('xp')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'xp'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Trophy size={14} />
            <span>Ranking Geral (XP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('ligas')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeMode === 'ligas'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords size={14} />
            <span>Duelo de Ligas 🥉🥈🥇</span>
          </button>
        </div>
      </div>

      {/* RENDER DUEL LEAGUE VIEW IF 'ligas' MODE IS ACTIVE */}
      {activeMode === 'ligas' ? (
        <DuelLeagueView currentProfile={currentProfile} onPlayDuel={onPlayDuel || (() => {})} />
      ) : (
        <>
      {/* 1. SCOPE FILTER (NATIONAL VS PROVINCE TABS) */}
      <div className="bg-slate-950/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner space-y-2">
        <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setScopeFilter('national')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              scopeFilter === 'national'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe size={15} />
            <span className="truncate">Ranking Geral (Nacional)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScopeFilter('province');
              if (!selectedProvince) {
                setSelectedProvince(userProvince);
              }
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              scopeFilter === 'province'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin size={15} />
            <span className="truncate">Ranking por Província</span>
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
        <div className="bg-slate-950/80 dark:bg-[#0A0C0E] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles size={12} />
              Pódio dos Melhores Colocados (Top 3)
            </span>
            <span className="text-slate-400 font-mono">
              {scopeFilter === 'province' ? selectedProvince : 'Nacional'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
            {/* 2nd Place (Left) */}
            {top2 ? (
              <PodiumCard candidate={top2} rank={2} isMe={top2.uid === currentProfile.uid} onSelectCandidate={setSelectedCandidate} />
            ) : (
              <div className="h-28 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                2.º Lugar
              </div>
            )}

            {/* 1st Place (Center - Elevated) */}
            {top1 ? (
              <PodiumCard candidate={top1} rank={1} isMe={top1.uid === currentProfile.uid} onSelectCandidate={setSelectedCandidate} />
            ) : (
              <div className="h-32 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                1.º Lugar
              </div>
            )}

            {/* 3rd Place (Right) */}
            {top3 ? (
              <PodiumCard candidate={top3} rank={3} isMe={top3.uid === currentProfile.uid} onSelectCandidate={setSelectedCandidate} />
            ) : (
              <div className="h-28 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                3.º Lugar
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTA CLASSIFICATÓRIA (4.º LUGAR EM DIANTE) */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between px-1 pt-1">
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-amber-500" />
            Classificação {scopeFilter === 'province' ? `(${selectedProvince})` : '(Nacional)'}
          </span>
          <span className="text-[10px] font-mono text-slate-400">Pontuação XP</span>
        </h3>

        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center text-xs text-slate-500">
            Nenhum candidato encontrado {scopeFilter === 'province' ? `na Província de ${selectedProvince}` : ''} para este filtro.
          </div>
        ) : classificatoryList.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center text-xs text-slate-500">
            Todos os candidatos desta consulta estão no Pódio (Top 3).
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {classificatoryList.map((candidate, idx) => {
                const rankPosition = idx + 4;
                const isMe = candidate.uid === currentProfile.uid;
                const bInfo = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
                const candAvatar = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
                const levelLabel = getAcademicLevelLabel(candidate.academicLevel);

                return (
                  <motion.div
                    key={candidate.uid || `${candidate.displayName}_${idx}`}
                    layout
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
                        ? 'border-amber-400 bg-amber-500/20 dark:bg-amber-500/20 shadow-[0_0_22px_rgba(245,158,11,0.5)] ring-2 ring-amber-400 hover:bg-amber-500/30'
                        : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F1115] hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Pulsing glow aura background for current logged-in user */}
                    {isMe && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/25 to-amber-500/10 animate-pulse pointer-events-none rounded-2xl" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                      {/* Rank Position */}
                      <div className={`w-6 text-center font-mono font-black text-xs shrink-0 ${isMe ? 'text-amber-400 scale-110' : 'text-slate-600 dark:text-slate-400'}`}>
                        #{rankPosition}
                      </div>

                      {/* Avatar with Branch Badge Overlay */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bInfo.badgeBg} flex items-center justify-center text-lg border ${isMe ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'border-amber-500/30'} shadow-xs`}>
                          {candAvatar.symbol}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 px-1 py-0.2 text-[8px] font-black rounded-md bg-slate-900 text-amber-400 border border-amber-500/40 font-mono`}>
                          {candidate.branch}
                        </span>
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

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
                            {levelLabel}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Swords size={10} />
                            {candidate.multiplayerDuelsWon ?? candidate.duelsWon ?? 0} Duelos Vencidos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XP & Province Display */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono flex items-center justify-end gap-1">
                        <Zap size={12} className="text-amber-500 fill-amber-500" />
                        <span>{candidate.totalXp.toLocaleString()} XP</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono flex items-center justify-end gap-0.5 mt-0.5">
                        <MapPin size={9} className="text-amber-500" />
                        <span>{candidate.province || 'Luanda'}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CARTÃO DA POSIÇÃO DO CANDIDATO (FIXO NO RODAPÉ) */}
      <div className="sticky bottom-2 z-30 pt-2">
        <div 
          onClick={() => setSelectedCandidate(currentProfile)}
          className="bg-slate-950 border-2 border-amber-500 rounded-2xl p-3 shadow-[0_4px_25px_rgba(245,158,11,0.35)] flex items-center justify-between text-slate-100 cursor-pointer hover:border-amber-400 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar & Branch Badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500 flex items-center justify-center text-lg shadow-sm">
                {getAvatarOption(currentProfile.avatarId, currentProfile.branch, currentProfile.displayName).symbol}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[8px] font-black rounded-md bg-amber-500 text-slate-950 font-mono">
                {currentProfile.branch}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-tight">
                  POSIÇÃO ({scopeFilter === 'province' ? selectedProvince : 'GERAL'}):
                </p>
                <span className="text-xs font-mono font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded border border-amber-500 shadow-sm">
                  #{myActiveScopeRank ? myActiveScopeRank : `${myGlobalRank} (Nacional)`}
                </span>
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
      </div>

      {/* MINI-PERFIL MODAL */}
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
                <div className="relative mb-3">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${(MININT_BRANCHES[selectedCandidate.branch] || MININT_BRANCHES.PNA).badgeBg} flex items-center justify-center text-4xl border-2 border-amber-500/60 shadow-lg`}>
                    {getAvatarOption(selectedCandidate.avatarId, selectedCandidate.branch, selectedCandidate.displayName).symbol}
                  </div>
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-black rounded-lg bg-slate-950 text-amber-400 border border-amber-500/50 shadow-md font-mono">
                    {selectedCandidate.branch}
                  </span>
                </div>

                <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
                  <span>{selectedCandidate.displayName}</span>
                  {selectedCandidate.isVipSupporter && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black flex items-center gap-0.5">
                      <Sparkles size={10} className="fill-amber-400" />
                      <span>VIP</span>
                    </span>
                  )}
                  {selectedCandidate.uid === currentProfile.uid && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                      VOCÊ
                    </span>
                  )}
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

                {/* Duels Victories Stats Box */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Swords size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Vitórias em Duelos</span>
                      <span className="font-black text-emerald-400 text-xs">
                        {selectedCandidate.multiplayerDuelsWon ?? selectedCandidate.duelsWon ?? 0} Duelos Vencidos
                      </span>
                    </div>
                  </div>

                  {selectedCandidate.duelsPlayed ? (
                    <span className="text-[10px] font-mono text-slate-400 text-right">
                      {selectedCandidate.duelsPlayed} Jogados
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                {onPlayDuel && selectedCandidate.uid !== currentProfile.uid && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(null);
                      onPlayDuel();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <Swords size={15} />
                    <span>Desafiar Duelo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex-1"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};

// PODIUM CARD COMPONENT (Top 3)
const PodiumCard: React.FC<{
  candidate: UserProfile;
  rank: 1 | 2 | 3;
  isMe: boolean;
  onSelectCandidate?: (candidate: UserProfile) => void;
}> = ({ candidate, rank, isMe, onSelectCandidate }) => {
  const bInfo = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
  const avatarOpt = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
  const levelLabel = getAcademicLevelLabel(candidate.academicLevel);

  let medalEmoji = '🥇';
  let badgeColor = 'from-amber-400 to-amber-600 text-slate-950';
  let ringBorder = 'border-amber-400 ring-2 ring-amber-400/40';
  let heightStyle = 'h-42 pt-2';
  let rankLabel = '1.º Lugar';

  if (rank === 2) {
    medalEmoji = '🥈';
    badgeColor = 'from-slate-300 to-slate-400 text-slate-950';
    ringBorder = 'border-slate-300 ring-1 ring-slate-300/30';
    heightStyle = 'h-38 pt-3';
    rankLabel = '2.º Lugar';
  } else if (rank === 3) {
    medalEmoji = '🥉';
    badgeColor = 'from-amber-700 to-amber-800 text-slate-100';
    ringBorder = 'border-amber-700 ring-1 ring-amber-700/30';
    heightStyle = 'h-36 pt-4';
    rankLabel = '3.º Lugar';
  }

  return (
    <motion.div
      layout
      key={candidate.uid}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onSelectCandidate?.(candidate)}
      className={`relative bg-gradient-to-b from-slate-900 to-slate-950 border overflow-hidden ${
        isMe
          ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
          : rank === 1
          ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          : 'border-slate-800'
      } rounded-2xl p-2 text-center flex flex-col justify-between ${heightStyle} transition-all cursor-pointer hover:border-amber-500/50 hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Pulsing glow aura background for logged-in user */}
      {isMe && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-amber-400/10 to-amber-500/20 animate-pulse pointer-events-none rounded-2xl" />
      )}

      {/* Medal Crown / Insignia */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <span className="text-xl filter drop-shadow">{medalEmoji}</span>
      </div>

      <div className="flex flex-col items-center mt-1 relative z-10">
        {/* Avatar with Branch Overlay */}
        <div className="relative mb-1">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bInfo.badgeBg} flex items-center justify-center text-lg border ${ringBorder} shadow-sm`}>
            {avatarOpt.symbol}
          </div>
          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[8px] font-black rounded bg-slate-900 text-amber-400 border border-amber-500/40 font-mono">
            {candidate.branch}
          </span>
        </div>

        {/* Candidate Name */}
        <p className={`text-[10px] font-black leading-tight truncate max-w-[85px] mt-0.5 ${isMe ? 'text-amber-300' : 'text-slate-100'}`}>
          {candidate.displayName}
        </p>

        {candidate.isVipSupporter && (
          <span className="text-[8px] px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black mt-0.5 flex items-center gap-0.5">
            <Sparkles size={8} className="fill-amber-400" />
            <span>VIP 🌟</span>
          </span>
        )}

        {isMe && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black mt-0.5 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)] border border-amber-300 flex items-center gap-0.5">
            <Sparkles size={8} className="fill-slate-950 text-slate-950" />
            <span>VOCÊ</span>
          </span>
        )}

        {/* Province Tag */}
        <span className="text-[9px] text-amber-400/90 font-medium truncate max-w-[85px] mt-0.5 flex items-center gap-0.5">
          <MapPin size={8} />
          {candidate.province || 'Luanda'}
        </span>
      </div>

      {/* XP & Duels Footer */}
      <div className="bg-slate-950/90 rounded-xl p-1 border border-slate-800/80 mt-1">
        <p className="text-[10px] font-black font-mono text-amber-400 flex items-center justify-center gap-0.5">
          <Zap size={10} className="text-amber-400 fill-amber-400" />
          <span>{candidate.totalXp.toLocaleString()}</span>
        </p>
        <p className="text-[8px] text-slate-400 font-medium truncate">
          {candidate.multiplayerDuelsWon ?? candidate.duelsWon ?? 0} Duelos Vencidos
        </p>
      </div>
    </motion.div>
  );
};
