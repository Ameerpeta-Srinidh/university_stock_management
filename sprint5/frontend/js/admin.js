// frontend/js/admin.js
// Sprint 5 – Admin User Management & Logic

// Only allow Admin to see this page
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
if (user.role !== 'Admin') {
  window.location.href = 'dashboard.html';
}

async function loadUsers() {
  try {
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    if (!res.ok) return;
    const { users } = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error('Load users error:', err);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.user_id}</td>
      <td>${u.username}</td>
      <td><span class="badge ${u.role === 'Admin' ? 'badge-pass' : ''}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        <button class="action-btn danger ${u.user_id === user.user_id ? 'disabled' : ''}" 
                onclick="deleteUser(${u.user_id}, '${u.username}')"
                ${u.user_id === user.user_id ? 'disabled' : ''}>Delete</button>
      </td>
    </tr>
  `).join('');
}

async function loadLog() {
  try {
    const res = await fetch('/api/admin/activity-log', { credentials: 'include' });
    if (!res.ok) return;
    const { log } = await res.json();
    
    const tbody = document.getElementById('logBody');
    tbody.innerHTML = log.map((l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><code>${l.item_id}</code> - ${l.item_name}</td>
        <td>${l.officer_name}</td>
        <td>${new Date(l.ver_date).toLocaleString()}</td>
        <td>${l.notes || '—'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Load activity log error:', err);
  }
}

function showAddUser() {
  document.getElementById('newUsername').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('newRole').value = 'VO';
  document.getElementById('userErr').style.display = 'none';
  document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
}

async function saveUser() {
  const body = {
    username: document.getElementById('newUsername').value.trim(),
    password: document.getElementById('newPassword').value,
    role:     document.getElementById('newRole').value,
  };

  if (!body.username || !body.password || !body.role) {
    showUserErr('All fields are required.');
    return;
  }

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      showUserErr(data.error);
      return;
    }
    closeUserModal();
    loadUsers();
  } catch (err) {
    showUserErr('Network error.');
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Delete user ${username}?`)) return;
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadUsers();
  } catch (err) {
    alert('Network error.');
  }
}

function showUserErr(msg) {
  const el = document.getElementById('userErr');
  el.textContent = msg;
  el.style.display = 'block';
}

// Init
loadUsers();
loadLog();
