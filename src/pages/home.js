import { API } from '../scripts/api.js';
import { getToken, isAuthenticated } from '../scripts/utils.js';
import { renderMap } from '../scripts/map.js';
import { saveStory, getSavedStoryById, deleteSavedStory } from '../scripts/db/idb.js';
import { showLocalNotification, subscribeAction, unsubscribeAction, checkSubscription } from '../scripts/main.js';


export async function renderHomePage() {
  const app = document.getElementById('app');

  if (!isAuthenticated()) {
    app.innerHTML = `
      <div class="centered">
        <div class="form-card">
          <p>Silakan login terlebih dahulu.</p>
          <a href="#/login" class="add-btn">Ke Halaman Login</a>
        </div>
      </div>
    `;
    return;
  }

  const token = getToken();

  try {
    const data = await API.getStories(token);
    console.log('Token:', token);
    console.log('Response API:', data);

    app.innerHTML = `
      <h2>Semua Cerita</h2>

      <div style="text-align:center; margin-bottom:20px;">
        <button id="subscribeButton" class="subscribe-btn">🔔 Subscribe Notifikasi</button>
      </div>

      <div class="story-grid" id="storyList"></div>
      <div id="mapContainer"></div>
    `;

    const subscribeButton = document.getElementById('subscribeButton');

    const isSub = await checkSubscription();
    subscribeButton.textContent = isSub ? "🔕 Unsubscribe" : "🔔 Subscribe";

    subscribeButton.addEventListener("click", async () => {
    const nowSub = await checkSubscription();

    if (nowSub) {
      await unsubscribeAction(token);
      subscribeButton.textContent = "🔔 Subscribe";
      alert("Berhenti menerima notifikasi!");
    } else {
      await subscribeAction(token);
      subscribeButton.textContent = "🔕 Unsubscribe";
      alert("Notifikasi berhasil diaktifkan!");
    }
  });


    const storyList = document.getElementById('storyList');

    data.listStory.forEach((story) => {
      const card = createStoryItem(story);
      storyList.appendChild(card);
    });

    renderMap(data.listStory);

  } catch (err) {
    app.innerHTML = `<p style="text-align:center;">Gagal memuat data story. ${err.message}</p>`;
  }
}

function createStoryItem(story) {
  const storyItem = document.createElement('div');
  storyItem.classList.add('story-card');

  storyItem.innerHTML = `
    <img src="${story.photoUrl}" alt="Foto oleh ${story.name}">
    <div class="story-info">
      <h3>${story.name}</h3>
      <p>${story.description}</p>
      <small>Created: ${new Date(story.createdAt).toLocaleString()}</small>
      <button class="bookmark-btn">⭐ Simpan</button>
    </div>
  `;

  const bookmarkBtn = storyItem.querySelector('.bookmark-btn');

  getSavedStoryById(story.id).then((saved) => {
    if (saved) bookmarkBtn.textContent = 'Hapus';
  });

  bookmarkBtn.addEventListener('click', async () => {
    const saved = await getSavedStoryById(story.id);

    if (saved) {
      await deleteSavedStory(story.id);
      bookmarkBtn.textContent = '⭐ Simpan';
      await showLocalNotification('Dihapus dari favorit', story.name);
    } else {
      await saveStory(story);
      bookmarkBtn.textContent = 'Hapus';
      await showLocalNotification('Disimpan ke favorit', story.name);
    }
  });

  return storyItem;
}

