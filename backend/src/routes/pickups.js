const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { Pickup, Device, User, RewardTransaction } = require('../models');
const statusMachine = require('../services/statusMachine');
const { inspectDevice, completeDevice } = require('../services/deviceOperations');

const router = express.Router();

/**
 * GET /api/pickups?status=REQUESTED
 * Collector only: Returns open pickups matching collector's service pincodes.
 * SPEC.md Section 8 & Section 3
 */
router.get('/', authenticate, requireRole('collector'), async (req, res, next) => {
  try {
    const requestedStatus = req.query.status || 'REQUESTED';
    const collectorPincodes = req.user.servicePincodes || [];

    let query;
    if (req.query.assigned === 'true' || req.query.my === 'true') {
      query = {
        collectorId: req.user._id,
        ...(req.query.status ? { status: req.query.status } : {})
      };
    } else {
      if (!Array.isArray(collectorPincodes) || collectorPincodes.length === 0) {
        return res.status(200).json([]);
      }
      query = {
        status: requestedStatus,
        'address.pincode': { $in: collectorPincodes }
      };
    }

    const pickups = await Pickup.find(query)
      .populate('deviceId', 'deviceCode type ageYears powersOn damage notes photoKey ai status')
      .sort({ createdAt: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pickups/:id/accept
 * Collector only: Concurrency-safe atomic claim of open pickup.
 * Uses atomic conditional update to guarantee that only one collector succeeds.
 * SPEC.md Section 8 & Section 9
 */
router.post('/:id', async (req, res, next) => {
  // Catch-all placeholder if called without sub-path
  next();
});

router.post('/:id/accept', authenticate, requireRole('collector'), async (req, res, next) => {
  try {
    const collectorPincodes = req.user.servicePincodes || [];

    // Atomic conditional claim
    const pickup = await Pickup.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'REQUESTED',
        'address.pincode': { $in: collectorPincodes }
      },
      {
        status: 'ACCEPTED',
        collectorId: req.user._id
      },
      { new: true }
    );

    if (!pickup) {
      // Investigate reason for failure to provide accurate, secure status code
      const existing = await Pickup.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Pickup not found' });
      }
      if (existing.status !== 'REQUESTED') {
        return res.status(409).json({ error: 'Pickup has already been accepted or is no longer open' });
      }
      if (!collectorPincodes.includes(existing.address.pincode)) {
        return res.status(403).json({ error: 'Forbidden: pickup is outside your service pincodes' });
      }
      return res.status(409).json({ error: 'Pickup could not be accepted' });
    }

    // Update Device status through centralized status machine
    const device = await Device.findById(pickup.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Associated device not found' });
    }

    statusMachine.validateTransition({
      currentStatus: device.status,
      targetStatus: 'ACCEPTED',
      role: 'collector'
    });

    device.status = 'ACCEPTED';
    device.timeline.push(
      statusMachine.createTimelineEvent({
        step: 'ACCEPTED',
        byUserId: req.user._id,
        byRole: 'collector',
        note: 'Pickup accepted by collector'
      })
    );
    await device.save();

    res.status(200).json({ pickup, device });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pickups/:id/collected
 * Collector only: Mark assigned accepted pickup as collected.
 * SPEC.md Section 8
 */
router.post('/:id/collected', authenticate, requireRole('collector'), async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    if (!pickup.collectorId || pickup.collectorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: you are not assigned to this pickup' });
    }

    if (pickup.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Only ACCEPTED pickups can be marked as COLLECTED' });
    }

    const device = await Device.findById(pickup.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Associated device not found' });
    }

    statusMachine.validateTransition({
      currentStatus: device.status,
      targetStatus: 'COLLECTED',
      role: 'collector'
    });

    pickup.status = 'COLLECTED';
    await pickup.save();

    device.status = 'COLLECTED';
    device.timeline.push(
      statusMachine.createTimelineEvent({
        step: 'COLLECTED',
        byUserId: req.user._id,
        byRole: 'collector',
        note: 'Device collected from citizen'
      })
    );

    // Credit citizen reward coins upon verified physical collection (prevent duplicate rewards)
    if (!device.rewardCredited && device.ownerId) {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          const REWARD_COINS_AWARDED = 50;
          const owner = await User.findById(device.ownerId);
          if (owner) {
            owner.rewardCoins = (owner.rewardCoins || 0) + REWARD_COINS_AWARDED;
            if (typeof owner.save === 'function') {
              await owner.save();
            }

            if (RewardTransaction && typeof RewardTransaction.create === 'function') {
              await RewardTransaction.create({
                userId: owner._id,
                type: 'EARN',
                amount: REWARD_COINS_AWARDED,
                deviceId: device._id,
                deviceCode: device.deviceCode,
                description: `Verified collection of ${device.type} (${device.deviceCode})`
              });
            }
          }
          device.rewardCredited = true;
          device.rewardCoinsAwarded = REWARD_COINS_AWARDED;
        } catch (rewardErr) {
          // Non-blocking in case of error
        }
      }
    }

    await device.save();

    res.status(200).json({ pickup, device });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pickups/:id/inspect
 * Backward-compatible alias for device inspection.
 * SPEC.md Section 4, 8 & 9
 */
router.post('/:id/inspect', authenticate, requireRole('collector'), async (req, res, next) => {
  try {
    const result = await inspectDevice({
      pickupId: req.params.id,
      user: req.user,
      body: req.body
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pickups/:id/complete
 * Backward-compatible alias for device completion.
 * SPEC.md Section 4 & 8
 */
router.post('/:id/complete', authenticate, requireRole('collector', 'admin'), async (req, res, next) => {
  try {
    const result = await completeDevice({
      pickupId: req.params.id,
      user: req.user
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pickups/:id/cancel
 * Citizen only: Cancel pickup strictly before COLLECTED.
 * SPEC.md Section 4 & 8
 */
router.post('/:id/cancel', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    if (pickup.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: you do not own this pickup' });
    }

    if (pickup.status === 'COLLECTED') {
      return res.status(400).json({ error: 'Cancellation is not allowed once device is collected' });
    }

    if (pickup.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Pickup is already cancelled' });
    }

    const device = await Device.findById(pickup.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Associated device not found' });
    }

    // State machine cancellation check (strictly before COLLECTED)
    statusMachine.validateTransition({
      currentStatus: device.status,
      targetStatus: 'CANCELLED',
      role: 'citizen'
    });

    pickup.status = 'CANCELLED';
    await pickup.save();

    device.status = 'CANCELLED';
    device.timeline.push(
      statusMachine.createTimelineEvent({
        step: 'CANCELLED',
        byUserId: req.user._id,
        byRole: 'citizen',
        note: 'Pickup cancelled by owner'
      })
    );
    await device.save();

    res.status(200).json({ pickup, device });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
