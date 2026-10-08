const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { calculateAdminStats } = require('../services/impact');

const router = express.Router();

/**
 * GET /api/admin/stats
 * Admin only: Calculates totals and empirical impact estimates (SPEC.md Section 8 & 10).
 * Supports sample data toggle: ?excludeSample=true
 */
router.get('/stats', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const excludeSample =
      req.query.excludeSample === 'true' || req.query.includeSample === 'false';

    const stats = await calculateAdminStats({ excludeSample });
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
