import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Crown, CheckCircle2, Zap } from 'lucide-react';
import { MININTBranch, AvatarAccessories } from '../types';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { getAccessoryItem } from '../data/avatarAccessories';
import { BranchIllustration } from './BranchIllustration';

export type AvatarReactionType = 'idle' | 'victory' | 'quizComplete' | 'levelUp' | 'celebrate';

export interface ReactiveAvatarProps {
  avatarId?: string;
  branch?: MININTBranch;
  displayName?: string;
  photoURL?: string;
  accessories?: AvatarAccessories;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedUniform?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  reaction?: AvatarReactionType;
  triggerReaction?: number | string | boolean;
  reactionDurationMs?: number;
  showBranchBadge?: boolean;
  showLevelBadge?: boolean;
  level?: number;
  isVipSupporter?: boolean;
  isFirstPlace?: boolean;
  interactive?: boolean;
  className?: string;
  onReactionComplete?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

const SIZE_MAP = {
  xs: {
    box: 'w-8 h-8',
    text: 'text-base',
    badgeSize: 10,
    levelText: 'text-[8px]',
    frameInset: '-inset-1',
    frameSize: 'w-[calc(100%+8px)] h-[calc(100%+8px)]',
    pinSize: 'text-[9px]',
    pinContainer: 'p-0.5',
  },
  sm: {
    box: 'w-10 h-10',
    text: 'text-xl',
    badgeSize: 12,
    levelText: 'text-[9px]',
    frameInset: '-inset-1.5',
    frameSize: 'w-[calc(100%+12px)] h-[calc(100%+12px)]',
    pinSize: 'text-[11px]',
    pinContainer: 'p-0.5',
  },
  md: {
    box: 'w-12 h-12',
    text: 'text-2xl',
    badgeSize: 14,
    levelText: 'text-[10px]',
    frameInset: '-inset-1.5',
    frameSize: 'w-[calc(100%+12px)] h-[calc(100%+12px)]',
    pinSize: 'text-[13px]',
    pinContainer: 'p-1',
  },
  lg: {
    box: 'w-16 h-16',
    text: 'text-3xl',
    badgeSize: 16,
    levelText: 'text-[11px]',
    frameInset: '-inset-2',
    frameSize: 'w-[calc(100%+16px)] h-[calc(100%+16px)]',
    pinSize: 'text-[16px]',
    pinContainer: 'p-1',
  },
  xl: {
    box: 'w-20 h-20',
    text: 'text-4xl',
    badgeSize: 18,
    levelText: 'text-xs',
    frameInset: '-inset-2.5',
    frameSize: 'w-[calc(100%+20px)] h-[calc(100%+20px)]',
    pinSize: 'text-[20px]',
    pinContainer: 'p-1.5',
  },
  '2xl': {
    box: 'w-24 h-24',
    text: 'text-5xl',
    badgeSize: 20,
    levelText: 'text-xs',
    frameInset: '-inset-3',
    frameSize: 'w-[calc(100%+24px)] h-[calc(100%+24px)]',
    pinSize: 'text-[24px]',
    pinContainer: 'p-1.5',
  },
  '3xl': {
    box: 'w-28 h-28',
    text: 'text-6xl',
    badgeSize: 22,
    levelText: 'text-sm',
    frameInset: '-inset-3.5',
    frameSize: 'w-[calc(100%+28px)] h-[calc(100%+28px)]',
    pinSize: 'text-[28px]',
    pinContainer: 'p-2',
  },
};

export const ReactiveAvatar: React.FC<ReactiveAvatarProps> = ({
  avatarId = 'pna_1',
  branch = 'PNA',
  displayName = 'Candidato',
  photoURL,
  accessories,
  equippedFrame,
  equippedBackground,
  equippedUniform,
  size = 'md',
  reaction = 'idle',
  triggerReaction,
  reactionDurationMs = 3500,
  showBranchBadge = false,
  showLevelBadge = false,
  level,
  isVipSupporter = false,
  isFirstPlace = false,
  interactive = false,
  className = '',
  onReactionComplete,
  onClick,
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

  const handleAvatarClick = (e: React.MouseEvent) => {
    onClick?.(e);
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

  const isReacting = activeReaction !== 'idle';

  // 3 Guaranteed Accessory Layers: Background, Frame, Pin/Badge (resolving singular & plural keys)
  const resolvedFrameId = equippedFrame || accessories?.frame || (accessories as any)?.frames;
  const resolvedBgId = equippedBackground || accessories?.background || (accessories as any)?.backgrounds;
  const resolvedBadgeId = accessories?.badge || (accessories as any)?.badges;

  const bgItem = getAccessoryItem(resolvedBgId);
  const frameItem = getAccessoryItem(resolvedFrameId);
  const badgeItem = getAccessoryItem(resolvedBadgeId);

  const bgGradient = bgItem?.layerClass
    ? `bg-gradient-to-br ${bgItem.layerClass}`
    : `bg-gradient-to-br ${branchInfo.badgeBg}`;

  const hasSpecialFrame = frameItem && frameItem.id !== 'frame_none';

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

  // Speech Balloon Y-offset calculation based on avatar size
  const getBalloonYOffset = () => {
    switch (size) {
      case 'xs':
      case 'sm':
        return '-translate-y-9';
      case 'md':
        return '-translate-y-11';
      case 'lg':
        return '-translate-y-14';
      case 'xl':
        return '-translate-y-16';
      case '2xl':
      case '3xl':
        return '-translate-y-20';
      default:
        return '-translate-y-12';
    }
  };

  const hasBadgePin = badgeItem && badgeItem.id !== 'badge_none';

  return (
    <div className={`relative inline-block p-1 select-none ${className}`}>
      {/* Interactive Speech Bubble Click Message */}
      <AnimatePresence>
        {clickMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className={`absolute z-40 top-0 left-1/2 -translate-x-1/2 ${getBalloonYOffset()} pointer-events-none whitespace-nowrap`}
          >
            <div className="bg-slate-950/95 text-amber-300 font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] border border-amber-400/80 flex items-center gap-1.5 backdrop-blur-md">
              <span>{clickMessage}</span>
            </div>
            <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-amber-400/80 transform rotate-45 mx-auto -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Reaction Banner (Victory, Level Up, Quiz Complete, Celebrate) */}
      <AnimatePresence>
        {isReacting && banner && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap"
          >
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow-lg border border-black/20 ${banner.bg}`}
            >
              <banner.icon size={11} className="shrink-0" />
              <span>{banner.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Particle Burst */}
      {isReacting && (
        <div key={particleKey} className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.3, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 38,
                y: Math.sin((i * 60 * Math.PI) / 180) * 38,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.2, repeat: 1, repeatType: 'reverse', delay: i * 0.08 }}
              className="absolute text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            >
              {i % 2 === 0 ? '✨' : '🌟'}
            </motion.span>
          ))}
        </div>
      )}

      {/* Outer Glowing Pulsing Aura Ring when Reacting or when Equipped with Flame/Gold */}
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

      {/* Aura Chamas Operacionais: Dynamic Fire Glow Wave */}
      {frameItem?.id === 'frame_flame_warrior' && (
        <motion.div
          animate={{
            scale: [1, 1.12, 0.98, 1.08, 1],
            opacity: [0.7, 1, 0.6, 0.95, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-500/35 via-rose-500/45 to-yellow-500/35 blur-sm z-0 pointer-events-none"
        />
      )}

      {/* 1º Lugar Golden Aura & Championship Glow */}
      {isFirstPlace && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.16, 1.04, 1.14, 1],
              opacity: [0.75, 1, 0.7, 0.95, 0.75],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2.5 sm:-inset-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 blur-md z-0 pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.02, 1.22, 1.02],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1.5 sm:-inset-2 rounded-full border-2 border-amber-300 shadow-[0_0_22px_rgba(251,191,36,0.9)] z-0 pointer-events-none"
          />
        </>
      )}

      {/* AVATAR CONTAINER: relative circle with clear unclipped overlay layers */}
      <div
        className={`relative ${sizeConfig.box} rounded-full flex items-center justify-center`}
      >
        {/* INNER CIRCLE (Background + Base Avatar / Photo) */}
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
          whileHover={interactive ? { scale: 1.06, rotate: 2 } : undefined}
          whileTap={interactive ? { scale: 0.94 } : undefined}
          className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center relative z-10 ${
            interactive ? 'cursor-pointer' : ''
          }`}
        >
          {/* Layer 1: [Fundo / Gradiente] (z-0) */}
          <div className={`absolute inset-0 rounded-full z-0 pointer-events-none select-none ${bgGradient}`} />

          {/* Layer 2: [Avatar / Farda Base / Imagem do Avatar] (z-10) */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none select-none">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-full h-full rounded-full object-cover pointer-events-none select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}

            {/* Base Emoji / Symbol / Initials (if no photo or fallback) */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`sym-${getReactionSymbol()}-${avatarOption.id}`}
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                className={`font-black select-none pointer-events-none ${sizeConfig.text} ${
                  avatarOption.isCustomInitials
                    ? 'font-mono tracking-wider text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                    : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                }`}
              >
                {getReactionSymbol()}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Shimmer Streak Effect when Celebrating */}
          {isReacting && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 pointer-events-none z-15"
            />
          )}

          {/* Fallback internal border for default cadet ring */}
          {!hasSpecialFrame && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] pointer-events-none z-15" />
          )}
        </motion.div>

        {/* Layer 3: [Moldura Equipada / Equipped Frame Overlay] (z-20) */}
        {hasSpecialFrame && frameItem && (
          <div
            className={`absolute ${sizeConfig.frameInset} ${sizeConfig.frameSize} pointer-events-none select-none z-20 flex items-center justify-center transition-all`}
          >
            {frameItem.imageUrl ? (
              <img
                src={frameItem.imageUrl}
                alt={frameItem.name}
                className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]"
              />
            ) : (
              <div
                className={`w-full h-full rounded-full pointer-events-none select-none ${
                  frameItem.layerClass || ''
                }`}
              />
            )}
          </div>
        )}
      </div>

