import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Crown, Star, Flame, Award, CheckCircle2, Zap } from 'lucide-react';
import { MININTBranch } from '../types';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { BranchIllustration } from './BranchIllustration';

export type AvatarReactionType = 'idle' | 'victory' | 'quizComplete' | 'levelUp' | 'celebrate';

export interface ReactiveAvatarProps {
  avatarId?: string;
  branch?: MININTBranch;
  displayName?: string;
  photoURL?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  reaction?: AvatarReactionType;
  triggerReaction?: number | string | boolean;
  reactionDurationMs?: number;
  showBranchBadge?: boolean;
  showLevelBadge?: boolean;
  level?: number;
  isVipSupporter?: boolean;
  interactive?: boolean;
  className?: string;
  onReactionComplete?: () => void;
}

const SIZE_MAP = {
  xs: { box: 'w-8 h-8', text: 'text-base', badgeSize: 10, levelText: 'text-[8px]', ringOffset: '-p-0.5' },
  sm: { box: 'w-10 h-10', text: 'text-xl', badgeSize: 12, levelText: 'text-[9px]', ringOffset: '-p-1' },
  md: { box: 'w-12 h-12', text: 'text-2xl', badgeSize: 14, levelText: 'text-[10px]', ringOffset: '-p-1' },
  lg: { box: 'w-16 h-16', text: 'text-3xl', badgeSize: 16, levelText: 'text-[11px]', ringOffset: '-p-1.5' },
  xl: { box: 'w-20 h-20', text: 'text-4xl', badgeSize: 18, levelText: 'text-xs', ringOffset: '-p-2' },
  '2xl': { box: 'w-24 h-24', text: 'text-5xl', badgeSize: 20, levelText: 'text-xs', ringOffset: '-p-2.5' },
  '3xl': { box: 'w-28 h-28', text: 'text-6xl', badgeSize: 22, levelText: 'text-sm', ringOffset: '-p-3' },
};

