import {Request, Response} from 'express';
import logger from '../utils/logger.js';

export class LogController {
  /**
   * Receive logs from the frontend
   * @param req - Express request object
   * @param res - Express response object
   */
  public receiveLogs = async (req: Request, res: Response) => {
    try {
      const logData = req.body;

      // Validate log data
      if (!logData || !logData.level || !logData.message) {
        return res.status(400).json({message: 'Invalid log data'});
      }

      // Add client IP and user agent to log data
      const enhancedLogData = {
        ...logData,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'frontend'
      };

      // Log with the appropriate level
      switch (logData.level) {
        case 'error':
          logger.error('Frontend Error', enhancedLogData);
          break;
        case 'warn':
          logger.warn('Frontend Warning', enhancedLogData);
          break;
        case 'info':
          logger.info('Frontend Info', enhancedLogData);
          break;
        case 'debug':
          logger.debug('Frontend Debug', enhancedLogData);
          break;
        default:
          logger.info('Frontend Log', enhancedLogData);
      }

      return res.status(200).json({message: 'Log received'});
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error processing frontend log', {
          error: error.message,
          stack: error.stack
        });
      } else {
        logger.error('Error processing frontend log', {
          error: String(error)
        });
      }
      return res.status(500).json({message: 'Error processing log'});
    }
  };
}