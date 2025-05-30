import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
//   Sentry.init({
//     dsn: 'https://salah-guide.sentry.io/auth/login/salah-guide/', 
//     environment: __DEV__ ? 'development' : 'production',
//     tracesSampleRate: 0.2, 
//     attachStacktrace: true,
//   });
  
  Sentry.init({
    dsn: 'https://db9951967fd1dd39243c0d119440d509@o4509147958149120.ingest.de.sentry.io/4509148320694352',
    environment:'production',// __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.2, 
    attachStacktrace: true,
  
    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });
};

const LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

const logger = {
  debug: (message, data = {}) => {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, data);
    }
    Sentry.addBreadcrumb({
      message,
      level: LEVELS.DEBUG,
      data,
    });
  },

  info: (message, data = {}) => {
    console.info(`[INFO] ${message}`, data);
    Sentry.addBreadcrumb({
      message,
      level: LEVELS.INFO,
      data,
    });
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
    Sentry.captureMessage(message, {
      level: LEVELS.WARNING,
      extra: data,
    });
  },

  error: (error, data = {}) => {
    console.error(`[ERROR]`, error);
    Sentry.captureException(error, {
      extra: data,
    });
  },

  setUser: (user) => {
    Sentry.setUser(user);
  },

  addContext: (key, value) => {
    Sentry.setContext(key, value);
  },

  api: {
    request: (config) => {
      logger.debug(`API Request: ${config.url}`, config);
      Sentry.addBreadcrumb({
        category: 'http',
        message: `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        data: {
          ...config,
          type: 'request'
        },
      });
    },
    response: (response) => {
      logger.debug(`API Response: ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
      Sentry.addBreadcrumb({
        category: 'http',
        message: `API Response: ${response.status} ${response.config.url}`,
        data: {
          status: response.status,
          url: response.config.url,
          type: 'response'
        },
      });
    },
    error: (error) => {
      logger.error(error, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status
      });
    }
  }
};

export default logger;