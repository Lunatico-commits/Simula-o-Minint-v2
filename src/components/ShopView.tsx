import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  Shield, 
  ShieldCheck,
  ShieldAlert,
  Flame, 
  Check, 
  Gift, 
  Award, 
  Shirt, 
  Snowflake, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Crown,
  Info,
  BookOpen,
  Star,
  Eye,
  RotateCcw,
  Palette,
  Layers,
  Sparkle,
  AlertCircle,
  X,
  Scale,
  Microscope,
  Compass,
  Globe,
  Rocket
} from 'lucide-react';
import { UserProfile, AvatarAccessories, MININTBranch } from '../types';
import { SHOP_ITEMS, ShopItem } from '../data/shopItems';
import { 
  ACCESSORY_FRAMES, 
  ACCESSORY_BACKGROUNDS, 
  ACCESSORY_BADGES, 
  ACCESSORY_FACE_ITEMS,
  AccessoryItem 
} from '../data/avatarAccessories';
import { getAvatarOption } from '../data/branches';
import { getAvatarAssetPath, BASE_AVATARS, getAvatarById, getAvatarImagePath, getUserGender, normalizeUniformId } from '../data/avatars';
import { ReactiveAvatar } from './ReactiveAvatar';
import { TacticalAvatarIllustration } from './TacticalAvatarIllustration';
import { fireConfetti } from '../utils/confetti';
import { playCorrectSound, playClickSound } from '../utils/audio';

export type UnifiedShopCategory = 'all' | 'fardas' | 'face' | 'molduras' | 'fundos' | 'badges' | 'streak' | 'powerups' | 'boosters';

export interface UnifiedShopItem {
  id: string;
  name: string;
  category: UnifiedShopCategory;
  cost: number;
  description: string;
  symbol: string;
  branch?: MININTBranch;
  badgeBg?: string;
  isPopular?: boolean;
  isExclusive?: boolean;
  type: 'avatar_farda' | 'frame' | 'background' | 'badge' | 'faceAccessory' | 'streak_freeze' | 'hint_powerup' | 'xp_booster';
  amount?: number;
  imageUrl?: string;
  assetPath?: string;
  layerClass?: string;
  rawItem?: ShopItem | AccessoryItem;
}

