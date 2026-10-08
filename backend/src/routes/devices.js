const express = require('express');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { Device, Counter, Pickup } = require('../models');
const s3Service = require('../services/s3');
const aiService = require('../services/ai');
const statusMachine = require('../services/statusMachine');
const { inspectDevice, completeDevice } = require('../services/deviceOperations');

const router = express.Router();

const createDeviceSchema = z.object({
  type: z.enum(['PHONE', 'LAPTOP', 'TV', 'CHARGER', 'BATTERY', 'PRINTER', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid device type' })
  }),
  ageYears: z
    .number({ invalid_type_error: 'ageYears must be a number' })
    .min(0, 'ageYears must be at least 0')
    .max(30, 'ageYears cannot exceed 30'),
  powersOn: z.boolean({ invalid_type_error: 'powersOn must be a boolean' }),
  damage: z.enum(['NONE', 'MINOR', 'MAJOR'], {
    errorMap: () => ({ message: 'damage must be NONE, MINOR, or MAJOR' })
  }),
  notes: z.string().max(300, 'notes cannot exceed 300 characters').optional().default(''),
  photoKey: z
    .string({ required_error: 'photoKey is required' })
    .regex(/^devices\/[0-9a-f-]{36}\.(jpe?g|png)$/i, {
      message: 'Invalid photoKey format. Key must be inside the devices/ namespace'
    })
});

const pickupRequestSchema = z.object({
  address: z.object({
    text: z.string().min(1, 'Address text is required').trim(),
    pincode: z.string().min(1, 'Pincode is required').trim()
  }),
  preferredSlot: z.string().min(1, 'Preferred slot is required').trim()
});

/**
 * Generates an atomic sequential passport code: EW-YYYY-NNNNNN
 * e.g. EW-2026-000001
 */
async function generateDeviceCode() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'deviceCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const year = new Date().getFullYear();
  const seqStr = String(counter.seq).padStart(6, '0');
  return `EW-${year}-${seqStr}`;
}

/**
 * POST /api/devices
 * Citizen only: Register device, verify S3 photo, run AI triage, generate passport code.
 */
router.post('/', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const parseResult = createDeviceSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid request body';
      return res.status(400).json({ error: firstError });
    }

    const { type, ageYears, powersOn, damage, notes, photoKey } = parseResult.data;

    // 1. Verify photo existence, MIME, and size (<3MB) in private S3 storage
    await s3Service.verifyDevicePhotoObject({ key: photoKey });

    // 2. Fetch image bytes from S3 for Bedrock Converse API ingestion
    let photoBytes = null;
    let photoFormat = 'jpeg';
    try {
      const photoData = await s3Service.getPhotoBytes({ key: photoKey });
      photoBytes = photoData.bytes;
      photoFormat = photoData.format;
    } catch (s3ReadError) {
      // Continue to AI triage even if image byte retrieval fails; AI will use fallback
    }

    // 3. Call Amazon Bedrock Converse API triage (never throws; falls back if failed)
    const aiResult = await aiService.analyzeDevice({
      type,
      ageYears,
      powersOn,
      damage,
      notes,
      photoBytes,
      photoFormat
    });

    // 4. Generate unique atomic deviceCode (EW-YYYY-NNNNNN)
    const deviceCode = await generateDeviceCode();

    // 5. Initial timeline event: REGISTERED
    const initialTimelineEvent = statusMachine.createTimelineEvent({
      step: 'REGISTERED',
      byUserId: req.user._id,
      byRole: 'citizen',
      note: 'Device registered by owner'
    });

    // 6. Create device document in MongoDB
    const device = await Device.create({
      deviceCode,
      ownerId: req.user._id,
      type,
      ageYears,
      powersOn,
      damage,
      notes,
      photoKey,
      ai: aiResult,
      status: 'REGISTERED',
      timeline: [initialTimelineEvent],
      isSample: false
    });

    // 7. Generate short-lived presigned GET URL for frontend passport view
    let photoUrl = '';
    try {
      photoUrl = await s3Service.createDownloadPresignedUrl({ key: device.photoKey });
    } catch (urlError) {
      // Leave empty if url generation encounters error
    }

    const responseData = device.toObject();
    responseData.photoUrl = photoUrl;

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:id/pickup
 * Citizen only: Request pickup for own REGISTERED device.
 * SPEC.md Section 4 & 8
 */
