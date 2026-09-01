import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Zap, Shield, MapPin, Sparkles, Flame, Clock } from 'lucide-react';
import { UserProfile, DuelPlayer, MININTBranch, QuestionCategory } from '../types';
import { UserAvatar } from './UserAvatar';
import { MININT_BRANCHES } from '../data/branches';
import { playRoundStartSound, playTickSound } from '../utils/audio';

export interface VsBattleOverlayProps {
  isOpen: boolean;
  hostPlayer?: Partial<DuelPlayer> | Partial<UserProfile> | null;
  guestPlayer?: Partial<DuelPlayer> | Partial<UserProfile> | null;
  category?: QuestionCategory | 'misto';
  mode?: 'padrao' | 'relampago';
  roomCode?: string;
  totalQuestions?: number;
  timePerQuestion?: number;
  onComplete: () => void;
  durationSeconds?: number;
}

export const VsBattleOverlay: React.FC<VsBattleOverlayProps> = ({
  isOpen,
  hostPlayer,
  guestPlayer,
  category = 'misto',
  mode = 'padrao',
  roomCode,
  totalQuestions = 5,
  timePerQuestion = 20,
  onComplete,
  durationSeconds = 3,
}) => {
  const [countdown, setCountdown] = useState<number>(durationSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(durationSeconds);
      return;
    }

    // Play battle round start sound on mount
    playRoundStartSound();

    setCountdown(durationSeconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 0;
        }
        playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, durationSeconds, onComplete]);

  if (!isOpen) return null;

  const hostBranch = (hostPlayer?.branch as MININTBranch) || 'PNA';
  const guestBranch = (guestPlayer?.branch as MININTBranch) || 'SIC';
  const hostBranchInfo = MININT_BRANCHES[hostBranch] || MININT_BRANCHES.PNA;
  const guestBranchInfo = MININT_BRANCHES[guestBranch] || MININT_BRANCHES.SIC;

  const hostName = hostPlayer?.displayName || (hostPlayer as any)?.name || 'Anfitrião';
  const guestName = guestPlayer?.displayName || (guestPlayer as any)?.name || 'Convidado';

  const isRelampago = mode === 'relampago';

  return (
    <AnimatePresence>
      <motion.div
        key="vs-battle-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[10001] flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-hidden select-none"
      >
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Host Side Blue Glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[100px] animate-pulse" />
          {/* Guest Side Amber/Crimson Glow */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/25 rounded-full blur-[100px] animate-pulse" />
          
          {/* Tactical Grid Background Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" 
          />

          {/* Epic Center Light Streak */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2], scaleY: 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-amber-400 to-transparent hidden md:block"
          />
        </div>

        {/* TOP HEADER: Match Metadata Banner */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center gap-2 text-center pt-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Swords size={16} className="text-amber-400 animate-bounce" />
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase">
              Duelo Tático 1v1 • MININT
            </span>
            <Sparkles size={14} className="text-amber-400" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-bold text-slate-300">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-slate-200 uppercase">
              {category.replace('_', ' ')}
            </span>
            <span className="text-slate-500">•</span>
            <span className={`px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
              isRelampago 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
            }`}>
              <Zap size={12} />
              {isRelampago ? 'Modo Relâmpago (30s)' : 'Modo Padrão (20s)'}
            </span>
            {roomCode && (
              <>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  {roomCode}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* CENTER STAGE: Host Avatar Profile vs Guest Avatar Profile */}
        <div className="relative z-10 w-full max-w-4xl my-auto py-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          
          {/* HOST FIGHTER CARD (Left / Top) */}
          <motion.div
            initial={{ x: -80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="flex-1 w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center p-5 rounded-3xl bg-gradient-to-b from-blue-950/50 to-slate-900/80 border-2 border-blue-500/50 shadow-[0_0_35px_rgba(59,130,246,0.25)] relative overflow-hidden group"
          >
            {/* Corner Rank Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-black uppercase tracking-wider">
              Anfitrião
            </div>

            {/* Avatar Container with Aura */}
            <div className="relative my-3">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-md opacity-60 animate-pulse" />
              <div className="relative p-1 rounded-full bg-slate-950 border-2 border-blue-400 shadow-xl">
                <UserAvatar
                  user={hostPlayer || {}}
                  avatarId={hostPlayer?.avatarId}
                  branch={hostBranch}
                  displayName={hostName}
                  size="2xl"
                  showBranchBadge={false}
                />
              </div>
            </div>

            {/* Name & Province */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate max-w-[200px]">
              {hostName}
            </h3>

            {/* Branch Badge */}
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <Shield size={13} className="text-blue-400" />
              <span>{hostBranchInfo.id}</span>
              <span className="text-blue-400/60">•</span>
              <span className="text-[11px] text-blue-300/90 truncate max-w-[130px]">{hostBranchInfo.name}</span>
            </div>

            {/* Province Info */}
            <div className="mt-2 flex items-center gap-1 text-slate-400 text-xs font-semibold">
              <MapPin size={12} className="text-blue-400" />
              <span>{hostPlayer?.province || 'Luanda, AO'}</span>
            </div>
          </motion.div>

          {/* CLASH "VS" EMBLEM (Center) */}
          <div className="relative flex flex-col items-center justify-center my-2 md:my-0">
            {/* Shockwave expanding circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
              className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-red-500 blur-sm pointer-events-none"
            />

            {/* Center VS Diamond Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
              transition={{ type: 'spring', damping: 14, stiffness: 240 }}
              className="relative z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-red-600 p-[2px] shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/20" />
                <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  VS
                </span>
              </div>
            </motion.div>

            {/* Sub-label under VS */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-400/90 flex items-center gap-1"
            >
              <Flame size={12} className="text-amber-400 fill-amber-400" />
              <span>{totalQuestions} Rodadas</span>
            </motion.span>
          </div>

          {/* GUEST FIGHTER CARD (Right / Bottom) */}
          <motion.div
            initial={{ x: 80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="flex-1 w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center p-5 rounded-3xl bg-gradient-to-b from-amber-950/40 via-red-950/30 to-slate-900/80 border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative overflow-hidden group"
          >
            {/* Corner Tag */}
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              {guestPlayer?.isBot ? 'Adversário IA' : 'Desafiante'}
            </div>

            {/* Avatar Container with Aura */}
            <div className="relative my-3">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-red-500 rounded-full blur-md opacity-60 animate-pulse" />
              <div className="relative p-1 rounded-full bg-slate-950 border-2 border-amber-400 shadow-xl">
                <UserAvatar
                  user={guestPlayer || {}}
                  avatarId={guestPlayer?.avatarId}
                  branch={guestBranch}
                  displayName={guestName}
                  size="2xl"
                  showBranchBadge={false}
                />
              </div>
            </div>

            {/* Name & Province */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate max-w-[200px]">
              {guestName}
            </h3>

            {/* Branch Badge */}
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-bold">
              <Shield size={13} className="text-amber-400" />
              <span>{guestBranchInfo.id}</span>
              <span className="text-amber-400/60">•</span>
              <span className="text-[11px] text-amber-300/90 truncate max-w-[130px]">{guestBranchInfo.name}</span>
            </div>

            {/* Province Info */}
            <div className="mt-2 flex items-center gap-1 text-slate-400 text-xs font-semibold">
              <MapPin size={12} className="text-amber-400" />
              <span>{guestPlayer?.province || 'Benguela, AO'}</span>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM COUNTDOWN FOOTER */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 pb-2 text-center"
        >
          {/* Animated Countdown Ring / Number */}
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 font-mono"
              >
                {countdown > 0 ? countdown : '⚡'}
              </motion.div>
            </AnimatePresence>
            <div className="text-left">
              <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                {countdown > 0 ? 'A preparar combate...' : 'Combate Iniciado!'}
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Responda rápido para acumular pontos de combo!
              </div>
            </div>
          </div>

          {/* Quick Skip Button */}
          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-4 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 active:scale-95"
          >
            Começar Já →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default VsBattleOverlay;
