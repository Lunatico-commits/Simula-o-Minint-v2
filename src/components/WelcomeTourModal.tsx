import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  BookOpen, 
  Swords, 
  Trophy, 
  Bot, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Award, 
  Flame,
  Volume2,
  HelpCircle
} from 'lucide-react';
import { MinintShieldLogo } from './Header';

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface TourStep {
  id: string;
  tabKey?: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bullets: { icon: string; text: string }[];
  highlightTip: string;
}

export const WELCOME_TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    category: 'VISÃO GERAL',
    title: 'Bem-vindo ao PreparaConcurso MININT! 🇦🇴',
    subtitle: 'A sua plataforma de elite para o Concurso Público do MININT',
    description: 'Prepara-te para ingressar na Polícia Nacional (PNA), Serviço de Investigação Criminal (SIC), Migração e Estrangeiros (SME), Serviço Penitenciário (SP) ou Bombeiros (SPCB).',
    icon: <MinintShieldLogo size={56} />,
    gradient: 'from-blue-600 via-indigo-600 to-slate-900',
    bullets: [
      { icon: '📜', text: 'Questões atualizadas da legislação angolana e matérias oficiais' },
      { icon: '⚔️', text: 'Duelos 1v1 multiplayer em tempo real contra outros candidatos' },
      { icon: '🏆', text: 'Subida de Patentes Militares e Certificado de Preparação' },
      { icon: '🤖', text: 'Tutor IA inteligente para tirar dúvidas jurídicas 24/7' },
    ],
    highlightTip: 'Tudo o que precisa para garantir a sua vaga no concurso num só lugar!',
  },
  {
    id: 'quiz',
    tabKey: 'quiz',
    category: 'SIMULADOS & QUESTÕES',
    title: 'Simulados & Leitura por Áudio 📚',
    subtitle: 'Pratique com feedback explicativo imediato',
    description: 'Responda a questões separadas por categorias cruciais: Direito Penal, Legislação do MININT, Língua Portuguesa e Cultura Geral de Angola.',
    icon: <BookOpen className="w-12 h-12 text-blue-400" />,
    gradient: 'from-blue-600 to-sky-700',
    bullets: [
      { icon: '🎯', text: 'Acompanhe a sua taxa de acerto por matéria em tempo real' },
      { icon: '🔊', text: 'Ative a voz sintetizada para ouvir questões e justificações' },
      { icon: '⚡', text: 'Aprenda com explicações fundamentadas no articulado legal' },
    ],
    highlightTip: 'Dica: Clica na lâmpada de dica se tiver dúvidas durante o simulado!',
  },
  {
    id: 'duel',
    tabKey: 'duel',
    category: 'COMPETIÇÃO & DESAFIOS',
    title: 'Duelos 1v1 & Desafio Diário ⚔️',
    subtitle: 'Mede forças contra candidatos de todo o país',
    description: 'Entra na Arena Multiplayer de Duelos para desafiar amigos ou oponentes aleatórios, ou cumpre o Desafio Diário para manter a tua ofensiva (streak).',
    icon: <Swords className="w-12 h-12 text-purple-400" />,
    gradient: 'from-purple-600 to-indigo-800',
    bullets: [
      { icon: '⚡', text: 'Bónus de velocidade para quem responde mais rápido e acerta' },
      { icon: '🔥', text: 'Mantém a tua ofensiva diária ativa para multiplicar XP' },
      { icon: '📲', text: 'Convida amigos com código direto para salas privadas de duelo' },
    ],
    highlightTip: 'Cada vitória no Duelo concede XP valioso para a subida de patente!',
  },
  {
    id: 'rankings',
    tabKey: 'rankings',
    category: 'RANKINGS & CERTIFICADO',
    title: 'Patentes, Galeria & Certificado 🏆',
    subtitle: 'Do Recruta ao Comissário-Geral',
    description: 'Consulta o Ranking Provincial e Nacional dos candidatos, coleciona insígnias na Galeria de Badges e trabalha rumo aos 50.000 XP.',
    icon: <Trophy className="w-12 h-12 text-amber-400" />,
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    bullets: [
      { icon: '🎖️', text: 'Insígnias com níveis de raridade: Comum, Raro, Épico e Lendário' },
      { icon: '📊', text: 'Compara a tua pontuação na tua província e no teu ramo' },
      { icon: '🎓', text: 'Desbloqueia o Certificado Oficial de Preparação para PDF/PNG' },
    ],
    highlightTip: 'Partilha as tuas conquistas e certificado diretamente no WhatsApp!',
  },
  {
    id: 'tutor',
    tabKey: 'tutor',
    category: 'ASSISTENTE VIRTUAL IA',
    title: 'Tutor IA Especializado no MININT 🤖',
    subtitle: 'Esclareça conceitos jurídicos e leis a qualquer hora',
    description: 'O nosso assistente virtual com IA está programado com a Constituição de Angola, a Lei Geral do Trabalho e a legislação dos ramos do MININT.',
    icon: <Bot className="w-12 h-12 text-emerald-400" />,
    gradient: 'from-emerald-600 to-teal-800',
    bullets: [
      { icon: '💡', text: 'Pede ajuda para entender artigos de leis complexos' },
      { icon: '✍️', text: 'Recebe conselhos de estudo e resumos das matérias' },
      { icon: '🌐', text: 'Disponível 24 horas por dia, 7 dias por semana' },
    ],
    highlightTip: 'Clica no separador "Tutor IA" na barra de navegação para conversar!',
  },
];

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const currentStep = WELCOME_TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WELCOME_TOUR_STEPS.length - 1;

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('minint_welcome_tour_seen', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep.tabKey && onNavigateTab) {
      onNavigateTab(currentStep.tabKey);
    }
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = WELCOME_TOUR_STEPS[currentStepIndex - 1];
      if (prevStep.tabKey && onNavigateTab) {
        onNavigateTab(prevStep.tabKey);
      }
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white dark:bg-[#0A0D14] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-auto flex flex-col text-slate-900 dark:text-slate-100"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#0F121A]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-500 font-mono">
                GUIA DE BOAS-VINDAS • {currentStepIndex + 1} DE {WELCOME_TOUR_STEPS.length}
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {currentStep.category}
              </h2>
            </div>
          </div>
        </div>

        {/* Step Progress Dots Bar */}
        <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 flex">
          {WELCOME_TOUR_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStepIndex ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Card Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Feature Banner/Icon Box */}
              <div className={`p-5 rounded-2xl bg-gradient-to-br ${currentStep.gradient} text-white shadow-xl flex items-center gap-4 relative overflow-hidden border border-white/10`}>
                <div className="shrink-0 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                  {currentStep.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {currentStep.category}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1 leading-tight">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                    {currentStep.subtitle}
                  </p>
                </div>
              </div>

              {/* Step Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {currentStep.description}
              </p>

              {/* Feature Highlights Bullet Points */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#0F121C] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                {currentStep.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <span className="text-base shrink-0 select-none leading-none">{b.icon}</span>
                    <span className="leading-tight">{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Highlight Tip Banner */}
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                <Sparkles size={16} className="shrink-0 text-amber-500" />
                <span>{currentStep.highlightTip}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F121A] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Não voltar a mostrar no início</span>
          </label>

          {/* Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isLastStep ? 'Concluir & Começar!' : 'Próximo'}</span>
              {!isLastStep ? <ChevronRight size={16} /> : <CheckCircle2 size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
