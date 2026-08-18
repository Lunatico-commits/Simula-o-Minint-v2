import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ShareFAB: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = (typeof window !== 'undefined' && window.location.href && !window.location.href.includes('run.app'))
      ? window.location.href
      : 'https://simulado-minint.vercel.app';

    const shareData = {
      title: 'Simulados MININT Angola',
      text: 'Estou a treinar para o Concurso do MININT nesta plataforma! Testa os teus conhecimentos e faz simulados gratuitos aqui:',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to copy if not AbortError
        if ((err as Error)?.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      const shareUrl = (typeof window !== 'undefined' && window.location.href && !window.location.href.includes('run.app'))
        ? window.location.href
        : 'https://simulado-minint.vercel.app';
      const shareText = `Estou a treinar para o Concurso do MININT nesta plataforma! Testa os teus conhecimentos e faz simulados gratuitos aqui: ${shareUrl}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl shadow-xl flex items-center gap-1.5 border border-emerald-400"
          >
            <Check size={14} className="stroke-[3]" />
            <span>Link copiado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleShare}
        type="button"
        title="Partilhar Plataforma MININT"
        aria-label="Partilhar Plataforma MININT"
        className="h-12 w-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xl shadow-amber-500/20 border border-amber-300 flex items-center justify-center cursor-pointer transition-colors relative group"
      >
        {copied ? (
          <Check size={22} className="text-slate-950 stroke-[2.5]" />
        ) : (
          <Share2 size={22} className="text-slate-950 stroke-[2.5] group-hover:rotate-12 transition-transform" />
        )}
      </motion.button>
    </div>
  );
};
