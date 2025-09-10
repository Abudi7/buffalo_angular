/**
 * Staging Environment Configuration
 * 
 * This environment configuration is used for the staging branch
 * and pre-production testing. It includes staging-specific settings
 * for API endpoints, logging, and feature flags.
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
export const environment = {
  production: false,
  staging: true,
  development: false,
  
  // API Configuration
  API_BASE: 'https://staging-api.timetrac.com',
  
  // Feature Flags
  features: {
    enableAnalytics: true,
    enableDebugMode: true,
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
  },
  
  // Logging Configuration
  logging: {
    level: 'debug',
    enableConsoleLogging: true,
    enableRemoteLogging: true,
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
  },
  
  // Security Configuration
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
  },
  
  // Monitoring Configuration
  monitoring: {
    enableSentry: true,
    enableLighthouse: true,
    enableWebVitals: true,
  }
};
