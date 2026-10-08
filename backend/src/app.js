const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/uploads');
const deviceRoutes = require('./routes/devices');
const pickupRoutes = require('./routes/pickups');
const adminRoutes = require('./routes/admin');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

const app = express();

// Security: restrict CORS origin as configured (SPEC.md Section 12)
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Routes (SPEC.md Section 8)
app.use('/api/uploads', uploadRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// Catch-all 404 for unknown endpoints
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
