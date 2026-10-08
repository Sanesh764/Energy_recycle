const { z } = require('zod');
const { Device, Pickup } = require('../models');
const statusMachine = require('./statusMachine');

const inspectSchema = z.object({
  finalOutcome: z.enum(['REPAIR', 'REUSE', 'RESALE', 'RECYCLE'], {
    errorMap: () => ({ message: 'finalOutcome must be REPAIR, REUSE, RESALE, or RECYCLE' })
  }),
  note: z.string().max(500).optional().default('')
});

/**
 * Shared device inspection business logic.
 * Supports both canonical /api/devices/:id/inspect and alias /api/pickups/:id/inspect.
 *
 * @param {object} params
 * @param {string} [params.deviceId]
 * @param {string} [params.pickupId]
 * @param {object} params.user
 * @param {object} params.body
 * @returns {Promise<{ pickup: object, device: object, finalOutcome: string }>}
 */
async function inspectDevice({ deviceId, pickupId, user, body }) {
  const parseResult = inspectSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid inspection body';
    const err = new Error(firstError);
    err.statusCode = 400;
    throw err;
  }

  const { finalOutcome, note } = parseResult.data;

  let device;
  let pickup;

  if (deviceId) {
    device = await Device.findById(deviceId);
    if (!device) {
      const err = new Error('Device not found');
      err.statusCode = 404;
      throw err;
    }
    pickup = await Pickup.findOne({ deviceId: device._id });
    if (!pickup) {
      const err = new Error('Associated pickup not found');
      err.statusCode = 404;
      throw err;
    }
  } else if (pickupId) {
    pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      const err = new Error('Pickup not found');
      err.statusCode = 404;
      throw err;
    }
    device = await Device.findById(pickup.deviceId);
    if (!device) {
      const err = new Error('Associated device not found');
      err.statusCode = 404;
      throw err;
    }
  } else {
    const err = new Error('Target identifier required');
    err.statusCode = 400;
    throw err;
  }

  // Authorization: calling collector must be assigned to this pickup
  if (!pickup.collectorId || pickup.collectorId.toString() !== user._id.toString()) {
    const err = new Error('Forbidden: you are not assigned to this pickup');
    err.statusCode = 403;
    throw err;
  }

  // Concurrency & status check: Device must be in COLLECTED status
  if (device.status !== 'COLLECTED') {
    const err = new Error(
      `Device must be in COLLECTED status for physical inspection (current: ${device.status})`
    );
    err.statusCode = 400;
    throw err;
  }

  // Validate state machine transition
  statusMachine.validateTransition({
    currentStatus: device.status,
    targetStatus: 'INSPECTED',
    role: 'collector'
  });

  // Authoritative collector outcome set (AI suggestion remains untouched in device.ai)
  device.finalOutcome = finalOutcome;
  device.status = 'INSPECTED';
  device.timeline.push(
    statusMachine.createTimelineEvent({
      step: 'INSPECTED',
      byUserId: user._id,
      byRole: 'collector',
      note: note || `Device inspected: physical final outcome confirmed as ${finalOutcome}`
    })
  );
  await device.save();

  return {
    pickup,
    device,
    finalOutcome: device.finalOutcome
  };
}

/**
 * Shared device completion business logic.
 * Supports both canonical /api/devices/:id/complete and alias /api/pickups/:id/complete.
 * Roles: collector (assigned), admin per SPEC.md Section 8.
 *
 * @param {object} params
 * @param {string} [params.deviceId]
 * @param {string} [params.pickupId]
 * @param {object} params.user
 * @returns {Promise<{ pickup: object, device: object }>}
 */
async function completeDevice({ deviceId, pickupId, user }) {
  let device;
  let pickup;

  if (deviceId) {
    device = await Device.findById(deviceId);
    if (!device) {
      const err = new Error('Device not found');
      err.statusCode = 404;
      throw err;
    }
    pickup = await Pickup.findOne({ deviceId: device._id });
  } else if (pickupId) {
    pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      const err = new Error('Pickup not found');
      err.statusCode = 404;
      throw err;
    }
    device = await Device.findById(pickup.deviceId);
    if (!device) {
      const err = new Error('Associated device not found');
      err.statusCode = 404;
      throw err;
    }
  } else {
    const err = new Error('Target identifier required');
    err.statusCode = 400;
    throw err;
  }

  // Authorization: collector must be assigned; admin allowed per SPEC
  if (user.role === 'collector') {
    if (!pickup || !pickup.collectorId || pickup.collectorId.toString() !== user._id.toString()) {
      const err = new Error('Forbidden: you are not assigned to this pickup');
      err.statusCode = 403;
      throw err;
    }
  } else if (user.role === 'admin') {
    // Admin authorized
  } else {
    const err = new Error('Forbidden: insufficient permissions');
    err.statusCode = 403;
    throw err;
  }

  // Precondition: device must have a recorded finalOutcome
  if (!device.finalOutcome) {
    const err = new Error('Device must be inspected and have a finalOutcome before completion');
    err.statusCode = 400;
    throw err;
  }

  // Concurrency & status check: device must be currently in INSPECTED status
  if (device.status !== 'INSPECTED') {
    const err = new Error(
      `Device must be in INSPECTED status before completion (current: ${device.status})`
    );
    err.statusCode = 400;
    throw err;
  }

  statusMachine.validateTransition({
    currentStatus: device.status,
    targetStatus: 'COMPLETED',
    role: user.role
  });

  device.status = 'COMPLETED';
  device.timeline.push(
    statusMachine.createTimelineEvent({
      step: 'COMPLETED',
      byUserId: user._id,
      byRole: user.role,
      note: user.role === 'admin' ? 'Device lifecycle completed by admin' : 'Device lifecycle completed'
    })
  );
  await device.save();

  return {
    pickup,
    device
  };
}

module.exports = {
  inspectSchema,
  inspectDevice,
  completeDevice
};
