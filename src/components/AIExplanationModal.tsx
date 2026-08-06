import React from 'react';
import { AIExplanationResponse, Question } from '../types';
import { Sparkles, X, BookOpen, CheckCircle, Scale, Copy, Check } from 'lucide-react';

interface AIExplanationModalProps {
  question: Question;
  userChosenIndex: number | null;
  explanationData: AIExplanationResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  question,
  userChosenIndex,
  explanationData,
  isLoading,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const isCorrect = userChosenIndex === question.correctIndex;

  const handleCopy = () => {
    if (!explanationData) return;
    const textToCopy = `[Fundamentação Jurídica MININT]\n\nPergunta: ${question.question}\n\nExplicação: ${explanationData.explanation}\n\nArtigos Aplicáveis: ${explanationData.legalArticles?.join(', ')}\n\nDica de Estudo: ${explanationData.studyTips}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl max-w-md w-full p-5 text-slate-900 dark:text-slate-100 shadow-2xl my-auto relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-300">Explicação com Inteligência Artificial</h3>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">Direito & Legislação Angolana • Gemini AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {/* Question Recap Box */}
          <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              <span>{question.categoryName}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                {question.lawReference}
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{question.question}</p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle size={13} />
                <span>Opção Correta: {question.options[question.correctIndex]}</span>
              </div>
              {userChosenIndex !== null && !isCorrect && (
                <div className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                  Sua escolha: {question.options[userChosenIndex]}
                </div>
              )}
            </div>
          </div>

          {/* AI Loader State */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-spin">
                  <Sparkles size={24} className="text-amber-500" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Analisando a Legislação de Angola...</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Consultando Decretos Presidenciais e Diário da República</p>
              </div>
            </div>
          )}

          {/* AI Output Content */}
          {!isLoading && explanationData && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Rationale / Explanation */}
              <div className="bg-slate-50 dark:bg-slate-950/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                  <BookOpen size={14} />
                  <span>Fundamentação e Raciocínio Jurídico</span>
                </h4>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {explanationData.explanation}
                </p>
              </div>

              {/* Legal Articles Cited */}
              {explanationData.legalArticles && explanationData.legalArticles.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Scale size={14} className="text-amber-500" />
                    <span>Legislação & Artigos Aplicáveis</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {explanationData.legalArticles.map((art, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Tip Box */}
              {explanationData.studyTips && (
                <div className="bg-amber-500/10 dark:bg-gradient-to-r dark:from-amber-950/40 dark:to-slate-950 rounded-2xl p-3.5 border border-amber-500/30">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                    <span>💡 Dica de Ouro para o Concurso MININT</span>
                  </h4>
                  <p className="text-xs text-slate-800 dark:text-slate-300">{explanationData.studyTips}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={isLoading || !explanationData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado!' : 'Copiar Explicativo'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer uppercase tracking-wider"
          >
            Compreendido
          </button>
        </div>
      </div>
    </div>
  );
};
