const express = require('express');
const request = require('supertest');
const {
  authenticate,
  setVerifier,
  mapCognitoGroupsToRole
} = require('../src/middleware/auth');
const { requireRole } = require('../src/middleware/roles');
const { errorHandler } = require('../src/middleware/errors');
const User = require('../src/models/User');

describe('Cognito Authentication & Role Authorization Middleware', () => {
  let app;
  let mockVerifier;

  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifier = {
      verify: jest.fn()
    };
    setVerifier(mockVerifier);

    app = express();
    app.use(express.json());

    // Protected routes for test scenarios
    app.get('/test/protected', authenticate, (req, res) => {
      res.json({
        message: 'authenticated',
        userId: req.user._id,
        role: req.user.role,
        sub: req.auth.sub
      });
    });

    app.get('/test/citizen-only', authenticate, requireRole('citizen'), (req, res) => {
      res.json({ access: 'granted', role: req.user.role });
    });

    app.get('/test/collector-only', authenticate, requireRole('collector'), (req, res) => {
      res.json({ access: 'granted', role: req.user.role });
    });

    app.get('/test/admin-only', authenticate, requireRole('admin'), (req, res) => {
      res.json({ access: 'granted', role: req.user.role });
    });

    app.use(errorHandler);
  });

  describe('mapCognitoGroupsToRole unit behavior', () => {
    test('maps empty or missing group to citizen (SPEC Section 3)', () => {
      expect(mapCognitoGroupsToRole(undefined)).toBe('citizen');
      expect(mapCognitoGroupsToRole([])).toBe('citizen');
    });

    test('maps recognized groups correctly', () => {
      expect(mapCognitoGroupsToRole(['citizen'])).toBe('citizen');
      expect(mapCognitoGroupsToRole(['collector'])).toBe('collector');
      expect(mapCognitoGroupsToRole(['admin'])).toBe('admin');
      expect(mapCognitoGroupsToRole('collector')).toBe('collector');
    });

    test('rejects unknown or unapproved Cognito groups', () => {
      expect(() => mapCognitoGroupsToRole(['superadmin'])).toThrow(
        /Unauthorized: unknown Cognito group 'superadmin'/
      );
      expect(() => mapCognitoGroupsToRole(['root'])).toThrow(
        /Unauthorized: unknown Cognito group 'root'/
      );
    });
  });

  describe('Token validation and authentication errors', () => {
    test('rejects request with missing Authorization header', async () => {
      const res = await request(app).get('/test/protected');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('rejects request with malformed Authorization header (no Bearer)', async () => {
      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Basic 12345');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('rejects request with empty Bearer token', async () => {
      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('rejects request when token verification fails (invalid or expired)', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Signature verification failed'));

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    test('rejects request when token contains unapproved group', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'cognito-sub-123',
        'cognito:groups': ['unapproved-group']
      });

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer valid-signature-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: "Unauthorized: unknown Cognito group 'unapproved-group'"
      });
    });
  });

  describe('User resolution, creation, and role mapping', () => {
    test('creates new citizen user on first authenticated request (no group)', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'new-sub-1',
        name: 'Jane Citizen'
      });

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        cognitoSub: 'new-sub-1',
        name: 'Jane Citizen',
        role: 'citizen'
      });

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'authenticated',
        userId: '507f1f77bcf86cd799439011',
        role: 'citizen',
        sub: 'new-sub-1'
      });

      expect(User.create).toHaveBeenCalledWith({
        cognitoSub: 'new-sub-1',
        name: 'Jane Citizen',
        role: 'citizen'
      });
    });

    test('creates new collector user on first authenticated request with collector group', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        name: 'Alex Collector',
        'cognito:groups': ['collector']
      });

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        cognitoSub: 'collector-sub-1',
        name: 'Alex Collector',
        role: 'collector'
      });

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('collector');
      expect(User.create).toHaveBeenCalledWith({
        cognitoSub: 'collector-sub-1',
        name: 'Alex Collector',
        role: 'collector'
      });
    });

    test('authenticates existing admin user with admin group', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      });

      const existingUser = {
        _id: '507f1f77bcf86cd799439013',
        cognitoSub: 'admin-sub-1',
        name: 'System Admin',
        role: 'citizen',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('admin');
      expect(existingUser.role).toBe('admin');
      expect(existingUser.save).toHaveBeenCalled();
    });

    test('prevents accidental privilege downgrade of existing collector if token has no groups', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-existing',
        username: 'existing_collector'
        // No cognito:groups in token
      });

      const existingCollector = {
        _id: '507f1f77bcf86cd799439014',
        cognitoSub: 'collector-sub-existing',
        name: 'Existing Collector',
        role: 'collector',
        save: jest.fn()
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(existingCollector);

      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer token-without-groups');

      expect(res.status).toBe(200);
      // Collector role is preserved in DB and session
      expect(res.body.role).toBe('collector');
      expect(existingCollector.save).not.toHaveBeenCalled();
    });
  });

  describe('Role-based access enforcement (requireRole middleware)', () => {
    test('citizen can access citizen-only route, collector cannot', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-1',
        'cognito:groups': ['citizen']
      });

      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439015',
        cognitoSub: 'citizen-1',
        role: 'citizen',
        save: jest.fn()
      });

      // Citizen accesses citizen route: 200
      const citizenRes = await request(app)
        .get('/test/citizen-only')
        .set('Authorization', 'Bearer citizen-token');
      expect(citizenRes.status).toBe(200);
      expect(citizenRes.body).toEqual({ access: 'granted', role: 'citizen' });

      // Citizen accesses collector route: 403 Forbidden
      const forbiddenRes = await request(app)
        .get('/test/collector-only')
        .set('Authorization', 'Bearer citizen-token');
      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('collector can access collector-only route, rejected on admin route', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-1',
        'cognito:groups': ['collector']
      });

      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439016',
        cognitoSub: 'collector-1',
        role: 'collector',
        save: jest.fn()
      });

      // Collector accesses collector route: 200
      const collectorRes = await request(app)
        .get('/test/collector-only')
        .set('Authorization', 'Bearer collector-token');
      expect(collectorRes.status).toBe(200);

      // Collector accesses admin route: 403
      const adminRes = await request(app)
        .get('/test/admin-only')
        .set('Authorization', 'Bearer collector-token');
      expect(adminRes.status).toBe(403);
      expect(adminRes.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('admin can access admin-only route', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-1',
        'cognito:groups': ['admin']
      });

      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439017',
        cognitoSub: 'admin-1',
        role: 'admin',
        save: jest.fn()
      });

      const res = await request(app)
        .get('/test/admin-only')
        .set('Authorization', 'Bearer admin-token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ access: 'granted', role: 'admin' });
    });
  });
});
