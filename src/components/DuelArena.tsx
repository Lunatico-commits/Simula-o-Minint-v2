import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ref as rtdbRef, 
  onValue as rtdbOnValue, 
  off as rtdbOff 
} from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { cleanRoomCode } from '../services/duelService';
import { 
  Swords, 
  Clock, 
  Zap, 
  Volume2, 
  VolumeX, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Sparkles, 
  Hourglass, 
  WifiOff, 
  Loader2 
} from 'lucide-react';
import { DuelRoom, UserProfile, DuelPlayer } from '../types';
import { UserAvatar } from './UserAvatar';
import { getRandomQuestions } from '../utils/questionSelector';
import { 
  playTickSound, 
  playRelampagoTickSound,
  playRoundStartSound,
  stopAllCombatSounds
} from '../utils/audio';

interface DuelArenaProps {
  currentRoom: DuelRoom;
  profile: UserProfile;
  onAnswerQuestion: (chosenOptionIndex: number) => void;
  onCancelRoom: (forceConfirm?: boolean) => void;
  onExplainWithAI: (question: any, chosenIndex: number) => void;
  onToggleSound: () => void;
  isSoundMuted: boolean;
  consecutiveCorrectStreak: number;
  answerFeedback: 'correct' | 'incorrect' | null;
  floatingParticles: { id: number; text: string }[];
  opponentInactivitySeconds: number;
  onForcedTimeout: (room: DuelRoom, qIndex: number) => void;
  matchPhase?: 'waiting' | 'preparing' | 'playing' | 'finished';
  onPhaseChange?: (phase: 'playing') => void;
}

export const CircularTimerRing: React.FC<{
  currentTimer: number;
  totalTime: number;
  isRelampago?: boolean;
}> = ({ currentTimer, totalTime, isRelampago }) => {
  const radius = 38;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, currentTimer / totalTime));
  const strokeDashoffset = circumference - ratio * circumference;

  let strokeColor = '#10B981'; // Emerald
  let textColorClass = 'text-emerald-400';

  if (ratio <= 0.25) {
    strokeColor = '#F43F5E'; // Rose
    textColorClass = 'text-rose-400 animate-pulse';
  } else if (ratio <= 0.5) {
    strokeColor = '#F59E0B'; // Amber
    textColorClass = 'text-amber-400';
  }

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 92 92">
        <circle
          cx="46"
          cy="46"
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx="46"
          cy="46"
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {isRelampago && (
          <Zap size={13} className={`${ratio <= 0.2 ? 'text-rose-400 animate-bounce' : 'text-amber-400 animate-pulse'} -mb-0.5`} />
        )}
        <span className={`font-mono font-black text-2xl leading-none ${textColorClass}`}>
          {currentTimer}
        </span>
        <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
          seg
        </span>
      </div>
    </div>
  );
};

export const computeConsecutiveStreak = (answers?: Record<number, { isCorrect: boolean }>): number => {
  if (!answers) return 0;
  let streak = 0;
  const indices = Object.keys(answers).map(Number).sort((a, b) => a - b);
  for (const idx of indices) {
    if (answers[idx]?.isCorrect) {
      streak += 1;
    } else {
      streak = 0;
    }
  }
  return streak;
};

