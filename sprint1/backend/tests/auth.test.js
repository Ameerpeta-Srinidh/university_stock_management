// backend/tests/auth.test.js
// Sprint 1 – Unit tests for authentication (T-07)

const request = require('supertest');
const bcrypt  = require('bcrypt');
const app     = require('../server');

jest.mock('../config/db', () => ({
  execute: jest.fn(),
}));

const db = require('../config/db');

const HASHED_PASSWORD = bcrypt.hashSync('admin123', 10);

const mockAdminUser = {
  user_id:       1,
  username:      'admin',
  password_hash: HASHED_PASSWORD,
  role:          'Admin',
};

describe('POST /api/auth/login', () => {

  test('US-01 / US-02 – returns 200 and user object on valid credentials', async () => {
    db.execute.mockResolvedValueOnce([[mockAdminUser]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.role).toBe('Admin');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  test('US-03 – returns 401 on wrong password', async () => {
    db.execute.mockResolvedValueOnce([[mockAdminUser]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('US-03 – returns 401 on unknown username', async () => {
    db.execute.mockResolvedValueOnce([[]]); 

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'admin123' });

    expect(res.status).toBe(400);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' });

    expect(res.status).toBe(400);
  });

});

describe('POST /api/auth/logout', () => {

  test('US-04 – returns 401 if not logged in', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

});

describe('RBAC middleware', () => {

  const { requireAuth, requireRole } = require('../middleware/auth');

  test('requireAuth calls next() when session.user exists', () => {
    const req  = { session: { user: { role: 'Admin' } } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('requireAuth returns 401 when no session', () => {
    const req  = { session: {} };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole allows correct role', () => {
    const req  = { session: { user: { role: 'Admin' } } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('Admin')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('requireRole returns 403 for wrong role', () => {
    const req  = { session: { user: { role: 'VO' } } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('Admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole allows multiple roles', () => {
    const req  = { session: { user: { role: 'VO' } } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('Admin', 'VO')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

});

describe('bcrypt password hashing (T-04)', () => {

  test('hash is not equal to plain text', async () => {
    const hash = await bcrypt.hash('secret', 10);
    expect(hash).not.toBe('secret');
  });

  test('bcrypt.compare returns true for correct password', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const match = await bcrypt.compare('secret', hash);
    expect(match).toBe(true);
  });

  test('bcrypt.compare returns false for wrong password', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const match = await bcrypt.compare('wrong', hash);
    expect(match).toBe(false);
  });

});
