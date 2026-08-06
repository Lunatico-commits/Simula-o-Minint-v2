import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Flame, X, ArrowRight, Bell } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NotificationBannerProps {
  notification: {
    id: string;
    title: string;
    body: string;
    roomCode?: string;
    type?: 'duel' | 'daily' | 'general';
  } | null;
  onClose: () => void;
  onAcceptDuel?: (roomCode: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onClose,
  onAcceptDuel,
}) => {
  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-16 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(245,158,11,0.3)] text-slate-100 space-y-2.5 backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              {notification.type === 'duel' ? (
                <Swords size={20} className="animate-bounce" />
              ) : notification.type === 'daily' ? (
                <Flame size={20} className="animate-pulse" />
              ) : (
                <Bell size={20} />
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-tight">
                {notification.title}
              </h4>
              <p className="text-xs text-slate-200 font-medium leading-snug mt-0.5">
                {notification.body}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {notification.type === 'duel' && notification.roomCode && onAcceptDuel && (
          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onAcceptDuel(notification.roomCode!);
                onClose();
              }}
              className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
            >
              <span>Aceitar Duelo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
