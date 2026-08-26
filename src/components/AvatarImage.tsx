import React, { useState, useEffect, useRef, memo } from 'react';
import { MININTBranch, UserProfile, SavedAccount } from '../types';
import { getAvatarImagePath, getUserGender } from '../data/avatars';
import { getAccessoryItem } from '../data/avatarAccessories';
import { Loader2 } from 'lucide-react';

export interface AvatarImageProps {
  /** Optional user profile or saved account object to extract avatar/uniform/gender */
  user?: Partial<UserProfile> | Partial<SavedAccount> | any;
  /** Active user gender ('male' | 'female') */
  gender?: 'male' | 'female';
  /** Equipped uniform or avatar ID (e.g., 'pna_1', 'sic_forensic', 'pna_female') */
  uniformId?: string;
  avatarId?: string;
  id?: string;
  /** MININT branch associated with the avatar */
  branch?: MININTBranch | string;
  /** Direct custom image source override (if provided) */
  src?: string;
  /** Accessible alt text */
  alt?: string;
  /** Custom CSS classes for dimensions, borders, and effects */
  className?: string;
  /** Dimension in px or string */
  size?: number | string;
  /** Native lazy loading ('lazy' by default) */
  loading?: 'lazy' | 'eager';
  /** Image decoding ('async' by default) */
  decoding?: 'async' | 'auto' | 'sync';
  /** Browser fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Optional onError event handler */
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  /** Optional title tooltip */
  title?: string;
  /** Optional badge/pin to render on the avatar (e.g., tested badge or equipped badge) */
  badge?: string | { id?: string; symbol?: string; icon?: string; name?: string; branch?: string } | null;
  /** Tested badge/pin for live shop preview */
  testedBadge?: string | { id?: string; symbol?: string; icon?: string; name?: string; branch?: string } | null;
}

/**
 * Returns branch-specific visual theme colors for skeleton and loader
 */
