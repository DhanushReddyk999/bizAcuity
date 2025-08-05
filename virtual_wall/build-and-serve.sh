#!/bin/bash

# Build and Serve Script - Single Server Deployment
echo "=== Building Frontend ==="

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "Error: Frontend build failed!"
    exit 1
fi

echo "Frontend built successfully!"

# Navigate to backend directory
cd ../backend

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "=== Starting Backend Server ==="
echo "Server will serve both API and frontend from the same port"
echo "Frontend will be available at the root URL"
echo "API endpoints will be available at their respective paths"

# Start the backend server
npm start 