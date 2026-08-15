import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  coinsReward: number;
  claimed: boolean;
}

const STORAGE_KEY = 'minint_daily_missions';

export type QuestType = 
  | 'questions' 
  | 'question'
  | 'simulado' 
  | 'quiz'
  | 'duel_win' 
  | 'win_duel' 
  | 'duel' 
  | 'win';

const INITIAL_MISSIONS: Omit<DailyMission, 'current' | 'claimed'>[] = [
  {
    id: 'questions_15',
    title: 'Responder a 15 perguntas',
    description: 'Responda a 15 questões nos simulados, desafios ou duelos',
    target: 15,
    xpReward: 100,
    coinsReward: 25,
  },
  {
    id: 'simulado_1',
    title: 'Concluir 1 simulado',
    description: 'Finalize pelo menos 1 simulado de treino ou exame',
    target: 1,
    xpReward: 150,
    coinsReward: 40,
  },
  {
    id: 'duel_win_1',
    title: 'Vencer 1 Duelo',
    description: 'Conquiste 1 vitória num duelo 1v1 ou treino IA',
    target: 1,
    xpReward: 200,
    coinsReward: 60,
  },
];

export function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getEffectiveUid(passedUid?: string): string | null {
  if (passedUid && passedUid !== 'guest_user') return passedUid;
  try {
    const saved = localStorage.getItem('minint_current_account_uid') || 
                  localStorage.getItem('currentUserId') || 
                  localStorage.getItem('minint_user');
    if (saved && saved !== 'guest_user') return saved;
  } catch (e) {}
  return null;
}

export function getDailyMissions(uid?: string): DailyMission[] {
  try {
    const today = getTodayDateStr();
    const effectiveUid = getEffectiveUid(uid);
    const userSpecificKey = effectiveUid ? `${STORAGE_KEY}_${effectiveUid}` : null;

    let raw = userSpecificKey ? localStorage.getItem(userSpecificKey) : null;
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        // Ensure all required initial missions are present
        const missionMap = new Map(parsed.missions.map((m: DailyMission) => [m.id, m]));
        const merged = INITIAL_MISSIONS.map((init) => {
          const existing = missionMap.get(init.id) as DailyMission | undefined;
          if (existing) {
            return {
              ...init,
              ...existing,
              target: init.target,
              xpReward: init.xpReward,
              coinsReward: init.coinsReward,
            };
          }
          return {
            ...init,
            current: 0,
            claimed: false,
          };
        });
        return merged;
      }
    }

    // Initialize new for today
    const newMissions: DailyMission[] = INITIAL_MISSIONS.map((m) => ({
      ...m,
      current: 0,
      claimed: false,
    }));

    saveDailyMissions(newMissions, effectiveUid || undefined);
    return newMissions;
  } catch {
    return INITIAL_MISSIONS.map((m) => ({
      ...m,
      current: 0,
      claimed: false,
    }));
  }
}

export function saveDailyMissions(missions: DailyMission[], uid?: string): void {
  try {
    const today = getTodayDateStr();
    const payload = JSON.stringify({
      date: today,
      missions,
    });

    localStorage.setItem(STORAGE_KEY, payload);

    const effectiveUid = getEffectiveUid(uid);
    if (effectiveUid) {
      localStorage.setItem(`${STORAGE_KEY}_${effectiveUid}`, payload);
      
      // Asynchronously synchronize with Firestore
      try {
        const userRef = doc(db, 'users', effectiveUid);
        setDoc(userRef, {
          dailyMissions: {
            date: today,
            missions: missions,
            updatedAt: new Date().toISOString(),
          }
        }, { merge: true }).catch((err) => {
          console.warn('Erro ao sincronizar missões no Firestore:', err);
        });
      } catch (dbErr) {
        console.warn('Falha na persistência Firestore das missões diárias:', dbErr);
      }
    }

    // Dispatch global event for instant UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daily_missions_updated', { detail: missions }));
    }
  } catch (err) {
    console.error('Error saving daily missions:', err);
  }
}

/**
 * Main function to update quest and daily mission progress.
 * Supports aliases 'win_duel', 'duel_win', 'questions', 'simulado'.
 */
export function updateQuestProgress(type: QuestType, amount: number = 1, uid?: string): void {
  const missions = getDailyMissions(uid);
  let updated = false;

  const isQuestions = type === 'questions' || type === 'question';
  const isSimulado = type === 'simulado' || type === 'quiz';
  const isDuelWin = type === 'duel_win' || type === 'win_duel' || type === 'duel' || type === 'win';

  const newMissions = missions.map((m) => {
    if (isQuestions && m.id === 'questions_15') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    if (isSimulado && m.id === 'simulado_1') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    if (isDuelWin && m.id === 'duel_win_1') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    return m;
  });

  if (updated) {
    saveDailyMissions(newMissions, uid);
  }
}

/**
 * Backwards-compatible alias for updateQuestProgress.
 */
export function trackMissionProgress(type: QuestType, amount: number = 1, uid?: string): void {
  updateQuestProgress(type, amount, uid);
}

/**
 * Synchronize daily missions from Firestore on user login/profile load.
 */
export async function syncDailyMissionsWithFirestore(uid: string): Promise<DailyMission[]> {
  if (!uid || uid === 'guest_user') return getDailyMissions();
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const today = getTodayDateStr();
      if (data?.dailyMissions?.date === today && Array.isArray(data.dailyMissions.missions)) {
        const firestoreMissions: DailyMission[] = data.dailyMissions.missions;
        const currentLocal = getDailyMissions(uid);

        // Merge keeping the highest progress
        const merged = currentLocal.map((localM) => {
          const remoteM = firestoreMissions.find((r) => r.id === localM.id);
          if (remoteM) {
            return {
              ...localM,
              current: Math.max(localM.current, remoteM.current || 0),
              claimed: localM.claimed || remoteM.claimed || false,
            };
          }
          return localM;
        });

        saveDailyMissions(merged, uid);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar missões do Firestore:', err);
  }
  return getDailyMissions(uid);
}

export function claimMissionReward(missionId: string, uid?: string): { xpReward: number; coinsReward: number } {
  const missions = getDailyMissions(uid);
  let xp = 0;
  let coins = 0;

  const newMissions = missions.map((m) => {
    if (m.id === missionId && m.current >= m.target && !m.claimed) {
      xp = m.xpReward;
      coins = m.coinsReward || 25;
      return { ...m, claimed: true };
    }
    return m;
  });

  if (xp > 0 || coins > 0) {
    saveDailyMissions(newMissions, uid);
  }

  return { xpReward: xp, coinsReward: coins };
}

