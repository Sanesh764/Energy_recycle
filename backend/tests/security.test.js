const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const { User, Device, Pickup, ImpactFactor } = require('../src/models');
const bcrypt = require('bcryptjs');

describe('Security & Authorization Boundary Tests (Phase 9)', () => {
  const originalEnvNodeEnv = env.NODE_ENV;
  const originalEnvAllowDev = env.ALLOW_DEV_DEMO_AUTH;

  let testAdminUser;
  let testCollectorUser;
  let testCitizenUser;
  let testAdminToken;
  let testCollectorToken;
  let testCitizenToken;

  beforeAll(async () => {
    env.NODE_ENV = 'development';
    env.ALLOW_DEV_DEMO_AUTH = true;

    const hash = await bcrypt.hash('password@123', 10);

    // Mock / provision distinct test accounts
    testAdminUser = {
      _id: '507f1f77bcf86cd799439001',
      cognitoSub: 'test-admin-sub',
      name: 'Admin Sanesh',
      email: 'sanesh7644@gmail.com',
      role: 'admin',
      passwordHash: hash,
      servicePincodes: [],
      comparePassword: jest.fn().mockImplementation(async (pwd) => pwd === 'password@123')
    };

    testCollectorUser = {
      _id: '507f1f77bcf86cd799439002',
      cognitoSub: 'test-collector-sub',
      name: 'Santosh Collector',
      email: 'santosh@gmail.com',
      role: 'collector',
      passwordHash: hash,
      servicePincodes: ['110001', '110002'],
      comparePassword: jest.fn().mockImplementation(async (pwd) => pwd === 'password@123')
    };

    testCitizenUser = {
      _id: '507f1f77bcf86cd799439003',
      cognitoSub: 'test-citizen-sub',
      name: 'Test Citizen',
      email: 'citizen@example.org',
      role: 'citizen',
      passwordHash: hash,
      servicePincodes: [],
      comparePassword: jest.fn().mockImplementation(async (pwd) => pwd === 'password@123')
    };

    testAdminToken = `dev-token-${testAdminUser._id}`;
    testCollectorToken = `dev-token-${testCollectorUser._id}`;
    testCitizenToken = `dev-token-${testCitizenUser._id}`;
  });

  afterAll(() => {
    env.NODE_ENV = originalEnvNodeEnv;
    env.ALLOW_DEV_DEMO_AUTH = originalEnvAllowDev;
  });

  beforeEach(() => {
    env.NODE_ENV = 'development';
    env.ALLOW_DEV_DEMO_AUTH = true;
    jest.clearAllMocks();

    // Mock User.findById
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = String(id);
      if (idStr === String(testAdminUser._id)) return Promise.resolve(testAdminUser);
      if (idStr === String(testCollectorUser._id)) return Promise.resolve(testCollectorUser);
      if (idStr === String(testCitizenUser._id)) return Promise.resolve(testCitizenUser);
      return Promise.resolve(null);
    });

    // Mock User.findOne
    jest.spyOn(User, 'findOne').mockImplementation((query) => {
      if (query.email) {
        const email = query.email.toLowerCase();
        if (email === 'sanesh7644@gmail.com') {
          return { select: jest.fn().mockResolvedValue(testAdminUser) };
        }
        if (email === 'santosh@gmail.com') {
          return { select: jest.fn().mockResolvedValue(testCollectorUser) };
        }
        if (email === 'citizen@example.org') {
          return { select: jest.fn().mockResolvedValue(testCitizenUser) };
        }
      }
      return { select: jest.fn().mockResolvedValue(null) };
    });

    // Mock Device.find and ImpactFactor.find for unit test environment
    jest.spyOn(Device, 'find').mockImplementation(() => {
      const p = Promise.resolve([]);
      p.sort = jest.fn().mockResolvedValue([]);
      p.lean = jest.fn().mockResolvedValue([]);
      return p;
    });
    jest.spyOn(ImpactFactor, 'find').mockImplementation(() => {
      const p = Promise.resolve([]);
      p.lean = jest.fn().mockResolvedValue([]);
      return p;
    });
  });
  describe('1. Unauthenticated Requests', () => {
    test('unauthenticated request to /api/admin/stats returns 401', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Authorization header is missing or malformed');
    });

    test('unauthenticated request to /api/devices returns 401', async () => {
      const res = await request(app).get('/api/devices');
      expect(res.status).toBe(401);
    });

    test('unauthenticated request to /api/pickups returns 401', async () => {
      const res = await request(app).get('/api/pickups');
      expect(res.status).toBe(401);
    });
  });

  // 2 & 3. Public Signup Role Enforcement
  describe('2 & 3. Public Signup Role Enforcement', () => {
    test('public signup always creates a citizen account', async () => {
      const createdUser = {
        _id: '507f1f77bcf86cd799439009',
        name: 'Normal Citizen',
        email: 'newcitizen@example.org',
        role: 'citizen',
        rewardCoins: 0,
        servicePincodes: []
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Normal Citizen',
          email: 'newcitizen@example.org',
          password: 'password@123'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('citizen');
      expect(res.body.token).toBe(`dev-token-${createdUser._id}`);
    });

    test('public signup ignores attempted role override to admin', async () => {
      let passedDoc = null;
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockImplementation(async (doc) => {
        passedDoc = doc;
        return { _id: '507f1f77bcf86cd799439010', ...doc };
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Privilege Escalation Attempt',
          email: 'attacker@example.org',
          password: 'password@123',
          role: 'admin' // ATTEMPTED EXPLOIT
        });

      expect(res.status).toBe(201);
      expect(passedDoc.role).toBe('citizen'); // Unconditionally citizen
      expect(res.body.user.role).toBe('citizen');
    });

    test('duplicate email registration returns 409 Conflict', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'sanesh7644@gmail.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Duplicate Sanesh',
          email: 'sanesh7644@gmail.com',
          password: 'password@123'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });

  // 4 & 5. Role Boundary Access Restrictions
  describe('4 & 5. Role Boundary Access Restrictions', () => {
    test('citizen cannot access admin stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testCitizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden: insufficient permissions');
    });

    test('citizen cannot access collector open pickups (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/pickups')
        .set('Authorization', `Bearer ${testCitizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden: insufficient permissions');
    });

    test('collector cannot access admin stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testCollectorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden: insufficient permissions');
    });
  });

  // 6. Admin Access
  describe('6. Admin Authorization', () => {
    test('authorized admin can access admin stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hasSampleData');
    });

    test('authorized admin can list all devices', async () => {
      jest.spyOn(Device, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // 7 & 8. Session Validation & Logout
  describe('7 & 8. Session Validation & Authentication Verification', () => {
    test('invalid session token returns 401', async () => {
      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', 'Bearer dev-token-invalidnonexistentid');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid or expired session token');
    });

    test('malformed bearer token returns 401', async () => {
      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Authorization header is missing or malformed');
    });

    test('/api/auth/me returns verified server-side identity for admin', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('sanesh7644@gmail.com');
      expect(res.body.user.role).toBe('admin');
    });
  });

  // 9 & 10. Production Fail-Closed Security
  describe('9 & 10. Production Fail-Closed Security', () => {
    test('development authentication tokens are strictly rejected in production', async () => {
      env.NODE_ENV = 'production';

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Development authentication tokens are rejected in production');
    });

    test('legacy demo tokens are strictly rejected in production', async () => {
      env.NODE_ENV = 'production';

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer ewaste-demo-admin-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Development authentication tokens are rejected in production');
    });
  });
});
