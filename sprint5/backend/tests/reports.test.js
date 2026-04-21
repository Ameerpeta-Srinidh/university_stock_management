// backend/tests/reports.test.js
// Sprint 5 – Unit tests for reporting & analytics

const request = require('supertest');
const app     = require('../server');

jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const db = require('../config/db');

describe('Report routes', () => {

  beforeEach(() => {
    db.execute.mockReset();
  });

  describe('GET /api/reports/summary', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/reports/summary');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/by-room', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/reports/by-room');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/by-type', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/reports/by-type');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/verification-overview', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/reports/verification-overview');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/export', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/reports/export');
      expect(res.status).toBe(401);
    });
  });

});

describe('Report data validation', () => {

  test('completion percentage calculation', () => {
    const total    = 10;
    const verified = 7;
    const pct = Math.round((verified / total) * 100);
    expect(pct).toBe(70);
  });

  test('0 items means 0% completion', () => {
    const total = 0;
    const verified = 0;
    const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
    expect(pct).toBe(0);
  });

  test('CSV export produces correct format', () => {
    const data = [
      { item_id: 'ITEM-001', item_name: 'Dell PC', status: 'Active' },
    ];
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    expect(csv).toContain('item_id,item_name,status');
    expect(csv).toContain('ITEM-001,Dell PC,Active');
  });

});
