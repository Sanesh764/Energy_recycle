const {
  STATUSES,
  ALLOWED_TRANSITIONS,
  isValidStatus,
  isValidTransition,
  canCancel,
  validateTransition,
  createTimelineEvent
} = require('../src/services/statusMachine');

describe('Device Status Machine (Single Source of Truth)', () => {
  describe('Valid sequential transitions', () => {
    test('REGISTERED -> PICKUP_REQUESTED by citizen', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.REGISTERED,
          targetStatus: STATUSES.PICKUP_REQUESTED,
          role: 'citizen'
        })
      ).toBe(true);
    });

    test('PICKUP_REQUESTED -> ACCEPTED by collector', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.PICKUP_REQUESTED,
          targetStatus: STATUSES.ACCEPTED,
          role: 'collector'
        })
      ).toBe(true);
    });

    test('ACCEPTED -> COLLECTED by collector', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.ACCEPTED,
          targetStatus: STATUSES.COLLECTED,
          role: 'collector'
        })
      ).toBe(true);
    });

    test('COLLECTED -> INSPECTED by collector', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.COLLECTED,
          targetStatus: STATUSES.INSPECTED,
          role: 'collector'
        })
      ).toBe(true);
    });

    test('INSPECTED -> COMPLETED by collector', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.INSPECTED,
          targetStatus: STATUSES.COMPLETED,
          role: 'collector'
        })
      ).toBe(true);
    });

    test('INSPECTED -> COMPLETED by admin', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.INSPECTED,
          targetStatus: STATUSES.COMPLETED,
          role: 'admin'
        })
      ).toBe(true);
    });
  });

  describe('Invalid forward / backward / skip transitions', () => {
    test('Cannot skip from REGISTERED directly to COLLECTED', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.REGISTERED,
          targetStatus: STATUSES.COLLECTED,
          role: 'collector'
        })
      ).toThrow(/Invalid status transition/);
    });

    test('Cannot skip from PICKUP_REQUESTED directly to INSPECTED', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.PICKUP_REQUESTED,
          targetStatus: STATUSES.INSPECTED,
          role: 'collector'
        })
      ).toThrow(/Invalid status transition/);
    });

    test('Cannot transition backward from COLLECTED to ACCEPTED', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.COLLECTED,
          targetStatus: STATUSES.ACCEPTED,
          role: 'collector'
        })
      ).toThrow(/Invalid status transition/);
    });

    test('Cannot transition backward from COMPLETED to INSPECTED', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.COMPLETED,
          targetStatus: STATUSES.INSPECTED,
          role: 'collector'
        })
      ).toThrow(/Invalid status transition/);
    });

    test('Cannot transition from CANCELLED to any status', () => {
      expect(ALLOWED_TRANSITIONS[STATUSES.CANCELLED]).toEqual([]);
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.CANCELLED,
          targetStatus: STATUSES.PICKUP_REQUESTED,
          role: 'citizen'
        })
      ).toThrow(/Invalid status transition/);
    });
  });

  describe('Cancellation rules (strictly before COLLECTED)', () => {
    test('canCancel returns true for PICKUP_REQUESTED and ACCEPTED', () => {
      expect(canCancel(STATUSES.PICKUP_REQUESTED)).toBe(true);
      expect(canCancel(STATUSES.ACCEPTED)).toBe(true);
    });

    test('canCancel returns false for REGISTERED, COLLECTED, INSPECTED, COMPLETED', () => {
      expect(canCancel(STATUSES.REGISTERED)).toBe(false);
      expect(canCancel(STATUSES.COLLECTED)).toBe(false);
      expect(canCancel(STATUSES.INSPECTED)).toBe(false);
      expect(canCancel(STATUSES.COMPLETED)).toBe(false);
      expect(canCancel(STATUSES.CANCELLED)).toBe(false);
    });

    test('Cancellation from PICKUP_REQUESTED by citizen succeeds', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.PICKUP_REQUESTED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toBe(true);
    });

    test('Cancellation from ACCEPTED by citizen succeeds', () => {
      expect(
        validateTransition({
          currentStatus: STATUSES.ACCEPTED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toBe(true);
    });

    test('Cancellation after COLLECTED is rejected', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.COLLECTED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toThrow(/Cancellation is not allowed from status: COLLECTED/);
    });

    test('Cancellation after INSPECTED is rejected', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.INSPECTED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toThrow(/Cancellation is not allowed from status: INSPECTED/);
    });

    test('Cancellation after COMPLETED is rejected', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.COMPLETED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toThrow(/Cancellation is not allowed from status: COMPLETED/);
    });

    test('Cancellation from REGISTERED before pickup requested is rejected', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.REGISTERED,
          targetStatus: STATUSES.CANCELLED,
          role: 'citizen'
        })
      ).toThrow(/Cancellation is not allowed from status: REGISTERED/);
    });
  });

  describe('Role-based transition enforcement', () => {
    test('Collector cannot perform citizen pickup request', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.REGISTERED,
          targetStatus: STATUSES.PICKUP_REQUESTED,
          role: 'collector'
        })
      ).toThrow(/Role 'collector' is not authorized/);
    });

    test('Citizen cannot accept pickup or mark collected', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.PICKUP_REQUESTED,
          targetStatus: STATUSES.ACCEPTED,
          role: 'citizen'
        })
      ).toThrow(/Role 'citizen' is not authorized/);

      expect(() =>
        validateTransition({
          currentStatus: STATUSES.ACCEPTED,
          targetStatus: STATUSES.COLLECTED,
          role: 'citizen'
        })
      ).toThrow(/Role 'citizen' is not authorized/);
    });

    test('Citizen cannot complete device', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.INSPECTED,
          targetStatus: STATUSES.COMPLETED,
          role: 'citizen'
        })
      ).toThrow(/Role 'citizen' is not authorized/);
    });
  });

  describe('Invalid or unknown statuses', () => {
    test('isValidStatus handles unknown strings', () => {
      expect(isValidStatus('FOO_BAR')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
      expect(isValidStatus(undefined)).toBe(false);
      expect(isValidStatus(123)).toBe(false);
    });

    test('validateTransition throws for unknown current status', () => {
      expect(() =>
        validateTransition({
          currentStatus: 'INVALID_STATUS',
          targetStatus: STATUSES.ACCEPTED,
          role: 'collector'
        })
      ).toThrow(/Invalid current status/);
    });

    test('validateTransition throws for unknown target status', () => {
      expect(() =>
        validateTransition({
          currentStatus: STATUSES.REGISTERED,
          targetStatus: 'UNKNOWN_TARGET',
          role: 'citizen'
        })
      ).toThrow(/Invalid target status/);
    });
  });

  describe('Timeline event creation and integrity', () => {
    test('createTimelineEvent formats an event object correctly', () => {
      const atTime = new Date('2026-10-02T10:00:00Z');
      const event = createTimelineEvent({
        step: STATUSES.REGISTERED,
        byUserId: '507f1f77bcf86cd799439011',
        byRole: 'citizen',
        note: 'Initial registration',
        at: atTime
      });

      expect(event).toEqual({
        step: 'REGISTERED',
        at: atTime,
        byUserId: '507f1f77bcf86cd799439011',
        byRole: 'citizen',
        note: 'Initial registration'
      });
    });

    test('createTimelineEvent throws if step is not a valid status', () => {
      expect(() =>
        createTimelineEvent({
          step: 'INVALID_STEP',
          byRole: 'citizen'
        })
      ).toThrow(/Invalid timeline step/);
    });

    test('createTimelineEvent handles missing optional fields gracefully', () => {
      const event = createTimelineEvent({
        step: STATUSES.PICKUP_REQUESTED
      });

      expect(event.step).toBe(STATUSES.PICKUP_REQUESTED);
      expect(event.byUserId).toBeNull();
      expect(event.byRole).toBeNull();
      expect(event.note).toBe('');
      expect(event.at).toBeInstanceOf(Date);
    });
  });
});
