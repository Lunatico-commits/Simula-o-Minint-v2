import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { UserProfile, MININTBranch } from '../types';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { getAvatarImagePath, getUserGender } from '../data/avatars';
import { TacticalAvatarIllustration } from './TacticalAvatarIllustration';
import { generateMemeCaption, generateDynamicMemeText, MemeDataResponse } from '../services/apiService';
import { 
  Sparkles, Share2, Download, RefreshCw, X, Shield, Award, 
  CheckCircle, Copy, Zap, Flame, MessageSquare
} from 'lucide-react';

interface MemeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  score: number;
  totalQuestions: number;
  pct: number;
  timeSeconds?: number;
  categoryName?: string;
}

export const MemeGeneratorModal: React.FC<MemeGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  score,
  totalQuestions,
  pct,
  timeSeconds,
  categoryName,
}) => {
  const [memeData, setMemeData] = useState<MemeDataResponse | null>(null);
  const [lastMemeIndex, setLastMemeIndex] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Normalize score/total/percentage to ensure valid bounds
  const safeTotal = Math.max(1, totalQuestions || 5);
  const safeScore = Math.min(Math.max(0, score), safeTotal);
  const safePct = Math.min(100, Math.max(0, Math.round((safeScore / safeTotal) * 100)));

  // Get branch info correctly using profile.branch or profile.selectedBranch fallback
  const userBranch: MININTBranch = profile.branch || (profile as any).selectedBranch || 'PNA';
  const branchObj = MININT_BRANCHES[userBranch] || MININT_BRANCHES.PNA;
  const avatarObj = getAvatarOption(profile.avatarId, userBranch, profile.displayName, profile.gender);

  // Load meme caption instantly on open
  useEffect(() => {
    if (isOpen) {
      const instantMeme = generateDynamicMemeText({
        score: safeScore,
        totalQuestions: safeTotal,
        pct: safePct,
        timeSeconds,
        categoryName: categoryName || 'Simulado Geral',
        branch: userBranch,
        rankTitle: profile.rankTitle,
        displayName: profile.displayName,
      });
      setMemeData(instantMeme);
      if (instantMeme.templateIndex !== undefined) {
        setLastMemeIndex(instantMeme.templateIndex);
      }
      setIsLoading(false);
    }
  }, [isOpen, safeScore, safeTotal, safePct, timeSeconds, categoryName, userBranch, profile.rankTitle, profile.displayName]);

  const loadNewMeme = () => {
    const localInstantMeme = generateDynamicMemeText({
      score: safeScore,
      totalQuestions: safeTotal,
      pct: safePct,
      timeSeconds,
      categoryName: categoryName || 'Simulado Geral',
      branch: userBranch,
      rankTitle: profile.rankTitle,
      displayName: profile.displayName,
      lastIndex: lastMemeIndex,
    });
    setMemeData(localInstantMeme);
    if (localInstantMeme.templateIndex !== undefined) {
      setLastMemeIndex(localInstantMeme.templateIndex);
    }
    setIsLoading(false);
  };

  const getWhatsAppShareText = () => {
    if (!memeData) return '';
    const headline = memeData.headline;
    const caption = memeData.caption;
    const punchline = memeData.punchline;

    const appUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('run.app'))
      ? window.location.origin
      : 'https://simulado-minint.vercel.app';

    return `*Meme do Concurso MININT Angola 🇦🇴*\n\n` +
      `*${headline}*\n` +
      `"${caption}"\n\n` +
      `📊 *Aproveitamento:* ${safePct}% (${safeScore}/${safeTotal} acertos)\n` +
      `👮 *Candidato:* ${profile.displayName} (${branchObj.name})\n` +
      `🏷️ ${punchline}\n\n` +
      `📲 Prepara-te também para o Concurso do MININT:\n` +
      `${appUrl}`;
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppShareText();
    // Copy text first
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }).catch(() => {});

    // Open WhatsApp
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = getWhatsAppShareText();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  const handleDownloadCanvas = async () => {
    if (!cardRef.current || !memeData) return;
    setIsDownloading(true);

    try {
      // Primary export: Use html-to-image to capture the exact rendered card DOM
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#020617',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `meme_minint_angola_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Fallback para renderização via Canvas 2D manual:', e);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1200;
        canvas.height = 1200;

        // Dark background gradient
        const grad = ctx.createLinearGradient(0, 0, 1200, 1200);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0F172A');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 1200);

        // Gold Outer Border
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 12;
        ctx.strokeRect(30, 30, 1140, 1140);

        // Inner Card Frame
        ctx.fillStyle = '#0F172A';
        ctx.roundRect(60, 60, 1080, 1080, 32);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Top Header Badge
        ctx.fillStyle = '#F59E0B';
        ctx.roundRect(300, 90, 600, 60, 16);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CONCURSO PÚBLICO MININT ANGOLA 🇦🇴', 600, 130);

        // Branch & Profile Badge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.roundRect(100, 180, 1000, 140, 24);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '900 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${profile.displayName.toUpperCase()} • ${profile.rankTitle}`, 600, 235);

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`Serviço: ${branchObj.name} (${branchObj.id})`, 600, 280);

        // Meme Headline
        ctx.fillStyle = '#F43F5E';
        ctx.font = '900 44px sans-serif';
        ctx.fillText(memeData.headline, 600, 390);

        // Meme Caption Box
        ctx.fillStyle = '#020617';
        ctx.roundRect(120, 440, 960, 340, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw wrapped caption text
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';

        const words = memeData.caption.split(' ');
        let line = '';
        let y = 530;
        const maxWidth = 880;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 600, y);
            line = words[i] + ' ';
            y += 48;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 600, y);

        // Score Pill
        ctx.fillStyle = '#064E3B';
        ctx.roundRect(250, 810, 700, 70, 35);
        ctx.fill();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ECFDF5';
        ctx.font = '900 30px sans-serif';
        ctx.fillText(`Aproveitamento: ${safePct}% (${safeScore}/${safeTotal} Acertos)`, 600, 855);

        // Punchline & Hashtag
        ctx.fillStyle = '#F59E0B';
        ctx.font = '900 32px sans-serif';
        ctx.fillText(memeData.punchline, 600, 945);

        // Footer App Watermark
        ctx.fillStyle = '#64748B';
        ctx.font = '22px sans-serif';
        ctx.fillText('Gerado no App Preparação Concurso MININT 2026 • #MININT2026', 600, 1080);

        // Convert to image and trigger download
        const imageURI = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `meme_minint_angola_${Date.now()}.png`;
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackErr) {
        console.error('Erro ao gerar imagem no canvas fallback:', fallbackErr);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100 tracking-tight">
                  Gerador de Memes de Concurso
                </h3>
                <p className="text-[10px] text-amber-400 font-mono font-bold">
                  Humor de Estudo MININT Angola 🇦🇴
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* MEME CARD DISPLAY (HTML / STYLED FRAME) */}
          <div
            ref={cardRef}
            className="relative bg-slate-950 text-slate-100 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 overflow-hidden"
            style={{ backgroundColor: '#020617', color: '#F8FAFC' }}
          >
            {/* Corner Decorative Badges */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <Shield size={11} className="text-amber-400" />
                <span>MININT 2026</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                {safePct}% Aproveitamento
              </span>
            </div>

            {/* Candidate Identity Strip */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                <TacticalAvatarIllustration
                  id={profile.equippedUniform || profile.avatarId}
                  branch={userBranch}
                  gender={profile.gender || getUserGender(profile.avatarId)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-100 truncate">
                  {profile.displayName}
                </p>
                <p className="text-[10px] text-amber-400 font-bold truncate">
                  {profile.rankTitle} • {branchObj.id}
                </p>
              </div>
              <div className="text-right font-mono shrink-0">
                <span className="text-xs font-black text-amber-400">{safeScore}/{safeTotal}</span>
                <span className="text-[9px] text-slate-400 block">Acertos</span>
              </div>
            </div>

            {/* Meme Content Area */}
            <div className="min-h-[120px] flex flex-col justify-center items-center text-center p-3 bg-slate-900/90 border border-rose-500/30 rounded-xl space-y-2 relative">
              {(() => {
                const activeMeme = memeData || generateDynamicMemeText({
                  score: safeScore,
                  totalQuestions: safeTotal,
                  pct: safePct,
                  timeSeconds,
                  categoryName: categoryName || 'Simulado Geral',
                  branch: userBranch,
                  rankTitle: profile.rankTitle,
                  displayName: profile.displayName,
                });
                return (
                  <>
                    <h4 className="text-sm sm:text-base font-black text-rose-400 uppercase tracking-tight flex items-center justify-center gap-1.5">
                      <span>{activeMeme.headline}</span>
                    </h4>

                    <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed italic px-2">
                      "{activeMeme.caption}"
                    </p>

                    <p className="text-[10px] font-mono font-black text-amber-400 tracking-wider">
                      {activeMeme.punchline}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Watermark Footer */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono border-t border-white/10 pt-2">
              <span>Preparação Concurso MININT</span>
              <span>#MININT2026</span>
            </div>
          </div>

          {/* Copied Toast Alert */}
          {copiedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} />
              <span>Texto do meme copiado para a área de transferência!</span>
            </motion.div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-4 space-y-2">
            {/* Primary Action: WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Share2 size={16} />
              <span>Partilhar no WhatsApp (#MININT2026)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Generate New Punchline / Refresh */}
              <button
                type="button"
                disabled={isLoading}
                onClick={loadNewMeme}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>Gerar Outra Frase</span>
              </button>

              {/* Download Image Card */}
              <button
                type="button"
                disabled={isDownloading || isLoading}
                onClick={handleDownloadCanvas}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Download size={14} />
                <span>{isDownloading ? 'Baixando...' : 'Baixar Imagem'}</span>
              </button>
            </div>

            {/* Copy raw text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>Copiar apenas legenda e link</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
