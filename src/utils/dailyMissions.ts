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

export function getDailyMissions(): DailyMission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDateStr();

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today && Array.isArray(parsed.missions)) {
        return parsed.missions;
      }
    }

    // Initialize new for today
    const newMissions: DailyMission[] = INITIAL_MISSIONS.map((m) => ({
      ...m,
      current: 0,
      claimed: false,
    }));

    saveDailyMissions(newMissions);
    return newMissions;
  } catch {
    return INITIAL_MISSIONS.map((m) => ({
      ...m,
      current: 0,
      claimed: false,
    }));
  }
}

export function saveDailyMissions(missions: DailyMission[]): void {
  try {
    const today = getTodayDateStr();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        date: today,
        missions,
      })
    );
    window.dispatchEvent(new CustomEvent('daily_missions_updated'));
  } catch (err) {
    console.error('Error saving daily missions:', err);
  }
}

export function trackMissionProgress(type: 'questions' | 'simulado' | 'duel_win', amount: number = 1): void {
  const missions = getDailyMissions();
  let updated = false;

  const newMissions = missions.map((m) => {
    if (type === 'questions' && m.id === 'questions_15') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    if (type === 'simulado' && m.id === 'simulado_1') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    if (type === 'duel_win' && m.id === 'duel_win_1') {
      const nextCurrent = Math.min(m.target, m.current + amount);
      if (nextCurrent !== m.current) updated = true;
      return { ...m, current: nextCurrent };
    }
    return m;
  });

  if (updated) {
    saveDailyMissions(newMissions);
  }
}

export function claimMissionReward(missionId: string): { xpReward: number; coinsReward: number } {
  const missions = getDailyMissions();
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
    saveDailyMissions(newMissions);
  }

  return { xpReward: xp, coinsReward: coins };
}