function getBranchTheme(branch?: string) {
  const b = (branch || '').toUpperCase();
  if (b.includes('PNA')) {
    return {
      gradient: 'from-slate-950 via-blue-950/60 to-slate-900',
      shimmer: 'via-blue-500/20',
      spinner: 'text-blue-400',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    };
  }
  if (b.includes('SIC')) {
    return {
      gradient: 'from-slate-950 via-rose-950/40 to-slate-900',
      shimmer: 'via-rose-500/20',
      spinner: 'text-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    };
  }
  if (b.includes('SME')) {
    return {
      gradient: 'from-slate-950 via-amber-950/40 to-slate-900',
      shimmer: 'via-amber-500/20',
      spinner: 'text-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    };
  }
  if (b.includes('SPCB')) {
    return {
      gradient: 'from-slate-950 via-red-950/50 to-orange-950/40',
      shimmer: 'via-orange-500/20',
      spinner: 'text-orange-400',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]',
    };
  }
  if (b.includes('SP') || b.includes('PENITENCIÁRIO')) {
    return {
      gradient: 'from-slate-950 via-emerald-950/50 to-slate-900',
      shimmer: 'via-emerald-500/20',
      spinner: 'text-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    };
  }
  return {
    gradient: 'from-slate-950 via-slate-900 to-amber-950/30',
    shimmer: 'via-amber-500/20',
    spinner: 'text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  };
}

/**
 * AvatarImage Component
 * - Dedicated, memoized component for high-fidelity avatar and tactical uniform PNGs.
 * - Dynamic resolution of gender & uniform equipment.
 * - Native lazy loading ('lazy') & async decoding.
 * - Animated Skeleton shimmer and branch-colored loader indicator while downloading.
 * - Smooth opacity transition (fade-in) upon load.
 * - Multi-tier native error recovery with strict fallback to /avatars/pna_female.png or /avatars/pna_male.png.
 * - Optional badge/pin overlay for live testing and preview.
 */
export const AvatarImage: React.FC<AvatarImageProps> = memo(({
  user,
  gender,
  uniformId,
  avatarId,
  id,
  branch,
  src,
  alt = 'Avatar de Candidato MININT',
  className = 'w-full h-full object-cover',
  size,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  onError,
  onClick,
  title,
  badge,
  testedBadge,
}) => {
  // 1. Resolve active gender
  const rawTargetId = id || uniformId || avatarId || user?.equippedUniform || user?.avatarId || user?.avatar;
  const resolvedGender: 'male' | 'female' = 
    gender || 
    user?.gender || 
    getUserGender(user || rawTargetId || 'male');

  const resolvedBranch = (branch || user?.branch || 'PNA') as MININTBranch;

  // 2. Resolve initial image asset path
  const resolveInitialSrc = (): string => {
    if (src) return src;
    if (rawTargetId) {
      return getAvatarImagePath(rawTargetId, resolvedGender, resolvedBranch);
    }
    return `/avatars/pna_${resolvedGender}.png`;
  };

  const initialPath = resolveInitialSrc();
  const [currentSrc, setCurrentSrc] = useState<string>(initialPath);
  const [fallbackStage, setFallbackStage] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync state when props change
  useEffect(() => {
    const newPath = resolveInitialSrc();
    setCurrentSrc(newPath);
    setFallbackStage(0);

    // Synchronous memory-cache check
    if (typeof window !== 'undefined') {
      const probe = new Image();
      probe.src = newPath;
      if (probe.complete && probe.naturalWidth > 0) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    }
  }, [src, rawTargetId, resolvedGender, resolvedBranch]);

  // 3. Fallback and error handling logic
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(e);
    }

    const organ = (resolvedBranch || (typeof rawTargetId === 'string' ? rawTargetId.split('_')[0] : 'pna') || 'pna').toLowerCase();
    const cleanOrgan = ['pna', 'sic', 'sme', 'spcb', 'sp'].includes(organ) ? organ : 'pna';

    const organFallback = `/avatars/${cleanOrgan}_${resolvedGender}.png`;
    const defaultPnaFallback = `/avatars/pna_${resolvedGender}.png`;

    if (fallbackStage === 0 && currentSrc !== organFallback && organFallback !== defaultPnaFallback) {
      setFallbackStage(1);
      setCurrentSrc(organFallback);
      return;
    }

    if (currentSrc !== defaultPnaFallback) {
      setFallbackStage(2);
      setCurrentSrc(defaultPnaFallback);
      return;
    }

    setIsLoaded(true);
  };

  // 4. Resolve badge overlay (if passed)
  const targetBadge = testedBadge || badge;
  let badgeIcon: string | undefined;
  let badgeName: string | undefined;

  if (targetBadge && targetBadge !== 'badge_none') {
    if (typeof targetBadge === 'string') {
      const item = getAccessoryItem(targetBadge);
      if (item && item.id !== 'badge_none') {
        badgeIcon = item.icon;
        badgeName = item.name;
      }
    } else if (typeof targetBadge === 'object') {
      badgeIcon = targetBadge.symbol || targetBadge.icon;
      badgeName = targetBadge.name;
    }
  }

  const sizeStyle: React.CSSProperties = size !== undefined
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : {};

  const theme = getBranchTheme(resolvedBranch || branch);

  // Spinner size dynamically calculated
  const spinnerSize = typeof size === 'number'
    ? Math.max(12, Math.min(26, Math.floor(size / 3.5)))
    : 16;

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
      style={sizeStyle}
    >
      {/* 🌟 SKELETON SHIMMER & SPINNER INDICATOR */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 pointer-events-none`}
        >
          {/* Animated Shimmer Stripe */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />

          {/* Branch-colored Spinner */}
          <div className="relative z-10 flex flex-col items-center justify-center p-1">
            <Loader2
              size={spinnerSize}
              className={`animate-spin ${theme.spinner} opacity-90 drop-shadow-xs`}
            />
          </div>
        </div>
      )}

      {/* 🖼️ HIGH-FIDELITY AVATAR IMAGE WITH FADE-IN */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        // @ts-ignore React 18 / HTMLImageElement fetchPriority support
        fetchPriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        onClick={onClick}
        title={title}
        className={`w-full h-full object-cover select-none pointer-events-auto transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 🎖️ BADGE / PIN OVERLAY */}
      {badgeIcon && (
        <div
          className="absolute -bottom-1 -right-1 z-20 pointer-events-none select-none flex items-center justify-center"
          title={badgeName ? `Distintivo: ${badgeName}` : undefined}
        >
          <div className="bg-slate-950/95 text-amber-300 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.85)] flex items-center justify-center ring-1 ring-amber-400/50">
            <span className="text-[10px] sm:text-xs leading-none drop-shadow-sm filter">
              {badgeIcon}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

AvatarImage.displayName = 'AvatarImage';
