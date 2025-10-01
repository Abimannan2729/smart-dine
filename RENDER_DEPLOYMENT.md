# 🚀 Render Deployment Guide for Smart Dine

This guide will help you deploy your Smart Dine application to Render with both frontend and backend services.

## 📋 Prerequisites

- ✅ Code pushed to GitHub: `https://github.com/Abimannan2729/smart-dine`
- ✅ Render account: Sign up at [render.com](https://render.com)
- ✅ GitHub account connected to Render

## 🎯 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Static)      │ ── │   (Web Service) │ ── │  (PostgreSQL)   │
│   React App     │    │   Node.js API   │    │   Free Tier     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Step-by-Step Deployment

### Step 1: Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign in with GitHub
4. Authorize Render to access your repositories

### Step 2: Deploy Backend Service

1. **Create Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Select **"Connect a repository"**
   - Choose **`Abimannan2729/smart-dine`**
   - Click **"Connect"**

2. **Configure Backend Service:**
   ```
   Name: smart-dine-backend
   Language: Node
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   CLIENT_URL=https://smart-dine-frontend.onrender.com
   MONGODB_URI=<Your MongoDB Atlas connection string>
   ```

4. **Advanced Settings:**
   - Plan: **Free**
   - Auto-Deploy: **Yes**
   - Health Check Path: `/api/health`

### Step 3: Create Database

1. **PostgreSQL Database (Alternative to MongoDB):**
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `smart-dine-db`
   - Plan: **Free**
   - Click **"Create Database"**

   **OR**

2. **Use MongoDB Atlas:**
   - Keep your existing MongoDB Atlas setup
   - Update `MONGODB_URI` in backend environment variables

### Step 4: Deploy Frontend Service

1. **Create Static Site:**
   - Click **"New +"** → **"Static Site"**
   - Select your repository: **`Abimannan2729/smart-dine`**
   - Click **"Connect"**

2. **Configure Frontend Service:**
   ```
   Name: smart-dine-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

3. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://smart-dine-backend.onrender.com/api
   ```

4. **Configure Redirects:**
   - Add redirect rule: `/* → /index.html` (for SPA routing)

### Step 5: Update CORS Settings

After deployment, update your backend's CORS settings to include the actual URLs:

1. Update `CLIENT_URL` environment variable in backend:
   ```
   CLIENT_URL=https://smart-dine-frontend.onrender.com
   ```

## 🔧 Environment Variables Reference

### Backend Environment Variables:
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
CLIENT_URL=https://smart-dine-frontend.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartdine?retryWrites=true&w=majority
```

### Frontend Environment Variables:
```bash
REACT_APP_API_URL=https://smart-dine-backend.onrender.com/api
```

## 📱 Expected URLs After Deployment

- **Frontend:** `https://smart-dine-frontend.onrender.com`
- **Backend API:** `https://smart-dine-backend.onrender.com/api`
- **Health Check:** `https://smart-dine-backend.onrender.com/api/health`

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Ensure `package.json` is in correct directory
   - Verify Node.js version compatibility

2. **Database Connection:**
   - Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
   - Check connection string format
   - Test connection string locally first

3. **CORS Errors:**
   - Update `CLIENT_URL` environment variable
   - Check browser console for specific errors
   - Verify API URL in frontend environment variables

4. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after sleep may be slow (30-60 seconds)
   - 750 hours/month limit per service

### Logs and Debugging:
- Backend logs: Render Dashboard → Service → Logs
- Frontend build logs: Render Dashboard → Static Site → Deploys
- Health check: Visit `/api/health` endpoint

## 🎉 Post-Deployment Checklist

- [ ] Frontend loads successfully
- [ ] Backend API responds to health check
- [ ] User registration/login works
- [ ] Restaurant creation works
- [ ] Menu management works
- [ ] Public menu access works
- [ ] QR code generation works
- [ ] File uploads work
- [ ] Database operations work

## 💡 Tips for Success

1. **Test Locally First:** Always test your app locally before deploying
2. **Use Environment Variables:** Never hardcode URLs or secrets
3. **Monitor Logs:** Check Render logs if something doesn't work
4. **Free Tier Sleep:** Expect slower first requests after inactivity
5. **Database Choice:** MongoDB Atlas (cloud) works better than local database

## 🔄 Redeployment

To redeploy after making changes:
1. Push changes to GitHub
2. Render automatically redeploys (if auto-deploy is enabled)
3. Or manually trigger deploy in Render dashboard

---

**Need Help?** Check Render documentation or contact support through their dashboard.