# Cloudinary Setup for Smart Dine

## 🚨 IMPORTANT: Required for Deployment

The Smart Dine application now uses **Cloudinary** for image storage to fix the deployment upload issue. This is **required** for any deployment platform with ephemeral filesystems (Render, Heroku, etc.).

## 📋 Quick Setup Checklist

### 1. Create Cloudinary Account
- [ ] Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier available)
- [ ] Fill out the registration form with your details
- [ ] Click "GET STARTED NOW"
- [ ] Verify your email if required

### 2. Find Your API Credentials
After logging in, you'll see your **Dashboard**. Your credentials are displayed prominently at the top:

```
Account Details
Cloud name: your-cloud-name-here
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

**Important**: 
- **Cloud Name**: Usually looks like `dj1a2b3c4d` or similar
- **API Key**: A long number like `123456789012345`
- **API Secret**: A long string with letters and numbers

You can also find them by:
1. Going to **Settings** (gear icon)
2. Clicking **Account** tab
3. Scrolling to **Account Details** section

### 3. Configure Environment Variables

#### For Render Deployment:
Update your Render service environment variables:
```
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

#### For Local Development:
Update your `backend/.env` file:
```
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### 4. Deploy Changes
- [ ] Push the latest changes to your repository
- [ ] Redeploy your Render service
- [ ] Test image uploads in your deployed application

## 🔧 What Was Fixed

### Problem
- **Ephemeral Filesystem**: Render's containers restart and lose all uploaded files
- **Local Storage**: Files stored in `/uploads` directory were not persistent
- **Image Loss**: Restaurant logos, menu images, etc. disappeared after deployment restarts

### Solution
- **Cloud Storage**: All images now stored in Cloudinary (persistent)
- **CDN Delivery**: Fast global image delivery
- **Auto-Optimization**: Images automatically optimized for web
- **Organized Storage**: Images organized in folders (logos, covers, menu-items, etc.)

## 📁 Image Organization

Images are automatically organized in Cloudinary folders:
- `logos/` - Restaurant logos
- `covers/` - Cover/banner images
- `menu-items/` - Menu item photos
- `categories/` - Category images
- `misc/` - Other uploads

## 🧪 Testing

After setup, test these features:
1. Upload restaurant logo
2. Add menu item with image
3. Upload category image
4. Restart your deployment
5. Verify all images still load correctly

## 💡 Benefits

- ✅ **Persistent Storage** - Images survive deployment restarts
- ✅ **CDN Delivery** - Fast loading worldwide
- ✅ **Auto-Optimization** - Automatic format/quality optimization
- ✅ **Scalable** - Handles unlimited images
- ✅ **Free Tier** - 25GB storage, 25GB bandwidth/month
- ✅ **Backup** - Images safely stored in cloud

## 🆘 Troubleshooting

### Images Not Uploading
1. Check environment variables are set correctly
2. Verify Cloudinary credentials are valid
3. Check browser console for errors
4. Ensure file size is under 10MB

### Old Images Missing
- Old local images won't be migrated automatically
- Re-upload important images after deployment
- Local images still work in development

### Environment Variables Not Loading
1. Restart your Render service after adding variables
2. Check variable names match exactly (case-sensitive)
3. Verify no extra spaces in values

## 📞 Support

If you encounter issues:
1. Check the deployment logs for error messages
2. Verify all environment variables are set
3. Test with a small image file first
4. Ensure your Cloudinary account is active