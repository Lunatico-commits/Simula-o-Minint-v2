import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, QuestionCategory, UserProfile, AIExplanationResponse, normalizeCategory } from '../types';
import { QUESTION_BANK } from '../data/questions';
import { getRandomQuestions } from '../utils/questionSelector';
import { explainQuestionWithAI } from '../services/apiService';
import { AIExplanationModal } from './AIExplanationModal';
import { MemeGeneratorModal } from './MemeGeneratorModal';
import { AdBanner } from './AdBanner';
import { fireConfetti } from '../utils/confetti';
import { playCorrectSound, playIncorrectSound, playQuizCompleteSound } from '../utils/audio';
import { BookOpen, Sparkles, CheckCircle2, XCircle, Clock, Award, ArrowRight, RotateCcw, ShieldAlert, Zap, Layers, Shield, FileText, Globe, Scale, Check, BarChart3, Target, AlertTriangle, Swords, ChevronDown, ChevronUp, Coffee, Star, Volume2, VolumeX, Flame, Trophy, LogOut, Flag, Laptop } from 'lucide-react';
import { ConfirmExitModal } from './ConfirmExitModal';
import { DailyMissions } from './DailyMissions';
import { ReactiveAvatar } from './ReactiveAvatar';
import { trackMissionProgress } from '../utils/dailyMissions';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