export const ReactiveAvatar: React.FC<ReactiveAvatarProps> = ({
  avatarId = 'pna_1',
  branch = 'PNA',
  displayName = 'Candidato',
  photoURL,
  size = 'md',
  reaction = 'idle',
  triggerReaction,
  reactionDurationMs = 3500,
  showBranchBadge = false,
  showLevelBadge = false,
  level,
  isVipSupporter = false,
  interactive = false,
  className = '',
  onReactionComplete,
}) => {
  const [activeReaction, setActiveReaction] = useState<AvatarReactionType>(reaction);
  const [particleKey, setParticleKey] = useState<number>(0);
  const [clickMessage, setClickMessage] = useState<string | null>(null);

  // Sync external reaction prop
  useEffect(() => {
    if (reaction !== 'idle') {
      setActiveReaction(reaction);
      setParticleKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setActiveReaction('idle');
        onReactionComplete?.();
      }, reactionDurationMs);

      return () => clearTimeout(timer);
    }
  }, [reaction, reactionDurationMs]);

  // Sync triggerReaction prop changes
  useEffect(() => {
    if (triggerReaction !== undefined && triggerReaction !== null && triggerReaction !== false) {
      setActiveReaction('celebrate');
      setParticleKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setActiveReaction('idle');
        onReactionComplete?.();
      }, reactionDurationMs);

      return () => clearTimeout(timer);
    }
  }, [triggerReaction, reactionDurationMs]);

  const handleAvatarClick = () => {
    if (!interactive) return;

    const messages = [
      '¡Força e Honra! 👮‍♂️🔥',
      '¡Rumo à Aprovação! 🎯',
      '¡Disciplina MININT! 🛡️',
      '¡Pronto para Servir! 🇦🇴',
      '¡Foco Total no Exame! 🏆',
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setClickMessage(randomMsg);

    setActiveReaction('celebrate');
    setParticleKey(prev => prev + 1);

    setTimeout(() => {
      setClickMessage(null);
    }, 2200);

    setTimeout(() => {
      setActiveReaction('idle');
      onReactionComplete?.();
    }, reactionDurationMs);
  };

  const avatarOption = getAvatarOption(avatarId, branch as MININTBranch, displayName);
  const safeBranch = (branch as MININTBranch) || 'PNA';
  const branchInfo = MININT_BRANCHES[safeBranch] || MININT_BRANCHES.PNA;
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Reaction-based custom symbols and badges
  const getReactionSymbol = () => {
    switch (activeReaction) {
      case 'victory':
        return '🏆';
      case 'levelUp':
        return '👑';
      case 'quizComplete':
        return '💯';
      case 'celebrate':
        return '🥳';
      default:
        return avatarOption.symbol;
    }
  };

  const getReactionBanner = () => {
    switch (activeReaction) {
      case 'victory':
        return { text: '¡VITÓRIA!', bg: 'bg-emerald-500 text-slate-950', icon: Trophy };
      case 'levelUp':
        return { text: '¡NÍVEL UP!', bg: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950', icon: Crown };
      case 'quizComplete':
        return { text: '¡APROVADO!', bg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white', icon: CheckCircle2 };
      case 'celebrate':
        return { text: '¡CELEBRAÇÃO!', bg: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-slate-950', icon: Sparkles };
      default:
        return null;
    }
  };

  const banner = getReactionBanner();
  const isReacting = activeReaction !== 'idle';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Click Interactive Message Toast */}
      <AnimatePresence>
        {clickMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -38, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-3 z-30 pointer-events-none whitespace-nowrap bg-slate-900/95 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/50 shadow-xl backdrop-blur-md flex items-center gap-1"
          >
            <span>{clickMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Reaction Banner Header */}
      <AnimatePresence>
        {banner && !clickMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: size === 'xs' || size === 'sm' ? -18 : -22, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className={`absolute z-30 pointer-events-none whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/20 ${banner.bg}`}
          >
            <banner.icon size={10} className="stroke-[3]" />
            <span>{banner.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebrating Particle Sparkles Ring */}
      {isReacting && (
        <div key={`particles-${particleKey}`} className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.span
              key={`p-${deg}-${i}`}
              initial={{ opacity: 1, scale: 0.2, x: 0, y: 0 }}
              animate={{
                opacity: [1, 0.9, 0],
                scale: [0.3, 1.2, 0.4],
                x: Math.cos((deg * Math.PI) / 180) * (size === 'xl' || size === '2xl' ? 52 : 36),
                y: Math.sin((deg * Math.PI) / 180) * (size === 'xl' || size === '2xl' ? 52 : 36),
              }}
              transition={{ duration: 1.2, repeat: 1, repeatType: 'reverse', delay: i * 0.08 }}
              className="absolute text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            >
              {i % 2 === 0 ? '✨' : '🌟'}
            </motion.span>
          ))}
        </div>
      )}

      {/* Outer Glowing Pulsing Aura Ring when Reacting */}
      {isReacting && (
        <motion.div
          animate={{
            scale: [1, 1.22, 1.05, 1.18, 1],
            opacity: [0.6, 0.9, 0.5, 0.85, 0.6],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-600/40 blur-md z-0 pointer-events-none"
        />
      )}

      {/* Main Avatar Circle */}
      <motion.div
        onClick={handleAvatarClick}
        animate={
          isReacting
            ? {
                scale: [1, 1.22, 0.92, 1.12, 1],
                rotate: [0, -10, 10, -5, 5, 0],
                y: [0, -8, 0, -4, 0],
              }
            : { scale: 1, rotate: 0, y: 0 }
        }
        transition={{ duration: 0.65, ease: 'easeInOut' }}
        whileHover={interactive ? { scale: 1.08, rotate: 3 } : undefined}
        whileTap={interactive ? { scale: 0.94 } : undefined}
        className={`relative z-10 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-md transition-shadow ${sizeConfig.box} ${
          isReacting
            ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.7)] bg-gradient-to-br from-amber-400/30 via-slate-900 to-yellow-500/30'
            : 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-gradient-to-br ' + branchInfo.badgeBg
        } ${interactive ? 'cursor-pointer' : ''}`}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image if fails and fallback to emoji/initials
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}

        {/* Emoji / Symbol / Initials */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`sym-${getReactionSymbol()}-${avatarOption.id}`}
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            className={`font-black select-none ${sizeConfig.text} ${
              avatarOption.isCustomInitials
                ? 'font-mono tracking-wider text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
            }`}
          >
            {getReactionSymbol()}
          </motion.span>
        </AnimatePresence>

        {/* Shimmer Streak Effect when Celebrating */}
        {isReacting && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 pointer-events-none"
          />
        )}
      </motion.div>

      {/* Top Right Crown / VIP Badge */}
      {isVipSupporter && (
        <motion.div
          animate={isReacting ? { rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1, repeat: isReacting ? Infinity : 0 }}
          className="absolute -top-1.5 -right-1.5 z-20 bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 p-1 rounded-full border border-slate-900 shadow-md flex items-center justify-center"
          title="Apoiador VIP MININT"
        >
          <Crown size={sizeConfig.badgeSize} className="fill-slate-950 stroke-slate-950" />
        </motion.div>
      )}

      {/* Bottom Right Branch Badge */}
      {showBranchBadge && (
        <div
          className="absolute -bottom-1 -right-1 z-20 bg-amber-500 text-slate-950 font-black px-1 py-0.5 rounded-full border border-slate-950 shadow-md flex items-center gap-0.5"
          title={`Ramo: ${branchInfo.name}`}
        >
          <BranchIllustration branch={branch} size={sizeConfig.badgeSize} />
          <span className={`uppercase font-mono ${sizeConfig.levelText}`}>{branchInfo.id}</span>
        </div>
      )}

      {/* Bottom Left Level Badge */}
      {showLevelBadge && level !== undefined && (
        <div
          className="absolute -bottom-1 -left-1 z-20 bg-slate-900 text-amber-300 font-black px-1.5 py-0.5 rounded-full border border-amber-500/50 shadow-md flex items-center gap-0.5"
          title={`Nível ${level}`}
        >
          <Zap size={sizeConfig.badgeSize - 2} className="text-amber-400 fill-amber-400" />
          <span className={`font-mono ${sizeConfig.levelText}`}>Lvl {level}</span>
        </div>
      )}
    </div>
  );
};
