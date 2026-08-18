import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MININTBranch, AcademicLevel, ACADEMIC_LEVELS, AvatarAccessories } from '../types';
import { MININT_BRANCHES, PROVINCES_ANGOLA, AVATAR_OPTIONS, BASIC_FREE_AVATARS, RANKS_MININT, getAvatarOption, getCandidateInitials } from '../data/branches';
import { BADGES_LIST } from '../data/badges';
import { 
  ACCESSORY_FRAMES, 
  ACCESSORY_BACKGROUNDS, 
  ACCESSORY_BADGES, 
  AccessoryItem, 
  AccessoryCategory, 
  getAccessoryItem 
} from '../data/avatarAccessories';
import { SHOP_ITEMS } from '../data/shopItems';
import { generateReferralCode } from '../utils/referral';
import { calculateCurrentStreak } from '../utils/streak';
import { getSoundEnabled, setSoundEnabled, playClickSound, playCorrectSound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { 
  Shield, 
  Check, 
  X, 
  Award, 
  MapPin, 
  Zap, 
  UserCheck, 
  Flame, 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  GraduationCap, 
  Coffee, 
  Star, 
  Volume2, 
  VolumeX, 
  BarChart3, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  LogOut, 
  Coins, 
  Lock, 
  ShoppingBag, 
  Sliders, 
  User,
  Palette,
  CheckCircle2,
  Undo2,
  Layers,
  Glasses
} from 'lucide-react';
import { AccuracyDashboard } from './AccuracyDashboard';
import { CircularXpProgressRing } from './CircularXpProgressRing';
import { BranchIllustration } from './BranchIllustration';
import { ReactiveAvatar, AvatarReactionType } from './ReactiveAvatar';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onOpenSupportModal?: () => void;
  onOpenBadgesModal?: () => void;
  onOpenAudioModal?: () => void;
  onOpenCertificateModal?: () => void;
  onOpenWelcomeTour?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
  onLogout,
  onNavigateTab,
  onOpenAuthModal,
  onOpenSupportModal,
  onOpenBadgesModal,
  onOpenAudioModal,
  onOpenCertificateModal,
  onOpenWelcomeTour,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'customizer' | 'settings'>('stats');
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [branch, setBranch] = useState<MININTBranch>(profile.branch || 'PNA');
  const [province, setProvince] = useState(profile.province || 'Luanda');
  const [avatarId, setAvatarId] = useState(profile.avatarId || 'pna_1');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(profile.academicLevel || 'high_school');
  const [copied, setCopied] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => getSoundEnabled());
  const [avatarReaction, setAvatarReaction] = useState<AvatarReactionType>('idle');

  // Avatar Accessories state
  const [accessories, setAccessories] = useState<AvatarAccessories>(
    profile.avatarAccessories || { frame: 'frame_none', background: 'bg_default', badge: 'badge_none' }
  );
  const [customizerCategory, setCustomizerCategory] = useState<AccessoryCategory>('frames');
  const [customizerFeedback, setCustomizerFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setDisplayName(profile.displayName || '');
    setBranch(profile.branch || 'PNA');
    setProvince(profile.province || 'Luanda');
    setAvatarId(profile.avatarId || 'pna_1');
    setAcademicLevel(profile.academicLevel || 'high_school');
    setAccessories(
      profile.avatarAccessories || { frame: 'frame_none', background: 'bg_default', badge: 'badge_none' }
    );
  }, [profile.displayName, profile.branch, profile.province, profile.avatarId, profile.academicLevel, profile.avatarAccessories]);

  const handleUpdateBranch = (newBranch: MININTBranch) => {
    setBranch(newBranch);
    const defaultAvatar = AVATAR_OPTIONS.find(a => a.branch === newBranch);
    const newAvatarId = defaultAvatar ? defaultAvatar.id : avatarId;
    if (defaultAvatar) {
      setAvatarId(newAvatarId);
    }
    onSaveProfile({
      branch: newBranch,
      avatarId: newAvatarId,
    });
  };

  const handleToggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playClickSound();
    }
  };

  if (!isOpen) return null;

  const currentBranch = MININT_BRANCHES[branch];
  const currentRank = RANKS_MININT.slice().reverse().find(r => profile.totalXp >= r.minXp) || RANKS_MININT[0];
  const selectedAvatar = getAvatarOption(avatarId, branch, displayName);
  const userReferralCode = profile.referralCode || generateReferralCode(profile.displayName || 'CANDIDATO');

  // Equipped Uniform Name from Shop Items or Branch Defaults
  const equippedShopItem = SHOP_ITEMS.find((item) => item.id === avatarId);
  const currentUniformName = equippedShopItem?.name || selectedAvatar.label || `Farda Oficial ${branch}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const appUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('run.app'))
      ? window.location.origin
      : 'https://simulado-minint.vercel.app';

    const text = encodeURIComponent(
      `Olá! Estou a preparar-me para o Concurso Público do MININT Angola no aplicativo Simulados MININT.\n\n` +
      `Utiliza o meu Código de Indicação: *${userReferralCode}* ao te registares no aplicativo para ganhares bónus e juntos subirmos de patente!\n\n` +
      `Acede agora: ${appUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      displayName: displayName.trim() || 'Candidato MININT',
      branch,
      province,
      avatarId,
      avatarAccessories: accessories,
      academicLevel,
      rankTitle: currentRank.title,
      referralCode: userReferralCode,
    });
    onClose();
  };

  // Accessory Selection & Purchase Logic
  const handleSelectAccessory = (item: AccessoryItem) => {
    playClickSound();
    const currentPurchased = profile.purchasedItems || [];
    const isUnlocked = item.cost === 0 || item.isDefault || currentPurchased.includes(item.id);
    const categoryKey: 'frame' | 'background' | 'badge' =
      item.category === 'frames' ? 'frame' : item.category === 'backgrounds' ? 'background' : 'badge';

    if (isUnlocked) {
      // Equip immediately
      const updatedAccessories: AvatarAccessories = {
        ...accessories,
        [categoryKey]: item.id,
        [item.category]: item.id,
      };
      setAccessories(updatedAccessories);
      onSaveProfile({
        avatarAccessories: updatedAccessories,
        equippedFrame: updatedAccessories.frame,
        equippedBackground: updatedAccessories.background,
      });
      setCustomizerFeedback({
        text: `Equipado: ${item.name} ✨`,
        type: 'success',
      });
      setTimeout(() => setCustomizerFeedback(null), 2500);
      return;
    }

    // Locked Item -> Check userCoins
    const userCoins = profile.minintCoins || 0;
    if (userCoins < item.cost) {
      setCustomizerFeedback({
        text: `Créditos insuficientes! Precisa de mais ${item.cost - userCoins} Moedas. Cumpra missões diárias ou simulados para ganhar mais.`,
        type: 'error',
      });
      setTimeout(() => setCustomizerFeedback(null), 3500);
      return;
    }

    // Deduct coins & unlock & equip
    const newCoins = userCoins - item.cost;
    const newPurchased = [...currentPurchased, item.id];
    const updatedAccessories: AvatarAccessories = {
      ...accessories,
      [categoryKey]: item.id,
      [item.category]: item.id,
    };

    setAccessories(updatedAccessories);
    onSaveProfile({
      minintCoins: newCoins,
      purchasedItems: newPurchased,
      avatarAccessories: updatedAccessories,
      equippedFrame: updatedAccessories.frame,
      equippedBackground: updatedAccessories.background,
    });

    fireConfetti();
    playCorrectSound();
    setCustomizerFeedback({
      text: `"${item.name}" desbloqueado e equipado com sucesso! (-${item.cost} Moedas) 🎖️`,
      type: 'success',
    });
    setTimeout(() => setCustomizerFeedback(null), 3500);
  };

  // Reset accessories to default
  const handleResetAccessories = () => {
    playClickSound();
    const defaultAccs: AvatarAccessories = {
      frame: 'frame_none',
      background: 'bg_default',
      badge: 'badge_none',
      frames: 'frame_none',
      backgrounds: 'bg_default',
      badges: 'badge_none',
    };
    setAccessories(defaultAccs);
    onSaveProfile({
      avatarAccessories: defaultAccs,
      equippedFrame: 'frame_none',
      equippedBackground: 'bg_default',
    });
    setCustomizerFeedback({
      text: 'Acessórios redefinidos para a farda base original!',
      type: 'success',
    });
    setTimeout(() => setCustomizerFeedback(null), 2500);
  };

  // List of accessories for current category
  const getCurrentCategoryItems = (): AccessoryItem[] => {
    switch (customizerCategory) {
      case 'frames':
        return ACCESSORY_FRAMES;
      case 'backgrounds':
        return ACCESSORY_BACKGROUNDS;
      case 'badges':
        return ACCESSORY_BADGES;
      default:
        return ACCESSORY_FRAMES;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-4 sm:p-5 text-slate-900 dark:text-slate-100 shadow-2xl my-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="text-center mb-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', type: 'tween' }}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Shield size={20} />
          </motion.div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Perfil do Candidato</h2>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">Acompanhe o seu progresso e personalize as suas definições</p>
        </div>

        {/* Highlighted Top Avatar Preview with Accessories & Reaction Test */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-50 to-amber-500/5 dark:from-amber-500/15 dark:via-[#0F1115] dark:to-[#16181D] border border-amber-500/30 rounded-2xl p-3 mb-3.5 flex flex-col items-center justify-center text-center shadow-md relative overflow-visible">
          <div className="relative mb-1 flex flex-col items-center justify-center pt-8">
            <ReactiveAvatar
              avatarId={avatarId}
              branch={branch}
              displayName={displayName}
              photoURL={profile.photoURL}
              accessories={accessories}
              size="xl"
              reaction={avatarReaction}
              showBranchBadge={false}
              showLevelBadge={false}
              level={profile.level || 1}
              isVipSupporter={profile.isVipSupporter}
              interactive={true}
              onReactionComplete={() => setAvatarReaction('idle')}
            />

            {/* Badges alinhados lado a lado sob o avatar sem sobreposição */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-500/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs font-mono">
                <Zap size={11} className="text-amber-400 fill-amber-400" />
                <span>Lv {profile.level || 1}</span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 border border-amber-600/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs font-mono">
                <BranchIllustration branch={branch} size={13} />
                <span>{branch}</span>
              </div>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5 justify-center flex-wrap mt-0.5">
            <span>{displayName.trim() || 'Candidato MININT'}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              <span>{currentRank.title}</span>
            </span>
          </h3>

          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
            <span>{currentUniformName}</span>
            <span className="text-slate-400">•</span>
            <span>{province}</span>
          </p>

          {/* Compact Reaction Buttons + Shop Link */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10 w-full flex items-center justify-between gap-2">
            {/* Discrete Reaction Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-0.5 hidden xs:inline">Reagir:</span>
              <button
                type="button"
                onClick={() => setAvatarReaction('celebrate')}
                title="Testar Celebração"
                className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles size={10} className="text-amber-500" />
                <span>Festear</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarReaction('levelUp')}
                title="Testar Subida de Nível"
                className="px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[9px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Zap size={10} className="text-purple-400 fill-purple-400" />
                <span>Nível</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarReaction('victory')}
                title="Testar Vitória em Duelo"
                className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Award size={10} className="text-emerald-500" />
                <span>Vitória</span>
              </button>
            </div>

            {/* Shop Redirect Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('shop');
              }}
              title="Personalizar & Comprar Fardas Oficiais na Loja"
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ShoppingBag size={11} />
              <span>Loja de Fardas</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls (3 Tabs: Estatísticas, Personalizar Perfil, Definições) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#0F1115] p-1 rounded-xl mb-4 border border-slate-200 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('stats');
            }}
            className={`py-2 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <BarChart3 size={13} />
            <span className="truncate">Estatísticas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('customizer');
            }}
            className={`py-2 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'customizer'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <Palette size={13} />
            <span className="truncate">Personalizar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('settings');
            }}
            className={`py-2 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <Sliders size={13} />
            <span className="truncate">Definições</span>
          </button>
        </div>

        {/* TAB 1: ESTATÍSTICAS E PROGRESSO */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            {/* XP Circular Progress Level Card */}
            <div>
              <CircularXpProgressRing
                totalXp={profile.totalXp}
                currentRank={currentRank}
                rankIndex={RANKS_MININT.findIndex(r => r.title === currentRank.title)}
                totalRanks={RANKS_MININT.length}
                allRanks={RANKS_MININT}
              />
            </div>

            {/* Quick Stats Grid */}
            {(() => {
              const streakInfo = calculateCurrentStreak(profile);
              return (
                <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 dark:bg-[#0F1115] rounded-xl border border-slate-200 dark:border-white/5 text-center">
                  <div>
                    <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs font-mono font-bold gap-0.5">
                      <Coins size={12} className="fill-yellow-400/80" />
                      <span>{profile.minintCoins || 0}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-mono">Créditos</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-mono font-bold gap-0.5">
                      <Flame size={12} className={streakInfo.streak > 0 ? "fill-orange-500 text-orange-500 animate-pulse" : "text-slate-400"} />
                      <span>{streakInfo.streak}d</span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-mono">Ofensiva</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold gap-0.5">
                      <Award size={12} />
                      <span>{profile.duelsWon}/{profile.duelsPlayed}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-mono">Vitórias</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold gap-0.5">
                      <span>{currentRank.badge}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5 truncate uppercase tracking-wider font-mono">{currentRank.title}</p>
                  </div>
                </div>
              );
            })()}

            {/* Badges & Achievements Preview Card */}
            {(() => {
              const unlockedSet = new Set(profile.unlockedBadges || []);
              const unlockedCount = unlockedSet.size;
              const totalCount = BADGES_LIST.length;
              const rarityWeight: Record<string, number> = {
                'LENDÁRIO': 4,
                'ÉPICO': 3,
                'RARO': 2,
                'COMUM': 1,
              };
              const displayBadges = BADGES_LIST
                .filter(b => unlockedSet.has(b.id))
                .sort((a, b) => {
                  const wA = rarityWeight[a.rarity] || 1;
                  const wB = rarityWeight[b.rarity] || 1;
                  if (wB !== wA) return wB - wA;
                  return b.xpReward - a.xpReward;
                })
                .slice(0, 4);

              return (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenBadgesModal) onOpenBadgesModal();
                  }}
                  className="w-full text-left bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:to-[#0F1115] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-3 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', type: 'tween' }}
                        className="text-amber-500 flex items-center justify-center"
                      >
                        <Award size={16} />
                      </motion.div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                        Conquistas & Badges
                      </span>
                      <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                        {unlockedCount}/{totalCount}
                      </span>
                    </div>

                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Ver todas</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>

                  {unlockedCount === 0 ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Responda a simulados e vença duelos para desbloquear as suas primeiras insígnias!
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                      {displayBadges.map((badge) => (
                        <motion.div
                          key={badge.id}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.08, y: -2 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0 shadow-xs"
                        >
                          <motion.span
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', type: 'tween' }}
                          >
                            {badge.emoji}
                          </motion.span>
                          <span className="text-[11px]">{badge.title}</span>
                        </motion.div>
                      ))}
                      {unlockedCount > 4 && (
                        <span className="text-[10px] font-mono font-bold text-amber-500">
                          +{unlockedCount - 4} mais
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })()}

            {/* Recharts Performance & Evolution Dashboard */}
            <div>
              <AccuracyDashboard profile={profile} />
            </div>

            {/* CERTIFICADO DE PREPARAÇÃO CARD */}
            {(() => {
              const unlockedSet = new Set(profile.unlockedBadges || []);
              const hasEstudiosoOuro = unlockedSet.has('estudioso_ouro') || unlockedSet.has('Estudioso de Ouro');
              const hasLendaConcurso = unlockedSet.has('veterano_minint') || unlockedSet.has('Lenda do Concurso');
              const requiredBadgesCount = (hasEstudiosoOuro ? 1 : 0) + (hasLendaConcurso ? 1 : 0);

              const totalQuestionsAnswered = (profile.correctAnswersCount || 0) + (profile.totalQuestionsAnswered || 0);
              const accuracy = totalQuestionsAnswered > 0 
                ? Math.round(((profile.correctAnswersCount || 0) / totalQuestionsAnswered) * 100) 
                : 100;

              const xpRatio = Math.min(1, (profile.totalXp || 0) / 50000);
              const badgeRatio = requiredBadgesCount / 2;
              const accRatio = Math.min(1, accuracy / 80);

              const isEligible = (profile.totalXp || 0) >= 50000 && requiredBadgesCount >= 2 && accuracy >= 80;
              const prepProgress = isEligible ? 100 : Math.min(99, Math.round(((xpRatio * 0.4) + (badgeRatio * 0.3) + (accRatio * 0.3)) * 100));

              return (
                <div className={`w-full rounded-2xl p-3.5 border transition-all shadow-md relative overflow-hidden ${
                  isEligible 
                    ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-600/10 border-amber-500/60' 
                    : 'bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        isEligible ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                      }`}>
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Certificado de Preparação MININT</span>
                          {isEligible && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                              DISPONÍVEL
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Comprovativo digital de aptidão e preparação intensiva
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 my-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Requisitos Concluídos</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{prepProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEligible ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${prepProgress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      if (onOpenCertificateModal) {
                        onOpenCertificateModal();
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isEligible
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>{isEligible ? 'GERAR CERTIFICADO OFICIAL 🎓' : 'VER / GERAR CERTIFICADO 🎓'}</span>
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* TAB 2: PERSONALIZAR PERFIL (EDITOR DE ACESSÓRIOS & COSMÉTICOS) */}
        {activeTab === 'customizer' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            {/* Header & Notice: Complementary to Official Shop */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:to-[#0F1115] border border-amber-500/30 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Palette size={15} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    Editor de Acessórios
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-yellow-600 dark:text-yellow-400 text-xs font-mono font-black">
                  <Coins size={12} className="fill-yellow-400/80" />
                  <span>{profile.minintCoins || 0} Moedas</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Personalize molduras, fundos e distintivos sobre a sua farda actual. As fardas completas são obtidas exclusivamente na{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateTab) onNavigateTab('shop');
                  }}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Loja Oficial</span>
                  <ShoppingBag size={10} />
                </button>.
              </p>
            </div>

            {/* Customizer Feedback Toast */}
            <AnimatePresence>
              {customizerFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-sm ${
                    customizerFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {customizerFeedback.type === 'success' ? (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  ) : (
                    <Lock size={15} className="shrink-0 text-rose-500" />
                  )}
                  <span className="text-[11px] leading-tight">{customizerFeedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Selector Sub-Tabs: 3 Guaranteed Composition Categories */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#0F1115] rounded-xl border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCustomizerCategory('frames');
                }}
                className={`py-2 px-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  customizerCategory === 'frames'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>🖼️</span>
                <span className="truncate">Molduras</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCustomizerCategory('backgrounds');
                }}
                className={`py-2 px-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  customizerCategory === 'backgrounds'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>🎨</span>
                <span className="truncate">Fundos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCustomizerCategory('badges');
                }}
                className={`py-2 px-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  customizerCategory === 'badges'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>🎖️</span>
                <span className="truncate">Pins & Selos</span>
              </button>
            </div>

            {/* Accessories Grid List */}
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {getCurrentCategoryItems().map((item) => {
                const purchasedList = profile.purchasedItems || [];
                const isOwned = item.cost === 0 || item.isDefault || purchasedList.includes(item.id);
                const categoryKey = item.category === 'frames' ? 'frame' : item.category === 'backgrounds' ? 'background' : 'badge';
                const equippedId = (accessories as any)[categoryKey] || (accessories as any)[item.category];
                const isEquipped = equippedId === item.id || (!equippedId && item.isDefault);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAccessory(item)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 shadow-sm'
                        : isOwned
                        ? 'bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-white/10 hover:border-amber-500/40'
                        : 'bg-slate-50/70 dark:bg-[#0F1115]/70 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Visual Icon / Thumbnail */}
                      <div className="w-9 h-9 rounded-lg bg-slate-200/80 dark:bg-white/10 flex items-center justify-center text-lg shrink-0 border border-black/5 dark:border-white/10 shadow-xs relative">
                        <span>{item.icon}</span>
                        {isEquipped && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Name & Description */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.name}
                          </h4>
                          {item.isDefault && (
                            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-[8.5px] font-mono">
                              Grátis
                            </span>
                          )}
                        </div>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button / Ownership Badge */}
                    <div className="shrink-0 flex items-center">
                      {isEquipped ? (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Equipado</span>
                        </span>
                      ) : isOwned ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccessory(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Equipar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccessory(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Coins size={11} className="fill-yellow-400" />
                          <span>{item.cost} M</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer inside Customizer */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetAccessories}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Undo2 size={12} />
                <span>Restaurar Padrão</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('shop');
                }}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10.5px] font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Loja de Fardas</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DEFINIÇÕES DO PERFIL */}
        {activeTab === 'settings' && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSave}
            className="space-y-3.5"
          >
            {/* Candidate Name */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Nome do Utilizador / Candidato
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Manuel Agostinho"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
              />
            </div>

            {/* Shortcut to Personalizar Perfil */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Personalizar Cosméticos</p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400">Molduras, fundos, pins e adereços de avatar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('customizer');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
              >
                Abrir Editor
              </button>
            </div>

            {/* MININT Branch Selection */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Ramo do MININT de Preferência
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                {(Object.keys(MININT_BRANCHES) as MININTBranch[]).map((key) => {
                  const b = MININT_BRANCHES[key];
                  const isSelected = branch === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleUpdateBranch(key)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${b.badgeBg} flex items-center justify-center font-bold text-[11px] text-amber-300 border border-white/10 shrink-0`}>
                          {b.id}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{b.fullName}</p>
                          <p className="text-[9.5px] text-amber-600 dark:text-amber-500 font-medium">{b.motto}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded bg-amber-500 text-black flex items-center justify-center shrink-0 font-bold text-[10px]">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Level Selection */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1 flex items-center gap-1">
                <GraduationCap size={13} className="text-amber-500" />
                <span>Nível Académico do Concurso</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {ACADEMIC_LEVELS.map((levelOption) => {
                  const isSelected = academicLevel === levelOption.id;
                  return (
                    <button
                      key={levelOption.id}
                      type="button"
                      onClick={() => setAcademicLevel(levelOption.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <span>{levelOption.label}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">({levelOption.targetRank})</span>
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-tight">
                        {levelOption.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Província de Candidatura
              </label>
              <div className="relative">
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 appearance-none shadow-xs"
                >
                  {PROVINCES_ANGOLA.map((p) => (
                    <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {p}
                    </option>
                  ))}
                </select>
                <MapPin size={14} className="absolute right-3.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Audio Sound Settings Toggle */}
            <div className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSoundEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                    {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Efeitos Sonoros</p>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400">Sons de acerto, simulado, vitória em duelos e promoções</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isSoundEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {onOpenAudioModal && (
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onOpenAudioModal();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/20"
                  >
                    <Volume2 size={12} />
                    <span>Personalizar Sons</span>
                  </button>
                </div>
              )}
            </div>

            {/* Referral Code & Share Area */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Gift size={15} />
                  <span>Código de Indicação</span>
                </div>
                <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-bold">
                  +5 XP/convite
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">
                  {userReferralCode}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Share2 size={14} />
                <span>Partilhar no WhatsApp</span>
              </button>
            </div>

            {/* Welcome Tour & Support Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {onOpenWelcomeTour && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWelcomeTour();
                  }}
                  className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 text-[10.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle size={13} />
                  <span>Rever Tour</span>
                </button>
              )}

              {onOpenSupportModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupportModal();
                  }}
                  className="py-2 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10.5px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Coffee size={13} />
                  <span>Apoiar Projeto</span>
                </button>
              )}
            </div>

            {/* Submit & Logout Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  if (window.confirm('Tens a certeza que queres finalizar a sessão activa?')) {
                    if (onLogout) {
                      onLogout();
                    }
                    onClose();
                  }
                }}
                className="py-2.5 px-3 text-xs font-black rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                title="Terminar a sessão ativa e ir para o login"
              >
                <LogOut size={15} />
                <span>Terminar Sessão</span>
              </button>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <UserCheck size={15} />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;

