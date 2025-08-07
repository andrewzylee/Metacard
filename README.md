# Metapayd MVP

AI-powered digital wallet that intelligently selects the optimal credit card for every transaction.

## Features

### Core Functionality
- **Smart Card Selection**: AI-powered algorithm chooses the best card based on MCC, rewards, and spending patterns
- **Tap-to-Pay**: NFC-enabled offline transactions using Android Host Card Emulation
- **Browser Extension**: Seamless online checkout optimization
- **Analytics Dashboard**: Real-time insights on savings and spending patterns

### MVP Implementation
- React Native mobile app (Android-first)
- Simple rule-based card selection algorithm
- Mock transaction data and user profiles
- Basic email/password authentication
- Browser extension for major e-commerce sites

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- React Native CLI
- Android Studio (for Android development)
- Android device or emulator with NFC capability

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Setup Android environment**
   ```bash
   npx react-native doctor
   ```

3. **Start the Metro bundler**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Start the mock backend**
   ```bash
   npm run server
   ```

## Project Structure

```
metapayd-mvp/
├── src/                    # React Native app source
│   ├── components/         # Reusable UI components
│   ├── screens/           # App screens
│   ├── services/          # API and business logic
│   ├── utils/             # Helper functions
│   └── data/              # Mock data
├── backend/               # Simple Node.js backend
├── browser-extension/     # Chrome/Firefox extension
└── docs/                  # Documentation
```

## Architecture

### Card Selection Algorithm
1. **MCC Analysis**: Identifies merchant category for optimal rewards
2. **Historical Patterns**: Learns from user spending behavior
3. **Reward Optimization**: Calculates best cashback/points return
4. **Goal Alignment**: Considers user preferences (cashback vs travel)

### Security
- Encrypted card storage using React Native Encrypted Storage
- Tokenized card data for NFC transactions
- Secure communication with mock payment processors

## Development Roadmap

- [x] Project setup and dependencies
- [ ] Core card management interface
- [ ] NFC tap-to-pay implementation
- [ ] Browser extension development
- [ ] Analytics and insights dashboard
- [ ] Advanced AI optimization engine

## Demo Data

The app includes mock data for:
- 3 sample credit cards with different reward structures
- 100+ sample transactions across various MCCs
- User profiles with different spending goals
- Merchant database with MCC classifications

## Contributing

This is an MVP focused on demonstrating core functionality. Future enhancements will include real payment processor integration and machine learning models. 