# 🔧 Fix Old Image URLs in Database

## 🎯 **What This Fixes**

Your new uploads work perfectly, but old images in the database still have `localhost:5000` URLs. This script updates them to use your deployed backend URL.

## 🚀 **How to Run the Fix**

### **Option 1: Run Locally (If you have the project locally)**
```bash
cd backend
node fix-image-urls.js
```

### **Option 2: Run on Render (Recommended)**
1. Go to your **smart-dine-backend-1eyi** service in Render
2. Go to **Shell** tab
3. Run these commands:
   ```bash
   cd /opt/render/project/src/backend
   node fix-image-urls.js
   ```

## 📋 **What the Script Does**

1. **Connects to your MongoDB database**
2. **Finds all records** with `localhost:5000` image URLs
3. **Updates them** to use `smart-dine-backend-1eyi.onrender.com`
4. **Shows progress** as it fixes each record

## ✅ **Expected Output**

```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB

🏪 Fixing Restaurant images...
Found 1 restaurants with localhost URLs
  📸 Updated logo: http://localhost:5000/uploads/logos/logo-123.png → http://smart-dine-backend-1eyi.onrender.com/uploads/logos/logo-123.png
  ✅ Saved restaurant: Your Restaurant Name

🍽️  Fixing MenuItem images...
Found 2 menu items with localhost URLs
  📸 Updated item image: http://localhost:5000/uploads/misc/image-456.jpg → http://smart-dine-backend-1eyi.onrender.com/uploads/misc/image-456.jpg
  ✅ Saved menu item: Coffee

🎉 Database URL fix completed successfully!
```

## 🧪 **After Running the Fix**

1. **Refresh your dashboard** in the browser
2. **All images should now load correctly**
3. **No more localhost:5000 errors** in console

## 🆘 **If You Need Help**

The script is safe - it only updates URLs, doesn't delete anything. If you have issues:

1. Check that your MongoDB connection string is correct
2. Make sure you're in the `backend` directory
3. Verify the script file exists

## 🎉 **Final Result**

After running this script:
- ✅ All old images will load correctly
- ✅ No more Mixed Content errors
- ✅ No more localhost:5000 requests
- ✅ Complete image upload fix achieved!