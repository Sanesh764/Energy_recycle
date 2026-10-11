const request = require('supertest');
const app = require('../src/app');
const { User, Device, Pickup, RewardTransaction } = require('../src/models');
const env = require('../src/config/env');

describe('Rewards System API', () => {
  const citizenToken = 'ewaste-demo-citizen-token';
  const collectorToken = 'ewaste-demo-collector-token';

  const mockCitizen = {
    _id: '507f1f77bcf86cd799439011',
    cognitoSub: 'dev-demo-citizen-01',
    name: 'Demo Citizen',
    email: 'citizen@example.org',
    role: 'citizen',
    rewardCoins: 120,
    save: jest.fn().mockResolvedValue(true)
  };

  const mockCollector = {
    _id: '507f1f77bcf86cd799439022',
    cognitoSub: 'dev-demo-collector-01',
    name: 'Demo Collector',
    email: 'collector@example.org',
    role: 'collector',
    servicePincodes: ['110001'],
    save: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    env.ALLOW_DEV_DEMO_AUTH = true;
    env.NODE_ENV = 'test';

    // Auth middleware mocks
    jest.spyOn(User, 'findOne').mockImplementation(({ cognitoSub }) => {
      if (cognitoSub === 'dev-demo-citizen-01') return Promise.resolve(mockCitizen);
      if (cognitoSub === 'dev-demo-collector-01') return Promise.resolve(mockCollector);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/rewards/wallet', () => {
    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/rewards/wallet');
      expect(res.status).toBe(401);
    });

    test('returns 403 when called by collector', async () => {
      const res = await request(app)
        .get('/api/rewards/wallet')
        .set('Authorization', `Bearer ${collectorToken}`);
      expect(res.status).toBe(403);
    });

    test('returns coin balance, coupons, and ledger for citizen', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockCitizen);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          {
            _id: 'tx_1',
            type: 'EARN',
            amount: 50,
            description: 'Verified collection of PHONE (EW-2026-000101)',
            createdAt: new Date().toISOString()
          }
        ])
      };
      jest.spyOn(RewardTransaction, 'find').mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/rewards/wallet')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.coins).toBe(120);
      expect(Array.isArray(res.body.availableCoupons)).toBe(true);
      expect(res.body.availableCoupons.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.transactions)).toBe(true);
      expect(res.body.transactions).toHaveLength(1);
    });
  });

  describe('POST /api/rewards/redeem', () => {
    test('returns 400 when coupon is invalid', async () => {
      const res = await request(app)
        .post('/api/rewards/redeem')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ couponId: 'NON_EXISTENT_COUPON' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid or unknown coupon identifier');
    });

    test('returns 400 when user has insufficient coins', async () => {
      const brokeUser = { ...mockCitizen, rewardCoins: 10, save: jest.fn() };
      jest.spyOn(User, 'findById').mockResolvedValue(brokeUser);

      const res = await request(app)
        .post('/api/rewards/redeem')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ couponId: 'COUPON_GROCERY_50' }); // requires 50

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Insufficient coins balance');
    });

    test('successfully redeems coupon when user has sufficient coins', async () => {
      const richUser = {
        ...mockCitizen,
        rewardCoins: 120,
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(User, 'findById').mockResolvedValue(richUser);
      jest.spyOn(RewardTransaction, 'create').mockResolvedValue({
        _id: 'tx_new',
        type: 'REDEEM',
        amount: 50
      });

      const res = await request(app)
        .post('/api/rewards/redeem')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ couponId: 'COUPON_GROCERY_50' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.newBalance).toBe(70); // 120 - 50
      expect(res.body.voucherCode).toMatch(/^ECO-50-/);
      expect(richUser.save).toHaveBeenCalled();
    });
  });
});
