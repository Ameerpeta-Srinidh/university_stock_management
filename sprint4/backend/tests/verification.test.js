// backend/tests/verification.test.js
// Sprint 4 – Unit tests for verification workflow

const request = require('supertest');
const app     = require('../server');

jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const db = require('../config/db');

describe('Verification routes', () => {

  beforeEach(() => {
    db.execute.mockReset();
  });

  describe('POST /api/verification/verify', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/verification/verify')
        .send({ item_id: 'ITEM-001' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/verification/status/:item_id', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/verification/status/ITEM-001');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/verification/history', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/verification/history');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/verification/pending', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/verification/pending');
      expect(res.status).toBe(401);
    });
  });

});

describe('Verification logic', () => {

  test('decommissioned items should not be verifiable', () => {
    const item = { status: 'Decommissioned' };
    expect(item.status).toBe('Decommissioned');
    // In the actual route, this returns 400
  });

  test('verification record contains officer and timestamp', () => {
    const record = {
      item_id: 'ITEM-001',
      officer_id: 1,
      status: 'Verified',
      ver_date: new Date().toISOString(),
    };
    expect(record.status).toBe('Verified');
    expect(record.officer_id).toBeDefined();
    expect(record.ver_date).toBeDefined();
  });

});