interface ShopViewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
}) => {
  const userProfileGender = getUserGender(profile.avatarId);
  const [selectedCategory, setSelectedCategory] = useState<UnifiedShopCategory>('all');
  const [previewItem, setPreviewItem] = useState<UnifiedShopItem | null>(null);
  const [previewGender, setPreviewGender] = useState<'male' | 'female'>(userProfileGender);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [insufficientFundsItem, setInsufficientFundsItem] = useState<UnifiedShopItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<UnifiedShopItem | null>(null);

  const userCoins = profile.minintCoins || 0;
  const purchasedItems = profile.purchasedItems || [];
  const streakFreezeCount = profile.streakFreezeCount || 0;
  const extraHintsCount = profile.extraHintsCount || 0;

  // Build unified catalog of all shop items + accessory items (Frames, Backgrounds, Badges)
  const catalog: UnifiedShopItem[] = useMemo(() => {
    const items: UnifiedShopItem[] = [];

    // 1. Fardas & Items from SHOP_ITEMS
    SHOP_ITEMS.forEach((si) => {
      let cat: UnifiedShopCategory = 'fardas';
      if (si.category === 'streak') cat = 'streak';
      else if (si.category === 'powerups') cat = 'powerups';
      else if (si.category === 'boosters') cat = 'boosters';

      items.push({
        id: si.id,
        name: si.name,
        category: cat,
        cost: si.cost,
        description: si.description,
        symbol: si.symbol,
        branch: si.branch,
        badgeBg: si.badgeBg,
        isPopular: si.isPopular,
        isExclusive: si.isExclusive,
        type: si.type,
        amount: si.amount,
        imageUrl: si.assetPath,
        assetPath: si.assetPath,
        rawItem: si,
      });
    });

    // 2. Molduras (Frames) from avatarAccessories (excluding 'frame_none')
    ACCESSORY_FRAMES.filter(f => f.id !== 'frame_none').forEach((f) => {
      items.push({
        id: f.id,
        name: f.name,
        category: 'molduras',
        cost: f.cost,
        description: f.description,
        symbol: f.icon,
        isPopular: f.id === 'frame_fire' || f.id === 'frame_gold',
        isExclusive: f.id === 'frame_diamond',
        type: 'frame',
        imageUrl: f.imageUrl,
        rawItem: f,
      });
    });

    // 3. Fundos & Gradientes from avatarAccessories (excluding 'bg_default')
    ACCESSORY_BACKGROUNDS.filter(b => b.id !== 'bg_default').forEach((b) => {
      items.push({
        id: b.id,
        name: b.name,
        category: 'fundos',
        cost: b.cost,
        description: b.description,
        symbol: b.icon,
        isPopular: b.id === 'bg_golden_glory' || b.id === 'bg_crimson_elite',
        type: 'background',
        layerClass: b.layerClass,
        rawItem: b,
      });
    });

    // 4. Distintivos / Pins from avatarAccessories (excluding 'badge_none')
    ACCESSORY_BADGES.filter(bg => bg.id !== 'badge_none').forEach((bg) => {
      items.push({
        id: bg.id,
        name: bg.name,
        category: 'badges',
        cost: bg.cost,
        description: bg.description,
        symbol: bg.icon,
        isPopular: bg.id === 'badge_eagle' || bg.id === 'badge_star',
        isExclusive: bg.id === 'badge_crown',
        type: 'badge',
        rawItem: bg,
      });
    });

    // 5. Acessórios de Rosto & Cabeça
    ACCESSORY_FACE_ITEMS.filter(f => f.id !== 'face_none').forEach((f) => {
      items.push({
        id: f.id,
        name: f.name,
        category: 'face',
        cost: f.cost,
        description: f.description,
        symbol: f.icon,
        type: 'faceAccessory',
        imageUrl: f.imageUrl,
        rawItem: f,
      });
    });

    return items;
  }, []);

  const currentBaseAvatar = getAvatarById(profile.avatarId) || BASE_AVATARS.find((a) => a.id === profile.avatarId);
  const equippedShopItem = SHOP_ITEMS.find((item) => item.id === profile.avatarId);
  const currentAvatarInfo = getAvatarOption(profile.avatarId, profile.branch, profile.displayName, profile.gender);
  const currentUniformName = currentBaseAvatar?.title || equippedShopItem?.name || currentAvatarInfo.label || `Oficial ${profile.branch || 'PNA'}`;

  // Current accessories setup
  const currentAccessories = profile.avatarAccessories || {
    frame: profile.equippedFrame || 'frame_none',
    background: profile.equippedBackground || 'bg_default',
    badge: 'badge_none',
    faceAccessory: profile.equippedFaceAccessory || 'face_none',
  };

  // Calculate live simulated avatar appearance based on tested previewItem
  // The base avatar remains the user's selected 3D avatar; tested special uniforms overlay on top!
  const simulatedAvatarId = profile.avatarId || 'pna_male';
  const simulatedUniform = previewItem?.type === 'avatar_farda' ? previewItem.id : (SHOP_ITEMS.some(s => s.id === profile.avatarId) ? profile.avatarId : undefined);
  const simulatedAccessories: AvatarAccessories = {
    ...currentAccessories,
    frame: previewItem?.type === 'frame' ? previewItem.id : (currentAccessories.frame || profile.equippedFrame || 'frame_none'),
    background: previewItem?.type === 'background' ? previewItem.id : (currentAccessories.background || profile.equippedBackground || 'bg_default'),
    badge: previewItem?.type === 'badge' ? previewItem.id : (currentAccessories.badge || 'badge_none'),
    faceAccessory: previewItem?.type === 'faceAccessory' ? previewItem.id : (currentAccessories.faceAccessory || profile.equippedFaceAccessory || 'face_none'),
  };

  // Helper to check if an item is equipped
  const isItemEquipped = (item: UnifiedShopItem): boolean => {
    if (item.type === 'avatar_farda') {
      return profile.avatarId === item.id;
    }
    if (item.type === 'frame') {
      return (currentAccessories.frame || profile.equippedFrame) === item.id;
    }
    if (item.type === 'background') {
      return (currentAccessories.background || profile.equippedBackground) === item.id;
    }
    if (item.type === 'badge') {
      return currentAccessories.badge === item.id;
    }
    if (item.type === 'faceAccessory') {
      return (currentAccessories.faceAccessory || profile.equippedFaceAccessory) === item.id;
    }
    return false;
  };

  // Helper to check if an item is owned
  const isItemOwned = (item: UnifiedShopItem): boolean => {
    if (item.type === 'streak_freeze' || item.type === 'hint_powerup' || item.type === 'xp_booster') {
      return false; // Consumables are purchased to add to stock
    }
    return purchasedItems.includes(item.id);
  };

  const handlePurchase = (item: UnifiedShopItem) => {
    playClickSound();

    // Verificação rigorosa de saldo de 'minintCoins' antes de permitir a aquisição
    const currentCoins = profile.minintCoins ?? 0;
    if (currentCoins < item.cost) {
      setInsufficientFundsItem(item);
      setFeedbackMessage({
        text: `Saldo insuficiente! O seu saldo actual é de ${currentCoins} Moedas. Precisa de mais ${item.cost - currentCoins} Moedas para adquirir "${item.name}".`,
        type: 'error',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
      return;
    }

    // Deduct coins
    const newCoins = currentCoins - item.cost;
    let newPurchasedItems = [...purchasedItems];
    let newStreakFreeze = streakFreezeCount;
    let newExtraHints = extraHintsCount;
    let newAvatarId = profile.avatarId;
    let newAccessories: AvatarAccessories = { ...currentAccessories };
    let newEquippedFrame = profile.equippedFrame;
    let newEquippedFaceAccessory = profile.equippedFaceAccessory;

    if (item.type === 'avatar_farda') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      // Auto-equip purchased avatar
      newAvatarId = item.id;
    } else if (item.type === 'frame') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      newAccessories.frame = item.id;
      newEquippedFrame = item.id;
    } else if (item.type === 'background') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      newAccessories.background = item.id;
    } else if (item.type === 'badge') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      newAccessories.badge = item.id;
    } else if (item.type === 'faceAccessory') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      newAccessories.faceAccessory = item.id;
      newEquippedFaceAccessory = item.id;
    } else if (item.type === 'streak_freeze') {
      newStreakFreeze += (item.amount || 1);
    } else if (item.type === 'hint_powerup') {
      newExtraHints += (item.amount || 3);
    }

    const updatedProfile: UserProfile = {
      ...profile,
      minintCoins: newCoins,
      purchasedItems: newPurchasedItems,
      streakFreezeCount: newStreakFreeze,
      extraHintsCount: newExtraHints,
      avatarId: newAvatarId,
      equippedFrame: newEquippedFrame,
      equippedFaceAccessory: newEquippedFaceAccessory,
      avatarAccessories: newAccessories,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
    fireConfetti();
    playCorrectSound();

    let successMsg = `Comprado com sucesso!`;
    if (item.type === 'avatar_farda') {
      successMsg = `Farda "${item.name}" comprada e equipada com sucesso! 🎖️`;
    } else if (item.type === 'frame') {
      successMsg = `Moldura "${item.name}" comprada e equipada ao redor do seu perfil! 🖼️`;
    } else if (item.type === 'background') {
      successMsg = `Fundo "${item.name}" comprado e aplicado ao seu avatar! 🎨`;
    } else if (item.type === 'badge') {
      successMsg = `Distintivo "${item.name}" adicionado ao seu avatar! 🎖️`;
    } else if (item.type === 'faceAccessory') {
      successMsg = `Acessório "${item.name}" comprado e equipado no seu avatar! 🥽`;
    } else if (item.type === 'streak_freeze') {
      successMsg = `Congelamento de Sequência adicionado ao seu inventário! 🧊`;
    } else if (item.type === 'hint_powerup') {
      successMsg = `+${item.amount} Dicas 50:50 adicionadas! Use-as nos seus simulados. ⚡`;
    }

    setFeedbackMessage({ text: successMsg, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleEquipItem = (item: UnifiedShopItem) => {
    playClickSound();
    let newAvatarId = profile.avatarId;
    let newAccessories: AvatarAccessories = { ...currentAccessories };
    let newEquippedFrame = profile.equippedFrame;
    let newEquippedFaceAccessory = profile.equippedFaceAccessory;

    if (item.type === 'avatar_farda') {
      newAvatarId = item.id;
    } else if (item.type === 'frame') {
      newAccessories.frame = item.id;
      newEquippedFrame = item.id;
    } else if (item.type === 'background') {
      newAccessories.background = item.id;
    } else if (item.type === 'badge') {
      newAccessories.badge = item.id;
    } else if (item.type === 'faceAccessory') {
      newAccessories.faceAccessory = item.id;
      newEquippedFaceAccessory = item.id;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      avatarId: newAvatarId,
      equippedFrame: newEquippedFrame,
      equippedFaceAccessory: newEquippedFaceAccessory,
      avatarAccessories: newAccessories,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
    setFeedbackMessage({
      text: `Equipado com sucesso: ${item.name}`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleBuyComboViaWhatsApp = () => {
    playClickSound();
    const message = `Olá! Gostaria de adquirir o PDF *💎 COMBO VIP: Todos os 7 PDFs + Simulados Bónus* no valor de *2.500 Kz*.

💳 *Dados de Pagamento:*
- IBAN: AO06 0058 0000 06173873101 38
- Express: 939 606 343
- Titular: António Edson Lima Pimentel

Segue em anexo o meu comprovativo de pagamento para libertação do ficheiro.`;
    const whatsappUrl = `https://wa.me/244939606343?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredItems = catalog.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleTestItem = (item: UnifiedShopItem) => {
    playClickSound();
    if (previewItem?.id === item.id) {
      setPreviewItem(null);
    } else {
      setPreviewItem(item);
    }
  };

  const renderShopItemIcon = (item: UnifiedShopItem, genderOverride?: 'male' | 'female') => {
    // 1. If item is an avatar farda, resolve dynamically with gender support
    if (item.type === 'avatar_farda') {
      const activeGender = genderOverride || userProfileGender;
      const avatarImagePath = getAvatarImagePath(item.id, activeGender, item.branch);

      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex items-center justify-center relative bg-slate-950/90 border border-white/10 group">
          <img
            src={avatarImagePath}
            alt={item.name}
            className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const organ = (item.branch || 'pna').toLowerCase();
              const cleanOrgan = ['pna', 'sic', 'sme', 'spcb', 'sp'].includes(organ) ? organ : 'pna';
              e.currentTarget.src = `/avatars/${cleanOrgan}_${activeGender}.png`;
            }}
          />
        </div>
      );
    }

    // 2. Explicit asset path or image URL for accessories
    const directAsset = item.assetPath || item.imageUrl;
    if (directAsset) {
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex items-center justify-center relative bg-slate-950/90 border border-white/10 group">
          <img
            src={directAsset}
            alt={item.name}
            className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = `/avatars/pna_${userProfileGender}.png`;
            }}
          />
        </div>
      );
    }

    // 3. Specialized custom vector tactical avatars & illustrations
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-950/80 border border-white/10">
        <TacticalAvatarIllustration
          id={item.id}
          branch={item.branch}
          gender={genderOverride || userProfileGender}
          size={48}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-32 sm:pb-36 pr-1 sm:pr-0">
      {/* Top Banner / Store Title */}
      <div className="bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0A0C0E] border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border border-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 shrink-0">
              <ShoppingBag size={26} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-black tracking-tight text-slate-100">
                  Loja Oficial MININT
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Créditos & Itens</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Troque os seus Créditos MININT por Fardas, Molduras, Fundos e Power-ups!
              </p>
            </div>
          </div>

          {/* User Coins Balance Counter Pill */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 bg-slate-900/90 border border-yellow-500/40 p-2.5 px-3.5 rounded-xl shadow-inner">
            <div className="flex items-center gap-2">
              <Coins size={22} className="text-yellow-400 fill-yellow-400/80 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)] animate-pulse" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Seu Saldo Actual</p>
                <p className="text-base font-black font-mono text-yellow-400 leading-none">
                  {userCoins.toLocaleString()} <span className="text-xs">Moedas</span>
                </p>
              </div>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('quiz')}
                className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                title="Ganhe moedas realizando missões diárias e simulados"
              >
                <span>Ganhar +</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Feedback Toast Message */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-md ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
            )}
            <span className="flex-1">{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ℹ️ Modal de Detalhes do Item */}
      <AnimatePresence>
        {selectedDetailItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedDetailItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F1115] border border-amber-500/50 rounded-2xl max-w-md w-full p-5 sm:p-6 text-white shadow-2xl shadow-black/80 relative overflow-hidden ring-1 ring-white/10"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar detalhes"
              >
                <X size={18} />
              </button>

              {/* Header Title & Category */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/40 p-1 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-black/50">
                  {renderShopItemIcon(selectedDetailItem, previewGender)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDetailItem.branch && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {selectedDetailItem.branch}
                      </span>
                    )}
                    {selectedDetailItem.isPopular && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles size={10} />
                        <span>Popular</span>
                      </span>
                    )}
                    {selectedDetailItem.isExclusive && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Crown size={10} />
                        <span>Exclusivo</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 mt-1 tracking-tight truncate">
                    {selectedDetailItem.name}
                  </h3>
                </div>
              </div>

              {/* Gender Selector Toggle for Fardas (M / F Preview) */}
              {selectedDetailItem.type === 'avatar_farda' && (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Modelo de Farda</span>
                    <span className="text-xs font-bold text-slate-200">
                      {previewGender === 'male' ? 'Versão Masculina' : 'Versão Feminina'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPreviewGender('male')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        previewGender === 'male'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👨 Masc (M)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewGender('female')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        previewGender === 'female'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👩 Fem (F)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Price & Status Banner */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Preço Oficial</span>
                  <div className="flex items-center gap-1.5 font-mono text-base font-black text-yellow-400 mt-0.5">
                    <Coins size={16} className="text-yellow-400 fill-yellow-400/90" />
                    <span>{selectedDetailItem.cost} Moedas MININT</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Status do Candidato</span>
                  {isItemEquipped(selectedDetailItem) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider mt-0.5">
                      <Check size={11} /> Equipado
                    </span>
                  ) : isItemOwned(selectedDetailItem) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider mt-0.5">
                      <Check size={11} /> Desbloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider mt-0.5">
                      Disponível
                    </span>
                  )}
                </div>
              </div>

              {/* Description & Usage Guide */}
              <div className="space-y-3 mb-5">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono mb-1">
                    Descrição do Equipamento
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    {selectedDetailItem.description}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/30 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                  <Info size={14} className="text-amber-400 shrink-0" />
                  <span>
                    {selectedDetailItem.type === 'avatar_farda'
                      ? 'Esta farda especial fica salva no seu perfil e pode ser equipada a qualquer momento.'
                      : selectedDetailItem.type === 'frame'
                      ? 'A moldura tática é exibida ao redor do seu avatar nos rankings, ligas e simulados.'
                      : selectedDetailItem.type === 'streak_freeze'
                      ? 'Protege automaticamente a sua sequência diária caso falte a um dia de treino.'
                      : selectedDetailItem.type === 'hint_powerup'
                      ? 'Elimina 2 alternativas incorretas durante os simulados para ajudar na pontuação.'
                      : 'Equipamento tático oficial para personalização militar do candidato.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    handleTestItem(selectedDetailItem);
                  }}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    previewItem?.id === selectedDetailItem.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                  }`}
                >
                  <Eye size={14} />
                  <span>{previewItem?.id === selectedDetailItem.id ? 'A Testar no Topo' : 'Testar no Avatar'}</span>
                </button>

                {isItemOwned(selectedDetailItem) ? (
                  !isItemEquipped(selectedDetailItem) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleEquipItem(selectedDetailItem);
                        setSelectedDetailItem(null);
                      }}
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Equipar Agora</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handlePurchase(selectedDetailItem);
                      if (userCoins >= selectedDetailItem.cost) {
                        setSelectedDetailItem(null);
                      }
                    }}
                    className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                      userCoins >= selectedDetailItem.cost
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-yellow-500/25'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {userCoins >= selectedDetailItem.cost ? (
                      <>
                        <ShoppingBag size={14} />
                        <span>Comprar por {selectedDetailItem.cost} Moedas</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} className="text-rose-400" />
                        <span>Saldo Insuficiente</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ Alerta Visual de Saldo Insuficiente (Modal / Dialog) */}
      <AnimatePresence>
        {insufficientFundsItem && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setInsufficientFundsItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F1115] border-2 border-rose-500/80 rounded-2xl max-w-md w-full p-5 sm:p-6 text-white shadow-2xl shadow-rose-950/60 relative overflow-hidden ring-1 ring-rose-500/30"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setInsufficientFundsItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar alerta"
              >
                <X size={18} />
              </button>

              {/* Header Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 p-0.5 shadow-lg shadow-rose-500/25 shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <AlertCircle size={26} className="text-rose-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-mono">
                    Aviso de Créditos MININT
                  </span>
                  <h3 className="text-lg font-black text-slate-100 tracking-tight">
                    Saldo Insuficiente
                  </h3>
                </div>
              </div>

              {/* Item Card Details */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {renderShopItemIcon(insufficientFundsItem, previewGender)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-200 truncate">{insufficientFundsItem.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-yellow-400 flex items-center gap-1">
                      <Coins size={13} className="text-yellow-400 fill-yellow-400/80" />
                      Preço: {insufficientFundsItem.cost} Moedas
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Comparison Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-slate-900/80 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Seu Saldo Actual</p>
                  <p className="text-base font-black font-mono text-yellow-400 mt-0.5">
                    {userCoins} <span className="text-xs text-slate-400">Moedas</span>
                  </p>
                </div>
                <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">Faltam</p>
                  <p className="text-base font-black font-mono text-rose-400 mt-0.5">
                    {Math.max(0, insufficientFundsItem.cost - userCoins)} <span className="text-xs text-rose-300">Moedas</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                Você não possui moedas suficientes para desbloquear este item. Resolva simulados diários, cumpra missões ou vença duelos 1v1 para acumular créditos!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setInsufficientFundsItem(null);
                      onNavigateTab('quiz');
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>Ganhar Moedas nos Simulados</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInsufficientFundsItem(null)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 1. PRÉ-VISUALIZAÇÃO AO VIVO NA LOJA (LIVE PREVIEW POD) - STICKY TOP */}
      <div className="sticky top-0 z-40 pt-1 pb-1.5 bg-slate-100/90 dark:bg-[#07090E]/90 backdrop-blur-md">
        <motion.div 
          layout
          id="live-avatar-preview-pod"
          className={`rounded-2xl border transition-all duration-300 p-2.5 sm:p-4 md:p-5 relative overflow-hidden shadow-xl backdrop-blur-md ${
            previewItem
              ? 'bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-amber-950/95 border-amber-500/90 shadow-[0_4px_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/60'
              : 'bg-white/95 dark:bg-[#0F1115]/95 border-slate-200 dark:border-white/15'
          }`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
            {/* Avatar Preview Visual Area */}
            <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-auto">
              <div className="relative shrink-0 flex items-center justify-center p-0.5 sm:p-1">
                {/* Mobile compact avatar */}
                <div className="block sm:hidden">
                  <ReactiveAvatar
                    avatarId={simulatedAvatarId}
                    gender={userProfileGender}
                    branch={profile.branch}
                    displayName={profile.displayName}
                    photoURL={previewItem?.type === 'avatar_farda' ? undefined : profile.photoURL}
                    accessories={simulatedAccessories}
                    equippedFrame={simulatedAccessories.frame}
                    equippedBackground={simulatedAccessories.background}
                    equippedFaceAccessory={simulatedAccessories.faceAccessory}
                    equippedUniform={simulatedUniform}
                    size="lg"
                    reaction="idle"
                    showBranchBadge={true}
                    showLevelBadge={true}
                    level={profile.level || 1}
                    isVipSupporter={profile.isVipSupporter}
                    interactive={false}
                  />
                </div>
                {/* Desktop/Tablet size */}
                <div className="hidden sm:block">
                  <ReactiveAvatar
                    avatarId={simulatedAvatarId}
                    gender={userProfileGender}
                    branch={profile.branch}
                    displayName={profile.displayName}
                    photoURL={previewItem?.type === 'avatar_farda' ? undefined : profile.photoURL}
                    accessories={simulatedAccessories}
                    equippedFrame={simulatedAccessories.frame}
                    equippedBackground={simulatedAccessories.background}
                    equippedFaceAccessory={simulatedAccessories.faceAccessory}
                    equippedUniform={simulatedUniform}
                    size="xl"
                    reaction="idle"
                    showBranchBadge={true}
                    showLevelBadge={true}
                    level={profile.level || 1}
                    isVipSupporter={profile.isVipSupporter}
                    interactive={true}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
                  {previewItem ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider animate-pulse shadow-xs">
                      <Eye size={12} />
                      <span>Pré-Visualização ao Vivo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                      <Check size={12} />
                      <span>Equipamento Actual</span>
                    </span>
                  )}

                  {previewItem && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {previewItem.category.toUpperCase()}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {previewItem ? previewItem.name : currentUniformName}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {previewItem
                    ? previewItem.description
                    : 'Passe o cursor ou clique em "Testar" em qualquer Farda, Moldura ou Acessório abaixo para ver a alteração no avatar em tempo real.'}
                </p>
              </div>
            </div>

            {/* Quick Actions in Live Preview Pod */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-200 dark:border-white/10">
              {previewItem ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setPreviewItem(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Voltar ao avatar original"
                  >
                    <RotateCcw size={13} />
                    <span>Limpar</span>
                  </button>

                  {isItemEquipped(previewItem) ? (
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Check size={14} />
                      <span>Equipado</span>
                    </span>
                  ) : isItemOwned(previewItem) ? (
                    <button
                      type="button"
                      onClick={() => handleEquipItem(previewItem)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                    >
                      <Check size={14} />
                      <span>Equipar Agora</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchase(previewItem)}
                      className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        userCoins >= previewItem.cost
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/25'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 shadow-xs'
                      }`}
                    >
                      {userCoins >= previewItem.cost ? (
                        <>
                          <Coins size={14} className="text-yellow-400 fill-yellow-400/90" />
                          <span>Comprar ({previewItem.cost} M)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-rose-400" />
                          <span>Saldo Insuficiente ({previewItem.cost} M)</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-right hidden md:block">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                    Toque em "Testar" num item para pré-visualizar
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Active Inventory Overview Bar */}
      <div className="bg-slate-100 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center shadow-xs">
        {/* Equipping Status */}
        <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-white/10 pr-2 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Shirt size={12} className="text-amber-500 shrink-0" />
            <span>Farda Actual</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-1.5 min-w-0 max-w-full w-full px-0.5">
            <span
              className="text-xs font-black text-slate-800 dark:text-slate-200 truncate w-full block text-center"
              title={currentUniformName}
            >
              {currentUniformName}
            </span>
          </div>
        </div>

        {/* Streak Freeze Inventory */}
        <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-white/10 px-2 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Snowflake size={12} className="text-sky-400 shrink-0" />
            <span>Congelamento</span>
          </div>
          <p className="mt-1 text-xs font-black font-mono text-sky-600 dark:text-sky-300 truncate w-full block">
            {streakFreezeCount > 0 ? `${streakFreezeCount} Activo${streakFreezeCount > 1 ? 's' : ''}` : 'Nenhum'}
          </p>
        </div>

        {/* Power-ups 50:50 Inventory */}
        <div className="flex flex-col items-center justify-center pl-2 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Zap size={12} className="text-purple-400 fill-purple-400 shrink-0" />
            <span>Dicas 50:50</span>
          </div>
          <p className="mt-1 text-xs font-black font-mono text-purple-600 dark:text-purple-300 truncate w-full block">
            {extraHintsCount} Unidade{extraHintsCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Featured Promo Card: Combo VIP Study Pack */}
      <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-950/40 border-2 border-amber-500/80 p-4 sm:p-5 text-slate-100 shadow-[0_0_25px_rgba(245,158,11,0.2)] overflow-visible">
        {/* Visible Floating Animated Pulse Badge: Mais Popular / Promoção */}
        <div className="absolute -top-3 right-4 sm:right-6 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-amber-500/40 border border-yellow-200 animate-pulse">
            <Sparkles size={13} className="fill-slate-950" />
            <span>Mais Popular • Promoção</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                💎 Pacote Oficial de Estudos
              </span>
              <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>5.0 (148 avaliações)</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
              Combo VIP: Todos os 7 PDFs + 500 Questões Resolvidas
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Material completo para o Concurso MININT (PNA, SIC, SME, SP e SPCB). Inclui Legislação Orgânica, Português, Cultura Geral, Informática e Gabaritos Comentados.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs flex-wrap">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <span className="text-slate-400 line-through text-[11px]">3.900 Kz</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">2.500 Kz</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                  Economize 1.400 Kz
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center gap-2 w-full md:w-auto shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onNavigateTab('materials');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen size={15} />
                <span>Ver Combo VIP</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleBuyComboViaWhatsApp}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ShoppingBag size={14} />
              <span>Comprar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs Scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {[
          { id: 'all', label: 'Todos os Itens', icon: ShoppingBag },
          { id: 'fardas', label: 'Fardas Especiais', icon: Shirt },
          { id: 'molduras', label: 'Molduras de Avatar', icon: Sparkle },
          { id: 'fundos', label: 'Fundos & Cores', icon: Palette },
          { id: 'badges', label: 'Pins & Distintivos', icon: Award },
          { id: 'streak', label: 'Streak Freeze', icon: Snowflake },
          { id: 'powerups', label: 'Dicas 50:50', icon: Lightbulb },
          { id: 'boosters', label: 'Boosters XP', icon: Zap },
        ].map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <IconComp size={13} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shop Items Grid Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const isOwned = isItemOwned(item);
          const isEquipped = isItemEquipped(item);
          const isCurrentPreview = previewItem?.id === item.id;
          const canAfford = userCoins >= item.cost;

          // Compute max 2 badges per card (without 'Em Teste' tag)
          const cardBadges: { key: string; label: string; icon?: React.ReactNode; bg: string; text: string; border?: string }[] = [];
          
          if (isEquipped) {
            cardBadges.push({
              key: 'equipped',
              label: 'Equipado',
              icon: <Check size={10} />,
              bg: 'bg-emerald-500/20',
              text: 'text-emerald-600 dark:text-emerald-400',
              border: 'border-emerald-500/40',
            });
          } else if (isOwned) {
            cardBadges.push({
              key: 'owned',
              label: 'Desbloqueado',
              icon: <Check size={10} />,
              bg: 'bg-emerald-500/10',
              text: 'text-emerald-600 dark:text-emerald-400',
              border: 'border-emerald-500/20',
            });
          }

          if (item.branch && cardBadges.length < 2) {
            cardBadges.push({
              key: 'branch',
              label: item.branch,
              bg: item.branch === 'PNA'
                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                : item.branch === 'SIC'
                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                : item.branch === 'SME'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : item.branch === 'SPCB'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
              text: '',
              border: 'border-white/10',
            });
          }

          if (item.isPopular && cardBadges.length < 2) {
            cardBadges.push({
              key: 'popular',
              label: 'Popular',
              icon: <Sparkles size={10} />,
              bg: 'bg-amber-500/20',
              text: 'text-amber-600 dark:text-amber-400',
              border: 'border-amber-500/40',
            });
          }

          if (item.isExclusive && cardBadges.length < 2) {
            cardBadges.push({
              key: 'exclusive',
              label: 'Exclusivo',
              icon: <Crown size={10} />,
              bg: 'bg-purple-500/20',
              text: 'text-purple-600 dark:text-purple-300',
              border: 'border-purple-500/40',
            });
          }

          const visibleBadges = cardBadges.slice(0, 2);

          return (
            <div
              key={item.id}
              onClick={() => {
                playClickSound();
                setSelectedDetailItem(item);
              }}
              className={`bg-white dark:bg-[#0F1115] border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all shadow-xs cursor-pointer group ${
                isCurrentPreview
                  ? 'border-amber-500 ring-2 ring-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent shadow-md'
                  : isEquipped
                  ? 'border-emerald-500/70 ring-1 ring-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent'
                  : 'border-slate-200 dark:border-white/10 hover:border-amber-500/40 dark:hover:border-amber-500/40'
              }`}
            >
              {/* Badges / Tag overlay + Price + Discreet Info Button */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {visibleBadges.map((badge) => (
                    <span
                      key={badge.key}
                      className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border ${badge.bg} ${badge.text} ${badge.border || 'border-transparent'}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  ))}
                </div>

                {/* Right controls: Price indicator badge + Discreet Info Button (ℹ) */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-500 dark:text-amber-400">
                    <Coins size={14} className="text-yellow-400 fill-yellow-400/80 shrink-0" />
                    <span>{item.cost} M</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      setSelectedDetailItem(item);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-400 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Ver detalhes do item"
                    aria-label={`Ver detalhes de ${item.name}`}
                  >
                    <Info size={14} />
                  </button>
                </div>
              </div>

              {/* Item Card Body */}
              <div className="flex items-start gap-3 my-1">
                {/* Visual Icon Box - Real Organ Styling & Palette */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    item.badgeBg || item.layerClass || 'from-amber-500/20 to-amber-600/10'
                  } border ${
                    item.branch === 'PNA'
                      ? 'border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                      : item.branch === 'SIC'
                      ? 'border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : item.branch === 'SME'
                      ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : item.branch === 'SPCB'
                      ? 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : item.branch === 'SP'
                      ? 'border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                      : 'border-amber-500/30'
                  } flex items-center justify-center text-3xl shadow-inner shrink-0 relative overflow-hidden`}
                >
                  {renderShopItemIcon(item)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Action: Testar + Comprar / Equipar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                {/* Dedicated Testar Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestItem(item);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    isCurrentPreview
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5'
                  }`}
                  title="Testar este item no avatar"
                >
                  <Eye size={12} />
                  <span>{isCurrentPreview ? 'A Testar' : 'Testar'}</span>
                </button>

                {/* Purchase or Equip Button */}
                <div className="flex items-center gap-1.5">
                  {isOwned ? (
                    isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                        <Check size={13} />
                        <span>Equipado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipItem(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        Equipar
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(item);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/20'
                          : 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <ShoppingBag size={13} />
                          <span>Comprar</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} className="text-rose-400" />
                          <span>Saldo Insuficiente</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card on How to Earn Coins */}
      <div className="bg-slate-100 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Coins size={16} className="text-yellow-500" />
          <span>Como obter mais Créditos MININT?</span>
        </h4>
        <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span><strong>Missões Diárias:</strong> Conclua os 3 objetivos diários para resgatar dezenas de Moedas todos os dias.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span><strong>Simulados & Dificuldade:</strong> Realize simulados em nível Médio (1.5x XP) ou Difícil (2.0x XP) para ganhar ainda mais moedas e XP!</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span><strong>Duelos 1v1:</strong> Vencer duelos contra outros candidatos ou IA garante bónus de moedas douradas!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
