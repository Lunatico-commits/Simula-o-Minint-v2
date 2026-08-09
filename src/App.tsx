import React, { useState, useEffect } from 'react';
import { UserProfile, SavedAccount, QuestionCategory, normalizeCategory } from './types';
import { getOrSignInUser, db, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, getDocFromCache, setDoc, updateDoc } from 'firebase/firestore';
import { Header } from './components/Header';
import { PracticeQuiz } from './components/PracticeQuiz';
import { DailyChallenge } from './components/DailyChallenge';
import { MultiplayerDuel, normalizeRoomCode } from './components/MultiplayerDuel';
import { RankingsView } from './components/RankingsView';
import { AIChatTutor } from './components/AIChatTutor';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationBanner } from './components/NotificationBanner';
import { listenForDuelInvitations, checkAndTriggerDailyStudyReminder } from './utils/notifications';
import { SupportProjectModal } from './components/SupportProjectModal';
import { FaqAndTestimonials } from './components/FaqAndTestimonials';
import { AdBanner } from './components/AdBanner';
import { RankUpModal } from './components/RankUpModal';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { BadgesModal } from './components/BadgesModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { UnifiedSettingsModal } from './components/UnifiedSettingsModal';
import { PreparationCertificate } from './components/PreparationCertificate';
import { WelcomeTourModal } from './components/WelcomeTourModal';
import { DailyStudyTip } from './components/DailyStudyTip';
import { LeagueUpdateModal } from './components/LeagueUpdateModal';
import { ConfirmExitModal } from './components/ConfirmExitModal';
import { ShareFAB } from './components/ShareFAB';
import { Footer } from './components/Footer';
import { checkUnlockedBadges, Badge } from './data/badges';
import { RANKS_MININT } from './data/branches';
import { generateReferralCode } from './utils/referral';
import { calculateCurrentStreak, updateStreakOnQuizCompletion } from './utils/streak';
import {
  evaluateWeeklyLeagueStatus,
  calculateDuelLeaguePoints,
  getCurrentISOWeek,
  WeeklyLeagueEvaluationResult,
} from './utils/league';
import { fireConfetti, fireRankUpConfetti } from './utils/confetti';
import { ShieldCheck, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'desafio' | 'duel' | 'rankings' | 'tutor' | 'guide' | 'faq' | 'badges'>('quiz');
  const [quizResetKey, setQuizResetKey] = useState(0);
  const [inviteRoomCode, setInviteRoomCode] = useState<string | null>(null);
  const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);

  // Check URL query parameters or pathname for direct 1v1 duel invite links (e.g. ?join=MNT-8421 or ?duelRoom=MNT-8421 or /duel/MNT-8421)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let roomParam =
        params.get('join') ||
        params.get('code') ||
        params.get('room') ||
        params.get('duelRoom') ||
        params.get('duel') ||
        params.get('sala');

      if (!roomParam && window.location.pathname) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && (lastPart.toUpperCase().startsWith('MNT') || lastPart.length >= 4)) {
          roomParam = lastPart;
        }
      }

      if (roomParam) {
        const normalized = normalizeRoomCode(roomParam);
        if (normalized && normalized.length >= 5) {
          setPendingRoomCode(normalized);
          setInviteRoomCode(normalized);
          setActiveTab('duel');
        }

        // Clean up URL parameter cleanly from browser history without reloading page
        const isPathRoute = window.location.pathname.match(/\/(duel|join|room|duels|sala)\//i);
        const cleanUrl = isPathRoute ? '/' : window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch (err) {
      console.warn('Erro ao ler parâmetro de convite de duelo da URL:', err);
    }
  }, []);

  // Active Session Navigation Guard State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'simulado' | 'duelo' | 'desafio'>('simulado');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isGlobalExitModalOpen, setIsGlobalExitModalOpen] = useState(false);

  const requestTabChange = (targetTab: string) => {
    if (isSessionActive && targetTab !== activeTab) {
      setPendingTab(targetTab);
      setIsGlobalExitModalOpen(true);
    } else {
      if (targetTab === 'quiz' && activeTab === 'quiz') {
        setQuizResetKey((prev) => prev + 1);
      }
      setActiveTab(targetTab as any);
    }
  };

  const handleConfirmGlobalExit = () => {
    setIsGlobalExitModalOpen(false);
    setIsSessionActive(false);
    if (pendingTab) {
      if (pendingTab === 'quiz') {
        setQuizResetKey((prev) => prev + 1);
      }
      setActiveTab(pendingTab as any);
      setPendingTab(null);
    }
  };

  const handleGoHome = () => {
    requestTabChange('quiz');
  };
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'audio' | 'notifications'>('audio');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialView, setAuthModalInitialView] = useState<'saved_accounts' | 'create_account' | 'login_existing'>('saved_accounts');
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    body: string;
    roomCode?: string;
    type?: 'duel' | 'daily' | 'general';
  } | null>(null);
  const [isRankUpModalOpen, setIsRankUpModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isWelcomeTourOpen, setIsWelcomeTourOpen] = useState(false);
  const [isDailyTipOpen, setIsDailyTipOpen] = useState(false);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [leagueUpdateResult, setLeagueUpdateResult] = useState<WeeklyLeagueEvaluationResult | null>(null);
  const [unlockedBadgeToAnnounce, setUnlockedBadgeToAnnounce] = useState<Badge | null>(null);
  const [rankUpData, setRankUpData] = useState<{
    newRank: typeof RANKS_MININT[0];
    oldRankTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme state ('dark' | 'light' | 'system')
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    const saved = localStorage.getItem('minint_theme_mode');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = themeMode === 'system' ? mediaQuery.matches : themeMode === 'dark';
      setEffectiveTheme(isDark ? 'dark' : 'light');

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light-theme');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light-theme');
      }
    };

    applyTheme();
    localStorage.setItem('minint_theme_mode', themeMode);

    const handleSystemChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
      return () => mediaQuery.removeListener(handleSystemChange);
    }
  }, [themeMode]);

  const cycleThemeMode = () => {
    setThemeMode((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  // Default initial profile
  const [profile, setProfile] = useState<UserProfile>({
    uid: 'guest_user',
    displayName: 'Candidato MININT',
    branch: 'PNA',
    avatarId: 'pna_1',
    province: 'Luanda',
    rankTitle: 'Candidato Recruta',
    totalXp: 100,
    level: 1,
    duelsPlayed: 0,
    duelsWon: 0,
    multiplayerDuelsPlayed: 0,
    multiplayerDuelsWon: 0,
    quizzesCompleted: 0,
    correctAnswersCount: 0,
    totalQuestionsAnswered: 0,
    categoryStats: {
      legislacao_minint: { correct: 0, total: 0 },
      direito_constituicao: { correct: 0, total: 0 },
      historia_cultura_geral: { correct: 0, total: 0 },
      portugues_raciocinio: { correct: 0, total: 0 },
      lingua_portuguesa: { correct: 0, total: 0 },
      cultura_geral: { correct: 0, total: 0 },
      direito_penal: { correct: 0, total: 0 },
      raciocinio_logico: { correct: 0, total: 0 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Helper to read saved account from local storage
  const getSavedAccountFromLocalStorage = (uid: string): UserProfile | null => {
    try {
      const rawUser = localStorage.getItem(`minint_user_profile_${uid}`);
      if (rawUser) {
        return JSON.parse(rawUser) as UserProfile;
      }
      const savedJson = localStorage.getItem('minint_saved_accounts');
      if (savedJson) {
        const accounts: SavedAccount[] = JSON.parse(savedJson);
        const match = accounts.find(a => a.uid === uid);
        if (match) {
          return {
            ...profile,
            uid: match.uid,
            displayName: match.displayName,
            branch: match.branch,
            avatarId: match.avatarId,
            province: match.province,
            rankTitle: match.rankTitle,
            role: match.role || 'candidate',
            totalXp: match.totalXp,
            referralCode: match.referralCode || generateReferralCode(match.displayName),
            emailOrPhone: match.emailOrPhone,
            password: match.password,
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao ler conta local:', e);
    }
    return null;
  };

  // Helper to save current profile into localStorage saved accounts list
  const saveAccountToLocalStorage = (accountProfile: UserProfile) => {
    try {
      const savedJson = localStorage.getItem('minint_saved_accounts');
      let accounts: SavedAccount[] = savedJson ? JSON.parse(savedJson) : [];

      const existingIndex = accounts.findIndex(a => a.uid === accountProfile.uid);
      const accountItem: SavedAccount = {
        uid: accountProfile.uid,
        displayName: accountProfile.displayName,
        branch: accountProfile.branch,
        avatarId: accountProfile.avatarId,
        province: accountProfile.province,
        rankTitle: accountProfile.rankTitle,
        role: accountProfile.role || 'candidate',
        totalXp: accountProfile.totalXp,
        referralCode: accountProfile.referralCode,
        emailOrPhone: accountProfile.emailOrPhone,
        password: accountProfile.password,
        lastLoginAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        accounts[existingIndex] = accountItem;
      } else {
        accounts.unshift(accountItem);
      }

      localStorage.setItem('minint_saved_accounts', JSON.stringify(accounts));
      localStorage.setItem('minint_current_account_uid', accountProfile.uid);
      localStorage.setItem(`minint_user_profile_${accountProfile.uid}`, JSON.stringify(accountProfile));
    } catch (e) {
      console.warn('Erro ao guardar conta localmente:', e);
    }
  };

  // Initialize Firebase User and Load/Save Profile
  useEffect(() => {
    async function initUser() {
      try {
        const activeUid = localStorage.getItem('minint_current_account_uid');
        let localSaved = activeUid ? getSavedAccountFromLocalStorage(activeUid) : null;
        
        // Check if there is a direct duel room parameter in URL or pending state
        const searchParams = new URLSearchParams(window.location.search);
        const urlRoomParam = searchParams.get('join') || searchParams.get('code') || searchParams.get('room') || searchParams.get('duelRoom') || searchParams.get('duel') || searchParams.get('sala');
        const hasRoomParam = !!(pendingRoomCode || inviteRoomCode || urlRoomParam);

        // If no authenticated session or account saved:
        if (!activeUid || !localSaved) {
          if (hasRoomParam) {
            // Visitor opened a direct duel link: create a unique guest profile for the visitor
            const guestUid = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
            const guestProfile: UserProfile = {
              uid: guestUid,
              displayName: `Candidato Recruta #${Math.floor(1000 + Math.random() * 9000)}`,
              branch: 'PNA',
              avatarId: 'pna_1',
              province: 'Luanda',
              rankTitle: 'Candidato Recruta',
              totalXp: 100,
              level: 1,
              duelsPlayed: 0,
              duelsWon: 0,
              multiplayerDuelsPlayed: 0,
              multiplayerDuelsWon: 0,
              quizzesCompleted: 0,
              correctAnswersCount: 0,
              totalQuestionsAnswered: 0,
              categoryStats: {
                legislacao_minint: { correct: 0, total: 0 },
                direito_constituicao: { correct: 0, total: 0 },
                historia_cultura_geral: { correct: 0, total: 0 },
                portugues_raciocinio: { correct: 0, total: 0 },
                lingua_portuguesa: { correct: 0, total: 0 },
                cultura_geral: { correct: 0, total: 0 },
                direito_penal: { correct: 0, total: 0 },
                raciocinio_logico: { correct: 0, total: 0 },
                informatica_basica: { correct: 0, total: 0 },
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setProfile(guestProfile);
            saveAccountToLocalStorage(guestProfile);
            localSaved = guestProfile;
          } else {
            setIsAuthModalOpen(true);
            setAuthModalInitialView('login_existing');
            setLoading(false);
            return;
          }
        }

        const authUser = await getOrSignInUser();
        if (localSaved) {
          setProfile(localSaved);
        }

        if (activeUid && activeUid !== 'guest_user') {
          const userRef = doc(db, 'users', activeUid);
          let userSnap = null;

          try {
            userSnap = await getDoc(userRef);
          } catch (fetchErr: any) {
            console.warn('Servidor do Firestore offline ou inacessível, tentando cache local:', fetchErr?.message || fetchErr);
            try {
              userSnap = await getDocFromCache(userRef);
            } catch (cacheErr) {
              console.warn('Documento não disponível na cache offline do Firestore');
            }
          }

          if (userSnap && userSnap.exists()) {
            let loadedData = userSnap.data() as UserProfile;
            if (!loadedData.referralCode) {
              loadedData.referralCode = generateReferralCode(loadedData.displayName);
            }

            // Evaluate Weekly League reset
            const leagueEval = evaluateWeeklyLeagueStatus(loadedData, []);
            if (leagueEval.result && leagueEval.result.hasReset) {
              loadedData = leagueEval.updatedProfile;
              if (leagueEval.result.outcome === 'promoted' || leagueEval.result.outcome === 'relegated') {
                setLeagueUpdateResult(leagueEval.result);
                setIsLeagueModalOpen(true);
              }
            }

            try {
              await setDoc(userRef, loadedData, { merge: true });
            } catch (e) {
              // Ignore offline write error
            }

            setProfile(loadedData);
            saveAccountToLocalStorage(loadedData);
          } else if (!localSaved) {
            // Create initial user in Firestore / local state
            const initialCode = generateReferralCode(authUser.displayName || 'CANDIDATO');
            const initialUser: UserProfile = {
              ...profile,
              uid: authUser.uid,
              displayName: authUser.displayName || `Candidato_${authUser.uid.substring(0, 5)}`,
              referralCode: initialCode,
              duelLeague: 'bronze',
              weeklyDuelPoints: 0,
              lastLeagueResetWeek: getCurrentISOWeek(),
            };
            try {
              if (authUser.uid && authUser.uid !== 'guest_user') {
                const newRef = doc(db, 'users', authUser.uid);
                await setDoc(newRef, initialUser);
              }
            } catch (e) {
              console.warn('Perfil inicial salvo localmente (modo offline)');
            }
            setProfile(initialUser);
            saveAccountToLocalStorage(initialUser);
          }
        }
      } catch (error) {
        console.warn('Modo offline ativo na inicialização do utilizador:', error);
      } finally {
        setLoading(false);
        // Automatically trigger welcome tour for new users
        if (!localStorage.getItem('minint_welcome_tour_seen')) {
          setTimeout(() => {
            setIsWelcomeTourOpen(true);
          }, 800);
        } else {
          // Check if Daily Study Tip should open today
          const today = new Date().toISOString().split('T')[0];
          const dontShowToday = localStorage.getItem('minint_daily_tip_dont_show');
          if (dontShowToday !== today) {
            setTimeout(() => {
              setIsDailyTipOpen(true);
            }, 1000);
          }
        }
      }
    }

    initUser();
  }, []);

  // Subscribe to live duel invitation push notifications & daily study reminders
  useEffect(() => {
    if (loading || !profile?.uid) return;

    // 1. Check & trigger daily study reminder if enabled
    checkAndTriggerDailyStudyReminder(profile);

    // 2. Listen for incoming duel invitations targeting candidates
    const unsubscribeDuel = listenForDuelInvitations(profile, (title, body, roomCode) => {
      setActiveNotification({
        id: `notif_${Date.now()}`,
        title,
        body,
        roomCode,
        type: 'duel',
      });
    });

    return () => {
      if (typeof unsubscribeDuel === 'function') {
        unsubscribeDuel();
      }
    };
  }, [profile?.uid, loading]);

  // Whenever visitor profile is ready and pending room code exists from a direct link, trigger duel tab
  useEffect(() => {
    if (pendingRoomCode && profile?.uid) {
      setInviteRoomCode(pendingRoomCode);
      setActiveTab('duel');
    }
  }, [pendingRoomCode, profile?.uid]);

  // Account Switching & Creation Handlers
  const handleSelectAccount = async (account: SavedAccount) => {
    setIsLoggedOut(false);
    setIsAuthModalOpen(false);
    localStorage.setItem('minint_current_account_uid', account.uid);
    try {
      const localSaved = getSavedAccountFromLocalStorage(account.uid);
      if (localSaved) {
        const merged = account.role ? { ...localSaved, role: account.role } : localSaved;
        setProfile(merged);
        saveAccountToLocalStorage(merged);
      }

      if (account.uid && account.uid !== 'guest_user') {
        const userRef = doc(db, 'users', account.uid);
        let userSnap = null;

        try {
          userSnap = await getDoc(userRef);
        } catch (e) {
          try {
            userSnap = await getDocFromCache(userRef);
          } catch (cacheErr) {
            console.warn('Conta offline carregada do armazenamento local:', cacheErr);
          }
        }

        if (userSnap && userSnap.exists()) {
          const freshProfile = userSnap.data() as UserProfile;
          const merged = account.role ? { ...freshProfile, role: account.role } : freshProfile;
          setProfile(merged);
          saveAccountToLocalStorage(merged);
        } else if (!localSaved) {
          const fallbackProfile: UserProfile = {
            ...profile,
            uid: account.uid,
            displayName: account.displayName,
            branch: account.branch,
            avatarId: account.avatarId,
            province: account.province,
            rankTitle: account.rankTitle,
            role: account.role || 'candidate',
            totalXp: account.totalXp,
            referralCode: account.referralCode || generateReferralCode(account.displayName),
          };
          setProfile(fallbackProfile);
          saveAccountToLocalStorage(fallbackProfile);
        }
      }
    } catch (e) {
      console.warn('Erro ao selecionar conta:', e);
    } finally {
      if (pendingRoomCode) {
        setInviteRoomCode(pendingRoomCode);
        setActiveTab('duel');
      }
    }
  };

  const handleCreateAccount = async (newProfile: UserProfile) => {
    setIsLoggedOut(false);
    setIsAuthModalOpen(false);
    try {
      if (newProfile.uid && newProfile.uid !== 'guest_user') {
        const userRef = doc(db, 'users', newProfile.uid);
        await setDoc(userRef, newProfile, { merge: true });
      }
      setProfile(newProfile);
      saveAccountToLocalStorage(newProfile);
    } catch (e) {
      console.warn('Erro ao gravar nova conta no Firestore:', e);
      setProfile(newProfile);
      saveAccountToLocalStorage(newProfile);
    } finally {
      if (pendingRoomCode) {
        setInviteRoomCode(pendingRoomCode);
        setActiveTab('duel');
      }
    }
  };

  const handleRemoveSavedAccount = (uid: string) => {
    try {
      const savedJson = localStorage.getItem('minint_saved_accounts');
      if (savedJson) {
        const accounts: SavedAccount[] = JSON.parse(savedJson);
        const filtered = accounts.filter(a => a.uid !== uid);
        localStorage.setItem('minint_saved_accounts', JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Erro ao remover conta salva:', e);
    }
  };

  // Update profile handler
  const handleSaveProfile = async (updatedData: Partial<UserProfile>) => {
    const updated = {
      ...profile,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);
    saveAccountToLocalStorage(updated);

    try {
      if (profile.uid && profile.uid !== 'guest_user') {
        const userRef = doc(db, 'users', profile.uid);
        await setDoc(userRef, updatedData, { merge: true });
      }
    } catch (error) {
      console.error('Erro ao guardar perfil no Firestore:', error);
    }
  };

  // Logout handler (Terminar Sessão)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro ao terminar sessão no Firebase Auth:', e);
    }

    // Clean active session identifiers only (preserve minint_saved_accounts)
    localStorage.removeItem('minint_current_account_uid');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('minint_user');
    localStorage.removeItem('minint_logged_in');

    const guestProfile: UserProfile = {
      uid: 'guest_user',
      displayName: 'Candidato MININT',
      branch: 'PNA',
      avatarId: 'pna_1',
      province: 'Luanda',
      rankTitle: 'Candidato Recruta',
      totalXp: 100,
      level: 1,
      duelsPlayed: 0,
      duelsWon: 0,
      quizzesCompleted: 0,
      correctAnswersCount: 0,
      totalQuestionsAnswered: 0,
      categoryStats: {
        informatica_basica: { correct: 0, total: 0 },
        legislacao_minint: { correct: 0, total: 0 },
        direito_constituicao: { correct: 0, total: 0 },
        historia_cultura_geral: { correct: 0, total: 0 },
        portugues_raciocinio: { correct: 0, total: 0 },
        lingua_portuguesa: { correct: 0, total: 0 },
        cultura_geral: { correct: 0, total: 0 },
        direito_penal: { correct: 0, total: 0 },
        raciocinio_logico: { correct: 0, total: 0 },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProfile(guestProfile);
    setIsProfileModalOpen(false);
    setIsLoggedOut(true);
    setAuthModalInitialView('saved_accounts');
    setIsAuthModalOpen(true);
  };

  // Update Stats after quiz or duel
  const handleUpdateStats = async (
    scoreCount: number,
    totalQuestionsCount: number,
    xpGained: number,
    isWin?: boolean,
    categoryBreakdown?: Partial<Record<QuestionCategory, { correct: number; total: number }>>,
    isMultiplayerReal?: boolean
  ) => {
    const oldRank = RANKS_MININT.slice().reverse().find(r => profile.totalXp >= r.minXp) || RANKS_MININT[0];
    const newTotalXp = profile.totalXp + xpGained;

    // Recalculate rank
    const currentRank = RANKS_MININT.slice().reverse().find(r => newTotalXp >= r.minXp) || RANKS_MININT[0];

    // Check level up / rank title unlock
    if (currentRank.level > oldRank.level || currentRank.title !== oldRank.title) {
      setRankUpData({
        newRank: currentRank,
        oldRankTitle: oldRank.title,
      });
      setIsRankUpModalOpen(true);
    } else {
      // Trigger standard confetti for good scores or duel wins
      if (isWin || (totalQuestionsCount > 0 && (scoreCount / totalQuestionsCount) >= 0.7)) {
        fireConfetti();
      }
    }

    // Merge and update categoryStats for the 4 official categories
    const currentStats: Record<string, { correct: number; total: number }> = {};
    
    // Copy existing stats normalized
    if (profile.categoryStats) {
      Object.entries(profile.categoryStats).forEach(([key, val]) => {
        if (val) {
          const statsVal = val as { correct: number; total: number };
          const normKey = normalizeCategory(key);
          if (!currentStats[normKey]) currentStats[normKey] = { correct: 0, total: 0 };
          currentStats[normKey].correct += statsVal.correct || 0;
          currentStats[normKey].total += statsVal.total || 0;
        }
      });
    }

    // Merge newly completed breakdown if provided
    if (categoryBreakdown) {
      Object.entries(categoryBreakdown).forEach(([key, val]) => {
        if (val) {
          const statsVal = val as { correct: number; total: number };
          const normKey = normalizeCategory(key);
          if (!currentStats[normKey]) currentStats[normKey] = { correct: 0, total: 0 };
          currentStats[normKey].correct += statsVal.correct || 0;
          currentStats[normKey].total += statsVal.total || 0;
        }
      });
    }

    // Update daily study streak counter
    const streakResult = updateStreakOnQuizCompletion(profile);

    const isRealMultiplayerPlayed = isWin !== undefined && isMultiplayerReal === true;
    const isRealMultiplayerWin = isWin === true && isMultiplayerReal === true;

    // Calculate weekly duel league points ONLY for real PvP multiplayer duels
    const duelPtsEarned = isRealMultiplayerPlayed ? calculateDuelLeaguePoints(isWin, scoreCount) : 0;
    const currentWeekISO = getCurrentISOWeek();

    const updated: UserProfile = {
      ...profile,
      totalXp: newTotalXp,
      rankTitle: currentRank.title,
      quizzesCompleted: profile.quizzesCompleted + 1,
      correctAnswersCount: profile.correctAnswersCount + scoreCount,
      totalQuestionsAnswered: profile.totalQuestionsAnswered + totalQuestionsCount,
      duelsPlayed: isRealMultiplayerPlayed ? profile.duelsPlayed + 1 : profile.duelsPlayed,
      duelsWon: isRealMultiplayerWin ? profile.duelsWon + 1 : profile.duelsWon,
      multiplayerDuelsPlayed: isRealMultiplayerPlayed 
        ? (profile.multiplayerDuelsPlayed || 0) + 1 
        : (profile.multiplayerDuelsPlayed || 0),
      multiplayerDuelsWon: isRealMultiplayerWin 
        ? (profile.multiplayerDuelsWon || 0) + 1 
        : (profile.multiplayerDuelsWon || 0),
      duelLeague: profile.duelLeague || 'bronze',
      weeklyDuelPoints: (profile.weeklyDuelPoints || 0) + duelPtsEarned,
      lastLeagueResetWeek: profile.lastLeagueResetWeek || currentWeekISO,
      categoryStats: currentStats as any,
      dailyStreak: streakResult.newStreak,
      lastDailyDate: streakResult.newLastDate,
      updatedAt: new Date().toISOString(),
    };

    // Evaluate unlocked Badges & Conquistas
    const badgeResult = checkUnlockedBadges(updated);
    if (badgeResult.newlyUnlockedBadges.length > 0) {
      updated.unlockedBadges = badgeResult.unlockedBadgeIds;
      updated.unlockedBadgeDates = badgeResult.unlockedBadgeDates;
      updated.totalXp += badgeResult.totalBonusXp;
      setUnlockedBadgeToAnnounce(badgeResult.newlyUnlockedBadges[0]);
    }

    setProfile(updated);
    saveAccountToLocalStorage(updated);

    try {
      if (profile.uid && profile.uid !== 'guest_user') {
        const userRef = doc(db, 'users', profile.uid);
        await setDoc(userRef, {
          totalXp: updated.totalXp,
          rankTitle: updated.rankTitle,
          quizzesCompleted: updated.quizzesCompleted,
          correctAnswersCount: updated.correctAnswersCount,
          totalQuestionsAnswered: updated.totalQuestionsAnswered,
          duelsPlayed: updated.duelsPlayed,
          duelsWon: updated.duelsWon,
          multiplayerDuelsPlayed: updated.multiplayerDuelsPlayed || 0,
          multiplayerDuelsWon: updated.multiplayerDuelsWon || 0,
          duelLeague: updated.duelLeague || 'bronze',
          weeklyDuelPoints: updated.weeklyDuelPoints || 0,
          lastLeagueResetWeek: updated.lastLeagueResetWeek,
          categoryStats: updated.categoryStats,
          dailyStreak: updated.dailyStreak,
          lastDailyDate: updated.lastDailyDate,
          unlockedBadges: updated.unlockedBadges || [],
          unlockedBadgeDates: updated.unlockedBadgeDates || {},
          updatedAt: updated.updatedAt,
        }, { merge: true });
      }
    } catch (error) {
      console.error('Erro ao actualizar estatísticas no Firestore:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse mb-3">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2C28 2 35 5.5 36 12C36 25 28 34 20 38C12 34 4 25 4 12C5 5.5 12 2 20 2Z" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2" />
            <path d="M20 9.5L22.2 14.2L27 15L23.5 18.3L24.3 23.2L20 21L15.7 23.2L16.5 18.3L13 15L17.8 14.2L20 9.5Z" fill="#fbbf24" />
            <circle cx="20" cy="16.6" r="2.5" fill="#dc2626" />
          </svg>
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-700 dark:text-slate-300">A carregar Simulados MININT...</p>
        <p className="text-[10px] text-slate-500 mt-1">Servidor Angola • Firebase Cloud Sync</p>
      </div>
    );
  }

  // Determine if user is authenticated (not guest)
  const isAuthenticated = Boolean(profile.uid && profile.uid !== 'guest_user');

  // Strict Authentication Guard: If not authenticated, render ONLY the AuthModal screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <AuthModal
          isOpen={true}
          allowClose={false}
          currentProfile={profile}
          initialView={authModalInitialView}
          onSelectAccount={handleSelectAccount}
          onCreateAccount={handleCreateAccount}
          onRemoveSavedAccount={handleRemoveSavedAccount}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />

        {/* Admin Panel Modal if triggered from discrete shield tap in AuthModal */}
        {isAdminPanelOpen && (
          <AdminPanelModal
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            currentProfile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Active Push Notification Toast Banner */}
      <NotificationBanner
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
        onAcceptDuel={(roomCode) => {
          setInviteRoomCode(roomCode);
          setActiveTab('duel');
        }}
      />

      {/* Top App Bar Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenNotifications={() => { setSettingsTab('notifications'); setIsSettingsModalOpen(true); }}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenAudioSettings={() => { setSettingsTab('audio'); setIsSettingsModalOpen(true); }}
        onOpenSettings={(tab) => { setSettingsTab(tab || 'audio'); setIsSettingsModalOpen(true); }}
        onOpenWelcomeTour={() => setIsWelcomeTourOpen(true)}
        onOpenDailyStudyTip={() => setIsDailyTipOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => requestTabChange(tab as any)}
        themeMode={themeMode}
        effectiveTheme={effectiveTheme}
        onCycleThemeMode={cycleThemeMode}
        onGoHome={handleGoHome}
        hasPendingDuelInvite={Boolean(
          (activeNotification && activeNotification.type === 'duel') || inviteRoomCode || pendingRoomCode
        )}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16 max-w-md w-full mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab === 'quiz' ? `quiz_${quizResetKey}` : activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {activeTab === 'quiz' && (
              <PracticeQuiz
                key={quizResetKey}
                profile={profile}
                onUpdateStats={handleUpdateStats}
                onNavigateTab={(tab) => requestTabChange(tab as any)}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
                onSessionActiveChange={(active) => {
                  setIsSessionActive(active);
                  if (active) setSessionType('simulado');
                }}
              />
            )}

            {activeTab === 'desafio' && (
              <DailyChallenge
                profile={profile}
                onUpdateStats={handleUpdateStats}
                onNavigateTab={(tab) => requestTabChange(tab as any)}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
                onSessionActiveChange={(active) => {
                  setIsSessionActive(active);
                  if (active) setSessionType('desafio');
                }}
              />
            )}

            {activeTab === 'duel' && (
              <MultiplayerDuel
                profile={profile}
                initialRoomCode={inviteRoomCode}
                onUpdateStats={handleUpdateStats}
                onSessionActiveChange={(active) => {
                  setIsSessionActive(active);
                  if (active) setSessionType('duelo');
                }}
              />
            )}

            {activeTab === 'rankings' && (
              <RankingsView
                currentProfile={profile}
                onPlayDuel={() => requestTabChange('duel')}
              />
            )}

            {activeTab === 'tutor' && (
              <AIChatTutor />
            )}

            {activeTab === 'guide' && (
              <FaqAndTestimonials
                profile={profile}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
                initialSubTab="guide"
              />
            )}

            {activeTab === 'faq' && (
              <FaqAndTestimonials
                profile={profile}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
                initialSubTab="faq"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Single Discrete Sticky Footer Ad Banner (Adsterra / Adsense) */}
      <AdBanner />

      {/* Footer & Legal Modal */}
      <Footer />

      {/* Profile Modal */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
        onOpenAuthModal={() => {
          setAuthModalInitialView('saved_accounts');
          setIsAuthModalOpen(true);
        }}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
        onOpenWelcomeTour={() => setIsWelcomeTourOpen(true)}
        onOpenBadgesModal={() => {
          setActiveTab('badges');
          setIsBadgesModalOpen(true);
        }}
      />

      {/* Badges & Achievements Modal */}
      <BadgesModal
        profile={profile}
        isOpen={isBadgesModalOpen || activeTab === 'badges'}
        onClose={() => {
          setIsBadgesModalOpen(false);
          if (activeTab === 'badges') {
            setActiveTab('quiz');
          }
        }}
      />

      {/* Badge Unlock Celebration Modal */}
      <BadgeUnlockModal
        badge={unlockedBadgeToAnnounce}
        onClose={() => setUnlockedBadgeToAnnounce(null)}
      />

      {/* Weekly League Update Modal */}
      <LeagueUpdateModal
        isOpen={isLeagueModalOpen}
        onClose={() => setIsLeagueModalOpen(false)}
        result={leagueUpdateResult}
        onPlayDuelNow={() => setActiveTab('duel')}
      />

      {/* Auth & Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (!isLoggedOut) {
            setIsAuthModalOpen(false);
          }
        }}
        allowClose={!isLoggedOut}
        currentProfile={profile}
        initialView={authModalInitialView}
        onSelectAccount={handleSelectAccount}
        onCreateAccount={handleCreateAccount}
        onRemoveSavedAccount={handleRemoveSavedAccount}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        currentProfile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
      />

      {/* Support / Voluntary Donation Modal */}
      <SupportProjectModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        currentProfile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
      />

      {/* Level / Rank Up Modal with Confetti */}
      {rankUpData && (
        <RankUpModal
          isOpen={isRankUpModalOpen}
          onClose={() => setIsRankUpModalOpen(false)}
          newRank={rankUpData.newRank}
          oldRankTitle={rankUpData.oldRankTitle}
        />
      )}

      {/* Unified App Settings Modal (Audio + Push Notifications) */}
      <UnifiedSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        initialTab={settingsTab}
      />

      {/* Push Notifications (FCM) Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        profile={profile}
      />

      {/* Audio & Sound Effects Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      {/* Official Preparation Certificate Modal */}
      <PreparationCertificate
        profile={profile}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />

      {/* Welcome Onboarding Tour Overlay Modal */}
      <WelcomeTourModal
        isOpen={isWelcomeTourOpen}
        onClose={() => setIsWelcomeTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Daily Study Tip Overlay Modal */}
      <DailyStudyTip
        isOpen={isDailyTipOpen}
        onClose={() => setIsDailyTipOpen(false)}
        onNavigateTab={(tab) => requestTabChange(tab as any)}
      />

      {/* Floating Share Button (Web Share API / Copy Link) */}
      <ShareFAB />

      {/* Global Navigation Active Session Guard Modal */}
      <ConfirmExitModal
        isOpen={isGlobalExitModalOpen}
        onClose={() => {
          setIsGlobalExitModalOpen(false);
          setPendingTab(null);
        }}
        onConfirm={handleConfirmGlobalExit}
        sessionType={sessionType}
      />
    </div>
  );
}
