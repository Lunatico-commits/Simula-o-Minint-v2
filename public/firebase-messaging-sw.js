// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCjG36Cav9_UFr41pIGCLa2zv_xiIvP5n8",
  authDomain: "simulados-minint.firebaseapp.com",
  projectId: "simulados-minint",
  storageBucket: "simulados-minint.firebasestorage.app",
  messagingSenderId: "371489175915",
  appId: "1:371489175915:web:3e586300fbd9d0a8c4742e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  const notificationTitle = payload.notification?.title || 'Preparatório MININT Angola';
  const notificationOptions = {
    body: payload.notification?.body || 'Tem uma nova atualização de estudos!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
