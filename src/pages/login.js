import { API } from '../scripts/api.js';
import { saveToken } from '../scripts/utils.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="Email" required />

      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Password" required />
      
      <button type="submit">Login</button>
    </form>
    <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const result = await API.loginUser(email, password);
      console.log('Login result:', result); 

      if (result.error) {
        alert(result.message || 'Login gagal');
        return;
      }

      saveToken(result.loginResult.token);
      alert('Login berhasil!');
      window.location.hash = '#/home';
    } catch (err) {
      alert('Terjadi kesalahan saat login.');
      console.error(err);
    }
  });
}
