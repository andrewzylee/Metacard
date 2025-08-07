import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import { mockCards, mockTransactions, mockUser, generateMockTransactions } from '../data/mockData';
import { CardSelectionService } from '../services/CardSelectionService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(mockUser);
  const [cards, setCards] = useState(mockCards);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    // Load recent transactions
    const transactions = generateMockTransactions(20).slice(0, 5);
    setRecentTransactions(transactions);
    
    // Calculate total savings
    const savings = transactions.reduce((sum, txn) => sum + Math.max(0, txn.savings), 0);
    setTotalSavings(savings);
  }, []);

  const handleQuickPay = () => {
    navigation.navigate('NFCPay');
  };

  const handleCardSelection = () => {
    // Demo: Select optimal card for restaurant purchase
    const result = CardSelectionService.selectOptimalCard(
      cards,
      '5812', // Restaurant MCC
      45.67,
      user.preferences
    );
    
    Alert.alert(
      '🎯 AI-Powered Optimization',
      `For restaurants, I recommend your ${result.recommendedCard.name}\n\n` +
      `Expected reward: $${result.expectedReward.toFixed(2)} (${result.rewardRate}%)\n\n` +
      `${result.reasoning}`,
      [{ text: 'Perfect!', style: 'default' }]
    );
  };

  const renderCard = (card, index) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.cardContainer, { backgroundColor: card.color }]}
      onPress={() => navigation.navigate('CardDetails', { cardId: card.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardNetwork}>{card.network}</Text>
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardBalance}>${card.balance.toLocaleString()}</Text>
        <View style={styles.rewardsBadge}>
          <Text style={styles.cardRewards}>
            {card.rewards.type === 'cashback' ? 'Cashback' : 'Points'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransaction = (transaction) => {
    const merchant = transaction.merchantName;
    const amount = transaction.amount;
    const savings = transaction.savings;
    const isOptimal = savings >= 0;

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionItem}
        onPress={() => navigation.navigate('TransactionDetails', { transactionId: transaction.id })}
      >
        <View style={styles.transactionLeft}>
          <Text style={styles.merchantName}>{merchant}</Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>-${amount.toFixed(2)}</Text>
          <View style={[
            styles.savingsIndicator,
            { backgroundColor: isOptimal ? '#4A90E2' : '#FF6B35' }
          ]}>
            <Text style={styles.savingsText}>
              {isOptimal ? `+$${savings.toFixed(2)}` : `Missed $${Math.abs(savings).toFixed(2)}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileInitial}>{user.name.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        {/* AI Optimization Summary */}
        <View style={styles.aiSummary}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>⚡</Text>
            <Text style={styles.aiTitle}>AI Optimization Active</Text>
          </View>
          <Text style={styles.aiDescription}>
            Your smart wallet automatically optimized {mockTransactions.filter(t => t.savings >= 0).length} transactions this month
          </Text>
        </View>

        {/* Savings Summary */}
        <View style={styles.savingsSummary}>
          <View style={styles.savingsCard}>
            <Text style={styles.savingsTitle}>Total Rewards Optimized</Text>
            <Text style={styles.savingsAmount}>${user.totalSavings.toFixed(2)}</Text>
            <Text style={styles.savingsSubtext}>
              🎯 {((mockTransactions.filter(t => t.savings >= 0).length / mockTransactions.length) * 100).toFixed(0)}% optimal card selections
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleQuickPay}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>Smart Pay</Text>
            <Text style={styles.actionSubtext}>NFC Tap-to-Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCardSelection}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionText}>AI Select</Text>
            <Text style={styles.actionSubtext}>Best Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
            <Text style={styles.actionSubtext}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {cards.map((card, index) => renderCard(card, index))}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map(renderTransaction)}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsIcon}>🤖</Text>
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>
            <Text style={styles.insightsText}>
              Use your AmEx Gold for restaurants to maximize rewards. I've detected you could earn an extra $12.50/month with optimal selections.
            </Text>
            <TouchableOpacity style={styles.insightsButton}>
              <Text style={styles.insightsButtonText}>Optimize Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark theme
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiSummary: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  aiDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  savingsSummary: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  savingsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  savingsTitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2', // Blue accent
    marginBottom: 8,
  },
  savingsSubtext: {
    fontSize: 14,
    color: '#999999',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width * 0.75,
    height: 180,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardNetwork: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBalance: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardRewards: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  transactionLeft: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  savingsIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  insightsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  insightsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightsButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  insightsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeScreen; 