import { router } from './router.js';
import { clearToken, isAuthenticated } from './utils.js';
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

      setupPWAInstallPrompt(registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
});



const vapidKey =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeAction(token) {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  console.log("Subscribed:", subscription);

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))),
    },
  };

  await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return true;
}

export async function unsubscribeAction(token) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return false;

  await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
  return true;
}

export async function checkSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  return sub !== null;
}



export async function showLocalNotification(title, body) {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;

  reg.showNotification(title, {
    body: body || "",
    icon: "/icons/icon-192x192.png",
  });
}

export async function onNewStoryAdded() {
  // tampilkan notifikasi lokal (jika diizinkan)
  await showLocalNotification(
    'Cerita Baru Ditambahkan!',
    'Cerita kamu berhasil disimpan'
  );

  // kirim pesan ke service worker sebagai cadangan/backup
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'NEW_STORY' });
  }
}


function setupPWAInstallPrompt() {
  let deferredPrompt;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.createElement("button");
    installBtn.textContent = "Install Aplikasi";
    installBtn.style.cssText = `
      background:#84994F;
      font-weight: bold;
      color:white;
      padding:10px 16px;
      border:none;
      border-radius:8px;
      cursor:pointer;
      position:fixed;
      bottom:60px;
      right:20px;
    `;

    document.body.appendChild(installBtn);

    installBtn.addEventListener("click", async () => {
      installBtn.remove();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
  });
}

export { L };
