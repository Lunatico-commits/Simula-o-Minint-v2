import { Question, DailyChallengeEntry, UserProfile } from '../types';
import { QUESTION_BANK } from '../data/questions';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getRandomQuestions } from './questionSelector';

/**
 * Returns YYYY-MM-DD date string
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a dynamic, randomly shuffled 10-question set for Daily Challenge
 * using Fisher-Yates shuffle, avoiding recent question repetitions.
 */
export function getDailyChallengeQuestions(dateStr?: string): Question[] {
  return getRandomQuestions({
    count: 10,
    modeKey: 'desafio',
  });
}

/**
 * Calculates XP Bonus earned in the Daily Challenge
 */
export function calculateDailyChallengeXP(
  score: number,
  totalQuestions: number = 10,
  totalTimeSeconds: number = 60,
  streak: number = 1
) {
  const baseXP = score * 12; // 12 XP per correct answer
  const completionBonus = 100; // 100 XP fixed completion bonus
  const perfectBonus = score === totalQuestions ? 50 : 0; // 50 XP if 100% correct
  
  // Time speed bonus (e.g., under 150 seconds max timer)
  const maxTime = totalQuestions * 15; // 150 seconds total
  const unusedTime = Math.max(0, maxTime - totalTimeSeconds);
  const timeBonus = Math.min(40, Math.round(unusedTime * 0.3));

  // Daily Streak bonus (+20 XP per streak day, max 100)
  const streakBonus = Math.min(100, Math.max(1, streak) * 20);

  const totalXP = baseXP + completionBonus + perfectBonus + timeBonus + streakBonus;

  return {
    baseXP,
    completionBonus,
    perfectBonus,
    timeBonus,
    streakBonus,
    totalXP,
  };
}

/**
 * Saves daily challenge result to Firestore & localStorage
 */
export async function saveDailyChallengeResult(
  profile: UserProfile,
  score: number,
  totalQuestions: number,
  totalTimeSeconds: number,
  xpEarned: number,
  dateStr?: string
): Promise<{ newStreak: number; entry: DailyChallengeEntry }> {
  const today = dateStr || getTodayDateString();
  const docId = `${today}_${profile.uid}`;

  // Calculate streak logic
  const lastDate = profile.lastDailyDate;
  let newStreak = profile.dailyStreak || 0;

  if (lastDate !== today) {
    // Check if last played was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const entry: DailyChallengeEntry = {
    id: docId,
    uid: profile.uid,
    displayName: profile.displayName,
    branch: profile.branch,
    province: profile.province || 'Luanda',
    avatarId: profile.avatarId,
    isVipSupporter: profile.isVipSupporter,
    equippedFrame: profile.equippedFrame || profile.avatarAccessories?.frame,
    equippedBackground: profile.equippedBackground || profile.avatarAccessories?.background,
    equippedUniform: profile.equippedUniform,
    avatarAccessories: profile.avatarAccessories,
    date: today,
    score,
    totalQuestions,
    totalTimeSeconds,
    xpEarned,
    completedAt: new Date().toISOString(),
  };

  // Save to Firestore
  try {
    if (profile.uid && profile.uid !== 'guest_user') {
      const challengeRef = doc(db, 'daily_challenges', docId);
      await setDoc(challengeRef, entry, { merge: true });
    }
  } catch (err) {
    console.warn('Erro ao guardar desafio diário no Firestore:', err);
  }

  // Local storage save for fast offline fallback
  try {
    const localSaved = localStorage.getItem('minint_daily_entries') || '[]';
    const entries: DailyChallengeEntry[] = JSON.parse(localSaved);
    const existingIndex = entries.findIndex(e => e.id === docId);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem('minint_daily_entries', JSON.stringify(entries.slice(0, 50)));
  } catch (e) {
    // ignore local storage errors
  }

  return { newStreak, entry };
}

/**
 * Fetches today's leaderboard for the daily challenge
 */
export async function fetchDailyLeaderboard(dateStr?: string): Promise<DailyChallengeEntry[]> {
  const today = dateStr || getTodayDateString();
  const results: DailyChallengeEntry[] = [];

  try {
    const q = query(
      collection(db, 'daily_challenges'),
      where('date', '==', today),
      limit(30)
    );
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as DailyChallengeEntry);
    });
  } catch (err) {
    console.warn('Fallback para Firestore leaderboard:', err);
  }

  // Load from local storage if needed or merge
  try {
    const localSaved = localStorage.getItem('minint_daily_entries') || '[]';
    const entries: DailyChallengeEntry[] = JSON.parse(localSaved);
    const todayEntries = entries.filter(e => e.date === today);
    todayEntries.forEach(te => {
      if (!results.some(r => r.id === te.id)) {
        results.push(te);
      }
    });
  } catch (e) {}

  // Sort by score desc, then totalTimeSeconds asc
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.totalTimeSeconds - b.totalTimeSeconds;
  });

  return results;
}
