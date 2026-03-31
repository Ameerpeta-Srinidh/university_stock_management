// frontend/js/items.js
// Sprint 2 – Inventory management page logic

let allItems = [];
let allRoomsForItems = [];

async function loadRoomOptions() {
  try {
    const res = await fetch('/api/rooms', { credentials: 'include' });
    if (!res.ok) return;
    const { rooms } = await res.json();
    allRoomsForItems = rooms;

    const filterRoom = document.getElementById('filterRoom');
    const itemRoom   = document.getElementById('itemRoom');

    rooms.forEach(r => {
      filterRoom.innerHTML += `<option value="${r.room_id}">${r.room_name}</option>`;
      itemRoom.innerHTML   += `<option value="${r.room_id}">${r.room_name}</option>`;
    });
  } catch (err) {
    console.error('Load room options error:', err);
  }
}

async function loadItems() {
  try {
    const room   = document.getElementById('filterRoom').value;
    const status = document.getElementById('filterStatus').value;
    let url = '/api/items?';
    if (room)   url += `room_id=${room}&`;
    if (status) url += `status=${status}&`;

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return;
    const { items } = await res.json();
    allItems = items;
    renderItems(items);
  } catch (err) {
    console.error('Load items error:', err);
  }
}

function renderItems(items) {
  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML = items.map(i => `
    <tr>
      <td><code>${i.item_id}</code></td>
      <td>${i.item_name}</td>
      <td>${i.item_type}</td>
      <td>${i.room_name}</td>
      <td><span class="badge ${i.status === 'Active' ? 'badge-active' : 'badge-decom'}">${i.status}</span></td>
      <td>
        <button class="action-btn" onclick="editItem('${i.item_id}')">Edit</button>
        <button class="action-btn danger" onclick="deleteItem('${i.item_id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddItem() {
  document.getElementById('itemModalTitle').textContent = 'Add Item';
  document.getElementById('editItemId').value = '';
  document.getElementById('itemName').value = '';
  document.getElementById('itemType').value = '';
  document.getElementById('purchaseDate').value = '';
  document.getElementById('itemErr').style.display = 'none';
  document.getElementById('itemModal').style.display = 'flex';
}

function editItem(id) {
  const item = allItems.find(i => i.item_id === id);
  if (!item) return;
  document.getElementById('itemModalTitle').textContent = 'Edit Item';
  document.getElementById('editItemId').value = id;
  document.getElementById('itemName').value = item.item_name;
  document.getElementById('itemType').value = item.item_type;
  document.getElementById('itemRoom').value = item.room_id;
  document.getElementById('purchaseDate').value = item.purchase_date?.split('T')[0] || '';
  document.getElementById('itemErr').style.display = 'none';
  document.getElementById('itemModal').style.display = 'flex';
}

function closeItemModal() {
  document.getElementById('itemModal').style.display = 'none';
}

async function saveItem() {
  const id   = document.getElementById('editItemId').value;
  const body = {
    item_name:     document.getElementById('itemName').value.trim(),
    item_type:     document.getElementById('itemType').value.trim(),
    room_id:       document.getElementById('itemRoom').value,
    purchase_date: document.getElementById('purchaseDate').value || null,
  };

  if (!body.item_name || !body.item_type || !body.room_id) {
    showItemErr('Name, type, and room are required.');
    return;
  }

  const url    = id ? `/api/items/${id}` : '/api/items';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      showItemErr(data.error);
      return;
    }
    closeItemModal();
    loadItems();
  } catch (err) {
    showItemErr('Network error.');
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  try {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadItems();
  } catch (err) {
    alert('Network error.');
  }
}

function showItemErr(msg) {
  const el = document.getElementById('itemErr');
  el.textContent = msg;
  el.style.display = 'block';
}

// Init
loadRoomOptions().then(() => loadItems());
