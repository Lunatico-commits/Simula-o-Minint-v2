import React, { useState, useEffect } from 'react';
import { UserProfile, DuelRoom, DuelPlayer, MININTBranch, Question, QuestionCategory, AIExplanationResponse, normalizeCategory, DuelHistoryEntry } from '../types';
import { db, rtdb } from '../lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, limit, serverTimestamp 
} from 'firebase/firestore';
import {
  ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, onValue as rtdbOnValue, remove as rtdbRemove, get as rtdbGet
} from 'firebase/database';
import { QUESTION_BANK } from '../data/questions';
import { getRandomQuestions } from '../utils/questionSelector';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { explainQuestionWithAI } from '../services/apiService';
import { AIExplanationModal } from './AIExplanationModal';
import { MemeGeneratorModal } from './MemeGeneratorModal';
import { sendDuelInvitationNotification } from '../utils/notifications';
import { fireConfetti, fireHonorVictoryConfetti } from '../utils/confetti';
import { LEAGUES_CONFIG, DuelLeague } from '../utils/league';
import { 
  playCorrectSound, 
  playIncorrectSound, 
  playVictorySound, 
  playDefeatSound, 
  playQuizCompleteSound, 
  playTickSound, 
  playRelampagoTickSound 
} from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Users, Plus, KeyRound, Sparkles, Trophy, CheckCircle2, XCircle, Clock, Shield, ArrowRight, RotateCcw, AlertCircle, Zap,
  Copy, Check, Share2, Radio, UserCheck, MapPin, Loader2, History, Flame, Trash2, Crosshair, RefreshCw, LogOut, LogIn,
  MessageCircle, Link2, Bot
} from 'lucide-react';
import { ConfirmExitModal } from './ConfirmExitModal';
import { trackMissionProgress } from '../utils/dailyMissions';

/**
 * Normalizes user-entered room codes (e.g., 'mnt 8421', 'mnt-8421', '8421', 'MNT8421')
 * into the standardized 'MNT-XXXX' format.
 */
export function normalizeRoomCode(input?: string | null): string {
  if (!input) return '';
  // Remove any 'invite_' prefix (case-insensitive) if present
  const sanitized = input.trim().replace(/^invite_/i, '');
  // Convert to UPPERCASE, trim, and strip all internal spaces
  const cleaned = sanitized.toUpperCase().trim().replace(/\s+/g, '');
  if (!cleaned) return '';
  
  // Strip hyphen to check prefix (e.g., 'MNT-GWRM' or 'MNTGWRM' or 'MNT - GWRM')
  const noHyphen = cleaned.replace(/-/g, '');
  if (noHyphen.startsWith('MNT')) {
    const rest = noHyphen.slice(3);
    return rest ? `MNT-${rest}` : 'MNT-';
  }
  return `MNT-${noHyphen}`;
}

const buildSafePlayer = (userProfile: any, overrides?: Partial<DuelPlayer>): DuelPlayer => {
  return {
    uid: userProfile?.uid || userProfile?.id || 'anon',
    displayName: userProfile?.displayName || userProfile?.name || 'Candidato',
    branch: userProfile?.branch || 'PNA',
    avatarId: userProfile?.avatarId || 'policia',
    province: userProfile?.province || 'Luanda',
    photoURL: userProfile?.photoURL || userProfile?.avatar || '',
    isVipSupporter: !!(userProfile?.isVipSupporter),
    score: 0,
    currentQuestionIndex: 0,
    answers: {},
    isReady: true,
    isConnected: true,
    ...overrides,
  };
};

const sanitizeFirestoreData = <T extends Record<string, any>>(obj: T): T => {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== 'object') return obj;
  if (obj.constructor !== Object && !Array.isArray(obj)) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeFirestoreData) as any;
  }

  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      clean[key] = sanitizeFirestoreData(value);
    }
  }
  return clean as T;
};

interface MultiplayerDuelProps {
  profile: UserProfile;
  initialRoomCode?: string | null;
  onUpdateStats: (
    score: number, 
    totalQuestions: number, 
    xpGained: number, 
    isWin: boolean, 
    categoryBreakdown?: Partial<Record<QuestionCategory, { correct: number; total: number }>>,
    isMultiplayerReal?: boolean
  ) => void;
  onSessionActiveChange?: (active: boolean) => void;
}

interface CircularTimerRingProps {
  currentTimer: number;
  totalTime: number;
  isRelampago?: boolean;
}

