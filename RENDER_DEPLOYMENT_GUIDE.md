# 🚀 Render Deployment Guide - Adding Cloudinary Environment Variables

## Step 1: Get Your Cloudinary Credentials

1. **Sign up at Cloudinary**: Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. **Find your credentials**: After logging in, you'll see them on your dashboard:
   ```
   Cloud name: dj1a2b3c4d (example)
   API Key: 123456789012345 (example)
   API Secret: abcdefghijklmnopqrstuvwxyz123456 (example)
   ```

## Step 2: Add Environment Variables to Render

### Option A: Through Render Dashboard (Recommended)

1. **Go to your Render service**:
   - Log in to [render.com](https://render.com)
   - Click on your Smart Dine service

2. **Navigate to Environment Variables**:
   - Click on "Environment" tab in the left sidebar
   - Click "Add Environment Variable" button

3. **Add these 3 variables** (click "Add Environment Variable" for each):

   **Variable 1:**
   ```
   Key: CLOUDINARY_CLOUD_NAME
   Value: [paste your actual cloud name here]
   ```

   **Variable 2:**
   ```
   Key: CLOUDINARY_API_KEY
   Value: [paste your actual API key here]
   ```

   **Variable 3:**
   ```
   Key: CLOUDINARY_API_SECRET
   Value: [paste your actual API secret here]
   ```

4. **Save and Deploy**:
   - Click "Save Changes"
   - Your service will automatically redeploy

### Option B: Through render.yaml (Already Done)

The `render.yaml` file has already been updated with the environment variable placeholders. Render will automatically use the variables you set in the dashboard.

## Step 3: Verify Deployment

1. **Check deployment logs**:
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for successful deployment messages

2. **Test image uploads**:
   - Visit your deployed Smart Dine application
   - Try uploading a restaurant logo or menu item image
   - Verify the image appears correctly

## 🔍 Troubleshooting

### Environment Variables Not Working?
- **Check spelling**: Variable names are case-sensitive
- **No spaces**: Make sure there are no extra spaces in values
- **Restart service**: Sometimes you need to manually trigger a redeploy

### Images Still Not Uploading?
1. Check browser console for errors (F12 → Console tab)
2. Check Render logs for error messages
3. Verify your Cloudinary account is active
4. Try with a smaller image file first

### Can't Find Environment Variables Section?
- Make sure you're in the correct service (Smart Dine backend)
- Look for "Environment" in the left sidebar
- If using a different plan, the UI might be slightly different

## 📞 Need Help?

If you're still having issues:
1. Check that all 3 environment variables are set correctly
2. Verify your Cloudinary credentials are valid
3. Look at the deployment logs for specific error messages
4. Try redeploying manually from the Render dashboard

## ✅ Success Checklist

- [ ] Cloudinary account created
- [ ] All 3 environment variables added to Render
- [ ] Service redeployed successfully
- [ ] Image upload test completed
- [ ] Images persist after service restart