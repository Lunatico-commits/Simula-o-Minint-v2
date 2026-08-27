import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Sparkles, AlertTriangle } from 'lucide-react';

interface SystemUpdateBannerProps {
  onOpenCreateAccount: () => void;
}

const STORAGE_KEY = 'minint_system_update_banner_v1_dismissed';

export const SystemUpdateBanner: React.FC<SystemUpdateBannerProps> = ({
  onOpenCreateAccount,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Erro ao salvar preferência do banner:', e);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Aviso de Atualização do Sistema"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 border-b border-amber-600/50 shadow-md relative z-40"
      >
        <div className="max-w-6xl mx-auto px-3.5 py-2.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs font-semibold">
          {/* Message text with alert icon */}
          <div className="flex items-start sm:items-center gap-2 text-left flex-1 min-w-0">
            <span className="text-base sm:text-lg shrink-0 leading-none select-none">
              🚨
            </span>
            <p className="leading-snug text-slate-950 font-bold text-[11px] sm:text-xs">
              <span className="font-black uppercase tracking-wide mr-1">
                Atualização do Sistema:
              </span>
              Adicionamos dezenas de novas questões oficiais do MININT! Se tiver dificuldades ao entrar, por favor crie a sua conta novamente.
            </p>
          </div>

          {/* Actions: CTA button + Dismiss button */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                onOpenCreateAccount();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-extrabold text-[11px] rounded-lg shadow-sm border border-amber-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <UserPlus size={13} className="shrink-0" />
              <span>Criar Conta</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar aviso de atualização"
              className="p-1.5 rounded-lg text-slate-950/80 hover:text-slate-950 hover:bg-black/10 transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
