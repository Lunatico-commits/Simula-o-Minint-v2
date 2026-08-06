import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  Laptop, 
  Shield, 
  Scale, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

export interface StudyTip {
  id: string;
  category: 'informatica' | 'legislacao';
  categoryLabel: string;
  categoryKey: string;
  topic: string;
  title: string;
  tipText: string;
  lawOrShortcut: string;
  exampleOrExplanation: string;
}

export const DAILY_STUDY_TIPS: StudyTip[] = [
  // INFORMÁTICA BÁSICA
  {
    id: 'tip_inf_1',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Atalhos de Teclado no Windows',
    title: 'Eliminação Definitiva sem Lixeira',
    tipText: 'Ao selecionar um ficheiro ou pasta no Windows Explorer e premir a combinação de teclas Shift + Delete, o elemento é apagado permanentemente sem passar pela Lixeira.',
    lawOrShortcut: 'Atalho: Shift + Delete',
    exampleOrExplanation: 'Utilize este atalho quando quiser libertar espaço em disco imediatamente ou eliminar dados sensíveis com rapidez.'
  },
  {
    id: 'tip_inf_2',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Processamento de Texto (MS Word)',
    title: 'Alinhamento Justificado de Documentos',
    tipText: 'O alinhamento "Justificado" (Ctrl + J) distribui o texto de forma uniforme entre a margem esquerda e a direita, garantindo extremidades retas recomendadas para relatórios formais.',
    lawOrShortcut: 'Atalho: Ctrl + J',
    exampleOrExplanation: 'Requisito obrigatório na redação de relatórios policiais, atas e memorandos oficiais do MININT.'
  },
  {
    id: 'tip_inf_3',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Folhas de Cálculo (MS Excel)',
    title: 'Sintaxe de Intervalos em Fórmulas',
    tipText: 'No Excel, a fórmula =SOMA(A1:A10) utiliza dois pontos (:) para representar a soma de todo o intervalo contínuo de A1 até A10.',
    lawOrShortcut: 'Sintaxe: =SOMA(CélulaInicial:CélulaFinal)',
    exampleOrExplanation: 'Atenção ao concurso: o ponto e vírgula (;) serve para somar células isoladas (ex: A1;A10), enquanto os dois pontos (:) somam o intervalo completo.'
  },
  {
    id: 'tip_inf_4',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Explorador de Ficheiros',
    title: 'Abertura Rápida do Windows Explorer',
    tipText: 'Pressionar a combinação da tecla do logótipo do Windows + E abre instantaneamente a janela do Explorador de Ficheiros.',
    lawOrShortcut: 'Atalho: Tecla Win + E',
    exampleOrExplanation: 'Economize tempo durante tarefas administrativas e navegação de pastas no trabalho diário.'
  },
  {
    id: 'tip_inf_5',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Cibersegurança & Redes',
    title: 'Encriptação e Proteção em HTTPS',
    tipText: 'O protocolo HTTPS (HyperText Transfer Protocol Secure) garante que os dados trocados entre o navegador e o servidor web são encriptados por certificados SSL/TLS.',
    lawOrShortcut: 'Conceito: Segurança SSL/TLS na Web',
    exampleOrExplanation: 'Verifique sempre o ícone do alfinete/cadeado antes de introduzir credenciais institucionais ou dados pessoais em portais públicos.'
  },
  {
    id: 'tip_inf_6',
    category: 'informatica',
    categoryLabel: 'Informática Básica',
    categoryKey: 'informatica_basica',
    topic: 'Correio Eletrónico (E-mail)',
    title: 'Função do Campo Cco (Cópia Oculta)',
    tipText: 'Ao enviar e-mails para múltiplos destinatários, o campo Cco (Cópia de Cortesia Oculta / Bcc) oculta os endereços de e-mail de todos os outros recetores.',
    lawOrShortcut: 'Conceito: Privacidade no Correio Eletrónico',
    exampleOrExplanation: 'Essencial em comunicados institucionais para cumprir normas de proteção de dados e evitar o envio em massa visível.'
  },

  // LEGISLAÇÃO MININT & CRA
  {
    id: 'tip_leg_1',
    category: 'legislacao',
    categoryLabel: 'Legislação & Direitos Humanos',
    categoryKey: 'direito_constituicao',
    topic: 'Direito Constitucional (CRA)',
    title: 'Princípio da Presunção de Inocência',
    tipText: 'O Artigo 67.º da Constituição da República de Angola estabelece que qualquer cidadão acusado de infração penal presume-se inocente até ao trânsito em julgado da sentença condenatória.',
    lawOrShortcut: 'Base Legal: Artigo 67.º, n.º 2 da CRA',
    exampleOrExplanation: 'A autoridade policial deve tratar todo o cidadão detido com respeito e sem qualquer antecipação de culpa.'
  },
  {
    id: 'tip_leg_2',
    category: 'legislacao',
    categoryLabel: 'Legislação do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Estrutura do Ministério do Interior',
    title: 'Órgãos Executivos Diretos do MININT',
    tipText: 'Nos termos do Decreto Presidencial n.º 32/18, os 5 Órgãos Executivos Diretos do MININT são: PNA, SIC, SME, SP e SPCB.',
    lawOrShortcut: 'Base Legal: Decreto Presidencial n.º 32/18',
    exampleOrExplanation: 'Cada ramo possui atribuições específicas: Ordem Pública (PNA), Investigação Criminal (SIC), Controlo Migratório (SME), Presídios (SP) e Proteção Civil (SPCB).'
  },
  {
    id: 'tip_leg_3',
    category: 'legislacao',
    categoryLabel: 'Legislação & Direitos Humanos',
    categoryKey: 'direito_constituicao',
    topic: 'Garantias Fundamentais',
    title: 'Providência do Habeas Corpus',
    tipText: 'O Habeas Corpus (Art. 68.º da CRA) é a garantia constitucional urgente utilizável contra a prisão ou detenção ilegal efetuada por autoridade incompetente ou sem fundamentação.',
    lawOrShortcut: 'Base Legal: Artigo 68.º da CRA',
    exampleOrExplanation: 'Pode ser requerido pelo próprio indivíduo privado de liberdade ou por qualquer outro cidadão no pleno gozo dos seus direitos.'
  },
  {
    id: 'tip_leg_4',
    category: 'legislacao',
    categoryLabel: 'Legislação & Direitos Humanos',
    categoryKey: 'direito_constituicao',
    topic: 'Prazos de Comunicação de Detenção',
    title: 'Prazo Máximo de Notificação à Família',
    tipText: 'A privação de liberdade de qualquer cidadão deve ser comunicada à família ou a pessoa indicada no prazo máximo de 24 horas.',
    lawOrShortcut: 'Base Legal: Artigo 64.º, n.º 2 da CRA',
    exampleOrExplanation: 'Garantia constitucional indispensável para a transparência dos atos de privação de liberdade na função policial.'
  },
  {
    id: 'tip_leg_5',
    category: 'legislacao',
    categoryLabel: 'Legislação do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Divisão Político-Administrativa 2025',
    title: 'Nova Estrutura Territorial de Angola (DPO 2025)',
    tipText: 'Pela Lei n.º 13/24, Angola passa a ser constituída por 21 Províncias no âmbito da Nova Divisão Político-Administrativa.',
    lawOrShortcut: 'Base Legal: Lei n.º 13/24 (DPO 2025)',
    exampleOrExplanation: 'A reorganização criou as províncias do Moxico Leste (sede Cazombo), Cuando e Cubango, visando a descentralização dos serviços públicos.'
  },
  {
    id: 'tip_leg_6',
    category: 'legislacao',
    categoryLabel: 'Legislação & Direitos Humanos',
    categoryKey: 'direito_constituicao',
    topic: 'Direitos Fundamentais (CRA)',
    title: 'Inviolabilidade do Direito à Vida',
    tipText: 'O Artigo 30.º da CRA consagra a inviolabilidade absoluta do Direito à Vida, sendo expressamente proibida a pena de morte no ordenamento jurídico angolano.',
    lawOrShortcut: 'Base Legal: Artigo 30.º da CRA',
    exampleOrExplanation: 'Valor supremo da República de Angola que orienta a doutrina do uso gradual da força pelos efetivos de segurança pública.'
  }
];

