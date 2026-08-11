import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, isAdminUser } from '../types';
import { MININT_BRANCHES, RANKS_MININT, getAvatarOption } from '../data/branches';
import { getSoundEnabled, setSoundEnabled, playClickSound } from '../utils/audio';
import { calculateCurrentStreak } from '../utils/streak';
import { Lightbulb, Shield, Trophy, User, Wifi, WifiOff, Sparkles, BookOpen, Swords, Sun, Moon, Monitor, ShieldCheck, HelpCircle, Volume2, VolumeX, Flame, Bell, Award, MessageSquareQuote, Sliders, FileText, Zap, Coins, ShoppingBag, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BranchIllustration } from './BranchIllustration';
import { ReactiveAvatar } from './ReactiveAvatar';

export type ThemeMode = 'dark' | 'light' | 'system';

interface HeaderProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenAdminPanel?: () => void;
  onOpenNotifications?: () => void;
  onOpenBadges?: () => void;
  onOpenAudioSettings?: () => void;
  onOpenSettings?: (tab?: 'audio' | 'notifications') => void;
  onOpenWelcomeTour?: () => void;
  onOpenDailyStudyTip?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  themeMode?: ThemeMode;
  effectiveTheme?: 'dark' | 'light';
  onCycleThemeMode?: () => void;
  onGoHome?: () => void;
  hasPendingDuelInvite?: boolean;
}

