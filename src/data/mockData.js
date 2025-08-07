// Mock data for Metapayd MVP demonstration

export const mockUser = {
  id: 'user_001',
  email: 'demo@metapayd.com',
  name: 'Alex Johnson',
  preferences: {
    primaryGoal: 'cashback', // 'cashback', 'travel', 'debt_payoff'
    monthlySpendingGoal: 3000,
    alertsEnabled: true,
    autoOptimize: true
  },
  createdAt: '2024-01-15',
  totalSavings: 247.83
};

export const mockCards = [
  {
    id: 'card_001',
    userId: 'user_001',
    name: 'Chase Freedom Unlimited',
    lastFour: '4532',
    network: 'Visa',
    color: '#1f4788',
    isActive: true,
    rewards: {
      defaultRate: 1.5,
      categories: {
        '5411': 3.0, // Grocery stores
        '5812': 2.0, // Restaurants
        '5541': 5.0  // Gas stations (quarterly)
      },
      type: 'cashback'
    },
    balance: 1247.32,
    creditLimit: 8000,
    annualFee: 0
  },
  {
    id: 'card_002',
    userId: 'user_001',
    name: 'American Express Gold',
    lastFour: '7891',
    network: 'American Express',
    color: '#d4af37',
    isActive: true,
    rewards: {
      defaultRate: 1.0,
      categories: {
        '5812': 4.0, // Restaurants
        '5411': 4.0, // Supermarkets
        '3000': 3.0  // Airlines (travel)
      },
      type: 'points',
      pointValue: 0.02
    },
    balance: 892.15,
    creditLimit: 15000,
    annualFee: 250
  },
  {
    id: 'card_003',
    userId: 'user_001',
    name: 'Citi Double Cash',
    lastFour: '2468',
    network: 'Mastercard',
    color: '#c41e3a',
    isActive: true,
    rewards: {
      defaultRate: 2.0,
      categories: {},
      type: 'cashback'
    },
    balance: 456.78,
    creditLimit: 5000,
    annualFee: 0
  }
];

export const mccDatabase = {
  '5411': { category: 'Grocery Stores', description: 'Supermarkets' },
  '5812': { category: 'Restaurants', description: 'Eating Places' },
  '5541': { category: 'Gas Stations', description: 'Service Stations' },
  '5691': { category: 'Clothing', description: 'Men\'s and Women\'s Clothing Stores' },
  '5732': { category: 'Electronics', description: 'Electronics Stores' },
  '5311': { category: 'Department Stores', description: 'Department Stores' },
  '4111': { category: 'Transportation', description: 'Local/Suburban Commuter Transportation' },
  '3000': { category: 'Airlines', description: 'United Airlines' },
  '7011': { category: 'Lodging', description: 'Hotels, Motels, Resorts' },
  '5999': { category: 'Miscellaneous', description: 'Miscellaneous Retail Stores' },
  '5912': { category: 'Pharmacy', description: 'Drug Stores and Pharmacies' },
  '5651': { category: 'Clothing', description: 'Family Clothing Stores' },
  '5300': { category: 'Wholesale', description: 'Wholesale Clubs' }
};

export const mockMerchants = [
  { id: 'merchant_001', name: 'Whole Foods Market', mcc: '5411', logo: '🥬' },
  { id: 'merchant_002', name: 'Chipotle Mexican Grill', mcc: '5812', logo: '🌯' },
  { id: 'merchant_003', name: 'Shell Gas Station', mcc: '5541', logo: '⛽' },
  { id: 'merchant_004', name: 'Amazon', mcc: '5999', logo: '📦' },
  { id: 'merchant_005', name: 'Target', mcc: '5311', logo: '🎯' },
  { id: 'merchant_006', name: 'Starbucks', mcc: '5812', logo: '☕' },
  { id: 'merchant_007', name: 'Best Buy', mcc: '5732', logo: '📱' },
  { id: 'merchant_008', name: 'CVS Pharmacy', mcc: '5912', logo: '💊' },
  { id: 'merchant_009', name: 'Delta Airlines', mcc: '3000', logo: '✈️' },
  { id: 'merchant_010', name: 'Hilton Hotels', mcc: '7011', logo: '🏨' }
];

