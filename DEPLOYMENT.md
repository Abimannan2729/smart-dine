# Smart Dine - Deployment Guide

This guide covers multiple deployment options for the Smart Dine restaurant management application.

## 🏗️ Architecture Overview

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **Styling**: Tailwind CSS with red/gold/white theme and glassmorphism effects

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended for Production)

#### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM recommended

#### Steps
1. Clone the repository
2. Update environment variables in `docker-compose.yml`
3. Run the application:

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

#### Production Considerations
- Change default MongoDB credentials in `docker-compose.yml`
- Update JWT_SECRET to a secure value
- Configure proper CORS origins
- Set up SSL certificates for HTTPS

### 2. Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`

3. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update DNS settings as instructed

#### Backend on Railway

1. **Push to GitHub**
2. **Connect to Railway**
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub repo
   - Select the `backend` folder
3. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-dine
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
4. **Database Setup**
   - Add MongoDB plugin in Railway
   - Or use MongoDB Atlas (recommended)

#### Backend on Render

1. **Create Web Service**
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment variables (same as Railway)

2. **Database**
   - Use Render's managed PostgreSQL/MongoDB
   - Or connect to MongoDB Atlas

### 3. Netlify (Frontend) + Heroku (Backend)

#### Frontend on Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variable: `VITE_API_URL`

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build and deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Backend on Heroku

1. **Heroku CLI Setup**
   ```bash
   # Install Heroku CLI
   # Create new app
   heroku create smart-dine-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set CORS_ORIGIN=https://your-netlify-app.netlify.app
   
   # Deploy
   git push heroku main
   ```

### 4. Local Development Deployment

#### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas connection

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 🎨 Styling Features

The application includes:
- **Glassmorphism design** with backdrop blur effects
- **Red/White/Gold color theme** throughout the UI
- **Micro-interactions** with hover effects and smooth transitions
- **Responsive design** for mobile, tablet, and desktop
- **Dark/light theme support** (optional)

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-dine
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Smart Dine
VITE_UPLOAD_MAX_SIZE=5242880
```

## 🔒 Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Validate file uploads
- [ ] Sanitize user inputs

## 🚦 Health Checks

### Backend Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Frontend Health Check
```
GET /health
Response: "healthy"
```

## 📊 Monitoring

Consider adding:
- Application monitoring (New Relic, Datadog)
- Error tracking (Sentry)
- Analytics (Google Analytics, Mixpanel)
- Uptime monitoring (Pingdom, UptimeRobot)

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend and backend URLs match

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network connectivity
   - Ensure database exists

3. **Build Failures**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Environment Variables Not Loading**
   - Check .env file location
   - Ensure variables are properly formatted
   - Restart development server

### Logs and Debugging

```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# Railway logs
railway logs

# Heroku logs
heroku logs --tail

# Local debugging
DEBUG=* npm run dev
```

## 🎯 Performance Optimization

1. **Frontend**
   - Enable code splitting
   - Optimize images
   - Use CDN for static assets
   - Enable service worker caching

2. **Backend**
   - Enable compression middleware
   - Implement Redis caching
   - Optimize database queries
   - Use connection pooling

3. **Database**
   - Add proper indexes
   - Enable compression
   - Implement query optimization
   - Regular maintenance

## 📞 Support

For deployment issues or questions:
1. Check this deployment guide
2. Review application logs
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: December 2024
**Version**: 1.0.0