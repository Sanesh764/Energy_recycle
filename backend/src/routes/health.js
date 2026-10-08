const express = require('express');
const router = express.Router();

/**
 * GET /api/health (public)
 * Health check endpoint matching SPEC.md Section 8.
 * Returns simple status without leaking system secrets.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime())
  });
});

module.exports = router;
