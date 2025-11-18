import { router } from './router.js';
import { clearToken, isAuthenticated, getToken } from './utils.js';
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
      setupPWAInstallPrompt(registration);

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


function setupPWAInstallPrompt(registration) {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt ditangkap.');

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.cssText = `
      position: fixed;        
      bottom: 60px;          
      right: 20px;            
      display: flex;          
      flex-direction: column; 
      gap: 10px;              
      align-items: flex-end;  
      z-index: 9999;          
    `;
  
    document.body.appendChild(buttonContainer);

    const notifBtn = document.createElement('button');
    notifBtn.textContent = "Aktifkan Notifikasi";
    notifBtn.className = 'notif-btn';
    notifBtn.style.cssText = `
      background: #84994F;
      color: white;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    `;
    buttonContainer.appendChild(notifBtn);

    notifBtn.addEventListener("click", async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Izin notifikasi ditolak.");
        return;
      }
      await subscribePush(registration);
      alert("Notifikasi berhasil diaktifkan!");
    });

    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install Aplikasi';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
      background: #84994F;
      color: white;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    `;
    buttonContainer.appendChild(installBtn);

    installBtn.addEventListener('click', async () => {
      installBtn.remove();
      notifBtn.remove();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User memilih: ${outcome}`);
      deferredPrompt = null;
    });
  });
}


const vapidKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function subscribePush(registration) {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  console.log("Sub:", subscription);

  const token = getToken();
  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("p256dh"))
        )
      ),
      auth: btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("auth"))
        )
      ),
    },
  };

  await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("Berhasil subscribe!");
}

export { L };
