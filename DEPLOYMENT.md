# Metapayd MVP Deployment Guide

This guide covers how to deploy and run the complete Metapayd MVP, which includes:
- React Native mobile app (Android-first)
- Browser extension (Chrome/Firefox)
- Node.js backend server

## Prerequisites

### Development Environment
- **Node.js** v16+ and npm
- **React Native CLI** and development environment
- **Android Studio** (for Android development)
- **Git** for version control

### Android Development Setup
1. Install Android Studio
2. Configure Android SDK (API level 28+)
3. Set up Android emulator or connect physical device
4. Enable NFC on device (for tap-to-pay testing)

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start Backend Server
```bash
# Start the backend server (runs on port 3001)
npm run server

# Or start in development mode with auto-reload
cd backend
npm run dev
```

### 3. Start React Native App
```bash
# Start Metro bundler
npm start

# Run on Android (in another terminal)
npm run android

# Or run on iOS (if available)
npm run ios
```

### 4. Install Browser Extension
1. Open Chrome/Firefox
2. Go to Extensions > Developer Mode
3. Click "Load unpacked extension"
4. Select the `browser-extension` folder
5. Extension will appear in toolbar

## Deployment Options

### Option 1: Local Development (Recommended for MVP)

**Backend Server**
```bash
cd backend
npm install
npm start
```
- Server runs on `http://localhost:3001`
- Data stored in local JSON files
- Includes authentication and API endpoints

**Mobile App**
```bash
npm install
npm run android
```
- Connects to local backend
- Demo credentials: `demo@metapayd.com` / `demo123`
- Full NFC tap-to-pay simulation

**Browser Extension**
- Load from `browser-extension` folder
- Works with local backend
- Auto-detects payment forms on shopping sites

### Option 2: Cloud Deployment

**Backend (Heroku/Railway/DigitalOcean)**
```bash
# Set environment variables
export JWT_SECRET=your_secure_secret_here
export PORT=3001

# Deploy backend
git push heroku main

# Update mobile app API endpoint
# Edit src/services/AuthService.js with your backend URL
```

**Mobile App (Testing)**
```bash
# Build for testing
npx react-native build-android --mode=release

# Create APK for distribution
cd android
./gradlew assembleRelease
```

**Browser Extension (Chrome Web Store)**
1. Create developer account
2. Package extension: `zip -r extension.zip browser-extension/`
3. Upload to Chrome Web Store
4. Submit for review

## Configuration

### Backend Configuration
Create `backend/.env`:
```env
JWT_SECRET=your_very_secure_secret_key_here
PORT=3001
NODE_ENV=development
```

### Mobile App Configuration
Update API endpoints in `src/services/AuthService.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001'; // Local
// const API_BASE_URL = 'https://your-backend.herokuapp.com'; // Production
```

### Browser Extension Configuration
Update API endpoints in `browser-extension/popup.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001'; // Local
// const API_BASE_URL = 'https://your-backend.herokuapp.com'; // Production
```

## Testing the MVP

### 1. Mobile App Testing
1. **Authentication**: Register new account or use demo credentials
2. **Home Screen**: View cards, transactions, and savings summary
3. **NFC Pay**: Test tap-to-pay simulation with card selection
4. **Analytics**: Review spending insights and optimization tips

### 2. Browser Extension Testing
1. **Visit shopping sites**: Amazon, Target, etc.
2. **Extension popup**: Click extension icon to see recommendations
3. **Auto-fill demo**: Use "Select This Card" on checkout pages
4. **Settings**: Configure preferences and goals

### 3. Backend API Testing
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login and get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Demo Data

The MVP includes comprehensive mock data:
- **3 sample credit cards** with different reward structures
- **100+ sample transactions** across various merchant categories
- **User profiles** with different spending goals
- **MCC database** with merchant categorizations
- **Analytics data** showing optimization opportunities

## Security Notes

⚠️ **This is an MVP for demonstration purposes**

**Current Security:**
- Basic JWT authentication
- Password hashing with bcrypt
- CORS enabled for development
- Local file-based storage

**Production Security (TODO):**
- Database encryption
- API rate limiting
- HTTPS enforcement
- PCI compliance measures
- Card data tokenization
- Secure key management

## Troubleshooting

### Common Issues

**"Metro bundler failed to start"**
```bash
npx react-native start --reset-cache
```

**"Android build failed"**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**"Backend connection refused"**
- Ensure backend server is running on port 3001
- Check firewall settings
- Verify API endpoint URLs in mobile app

**"Browser extension not loading"**
- Enable Developer Mode in browser
- Check for JavaScript errors in console
- Reload extension after code changes

### Getting Help

1. Check the console logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Ensure backend server is running before starting mobile app
4. Test API endpoints directly with curl or Postman

## Next Steps for Production

1. **Database Migration**: Replace JSON files with PostgreSQL/MongoDB
2. **Real Payment Integration**: Integrate with Stripe, payment processors
3. **Card Tokenization**: Implement secure card data handling
4. **iOS Support**: Add iOS app with NFC entitlements
5. **Production Security**: Add proper authentication, encryption
6. **Monitoring**: Add logging, analytics, error tracking
7. **Testing**: Add comprehensive unit and integration tests

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │ Browser Extension│    │   Backend API   │
│   (React       │    │   (Chrome/       │    │   (Node.js/     │
│   Native)       │    │   Firefox)       │    │   Express)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Shared APIs   │
                    │   & Data Sync   │
                    └─────────────────┘
```

The MVP demonstrates a complete fintech product with:
- Smart card selection algorithms
- NFC-based offline payments  
- Online checkout optimization
- Comprehensive analytics and insights
- Cross-platform data synchronization

Ready to test and iterate! 🚀 