# Local Testing Guide

## 🚀 Testing Static Files Locally

After building your project with `npm run build:deploy`, you can test the static files locally before deploying to S3/CloudFront.

## 📋 Prerequisites

1. **Build the project first:**
   ```bash
   npm run build:deploy
   ```

2. **Verify files exist:**
   ```bash
   ls -la dist/
   # Should show: index.html, _next/, images/, etc.
   ```

## 🔧 Testing Options

### Option 1: Node.js Static Server (Recommended)

**Start the server:**
```bash
npm run serve:static
```

**Access your site:**
- Open browser: http://localhost:3000
- The server handles SPA routing automatically
- Supports all file types with proper MIME types

**Features:**
- ✅ SPA routing support (404 → index.html)
- ✅ Proper MIME types for all files
- ✅ Cache headers
- ✅ Error handling

### Option 2: Python HTTP Server

**Start the server:**
```bash
# Default port 8000
./scripts/serve-python.sh

# Custom port
./scripts/serve-python.sh 8080
```

**Access your site:**
- Open browser: http://localhost:8000
- Simple and fast for basic testing

### Option 3: Live Server (VS Code Extension)

**Install Live Server extension in VS Code:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server"
4. Install the extension by Ritwick Dey

**Start Live Server:**
1. Open the `dist` folder in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Access your site:**
- Usually available at: http://localhost:5500

### Option 4: Using `serve` Package

**Install serve globally:**
```bash
npm install -g serve
```

**Start the server:**
```bash
serve dist -p 3000
```

**Access your site:**
- Open browser: http://localhost:3000

## 🧪 Testing Checklist

### ✅ Basic Functionality
- [ ] Landing page loads correctly
- [ ] Header and footer are visible
- [ ] Navigation links work
- [ ] Images load properly
- [ ] CSS styles are applied

### ✅ SPA Routing
- [ ] Direct URL access works (e.g., `/auth/login`)
- [ ] Browser back/forward buttons work
- [ ] 404 pages redirect to index.html

### ✅ Performance
- [ ] Page loads quickly
- [ ] Images are optimized
- [ ] No console errors
- [ ] Responsive design works

### ✅ Browser Compatibility
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🔍 Debugging

### Check Console for Errors
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Check Network tab for failed requests

### Common Issues

**Issue: Images not loading**
```bash
# Check if images exist
ls -la dist/images/
```

**Issue: CSS not loading**
```bash
# Check if CSS files exist
ls -la dist/_next/static/css/
```

**Issue: JavaScript errors**
- Check browser console
- Verify all JS files are present in `dist/_next/static/chunks/`

### Network Tab Analysis
1. Open Developer Tools → Network
2. Reload the page
3. Check for:
   - 404 errors (red entries)
   - Failed requests
   - Missing resources

## 🚨 Troubleshooting

### Problem: "Cannot find module" errors
**Solution:** Rebuild the project
```bash
npm run build:deploy
```

### Problem: Server won't start
**Solution:** Check if port is in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Problem: Files not found
**Solution:** Verify build output
```bash
# Check if dist directory exists
ls -la dist/

# Check if index.html exists
cat dist/index.html
```

## 📱 Mobile Testing

### Using Browser DevTools
1. Open Developer Tools (F12)
2. Click device toggle (📱 icon)
3. Select mobile device
4. Test responsive design

### Using Real Device
1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Start server on all interfaces:
   ```bash
   # For Node.js server, modify PORT in serve-static.js
   # For Python server
   python3 -m http.server 8000 --bind 0.0.0.0
   ```
3. Access from mobile: `http://YOUR_IP:8000`

## 🎯 Best Practices

1. **Always test locally before deploying**
2. **Test on multiple browsers**
3. **Check mobile responsiveness**
4. **Verify all links work**
5. **Test SPA routing thoroughly**
6. **Check performance metrics**

## 📊 Performance Testing

### Using Lighthouse
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

### Using PageSpeed Insights
1. Visit: https://pagespeed.web.dev/
2. Enter your local URL (if accessible)
3. Analyze performance scores

## 🔄 Continuous Testing

### Add to your workflow:
```bash
# Build and test in one command
npm run build:deploy && npm run serve:static
```

### Automated testing script:
```bash
#!/bin/bash
echo "🔨 Building project..."
npm run build:deploy

echo "🧪 Starting test server..."
npm run serve:static &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

echo "🌐 Opening browser..."
open http://localhost:3000

echo "✅ Server running. Press Ctrl+C to stop."
wait $SERVER_PID
``` 