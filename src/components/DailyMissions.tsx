import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, Award, Target, Sparkles, Check, Gift, Coins } from 'lucide-react';
import { DailyMission, getDailyMissions, claimMissionReward, syncDailyMissionsWithFirestore } from '../utils/dailyMissions';
import { UserProfile } from '../types';
import { fireConfetti } from '../utils/confetti';
import { playCorrectSound } from '../utils/audio';

interface DailyMissionsProps {
  profile?: UserProfile;
  onClaimXp: (xpAmount: number, coinsAmount?: number) => void;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({ profile, onClaimXp }) => {
  const [missions, setMissions] = useState<DailyMission[]>(() => getDailyMissions(profile?.uid));

  const loadMissions = () => {
    setMissions(getDailyMissions(profile?.uid));
  };

  useEffect(() => {
    loadMissions();

    if (profile?.uid && profile.uid !== 'guest_user') {
      syncDailyMissionsWithFirestore(profile.uid).then((synced) => {
        setMissions(synced);
      }).catch(() => {});
    }

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setMissions(e.detail);
      } else {
        loadMissions();
      }
    };

    window.addEventListener('daily_missions_updated', handleUpdate);
    return () => {
      window.removeEventListener('daily_missions_updated', handleUpdate);
    };
  }, [profile?.uid]);

  const handleClaim = (mission: DailyMission) => {
    const reward = claimMissionReward(mission.id, profile?.uid);
    if (reward.xpReward > 0 || reward.coinsReward > 0) {
      fireConfetti();
      playCorrectSound();
      onClaimXp(reward.xpReward, reward.coinsReward);
      loadMissions();
    }
  };

  const completedCount = missions.filter((m) => m.claimed).length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden">
      {/* Background Subtle Light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Target size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-tight flex items-center gap-1.5">
              <span>Missões Diárias</span>
              <span className="text-[10px] font-mono text-slate-400 font-medium lowercase">
                ({completedCount}/3)
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Renovam todos os dias • Ganhe XP e Créditos MININT</p>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
          <Sparkles size={10} className="text-amber-400" />
          <span>Renovação 24h</span>
        </span>
      </div>

      {/* Missions List */}
      <div className="space-y-2">
        {missions.map((mission) => {
          const isComplete = mission.current >= mission.target;
          const isClaimed = mission.claimed;
          const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isClaimed
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                  : isComplete
                  ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Mission Details & Progress */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <span className={`text-xs font-bold truncate ${isClaimed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {mission.title}
                  </span>
                  
                  {/* Rewards Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Zap size={10} className="text-amber-400 fill-amber-400" />
                      <span>+{mission.xpReward} XP</span>
                    </span>
                    <span className="text-[10px] font-black font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Coins size={10} className="text-yellow-400 fill-yellow-400/80" />
                      <span>+{mission.coinsReward || 25}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isClaimed
                          ? 'bg-emerald-500'
                          : isComplete
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="truncate">{mission.description}</span>
                    <span className="font-bold shrink-0 ml-1">
                      {mission.current}/{mission.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                {isClaimed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
                    <Check size={12} strokeWidth={3} />
                    <span>Resgatado</span>
                  </span>
                ) : isComplete ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(mission)}
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all active:scale-95 cursor-pointer animate-bounce"
                  >
                    <Gift size={13} />
                    <span>Resgatar</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
