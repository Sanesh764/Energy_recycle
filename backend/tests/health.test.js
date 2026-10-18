const request = require('supertest');
const app = require('../src/app');

describe('Health and Not Found APIs', () => {
  test('GET /api/health returns 200 and health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('GET /health (top-level ALB/EB health path) returns 200 and health status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
  });

  test('GET / (root endpoint without API subpath) returns 404 with standard error format', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  test('GET unknown endpoint returns 404 with standard error format', async () => {
    const res = await request(app).get('/api/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });
});

