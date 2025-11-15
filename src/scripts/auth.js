import { API } from './api.js';
import { saveToken } from './utils.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="centered">
      <div class="form-card">
        <h2>Login</h2>
        <form id="loginForm">
          <label for="email">Email:</label>
          <input type="email" id="email" required>
          <label for="password">Password:</label>
          <input type="password" id="password" required>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const result = await API.login(email, password);

    if (result.error) {
      alert(result.message);
    } else {
      saveToken(result.loginResult.token);
      alert('Login sukses!');
      location.hash = '/home';
    }
  });
}

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="centered">
      <div class="form-card">
        <h2>Register</h2>
        <form id="registerForm">
          <label for="name">Nama:</label>
          <input type="text" id="name" required>
          <label for="email">Email:</label>
          <input type="email" id="email" required>
          <label for="password">Password:</label>
          <input type="password" id="password" required>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    const result = await API.register(name, email, password);

    if (result.error) {
      alert(result.message);
    } else {
      alert('Registrasi sukses! Silakan login.');
      location.hash = '/login';
    }
  });
}
