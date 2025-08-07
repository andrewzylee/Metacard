import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { mockAnalytics, generateMockTransactions, mockCards } from '../data/mockData';
import { CardSelectionService } from '../services/CardSelectionService';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#4A90E2',
  },
};

const AnalyticsScreen = ({ navigation }) => {
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    // Generate comprehensive transaction data for analysis
    const transactions = generateMockTransactions(100);
    setAllTransactions(transactions);
    
    // Analyze spending patterns
    const analysis = CardSelectionService.analyzeSpendingPatterns(transactions, mockCards);
    setAnalytics(prev => ({
      ...prev,
      ...analysis,
      optimizationRate: analysis.optimizationRate
    }));
  }, []);

  const getTimeRangeData = () => {
    const now = new Date();
    const filteredTransactions = allTransactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      const daysDiff = (now - txnDate) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        case 'year':
          return daysDiff <= 365;
        default:
          return true;
      }
    });

    return filteredTransactions;
  };

  const getSavingsData = () => {
    const data = getTimeRangeData();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTransactions = data.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        return txnDate.toDateString() === date.toDateString();
      });
      
      const daySavings = dayTransactions.reduce((sum, txn) => 
        sum + Math.max(0, txn.potentialReward - txn.rewardEarned), 0
      );
      
      last7Days.push(daySavings);
    }
    
    return {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      datasets: [{
        data: last7Days.length > 0 ? last7Days : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const getCategoryPieData = () => {
    return analytics.categoryBreakdown.map((category, index) => ({
      name: category.category,
      population: category.percentage,
      color: [
        '#4A90E2', '#50C878', '#FF6B6B', '#FFD93D', '#6C5CE7'
      ][index % 5],
      legendFontColor: '#1A1A1A',
      legendFontSize: 12,
    }));
  };

  const getCardUsageData = () => {
    return {
      labels: analytics.cardUsageStats.map(card => card.name.split(' ')[0]),
      datasets: [{
        data: analytics.cardUsageStats.map(card => card.usage)
      }]
    };
  };

  const OptimizationScore = ({ score }) => {
    const getScoreColor = (score) => {
      if (score >= 90) return '#4CAF50';
      if (score >= 70) return '#FF9800';
      return '#F44336';
    };

    const getScoreMessage = (score) => {
      if (score >= 90) return 'Excellent optimization!';
      if (score >= 70) return 'Good, room for improvement';
      return 'Consider using smart selection';
    };

    return (
      <View style={styles.optimizationCard}>
        <Text style={styles.optimizationTitle}>Optimization Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
            {score.toFixed(0)}%
          </Text>
          <Text style={styles.scoreMessage}>{getScoreMessage(score)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${score}%`, 
                backgroundColor: getScoreColor(score) 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const InsightCard = ({ title, value, subtitle, icon }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{icon}</Text>
        <Text style={styles.insightTitle}>{title}</Text>
      </View>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {['week', 'month', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <InsightCard
            title="Total Rewards"
            value={`$${analytics.monthlyStats.totalRewards.toFixed(2)}`}
            subtitle="This month"
            icon="💰"
          />
          <InsightCard
            title="Missed Savings"
            value={`$${analytics.monthlyStats.missedSavings.toFixed(2)}`}
            subtitle="Could have saved"
            icon="⚠️"
          />
          <InsightCard
            title="Total Spent"
            value={`$${analytics.monthlyStats.totalSpent.toLocaleString()}`}
            subtitle="This month"
            icon="💳"
          />
        </View>

        {/* Optimization Score */}
        <OptimizationScore score={analytics.optimizationRate} />

        {/* Savings Trend Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Daily Savings Potential</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={getSavingsData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withScrollableDot={true}
            />
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={getCategoryPieData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>

        {/* Card Usage */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Card Usage Distribution</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={getCardUsageData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
            />
          </View>
        </View>

        {/* Optimization Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Optimization Tips</Text>
          {analytics.optimizationOpportunities && analytics.optimizationOpportunities.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipText}>
                Use {tip.suggestedCard} for {tip.category.toLowerCase()} to earn 
                ${tip.potentialExtraRewards}/month more
              </Text>
              <Text style={styles.tipSpending}>
                Monthly spending: ${tip.monthlySpending?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detailed Statistics</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Transaction</Text>
            <Text style={styles.statValue}>
              ${(analytics.monthlyStats.totalSpent / allTransactions.length).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Best Performing Card</Text>
            <Text style={styles.statValue}>
              {analytics.cardUsageStats[0]?.name || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Most Used Category</Text>
            <Text style={styles.statValue}>
              {analytics.categoryBreakdown[0]?.category || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Optimization Potential</Text>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>
              ${(analytics.monthlyStats.potentialRewards - analytics.monthlyStats.totalRewards).toFixed(2)}/month
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 60,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  insightCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  insightTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 10,
    color: '#888',
  },
  optimizationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optimizationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chart: {
    borderRadius: 16,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
  tipSpending: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bottomPadding: {
    height: 40,
  },
});

export default AnalyticsScreen; 