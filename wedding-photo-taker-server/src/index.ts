import mongoose from 'mongoose';
import {appConfig} from './config/index.js';
import app from './app.js';
import logger from './utils/logger.js';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {error: error.message, stack: error.stack});
  // Keep the process alive but log the error
  console.error('UNCAUGHT EXCEPTION! 💥 Logging the error and keeping the server running.');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {reason, promise});
  // Keep the process alive but log the error
  console.error('UNHANDLED REJECTION! 💥 Logging the error and keeping the server running.');
});

const startServer = async () => {
  try {
    await mongoose.connect(appConfig.MONGODB_URI);
    logger.info('Connected to MongoDB');

    app.listen(appConfig.PORT, () => {
      logger.info(`Server running on port ${appConfig.PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message, {stack: error.stack});
    } else {
      logger.error('Unknown error', {error});
    }
  }
};

// Start the server
startServer().catch(error => {
  logger.error('Error in server startup promise', {error: error.message, stack: error.stack});
});
