// frontend/js/login.js
// Sprint 2 – Login page logic (connects to POST /api/auth/login)

const API_BASE = '/api/auth';

(async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    if (res.ok) {
      const page = window.location.pathname;
      if (page.includes('login')) window.location.href = 'dashboard.html';
      
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const adminLink = document.getElementById('navAdmin');
      if (adminLink && user.role === 'Admin') {
        adminLink.style.display = 'inline-block';
      }
    } else {
      const page = window.location.pathname;
      if (!page.includes('login')) window.location.href = 'login.html';
    }
  } catch (_) {}
})();

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

async function login() {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;
  const errEl    = document.getElementById('err');
  const btn      = document.getElementById('loginBtn');
  if (!errEl || !btn) return;
  errEl.style.display = 'none';
  errEl.textContent   = '';

  if (!username || !password) {
    showError('Please enter your username and password.');
    return;
  }

  btn.disabled     = true;
  btn.textContent  = 'Signing in…';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      showError(data.error || 'Login failed. Please try again.');
    }

  } catch (err) {
    showError('Network error – please check your connection.');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Continue';
  }
}

async function logout() {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  sessionStorage.removeItem('user');
  window.location.href = 'login.html';
}

function showError(msg) {
  const errEl = document.getElementById('err');
  if (!errEl) return;
  errEl.textContent   = msg;
  errEl.style.display = 'block';
}
