import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, isAdminUser } from '../types';
import { MININT_BRANCHES, RANKS_MININT, getAvatarOption } from '../data/branches';
import { getSoundEnabled, setSoundEnabled, playClickSound } from '../utils/audio';
import { calculateCurrentStreak } from '../utils/streak';
import { Lightbulb, Shield, Trophy, User, Wifi, WifiOff, Sparkles, BookOpen, Swords, Sun, Moon, Monitor, ShieldCheck, HelpCircle, Volume2, VolumeX, Flame, Bell, Award, MessageSquareQuote, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { BranchIllustration } from './BranchIllustration';

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
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioOn, setIsAudioOn] = useState(() => getSoundEnabled());
  const branchInfo = MININT_BRANCHES[profile.branch] || MININT_BRANCHES.PNA;

  useEffect(() => {
    setIsAudioOn(getSoundEnabled());
  });

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
      <div className="w-full max-w-md sm:max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2">
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
          className="flex items-center gap-2 cursor-pointer group text-left focus:outline-hidden transition-transform active:scale-95 select-none shrink-0"
        >
          <MinintShieldLogo size={32} />

          <div>
            <h1 className="text-sm sm:text-lg tracking-tight flex items-center gap-1 leading-none group-hover:opacity-90">
              <span className="text-slate-800 dark:text-white font-extrabold">Simulados</span>
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-red-600 bg-clip-text text-transparent font-black">MININT</span>
            </h1>
            <p className="hidden sm:flex text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 items-center gap-1 font-mono">
              <span className="font-bold text-amber-600 dark:text-amber-400">Oficial {branchInfo.id}</span>
              <span>•</span>
              <span className="text-slate-800 dark:text-slate-300 font-sans">{profile.province || 'Luanda'}</span>
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto scrollbar-none py-0.5">
          {/* Admin Panel Button (Exclusive for ADM) */}
          {isAdminUser(profile) && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              title="Painel de Gestão (ADM)"
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
            >
              <ShieldCheck size={14} className="text-slate-950" />
              <span className="hidden sm:inline uppercase tracking-wider">Painel ADM</span>
            </button>
          )}

          {/* Unified Settings Button (Audio + Push Notifications) */}
          <button
            onClick={() => {
              playClickSound();
              if (onOpenSettings) {
                onOpenSettings();
              } else if (onOpenAudioSettings) {
                onOpenAudioSettings();
              } else if (onOpenNotifications) {
                onOpenNotifications();
              }
            }}
            title="Configurações (Som, Áudio & Notificações)"
            aria-label="Abrir Configurações"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0 relative"
          >
            <Sliders size={14} className="text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Configurações
            </span>
          </button>

          {/* Daily Study Tip Button */}
          {onOpenDailyStudyTip && (
            <button
              onClick={() => {
                playClickSound();
                onOpenDailyStudyTip();
              }}
              title="Dica Rápida de Estudo do Dia"
              aria-label="Dica do Dia"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
            >
              <Lightbulb size={14} className="text-amber-500 dark:text-amber-400 animate-pulse" />
              <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                Dica do Dia
              </span>
            </button>
          )}

          {/* Welcome Tour Button */}
          {onOpenWelcomeTour && (
            <button
              onClick={() => {
                playClickSound();
                onOpenWelcomeTour();
              }}
              title="Guia & Tour de Boas-Vindas"
              aria-label="Tour de Boas-Vindas"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
            >
              <HelpCircle size={14} className="text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                Tour
              </span>
            </button>
          )}

          {/* Theme Switcher Button (Compact Icon on Mobile) */}
          {onCycleThemeMode && (
            <button
              onClick={onCycleThemeMode}
              title={
                themeMode === 'dark'
                  ? 'Modo Escuro Ativo'
                  : themeMode === 'light'
                  ? 'Modo Claro Ativo'
                  : 'Modo Automático/Sistema'
              }
              aria-label="Alternar tema"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
            >
              {themeMode === 'dark' && <Moon size={14} className="text-amber-500 dark:text-amber-400" />}
              {themeMode === 'light' && <Sun size={14} className="text-amber-500 dark:text-amber-400" />}
              {themeMode === 'system' && <Monitor size={14} className="text-sky-500 dark:text-sky-400" />}
              <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {themeMode === 'dark' ? 'Escuro' : themeMode === 'light' ? 'Claro' : 'Auto'}
              </span>
            </button>
          )}

          {/* Daily Study Streak Tracker (Ofensiva) */}
          <button
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title={`Ofensiva de Estudo Diário: ${calculateCurrentStreak(profile).streak} ${calculateCurrentStreak(profile).streak === 1 ? 'dia seguido' : 'dias seguidos'}!`}
            aria-label="Ofensiva de Estudo Diário"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0 ${
              calculateCurrentStreak(profile).streak > 0
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
            }`}
          >
            <Flame
              size={15}
              className={
                calculateCurrentStreak(profile).streak > 0
                  ? 'text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                  : 'text-slate-400 dark:text-slate-500'
              }
            />
            <span className="text-[11px] font-mono font-black tracking-tight text-slate-900 dark:text-slate-100">
              {calculateCurrentStreak(profile).streak}d
            </span>
          </button>

          {/* Weekly Duel League Badge Button */}
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('rankings');
            }}
            title={`Sua Liga Actual: ${
              (profile.duelLeague || 'bronze') === 'ouro'
                ? 'Liga Ouro 🥇'
                : (profile.duelLeague || 'bronze') === 'prata'
                ? 'Liga Prata 🥈'
                : 'Liga Bronze 🥉'
            } (${profile.weeklyDuelPoints || 0} Pts esta semana)`}
            aria-label="Liga de Duelos Semanal"
            className="p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
          >
            <span className="text-xs sm:text-sm">
              {(profile.duelLeague || 'bronze') === 'ouro'
                ? '🥇'
                : (profile.duelLeague || 'bronze') === 'prata'
                ? '🥈'
                : '🥉'}
            </span>
            <span className="hidden sm:inline text-[10px] font-mono font-black tracking-wider uppercase text-amber-600 dark:text-amber-300">
              {profile.weeklyDuelPoints || 0} Pts
            </span>
          </button>

          {/* User Profile Avatar Circle Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title={`Perfil de ${profile.displayName || 'Candidato'} (${profile.totalXp} XP)`}
            aria-label="Abrir Perfil"
            className="p-0.5 rounded-full hover:ring-2 hover:ring-amber-500/50 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${branchInfo.badgeBg} flex items-center justify-center text-slate-100 font-bold border border-amber-500/50 shadow-inner shrink-0 ${userAvatar.isCustomInitials ? 'font-mono font-black text-amber-300 text-[10px] tracking-wider' : 'text-base'}`}>
              {userAvatar.symbol}
            </div>
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

        <button
          data-tab="duel"
          onClick={() => setActiveTab('duel')}
          className={`py-2 px-2.5 sm:px-3 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer border-b-2 ${
            activeTab === 'duel'
              ? 'text-amber-600 dark:text-amber-400 font-bold border-amber-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-transparent'
          }`}
        >
          <div className="relative">
            <Swords size={16} />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <span className="text-[10px] sm:text-[11px] leading-tight">Duelo 1v1</span>
        </button>

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