interface DailyStudyTipProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string, categoryKey?: string) => void;
}

export const DailyStudyTip: React.FC<DailyStudyTipProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Pick daily deterministic tip based on day of year, or random
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear % DAILY_STUDY_TIPS.length;
  });

  const [copied, setCopied] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  const currentTip = DAILY_STUDY_TIPS[currentIndex];

  const handleNextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_STUDY_TIPS.length);
    setCopied(false);
  };

  const handlePrevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + DAILY_STUDY_TIPS.length) % DAILY_STUDY_TIPS.length);
    setCopied(false);
  };

  const handleCopyTip = () => {
    const textToCopy = `💡 DICA DE ESTUDO MININT - ${currentTip.topic.toUpperCase()}\n\n📌 ${currentTip.title}\n${currentTip.tipText}\n\n⚖️ ${currentTip.lawOrShortcut}\n💡 ${currentTip.exampleOrExplanation}\n\nEstude com PreparaConcurso MININT 🇦🇴`;
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        >
          {/* Header Bar */}
          <div className="relative px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400">
                <Lightbulb size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Dica Rápida do Dia
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {currentIndex + 1} / {DAILY_STUDY_TIPS.length}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Reforce seus conhecimentos para o Concurso MININT
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Card Content */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Category badge & Topic */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                currentTip.category === 'informatica' 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {currentTip.category === 'informatica' ? <Laptop size={14} /> : <Shield size={14} />}
                {currentTip.categoryLabel}
              </span>

              <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                {currentTip.topic}
              </span>
            </div>

            {/* Tip Title & Description */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 shrink-0" />
                {currentTip.title}
              </h4>

              <p className="text-sm leading-relaxed text-slate-200 font-normal">
                {currentTip.tipText}
              </p>

              {/* Law reference or Keyboard Shortcut highlight box */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-medium text-amber-300 flex items-center gap-2">
                <Zap size={14} className="shrink-0 text-amber-400" />
                <span>{currentTip.lawOrShortcut}</span>
              </div>
            </div>

            {/* Practical Application / Context */}
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-md bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                <BookOpen size={14} />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200 block">Aplicação Prática no Concurso:</span>
                <p className="text-slate-400">{currentTip.exampleOrExplanation}</p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
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
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                title="Dica anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleNextTip}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors border border-slate-700/60 flex items-center gap-1"
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
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5 shrink-0"
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