interface PracticeQuizProps {
  profile: UserProfile;
  onUpdateStats: (
    score: number, 
    totalQuestions: number, 
    xpGained: number, 
    isWin?: boolean, 
    categoryBreakdown?: Partial<Record<QuestionCategory, { correct: number; total: number }>>,
    isMultiplayerReal?: boolean,
    coinsGained?: number
  ) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSupportModal?: () => void;
  onSessionActiveChange?: (active: boolean) => void;
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({ profile, onUpdateStats, onNavigateTab, onOpenSupportModal, onSessionActiveChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'todas'>('todas');
  const [quizMode, setQuizMode] = useState<'rapido' | 'exame'>('rapido');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenAnswerIndex, setChosenAnswerIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'completed'>('setup');

  // Stats & Timing Tracking
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  // Timer for Exame & Rapido modes
  const [timeLeft, setTimeLeft] = useState(0);

  // AI Explanation Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // Meme Generator Modal State
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);

  // Header Insignia Image Loading State
  const [isHeaderImageLoaded, setIsHeaderImageLoaded] = useState(false);

  // Exit Confirmation Modal State
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Report Question Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState<Question | null>(null);
  const [reportReason, setReportReason] = useState<string>('Gabarito incorreto');
  const [reportComment, setReportComment] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  // Power-up 50:50 Extra Hints State
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [availableHints, setAvailableHints] = useState<number>(profile.extraHintsCount || 0);

  useEffect(() => {
    setAvailableHints(profile.extraHintsCount || 0);
  }, [profile.extraHintsCount]);

  useEffect(() => {
    setEliminatedOptions([]);
  }, [currentIndex]);

  const handleUse5050Hint = () => {
    if (chosenAnswerIndex !== null) return;
    if (availableHints <= 0) {
      if (onNavigateTab) onNavigateTab('shop');
      return;
    }
    if (eliminatedOptions.length > 0) return;

    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter(idx => idx !== currentQ.correctIndex);

    // Pick up to 2 wrong options randomly
    const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    setEliminatedOptions(toEliminate);
    setAvailableHints(prev => Math.max(0, prev - 1));

    if (profile.uid && profile.uid !== 'guest_user') {
      try {
        const userRef = doc(db, 'users', profile.uid);
        setDoc(userRef, { extraHintsCount: Math.max(0, (profile.extraHintsCount || 1) - 1) }, { merge: true });
      } catch (e) {
        console.warn('Erro ao atualizar dicas no Firestore:', e);
      }
    }
  };

  const handleOpenReportModal = (question: Question) => {
    setReportingQuestion(question);
    setReportReason('Gabarito incorreto');
    setReportComment('');
    setReportSuccessMessage(null);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingQuestion) return;

    setIsSubmittingReport(true);
    try {
      const reportData = {
        questionId: reportingQuestion.id,
        questionText: reportingQuestion.question,
        category: reportingQuestion.category,
        categoryName: reportingQuestion.categoryName,
        correctIndex: reportingQuestion.correctIndex,
        reason: reportReason,
        comment: reportComment.trim(),
        userUid: profile.uid || 'anonymous',
        userName: profile.displayName || 'Candidato',
        userBranch: profile.branch || 'PNA',
        createdAt: Date.now(),
        status: 'pending'
      };

      try {
        await addDoc(collection(db, 'question_reports'), reportData);
      } catch (fsErr) {
        console.warn('Salvando relatório localmente devido a erro no Firestore:', fsErr);
        const existing = JSON.parse(localStorage.getItem('local_question_reports') || '[]');
        existing.push(reportData);
        localStorage.setItem('local_question_reports', JSON.stringify(existing));
      }

      setReportSuccessMessage('Relatório enviado com sucesso! Obrigado pela colaboração.');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportingQuestion(null);
        setReportSuccessMessage(null);
      }, 1800);
    } catch (err) {
      console.error('Erro ao enviar relatório:', err);
      setReportSuccessMessage('Ocorreu um erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Notify parent of active quiz session
  useEffect(() => {
    if (onSessionActiveChange) {
      onSessionActiveChange(quizState === 'playing');
    }
  }, [quizState, onSessionActiveChange]);

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    setQuizState('setup');
  };

  // Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (quizState === 'playing') {
      if (quizMode === 'exame' && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleFinishQuiz();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (quizMode === 'rapido' && chosenAnswerIndex === null && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleSelectOption(-1);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [quizState, quizMode, timeLeft, chosenAnswerIndex]);

  // Start Quiz Handler
  const handleStartQuiz = () => {
    const limit = quizMode === 'rapido' ? 5 : 10;
    const modeKey = selectedCategory !== 'todas' ? 'materia' : (quizMode === 'rapido' ? 'rapido' : 'exame');
    
    const finalQuestions = getRandomQuestions({
      category: selectedCategory,
      academicLevel: profile.academicLevel,
      count: limit,
      modeKey,
    });

    setActiveQuestions(finalQuestions);
    setCurrentIndex(0);
    setChosenAnswerIndex(null);
    setUserAnswers({});
    setScore(0);
    setQuizStartTime(Date.now());
    setShowReview(false);
    setReviewFilter('all');
    setQuizState('playing');

    if (quizMode === 'exame') {
      setTimeLeft(finalQuestions.length * 45); // 45 sec per question (e.g. 10 q = 450s = 7m30s)
    } else {
      setTimeLeft(30); // 30 sec per question for Simulado Rápido
    }
  };

  // Answer Select Handler
  const handleSelectOption = (index: number) => {
    if (chosenAnswerIndex !== null) return; // Prevent re-select

    setChosenAnswerIndex(index);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: index }));
    trackMissionProgress('questions', 1);

    const currentQ = activeQuestions[currentIndex];
    if (index === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      playCorrectSound();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(50); } catch (_) {}
      }
    } else {
      playIncorrectSound();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([60, 40, 60]); } catch (_) {}
      }
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      const nextAnswer = userAnswers[currentIndex + 1] ?? null;
      setChosenAnswerIndex(nextAnswer);
      if (quizMode === 'rapido' && nextAnswer === null) {
        setTimeLeft(30);
      }
    } else {
      handleFinishQuiz();
    }
  };

  // Finish Quiz
  const handleFinishQuiz = () => {
    setQuizState('completed');
    trackMissionProgress('simulado', 1);

    const duration = quizStartTime ? Math.max(1, Math.floor((Date.now() - quizStartTime) / 1000)) : 0;
    setTimeSpentSeconds(duration);

    // Calculate exact final score from userAnswers and per-category breakdown
    let finalScore = 0;
    const categoryBreakdown: Partial<Record<QuestionCategory, { correct: number; total: number }>> = {};

    activeQuestions.forEach((q, idx) => {
      const normCat = normalizeCategory(q.category);
      if (!categoryBreakdown[normCat]) {
        categoryBreakdown[normCat] = { correct: 0, total: 0 };
      }
      categoryBreakdown[normCat]!.total += 1;

      const userChoice = userAnswers[idx];
      if (userChoice === q.correctIndex) {
        finalScore++;
        categoryBreakdown[normCat]!.correct += 1;
      }
    });
    setScore(finalScore);

    // Calculate XP: 20 XP per correct answer + 50 bonus for completion
    const xpGained = (finalScore * 20) + 50;
    onUpdateStats(finalScore, activeQuestions.length, xpGained, false, categoryBreakdown);

    // Play Completion sound & trigger Confetti if score >= 50%
    playQuizCompleteSound();
    if (finalScore / (activeQuestions.length || 1) >= 0.5) {
      fireConfetti();
    }
  };

  // Helper for Subject Diagnostic
  const getSubjectDiagnostics = () => {
    const catMap: Record<string, { total: number; correct: number; name: string }> = {};

    activeQuestions.forEach((q, idx) => {
      const key = q.category;
      if (!catMap[key]) {
        catMap[key] = { total: 0, correct: 0, name: q.categoryName };
      }
      catMap[key].total += 1;
      if (userAnswers[idx] === q.correctIndex) {
        catMap[key].correct += 1;
      }
    });

    const categories = Object.entries(catMap).map(([catKey, data]) => {
      const pct = Math.round((data.correct / data.total) * 100);
      return {
        catKey,
        name: data.name,
        total: data.total,
        correct: data.correct,
        pct,
      };
    });

    const sorted = [...categories].sort((a, b) => a.pct - b.pct);
    const worstCategory = sorted.length > 0 ? sorted[0] : null;

    return { categories, worstCategory };
  };

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs} min`;
  };

  // Trigger AI Explanation
  const handleExplainWithAI = async (q: Question, chosenIdx: number) => {
    setModalQuestion(q);
    setIsAIModalOpen(true);
    setIsAILoading(true);
    setAiExplanation(null);

    const data = await explainQuestionWithAI(q, chosenIdx);
    setAiExplanation(data);
    setIsAILoading(false);
  };

  const currentQ = activeQuestions[currentIndex];

  return (
    <div className="max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-slate-100">
      {/* SETUP VIEW */}
      {quizState === 'setup' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Banner */}
          <div className="border border-amber-500/40 dark:border-amber-500/40 rounded-2xl p-5 text-center shadow-lg dark:shadow-2xl relative overflow-hidden group bg-slate-900/40 dark:bg-slate-950/60">
            {/* Subtle Skeleton Loader while image downloads */}
            {!isHeaderImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 animate-pulse pointer-events-none z-0 rounded-2xl" />
            )}

            {/* Background Image Tag with fade-in */}
            <img
              src="https://raw.githubusercontent.com/Lunatico-commits/Simula-o-Minint-v2/refs/heads/main/src/assets/images/insignias_minint.webp"
              alt="Insígnias MININT"
              loading="eager"
              referrerPolicy="no-referrer"
              onLoad={() => setIsHeaderImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-0 transition-all duration-700 ease-out group-hover:scale-105 ${
                isHeaderImageLoaded ? 'opacity-30 scale-100 animate-fadeIn' : 'opacity-0 scale-95'
              }`}
            />

            {/* Clear Overlay Layer */}
            <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none z-0" />

            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-90 z-10" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none z-10" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none z-10" />

            {/* Foreground Content in z-10 */}
            <div className="relative z-10">
              {/* Badges / Tags */}
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/85 text-amber-400 border border-amber-500/50 shadow-md backdrop-blur-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                  <span>🎯</span>
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">MODO PREPARAÇÃO</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/85 text-amber-300 border border-amber-500/50 shadow-md backdrop-blur-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                  <span>🔥</span>
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">PLATAFORMA NÚMERO 1</span>
                </span>
              </div>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/85 border border-amber-500/50 text-amber-400 mb-2.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                <BookOpen size={24} className="stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>

              {/* Main Title */}
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                PREPARA-TE PARA A TUA VAGA NO <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">MININT</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs font-semibold text-slate-100 dark:text-slate-100 mt-2 max-w-sm mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)] bg-slate-950/70 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
                <strong className="text-amber-400 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">A disciplina de hoje é a aprovação de amanhã.</strong> Treina com questões atualizadas de Legislação, Português e Cultura Geral e garante o teu futuro!
              </p>
            </div>
          </div>

          {/* HIGH TRAFFIC AD SLOT (TOP DASHBOARD) */}
          <AdBanner position="top_dashboard" />

          {/* DESAFIO DIÁRIO FEATURED CARD */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('desafio')}
            className="w-full text-left bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-4 shadow-lg hover:border-amber-400 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Flame size={24} className="fill-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-tight">Desafio Diário de Hoje</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black">+150 XP</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    10 Questões cronometradas • Ranking diário de Angola
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </div>
          </button>

          {/* 3. MODO DE TREINO */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 mb-2 font-bold">
              Modo de Treino
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setQuizMode('rapido')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  quizMode === 'rapido'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-md'
                    : 'bg-white dark:bg-[#0F1115] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Zap size={14} className={quizMode === 'rapido' ? 'text-slate-950' : 'text-amber-500'} />
                  <span>Simulado Rápido</span>
                </div>
                <p className={`text-[10px] ${quizMode === 'rapido' ? 'text-slate-950/80' : 'text-slate-500 dark:text-slate-400'}`}>5 Questões • 30s por questão</p>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode('exame')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  quizMode === 'exame'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-md'
                    : 'bg-white dark:bg-[#0F1115] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Clock size={14} className={quizMode === 'exame' ? 'text-slate-950' : 'text-amber-500'} />
                  <span>Exame Cronometrado</span>
                </div>
                <p className={`text-[10px] ${quizMode === 'exame' ? 'text-slate-950/80' : 'text-slate-500 dark:text-slate-400'}`}>10 Questões • 45s/q (7m30s total)</p>
              </button>
            </div>
          </div>

          {/* 4. SELECIONE A MATÉRIA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-bold">
                Seleccione a Matéria
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1">
                <span>Deslize</span>
                <span>➔</span>
              </span>
            </div>

            <div className="flex overflow-x-auto gap-2.5 pb-2 snap-x no-scrollbar -mx-1 px-1">
              {[
                { id: 'todas', label: 'Todas as Matérias', desc: 'Simulado Misto MININT', icon: Layers, color: 'text-amber-500' },
                { id: 'informatica_basica', label: 'Informática Básica', desc: 'Windows, Word, Excel, Net & Email', icon: Laptop, color: 'text-cyan-500' },
                { id: 'legislacao_minint', label: 'Legislação do MININT', desc: 'PNA, SIC, SME, SP, SPCB e Estatutos', icon: Shield, color: 'text-amber-500' },
                { id: 'direito_constituicao', label: 'Direito e Constituição (CRA)', desc: 'Constituição (CRA), Direito & LGTFP', icon: Scale, color: 'text-purple-500' },
                { id: 'historia_cultura_geral', label: 'História e Cultura Geral', desc: 'História, Geografia e Angola', icon: Globe, color: 'text-emerald-500' },
                { id: 'portugues_raciocinio', label: 'Língua Portuguesa e Raciocínio Lógico', desc: 'Gramática, Redacção, Lógica & Mat.', icon: FileText, color: 'text-blue-500' },
              ].map((cat) => {
                const IconComp = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`min-w-[175px] max-w-[190px] p-3 rounded-xl border text-left flex flex-col justify-between snap-start transition-all cursor-pointer relative shrink-0 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-slate-100 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-[#0F1115] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 ' + cat.color}`}>
                        <IconComp size={16} />
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{cat.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. INICIAR SIMULADO AGORA */}
          <button
            onClick={handleStartQuiz}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span>INICIAR SIMULADO AGORA</span>
            <ArrowRight size={16} />
          </button>

          {/* 6. PAINEL DE MISSÕES DIÁRIAS (Abaixo do botão Iniciar Simulado) */}
          <DailyMissions onClaimXp={(xpAmount, coinsAmount) => onUpdateStats(0, 0, xpAmount, false, undefined, false, coinsAmount)} />

          {/* WhatsApp Community Card */}
          <div className="bg-[#0b141a] dark:bg-[#0b141a] border border-[#25D366]/40 rounded-2xl p-4 sm:p-5 text-white shadow-xl shadow-[#25D366]/10 relative overflow-hidden group">
            {/* Ambient Green Lights */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#25D366]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#25D366]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              {/* Top Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>COMUNIDADE EXCLUSIVA • MININT Angola</span>
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
                  Junta-te ao Grupo Oficial no WhatsApp
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-medium">
                  Recebe alertas de edital em primeira mão, troca materiais de estudo com outros candidatos e tira dúvidas em tempo real.
                </p>
              </div>

              {/* Action Button */}
              <a
                href="https://chat.whatsapp.com/L1nLLLK8M4xGlSGUfzK6ID?s=cl&p=a&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.12-1.338c1.462.798 3.106 1.218 4.887 1.219h.005c5.505 0 9.988-4.479 9.989-9.985.001-2.668-1.034-5.176-2.918-7.062C17.199 3.048 14.68 2 12.012 2zm5.823 14.155c-.247.697-1.442 1.33-1.992 1.405-.515.071-1.185.105-3.393-.81-2.825-1.17-4.643-4.041-4.784-4.23-.14-.188-1.148-1.528-1.148-2.915 0-1.386.726-2.068.984-2.35.258-.282.563-.352.751-.352.188 0 .376.002.54.01.173.008.405-.065.634.484.235.564.8 1.95.87 2.091.07.141.117.306.023.494-.094.188-.141.305-.282.47-.141.165-.296.368-.423.494-.141.14-.288.293-.124.575.165.282.732 1.209 1.572 1.957 1.08 0.962 1.99 1.26 2.272 1.399.282.141.447.118.611-.07.165-.188.705-.823.893-1.105.188-.282.376-.235.634-.141.258.094 1.644.775 1.926.916.282.141.47.211.54.329.07.117.07.681-.177 1.378z" />
                </svg>
                <span>ENTRAR NO GRUPO DO WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ PLAYING VIEW */}
      {quizState === 'playing' && currentQ && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Progress & Timer Bar */}
          <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>QUESTÃO {currentIndex + 1} DE {activeQuestions.length}</span>
              </div>

              <div className="flex items-center gap-2">
                {quizMode === 'exame' ? (
                  <div className="flex items-center gap-1.5 font-mono font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 shadow-2xs">
                    <Clock size={14} className="animate-pulse" />
                    <span>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 font-mono font-extrabold px-2.5 py-1 rounded-lg border shadow-2xs ${
                    timeLeft <= 10
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <Clock size={14} />
                    <span>{timeLeft}s</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Abandonar Simulado"
                >
                  <LogOut size={13} />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Question Card with Horizontal Slide Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -35 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-lg dark:shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              
              <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {currentQ.categoryName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 capitalize">{currentQ.difficulty}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenReportModal(currentQ)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Reportar erro nesta questão"
                  >
                    <Flag size={12} />
                    <span className="hidden sm:inline">Reportar erro</span>
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options List */}
              <div className="space-y-2.5 pt-1">
                {/* Power-up 50:50 Hint Row */}
                {chosenAnswerIndex === null && (
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {eliminatedOptions.length > 0
                        ? '⚡ 2 opções erradas foram eliminadas com a Dica 50:50!'
                        : 'Selecione uma resposta:'}
                    </span>

                    <button
                      type="button"
                      onClick={handleUse5050Hint}
                      disabled={eliminatedOptions.length > 0}
                      title={
                        availableHints > 0
                          ? `Usar 1 Dica 50:50 (Possui ${availableHints} disponíveis)`
                          : 'Adquirir mais Dicas 50:50 na Loja MININT'
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                        eliminatedOptions.length > 0
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                          : availableHints > 0
                          ? 'bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-600 dark:text-purple-300 animate-pulse active:scale-95'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 active:scale-95'
                      }`}
                    >
                      <Zap size={11} className="fill-purple-400 text-purple-400" />
                      <span>
                        {eliminatedOptions.length > 0
                          ? '50:50 Aplicado'
                          : availableHints > 0
                          ? `Dica 50:50 (${availableHints})`
                          : 'Obter Dicas na Loja'}
                      </span>
                    </button>
                  </div>
                )}

                {currentQ.options.map((opt, idx) => {
                  const isChosen = chosenAnswerIndex === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const hasAnswered = chosenAnswerIndex !== null;
                  const isEliminated = eliminatedOptions.includes(idx);

                  let optionStyle = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10';

                  if (isEliminated && !hasAnswered) {
                    optionStyle = 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 text-slate-400 dark:text-slate-600 line-through opacity-40 cursor-not-allowed';
                  } else if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold shadow-sm ring-1 ring-emerald-500/30';
                    } else if (isChosen) {
                      optionStyle = 'bg-rose-100 dark:bg-rose-950/90 border-rose-500 text-rose-950 dark:text-rose-100 font-bold ring-1 ring-rose-500/30';
                    } else {
                      optionStyle = 'bg-slate-100/50 dark:bg-white/2 border-transparent text-slate-400 dark:text-slate-600 opacity-50';
                    }
                  }

                  let animateProp = undefined;
                  let transitionProp = undefined;

                  if (hasAnswered) {
                    if (isChosen && !isCorrect) {
                      animateProp = { x: [0, -8, 8, -6, 6, -3, 3, 0], scale: [1, 0.97, 1] };
                      transitionProp = { duration: 0.4 };
                    } else if (isCorrect) {
                      animateProp = { scale: isChosen ? [1, 1.04, 1] : [1, 1.01, 1], y: isChosen ? [0, -3, 0] : 0 };
                      transitionProp = { duration: 0.35, ease: 'easeOut' };
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={!hasAnswered && !isEliminated ? { scale: 0.98 } : undefined}
                      animate={animateProp}
                      transition={transitionProp}
                      disabled={hasAnswered || isEliminated}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                          hasAnswered && isCorrect
                            ? 'bg-emerald-500 text-slate-950'
                            : hasAnswered && isChosen && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug text-slate-900 dark:text-slate-100">{opt}</span>
                      </div>

                      {hasAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      {hasAnswered && isChosen && !isCorrect && <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Gabarito Comentado e Explicação Pedagógica */}
              {chosenAnswerIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    chosenAnswerIndex === currentQ.correctIndex
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {chosenAnswerIndex === currentQ.correctIndex ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300">Resposta Correcta! (+20 XP)</span>
                        </>
                      ) : chosenAnswerIndex === -1 ? (
                        <>
                          <Clock size={16} className="text-rose-600 dark:text-rose-400 animate-pulse" />
                          <span className="text-rose-700 dark:text-rose-300">Tempo Esgotado! (30s)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-rose-600 dark:text-rose-400" />
                          <span className="text-rose-700 dark:text-rose-300">Resposta Incorreta</span>
                        </>
                      )}
                    </div>

                    {currentQ.lawReference && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 font-semibold truncate max-w-[180px]">
                        {currentQ.lawReference}
                      </span>
                    )}
                  </div>

                  {/* Textual Explanation */}
                  <div className="space-y-1 bg-white/60 dark:bg-slate-950/40 p-3 rounded-lg border border-black/5 dark:border-white/5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <span>Fundamentação Jurídica & Pedagógica:</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {currentQ.explanation}
                    </p>
                  </div>

                  {/* Actions: AI Tutor, Report Error & Next Question Button */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExplainWithAI(currentQ, chosenAnswerIndex)}
                        className="px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span>Explicar com IA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(currentQ)}
                        className="px-2.5 py-2 rounded-lg bg-slate-500/10 hover:bg-rose-500/15 border border-slate-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Reportar erro nesta questão"
                      >
                        <Flag size={13} />
                        <span className="hidden sm:inline">Reportar Erro</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all active:scale-95"
                    >
                      <span>{currentIndex < activeQuestions.length - 1 ? 'Próxima' : 'Ver Resultado'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* QUIZ COMPLETED VIEW: Performance & Statistics Dashboard */}
      {quizState === 'completed' && (() => {
        const totalQ = activeQuestions.length || 1;
        const pct = Math.round((score / totalQ) * 100);
        const isPassed = pct >= 50;
        const xpGained = (score * 20) + 50;
        const { categories, worstCategory } = getSubjectDiagnostics();

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* 1. Header & Result Card */}
            <div className={`border rounded-3xl p-5 text-center shadow-xl space-y-4 relative overflow-hidden ${
              isPassed
                ? 'bg-gradient-to-b from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-[#0F1115] dark:to-[#0F1115] border-emerald-500/30'
                : 'bg-gradient-to-b from-rose-500/10 via-white to-white dark:from-rose-950/40 dark:via-[#0F1115] dark:to-[#0F1115] border-rose-500/30'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 opacity-60" />

              <div className="flex items-center justify-center mx-auto pt-8">
                <ReactiveAvatar
                  avatarId={profile.avatarId}
                  branch={profile.branch}
                  displayName={profile.displayName}
                  photoURL={profile.photoURL}
                  size="2xl"
                  reaction={isPassed ? 'quizComplete' : 'idle'}
                  showBranchBadge={true}
                  showLevelBadge={true}
                  level={profile.level || 1}
                  isVipSupporter={profile.isVipSupporter}
                  interactive={true}
                />
              </div>

              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 border"
                  style={{
                    backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    borderColor: isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                    color: isPassed ? '#10b981' : '#f43f5e'
                  }}
                >
                  <span>{isPassed ? 'Aprovado na Simulação!' : 'Necessita Mais Estudo'}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {pct}% de Aproveitamento
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  {isPassed
                    ? 'Excelente resultado! Demonstra forte domínio da legislação e matérias do Concurso MININT.'
                    : 'Ainda faltam pontos para alcançar a nota de corte recomendada. Fortaleça os conteúdos abaixo.'}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-left">
                {/* Acertos */}
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-2xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                    <Target size={12} className="text-amber-500 shrink-0" />
                    <span>Acertos</span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                    {score} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {totalQ}</span>
                  </p>
                </div>

                {/* Tempo Gasto */}
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-2xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                    <Clock size={12} className="text-amber-500 shrink-0" />
                    <span>Tempo</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                    {formatTimeSpent(timeSpentSeconds)}
                  </p>
                </div>

                {/* XP Gained Card (Animated) */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 rounded-2xl p-3 shadow-2xs"
                >
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] uppercase tracking-wider font-bold">
                    <Zap size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                    <span>Recompensa</span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                    +{xpGained} XP
                  </p>
                </motion.div>
              </div>
            </div>

            {/* HIGH TRAFFIC AD SLOT (EXAM RESULTS) */}
            <AdBanner position="results" />

            {/* 2. Diagnóstico e Análise por Matéria ('Onde Estudar Mais') */}
            <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-amber-500" />
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Desempenho por Matéria
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                  Onde Estudar Mais
                </span>
              </div>

              {/* Highlight Recommendation Box */}
              {worstCategory && worstCategory.pct < 80 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                      Atenção: Recomendamos revisar a matéria abaixo
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-snug">
                      Foco sugerido em <strong className="text-amber-600 dark:text-amber-300">{worstCategory.name}</strong> ({worstCategory.pct}% de aproveitamento).
                    </p>
                  </div>
                </div>
              )}

              {/* Categories Progress Bars */}
              <div className="space-y-3 pt-1">
                {categories.map((cat) => {
                  const barColor = cat.pct >= 70
                    ? 'bg-emerald-500'
                    : cat.pct >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

                  return (
                    <div key={cat.catKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[210px]">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400">
                            {cat.correct}/{cat.total} acertos
                          </span>
                          <span className={`font-bold ${
                            cat.pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : cat.pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {cat.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Gabarito Detalhado (Revisão da Prova) */}
            <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Gabarito Detalhado (Revisão)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReview(!showReview)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showReview ? 'Recolher' : 'Revisar Questões'}</span>
                  {showReview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Filter controls if expanded */}
              {showReview && (
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      reviewFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Todas ({activeQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('correct')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      reviewFilter === 'correct'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Certas ({score})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('wrong')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      reviewFilter === 'wrong'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Erradas ({activeQuestions.length - score})
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeQuestions
                  .map((q, idx) => ({ q, idx, userChoice: userAnswers[idx] }))
                  .filter(({ q, idx, userChoice }) => {
                    if (!showReview && idx > 2) return false;
                    if (reviewFilter === 'correct') return userChoice === q.correctIndex;
                    if (reviewFilter === 'wrong') return userChoice !== q.correctIndex;
                    return true;
                  })
                  .map(({ q, idx, userChoice }) => {
                    const isRight = userChoice === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                          isRight
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-rose-500/5 border-rose-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isRight ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              {q.categoryName}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isRight
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {isRight ? 'Correcta' : userChoice === -1 ? 'Tempo Esgotado' : 'Incorreta'}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs leading-snug">
                          {q.question}
                        </p>

                        <div className="space-y-1 bg-white/70 dark:bg-black/30 p-2.5 rounded-lg border border-black/5 dark:border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                            <CheckCircle2 size={13} className="shrink-0" />
                            <span>Resposta Certa: {q.options[q.correctIndex]}</span>
                          </div>
                          {!isRight && userChoice !== undefined && userChoice >= 0 && (
                            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-semibold">
                              <XCircle size={13} className="shrink-0" />
                              <span>Sua Resposta: {q.options[userChoice]}</span>
                            </div>
                          )}
                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed text-[11px]">
                            {q.explanation}
                          </p>
                          {q.lawReference && (
                            <p className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              {q.lawReference}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleExplainWithAI(q, userChoice ?? 0)}
                            className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Sparkles size={12} className="text-amber-500" />
                            <span>Explicação IA</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReportModal(q)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-500/10 hover:bg-rose-500/15 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-500/20 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Reportar erro nesta questão"
                          >
                            <Flag size={11} />
                            <span>Reportar Erro</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {!showReview && activeQuestions.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-center"
                >
                  Ver mais {activeQuestions.length - 3} questões no gabarito...
                </button>
              )}
            </div>

            {/* 4. Action Buttons at Footer */}
            <div className="space-y-2 pt-1">
              {/* Vibrant Meme Generator Trigger Button */}
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
                onClick={handleStartQuiz}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition-all active:scale-98"
              >
                <RotateCcw size={16} />
                <span>Refazer Simulado</span>
              </button>

              {/* Support Project Button */}
              {onOpenSupportModal && (
                <button
                  type="button"
                  onClick={onOpenSupportModal}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <Coffee size={16} />
                  <span>{profile.isVipSupporter ? 'Apoiar o Projeto ☕ (Apoiador VIP 🌟)' : 'Apoiar o Projeto ☕'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('duel')}
                    className="py-3 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <Swords size={15} />
                    <span>Ir para Duelo 1v1</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setQuizState('setup')}
                  className={`py-3 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 ${
                    !onNavigateTab ? 'col-span-2' : ''
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Voltar ao Painel</span>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* AI Explanation Modal */}
      {modalQuestion && (
        <AIExplanationModal
          question={modalQuestion}
          userChosenIndex={userAnswers[currentIndex] ?? null}
          explanationData={aiExplanation}
          isLoading={isAILoading}
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}

      {/* Meme Generator Modal */}
      {quizState === 'completed' && (
        <MemeGeneratorModal
          isOpen={isMemeModalOpen}
          onClose={() => setIsMemeModalOpen(false)}
          profile={profile}
          score={score}
          totalQuestions={activeQuestions.length || 10}
          pct={Math.round((score / (activeQuestions.length || 1)) * 100)}
          categoryName={selectedCategory === 'todas' ? 'Simulado Geral MININT' : selectedCategory}
        />
      )}

      {/* Confirm Exit Modal */}
      <ConfirmExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleConfirmExit}
        sessionType="simulado"
      />

      {/* REPORT QUESTION MODAL */}
      <AnimatePresence>
        {isReportModalOpen && reportingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Flag size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      Reportar Erro na Questão
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      ID: <span className="font-mono font-bold text-amber-500">{reportingQuestion.id}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {reportSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-2 py-6">
                  <CheckCircle2 size={36} className="mx-auto" />
                  <p className="text-xs font-extrabold">{reportSuccessMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  {/* Question Preview Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                      {reportingQuestion.categoryName}
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-3">
                      "{reportingQuestion.question}"
                    </p>
                  </div>

                  {/* Reason Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Motivo da Reportagem:
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Gabarito incorreto">Gabarito incorreto (resposta marcada errada)</option>
                      <option value="Erro de ortografia/digitação">Erro de ortografia ou digitação</option>
                      <option value="Pergunta confusa ou ambígua">Pergunta confusa ou ambígua</option>
                      <option value="Legislação desatualizada">Legislação ou norma desatualizada</option>
                      <option value="Outro problema">Outro motivo</option>
                    </select>
                  </div>

                  {/* Comments Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Detalhes ou Comentário (opcional):
                    </label>
                    <textarea
                      rows={3}
                      value={reportComment}
                      onChange={(e) => setReportComment(e.target.value)}
                      placeholder="Ex: A alternativa correta deveria ser a opção B conforme a legislação vigente..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmittingReport ? (
                        <span>A enviar...</span>
                      ) : (
                        <>
                          <Flag size={14} />
                          <span>Enviar Relatório</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
