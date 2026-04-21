// frontend/js/verify.js
// Sprint 4 – QR Verification page logic

async function verifyManual() {
  const itemId = document.getElementById('manualItemId').value.trim();
  if (!itemId) {
    showResult('error', '✗', 'Missing Item ID', 'Please enter an item ID to verify.');
    return;
  }
  await verifyItem(itemId);
}

async function verifyFromImage() {
  const fileInput = document.getElementById('qrUpload');
  if (!fileInput.files.length) {
    showResult('error', '✗', 'No Image Selected', 'Please select a QR code image.');
    return;
  }

  // Simple approach: read QR image and try to parse item_id
  // In production, we'd use a QR scanner library
  showResult('error', '⚠', 'Feature Note', 'QR image scanning requires html5-qrcode library. Use manual entry for now or integrate camera scanning.');
}

async function verifyItem(itemId) {
  try {
    const res = await fetch('/api/verification/verify', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ item_id: itemId }),
    });

    const data = await res.json();

    if (res.ok) {
      showResult('success', '✓',
        `${data.item_name} Verified!`,
        `Item ${data.item_id} verified by ${data.verified_by} at ${new Date(data.verified_at).toLocaleString()}`
      );
    } else {
      showResult('error', '✗', 'Verification Failed', data.error);
    }
  } catch (err) {
    showResult('error', '✗', 'Network Error', 'Could not reach the server.');
  }
}

function showResult(type, icon, title, details) {
  const el = document.getElementById('verifyResult');
  el.className = `verify-result ${type}`;
  el.style.display = 'block';
  document.getElementById('resultIcon').textContent    = icon;
  document.getElementById('resultTitle').textContent   = title;
  document.getElementById('resultDetails').textContent = details;
}
