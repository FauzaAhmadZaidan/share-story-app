import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function renderMap(stories) {
  const mapContainer = document.getElementById('mapContainer');
  mapContainer.innerHTML = '<div id="map" style="height: 400px;"></div>';

  const map = L.map('map').setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  }).addTo(map);

  stories.forEach((story) => {
    if (story.lat && story.lon) {
      const marker = L.marker([story.lat, story.lon]).addTo(map);
      marker.bindPopup(`
        <b>${story.name}</b><br>
        ${story.description}<br>
        <small>${story.location || 'Tidak diketahui'}</small><br>
        <small>Lat: ${story.lat.toFixed(5)}, Lon: ${story.lon.toFixed(5)}</small>
      `);
    }
  });
}
