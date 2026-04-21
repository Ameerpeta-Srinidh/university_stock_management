// frontend/js/analytics.js
// Sprint 5 – Analytics dashboard with Chart.js

const CHART_COLORS = [
  '#2c2825', '#6b6660', '#a8a39c', '#dc2626',
  '#059669', '#d97706', '#7c3aed', '#2563eb',
];

async function loadAnalytics() {
  try {
    // Load summary stats
    const summaryRes = await fetch('/api/reports/summary', { credentials: 'include' });
    if (summaryRes.ok) {
      const { summary } = await summaryRes.json();
      document.getElementById('statRooms').textContent    = summary.total_rooms;
      document.getElementById('statItems').textContent    = summary.total_items;
      document.getElementById('statActive').textContent   = summary.active_items;
      document.getElementById('statQR').textContent       = summary.qr_codes_generated;
      document.getElementById('statVerified').textContent = summary.verified_items;
    }

    // Load verification overview
    const verRes = await fetch('/api/reports/verification-overview', { credentials: 'include' });
    if (verRes.ok) {
      const { overview } = await verRes.json();
      document.getElementById('statPct').textContent = `${overview.completion_pct}%`;

      // Verification progress chart
      new Chart(document.getElementById('verChart'), {
        type: 'doughnut',
        data: {
          labels: ['Verified', 'Pending'],
          datasets: [{
            data: [overview.verified, overview.pending],
            backgroundColor: ['#059669', '#e4e0d9'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: "'Geist Mono', monospace", size: 11 } } },
          },
        },
      });
    }

    // Load room breakdown
    const roomRes = await fetch('/api/reports/by-room', { credentials: 'include' });
    if (roomRes.ok) {
      const { rooms } = await roomRes.json();
      new Chart(document.getElementById('roomChart'), {
        type: 'bar',
        data: {
          labels: rooms.map(r => r.room_name),
          datasets: [{
            label: 'Items',
            data: rooms.map(r => r.item_count),
            backgroundColor: CHART_COLORS.slice(0, rooms.length),
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "'Geist Mono', monospace", size: 10 } } },
            x: { ticks: { font: { family: "'Geist Mono', monospace", size: 10 } } },
          },
        },
      });
    }

    // Load type breakdown
    const typeRes = await fetch('/api/reports/by-type', { credentials: 'include' });
    if (typeRes.ok) {
      const { types } = await typeRes.json();
      new Chart(document.getElementById('typeChart'), {
        type: 'pie',
        data: {
          labels: types.map(t => t.item_type),
          datasets: [{
            data: types.map(t => t.count),
            backgroundColor: CHART_COLORS.slice(0, types.length),
            borderWidth: 1,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: "'Geist Mono', monospace", size: 11 } } },
          },
        },
      });
    }

  } catch (err) {
    console.error('Analytics load error:', err);
  }
}

async function exportData() {
  try {
    const res = await fetch('/api/reports/export', { credentials: 'include' });
    if (!res.ok) return;
    const { export: data } = await res.json();

    // Convert to CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed.');
  }
}

// Init
loadAnalytics();
