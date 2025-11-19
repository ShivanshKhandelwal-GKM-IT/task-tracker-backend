import request from 'supertest';
import { jest } from '@jest/globals';
import http from 'http';

jest.unstable_mockModule('../db/db.js', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
}));

jest.unstable_mockModule('../routes/auth-routes.js', () => ({
  default: (req, res, next) => next(),
}));

const listenSpy = jest.spyOn(http.Server.prototype, 'listen')
  .mockImplementation(() => {
    return {};
  });

const { app } = await import('../server.js');
const { pool } = await import('../db/db.js');

listenSpy.mockRestore();

describe('GET / API', () => {

  afterAll(async () => {
    pool.end();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and DB time', async () => {
    pool.query.mockResolvedValue({ rows: [{ now: '2025-01-01' }] });
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('API is running');
  });

  it('should handle database errors', async () => {
    pool.query.mockRejectedValue(new Error('DB Fail'));
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(503);
    expect(res.text).toEqual('Database connection failed');
  });
});