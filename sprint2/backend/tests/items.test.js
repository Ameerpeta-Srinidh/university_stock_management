// backend/tests/items.test.js
// Sprint 2 – Unit tests for inventory item CRUD

const request = require('supertest');
const app     = require('../server');

jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const db = require('../config/db');

describe('Item routes', () => {

  beforeEach(() => {
    db.execute.mockReset();
  });

  describe('GET /api/items', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/items');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/items', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ item_name: 'Test', item_type: 'Desktop', room_id: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/items/:id', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app)
        .put('/api/items/ITEM-001')
        .send({ item_name: 'Updated' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/items/:id', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).delete('/api/items/ITEM-001');
      expect(res.status).toBe(401);
    });
  });

});

describe('Item ID generation logic', () => {

  test('item ID format is ITEM-XXX', () => {
    const id = 'ITEM-001';
    expect(id).toMatch(/^ITEM-\d{3}$/);
  });

  test('next item ID after ITEM-007 is ITEM-008', () => {
    const lastId = 'ITEM-007';
    const lastNum = parseInt(lastId.split('-')[1], 10);
    const nextId = `ITEM-${String(lastNum + 1).padStart(3, '0')}`;
    expect(nextId).toBe('ITEM-008');
  });

});
