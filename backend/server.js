// Metapayd MVP Backend Server
// Simple Node.js/Express server for authentication and data sync

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'metapayd_demo_secret_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple file-based data storage for MVP (in production, use proper database)
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');

// Ensure data directory exists
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize files if they don't exist
    const files = [USERS_FILE, TRANSACTIONS_FILE, CARDS_FILE];
    for (const file of files) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}

// Utility functions
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Metapayd MVP Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const users = await readJsonFile(USERS_FILE);
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      preferences: {
        primaryGoal: 'cashback',
        monthlySpendingGoal: 3000,
        alertsEnabled: true,
        autoOptimize: true
      },
      createdAt: new Date().toISOString(),
      totalSavings: 0
    };

    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userResponse } = user;
    res.json(userResponse);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user (preserve password and other sensitive fields)
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id,
      email: users[userIndex].email,
      password: users[userIndex].password,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile(USERS_FILE, users);

    const { password: _, ...userResponse } = users[userIndex];
    res.json(userResponse);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Cards routes
app.get('/api/cards', authenticateToken, async (req, res) => {
  try {
    const cards = await readJsonFile(CARDS_FILE);
    const userCards = cards.filter(card => card.userId === req.user.id);
    res.json(userCards);

  } catch (error) {
    console.error('Cards fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.post('/api/cards', authenticateToken, async (req, res) => {
  try {
    const cardData = req.body;
    const cards = await readJsonFile(CARDS_FILE);

    const newCard = {
      id: `card_${Date.now()}`,
      userId: req.user.id,
      ...cardData,
      createdAt: new Date().toISOString()
    };

    cards.push(newCard);
    await writeJsonFile(CARDS_FILE, cards);

    res.status(201).json(newCard);

  } catch (error) {
    console.error('Card creation error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Transactions routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await readJsonFile(TRANSACTIONS_FILE);
    const userTransactions = transactions.filter(txn => txn.userId === req.user.id);
    
    // Sort by timestamp (newest first)
    userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(userTransactions);

  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactionData = req.body;
    const transactions = await readJsonFile(TRANSACTIONS_FILE);

    const newTransaction = {
      id: `txn_${Date.now()}`,
      userId: req.user.id,
      ...transactionData,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    transactions.push(newTransaction);
    await writeJsonFile(TRANSACTIONS_FILE, transactions);

    res.status(201).json(newTransaction);

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Analytics routes
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const transactions = await readJsonFile(TRANSACTIONS_FILE);
    const userTransactions = transactions.filter(txn => txn.userId === req.user.id);

    // Calculate analytics
    const totalSpent = userTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const totalRewards = userTransactions.reduce((sum, txn) => sum + (txn.rewardEarned || 0), 0);
    const potentialRewards = userTransactions.reduce((sum, txn) => sum + (txn.potentialReward || 0), 0);
    const missedSavings = potentialRewards - totalRewards;
    const optimizationRate = potentialRewards > 0 ? (totalRewards / potentialRewards) * 100 : 100;

    // Category breakdown
    const categories = {};
    userTransactions.forEach(txn => {
      const category = txn.category || 'Other';
      if (!categories[category]) {
        categories[category] = { spent: 0, rewards: 0, count: 0 };
      }
      categories[category].spent += txn.amount;
      categories[category].rewards += txn.rewardEarned || 0;
      categories[category].count += 1;
    });

    res.json({
      monthlyStats: {
        totalSpent,
        totalRewards,
        potentialRewards,
        missedSavings,
        optimizationRate
      },
      categoryBreakdown: Object.entries(categories).map(([category, data]) => ({
        category,
        ...data,
        percentage: totalSpent > 0 ? (data.spent / totalSpent * 100) : 0
      })),
      transactionCount: userTransactions.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Sync routes (for browser extension)
app.post('/api/sync/browser', authenticateToken, async (req, res) => {
  try {
    const { browserData } = req.body;
    
    // In a real app, this would merge browser extension data with mobile app data
    // For MVP, we'll just acknowledge the sync
    
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex !== -1) {
      users[userIndex].lastBrowserSync = new Date().toISOString();
      users[userIndex].browserSyncData = browserData;
      await writeJsonFile(USERS_FILE, users);
    }

    res.json({
      success: true,
      message: 'Browser data synced successfully',
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Browser sync error:', error);
    res.status(500).json({ error: 'Failed to sync browser data' });
  }
});

// MCC (Merchant Category Code) lookup
app.get('/api/mcc/:code', (req, res) => {
  const mccDatabase = {
    '5411': { category: 'Grocery Stores', description: 'Supermarkets' },
    '5812': { category: 'Restaurants', description: 'Eating Places' },
    '5541': { category: 'Gas Stations', description: 'Service Stations' },
    '5691': { category: 'Clothing', description: 'Men\'s and Women\'s Clothing Stores' },
    '5732': { category: 'Electronics', description: 'Electronics Stores' },
    '5311': { category: 'Department Stores', description: 'Department Stores' },
    '4111': { category: 'Transportation', description: 'Local/Suburban Commuter Transportation' },
    '3000': { category: 'Airlines', description: 'United Airlines' },
    '7011': { category: 'Lodging', description: 'Hotels, Motels, Resorts' },
    '5999': { category: 'Miscellaneous', description: 'Miscellaneous Retail Stores' }
  };

  const mccInfo = mccDatabase[req.params.code];
  if (mccInfo) {
    res.json(mccInfo);
  } else {
    res.status(404).json({ error: 'MCC not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize and start server
async function startServer() {
  await initializeStorage();
  
  app.listen(PORT, () => {
    console.log(`🚀 Metapayd MVP Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Ready to serve mobile app and browser extension`);
  });
}

startServer().catch(console.error);

module.exports = app; 