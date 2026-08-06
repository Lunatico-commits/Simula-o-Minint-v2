import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles } from 'lucide-react';

interface CircularXpProgressRingProps {
  totalXp: number;
  targetXp?: number;
  className?: string;
}

export const CircularXpProgressRing: React.FC<CircularXpProgressRingProps> = ({
  totalXp,
  targetXp = 50000,
  className = '',
}) => {
  const currentXp = totalXp || 0;
  const percentage = Math.min(100, (currentXp / targetXp) * 100);
  const formattedCurrent = currentXp.toLocaleString('pt-AO');
  const formattedTarget = targetXp.toLocaleString('pt-AO');

  const size = 180;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = (size - strokeWidth - 12) / 2; // radius ~ 67
  const circumference = 2 * Math.PI * radius; // ~ 420.97
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-500/15 via-slate-900/60 to-slate-950 border border-amber-500/40 rounded-2xl shadow-xl relative overflow-hidden ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center gap-1.5 mb-2 z-10 text-center">
        <Sparkles size={14} className="text-amber-400 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
          Progresso do Certificado (50.000 XP)
        </span>
      </div>

      {/* SVG Ring */}
      <div className="relative flex items-center justify-center my-1 z-10" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="goldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800/90"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Dotted outer accent ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 9}
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="transparent"
          />

          {/* Gold Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#goldRingGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#goldGlowFilter)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none z-10">
          <span className="text-[8px] uppercase font-mono font-bold tracking-widest text-slate-400 mb-0.5">
            CONTAGEM XP
          </span>

          {/* Center XP count in vibrant gold */}
          <div className="text-amber-400 font-mono font-black tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)] text-center leading-tight">
            <span className="text-xs sm:text-sm font-extrabold text-amber-400 block">
              {formattedCurrent} / {formattedTarget} XP
            </span>
          </div>

          {/* Percentage Badge */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", type: "tween" }}
            className="mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] font-mono flex items-center gap-1 shadow-xs"
          >
            <Award size={10} className="text-amber-400" />
            <span>{percentage.toFixed(1)}%</span>
          </motion.div>
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center mt-2 font-medium z-10">
        {percentage >= 100
          ? '🎉 Meta de 50.000 XP atingida! O seu certificado está pronto.'
          : `Faltam ${Math.max(0, targetXp - currentXp).toLocaleString('pt-AO')} XP para os 50.000 XP do certificado.`}
      </p>
    </div>
  );
};