export const MinintShieldLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div className="relative shrink-0 flex items-center justify-center">
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
    >
      {/* Outer Shield Shell */}
      <path
        d="M20 2C28 2 35 5.5 36 12C36 25 28 34 20 38C12 34 4 25 4 12C5 5.5 12 2 20 2Z"
        fill="url(#minintShieldBg)"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Inner Golden Border */}
      <path
        d="M20 4.5C26.5 4.5 32.5 7.2 33.3 12.8C33.3 23.2 27 31 20 34.8C13 31 6.7 23.2 6.7 12.8C7.5 7.2 13.5 4.5 20 4.5Z"
        stroke="#f59e0b"
        strokeWidth="0.9"
        strokeOpacity="0.85"
        fill="none"
      />
      {/* Golden Star / Insignia Emblem */}
      <path
        d="M20 9.5L22.2 14.2L27 15L23.5 18.3L24.3 23.2L20 21L15.7 23.2L16.5 18.3L13 15L17.8 14.2L20 9.5Z"
        fill="url(#minintGoldGrad)"
        stroke="#b45309"
        strokeWidth="0.5"
      />
      {/* Central Red Security Core */}
      <circle cx="20" cy="16.6" r="2.8" fill="#dc2626" stroke="#f59e0b" strokeWidth="0.6" />
      <circle cx="20" cy="16.6" r="1" fill="#fef08a" />
      
      {/* Lower Security Laurel detail */}
      <path
        d="M13 26C16 28 24 28 27 26"
        stroke="#f59e0b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="minintShieldBg" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="minintGoldGrad" x1="20" y1="9.5" x2="20" y2="23.2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onOpenAdminPanel,
  onOpenNotifications,
  onOpenBadges,
  onOpenAudioSettings,
  onOpenSettings,
  onOpenWelcomeTour,
  onOpenDailyStudyTip,
  activeTab,
  setActiveTab,
  themeMode = 'system',
  effectiveTheme = 'dark',
  onCycleThemeMode,
  onGoHome,
  hasPendingDuelInvite = false,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioOn, setIsAudioOn] = useState(() => getSoundEnabled());
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const branchInfo = MININT_BRANCHES[profile.branch] || MININT_BRANCHES.PNA;

  useEffect(() => {
    setIsAudioOn(getSoundEnabled());
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setIsOptionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAudio = () => {
    const nextState = !isAudioOn;
    setIsAudioOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playClickSound();
    }
  };

  // Find current rank based on XP
  const currentRank = RANKS_MININT.slice().reverse().find(r => profile.totalXp >= r.minXp) || RANKS_MININT[0];
  const nextRank = RANKS_MININT.find(r => r.minXp > profile.totalXp) || currentRank;
  const xpForNext = nextRank.minXp - currentRank.minXp;
  const currentXpInRank = profile.totalXp - currentRank.minXp;
  const xpProgress = xpForNext > 0 ? Math.min(100, Math.round((currentXpInRank / xpForNext) * 100)) : 100;
  const userAvatar = getAvatarOption(profile.avatarId, profile.branch, profile.displayName);
  const navRef = useRef<HTMLElement>(null);

  const centerTab = (tabId: string) => {
    const nav = navRef.current;
    if (!nav) return;

    let targetKey = tabId;
    if (tabId === 'guide') targetKey = 'faq';
    if (tabId === 'desafio') targetKey = 'quiz';

    const btn = nav.querySelector(`[data-tab="${targetKey}"]`) as HTMLElement;
    if (!btn) return;

    const navWidth = nav.offsetWidth;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;

    const targetScrollLeft = btnLeft - (navWidth / 2) + (btnWidth / 2);

    nav.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      centerTab(activeTab);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
      {/* Top status bar - Hidden on mobile to save vertical space */}
      <div className="hidden sm:flex bg-slate-50 dark:bg-slate-950 px-4 py-1 text-xs border-b border-slate-200 dark:border-slate-800 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[9px] font-mono">
            MININT Angola • Servidor Ativo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
              <Wifi size={11} />
              <span>4G / ONLINE</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[10px] font-mono animate-pulse font-bold">
              <WifiOff size={11} />
              <span>OFFLINE</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Logo - Clickable to go home/reset simulados */}
        <button
          type="button"
          onClick={() => {
            if (onGoHome) {
              onGoHome();
            } else {
              setActiveTab('quiz');
            }
          }}
          title="Página Inicial de Simulados"
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group text-left focus:outline-hidden transition-transform active:scale-95 select-none shrink-0"
        >
          <MinintShieldLogo size={30} />

          <div className="flex flex-col justify-center">
            <h1 className="text-xs sm:text-lg tracking-tight flex items-center gap-0.5 sm:gap-1 leading-none group-hover:opacity-90 font-black">
              <span className="text-slate-800 dark:text-white font-extrabold">Simulados</span>
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-red-600 bg-clip-text text-transparent font-black">MININT</span>
            </h1>
            <p className="hidden xs:flex text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 items-center gap-1 font-mono leading-none">
              <span className="font-bold text-amber-600 dark:text-amber-400">Oficial {branchInfo.id}</span>
              <span className="hidden sm:inline">• {profile.province || 'Luanda'}</span>
            </p>
          </div>
        </button>

        {/* Intermediate Metrics Pill Container */}
        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-full border border-slate-200/90 dark:border-slate-700/90 overflow-x-auto scrollbar-none min-w-0 shrink max-w-[110px] xs:max-w-[170px] sm:max-w-none shadow-xs">
          {/* 1. Ofensiva Streak */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title={`Ofensiva de Estudo Diário: ${calculateCurrentStreak(profile).streak} dias`}
            aria-label="Ofensiva Diária"
            className="px-1 py-0.5 sm:px-1.5 rounded-full flex items-center gap-0.5 sm:gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 text-[10px] sm:text-xs font-mono font-black"
          >
            <Flame
              size={13}
              className={
                calculateCurrentStreak(profile).streak > 0
                  ? 'text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]'
                  : 'text-slate-400 dark:text-slate-500'
              }
            />
            <span className="text-slate-900 dark:text-slate-100 text-[10px] sm:text-[11px]">
              {calculateCurrentStreak(profile).streak}d
            </span>
          </button>

          <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* 2. Duelos Pts */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('rankings');
            }}
            title={`Pontos na Liga de Duelos: ${profile.weeklyDuelPoints || 0} Pts`}
            aria-label="Pontos de Duelo"
            className="px-1 py-0.5 sm:px-1.5 rounded-full flex items-center gap-0.5 sm:gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 text-[10px] sm:text-xs font-mono font-black text-amber-600 dark:text-amber-400"
          >
            <span className="text-[10px] sm:text-[11px]">
              {(profile.duelLeague || 'bronze') === 'ouro'
                ? '🥇'
                : (profile.duelLeague || 'bronze') === 'prata'
                ? '🥈'
                : '🥉'}
            </span>
            <span className="text-[10px] sm:text-[11px]">{profile.weeklyDuelPoints || 0} Pts</span>
          </button>

          <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* 3. XP Total */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title={`Pontuação XP Total: ${profile.totalXp.toLocaleString()} XP`}
            aria-label="XP Total"
            className="px-1 py-0.5 sm:px-1.5 rounded-full flex items-center gap-0.5 sm:gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 text-[10px] sm:text-xs font-mono font-black text-amber-600 dark:text-amber-300"
          >
            <Zap size={12} className="text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px]">{profile.totalXp.toLocaleString()} XP</span>
          </button>

          <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* 4. Créditos MININT / Moedas */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('shop');
            }}
            title={`Créditos MININT: ${(profile.minintCoins || 0).toLocaleString()} Moedas`}
            aria-label="Créditos MININT"
            className="px-1 py-0.5 sm:px-1.5 rounded-full flex items-center gap-0.5 sm:gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 text-[10px] sm:text-xs font-mono font-black text-yellow-600 dark:text-yellow-300"
          >
            <Coins size={12} className="text-yellow-400 fill-yellow-400/80 shrink-0" />
            <span className="text-[10px] sm:text-[11px]">{(profile.minintCoins || 0).toLocaleString()}</span>
          </button>
        </div>

        {/* Right Fixed Action Cluster (Always shrink-0) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Icon-Only Theme Switcher Button */}
          {onCycleThemeMode && (
            <button
              type="button"
              onClick={onCycleThemeMode}
              title={
                themeMode === 'dark'
                  ? 'Modo Escuro (Clique para alterar)'
                  : themeMode === 'light'
                  ? 'Modo Claro (Clique para alterar)'
                  : 'Modo Sistema (Clique para alterar)'
              }
              aria-label="Alternar Tema"
              className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
            >
              {themeMode === 'dark' && <Moon size={14} className="text-amber-400" />}
              {themeMode === 'light' && <Sun size={14} className="text-amber-500" />}
              {themeMode === 'system' && <Monitor size={14} className="text-sky-400" />}
            </button>
          )}

          {/* Gear Options Dropdown Menu Button */}
          <div className="relative shrink-0" ref={optionsMenuRef}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsOptionsMenuOpen(!isOptionsMenuOpen);
              }}
              title="Opções e Configurações"
              aria-label="Menu de Opções"
              className={`p-1.5 sm:p-2 rounded-full border transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center ${
                isOptionsMenuOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-500/40'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Settings size={14} className={isOptionsMenuOpen ? 'animate-spin' : ''} />
            </button>

            {/* Dropdown Menu Popup */}
            <AnimatePresence>
              {isOptionsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl z-50 p-1.5 space-y-1"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Opções Rápidas
                    </p>
                  </div>

                  {/* Configurações */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      playClickSound();
                      if (onOpenSettings) onOpenSettings();
                      else if (onOpenAudioSettings) onOpenAudioSettings();
                      else if (onOpenNotifications) onOpenNotifications();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <Sliders size={15} className="text-amber-500" />
                    <span>Configurações & Áudio</span>
                  </button>

                  {/* Dica do Dia */}
                  {onOpenDailyStudyTip && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        playClickSound();
                        onOpenDailyStudyTip();
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <Lightbulb size={15} className="text-amber-500 animate-pulse" />
                      <span>Dica do Dia</span>
                    </button>
                  )}

                  {/* Guia & Tour */}
                  {onOpenWelcomeTour && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        playClickSound();
                        onOpenWelcomeTour();
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <HelpCircle size={15} className="text-amber-500" />
                      <span>Guia & Tour</span>
                    </button>
                  )}

                  {/* Painel ADM */}
                  {isAdminUser(profile) && onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        playClickSound();
                        onOpenAdminPanel();
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-left cursor-pointer border border-amber-500/30"
                    >
                      <ShieldCheck size={15} className="text-amber-500" />
                      <span>Painel ADM</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title={`Perfil de ${profile.displayName || 'Candidato'} (${profile.totalXp} XP)`}
            aria-label="Abrir Perfil"
            className="p-0.5 rounded-full hover:ring-2 hover:ring-amber-500/50 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ReactiveAvatar
              avatarId={profile.avatarId}
              branch={profile.branch}
              displayName={profile.displayName}
              photoURL={profile.photoURL}
              size="xs"
              showBranchBadge={true}
              level={profile.level}
              isVipSupporter={profile.isVipSupporter}
            />
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Full horizontal smooth scroll menu) */}
      <nav ref={navRef} aria-label="Menu principal" className="w-full max-w-full overflow-x-auto whitespace-nowrap flex-nowrap scrollbar-none px-2 sm:px-4 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs relative select-none shrink-0 scroll-smooth touch-pan-x">
        <button
          data-tab="quiz"
          onClick={() => {
            if (onGoHome) {
              onGoHome();
            } else {
              setActiveTab('quiz');
            }
          }}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'quiz' || activeTab === 'desafio'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-[10px] sm:text-[11px] leading-tight">Simulados</span>
        </button>

        <motion.button
          data-tab="duel"
          onClick={() => setActiveTab('duel')}
          animate={
            hasPendingDuelInvite
              ? {
                  scale: [1, 1.12, 0.96, 1.08, 1],
                  rotate: [0, -6, 6, -4, 4, 0],
                }
              : {}
          }
          transition={
            hasPendingDuelInvite
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: 'easeInOut',
                }
              : undefined
          }
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            hasPendingDuelInvite
              ? 'text-amber-500 dark:text-amber-400 font-black border-amber-500 bg-amber-500/15 dark:bg-amber-500/25 rounded-t-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/50'
              : activeTab === 'duel'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <div className="relative">
            <Swords
              size={16}
              className={hasPendingDuelInvite ? 'text-amber-500 animate-bounce' : ''}
            />
            {hasPendingDuelInvite ? (
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-black text-white items-center justify-center shadow-xs">!</span>
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] leading-tight flex items-center gap-1">
            Duelo 1v1
            {hasPendingDuelInvite && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </span>
        </motion.button>

        <button
          data-tab="rankings"
          onClick={() => setActiveTab('rankings')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'rankings'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <Trophy size={16} />
          <span className="text-[10px] sm:text-[11px] leading-tight">Rankings</span>
        </button>

        <button
          data-tab="shop"
          onClick={() => setActiveTab('shop')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'shop'
              ? 'text-yellow-600 dark:text-yellow-400 font-bold border-yellow-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <div className="relative">
            <ShoppingBag size={16} className="text-yellow-500 fill-yellow-500/20" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          </div>
          <span className="text-[10px] sm:text-[11px] leading-tight flex items-center gap-1">
            Loja
          </span>
        </button>

        <button
          data-tab="materials"
          onClick={() => setActiveTab('materials')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'materials'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <FileText size={16} className="text-amber-500 dark:text-amber-400" />
          <span className="text-[10px] sm:text-[11px] leading-tight">PDFs de Estudo</span>
        </button>

        <button
          data-tab="tutor"
          onClick={() => setActiveTab('tutor')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'tutor'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
          <span className="text-[10px] sm:text-[11px] leading-tight">Tutor IA</span>
        </button>

        <button
          data-tab="badges"
          onClick={() => {
            setActiveTab('badges');
            if (onOpenBadges) {
              onOpenBadges();
            }
          }}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'badges'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <Award size={16} className="text-amber-500 fill-amber-500/20" />
          <span className="text-[10px] sm:text-[11px] leading-tight">Conquistas</span>
        </button>

        <button
          data-tab="faq"
          onClick={() => setActiveTab('faq')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'faq' || activeTab === 'guide'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <HelpCircle size={16} />
          <span className="text-[10px] sm:text-[11px] leading-tight">Ajuda & FAQ</span>
        </button>
      </nav>
    </header>
  );
};