export const mockTransactions = [
  {
    id: 'txn_001',
    userId: 'user_001',
    merchantId: 'merchant_001',
    merchantName: 'Whole Foods Market',
    amount: 89.47,
    mcc: '5411',
    cardUsed: 'card_002', // AmEx Gold (4% grocery)
    recommendedCard: 'card_002',
    rewardEarned: 3.58,
    potentialReward: 3.58,
    savings: 0,
    timestamp: '2024-01-20T14:30:00Z',
    status: 'completed',
    location: 'Austin, TX'
  },
  {
    id: 'txn_002',
    userId: 'user_001',
    merchantId: 'merchant_002',
    merchantName: 'Chipotle Mexican Grill',
    amount: 12.85,
    mcc: '5812',
    cardUsed: 'card_003', // Citi Double Cash (2%)
    recommendedCard: 'card_002', // Should have used AmEx Gold (4% restaurants)
    rewardEarned: 0.26,
    potentialReward: 0.51,
    savings: -0.25,
    timestamp: '2024-01-19T19:15:00Z',
    status: 'completed',
    location: 'Austin, TX'
  },
  {
    id: 'txn_003',
    userId: 'user_001',
    merchantId: 'merchant_003',
    merchantName: 'Shell Gas Station',
    amount: 45.20,
    mcc: '5541',
    cardUsed: 'card_001', // Chase Freedom (5% gas quarterly)
    recommendedCard: 'card_001',
    rewardEarned: 2.26,
    potentialReward: 2.26,
    savings: 0,
    timestamp: '2024-01-18T08:45:00Z',
    status: 'completed',
    location: 'Austin, TX'
  },
  {
    id: 'txn_004',
    userId: 'user_001',
    merchantId: 'merchant_004',
    merchantName: 'Amazon',
    amount: 156.99,
    mcc: '5999',
    cardUsed: 'card_003', // Citi Double Cash (2%)
    recommendedCard: 'card_003',
    rewardEarned: 3.14,
    potentialReward: 3.14,
    savings: 0,
    timestamp: '2024-01-17T16:22:00Z',
    status: 'completed',
    location: 'Online'
  },
  {
    id: 'txn_005',
    userId: 'user_001',
    merchantId: 'merchant_006',
    merchantName: 'Starbucks',
    amount: 5.75,
    mcc: '5812',
    cardUsed: 'card_001', // Chase Freedom (2% restaurants)
    recommendedCard: 'card_002', // Should have used AmEx Gold (4% restaurants)
    rewardEarned: 0.12,
    potentialReward: 0.23,
    savings: -0.11,
    timestamp: '2024-01-16T07:30:00Z',
    status: 'completed',
    location: 'Austin, TX'
  }
];

// Generate additional mock transactions for the past 3 months
export const generateMockTransactions = (count = 100) => {
  const transactions = [...mockTransactions];
  const merchants = mockMerchants;
  const cards = mockCards;
  
  for (let i = 0; i < count - mockTransactions.length; i++) {
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = Math.round((Math.random() * 200 + 5) * 100) / 100;
    const days = Math.floor(Math.random() * 90);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - days);
    
    // Simple card selection logic for mock data
    const optimalCard = getOptimalCardForMCC(merchant.mcc, amount, cards);
    const actualCard = cards[Math.floor(Math.random() * cards.length)];
    
    const actualReward = calculateReward(actualCard, merchant.mcc, amount);
    const optimalReward = calculateReward(optimalCard, merchant.mcc, amount);
    
    transactions.push({
      id: `txn_${String(i + 10).padStart(3, '0')}`,
      userId: 'user_001',
      merchantId: merchant.id,
      merchantName: merchant.name,
      amount,
      mcc: merchant.mcc,
      cardUsed: actualCard.id,
      recommendedCard: optimalCard.id,
      rewardEarned: actualReward,
      potentialReward: optimalReward,
      savings: optimalReward - actualReward,
      timestamp: timestamp.toISOString(),
      status: 'completed',
      location: Math.random() > 0.3 ? 'Austin, TX' : 'Online'
    });
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Helper functions
const getOptimalCardForMCC = (mcc, amount, cards) => {
  let bestCard = cards[0];
  let bestReward = 0;
  
  cards.forEach(card => {
    const reward = calculateReward(card, mcc, amount);
    if (reward > bestReward) {
      bestReward = reward;
      bestCard = card;
    }
  });
  
  return bestCard;
};

const calculateReward = (card, mcc, amount) => {
  const rate = card.rewards.categories[mcc] || card.rewards.defaultRate;
  const baseReward = (amount * rate) / 100;
  
  if (card.rewards.type === 'points' && card.rewards.pointValue) {
    return baseReward * card.rewards.pointValue;
  }
  
  return baseReward;
};

export const mockAnalytics = {
  monthlyStats: {
    totalSpent: 2847.32,
    totalRewards: 67.84,
    potentialRewards: 89.12,
    missedSavings: 21.28,
    optimizationRate: 76.1
  },
  categoryBreakdown: [
    { category: 'Restaurants', spent: 456.78, rewards: 15.23, percentage: 16.0 },
    { category: 'Grocery', spent: 543.21, rewards: 21.73, percentage: 19.1 },
    { category: 'Gas', spent: 234.56, rewards: 11.73, percentage: 8.2 },
    { category: 'Shopping', spent: 789.45, rewards: 12.45, percentage: 27.7 },
    { category: 'Other', spent: 823.32, rewards: 6.70, percentage: 28.9 }
  ],
  cardUsageStats: [
    { cardId: 'card_001', name: 'Chase Freedom', usage: 45.2, rewards: 28.34 },
    { cardId: 'card_002', name: 'AmEx Gold', usage: 32.8, rewards: 31.12 },
    { cardId: 'card_003', name: 'Citi Double Cash', usage: 22.0, rewards: 8.38 }
  ]
}; 