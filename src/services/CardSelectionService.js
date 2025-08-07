// Card Selection Algorithm for Metapayd MVP
// Simple rule-based system for optimal card selection

import { mccDatabase } from '../data/mockData';

export class CardSelectionService {
  
  /**
   * Main function to select optimal card for a transaction
   * @param {Array} userCards - User's available cards
   * @param {string} merchantMCC - Merchant Category Code
   * @param {number} amount - Transaction amount
   * @param {Object} userPreferences - User goals and preferences
   * @returns {Object} Optimal card selection result
   */
  static selectOptimalCard(userCards, merchantMCC, amount, userPreferences = {}) {
    const activeCards = userCards.filter(card => card.isActive);
    
    if (activeCards.length === 0) {
      return { error: 'No active cards available' };
    }

    // Calculate reward potential for each card
    const cardScores = activeCards.map(card => {
      const rewardAmount = this.calculateRewardAmount(card, merchantMCC, amount);
      const effectiveRate = this.getEffectiveRewardRate(card, merchantMCC);
      
      return {
        card,
        rewardAmount,
        effectiveRate,
        score: this.calculateCardScore(card, merchantMCC, amount, userPreferences)
      };
    });

    // Sort by score (highest first)
    cardScores.sort((a, b) => b.score - a.score);
    
    const optimalCard = cardScores[0];
    const alternativeCard = cardScores[1] || null;

    return {
      recommendedCard: optimalCard.card,
      expectedReward: optimalCard.rewardAmount,
      rewardRate: optimalCard.effectiveRate,
      alternative: alternativeCard ? {
        card: alternativeCard.card,
        reward: alternativeCard.rewardAmount,
        rate: alternativeCard.effectiveRate
      } : null,
      reasoning: this.generateRecommendationReasoning(
        optimalCard, 
        merchantMCC, 
        amount, 
        userPreferences
      ),
      merchantCategory: mccDatabase[merchantMCC]?.category || 'Unknown',
      potentialSavings: alternativeCard ? 
        optimalCard.rewardAmount - alternativeCard.rewardAmount : 0
    };
  }

