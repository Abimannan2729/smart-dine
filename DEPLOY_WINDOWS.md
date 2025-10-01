# 🚀 Smart Dine - Windows Deployment Guide

## 🎯 Best Deployment Options for Windows

### Option 1: Cloud Deployment (Recommended - No Docker Required)
**✅ Works on your current Windows setup**
**✅ Free tier available**
**✅ Professional hosting**

---

## 🌟 Quick Cloud Setup (15 minutes)

### Step 1: Prepare Your Code
```powershell
# Navigate to frontend directory
cd C:\Users\abima\smart-dine\frontend

# Test build (should work - we tested this)
npm run build

# Should see: "The build folder is ready to be deployed"
```

### Step 2: Push to GitHub

```powershell
# Initialize git (if not already done)
cd C:\Users\abima\smart-dine
git init
git add .
git commit -m "Smart Dine - Ready for deployment"

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/yourusername/smart-dine.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up with GitHub
   - Click "New Project"

2. **Import Repository**
   - Select your `smart-dine` repository
   - Set **Root Directory** to `frontend`

3. **Configure Build Settings**
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variable**
   - Add: `VITE_API_URL` = `https://your-backend.railway.app` (we'll get this next)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://smart-dine-frontend.vercel.app`

### Step 4: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)**
   - Sign up with GitHub
   - Click "New Project"

2. **Deploy from GitHub**
   - Select "Deploy from GitHub repo"
   - Choose your `smart-dine` repository
   - Set **Root Directory** to `backend`

3. **Add Environment Variables**
   Click "Variables" and add:
   ```bash
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=SmartDine2024SecureJWTKeyChangeInProduction123456
   CORS_ORIGIN=https://smart-dine-frontend.vercel.app
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Deploy**
   - Railway automatically deploys
   - Get your URL: `https://smart-dine-backend.railway.app`

### Step 5: Setup Database (MongoDB Atlas)

1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
   - Sign up for free account

2. **Create Database**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select region (US East recommended)
   - Create cluster (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Add new user:
     - Username: `smartdine`
     - Password: `SmartDine2024!` (or generate secure password)

4. **Allow Network Access**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

### Step 6: Final Configuration

1. **Update Railway Backend**
   - Add to Railway environment variables:
   ```bash
   MONGODB_URI=mongodb+srv://smartdine:SmartDine2024!@cluster0.xxxxx.mongodb.net/smart-dine?retryWrites=true&w=majority
   ```

2. **Update Vercel Frontend**
   - Update `VITE_API_URL` with your Railway URL:
   ```bash
   VITE_API_URL=https://smart-dine-backend.railway.app
   ```

3. **Redeploy**
   - Both services will automatically redeploy
   - Wait 2-3 minutes

## 🎉 Your App is Live!

**Frontend**: https://smart-dine-frontend.vercel.app
**Backend**: https://smart-dine-backend.railway.app

---

## Option 2: Local Windows Development/Testing

### Prerequisites
- ✅ Node.js (you have this)
- ✅ MongoDB (install locally or use Atlas)

### Method A: Local MongoDB
```powershell
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community
# Follow Windows installer

# Start MongoDB service
# MongoDB should auto-start as Windows service

# Test connection
mongosh
# Should connect to: mongodb://127.0.0.1:27017
```

### Method B: Use MongoDB Atlas (Recommended)
```powershell
# Use the same Atlas setup from above
# Update your local .env files with the connection string
```

### Start Backend
```powershell
cd C:\Users\abima\smart-dine\backend

# Create .env file
New-Item -Path ".env" -ItemType File

# Add content to .env (use notepad or VS Code):
@"
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-dine
JWT_SECRET=SmartDine2024SecureJWTKeyChangeInProduction123456
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Install and start
npm install
npm run dev
```

### Start Frontend
```powershell
# Open new PowerShell window
cd C:\Users\abima\smart-dine\frontend

# Create .env file
@"
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Smart Dine
VITE_UPLOAD_MAX_SIZE=5242880
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Start development server
npm start
```

**Access at**: http://localhost:3000

---

## Option 3: Production Build Test (Local)

```powershell
# Test production build locally
cd C:\Users\abima\smart-dine\frontend

# Build the app
npm run build

# Install serve globally
npm install -g serve

# Serve the built app
serve -s build -l 3000

# Access at: http://localhost:3000
```

---

## 🔧 Windows-Specific Tips

### PowerShell Commands
```powershell
# Check if services are running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Kill node processes if needed
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process

# Open ports in Windows Firewall (if needed)
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="React" dir=in action=allow protocol=TCP localport=3000
```

### Environment Variables
```powershell
# Set environment variables (alternative to .env files)
$env:NODE_ENV="development"
$env:MONGODB_URI="mongodb://localhost:27017/smart-dine"

# Start your app
npm run dev
```

### File Permissions
- Make sure your user has write permissions to the project folder
- If using uploads, ensure the uploads directory is writable

---

## 🚦 Testing Your Deployment

### Local Testing
```powershell
# Test backend health
curl http://localhost:5000/health

# If curl not available, use PowerShell:
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### Cloud Testing
```powershell
# Test your deployed backend
Invoke-RestMethod -Uri "https://your-app.railway.app/health"

# Should return: {"status":"ok","timestamp":"..."}
```

### Full Application Test
1. **Register Account** - Create new user
2. **Create Restaurant** - Fill multi-step form
3. **Add Categories** - Test drag-and-drop
4. **Add Menu Items** - Upload images, set prices
5. **Generate QR Code** - Download and test
6. **View Public Menu** - Test customer experience

---

## 🔧 Troubleshooting

### Common Windows Issues

1. **Port Already in Use**
   ```powershell
   # Find what's using port 5000
   netstat -ano | findstr :5000
   
   # Kill the process (replace PID)
   taskkill /PID <PID> /F
   ```

2. **Node Modules Issues**
   ```powershell
   # Clean install
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. **Build Errors**
   ```powershell
   # Clear npm cache
   npm cache clean --force
   
   # Rebuild
   npm run build
   ```

4. **MongoDB Connection Issues**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name "*mongo*"
   
   # Start MongoDB service
   Start-Service -Name "MongoDB"
   ```

---

## 💰 Cost Breakdown

### Free Tier (Recommended Start)
- **Vercel**: Free (100GB bandwidth, unlimited personal projects)
- **Railway**: Free ($5 credit monthly, enough for small apps)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

### Paid Tier (For Growth)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Railway Pro**: $5-20/month (based on usage)
- **MongoDB Atlas**: $9/month (dedicated cluster)
- **Total**: ~$35-50/month

---

## 🎯 Next Steps

1. **Deploy to Cloud** (recommended)
2. **Test all features**
3. **Share with friends/customers**
4. **Monitor usage and performance**
5. **Scale as needed**

Your Smart Dine application is production-ready! 🎉

---

**Need help?** 
- Check logs in Vercel/Railway dashboards
- Use PowerShell commands above for debugging
- Review the main [DEPLOYMENT.md](DEPLOYMENT.md) for advanced options

**Last Updated**: December 2024