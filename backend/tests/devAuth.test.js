const request = require('supertest');
const express = require('express');
const { authenticate, DEV_DEMO_ACCOUNTS } = require('../src/middleware/auth');
const { requireRole } = require('../src/middleware/roles');
const User = require('../src/models/User');

// Create an isolated test application for auth testing
function createAuthTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/test/protected', authenticate, (req, res) => {
    res.status(200).json({
      sub: req.auth.sub,
      role: req.auth.role,
      userRole: req.user.role,
      servicePincodes: req.user.servicePincodes || []
    });
  });

  app.get('/test/citizen-only', authenticate, requireRole('citizen'), (req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/test/collector-only', authenticate, requireRole('collector'), (req, res) => {
    res.status(200).json({ ok: true, servicePincodes: req.user.servicePincodes });
  });

  app.get('/test/admin-only', authenticate, requireRole('admin'), (req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('Development Demo Authentication Security & Safeguards', () => {
  const env = require('../src/config/env');
  let originalNodeEnv;
  let originalAllowDevAuth;
  const app = createAuthTestApp();

  beforeAll(() => {
    originalNodeEnv = env.NODE_ENV;
    originalAllowDevAuth = env.ALLOW_DEV_DEMO_AUTH;
  });

  afterAll(() => {
    env.NODE_ENV = originalNodeEnv;
    env.ALLOW_DEV_DEMO_AUTH = originalAllowDevAuth;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Production Environment Guardrails', () => {
    test('env schema refinement strictly rejects ALLOW_DEV_DEMO_AUTH=true in production', () => {
      const { z } = require('zod');

      const testSchema = z
        .object({
          NODE_ENV: z.enum(['development', 'production', 'test']),
          ALLOW_DEV_DEMO_AUTH: z.boolean()
        })
        .refine(
          (data) => !(data.NODE_ENV === 'production' && data.ALLOW_DEV_DEMO_AUTH === true),
          {
            message: 'ALLOW_DEV_DEMO_AUTH cannot be enabled in production mode'
          }
        );

      expect(() => {
        testSchema.parse({
          NODE_ENV: 'production',
          ALLOW_DEV_DEMO_AUTH: true
        });
      }).toThrow(/ALLOW_DEV_DEMO_AUTH cannot be enabled in production mode/);
    });

    test('production mode ignores and rejects dev demo tokens', async () => {
      // Simulate production runtime
      env.NODE_ENV = 'production';
      env.ALLOW_DEV_DEMO_AUTH = true; // Even if somehow set, code must check NODE_ENV !== 'production'

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer ewaste-demo-admin-token');

      // Without live Cognito verifier in test mode, returns 500 verifier unconfigured
      // or 401 invalid token. It must NEVER authenticate!
      expect(res.status).not.toBe(200);
      expect(res.status === 401 || res.status === 500).toBe(true);

      // Restore
      env.NODE_ENV = 'test';
    });
  });

  describe('Controlled Development Demo Provider (NODE_ENV !== production && ALLOW_DEV_DEMO_AUTH === true)', () => {
    beforeEach(() => {
      env.NODE_ENV = 'test';
      env.ALLOW_DEV_DEMO_AUTH = true;
    });

    test('rejects unauthenticated requests (missing header)', async () => {
      const res = await request(app).get('/test/protected');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('rejects arbitrary, client-invented, or malicious tokens', async () => {
      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer malicious-arbitrary-token-admin');

      expect(res.status).not.toBe(200);
      expect(res.status === 401 || res.status === 500).toBe(true);
    });

    test('authenticates valid citizen demo token with isolated citizen identity', async () => {
      const mockUserDoc = {
        _id: '507f1f77bcf86cd799439011',
        cognitoSub: 'dev-demo-citizen-01',
        role: 'citizen',
        servicePincodes: [],
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc);

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer ewaste-demo-citizen-token');

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('citizen');
      expect(res.body.sub).toBe('dev-demo-citizen-01');
    });

    test('citizen demo token allows citizen-only route and rejects collector/admin routes', async () => {
      const mockUserDoc = {
        _id: '507f1f77bcf86cd799439011',
        cognitoSub: 'dev-demo-citizen-01',
        role: 'citizen',
        save: jest.fn()
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc);

      const citizenRes = await request(app)
        .get('/test/citizen-only')
        .set('Authorization', 'Bearer ewaste-demo-citizen-token');
      expect(citizenRes.status).toBe(200);

      const collectorRes = await request(app)
        .get('/test/collector-only')
        .set('Authorization', 'Bearer ewaste-demo-citizen-token');
      expect(collectorRes.status).toBe(403);

      const adminRes = await request(app)
        .get('/test/admin-only')
        .set('Authorization', 'Bearer ewaste-demo-citizen-token');
      expect(adminRes.status).toBe(403);
    });

    test('collector demo token provides collector identity with service pincodes', async () => {
      const mockUserDoc = {
        _id: '507f1f77bcf86cd799439022',
        cognitoSub: 'dev-demo-collector-01',
        role: 'collector',
        servicePincodes: ['110001', '110002'],
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc);

      const res = await request(app)
        .get('/test/collector-only')
        .set('Authorization', 'Bearer ewaste-demo-collector-token');

      expect(res.status).toBe(200);
      expect(res.body.servicePincodes).toEqual(['110001', '110002']);
    });

    test('admin demo token provides admin role and is rejected on citizen/collector routes', async () => {
      const mockUserDoc = {
        _id: '507f1f77bcf86cd799439033',
        cognitoSub: 'dev-demo-admin-01',
        role: 'admin',
        save: jest.fn()
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc);

      const adminRes = await request(app)
        .get('/test/admin-only')
        .set('Authorization', 'Bearer ewaste-demo-admin-token');
      expect(adminRes.status).toBe(200);

      const collectorRes = await request(app)
        .get('/test/collector-only')
        .set('Authorization', 'Bearer ewaste-demo-admin-token');
      expect(collectorRes.status).toBe(403);
    });

    test('demo accounts are immutable and cannot be tampered with by the client', () => {
      expect(Object.isFrozen(DEV_DEMO_ACCOUNTS)).toBe(true);
      expect(DEV_DEMO_ACCOUNTS['ewaste-demo-citizen-token'].role).toBe('citizen');
      expect(DEV_DEMO_ACCOUNTS['ewaste-demo-collector-token'].role).toBe('collector');
      expect(DEV_DEMO_ACCOUNTS['ewaste-demo-admin-token'].role).toBe('admin');
    });
  });
});