export const DuelArena: React.FC<DuelArenaProps> = ({
  currentRoom,
  profile,
  onAnswerQuestion,
  onCancelRoom,
  onExplainWithAI,
  onToggleSound,
  isSoundMuted,
  consecutiveCorrectStreak,
  answerFeedback,
  floatingParticles,
  opponentInactivitySeconds,
  onForcedTimeout,
  matchPhase = 'playing',
  onPhaseChange,
}) => {
  const isHost = currentRoom.player1.uid === profile.uid;
  const myPlayer = isHost ? currentRoom.player1 : currentRoom.player2;
  const opponent = isHost ? currentRoom.player2 : currentRoom.player1;
  const qIndex = currentRoom.currentQuestionIndex || 0;

  // 3. Contador Local Independente em 'DuelArena.tsx' (Fim do congelamento no "3")
  const hasFinishedPrepRef = useRef<boolean>(false);
  const [internalPhase, setInternalPhase] = useState<'preparing' | 'playing'>(() => {
    return 'preparing';
  });
  const [prepCountdown, setPrepCountdown] = useState<number>(3);
  const prepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  // useEffect ESTRITAMENTE LOCAL para contagem 3 -> 2 -> 1 -> 0 sem qualquer dependência de rede
  useEffect(() => {
    if (hasFinishedPrepRef.current || internalPhase !== 'preparing') {
      if (prepIntervalRef.current) {
        clearInterval(prepIntervalRef.current);
        prepIntervalRef.current = null;
      }
      return;
    }

    setPrepCountdown(3);
    try {
      playRoundStartSound();
    } catch (_) {}

    prepIntervalRef.current = setInterval(() => {
      setPrepCountdown((prev) => {
        if (prev <= 1) {
          if (prepIntervalRef.current) {
            clearInterval(prepIntervalRef.current);
            prepIntervalRef.current = null;
          }
          hasFinishedPrepRef.current = true;
          setInternalPhase('playing');
          if (onPhaseChangeRef.current) {
            onPhaseChangeRef.current('playing');
          }
          return 0;
        }
        try {
          playTickSound(prev - 1);
        } catch (_) {}
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (prepIntervalRef.current) {
        clearInterval(prepIntervalRef.current);
        prepIntervalRef.current = null;
      }
    };
  }, [internalPhase]);

  // Normalização e extração garantida da lista de perguntas pré-carregadas
  const questionsList = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(currentRoom.questions)) {
      list = currentRoom.questions.filter(Boolean);
    } else if (currentRoom.questions && typeof currentRoom.questions === 'object') {
      list = Object.values(currentRoom.questions).filter(Boolean);
    }
    if (!list || list.length === 0) {
      list = getRandomQuestions({
        category: (currentRoom.category as any) || 'misto',
        count: 5,
        modeKey: 'duel',
      });
    }
    return list;
  }, [currentRoom.questions, currentRoom.category]);

  const currentQ = questionsList.length > 0 ? (questionsList[qIndex] || questionsList[0]) : null;

  // Requirement 4: Ensure both players and current question are fully loaded before starting the timer countdown
  const isOpponentLoaded = Boolean(
    opponent &&
    (opponent.uid || opponent.isBot || (currentRoom as any).guestUid) &&
    (opponent.displayName || opponent.name || opponent.isBot || 'Adversário')
  );

  const isBothPlayersLoaded = Boolean(
    myPlayer &&
    (myPlayer.uid || myPlayer.name) &&
    isOpponentLoaded &&
    currentQ
  );

  const totalTime = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
  const [questionTimer, setQuestionTimer] = useState<number>(totalTime);

  // 1. Escuta em tempo real dedicada no nó 'answers' usando referências estáveis (useRef)
  // e garantindo que SEMPRE retorne a função de destruição (off(answersRef) e unsubscribe)
  const stableCleanCode = useMemo(
    () => cleanRoomCode(currentRoom.id || currentRoom.roomCode || currentRoom.code),
    [currentRoom.id, currentRoom.roomCode, currentRoom.code]
  );
  const isBotMatch = Boolean(currentRoom.player2?.isBot);

  const [liveAnswers, setLiveAnswers] = useState<Record<number, Record<string, any>>>(currentRoom.answers || {});
  const answersRefRef = useRef<any>(null);
  const answersUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Se não houver código de sala válido ou for bot offline, não abre conexão com Firebase
    if (!stableCleanCode || isBotMatch) {
      return;
    }

    const answersRef = rtdbRef(rtdb, `duels/${stableCleanCode}/answers`);
    answersRefRef.current = answersRef;

    const unsubscribe = rtdbOnValue(
      answersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val) {
            setLiveAnswers(val);
          }
        }
      },
      (err) => {
        console.warn('[DuelArena] Erro no listener estável do nó answers:', err);
      }
    );

    answersUnsubscribeRef.current = unsubscribe;

    // Retorne SEMPRE a função de destruição (off(roomRef)) para evitar milhares de leituras
    return () => {
      if (answersUnsubscribeRef.current) {
        try {
          answersUnsubscribeRef.current();
        } catch (e) {}
        answersUnsubscribeRef.current = null;
      }
      if (answersRefRef.current) {
        try {
          rtdbOff(answersRefRef.current);
        } catch (e) {}
        answersRefRef.current = null;
      }
    };
  }, [stableCleanCode, isBotMatch]);

  // 2. Synchronized Question Timer with Strict Guard on Both Players Loaded and MatchPhase === 'playing'
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomRef = useRef(currentRoom);
  currentRoomRef.current = currentRoom;

  useEffect(() => {
    // Não inicia o temporizador se ambos os jogadores não estiverem carregados,
    // ou se ainda estiver na fase de preparação ('preparing')
    if (!isBothPlayersLoaded || internalPhase === 'preparing') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    const timeLimit = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
    const currentQIdx = currentRoom.currentQuestionIndex || 0;

    timerIntervalRef.current = setInterval(() => {
      const room = currentRoomRef.current;
      if (!room) return;
      const now = Date.now();
      const startTime = room.questionStartTime || (room as any).createdAt || now;
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, Math.ceil(timeLimit - elapsed));
      setQuestionTimer(remaining);

      // Play progressive sound alert if player has not answered yet
      const player = isHost ? room.player1 : room.player2;
      const hasAnswered = Boolean(player?.answers && player.answers[currentQIdx] !== undefined);

      if (!hasAnswered && remaining > 0) {
        if (room.mode === 'relampago') {
          playRelampagoTickSound(remaining, timeLimit);
        } else if (remaining <= 5) {
          playTickSound(remaining);
        }
      }

      // 1. If my personal timer hit 0 and I have not answered yet, auto-submit timeout answer (-1)
      if (remaining <= 0 && player && !hasAnswered) {
        onAnswerQuestion(-1);
      }

      // 2. Rigid Question Timer Enforcement:
      // When timer reaches 0s (elapsed >= timeLimit), AUTOMATICALLY advance the round for both players.
      if (remaining <= 0 || elapsed >= timeLimit) {
        onForcedTimeout(room, currentQIdx);
      }
    }, 250);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      stopAllCombatSounds();
    };
  }, [
    isBothPlayersLoaded,
    internalPhase,
    matchPhase,
    currentRoom.questionStartTime,
    currentRoom.currentQuestionIndex,
    currentRoom.timePerQuestion,
    currentRoom.mode,
    isHost,
    onAnswerQuestion,
    onForcedTimeout,
  ]);

  if (!isBothPlayersLoaded || !currentQ) {
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl animate-fadeIn">
        <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
        <div className="space-y-1">
          <p className="text-sm text-slate-100 font-extrabold uppercase tracking-wider">A inicializar Arena de Duelo...</p>
          <p className="text-xs text-slate-400">A sincronizar adversário e matriz de perguntas.</p>
        </div>
        <button
          type="button"
          onClick={() => onCancelRoom(true)}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
        >
          Cancelar Duelo
        </button>
      </div>
    );
  }

  const timerProgress = Math.max(0, Math.min(100, (questionTimer / totalTime) * 100));
  const isUrgent = questionTimer <= 5;
  const isWarning = questionTimer <= 10 && questionTimer > 5;

  const myUid = profile.uid;
  const oppUid = opponent?.uid;

  const myAnswerFromRoom = liveAnswers?.[qIndex]?.[myUid] || currentRoom?.answers?.[qIndex]?.[myUid];
  const oppAnswerFromRoom = oppUid ? (liveAnswers?.[qIndex]?.[oppUid] || currentRoom?.answers?.[qIndex]?.[oppUid]) : undefined;

  const myAnswer = myPlayer?.answers?.[qIndex] || myAnswerFromRoom;
  const opponentAnswer = opponent?.answers?.[qIndex] || oppAnswerFromRoom;

  const myAnswered = Boolean(myAnswer !== undefined);
  const oppAnswered = Boolean(opponentAnswer !== undefined);

  const myScore = myPlayer?.score ?? myAnswerFromRoom?.score ?? 0;
  const oppScore = opponent?.score ?? oppAnswerFromRoom?.score ?? 0;
  const totalScore = myScore + oppScore;
  const myPct = totalScore === 0 ? 50 : Math.round((myScore / totalScore) * 100);
  const oppPct = totalScore === 0 ? 50 : 100 - myPct;

  const myStreak = Math.max(consecutiveCorrectStreak, computeConsecutiveStreak(myPlayer?.answers));
  const oppStreak = computeConsecutiveStreak(opponent?.answers);

  return (
    <div className="space-y-3 relative animate-fadeIn">
      {/* 3. TELA DE VS E CONTADOR DE PREPARAÇÃO LOCAL ("A PREPARAR COMBATE...") */}
      <AnimatePresence>
        {internalPhase === 'preparing' && (
          <motion.div
            key="arena-prep-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[10001] flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl select-none text-white"
          >
            {/* Ambient Lighting & Tactical Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
            </div>

            {/* Top Tactical Header */}
            <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Swords size={14} className="text-amber-400 animate-pulse" />
                  <span>Duelo MININT 1v1</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentRoom.mode === 'relampago' ? '⚡ RELÂMPAGO' : '🛡️ CLÁSSICO'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                {currentRoom.category || 'Geral'}
              </span>
            </div>

            {/* Middle Face-off Avatars */}
            <div className="relative z-10 w-full max-w-md my-auto flex items-center justify-around gap-4 py-8">
              {/* My Player */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-b from-blue-500/40 to-slate-900 border-2 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                  <UserAvatar user={myPlayer || profile} size="xl" showBranchBadge={true} showLevelBadge={true} />
                </div>
                <p className="font-black text-sm text-slate-100 max-w-[120px] truncate">{myPlayer?.displayName || 'Você'}</p>
                <span className="text-[10px] text-blue-400 font-semibold uppercase">{myPlayer?.branch || 'PNA'} • {myPlayer?.province || 'Luanda'}</span>
              </div>

              {/* Center VS Indicator */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center font-black text-amber-400 text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  VS
                </div>
              </div>

              {/* Opponent Player */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-b from-amber-500/40 to-slate-900 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                  <UserAvatar user={opponent} size="xl" showBranchBadge={true} showLevelBadge={true} />
                </div>
                <p className="font-black text-sm text-slate-100 max-w-[120px] truncate">{opponent?.displayName || 'Adversário'}</p>
                <span className="text-[10px] text-amber-400 font-semibold uppercase">{opponent?.branch || 'SIC'} • {opponent?.province || 'Benguela'}</span>
              </div>
            </div>

            {/* Bottom Countdown Section: "A PREPARAR COMBATE..." */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 pb-6 text-center">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-500/40 font-mono">
                  {prepCountdown > 0 ? prepCountdown : '⚡'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black uppercase text-amber-400 tracking-wider">
                    {prepCountdown > 0 ? 'A preparar combate...' : 'Combate Iniciado!'}
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Responda rápido para acumular pontos de combo!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPrepCountdown(0);
                  setInternalPhase('playing');
                  if (onPhaseChangeRef.current) {
                    onPhaseChangeRef.current('playing');
                  }
                }}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 active:scale-95"
              >
                Começar Já →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Score Particles Animation */}
      <AnimatePresence>
        {floatingParticles.map((pt) => (
          <motion.div
            key={pt.id}
            initial={{ opacity: 0, y: 30, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -90, scale: [0.6, 1.3, 1.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 text-slate-950 font-black text-2xl shadow-[0_0_35px_rgba(245,158,11,0.9)] border-2 border-white flex items-center gap-2"
          >
            <Sparkles size={26} className="text-slate-950 animate-spin" />
            <span>{pt.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Scoreboard Bar with Dynamic Visual Timer Progress & Avatar Statuses */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-lg relative overflow-hidden">
        {/* Top Action Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Swords size={12} />
              <span>Duelo 1v1 em Curso</span>
            </span>
            {myStreak >= 2 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                myStreak >= 3
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <Flame size={10} className={myStreak >= 3 ? 'fill-yellow-300 text-yellow-300' : 'text-amber-400'} />
                <span>Combo: {myStreak}x</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-lg transition-colors cursor-pointer active:scale-95"
              title={isSoundMuted ? "Ativar Áudio dos Duelos" : "Desativar Áudio dos Duelos"}
            >
              {isSoundMuted ? <VolumeX size={12} className="text-rose-400" /> : <Volume2 size={12} className="text-emerald-400" />}
              <span>{isSoundMuted ? "Mudo" : "Som ON"}</span>
            </button>

            <button
              type="button"
              onClick={() => onCancelRoom(false)}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Abandonar Duelo"
            >
              <LogOut size={12} />
              <span>Desistir</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar Cronómetro */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="flex items-center gap-1 text-slate-400 uppercase tracking-wider">
              <Clock size={11} className={isUrgent ? 'text-rose-500 animate-spin' : 'text-amber-500'} />
              <span>Tempo Restante</span>
            </span>
            <span className={isUrgent ? 'text-rose-400 font-extrabold animate-pulse' : isWarning ? 'text-amber-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
              {questionTimer}s / {totalTime}s {isUrgent && '⚠️ URGENTE'}
            </span>
          </div>

          <div className="w-full bg-slate-950/90 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 relative shadow-inner">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut', type: 'tween' }}
              className={`h-full rounded-full transition-colors ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.9)] animate-pulse'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 items-center text-center pt-1 border-t border-slate-800/80">
          {/* Player 1 / Me */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              {myStreak >= 3 && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 blur-md pointer-events-none z-0"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-3.5 rounded-full border-2 border-dashed border-yellow-300 pointer-events-none z-0 opacity-90"
                  />
                  <motion.div
                    initial={{ scale: 0, y: 5 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-3.5 -right-2.5 z-30 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-black font-mono text-[9px] uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.9)] border border-yellow-200 animate-bounce"
                  >
                    <Flame size={11} className="fill-yellow-300 text-yellow-300 animate-pulse" />
                    <span>{myStreak}x COMBO</span>
                  </motion.div>
                </>
              )}

              <div className="relative z-10">
                <UserAvatar
                  user={myPlayer || profile}
                  size="md"
                  triggerReaction={myStreak >= 3 ? 'celebrate' : myPlayer?.score}
                  reaction={myStreak >= 3 ? 'celebrate' : (myAnswered && myPlayer?.answers?.[qIndex]?.isCorrect ? 'victory' : 'idle')}
                  showBranchBadge={true}
                  showLevelBadge={true}
                  interactive={true}
                />
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-200 mt-1 truncate max-w-[90px] flex items-center gap-1">
              <span>{myPlayer?.displayName}</span>
            </p>
            <span className="text-[9px] text-amber-400/80 font-medium">
              📍 {myPlayer?.province || profile.province || 'Angola'}
            </span>
            <motion.p
              key={`my-score-text-${myPlayer?.score}`}
              initial={{ scale: 1 }}
              animate={myPlayer?.score ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-xs font-black text-amber-400 mt-0.5"
            >
              {myPlayer?.score} Pts
            </motion.p>

            <div className="mt-1">
              {myAnswered ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-extrabold text-[9px] flex items-center gap-1 shadow-xs">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  <span>✓ Respondeu!</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[9px] flex items-center gap-1 animate-pulse">
                  <span>A pensar... ✍️</span>
                </span>
              )}
            </div>
          </div>

          {/* VS & Circular Timer Ring */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Q {qIndex + 1}/5
            </span>

            <CircularTimerRing
              currentTimer={questionTimer}
              totalTime={totalTime}
              isRelampago={currentRoom.mode === 'relampago' || currentRoom.timePerQuestion === 30}
            />

            {(currentRoom.mode === 'relampago' || currentRoom.timePerQuestion === 30) && (
              <span className="mt-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Zap size={10} className="animate-bounce text-amber-300" />
                <span>RELÂMPAGO</span>
              </span>
            )}
          </div>

          {/* Player 2 / Opponent */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              {oppStreak >= 3 && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 blur-md pointer-events-none z-0"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-3.5 rounded-full border-2 border-dashed border-cyan-300 pointer-events-none z-0 opacity-90"
                  />
                  <motion.div
                    initial={{ scale: 0, y: 5 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-3.5 -right-2.5 z-30 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-black font-mono text-[9px] uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.9)] border border-cyan-200 animate-bounce"
                  >
                    <Zap size={11} className="fill-yellow-300 text-yellow-300 animate-pulse" />
                    <span>{oppStreak}x COMBO</span>
                  </motion.div>
                </>
              )}

              <div className="relative z-10">
                <UserAvatar
                  user={opponent}
                  size="md"
                  triggerReaction={oppStreak >= 3 ? 'celebrate' : opponent?.score}
                  reaction={oppStreak >= 3 ? 'celebrate' : (oppAnswered && opponent?.answers?.[qIndex]?.isCorrect ? 'victory' : 'idle')}
                  showBranchBadge={true}
                  showLevelBadge={true}
                  interactive={true}
                />
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-200 mt-1 truncate max-w-[90px] flex items-center gap-1">
              <span>{opponent?.displayName}</span>
            </p>
            <span className="text-[9px] text-blue-400/80 font-medium">
              📍 {opponent?.province || 'Angola'}
            </span>
            <motion.p
              key={`opp-score-text-${opponent?.score}`}
              initial={{ scale: 1 }}
              animate={opponent?.score ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-xs font-black text-blue-400 mt-0.5"
            >
              {opponent?.score} Pts
            </motion.p>

            <div className="mt-1">
              {opponent?.isConnected === false && !opponent?.isBot ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-extrabold text-[9px] flex items-center gap-1 shadow-xs animate-pulse">
                  <WifiOff size={10} className="text-rose-400" />
                  <span>Desconectado</span>
                </span>
              ) : !opponent?.isBot && opponentInactivitySeconds >= 10 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-extrabold text-[9px] flex items-center gap-1 shadow-xs animate-pulse">
                  <Hourglass size={10} className="text-rose-400" />
                  <span>Inativo ({opponentInactivitySeconds}s / 15s)</span>
                </span>
              ) : !opponent?.isBot && opponentInactivitySeconds >= 5 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[9px] flex items-center gap-1 shadow-xs animate-pulse">
                  <Hourglass size={10} className="text-amber-400" />
                  <span>A aguardar ({opponentInactivitySeconds}s)</span>
                </span>
              ) : oppAnswered ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-extrabold text-[9px] flex items-center gap-1 shadow-xs">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  <span>✓ Respondeu!</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[9px] flex items-center gap-1 animate-pulse">
                  <span>A pensar... ✍️</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* VS Score Comparison Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold px-1">
            <span className="text-amber-400 flex items-center gap-1">
              <span className="text-slate-400 text-[9px]">EU:</span>
              <span>{myScore} Pts</span>
              <span className="text-amber-500/80 text-[9px]">({myPct}%)</span>
            </span>
            <span className="text-[9px] font-black uppercase text-amber-500/70 tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              VS PLACAR
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <span className="text-blue-400/80 text-[9px]">({oppPct}%)</span>
              <span>{oppScore} Pts</span>
              <span className="text-slate-400 text-[9px]">:OPP</span>
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 flex relative">
            <motion.div
              animate={{ width: `${myPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
            <motion.div
              animate={{ width: `${oppPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Combat Bonus Banner */}
      {myStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-yellow-500/20 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-between gap-2 relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0 animate-pulse">
              <Flame size={18} className="fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>🔥 MODO FÚRIA ATIVADO • COMBO {myStreak}x!</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/40 text-rose-200 font-mono text-[9px] font-extrabold border border-rose-400/40">
                  BÓNUS DE COMBATE
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                Avatar em chamas douradas! Cada acerto concede bónus visual e +30 Pts extras no duelo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/90 border border-amber-400 px-2.5 py-1.5 rounded-xl shrink-0 font-mono font-black text-amber-400 text-xs shadow-inner">
            <Zap size={13} className="text-yellow-300 fill-yellow-300 animate-bounce" />
            <span>+30 Bónus</span>
          </div>
        </motion.div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={
            answerFeedback === 'incorrect'
              ? { opacity: 1, y: 0, scale: [1, 0.99, 1.01, 1], x: [0, -14, 14, -10, 10, -5, 5, 0] }
              : answerFeedback === 'correct'
              ? { opacity: 1, y: 0, scale: [1, 1.02, 1], x: 0 }
              : { opacity: 1, y: 0, scale: 1, x: 0 }
          }
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`bg-slate-900 border rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden transition-colors ${
            answerFeedback === 'correct'
              ? 'border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/40'
              : answerFeedback === 'incorrect'
              ? 'border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40'
              : myStreak >= 3
              ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/50'
              : 'border-amber-500/30'
          }`}
        >
          {/* Visual Feedback Overlay Banner (Correct / Incorrect) */}
          <AnimatePresence>
            {answerFeedback === 'correct' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500/10 pointer-events-none rounded-3xl border-2 border-emerald-400/80 shadow-[inset_0_0_60px_rgba(16,185,129,0.4)] z-10 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.9)] flex items-center gap-2 border border-emerald-300 pointer-events-none"
                >
                  <CheckCircle2 size={20} className="text-slate-950" />
                  <span>RESPOSTA CERTA! 🎯</span>
                </motion.div>
              </motion.div>
            )}

            {answerFeedback === 'incorrect' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rose-500/10 pointer-events-none rounded-3xl border-2 border-rose-400/80 shadow-[inset_0_0_60px_rgba(244,63,94,0.4)] z-10 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.9)] flex items-center gap-2 border border-rose-400 pointer-events-none"
                >
                  <XCircle size={20} className="text-white" />
                  <span>RESPOSTA INCORRETA! ❌</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 truncate">
              {currentQ.categoryName}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {myStreak >= 3 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                  <Flame size={10} className="fill-slate-950" />
                  <span>Combo {myStreak}x Ativo</span>
                </span>
              )}
              <span>DUELO MININT</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-100 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options List */}
          <div className="space-y-2 pt-1">
            {currentQ.options.map((opt, idx) => {
              const hasMyAnswer = myAnswer !== undefined;
              const isTimedOut = questionTimer <= 0;
              const isOptionDisabled = hasMyAnswer || isTimedOut;
              const isMyChoice = myAnswer?.chosenIndex === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 active:scale-[0.99] cursor-pointer';

              if (isOptionDisabled && !hasMyAnswer) {
                btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60 cursor-not-allowed';
              } else if (hasMyAnswer) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold cursor-default';
                } else if (isMyChoice) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold cursor-default';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60 cursor-default';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isOptionDisabled}
                  onClick={() => onAnswerQuestion(idx)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0 ${
                      hasMyAnswer && isCorrect
                        ? 'bg-emerald-800/80 border-emerald-600 text-emerald-200'
                        : hasMyAnswer && isMyChoice
                        ? 'bg-rose-800/80 border-rose-600 text-rose-200'
                        : 'bg-slate-800/80 border-slate-700/80 text-amber-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>

                  {hasMyAnswer && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                  {hasMyAnswer && isMyChoice && !isCorrect && <XCircle size={16} className="text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Timeout Notice Banner if time ran out without answer */}
          {questionTimer <= 0 && myAnswer === undefined && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-rose-400 shrink-0" />
                <span>⏰ Tempo Esgotado! Resposta não enviada a tempo.</span>
              </div>
              <span className="text-[10px] text-slate-400">A avançar...</span>
            </div>
          )}

          {/* AI Explanation Trigger Button (if answered) */}
          {myAnswer !== undefined && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onExplainWithAI(currentQ, myAnswer.chosenIndex)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Explicar com IA</span>
              </button>

              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                {opponentAnswer !== undefined ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={12} />
                    <span>Ambos responderam! A avançar...</span>
                  </span>
                ) : questionTimer <= 0 ? (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold animate-pulse">
                    <Clock size={12} />
                    <span>Adversário sem resposta - tempo esgotado</span>
                  </span>
                ) : opponentInactivitySeconds >= 6 ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold animate-pulse">
                    <Hourglass size={12} />
                    <span>Adversário demorado ({opponentInactivitySeconds}s / 15s)</span>
                  </span>
                ) : (
                  <span>A aguardar oponente ({questionTimer}s)...</span>
                )}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DuelArena;
