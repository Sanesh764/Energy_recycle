
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { connectRedis, disconnectRedis } = require('./config/redis');

async function startServer() {
  try {
    await connectDB();

    try {
      await connectRedis();
    } catch (redisError) {
      console.error(
        'Redis connection failed; continuing without cache:',
        redisError.message
      );
    }

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(
        `E-Waste Passport API server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });

    let shuttingDown = false;

    const shutdown = async (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log(`${signal} received: shutting down gracefully...`);

      const forceExit = setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);

      forceExit.unref();

      server.close(async () => {
        try {
          await disconnectRedis();
          await disconnectDB();
          clearTimeout(forceExit);
          console.log('Redis and MongoDB disconnected. Exiting.');
          process.exit(0);
        } catch (error) {
          clearTimeout(forceExit);
          console.error('Error during shutdown:', error.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error(
      'Server failed to start due to database error:',
      error.message || error
    );
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