export const CircularTimerRing: React.FC<CircularTimerRingProps> = ({
  currentTimer,
  totalTime,
  isRelampago,
}) => {
  const radius = 38;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, currentTimer / totalTime));
  const strokeDashoffset = circumference * (1 - ratio);

  let strokeColor = '#10B981';
  let textColorClass = 'text-emerald-400';
  let bgGlow = 'shadow-[0_0_15px_rgba(16,185,129,0.25)] border-emerald-500/30';

  if (ratio <= 0.2) {
    strokeColor = '#EF4444';
    textColorClass = 'text-rose-400 font-extrabold animate-pulse';
    bgGlow = 'shadow-[0_0_25px_rgba(239,68,68,0.7)] border-rose-500/80 ring-2 ring-rose-500/40';
  } else if (ratio <= 0.5) {
    strokeColor = '#F59E0B';
    textColorClass = 'text-amber-400';
    bgGlow = 'shadow-[0_0_18px_rgba(245,158,11,0.35)] border-amber-500/40';
  }

  return (
    <div className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950/95 border ${bgGlow} transition-all duration-300`}>
      <svg className="w-full h-full -rotate-90 p-1" viewBox="0 0 92 92">
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

export const MultiplayerDuel: React.FC<MultiplayerDuelProps> = ({ 
  profile, 
  initialRoomCode, 
  onUpdateStats, 
  onSessionActiveChange 
}) => {
  const [viewState, setViewState] = useState<'lobby' | 'room' | 'finished'>('lobby');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'misto'>('misto');
  const [selectedMode, setSelectedMode] = useState<'padrao' | 'relampago'>('padrao');
  
  const [currentRoom, setCurrentRoom] = useState<DuelRoom | null>(null);
  const [openRooms, setOpenRooms] = useState<DuelRoom[]>([]);
  const [isLoadingOpenRooms, setIsLoadingOpenRooms] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoJoinedCode, setAutoJoinedCode] = useState<string | null>(null);

  // Exit Confirmation Modal State
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Auto-join room if opened via direct invite URL link or push notification
  useEffect(() => {
    let targetCode = initialRoomCode;
    if (!targetCode) {
      try {
        const params = new URLSearchParams(window.location.search);
        targetCode = params.get('code') || params.get('room') || params.get('duelRoom') || params.get('duel') || params.get('sala');
      } catch (err) {
        console.warn('Erro ao ler parâmetro da URL em MultiplayerDuel:', err);
      }
    }

    if (targetCode && profile?.uid) {
      const normalized = normalizeRoomCode(targetCode);
      if (normalized && normalized.length > 4 && normalized !== autoJoinedCode) {
        setRoomCodeInput(normalized);
        setAutoJoinedCode(normalized);
        handleJoinRoomByCode(normalized);
      }
    }
  }, [initialRoomCode, profile?.uid]);

  // Notify parent of active duel session
  useEffect(() => {
    if (onSessionActiveChange) {
      onSessionActiveChange(viewState === 'room');
    }
  }, [viewState, onSessionActiveChange]);

  // Duel History State & Filter
  const [duelHistory, setDuelHistory] = useState<DuelHistoryEntry[]>(() => {
    try {
      const key = `minint_duel_history_${profile.uid}`;
      const saved = localStorage.getItem(key) || localStorage.getItem('minint_duel_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [historyFilter, setHistoryFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  // Vitória de Honra Fullscreen Overlay state (PvP Wins)
  const [showHonorVictoryOverlay, setShowHonorVictoryOverlay] = useState(false);
  const [honorVictoryOpponent, setHonorVictoryOpponent] = useState<DuelPlayer | null>(null);
  const [honorVictoryPts, setHonorVictoryPts] = useState<number>(100);

  const showToast = (msg: string, isError: boolean = false) => {
    setToastNotification({ message: msg, isError });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === msg ? null : prev));
    }, 4000);
  };

  // Save history changes to localStorage
  useEffect(() => {
    if (profile?.uid) {
      try {
        const key = `minint_duel_history_${profile.uid}`;
        localStorage.setItem(key, JSON.stringify(duelHistory));
      } catch (e) {
        console.warn('Erro ao persitir histórico de duelos:', e);
      }
    }
  }, [duelHistory, profile?.uid]);

  // Local Question Timer State
  const [questionTimer, setQuestionTimer] = useState(20);
  
  // Answer Feedback Visual Animation State ('correct' | 'incorrect' | null)
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Floating Score Particles State
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; text: string }[]>([]);

  // Clear answer feedback and particles on question change or viewState change
  useEffect(() => {
    setAnswerFeedback(null);
    setFloatingParticles([]);
  }, [currentRoom?.currentQuestionIndex, viewState]);
  
  // AI Explanation Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // Listen for open public rooms in lobby (Firestore Realtime onSnapshot)
  useEffect(() => {
    let unsubscribeFirestore = () => {};
    setIsLoadingOpenRooms(true);

    try {
      const q = query(
        collection(db, 'duels'),
        where('status', '==', 'waiting'),
        limit(30)
      );

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const firestoreRooms: DuelRoom[] = [];
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

        snapshot.forEach((docSnap) => {
          const r = docSnap.data() as any;
          if (r && r.status === 'waiting') {
            let createdTime = 0;
            if (typeof r.createdAt === 'number') {
              createdTime = r.createdAt;
            } else if (r.createdAt?.toMillis) {
              createdTime = r.createdAt.toMillis();
            } else if (r.createdAt?.seconds) {
              createdTime = r.createdAt.seconds * 1000;
            } else {
              createdTime = Date.now();
            }

            if (createdTime >= twoHoursAgo) {
              const safeP1 = buildSafePlayer(r.player1 || {});
              firestoreRooms.push({
                ...r,
                id: docSnap.id,
                code: r.code || r.roomCode || docSnap.id,
                roomCode: r.roomCode || r.code || docSnap.id,
                player1: safeP1,
              });
            }
          }
        });
        setOpenRooms(firestoreRooms);
        setIsLoadingOpenRooms(false);
      }, (error) => {
        console.warn('Erro ao escutar salas públicas no Firestore:', error);
        setIsLoadingOpenRooms(false);
      });
    } catch (e) {
      console.warn('Erro ao configurar consulta de salas no Firestore:', e);
      setIsLoadingOpenRooms(false);
    }

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  const [processedDuelId, setProcessedDuelId] = useState<string | null>(null);
  const [xpBreakdown, setXpBreakdown] = useState<{
    baseXp: number;
    speedBonusXp: number;
    fastAnswersCount: number;
    totalXp: number;
    resultType: 'win' | 'draw' | 'loss';
  } | null>(null);

  // Real-time Listener for current active room (Online Multiplayer only - RTDB + Firestore)
  useEffect(() => {
    if (!currentRoom?.id || currentRoom.player2?.isBot) return;

    let unsubscribeFirestore = () => {};
    let unsubscribeRtdb = () => {};

    // 1. Listen Firestore
    try {
      const roomRef = doc(db, 'duels', currentRoom.id);
      unsubscribeFirestore = onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
          const roomData = docSnap.data() as DuelRoom;
          setCurrentRoom(roomData);

          if (roomData.status === 'active' && viewState !== 'room') {
            setViewState('room');
          } else if (roomData.status === 'finished' && viewState !== 'finished') {
            setViewState('finished');
            if (processedDuelId !== roomData.id) {
              setProcessedDuelId(roomData.id);
              handleDuelFinished(roomData);
            }
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao inicializar listener Firestore do duelo:', e);
    }

    // 2. Listen Realtime Database
    try {
      const activeRoomRtdbRef = rtdbRef(rtdb, `duels/${currentRoom.id}`);
      unsubscribeRtdb = rtdbOnValue(activeRoomRtdbRef, (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val() as DuelRoom;
          setCurrentRoom(roomData);

          if (roomData.status === 'active' && viewState !== 'room') {
            setViewState('room');
          } else if (roomData.status === 'finished' && viewState !== 'finished') {
            setViewState('finished');
            if (processedDuelId !== roomData.id) {
              setProcessedDuelId(roomData.id);
              handleDuelFinished(roomData);
            }
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao inicializar listener RTDB do duelo:', e);
    }

    return () => {
      unsubscribeFirestore();
      if (typeof unsubscribeRtdb === 'function') {
        unsubscribeRtdb();
      }
    };
  }, [currentRoom?.id, currentRoom?.player2?.isBot, viewState, processedDuelId]);

  // Helper to advance question or finish duel
  const advanceOrFinishDuel = (updatedRoom: DuelRoom, qIndex: number) => {
    const isBot = updatedRoom.player2?.isBot;

    if (qIndex < updatedRoom.questions.length - 1) {
      const nextIdx = qIndex + 1;
      const nextStartTime = Date.now();

      setCurrentRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: nextIdx,
          questionStartTime: nextStartTime,
        };
      });

      if (!isBot) {
        try {
          const roomRef = doc(db, 'duels', updatedRoom.id);
          setDoc(roomRef, {
            currentQuestionIndex: nextIdx,
            questionStartTime: nextStartTime,
          }, { merge: true }).catch((e) => console.warn('Erro ao avançar questão no Firestore:', e));
          
          rtdbUpdate(rtdbRef(rtdb, `duels/${updatedRoom.id}`), {
            currentQuestionIndex: nextIdx,
            questionStartTime: nextStartTime,
          }).catch((e) => console.warn('Erro ao avançar questão no RTDB:', e));
        } catch (e) {
          console.warn('Erro ao salvar avanço no banco de dados:', e);
        }
      }
    } else {
      // Finish Duel
      const p1FinalScore = updatedRoom.player1.score;
      const p2FinalScore = updatedRoom.player2?.score || 0;

      let winner: string = 'draw';
      if (p1FinalScore > p2FinalScore) winner = updatedRoom.player1.uid;
      else if (p2FinalScore > p1FinalScore) winner = updatedRoom.player2?.uid || 'draw';

      const finishedRoom: DuelRoom = {
        ...updatedRoom,
        status: 'finished',
        winnerUid: winner,
      };

      setCurrentRoom(finishedRoom);
      setViewState('finished');

      if (processedDuelId !== finishedRoom.id) {
        setProcessedDuelId(finishedRoom.id);
        handleDuelFinished(finishedRoom);
      }

      if (!isBot) {
        try {
          const roomRef = doc(db, 'duels', updatedRoom.id);
          setDoc(roomRef, {
            status: 'finished',
            winnerUid: winner,
          }, { merge: true }).catch((e) => console.warn('Erro ao finalizar duelo no Firestore:', e));

          rtdbUpdate(rtdbRef(rtdb, `duels/${updatedRoom.id}`), {
            status: 'finished',
            winnerUid: winner,
          }).catch((e) => console.warn('Erro ao finalizar duelo no RTDB:', e));
        } catch (e) {
          console.warn('Erro ao finalizar no banco de dados:', e);
        }
      }
    }
  };

  // Cancel or Leave Room
  const handleCancelRoom = (forceConfirm = false) => {
    if (!forceConfirm && currentRoom?.status === 'active') {
      setIsExitModalOpen(true);
      return;
    }

    if (currentRoom) {
      const roomId = currentRoom.id || currentRoom.roomCode;
      const roomCode = currentRoom.roomCode || currentRoom.code || roomId;

      // Immediately filter out cancelled room from local open rooms array
      setOpenRooms((prev) => (prev || []).filter((r) => r && r.id !== roomId && r.roomCode !== roomCode));

      if (roomId && !currentRoom.player2?.isBot) {
        try {
          const roomRef = doc(db, 'duels', roomId);
          deleteDoc(roomRef).catch(() => {
            updateDoc(roomRef, { status: 'abandoned' }).catch((e) => {
              console.warn('Erro ao atualizar status no Firestore:', e);
            });
          });

          rtdbRemove(rtdbRef(rtdb, `duels/${roomId}`)).catch(() => {
            rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}`), { status: 'abandoned' }).catch((e) => {
              console.warn('Erro ao cancelar sala no RTDB:', e);
            });
          });
        } catch (e) {
          console.warn('Erro ao encerrar sala no banco de dados:', e);
        }
      }
    }
    setCurrentRoom(null);
    setRoomCodeInput('');
    setErrorMessage('');
    setIsExitModalOpen(false);
    setViewState('lobby');
  };

  // Synchronized Question Timer
  useEffect(() => {
    if (viewState !== 'room' || !currentRoom || currentRoom.status !== 'active') return;

    const timeLimit = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);

    const interval = setInterval(() => {
      if (!currentRoom.questionStartTime) return;
      const elapsed = Math.floor((Date.now() - currentRoom.questionStartTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setQuestionTimer(remaining);

      // Play progressive sound alert if player has not answered yet
      const isHost = currentRoom.player1.uid === profile.uid;
      const player = isHost ? currentRoom.player1 : currentRoom.player2;
      const qIdx = currentRoom.currentQuestionIndex;
      const hasAnswered = player?.answers && player.answers[qIdx] !== undefined;

      if (!hasAnswered && remaining > 0) {
        if (currentRoom.mode === 'relampago') {
          playRelampagoTickSound(remaining, timeLimit);
        } else if (remaining <= 5) {
          playTickSound(remaining);
        }
      }

      // Auto advance or handle time expiration if timer hits 0
      if (remaining === 0) {
        if (player && !hasAnswered) {
          handleAnswerQuestion(-1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, currentRoom?.questionStartTime, currentRoom?.currentQuestionIndex, currentRoom?.status, currentRoom?.timePerQuestion, currentRoom?.mode]);

  // Bot Auto Answer Simulation (100% Local - No Firestore)
  useEffect(() => {
    if (viewState !== 'room' || !currentRoom || currentRoom.status !== 'active') return;
    const p2 = currentRoom.player2;
    if (!p2 || !p2.isBot) return;

    const qIndex = currentRoom.currentQuestionIndex;
    if (p2.answers && p2.answers[qIndex] !== undefined) return;

    const currentQ = currentRoom.questions[qIndex];
    if (!currentQ) return;

    const timeLimit = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
    const delay = Math.floor(Math.random() * (timeLimit * 160)) + 3000;

    const timer = setTimeout(() => {
      const isCorrect = Math.random() < 0.78;
      const chosenIndex = isCorrect
        ? currentQ.correctIndex
        : (currentQ.correctIndex + 1) % currentQ.options.length;

      const elapsedSec = Math.min(timeLimit, Math.floor(delay / 1000));
      const remainingSec = Math.max(0, timeLimit - elapsedSec);
      const timeBonus = Math.max(10, remainingSec * 5);
      const ptsEarned = isCorrect ? (100 + timeBonus) : 0;

      const newAnswers = {
        ...p2.answers,
        [qIndex]: {
          chosenIndex,
          isCorrect,
          timeSeconds: elapsedSec,
        },
      };

      const newScore = p2.score + ptsEarned;

      setCurrentRoom((prev) => {
        if (!prev) return null;
        const updatedP2 = {
          ...prev.player2!,
          score: newScore,
          answers: newAnswers,
        };
        const updatedRoom = {
          ...prev,
          player2: updatedP2,
        };

        // Check if player1 already answered this question
        const p1Answered = prev.player1.answers && prev.player1.answers[qIndex] !== undefined;
        if (p1Answered) {
          setTimeout(() => {
            advanceOrFinishDuel(updatedRoom, qIndex);
          }, 1500);
        }

        return updatedRoom;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [viewState, currentRoom?.status, currentRoom?.currentQuestionIndex, currentRoom?.player2?.isBot, currentRoom?.player1?.answers, currentRoom?.timePerQuestion, currentRoom?.mode]);

  // Generate 6-char Room Code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MNT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Create Bot Room (Instant Practice Mode - 100% Local / Offline First)
  const handleCreateBotRoom = () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const code = generateRoomCode();
      const roomId = `duel_bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const botProvinces = ['Huambo', 'Benguela', 'Cabinda', 'Huíla', 'Malanje', 'Namibe', 'Uíge'];
      const botBranches: MININTBranch[] = ['PNA', 'SIC', 'SME', 'SP', 'SPCB'];
      const botNames = [
        'Sub-Insp. Nelson', 'Agente Carla', 'Chefe Mateus', 'Sub-Chef. Ndongala',
        'Insp. Esperança', 'Agente Kapapelo', 'Sub-Insp. Nimi'
      ];

      const randomBotProvince = botProvinces[Math.floor(Math.random() * botProvinces.length)];
      const randomBotBranch = botBranches[Math.floor(Math.random() * botBranches.length)];
      const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];

      const duelQuestions = getRandomQuestions({
        category: selectedCategory,
        count: 5,
        modeKey: 'duel',
      });

      const isRelampago = selectedMode === 'relampago';
      const timePerQuestion = isRelampago ? 30 : 20;

      const botPlayer: DuelPlayer = {
        uid: `bot_${Date.now()}`,
        displayName: randomBotName,
        branch: randomBotBranch,
        avatarId: 'pna_agent',
        province: randomBotProvince,
        isBot: true,
        score: 0,
        currentQuestionIndex: 0,
        answers: {},
        isReady: true,
        isConnected: true,
      };

      const newRoom: DuelRoom = {
        id: roomId,
        roomCode: code,
        hostUid: profile?.uid || 'anon',
        status: 'active',
        category: selectedCategory,
        mode: selectedMode,
        questions: duelQuestions,
        currentQuestionIndex: 0,
        questionStartTime: Date.now(),
        timePerQuestion,
        player1: buildSafePlayer(profile),
        player2: botPlayer,
        createdAt: Date.now(),
      };

      // 100% Local initialization - NO FIRESTORE CALL AT ALL
      setCurrentRoom(newRoom);
      setViewState('room');
    } catch (error: any) {
      console.error('Erro ao criar duelo com bot:', error);
      setErrorMessage('Não foi possível iniciar o duelo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const rawCode = generateRoomCode();
      const roomCode = normalizeRoomCode(rawCode); // ex: "MNT-3XDV"

      const duelQuestions = getRandomQuestions({
        category: selectedCategory,
        count: 5,
        modeKey: 'duel',
      });

      const isRelampago = selectedMode === 'relampago';
      const timePerQuestion = isRelampago ? 30 : 20;

      const player1Data = buildSafePlayer(profile);

      const newRoom: DuelRoom = {
        id: roomCode,
        code: roomCode,
        roomCode: roomCode,
        hostId: profile?.uid || 'anon',
        hostUid: profile?.uid || 'anon',
        status: 'waiting',
        category: selectedCategory || 'Geral',
        mode: selectedMode || 'classico',
        questions: duelQuestions,
        currentQuestionIndex: 0,
        questionStartTime: null,
        timePerQuestion,
        player1: player1Data,
        createdAt: Date.now(),
      };

      const firestoreDocData = sanitizeFirestoreData({
        ...newRoom,
        code: roomCode,
        roomCode: roomCode,
        status: 'waiting',
        createdAt: serverTimestamp(),
        player2: null,
      });

      // 1. Save room document directly to Firestore using roomCode as document ID
      await setDoc(doc(db, 'duels', roomCode), firestoreDocData);

      // 2. Sync to Realtime Database
      try {
        await rtdbSet(rtdbRef(rtdb, `duels/${roomCode}`), newRoom);
      } catch (rtdbErr) {
        console.warn('Erro ao sincronizar sala no RTDB:', rtdbErr);
      }

      // 3. Add new room to local openRooms list and set as current room
      setOpenRooms((prev) => [...(prev || []), newRoom]);
      setCurrentRoom(newRoom);
      setViewState('room');

      // 4. Broadcast push notification for duel invitation
      sendDuelInvitationNotification(profile, roomCode);
    } catch (error: any) {
      console.error('Erro ao criar sala no Firebase:', error);
      const exactMsg = error?.message || String(error);
      alert('Erro ao criar sala: ' + exactMsg);
      setErrorMessage('Erro ao criar sala: ' + exactMsg);
      showToast('Erro ao criar sala: ' + exactMsg, true);
    } finally {
      setLoading(false);
    }
  };

  // Join Room by Code
  const handleJoinRoomByCode = async (targetCode?: string) => {
    const rawInput = targetCode || roomCodeInput;
    if (!rawInput || !rawInput.trim()) {
      setErrorMessage('Introduza um código de sala válido (Ex: MNT-8421).');
      return;
    }

    // 1. Remova qualquer prefixo como "invite_" da consulta
    const sanitizedInput = rawInput.trim().replace(/^invite_/i, '');
    // 2. Trate o texto digitado aplicando: const cleanCode = input.trim().toUpperCase().replace(/\s+/g, '')
    const cleanCode = sanitizedInput.trim().toUpperCase().replace(/\s+/g, '');
    const normalizedCode = normalizeRoomCode(cleanCode);

    setLoading(true);
    setErrorMessage('');
    try {
      let roomData: DuelRoom | null = null;
      let roomDocId: string | null = null;

      // 3. Busque a sala diretamente pelo ID do documento (doc(db, "duels", cleanCode)) ou faça query na coleção onde 'code' == cleanCode
      try {
        // Direct document lookup by ID
        const directDocRef = doc(db, 'duels', cleanCode);
        let docSnap = await getDoc(directDocRef);

        if (!docSnap.exists() && normalizedCode && normalizedCode !== cleanCode) {
          const normDocRef = doc(db, 'duels', normalizedCode);
          docSnap = await getDoc(normDocRef);
        }

        if (docSnap.exists()) {
          roomData = docSnap.data() as DuelRoom;
          roomDocId = docSnap.id;
        } else {
          // Query na coleção onde 'code' == cleanCode ou 'code' == normalizedCode
          const searchCodes = Array.from(new Set([cleanCode, normalizedCode])).filter(Boolean);

          for (const sCode of searchCodes) {
            if (roomData) break;
            const qCode = query(
              collection(db, 'duels'),
              where('code', '==', sCode),
              limit(1)
            );
            const snapshotCode = await getDocs(qCode);
            if (!snapshotCode.empty) {
              const snap = snapshotCode.docs[0];
              roomData = snap.data() as DuelRoom;
              roomDocId = snap.id;
              break;
            }

            const qRoomCode = query(
              collection(db, 'duels'),
              where('roomCode', '==', sCode),
              limit(1)
            );
            const snapshotRoomCode = await getDocs(qRoomCode);
            if (!snapshotRoomCode.empty) {
              const snap = snapshotRoomCode.docs[0];
              roomData = snap.data() as DuelRoom;
              roomDocId = snap.id;
              break;
            }
          }
        }

        if (!roomData) {
          // Secondary fallback query: fetch waiting rooms and compare code / roomCode
          const waitingQ = query(
            collection(db, 'duels'),
            where('status', '==', 'waiting'),
            limit(50)
          );
          const waitingSnap = await getDocs(waitingQ);
          const searchCodes = Array.from(new Set([cleanCode, normalizedCode])).filter(Boolean);
          for (const docSnap of waitingSnap.docs) {
            const data = docSnap.data() as DuelRoom;
            const docCodeClean = (data.code || data.roomCode || '').toUpperCase().trim().replace(/\s+/g, '');
            const docNormalized = normalizeRoomCode(data.code || data.roomCode);
            if (
              searchCodes.includes(docCodeClean) ||
              searchCodes.includes(docNormalized) ||
              docSnap.id === cleanCode ||
              docSnap.id === normalizedCode
            ) {
              roomData = data;
              roomDocId = docSnap.id;
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Busca no Firestore por código falhou, tentando fallbacks:', e);
      }

      // Query RTDB fallback if Firestore was empty
      if (!roomData) {
        try {
          const searchCodes = Array.from(new Set([cleanCode, normalizedCode])).filter(Boolean);
          const duelsRtdbRef = rtdbRef(rtdb, 'duels');
          const snapshot = await rtdbGet(duelsRtdbRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const key of Object.keys(data)) {
              const r = data[key] as DuelRoom;
              const rCodeClean = (r?.roomCode || r?.code || '').toUpperCase().trim().replace(/\s+/g, '');
              const rCodeNormalized = normalizeRoomCode(r?.roomCode || r?.code);
              if (
                r &&
                (searchCodes.includes(rCodeClean) || searchCodes.includes(rCodeNormalized) || key === cleanCode || key === normalizedCode)
              ) {
                roomData = r;
                roomDocId = r.id || key;
                break;
              }
            }
          }
        } catch (e) {
          console.warn('Busca no RTDB por código falhou:', e);
        }
      }

      // Search in local state fallback
      if (!roomData) {
        const searchCodes = Array.from(new Set([cleanCode, normalizedCode])).filter(Boolean);
        const localMatch = (openRooms || []).find(
          (r) => {
            const rCodeClean = (r?.roomCode || r?.code || '').toUpperCase().trim().replace(/\s+/g, '');
            const rCodeNormalized = normalizeRoomCode(r?.roomCode || r?.code);
            return r && (searchCodes.includes(rCodeClean) || searchCodes.includes(rCodeNormalized) || r.id === cleanCode || r.id === normalizedCode);
          }
        );
        if (localMatch) {
          roomData = localMatch;
          roomDocId = localMatch.id;
        }
      }

      if (!roomData) {
        setErrorMessage(`Sala ${normalizedCode || cleanCode} não foi encontrada. Verifique se o código está correto ou se a sala foi criada.`);
        setLoading(false);
        return;
      }

      // Re-entry check for host or player 2
      if (roomData.player1.uid === profile.uid || roomData.player2?.uid === profile.uid) {
        setCurrentRoom(roomData);
        setViewState('room');
        setLoading(false);
        return;
      }

      // Check room status and participants count
      const currentStatus = (roomData.status as string) || '';
      const isStatusOccupied = 
        currentStatus === 'playing' || 
        currentStatus === 'full' || 
        currentStatus === 'active' || 
        currentStatus === 'finished' || 
        currentStatus === 'closed';

      const isWaiting = currentStatus === 'waiting' || currentStatus === 'open';
      const participantCount = (roomData.player1 ? 1 : 0) + (roomData.player2 ? 1 : 0);
      const isPlayer2Filled = !!roomData.player2;

      if (isStatusOccupied || !isWaiting || isPlayer2Filled || participantCount >= 2) {
        const unavailableMsg = 'Esta sala não está mais disponível para novos participantes.';
        setErrorMessage(unavailableMsg);
        showToast(unavailableMsg, true);
        setLoading(false);
        return;
      }

      // Join as player 2
      const updatedPlayer2 = buildSafePlayer(profile);

      const updatedRoom: DuelRoom = {
        ...roomData,
        player2: updatedPlayer2,
        status: 'active',
        questionStartTime: Date.now(),
      };

      const targetId = roomDocId || updatedRoom.id;
      if (targetId) {
        try {
          const roomRef = doc(db, 'duels', targetId);
          setDoc(roomRef, sanitizeFirestoreData({
            player2: updatedPlayer2,
            status: 'active',
            questionStartTime: Date.now(),
          }), { merge: true }).catch((e) => console.warn('Erro ao atualizar sala no Firestore:', e));

          rtdbUpdate(rtdbRef(rtdb, `duels/${targetId}`), {
            player2: updatedPlayer2,
            status: 'active',
            questionStartTime: Date.now(),
          }).catch((e) => console.warn('Erro ao atualizar entrada na sala no RTDB:', e));
        } catch (e) {
          console.warn('Erro ao atualizar entrada na sala nos bancos de dados:', e);
        }
      }

      setCurrentRoom(updatedRoom);
      setOpenRooms((prev) => (prev || []).filter((r) => r && r.id !== updatedRoom.id && r.roomCode !== updatedRoom.roomCode));
      setViewState('room');
    } catch (error: any) {
      console.error('Erro ao entrar na sala:', error);
      setErrorMessage('Falha ao entrar na sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Answer Question
  const handleAnswerQuestion = async (chosenOptionIndex: number) => {
    if (!currentRoom || currentRoom.status !== 'active') return;

    const isHost = currentRoom.player1.uid === profile.uid;
    const player = isHost ? currentRoom.player1 : currentRoom.player2;
    if (!player) return;

    const qIndex = currentRoom.currentQuestionIndex;
    if (player.answers && player.answers[qIndex] !== undefined) return; // Already answered

    const currentQ = currentRoom.questions[qIndex];
    const isCorrect = chosenOptionIndex === currentQ.correctIndex;

    const timeBonus = Math.max(10, questionTimer * 5);
    const ptsEarned = isCorrect ? (100 + timeBonus) : 0;

    if (isCorrect) {
      playCorrectSound();
      setAnswerFeedback('correct');
      const particleId = Date.now();
      setFloatingParticles((prev) => [...prev, { id: particleId, text: `+${ptsEarned} Pts` }]);
      setTimeout(() => {
        setFloatingParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 1300);
    } else {
      playIncorrectSound();
      setAnswerFeedback('incorrect');
    }

    const totalTime = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
    trackMissionProgress('questions', 1);
    const newAnswers = {
      ...player.answers,
      [qIndex]: {
        chosenIndex: chosenOptionIndex,
        isCorrect,
        timeSeconds: Math.max(0, totalTime - questionTimer),
      },
    };

    const newScore = player.score + ptsEarned;
    const isBot = currentRoom.player2?.isBot;

    // Build updated room state locally
    let updatedRoom: DuelRoom = { ...currentRoom };
    if (isHost) {
      updatedRoom = {
        ...currentRoom,
        player1: {
          ...currentRoom.player1,
          answers: newAnswers,
          score: newScore,
        },
      };
    } else if (currentRoom.player2) {
      updatedRoom = {
        ...currentRoom,
        player2: {
          ...currentRoom.player2,
          answers: newAnswers,
          score: newScore,
        },
      };
    }

    // Update local React state immediately
    setCurrentRoom(updatedRoom);

    // Only update Firestore + Realtime Database if it's an online multiplayer game (NOT a bot game)
    if (!isBot) {
      try {
        const roomRef = doc(db, 'duels', currentRoom.id);
        const playerKey = isHost ? 'player1' : 'player2';
        const updatedPlayerData = isHost
          ? { ...currentRoom.player1, answers: newAnswers, score: newScore }
          : (currentRoom.player2 ? { ...currentRoom.player2, answers: newAnswers, score: newScore } : null);

        if (updatedPlayerData) {
          const safeData = sanitizeFirestoreData({ [playerKey]: updatedPlayerData });
          setDoc(roomRef, safeData, { merge: true }).catch((e) => console.warn('Erro Firestore resposta:', e));
          rtdbUpdate(rtdbRef(rtdb, `duels/${currentRoom.id}/${playerKey}`), updatedPlayerData).catch((e) => console.warn('Erro RTDB resposta:', e));
        }
      } catch (e) {
        console.warn('Erro ao guardar resposta no banco de dados:', e);
      }
    }

    // Check if both players answered
    const otherPlayer = isHost ? updatedRoom.player2 : updatedRoom.player1;
    if (otherPlayer && otherPlayer.answers && otherPlayer.answers[qIndex] !== undefined) {
      // Both answered! Advance to next question or finish after 1.5s delay
      setTimeout(() => {
        advanceOrFinishDuel(updatedRoom, qIndex);
      }, 1500);
    }
  };

  // Duel Finished Callback
  const handleDuelFinished = (roomData: DuelRoom) => {
    const isHost = roomData.player1.uid === profile.uid;
    const myPlayer = isHost ? roomData.player1 : roomData.player2;
    const opponent = isHost ? roomData.player2 : roomData.player1;

    // Check if opponent is bot or AI tutor
    const isOpponentBot = !opponent ||
      opponent.isBot === true ||
      !opponent.uid ||
      opponent.uid.startsWith('bot_') ||
      (typeof opponent.displayName === 'string' && (
        opponent.displayName.toLowerCase().includes('bot') ||
        opponent.displayName.toLowerCase().includes('tutor') ||
        opponent.displayName.toLowerCase().includes('ia') ||
        opponent.displayName.toLowerCase().includes('robô') ||
        opponent.displayName.toLowerCase().includes('robo')
      ));
    const isMultiplayerReal = !isOpponentBot;

    const isWin = roomData.winnerUid === profile.uid;
    const isDraw = roomData.winnerUid === 'draw';

    // Speed bonus: +5 XP for each correct answer in < 5 seconds
    let speedBonusXp = 0;
    let fastAnswersCount = 0;
    let correctCount = 0;

    if (myPlayer?.answers) {
      Object.values(myPlayer.answers).forEach((ans) => {
        if (ans.isCorrect) {
          correctCount++;
          if (ans.timeSeconds < 5) {
            speedBonusXp += 5;
            fastAnswersCount++;
          }
        }
      });
    }

    // Base XP: Vitória (+50 XP), Empate (+20 XP), Derrota (+5 XP bónus de participação)
    let baseXp = 5;
    let resultType: 'win' | 'draw' | 'loss' = 'loss';
    if (isWin) {
      baseXp = 50;
      resultType = 'win';
      playVictorySound();
      trackMissionProgress('duel_win', 1);
      if (isMultiplayerReal) {
        fireHonorVictoryConfetti();
        const pts = 20 + (correctCount * 15) + 50;
        setHonorVictoryPts(pts);
        setHonorVictoryOpponent(opponent);
        setShowHonorVictoryOverlay(true);
      } else {
        fireConfetti();
      }
    } else if (isDraw) {
      baseXp = 20;
      resultType = 'draw';
      playQuizCompleteSound();
    } else {
      playDefeatSound();
    }

    const totalXp = baseXp + speedBonusXp;

    setXpBreakdown({
      baseXp,
      speedBonusXp,
      fastAnswersCount,
      totalXp,
      resultType,
    });

    // Compute breakdown per category for dashboard
    const categoryBreakdown: Partial<Record<QuestionCategory, { correct: number; total: number }>> = {};
    if (roomData.questions) {
      roomData.questions.forEach((q, idx) => {
        const normCat = normalizeCategory(q.category);
        if (!categoryBreakdown[normCat]) {
          categoryBreakdown[normCat] = { correct: 0, total: 0 };
        }
        categoryBreakdown[normCat]!.total += 1;
        const ans = myPlayer?.answers ? myPlayer.answers[idx] : undefined;
        if (ans && ans.isCorrect) {
          categoryBreakdown[normCat]!.correct += 1;
        }
      });
    }

    onUpdateStats(correctCount, roomData.questions.length, totalXp, isWin, categoryBreakdown, isMultiplayerReal);
    const catLabel = roomData.category === 'misto' 
      ? 'Misto (MININT)' 
      : roomData.category === 'legislacao_minint' ? 'Legislação MININT'
      : roomData.category === 'direito_constituicao' ? 'Direito & CRA'
      : roomData.category === 'historia_cultura_geral' ? 'História e Cultura'
      : 'Português & Raciocínio';

    const newHistoryEntry: DuelHistoryEntry = {
      id: roomData.id || `hist_${Date.now()}`,
      roomCode: roomData.roomCode || 'MNT-DUEL',
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      category: roomData.category,
      categoryName: catLabel,
      myScore: myPlayer?.score || 0,
      opponentScore: opponent?.score || 0,
      opponentUid: opponent?.uid || 'bot',
      opponentName: opponent?.displayName || 'Candidato Oponente',
      opponentBranch: opponent?.branch || 'PNA',
      opponentAvatarId: opponent?.avatarId || 'pna_agent',
      opponentProvince: opponent?.province || 'Luanda',
      isOpponentBot: opponent?.isBot || false,
      result: isWin ? 'win' : isDraw ? 'draw' : 'loss',
      totalQuestions: roomData.questions?.length || 5,
    };

    setDuelHistory((prev) => {
      const filtered = (prev || []).filter(e => e.id !== newHistoryEntry.id);
      const updated = [newHistoryEntry, ...filtered].slice(0, 30);
      try {
        const key = `minint_duel_history_${profile.uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem('minint_duel_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
      return updated;
    });
  };

  // Re-challenge / Rematch Against Opponent (Vingança)
  const handleRechallenge = (
    opponentName: string,
    opponentBranch: MININTBranch,
    opponentAvatarId: string,
    opponentProvince?: string,
    isBot?: boolean,
    category?: QuestionCategory | 'misto'
  ) => {
    setLoading(true);
    setErrorMessage('');
    const targetCategory = category || selectedCategory;

    // Check if it's a Bot or offline opponent
    if (isBot || !opponentName || opponentName.toLowerCase().includes('bot') || opponentName.toLowerCase().includes('ia') || opponentName.toLowerCase().includes('agente') || opponentName.toLowerCase().includes('sub-insp') || opponentName.toLowerCase().includes('chefe')) {
      try {
        const code = generateRoomCode();
        const roomId = `duel_bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const duelQuestions = getRandomQuestions({
          category: targetCategory,
          count: 5,
          modeKey: 'duel',
        });

        const botPlayer: DuelPlayer = {
          uid: `bot_${Date.now()}`,
          displayName: opponentName || 'Candidato IA',
          branch: opponentBranch || 'PNA',
          avatarId: opponentAvatarId || 'pna_agent',
          province: opponentProvince || 'Luanda',
          isBot: true,
          score: 0,
          currentQuestionIndex: 0,
          answers: {},
          isReady: true,
          isConnected: true,
        };

        const newRoom: DuelRoom = {
          id: roomId,
          roomCode: code,
          hostUid: profile.uid,
          status: 'active',
          category: targetCategory,
          questions: duelQuestions,
          currentQuestionIndex: 0,
          questionStartTime: Date.now(),
          timePerQuestion: 20,
          player1: buildSafePlayer(profile),
          player2: botPlayer,
          createdAt: Date.now(),
        };

        setCurrentRoom(newRoom);
        setViewState('room');
      } catch (err) {
        console.error('Erro ao iniciar duelo de vingança:', err);
        setErrorMessage('Não foi possível reiniciar o duelo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      // Human Rechallenge: Create online room
      handleCreateRoom();
    }
  };

  // Clear Duel History Modal Handlers
  const handleClearHistory = () => {
    setIsClearHistoryModalOpen(true);
  };

  const handleConfirmClearHistory = () => {
    setDuelHistory([]);
    try {
      localStorage.removeItem(`minint_duel_history_${profile.uid}`);
      localStorage.removeItem('minint_duel_history');
    } catch (e) {
      console.warn('Erro ao limpar histórico:', e);
    }
    setIsClearHistoryModalOpen(false);
    showToast('Histórico eliminado com sucesso');
  };

  // AI Explanation Trigger
  const handleExplainWithAI = async (q: Question, chosenIdx: number) => {
    setModalQuestion(q);
    setIsAIModalOpen(true);
    setIsAILoading(true);
    setAiExplanation(null);

    const data = await explainQuestionWithAI(q, chosenIdx);
    setAiExplanation(data);
    setIsAILoading(false);
  };

  // Copy Room Direct Link to clipboard
  const handleCopyInviteLink = (customCode?: string) => {
    const code = customCode || currentRoom?.roomCode;
    if (code) {
      const inviteUrl = `${window.location.origin}${window.location.pathname}?duelRoom=${code}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast('Link de convite copiado!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Copy Room Code to clipboard
  const handleCopyRoomCode = () => {
    if (currentRoom?.roomCode) {
      navigator.clipboard.writeText(currentRoom.roomCode);
      setCopiedCode(true);
      showToast('Código de sala copiado!');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Share invitation via WhatsApp
  const handleShareWhatsApp = (customCode?: string, customCategory?: QuestionCategory | 'misto') => {
    const code = customCode || currentRoom?.roomCode;
    const cat = customCategory || currentRoom?.category || selectedCategory;
    if (code) {
      const inviteUrl = `${window.location.origin}${window.location.pathname}?duelRoom=${code}`;
      const categoryName = cat === 'misto' 
        ? 'Todas as Matérias MININT' 
        : cat.replace('_', ' ').toUpperCase();
      const msg = encodeURIComponent(
        `🛡️ *DESAFIO DE DUELO 1V1 — CONCURSO MININT ANGOLA* 🇦🇴\n\nDesafio-te para um duelo 1v1 ao vivo no simulado de preparação!\n\n📚 Matéria: *${categoryName}*\n🔑 Código da Sala: *${code}*\n\n👉 *Clica no link para entrares na minha sala em tempo real:*\n${inviteUrl}\n\nVenha testar os teus conhecimentos e provar quem sabe mais! 🚀`
      );
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    }
  };

  // Direct WhatsApp Invite action from lobby
  const handleInviteViaWhatsApp = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const rawCode = generateRoomCode();
      const roomCode = normalizeRoomCode(rawCode);

      const duelQuestions = getRandomQuestions({
        category: selectedCategory,
        count: 5,
        modeKey: 'duel',
      });

      const isRelampago = selectedMode === 'relampago';
      const timePerQuestion = isRelampago ? 30 : 20;

      const player1Data = buildSafePlayer(profile);

      const newRoom: DuelRoom = {
        id: roomCode,
        code: roomCode,
        roomCode: roomCode,
        hostUid: profile?.uid || 'anon',
        status: 'waiting',
        category: selectedCategory || 'Geral',
        mode: selectedMode || 'classico',
        questions: duelQuestions,
        currentQuestionIndex: 0,
        questionStartTime: null,
        timePerQuestion,
        player1: player1Data,
        createdAt: Date.now(),
      };

      const firestoreDocData = sanitizeFirestoreData({
        ...newRoom,
        code: roomCode,
        roomCode: roomCode,
        status: 'waiting',
        createdAt: serverTimestamp(),
        player2: null,
      });

      // Mandatory sync to Firestore using roomCode as document ID
      await setDoc(doc(db, 'duels', roomCode), firestoreDocData);

      try {
        await rtdbSet(rtdbRef(rtdb, `duels/${roomCode}`), newRoom);
      } catch (rtdbErr) {
        console.warn('Erro em segundo plano ao salvar sala no RTDB:', rtdbErr);
      }

      setOpenRooms((prev) => [...(prev || []), newRoom]);
      setCurrentRoom(newRoom);
      setViewState('room');

      sendDuelInvitationNotification(profile, roomCode);

      showToast('Sala gerada com sucesso! A abrir WhatsApp...');
      handleShareWhatsApp(roomCode, selectedCategory);
    } catch (error: any) {
      console.error('Erro ao criar sala de convite no Firebase:', error);
      const exactMsg = error?.message || String(error);
      alert('Erro ao criar sala: ' + exactMsg);
      setErrorMessage('Erro ao criar sala: ' + exactMsg);
      showToast('Erro ao criar sala: ' + exactMsg, true);
    } finally {
      setLoading(false);
    }
  };

  // Convert waiting room to training vs Bot
  const handleConvertWaitingRoomToBot = () => {
    if (!currentRoom) return;
    const botPlayer: DuelPlayer = {
      uid: 'bot_candidate_ai',
      displayName: 'Agente Especial IA',
      branch: 'PNA',
      province: 'Luanda',
      avatarId: 'pna_1',
      score: 0,
      currentQuestionIndex: 0,
      answers: {},
      isReady: true,
      isBot: true,
      isConnected: true,
    };
    const updated: DuelRoom = {
      ...currentRoom,
      player2: botPlayer,
      status: 'active',
      questionStartTime: Date.now(),
    };
    setCurrentRoom(updated);
  };

  const isHost = currentRoom?.player1?.uid ? (currentRoom.player1.uid === profile?.uid) : (currentRoom?.hostUid === profile?.uid);
  const myPlayer = isHost ? currentRoom?.player1 : currentRoom?.player2;
  const opponent = isHost ? currentRoom?.player2 : currentRoom?.player1;
  const qIndex = currentRoom?.currentQuestionIndex ?? 0;
  const currentQ = currentRoom?.questions && Array.isArray(currentRoom.questions) ? currentRoom.questions[qIndex] : undefined;
  const myAnswer = myPlayer?.answers ? myPlayer.answers[qIndex] : undefined;
  const opponentAnswer = opponent?.answers ? opponent.answers[qIndex] : undefined;

  return (
    <div className="max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-slate-100">
      {/* LOBBY VIEW */}
      {viewState === 'lobby' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Hero Banner */}
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#16181D] dark:to-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-md dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Swords size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Arena de Duelo 1v1</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Desafie outro candidato online! Quem responder mais rápido ganha mais pontos e bónus de XP
            </p>

            {/* League status pill */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
              <span className="text-base">
                {LEAGUES_CONFIG[profile.duelLeague || 'bronze'].badge}
              </span>
              <span className="font-extrabold text-amber-400">
                {LEAGUES_CONFIG[profile.duelLeague || 'bronze'].name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono font-bold text-slate-200">
                {profile.weeklyDuelPoints || 0} Pts
              </span>
            </div>
          </div>

          {/* Quick Create Room */}
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <Plus size={15} className="text-amber-500" />
              <span>Criar Sala de Duelo</span>
            </h3>

            {/* Game Mode Selector */}
            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono mb-1.5 font-bold uppercase tracking-wider">
                MODO DE DUELO
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode('padrao')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    selectedMode === 'padrao'
                      ? 'bg-amber-500/10 border-amber-500/50 text-slate-900 dark:text-slate-100 ring-1 ring-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <Swords size={14} className={selectedMode === 'padrao' ? 'text-amber-500' : 'text-slate-400'} />
                    <span>Duelo Padrão</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">20s por questão</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('relampago')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    selectedMode === 'relampago'
                      ? 'bg-gradient-to-r from-rose-500/15 via-amber-500/20 to-rose-500/15 border-rose-500/60 text-slate-900 dark:text-slate-100 ring-1 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-rose-500 dark:text-rose-400">
                    <Zap size={14} className="animate-pulse text-amber-400" />
                    <span>Duelo Relâmpago</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">30s estrito + Contador Circular</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono mb-1 font-bold">
                MATÉRIA DO DUELO
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="misto">Misto (Todas as Matérias MININT)</option>
                <option value="informatica_basica">Informática Básica</option>
                <option value="legislacao_minint">Legislação do MININT</option>
                <option value="direito_constituicao">Direito e Constituição (CRA)</option>
                <option value="historia_cultura_geral">História e Cultura Geral</option>
                <option value="portugues_raciocinio">Língua Portuguesa e Raciocínio Lógico</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Swords size={16} />
                <span>{loading ? 'A Criar...' : 'CRIAR SALA ONLINE'}</span>
              </button>

              <button
                onClick={handleCreateBotRoom}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider border border-indigo-400/30"
              >
                <Zap size={16} className="text-amber-300" />
                <span>TREINAR C/ CANDIDATO IA</span>
              </button>
            </div>

            {/* Direct WhatsApp Challenge Button */}
            <div className="pt-1 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={handleInviteViaWhatsApp}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 border border-emerald-400/40"
              >
                <MessageCircle size={18} className="fill-white text-emerald-600 shrink-0" />
                <span>Convidar Amigo / Desafiar no WhatsApp</span>
                <Share2 size={16} className="shrink-0" />
              </button>
            </div>
          </div>

          {/* Join with Room Code */}
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <KeyRound size={15} className="text-amber-500" />
              <span>Entrar com Código de Sala</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="EX: MNT-8421"
                className="flex-1 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 dark:text-slate-100 tracking-wider focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleJoinRoomByCode()}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-200 font-bold text-xs shrink-0 cursor-pointer uppercase tracking-wider"
              >
                Entrar
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Open Public Rooms List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <Users size={16} className="text-amber-500" />
              <span>Salas Abertas em Tempo Real ({openRooms.length})</span>
            </h3>

            {isLoadingOpenRooms ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
                <Loader2 size={18} className="animate-spin text-amber-500" />
                <span className="font-medium">A carregar salas em tempo real...</span>
              </div>
            ) : openRooms.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-600 dark:text-slate-400 shadow-xs">
                Nenhuma sala aberta no momento. Crie uma sala ou treine contra a IA!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {openRooms.map((room) => {
                  const bInfo = MININT_BRANCHES[room.player1.branch] || MININT_BRANCHES.PNA;
                  const roomAvatar = getAvatarOption(room.player1.avatarId, room.player1.branch, room.player1.displayName);
                  return (
                    <div
                      key={room.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bInfo.badgeBg} flex items-center justify-center text-lg border border-amber-500/30 shrink-0 shadow-sm`}>
                          {roomAvatar.symbol}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{room.player1.displayName}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                            <span>Código: {room.roomCode}</span>
                            {(room.mode === 'relampago' || room.timePerQuestion === 30) && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                <Zap size={10} className="text-amber-400" />
                                <span>30s Relâmpago</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinRoomByCode(room.roomCode || room.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1"
                      >
                        <LogIn size={13} />
                        <span>Entrar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* HISTÓRICO DE DUELOS & DESAFIAR NOVAMENTE (REVANCHE) */}
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History size={16} className="text-amber-500" />
                <span>Histórico de Duelos</span>
                {duelHistory.length > 0 && (
                  <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                    {duelHistory.length}
                  </span>
                )}
              </h3>

              {duelHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Limpar Histórico"
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Filters / Stats Summary */}
            {duelHistory.length > 0 && (
              <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-mono">{duelHistory.length} Batalhas</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                      historyFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setHistoryFilter('win')}
                    className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                      historyFilter === 'win'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Vitórias ({duelHistory.filter((h) => h.result === 'win').length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter('loss')}
                    className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                      historyFilter === 'loss'
                        ? 'bg-rose-500 text-white font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Derrotas ({duelHistory.filter((h) => h.result === 'loss').length})
                  </button>
                </div>
              </div>
            )}

            {/* History List */}
            {duelHistory.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-5 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Swords size={28} className="mx-auto text-amber-500/50" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Sem duelos recentes</p>
                <p className="text-[11px]">Participe em duelos online ou contra a IA para registrar seu placar e solicitar revanches!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {duelHistory
                  .filter((entry) => {
                    if (historyFilter === 'win') return entry.result === 'win';
                    if (historyFilter === 'loss') return entry.result === 'loss';
                    return true;
                  })
                  .map((item) => {
                    const bInfo = MININT_BRANCHES[item.opponentBranch] || MININT_BRANCHES.PNA;
                    const oppAvatar = getAvatarOption(item.opponentAvatarId, item.opponentBranch, item.opponentName);

                    const isWin = item.result === 'win';
                    const isDraw = item.result === 'draw';

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex flex-col gap-2.5 transition-all hover:border-amber-500/30"
                      >
                        {/* Top info line */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {item.categoryName}
                          </span>
                          <span className="text-slate-400 font-medium">{item.dateFormatted}</span>
                        </div>

                        {/* Player vs Opponent row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Opponent Info */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bInfo.badgeBg} flex items-center justify-center text-base border border-amber-500/30 shrink-0`}>
                              {oppAvatar.symbol}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                                <span>{item.opponentName}</span>
                                {item.isOpponentBot && (
                                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 rounded font-mono">IA</span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>📍 {item.opponentProvince || 'Angola'}</span>
                                <span>•</span>
                                <span className="font-semibold text-amber-500/80">{item.opponentBranch}</span>
                              </p>
                            </div>
                          </div>

                          {/* Scoreboard Result */}
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1.5 font-mono font-black text-xs">
                              <span className={isWin ? 'text-emerald-500' : isDraw ? 'text-amber-400' : 'text-slate-400'}>
                                {item.myScore}
                              </span>
                              <span className="text-slate-400 font-normal">vs</span>
                              <span className={!isWin && !isDraw ? 'text-rose-500' : 'text-slate-400'}>
                                {item.opponentScore}
                              </span>
                            </div>

                            {/* Badge Outcome */}
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 flex items-center gap-0.5 ${
                                isWin
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                                  : isDraw
                                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
                              }`}
                            >
                              {isWin ? '🏆 Vitória' : isDraw ? '🤝 Empate' : '❌ Derrota'}
                            </span>
                          </div>
                        </div>

                        {/* Action: Desafiar Novamente (Revanche) */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                          <button
                            onClick={() =>
                              handleRechallenge(
                                item.opponentName,
                                item.opponentBranch,
                                item.opponentAvatarId,
                                item.opponentProvince,
                                item.isOpponentBot,
                                item.category
                              )
                            }
                            disabled={loading}
                            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Crosshair size={14} className="text-amber-500 animate-pulse" />
                            <span>DESAFIAR NOVAMENTE (VINGANÇA)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROOM & GAMEPLAY VIEW */}
      {viewState === 'room' && currentRoom && (
        <div className="space-y-4 animate-fadeIn">
          {/* ENHANCED REAL-TIME WAITING ROOM SCREEN */}
          {currentRoom.status === 'waiting' && (
            <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    SALA DE ESPERA 1V1
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                  RTDB Sincronizado
                </span>
              </div>

              {/* Matchup VS Card Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Player 1 (Host Card) */}
                {(() => {
                  const p1 = currentRoom.player1 || buildSafePlayer(profile);
                  const p1Branch = MININT_BRANCHES[p1?.branch || 'PNA'] || MININT_BRANCHES.PNA;
                  const p1Avatar = getAvatarOption(p1?.avatarId, p1?.branch, p1?.displayName);
                  return (
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 text-center space-y-2 relative shadow-xs">
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                        Anfitrião
                      </span>

                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p1Branch.badgeBg} border-2 border-amber-500/50 flex items-center justify-center text-2xl mx-auto shadow-md`}>
                        {p1Avatar.symbol}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {p1.displayName || 'Anfitrião'}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-600 dark:text-slate-400">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-300">
                            {p1Branch.sigla}
                          </span>
                          <span>• 📍 {p1.province || profile?.province || 'Angola'}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check size={12} />
                        <span>Pronto na Sala</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Player 2 Slot (Waiting or Connected with Framer Motion entry animation) */}
                <div className="bg-slate-50 dark:bg-slate-900/80 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-3.5 text-center shadow-xs overflow-hidden min-h-[160px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {currentRoom.player2 ? (
                      (() => {
                        const p2 = currentRoom.player2;
                        const p2Branch = MININT_BRANCHES[p2?.branch || 'PNA'] || MININT_BRANCHES.PNA;
                        const p2Avatar = getAvatarOption(p2?.avatarId, p2?.branch, p2?.displayName);
                        return (
                          <motion.div
                            key="player2-connected"
                            initial={{ opacity: 0, scale: 0.82, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                            className="space-y-2 py-1"
                          >
                            <motion.span
                              initial={{ opacity: 0, scale: 0.4 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.12, type: 'spring', stiffness: 500 }}
                              className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-sm"
                            >
                              ⚡ Oponente Conectado!
                            </motion.span>

                            <motion.div
                              initial={{ scale: 0.6, rotate: -8 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.08, type: 'spring', stiffness: 420, damping: 20 }}
                              className="relative inline-block mx-auto"
                            >
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p2Branch.badgeBg} border-2 border-emerald-500 flex items-center justify-center text-2xl mx-auto shadow-md relative z-10`}>
                                {p2Avatar.symbol}
                              </div>
                              <span className="absolute -inset-1 rounded-2xl bg-emerald-500/30 animate-pulse blur-sm -z-0"></span>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.18 }}
                            >
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {p2.displayName || 'Oponente'}
                              </p>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                📍 {p2.province || 'Angola'}
                              </p>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.25 }}
                              className="pt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                            >
                              <Sparkles size={12} className="animate-spin text-amber-500" />
                              <span>A iniciar partida...</span>
                            </motion.div>
                          </motion.div>
                        );
                      })()
                    ) : (
                      <motion.div
                        key="player2-waiting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3 py-1"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                          <Radio size={24} className="animate-spin" />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-200">A Procurar Candidato...</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Aguardando entrada via código ou lista de salas
                          </p>
                        </div>

                        {/* Convert to Bot button if host doesn't want to wait */}
                        {isHost && (
                          <button
                            type="button"
                            onClick={handleConvertWaitingRoomToBot}
                            className="w-full py-1.5 px-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
                          >
                            <Zap size={12} />
                            <span>Jogar c/ Candidato IA sem esperar</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Room Code & Share Controls Box */}
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3 shadow-lg">
                <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
                  <Swords size={13} className="text-amber-500" />
                  <span>CÓDIGO DE SESSÃO 1V1</span>
                </p>
                <div className="text-2xl font-mono font-black text-amber-400 tracking-widest bg-slate-950 py-2.5 px-4 rounded-xl border border-amber-500/20 shadow-inner inline-block min-w-[180px]">
                  {currentRoom.roomCode}
                </div>

                {/* Direct Shareable Link Box */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-left space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                    <span className="flex items-center gap-1">
                      <Link2 size={12} className="text-amber-500" />
                      Link Direto de Convite:
                    </span>
                    <span className="text-emerald-400 text-[9px] font-sans font-black">
                      ⚡ Entrada Direta
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${window.location.pathname}?duelRoom=${currentRoom.roomCode}`}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 truncate focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyInviteLink()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer uppercase shadow-xs active:scale-95"
                    >
                      {copiedLink ? <Check size={13} /> : <Link2 size={13} />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider border border-slate-700"
                  >
                    {copiedCode ? <Check size={14} className="text-amber-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Código Copiado' : 'Copiar Código'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp()}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer uppercase tracking-wider border border-emerald-400/30 active:scale-95"
                  >
                    <MessageCircle size={15} className="fill-white text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Session Info Details */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Shield size={12} className="text-amber-500" />
                  Matéria: <strong className="text-slate-800 dark:text-slate-200 uppercase">{currentRoom.category === 'misto' ? 'Misto MININT' : currentRoom.category.replace('_', ' ')}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-amber-500" />
                  5 Questões • {currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20)}s/cada
                </span>
              </div>

              {/* Cancel Room Action */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleCancelRoom(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 text-xs font-extrabold transition-all cursor-pointer border border-rose-500/30 flex items-center justify-center gap-2 uppercase shadow-2xs"
                >
                  <LogOut size={15} />
                  <span>Encerrar / Cancelar Sala</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE DUEL SCREEN WITH MISSING QUESTION FALLBACK */}
          {currentRoom.status === 'active' && !currentQ && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
              <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-300 font-bold">A carregar perguntas do duelo...</p>
              <button
                type="button"
                onClick={() => handleCancelRoom(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all"
              >
                Cancelar Duelo
              </button>
            </div>
          )}

          {/* ACTIVE DUEL SCREEN */}
          {currentRoom.status === 'active' && currentQ && (
            <div className="space-y-3 relative">
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
              {(() => {
                const myAvatarOpt = getAvatarOption(myPlayer?.avatarId || profile.avatarId, myPlayer?.branch || profile.branch, myPlayer?.displayName || profile.displayName);
                const oppAvatarOpt = getAvatarOption(opponent?.avatarId, opponent?.branch, opponent?.displayName);
                const totalTime = currentRoom.timePerQuestion || 20;
                const timerProgress = Math.max(0, Math.min(100, (questionTimer / totalTime) * 100));
                const isUrgent = questionTimer <= 5;
                const isWarning = questionTimer <= 10 && questionTimer > 5;

                const myScore = myPlayer?.score || 0;
                const oppScore = opponent?.score || 0;
                const totalScore = myScore + oppScore;
                const myPct = totalScore === 0 ? 50 : Math.round((myScore / totalScore) * 100);
                const oppPct = totalScore === 0 ? 50 : 100 - myPct;

                const myAnswered = myPlayer?.answers && myPlayer.answers[qIndex] !== undefined;
                const oppAnswered = opponent?.answers && opponent.answers[qIndex] !== undefined;

                return (
                  <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-lg relative overflow-hidden">
                    {/* Top Action Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Swords size={12} />
                        <span>Duelo em Curso</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCancelRoom(false)}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                        title="Abandonar Duelo"
                      >
                        <LogOut size={12} />
                        <span>Desistir</span>
                      </button>
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
                        <motion.div
                          key={`my-avatar-${myPlayer?.score}`}
                          initial={{ scale: 1 }}
                          animate={myPlayer?.score ? { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : { scale: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-lg shadow-sm relative"
                        >
                          {myAvatarOpt.symbol}
                          {myPlayer?.isVipSupporter && (
                            <span className="absolute -top-1 -right-1 text-xs" title="Apoiador VIP">🌟</span>
                          )}
                        </motion.div>
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

                        {/* Player Status Badge */}
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
                        <motion.div
                          key={`opp-avatar-${opponent?.score}`}
                          initial={{ scale: 1 }}
                          animate={opponent?.score ? { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, 10, -10, 5, 0] } : { scale: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-lg shadow-sm relative"
                        >
                          {oppAvatarOpt.symbol}
                          {opponent?.isVipSupporter && (
                            <span className="absolute -top-1 -right-1 text-xs" title="Apoiador VIP">🌟</span>
                          )}
                        </motion.div>
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

                        {/* Opponent Status Badge */}
                        <div className="mt-1">
                          {oppAnswered ? (
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
                );
              })()}

              {/* Question Card with Screen Shake, Animated Transition & Visual Glow */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRoom.currentQuestionIndex}
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

                <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {currentQ.categoryName}
                  </span>
                  <span>DUELO MININT</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {currentQ.options.map((opt, idx) => {
                    const hasMyAnswer = myAnswer !== undefined;
                    const isMyChoice = myAnswer?.chosenIndex === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (hasMyAnswer) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isMyChoice) {
                        btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold';
                      } else {
                        btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasMyAnswer}
                        onClick={() => handleAnswerQuestion(idx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-bold text-[11px] text-amber-400 shrink-0">
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

                {/* AI Explanation Trigger Button (if answered) */}
                {myAnswer !== undefined && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleExplainWithAI(currentQ, myAnswer.chosenIndex)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Explicar com IA</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      {opponentAnswer !== undefined ? 'A transitar...' : 'A aguardar oponente...'}
                    </span>
                  </div>
                )}
              </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* FINISHED DUEL VIEW */}
      {viewState === 'finished' && currentRoom && (() => {
        const isBotMatch = Boolean(
          currentRoom.player2?.isBot ||
          opponent?.isBot ||
          !opponent?.uid ||
          opponent?.uid.startsWith('bot_') ||
          (typeof opponent?.displayName === 'string' && (
            opponent.displayName.toLowerCase().includes('bot') ||
            opponent.displayName.toLowerCase().includes('tutor') ||
            opponent.displayName.toLowerCase().includes('ia') ||
            opponent.displayName.toLowerCase().includes('robô') ||
            opponent.displayName.toLowerCase().includes('robo')
          ))
        );

        return (
          <div className="multiplayer-duel-end-screen space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-6 text-center shadow-xl space-y-4">
              
              {/* Icon / Seal Header */}
              {isBotMatch ? (
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 mx-auto shadow-lg shadow-cyan-500/20 animate-pulse">
                  <Bot size={36} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
                  <Trophy size={36} />
                </div>
              )}

              <div>
                {/* Visual Seal / Badge for AI Train */}
                {isBotMatch && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-black text-xs uppercase tracking-widest shadow-sm mb-2">
                    <Bot size={14} className="text-cyan-400" />
                    <span>Treino IA</span>
                  </div>
                )}

                <h2 className="text-xl font-black text-amber-400 uppercase tracking-tight">
                  {isBotMatch
                    ? (currentRoom.winnerUid === profile.uid
                        ? '🤖 VITÓRIA EM TREINO IA'
                        : currentRoom.winnerUid === 'draw'
                        ? '🤝 EMPATE EM TREINO IA'
                        : 'TREINO IA CONCLUÍDO')
                    : (currentRoom.winnerUid === profile.uid
                        ? '🏆 VITÓRIA NO DUELO!'
                        : currentRoom.winnerUid === 'draw'
                        ? '🤝 EMPATE HONROSO'
                        : 'DERROTA NO DUELO')}
                </h2>
                <p className="text-xs text-slate-300 mt-1">Concurso Público do MININT Angola</p>
              </div>

              {/* AI Training Notice Banner */}
              {isBotMatch && (
                <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/90 border border-cyan-500/40 rounded-2xl p-3.5 text-left space-y-1.5 shadow-md">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-xs">
                    <Bot size={16} className="text-cyan-400 shrink-0" />
                    <span>Selo de Treino com Tutor IA</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    Este duelo contra o Tutor IA concedeu <strong>+{xpBreakdown?.totalXp || 0} XP de estudo</strong> para a sua evolução pessoal no Concurso MININT.
                  </p>
                  <p className="text-[10px] text-cyan-200/80 leading-relaxed border-t border-cyan-500/20 pt-1.5 font-medium">
                    💡 <em>Por ser uma partida contra robô de treino, este duelo <strong>NÃO alterou a sua pontuação na Liga de Duelos</strong> nem contou para o <strong>Ranking Geral de Duelos Vencidos</strong> (reservado para duelos PvP em tempo real entre candidatos).</em>
                  </p>
                </div>
              )}

            {/* Scoreboard Podia */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5">
                <p className="text-[10px] text-slate-400">{myPlayer?.displayName}</p>
                <p className="text-xl font-black text-amber-400 mt-1">{myPlayer?.score} Pts</p>
              </div>

              <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-3.5">
                <p className="text-[10px] text-slate-400">{opponent?.displayName}</p>
                <p className="text-xl font-black text-blue-400 mt-1">{opponent?.score} Pts</p>
              </div>
            </div>

            {/* XP Breakdown Card */}
            {xpBreakdown && (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" />
                    Pontuação & XP Ganho
                  </span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    +{xpBreakdown.totalXp} XP
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>
                      {xpBreakdown.resultType === 'win'
                        ? '🏆 Vitória no Duelo'
                        : xpBreakdown.resultType === 'draw'
                        ? '🤝 Empate no Duelo'
                        : '🎗️ Participação no Duelo'}
                    </span>
                    <span className="font-bold text-amber-300">+{xpBreakdown.baseXp} XP</span>
                  </div>

                  {xpBreakdown.fastAnswersCount > 0 && (
                    <div className="flex justify-between items-center text-amber-400/90 font-medium">
                      <span className="flex items-center gap-1">
                        <Zap size={12} />
                        Bónus de Rapidez (&lt;5s x{xpBreakdown.fastAnswersCount})
                      </span>
                      <span className="font-bold text-amber-300">+{xpBreakdown.speedBonusXp} XP</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Novo Saldo Total:</span>
                    <span className="font-mono font-extrabold text-amber-400">
                      {profile.totalXp} XP • {profile.rankTitle}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Review Questions with AI */}
            <div className="text-left pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Rever Questões do Duelo com IA:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentRoom.questions.map((q, idx) => {
                  const myAns = myPlayer?.answers[idx];
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs gap-2"
                    >
                      <span className="truncate text-slate-200">{q.question}</span>
                      <button
                        onClick={() => handleExplainWithAI(q, myAns?.chosenIndex ?? 0)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-bold shrink-0 flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        <span>IA</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meme Generator Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMemeModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition-all active:scale-98 border border-rose-400/40"
            >
              <Sparkles size={18} className="animate-spin text-amber-200" />
              <span>Criar Meme do Concurso ✨</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => {
                  if (opponent) {
                    handleRechallenge(
                      opponent.displayName,
                      opponent.branch,
                      opponent.avatarId,
                      opponent.province,
                      opponent.isBot,
                      currentRoom.category
                    );
                  } else {
                    handleCreateRoom();
                  }
                }}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Crosshair size={16} className="text-slate-950 animate-pulse" />
                <span>DESAFIAR NOVAMENTE</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRoom(null);
                  setViewState('lobby');
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>LOBBY DE DUELOS</span>
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* AI Explanation Modal */}
      {modalQuestion && (
        <AIExplanationModal
          question={modalQuestion}
          userChosenIndex={myAnswer?.chosenIndex ?? null}
          explanationData={aiExplanation}
          isLoading={isAILoading}
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}

      {/* Meme Generator Modal */}
      {viewState === 'finished' && currentRoom && (() => {
        const myCorrectAnswers = myPlayer?.answers
          ? Object.values(myPlayer.answers).filter((a: { isCorrect?: boolean }) => Boolean(a?.isCorrect)).length
          : 0;
        const totalQ = currentRoom.questions?.length || 5;
        const myPct = Math.min(100, Math.round((myCorrectAnswers / Math.max(1, totalQ)) * 100));
        const myTotalTime = myPlayer?.answers
          ? Object.values(myPlayer.answers).reduce((acc: number, a: any) => acc + (a?.timeSeconds || 0), 0)
          : 0;

        return (
          <MemeGeneratorModal
            isOpen={isMemeModalOpen}
            onClose={() => setIsMemeModalOpen(false)}
            profile={profile}
            score={myCorrectAnswers}
            totalQuestions={totalQ}
            pct={myPct}
            timeSeconds={myTotalTime}
            categoryName={`Duelo 1v1 - ${currentRoom.category}`}
          />
        );
      })()}

      {/* Confirmation Modal: Limpar Histórico */}
      <AnimatePresence>
        {isClearHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto text-xl shadow-inner">
                <Trash2 size={24} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Limpar Histórico de Duelos
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deseja limpar todo o histórico de duelos? Esta ação eliminará todos os seus registos locais de batalhas passadas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearHistoryModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearHistory}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Confirmar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl border font-bold text-xs shadow-2xl flex items-center gap-2.5 max-w-sm text-center ${
              toastNotification.isError
                ? 'bg-slate-950/95 border-rose-500/80 text-rose-300 shadow-rose-500/30'
                : 'bg-slate-900 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20'
            }`}
          >
            {toastNotification.isError ? (
              <XCircle size={18} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Exit Modal */}
      {/* Fullscreen Vitória de Honra Overlay for Real PvP Wins */}
      <AnimatePresence>
        {showHonorVictoryOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 text-center text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.4)] overflow-hidden my-auto"
            >
              {/* Top ambient gold glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-amber-500/25 to-transparent blur-xl pointer-events-none" />

              {/* Animated Trophy Seal */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.5)] mb-4"
              >
                <Trophy size={42} className="text-slate-950 fill-slate-950" />
              </motion.div>

              {/* Badge label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider mb-2"
              >
                <Sparkles size={13} className="text-amber-400 fill-amber-400" />
                <span>DUELO PVP 1V1 • CONQUISTA REAL</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase tracking-tight"
              >
                VITÓRIA DE HONRA!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-xs text-slate-300 mt-1 max-w-xs mx-auto"
              >
                Superaste o teu oponente num duelo oficial 1v1 entre candidatos do MININT Angola!
              </motion.p>

              {/* Opponent Defeated Card */}
              {honorVictoryOpponent && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-lg">
                      {getAvatarOption(honorVictoryOpponent.avatarId, honorVictoryOpponent.branch, honorVictoryOpponent.displayName).symbol}
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Oponente Vencido:</p>
                      <p className="text-xs font-black text-slate-100">{honorVictoryOpponent.displayName}</p>
                      <p className="text-[10px] text-slate-400">{honorVictoryOpponent.branch} • {honorVictoryOpponent.province || 'Luanda'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-black bg-amber-500 text-slate-950 px-2 py-1 rounded-md uppercase shadow-sm">
                      +1 Vit. PvP
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Ranking & League Rewards Summary */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-2 gap-2 mt-3 text-left"
              >
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Swords size={11} /> Ranking Duelos
                  </span>
                  <p className="text-sm font-black text-slate-100 mt-0.5">+1 Duelo Vencido</p>
                  <p className="text-[9px] text-slate-400">Contabilizado no Perfil</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Trophy size={11} /> Liga de Duelos
                  </span>
                  <p className="text-sm font-black text-slate-100 mt-0.5">+{honorVictoryPts} Pts Semanais</p>
                  <p className="text-[9px] text-slate-400">Subida na Liga</p>
                </div>
              </motion.div>

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                type="button"
                onClick={() => setShowHonorVictoryOverlay(false)}
                className="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span>VER RESULTADO COMPLETO</span>
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => handleCancelRoom(true)}
        sessionType="duelo"
      />
    </div>
  );
};
