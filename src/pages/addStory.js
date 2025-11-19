import { getToken } from '../scripts/utils.js';
import { L, onNewStoryAdded } from '../scripts/main.js'; 

export function renderAddStoryPage() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="centered">
      <div class="form-card">
        <h2>Add New Story</h2>
        <form id="addStoryForm">
          <label for="photo">Foto:</label>
          <input type="file" id="photo" accept="image/*" required>

          <label for="description">Deskripsi:</label>
          <textarea id="description" rows="4" required></textarea>

          <p>Klik lokasi di peta untuk menentukan posisi:</p>
          <div id="map"></div>

          <p id="coordText" style="margin-top:8px; color:#555; font-size:0.9rem;">Belum ada lokasi dipilih</p>

          <button type="submit">Kirim</button>
        </form>
      </div>
    </div>
  `;


  const map = L.map('map').setView([-2.5, 118], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  }).addTo(map);

  let selectedLat = null;
  let selectedLng = null;
  let marker = null;

  map.on('click', (e) => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;
    document.getElementById('coordText').textContent =
      `Latitude: ${selectedLat.toFixed(5)}, Longitude: ${selectedLng.toFixed(5)}`;

    if (marker) marker.remove();
    marker = L.marker([selectedLat, selectedLng])
      .addTo(map)
      .bindPopup(`Lokasi Story<br>Lat: ${selectedLat.toFixed(5)}<br>Lon: ${selectedLng.toFixed(5)}`)
      .openPopup();
  });

  const form = document.getElementById('addStoryForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

  if (!selectedLat || !selectedLng) {
    alert('Silakan pilih lokasi pada peta.');
    return;
  }

  const photo = form.photo.files[0];
  const description = form.description.value;
  const token = getToken();

  if (!token) {
    alert('Token tidak ditemukan, silakan login kembali.');
    location.hash = '#/login';
    return;
  }


  if (!photo) {
    alert('Silakan pilih foto terlebih dahulu.');
    return;
  }

    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('description', description);
    formData.append('lat', selectedLat);
    formData.append('lon', selectedLng);

    try {
    const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal menambahkan cerita');
    }

    console.log('Story added:', result);
    alert('Cerita berhasil ditambahkan!');

    onNewStoryAdded('Cerita baru berhasil ditambahkan!');

    location.hash = '#/home';
  } catch (error) {
    console.error('Error menambahkan cerita:', error);
    alert(error.message);
  }
});
}
