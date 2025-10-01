# 🚀 Smart Dine - Quick Deployment Guide

## 🎯 Choose Your Deployment Method

### Option 1: Cloud Deployment (Recommended)
**Best for: Production use, scalability, zero maintenance**

#### Frontend: Vercel (Free tier available)
```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to vercel.com
# 3. Import your GitHub repository
# 4. Set these build settings:
#    - Build Command: npm run build
#    - Output Directory: build
#    - Install Command: npm install
```

**Environment Variables for Vercel:**
```
VITE_API_URL=https://your-backend-url.railway.app
```

#### Backend: Railway (Free tier available)
```bash
# 1. Go to railway.app
# 2. Create new project from GitHub
# 3. Select backend folder
# 4. Add these environment variables:
```

**Environment Variables for Railway:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-dine
JWT_SECRET=your-super-secure-32-character-secret-key-here
CORS_ORIGIN=https://your-app.vercel.app
```

#### Database: MongoDB Atlas (Free tier available)
```bash
# 1. Go to mongodb.com/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Add to Railway environment variables
```

---

### Option 2: Docker Deployment
**Best for: Local production testing, full control**

```bash
# 1. Make sure Docker is installed
docker --version

# 2. Clone and start
git clone <your-repo>
cd smart-dine

# 3. Update docker-compose.yml with your settings
# 4. Start all services
docker-compose up --build -d

# 5. Check status
docker-compose ps

# Access at: http://localhost:3000
```

---

### Option 3: Local Development
**Best for: Testing, development**

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend  
cd frontend
npm install
npm start

# Access at: http://localhost:3000
```

## 🎯 Step-by-Step: Cloud Deployment (Detailed)

### Step 1: Prepare Your Code
```bash
# Ensure build works
cd frontend
npm run build

# Should see: "The build folder is ready to be deployed"
```

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` folder as root directory

3. **Configure Build Settings**
   ```
   Framework Preset: Create React App
   Build Command: npm run build  
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL = https://your-app-name.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Get your URL: `https://your-app.vercel.app`

### Step 3: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Select `backend` folder as root directory
   - Railway auto-detects Node.js

4. **Add Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-dine
   JWT_SECRET=your-super-secure-32-character-secret-key-here
   CORS_ORIGIN=https://your-app.vercel.app
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

5. **Deploy**
   - Railway automatically deploys
   - Get your URL: `https://your-app.railway.app`

### Step 4: Setup MongoDB Atlas

1. **Create Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free

2. **Create Cluster**
   - Choose "Free" tier
   - Select region closest to users
   - Create cluster (takes 3-5 minutes)

3. **Setup Database Access**
   - Go to "Database Access"
   - Add new database user
   - Username: `smartdine`
   - Password: `generate secure password`

4. **Setup Network Access**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add Railway's IP ranges for security

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

### Step 5: Update Environment Variables

Update Railway backend with your MongoDB URI:
```
MONGODB_URI=mongodb+srv://smartdine:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-dine?retryWrites=true&w=majority
```

Update Vercel frontend with Railway backend URL:
```
VITE_API_URL=https://your-app-name.railway.app
```

## 🔧 Environment Variables Reference

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=https://your-backend.railway.app

# App Configuration
VITE_APP_NAME=Smart Dine
VITE_UPLOAD_MAX_SIZE=5242880

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Backend (.env)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.net/smart-dine

# Security
JWT_SECRET=your-super-secure-32-character-secret-key-change-this-in-production
CORS_ORIGIN=https://your-app.vercel.app

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Optional: Email (for contact forms)
EMAIL_SERVICE=gmail
EMAIL_USER=your-app@gmail.com
EMAIL_PASS=your-app-password
```

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code builds successfully (`npm run build`)
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] API endpoints working
- [ ] Image uploads functioning

### Security
- [ ] Changed default JWT secret
- [ ] MongoDB credentials secured
- [ ] CORS properly configured
- [ ] HTTPS enabled in production
- [ ] Environment variables not in code

### Post-Deployment
- [ ] Frontend loads correctly
- [ ] Backend API responding
- [ ] Database operations working
- [ ] File uploads working
- [ ] QR codes generating
- [ ] Analytics tracking (if enabled)

## 🚦 Testing Your Deployment

1. **Frontend Test**
   ```bash
   # Visit your Vercel URL
   https://your-app.vercel.app
   
   # Should see: Login/Register page
   ```

2. **Backend Test**
   ```bash
   # Test API health check
   curl https://your-app.railway.app/health
   
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. **Full Flow Test**
   - Register new account
   - Create restaurant
   - Add menu categories
   - Add menu items
   - Generate QR code
   - View public menu

## 🔧 Troubleshooting

### Common Issues

1. **"API Error" or Network Issues**
   ```bash
   # Check VITE_API_URL in Vercel
   # Check CORS_ORIGIN in Railway
   # Ensure URLs match exactly
   ```

2. **Build Failures**
   ```bash
   # Test locally first
   npm run build
   
   # Clear cache and retry
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

3. **Database Connection Failed**
   ```bash
   # Check MongoDB Atlas:
   # - Network access allows your IP
   # - Database user exists
   # - Connection string is correct
   ```

4. **File Upload Issues**
   ```bash
   # Check Railway logs
   railway logs
   
   # Verify upload directory exists
   # Check file size limits
   ```

### Getting Help

1. **Check Logs**
   - Vercel: Dashboard → Functions → View logs
   - Railway: Dashboard → Deployments → View logs
   - MongoDB Atlas: Database → Monitoring

2. **Test Endpoints**
   ```bash
   # Test backend health
   curl https://your-app.railway.app/health
   
   # Test API endpoints
   curl https://your-app.railway.app/api/auth/health
   ```

## 🎯 Production Optimizations

### Performance
- [ ] Enable CDN for images
- [ ] Setup Redis caching
- [ ] Optimize database indexes
- [ ] Enable compression
- [ ] Setup monitoring

### Security
- [ ] Setup SSL certificates
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Setup backup strategy
- [ ] Monitor for vulnerabilities

## 🎉 You're Live!

Once deployed, your Smart Dine application will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app`
- **Database**: MongoDB Atlas cluster

**Total Cost**: $0/month on free tiers!

---

**Need help?** Check the full [DEPLOYMENT.md](DEPLOYMENT.md) for advanced options.

**Last Updated**: December 2024