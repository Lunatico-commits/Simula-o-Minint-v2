import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, DuelRoom, DuelPlayer, MININTBranch, Question, QuestionCategory, AIExplanationResponse, normalizeCategory, DuelHistoryEntry } from '../types';
import { db, rtdb, auth } from '../lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, limit, serverTimestamp 
} from 'firebase/firestore';
import {
  ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, onValue as rtdbOnValue, off as rtdbOff, remove as rtdbRemove, get as rtdbGet, onDisconnect as rtdbOnDisconnect
} from 'firebase/database';
import { QUESTION_BANK } from '../data/questions';
import { getRandomQuestions, shuffleQuestionOptions } from '../utils/questionSelector';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { ReactiveAvatar } from './ReactiveAvatar';
import { UserAvatar } from './UserAvatar';
import { DuelArena } from './DuelArena';
import { explainQuestionWithAI } from '../services/apiService';
import { AIExplanationModal } from './AIExplanationModal';
import { MemeGeneratorModal } from './MemeGeneratorModal';
import { sendDuelInvitationNotification } from '../utils/notifications';
import { fireConfetti, fireHonorVictoryConfetti, fireDuelVictoryFullScreenConfetti, clearConfetti } from '../utils/confetti';
import { LEAGUES_CONFIG, DuelLeague } from '../utils/league';
import { 
  playCorrectSound, 
  playIncorrectSound, 
  playVictorySound, 
  playDefeatSound, 
  playQuizCompleteSound, 
  playTickSound, 
  playRelampagoTickSound,
  playRoundStartSound,
  stopAllCombatSounds,
  stopAndDestroyAudioElement,
  getSoundEnabled,
  setSoundEnabled
} from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Users, Plus, KeyRound, Sparkles, Trophy, CheckCircle2, XCircle, Clock, Shield, ArrowRight, ArrowLeft, X, RotateCcw, AlertCircle, Zap,
  Copy, Check, Share2, Radio, UserCheck, MapPin, Loader2, History, Flame, Trash2, Crosshair, RefreshCw, LogOut, LogIn,
  MessageCircle, Link2, Bot, BarChart2, Target, BookOpen, Volume2, VolumeX, WifiOff, UserX, Hourglass, Scale
} from 'lucide-react';
import { ConfirmExitModal } from './ConfirmExitModal';
import { VsBattleOverlay } from './VsBattleOverlay';
import { trackMissionProgress, updateQuestProgress } from '../utils/dailyMissions';
import {
  setupRoomOnDisconnect,
  validateRoomAndHostAvailability,
  joinRoom,
  filterValidLobbyRooms,
  cleanupGhostRoom,
  cleanRoomCode,
  formatCode,
  listenToOpenRooms,
  saveRoomToRTDB,
  createRoom as createRoomService,
  createAIRoom,
  getQuestionsWithTimeout,
  MININT_CONTINGENCY_QUESTIONS,
  listenToRoom,
  submitDuelAnswer,
  updateDuelRoomNode,
  sanitizeForRTDB,
  normalizeRoomData,
  MAX_OPEN_ROOM_AGE_MS
} from '../services/duelService';

/**
 * Normalizes user-entered room codes into the standardized 'MNT-XXXX' format.
 * Universal helper alias to ensure 100% uniformity.
 */
export const normalizeRoomCode = formatCode;
export { formatCode };

