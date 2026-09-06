import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DuelRoom, DuelPlayer } from '../types';
import { cleanRoomCode } from '../services/duelService';
import { MININT_BRANCHES } from '../data/branches';
import { UserAvatar } from './UserAvatar';
import { 
  ArrowLeft, 
  X, 
  Check, 
  Copy, 
  Link2, 
  MessageCircle, 
  Bot, 
  LogOut, 
  Swords, 
  Loader2 
} from 'lucide-react';

export interface WaitingRoomModalProps {
  isOpen?: boolean;
  showWaitingModal?: boolean;
  setShowWaitingModal?: (show: boolean) => void;
  roomCode: string;
  room?: DuelRoom | null;
  activeRoom?: DuelRoom | null;
  setActiveRoom?: (room: DuelRoom | null) => void;
  setCurrentView?: (view: 'lobby' | 'room' | 'arena' | 'finished') => void;
  profile?: any;
  onCancel?: () => void;
  onMatched?: (room: DuelRoom) => void;
  onConvertToBot?: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isOpen = true,
  showWaitingModal,
  setShowWaitingModal,
  roomCode,
  room,
  activeRoom,
  setActiveRoom,
  setCurrentView,
  profile,
  onCancel,
  onMatched,
  onConvertToBot,
}) => {
  const isVisible = showWaitingModal !== undefined ? showWaitingModal : isOpen;
  const current = activeRoom || room;
  const cleanCode = cleanRoomCode(roomCode || current?.roomCode || current?.id || '');

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isVisible) return null;

  const p1: DuelPlayer = current?.player1 || {
    uid: profile?.uid || 'anon',
    displayName: profile?.displayName || profile?.name || 'Anfitrião',
    branch: profile?.branch || 'PNA',
    avatarId: profile?.avatarId || 'policia',
    province: profile?.province || 'Luanda',
    score: 0,
    answers: {},
  };
  const p1Branch = MININT_BRANCHES[p1.branch || 'PNA'] || MININT_BRANCHES.PNA;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {}
  };

  const inviteUrl = `${window.location.origin}${window.location.pathname}?duelRoom=${cleanCode}`;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {}
  };

  const handleWhatsApp = () => {
    const text = `⚔️ Desafio-te para um Duelo MININT 1v1!\n\nEntra na minha sala de duelo com o código: *${cleanCode}*\nOu entra diretamente pelo link: ${inviteUrl}\n\nPrepara a tua farda e vem combater!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-3xl p-5 space-y-5 shadow-xl"
    >
      {/* Header Status */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Voltar / Fechar Sala"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}
          <span className="relative flex h-3 w-3 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            SALA DE ESPERA 1V1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
            RTDB Sincronizado
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Fechar / Cancelar Sala"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Matchup VS Card Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Player 1 (Host Card) */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 text-center space-y-2 relative shadow-xs">
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
            Anfitrião
          </span>

          <div className="mx-auto flex items-center justify-center">
            <UserAvatar user={p1} size="lg" showBranchBadge={true} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {p1.displayName || 'Anfitrião'}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-300">
                {p1Branch.id}
              </span>
              <span>• 📍 {p1.province || profile?.province || 'Angola'}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check size={12} />
            <span>Pronto na Sala</span>
          </div>
        </div>

        {/* Player 2 Slot (Waiting) */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-3.5 text-center shadow-xs overflow-hidden min-h-[160px] flex flex-col justify-center">
          <div className="space-y-2.5 py-1">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 mx-auto flex items-center justify-center text-slate-400">
              <Loader2 size={22} className="animate-spin text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                A aguardar oponente...
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Partilhe o código ou o link abaixo
              </p>
            </div>

            {onConvertToBot && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onConvertToBot}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Jogar contra um bot de treino agora"
                >
                  <Bot size={13} />
                  <span>Jogar contra IA (Treino Imediato)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Code & Share Controls Box */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3 shadow-lg">
        <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
          <Swords size={13} className="text-amber-500" />
          <span>CÓDIGO DE SESSÃO 1V1</span>
        </p>
        <div className="text-2xl font-mono font-black text-amber-400 tracking-widest bg-slate-950 py-2.5 px-4 rounded-xl border border-amber-500/20 shadow-inner inline-block min-w-[180px]">
          {cleanCode}
        </div>

        {/* Direct Shareable Link Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-left space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1">
              <Link2 size={12} className="text-amber-500" />
              Link Direto de Convite:
            </span>
            <span className="text-emerald-400 text-[9px] font-sans font-black">
              ⚡ Entrada Direta
            </span>
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 truncate focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer uppercase shadow-xs active:scale-95"
            >
              {copiedLink ? <Check size={13} /> : <Link2 size={13} />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={handleCopyCode}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider border border-slate-700"
          >
            {copiedCode ? <Check size={14} className="text-amber-400" /> : <Copy size={14} />}
            <span>{copiedCode ? 'Código Copiado' : 'Copiar Código'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer uppercase tracking-wider border border-emerald-400/30 active:scale-95"
          >
            <MessageCircle size={15} className="fill-white text-emerald-600" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Cancel Room Action */}
      {onCancel && (
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 text-xs font-extrabold transition-all cursor-pointer border border-rose-500/30 flex items-center justify-center gap-2 uppercase shadow-2xs"
          >
            <LogOut size={15} />
            <span>Fechar / Cancelar Duelo</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default WaitingRoomModal;
