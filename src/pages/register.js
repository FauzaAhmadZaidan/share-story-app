import { API } from '../scripts/api.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Register</h2>
    <form id="registerForm">
      <label for="name">Nama</label>
      <input type="text" id="name" placeholder="Nama" required />

      <label for="email">Email</label>
      <input type="email" id="email" placeholder="Email" required />

      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Password" required />
      
      <button type="submit">Daftar</button>
    </form>
    <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
  `;

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || !password) {
      alert('Semua kolom harus diisi!');
      return;
    }

    try {
      const result = await API.registerUser(name, email, password);
      console.log('Register result:', result); 

      if (result.error) {
        alert(result.message || 'Registrasi gagal, coba lagi.');
        return;
      }

      alert('Registrasi berhasil! Silakan login.');
      window.location.hash = '#/login';
    } catch (err) {
      console.error('Register error:', err);
      alert('Terjadi kesalahan saat registrasi.');
    }
  });
}
