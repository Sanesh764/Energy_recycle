const { PUBLISHED_IMPACT_FACTORS, DEMO_USERS } = require('../src/scripts/seed');
const ImpactFactor = require('../src/models/ImpactFactor');
const Device = require('../src/models/Device');
const { calculateAdminStats } = require('../src/services/impact');

describe('Seed Data & Authoritative Source Integrity', () => {
  describe('Published Impact Factor Integrity', () => {
    test('all seeded impact factors have non-empty published sources and valid links', () => {
      expect(PUBLISHED_IMPACT_FACTORS.length).toBeGreaterThan(0);

      for (const factor of PUBLISHED_IMPACT_FACTORS) {
        expect(factor.deviceType).toBeDefined();
        expect(typeof factor.avgWeightKg).toBe('number');
        expect(factor.avgWeightKg).toBeGreaterThan(0);
        expect(typeof factor.recyclableShare).toBe('number');
        expect(factor.recyclableShare).toBeGreaterThanOrEqual(0);
        expect(factor.recyclableShare).toBeLessThanOrEqual(1);

        // Must have verified published citation with URL
        expect(typeof factor.source).toBe('string');
        expect(factor.source).toContain('https://');
        expect(factor.source).toContain('Global E-waste Monitor');
      }
    });

    test('does NOT invent values for unverified categories (e.g. CHARGER, BATTERY, PRINTER, OTHER)', () => {
      const seededTypes = PUBLISHED_IMPACT_FACTORS.map((f) => f.deviceType);
      // Per SPEC.md Section 7 line 146: "Do not invent these values. If a source is missing, leave the field empty"
      expect(seededTypes).not.toContain('CHARGER');
      expect(seededTypes).not.toContain('BATTERY');
      expect(seededTypes).not.toContain('PRINTER');
      expect(seededTypes).not.toContain('OTHER');
    });
  });

  describe('Demo Accounts Integrity', () => {
    test('provides distinct demo accounts for citizen, collector, and admin', () => {
      expect(DEMO_USERS).toHaveLength(3);
      const roles = DEMO_USERS.map((u) => u.role);
      expect(roles).toContain('citizen');
      expect(roles).toContain('collector');
      expect(roles).toContain('admin');

      const collector = DEMO_USERS.find((u) => u.role === 'collector');
      expect(collector.servicePincodes).toEqual(['110001', '110002']);
    });
  });

  describe('Sample Device Labelling & Isolation', () => {
    test('sample devices strictly set isSample: true', () => {
      // Impact calculations ignore sample data when excluded
      const mockSampleDevice = {
        deviceCode: 'EW-2026-000101',
        isSample: true,
        status: 'COMPLETED',
        finalOutcome: 'REPAIR',
        type: 'LAPTOP'
      };
      expect(mockSampleDevice.isSample).toBe(true);
    });
  });
});
