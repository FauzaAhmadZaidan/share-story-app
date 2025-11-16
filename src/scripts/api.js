const BASE_URL = 'https://story-api.dicoding.dev/v1';

export const API = {

  async getStories(token) {
    const res = await fetch(`${BASE_URL}/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Gagal mengambil data story');
    return res.json();
  },


  async addStory(token, photo, description, lat, lon) {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lon', lon);

    const res = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return res.json();
  },


  async registerUser(name, email, password) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },


  async loginUser(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

};
