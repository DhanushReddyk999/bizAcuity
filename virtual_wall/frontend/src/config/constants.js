// Application Constants
export const APP_CONSTANTS = {
  // Default Wall Dimensions
  DEFAULT_WIDTH: '1000px',
  DEFAULT_HEIGHT: '500px',
  
  // Default Background
  DEFAULT_BACKGROUND: 'url(/CottageWall.jpg)',
  
  // Default Active Type
  DEFAULT_ACTIVE_TYPE: 'fill',
  
  // Sticker Categories and Images
  STICKER_CATEGORIES: {
    Tables: ["/table1.jpg", "/table2.jpg"],
    Garlands: ["/garland1.jpg", "/garland2.jpg"],
    Frames: ["/frame1.jpg", "/frame2.jpg", "/frame3.jpg"],
    Candles: ["/candle1.jpg", "/candle2.jpg"],
    Flowers: ["/flowers.jpg"],
    Fruits: ["/fruits1.jpg", "/fruits2.jpg"],
    Others: ["/agarbatti.jpg", "/biryani1.jpg", "/biryani2.jpg"],
  },
  
  // Default Sticker Category
  DEFAULT_STICKER_CATEGORY: 'Tables',
  
  // Shape Types
  SHAPES: {
    CIRCLE: 'circle',
    DIAMOND: 'diamond',
    TRIANGLE: 'triangle',
    HEXAGON: 'hexagon',
    RECTANGLE: 'rectangle',
  },
  
  // Clip Paths for Shapes
  CLIP_PATHS: {
    circle: "circle(50% at 50% 50%)",
    diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
    hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    rectangle: "none",
  },
  
  // Timeouts and Countdowns
  OTP_TIMEOUT: 300, // 5 minutes in seconds
  RESEND_TIMEOUT: 60, // 1 minute in seconds
  
  // Plan Names
  PLANS: {
    FREE: 'free',
    PREMIUM: 'premium',
  },
  
  // Default Plan Features
  DEFAULT_PLAN_FEATURES: {
    download_wall_enabled: false,
    stickers_limit: 0,
  },
  
  // File Upload Limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Validation Messages
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: "Please fill in all required fields.",
    INVALID_EMAIL: "Please enter a valid email address.",
    PASSWORD_REQUIREMENTS: "Please fix password requirements before signing up.",
    NETWORK_ERROR: "Network error occurred. Please try again.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    NOT_FOUND: "Resource not found.",
    SAVE_FAILED: "Failed to save changes.",
    DELETE_FAILED: "Failed to delete item.",
    UPLOAD_FAILED: "Failed to upload file.",
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    SAVE_SUCCESS: "Changes saved successfully.",
    DELETE_SUCCESS: "Item deleted successfully.",
    UPLOAD_SUCCESS: "File uploaded successfully.",
    EMAIL_SENT: "Email sent successfully.",
    PASSWORD_CHANGED: "Password changed successfully.",
    PROFILE_UPDATED: "Profile updated successfully.",
  },
  
  // Modal Messages
  MODAL_MESSAGES: {
    CONFIRM_DELETE: "Are you sure you want to delete this item?",
    CONFIRM_LOGOUT: "Are you sure you want to logout?",
    UPGRADE_REQUIRED: "Please upgrade your plan to access this feature.",
  },
};

// Helper function to get clip path for a shape
export const getClipPath = (shape) => {
  return APP_CONSTANTS.CLIP_PATHS[shape] || APP_CONSTANTS.CLIP_PATHS.rectangle;
};

// Helper function to get category for a sticker
export const getCategoryForSticker = (src) => {
  const { STICKER_CATEGORIES } = APP_CONSTANTS;
  for (const [cat, stickers] of Object.entries(STICKER_CATEGORIES)) {
    if (stickers.includes(src)) return cat;
  }
  return null;
};

// Helper function to format expiry date
export const formatExpiry = (expires) => {
  if (!expires) return '';
  const d = new Date(Number(expires));
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

// Helper function to validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default APP_CONSTANTS; 