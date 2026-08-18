import { getFirebaseMessaging, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { UserProfile, DuelRoom } from '../types';
import { getTodayDateString } from './dailyChallenge';

export interface NotificationSettings {
  duelInvitations: boolean;
  dailyStudyReminder: boolean;
  reminderHour: string; // "09:00", "19:00", etc.
  fcmToken?: string;
}

const SETTINGS_KEY = 'minint_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  duelInvitations: true,
  dailyStudyReminder: true,
  reminderHour: '09:00',
};

/**
 * Gets saved notification settings from localStorage
 */
export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Saves notification settings to localStorage & updates Firestore user profile
 */
export async function saveNotificationSettings(
  profile: UserProfile,
  settings: NotificationSettings
): Promise<void> {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    if (profile.uid && profile.uid !== 'guest_user') {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, { notificationSettings: settings }, { merge: true });
    }
  } catch (e) {
    console.warn('Erro ao guardar definições de notificação:', e);
  }
}

/**
 * Checks if Notification API is supported by the browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Returns current browser notification permission
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Requests Notification permission and registers FCM Token if possible
 */
export async function requestPushNotificationPermission(profile?: UserProfile): Promise<{
  granted: boolean;
  token?: string;
  error?: string;
}> {
  if (!isNotificationSupported()) {
    return { granted: false, error: 'O seu navegador não suporta notificações push.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { granted: false, error: 'Permissão de notificações foi recusada no navegador.' };
    }

    // Attempt to register Service Worker and get FCM Token
    let token: string | undefined = undefined;
    try {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        // VAPID key placeholder or standard Firebase Web push registration
        token = await getToken(messaging, {
          vapidKey: 'BEl-118_v00-placeholder_minint_angola_vapid_key_ai_studio',
        }).catch(() => undefined);

        if (token && profile?.uid) {
          // Save push token in Firestore under user_push_tokens collection
          const tokenRef = doc(db, 'user_push_tokens', profile.uid);
          await setDoc(tokenRef, {
            uid: profile.uid,
            displayName: profile.displayName,
            token,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch (fcmErr) {
      console.warn('Aviso: FCM Token não obtido (usando fallback de notificações locais do navegador):', fcmErr);
    }

    return { granted: true, token };
  } catch (err: any) {
    return { granted: false, error: err?.message || 'Erro ao solicitar permissão de notificação.' };
  }
}

/**
 * Sends a native browser push notification
 */
export function triggerPushNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    tag?: string;
    onClickUrl?: string;
    data?: any;
  }
) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notifOptions: NotificationOptions = {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'minint-notif',
      data: options.data,
    };

    const notification = new Notification(title, notifOptions);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      if (options.onClickUrl) {
        window.location.hash = options.onClickUrl;
      }
    };

    return true;
  } catch (e) {
    console.warn('Erro ao disparar notificação local:', e);
    return false;
  }
}

/**
 * Sends a duel invitation push notification targeting a candidate
 */
export async function sendDuelInvitationNotification(
  senderProfile: UserProfile,
  roomCode: string,
  targetBranch?: string
) {
  const title = `⚔️ Novo Convite de Duelo MININT!`;
  const body = `${senderProfile.displayName} (${senderProfile.branch}) desafiou-te para um duelo de 5 questões! Código: ${roomCode}`;

  // 1. Send local browser push notification
  triggerPushNotification(title, {
    body,
    tag: `duel-invite-${roomCode}`,
    onClickUrl: '#duel',
  });

  // 2. Broadcast duel invitation in Firestore collection for subscribers
  try {
    const inviteRef = doc(db, 'duel_invitations', `invite_${roomCode}`);
    await setDoc(inviteRef, {
      roomCode,
      senderUid: senderProfile.uid,
      senderName: senderProfile.displayName,
      senderBranch: senderProfile.branch,
      targetBranch: targetBranch || 'TODOS',
      createdAt: Date.now(),
      status: 'active',
    });
  } catch (e) {
    console.warn('Erro ao registar convite de duelo no Firestore:', e);
  }
}

/**
 * Listens for active duel invitations targeting this user / branch and fires a push notification
 */