const buildSafePlayer = (userProfile: any, overrides?: Partial<DuelPlayer>): DuelPlayer => {
  const rawPlayer: DuelPlayer = {
    uid: userProfile?.uid || userProfile?.id || 'anon',
    displayName: userProfile?.displayName || userProfile?.name || 'Candidato',
    branch: userProfile?.branch || 'PNA',
    avatarId: userProfile?.avatarId || 'policia',
    province: userProfile?.province || 'Luanda',
    photoURL: userProfile?.photoURL || userProfile?.avatar || '',
    isVipSupporter: !!(userProfile?.isVipSupporter),
    equippedFrame: userProfile?.equippedFrame || userProfile?.avatarAccessories?.frame || null,
    equippedBackground: userProfile?.equippedBackground || userProfile?.avatarAccessories?.background || null,
    equippedUniform: userProfile?.equippedUniform || null,
    avatarAccessories: userProfile?.avatarAccessories || null,
    score: 0,
    currentQuestionIndex: 0,
    answers: {},
    isReady: true,
    isConnected: true,
    lastActive: Date.now(),
    ...overrides,
  };
  return sanitizeForRTDB(rawPlayer);
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

export const getCategoryDisplayName = (cat?: string): string => {
  if (!cat || cat === 'misto' || cat === 'Geral') return 'Misto (Todas as Matérias)';
  switch (cat) {
    case 'legislacao_minint':
      return 'Lei Orgânica do MININT & Estatutos';
    case 'direito_constituicao':
      return 'Constituição da República (CRA)';
    case 'direito_penal':
      return 'Código Penal & Processo Penal Angolano';
    case 'lingua_portuguesa':
      return 'Gramática & Ortografia da Língua Portuguesa';
    case 'raciocinio_logico':
      return 'Raciocínio Lógico';
    case 'portugues_raciocinio':
      return 'Língua Portuguesa & Raciocínio Lógico';
    case 'historia_cultura_geral':
    case 'cultura_geral':
      return 'Cultura Geral, História & Geografia de Angola';
    case 'informatica_basica':
      return 'Informática Básica & TICs para Exames';
    default:
      return cat.replace(/_/g, ' ').toUpperCase();
  }
};

/**
 * Calculates current consecutive correct answers streak for a player.
 */
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

/**
 * Calculates maximum consecutive correct answers streak achieved in a duel.
 */
export const calculateMaxStreak = (answers?: Record<number, { isCorrect: boolean }>): number => {
  if (!answers) return 0;
  let currentStreak = 0;
  let maxStreak = 0;
  const indices = Object.keys(answers).map(Number).sort((a, b) => a - b);
  for (const idx of indices) {
    if (answers[idx]?.isCorrect) {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
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
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoJoinedCode, setAutoJoinedCode] = useState<string | null>(null);

  // Exit Confirmation Modal State
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  // Host Waiting Room Modal / Screen State
  const [showWaitingModal, setShowWaitingModal] = useState<boolean>(false);
  // Host Room Closed Notification Modal State
  const [isRoomClosedModalOpen, setIsRoomClosedModalOpen] = useState(false);
  // Forfeit Victory Alert Modal State
  const [isForfeitModalOpen, setIsForfeitModalOpen] = useState(false);
  // Pre-game animated 'VS' screen overlay State
  const [showVsOverlay, setShowVsOverlay] = useState<boolean>(false);
  // Match phase control: 'waiting' | 'preparing' | 'playing' | 'finished'
  const [matchPhase, setMatchPhase] = useState<'waiting' | 'preparing' | 'playing' | 'finished'>('waiting');
  // Granular view state: 'lobby' | 'room' | 'arena' | 'finished'
  const [currentView, setCurrentViewState] = useState<'lobby' | 'room' | 'arena' | 'finished'>('lobby');

  // Opponent Inactivity & Connection State for active multiplayer matches
  const [opponentInactivitySeconds, setOpponentInactivitySeconds] = useState<number>(0);
  const opponentLastActiveRef = useRef<number>(Date.now());
  const processedForfeitRef = useRef<string | null>(null);

  // Keep a reference to currentRoom for safe reference
  const currentRoomRef = useRef<DuelRoom | null>(null);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Profile, ViewState, and ProcessedDuelId refs for stable listener callbacks
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const viewStateRef = useRef(viewState);
  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  const processedDuelIdRef = useRef<string | null>(null);

  // Control ref to ensure navigation to DuelArena is triggered EXACTLY ONCE on match start
  const hasNavigatedRef = useRef<boolean>(false);

  // Active room code state and extraction for strictly controlled useEffect dependencies
  const [activeRoomCodeState, setActiveRoomCode] = useState<string>('');
  const currentRoomId = currentRoom?.id || currentRoom?.roomCode || '';
  const isCurrentRoomBot = !!currentRoom?.player2?.isBot;
  const activeRoomCode = activeRoomCodeState || ((!isCurrentRoomBot && currentRoomId) ? cleanRoomCode(currentRoomId) : '');

  // Reset navigation flag whenever room code changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [activeRoomCode]);

  // Funções centrais de controle de navegação e sala ativa
  const setActiveRoom = (room: DuelRoom | null) => {
    const normalized = room ? (normalizeRoomData(room) || room) : null;
    setCurrentRoom(normalized);
    if (normalized && !normalized.player2?.isBot) {
      const code = cleanRoomCode(normalized.roomCode || normalized.id || normalized.code);
      if (code) {
        setActiveRoomCode(code);
      }
    }
  };

  const setCurrentView = (view: 'lobby' | 'room' | 'arena' | 'finished') => {
    setCurrentViewState(view);
    if (view === 'arena' || view === 'room') {
      setViewState('room');
    } else if (view === 'finished') {
      setViewState('finished');
    } else {
      setViewState('lobby');
    }
  };

  // Centralized Function to Completely Clear Match State & Return to Clean Lobby
  const clearDuelSessionAndReturnToLobby = () => {
    // 0. Cancel any running confetti particles immediately
    clearConfetti();
    stopAllCombatSounds();

    // 1. Reset all state to clean lobby
    setCurrentRoom(null);
    setActiveRoomCode('');
    setShowWaitingModal(false);
    setCurrentView('lobby');
    hasNavigatedRef.current = false;
    setProcessedDuelId(null);
    setShowHonorVictoryOverlay(false);
    setShowVsOverlay(false);
    setMatchPhase('waiting');
    setIsRoomClosedModalOpen(false);
    setIsExitModalOpen(false);
    setIsForfeitModalOpen(false);
    setRoomCodeInput('');
    setErrorMessage('');
    setAutoJoinedCode(null);
    setOpponentInactivitySeconds(0);
    setAnswerFeedback(null);
    setFloatingParticles([]);
    setConsecutiveCorrectStreak(0);
    setShowComboSparkleAnimation(false);
    setViewState('lobby');

    // 2. Clear any match tracking keys in localStorage and sessionStorage
    try {
      const keysToRemove = [
        'activeDuelId',
        'currentMatch',
        'minint_active_duel_id',
        'minint_current_duel',
        'minint_current_match',
        'minint_duel_room_code',
        'minint_duel_view_state'
      ];
      keysToRemove.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch (e) {
      console.warn('Erro ao limpar chaves de duelo da sessão:', e);
    }

    // 3. Clear direct join duel parameters from URL
    try {
      const url = new URL(window.location.href);
      const duelParams = ['join', 'code', 'room', 'duelRoom', 'duel', 'sala'];
      let changed = false;
      duelParams.forEach((p) => {
        if (url.searchParams.has(p)) {
          url.searchParams.delete(p);
          changed = true;
        }
      });
      if (changed) {
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch (e) {}
  };

  // RTDB Presence Tracker & Heartbeat (Maintains presence without false abandonment triggers)
  useEffect(() => {
    if (!activeRoomCode || isCurrentRoomBot || viewState !== 'room' || !profile?.uid) {
      setOpponentInactivitySeconds(0);
      return;
    }

    const roomId = activeRoomCode;
    const activeRoom = currentRoomRef.current;
    const isHost = activeRoom?.player1?.uid === profile.uid || activeRoom?.hostUid === profile.uid;
    const myKey = isHost ? 'player1' : 'player2';
    const opponentUid = isHost ? (activeRoom?.player2?.uid || activeRoom?.guestUid) : (activeRoom?.player1?.uid || activeRoom?.hostUid);

    const presenceRef = rtdbRef(rtdb, `duels/${roomId}/${myKey}/isConnected`);
    const lastActiveRef = rtdbRef(rtdb, `duels/${roomId}/${myKey}/lastActive`);
    const userPresenceRef = rtdbRef(rtdb, `duels/${roomId}/presence/${profile.uid}`);

    // Set initial presence and RTDB onDisconnect hook using duelService
    try {
      setupRoomOnDisconnect({
        roomId,
        userUid: profile.uid,
        isHost,
        status: (activeRoom?.status as any) || 'matched',
        opponentUid,
      });

      rtdbSet(presenceRef, true);
      rtdbSet(lastActiveRef, Date.now());
      rtdbSet(userPresenceRef, {
        isConnected: true,
        lastActive: Date.now(),
      });
    } catch (e) {
      console.warn('Erro ao configurar presença no RTDB:', e);
    }

    // Heartbeat loop: update timestamp every 3 seconds
    const heartbeatInterval = setInterval(() => {
      try {
        rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}/${myKey}`), {
          isConnected: true,
          lastActive: Date.now(),
        });
        rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}/presence/${profile.uid}`), {
          isConnected: true,
          lastActive: Date.now(),
        });
      } catch (e) {}
    }, 3000);

    // Listen to Opponent's RTDB presence & heartbeat
    let oppPresenceUnsub = () => {};
    let oppPresenceTargetRef: any = null;
    if (opponentUid) {
      const oppPresenceRef = rtdbRef(rtdb, `duels/${roomId}/presence/${opponentUid}`);
      oppPresenceTargetRef = oppPresenceRef;
      oppPresenceUnsub = rtdbOnValue(oppPresenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (typeof val?.lastActive === 'number') {
            opponentLastActiveRef.current = Math.max(opponentLastActiveRef.current, val.lastActive);
          }
        }
      });
    }

    return () => {
      clearInterval(heartbeatInterval);
      if (typeof oppPresenceUnsub === 'function') {
        try { oppPresenceUnsub(); } catch (e) {}
      }
      if (oppPresenceTargetRef) {
        try { rtdbOff(oppPresenceTargetRef); } catch (e) {}
      }
      // Apenas marca como desconectado se o usuário realmente saiu da sala
      if (viewStateRef.current !== 'room') {
        try {
          rtdbSet(presenceRef, false);
          rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}/presence/${profile.uid}`), {
            isConnected: false,
            lastActive: Date.now(),
          });
        } catch (e) {}
      }
    };
  }, [activeRoomCode, isCurrentRoomBot, viewState, profile?.uid]);

  // Clean mount & unmount effect (Always start clean and avoid false forfeit on simple unmounts)
  useEffect(() => {
    // Clean lingering duel storage items on mount
    try {
      ['activeDuelId', 'currentMatch', 'minint_active_duel_id', 'minint_current_duel'].forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch (e) {}

    return () => {
      clearConfetti();
      const room = currentRoomRef.current;
      if (room && !room.player2?.isBot && room.status === 'waiting') {
        const roomId = room.id || room.roomCode;
        const isHost = room.hostUid ? (room.hostUid === profile?.uid) : (room.player1?.uid === profile?.uid);
        if (isHost && roomId) {
          try {
            const roomRef = doc(db, 'duels', roomId);
            deleteDoc(roomRef).catch(() => {});
            rtdbRemove(rtdbRef(rtdb, `duels/${roomId}`)).catch(() => {});
          } catch (e) {}
        }
      }
      // Reset any active modal overlays on unmount
      setShowHonorVictoryOverlay(false);
      setIsExitModalOpen(false);
      setIsRoomClosedModalOpen(false);
      setIsForfeitModalOpen(false);
      currentRoomRef.current = null;
    };
  }, [profile?.uid]);

  // Auto-join room if opened via direct invite URL link or push notification
  useEffect(() => {
    let targetCode = initialRoomCode;
    if (!targetCode) {
      try {
        const params = new URLSearchParams(window.location.search);
        targetCode = params.get('join') || params.get('code') || params.get('room') || params.get('duelRoom') || params.get('duel') || params.get('sala');
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

  // Duel History State & User-Exclusive Filter
  const [duelHistory, setDuelHistory] = useState<DuelHistoryEntry[]>(() => {
    try {
      const key = `minint_duel_history_${profile.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: DuelHistoryEntry[] = JSON.parse(saved);
        return parsed.filter(d => !d.userId || d.userId === profile.uid || d.player1Id === profile.uid || d.player2Id === profile.uid || d.myUid === profile.uid);
      }
      const legacySaved = localStorage.getItem('minint_duel_history');
      if (legacySaved) {
        const parsed: DuelHistoryEntry[] = JSON.parse(legacySaved);
        return parsed.filter(d => (d.userId && d.userId === profile.uid) || d.player1Id === profile.uid || d.player2Id === profile.uid || d.myUid === profile.uid);
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Reload history exclusively for the active account when profile changes
  useEffect(() => {
    if (!profile?.uid) return;
    try {
      const key = `minint_duel_history_${profile.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: DuelHistoryEntry[] = JSON.parse(saved);
        setDuelHistory(parsed.filter(d => !d.userId || d.userId === profile.uid || d.player1Id === profile.uid || d.player2Id === profile.uid || d.myUid === profile.uid));
      } else {
        setDuelHistory([]);
      }
    } catch (e) {
      setDuelHistory([]);
    }
  }, [profile?.uid]);

  // Strict user-exclusive filtered list of duels
  const userDuelHistory = useMemo(() => {
    if (!profile?.uid) return [];
    return duelHistory.filter((duel) => {
      if (duel.player1Id || duel.player2Id) {
        return duel.player1Id === profile.uid || duel.player2Id === profile.uid;
      }
      if (duel.userId) {
        return duel.userId === profile.uid;
      }
      if (duel.myUid) {
        return duel.myUid === profile.uid;
      }
      return true;
    });
  }, [duelHistory, profile?.uid]);

  const [historyFilter, setHistoryFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  // Vitória de Honra Fullscreen Overlay state (PvP Wins)
  const [showHonorVictoryOverlay, setShowHonorVictoryOverlay] = useState(false);
  const [honorVictoryOpponent, setHonorVictoryOpponent] = useState<DuelPlayer | null>(null);
  const [honorVictoryPts, setHonorVictoryPts] = useState<number>(100);

  // Audio preference state respecting user settings
  const [isSoundMuted, setIsSoundMuted] = useState(!getSoundEnabled());

  const handleToggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    setSoundEnabled(!nextMuted);
    if (!nextMuted) {
      playRoundStartSound();
      showToast('Efeitos sonoros ativados 🔊');
    } else {
      showToast('Efeitos sonoros silenciados 🔇');
    }
  };

  const showToast = (msg: string, isError: boolean = false) => {
    setToastNotification({ message: msg, isError });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === msg ? null : prev));
    }, 4000);
  };

  // Save history changes to user-specific localStorage key
  useEffect(() => {
    if (profile?.uid) {
      try {
        const key = `minint_duel_history_${profile.uid}`;
        const userOnly = duelHistory.filter(d => !d.userId || d.userId === profile.uid || d.player1Id === profile.uid || d.player2Id === profile.uid || d.myUid === profile.uid);
        localStorage.setItem(key, JSON.stringify(userOnly));
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

  // Consecutive Correct Answers Streak State (Combo Counter)
  const [consecutiveCorrectStreak, setConsecutiveCorrectStreak] = useState<number>(0);
  const [showComboSparkleAnimation, setShowComboSparkleAnimation] = useState<boolean>(false);

  // Reset streak when leaving or when room resets to waiting/lobby
  useEffect(() => {
    if (viewState !== 'room' || currentRoom?.status === 'waiting' || currentRoom?.status === 'countdown') {
      setConsecutiveCorrectStreak(0);
      setShowComboSparkleAnimation(false);
    }
  }, [viewState, currentRoom?.status]);

  // Clear answer feedback, particles and play round start sound on question change or viewState change
  useEffect(() => {
    setAnswerFeedback(null);
    setFloatingParticles([]);
    const isNowActive = currentRoom?.status === 'active' || currentRoom?.status === 'matched' || currentRoom?.status === 'in_progress';
    if (viewState === 'room' && isNowActive) {
      playRoundStartSound();
    }
  }, [currentRoom?.currentQuestionIndex, viewState, currentRoom?.status]);
  
  // AI Explanation Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // Listen for open public rooms in lobby (strictly active only when viewState === 'lobby')
  useEffect(() => {
    // Se o usuário não está no lobby (está no duelo ou finalizado), NÃO cria nenhum listener!
    if (viewState !== 'lobby') {
      return;
    }

    let unsubscribeFirestore = () => {};
    let unsubscribeRtdb = () => {};
    let duelsRtdbTargetRef: any = null;
    setIsLoadingOpenRooms(true);

    try {
      const q = query(
        collection(db, 'duels'),
        where('status', '==', 'waiting'),
        limit(15)
      );

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const firestoreRooms: DuelRoom[] = [];

        snapshot.forEach((docSnap) => {
          const r = docSnap.data() as any;
          if (r && r.status === 'waiting' && !r.player2) {
            const safeP1 = buildSafePlayer(r.player1 || {});
            firestoreRooms.push({
              ...r,
              id: docSnap.id,
              code: r.code || r.roomCode || docSnap.id,
              roomCode: r.roomCode || r.code || docSnap.id,
              player1: safeP1,
            });
          }
        });
        setOpenRooms(filterValidLobbyRooms(firestoreRooms, profile?.uid));
        setIsLoadingOpenRooms(false);
      }, (error) => {
        console.warn('Erro ao escutar salas públicas no Firestore:', error);
        setIsLoadingOpenRooms(false);
      });
    } catch (e) {
      console.warn('Erro ao configurar consulta de salas no Firestore:', e);
      setIsLoadingOpenRooms(false);
    }

    try {
      unsubscribeRtdb = listenToOpenRooms(profile?.uid, (rooms) => {
        setOpenRooms(rooms);
        setIsLoadingOpenRooms(false);
      });
    } catch (e) {
      console.warn('Erro ao configurar escuta de salas no RTDB:', e);
    }

    // Periodic sweep: clean up any rooms older than 2 minutes in real time without refresh
    const sweepInterval = setInterval(() => {
      setOpenRooms((prev) => filterValidLobbyRooms(prev, profile?.uid));
    }, 3000);

    return () => {
      try {
        unsubscribeFirestore();
      } catch (e) {}
      try {
        unsubscribeRtdb();
      } catch (e) {}
      if (duelsRtdbTargetRef) {
        try {
          rtdbOff(duelsRtdbTargetRef);
        } catch (e) {}
      }
      clearInterval(sweepInterval);
    };
  }, [viewState, profile?.uid]);

  const [processedDuelId, setProcessedDuelId] = useState<string | null>(null);
  const processedTimeoutRef = useRef<string>('');
  const claimedRewardsRef = useRef<Set<string>>(new Set());

  const [xpBreakdown, setXpBreakdown] = useState<{
    baseXp: number;
    speedBonusXp: number;
    fastAnswersCount: number;
    totalXp: number;
    resultType: 'win' | 'draw' | 'loss';
  } | null>(null);

  // Helper to count consecutive unanswered questions (timeout / disconnect)
  const countConsecutiveTimeouts = (answers: Record<number, { chosenIndex: number }> | undefined, currentIdx: number): number => {
    if (!answers) return 0;
    let count = 0;
    for (let i = currentIdx; i >= 0; i--) {
      if (answers[i]?.chosenIndex === -1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // Helper to handle immediate forfeit victory
  const handleForfeitVictory = (
    room: DuelRoom,
    winnerUid: string,
    forfeitedByUid: string,
    reason: 'opponent_left' | 'inactivity' | 'timeout' = 'opponent_left'
  ) => {
    const isBot = room.player2?.isBot;
    const roomId = room.id || room.roomCode;

    const finishedRoom: DuelRoom = {
      ...room,
      status: 'finished',
      winnerUid,
      forfeitedBy: forfeitedByUid,
      forfeitReason: reason,
      isForfeit: true,
      rewardClaimed: false,
    };

    setCurrentRoom(finishedRoom);
    setViewState('finished');

    if (winnerUid === profile.uid) {
      setIsForfeitModalOpen(true);
    }

    if (processedDuelId !== finishedRoom.id) {
      setProcessedDuelId(finishedRoom.id);
      handleDuelFinished(finishedRoom);
    }

    if (!isBot && roomId) {
      try {
        const roomRef = doc(db, 'duels', roomId);
        setDoc(roomRef, sanitizeFirestoreData({
          status: 'finished',
          winnerUid,
          forfeitedBy: forfeitedByUid,
          forfeitReason: reason,
          isForfeit: true,
          player1: sanitizeFirestoreData(finishedRoom.player1),
          player2: finishedRoom.player2 ? sanitizeFirestoreData(finishedRoom.player2) : null,
        }), { merge: true }).catch((e) => console.warn('Erro ao salvar vitória por desistência no Firestore:', e));

        rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}`), sanitizeForRTDB({
          status: 'finished',
          winnerUid,
          forfeitedBy: forfeitedByUid,
          forfeitReason: reason,
          isForfeit: true,
          player1: finishedRoom.player1,
          player2: finishedRoom.player2 || null,
        })).catch((e) => console.warn('Erro ao salvar vitória por desistência no RTDB:', e));
      } catch (e) {
        console.warn('Erro ao finalizar duelo por abandono:', e);
      }
    }
  };

  // Escutador Unificado no Componente Pai (Online Multiplayer - RTDB):
  // O escutador monitoriza o nó exato: ref(rtdb, `duels/${activeRoomCode}`)
  // Quando o snapshot retornar status === "matched":
  // - Se a modal da Sala de Espera estiver aberta, feche-a (setShowWaitingModal(false))
  // - Atualize os dados da sala ativa com o snapshot retornado (setActiveRoom(fullRoomData))
  // - Mude a vista principal para 'arena' (setCurrentView('arena')) em AMBOS os dispositivos
  useEffect(() => {
    if (!activeRoomCode || isCurrentRoomBot) return;
    const cleanCode = cleanRoomCode(activeRoomCode).trim().toUpperCase();
    if (!cleanCode) return;

    const roomRef = rtdbRef(rtdb, `duels/${cleanCode}`);

    const unsubscribe = rtdbOnValue(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Se o duelo estiver em preparação ou ativo, NUNCA resetar a sala por causa de snapshot nulo transitório
          if (matchPhase === 'preparing' || matchPhase === 'playing' || viewStateRef.current === 'finished') {
            console.warn('[MultiplayerDuel] Snapshot nulo ignorado durante duelo ativo para prevenir kickback.');
            return;
          }

          const activeRoom = currentRoomRef.current;
          const currentProfile = profileRef.current;

          // Prevenção de encerramento falso durante criação inicial ou na sala de espera:
          if (activeRoom && (Date.now() - (activeRoom.createdAt || 0) < 15000 || showWaitingModal || matchPhase === 'waiting')) {
            console.warn('[MultiplayerDuel] Aguardando sincronização da sala de espera no RTDB...');
            return;
          }

          if (viewStateRef.current === 'room' && activeRoom) {
            const isHost = activeRoom.hostUid ? (activeRoom.hostUid === currentProfile?.uid) : (activeRoom.player1?.uid === currentProfile?.uid);
            if (!isHost) {
              // If match was active, award forfeit victory to the player who stayed
              if ((activeRoom.status === 'active' || activeRoom.status === 'matched' || activeRoom.status === 'playing') && activeRoom.player2) {
                handleForfeitVictory(activeRoom, currentProfile.uid, isHost ? activeRoom.player1.uid : activeRoom.player2.uid, 'opponent_left');
              } else {
                setIsRoomClosedModalOpen(true);
              }
            } else {
              setViewState('lobby');
              setCurrentRoom(null);
              setActiveRoomCode('');
            }
          }
          return;
        }

        const snapshotVal = snapshot.val();
        const roomData = normalizeRoomData(snapshotVal) || snapshotVal;
        const status = roomData?.status || snapshotVal?.status;

        if (status === 'abandoned' || status === 'cancelled') {
          setShowVsOverlay(false);
          stopAllCombatSounds();
          const activeRoom = currentRoomRef.current;
          const currentProfile = profileRef.current;
          if (viewStateRef.current === 'room' && activeRoom) {
            const isHost = roomData?.hostUid ? (roomData.hostUid === currentProfile?.uid) : (roomData?.player1?.uid === currentProfile?.uid);
            const isRoomMatchActive = activeRoom.status === 'active' || activeRoom.status === 'matched' || activeRoom.status === 'playing' || activeRoom.status === 'in_progress';
            if (isRoomMatchActive && (roomData?.player2 || snapshotVal?.player2)) {
              const p2 = roomData?.player2 || snapshotVal?.player2;
              const remainingWinnerUid = isHost ? (roomData?.player1?.uid || activeRoom.player1.uid) : (p2?.uid || currentProfile?.uid);
              const leaverUid = isHost ? p2?.uid : (roomData?.player1?.uid || activeRoom.player1.uid);
              handleForfeitVictory(roomData || activeRoom, remainingWinnerUid, leaverUid || 'opponent', 'opponent_left');
            } else {
              if (!isHost) {
                setIsRoomClosedModalOpen(true);
              } else {
                setViewState('lobby');
                setCurrentRoom(null);
                setActiveRoomCode('');
              }
            }
          }
          return;
        }

        // Confirmação Rigorosa de Convidado e status 'matched'
        const hasGuestData = Boolean(
          (roomData?.player2 && (roomData.player2.uid || roomData.player2.isBot)) ||
          (snapshotVal?.player2 && (snapshotVal.player2.uid || snapshotVal.player2.isBot)) ||
          (roomData?.guest && (roomData.guest.uid || roomData.guest.name)) ||
          (snapshotVal?.guest && (snapshotVal.guest.uid || snapshotVal.guest.name)) ||
          roomData?.guestUid ||
          snapshotVal?.guestUid
        );
        const isMatchedStatus = status === 'matched' ||
          hasGuestData ||
          status === 'playing' ||
          status === 'in_progress' ||
          status === 'active';

        // Se um dos jogadores sair durante a preparação, cancela a contagem e áudios pendentes
        if (hasNavigatedRef.current && showVsOverlay && matchPhase === 'preparing' && !hasGuestData && !isMatchedStatus) {
          setShowVsOverlay(false);
          setMatchPhase('waiting');
          stopAllCombatSounds();
        }

        // REGRA DE OURO - Navegação Reativa pelo Banco de Dados:
        // Tanto o Anfitrião quanto o Convidado DEVEM mudar para o ecrã 'arena' APENAS quando o escutador do Firebase detetar 'status === "matched"'.
        if (isMatchedStatus && (!hasNavigatedRef.current || showWaitingModal || matchPhase === 'waiting' || currentView !== 'arena')) {
          hasNavigatedRef.current = true;
          // Fecha imediatamente a modal / ecrã da Sala de Espera
          setShowWaitingModal(false);
          // Atualiza os dados da sala ativa com o snapshot retornado (com perguntas e dados do Convidado)
          const fullRoomData = normalizeRoomData(snapshotVal) || roomData;
          setActiveRoom(fullRoomData);
          // Mude a vista principal para 'arena' ('setCurrentView('arena')') em AMBOS os dispositivos
          setCurrentView('arena');
          setMatchPhase('preparing');
          setShowVsOverlay(true);
          playRoundStartSound();
          // Fechar imediatamente qualquer modal ou alerta aberto
          setIsExitModalOpen(false);
          setIsRoomClosedModalOpen(false);
          setIsForfeitModalOpen(false);
          setIsAIModalOpen(false);
          setIsMemeModalOpen(false);
          setIsClearHistoryModalOpen(false);
          setErrorMessage('');
          setLoading(false);
          setIsJoining(false);
        }

        if (status === 'finished' && viewStateRef.current !== 'finished') {
          setShowVsOverlay(false);
          setMatchPhase('finished');
          stopAllCombatSounds();
          setViewState('finished');
          if (roomData?.isForfeit && roomData.winnerUid === profileRef.current?.uid) {
            setIsForfeitModalOpen(true);
          }
          const finishedId = roomData?.id || snapshotVal?.id || activeRoomCode;
          if (processedDuelIdRef.current !== finishedId) {
            processedDuelIdRef.current = finishedId;
            setProcessedDuelId(finishedId);
            handleDuelFinished(roomData || snapshotVal);
          }
        }

        // Atualiza os dados da sala sincronizados sem recriar o listener
        if (roomData) {
          setCurrentRoom(roomData);
        }
      },
      (error) => {
        console.warn(`[MultiplayerDuel] Erro no listener RTDB duels/${cleanCode}:`, error);
      }
    );

    // 4. Prevenção de Loops e Purga de Escutadores:
    // Dentro do 'useEffect' que cria o 'onValue', retorne obrigatoriamente a função de limpeza:
    // 'return () => off(roomRef);'
    return () => {
      try {
        unsubscribe();
      } catch (e) {}
      try {
        rtdbOff(roomRef);
      } catch (e) {}
    };
  }, [activeRoomCode]);

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
          player1: updatedRoom.player1,
          player2: updatedRoom.player2,
        };
      });

      if (!isBot) {
        try {
          const roomRef = doc(db, 'duels', updatedRoom.id);
          setDoc(roomRef, sanitizeFirestoreData({
            currentQuestionIndex: nextIdx,
            questionStartTime: nextStartTime,
            player1: sanitizeFirestoreData(updatedRoom.player1),
            player2: updatedRoom.player2 ? sanitizeFirestoreData(updatedRoom.player2) : null,
          }), { merge: true }).catch((e) => console.warn('Erro ao avançar questão no Firestore:', e));
          
          rtdbUpdate(rtdbRef(rtdb, `duels/${updatedRoom.id}`), sanitizeForRTDB({
            currentQuestionIndex: nextIdx,
            questionStartTime: nextStartTime,
            player1: updatedRoom.player1,
            player2: updatedRoom.player2 || null,
          })).catch((e) => console.warn('Erro ao avançar questão no RTDB:', e));
        } catch (e) {
          console.warn('Erro ao salvar avanço no banco de dados:', e);
        }
      }
    } else {
      // Finish Duel
      const p1FinalScore = updatedRoom.player1.score || 0;
      const p2FinalScore = updatedRoom.player2?.score || 0;

      // Calculate total accumulated time spent by each player
      const timeLimit = updatedRoom.timePerQuestion || (updatedRoom.mode === 'relampago' ? 30 : 20);
      const p1TotalTime = Object.values(updatedRoom.player1.answers || {}).reduce(
        (acc, a) => acc + (typeof a?.timeSeconds === 'number' ? a.timeSeconds : timeLimit),
        0
      );
      const p2TotalTime = Object.values(updatedRoom.player2?.answers || {}).reduce(
        (acc, a) => acc + (typeof a?.timeSeconds === 'number' ? a.timeSeconds : timeLimit),
        0
      );

      let winner: string = 'draw';
      if (p1FinalScore > p2FinalScore) {
        winner = updatedRoom.player1.uid;
      } else if (p2FinalScore > p1FinalScore) {
        winner = updatedRoom.player2?.uid || 'draw';
      } else {
        // Tied Score -> Tiebreaker by Lowest Total Accumulated Time
        if (p1TotalTime < p2TotalTime) {
          winner = updatedRoom.player1.uid;
        } else if (p2TotalTime < p1TotalTime) {
          winner = updatedRoom.player2?.uid || 'draw';
        } else {
          // Both score AND total time are strictly identical -> EMPATE formal
          winner = 'draw';
        }
      }

      const finishedRoom: DuelRoom = {
        ...updatedRoom,
        status: 'finished',
        winnerUid: winner,
        rewardClaimed: false,
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
          setDoc(roomRef, sanitizeFirestoreData({
            status: 'finished',
            winnerUid: winner,
            player1: sanitizeFirestoreData(updatedRoom.player1),
            player2: updatedRoom.player2 ? sanitizeFirestoreData(updatedRoom.player2) : null,
          }), { merge: true }).catch((e) => console.warn('Erro ao finalizar duelo no Firestore:', e));

          rtdbUpdate(rtdbRef(rtdb, `duels/${updatedRoom.id}`), sanitizeForRTDB({
            status: 'finished',
            winnerUid: winner,
            player1: updatedRoom.player1,
            player2: updatedRoom.player2 || null,
          })).catch((e) => console.warn('Erro ao finalizar duelo no RTDB:', e));
        } catch (e) {
          console.warn('Erro ao finalizar no banco de dados:', e);
        }
      }
    }
  };

  // Automated Question Timeout Handler (Forces round to advance immediately when time expires)
  const handleForcedQuestionTimeout = (room: DuelRoom, qIndex: number) => {
    const timeoutKey = `${room.id}_q${qIndex}`;
    if (processedTimeoutRef.current === timeoutKey) return;
    processedTimeoutRef.current = timeoutKey;

    const totalTime = room.timePerQuestion || (room.mode === 'relampago' ? 30 : 20);

    // Check existing answers
    const p1Answered = Boolean(room.player1.answers && room.player1.answers[qIndex] !== undefined);
    const p2Answered = Boolean(room.player2?.answers && room.player2.answers[qIndex] !== undefined);

    const isHost = room.player1.uid === profile.uid;
    const opp = isHost ? room.player2 : room.player1;
    const oppAnswered = isHost ? p2Answered : p1Answered;

    // Real-time toast alert if opponent timed out without answering
    if (opp && !opp.isBot && !oppAnswered) {
      showToast('Adversário sem resposta - tempo esgotado', true);
    }

    let newP1Answers = { ...(room.player1.answers || {}) };
    let newP1Score = room.player1.score || 0;
    if (!p1Answered) {
      newP1Answers[qIndex] = {
        chosenIndex: -1,
        isCorrect: false,
        timeSeconds: totalTime,
      };
    }

    let newP2Answers = { ...(room.player2?.answers || {}) };
    let newP2Score = room.player2?.score || 0;
    if (room.player2 && !p2Answered) {
      newP2Answers[qIndex] = {
        chosenIndex: -1,
        isCorrect: false,
        timeSeconds: totalTime,
      };
    }

    const updatedRoom: DuelRoom = {
      ...room,
      player1: {
        ...room.player1,
        answers: newP1Answers,
        score: newP1Score,
      },
      player2: room.player2 ? {
        ...room.player2,
        answers: newP2Answers,
        score: newP2Score,
      } : undefined,
    };

    // Advance immediately to next question or finish - NEVER blocks for opponent response
    advanceOrFinishDuel(updatedRoom, qIndex);
  };

  // Cancel or Leave Room
  const handleCancelRoom = (forceConfirm = false) => {
    const isCurrentActive = currentRoom?.status === 'active' || currentRoom?.status === 'matched' || currentRoom?.status === 'in_progress';
    if (!forceConfirm && isCurrentActive) {
      setIsExitModalOpen(true);
      return;
    }

    if (currentRoom) {
      const roomId = currentRoom.id || currentRoom.roomCode;
      const roomCode = currentRoom.roomCode || currentRoom.code || roomId;
      const cleanCode = cleanRoomCode(roomId || roomCode);
      const isBot = currentRoom.player2?.isBot;

      // Immediately filter out cancelled room from local open rooms array
      setOpenRooms((prev) => (prev || []).filter((r) => r && r.id !== roomId && r.roomCode !== roomCode));

      if (cleanCode && !isBot) {
        if (isCurrentActive && currentRoom.player2) {
          // Forfeit active multiplayer match to opponent
          const isHost = currentRoom.player1.uid === profile.uid;
          const opponentUid = isHost ? currentRoom.player2.uid : currentRoom.player1.uid;
          try {
            const roomRef = doc(db, 'duels', cleanCode);
            setDoc(roomRef, {
              status: 'finished',
              winnerUid: opponentUid,
              forfeitedBy: profile.uid,
              forfeitReason: 'opponent_left',
              isForfeit: true,
            }, { merge: true }).catch(() => {});

            rtdbUpdate(rtdbRef(rtdb, `duels/${cleanCode}`), {
              status: 'finished',
              winnerUid: opponentUid,
              forfeitedBy: profile.uid,
              forfeitReason: 'opponent_left',
              isForfeit: true,
            }).catch(() => {});
          } catch (e) {
            console.warn('Erro ao notificar desistência no banco de dados:', e);
          }
        } else if (currentRoom.status === 'waiting') {
          // Immediately eliminate the room node from Realtime Database and Firestore
          try {
            const roomRef = doc(db, 'duels', cleanCode);
            deleteDoc(roomRef).catch((e) => {
              console.warn('Erro ao deletar documento da sala no Firestore:', e);
            });

            rtdbRemove(rtdbRef(rtdb, `duels/${cleanCode}`)).catch((e) => {
              console.warn('Erro ao deletar nó da sala no RTDB:', e);
            });
          } catch (e) {
            console.warn('Erro ao encerrar sala no banco de dados:', e);
          }
        }
      }
    }
    clearDuelSessionAndReturnToLobby();
  };

  // Synchronized Question Timer with Rigid 0s Timeout Advancement
  useEffect(() => {
    const isRoomPlayable = currentRoom && (currentRoom.status === 'active' || currentRoom.status === 'matched' || currentRoom.status === 'playing' || currentRoom.status === 'in_progress');
    // Não executa o cronómetro de perguntas enquanto estiver na fase de preparação ('preparing') do VS
    if (viewState !== 'room' || !isRoomPlayable || matchPhase === 'preparing') return;

    const timeLimit = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
    const qIdx = currentRoom.currentQuestionIndex;

    const interval = setInterval(() => {
      if (!currentRoom.questionStartTime) return;
      const now = Date.now();
      const elapsed = (now - currentRoom.questionStartTime) / 1000;
      const remaining = Math.max(0, Math.ceil(timeLimit - elapsed));
      setQuestionTimer(remaining);

      // Play progressive sound alert if player has not answered yet
      const isHost = currentRoom.player1.uid === profile.uid;
      const player = isHost ? currentRoom.player1 : currentRoom.player2;
      const hasAnswered = Boolean(player?.answers && player.answers[qIdx] !== undefined);

      if (!hasAnswered && remaining > 0) {
        if (currentRoom.mode === 'relampago') {
          playRelampagoTickSound(remaining, timeLimit);
        } else if (remaining <= 5) {
          playTickSound(remaining);
        }
      }

      // 1. If my personal timer hit 0 and I have not answered yet, auto-submit timeout answer (-1)
      if (remaining <= 0 && player && !hasAnswered) {
        handleAnswerQuestion(-1);
      }

      // 2. Rigid Question Timer Enforcement:
      // When timer reaches 0s (elapsed >= timeLimit), AUTOMATICALLY advance the round for both players.
      // The game NEVER stays blocked waiting for opponent response payload!
      if (remaining <= 0 || elapsed >= timeLimit) {
        handleForcedQuestionTimeout(currentRoom, qIdx);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [
    viewState,
    matchPhase,
    currentRoom?.id, 
    currentRoom?.status, 
    currentRoom?.questionStartTime, 
    currentRoom?.currentQuestionIndex, 
    currentRoom?.timePerQuestion, 
    currentRoom?.mode,
    currentRoom?.player1?.answers,
    currentRoom?.player2?.answers,
    profile?.uid
  ]);

  // Bot Auto Answer Simulation (100% Local - No Firestore)
  useEffect(() => {
    const isRoomPlayable = currentRoom && (currentRoom.status === 'active' || currentRoom.status === 'matched' || currentRoom.status === 'playing' || currentRoom.status === 'in_progress');
    if (viewState !== 'room' || !isRoomPlayable) return;
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
    setIsCreating(false);
    setLoading(false);
    setErrorMessage('');
    try {
      const aiResult = createAIRoom({
        category: selectedCategory,
        mode: selectedMode,
        profile,
      });

      const newRoom = aiResult.room;

      // 100% Local initialization - NO FIRESTORE/RTDB CALLS OR LISTENERS
      setActiveRoomCode('');
      setShowWaitingModal(false);
      setShowVsOverlay(false);
      hasNavigatedRef.current = true;
      setCurrentRoom(newRoom);
      setMatchPhase('preparing');
      setCurrentView('arena');
      setViewState('room');
    } catch (error: any) {
      console.error('[MultiplayerDuel] Erro ao criar duelo com bot:', error);
      setErrorMessage('Não foi possível iniciar o treino com IA. Tente novamente.');
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };
  const handleCreateRoom = async () => {
    setIsCreating(true);
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Geração e Padronização do Código da Sala
      const rawCode = generateRoomCode();
      const roomCode = formatCode(rawCode); // ex: "MNT-3XDV"

      // 2. Verificação e Fallback do Utilizador Atual ('currentUser')
      let currentUser: any = null;
      try {
        currentUser = auth?.currentUser || null;
      } catch (_) {}

      const hostUid = currentUser?.uid || profile?.uid || `guest_${Date.now()}`;
      const hostName = (
        currentUser?.displayName || 
        currentUser?.email?.split('@')[0] || 
        profile?.displayName || 
        profile?.name || 
        'Candidato MININT'
      ).toString().trim();

      // 3. Proteção no Carregamento de Perguntas com Fallback Local (tempo limite de 3s)
      let duelQuestions: Question[] = [];
      try {
        duelQuestions = await getQuestionsWithTimeout(selectedCategory, 3000, 5);
      } catch (qErr) {
        console.warn('[MultiplayerDuel] Erro ao carregar perguntas dinâmicas, usando fallback:', qErr);
        duelQuestions = MININT_CONTINGENCY_QUESTIONS.slice(0, 5);
      }

      if (!duelQuestions || !Array.isArray(duelQuestions) || duelQuestions.length === 0) {
        duelQuestions = MININT_CONTINGENCY_QUESTIONS.slice(0, 5);
      }

      const isRelampago = selectedMode === 'relampago';
      const timePerQuestion = isRelampago ? 30 : 20;

      const player1Data = buildSafePlayer({
        ...(profile || {}),
        uid: hostUid,
        displayName: hostName,
      });

      const newRoom: DuelRoom = {
        id: roomCode,
        code: roomCode,
        roomCode: roomCode,
        hostId: hostUid,
        hostUid: hostUid,
        hostName: hostName,
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

      // 4. Gravação Directa no Firebase RTDB com timeout de segurança de 3.2s
      const createPromise = createRoomService({
        roomCode,
        roomData: newRoom,
        profile: { ...(profile || {}), uid: hostUid, displayName: hostName },
      });

      const timeoutPromise = new Promise<{ success: boolean; room: DuelRoom }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true, room: newRoom });
        }, 3200);
      });

      const createResult = await Promise.race([createPromise, timeoutPromise]);
      const activeRoom = createResult.room || newRoom;

      // 5. Atualização de estado e abertura INSTANTÂNEA da Sala de Espera
      setActiveRoomCode(roomCode);
      setActiveRoom(activeRoom);
      setShowWaitingModal(true);
      setCurrentView('room');
      setMatchPhase('waiting');
      hasNavigatedRef.current = false;
      setOpenRooms((prev) => [
        ...(prev || []).filter((r) => r && r.id !== roomCode && r.roomCode !== roomCode),
        activeRoom
      ]);

      // 6. Notificação e convites em segundo plano
      sendDuelInvitationNotification(profile, roomCode);
    } catch (error: any) {
      console.error('[MultiplayerDuel] Erro ao criar sala:', error);
      const exactMsg = 'Erro ao criar sala. Verifique a conexão.';
      setErrorMessage(exactMsg);
      showToast(exactMsg, true);
    } finally {
      // 7. Garantia rigorosa no finally: redefinir SEMPRE isCreating(false) para restaurar "CRIAR SALA ONLINE"
      setIsCreating(false);
      setLoading(false);
    }
  };

  const createRoom = handleCreateRoom;

  // Join Room by Code with Pre-Join Online Host Validation, 6s timeout, and 'matched' status update
  const handleJoinRoomByCode = async (targetCode?: string) => {
    const rawInput = targetCode || roomCodeInput;
    if (!rawInput || !rawInput.trim()) {
      const msg = 'Introduza o código da sala de duelo (Ex: MNT-8421).';
      setErrorMessage(msg);
      showToast(msg, true);
      return;
    }

    // 1. Padronização Obrigatória do Código da Sala via Helper Universal:
    const cleanCode = formatCode(rawInput);
    if (!cleanCode) {
      const msg = 'Código de sala inválido.';
      setErrorMessage(msg);
      showToast(msg, true);
      return;
    }

    setIsJoining(true);
    setLoading(true);
    setErrorMessage('');

    try {
      // 3. Chamada de joinRoom com timeout razoável (15-20s): atualiza DB com status: "matched" e dados do 2º jogador
      const result = await joinRoom(cleanCode, profile, 18000);

      if (!result.success || !result.room) {
        const unavailableMsg = result.errorMessage || 'Sala não encontrada. Verifique o código inserido.';
        setErrorMessage(unavailableMsg);
        showToast(unavailableMsg, true);
        setOpenRooms((prev) => (prev || []).filter((r) => r && r.id !== cleanCode && r.roomCode !== cleanCode));
        return;
      }

      const updatedRoomData = normalizeRoomData(result.room)!;
      // REGRA DE OURO - Navegação Reativa pelo Banco de Dados:
      // PROÍBA a função 'joinRoom' de mudar diretamente a tela do Convidado ('setCurrentView('arena')').
      // Tanto o Anfitrião quanto o Convidado DEVEM mudar para o ecrã 'arena' APENAS quando o escutador do Firebase detetar 'status === "matched"'.
      // 3. Definir 'activeRoomCode = cleanCode' no estado local do Convidado para que o seu próprio escutador acione a transição para a 'arena':
      setActiveRoomCode(cleanCode);
      setActiveRoom(updatedRoomData);
      setIsJoining(false);
      setLoading(false);
      setOpenRooms((prev) => (prev || []).filter((r) => r && r.id !== updatedRoomData.id && r.roomCode !== updatedRoomData.roomCode));
      showToast('⚡ Conectado ao Duelo! A sincronizar arena...', false);
    } catch (error: any) {
      console.error('Erro ao entrar na sala:', error);
      const unavailableMsg = error?.message || 'Sala não encontrada. Verifique o código inserido.';
      setErrorMessage(unavailableMsg);
      showToast(unavailableMsg, true);
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  };

  // Answer Question
  const handleAnswerQuestion = async (chosenOptionIndex: number) => {
    const isRoomPlayable = currentRoom && (
      currentRoom.status === 'active' || 
      currentRoom.status === 'matched' || 
      currentRoom.status === 'in_progress' || 
      currentRoom.status === 'playing'
    );
    if (!isRoomPlayable) return;

    const isHost = currentRoom.player1.uid === profile.uid;
    const player = isHost ? currentRoom.player1 : currentRoom.player2;
    if (!player) return;

    const qIndex = currentRoom.currentQuestionIndex;
    if (player.answers && player.answers[qIndex] !== undefined) return; // Already answered

    // If time is up, prevent late answer registration: treat as timeout (-1)
    if (chosenOptionIndex >= 0 && questionTimer <= 0) {
      chosenOptionIndex = -1;
    }

    const currentQ = currentRoom.questions[qIndex];
    const isTimeout = chosenOptionIndex === -1;
    const isCorrect = !isTimeout && chosenOptionIndex === currentQ.correctIndex;

    const previousStreak = consecutiveCorrectStreak;
    let newStreak = 0;
    let comboBonus = 0;

    if (isCorrect) {
      newStreak = previousStreak + 1;
      setConsecutiveCorrectStreak(newStreak);

      if (newStreak >= 3) {
        comboBonus = 30; // Bonus score for 3+ consecutive correct answers streak
        setShowComboSparkleAnimation(true);
        fireConfetti();
      }
    } else {
      newStreak = 0;
      setConsecutiveCorrectStreak(0);
      setShowComboSparkleAnimation(false);
    }

    const timeBonus = isTimeout ? 0 : Math.max(10, questionTimer * 5);
    const ptsEarned = isCorrect ? (100 + timeBonus + comboBonus) : 0;

    if (isCorrect) {
      playCorrectSound();
      setAnswerFeedback('correct');
      const particleId = Date.now();
      const particleText = newStreak >= 3
        ? `🔥 COMBO ${newStreak}x! +${ptsEarned} Pts (${comboBonus > 0 ? `+${comboBonus} Bónus` : ''})`
        : `+${ptsEarned} Pts`;
      setFloatingParticles((prev) => [...prev, { id: particleId, text: particleText }]);
      setTimeout(() => {
        setFloatingParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 1600);
    } else {
      playIncorrectSound();
      setAnswerFeedback('incorrect');
    }

    const totalTime = currentRoom.timePerQuestion || (currentRoom.mode === 'relampago' ? 30 : 20);
    const timeSpent = isTimeout ? totalTime : Math.max(0, totalTime - questionTimer);
    trackMissionProgress('questions', 1);
    const newAnswers = {
      ...player.answers,
      [qIndex]: {
        chosenIndex: chosenOptionIndex,
        isCorrect,
        timeSeconds: timeSpent,
      },
    };

    const newScore = player.score + ptsEarned;
    const isBot = currentRoom.player2?.isBot;

    // Build updated room state locally with answers dictionary
    const existingAnswers = currentRoom.answers || {};
    const qAnswers = existingAnswers[qIndex] || {};
    const updatedAnswersMap = {
      ...existingAnswers,
      [qIndex]: {
        ...qAnswers,
        [profile.uid]: {
          chosenIndex: chosenOptionIndex,
          isCorrect,
          timeSeconds: timeSpent,
          score: newScore,
          answeredAt: Date.now(),
        },
      },
    };

    let updatedRoom: DuelRoom = { 
      ...currentRoom,
      answers: updatedAnswersMap,
    };

    if (isHost) {
      updatedRoom = {
        ...updatedRoom,
        player1: {
          ...currentRoom.player1,
          answers: newAnswers,
          score: newScore,
        },
      };
    } else if (currentRoom.player2) {
      updatedRoom = {
        ...updatedRoom,
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
      submitDuelAnswer({
        roomIdOrCode: currentRoom.id,
        questionIndex: qIndex,
        uid: profile.uid,
        chosenIndex: chosenOptionIndex,
        isCorrect,
        timeSeconds: timeSpent,
        newScore,
        isHost,
      }).catch((err) => console.warn('[MultiplayerDuel] Erro ao submeter resposta:', err));
    }

    // Check if both players answered
    const otherPlayer = isHost ? updatedRoom.player2 : updatedRoom.player1;
    const otherUid = otherPlayer?.uid;
    const isOtherAnswered = Boolean(
      (otherPlayer && otherPlayer.answers && otherPlayer.answers[qIndex] !== undefined) ||
      (otherUid && updatedAnswersMap[qIndex] && updatedAnswersMap[qIndex][otherUid] !== undefined)
    );

    if (isOtherAnswered) {
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
    const roomId = roomData.id || roomData.roomCode || `duel_${Date.now()}`;

    // Verify if reward has ALREADY been claimed for this user/duel
    const isRewardClaimedByMeInRoom = Boolean(
      roomData.rewardClaimedBy && roomData.rewardClaimedBy[profile.uid]
    );
    const isRewardClaimedLocally = Boolean(
      claimedRewardsRef.current.has(roomId) ||
      (roomId && localStorage.getItem(`minint_claimed_duel_${roomId}_${profile.uid}`) === 'true')
    );
    const isAlreadyClaimed = isRewardClaimedByMeInRoom || isRewardClaimedLocally;

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

    // Base XP: Vitória (+50 XP), Empate (+25 XP - metade da vitória), Derrota (+5 XP bónus de participação)
    let baseXp = 5;
    let resultType: 'win' | 'draw' | 'loss' = 'loss';
    if (isWin) {
      baseXp = 50;
      resultType = 'win';
    } else if (isDraw) {
      baseXp = 25;
      resultType = 'draw';
    } else {
      resultType = 'loss';
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

    const catLabel = getCategoryDisplayName(roomData.category);

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
      userId: profile.uid,
      myUid: profile.uid,
      player1Id: roomData.player1?.uid,
      player2Id: roomData.player2?.uid,
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
      isForfeit: roomData.isForfeit,
      forfeitReason: roomData.forfeitReason,
    };

    setDuelHistory((prev) => {
      const filtered = (prev || []).filter(e => e.id !== newHistoryEntry.id);
      const updated = [newHistoryEntry, ...filtered].slice(0, 30);
      try {
        const key = `minint_duel_history_${profile.uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
      return updated;
    });

    // CRITICAL: If reward was ALREADY claimed, stop here and NEVER duplicate XP, stats, or modals
    if (isAlreadyClaimed) {
      return;
    }

    // Mark reward as claimed immediately in local reference & localStorage
    claimedRewardsRef.current.add(roomId);
    try {
      localStorage.setItem(`minint_claimed_duel_${roomId}_${profile.uid}`, 'true');
    } catch (e) {}

    // Persist rewardClaimed flag to Firestore and Realtime Database
    if (roomId && !isOpponentBot) {
      try {
        const updatedClaimedBy = {
          ...(roomData.rewardClaimedBy || {}),
          [profile.uid]: true,
        };
        const roomRef = doc(db, 'duels', roomId);
        setDoc(roomRef, sanitizeFirestoreData({
          rewardClaimed: true,
          rewardClaimedBy: updatedClaimedBy,
        }), { merge: true }).catch((e) => console.warn('Erro ao persistir rewardClaimed no Firestore:', e));

        rtdbUpdate(rtdbRef(rtdb, `duels/${roomId}`), {
          rewardClaimed: true,
          [`rewardClaimedBy/${profile.uid}`]: true,
        }).catch((e) => console.warn('Erro ao persistir rewardClaimed no RTDB:', e));
      } catch (e) {
        console.warn('Erro ao sincronizar rewardClaimed:', e);
      }
    }

    // Award XP, ranking stats, and achievements ONLY ONCE
    onUpdateStats(correctCount, roomData.questions.length, totalXp, isWin, categoryBreakdown, isMultiplayerReal);

    // Track answered questions in missions
    const answeredCount = myPlayer?.answers ? Object.keys(myPlayer.answers).length : (roomData.questions?.length || 5);
    if (answeredCount > 0) {
      updateQuestProgress('questions', answeredCount, profile.uid);
    }

    // Audio effects and victory celebration triggers (executed strictly once)
    if (isWin) {
      playVictorySound();
      updateQuestProgress('win_duel', 1, profile.uid);
      trackMissionProgress('duel_win', 1, profile.uid);
      // Trigger full-screen celebratory confetti animation with custom particles
      fireDuelVictoryFullScreenConfetti();
      if (isMultiplayerReal) {
        const pts = 20 + (correctCount * 15) + 50;
        setHonorVictoryPts(pts);
        setHonorVictoryOpponent(opponent);
        setShowHonorVictoryOverlay(true);
      }
    } else if (isDraw) {
      playQuizCompleteSound();
    } else {
      playDefeatSound();
    }
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
      const categoryName = getCategoryDisplayName(cat);
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
        await saveRoomToRTDB(roomCode, newRoom);
        setupRoomOnDisconnect({
          roomId: roomCode,
          userUid: profile?.uid || 'anon',
          isHost: true,
          status: 'waiting',
        });
      } catch (rtdbErr) {
        console.warn('Erro em segundo plano ao salvar sala no RTDB:', rtdbErr);
      }

      setOpenRooms((prev) => [...(prev || []), newRoom]);
      setActiveRoomCode(roomCode);
      setActiveRoom(newRoom);
      setShowWaitingModal(true);
      setCurrentView('room');
      setMatchPhase('waiting');
      hasNavigatedRef.current = false;

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
      lastActive: Date.now(),
    };
    const updated: DuelRoom = {
      ...currentRoom,
      player2: botPlayer,
      status: 'playing',
      questionStartTime: Date.now(),
    };
    setActiveRoomCode('');
    setShowWaitingModal(false);
    setShowVsOverlay(false);
    hasNavigatedRef.current = true;
    setActiveRoom(updated);
    setCurrentRoom(updated);
    setCurrentView('arena');
    setMatchPhase('preparing');
    setViewState('room');
  };

  const isHost = currentRoom?.player1?.uid ? (currentRoom.player1.uid === profile?.uid) : (currentRoom?.hostUid === profile?.uid);
  const myPlayer = isHost ? currentRoom?.player1 : currentRoom?.player2;
  const opponent = isHost ? currentRoom?.player2 : currentRoom?.player1;
  const qIndex = currentRoom?.currentQuestionIndex ?? 0;
  const currentQ = currentRoom?.questions && Array.isArray(currentRoom.questions) ? currentRoom.questions[qIndex] : undefined;
  const myAnswer = myPlayer?.answers ? myPlayer.answers[qIndex] : undefined;
  const opponentAnswer = opponent?.answers ? opponent.answers[qIndex] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-slate-100"
    >
      {/* LOBBY VIEW */}
      {viewState === 'lobby' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Hero Banner */}
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#16181D] dark:to-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-md dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title={isSoundMuted ? "Ativar Áudio dos Duelos" : "Desativar Áudio dos Duelos"}
            >
              {isSoundMuted ? (
                <>
                  <VolumeX size={14} className="text-rose-400" />
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Mudo</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 hidden sm:inline">Som ON</span>
                </>
              )}
            </button>

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
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono mb-1 font-bold flex items-center justify-between">
                <span>MATÉRIA / CATEGORIA DO DUELO</span>
                <span className="text-[9px] text-amber-500 font-normal font-sans">Filtrar questões do desafio</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
              >
                <option value="misto">🎯 Misto (Todas as Matérias MININT)</option>
                <option value="legislacao_minint">📜 Lei Orgânica do MININT & Estatuto Unificado</option>
                <option value="direito_constituicao">🏛️ Constituição da República de Angola (CRA)</option>
                <option value="direito_penal">⚖️ Código Penal & Processo Penal Angolano</option>
                <option value="lingua_portuguesa">✍️ Gramática & Ortografia da Língua Portuguesa</option>
                <option value="historia_cultura_geral">🇦🇴 Cultura Geral, História & Geografia de Angola</option>
                <option value="informatica_basica">💻 Informática Básica & TICs para Exames</option>
                <option value="raciocinio_logico">🧠 Raciocínio Lógico & Mente Policial</option>
                <option value="portugues_raciocinio">📚 Português & Raciocínio Lógico</option>
              </select>

              {/* Quick-select chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'misto', label: '🎯 Misto' },
                  { id: 'legislacao_minint', label: '📜 Lei Orgânica' },
                  { id: 'direito_penal', label: '⚖️ Direito Penal' },
                  { id: 'direito_constituicao', label: '🏛️ CRA' },
                  { id: 'lingua_portuguesa', label: '✍️ Português' },
                  { id: 'historia_cultura_geral', label: '🇦🇴 Cultura Geral' },
                  { id: 'informatica_basica', label: '💻 Informática' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedCategory(chip.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === chip.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating || isJoining || loading}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                ) : (
                  <Swords size={16} />
                )}
                <span>{isCreating ? 'A CRIAR...' : 'CRIAR SALA ONLINE'}</span>
              </button>

              <button
                onClick={handleCreateBotRoom}
                disabled={isCreating || isJoining || loading}
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
                disabled={isJoining || isCreating || loading}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining && <Loader2 size={13} className="animate-spin text-slate-950" />}
                <span>{isJoining ? 'A ENTRAR...' : 'ENTRAR'}</span>
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
          {(() => {
            const visibleOpenRooms = openRooms.filter((room) => {
              if (!room || room.status !== 'waiting') return false;
              if (room.player2) return false;
              if (profile?.uid) {
                if (room.hostUid === profile.uid || room.player1?.uid === profile.uid || room.hostId === profile.uid) {
                  return false;
                }
              }
              return true;
            });

            return (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Users size={16} className="text-amber-500" />
                  <span>Salas Abertas em Tempo Real ({visibleOpenRooms.length})</span>
                </h3>

                {isLoadingOpenRooms ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
                    <Loader2 size={18} className="animate-spin text-amber-500" />
                    <span className="font-medium">A carregar salas em tempo real...</span>
                  </div>
                ) : visibleOpenRooms.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-600 dark:text-slate-400 shadow-xs">
                    Nenhuma sala de outros candidatos aberta no momento. Crie uma sala ou treine contra a IA!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {visibleOpenRooms.map((room) => {
                      return (
                        <div
                          key={room.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 flex items-center justify-center">
                              <UserAvatar user={room.player1} size="sm" showBranchBadge={true} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{room.player1.displayName}</p>
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span>Código: {room.roomCode}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold">
                                  {getCategoryDisplayName(room.category)}
                                </span>
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
            );
          })()}

          {/* HISTÓRICO DE DUELOS & DESAFIAR NOVAMENTE (REVANCHE) */}
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History size={16} className="text-amber-500" />
                <span>Histórico de Duelos</span>
                {userDuelHistory.length > 0 && (
                  <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                    {userDuelHistory.length}
                  </span>
                )}
              </h3>

              {userDuelHistory.length > 0 && (
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
            {userDuelHistory.length > 0 && (
              <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-mono">{userDuelHistory.length} Batalhas</span>
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
                    Vitórias ({userDuelHistory.filter((h) => h.result === 'win').length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter('loss')}
                    className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                      historyFilter === 'loss'
                        ? 'bg-rose-500 text-white font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Derrotas ({userDuelHistory.filter((h) => h.result === 'loss').length})
                  </button>
                </div>
              </div>
            )}

            {/* History List */}
            {userDuelHistory.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-5 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Swords size={28} className="mx-auto text-amber-500/50" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Sem duelos recentes</p>
                <p className="text-[11px]">Participe em duelos online ou contra a IA para registrar seu placar e solicitar revanches!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {userDuelHistory
                  .filter((entry) => {
                    if (historyFilter === 'win') return entry.result === 'win';
                    if (historyFilter === 'loss') return entry.result === 'loss';
                    return true;
                  })
                  .map((item) => {
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
                            <div className="shrink-0 flex items-center justify-center">
                              <UserAvatar
                                user={{
                                  displayName: item.opponentName,
                                  branch: item.opponentBranch,
                                  avatarId: item.opponentAvatarId,
                                  province: item.opponentProvince,
                                }}
                                size="xs"
                                showBranchBadge={true}
                              />
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
          {/* ENHANCED REAL-TIME WAITING ROOM SCREEN - Apenas visível enquanto aguarda pareamento inicial */}
          {matchPhase === 'waiting' && !hasNavigatedRef.current && currentRoom.status === 'waiting' && !currentRoom.player2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-3xl p-5 space-y-5 shadow-xl"
            >
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancelRoom(true)}
                    className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Voltar / Fechar Sala"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Voltar</span>
                  </button>
                  <span className="relative flex h-3 w-3 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    SALA DE ESPERA 1V1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                    RTDB Sincronizado
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancelRoom(true)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Fechar / Cancelar Sala"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Matchup VS Card Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Player 1 (Host Card) */}
                {(() => {
                  const p1 = currentRoom.player1 || buildSafePlayer(profile);
                  const p1Branch = MININT_BRANCHES[p1?.branch || 'PNA'] || MININT_BRANCHES.PNA;
                  return (
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 text-center space-y-2 relative shadow-xs">
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                        Anfitrião
                      </span>

                      <div className="mx-auto flex items-center justify-center">
                        <UserAvatar user={p1} size="lg" showBranchBadge={true} />
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
                              className="relative inline-block mx-auto flex items-center justify-center"
                            >
                              <UserAvatar user={p2} size="lg" showBranchBadge={true} />
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
                  Matéria: <strong className="text-slate-800 dark:text-slate-200 uppercase">{getCategoryDisplayName(currentRoom.category)}</strong>
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
                  <span>Fechar / Cancelar Duelo</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE DUEL ARENA SCREEN */}
          {(matchPhase === 'preparing' || matchPhase === 'playing' || currentRoom.status === 'active' || currentRoom.status === 'matched' || currentRoom.status === 'playing' || currentRoom.status === 'in_progress' || !!currentRoom.player2) && currentRoom.status !== 'finished' && currentRoom.status !== 'cancelled' && currentRoom.status !== 'abandoned' && (
            <DuelArena
              currentRoom={currentRoom}
              profile={profile}
              onAnswerQuestion={handleAnswerQuestion}
              onCancelRoom={handleCancelRoom}
              onExplainWithAI={handleExplainWithAI}
              onToggleSound={handleToggleSound}
              isSoundMuted={isSoundMuted}
              consecutiveCorrectStreak={consecutiveCorrectStreak}
              answerFeedback={answerFeedback}
              floatingParticles={floatingParticles}
              opponentInactivitySeconds={opponentInactivitySeconds}
              onForcedTimeout={handleForcedQuestionTimeout}
              matchPhase={matchPhase}
              onPhaseChange={(phase) => setMatchPhase(phase)}
            />
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

        const myAnswersList = Object.values(myPlayer?.answers || {});
        const oppAnswersList = Object.values(opponent?.answers || {});
        const totalQ = currentRoom.questions?.length || 5;

        const myCorrectAnswers = myAnswersList.filter((a: any) => Boolean(a?.isCorrect)).length;
        const myAccuracyPct = Math.min(100, Math.round((myCorrectAnswers / Math.max(1, totalQ)) * 100));
        const myTotalTime = myAnswersList.reduce<number>((acc, a: any) => acc + (Number(a?.timeSeconds) || 0), 0);
        const myAvgTime = myAnswersList.length > 0 ? (myTotalTime / myAnswersList.length).toFixed(1) : '0.0';
        const myMaxStreak = calculateMaxStreak(myPlayer?.answers);

        const oppCorrectAnswers = oppAnswersList.filter((a: any) => Boolean(a?.isCorrect)).length;
        const oppAccuracyPct = Math.min(100, Math.round((oppCorrectAnswers / Math.max(1, totalQ)) * 100));
        const oppTotalTime = oppAnswersList.reduce<number>((acc, a: any) => acc + (Number(a?.timeSeconds) || 0), 0);
        const oppAvgTime = oppAnswersList.length > 0 ? (oppTotalTime / oppAnswersList.length).toFixed(1) : '0.0';
        const oppMaxStreak = calculateMaxStreak(opponent?.answers);

        return (
          <div className="multiplayer-duel-end-screen space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-6 text-center shadow-xl space-y-4 relative overflow-hidden">
              <button
                type="button"
                onClick={handleToggleSound}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 z-10"
                title={isSoundMuted ? "Ativar Áudio dos Duelos" : "Desativar Áudio dos Duelos"}
              >
                {isSoundMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                <span className="text-[10px] text-slate-300 hidden sm:inline">{isSoundMuted ? "Mudo" : "Som ON"}</span>
              </button>
              
              {/* Icon / Seal Header */}
              {isBotMatch ? (
                <div 
                  onClick={() => {
                    if (currentRoom.winnerUid === profile.uid) {
                      fireDuelVictoryFullScreenConfetti();
                      playVictorySound();
                    }
                  }}
                  className={`w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 mx-auto shadow-lg shadow-cyan-500/20 ${currentRoom.winnerUid === profile.uid ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : 'animate-pulse'}`}
                  title={currentRoom.winnerUid === profile.uid ? "Clique para celebrar a vitória com confetes! 🎉" : undefined}
                >
                  <Bot size={36} />
                </div>
              ) : (
                <div 
                  onClick={() => {
                    if (currentRoom.winnerUid === profile.uid) {
                      fireDuelVictoryFullScreenConfetti();
                      playVictorySound();
                    }
                  }}
                  className={`w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto ${currentRoom.winnerUid === profile.uid ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/20' : ''}`}
                  title={currentRoom.winnerUid === profile.uid ? "Clique para celebrar a vitória com confetes! 🎉" : undefined}
                >
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
                    : currentRoom.isForfeit
                    ? (currentRoom.winnerUid === profile.uid
                        ? '🏆 VITÓRIA POR DESISTÊNCIA!'
                        : '❌ DERROTA POR ABANDONO')
                    : (currentRoom.winnerUid === profile.uid
                        ? '🏆 VITÓRIA NO DUELO!'
                        : currentRoom.winnerUid === 'draw'
                        ? '🤝 EMPATE HONROSO'
                        : 'DERROTA NO DUELO')}
                </h2>
                <p className="text-xs text-slate-300 mt-1">Concurso Público do MININT Angola</p>
              </div>

              {/* Tiebreaker by Time Notice Banner */}
              {!isBotMatch && !currentRoom.isForfeit && (myPlayer?.score || 0) === (opponent?.score || 0) && currentRoom.winnerUid !== 'draw' && (
                <div className={`border rounded-2xl p-3.5 text-left space-y-1.5 shadow-md ${
                  currentRoom.winnerUid === profile.uid
                    ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500/40 text-amber-300'
                    : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-700/60 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Zap size={16} className="text-amber-400 shrink-0" />
                    <span>⚡ Critério de Desempate: Menor Tempo Acumulado</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    Com a pontuação empatada em <strong>{myPlayer?.score || 0} Pts</strong>, a vitória foi atribuída a quem respondeu mais rápido no total ({myTotalTime < oppTotalTime ? (myPlayer?.displayName || 'Você') : (opponent?.displayName || 'Oponente')}: <strong>{Math.min(myTotalTime, oppTotalTime)}s</strong> vs <strong>{Math.max(myTotalTime, oppTotalTime)}s</strong>).
                  </p>
                </div>
              )}

              {/* Exact Draw Notice Banner */}
              {!isBotMatch && !currentRoom.isForfeit && currentRoom.winnerUid === 'draw' && (
                <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/90 border border-blue-500/40 rounded-2xl p-3.5 text-left space-y-1.5 shadow-md">
                  <div className="flex items-center gap-2 text-blue-300 font-black text-xs">
                    <Scale size={16} className="text-blue-400 shrink-0" />
                    <span>🤝 Empate Formal no Duelo</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    Ambos os candidatos terminaram com pontuação e tempo acumulado idênticos (<strong>{myPlayer?.score || 0} Pts</strong> e <strong>{myTotalTime}s</strong>). O resultado foi declarado formalmente como <strong>EMPATE</strong>, distribuindo metade do XP de vitória (<strong>25 XP</strong>) para cada um.
                  </p>
                </div>
              )}

              {/* Forfeit Notice Banner */}
              {!isBotMatch && currentRoom.isForfeit && (
                <div className={`border rounded-2xl p-3.5 text-left space-y-1.5 shadow-md ${
                  currentRoom.winnerUid === profile.uid
                    ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-black text-xs">
                    {currentRoom.winnerUid === profile.uid ? (
                      <>
                        <Trophy size={16} className="text-amber-400 shrink-0" />
                        <span>Vitória Atribuída por Abandono do Oponente</span>
                      </>
                    ) : (
                      <>
                        <UserX size={16} className="text-rose-400 shrink-0" />
                        <span>Partida Encerrada por Inatividade / Abandono</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    {currentRoom.winnerUid === profile.uid
                      ? 'O seu oponente desconectou-se ou ausentou-se durante a partida. A vitória foi atribuída a si com todas as honras e XP!'
                      : 'Você ausentou-se ou saiu da partida em andamento. A vitória foi atribuída ao seu oponente.'}
                  </p>
                </div>
              )}

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

            {/* Scoreboard & Performance Metrics */}
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-amber-400" />
                  Resumo do Duelo & Desempenho
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{totalQ} Questões</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {/* My Scorecard */}
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-extrabold text-amber-300 truncate max-w-[120px]">{myPlayer?.displayName || 'Você'}</span>
                  </div>
                  <p className="text-2xl font-black text-amber-400">{myPlayer?.score || 0} <span className="text-xs font-normal text-slate-400">Pts</span></p>
                  
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Target size={11} /> Precisão:</span>
                      <span className="font-mono font-bold text-emerald-400">{myAccuracyPct}% ({myCorrectAnswers}/{totalQ})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Hourglass size={11} /> Tempo Total:</span>
                      <span className="font-mono font-bold text-amber-400">{myTotalTime}s</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Clock size={11} /> Tempo Médio:</span>
                      <span className="font-mono font-bold text-amber-300">{myAvgTime}s</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Flame size={11} className={myMaxStreak >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} /> Maior Combo:</span>
                      <span className={`font-mono font-bold ${myMaxStreak >= 3 ? 'text-amber-300 font-black' : 'text-slate-300'}`}>
                        {myMaxStreak}x {myMaxStreak >= 3 ? '🔥' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponent Scorecard */}
                <div className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-extrabold text-blue-300 truncate max-w-[120px]">{opponent?.displayName || 'Oponente'}</span>
                  </div>
                  <p className="text-2xl font-black text-blue-400">{opponent?.score || 0} <span className="text-xs font-normal text-slate-400">Pts</span></p>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Target size={11} /> Precisão:</span>
                      <span className="font-mono font-bold text-blue-400">{oppAccuracyPct}% ({oppCorrectAnswers}/{totalQ})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Hourglass size={11} /> Tempo Total:</span>
                      <span className="font-mono font-bold text-blue-300">{oppTotalTime}s</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Clock size={11} /> Tempo Médio:</span>
                      <span className="font-mono font-bold text-blue-300">{oppAvgTime}s</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400"><Flame size={11} className={oppMaxStreak >= 3 ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'} /> Maior Combo:</span>
                      <span className={`font-mono font-bold ${oppMaxStreak >= 3 ? 'text-cyan-300 font-black' : 'text-slate-300'}`}>
                        {oppMaxStreak}x {oppMaxStreak >= 3 ? '⚡' : ''}
                      </span>
                    </div>
                  </div>
                </div>
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
            <div className="text-left pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-amber-400" />
                  Revisão das Questões Pós-Duelo (IA)
                </h4>
                <span className="text-[10px] text-amber-400/80 font-medium">Clique em qualquer questão para fundamentação</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentRoom.questions.map((q, idx) => {
                  const myAns = myPlayer?.answers[idx];
                  const isCorrect = myAns?.isCorrect;
                  const chosenIdx = myAns?.chosenIndex;
                  const chosenText = chosenIdx !== undefined ? q.options[chosenIdx] : null;
                  const correctText = q.options[q.correctIndex];

                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => handleExplainWithAI(q, chosenIdx ?? 0)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group space-y-2 ${
                        isCorrect
                          ? 'bg-slate-950/80 border-emerald-500/30 hover:border-emerald-500/60'
                          : 'bg-slate-950/80 border-rose-500/30 hover:border-rose-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-amber-400">
                            #{idx + 1}
                          </span>
                          {isCorrect ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 size={11} /> Acertou
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center gap-1">
                              <XCircle size={11} /> Errou
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplainWithAI(q, chosenIdx ?? 0);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all"
                        >
                          <Sparkles size={12} />
                          <span>Ver Explicação IA</span>
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">{q.question}</p>

                      <div className="pt-1.5 border-t border-slate-800/80 text-[11px] space-y-0.5 font-medium">
                        {!isCorrect && chosenText && (
                          <p className="text-rose-400/90 truncate">
                            ❌ Sua escolha: <span className="font-semibold">{chosenText}</span>
                          </p>
                        )}
                        <p className="text-emerald-400/90 truncate">
                          🎯 Gabarito oficial: <span className="font-semibold">{correctText}</span>
                        </p>
                      </div>
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
                  setShowHonorVictoryOverlay(false);
                  if (opponent) {
                    handleRechallenge(
                      opponent.displayName,
                      opponent.branch,
                      opponent.avatarId,
                      opponent.province,
                      opponent.isBot,
                      currentRoom.category
                    );
                    showToast(`Nova sala criada! Desafio enviado para ${opponent.displayName}.`);
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
                  clearDuelSessionAndReturnToLobby();
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <LogOut size={16} className="text-amber-400" />
                <span>SAIR DO DUELO / VOLTAR AO MENU</span>
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
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
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

              {/* Winner's Reactive Avatar */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
                className="mx-auto flex items-center justify-center mb-4"
              >
                <UserAvatar
                  user={profile}
                  size="3xl"
                  reaction="victory"
                  showBranchBadge={true}
                  showLevelBadge={true}
                  interactive={true}
                />
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
                    <UserAvatar
                      user={honorVictoryOpponent}
                      size="sm"
                      showBranchBadge={true}
                    />
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
                onClick={() => {
                  clearConfetti();
                  setShowHonorVictoryOverlay(false);
                }}
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

      {/* Modal Informativo: Sala Encerrada */}
      <AnimatePresence>
        {isRoomClosedModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={28} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Sala Encerrada
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  O anfitrião encerrou ou abandonou a sala de espera do duelo. A partida foi cancelada.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearDuelSessionAndReturnToLobby();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <LogOut size={16} />
                <span>Retornar ao Menu Principal</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal / Pop-up de Alerta: Vitória por Desistência */}
      <AnimatePresence>
        {isForfeitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative overflow-hidden my-auto"
            >
              {/* Top Golden Ambient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-amber-500/25 to-transparent blur-xl pointer-events-none" />

              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20"
              >
                <Trophy size={34} />
              </motion.div>

              {/* Header & Exact Text */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-400 fill-amber-400" />
                  <span>Duelo 1v1 • MININT Angola</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
                  Vitória por Desistência
                </h3>

                <p className="text-sm font-bold text-amber-300/95 leading-relaxed bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 shadow-xs">
                  O seu adversário abandonou a partida! Vitória por desistência.
                </p>
              </div>

              {/* Reward Highlights */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Experiência (XP):
                  </span>
                  <span className="font-mono font-black text-emerald-400">+{xpBreakdown?.totalXp || 50} XP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Swords size={14} className="text-amber-400" /> Ranking de Duelos:
                  </span>
                  <span className="font-mono font-black text-amber-400">+1 Vitória PvP</span>
                </div>
                {opponent && (
                  <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400 font-medium">Adversário:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {opponent.displayName} ({opponent.branch || 'PNA'})
                    </span>
                  </div>
                )}
              </div>

              {/* Continuar Action Button */}
              <button
                type="button"
                onClick={() => {
                  clearDuelSessionAndReturnToLobby();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>Continuar</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-Game Cinematic 'VS' Battle Overlay */}
      <VsBattleOverlay
        isOpen={showVsOverlay && !!currentRoom?.player1 && (!!currentRoom?.player2 || !!currentRoom?.guest)}
        isBothPlayersConfirmed={Boolean(
          currentRoom?.player1?.uid &&
          ((currentRoom?.player2?.uid || currentRoom?.player2?.isBot) || (currentRoom?.guest && currentRoom?.guest?.uid) || currentRoom?.guestUid)
        )}
        hostPlayer={currentRoom?.player1}
        guestPlayer={currentRoom?.player2 || currentRoom?.guest}
        category={currentRoom?.category || selectedCategory}
        mode={currentRoom?.mode || selectedMode}
        roomCode={currentRoom?.roomCode || currentRoom?.id}
        totalQuestions={currentRoom?.questions?.length || 5}
        timePerQuestion={currentRoom?.timePerQuestion || (currentRoom?.mode === 'relampago' ? 30 : 20)}
        durationSeconds={3}
        onComplete={() => {
          stopAllCombatSounds();
          setShowVsOverlay(false);
          setMatchPhase('playing');
          // Garantir que a sala se mantenha ativa no Firebase com status: 'playing'
          if (activeRoomCode) {
            const activeRoom = currentRoomRef.current;
            const isHost = activeRoom?.player1?.uid === profileRef.current?.uid || activeRoom?.hostUid === profileRef.current?.uid;
            if (isHost) {
              rtdbUpdate(rtdbRef(rtdb, `duels/${activeRoomCode}`), {
                status: 'playing',
                questionStartTime: Date.now(),
              }).catch(() => {});
            }
          }
        }}
      />

    </motion.div>
  );
};
