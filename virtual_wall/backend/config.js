// Backend Configuration
require('dotenv').config();

// Auto-detect Render URL
const getRenderUrl = () => {
  // If FRONTEND_URL is provided, use it
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // If running on Render, construct the URL
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  
  // Fallback for local development
  return 'http://localhost:8080';
};

const config = {
  // Server Configuration
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'YOUR_DB_PASSWORD',
    DATABASE: process.env.DB_NAME || 'bizacuity',
    MULTIPLE_STATEMENTS: true,
  },
  
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'YOUR_JWT_SECRET_KEY',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Email Configuration
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    USER: process.env.EMAIL_USER || 'YOUR_EMAIL_USER',
    PASS: process.env.EMAIL_PASS || 'YOUR_EMAIL_PASSWORD',
    FROM: process.env.EMAIL_FROM || 'YOUR_EMAIL_FROM',
  },
  
  // Frontend URL (for sharing links) - auto-detected
  FRONTEND_URL: getRenderUrl(),
  
  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },
  
  // OTP Configuration
  OTP: {
    LENGTH: 6,
    EXPIRY: 5 * 60 * 1000, // 5 minutes in milliseconds
    RESEND_COOLDOWN: 60 * 1000, // 1 minute in milliseconds
  },
  
  // Subscription Configuration
  SUBSCRIPTION: {
    FREE_TRIAL_DAYS: 7,
    DEFAULT_PLAN: 'free',
  },
  
  // Security Configuration
  SECURITY: {
    BCRYPT_ROUNDS: 10,
    PASSWORD_MIN_LENGTH: 8,
  },
  
  // CORS Configuration - auto-detected
  CORS: {
    ORIGIN: getRenderUrl(),
    CREDENTIALS: true,
  },
};

module.exports = config; 