export function listenForDuelInvitations(
  currentProfile: UserProfile,
  onNotificationReceived: (title: string, body: string, roomCode: string) => void
) {
  if (!currentProfile.uid) return () => {};

  try {
    const q = query(
      collection(db, 'duel_invitations'),
      where('status', '==', 'active'),
      limit(10)
    );

    const initialTime = Date.now();

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const invite = change.doc.data();
          // Avoid triggering for your own created invitations or old invitations (> 5 min)
          if (
            invite &&
            invite.senderUid !== currentProfile.uid &&
            invite.createdAt &&
            Date.now() - invite.createdAt < 5 * 60 * 1000 &&
            invite.createdAt >= initialTime - 5000
          ) {
            const title = `⚔️ Convite de Duelo MININT!`;
            const body = `${invite.senderName} (${invite.senderBranch}) enviou um convite para duelo ao vivo! Entra com o código ${invite.roomCode}`;

            // Trigger push notification
            triggerPushNotification(title, {
              body,
              tag: `duel-invite-${invite.roomCode}`,
              onClickUrl: '#duel',
            });

            onNotificationReceived(title, body, invite.roomCode);
          }
        }
      });
    }, (err) => {
      console.warn('Erro no observador de convites de duelo:', err);
    });
  } catch (e) {
    console.warn('Erro ao subscrever convites de duelo:', e);
    return () => {};
  }
}

/**
 * Sends a notification entry to the followed user's notifications subcollection
 */
export async function sendNewFollowerNotification(
  senderProfile: UserProfile,
  targetUserId: string
): Promise<void> {
  const senderUid = senderProfile.uid || (senderProfile as any).id;
  if (!targetUserId || !senderUid || targetUserId === senderUid || targetUserId === 'guest_user') return;

  try {
    const notifId = `follower_${senderUid}_${Date.now()}`;
    const notifRef = doc(db, 'users', targetUserId, 'notifications', notifId);
    await setDoc(notifRef, {
      id: notifId,
      type: 'NEW_FOLLOWER',
      fromUserId: senderUid,
      fromUserName: senderProfile.displayName,
      fromUserBranch: senderProfile.branch,
      fromUserAvatar: senderProfile.avatarId || 'pna_1',
      fromUserProvince: senderProfile.province || 'Luanda',
      title: 'Novo Seguidor no MININT!',
      body: `${senderProfile.displayName} (${senderProfile.branch}) começou a seguir o teu perfil!`,
      isRead: false,
      createdAt: Date.now(),
      timestamp: Date.now(),
    });
  } catch (e) {
    console.warn('Erro ao enviar notificação de novo seguidor para o Firestore:', e);
  }
}

/**
 * Listens for new notifications in the user's personal notifications subcollection
 */
export function listenForUserNotifications(
  currentProfile: UserProfile,
  onNotificationReceived: (notification: {
    id: string;
    title: string;
    body: string;
    type?: 'duel' | 'daily' | 'follower' | 'general';
  }) => void
) {
  const myUid = currentProfile.uid || (currentProfile as any).id;
  if (!myUid || myUid === 'guest_user') return () => {};

  try {
    const q = query(
      collection(db, 'users', myUid, 'notifications'),
      where('isRead', '==', false),
      limit(10)
    );

    const initialTime = Date.now();

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          if (
            notif &&
            notif.createdAt &&
            Date.now() - notif.createdAt < 5 * 60 * 1000 &&
            notif.createdAt >= initialTime - 5000
          ) {
            const title = notif.title || '🔔 Nova Atividade!';
            const body = notif.body || 'Tens uma nova notificação no concurso MININT.';

            // Trigger browser push notification
            triggerPushNotification(title, {
              body,
              tag: `user-notif-${change.doc.id}`,
              onClickUrl: '#rankings',
            });

            onNotificationReceived({
              id: change.doc.id,
              title,
              body,
              type: notif.type === 'NEW_FOLLOWER' ? 'follower' : 'general',
            });
          }
        }
      });
    }, (err) => {
      console.warn('Erro no observador de notificações do utilizador:', err);
    });
  } catch (e) {
    console.warn('Erro ao subscrever notificações de utilizador:', e);
    return () => {};
  }
}

/**
 * Checks and triggers the Daily Study Reminder push notification
 */
export function checkAndTriggerDailyStudyReminder(profile: UserProfile): boolean {
  const settings = getStoredNotificationSettings();
  if (!settings.dailyStudyReminder) return false;

  const today = getTodayDateString();
  const lastRemindedDate = localStorage.getItem('minint_last_daily_reminder_date');

  // If already reminded today or user completed today's challenge, skip
  if (lastRemindedDate === today || profile.lastDailyDate === today) {
    return false;
  }

  const title = `🔥 Hora de Estudar para o MININT!`;
  const body = `Olá, ${profile.displayName}! O Desafio Diário de hoje já está disponível. Mantém a tua sequência de ${profile.dailyStreak || 0} dias e ganha XP bónus!`;

  const sent = triggerPushNotification(title, {
    body,
    tag: `daily-reminder-${today}`,
    onClickUrl: '#desafio',
  });

  if (sent) {
    localStorage.setItem('minint_last_daily_reminder_date', today);
  }

  return sent;
}
