/**
 * Frontend logging utility
 * Provides functions for logging messages at different levels
 * and sending them to the console and optionally to a backend API
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Determine if we should send logs to the backend
// In production, we want to collect logs, but in development it might be too noisy
const SEND_TO_BACKEND = process.env.NODE_ENV === 'production' || process.env.REACT_APP_COLLECT_LOGS === 'true';

// Maximum number of logs to keep in memory for debugging purposes
const MAX_MEMORY_LOGS = 100;
const memoryLogs = [];

/**
 * Add a log entry to the in-memory log storage
 * @param {Object} logEntry - The log entry to add
 */
const addToMemoryLogs = (logEntry) => {
  memoryLogs.push(logEntry);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.shift(); // Remove the oldest log if we exceed the limit
  }
};

/**
 * Send a log to the backend API
 * @param {Object} logData - The log data to send
 */
const sendToBackend = async (logData) => {
  if (!SEND_TO_BACKEND) return;

  try {
    // Import the API helper dynamically to avoid circular dependencies
    const { default: api } = await import('../api/ApiHelper');

    // Use axios directly to avoid circular dependency issues
    await api.post('/api/logs', logData, {
      // Don't retry log requests - if they fail, just move on
      retry: false,
      // Don't wait for the response - fire and forget
      timeout: 5000
    });
  } catch (error) {
    // If logging fails, we don't want to cause more errors
    console.error('Failed to send log to backend:', error);
  }
};

/**
 * Create a log entry with common metadata
 * @param {string} level - The log level
 * @param {string} message - The log message
 * @param {Object} [meta] - Additional metadata
 * @returns {Object} The log entry
 */
const createLogEntry = (level, message, meta = {}) => {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...meta
  };
};

/**
 * Log an error message
 * @param {string} message - The error message
 * @param {Object} [meta] - Additional metadata
 */
export const logError = (message, meta = {}) => {
  const logEntry = createLogEntry(LOG_LEVELS.ERROR, message, meta);
  console.error(`[ERROR] ${message}`, meta);
  addToMemoryLogs(logEntry);
  sendToBackend(logEntry);
};

/**
 * Log a warning message
 * @param {string} message - The warning message
 * @param {Object} [meta] - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  const logEntry = createLogEntry(LOG_LEVELS.WARN, message, meta);
  console.warn(`[WARN] ${message}`, meta);
  addToMemoryLogs(logEntry);
  sendToBackend(logEntry);
};

/**
 * Log an info message
 * @param {string} message - The info message
 * @param {Object} [meta] - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  const logEntry = createLogEntry(LOG_LEVELS.INFO, message, meta);
  console.info(`[INFO] ${message}`, meta);
  addToMemoryLogs(logEntry);

  // Only send info logs to backend in production to reduce noise
  if (process.env.NODE_ENV === 'production') {
    sendToBackend(logEntry);
  }
};

/**
 * Log a debug message
 * @param {string} message - The debug message
 * @param {Object} [meta] - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  const logEntry = createLogEntry(LOG_LEVELS.DEBUG, message, meta);
  console.debug(`[DEBUG] ${message}`, meta);
  addToMemoryLogs(logEntry);

  // Don't send debug logs to backend
};

/**
 * Get all logs stored in memory
 * @returns {Array} The in-memory logs
 */
export const getLogs = () => [...memoryLogs];

/**
 * Clear all logs from memory
 */
export const clearLogs = () => {
  memoryLogs.length = 0;
};

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled promise rejection', {
      reason: event.reason?.toString(),
      stack: event.reason?.stack
    });
  });
}

export default {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  getLogs,
  clearLogs
};
