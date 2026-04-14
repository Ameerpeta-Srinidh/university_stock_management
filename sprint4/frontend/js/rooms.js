// frontend/js/rooms.js
// Sprint 2 – Room management page logic

let allRooms = [];

async function loadRooms() {
  try {
    const res = await fetch('/api/rooms', { credentials: 'include' });
    if (!res.ok) return;
    const { rooms } = await res.json();
    allRooms = rooms;
    renderRooms(rooms);
  } catch (err) {
    console.error('Load rooms error:', err);
  }
}

function renderRooms(rooms) {
  const tbody = document.getElementById('roomsBody');
  tbody.innerHTML = rooms.map(r => `
    <tr>
      <td>${r.room_id}</td>
      <td>${r.room_name}</td>
      <td>${r.location_type}</td>
      <td>${r.department || '—'}</td>
      <td>
        <button class="action-btn" onclick="editRoom(${r.room_id})">Edit</button>
        <button class="action-btn danger" onclick="deleteRoom(${r.room_id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddRoom() {
  document.getElementById('modalTitle').textContent = 'Add Room';
  document.getElementById('editRoomId').value = '';
  document.getElementById('roomName').value = '';
  document.getElementById('locationType').value = '';
  document.getElementById('department').value = '';
  document.getElementById('roomErr').style.display = 'none';
  document.getElementById('roomModal').style.display = 'flex';
}

function editRoom(id) {
  const room = allRooms.find(r => r.room_id === id);
  if (!room) return;
  document.getElementById('modalTitle').textContent = 'Edit Room';
  document.getElementById('editRoomId').value = id;
  document.getElementById('roomName').value = room.room_name;
  document.getElementById('locationType').value = room.location_type;
  document.getElementById('department').value = room.department || '';
  document.getElementById('roomErr').style.display = 'none';
  document.getElementById('roomModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('roomModal').style.display = 'none';
}

async function saveRoom() {
  const id   = document.getElementById('editRoomId').value;
  const body = {
    room_name:     document.getElementById('roomName').value.trim(),
    location_type: document.getElementById('locationType').value,
    department:    document.getElementById('department').value.trim(),
  };

  if (!body.room_name || !body.location_type) {
    showRoomErr('Room name and location type are required.');
    return;
  }

  const url    = id ? `/api/rooms/${id}` : '/api/rooms';
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
      showRoomErr(data.error);
      return;
    }
    closeModal();
    loadRooms();
  } catch (err) {
    showRoomErr('Network error.');
  }
}

async function deleteRoom(id) {
  if (!confirm('Delete this room?')) return;
  try {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadRooms();
  } catch (err) {
    alert('Network error.');
  }
}

function showRoomErr(msg) {
  const el = document.getElementById('roomErr');
  el.textContent = msg;
  el.style.display = 'block';
}

// Init
loadRooms();
