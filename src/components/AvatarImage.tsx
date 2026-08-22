import React, { useState, useEffect, memo } from 'react';
import { MININTBranch, UserProfile, SavedAccount } from '../types';
import { getAvatarImagePath, getUserGender } from '../data/avatars';

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
}

/**
 * AvatarImage Component
 * - Dedicated, memoized component for high-fidelity avatar and tactical uniform PNGs.
 * - Dynamic resolution of gender & uniform equipment.
 * - Native lazy loading ('lazy') & async decoding.
 * - Multi-tier native error recovery with strict fallback to /avatars/pna_female.png or /avatars/pna_male.png.
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

  const sizeStyle: React.CSSProperties = size !== undefined
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : {};

  return (
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
});

AvatarImage.displayName = 'AvatarImage';
