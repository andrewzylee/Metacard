import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { mockCards, mockMerchants, mccDatabase } from '../data/mockData';
import { CardSelectionService } from '../services/CardSelectionService';

const { width, height } = Dimensions.get('window');

const NFCPayScreen = ({ navigation }) => {
  const [nfcStatus, setNfcStatus] = useState('disabled'); // 'disabled', 'ready', 'scanning', 'processing'
  const [selectedCard, setSelectedCard] = useState(null);
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initNFC();
    return () => {
      cleanupNFC();
    };
  }, []);

  const initNFC = async () => {
    try {
      // Initialize NFC Manager
      const supported = await NfcManager.isSupported();
      if (!supported) {
        Alert.alert('NFC Not Supported', 'This device does not support NFC functionality.');
        return;
      }

      await NfcManager.start();
      const enabled = await NfcManager.isEnabled();
      
      if (enabled) {
        setNfcStatus('ready');
        // Auto-select optimal card for demo
        autoSelectCard();
      } else {
        Alert.alert(
          'NFC Disabled', 
          'Please enable NFC in your device settings to use tap-to-pay.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => NfcManager.goToNfcSetting() }
          ]
        );
      }
    } catch (error) {
      console.error('NFC initialization error:', error);
      setNfcStatus('disabled');
    }
  };

  const cleanupNFC = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      await NfcManager.stop();
    } catch (error) {
      console.error('NFC cleanup error:', error);
    }
  };

  const autoSelectCard = () => {
    // Demo: Simulate detecting a restaurant terminal
    const demoMerchant = mockMerchants.find(m => m.mcc === '5812'); // Restaurant
    
    if (demoMerchant) {
      const selection = CardSelectionService.selectOptimalCard(
        mockCards,
        demoMerchant.mcc,
        35.50, // Demo amount
        { primaryGoal: 'cashback' }
      );
      
      setSelectedCard(selection.recommendedCard);
      setMerchantInfo({
        ...demoMerchant,
        amount: 35.50,
        category: selection.merchantCategory,
        expectedReward: selection.expectedReward
      });
    }
  };

  const startNFCPayment = async () => {
    if (!selectedCard) {
      Alert.alert('No Card Selected', 'Please select a card for payment.');
      return;
    }

    setNfcStatus('scanning');
    startPulseAnimation();

    try {
      // For demo purposes, we'll simulate the NFC interaction
      // In a real implementation, this would involve:
      // 1. Setting up Host Card Emulation (HCE)
      // 2. Listening for NFC field detection
      // 3. Exchanging APDU commands with the terminal
      // 4. Processing the payment through the selected card

      // Simulate NFC interaction delay
      setTimeout(() => {
        simulatePaymentProcess();
      }, 3000);

    } catch (error) {
      console.error('NFC payment error:', error);
      setNfcStatus('ready');
      stopPulseAnimation();
      Alert.alert('Payment Failed', 'Failed to process NFC payment. Please try again.');
    }
  };

  const simulatePaymentProcess = () => {
    setNfcStatus('processing');
    stopPulseAnimation();
    startRotateAnimation();

    // Simulate payment processing
    setTimeout(() => {
      setNfcStatus('ready');
      stopRotateAnimation();
      
      Alert.alert(
        '✅ Payment Successful!',
        `Charged $${merchantInfo?.amount.toFixed(2)} to ${selectedCard.name}\n\n` +
        `Merchant: ${merchantInfo?.name}\n` +
        `Rewards Earned: $${merchantInfo?.expectedReward.toFixed(2)}\n\n` +
        `🎯 Optimal card selected automatically!`,
        [
          { text: 'View Receipt', onPress: () => navigation.navigate('TransactionDetails') },
          { text: 'Done', style: 'default' }
        ]
      );
    }, 2000);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotateAnimation = () => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  };

  const handleCardSelection = () => {
    Alert.alert(
      'Select Payment Card',
      'Choose which card to use for this transaction:',
      [
        ...mockCards.map(card => ({
          text: `${card.name} (${card.lastFour})`,
          onPress: () => {
            setSelectedCard(card);
            // Recalculate merchant info with new card
            if (merchantInfo) {
              const reward = CardSelectionService.calculateRewardAmount(
                card, 
                merchantInfo.mcc || '5999', 
                merchantInfo.amount
              );
              setMerchantInfo(prev => ({ ...prev, expectedReward: reward }));
            }
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getStatusText = () => {
    switch (nfcStatus) {
      case 'disabled':
        return 'NFC is disabled';
      case 'ready':
        return 'Ready to pay';
      case 'scanning':
        return 'Hold near payment terminal';
      case 'processing':
        return 'Processing payment...';
      default:
        return 'Initializing...';
    }
  };

  const getStatusColor = () => {
    switch (nfcStatus) {
      case 'disabled':
        return '#FF5722';
      case 'ready':
        return '#4CAF50';
      case 'scanning':
        return '#2196F3';
      case 'processing':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tap to Pay</Text>
        <View style={styles.placeholder} />
      </View>

      {/* NFC Animation Circle */}
      <View style={styles.nfcContainer}>
        <Animated.View
          style={[
            styles.nfcCircle,
            {
              backgroundColor: getStatusColor(),
              transform: [
                { scale: nfcStatus === 'scanning' ? pulseAnim : 1 },
                { rotate: nfcStatus === 'processing' ? spin : '0deg' }
              ],
            },
          ]}
        >
          <Text style={styles.nfcIcon}>
            {nfcStatus === 'processing' ? '⚡' : '📱'}
          </Text>
        </Animated.View>
        
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* Selected Card Display */}
      {selectedCard && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Selected Card</Text>
          <View style={[styles.selectedCard, { backgroundColor: selectedCard.color }]}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{selectedCard.name}</Text>
              <Text style={styles.cardNumber}>•••• {selectedCard.lastFour}</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={handleCardSelection}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Merchant Info */}
      {merchantInfo && (
        <View style={styles.merchantSection}>
          <Text style={styles.sectionTitle}>Transaction Preview</Text>
          <View style={styles.merchantCard}>
            <View style={styles.merchantHeader}>
              <Text style={styles.merchantIcon}>{merchantInfo.logo}</Text>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{merchantInfo.name}</Text>
                <Text style={styles.merchantCategory}>{merchantInfo.category}</Text>
              </View>
              <Text style={styles.merchantAmount}>${merchantInfo.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardText}>
                💰 Expected reward: ${merchantInfo.expectedReward.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor: nfcStatus === 'ready' ? '#4CAF50' : '#CCCCCC',
            },
          ]}
          onPress={startNFCPayment}
          disabled={nfcStatus !== 'ready'}
        >
          <Text style={styles.payButtonText}>
            {nfcStatus === 'ready' ? 'Start NFC Payment' : 'Please Wait...'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>
          📝 This is a demo. In production, this would use Android's Host Card Emulation (HCE) 
          to securely communicate with payment terminals.
        </Text>
      </View>
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
  nfcContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  nfcCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nfcIcon: {
    fontSize: 64,
    color: 'white',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  selectedCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  changeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  merchantSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  merchantCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  merchantCategory: {
    fontSize: 14,
    color: '#666',
  },
  merchantAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  rewardInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  payButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoNotice: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  demoText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 16,
  },
});

export default NFCPayScreen; 