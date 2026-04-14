// frontend/js/history.js
// Sprint 4 – Verification history page logic

let allHistory = [];

async function loadHistory() {
  try {
    const res = await fetch('/api/verification/history', { credentials: 'include' });
    if (!res.ok) return;
    const { history } = await res.json();
    allHistory = history;
    renderHistory(history);
  } catch (err) {
    console.error('Load history error:', err);
  }
}

function renderHistory(history) {
  const tbody     = document.getElementById('historyBody');
  const emptyEl   = document.getElementById('emptyState');

  if (history.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  tbody.innerHTML = history.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><code>${h.item_id}</code></td>
      <td>${h.item_name}</td>
      <td>${h.room_name}</td>
      <td>${h.officer_name}</td>
      <td>${new Date(h.ver_date).toLocaleString()}</td>
      <td>${h.notes || '—'}</td>
    </tr>
  `).join('');
}

function filterHistory() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allHistory.filter(h =>
    h.item_id.toLowerCase().includes(query) ||
    h.item_name.toLowerCase().includes(query) ||
    h.officer_name.toLowerCase().includes(query) ||
    (h.room_name && h.room_name.toLowerCase().includes(query))
  );
  renderHistory(filtered);
}

// Init
loadHistory();
