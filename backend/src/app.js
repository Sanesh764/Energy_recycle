const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/uploads');
const deviceRoutes = require('./routes/devices');
const pickupRoutes = require('./routes/pickups');
const adminRoutes = require('./routes/admin');
const { router: rewardRoutes } = require('./routes/rewards');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

const app = express();

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Standard security headers middleware (no external dependency needed)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Security: restrict CORS origin as configured (SPEC.md Section 12)
const AMPLIFY_FRONTEND_ORIGIN = 'https://main.d298fn45tbafnm.amplifyapp.com';

const configuredOrigins = env.CORS_ORIGIN === '*'
  ? ['*']
  : env.CORS_ORIGIN.split(',').map((o) => o.trim());

// Allowed origins collection: configured origins, plus official Amplify frontend
const allowedOriginsSet = new Set([
  AMPLIFY_FRONTEND_ORIGIN,
  ...configuredOrigins
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // If configured for wildcard
      if (allowedOriginsSet.has('*')) {
        return callback(null, true);
      }

      // Allow official deployed Amplify origin or explicitly configured origins
      if (allowedOriginsSet.has(origin)) {
        return callback(null, true);
      }

      // In local development, also allow local frontend ports
      if (env.NODE_ENV !== 'production') {
        if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
          return callback(null, true);
        }
      }

      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);



// Body parser
app.use(express.json({ limit: '1mb' }));

// Ensure database connection is active before handling requests (required for Vercel/serverless runtimes)
app.use(async (req, res, next) => {
  // Skip DB connection for test suite or when mongoose is already connected
  const mongoose = require('mongoose');
  if (process.env.NODE_ENV === 'test' || mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    const { connectDB } = require('./config/db');
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware failed:', err.message);
    res.status(500).json({ error: 'Database connection failed. Please check MongoDB configuration.' });
  }
});

// Routes (SPEC.md Section 8)
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// Catch-all 404 for unknown endpoints
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
