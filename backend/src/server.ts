import app from './app';
import { env } from './config/env';
import { checkConnection } from './database';
import { logger } from './core/utils/logger';



const startServer = async () => {
  try {
    // Verify Database Connection before starting
    const isDbConnected = await checkConnection();
    
    if (!isDbConnected) {
      logger.warn('Server starting, but Database is not connected.');
    }

    app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error('Error starting server', err);
    process.exit(1);
  }
};

startServer();
