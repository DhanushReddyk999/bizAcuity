// API Configuration - Updated for single server deployment
const API_CONFIG = {
  // Base URLs - using relative paths since frontend and backend are on same server
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || '',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/Login',
    REGISTER: '/mail-verification/register',
    VERIFY_OTP: '/mail-verification/verify-otp',
    RESEND_OTP: '/mail-verification/resend-otp',
    REQUEST_RESET: '/mail-verification/request-reset',
    RESET_PASSWORD: '/mail-verification/reset-password',
    
    // User Management
    UPDATE_USER: '/updateUser',
    DELETE_USER: '/deleteUser',
    CHANGE_PASSWORD: '/changePassword',
    PROFILE_PHOTO: '/profilePhoto',
    UPLOAD_PROFILE_PHOTO: '/uploadProfilePhoto',
    
    // Drafts
    GET_DRAFTS: '/getDrafts',
    SAVE_DRAFTS: '/saveDrafts',
    DELETE_DRAFT: '/deleteDraft',
    
    // Sharing
    SHARE_DRAFT: '/shareDraft',
    EDIT_SHARE_DRAFT: '/editShareDraft',
    AUTH_VIEW_SHARE_DRAFT: '/authViewShareDraft',
    AUTH_EDIT_SHARE_DRAFT: '/authEditShareDraft',
    PUBLIC_DRAFT: '/publicDraft',
    
    // Authorized Drafts
    AUTH_EDIT_DRAFT: '/authEditDraft',
    AUTH_VIEW_DRAFT: '/authViewDraft',
    EDIT_SHARED_DRAFT: '/editSharedDraft',
    
    // Admin
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USER: '/api/admin/user',
    ADMIN_DRAFTS: '/api/admin/drafts',
    ADMIN_PLANS: '/api/admin/plans',
    ADMIN_RESEND_EMAIL_CHANGE_OTP: '/api/admin/resend-email-change-otp',
    ADMIN_VERIFY_EMAIL_CHANGE: '/api/admin/verify-email-change',
    
    // Email Verification
    REQUEST_EMAIL_CHANGE: '/mail-verification/request-email-change',
    VERIFY_EMAIL_CHANGE: '/mail-verification/verify-email-change',
    
    // Subscriptions
    SUBSCRIPTIONS_STATUS: '/api/subscriptions/status',
    SUBSCRIPTIONS_PURCHASE: '/api/subscriptions/purchase',
    SUBSCRIPTIONS_START_FREE_TRIAL: '/api/subscriptions/start-free-trial',
    PLANS: '/api/plans',
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function to build frontend URL
export const buildFrontendUrl = (path) => {
  return `${API_CONFIG.FRONTEND_URL}${path}`;
};

export default API_CONFIG; 