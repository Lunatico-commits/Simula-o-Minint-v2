import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { BADGES_LIST, Badge, BadgeCategory, BADGE_RARITY_CONFIG } from '../data/badges';
import { Award, Lock, CheckCircle2, Sparkles, X, Shield, Filter, Zap, Search, Share2, Copy, Trophy, Check } from 'lucide-react';

interface BadgesModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ profile, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailBadge, setSelectedDetailBadge] = useState<Badge | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const unlockedSet = new Set(profile.unlockedBadges || []);
  const dates = profile.unlockedBadgeDates || {};

  const totalBadges = BADGES_LIST.length;
  const unlockedCount = BADGES_LIST.filter(b => unlockedSet.has(b.id)).length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = BADGES_LIST.filter(badge => {
    const matchesCat = selectedCategory === 'todas' || badge.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.rarity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleShareBadge = async (badge: Badge) => {
    const isUnlocked = unlockedSet.has(badge.id);
    const rarityCfg = BADGE_RARITY_CONFIG[badge.rarity];
    const appUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('run.app'))
      ? window.location.origin
      : 'https://simulado-minint.vercel.app';
    
    const statusHeader = isUnlocked ? '🎖️ CONQUISTA DESBLOQUEADA!' : '🎯 EM PROGRESSO NO CONCURSO MININT';
    const shareText = `${statusHeader}\n\n*${badge.title}* [Insígnia ${rarityCfg.label}]\n📜 "${badge.description}"\n🏆 Recompensa: +${badge.xpReward} XP\n\nPrepara-te para o Concurso Público do MININT Angola:\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Conquista MININT: ${badge.title}`,
          text: shareText,
          url: appUrl
        });
        showToast('Conquista partilhada com sucesso! 📲');
        return;
      } catch (err) {
        // Fallback to clipboard if share cancelled/unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Texto de conquista copiado! Pode colar no WhatsApp 📲');
    } catch (err) {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      showToast('A abrir WhatsApp para partilhar... 📲');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.12, 1], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', type: 'tween' }}
              className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Award size={26} />
            </motion.div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span>Galeria de Badges & Conquistas</span>
                <span className="text-xs bg-amber-500/20 text-amber-500 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  {unlockedCount}/{totalBadges}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Toque em qualquer insígnia para ver detalhes e partilhar a sua conquista!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Progress Overview Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Progresso de Conquistas</span>
            </span>
            <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
              {progressPercent}% Completo
            </span>
          </div>
          
          <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar ex: Ouro, Lendário, Duelo, Legislação..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'estudo', label: 'Estudos' },
              { id: 'duelo', label: 'Duelos' },
              { id: 'oficial', label: 'Consistência' },
              { id: 'especial', label: 'Especial' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid Scrollable */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3 no-scrollbar min-h-[220px]">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              Nenhuma badge encontrada com o filtro selecionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map((badge) => {
                const isUnlocked = unlockedSet.has(badge.id);
                const unlockDate = dates[badge.id];
                const progress = badge.getProgress(profile);
                const pct = Math.round((progress.current / progress.max) * 100);
                const rarityCfg = BADGE_RARITY_CONFIG[badge.rarity];

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => setSelectedDetailBadge(badge)}
                    className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                      isUnlocked
                        ? `bg-gradient-to-br from-slate-900/40 via-slate-50 to-amber-500/5 dark:from-[#0F1115] dark:via-[#13161C] dark:to-[#181B22] ${rarityCfg.cardBorderUnlocked}`
                        : 'bg-slate-50/70 dark:bg-[#0F1115]/60 border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Top Row: Icon + Title + Status + Rarity */}
                    <div className="flex items-start gap-3 mb-2">
                      <motion.div
                        animate={isUnlocked ? { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", type: "tween" }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${
                          isUnlocked 
                            ? `bg-gradient-to-br ${badge.gradient} border-amber-400 text-white ${rarityCfg.glowClass}` 
                            : 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 grayscale opacity-60'
                        }`}
                      >
                        {badge.emoji}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className={`text-xs font-black truncate ${isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                            {badge.title}
                          </h3>

                          {/* Rarity Pill */}
                          <span className={`text-[8px] uppercase tracking-wider font-mono font-black px-1.5 py-0.5 rounded border shrink-0 ${rarityCfg.badgeBg} ${rarityCfg.badgeBorder} ${rarityCfg.badgeText}`}>
                            {badge.rarity}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-tight">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Progress or Date Banner */}
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5">
                      {isUnlocked ? (
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-400">
                          <span className="flex items-center gap-1 font-bold">
                            <Zap size={11} />
                            <span>+{badge.xpReward} XP Conquistados</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase font-mono">
                            <CheckCircle2 size={10} />
                            <span>OK</span>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-500">
                            <span>Progresso: {progress.current}/{progress.max} {progress.unit}</span>
                            <span className="font-bold">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
          <span>Clique em qualquer insígnia para ver detalhes e partilhar no WhatsApp!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-slate-100 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Badge Detail & Sharing Modal */}
      <AnimatePresence>
        {selectedDetailBadge && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-slate-900 dark:text-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailBadge(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Rarity & Header Badge Display */}
              {(() => {
                const badge = selectedDetailBadge;
                const isUnlocked = unlockedSet.has(badge.id);
                const rarityCfg = BADGE_RARITY_CONFIG[badge.rarity];
                const unlockDate = dates[badge.id];
                const progress = badge.getProgress(profile);
                const pct = Math.round((progress.current / progress.max) * 100);

                return (
                  <>
                    <div className="text-center pt-2 space-y-3">
                      {/* Enriched Badge Emoji Circle */}
                      <motion.div
                        animate={isUnlocked ? { scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl border-2 shadow-2xl relative ${
                          isUnlocked
                            ? `bg-gradient-to-br ${badge.gradient} border-amber-400 text-white ${rarityCfg.glowClass}`
                            : 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 grayscale opacity-60'
                        }`}
                      >
                        {badge.emoji}
                        
                        {/* Status Icon Indicator overlay */}
                        <div className="absolute -bottom-2 -right-2">
                          {isUnlocked ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0F1115]">
                              <CheckCircle2 size={18} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0F1115]">
                              <Lock size={16} />
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Badge Title & Rarity Label */}
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className={`text-[10px] font-black font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${rarityCfg.badgeBg} ${rarityCfg.badgeBorder} ${rarityCfg.badgeText}`}>
                            Raridade {rarityCfg.label}
                          </span>
                          <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
                            {badge.categoryLabel}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                          {badge.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                        "{badge.description}"
                      </p>
                    </div>

                    {/* Completion Status & Progress details */}
                    <div className="bg-slate-100 dark:bg-[#151820] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                          Estado da Conquista
                        </span>
                        {isUnlocked ? (
                          <span className="font-black text-emerald-500 flex items-center gap-1 font-mono">
                            <CheckCircle2 size={14} />
                            <span>CONQUISTADA</span>
                          </span>
                        ) : (
                          <span className="font-black text-slate-400 flex items-center gap-1 font-mono">
                            <Lock size={14} />
                            <span>BLOQUEADA ({pct}%)</span>
                          </span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-white/10 text-xs font-mono">
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <Zap size={14} />
                            <span>+{badge.xpReward} XP Recompensa</span>
                          </span>
                          {unlockDate && (
                            <span className="text-slate-400">
                              Data: {unlockDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-white/10">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                            <span>Progresso atual</span>
                            <span className="font-bold text-slate-300">{progress.current} / {progress.max} {progress.unit}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleShareBadge(badge)}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Share2 size={16} />
                        <span>Partilhar Conquista</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailBadge(null)}
                        className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-70 px-4 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/50 text-amber-300 font-bold text-xs shadow-2xl flex items-center gap-2 shadow-amber-500/20"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

