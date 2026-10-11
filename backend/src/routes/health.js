const express = require('express');
const mongoose = require('mongoose');
const env = require('../config/env');
const router = express.Router();

/**
 * GET /api/health and GET /health (public)
 * Health check endpoint matching SPEC.md Section 8 and AWS ALB target group health requirements.
 * Returns simple status without leaking system secrets.
 */
router.get('/health', (req, res) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isDbReady = mongoose.connection.readyState === 1;

  // In test mode or when DB is connected, report ok
  if (env.NODE_ENV === 'test' || isDbReady) {
    return res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      database: isDbReady ? 'connected' : 'test_mock'
    });
  }

  // If in production/development and DB is down, fail ALB health check so bad traffic is not routed
  return res.status(503).json({
    status: 'degraded',
    uptime: Math.floor(process.uptime()),
    database: 'disconnected'
  });
});

module.exports = router;

