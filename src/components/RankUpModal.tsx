import React, { useEffect } from 'react';
import { Award, Shield, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { fireRankUpConfetti } from '../utils/confetti';
import { playLevelUpSound } from '../utils/audio';

interface RankUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRank: {
    level: number;
    title: string;
    badge: string;
    minXp: number;
  };
  oldRankTitle: string;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({
  isOpen,
  onClose,
  newRank,
  oldRankTitle,
}) => {
  useEffect(() => {
    if (isOpen) {
      fireRankUpConfetti();
      playLevelUpSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#0A0A0A] border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-slate-900 dark:text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-center overflow-hidden">
        {/* Glowing Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500" />

        {/* Badge Icon with Ripple Effect */}
        <div className="relative my-4 inline-block">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(245,158,11,0.4)]">
            {newRank.badge}
          </div>
        </div>

        {/* Title Announcement */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold uppercase tracking-widest mb-1">
            <Sparkles size={13} />
            <span>NOVA PATENTE DESBLOQUEADA!</span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            {newRank.title}
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Parabéns! Subiu de nível na hierarquia do Ministério do Interior (MININT).
          </p>
        </div>

        {/* Rank Upgrade Card */}
        <div className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 mb-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Patente Anterior:</span>
            <span className="line-through text-slate-400 dark:text-slate-500">{oldRankTitle}</span>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Shield size={14} />
              <span>Nova Patente:</span>
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-300 font-mono text-sm">
              {newRank.badge} {newRank.title} (Nível {newRank.level})
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check size={16} strokeWidth={3} />
          <span>Continuar a Estudar</span>
        </button>
      </div>
    </div>
  );
};
