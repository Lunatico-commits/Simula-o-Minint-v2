import React, { useState, useEffect, memo } from 'react';
import { MININTBranch, UserProfile, SavedAccount } from '../types';
import { getAvatarImagePath, getUserGender } from '../data/avatars';
import { getAccessoryItem } from '../data/avatarAccessories';

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
 * AvatarImage Component
 * - Dedicated, memoized component for high-fidelity avatar and tactical uniform PNGs.
 * - Dynamic resolution of gender & uniform equipment.
 * - Native lazy loading ('lazy') & async decoding.
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

  // Sync state when props change
  useEffect(() => {
    const newPath = resolveInitialSrc();
    setCurrentSrc(newPath);
    setFallbackStage(0);
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

  const imageElement = (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleImageError}
      onClick={onClick}
      title={title}
      style={sizeStyle}
      className={`select-none pointer-events-auto transition-opacity duration-200 ${className}`}
    />
  );

  if (badgeIcon) {
    return (
      <div className="relative inline-block" style={sizeStyle}>
        {imageElement}
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
      </div>
    );
  }

  return imageElement;
});

AvatarImage.displayName = 'AvatarImage';
