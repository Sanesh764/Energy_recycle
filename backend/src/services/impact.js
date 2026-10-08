const { Device, ImpactFactor } = require('../models');

const FORMULA_DOCUMENTATION =
  'keptInUseKg = sum(avgWeightKg for REPAIR, REUSE, RESALE); recyclableKg = sum(avgWeightKg * recyclableShare for RECYCLE)';

/**
 * Calculates empirical e-waste impact statistics according to SPEC.md Section 10.
 *
 * Rules:
 * 1. Only devices with status = COMPLETED are counted.
 * 2. finalOutcome is authoritative; ai.suggestedOutcome is never used.
 * 3. Never invent values or sources. If a factor or source is missing, values evaluate to "not available".
 * 4. Sample data can be excluded via toggle without data mutation.
 *
 * @param {object} options
 * @param {boolean} [options.excludeSample=false]
 * @returns {Promise<object>} Admin impact metrics
 */
async function calculateAdminStats({ excludeSample = false } = {}) {
  // Query only completed devices (SPEC Section 10)
  const deviceQuery = { status: 'COMPLETED' };
  if (excludeSample) {
    deviceQuery.isSample = { $ne: true };
  }

  const completedDevices = await Device.find(deviceQuery).lean();

  // Load published impact factors strictly from the database (SPEC Section 7 & 10)
  const impactFactorDocs = await ImpactFactor.find().lean();
  const factorsByType = new Map();
  for (const factor of impactFactorDocs) {
    if (factor.deviceType) {
      factorsByType.set(factor.deviceType, factor);
    }
  }

  // Outcome counters
  const outcomes = {
    REPAIR: 0,
    REUSE: 0,
    RESALE: 0,
    RECYCLE: 0
  };

  let hasSampleData = false;
  let keptInUseSum = 0;
  let recyclableSum = 0;
  let hasMissingFactorForKeptInUse = false;
  let hasMissingFactorForRecycle = false;
  const referencedSources = new Set();

  for (const device of completedDevices) {
    if (device.isSample === true) {
      hasSampleData = true;
    }

    const outcome = device.finalOutcome;
    if (outcome && outcomes[outcome] !== undefined) {
      outcomes[outcome] += 1;
    }

    const factor = factorsByType.get(device.type);

    // Verify factor validity and published source existence
    const hasValidWeight = factor && typeof factor.avgWeightKg === 'number' && factor.avgWeightKg >= 0;
    const hasValidShare = factor && typeof factor.recyclableShare === 'number' && factor.recyclableShare >= 0 && factor.recyclableShare <= 1;
    const hasValidSource = factor && typeof factor.source === 'string' && factor.source.trim().length > 0;

    if (hasValidSource) {
      referencedSources.add(factor.source.trim());
    }

    if (['REPAIR', 'REUSE', 'RESALE'].includes(outcome)) {
      if (hasValidWeight && hasValidSource) {
        keptInUseSum += factor.avgWeightKg;
      } else {
        hasMissingFactorForKeptInUse = true;
      }
    } else if (outcome === 'RECYCLE') {
      if (hasValidWeight && hasValidShare && hasValidSource) {
        recyclableSum += factor.avgWeightKg * factor.recyclableShare;
      } else {
        hasMissingFactorForRecycle = true;
      }
    }
  }

  // Evaluate Kept in Use
  let keptInUseKg;
  if (completedDevices.length === 0) {
    keptInUseKg = 0;
  } else if (hasMissingFactorForKeptInUse) {
    keptInUseKg = 'not available';
  } else {
    keptInUseKg = Math.round(keptInUseSum * 10) / 10;
  }

  // Evaluate Recyclable Material
  let recyclableKg;
  if (completedDevices.length === 0) {
    recyclableKg = 0;
  } else if (hasMissingFactorForRecycle) {
    recyclableKg = 'not available';
  } else {
    recyclableKg = Math.round(recyclableSum * 10) / 10;
  }

  // Evaluate Source Citation strictly from database reference data
  let sourceCitation;
  if (referencedSources.size > 0) {
    sourceCitation = Array.from(referencedSources).join('; ');
  } else if (impactFactorDocs.length > 0 && impactFactorDocs.some((f) => f.source?.trim())) {
    sourceCitation = Array.from(
      new Set(
        impactFactorDocs
          .map((f) => f.source?.trim())
          .filter(Boolean)
      )
    ).join('; ');
  } else {
    sourceCitation = 'not available';
  }

  return {
    totalHandled: completedDevices.length,
    outcomes,
    keptInUseKg,
    recyclableKg,
    hasSampleData,
    sourceCitation,
    formulaDocumentation: FORMULA_DOCUMENTATION,
    label: 'Estimate'
  };
}

module.exports = {
  calculateAdminStats,
  FORMULA_DOCUMENTATION
};
