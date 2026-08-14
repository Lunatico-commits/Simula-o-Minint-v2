import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Swords, Flame, X } from 'lucide-react';

export interface ConfirmExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  sessionType?: 'simulado' | 'duelo' | 'desafio';
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  sessionType = 'simulado',
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [isOpen]);

  const defaultTitle = 
    sessionType === 'duelo' 
      ? 'Abandonar Duelo em Curso?' 
      : sessionType === 'desafio'
      ? 'Sair do Desafio Diário?'
      : 'Abandonar Simulado?';

  const defaultDescription = 
    sessionType === 'duelo' 
      ? 'Se saíres agora, o duelo será considerado uma derrota e o teu adversário receberá os pontos.' 
      : sessionType === 'desafio'
      ? 'Tens a certeza de que queres sair? O teu progresso nas 10 questões de hoje não será guardado.'
      : 'Tens a certeza de que queres sair? Todo o teu progresso nesta sessão de simulado será perdido.';

  const defaultConfirmText =
    sessionType === 'duelo'
      ? 'Sim, Abandonar Duelo'
      : 'Sim, Sair e Perder Progresso';

  const defaultCancelText =
    sessionType === 'duelo'
      ? 'Continuar a Lutar 🛡️'
      : 'Continuar no Simulado 🎯';

  const IconComponent =
    sessionType === 'duelo'
      ? Swords
      : sessionType === 'desafio'
      ? Flame
      : ShieldAlert;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-sm max-h-[90vh] my-auto overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative text-slate-100 scrollbar-thin"
          >
            {/* Top Decorative Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
            
            {/* Close X icon */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              {/* Alert Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse shrink-0">
                <IconComponent size={28} className="stroke-[2.2]" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  {title || defaultTitle}
                </h3>
                <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ⚠️ Confirmação Necessária
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                {description || defaultDescription}
              </p>

              {/* Buttons */}
              <div className="w-full space-y-2 pt-2 shrink-0">
                {/* Cancelar / Manter sessão (Principal) */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{cancelText || defaultCancelText}</span>
                </button>

                {/* Confirmar Saída (Secundário / Destrutivo) */}
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={14} />
                  <span>{confirmText || defaultConfirmText}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
