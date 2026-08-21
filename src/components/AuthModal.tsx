import React, { useState, useEffect } from 'react';
import { UserProfile, SavedAccount, MININTBranch, AcademicLevel, ACADEMIC_LEVELS } from '../types';
import { MININT_BRANCHES, PROVINCES_ANGOLA, AVATAR_OPTIONS, RANKS_MININT, getAvatarOption } from '../data/branches';
import { BASE_AVATARS, getAvatarById, getAvatarAssetPath, getAvatarImagePath, getUserGender } from '../data/avatars';
import { generateReferralCode, processReferralReward } from '../utils/referral';
import { getCurrentISOWeek } from '../utils/league';
import { registerWithFirebaseAuth, loginWithFirebaseAuth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { TacticalAvatarIllustration } from './TacticalAvatarIllustration';
import { 
  Shield, 
  UserPlus, 
  LogIn, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  MapPin, 
  Gift, 
  ChevronRight, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Phone,
  Key
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  allowClose?: boolean;
  currentProfile: UserProfile;
  initialView?: 'saved_accounts' | 'create_account' | 'login_existing' | 'admin_login';
  onSelectAccount: (account: SavedAccount) => void;
  onCreateAccount: (newProfile: UserProfile, referralCodeInput?: string) => Promise<void>;
  onRemoveSavedAccount: (uid: string) => void;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allowClose = true,
  currentProfile,
  initialView = 'saved_accounts',
  onSelectAccount,
  onCreateAccount,
  onRemoveSavedAccount,
  onOpenAdminPanel,
}) => {
  const [view, setView] = useState<'saved_accounts' | 'create_account' | 'login_existing' | 'admin_login'>(initialView);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  
  // Registration Form State
  const [displayName, setDisplayName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState<MININTBranch>('PNA');
  const [province, setProvince] = useState('Luanda');
  const [avatarId, setAvatarId] = useState('pna_1');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('high_school');
  const [referralInput, setReferralInput] = useState('');
  
  // Login Existing State
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Discrete Admin Trigger State
  const [shieldClicks, setShieldClicks] = useState(0);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  
  // Feedback / Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load saved accounts from localStorage on modal open
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      loadSavedAccounts();
      setFeedbackMsg(null);
    }
  }, [isOpen, initialView]);

  const loadSavedAccounts = () => {
    try {
      const savedJson = localStorage.getItem('minint_saved_accounts');
      if (savedJson) {
        const parsed: SavedAccount[] = JSON.parse(savedJson);
        const uniqueAccounts: SavedAccount[] = [];
        const seenUids = new Set<string>();
        for (const acc of parsed) {
          if (acc && acc.uid && !seenUids.has(acc.uid)) {
            seenUids.add(acc.uid);
            uniqueAccounts.push(acc);
          }
        }
        setSavedAccounts(uniqueAccounts);
      } else {
        setSavedAccounts([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar contas salvas:', e);
    }
  };

  if (!isOpen) return null;

  // Handle Quick Select Saved Account
  const handleSelect = (account: SavedAccount) => {
    onSelectAccount(account);
    if (onClose) onClose();
  };

  // Handle Remove Saved Account
  const handleRemoveAccount = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    onRemoveSavedAccount(uid);
    const updated = savedAccounts.filter(a => a.uid !== uid);
    setSavedAccounts(updated);
    localStorage.setItem('minint_saved_accounts', JSON.stringify(updated));
  };

  // Handle Create New Account Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    const cleanEmailOrPhone = emailOrPhone.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmailOrPhone || !cleanPassword) {
      setFeedbackMsg({ type: 'error', text: 'Por favor preencha todos os campos obrigatórios.' });
      return;
    }

    if (cleanPassword.length < 4) {
      setFeedbackMsg({ type: 'error', text: 'A palavra-passe deve ter pelo menos 4 caracteres.' });
      return;
    }

    setIsLoading(true);
    setFeedbackMsg(null);

    let authUserUid: string | null = null;
    try {
      const authUser = await registerWithFirebaseAuth(cleanEmailOrPhone, cleanPassword);
      if (authUser) {
        authUserUid = authUser.uid;
      }
    } catch (authErr: any) {
      setIsLoading(false);
      setFeedbackMsg({ type: 'error', text: authErr?.message || 'Erro ao criar conta no serviço de autenticação.' });
      return;
    }

    const newUid = authUserUid || `candidato_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const myReferralCode = generateReferralCode(cleanName);
    const defaultRank = RANKS_MININT[0];
    const selectedGender = BASE_AVATARS.find(a => a.id === avatarId)?.gender || (avatarId.includes('female') ? 'female' : 'male');

    // Build new profile
    const newProfile: UserProfile = {
      uid: newUid,
      displayName: cleanName,
      emailOrPhone: cleanEmailOrPhone,
      password: cleanPassword,
      branch,
      gender: selectedGender,
      avatarId,
      province,
      academicLevel,
      rankTitle: defaultRank.title,
      totalXp: 100, // Starting XP bonus
      level: 1,
      duelsPlayed: 0,
      duelsWon: 0,
      multiplayerDuelsWon: 0,
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
        raciocinio_logico: { correct: 0, total: 0 },
        direito_penal: { correct: 0, total: 0 },
      },
      referralCode: myReferralCode,
      duelLeague: 'bronze',
      weeklyDuelPoints: 0,
      lastLeagueResetWeek: getCurrentISOWeek(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If referral code provided, attempt to give reward
    let referralSuccessMsg = '';
    if (referralInput.trim()) {
      const refResult = await processReferralReward(referralInput, newUid);
      if (refResult.success) {
        newProfile.referredBy = referralInput.trim().toUpperCase();
        referralSuccessMsg = ` 🎉 Código ativado! +5 Pontos foram atribuídos a ${refResult.inviterName}.`;
      }
    }

    try {
      await onCreateAccount(newProfile, referralInput.trim());
      setIsLoading(false);
      
      if (referralSuccessMsg) {
        alert(`Conta criada com sucesso!${referralSuccessMsg}`);
      }

      if (onClose) onClose();
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      setIsLoading(false);
      setFeedbackMsg({ type: 'error', text: 'Não foi possível concluir o registo. Tente novamente.' });
    }
  };

  // Handle 3 Taps on Shield Icon for Discrete Admin Access
  const handleShieldClick = () => {
    const nextClicks = shieldClicks + 1;
    setShieldClicks(nextClicks);
    if (nextClicks >= 3) {
      setShieldClicks(0);
      setView('admin_login');
      setFeedbackMsg({ type: 'success', text: 'Acesso Técnico de Administrador ativado. Introduza o PIN Mestre.' });
    }
  };

  // Handle Master PIN and Password submit for Secret Admin View
  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = adminPinInput.trim();
    const cleanPass = adminPassInput.trim();
    const activePass = localStorage.getItem('minint_admin_pass') || '0311';

    if (cleanPin !== '0311') {
      setFeedbackMsg({ type: 'error', text: 'PIN Mestre incorreto. Tente novamente.' });
      return;
    }

    if (cleanPass !== activePass) {
      setFeedbackMsg({ type: 'error', text: 'Palavra-Passe Mestre de Administrador incorreta.' });
      return;
    }

    // Validated both PIN Mestre and Palavra-Passe Mestre
    const adminAccount: SavedAccount = {
      uid: currentProfile.uid || `admin_${Date.now()}`,
      displayName: 'Administrador (MININT)',
      branch: 'PNA',
      avatarId: 'pna_1',
      province: 'Luanda',
      rankTitle: 'Comandante Geral',
      role: 'admin',
      totalXp: 9999,
      referralCode: 'MININT-ADM',
      emailOrPhone: 'antonioedson939606343@gmail.com',
      lastLoginAt: new Date().toISOString(),
    };
    onSelectAccount(adminAccount);
    setAdminPinInput('');
    setAdminPassInput('');
    if (onClose) onClose();
    if (onOpenAdminPanel) {
      setTimeout(() => onOpenAdminPanel(), 150);
    }
  };

  // Handle Login Existing Account Submit
  const handleLoginExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmailOrPhone = loginEmailOrPhone.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmailOrPhone || !cleanPassword) {
      setFeedbackMsg({ type: 'error', text: 'Preencha o E-mail/Telemóvel e a Palavra-Passe.' });
      return;
    }

    setIsLoading(true);
    setFeedbackMsg(null);

    // 1. Attempt Firebase Auth login
    try {
      const authUser = await loginWithFirebaseAuth(cleanEmailOrPhone, cleanPassword);
      if (authUser) {
        // Fetch Firestore doc
        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const fetchedProfile = userSnap.data() as UserProfile;
          onSelectAccount({
            uid: fetchedProfile.uid,
            displayName: fetchedProfile.displayName,
            branch: fetchedProfile.branch,
            avatarId: fetchedProfile.avatarId,
            province: fetchedProfile.province,
            rankTitle: fetchedProfile.rankTitle,
            totalXp: fetchedProfile.totalXp,
            referralCode: fetchedProfile.referralCode,
            emailOrPhone: fetchedProfile.emailOrPhone,
            password: cleanPassword,
            lastLoginAt: new Date().toISOString(),
          });
          setIsLoading(false);
          if (onClose) onClose();
          return;
        }
      }
    } catch (authErr: any) {
      setIsLoading(false);
      setFeedbackMsg({ type: 'error', text: authErr?.message || 'Palavra-passe incorreta. Por favor verifique e tente novamente.' });
      return;
    }

    // 2. Fallback: Search Firestore by emailOrPhone or check local saved accounts
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('emailOrPhone', '==', cleanEmailOrPhone));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const foundDoc = querySnap.docs[0];
        const fetchedProfile = foundDoc.data() as UserProfile;

        // Verify password if set on document
        if (fetchedProfile.password && fetchedProfile.password !== cleanPassword) {
          setIsLoading(false);
          setFeedbackMsg({ type: 'error', text: 'Palavra-passe incorreta. Por favor verifique e tente novamente.' });
          return;
        }

        onSelectAccount({
          uid: fetchedProfile.uid,
          displayName: fetchedProfile.displayName,
          branch: fetchedProfile.branch,
          avatarId: fetchedProfile.avatarId,
          province: fetchedProfile.province,
          rankTitle: fetchedProfile.rankTitle,
          totalXp: fetchedProfile.totalXp,
          referralCode: fetchedProfile.referralCode,
          emailOrPhone: fetchedProfile.emailOrPhone,
          password: cleanPassword,
          lastLoginAt: new Date().toISOString(),
        });
        setIsLoading(false);
        if (onClose) onClose();
        return;
      }
    } catch (err) {
      console.warn('Erro ao consultar utilizador no Firestore:', err);
    }

    // 3. Fallback: Local saved accounts match
    const matchedLocal = savedAccounts.find(
      a => a.emailOrPhone?.toLowerCase() === cleanEmailOrPhone || a.displayName.toLowerCase() === cleanEmailOrPhone
    );

    if (matchedLocal) {
      if (matchedLocal.password && matchedLocal.password !== cleanPassword) {
        setIsLoading(false);
        setFeedbackMsg({ type: 'error', text: 'Palavra-passe incorreta. Por favor verifique e tente novamente.' });
        return;
      }
      onSelectAccount({ ...matchedLocal, password: cleanPassword });
      setIsLoading(false);
      if (onClose) onClose();
      return;
    }

    setIsLoading(false);
    setFeedbackMsg({ type: 'error', text: 'Conta não encontrada. Verifique os dados ou crie uma nova conta.' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 text-slate-900 dark:text-slate-100 shadow-2xl my-auto relative">
        {/* Modal Close Button */}
        {allowClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-5">
          <button
            type="button"
            onClick={handleShieldClick}
            title="Símbolo Oficial MININT"
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 transition-transform cursor-pointer"
          >
            <Shield size={24} />
          </button>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            {view === 'saved_accounts' && 'Gestão de Contas'}
            {view === 'create_account' && 'Registo de Candidato'}
            {view === 'login_existing' && 'Login na Conta'}
            {view === 'admin_login' && 'Área Técnica (Administrador)'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {view === 'saved_accounts' && 'Selecione uma conta salva ou escolha uma opção abaixo'}
            {view === 'create_account' && 'Preencha todos os campos obrigatórios para criar a sua conta'}
            {view === 'login_existing' && 'Introduza o seu E-mail ou Telemóvel e Palavra-Passe'}
            {view === 'admin_login' && 'Insira o PIN Mestre de Administrador para aceder ao Servidor'}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {feedbackMsg && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-medium border ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        {/* VIEW 1: SAVED ACCOUNTS (FACEBOOK STYLE) */}
        {view === 'saved_accounts' && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {savedAccounts.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                  Nenhuma conta salva no dispositivo.
                </div>
              ) : (
                savedAccounts.map((acc, idx) => {
                  const bInfo = MININT_BRANCHES[acc.branch] || MININT_BRANCHES.PNA;
                  const isCurrent = acc.uid === currentProfile.uid;
                  const activeGender = acc.gender || getUserGender(acc.avatarId);
                  const activeAvatarId = acc.equippedUniform || acc.avatarId;

                  return (
                    <div
                      key={`${acc.uid}_${idx}`}
                      onClick={() => handleSelect(acc)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Dynamic Tactical PNG Avatar Badge */}
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/30 overflow-hidden flex items-center justify-center shadow-sm shrink-0 relative">
                          <TacticalAvatarIllustration
                            id={activeAvatarId}
                            gender={activeGender}
                            branch={acc.branch}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{acc.displayName}</p>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                Ativo
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">{bInfo.fullName}</span>
                            <span>•</span>
                            <span>{acc.province}</span>
                          </p>

                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                            {acc.totalXp} XP • {acc.rankTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.uid)}
                          title="Remover conta deste dispositivo"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setView('create_account');
                  setFeedbackMsg(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer uppercase tracking-wider"
              >
                <UserPlus size={16} />
                <span>Criar Nova Conta de Candidato</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('login_existing');
                  setFeedbackMsg(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn size={15} />
                <span>Entrar com Outra Conta</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE NEW ACCOUNT (REGISTO COMPLETO) */}
        {view === 'create_account' && (
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            {/* 1. Nome do Candidato */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Nome do Candidato *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Pedro Domingos"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
              />
            </div>

            {/* 2. E-mail ou Telemóvel */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                E-mail ou Telemóvel *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Ex: pedro@gmail.com ou 923123456"
                  className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* 3. Palavra-Passe (PIN ou Senha) */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Palavra-Passe (PIN ou Senha) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina uma palavra-passe segura"
                  className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* 4. Ramo Pretendido */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Ramo Pretendido *
              </label>
              <select
                value={branch}
                onChange={(e) => {
                  const b = e.target.value as MININTBranch;
                  setBranch(b);
                  const av = BASE_AVATARS.find(a => a.organ === b) || AVATAR_OPTIONS.find(a => a.branch === b);
                  if (av) setAvatarId(av.id);
                }}
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-sm"
              >
                {(Object.keys(MININT_BRANCHES) as MININTBranch[]).map((key) => (
                  <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {key} - {MININT_BRANCHES[key].fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* 4.1 Escolha do Avatar Oficial (10 Avatares 3D Masculino/Feminino) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold">
                  Avatar Oficial de Candidato *
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  10 Fardas Oficiais
                </span>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar p-1 bg-slate-100 dark:bg-[#0F1115] rounded-xl border border-slate-200 dark:border-white/5">
                {BASE_AVATARS.map((av) => {
                  const isSelected = avatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setAvatarId(av.id);
                        if (av.organ) setBranch(av.organ as MININTBranch);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden mb-1 flex items-center justify-center bg-slate-900/50 relative">
                        <TacticalAvatarIllustration
                          id={av.id}
                          gender={av.gender}
                          branch={av.organ as MININTBranch}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-black shadow-xs">
                            ✓
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black leading-tight text-slate-900 dark:text-slate-100 truncate w-full">
                        {av.title.split(' - ')[1] || av.title}
                      </span>
                      <span className="text-[8.5px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {av.organ} ({av.gender === 'female' ? 'Fem' : 'Masc'})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Província de Candidatura */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Província de Candidatura *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-sm"
              >
                {PROVINCES_ANGOLA.map((p) => (
                  <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Nível Académico do Concurso */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Nível Académico do Concurso *
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-sm"
              >
                {ACADEMIC_LEVELS.map((level) => (
                  <option key={level.id} value={level.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {level.label} ({level.sublabel})
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Código de Indicação / Convite (Opcional) */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 space-y-1">
              <label className="block text-[10px] uppercase tracking-[0.1em] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                <Gift size={13} className="text-amber-500" />
                <span>Código de Indicação / Convite (Opcional)</span>
              </label>
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="Ex: MININT-MARIA-204"
                className="w-full bg-white dark:bg-[#0F1115] border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('saved_accounts')}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50"
              >
                <UserCheck size={16} />
                <span>{isLoading ? 'A Registar...' : 'Registar Conta'}</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: LOGIN EXISTING ACCOUNT (APENAS 2 CAMPOS) */}
        {view === 'login_existing' && (
          <form onSubmit={handleLoginExistingSubmit} className="space-y-4">
            {/* Campo 1: E-mail ou Telemóvel */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                E-mail ou Telemóvel *
              </label>
              <input
                type="text"
                required
                value={loginEmailOrPhone}
                onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                placeholder="Ex: pedro@gmail.com ou 923123456"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
              />
            </div>

            {/* Campo 2: Palavra-Passe */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                Palavra-Passe *
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Introduza a sua palavra-passe"
                  className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('saved_accounts')}
                className="flex-1 py-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50"
              >
                <LogIn size={16} />
                <span>{isLoading ? 'A Entrar...' : 'Entrar na Conta'}</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: SECRET ADMIN MASTER PIN LOGIN */}
        {view === 'admin_login' && (
          <form onSubmit={handleAdminPinSubmit} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-center">
              <Key className="mx-auto text-amber-500 mb-1" size={24} />
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Autenticação Mestre ADM</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Insira o PIN Mestre e a Palavra-Passe Mestre de Administrador para aceder.
              </p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                1. PIN Mestre *
              </label>
              <input
                type="password"
                required
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="Insira o PIN"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400 font-bold mb-1">
                2. Palavra-Passe Mestre *
              </label>
              <input
                type="password"
                required
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                placeholder="Palavra-Passe Mestre de Administrador"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput('');
                  setAdminPassInput('');
                  setView('saved_accounts');
                }}
                className="flex-1 py-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Lock size={16} />
                <span>Entrar no Painel</span>
              </button>
            </div>
          </form>
        )}

        {/* Discrete Footer Link for Admin Technical Access */}
        {view !== 'admin_login' && (
          <div className="text-center pt-3 border-t border-slate-200/60 dark:border-white/5 mt-3">
            <button
              type="button"
              onClick={() => setView('admin_login')}
              className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 font-mono transition-colors cursor-pointer uppercase tracking-widest"
            >
              • Área Técnica • Servidor MININT •
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

