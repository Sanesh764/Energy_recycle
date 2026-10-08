const request = require('supertest');
const app = require('../src/app');
const { setVerifier } = require('../src/middleware/auth');
const User = require('../src/models/User');
const Device = require('../src/models/Device');
const ImpactFactor = require('../src/models/ImpactFactor');
const { FORMULA_DOCUMENTATION } = require('../src/services/impact');

describe('Admin & Impact Statistics API (GET /api/admin/stats)', () => {
  let mockVerifier;
  const adminUserId = '507f1f77bcf86cd799439001';
  const citizenUserId = '507f1f77bcf86cd799439002';
  const collectorUserId = '507f1f77bcf86cd799439003';

  const defaultImpactFactors = [
    {
      deviceType: 'PHONE',
      avgWeightKg: 0.2,
      recyclableShare: 0.8,
      source: 'ITU / Global E-waste Monitor 2024'
    },
    {
      deviceType: 'LAPTOP',
      avgWeightKg: 2.5,
      recyclableShare: 0.85,
      source: 'ITU / Global E-waste Monitor 2024'
    },
    {
      deviceType: 'TV',
      avgWeightKg: 15.0,
      recyclableShare: 0.75,
      source: 'EPA Electronics Baseline'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default verifier for admin
    mockVerifier = {
      verify: jest.fn().mockResolvedValue({
        sub: 'admin-sub-1',
        'cognito:groups': ['admin']
      })
    };
    setVerifier(mockVerifier);

    // Default mock user
    jest.spyOn(User, 'findOne').mockResolvedValue({
      _id: adminUserId,
      cognitoSub: 'admin-sub-1',
      role: 'admin',
      save: jest.fn()
    });

    // Default impact factors
    jest.spyOn(ImpactFactor, 'find').mockReturnValue({
      lean: jest.fn().mockResolvedValue(defaultImpactFactors)
    });
  });

  describe('Authorization and Access Control', () => {
    test('unauthenticated request is rejected with 401', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authorization header is missing or malformed' });
    });

    test('invalid or expired token is rejected with 401', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Token expired'));

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    test('citizen user is rejected with 403 Forbidden', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'citizen-sub-1',
        'cognito:groups': ['citizen']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: citizenUserId,
        cognitoSub: 'citizen-sub-1',
        role: 'citizen'
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer citizen-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('collector user is rejected with 403 Forbidden', async () => {
      mockVerifier.verify.mockResolvedValue({
        sub: 'collector-sub-1',
        'cognito:groups': ['collector']
      });
      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: collectorUserId,
        cognitoSub: 'collector-sub-1',
        role: 'collector'
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer collector-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden: insufficient permissions' });
    });

    test('admin user is authorized with 200 OK', async () => {
      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalHandled', 0);
      expect(res.body).toHaveProperty('label', 'Estimate');
    });
  });

  describe('Outcome Counting & Status Filtering', () => {
    test('only COMPLETED devices are queried and counted', async () => {
      const mockFind = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'dev-1',
            status: 'COMPLETED',
            type: 'PHONE',
            finalOutcome: 'REPAIR',
            ai: { suggestedOutcome: 'RECYCLE' },
            isSample: false
          },
          {
            _id: 'dev-2',
            status: 'COMPLETED',
            type: 'LAPTOP',
            finalOutcome: 'REUSE',
            ai: { suggestedOutcome: 'REPAIR' },
            isSample: false
          },
          {
            _id: 'dev-3',
            status: 'COMPLETED',
            type: 'LAPTOP',
            finalOutcome: 'RESALE',
            ai: { suggestedOutcome: 'RECYCLE' },
            isSample: false
          },
          {
            _id: 'dev-4',
            status: 'COMPLETED',
            type: 'PHONE',
            finalOutcome: 'RECYCLE',
            ai: { suggestedOutcome: 'REPAIR' },
            isSample: false
          }
        ])
      });
      jest.spyOn(Device, 'find').mockImplementation(mockFind);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      // Verify query strictly requires status: 'COMPLETED'
      expect(mockFind).toHaveBeenCalledWith({ status: 'COMPLETED' });

      expect(res.body.totalHandled).toBe(4);
      expect(res.body.outcomes).toEqual({
        REPAIR: 1,
        REUSE: 1,
        RESALE: 1,
        RECYCLE: 1
      });
    });

    test('uses authoritative finalOutcome and strictly ignores advisory ai.suggestedOutcome', async () => {
      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'dev-1',
            status: 'COMPLETED',
            type: 'LAPTOP',
            finalOutcome: 'RECYCLE', // authoritative
            ai: { suggestedOutcome: 'REPAIR' } // advisory, must be ignored
          }
        ])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.outcomes.REPAIR).toBe(0);
      expect(res.body.outcomes.RECYCLE).toBe(1);
    });
  });

  describe('Empirical Impact Formula Calculation', () => {
    test('calculates keptInUseKg and recyclableKg accurately according to SPEC.md Section 10', async () => {
      // Impact factors:
      // PHONE: avgWeightKg = 0.2, recyclableShare = 0.8
      // LAPTOP: avgWeightKg = 2.5, recyclableShare = 0.85
      //
      // Devices:
      // 1 PHONE (REPAIR) -> kept: 0.2
      // 1 LAPTOP (REUSE) -> kept: 2.5
      // 1 LAPTOP (RESALE) -> kept: 2.5
      // Total keptInUseKg = 0.2 + 2.5 + 2.5 = 5.2
      //
      // 1 PHONE (RECYCLE) -> recyclable: 0.2 * 0.8 = 0.16
      // 1 LAPTOP (RECYCLE) -> recyclable: 2.5 * 0.85 = 2.125
      // Total recyclableKg = 0.16 + 2.125 = 2.285 -> rounded to 2.3
      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { status: 'COMPLETED', type: 'PHONE', finalOutcome: 'REPAIR' },
          { status: 'COMPLETED', type: 'LAPTOP', finalOutcome: 'REUSE' },
          { status: 'COMPLETED', type: 'LAPTOP', finalOutcome: 'RESALE' },
          { status: 'COMPLETED', type: 'PHONE', finalOutcome: 'RECYCLE' },
          { status: 'COMPLETED', type: 'LAPTOP', finalOutcome: 'RECYCLE' }
        ])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.totalHandled).toBe(5);
      expect(res.body.keptInUseKg).toBe(5.2);
      expect(res.body.recyclableKg).toBe(2.3);
      expect(res.body.label).toBe('Estimate');
      expect(res.body.formulaDocumentation).toBe(FORMULA_DOCUMENTATION);
      expect(res.body.sourceCitation).toBe('ITU / Global E-waste Monitor 2024');
    });
  });

  describe('Missing Impact Factors and Citations Handling', () => {
    test('evaluates keptInUseKg to "not available" when a completed device type has no factor in DB', async () => {
      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { status: 'COMPLETED', type: 'OTHER', finalOutcome: 'REPAIR' } // OTHER not in factors
        ])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.totalHandled).toBe(1);
      expect(res.body.outcomes.REPAIR).toBe(1);
      expect(res.body.keptInUseKg).toBe('not available');
    });

    test('evaluates recyclableKg to "not available" when factor lacks recyclableShare', async () => {
      jest.spyOn(ImpactFactor, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            deviceType: 'PHONE',
            avgWeightKg: 0.2,
            // recyclableShare missing
            source: 'ITU / Global E-waste Monitor 2024'
          }
        ])
      });

      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { status: 'COMPLETED', type: 'PHONE', finalOutcome: 'RECYCLE' }
        ])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.recyclableKg).toBe('not available');
    });

    test('evaluates keptInUseKg to "not available" when factor lacks a valid published source', async () => {
      jest.spyOn(ImpactFactor, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            deviceType: 'PHONE',
            avgWeightKg: 0.2,
            recyclableShare: 0.8,
            source: '' // Empty source
          }
        ])
      });

      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { status: 'COMPLETED', type: 'PHONE', finalOutcome: 'REPAIR' }
        ])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.keptInUseKg).toBe('not available');
      expect(res.body.sourceCitation).toBe('not available');
    });

    test('evaluates sourceCitation to "not available" when no factors have sources in DB', async () => {
      jest.spyOn(ImpactFactor, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.sourceCitation).toBe('not available');
    });
  });

  describe('Sample Data Handling & Exclusion Toggle', () => {
    test('includes sample data and sets hasSampleData = true when excludeSample is not set', async () => {
      const mockFind = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            status: 'COMPLETED',
            type: 'PHONE',
            finalOutcome: 'REPAIR',
            isSample: true
          },
          {
            status: 'COMPLETED',
            type: 'LAPTOP',
            finalOutcome: 'REUSE',
            isSample: false
          }
        ])
      });
      jest.spyOn(Device, 'find').mockImplementation(mockFind);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(mockFind).toHaveBeenCalledWith({ status: 'COMPLETED' });
      expect(res.body.totalHandled).toBe(2);
      expect(res.body.hasSampleData).toBe(true);
    });

    test('excludes sample data and queries isSample: { $ne: true } when excludeSample=true', async () => {
      const mockFind = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            status: 'COMPLETED',
            type: 'LAPTOP',
            finalOutcome: 'REUSE',
            isSample: false
          }
        ])
      });
      jest.spyOn(Device, 'find').mockImplementation(mockFind);

      const res = await request(app)
        .get('/api/admin/stats?excludeSample=true')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(mockFind).toHaveBeenCalledWith({
        status: 'COMPLETED',
        isSample: { $ne: true }
      });
      expect(res.body.totalHandled).toBe(1);
      expect(res.body.hasSampleData).toBe(false);
      expect(res.body.outcomes.REUSE).toBe(1);
    });

    test('supports includeSample=false parameter as alternative toggle', async () => {
      const mockFind = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(Device, 'find').mockImplementation(mockFind);

      const res = await request(app)
        .get('/api/admin/stats?includeSample=false')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(mockFind).toHaveBeenCalledWith({
        status: 'COMPLETED',
        isSample: { $ne: true }
      });
    });
  });

  describe('Empty Database State', () => {
    test('returns zero totals and empty outcome breakdown when no completed devices exist', async () => {
      jest.spyOn(Device, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalHandled: 0,
        outcomes: {
          REPAIR: 0,
          REUSE: 0,
          RESALE: 0,
          RECYCLE: 0
        },
        keptInUseKg: 0,
        recyclableKg: 0,
        hasSampleData: false,
        sourceCitation: 'ITU / Global E-waste Monitor 2024; EPA Electronics Baseline',
        formulaDocumentation: FORMULA_DOCUMENTATION,
        label: 'Estimate'
      });
    });
  });
});
