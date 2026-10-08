const request = require('supertest');
const app = require('../src/app');
const { setVerifier } = require('../src/middleware/auth');
const User = require('../src/models/User');
const Device = require('../src/models/Device');
const Pickup = require('../src/models/Pickup');

describe('Pickup & Collector Workflow API', () => {
  let mockVerifier;
  const citizenId = '507f1f77bcf86cd799439011';
  const otherCitizenId = '507f1f77bcf86cd799439099';
  const collectorAId = '507f1f77bcf86cd799439022';
  const collectorBId = '507f1f77bcf86cd799439033';
  const servicePincode = '110001';
  const outsidePincode = '400001';

  const validPickupAddress = {
    text: '123 Green Avenue, Block B',
    pincode: servicePincode
  };

  const createMockDevice = (overrides = {}) => {
    const doc = {
      _id: '507f1f77bcf86cd799439055',
      deviceCode: 'EW-2026-000042',
      ownerId: citizenId,
      type: 'LAPTOP',
      ageYears: 3,
      powersOn: true,
      damage: 'NONE',
      notes: 'Test device',
      photoKey: 'devices/test-1234.jpg',
      status: 'REGISTERED',
      timeline: [
        {
          step: 'REGISTERED',
          at: new Date(),
          byUserId: citizenId,
          byRole: 'citizen',
          note: 'Device registered'
        }
      ],
      ai: {
        status: 'OK',
        suggestedOutcome: 'RECYCLE',
        reason: 'Initial AI advisory',
        safetyTip: 'Wipe data before pickup.'
      },
      finalOutcome: null,
      save: jest.fn().mockResolvedValue(true),
      toObject() {
        return { ...this };
      },
      ...overrides
    };
    return doc;
  };

  const createMockPickup = (overrides = {}) => {
    const doc = {
      _id: '507f1f77bcf86cd799439077',
      deviceId: '507f1f77bcf86cd799439055',
      ownerId: citizenId,
      address: { ...validPickupAddress },
      preferredSlot: 'Morning (9am - 12pm)',
      status: 'REQUESTED',
      collectorId: null,
      save: jest.fn().mockResolvedValue(true),
      toObject() {
        return { ...this };
      },
      ...overrides
    };
    return doc;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifier = {
      verify: jest.fn().mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      })
    };
    setVerifier(mockVerifier);

    jest.spyOn(User, 'findOne').mockResolvedValue({
      _id: citizenId,
      cognitoSub: 'citizen-sub-1',
      role: 'citizen',
      save: jest.fn()
    });
  });

  describe('Citizen: Request Pickup (POST /api/devices/:id/pickup)', () => {
    test('citizen can request pickup for own REGISTERED device', async () => {
      const mockDevice = createMockDevice({ status: 'REGISTERED' });
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(null); // No existing pickup
      jest.spyOn(Pickup, 'create').mockImplementation(async (data) => createMockPickup(data));

      const res = await request(app)
        .post(`/api/devices/${mockDevice._id}/pickup`)
        .set('Authorization', 'Bearer citizen-token')
        .send({
          address: validPickupAddress,
          preferredSlot: 'Evening (4pm - 7pm)'
        });

      expect(res.status).toBe(201);
      expect(res.body.pickup.status).toBe('REQUESTED');
      expect(res.body.device.status).toBe('PICKUP_REQUESTED');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline).toHaveLength(2);
      expect(mockDevice.timeline[1].step).toBe('PICKUP_REQUESTED');
      expect(mockDevice.timeline[1].byRole).toBe('citizen');
    });

    test('citizen cannot request pickup for another citizen device (403)', async () => {
      const mockDevice = createMockDevice({ ownerId: otherCitizenId });
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/devices/${mockDevice._id}/pickup`)
        .set('Authorization', 'Bearer citizen-token')
        .send({
          address: validPickupAddress,
          preferredSlot: 'Morning'
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you do not own this device' });
    });

    test('cannot request pickup if device is already PICKUP_REQUESTED (400)', async () => {
      const mockDevice = createMockDevice({ status: 'PICKUP_REQUESTED' });
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/devices/${mockDevice._id}/pickup`)
        .set('Authorization', 'Bearer citizen-token')
        .send({
          address: validPickupAddress,
          preferredSlot: 'Morning'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Pickup can only be requested when device is in REGISTERED status');
    });

    test('duplicate active pickup request is rejected (400)', async () => {
      const mockDevice = createMockDevice({ status: 'REGISTERED' });
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);
      jest.spyOn(Pickup, 'findOne').mockResolvedValue(createMockPickup({ status: 'REQUESTED' }));

      const res = await request(app)
        .post(`/api/devices/${mockDevice._id}/pickup`)
        .set('Authorization', 'Bearer citizen-token')
        .send({
          address: validPickupAddress,
          preferredSlot: 'Morning'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('An active pickup request already exists');
    });

    test('invalid address / pincode / preferredSlot rejected with 400', async () => {
      const res = await request(app)
        .post('/api/devices/507f1f77bcf86cd799439055/pickup')
        .set('Authorization', 'Bearer citizen-token')
        .send({
          address: { text: '', pincode: '' },
          preferredSlot: ''
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Citizen: Cancellation (POST /api/pickups/:id/cancel and POST /api/devices/:id/cancel)', () => {
    test('citizen can cancel pickup when REQUESTED', async () => {
      const mockPickup = createMockPickup({ status: 'REQUESTED' });
      const mockDevice = createMockDevice({ status: 'PICKUP_REQUESTED' });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/cancel`)
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(200);
      expect(mockPickup.status).toBe('CANCELLED');
      expect(mockDevice.status).toBe('CANCELLED');
      expect(mockPickup.save).toHaveBeenCalled();
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline[mockDevice.timeline.length - 1].step).toBe('CANCELLED');
    });

    test('citizen can cancel pickup when ACCEPTED (before COLLECTED)', async () => {
      const mockPickup = createMockPickup({ status: 'ACCEPTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({ status: 'ACCEPTED' });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/cancel`)
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(200);
      expect(mockPickup.status).toBe('CANCELLED');
      expect(mockDevice.status).toBe('CANCELLED');
    });

    test('cancellation rejected once device is COLLECTED (400)', async () => {
      const mockPickup = createMockPickup({ status: 'COLLECTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({ status: 'COLLECTED' });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/cancel`)
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cancellation is not allowed once device is collected');
    });

    test('non-owner citizen cannot cancel pickup (403)', async () => {
      const mockPickup = createMockPickup({ ownerId: otherCitizenId });
      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/cancel`)
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you do not own this pickup' });
    });
  });

  describe('Collector: Open Pickups (GET /api/pickups?status=REQUESTED)', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [servicePincode],
        save: jest.fn()
      });
    });

    test('collector sees only REQUESTED pickups in their service pincodes', async () => {
      const matchingPickup = createMockPickup({
        address: { text: 'Area 1', pincode: servicePincode },
        status: 'REQUESTED'
      });

      jest.spyOn(Pickup, 'find').mockImplementation((query) => {
        expect(query.status).toBe('REQUESTED');
        expect(query['address.pincode'].$in).toContain(servicePincode);
        return {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue([matchingPickup])
        };
      });

      const res = await request(app)
        .get('/api/pickups?status=REQUESTED')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].address.pincode).toBe(servicePincode);
    });

    test('collector with no service pincodes receives empty array', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [],
        save: jest.fn()
      });

      const res = await request(app)
        .get('/api/pickups?status=REQUESTED')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('citizen cannot query collector open pickups (403)', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: citizenId,
        role: 'citizen',
        save: jest.fn()
      });

      const res = await request(app)
        .get('/api/pickups?status=REQUESTED')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });
  });

  describe('Collector: Concurrency-Safe Accept (POST /api/pickups/:id/accept)', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [servicePincode],
        save: jest.fn()
      });
    });

    test('collector accepts REQUESTED pickup atomically', async () => {
      const mockPickup = createMockPickup({ status: 'ACCEPTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({ status: 'PICKUP_REQUESTED' });

      jest.spyOn(Pickup, 'findOneAndUpdate').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/accept`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(res.body.pickup.status).toBe('ACCEPTED');
      expect(res.body.device.status).toBe('ACCEPTED');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline[mockDevice.timeline.length - 1].step).toBe('ACCEPTED');
    });

    test('CONCURRENCY TEST: second collector receives 409 conflict when pickup already accepted', async () => {
      // Collector A already claimed it, so findOneAndUpdate returns null for Collector B
      jest.spyOn(Pickup, 'findOneAndUpdate').mockResolvedValue(null);
      // findById reveals pickup is now ACCEPTED
      jest.spyOn(Pickup, 'findById').mockResolvedValue(
        createMockPickup({ status: 'ACCEPTED', collectorId: collectorAId })
      );

      const res = await request(app)
        .post('/api/pickups/507f1f77bcf86cd799439077/accept')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Pickup has already been accepted');
    });

    test('collector cannot accept pickup outside their service pincodes (403)', async () => {
      jest.spyOn(Pickup, 'findOneAndUpdate').mockResolvedValue(null);
      jest.spyOn(Pickup, 'findById').mockResolvedValue(
        createMockPickup({
          status: 'REQUESTED',
          address: { text: 'Outside Area', pincode: outsidePincode }
        })
      );

      const res = await request(app)
        .post('/api/pickups/507f1f77bcf86cd799439077/accept')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('outside your service pincodes');
    });
  });

  describe('Collector: Mark Collected (POST /api/pickups/:id/collected)', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [servicePincode],
        save: jest.fn()
      });
    });

    test('assigned collector marks pickup and device as COLLECTED', async () => {
      const mockPickup = createMockPickup({ status: 'ACCEPTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({ status: 'ACCEPTED' });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/collected`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(mockPickup.status).toBe('COLLECTED');
      expect(mockDevice.status).toBe('COLLECTED');
      expect(mockPickup.save).toHaveBeenCalled();
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline[mockDevice.timeline.length - 1].step).toBe('COLLECTED');
    });

    test('different collector cannot mark pickup as collected (403)', async () => {
      const mockPickup = createMockPickup({ status: 'ACCEPTED', collectorId: collectorBId }); // assigned to B
      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/collected`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: you are not assigned to this pickup' });
    });

    test('cannot mark as collected directly from REQUESTED without ACCEPT (400)', async () => {
      const mockPickup = createMockPickup({ status: 'REQUESTED', collectorId: collectorAId });
      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/collected`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Only ACCEPTED pickups can be marked as COLLECTED');
    });
  });

  describe('Collector: Inspection & Authoritative Final Outcome (POST /api/pickups/:id/inspect)', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [servicePincode],
        save: jest.fn()
      });
    });

    test('assigned collector inspects physical device and sets final outcome overriding AI', async () => {
      const mockPickup = createMockPickup({ status: 'COLLECTED', collectorId: collectorAId });
      // Device AI suggested RECYCLE, collector inspects and decides REUSE
      const mockDevice = createMockDevice({
        status: 'COLLECTED',
        ai: {
          status: 'OK',
          suggestedOutcome: 'RECYCLE',
          reason: 'AI said recycle'
        }
      });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({
          finalOutcome: 'REUSE',
          note: 'Device tested and working perfectly'
        });

      expect(res.status).toBe(200);
      expect(mockDevice.status).toBe('INSPECTED');
      expect(mockDevice.finalOutcome).toBe('REUSE');
      // AI suggestion remains advisory and unchanged
      expect(mockDevice.ai.suggestedOutcome).toBe('RECYCLE');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline[mockDevice.timeline.length - 1].step).toBe('INSPECTED');
    });

    test('invalid finalOutcome enum is rejected with 400', async () => {
      const mockPickup = createMockPickup({ status: 'COLLECTED', collectorId: collectorAId });
      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({
          finalOutcome: 'THROW_AWAY',
          note: 'Invalid'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('finalOutcome must be REPAIR, REUSE, RESALE, or RECYCLE');
    });

    test('cannot inspect before COLLECTED (400)', async () => {
      const mockPickup = createMockPickup({ status: 'ACCEPTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({ status: 'ACCEPTED' });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/inspect`)
        .set('Authorization', 'Bearer collector-token')
        .send({ finalOutcome: 'REPAIR' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Device must be in COLLECTED status for physical inspection');
    });
  });

  describe('Collector: Complete (POST /api/pickups/:id/complete)', () => {
    beforeEach(() => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorAId,
        cognitoSub: 'collector-sub-1',
        role: 'collector',
        servicePincodes: [servicePincode],
        save: jest.fn()
      });
    });

    test('assigned collector completes inspected device', async () => {
      const mockPickup = createMockPickup({ status: 'COLLECTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({
        status: 'INSPECTED',
        finalOutcome: 'REPAIR'
      });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/complete`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(200);
      expect(mockDevice.status).toBe('COMPLETED');
      expect(mockDevice.save).toHaveBeenCalled();
      expect(mockDevice.timeline[mockDevice.timeline.length - 1].step).toBe('COMPLETED');
    });

    test('completion without inspection/finalOutcome is rejected with 400', async () => {
      const mockPickup = createMockPickup({ status: 'COLLECTED', collectorId: collectorAId });
      const mockDevice = createMockDevice({
        status: 'COLLECTED',
        finalOutcome: null
      });

      jest.spyOn(Pickup, 'findById').mockResolvedValue(mockPickup);
      jest.spyOn(Device, 'findById').mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/pickups/${mockPickup._id}/complete`)
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Device must be inspected and have a finalOutcome before completion');
    });
  });
});
