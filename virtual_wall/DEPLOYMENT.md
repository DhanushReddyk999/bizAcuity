# Virtual Wall - Render Deployment Guide

## Overview
This guide will help you deploy the Virtual Wall application on Render. The application consists of:
- **Backend**: Node.js/Express API
- **Frontend**: React/Vite application

## Prerequisites
1. A Render account
2. A MySQL database (you can use Render's MySQL service or external providers like PlanetScale, Railway, etc.)
3. Git repository with your code

## Step 1: Database Setup

### Option A: Render MySQL (Recommended)
1. Go to your Render dashboard
2. Click "New" → "MySQL"
3. Configure your database:
   - Name: `virtual-wall-db`
   - Database: `bizacuity`
   - User: Create a secure username
   - Password: Generate a strong password
4. Note down the connection details

### Option B: External Database
Use services like:
- PlanetScale
- Railway
- AWS RDS
- Google Cloud SQL

## Step 2: Deploy Backend

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your Git repository
   - Set the root directory to `backend`

2. **Configure Service**
   - **Name**: `virtual-wall-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=8080
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=bizacuity
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-app-password
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=https://your-frontend-app.onrender.com
   CORS_ORIGIN=https://your-frontend-app.onrender.com
   MAX_FILE_SIZE=5242880
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the backend URL (e.g., `https://virtual-wall-backend.onrender.com`)

## Step 3: Deploy Frontend

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New" → "Static Site"
   - Connect your Git repository
   - Set the root directory to `frontend`

2. **Configure Service**
   - **Name**: `virtual-wall-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `frontend`

3. **Environment Variables**
   Add these environment variables:
   ```
   VITE_BACKEND_URL=https://your-backend-app.onrender.com
   VITE_FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the frontend URL

## Step 4: Update Environment Variables

After both services are deployed:

1. **Update Backend Environment Variables**
   - Go to your backend service settings
   - Update `FRONTEND_URL` and `CORS_ORIGIN` with your frontend URL

2. **Update Frontend Environment Variables**
   - Go to your frontend service settings
   - Update `VITE_BACKEND_URL` with your backend URL
   - Update `VITE_FRONTEND_URL` with your frontend URL

## Step 5: Database Setup

1. **Create Database Tables**
   - Connect to your database
   - Run the SQL scripts to create necessary tables
   - Import any initial data if needed

2. **Test Database Connection**
   - Verify your backend can connect to the database
   - Check logs for any connection errors

## Step 6: Email Configuration

1. **Gmail Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Use the App Password in `EMAIL_PASS` environment variable

2. **Alternative Email Services**
   - SendGrid
   - Mailgun
   - AWS SES

## Step 7: Testing

1. **Test Backend API**
   - Visit your backend URL
   - Test API endpoints using Postman or similar tool

2. **Test Frontend**
   - Visit your frontend URL
   - Test user registration, login, and main features

3. **Test Email Functionality**
   - Register a new user
   - Verify email verification works

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs for missing dependencies
   - Ensure all required environment variables are set

2. **Database Connection Issues**
   - Verify database credentials
   - Check if database is accessible from Render

3. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly
   - Check frontend URL in backend configuration

4. **Email Not Working**
   - Verify email credentials
   - Check if App Password is correct for Gmail

### Logs and Debugging
- Check Render logs for both services
- Use console.log statements for debugging
- Monitor application performance

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Restrict database access
   - Regular backups

3. **JWT Security**
   - Use a strong JWT secret
   - Set appropriate expiration times

## Monitoring and Maintenance

1. **Set up monitoring**
   - Enable Render's built-in monitoring
   - Set up alerts for downtime

2. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

3. **Backup strategy**
   - Regular database backups
   - Code repository backups

## Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Test locally first
4. Contact support if needed 