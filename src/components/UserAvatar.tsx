import React from 'react';
import { UserProfile, DuelPlayer, SavedAccount, MININTBranch, AvatarAccessories } from '../types';
import { ReactiveAvatar, AvatarReactionType } from './ReactiveAvatar';

export interface UserAvatarProps {
  user?: Partial<UserProfile> | Partial<DuelPlayer> | Partial<SavedAccount> | any;
  avatarId?: string;
  branch?: MININTBranch;
  displayName?: string;
  photoURL?: string;
  accessories?: AvatarAccessories;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedUniform?: string;
  equippedFaceAccessory?: string;
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

/**
 * Standardized reusable UserAvatar component.
 * Ensures consistent rendering of avatar symbol, equipped frames, backgrounds,
 * pins/badges, and branch insignias across Rankings, Podiums, Duel lobbies, and Headers.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  avatarId,
  branch,
  displayName,
  photoURL,
  accessories,
  equippedFrame,
  equippedBackground,
  equippedUniform,
  equippedFaceAccessory,
  size = 'md',
  reaction = 'idle',
  triggerReaction,
  reactionDurationMs,
  showBranchBadge = false,
  showLevelBadge = false,
  level,
  isVipSupporter,
  isFirstPlace,
  interactive = false,
  className = '',
  onReactionComplete,
  onClick,
}) => {
  // Extract and prioritize values from user object if provided
  const resolvedAvatarId = avatarId || user?.avatarId || user?.avatar || (user?.photoURL ? undefined : 'pna_1');
  const resolvedBranch = (branch || user?.branch || 'PNA') as MININTBranch;
  const resolvedDisplayName = displayName || user?.displayName || user?.name || 'Candidato';
  const resolvedPhotoURL = photoURL || user?.photoURL || (typeof user?.avatar === 'string' && user.avatar.startsWith('http') ? user.avatar : undefined);
  
  // Resolve accessories object
  const resolvedAccessories: AvatarAccessories = accessories || user?.avatarAccessories || user?.accessories || {
    frame: user?.equippedFrame || 'frame_none',
    background: user?.equippedBackground || 'bg_default',
    badge: 'badge_none',
    faceAccessory: user?.equippedFaceAccessory || 'face_none',
  };

  const resolvedEquippedFrame = equippedFrame || user?.equippedFrame || resolvedAccessories?.frame || (resolvedAccessories as any)?.frames;
  const resolvedEquippedBackground = equippedBackground || user?.equippedBackground || resolvedAccessories?.background || (resolvedAccessories as any)?.backgrounds;
  const resolvedEquippedUniform = equippedUniform || user?.equippedUniform;
  const resolvedEquippedFaceAccessory = equippedFaceAccessory || user?.equippedFaceAccessory || resolvedAccessories?.faceAccessory || resolvedAccessories?.face;
  const resolvedLevel = level ?? user?.level;
  const resolvedIsVipSupporter = isVipSupporter ?? Boolean(user?.isVipSupporter);
  const resolvedIsFirstPlace = isFirstPlace ?? Boolean(user?.isFirstPlace);

  return (
    <ReactiveAvatar
      avatarId={resolvedAvatarId}
      branch={resolvedBranch}
      displayName={resolvedDisplayName}
      photoURL={resolvedPhotoURL}
      accessories={resolvedAccessories}
      equippedFrame={resolvedEquippedFrame}
      equippedBackground={resolvedEquippedBackground}
      equippedUniform={resolvedEquippedUniform}
      equippedFaceAccessory={resolvedEquippedFaceAccessory}
      size={size}
      reaction={reaction}
      triggerReaction={triggerReaction}
      reactionDurationMs={reactionDurationMs}
      showBranchBadge={showBranchBadge}
      showLevelBadge={showLevelBadge}
      level={resolvedLevel}
      isVipSupporter={resolvedIsVipSupporter}
      isFirstPlace={resolvedIsFirstPlace}
      interactive={interactive}
      className={className}
      onReactionComplete={onReactionComplete}
      onClick={onClick}
    />
  );
};