      {/* Layer 4: [Pin / Distintivo no Canto Inferior Direito] */}
      {hasBadgePin && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`absolute z-30 pointer-events-none select-none flex items-center justify-center ${
            showBranchBadge ? '-bottom-1 -left-1' : '-bottom-0.5 -right-0.5'
          }`}
          title={`Distintivo: ${badgeItem.name}`}
        >
          <div className={`bg-slate-950/95 text-amber-300 ${sizeConfig.pinContainer} rounded-full border border-amber-400 shadow-[0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
            <span className={`leading-none drop-shadow-sm ${sizeConfig.pinSize}`}>
              {badgeItem.icon}
            </span>
          </div>
        </motion.div>
      )}

      {/* Top Right Crown / VIP Badge */}
      {isVipSupporter && (
        <motion.div
          animate={isReacting ? { rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1, repeat: isReacting ? Infinity : 0 }}
          className="absolute -top-1.5 -right-1.5 z-25 bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 p-1 rounded-full border border-slate-900 shadow-md flex items-center justify-center"
          title="Apoiador VIP MININT"
        >
          <Crown size={sizeConfig.badgeSize} className="fill-slate-950 stroke-slate-950" />
        </motion.div>
      )}

      {/* Bottom Right Branch Badge */}
      {showBranchBadge && (
        <div
          className="absolute -bottom-1 -right-1 z-25 bg-amber-500 text-slate-950 font-black px-1 py-0.5 rounded-full border border-slate-950 shadow-md flex items-center gap-0.5"
          title={`Ramo: ${branchInfo.name}`}
        >
          <BranchIllustration branch={branch} size={sizeConfig.badgeSize} />
          <span className={`uppercase font-mono ${sizeConfig.levelText}`}>{branchInfo.id}</span>
        </div>
      )}

      {/* Bottom Left Level Badge (if showLevelBadge & not conflicting with pin on bottom-left) */}
      {showLevelBadge && level !== undefined && !hasBadgePin && (
        <div
          className="absolute -bottom-1 -left-1 z-25 bg-slate-900 text-amber-300 font-black px-1.5 py-0.5 rounded-full border border-amber-500/50 shadow-md flex items-center gap-0.5"
          title={`Nível ${level}`}
        >
          <Zap size={sizeConfig.badgeSize - 2} className="text-amber-400 fill-amber-400" />
          <span className={`font-mono ${sizeConfig.levelText}`}>Lvl {level}</span>
        </div>
      )}
    </div>
  );
};

// Aliases for compatibility
export const UserAvatar = ReactiveAvatar;
export const AvatarContainer = ReactiveAvatar;
