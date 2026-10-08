const request = require('supertest');
const app = require('../src/app');
const { setVerifier } = require('../src/middleware/auth');
const User = require('../src/models/User');
const Device = require('../src/models/Device');
const Counter = require('../src/models/Counter');
const Pickup = require('../src/models/Pickup');
const s3Service = require('../src/services/s3');
const aiService = require('../src/services/ai');

describe('Device Registration & AI Assessment API', () => {
  let mockVerifier;
  const citizenUserId = '507f1f77bcf86cd799439011';
  const otherCitizenId = '507f1f77bcf86cd799439099';
  const validPhotoKey = 'devices/12345678-1234-1234-1234-123456789abc.jpg';

  const validPayload = {
    type: 'LAPTOP',
    ageYears: 4,
    powersOn: true,
    damage: 'MINOR',
    notes: 'Works fine, slight battery wear',
    photoKey: validPhotoKey
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock verifier
    mockVerifier = {
      verify: jest.fn().mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      })
    };
    setVerifier(mockVerifier);

    // Default mock user
    jest.spyOn(User, 'findOne').mockResolvedValue({
      _id: citizenUserId,
      cognitoSub: 'citizen-sub-1',
      role: 'citizen',
      save: jest.fn()
    });

    // Default S3 mocks
    jest.spyOn(s3Service, 'verifyDevicePhotoObject').mockResolvedValue({
      contentLength: 102400,
      contentType: 'image/jpeg'
    });
    jest.spyOn(s3Service, 'getPhotoBytes').mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      format: 'jpeg'
    });
    jest.spyOn(s3Service, 'createDownloadPresignedUrl').mockResolvedValue(
      'https://s3.mock.amazonaws.com/test-bucket/' + validPhotoKey + '?signature=valid'
    );

    // Default Counter mock
    jest.spyOn(Counter, 'findOneAndUpdate').mockResolvedValue({
      _id: 'deviceCode',
      seq: 42
    });

    // Default AI triage mock
    jest.spyOn(aiService, 'analyzeDevice').mockResolvedValue({
      status: 'OK',
      suggestedOutcome: 'REPAIR',
      reason: 'The device powers on and has minor damage.',
      safetyTip: 'Back up your data before pickup.',
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      createdAt: new Date()
    });

    // Default Device.create mock
    jest.spyOn(Device, 'create').mockImplementation(async (doc) => ({
      _id: '507f1f77bcf86cd799439055',
      ...doc,
      toObject: () => ({
        _id: '507f1f77bcf86cd799439055',
        ...doc
      })
    }));
  });

  describe('Authorization', () => {
    test('unauthenticated request is rejected with 401', async () => {
      const res = await request(app).post('/api/devices').send(validPayload);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('citizen can create device successfully', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('deviceCode', `EW-${new Date().getFullYear()}-000042`);
      expect(res.body.status).toBe('REGISTERED');
      expect(res.body.ownerId).toBe(citizenUserId);
      expect(res.body.photoKey).toBe(validPhotoKey);
      expect(res.body).toHaveProperty('photoUrl');
      expect(res.body.ai.status).toBe('OK');
      expect(res.body.ai.suggestedOutcome).toBe('REPAIR');
    });

    test('collector cannot create device (403 Forbidden)', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439022',
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        save: jest.fn()
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer collector-token')
        .send(validPayload);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('admin cannot create device (403 Forbidden)', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: '507f1f77bcf86cd799439033',
        cognitoSub: 'admin-sub-1',
        role: 'admin',
        save: jest.fn()
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer admin-token')
        .send(validPayload);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });
  });

  describe('Request Body Validation', () => {
    test('invalid device type is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, type: 'SPACESHIP' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid device type');
    });

    test('negative age is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, ageYears: -1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ageYears must be at least 0');
    });

    test('age > 30 is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, ageYears: 31 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ageYears cannot exceed 30');
    });

    test('invalid powersOn is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, powersOn: 'yes' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('powersOn must be a boolean');
    });

    test('invalid damage value is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, damage: 'CRUSHED' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('damage must be NONE, MINOR, or MAJOR');
    });

    test('notes > 300 characters is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, notes: 'a'.repeat(301) });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('notes cannot exceed 300 characters');
    });

    test('missing photoKey is rejected with 400', async () => {
      const { photoKey, ...payloadWithoutPhoto } = validPayload;
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(payloadWithoutPhoto);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('photoKey is required');
    });
  });

  describe('S3 Photo Verification', () => {
    test('invalid photoKey format outside devices/ namespace is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({ ...validPayload, photoKey: 'malicious/traversal.jpg' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid photoKey format');
    });

    test('non-existent S3 object is rejected with 400', async () => {
      jest.spyOn(s3Service, 'verifyDevicePhotoObject').mockRejectedValueOnce({
        statusCode: 400,
        message: 'Uploaded photo object does not exist in S3 storage'
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(validPayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Uploaded photo object does not exist in S3 storage');
    });

    test('oversized S3 object (>3MB) is rejected with 400', async () => {
      jest.spyOn(s3Service, 'verifyDevicePhotoObject').mockRejectedValueOnce({
        statusCode: 400,
        message: 'Uploaded photo exceeds maximum allowed size of 3 MB'
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(validPayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Uploaded photo exceeds maximum allowed size of 3 MB');
    });
  });

  describe('Device Integrity & Controlled Fields', () => {
    test('client cannot tamper with ownerId, role, status, or deviceCode', async () => {
      let createdDoc;
      jest.spyOn(Device, 'create').mockImplementationOnce(async (doc) => {
        createdDoc = doc;
        return {
          _id: '507f1f77bcf86cd799439055',
          ...doc,
          toObject: () => ({ _id: '507f1f77bcf86cd799439055', ...doc })
        };
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send({
          ...validPayload,
          ownerId: '507f1f77bcf86cd799439999', // forged
          deviceCode: 'EW-1999-999999', // forged
          status: 'COMPLETED', // forged
          role: 'admin' // forged
        });

      expect(res.status).toBe(201);
      expect(createdDoc.ownerId).toBe(citizenUserId);
      expect(createdDoc.status).toBe('REGISTERED');
      expect(createdDoc.deviceCode).toBe(`EW-${new Date().getFullYear()}-000042`);
      expect(createdDoc.timeline[0].step).toBe('REGISTERED');
      expect(createdDoc.timeline[0].byRole).toBe('citizen');
    });

    test('device code uses atomic counter and format EW-YYYY-NNNNNN', async () => {
      jest.spyOn(Counter, 'findOneAndUpdate').mockResolvedValueOnce({
        _id: 'deviceCode',
        seq: 1
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(validPayload);

      expect(res.status).toBe(201);
      const currentYear = new Date().getFullYear();
      expect(res.body.deviceCode).toBe(`EW-${currentYear}-000001`);
    });
  });

  describe('AI Assessment & Fallback Behavior', () => {
    test('Bedrock failure or timeout triggers FALLBACK without failing device registration', async () => {
      jest.spyOn(aiService, 'analyzeDevice').mockResolvedValueOnce({
        status: 'FALLBACK',
        suggestedOutcome: 'RECYCLE',
        reason: 'We could not analyse this device. The collector will check it.',
        safetyTip: 'Back up your data and remove personal accounts before handing over the device.',
        modelId: null,
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer citizen-token')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.ai.status).toBe('FALLBACK');
      expect(res.body.ai.suggestedOutcome).toBe('RECYCLE');
      expect(res.body.ai.reason).toBe('We could not analyse this device. The collector will check it.');
    });

    test('parseAndValidateAiResponse strictly validates schema and strips code blocks', () => {
      const validAiJson = `\`\`\`json
      {
        "suggestedOutcome": "REPAIR",
        "reason": "Screen cracked but display still lights up.",
        "safetyTip": "Remove memory card and reset to factory settings."
      }
      \`\`\``;

      const parsed = aiService.parseAndValidateAiResponse(validAiJson);
      expect(parsed.suggestedOutcome).toBe('REPAIR');
      expect(parsed.reason).toContain('Screen cracked');
    });

    test('parseAndValidateAiResponse throws on invalid outcome enum', () => {
      const invalidOutcome = JSON.stringify({
        suggestedOutcome: 'DESTROY',
        reason: 'Broken',
        safetyTip: 'Be careful'
      });

      expect(() => aiService.parseAndValidateAiResponse(invalidOutcome)).toThrow(
        /AI output validation failed/
      );
    });
  });

  describe('GET /api/devices (List) and GET /api/devices/:id', () => {
    test('citizen GET /api/devices returns only their own devices', async () => {
      const ownDevice = {
        _id: '507f1f77bcf86cd799439055',
        deviceCode: 'EW-2026-000042',
        ownerId: citizenUserId,
        photoKey: validPhotoKey,
        status: 'REGISTERED',
        toObject: () => ({
          _id: '507f1f77bcf86cd799439055',
          deviceCode: 'EW-2026-000042',
          ownerId: citizenUserId,
          photoKey: validPhotoKey,
          status: 'REGISTERED'
        })
      };

      jest.spyOn(Device, 'find').mockImplementation((query) => {
        expect(query.ownerId).toBe(citizenUserId);
        return {
          sort: jest.fn().mockResolvedValue([ownDevice])
        };
      });

      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].ownerId).toBe(citizenUserId);
      expect(res.body[0]).toHaveProperty('photoUrl');
    });

    test('citizen can retrieve own device by ID', async () => {
      const ownDevice = {
        _id: '507f1f77bcf86cd799439055',
        deviceCode: 'EW-2026-000042',
        ownerId: citizenUserId,
        photoKey: validPhotoKey,
        status: 'REGISTERED',
        toObject: () => ({
          _id: '507f1f77bcf86cd799439055',
          deviceCode: 'EW-2026-000042',
          ownerId: citizenUserId,
          photoKey: validPhotoKey,
          status: 'REGISTERED'
        })
      };

      jest.spyOn(Device, 'findById').mockResolvedValue(ownDevice);

      const res = await request(app)
        .get('/api/devices/507f1f77bcf86cd799439055')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(200);
      expect(res.body._id).toBe('507f1f77bcf86cd799439055');
      expect(res.body).toHaveProperty('photoUrl');
    });

    test('citizen CANNOT retrieve another citizen device (403 Forbidden)', async () => {
      const otherDevice = {
        _id: '507f1f77bcf86cd799439088',
        deviceCode: 'EW-2026-000088',
        ownerId: otherCitizenId, // belongs to someone else
        photoKey: validPhotoKey,
        status: 'REGISTERED',
        toObject: () => ({
          _id: '507f1f77bcf86cd799439088',
          deviceCode: 'EW-2026-000088',
          ownerId: otherCitizenId,
          photoKey: validPhotoKey,
          status: 'REGISTERED'
        })
      };

      jest.spyOn(Device, 'findById').mockResolvedValue(otherDevice);

      const res = await request(app)
        .get('/api/devices/507f1f77bcf86cd799439088')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you do not own this device' });
    });

    test('device not found returns 404', async () => {
      jest.spyOn(Device, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/devices/507f1f77bcf86cd799439999')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Device not found' });
    });
  });

  describe('Physical Device Inspection: POST /api/devices/:id/inspect', () => {
    const collectorId = '507f1f77bcf86cd799439022';
    const otherCollectorId = '507f1f77bcf86cd799439033';
    const deviceId = '507f1f77bcf86cd799439055';

    const mockCollectorAuth = (id = collectorId) => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: id,
        cognitoSub: 'collector-sub-1',
        role: 'collector'
      });
    };

    const createMockDeviceDoc = (overrides = {}) => ({
      _id: deviceId,
      deviceCode: 'EW-2026-000042',
      ownerId: citizenUserId,
      type: 'LAPTOP',
      status: 'COLLECTED',
      finalOutcome: null,
      timeline: [
        { step: 'REGISTERED', at: new Date(), byRole: 'citizen' },
        { step: 'PICKUP_REQUESTED', at: new Date(), byRole: 'citizen' },
        { step: 'ACCEPTED', at: new Date(), byRole: 'collector' },
        { step: 'COLLECTED', at: new Date(), byRole: 'collector' }
      ],
      save: jest.fn().mockResolvedValue(true),
      ...overrides
    });

    const createMockPickupDoc = (overrides = {}) => ({
      _id: '507f1f77bcf86cd799439077',
      deviceId,
      ownerId: citizenUserId,
      status: 'COLLECTED',
      collectorId,
      save: jest.fn().mockResolvedValue(true),
      ...overrides
    });

    test('assigned collector can inspect device via /api/devices/:id/inspect', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockDeviceDoc();
      const mockPickup = createMockPickupDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({
          finalOutcome: 'REPAIR',
          note: 'Screen replaced, battery diagnostics healthy'
        });

      expect(res.status).toBe(200);
      expect(res.body.device.status).toBe('INSPECTED');
      expect(res.body.device.finalOutcome).toBe('REPAIR');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline).toHaveLength(5);
      expect(mockDevice.timeline[4].step).toBe('INSPECTED');
      expect(mockDevice.timeline[4].byRole).toBe('collector');
      expect(mockDevice.timeline[4].byUserId).toBe(collectorId);
    });

    test('unassigned collector cannot inspect device (403 Forbidden)', async () => {
      mockCollectorAuth(otherCollectorId);
      const mockDevice = createMockDeviceDoc();
      const mockPickup = createMockPickupDoc({ collectorId }); // assigned to collectorId, not otherCollectorId

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer other-collector-token')
        .send({ finalOutcome: 'REUSE' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you are not assigned to this pickup' });
    });

    test('citizen cannot inspect device (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer citizen-token')
        .send({ finalOutcome: 'REPAIR' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('admin cannot inspect device (403 Forbidden)', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: 'admin-1',
        cognitoSub: 'admin-sub-1',
        role: 'admin'
      });

      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer admin-token')
        .send({ finalOutcome: 'REPAIR' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('inspection requires COLLECTED status (400 Bad Request)', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockDeviceDoc({ status: 'ACCEPTED' });
      const mockPickup = createMockPickupDoc({ status: 'ACCEPTED' });

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({ finalOutcome: 'RECYCLE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('must be in COLLECTED status');
    });

    test('invalid finalOutcome enum is rejected with 400', async () => {
      mockCollectorAuth(collectorId);
      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({ finalOutcome: 'DESTROY' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('finalOutcome must be REPAIR, REUSE, RESALE, or RECYCLE');
    });

    test('device not found returns 404', async () => {
      mockCollectorAuth(collectorId);
      jest.spyOn(Device, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/devices/507f1f77bcf86cd799439999/inspect')
        .set('Authorization', 'Bearer collector-token')
        .send({ finalOutcome: 'REPAIR' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Device not found' });
    });

    test('associated pickup not found returns 404', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockDeviceDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({ finalOutcome: 'REPAIR' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Associated pickup not found' });
    });
  });

  describe('Device Completion: POST /api/devices/:id/complete', () => {
    const collectorId = '507f1f77bcf86cd799439022';
    const otherCollectorId = '507f1f77bcf86cd799439033';
    const adminId = '507f1f77bcf86cd799439044';
    const deviceId = '507f1f77bcf86cd799439055';

    const mockCollectorAuth = (id = collectorId) => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: id,
        cognitoSub: 'collector-sub-1',
        role: 'collector'
      });
    };

    const mockAdminAuth = (id = adminId) => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: id,
        cognitoSub: 'admin-sub-1',
        role: 'admin'
      });
    };

    const createMockInspectedDevice = (overrides = {}) => ({
      _id: deviceId,
      deviceCode: 'EW-2026-000042',
      ownerId: citizenUserId,
      type: 'LAPTOP',
      status: 'INSPECTED',
      finalOutcome: 'REUSE',
      timeline: [
        { step: 'REGISTERED', at: new Date(), byRole: 'citizen' },
        { step: 'PICKUP_REQUESTED', at: new Date(), byRole: 'citizen' },
        { step: 'ACCEPTED', at: new Date(), byRole: 'collector' },
        { step: 'COLLECTED', at: new Date(), byRole: 'collector' },
        { step: 'INSPECTED', at: new Date(), byRole: 'collector' }
      ],
      save: jest.fn().mockResolvedValue(true),
      ...overrides
    });

    const createMockPickupDoc = (overrides = {}) => ({
      _id: '507f1f77bcf86cd799439077',
      deviceId,
      ownerId: citizenUserId,
      status: 'COLLECTED',
      collectorId,
      save: jest.fn().mockResolvedValue(true),
      ...overrides
    });

    test('assigned collector can complete inspected device via /api/devices/:id/complete', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockInspectedDevice();
      const mockPickup = createMockPickupDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(res.body.device.status).toBe('COMPLETED');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline).toHaveLength(6);
      expect(mockDevice.timeline[5].step).toBe('COMPLETED');
      expect(mockDevice.timeline[5].byRole).toBe('collector');
      expect(mockDevice.timeline[5].byUserId).toBe(collectorId);
    });

    test('admin can complete inspected device via /api/devices/:id/complete', async () => {
      mockAdminAuth(adminId);
      const mockDevice = createMockInspectedDevice();
      const mockPickup = createMockPickupDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.device.status).toBe('COMPLETED');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline).toHaveLength(6);
      expect(mockDevice.timeline[5].step).toBe('COMPLETED');
      expect(mockDevice.timeline[5].byRole).toBe('admin');
      expect(mockDevice.timeline[5].byUserId).toBe(adminId);
    });

    test('citizen cannot complete device (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('unassigned collector cannot complete device (403 Forbidden)', async () => {
      mockCollectorAuth(otherCollectorId);
      const mockDevice = createMockInspectedDevice();
      const mockPickup = createMockPickupDoc({ collectorId }); // assigned to collectorId, not otherCollectorId

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer other-collector-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you are not assigned to this pickup' });
    });

    test('completion requires INSPECTED status (400 Bad Request)', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockInspectedDevice({ status: 'COLLECTED' });
      const mockPickup = createMockPickupDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('must be in INSPECTED status');
    });

    test('completion requires finalOutcome to be present (400 Bad Request)', async () => {
      mockCollectorAuth(collectorId);
      const mockDevice = createMockInspectedDevice({ finalOutcome: null });
      const mockPickup = createMockPickupDoc();

      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/devices/${deviceId}/complete`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('must be inspected and have a finalOutcome');
    });

    test('device not found returns 404', async () => {
      mockCollectorAuth(collectorId);
      jest.spyOn(Device, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/devices/507f1f77bcf86cd799439999/complete')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Device not found' });
    });
  });
});
