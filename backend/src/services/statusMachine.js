/**
 * Centralized Device Lifecycle State Machine
 * Single Source of Truth for lifecycle transitions according to SPEC.md Section 4 & 8.
 *
 * Lifecycle:
 * REGISTERED → PICKUP_REQUESTED → ACCEPTED → COLLECTED → INSPECTED → COMPLETED
 *                      └──────────────┴───────── CANCELLED (strictly before COLLECTED)
 */

const STATUSES = Object.freeze({
  REGISTERED: 'REGISTERED',
  PICKUP_REQUESTED: 'PICKUP_REQUESTED',
  ACCEPTED: 'ACCEPTED',
  COLLECTED: 'COLLECTED',
  INSPECTED: 'INSPECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
});

const ALLOWED_TRANSITIONS = Object.freeze({
  [STATUSES.REGISTERED]: [STATUSES.PICKUP_REQUESTED],
  [STATUSES.PICKUP_REQUESTED]: [STATUSES.ACCEPTED, STATUSES.CANCELLED],
  [STATUSES.ACCEPTED]: [STATUSES.COLLECTED, STATUSES.CANCELLED],
  [STATUSES.COLLECTED]: [STATUSES.INSPECTED],
  [STATUSES.INSPECTED]: [STATUSES.COMPLETED],
  [STATUSES.COMPLETED]: [],
  [STATUSES.CANCELLED]: []
});

const ALLOWED_ROLES_PER_TRANSITION = Object.freeze({
  [`${STATUSES.REGISTERED}->${STATUSES.PICKUP_REQUESTED}`]: ['citizen'],
  [`${STATUSES.PICKUP_REQUESTED}->${STATUSES.ACCEPTED}`]: ['collector'],
  [`${STATUSES.ACCEPTED}->${STATUSES.COLLECTED}`]: ['collector'],
  [`${STATUSES.COLLECTED}->${STATUSES.INSPECTED}`]: ['collector'],
  [`${STATUSES.INSPECTED}->${STATUSES.COMPLETED}`]: ['collector', 'admin'],
  [`${STATUSES.PICKUP_REQUESTED}->${STATUSES.CANCELLED}`]: ['citizen'],
  [`${STATUSES.ACCEPTED}->${STATUSES.CANCELLED}`]: ['citizen']
});

/**
 * Check if a status string is a recognized valid lifecycle status.
 * @param {string} status
 * @returns {boolean}
 */
function isValidStatus(status) {
  return Object.values(STATUSES).includes(status);
}

/**
 * Check if a transition between two statuses is structurally allowed.
 * @param {string} fromStatus
 * @param {string} toStatus
 * @returns {boolean}
 */
function isValidTransition(fromStatus, toStatus) {
  if (!isValidStatus(fromStatus) || !isValidStatus(toStatus)) {
    return false;
  }
  const allowedNext = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowedNext.includes(toStatus);
}

/**
 * Check whether cancellation is allowed from the current status.
 * Per SPEC.md Section 4: Cancellation is strictly allowed before COLLECTED.
 * @param {string} currentStatus
 * @returns {boolean}
 */
function canCancel(currentStatus) {
  return currentStatus === STATUSES.PICKUP_REQUESTED || currentStatus === STATUSES.ACCEPTED;
}

/**
 * Validates transition rules including status order and role permissions.
 * Throws an Error with a descriptive message if invalid.
 *
 * @param {object} params
 * @param {string} params.currentStatus
 * @param {string} params.targetStatus
 * @param {string} params.role ('citizen', 'collector', 'admin')
 * @returns {boolean} true if valid
 */
function validateTransition({ currentStatus, targetStatus, role }) {
  if (!isValidStatus(currentStatus)) {
    throw new Error(`Invalid current status: ${currentStatus}`);
  }
  if (!isValidStatus(targetStatus)) {
    throw new Error(`Invalid target status: ${targetStatus}`);
  }

  if (targetStatus === STATUSES.CANCELLED && !canCancel(currentStatus)) {
    throw new Error(`Cancellation is not allowed from status: ${currentStatus}. Allowed only before COLLECTED.`);
  }

  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}`);
  }

  const transitionKey = `${currentStatus}->${targetStatus}`;
  const allowedRoles = ALLOWED_ROLES_PER_TRANSITION[transitionKey] || [];
  if (role && !allowedRoles.includes(role)) {
    throw new Error(`Role '${role}' is not authorized to perform transition from ${currentStatus} to ${targetStatus}`);
  }

  return true;
}

/**
 * Creates a validated timeline event entry for device.timeline.
 * @param {object} params
 * @param {string} params.step
 * @param {string} [params.byUserId]
 * @param {string} [params.byRole]
 * @param {string} [params.note]
 * @param {Date} [params.at]
 * @returns {object}
 */
function createTimelineEvent({ step, byUserId, byRole, note, at = new Date() }) {
  if (!isValidStatus(step)) {
    throw new Error(`Invalid timeline step: ${step}`);
  }
  return {
    step,
    at,
    byUserId: byUserId || null,
    byRole: byRole || null,
    note: note ? String(note).trim() : ''
  };
}

module.exports = {
  STATUSES,
  ALLOWED_TRANSITIONS,
  ALLOWED_ROLES_PER_TRANSITION,
  isValidStatus,
  isValidTransition,
  canCancel,
  validateTransition,
  createTimelineEvent
};
