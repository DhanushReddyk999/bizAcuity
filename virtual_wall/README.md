# Virtual Wall - Hard Coding Removal

This project has been updated to remove all hard-coded values and implement a centralized configuration system.

## Changes Made

### 1. Configuration Files Created

#### Frontend Configuration
- `frontend/src/config/api.js` - Centralized API endpoints and URL configuration
- `frontend/src/config/constants.js` - Application constants, default values, and helper functions
- `frontend/env.example` - Example environment variables for frontend

#### Backend Configuration
- `backend/config.js` - Centralized backend configuration
- `backend/env.example` - Example environment variables for backend

### 2. Hard-Coded Values Removed

#### Backend
- ✅ Database credentials moved to environment variables
- ✅ JWT secret moved to environment variables
- ✅ Email configuration moved to environment variables
- ✅ Server port moved to environment variables
- ✅ CORS configuration moved to environment variables
- ✅ Frontend URL for sharing links moved to environment variables

#### Frontend
- ✅ API endpoints moved to centralized configuration
- ✅ Default wall dimensions moved to constants
- ✅ Default background moved to constants
- ✅ Sticker categories moved to constants
- ✅ Validation messages moved to constants
- ✅ Success messages moved to constants
- ✅ Timeout values moved to constants

### 3. Files Updated

#### Backend Files
- `backend/index.js` - Updated to use configuration
- `backend/db.js` - Updated to use configuration
- `backend/routes/sharing.js` - Updated to use configuration
- `backend/routes/mail-verification.js` - Updated to use configuration
- `backend/routes/admin.js` - Updated to use configuration
- `backend/notification.js` - Updated to use configuration

#### Frontend Files
- `frontend/src/mainWall.jsx` - Updated to use configuration
- `frontend/src/Login.jsx` - Updated to use configuration
- `frontend/src/SignUp.jsx` - Updated to use configuration
- `frontend/src/MailVerification.jsx` - Updated to use configuration
- `frontend/src/AuthEditDraft.jsx` - Updated to use configuration
- `frontend/vite.config.js` - Updated to use environment variables

## Setup Instructions

### 1. Backend Setup

1. Copy the example environment file:
   ```bash
   cd backend
   cp env.example .env
   ```

2. Update the `.env` file with your actual values:
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bizacuity

   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # Frontend URL (for sharing links)
   FRONTEND_URL=http://localhost:5173

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Copy the example environment file:
   ```bash
   cd frontend
   cp env.example .env
   ```

2. Update the `.env` file with your actual values:
   ```env
   # Backend API URL
   VITE_BACKEND_URL=http://localhost:8080

   # Frontend URL (used for sharing links)
   VITE_FRONTEND_URL=http://localhost:5173

   # Development mode
   VITE_DEV_MODE=true
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration Benefits

### 1. Environment-Specific Configuration
- Different settings for development, staging, and production
- Secure credential management
- Easy deployment configuration

### 2. Centralized Constants
- All hard-coded values in one place
- Easy to modify and maintain
- Consistent across the application

### 3. Type Safety and Validation
- Helper functions for common operations
- Validation functions for data integrity
- Consistent error handling

### 4. Security Improvements
- Sensitive data moved to environment variables
- No hard-coded credentials in source code
- Secure configuration management

## API Configuration

The frontend now uses a centralized API configuration system:

```javascript
import { buildApiUrl } from './config/api';

// Instead of hard-coded URLs
fetch('http://localhost:8080/api/endpoint')

// Use the configuration
fetch(buildApiUrl('/api/endpoint'))
```

## Constants Usage

Application constants are now centralized:

```javascript
import { APP_CONSTANTS } from './config/constants';

// Instead of hard-coded values
const width = "1000px";
const height = "500px";

// Use constants
const width = APP_CONSTANTS.DEFAULT_WIDTH;
const height = APP_CONSTANTS.DEFAULT_HEIGHT;
```

## Migration Notes

### For Developers
1. All hard-coded URLs should now use `buildApiUrl()` function
2. All hard-coded values should use constants from `APP_CONSTANTS`
3. Environment variables should be used for configuration
4. Helper functions are available for common operations

### For Deployment
1. Set up environment variables for each environment
2. Update configuration files for production settings
3. Ensure all sensitive data is in environment variables
4. Test configuration in staging before production

## Security Considerations

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong JWT secrets** - Generate secure random strings
3. **Use app passwords for email** - Don't use regular passwords
4. **Rotate credentials regularly** - Update passwords and secrets periodically
5. **Use HTTPS in production** - Always use secure connections

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env` files are in the correct location
   - Check that variable names match the configuration

2. **API calls failing**
   - Verify `VITE_BACKEND_URL` is set correctly
   - Check that the backend server is running

3. **Email not sending**
   - Verify email credentials in `.env`
   - Check that app passwords are used for Gmail

4. **Database connection issues**
   - Verify database credentials in `.env`
   - Ensure MySQL server is running

## Future Improvements

1. **Add configuration validation** - Validate environment variables on startup
2. **Add configuration documentation** - Auto-generate config docs
3. **Add configuration testing** - Test configuration in CI/CD
4. **Add configuration migration** - Tools to migrate between environments 