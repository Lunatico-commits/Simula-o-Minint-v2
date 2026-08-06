import React, { useState, useEffect } from 'react';
import { UserProfile, AcademicLevel, MININTBranch } from '../types';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  DuelLeague,
  LEAGUES_CONFIG,
  getTimeUntilWeeklyReset,
  getCandidateLeagueZone,
  getCurrentISOWeek,
} from '../utils/league';
import {
  Trophy,
  Swords,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Shield,
  Search,
  Sparkles,
  Info,
  ChevronRight,
  Award,
  Zap,
  X,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DuelLeagueViewProps {
  currentProfile: UserProfile;
  onPlayDuel: () => void;
}

export const DuelLeagueView: React.FC<DuelLeagueViewProps> = ({ currentProfile, onPlayDuel }) => {
  const [selectedLeague, setSelectedLeague] = useState<DuelLeague>(
    currentProfile.duelLeague || 'bronze'
  );
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilWeeklyReset());
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilWeeklyReset());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected league if current user league changes
  useEffect(() => {
    if (currentProfile.duelLeague) {
      setSelectedLeague(currentProfile.duelLeague);
    }
  }, [currentProfile.duelLeague]);

  // Fetch live candidates from Firestore
  useEffect(() => {
    const q = query(collection(db, 'users'), limit(150));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersMap = new Map<string, UserProfile>();

        snapshot.forEach((docSnap) => {
          const u = docSnap.data() as UserProfile;
          if (u && u.uid) {
            usersMap.set(u.uid, u);
          }
        });

        // Always ensure current profile exists in list
        if (currentProfile && currentProfile.uid) {
          usersMap.set(currentProfile.uid, currentProfile);
        }

        const all = Array.from(usersMap.values());
        setCandidates(all);
      },
      (error) => {
        console.error('Erro ao carregar liga de duelos:', error);
        setCandidates([currentProfile]);
      }
    );

    return () => unsubscribe();
  }, [currentProfile]);

  // Filter candidates for selected league and sort by weeklyDuelPoints desc
  const leagueCandidates = candidates
    .filter((c) => (c.duelLeague || 'bronze') === selectedLeague)
    .sort((a, b) => (b.weeklyDuelPoints || 0) - (a.weeklyDuelPoints || 0));

  // Search filter
  const filteredCandidates = leagueCandidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(q) ||
      (c.province && c.province.toLowerCase().includes(q)) ||
      c.branch.toLowerCase().includes(q)
    );
  });

  // Calculate current candidate's rank in their active league
  const myCurrentLeague = currentProfile.duelLeague || 'bronze';
  const myLeagueCandidates = candidates
    .filter((c) => (c.duelLeague || 'bronze') === myCurrentLeague)
    .sort((a, b) => (b.weeklyDuelPoints || 0) - (a.weeklyDuelPoints || 0));

  const myRankIndex = myLeagueCandidates.findIndex((c) => c.uid === currentProfile.uid);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : myLeagueCandidates.length + 1;
  const myTotalInLeague = Math.max(1, myLeagueCandidates.length);

  const myZone = getCandidateLeagueZone(myRank, myTotalInLeague, myCurrentLeague);
  const myLeagueConfig = LEAGUES_CONFIG[myCurrentLeague];
  const activeLeagueConfig = LEAGUES_CONFIG[selectedLeague];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER HERO CARD - CANDIDATE'S CURRENT LEAGUE STATUS */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${myLeagueConfig.borderColor} bg-gradient-to-br ${myLeagueConfig.bgColor} p-6 text-slate-100 shadow-2xl`}
      >
        {/* Glow ambient background */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: myLeagueConfig.color }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Active League Badge & Title */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">{myLeagueConfig.badge}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                    Sua Liga Actual • Semanal ({getCurrentISOWeek()})
                  </span>
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${myLeagueConfig.textColor}`}>
                  {myLeagueConfig.name}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {myLeagueConfig.description}
            </p>

            {/* Zone Status Banner */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div
                className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-sm ${
                  myZone === 'promotion'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : myZone === 'relegation'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                }`}
              >
                {myZone === 'promotion' ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>ZONA DE PROMOÇÃO (Subindo!)</span>
                  </>
                ) : myZone === 'relegation' ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>ZONA DE DESPROMOÇÃO (Atenção!)</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>ZONA DE MANUTENÇÃO</span>
                  </>
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-400 font-bold">
                Classificação: <strong className="text-slate-100">#{myRank}</strong> de {myTotalInLeague}
              </span>
            </div>
          </div>

          {/* Stats & Weekly Countdown */}
          <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Reinício da Liga em:</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Pontos Semanais</span>
                <span className="text-xl font-black text-amber-400">
                  {currentProfile.weeklyDuelPoints || 0}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Vitórias em Duelo</span>
                <span className="text-xl font-black text-emerald-400">
                  {currentProfile.multiplayerDuelsWon || currentProfile.duelsWon || 0}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onPlayDuel}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 mt-2"
            >
              <Swords className="w-4 h-4" />
              <span>Jogar Duelo & Somar Pontos</span>
            </button>
          </div>
        </div>
      </div>

      {/* LEAGUE SELECTOR TABS (Bronze, Prata, Ouro) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          {(Object.keys(LEAGUES_CONFIG) as DuelLeague[]).map((lKey) => {
            const lObj = LEAGUES_CONFIG[lKey];
            const isSelected = selectedLeague === lKey;
            const isMyLeague = myCurrentLeague === lKey;

            return (
              <button
                key={lKey}
                type="button"
                onClick={() => setSelectedLeague(lKey)}
                className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-base">{lObj.badge}</span>
                <span>{lObj.name}</span>

                {isMyLeague && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1"
                    title="A sua liga actual"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Search bar for league candidates */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar concorrente..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* LEAGUE INFO BANNER & THRESHOLDS */}
      <div
        className={`p-4 rounded-2xl border ${activeLeagueConfig.borderColor} bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-200 text-xs`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
            {activeLeagueConfig.badge}
          </span>
          <div>
            <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <span>{activeLeagueConfig.name}</span>
              {selectedLeague === myCurrentLeague && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                  Sua Liga
                </span>
              )}
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">{activeLeagueConfig.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{activeLeagueConfig.promotionThresholdText}</span>
          </div>
          <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{activeLeagueConfig.relegationThresholdText}</span>
          </div>
        </div>
      </div>

      {/* LEAGUE LEADERBOARD TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Classificação Semanal — {activeLeagueConfig.name} ({filteredCandidates.length})
            </h3>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Actualizado em tempo real
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Shield className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
            <p className="text-xs text-slate-400 font-medium">
              Nenhum candidato encontrado nesta liga ainda. Seja o primeiro a jogar um duelo!
            </p>
            <button
              type="button"
              onClick={onPlayDuel}
              className="py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              Iniciar Duelo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            <AnimatePresence mode="popLayout">
              {filteredCandidates.map((candidate, idx) => {
                const rank = idx + 1;
                const isMe = candidate.uid === currentProfile.uid;
                const candidateBranch = MININT_BRANCHES[candidate.branch] || MININT_BRANCHES.PNA;
                const avatar = getAvatarOption(candidate.avatarId, candidate.branch, candidate.displayName);
                const zone = getCandidateLeagueZone(rank, leagueCandidates.length, selectedLeague, candidate.weeklyDuelPoints || 0);

                let rankBadgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
                if (rank === 1) rankBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
                else if (rank === 2) rankBadgeStyle = 'bg-slate-300/20 text-slate-200 border-slate-400/50';
                else if (rank === 3) rankBadgeStyle = 'bg-amber-700/20 text-amber-400 border-amber-600/40';

                return (
                  <motion.div
                    key={candidate.uid || `${candidate.displayName}_${idx}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 28,
                      mass: 0.8,
                    }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.99] ${
                      isMe
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-400 hover:bg-amber-500/20'
                        : zone === 'promotion'
                        ? 'hover:bg-emerald-950/30'
                        : zone === 'relegation'
                        ? 'hover:bg-rose-950/30'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Rank Number & Avatar & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border ${rankBadgeStyle}`}
                      >
                        {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </span>

                      <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${candidateBranch.badgeBg} border border-amber-500/40 flex items-center justify-center text-base shadow-sm`}>
                          {avatar.symbol}
                        </div>
                        {candidate.isVipSupporter && (
                          <span className="absolute -top-1 -right-1 text-[10px]" title="VIP">🌟</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-100 truncate">
                            {candidate.displayName}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[9px] font-black uppercase">
                              Você
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          <span className="text-amber-400/90 font-bold">{candidateBranch.id}</span>
                          <span>•</span>
                          <span>📍 {candidate.province || 'Angola'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Zone status & Points */}
                    <div className="flex items-center gap-3 text-right flex-shrink-0">
                      {/* Zone Badge */}
                      <div className="hidden sm:block">
                        {zone === 'promotion' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Promove
                          </span>
                        ) : zone === 'relegation' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Desce
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
                            <Minus className="w-3 h-3" /> Mantém
                          </span>
                        )}
                      </div>

                      {/* Points & Duels */}
                      <div>
                        <span className="text-xs font-black text-amber-400 block">
                          {candidate.weeklyDuelPoints || 0} Pts
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {candidate.multiplayerDuelsWon || candidate.duelsWon || 0} Vits
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* HOW DUEL LEAGUES WORK INFO SECTION */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 text-slate-200">
        <div className="flex items-center gap-2 text-amber-400">
          <Info className="w-4 h-4" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
            Como Funciona a Pontuação de Duelo & Ligas Semanal
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-xl">⚔️</span>
            <span className="text-xs font-bold text-slate-100 block">Vitória em Duelo</span>
            <span className="text-xs font-black text-amber-400 block">+50 Pts Bónus</span>
            <p className="text-[10px] text-slate-400 leading-tight">Ao derrotar o adversário no tempo regulamentar.</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-xl">🎯</span>
            <span className="text-xs font-bold text-slate-100 block">Respostas Certas</span>
            <span className="text-xs font-black text-emerald-400 block">+15 Pts / Pergunta</span>
            <p className="text-[10px] text-slate-400 leading-tight">Cada acerto na lei orgânica e constituição acumula pontos.</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-xl">🛡️</span>
            <span className="text-xs font-bold text-slate-100 block">Participação</span>
            <span className="text-xs font-black text-blue-400 block">+20 Pts Base</span>
            <p className="text-[10px] text-slate-400 leading-tight">Premiação por concluir cada duelo contra outros candidatos.</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-xl">📆</span>
            <span className="text-xs font-bold text-slate-100 block">Reinício Semanal</span>
            <span className="text-xs font-black text-yellow-400 block">Domingo à Meia-Noite</span>
            <p className="text-[10px] text-slate-400 leading-tight">Processamento automático das promoções e despromoções.</p>
          </div>
        </div>
      </div>

      {/* USER PROFILE MODAL IN LEAGUE CLASSIFICATION */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden text-slate-100"
            >
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
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Liga de Duelos</span>
                    <span className="font-black text-slate-100 flex items-center gap-1 truncate">
                      <Trophy size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">{LEAGUES_CONFIG[selectedCandidate.duelLeague || 'bronze'].name}</span>
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
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-0.5">Pontos na Liga</span>
                    <span className="font-black text-amber-400 font-mono flex items-center gap-1">
                      <Zap size={13} className="text-amber-500 fill-amber-500" />
                      {selectedCandidate.weeklyDuelPoints || 0} Pts
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
    </div>
  );
};
