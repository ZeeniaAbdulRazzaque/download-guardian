import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  logger.info("Initializing Download Guardian Stateless Core Engine...");

  const app = createApp();
  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(`  DOWNLOAD GUARDIAN (STATELESS / EPHEMERAL MODE)`);
    logger.info(`  Tagline: Know What's Inside Before You Open It`);
    logger.info(`  Environment: ${ENV.NODE_ENV}`);
    logger.info(`  Listening on 0.0.0.0:${ENV.PORT}`);
    logger.info(`  API Health:  http://localhost:${ENV.PORT}/api/v1/health`);
    logger.info(`=======================================================`);
  });

  const handleTermination = () => {
    logger.info("Received termination signal. Shutting down gracefully...");
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on('SIGINT', handleTermination);
  process.on('SIGTERM', handleTermination);
};

startServer().catch((err) => {
  logger.error("Failed to start Download Guardian server:", err);
  process.exit(1);
});
