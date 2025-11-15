import { getAllSavedStories, deleteSavedStory } from '../scripts/db/idb.js';
import { showLocalNotification } from '../scripts/main.js';

export async function renderSavedStoryPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Cerita Tersimpan</h2>
    <div class="story-grid" id="savedList"></div>
  `;

  const savedList = document.getElementById('savedList');
  const stories = await getAllSavedStories();

  if (stories.length === 0) {
    savedList.innerHTML = '<p>Tidak ada cerita tersimpan.</p>';
    return;
  }

  stories.forEach((story) => {
    const item = document.createElement('div');
    item.classList.add('story-card');
    item.innerHTML = `
      <img src="${story.photoUrl}" alt="${story.name}">
      <div class="story-info">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <small>Created: ${new Date(story.createdAt).toLocaleString()}</small>
        <button class="delete-btn">Hapus</button>
      </div>
    `;

    item.querySelector('.delete-btn').addEventListener('click', async () => {
      await deleteSavedStory(story.id);
      await showLocalNotification('Cerita dihapus', story.name);
      renderSavedStoryPage(); 
    });

    savedList.appendChild(item);
  });
}