  /**
   * Calculate reward amount for a specific card and transaction
   */
  static calculateRewardAmount(card, mcc, amount) {
    const rate = this.getEffectiveRewardRate(card, mcc);
    let baseReward = (amount * rate) / 100;

    // Convert points to cash equivalent if applicable
    if (card.rewards.type === 'points' && card.rewards.pointValue) {
      baseReward = baseReward * card.rewards.pointValue;
    }

    return Math.round(baseReward * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get effective reward rate for a card at specific MCC
   */
  static getEffectiveRewardRate(card, mcc) {
    // Check for category-specific rates
    if (card.rewards.categories && card.rewards.categories[mcc]) {
      return card.rewards.categories[mcc];
    }

    // Fall back to default rate
    return card.rewards.defaultRate || 1.0;
  }

  /**
   * Calculate comprehensive score for card selection
   */
  static calculateCardScore(card, mcc, amount, userPreferences) {
    let score = 0;
    
    // Base reward score (primary factor)
    const rewardAmount = this.calculateRewardAmount(card, mcc, amount);
    score += rewardAmount * 10; // Weight rewards heavily

    // Annual fee consideration
    const monthlyFeeImpact = (card.annualFee || 0) / 12;
    score -= monthlyFeeImpact * 0.5; // Reduce score for fees

    // Credit utilization consideration
    const utilizationRatio = card.balance / card.creditLimit;
    if (utilizationRatio > 0.3) {
      score -= 5; // Penalize high utilization
    }
    if (utilizationRatio > 0.8) {
      score -= 15; // Heavy penalty for very high utilization
    }

    // User preference alignment
    if (userPreferences.primaryGoal) {
      score += this.getPreferenceBonus(card, userPreferences.primaryGoal);
    }

    // Network acceptance bonus (Visa/MC slightly preferred for acceptance)
    if (card.network === 'Visa' || card.network === 'Mastercard') {
      score += 1;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Apply bonus based on user preferences
   */
  static getPreferenceBonus(card, primaryGoal) {
    switch (primaryGoal) {
      case 'cashback':
        return card.rewards.type === 'cashback' ? 5 : 0;
      case 'travel':
        return card.rewards.type === 'points' ? 5 : 0;
      case 'debt_payoff':
        // Prefer cards with lower utilization
        const utilization = card.balance / card.creditLimit;
        return utilization < 0.3 ? 3 : -2;
      default:
        return 0;
    }
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  static generateRecommendationReasoning(optimalSelection, mcc, amount, userPreferences) {
    const card = optimalSelection.card;
    const category = mccDatabase[mcc]?.category || 'this merchant';
    const rate = optimalSelection.effectiveRate;
    
    let reasoning = [];

    // Primary reason
    if (card.rewards.categories && card.rewards.categories[mcc]) {
      reasoning.push(`Earns ${rate}% rewards on ${category.toLowerCase()}`);
    } else {
      reasoning.push(`Best available rate of ${rate}% for this purchase`);
    }

    // Additional factors
    if (card.annualFee === 0) {
      reasoning.push("No annual fee");
    }

    const utilization = card.balance / card.creditLimit;
    if (utilization < 0.3) {
      reasoning.push("Good credit utilization");
    }

    // User goal alignment
    if (userPreferences.primaryGoal === 'cashback' && card.rewards.type === 'cashback') {
      reasoning.push("Aligns with your cashback goal");
    } else if (userPreferences.primaryGoal === 'travel' && card.rewards.type === 'points') {
      reasoning.push("Aligns with your travel goal");
    }

    return reasoning.join(" • ");
  }

  /**
   * Analyze transaction history to provide insights
   */
  static analyzeSpendingPatterns(transactions, cards) {
    const analysis = {
      totalSpent: 0,
      totalRewards: 0,
      potentialRewards: 0,
      missedSavings: 0,
      categoryBreakdown: {},
      optimizationOpportunities: []
    };

    transactions.forEach(txn => {
      analysis.totalSpent += txn.amount;
      analysis.totalRewards += txn.rewardEarned;
      analysis.potentialRewards += txn.potentialReward;
      analysis.missedSavings += Math.max(0, txn.potentialReward - txn.rewardEarned);

      // Category breakdown
      const category = mccDatabase[txn.mcc]?.category || 'Other';
      if (!analysis.categoryBreakdown[category]) {
        analysis.categoryBreakdown[category] = {
          spent: 0,
          rewards: 0,
          transactions: 0
        };
      }
      analysis.categoryBreakdown[category].spent += txn.amount;
      analysis.categoryBreakdown[category].rewards += txn.rewardEarned;
      analysis.categoryBreakdown[category].transactions += 1;
    });

    // Calculate optimization rate
    analysis.optimizationRate = analysis.potentialRewards > 0 ? 
      (analysis.totalRewards / analysis.potentialRewards) * 100 : 100;

    // Generate optimization opportunities
    analysis.optimizationOpportunities = this.generateOptimizationTips(
      analysis.categoryBreakdown, 
      cards
    );

    return analysis;
  }

  /**
   * Generate personalized optimization tips
   */
  static generateOptimizationTips(categoryBreakdown, cards) {
    const tips = [];
    
    // Find top spending categories
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].spent - a[1].spent)
      .slice(0, 3);

    sortedCategories.forEach(([category, data]) => {
      if (data.spent > 100) { // Only suggest for significant spending
        const bestCard = this.findBestCardForCategory(category, cards);
        if (bestCard) {
          tips.push({
            category,
            monthlySpending: data.spent,
            suggestedCard: bestCard.name,
            potentialExtraRewards: this.calculatePotentialExtraRewards(
              data.spent, 
              bestCard, 
              category
            )
          });
        }
      }
    });

    return tips;
  }

  /**
   * Find best card for a spending category
   */
  static findBestCardForCategory(category, cards) {
    // Map category back to common MCCs
    const categoryMCCMap = {
      'Restaurants': '5812',
      'Grocery Stores': '5411', 
      'Gas Stations': '5541',
      'Electronics': '5732',
      'Department Stores': '5311'
    };

    const mcc = categoryMCCMap[category];
    if (!mcc) return null;

    let bestCard = null;
    let bestRate = 0;

    cards.forEach(card => {
      const rate = this.getEffectiveRewardRate(card, mcc);
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = card;
      }
    });

    return bestCard;
  }

  /**
   * Calculate potential extra rewards for optimization tip
   */
  static calculatePotentialExtraRewards(monthlySpending, bestCard, category) {
    const mcc = {
      'Restaurants': '5812',
      'Grocery Stores': '5411',
      'Gas Stations': '5541'
    }[category] || '5999';

    const bestRate = this.getEffectiveRewardRate(bestCard, mcc);
    const averageRate = 1.5; // Assume user currently earns 1.5% average
    
    const extraRewards = (monthlySpending * (bestRate - averageRate)) / 100;
    return Math.max(0, Math.round(extraRewards * 100) / 100);
  }
} 