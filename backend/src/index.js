const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`E-Waste Passport API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
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
