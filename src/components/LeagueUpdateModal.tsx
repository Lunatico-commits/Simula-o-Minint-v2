import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Shield, Sparkles, CheckCircle, Swords, Award } from 'lucide-react';
import { DuelLeague, LEAGUES_CONFIG, WeeklyLeagueEvaluationResult } from '../utils/league';
import { fireConfetti } from '../utils/confetti';

interface LeagueUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WeeklyLeagueEvaluationResult | null;
  onPlayDuelNow?: () => void;
}

export const LeagueUpdateModal: React.FC<LeagueUpdateModalProps> = ({
  isOpen,
  onClose,
  result,
  onPlayDuelNow,
}) => {
  useEffect(() => {
    if (isOpen && result && result.outcome === 'promoted') {
      fireConfetti();
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const oldConfig = LEAGUES_CONFIG[result.oldLeague];
  const newConfig = LEAGUES_CONFIG[result.newLeague];

  const isPromoted = result.outcome === 'promoted';
  const isRelegated = result.outcome === 'relegated';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header Glow background */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{
              backgroundColor: isPromoted ? '#10b981' : isRelegated ? '#f43f5e' : '#f59e0b',
            }}
          />

          {/* Outcome Badge Icon */}
          <div className="flex justify-center mb-4 relative">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border ${
                isPromoted
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  : isRelegated
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
              }`}
            >
              {isPromoted ? (
                <span>{newConfig.badge}</span>
              ) : isRelegated ? (
                <span>{newConfig.badge}</span>
              ) : (
                <span>{newConfig.badge}</span>
              )}
            </motion.div>

            <span className="absolute -bottom-1 right-1/3 bg-slate-900 rounded-full p-1 border border-slate-700">
              {isPromoted ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : isRelegated ? (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              ) : (
                <Minus className="w-5 h-5 text-amber-400" />
              )}
            </span>
          </div>

          {/* Text Title */}
          <div className="text-center mb-5">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block mb-1">
              REVOLUÇÃO DA LIGA SEMANAL ({result.weekFormatted})
            </span>

            <h3 className="text-xl font-black tracking-tight">
              {isPromoted ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  🎉 PARABÉNS! PROMOÇÃO CONQUISTADA!
                </span>
              ) : isRelegated ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500">
                  ⚠️ AVISO: DESPROMOÇÃO DE LIGA
                </span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
                  🛡️ LIGA MANTIDA COM SUCESSO!
                </span>
              )}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {isPromoted ? (
                <>
                  Ficaste em <strong className="text-emerald-400">#{result.rankInLeague}</strong> de {result.totalInLeague} candidatos na {oldConfig.name} com <strong className="text-amber-400">{result.weeklyPoints} Pts</strong>. Foste promovido à <strong>{newConfig.name}</strong>!
                </>
              ) : isRelegated ? (
                <>
                  Ficaste na zona de despromoção (<strong className="text-rose-400">#{result.rankInLeague}</strong> de {result.totalInLeague}) na {oldConfig.name}. Foste despromovido à <strong>{newConfig.name}</strong>. Continua a treinar em duelos para regressar ao topo!
                </>
              ) : (
                <>
                  Terminaste na posição <strong className="text-amber-400">#{result.rankInLeague}</strong> com {result.weeklyPoints} Pts. Garantiste a tua permanência na <strong>{newConfig.name}</strong> para esta semana!
                </>
              )}
            </p>
          </div>

          {/* League Transition Visual Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 flex items-center justify-around text-center">
            {/* Old League */}
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{oldConfig.badge}</span>
              <span className="text-[11px] font-bold text-slate-300">{oldConfig.name}</span>
              <span className="text-[9px] font-mono text-slate-500">Anterior</span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-slate-500">→</span>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isPromoted ? 'text-emerald-400' : isRelegated ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {isPromoted ? 'Subiu!' : isRelegated ? 'Desceu' : 'Manteve'}
              </span>
            </div>

            {/* New League */}
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1 animate-bounce">{newConfig.badge}</span>
              <span className={`text-[11px] font-extrabold ${newConfig.textColor}`}>
                {newConfig.name}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">Nova Liga</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {onPlayDuelNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlayDuelNow();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Swords className="w-4 h-4" />
                <span>Jogar Duelo de Ligas Agora</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Compreendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
