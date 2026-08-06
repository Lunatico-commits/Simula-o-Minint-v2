import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Volume2, VolumeX, Play, Check, X, Music, Sparkles, Trophy, Award, 
  CheckCircle2, XCircle, Shield, Sliders, Zap, Bell, BellOff, Swords, 
  Flame, Clock, AlertCircle, Send
} from 'lucide-react';
import { 
  getSoundEnabled, 
  setSoundEnabled, 
  getSoundPack, 
  setSoundPack, 
  SoundPack, 
  playClickSound, 
  playCorrectSound, 
  playIncorrectSound, 
  playQuizCompleteSound, 
  playVictorySound, 
  playDefeatSound, 
  playLevelUpSound 
} from '../utils/audio';
import { 
  getStoredNotificationSettings, 
  saveNotificationSettings, 
  getNotificationPermissionState, 
  requestPushNotificationPermission, 
  triggerPushNotification, 
  NotificationSettings 
} from '../utils/notifications';

interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  initialTab?: 'audio' | 'notifications';
}

const SOUND_PACKS: Array<{ 
  id: SoundPack; 
  title: string; 
  subtitle: string; 
  icon: React.FC<{ size?: number; className?: string }>; 
  badge: string 
}> = [
  {
    id: 'arcade',
    title: 'Arcade / Gamificado',
    subtitle: 'Estilo retro com beeps divertidos',
    icon: Sparkles,
    badge: '🕹️ Retro'
  },
  {
    id: 'military',
    title: 'Militar / Concurso',
    subtitle: 'Sons marcantes e solenes',
    icon: Shield,
    badge: '🎖️ Solene'
  },
  {
    id: 'minimalist',
    title: 'Minimalista',
    subtitle: 'Sons curtos e discretos',
    icon: Music,
    badge: '🤫 Discreto'
  }
];

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  initialTab = 'audio',
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'notifications'>(initialTab);

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => getSoundEnabled());
  const [currentPack, setCurrentPack] = useState<SoundPack>(() => getSoundPack());
  const [testingSound, setTestingSound] = useState<string | null>(null);

  // Notifications state
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(getStoredNotificationSettings());
  const [isSubmittingNotif, setIsSubmittingNotif] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAudioEnabled(getSoundEnabled());
      setCurrentPack(getSoundPack());
      setPermissionState(getNotificationPermissionState());
      setNotifSettings(getStoredNotificationSettings());
      setFeedbackMessage(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Audio handlers
  const handleToggleAudio = (nextVal: boolean) => {
    setAudioEnabled(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) {
      playClickSound();
    }
  };

  const handleSelectPack = (pack: SoundPack) => {
    setSoundPack(pack);
    setCurrentPack(pack);
    if (audioEnabled) {
      playCorrectSound();
    }
  };

  const triggerSoundTest = (soundType: string, fn: () => void) => {
    if (!audioEnabled) return;
    setTestingSound(soundType);
    fn();
    setTimeout(() => {
      setTestingSound(null);
    }, 600);
  };

  // Notification handlers
  const handleEnablePush = async () => {
    playClickSound();
    setIsSubmittingNotif(true);
    setFeedbackMessage(null);

    const result = await requestPushNotificationPermission(profile);
    setPermissionState(getNotificationPermissionState());
    setIsSubmittingNotif(false);

    if (result.granted) {
      const updated = { ...notifSettings, fcmToken: result.token };
      setNotifSettings(updated);
      await saveNotificationSettings(profile, updated);

      setFeedbackMessage({
        type: 'success',
        text: 'Notificações Push ativadas com sucesso! 🔔',
      });

      triggerPushNotification('🔔 Notificações Ativadas!', {
        body: 'Receberás alertas de duelos e lembretes diários de estudo para o Concurso MININT.',
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: result.error || 'Não foi possível ativar as notificações push.',
      });
    }
  };

  const handleToggleDuelAlerts = async (checked: boolean) => {
    playClickSound();
    const updated = { ...notifSettings, duelInvitations: checked };
    setNotifSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleToggleDailyReminder = async (checked: boolean) => {
    playClickSound();
    const updated = { ...notifSettings, dailyStudyReminder: checked };
    setNotifSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleHourChange = async (hour: string) => {
    playClickSound();
    const updated = { ...notifSettings, reminderHour: hour };
    setNotifSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleSendTestPush = () => {
    playClickSound();
    if (permissionState !== 'granted') {
      setFeedbackMessage({
        type: 'error',
        text: 'Primeiro precisa de clicar em "Ativar Notificações Push" abaixo.',
      });
      return;
    }

    const sent = triggerPushNotification('⚔️ Duelo de Teste MININT!', {
      body: 'O candidato Francisco Neto desafiou-te para um duelo de 5 questões PNA. (Notificação de Teste)',
    });

    if (sent) {
      setFeedbackMessage({
        type: 'success',
        text: 'Notificação de teste enviada! Verifica o teu ecrã ou barra de notificações.',
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao enviar notificação de teste.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Configurações Gerais</h3>
              <p className="text-[10px] text-slate-400">Efeitos de áudio, pacotes de som e notificações push</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('audio');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Volume2 size={16} />
            <span>🔊 Som & Áudio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('notifications');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bell size={16} />
            <span>🔔 Notificações</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: SOM & ÁUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Toggle General Audio */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    audioEnabled
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {audioEnabled ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-100 text-xs">Efeitos Sonoros do App</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sons para acertos, erros, vitória e níveis</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleAudio(!audioEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    audioEnabled ? 'bg-amber-500' : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${
                    audioEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Sound Packs Selection */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Music size={13} />
                  <span>Escolha o Estilo de Áudio</span>
                </h4>

                <div className="space-y-2">
                  {SOUND_PACKS.map((pack) => {
                    const IconComp = pack.icon;
                    const isSelected = currentPack === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => handleSelectPack(pack.id)}
                        disabled={!audioEnabled}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          !audioEnabled ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800' :
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-slate-100 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-amber-400'
                          }`}>
                            <IconComp size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-100">{pack.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                                {pack.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pack.subtitle}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Test Panel */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Play size={12} />
                  <span>Testar Efeitos Sonoros</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerSoundTest('correct', playCorrectSound)}
                    disabled={!audioEnabled}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      testingSound === 'correct'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>Resposta Certa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSoundTest('incorrect', playIncorrectSound)}
                    disabled={!audioEnabled}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      testingSound === 'incorrect'
                        ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-sm'
                        : 'bg-slate-900 text-rose-400 border-slate-800 hover:border-rose-500/40'
                    }`}
                  >
                    <XCircle size={14} />
                    <span>Resposta Errada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSoundTest('complete', playQuizCompleteSound)}
                    disabled={!audioEnabled}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      testingSound === 'complete'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-900 text-amber-400 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <Trophy size={14} />
                    <span>Simulado Concluído</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSoundTest('victory', playVictorySound)}
                    disabled={!audioEnabled}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      testingSound === 'victory'
                        ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-sm'
                        : 'bg-slate-900 text-purple-400 border-slate-800 hover:border-purple-500/40'
                    }`}
                  >
                    <Award size={14} />
                    <span>Vitória no Duelo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICAÇÕES */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Permission Status Card */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    permissionState === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : permissionState === 'denied'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {permissionState === 'granted' ? <CheckCircle2 size={18} /> : permissionState === 'denied' ? <BellOff size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Estado das Notificações</span>
                    <span className="font-extrabold text-slate-200 text-xs">
                      {permissionState === 'granted' && '🟢 Ativadas e Prontas'}
                      {permissionState === 'denied' && '🔴 Permissão Recusada'}
                      {permissionState === 'default' && '🟡 Permissão Pendente'}
                      {permissionState === 'unsupported' && '⚪ Não Suportado neste Navegador'}
                    </span>
                  </div>
                </div>

                {permissionState !== 'granted' && permissionState !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    disabled={isSubmittingNotif}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] transition-all shadow-md cursor-pointer shrink-0"
                  >
                    {isSubmittingNotif ? 'A ativar...' : 'Ativar Agora'}
                  </button>
                )}
              </div>

              {/* Feedback Message */}
              {feedbackMessage && (
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              {/* Preferences list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Configurações dos Alertas</span>
                </h4>

                {/* Duel Invitations Toggle */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Swords size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100 text-xs">Convites de Duelo ⚔️</h5>
                      <p className="text-[10px] text-slate-400">Recebe alerta push imediato quando outro candidato te convidar para um duelo.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.duelInvitations}
                    onChange={(e) => handleToggleDuelAlerts(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Daily Study Reminder Toggle */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Flame size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100 text-xs">Lembrete de Estudos Diários 🔥</h5>
                      <p className="text-[10px] text-slate-400">Recebe notificação diária para não perderes o teu bónus de sequência de estudos.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.dailyStudyReminder}
                    onChange={(e) => handleToggleDailyReminder(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Reminder Hour Selection */}
                {notifSettings.dailyStudyReminder && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" />
                      <span>Horário Preferido do Lembrete Diário</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['08:00', '09:00', '12:00', '19:00', '20:00', '21:00'].map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleHourChange(hour)}
                          className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                            notifSettings.reminderHour === hour
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Test Notification Action */}
              <button
                type="button"
                onClick={handleSendTestPush}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold rounded-2xl text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                <span>Testar Push Agora</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
