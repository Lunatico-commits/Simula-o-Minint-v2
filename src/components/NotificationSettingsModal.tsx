import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  getStoredNotificationSettings, 
  saveNotificationSettings, 
  getNotificationPermissionState, 
  requestPushNotificationPermission, 
  triggerPushNotification,
  NotificationSettings
} from '../utils/notifications';
import { 
  Bell, BellOff, Check, X, Sparkles, Shield, Swords, Flame, Clock, 
  AlertCircle, CheckCircle2, Send, Vibrate
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(getStoredNotificationSettings());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermissionState(getNotificationPermissionState());
      setSettings(getStoredNotificationSettings());
      setFeedbackMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    playClickSound();
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const result = await requestPushNotificationPermission(profile);
    setPermissionState(getNotificationPermissionState());
    setIsSubmitting(false);

    if (result.granted) {
      const updated = { ...settings, fcmToken: result.token };
      setSettings(updated);
      await saveNotificationSettings(profile, updated);

      setFeedbackMessage({
        type: 'success',
        text: 'Notificações Push ativadas com sucesso! 🔔',
      });

      // Send immediate welcome test push
      triggerPushNotification('🔔 Notificações Ativadas!', {
        body: 'Receberás alertas sobre convites de duelo e lembretes diários de estudo para o MININT.',
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: result.error || 'Não foi possível ativar as notificações push.',
      });
    }
  };

  const handleToggleDuel = async (checked: boolean) => {
    playClickSound();
    const updated = { ...settings, duelInvitations: checked };
    setSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleToggleDaily = async (checked: boolean) => {
    playClickSound();
    const updated = { ...settings, dailyStudyReminder: checked };
    setSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleHourChange = async (hour: string) => {
    playClickSound();
    const updated = { ...settings, reminderHour: hour };
    setSettings(updated);
    await saveNotificationSettings(profile, updated);
  };

  const handleSendTestNotification = () => {
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Notificações Push (FCM)</h3>
              <p className="text-[10px] text-slate-400">Alertas de duelos e lembretes de estudos diários</p>
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

        <div className="p-4 space-y-4 text-xs">
          {/* Status Card */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
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
                <span className="font-extrabold text-slate-200">
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
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] transition-all shadow-md cursor-pointer shrink-0"
              >
                {isSubmitting ? 'A ativar...' : 'Ativar Agora'}
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

          {/* Notification Preferences */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Configurações dos Alertas</span>
            </h4>

            {/* Duel Invitations Toggle */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Swords size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-100">Convites de Duelo ⚔️</h5>
                  <p className="text-[10px] text-slate-400">Recebe alerta push imediato quando outro candidato te convidar para um duelo.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.duelInvitations}
                onChange={(e) => handleToggleDuel(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Daily Reminder Toggle */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Flame size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-100">Lembrete de Estudos Diários 🔥</h5>
                  <p className="text-[10px] text-slate-400">Recebe notificação diária para não perderes o teu bónus de sequência de estudos.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyStudyReminder}
                onChange={(e) => handleToggleDaily(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Reminder Time Selector */}
            {settings.dailyStudyReminder && (
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
                        settings.reminderHour === hour
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

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-2xl text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>Testar Push Agora</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