router.post('/:id/pickup', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const parseResult = pickupRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid pickup request body';
      return res.status(400).json({ error: firstError });
    }

    const { address, preferredSlot } = parseResult.data;

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: you do not own this device' });
    }

    if (device.status !== 'REGISTERED') {
      return res.status(400).json({
        error: `Pickup can only be requested when device is in REGISTERED status (current: ${device.status})`
      });
    }

    // Check for duplicate active pickup
    const existingPickup = await Pickup.findOne({
      deviceId: device._id,
      status: { $in: ['REQUESTED', 'ACCEPTED'] }
    });
    if (existingPickup) {
      return res.status(400).json({ error: 'An active pickup request already exists for this device' });
    }

    // Validate state machine transition
    statusMachine.validateTransition({
      currentStatus: device.status,
      targetStatus: 'PICKUP_REQUESTED',
      role: 'citizen'
    });

    // Create Pickup record
    const pickup = await Pickup.create({
      deviceId: device._id,
      ownerId: req.user._id,
      address: {
        text: address.text,
        pincode: address.pincode
      },
      preferredSlot,
      status: 'REQUESTED',
      collectorId: null
    });

    // Update Device status and append timeline event
    device.status = 'PICKUP_REQUESTED';
    device.timeline.push(
      statusMachine.createTimelineEvent({
        step: 'PICKUP_REQUESTED',
        byUserId: req.user._id,
        byRole: 'citizen',
        note: `Pickup requested for pincode ${address.pincode}, slot: ${preferredSlot}`
      })
    );
    await device.save();

    res.status(201).json({ pickup, device });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:id/cancel
 * Citizen only: Cancel pickup / device strictly before COLLECTED.
 * SPEC.md Section 4 & 8
 */
router.post('/:id/cancel', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: you do not own this device' });
    }

    if (!statusMachine.canCancel(device.status)) {
      return res.status(400).json({
        error: `Cancellation is not allowed from status: ${device.status}. Allowed only before COLLECTED.`
      });
    }

    statusMachine.validateTransition({
      currentStatus: device.status,
      targetStatus: 'CANCELLED',
      role: 'citizen'
    });

    // Cancel active pickup if one exists
    const pickup = await Pickup.findOne({
      deviceId: device._id,
      status: { $in: ['REQUESTED', 'ACCEPTED'] }
    });

    if (pickup) {
      pickup.status = 'CANCELLED';
      await pickup.save();
    }

    device.status = 'CANCELLED';
    device.timeline.push(
      statusMachine.createTimelineEvent({
        step: 'CANCELLED',
        byUserId: req.user._id,
        byRole: 'citizen',
        note: 'Device and pickup cancelled by owner'
      })
    );
    await device.save();

    res.status(200).json({ device, pickup });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:id/inspect
 * Collector only: Physical inspection determining the authoritative final outcome.
 * Overrides AI suggestion while preserving device.ai for transparency.
 * SPEC.md Section 4, 8 & 9
 */
router.post('/:id/inspect', authenticate, requireRole('collector'), async (req, res, next) => {
  try {
    const result = await inspectDevice({
      deviceId: req.params.id,
      user: req.user,
      body: req.body
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:id/complete
 * Collector (assigned) or Admin: Complete inspected device lifecycle.
 * SPEC.md Section 4 & 8
 */
router.post('/:id/complete', authenticate, requireRole('collector', 'admin'), async (req, res, next) => {
  try {
    const result = await completeDevice({
      deviceId: req.params.id,
      user: req.user
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/devices
 * Citizen: Returns own devices only (SPEC.md Section 8).
 * Admin: Returns all devices.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'citizen') {
      // Citizens can NEVER see another citizen's devices
      query = { ownerId: req.user._id };
    } else if (req.user.role === 'admin') {
      query = {};
    } else {
      // Collectors are not authorized to list devices globally
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    const devices = await Device.find(query).sort({ createdAt: -1 });

    // Attach short-lived download photoUrls
    const populated = await Promise.all(
      devices.map(async (dev) => {
        const obj = dev.toObject();
        try {
          obj.photoUrl = await s3Service.createDownloadPresignedUrl({ key: dev.photoKey });
        } catch {
          obj.photoUrl = '';
        }
        return obj;
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/devices/:id
 * Owner, assigned collector, or admin (SPEC.md Section 8).
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Role and ownership check
    if (req.user.role === 'citizen') {
      if (device.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Forbidden: you do not own this device' });
      }
    } else if (req.user.role === 'admin') {
      // Admin read-only access allowed
    } else if (req.user.role === 'collector') {
      // Check if this collector is assigned to a pickup for this device
      const assignedPickup = await Pickup.findOne({
        deviceId: device._id,
        collectorId: req.user._id
      });
      if (!assignedPickup) {
        return res.status(403).json({ error: 'Forbidden: you are not assigned to this device' });
      }
    } else {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    let photoUrl = '';
    try {
      photoUrl = await s3Service.createDownloadPresignedUrl({ key: device.photoKey });
    } catch {
      photoUrl = '';
    }

    const responseData = device.toObject();
    responseData.photoUrl = photoUrl;

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
