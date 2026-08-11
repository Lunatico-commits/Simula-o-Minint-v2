import { UserProfile } from '../types';

/**
 * Returns YYYY-MM-DD for today in local date
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns YYYY-MM-DD for yesterday in local date
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates whether the current streak stored in user profile is active or expired.
 * If user's last streak date was before yesterday, streak resets to 0.
 */
export function calculateCurrentStreak(profile?: Partial<UserProfile> | null): { streak: number; isExpired: boolean; usedStreakFreeze?: boolean } {
  if (!profile) return { streak: 0, isExpired: false };

  const lastDate = profile.lastDailyDate;
  const currentStreak = profile.dailyStreak || 0;

  if (!lastDate || currentStreak <= 0) {
    return { streak: 0, isExpired: false };
  }

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  if (lastDate === todayStr || lastDate === yesterdayStr) {
    return { streak: currentStreak, isExpired: false };
  }

  // If user missed days but has a Streak Freeze, save the streak!
  if (profile.streakFreezeCount && profile.streakFreezeCount > 0) {
    return { streak: currentStreak, isExpired: false, usedStreakFreeze: true };
  }

  // Older than yesterday without freeze => Missed a day, streak reset to 0!
  return { streak: 0, isExpired: true };
}

/**
 * Calculates new streak when user completes a quiz/study session today.
 */
export function updateStreakOnQuizCompletion(profile: UserProfile): {
  newStreak: number;
  newLastDate: string;
  increased: boolean;
  consumedFreeze?: boolean;
} {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const lastDate = profile.lastDailyDate;
  const currentStreak = profile.dailyStreak || 0;

  if (lastDate === todayStr) {
    // Already completed a session today, streak remains active as is
    return {
      newStreak: Math.max(1, currentStreak),
      newLastDate: todayStr,
      increased: false,
    };
  }

  if (lastDate === yesterdayStr) {
    // Consecutive day study! Increment streak!
    return {
      newStreak: currentStreak + 1,
      newLastDate: todayStr,
      increased: true,
    };
  }

  // Missed days - check if saved by Streak Freeze
  if (profile.streakFreezeCount && profile.streakFreezeCount > 0 && currentStreak > 0) {
    return {
      newStreak: currentStreak + 1,
      newLastDate: todayStr,
      increased: true,
      consumedFreeze: true,
    };
  }

  // Missed days without freeze => Start 1-day streak
  return {
    newStreak: 1,
    newLastDate: todayStr,
    increased: true,
  };
}
