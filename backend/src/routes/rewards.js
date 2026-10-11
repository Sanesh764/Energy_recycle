const express = require('express');
const { z } = require('zod');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { User, RewardTransaction } = require('../models');

const router = express.Router();

const SAMPLE_COUPONS = Object.freeze({
  COUPON_GROCERY_50: {
    id: 'COUPON_GROCERY_50',
    name: 'EcoMart Groceries Voucher',
    discount: '₹100 Off',
    cost: 50,
    merchant: 'EcoMart Stores & Online'
  },
  COUPON_RIDE_75: {
    id: 'COUPON_RIDE_75',
    name: 'GreenRide EV Mobility Pass',
    discount: '20% Off',
    cost: 75,
    merchant: 'GreenRide EV Cab Service'
  },
  COUPON_TECH_100: {
    id: 'COUPON_TECH_100',
    name: 'TechRefurb Spare Parts Voucher',
    discount: '₹250 Off',
    cost: 100,
    merchant: 'Certified TechRefurb Network'
  },
  COUPON_ECOHOME_150: {
    id: 'COUPON_ECOHOME_150',
    name: 'ZeroWaste Home Starter Kit',
    discount: '15% Off',
    cost: 150,
    merchant: 'EarthFirst Sustainable Living'
  }
});

const redeemSchema = z.object({
  couponId: z.string().min(1, 'couponId is required')
});

/**
 * GET /api/rewards/wallet
 * Returns citizen coin balance, available sample coupons, and transaction ledger.
 */
router.get('/wallet', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await RewardTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      coins: user.rewardCoins || 0,
      availableCoupons: Object.values(SAMPLE_COUPONS),
      transactions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rewards/redeem
 * Interactively redeems demo coupon and records ledger entry.
 */
router.post('/redeem', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const parseResult = redeemSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid request body';
      return res.status(400).json({ error: firstError });
    }

    const { couponId } = parseResult.data;
    const coupon = SAMPLE_COUPONS[couponId];
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or unknown coupon identifier' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = user.rewardCoins || 0;
    if (currentBalance < coupon.cost) {
      return res.status(400).json({
        error: `Insufficient coins balance. Coupon requires ${coupon.cost} coins, but your wallet only has ${currentBalance} coins.`
      });
    }

    // Deduct coins atomically
    user.rewardCoins = currentBalance - coupon.cost;
    await user.save();

    const voucherCode = `ECO-${coupon.cost}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const tx = await RewardTransaction.create({
      userId: user._id,
      type: 'REDEEM',
      amount: coupon.cost,
      description: `Redeemed ${coupon.name} (${coupon.discount})`,
      couponCode: voucherCode
    });

    res.status(200).json({
      success: true,
      message: `Coupon redeemed successfully! Use code ${voucherCode} at checkout.`,
      voucherCode,
      coupon,
      newBalance: user.rewardCoins,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  router,
  SAMPLE_COUPONS
};
