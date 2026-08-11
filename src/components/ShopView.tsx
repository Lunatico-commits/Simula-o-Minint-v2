import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  Shield, 
  Flame, 
  Check, 
  Lock, 
  Gift, 
  HelpCircle, 
  Award, 
  Shirt, 
  Snowflake, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Crown,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { SHOP_ITEMS, ShopItem, ShopCategory } from '../data/shopItems';
import { MININT_BRANCHES, getAvatarOption } from '../data/branches';
import { ReactiveAvatar } from './ReactiveAvatar';
import { fireConfetti } from '../utils/confetti';
import { playCorrectSound, playClickSound } from '../utils/audio';

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
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const userCoins = profile.minintCoins || 0;
  const purchasedItems = profile.purchasedItems || [];
  const streakFreezeCount = profile.streakFreezeCount || 0;
  const extraHintsCount = profile.extraHintsCount || 0;

  const currentAvatarInfo = getAvatarOption(profile.avatarId, profile.branch, profile.displayName);

  const handlePurchase = (item: ShopItem) => {
    playClickSound();

    // Check if user has enough coins
    if (userCoins < item.cost) {
      setFeedbackMessage({
        text: `Créditos insuficientes! Precisa de mais ${item.cost - userCoins} Moedas. Cumpra missões diárias para ganhar mais.`,
        type: 'error',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      return;
    }

    // Deduct coins
    const newCoins = userCoins - item.cost;
    let newPurchasedItems = [...purchasedItems];
    let newStreakFreeze = streakFreezeCount;
    let newExtraHints = extraHintsCount;
    let newAvatarId = profile.avatarId;

    if (item.type === 'avatar_farda') {
      if (!newPurchasedItems.includes(item.id)) {
        newPurchasedItems.push(item.id);
      }
      // Auto-equip purchased avatar
      newAvatarId = item.id;
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
      updatedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
    fireConfetti();
    playCorrectSound();

    let successMsg = `Comprado com sucesso!`;
    if (item.type === 'avatar_farda') {
      successMsg = `Farda "${item.name}" comprada e equipada com sucesso! 🎖️`;
    } else if (item.type === 'streak_freeze') {
      successMsg = `Congelamento de Sequência adicionado ao seu inventário! 🧊`;
    } else if (item.type === 'hint_powerup') {
      successMsg = `+${item.amount} Dicas 50:50 adicionadas! Use-as nos seus simulados. ⚡`;
    }

    setFeedbackMessage({ text: successMsg, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleEquipAvatar = (avatarId: string) => {
    playClickSound();
    const updatedProfile: UserProfile = {
      ...profile,
      avatarId,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProfile(updatedProfile);

    const av = getAvatarOption(avatarId, profile.branch, profile.displayName);
    setFeedbackMessage({
      text: `Equipado: ${av.label}`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-4 pb-8">
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
                Troque os seus Créditos MININT por Fardas de Gala, Congelamento de Ofensiva e Dicas Extra!
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
              <Info size={18} className="text-rose-500 shrink-0" />
            )}
            <span className="flex-1">{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Active Inventory Overview Bar */}
      <div className="bg-slate-100 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center shadow-xs">
        {/* Equipping Status */}
        <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-white/10 pr-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Shirt size={12} className="text-amber-500" />
            <span>Farda Actual</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg">{currentAvatarInfo.symbol}</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[80 sm:max-w-[120px]">
              {currentAvatarInfo.label}
            </span>
          </div>
        </div>

        {/* Streak Freeze Inventory */}
        <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-white/10 px-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Snowflake size={12} className="text-sky-400" />
            <span>Congelamento</span>
          </div>
          <p className="mt-1 text-xs font-black font-mono text-sky-600 dark:text-sky-300">
            {streakFreezeCount > 0 ? `${streakFreezeCount} Activo${streakFreezeCount > 1 ? 's' : ''}` : 'Nenhum'}
          </p>
        </div>

        {/* Power-ups 50:50 Inventory */}
        <div className="flex flex-col items-center justify-center pl-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Zap size={12} className="text-purple-400 fill-purple-400" />
            <span>Dicas 50:50</span>
          </div>
          <p className="mt-1 text-xs font-black font-mono text-purple-600 dark:text-purple-300">
            {extraHintsCount} Unidade{extraHintsCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Category Tabs Scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {[
          { id: 'all', label: 'Todos os Itens', icon: ShoppingBag },
          { id: 'fardas', label: 'Fardas Especiais', icon: Shirt },
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
          const isOwned = purchasedItems.includes(item.id);
          const isEquipped = profile.avatarId === item.id;
          const canAfford = userCoins >= item.cost;

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#0F1115] border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:shadow-md ${
                isEquipped
                  ? 'border-amber-500 ring-1 ring-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent'
                  : 'border-slate-200 dark:border-white/10'
              }`}
            >
              {/* Badges / Tag overlay */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1">
                  {item.isPopular && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                      <Sparkles size={9} />
                      <span>Popular</span>
                    </span>
                  )}
                  {item.isExclusive && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-600 dark:text-purple-300 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                      <Crown size={9} />
                      <span>Exclusivo</span>
                    </span>
                  )}
                  {item.branch && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-bold uppercase">
                      {item.branch}
                    </span>
                  )}
                </div>

                {/* Stock or Owned Indicator */}
                {item.type === 'avatar_farda' && isOwned && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Check size={11} />
                    <span>Desbloqueado</span>
                  </span>
                )}
              </div>

              {/* Item Card Body */}
              <div className="flex items-start gap-3 my-1">
                {/* Visual Icon Avatar Box */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.badgeBg || 'from-amber-500/20 to-amber-600/10'} border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0 relative overflow-hidden`}>
                  <span>{item.symbol}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                {/* Cost Pill */}
                <div className="flex items-center gap-1.5">
                  <Coins size={16} className="text-yellow-400 fill-yellow-400/80 shrink-0" />
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-yellow-300">
                    {item.cost} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Moedas</span>
                  </span>
                </div>

                {/* Purchase or Equip Button */}
                {item.type === 'avatar_farda' ? (
                  isOwned ? (
                    isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider border border-amber-500/40 flex items-center gap-1">
                        <Check size={13} />
                        <span>Equipado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEquipAvatar(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        Equipar
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <ShoppingBag size={13} />
                      <span>Comprar</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      canAfford
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <ShoppingBag size={13} />
                    <span>Comprar</span>
                  </button>
                )}
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
            <span><strong>Simulados & Exames:</strong> Cada simulado concluído premia com moedas proporcionais ao número de acertos.</span>
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
