# EC2 Deployment Guide for Virtual Wall

## Prerequisites
- EC2 instance running Ubuntu
- Node.js and npm installed
- Git installed
- PM2 or systemd for process management

## Step 1: Connect to your EC2 instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Navigate to your project
```bash
cd /path/to/your/project
# Example: cd /home/ubuntu/virtual_wall
```

## Step 3: Pull the latest changes
```bash
git pull origin main
```

## Step 4: Deploy Backend
```bash
cd backend
npm install
```

## Step 5: Restart Backend Service

### Option A: Using PM2 (Recommended)
```bash
# If PM2 is not installed
npm install -g pm2

# Start/restart the backend
pm2 restart all
# Or start for the first time
pm2 start index.js --name "virtual-wall-backend"
```

### Option B: Using systemd
```bash
sudo systemctl restart virtual-wall-backend
```

### Option C: Manual restart
```bash
pkill node
npm start
```

## Step 6: Deploy Frontend (if applicable)
```bash
cd ../frontend
npm install
npm run build
```

## Step 7: Verify Deployment
```bash
# Check if backend is running
curl http://localhost:8080

# Check PM2 status
pm2 status

# Check systemd status
sudo systemctl status virtual-wall-backend
```

## Using the Deployment Script
1. Copy the `deploy.sh` script to your EC2 instance
2. Make it executable: `chmod +x deploy.sh`
3. Run it: `./deploy.sh`

## Troubleshooting

### Common Issues:
1. **Port already in use**: Kill existing processes
   ```bash
   sudo lsof -i :8080
   kill -9 <PID>
   ```

2. **Permission denied**: Check file permissions
   ```bash
   sudo chown -R ubuntu:ubuntu /path/to/project
   ```

3. **Environment variables**: Ensure `.env` file is present
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

4. **Database connection**: Verify database is accessible
   ```bash
   mysql -h your-db-host -u your-user -p
   ```

## Monitoring
- Check logs: `pm2 logs` or `sudo journalctl -u virtual-wall-backend`
- Monitor resources: `htop` or `top`
- Check application status: `curl http://localhost:8080/health` 