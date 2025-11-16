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
