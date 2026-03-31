// frontend/js/dashboard.js
// Sprint 2 – Dashboard stats

(async function loadDashboard() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  if (nameEl) nameEl.textContent = user.username || '—';
  if (roleEl) roleEl.textContent = user.role || '—';

  try {
    const [roomsRes, itemsRes] = await Promise.all([
      fetch('/api/rooms', { credentials: 'include' }),
      fetch('/api/items', { credentials: 'include' }),
    ]);

    if (roomsRes.ok) {
      const { rooms } = await roomsRes.json();
      document.getElementById('totalRooms').textContent = rooms.length;
    }

    if (itemsRes.ok) {
      const { items } = await itemsRes.json();
      document.getElementById('totalItems').textContent = items.length;
      document.getElementById('activeItems').textContent = items.filter(i => i.status === 'Active').length;
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
})();
