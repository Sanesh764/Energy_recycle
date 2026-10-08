/**
 * Status Lifecycle & Domain Constants strictly according to SPEC.md
 * 
 * Status lifecycle (device.status):
 * REGISTERED → PICKUP_REQUESTED → ACCEPTED → COLLECTED → INSPECTED → COMPLETED
 *                      └──────────────┴───────── CANCELLED (before COLLECTED only)
 */

export const DEVICE_STATUSES = {
  REGISTERED: 'REGISTERED',
  PICKUP_REQUESTED: 'PICKUP_REQUESTED',
  ACCEPTED: 'ACCEPTED',
  COLLECTED: 'COLLECTED',
  INSPECTED: 'INSPECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDERED_LIFECYCLE_STEPS = [
  DEVICE_STATUSES.REGISTERED,
  DEVICE_STATUSES.PICKUP_REQUESTED,
  DEVICE_STATUSES.ACCEPTED,
  DEVICE_STATUSES.COLLECTED,
  DEVICE_STATUSES.INSPECTED,
  DEVICE_STATUSES.COMPLETED,
];

export const STATUS_CONFIG = {
  [DEVICE_STATUSES.REGISTERED]: {
    label: 'Registered',
    description: 'Device submitted and AI suggestion generated.',
    variant: 'neutral',
  },
  [DEVICE_STATUSES.PICKUP_REQUESTED]: {
    label: 'Pickup Requested',
    description: 'Awaiting collector acceptance.',
    variant: 'warning',
  },
  [DEVICE_STATUSES.ACCEPTED]: {
    label: 'Pickup Accepted',
    description: 'Collector has accepted and scheduled pickup.',
    variant: 'info',
  },
  [DEVICE_STATUSES.COLLECTED]: {
    label: 'Collected',
    description: 'Device picked up by collector.',
    variant: 'brand',
  },
  [DEVICE_STATUSES.INSPECTED]: {
    label: 'Inspected',
    description: 'Physical inspection completed; outcome verified.',
    variant: 'brand',
  },
  [DEVICE_STATUSES.COMPLETED]: {
    label: 'Completed',
    description: 'Final disposition achieved.',
    variant: 'success',
  },
  [DEVICE_STATUSES.CANCELLED]: {
    label: 'Cancelled',
    description: 'Cancelled before collection.',
    variant: 'danger',
  },
};

export const OUTCOMES = {
  REPAIR: 'REPAIR',
  REUSE: 'REUSE',
  RESALE: 'RESALE',
  RECYCLE: 'RECYCLE',
};

export const OUTCOME_CONFIG = {
  [OUTCOMES.REPAIR]: {
    label: 'Repair',
    description: 'Can be refurbished or fixed for extended use.',
    color: 'emerald',
  },
  [OUTCOMES.REUSE]: {
    label: 'Reuse',
    description: 'Functional device ready for immediate donation or redeployment.',
    color: 'teal',
  },
  [OUTCOMES.RESALE]: {
    label: 'Resale',
    description: 'High retained value suitable for secondary market.',
    color: 'green',
  },
  [OUTCOMES.RECYCLE]: {
    label: 'Recycle',
    description: 'End-of-life device to be safely recycled for raw materials.',
    color: 'slate',
  },
};

export const DEVICE_TYPES = [
  { value: 'PHONE', label: 'Phone / Smartphone' },
  { value: 'LAPTOP', label: 'Laptop / Notebook' },
  { value: 'TV', label: 'Television / Display' },
  { value: 'CHARGER', label: 'Charger / Cable' },
  { value: 'BATTERY', label: 'Battery / Powerbank' },
  { value: 'PRINTER', label: 'Printer / Scanner' },
  { value: 'OTHER', label: 'Other Electronic Device' },
];

export const DAMAGE_LEVELS = [
  { value: 'NONE', label: 'None (No visible damage)' },
  { value: 'MINOR', label: 'Minor (Scratches, scuffs, minor wear)' },
  { value: 'MAJOR', label: 'Major (Broken screen, cracked body, water damage)' },
];

/**
 * According to SPEC.md: Cancellation allowed only before COLLECTED
 */
export function canCancelStatus(status) {
  return [
    DEVICE_STATUSES.REGISTERED,
    DEVICE_STATUSES.PICKUP_REQUESTED,
    DEVICE_STATUSES.ACCEPTED,
  ].includes(status);
}
