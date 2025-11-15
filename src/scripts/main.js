import { router } from './router.js';
import { clearToken, isAuthenticated, getToken } from './utils.js';
import { API } from './api.js';
import '../styles/style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

window.addEventListener('hashchange', router);
window.addEventListener('load', async () => {
  router();

  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.querySelector('a[href="#/login"]');
  const registerLink = document.querySelector('a[href="#/register"]');

  if (isAuthenticated()) {
    logoutBtn.hidden = false;
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
  } else {
    logoutBtn.hidden = true;
    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
  }

  logoutBtn.addEventListener('click', () => {
    clearToken();
    location.hash = '#/login';
  });

 
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      await requestNotificationPermission();
      await initPushNotification(registration);
      setupPWAInstallPrompt();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
});


async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Izin notifikasi diberikan.');
    } else {
      console.warn('Izin notifikasi ditolak.');
    }
  }
}

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function initPushNotification(registration) {
  if (!('Notification' in window)) {
    console.warn('Browser tidak mendukung notifikasi.');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Izin notifikasi ditolak.');
    return;
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('Push Subscription:', JSON.stringify(subscription));

    const token = getToken();
    await API.sendSubscription(subscription, token);
    console.log('Subscription berhasil dikirim ke server.');
  } catch (err) {
    console.error('Gagal melakukan subscription:', err);
  }
}

export async function showLocalNotification(title, body) {
  if (!('Notification' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
    });
  } else {
    new Notification(title, { body });
  }
}


export async function onNewStoryAdded() {
  await showLocalNotification(
    'Cerita Baru Ditambahkan!',
    'Cerita kamu berhasil disimpan'
  );

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'NEW_STORY' });
  }
}


function setupPWAInstallPrompt() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt ditangkap.');

    
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install Aplikasi';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
      position: fixed;
      bottom: 50px;
      right: 20px;
      background: #84994F;
      color: white;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    `;
    document.body.appendChild(installBtn);

    installBtn.addEventListener('click', async () => {
      installBtn.remove();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User memilih: ${outcome}`);
      deferredPrompt = null;
    });
  });
}

export { L };
