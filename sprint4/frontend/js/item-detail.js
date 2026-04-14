// frontend/js/item-detail.js
// Sprint 3 – Item detail page with QR code

const params = new URLSearchParams(window.location.search);
const ITEM_ID = params.get('id');

if (!ITEM_ID) {
  window.location.href = 'items.html';
}

async function loadItemDetail() {
  try {
    const res = await fetch(`/api/items/${ITEM_ID}`, { credentials: 'include' });
    if (!res.ok) { window.location.href = 'items.html'; return; }
    const { item } = await res.json();

    document.getElementById('itemName').textContent = item.item_name;
    document.getElementById('itemId').textContent   = item.item_id;
    document.getElementById('itemType').textContent  = item.item_type;
    document.getElementById('itemRoom').textContent  = item.room_name;
    document.getElementById('itemDept').textContent  = item.department || '—';
    document.getElementById('itemDate').textContent  = item.purchase_date?.split('T')[0] || '—';
    document.getElementById('itemStatus').textContent = item.status;

    // Try to load existing QR code
    loadQR();
  } catch (err) {
    console.error('Load item detail error:', err);
  }
}

async function loadQR() {
  try {
    const res = await fetch(`/api/qrcode/${ITEM_ID}`, { credentials: 'include' });
    if (res.ok) {
      const { qrcode } = await res.json();
      document.getElementById('qrDisplay').innerHTML =
        `<img src="${qrcode.qr_data}" alt="QR Code for ${ITEM_ID}">`;
      document.getElementById('generateQrBtn').textContent = 'Regenerate QR Code';
    }
  } catch (_) {}
}

async function generateQR() {
  const btn = document.getElementById('generateQrBtn');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    const res = await fetch(`/api/qrcode/generate/${ITEM_ID}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById('qrDisplay').innerHTML =
        `<img src="${data.qr_data}" alt="QR Code for ${ITEM_ID}">`;
      btn.textContent = 'Regenerate QR Code';
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert('Network error.');
  } finally {
    btn.disabled = false;
  }
}

loadItemDetail();
