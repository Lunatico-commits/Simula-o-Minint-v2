import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { MININT_BRANCHES, RANKS_MININT } from '../data/branches';
import { BADGES_LIST } from '../data/badges';
import { MinintShieldLogo } from './Header';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Shield, Download, Share2, Award, CheckCircle2, X, Sparkles, Lock, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreparationCertificateProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PreparationCertificate: React.FC<PreparationCertificateProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const certBranch = profile ? MININT_BRANCHES[profile.branch || 'PNA'] : MININT_BRANCHES.PNA;
  const currentBranch = certBranch;
  const currentRank = RANKS_MININT.slice().reverse().find(r => profile.totalXp >= r.minXp) || RANKS_MININT[0];
  const unlockedSet = new Set(profile.unlockedBadges || []);
  const rarityWeight: Record<string, number> = {
    'LENDÁRIO': 4,
    'ÉPICO': 3,
    'RARO': 2,
    'COMUM': 1,
  };
  const unlockedBadgesList = BADGES_LIST
    .filter(b => unlockedSet.has(b.id))
    .sort((a, b) => {
      const weightA = rarityWeight[a.rarity] || 1;
      const weightB = rarityWeight[b.rarity] || 1;
      if (weightB !== weightA) return weightB - weightA;
      return b.xpReward - a.xpReward;
    });
  const topBadges = unlockedBadgesList.slice(0, 4);
  const remainingBadgesCount = Math.max(0, unlockedBadgesList.length - topBadges.length);

  const formattedDate = new Date().toLocaleDateString('pt-AO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const certId = `MININT-CERT-${(profile.displayName || 'AO').slice(0, 3).toUpperCase()}-${(profile.totalXp + 1000).toString(16).toUpperCase()}`;

  // Calculate stats
  const totalQuestionsAnswered = (profile.correctAnswers || 0) + (profile.incorrectAnswers || 0);
  const accuracy = totalQuestionsAnswered > 0 
    ? Math.round(((profile.correctAnswers || 0) / totalQuestionsAnswered) * 100) 
    : 100;

  // Unlock Criteria: 50.000 XP + 2 Exclusive Badges ('Estudioso de Ouro' & 'Lenda do Concurso') + Accuracy >= 80%
  const hasMinXp = profile.totalXp >= 50000;
  
  const hasEstudiosoOuro = unlockedSet.has('estudioso_ouro') || unlockedSet.has('Estudioso de Ouro');
  const hasLendaConcurso = unlockedSet.has('veterano_minint') || unlockedSet.has('Lenda do Concurso');
  const requiredBadgesCount = (hasEstudiosoOuro ? 1 : 0) + (hasLendaConcurso ? 1 : 0);
  const hasRequiredBadges = requiredBadgesCount >= 2;

  const hasGoodAccuracy = accuracy >= 80;

  const isUnlocked = hasMinXp && hasRequiredBadges && hasGoodAccuracy;

  // Auto-record certificate generation to Firestore 'certificates' collection
  useEffect(() => {
    if (isOpen && isUnlocked && profile) {
      const recordCertificate = async () => {
        try {
          const certDocId = `cert_${profile.uid || profile.displayName || 'candidate'}_${certId}`;
          await setDoc(doc(db, 'certificates', certDocId), {
            certId,
            uid: profile.uid || 'anonymous',
            userName: profile.displayName || 'Candidato',
            province: profile.province || profile.provincia || 'Luanda',
            branch: profile.branch || 'PNA',
            totalXp: profile.totalXp,
            issuedAt: new Date().toISOString(),
            createdAt: serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          console.warn('Erro ao registar certificado no Firestore:', err);
        }
      };
      recordCertificate();
    }
  }, [isOpen, isUnlocked, profile, certId]);

  // Calculate overall preparation percentage
  const xpRatio = Math.min(1, profile.totalXp / 50000);
  const badgeRatio = requiredBadgesCount / 2;
  const accRatio = Math.min(1, accuracy / 80);
  const prepProgress = isUnlocked ? 100 : Math.min(99, Math.round(((xpRatio * 0.4) + (badgeRatio * 0.3) + (accRatio * 0.3)) * 100));

  // Download image (PNG)
  const handleDownloadPng = async () => {
    if (!certRef.current || !isUnlocked) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      const filename = `Certificado_MININT_${(profile.displayName || 'Candidato').replace(/\s+/g, '_')}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setCopiedMessage('Certificado PNG descarregado com sucesso!');
      setTimeout(() => setCopiedMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao gerar certificado:', err);
      setCopiedMessage('Não foi possível gerar a imagem. Tente novamente.');
      setTimeout(() => setCopiedMessage(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF (A4 Landscape)
  const handleDownloadPdf = async () => {
    if (!certRef.current || !isUnlocked) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210);
      const filename = `Certificado_MININT_${(profile.displayName || 'Candidato').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);

      setCopiedMessage('Certificado PDF A4 descarregado com sucesso!');
      setTimeout(() => setCopiedMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setCopiedMessage('Não foi possível gerar o PDF. Tente novamente.');
      setTimeout(() => setCopiedMessage(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share via Web Share API
  const handleShare = async () => {
    if (!certRef.current || !isUnlocked) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `Certificado_MININT_${(profile.displayName || 'Candidato').replace(/\s+/g, '_')}.png`,
        { type: 'image/png' }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Certificado de Conclusão - MININT Angola',
          text: `Concluí com êxito a minha preparação para o Concurso do MININT Angola na plataforma de simulados!`,
          files: [file],
        });
      } else if (navigator.share) {
        const shareUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('run.app'))
          ? window.location.origin
          : 'https://simulado-minint.vercel.app';

        await navigator.share({
          title: 'Certificado de Conclusão - MININT Angola',
          text: `Concluí a minha preparação para o Concurso do MININT! Pratica também na plataforma: ${shareUrl}`,
          url: shareUrl,
        });
      } else {
        handleDownloadPng();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Erro ao partilhar:', err);
        handleDownloadPng();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl my-auto relative flex flex-col items-center"
          >
            {/* Top Actions & Close */}
            <div className="w-full flex items-center justify-between mb-3 pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Award size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase text-amber-400 tracking-tight">
                      Certificado de Conclusão de Preparação
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isUnlocked 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {isUnlocked ? 'Oficial • Desbloqueado' : `Pré-visualização (${prepProgress}%)`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Comprovativo de aproveitamento no programa integral de simulados do MININT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Toast */}
            {copiedMessage && (
              <div className="w-full mb-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} />
                <span>{copiedMessage}</span>
              </div>
            )}

            {/* REQUIREMENTS CHECKLIST / PROGRESS BAR (When locked) */}
            {!isUnlocked && (
              <div className="w-full mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lock size={14} className="text-amber-400" />
                    Requisitos para Desbloqueio Oficial e Descarga:
                  </span>
                  <span className="font-mono text-amber-400">{prepProgress}% Concluído</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className={`p-2 rounded-lg border ${hasMinXp ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold">Pontuação (XP)</div>
                    <div>{profile.totalXp.toLocaleString()} / 50.000 XP {hasMinXp ? '✓' : ''}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${hasRequiredBadges ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold">Insígnias / Badges</div>
                    <div>{requiredBadgesCount} / 2 Badges necessárias {hasRequiredBadges ? '✓' : ''}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${hasGoodAccuracy ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold">Taxa de Acerto</div>
                    <div>{accuracy}% / min. 80% {hasGoodAccuracy ? '✓' : ''}</div>
                  </div>
                </div>
              </div>
            )}

            {/* CERTIFICATE CANVAS DOM (Target for PNG/PDF conversion) */}
            <div className="w-full overflow-x-auto pb-2 flex justify-center">
              <div
                ref={certRef}
                className="w-[880px] min-w-[880px] h-[600px] min-h-[600px] bg-[#07090E] border-4 border-amber-500/70 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between text-slate-100 select-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #111522 0%, #06080D 100%)',
                }}
              >
                {/* Ornate Double Gold Diploma Frame */}
                <div className="absolute inset-2 border-2 border-amber-500/60 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-amber-500/30 rounded-lg pointer-events-none" />

                {/* Corner Filigree Ornaments */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400 rounded-tl-md pointer-events-none flex items-start justify-start p-1">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400 rounded-tr-md pointer-events-none flex items-start justify-end p-1">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400 rounded-bl-md pointer-events-none flex items-end justify-start p-1">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400 rounded-br-md pointer-events-none flex items-end justify-end p-1">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>

                {/* DISCRETE WATERMARK IF LOCKED */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 select-none rotate-[-25deg]">
                    <span className="text-6xl font-black text-amber-500/15 border-8 border-amber-500/15 px-12 py-4 rounded-3xl tracking-[0.2em] font-mono uppercase text-center">
                      PRÉ-VISUALIZAÇÃO<br />
                      <span className="text-3xl tracking-widest opacity-80">NÃO OFICIAL</span>
                    </span>
                  </div>
                )}

                {/* Subtle Watermark Emblem Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                  <Shield size={400} className="text-amber-400" />
                </div>

                {/* HEADER WITH PROMINENT TOP-CENTER LOGO */}
                <div className="relative z-10 text-center space-y-1.5 pt-1">
                  {/* Prominent Official Top Center Logo */}
                  <div className="flex flex-col items-center justify-center mb-1">
                    <div className="relative flex items-center justify-center">
                      {/* Glowing aura around emblem */}
                      <div className="absolute -inset-3 bg-amber-500/25 rounded-full blur-lg pointer-events-none" />
                      
                      {/* Official MININT Shield Logo Component */}
                      <MinintShieldLogo size={62} />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/60" />
                      <span className="text-amber-400 text-xs tracking-widest font-serif">★ ★ ★ ★ ★</span>
                      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/60" />
                    </div>
                  </div>

                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">
                    REPÚBLICA DE ANGOLA • MINISTÉRIO DO INTERIOR
                  </h4>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white font-serif drop-shadow-md">
                    Certificado de Conclusão de Preparação
                  </h2>
                  <p className="text-[10px] text-amber-200/70 uppercase tracking-[0.2em] font-mono">
                    PLATAFORMA INDEPENDENTE DE PREPARAÇÃO E SIMULADOS - CONCURSO MININT
                  </p>
                </div>

                {/* BODY CONTENT */}
                <div className="relative z-10 text-center my-auto space-y-3 px-8">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">
                    Certifica-se para fins de comprovação de desempenho e estudo individual que o(a) candidato(a)
                  </p>

                  {/* CANDIDATE NAME */}
                  <div className="py-1.5 border-b-2 border-amber-500/60 inline-block px-10 max-w-full relative">
                    <h1 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif tracking-wide capitalize drop-shadow-lg">
                      {profile.displayName || 'Candidato MININT'}
                    </h1>
                  </div>

                  {/* OFFICIAL STATEMENT */}
                  <p className="text-xs text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
                    Concluiu com êxito o programa integral de simulados da plataforma, demonstrando elevado aproveitamento e aptidão técnica em todas as disciplinas exigidas para o Concurso Público do Ministério do Interior de Angola.
                  </p>

                  {/* STATS & BRANCH SUMMARY GRID */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-900/90 border border-amber-500/40 rounded-xl p-2.5 max-w-2xl mx-auto text-center shadow-lg">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Ramo MININT</span>
                      <span className="text-xs font-black text-amber-400">{currentBranch.fullName.split(' ')[0]} ({currentBranch.id})</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Patente de Honra</span>
                      <span className="text-xs font-black text-amber-400">{currentRank.title}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Aproveitamento</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">{accuracy}%</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Pontuação Total</span>
                      <span className="text-xs font-black text-amber-400 font-mono">{profile.totalXp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* UNLOCKED BADGES DISPLAY */}
                  {topBadges.length > 0 && (
                    <div className="pt-0.5">
                      <span className="block text-[9px] uppercase tracking-widest text-amber-400/80 mb-1 font-bold">
                        Insígnias & Especialidades Acreditadas:
                      </span>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {topBadges.map(badge => (
                          <div
                            key={badge.id}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1.5 shadow-xs"
                          >
                            <span>{badge.emoji}</span>
                            <span>{badge.title}</span>
                          </div>
                        ))}
                      </div>
                      {remainingBadgesCount > 0 && (
                        <span className="block text-[9px] italic text-amber-300/80 mt-1 font-mono text-center">
                          (+{remainingBadgesCount} {remainingBadgesCount === 1 ? 'outra insígnia de mérito' : 'outras insígnias de mérito'})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* FOOTER & DIGITAL SIGNATURES */}
                <div className="relative z-10 pt-2 border-t border-slate-800 flex items-end justify-between px-6 text-xs">
                  {/* Left Signature: Coordenador */}
                  <div className="text-center space-y-1">
                    <div className="font-serif italic text-amber-300 text-sm tracking-wide font-bold">
                      Coordenação Pedagógica
                    </div>
                    <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent mx-auto" />
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Coordenador de Conteúdos
                    </span>
                  </div>

                  {/* Center Verified Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-500/15 flex items-center justify-center text-amber-400 shadow-xl relative">
                      <Award size={28} />
                      <span className="absolute text-[7px] font-black uppercase tracking-tighter text-amber-300 -bottom-2 bg-slate-950 px-1.5 py-0.5 rounded border border-amber-500/50">
                        {isUnlocked ? 'VERIFICADO' : 'PRÉVIA'}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 mt-2 tracking-wider">{certId}</span>
                  </div>

                  {/* Right Signature: Diretor da Plataforma */}
                  <div className="text-center space-y-1">
                    <div className="font-serif italic text-amber-300 text-sm tracking-wide font-bold">
                      Direção da Plataforma
                    </div>
                    <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent mx-auto" />
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Diretor Geral da Plataforma
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM LOCK WARNING BANNER (When locked) */}
            {!isUnlocked && (
              <div className="w-full mt-2 p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-medium flex items-center justify-center gap-2 text-center">
                <Lock size={16} className="text-amber-400 shrink-0" />
                <span>
                  🔒 Obtém 50.000 XP, 80% de precisão e as 2 Badges ('Estudioso de Ouro' e 'Lenda do Concurso') para desbloquear.
                </span>
              </div>
            )}

            {/* BOTTOM ACTION BUTTONS */}
            <div className="w-full mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
                <Sparkles size={15} className="text-amber-400 shrink-0" />
                <span>
                  {isUnlocked 
                    ? 'Descarregue em PDF (A4) ou PNG e partilhe a sua conquista!' 
                    : 'Modo pré-visualização ativo. Conclua os objetivos para descarregar.'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!isUnlocked || isGenerating}
                  onClick={handleDownloadPdf}
                  title={!isUnlocked ? 'Requer 50.000 XP e 100% de preparação' : 'Descarregar em formato PDF A4'}
                  className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText size={15} />
                  <span>Descarregar PDF (A4)</span>
                </button>

                <button
                  type="button"
                  disabled={!isUnlocked || isGenerating}
                  onClick={handleDownloadPng}
                  title={!isUnlocked ? 'Requer 50.000 XP e 100% de preparação' : 'Descarregar em formato imagem PNG'}
                  className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  <span>Descarregar PNG</span>
                </button>

                <button
                  type="button"
                  disabled={!isUnlocked || isGenerating}
                  onClick={handleShare}
                  title={!isUnlocked ? 'Requer 50.000 XP e 100% de preparação' : 'Partilhar certificado'}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUnlocked ? <Share2 size={15} /> : <Lock size={15} />}
                  <span>Partilhar</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

