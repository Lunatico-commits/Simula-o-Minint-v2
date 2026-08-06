import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../data/badges';
import { Sparkles, Check, Zap, Award } from 'lucide-react';
import { fireRankUpConfetti } from '../utils/confetti';
import { playLevelUpSound } from '../utils/audio';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badge, onClose }) => {
  useEffect(() => {
    if (badge) {
      fireRankUpConfetti();
      playLevelUpSound();
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white dark:bg-[#0A0A0A] border border-amber-500/50 rounded-3xl max-w-sm w-full p-6 text-slate-900 dark:text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative text-center overflow-hidden"
      >
        {/* Top Banner Gradient */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${badge.gradient}`} />

        {/* Badge Emoji/Icon with Glowing Bounce Animation */}
        <div className="relative my-4 inline-block">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", type: "tween" }}
            className="absolute inset-0 rounded-3xl bg-amber-500/30 blur-sm"
          />
          <motion.div
            initial={{ scale: 0.2, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${badge.gradient} border-2 border-amber-400 flex items-center justify-center text-5xl shadow-[0_0_35px_rgba(245,158,11,0.5)]`}
          >
            <motion.span
              animate={{ y: [0, -5, 0], scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", type: "tween" }}
            >
              {badge.emoji}
            </motion.span>
          </motion.div>
        </div>

        {/* Title Announcement */}
        <div className="space-y-1 mb-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", type: "tween" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-500 text-[11px] font-mono font-black uppercase tracking-widest mb-1 shadow-xs"
          >
            <Sparkles size={13} className="animate-spin" />
            <span>NOVA CONQUISTA DESBLOQUEADA!</span>
          </motion.div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            {badge.title}
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
            {badge.description}
          </p>
        </div>

        {/* Reward Box */}
        <div className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", type: "tween" }}
              className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500"
            >
              <Zap size={18} />
            </motion.div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Recompensa em Bónus</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">+{badge.xpReward} Pontos de XP</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 uppercase font-mono">
            Conquistado
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Check size={18} strokeWidth={3} />
          <span>Colecionar Badge</span>
        </button>
      </motion.div>
    </div>
  );
};
