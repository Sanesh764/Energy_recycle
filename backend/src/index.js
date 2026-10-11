const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`E-Waste Passport API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received: closing HTTP server and terminating database connections gracefully...`);
      server.close(async () => {
        try {
          const { disconnectDB } = require('./config/db');
          await disconnectDB();
          console.log('Database disconnected successfully. Exiting.');
          process.exit(0);
        } catch (err) {
          console.error('Error during graceful disconnect:', err);
          process.exit(1);
        }
      });

      // Force close if graceful shutdown takes longer than 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Server failed to start due to database error');
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

