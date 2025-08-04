#!/bin/bash

# EC2 Deployment Script for Virtual Wall
echo "Starting deployment..."

# Navigate to project directory (update this path to match your EC2 setup)
cd /home/ubuntu/virtual_wall

# Pull latest changes
echo "Pulling latest changes from Git..."
git pull origin main

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Restart backend service
echo "Restarting backend service..."
# If using PM2
pm2 restart all

# Or if using systemd (uncomment the appropriate line)
# sudo systemctl restart virtual-wall-backend

# Install frontend dependencies and build
echo "Building frontend..."
cd ../frontend
npm install
npm run build

echo "Deployment completed!" 