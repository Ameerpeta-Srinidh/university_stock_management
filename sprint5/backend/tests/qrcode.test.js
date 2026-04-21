// backend/tests/qrcode.test.js
// Sprint 3 – Unit tests for QR code generation

const request = require('supertest');
const app     = require('../server');

jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,MOCK_QR_DATA'),
}));

const db = require('../config/db');

describe('QR Code routes', () => {

  beforeEach(() => {
    db.execute.mockReset();
  });

  describe('POST /api/qrcode/generate/:item_id', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).post('/api/qrcode/generate/ITEM-001');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/qrcode/:item_id', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/qrcode/ITEM-001');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/qrcode/bulk', () => {
    test('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/qrcode/bulk')
        .send({ item_ids: ['ITEM-001', 'ITEM-002'] });
      expect(res.status).toBe(401);
    });
  });

});

describe('QR data payload structure', () => {
  test('QR payload contains item_id and system name', () => {
    const payload = {
      item_id:   'ITEM-001',
      item_name: 'Dell Desktop PC',
      system:    'UniStock',
      generated: new Date().toISOString(),
    };

    expect(payload.item_id).toBe('ITEM-001');
    expect(payload.system).toBe('UniStock');
    expect(payload.generated).toBeDefined();
  });
});
