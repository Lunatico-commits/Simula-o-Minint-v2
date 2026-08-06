import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Question, DailyChallengeEntry, QuestionCategory, normalizeCategory } from '../types';
import { 
  getTodayDateString, 
  getDailyChallengeQuestions, 
  calculateDailyChallengeXP, 
  saveDailyChallengeResult, 
  fetchDailyLeaderboard 
} from '../utils/dailyChallenge';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { explainQuestionWithAI } from '../services/apiService';
import { AIExplanationModal } from './AIExplanationModal';
import { MemeGeneratorModal } from './MemeGeneratorModal';
import { fireConfetti } from '../utils/confetti';
import { playCorrectSound, playIncorrectSound, playClickSound, playQuizCompleteSound } from '../utils/audio';
import { 
  Trophy, Flame, Clock, Sparkles, CheckCircle2, XCircle, Award, 
  ArrowRight, RotateCcw, Shield, Zap, Target, Users, Share2, 
  ChevronRight, AlertCircle, HelpCircle, Check, Star, LogOut
} from 'lucide-react';
import { ConfirmExitModal } from './ConfirmExitModal';

interface DailyChallengeProps {
  profile: UserProfile;
  onUpdateStats: (
    score: number, 
    totalQuestions: number, 
    xpGained: number, 
    isWin?: boolean, 
    categoryBreakdown?: Partial<Record<QuestionCategory, { correct: number; total: number }>>
  ) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSupportModal?: () => void;
  onSessionActiveChange?: (active: boolean) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  profile,
  onUpdateStats,
  onNavigateTab,
  onOpenSupportModal,
  onSessionActiveChange,
}) => {
  const todayDateStr = getTodayDateString();
  const formattedToday = new Date().toLocaleDateString('pt-AO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenAnswerIndex, setChosenAnswerIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'completed'>('lobby');

  // Timers
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15); // 15s per question
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Leaderboard & Completion Status
  const [leaderboard, setLeaderboard] = useState<DailyChallengeEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [userTodayEntry, setUserTodayEntry] = useState<DailyChallengeEntry | null>(null);
  const [xpBreakdown, setXpBreakdown] = useState<ReturnType<typeof calculateDailyChallengeXP> | null>(null);

  // AI Explanation Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // Meme Generator Modal
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);

  // Exit Confirmation Modal State
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Notify parent of active challenge session
  useEffect(() => {
    if (onSessionActiveChange) {
      onSessionActiveChange(gameState === 'playing');
    }
  }, [gameState, onSessionActiveChange]);

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    setTimerActive(false);
    setGameState('lobby');
  };

  // Load Today's Challenge Questions and Leaderboard on Mount
  useEffect(() => {
    const dailyQs = getDailyChallengeQuestions(todayDateStr);
    setQuestions(dailyQs);

    loadLeaderboardData();
  }, [todayDateStr, profile.uid]);

  const loadLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const entries = await fetchDailyLeaderboard(todayDateStr);
      setLeaderboard(entries);

      // Check if current user already completed today
      const found = entries.find((e) => e.uid === profile.uid || e.id === `${todayDateStr}_${profile.uid}`);
      if (found) {
        setUserTodayEntry(found);
      }
    } catch (e) {
      console.error('Erro ao carregar classificação do Desafio Diário:', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && timerActive) {
      timer = setInterval(() => {
        setTotalTimeSpent((prev) => prev + 1);
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeoutQuestion();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timerActive, currentIndex]);

  const handleTimeoutQuestion = () => {
    if (chosenAnswerIndex !== null) return;
    // Unanswered = incorrect (-1)
    handleSelectAnswer(-1);
  };

  const handleStartChallenge = () => {
    playClickSound();
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers({});
    setChosenAnswerIndex(null);
    setQuestionTimeLeft(15);
    setTotalTimeSpent(0);
    setTimerActive(true);
    setGameState('playing');
  };

  const handleSelectAnswer = (index: number) => {
    if (chosenAnswerIndex !== null) return;

    setChosenAnswerIndex(index);
    setTimerActive(false);

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      playCorrectSound();
      setScore((prev) => prev + 1);
    } else {
      playIncorrectSound();
    }

    const updatedAnswers = { ...userAnswers, [currentIndex]: index };
    setUserAnswers(updatedAnswers);

    // Auto advance after 1.2s delay
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setChosenAnswerIndex(null);
        setQuestionTimeLeft(15);
        setTimerActive(true);
      } else {
        finishChallenge(score + (isCorrect ? 1 : 0), updatedAnswers);
      }
    }, 1200);
  };

  const finishChallenge = async (finalScore: number, finalAnswers: Record<number, number>) => {
    setGameState('completed');
    fireConfetti();
    playQuizCompleteSound();

    const streak = profile.dailyStreak || 1;
    const calcXP = calculateDailyChallengeXP(finalScore, questions.length, totalTimeSpent, streak);
    setXpBreakdown(calcXP);

    // Compute breakdown per category for dashboard
    const categoryBreakdown: Partial<Record<QuestionCategory, { correct: number; total: number }>> = {};
    questions.forEach((q, idx) => {
      const normCat = normalizeCategory(q.category);
      if (!categoryBreakdown[normCat]) {
        categoryBreakdown[normCat] = { correct: 0, total: 0 };
      }
      categoryBreakdown[normCat]!.total += 1;
      if (finalAnswers[idx] === q.correctIndex) {
        categoryBreakdown[normCat]!.correct += 1;
      }
    });

    // Update parent user profile stats
    onUpdateStats(finalScore, questions.length, calcXP.totalXP, false, categoryBreakdown);

    // Save to Firestore & local storage
    const { newStreak, entry } = await saveDailyChallengeResult(
      profile,
      finalScore,
      questions.length,
      totalTimeSpent,
      calcXP.totalXP,
      todayDateStr
    );

    setUserTodayEntry(entry);
    loadLeaderboardData();
  };

  // AI Explanation Handler
  const handleAskAI = async (question: Question) => {
    setModalQuestion(question);
    setIsAIModalOpen(true);
    setIsAILoading(true);
    setAiExplanation(null);

    const chosenIdx = userAnswers[currentIndex] !== undefined ? userAnswers[currentIndex] : question.correctIndex;
    const result = await explainQuestionWithAI(question, chosenIdx);

    setAiExplanation(result);
    setIsAILoading(false);
  };

  // User position in today's leaderboard
  const userRankIndex = leaderboard.findIndex(
    (e) => e.uid === profile.uid || e.id === `${todayDateStr}_${profile.uid}`
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 animate-fadeIn">
      {/* 1. LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div className="space-y-4">
          {/* Main Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-5 border border-amber-500/40 shadow-xl">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                  <Flame size={12} className="text-amber-400 animate-bounce" />
                  <span>Edição de Hoje • {formattedToday}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-2 flex items-center gap-2">
                  <span>Desafio Diário MININT</span>
                  <Trophy size={22} className="text-amber-400" />
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  Compita com todos os candidatos de Angola na mesma lista de <strong>10 questões cronometradas</strong>. Ganhe bónus de XP exclusivo!
                </p>
              </div>
            </div>

            {/* Streak & XP Badges */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shrink-0">
                  <Flame size={20} className="fill-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sua Sequência</span>
                  <span className="text-sm font-black text-amber-300">
                    {profile.dailyStreak || 0} {profile.dailyStreak === 1 ? 'Dia' : 'Dias Seguidos'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shrink-0">
                  <Zap size={20} className="fill-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Recompensa Máx.</span>
                  <span className="text-sm font-black text-emerald-300">+250 XP Bónus</span>
                </div>
              </div>
            </div>

            {/* Status Button or Completion Banner */}
            {userTodayEntry ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Desafio de Hoje Já Concluído!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Pontuação: <strong className="text-amber-400 font-bold">{userTodayEntry.score}/10</strong> • Tempo: <strong className="text-amber-400 font-bold">{userTodayEntry.totalTimeSeconds}s</strong> • Ganhou <strong className="text-emerald-400 font-bold">+{userTodayEntry.xpEarned} XP</strong>
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartChallenge}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Repetir para Praticar</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartChallenge}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy size={18} />
                <span>Começar Desafio Diário Agora</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          {/* Rules & Information Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
              <Shield size={14} />
              <span>Regras do Desafio Diário</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li><strong>Mapeamento Único:</strong> Todos os candidatos respondem às mesmas 10 questões do dia.</li>
              <li><strong>Tempo Cronometrado:</strong> 15 segundos por questão. Respostas mais rápidas rendem bónus de velocidade!</li>
              <li><strong>Ranking Ao Vivo:</strong> O seu tempo e pontuação determinam a sua posição na Tabela Nacional de Hoje.</li>
            </ul>
          </div>

          {/* TODAY'S LEADERBOARD TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <h3 className="font-extrabold text-xs uppercase text-slate-100 tracking-wider">
                  Classificação de Hoje ({formattedToday})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Top Candidatos</span>
            </div>

            {loadingLeaderboard ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                A carregar classificação ao vivo...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <p>Ainda ninguém completou o Desafio Diário hoje!</p>
                <p className="text-amber-400 font-bold">Seja o primeiro a liderar a tabela!</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {leaderboard.map((entry, idx) => {
                  const isCurrent = entry.uid === profile.uid || entry.id === `${todayDateStr}_${profile.uid}`;
                  const branchInfo = MININT_BRANCHES[entry.branch] || MININT_BRANCHES.PNA;

                  return (
                    <div
                      key={entry.id || idx}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 text-center font-black text-xs shrink-0 ${
                          idx === 0 ? 'text-amber-400 text-sm' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold truncate text-slate-100">{entry.displayName}</span>
                            {entry.isVipSupporter && (
                              <span className="text-[8px] px-1 rounded-full bg-amber-500/20 text-amber-300 font-bold">VIP</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {entry.province} • <strong className="text-amber-400">{entry.branch}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-amber-400 block text-xs">
                          {entry.score}/10 pts
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          ⏱️ {entry.totalTimeSeconds}s • +{entry.xpEarned} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GAMEPLAY SCREEN */}
      {gameState === 'playing' && questions.length > 0 && (
        <div className="space-y-3">
          {/* Top Progress & Fast Timer Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400 flex items-center gap-1 uppercase tracking-wider font-mono text-[10px]">
                <Target size={12} />
                <span>Questão {currentIndex + 1} de {questions.length}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 font-mono font-black px-2 py-0.5 rounded-lg border text-xs ${
                  questionTimeLeft <= 5 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  <Clock size={12} />
                  <span>00:{String(questionTimeLeft).padStart(2, '0')}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                  title="Abandonar Desafio Diário"
                >
                  <LogOut size={12} />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  questionTimeLeft <= 4 ? 'bg-rose-500' : questionTimeLeft <= 8 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(questionTimeLeft / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {(() => {
            const currentQ = questions[currentIndex];
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
                {/* Category & Law Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold uppercase">
                    {currentQ.categoryName}
                  </span>
                  <span className="text-slate-400 font-mono truncate max-w-[200px]">
                    📜 {currentQ.lawReference}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-100 leading-snug">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = chosenAnswerIndex === optIdx;
                    const isCorrectOpt = optIdx === currentQ.correctIndex;
                    const showFeedback = chosenAnswerIndex !== null;

                    let btnClasses = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900';
                    if (showFeedback) {
                      if (isCorrectOpt) {
                        btnClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]';
                      } else if (isSelected && !isCorrectOpt) {
                        btnClasses = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                      } else {
                        btnClasses = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={chosenAnswerIndex !== null}
                        onClick={() => handleSelectAnswer(optIdx)}
                        className={`w-full p-3 rounded-2xl border text-xs text-left transition-all flex items-start gap-3 cursor-pointer ${btnClasses}`}
                      >
                        <span className={`w-5 h-5 rounded-lg border font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                          showFeedback && isCorrectOpt ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {showFeedback && isCorrectOpt && (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {showFeedback && isSelected && !isCorrectOpt && (
                          <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Explanation Footer */}
                {chosenAnswerIndex !== null && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-400">Explicação Rápida:</span>
                      <button
                        type="button"
                        onClick={() => handleAskAI(currentQ)}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/30"
                      >
                        <Sparkles size={11} />
                        <span>Explicar com Tutor IA</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. COMPLETION / SUMMARY SCREEN */}
      {gameState === 'completed' && xpBreakdown && (
        <div className="space-y-4 animate-fadeIn">
          {/* Victory Card */}
          <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-5 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Trophy size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Desafio Concluído!</h3>
              <p className="text-xs text-slate-300 mt-0.5">Excelente desempenho no concurso MININT Angola!</p>
            </div>

            {/* Score Summary */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontuação</span>
                <span className="text-lg font-black text-amber-400 font-mono">{score} / {questions.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tempo Total</span>
                <span className="text-lg font-black text-amber-400 font-mono">{totalTimeSpent}s</span>
              </div>
            </div>

            {/* XP Breakdown Box */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-2 text-left">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>Detalhamento dos Bónus de XP</span>
                <Zap size={14} className="text-amber-400" />
              </h4>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Respostas Certas ({score}x):</span>
                  <span className="font-mono font-bold text-amber-300">+{xpBreakdown.baseXP} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>Bónus Conclusão Diária:</span>
                  <span className="font-mono font-bold text-emerald-400">+{xpBreakdown.completionBonus} XP</span>
                </div>
                {xpBreakdown.perfectBonus > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>🌟 Bónus Pontuação Perfeita (10/10):</span>
                    <span className="font-mono">+{xpBreakdown.perfectBonus} XP</span>
                  </div>
                )}
                {xpBreakdown.timeBonus > 0 && (
                  <div className="flex justify-between">
                    <span>⚡ Bónus de Velocidade:</span>
                    <span className="font-mono font-bold text-amber-300">+{xpBreakdown.timeBonus} XP</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>🔥 Bónus de Sequência ({profile.dailyStreak || 1}d):</span>
                  <span className="font-mono font-bold text-amber-300">+{xpBreakdown.streakBonus} XP</span>
                </div>

                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-black text-sm text-emerald-400">
                  <span>TOTAL DE XP GANHO:</span>
                  <span className="font-mono text-base">+{xpBreakdown.totalXP} XP</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsMemeModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition-all active:scale-98 border border-rose-400/40"
              >
                <Sparkles size={18} className="animate-spin text-amber-200" />
                <span>Criar Meme do Concurso ✨</span>
              </button>

              <button
                type="button"
                onClick={() => setGameState('lobby')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trophy size={16} />
                <span>Ver Tabela de Hoje</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {modalQuestion && (
        <AIExplanationModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          questionText={modalQuestion.question}
          options={modalQuestion.options}
          correctIndex={modalQuestion.correctIndex}
          lawReference={modalQuestion.lawReference}
          explanationData={aiExplanation}
          isLoading={isAILoading}
        />
      )}

      {/* Meme Generator Modal */}
      {gameState === 'completed' && (
        <MemeGeneratorModal
          isOpen={isMemeModalOpen}
          onClose={() => setIsMemeModalOpen(false)}
          profile={profile}
          score={score}
          totalQuestions={questions.length || 10}
          pct={Math.round((score / (questions.length || 1)) * 100)}
          categoryName="Desafio Diário MININT"
        />
      )}

      {/* Confirm Exit Modal */}
      <ConfirmExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleConfirmExit}
        sessionType="desafio"
      />
    </div>
  );
};
