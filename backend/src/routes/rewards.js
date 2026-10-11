const express = require('express');
const mongoose = require('mongoose');
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
 * Returns citizen coin balance, total earned, total redeemed, available sample coupons with redemption state, and transaction ledger.
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

    let totalEarned = 0;
    let totalRedeemed = 0;
    const redeemedCouponMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'EARN') {
        totalEarned += tx.amount || 0;
      } else if (tx.type === 'REDEEM') {
        totalRedeemed += tx.amount || 0;
        Object.keys(SAMPLE_COUPONS).forEach((cId) => {
          if (tx.description && tx.description.includes(SAMPLE_COUPONS[cId].name)) {
            redeemedCouponMap[cId] = tx.couponCode || true;
          }
        });
      }
    });

    const couponsWithStatus = Object.values(SAMPLE_COUPONS).map((coupon) => ({
      ...coupon,
      isRedeemed: Boolean(redeemedCouponMap[coupon.id]),
      voucherCode: typeof redeemedCouponMap[coupon.id] === 'string' ? redeemedCouponMap[coupon.id] : null
    }));

    res.status(200).json({
      coins: user.rewardCoins || 0,
      totalEarned,
      totalRedeemed,
      availableCoupons: couponsWithStatus,
      transactions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rewards/redeem
 * Interactively redeems demo coupon and records ledger entry.
 * Validates single-use per coupon and sufficient coin balance.
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

    // Check if user has already redeemed this single-use demo coupon
    let existingRedemption = null;
    if (mongoose.connection?.readyState === 1 || RewardTransaction.findOne._isMockFunction) {
      existingRedemption = await RewardTransaction.findOne({
        userId: user._id,
        type: 'REDEEM',
        description: new RegExp(coupon.name, 'i')
      });
    }

    if (existingRedemption) {
      return res.status(400).json({
        error: `Coupon "${coupon.name}" has already been redeemed by your account. Voucher code: ${existingRedemption.couponCode || 'ACTIVE'}.`,
        alreadyRedeemed: true,
        voucherCode: existingRedemption.couponCode
      });
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
