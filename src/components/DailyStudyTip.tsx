import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  BookOpen, 
  Scale, 
  Building2, 
  Shield, 
  Award, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';
import { 
  DAILY_STUDY_TIPS, 
  OFFICIAL_CATEGORIES, 
  StudyTip, 
  OfficialSubjectKey 
} from '../data/quickTipsData';

export { DAILY_STUDY_TIPS, OFFICIAL_CATEGORIES };
export type { StudyTip, OfficialSubjectKey };

interface DailyStudyTipProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string, categoryKey?: string) => void;
  initialCategory?: OfficialSubjectKey | 'all';
}

export const DailyStudyTip: React.FC<DailyStudyTipProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OfficialSubjectKey | 'all'>(initialCategory);
  
  // Filtered tips based on selected category tab
  const filteredTips = useMemo(() => {
    if (selectedCategory === 'all') return DAILY_STUDY_TIPS;
    return DAILY_STUDY_TIPS.filter((tip) => tip.category === selectedCategory);
  }, [selectedCategory]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Initialize with daily deterministic tip on mount
  useEffect(() => {
    if (isOpen) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const initialIdx = dayOfYear % (DAILY_STUDY_TIPS.length || 1);
      if (selectedCategory === 'all') {
        setCurrentIndex(initialIdx);
      } else {
        setCurrentIndex(0);
      }
      setCopied(false);
    }
  }, [isOpen, selectedCategory]);

  const currentTip = filteredTips[currentIndex] || filteredTips[0] || DAILY_STUDY_TIPS[0];

  const handleNextTip = () => {
    if (filteredTips.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredTips.length);
    setCopied(false);
  };

  const handlePrevTip = () => {
    if (filteredTips.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
    setCopied(false);
  };

  const handleCopyTip = () => {
    if (!currentTip) return;
    const textToCopy = `💡 DICA RÁPIDA DE ESTUDO MININT - ${currentTip.categoryLabel.toUpperCase()}\n\n📚 Tópico: ${currentTip.topic}\n📌 ${currentTip.title}\n${currentTip.tipText}\n\n⚖️ ${currentTip.lawOrShortcut}\n💡 Aplicação Prática: ${currentTip.exampleOrExplanation}\n\n🇦🇴 Estude com o Simulador Oficial MININT`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('minint_daily_tip_dont_show', today);
    }
    onClose();
  };

  const renderCategoryIcon = (cat: OfficialSubjectKey | 'all', size = 14) => {
    switch (cat) {
      case 'historia_angola':
        return <BookOpen size={size} />;
      case 'direito_constituicao':
        return <Scale size={size} />;
      case 'administracao_publica':
        return <Building2 size={size} />;
      case 'legislacao_minint':
        return <Shield size={size} />;
      case 'patriotismo_deveres':
        return <Award size={size} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  const getCategoryTheme = (cat: OfficialSubjectKey) => {
    switch (cat) {
      case 'historia_angola':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          accent: 'text-amber-300',
        };
      case 'direito_constituicao':
        return {
          badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          accent: 'text-indigo-300',
        };
      case 'administracao_publica':
        return {
          badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          accent: 'text-sky-300',
        };
      case 'legislacao_minint':
        return {
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          accent: 'text-emerald-300',
        };
      case 'patriotismo_deveres':
        return {
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          accent: 'text-rose-300',
        };
      default:
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          accent: 'text-amber-300',
        };
    }
  };

  if (!isOpen || !currentTip) return null;

  const currentTheme = getCategoryTheme(currentTip.category);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-slate-900 border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="relative px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-xs">
                <Lightbulb size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Dicas Rápidas do Concurso
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {currentIndex + 1} de {filteredTips.length}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-200">
                  5 Matérias Oficiais do Concurso MININT 🇦🇴
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* 5 Official Subject Categories Filter Bar */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/70 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              {OFFICIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      setCurrentIndex(0);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs scale-[1.02]'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    {renderCategoryIcon(cat.key, 12)}
                    <span>{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Card Content */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Category badge & Topic */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${currentTheme.badge}`}>
                {renderCategoryIcon(currentTip.category, 14)}
                {currentTip.categoryLabel}
              </span>

              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1">
                <Filter size={11} className="text-amber-400/80" />
                {currentTip.topic}
              </span>
            </div>

            {/* Tip Title & Description */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
              <h4 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${currentTheme.accent}`}>
                <Sparkles size={17} className="text-amber-400 shrink-0" />
                {currentTip.title}
              </h4>

              <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-normal">
                {currentTip.tipText}
              </p>

              {/* Law reference highlight box */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                <Zap size={15} className="shrink-0 text-amber-400 fill-amber-400" />
                <span>{currentTip.lawOrShortcut}</span>
              </div>
            </div>

            {/* Practical Application / Exam Context */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-300">
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400 shrink-0 mt-0.5 border border-slate-700/60">
                <BookOpen size={16} />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="font-bold text-amber-300 block">Dica para a Prova do Concurso:</span>
                <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">{currentTip.exampleOrExplanation}</p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Don't show today checkbox & copy */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <label className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                Não mostrar hoje
              </label>

              <button
                onClick={handleCopyTip}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800/60"
                title="Copiar dica para a Área de Transferência"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrevTip}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
                title="Dica anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleNextTip}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors border border-slate-700/60 flex items-center gap-1 cursor-pointer"
              >
                <span>Próxima</span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => {
                  handleClose();
                  if (onNavigateTab) {
                    onNavigateTab('quiz', currentTip.categoryKey);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Praticar</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
