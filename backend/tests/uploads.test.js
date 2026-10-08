const request = require('supertest');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const app = require('../src/app');
const { setVerifier } = require('../src/middleware/auth');
const User = require('../src/models/User');
const s3Service = require('../src/services/s3');

// Mock @aws-sdk/s3-request-presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn()
}));

describe('Upload Presign API (POST /api/uploads/presign)', () => {
  let mockVerifier;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Cognito token verification
    mockVerifier = {
      verify: jest.fn()
    };
    setVerifier(mockVerifier);

    // Mock S3 presigning
    getSignedUrl.mockImplementation(async (client, command, options) => {
      return `https://s3.mock.amazonaws.com/${command.input.Bucket}/${command.input.Key}?mock-signature=true`;
    });
  });

  describe('Authorization and Access Control', () => {
    test('unauthenticated request is rejected with 401', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .send({ contentType: 'image/jpeg' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('collector is rejected with 403 Forbidden', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        save: jest.fn()
      });

      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer collector-token')
        .send({ contentType: 'image/jpeg' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('admin is rejected with 403 Forbidden', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        cognitoSub: 'admin-sub-1',
        role: 'admin',
        save: jest.fn()
      });

      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer admin-token')
        .send({ contentType: 'image/jpeg' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('citizen can request a presigned upload successfully', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        cognitoSub: 'citizen-sub-1',
        role: 'citizen'
      });

      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'image/jpeg' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('uploadUrl');
      expect(res.body).toHaveProperty('key');
      expect(res.body.key).toMatch(/^devices\/[0-9a-f-]{36}\.jpg$/);
      expect(res.body.uploadUrl).toContain(res.body.key);
    });
  });

  describe('MIME Type Validation', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        cognitoSub: 'citizen-sub-1',
        role: 'citizen'
      });
    });

    test('accepts image/jpeg and outputs .jpg extension', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'image/jpeg' });

      expect(res.status).toBe(200);
      expect(res.body.key).toMatch(/^devices\/[0-9a-f-]{36}\.jpg$/);
    });

    test('accepts image/png and outputs .png extension', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'image/png' });

      expect(res.status).toBe(200);
      expect(res.body.key).toMatch(/^devices\/[0-9a-f-]{36}\.png$/);
    });

    test('rejects unsupported MIME type (image/gif) with 400', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'image/gif' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Invalid contentType. Only image/jpeg and image/png are allowed'
      });
    });

    test('rejects unsupported MIME type (application/pdf) with 400', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'application/pdf' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Invalid contentType. Only image/jpeg and image/png are allowed'
      });
    });

    test('rejects malformed request with missing contentType', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('S3 Key Generation and URL Expiration Security', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        cognitoSub: 'citizen-sub-1',
        role: 'citizen'
      });
    });

    test('S3 key is generated on the backend and ignores any client-supplied key or filename', async () => {
      const res = await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({
          contentType: 'image/jpeg',
          key: 'evil/path/traversal.jpg',
          filename: '../../../malicious.exe'
        });

      expect(res.status).toBe(200);
      expect(res.body.key).not.toContain('evil');
      expect(res.body.key).not.toContain('malicious');
      expect(res.body.key.startsWith('devices/')).toBe(true);
    });

    test('verifies getSignedUrl is called with expiresIn: 300 (5 minutes)', async () => {
      await request(app)
        .post('/api/uploads/presign')
        .set('Authorization', 'Bearer citizen-token')
        .send({ contentType: 'image/jpeg' });

      expect(getSignedUrl).toHaveBeenCalledTimes(1);
      const [clientArg, commandArg, optionsArg] = getSignedUrl.mock.calls[0];

      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ContentType).toBe('image/jpeg');
      expect(optionsArg).toEqual({ expiresIn: 300 });
    });
  });

  describe('s3Service.createDownloadPresignedUrl helper', () => {
    test('creates a presigned GET url for valid key', async () => {
      getSignedUrl.mockResolvedValue('https://s3.mock.amazonaws.com/test-bucket/devices/sample.jpg?mock=get');

      const url = await s3Service.createDownloadPresignedUrl({
        key: 'devices/sample.jpg'
      });

      expect(url).toContain('devices/sample.jpg');
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 300 }
      );
    });

    test('rejects key without devices/ prefix', async () => {
      await expect(
        s3Service.createDownloadPresignedUrl({ key: 'outside/private-file.txt' })
      ).rejects.toThrow('Invalid S3 object key');
    });
  });
});
