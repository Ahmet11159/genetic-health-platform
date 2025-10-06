import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';
import { SubscriptionService } from '../services/SubscriptionService';
import { PaymentService, PlanDetails, SubscriptionInfo } from '../services/PaymentService';

type AdvancedPremiumScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Premium'>;

interface Props {
  navigation: AdvancedPremiumScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function AdvancedPremiumScreen({ navigation }: Props) {
  // State management
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [usageStats, setUsageStats] = useState({
    dnaAnalyses: 0,
    reportsGenerated: 0,
    familyMembers: 0,
  });
  const [expandedPlans, setExpandedPlans] = useState<{ [key: string]: boolean }>({});

  // Services
  const [subscriptionService] = useState<SubscriptionService>(SubscriptionService.getInstance());
  const [paymentService] = useState<PaymentService>(PaymentService.getInstance());

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeScreen();
    startAnimations();
  }, []);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      await subscriptionService.initialize();
      await paymentService.initialize();
      
      const subscribed = await subscriptionService.isUserSubscribed();
      const info = subscriptionService.getSubscriptionInfo();
      
      setIsSubscribed(subscribed);
      setSubscriptionInfo(info);
      
      // Trial days calculation
      if (!subscribed) {
        const trialStart = await AsyncStorage.getItem('trialStartDate');
        if (trialStart) {
          const daysLeft = calculateTrialDaysLeft(trialStart);
          setTrialDaysLeft(daysLeft);
        } else {
          // Start trial
          const now = new Date().toISOString();
          await AsyncStorage.setItem('trialStartDate', now);
          setTrialDaysLeft(7); // 7 days trial
        }
      }
      
      // Load usage stats
      loadUsageStats();
      
    } catch (error) {
      console.error('Screen initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const calculateTrialDaysLeft = (trialStart: string): number => {
    const start = new Date(trialStart);
    const now = new Date();
    const diffTime = start.getTime() + (7 * 24 * 60 * 60 * 1000) - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const loadUsageStats = async () => {
    try {
      const stats = {
        dnaAnalyses: parseInt(await AsyncStorage.getItem('dnaAnalysesCount') || '0'),
        reportsGenerated: parseInt(await AsyncStorage.getItem('reportsGeneratedCount') || '0'),
        familyMembers: parseInt(await AsyncStorage.getItem('familyMembersCount') || '0'),
      };
      setUsageStats(stats);
    } catch (error) {
      console.error('Load usage stats error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeScreen();
    setRefreshing(false);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleBillingPeriodChange = (period: 'monthly' | 'yearly') => {
    setBillingPeriod(period);
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const handleSubscribe = () => {
    if (trialDaysLeft > 0) {
      Alert.alert(
        'Deneme Süreniz Devam Ediyor',
        `Hala ${trialDaysLeft} gün deneme süreniz var. Şimdi abone olmak istediğinizden emin misiniz?`,
        [
          { text: 'Devam Et', style: 'cancel' },
          { text: 'Abone Ol', onPress: () => setShowPaymentModal(true) }
        ]
      );
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async (success: boolean) => {
    setShowPaymentModal(false);
    if (success) {
      await initializeScreen();
      Alert.alert('Başarılı!', 'Aboneliğiniz başarıyla oluşturuldu!');
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Abonelik Yönetimi',
      'Aboneliğinizi yönetmek için ne yapmak istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Plan Değiştir', onPress: () => setShowPaymentModal(true) },
        { text: 'Aboneliği İptal Et', onPress: handleCancelSubscription, style: 'destructive' }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Aboneliği İptal Et',
      'Aboneliğinizi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Hayır', style: 'cancel' },
        { 
          text: 'Evet, İptal Et', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await subscriptionService.cancelSubscription();
              if (success) {
                await initializeScreen();
                Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi.');
              }
            } catch (error) {
              Alert.alert('Hata', 'Abonelik iptal edilirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const getPlanDetails = (): PlanDetails[] => {
    const plans = paymentService.getAvailablePlans();
    return billingPeriod === 'yearly' 
      ? plans.filter(plan => plan.billingCycle === 'yearly')
      : plans.filter(plan => plan.billingCycle === 'monthly');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[Theme.colors.primary[500], Theme.colors.primary[600], Theme.colors.primary[700]]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Ionicons name="diamond" size={48} color="#fff" />
        <Text style={styles.headerTitle}>Premium Özellikler</Text>
        <Text style={styles.headerSubtitle}>
          {isSubscribed ? 'Genetik analizinizi geliştirin' : 'Genetik potansiyelinizi keşfedin'}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderCurrentSubscription = () => {
    if (!isSubscribed || !subscriptionInfo) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.currentSubscriptionCard}>
        <View style={styles.currentSubscriptionHeader}>
          <Text style={styles.currentSubscriptionTitle}>Mevcut Aboneliğiniz</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: subscriptionInfo.status === 'active' ? Theme.colors.semantic.success : Theme.colors.semantic.error }
          ]}>
            <Text style={styles.statusBadgeText}>
              {subscriptionInfo.status === 'active' ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.planName}>
          {subscriptionInfo.planId === 'monthly' ? 'Aylık Abonelik' :
           subscriptionInfo.planId === 'yearly' ? 'Yıllık Abonelik' : 'Aile Aboneliği'}
        </Text>
        
        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionDetailText}>
            Başlangıç: {new Date(subscriptionInfo.startDate).toLocaleDateString('tr-TR')}
          </Text>
          <Text style={styles.subscriptionDetailText}>
            Bitiş: {new Date(subscriptionInfo.endDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        
        <ProfessionalButton
          title="Aboneliği Yönet"
          onPress={handleManageSubscription}
          variant="secondary"
          size="md"
          style={styles.manageButton}
        />
      </ProfessionalCard>
    );
  };

  const renderTrialInfo = () => {
    if (isSubscribed || trialDaysLeft <= 0) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.trialCard}>
        <View style={styles.trialHeader}>
          <Ionicons name="gift" size={24} color={Theme.colors.primary[600]} />
          <Text style={styles.trialTitle}>Ücretsiz Deneme</Text>
        </View>
        
        <Text style={styles.trialDescription}>
          {trialDaysLeft} gün ücretsiz deneme süreniz kaldı
        </Text>
        
        <View style={styles.trialProgress}>
          <View style={styles.trialProgressBar}>
            <View 
              style={[
                styles.trialProgressFill, 
                { width: `${((7 - trialDaysLeft) / 7) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.trialProgressText}>
            {7 - trialDaysLeft}/7 gün kullanıldı
          </Text>
        </View>
      </ProfessionalCard>
    );
  };

  const renderBillingPeriodSelector = () => (
    <ProfessionalCard variant="md" style={styles.billingCard}>
      <Text style={styles.sectionTitle}>Faturalandırma Dönemi</Text>
      
      <View style={styles.billingSelector}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'monthly' && styles.billingOptionSelected
          ]}
          onPress={() => handleBillingPeriodChange('monthly')}
        >
          <Text style={[
            styles.billingOptionText,
            billingPeriod === 'monthly' && styles.billingOptionTextSelected
          ]}>
            Aylık
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'yearly' && styles.billingOptionSelected
          ]}
          onPress={() => handleBillingPeriodChange('yearly')}
        >
          <View style={styles.yearlyBadge}>
            <Text style={styles.yearlyBadgeText}>%20 İndirim</Text>
          </View>
          <Text style={[
            styles.billingOptionText,
            billingPeriod === 'yearly' && styles.billingOptionTextSelected
          ]}>
            Yıllık
          </Text>
        </TouchableOpacity>
      </View>
    </ProfessionalCard>
  );

  const renderPlans = () => {
    const plans = getPlanDetails();
    
    return (
      <View style={styles.plansContainer}>
        <Text style={styles.sectionTitle}>Plan Seçin</Text>
        
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.popular && styles.planCardPopular
            ]}
            onPress={() => handlePlanSelect(plan.id)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Popüler</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.planPriceContainer}>
                <Text style={styles.planPrice}>₺{plan.price}</Text>
                <Text style={styles.planPeriod}>
                  /{plan.billingCycle === 'monthly' ? 'ay' : 'yıl'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.planDescription}>{plan.description}</Text>
            
            <View style={styles.planFeatures}>
              {plan.features.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.planFeature}>
                  <Ionicons name="checkmark" size={16} color={Theme.colors.semantic.success} />
                  <Text style={styles.planFeatureText}>{feature}</Text>
                </View>
              ))}
              
              {expandedPlans[plan.id] && plan.features.slice(4).map((feature, index) => (
                <View key={index + 4} style={styles.planFeature}>
                  <Ionicons name="checkmark" size={16} color={Theme.colors.semantic.success} />
                  <Text style={styles.planFeatureText}>{feature}</Text>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.moreFeaturesButton}
                onPress={() => togglePlanExpansion(plan.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.moreFeaturesText}>
                  {expandedPlans[plan.id] ? 'Daha az göster' : `+${plan.features.length - 4} daha fazla özellik`}
                </Text>
                <Ionicons 
                  name={expandedPlans[plan.id] ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={Theme.colors.primary[600]} 
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderUsageStats = () => {
    if (!isSubscribed) return null;

    return (
      <ProfessionalCard variant="md" style={styles.usageCard}>
        <Text style={styles.sectionTitle}>Kullanım İstatistikleri</Text>
        
        <View style={styles.usageStats}>
          <View style={styles.usageStat}>
            <Text style={styles.usageStatValue}>{usageStats.dnaAnalyses}</Text>
            <Text style={styles.usageStatLabel}>DNA Analizi</Text>
          </View>
          
          <View style={styles.usageStat}>
            <Text style={styles.usageStatValue}>{usageStats.reportsGenerated}</Text>
            <Text style={styles.usageStatLabel}>Rapor Oluşturuldu</Text>
          </View>
          
          <View style={styles.usageStat}>
            <Text style={styles.usageStatValue}>{usageStats.familyMembers}</Text>
            <Text style={styles.usageStatLabel}>Aile Üyesi</Text>
          </View>
        </View>
      </ProfessionalCard>
    );
  };

  const renderActionButton = () => {
    if (isSubscribed) {
      return (
        <ProfessionalButton
          title="Aboneliği Yönet"
          onPress={handleManageSubscription}
          variant="primary"
          size="lg"
          style={styles.actionButton}
        />
      );
    }

    return (
      <ProfessionalButton
        title={trialDaysLeft > 0 ? `Ücretsiz Denemeyi Başlat (${trialDaysLeft} gün)` : 'Premium\'a Geç'}
        onPress={handleSubscribe}
        variant="primary"
        size="lg"
        style={styles.actionButton}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {renderCurrentSubscription()}
          {renderTrialInfo()}
          {renderBillingPeriodSelector()}
          {renderPlans()}
          {renderUsageStats()}
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        {renderActionButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.secondary,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    left: Theme.spacing.lg,
    padding: Theme.spacing.sm,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    padding: Theme.spacing.lg,
  },
  currentSubscriptionCard: {
    marginBottom: Theme.spacing.lg,
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  currentSubscriptionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
  },
  planName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subscriptionDetails: {
    marginBottom: Theme.spacing.lg,
  },
  subscriptionDetailText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  manageButton: {
    alignSelf: 'flex-start',
  },
  trialCard: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[200],
    borderWidth: 1,
  },
  trialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  trialTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[700],
    marginLeft: Theme.spacing.sm,
  },
  trialDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  trialProgress: {
    marginTop: Theme.spacing.sm,
  },
  trialProgressBar: {
    height: 8,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  trialProgressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
  },
  trialProgressText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  billingCard: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  billingSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    position: 'relative',
  },
  billingOptionSelected: {
    backgroundColor: Theme.colors.primary[500],
  },
  billingOptionText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.secondary,
  },
  billingOptionTextSelected: {
    color: '#fff',
  },
  yearlyBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: Theme.colors.semantic.success,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  yearlyBadgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
  },
  plansContainer: {
    marginBottom: Theme.spacing.xl,
  },
  planCard: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  planCardPopular: {
    borderColor: Theme.colors.semantic.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.semantic.warning,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  popularBadgeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  planName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
  },
  planPeriod: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
  planDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  planFeatures: {
    marginTop: Theme.spacing.sm,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  planFeatureText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  moreFeaturesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.xs,
  },
  moreFeaturesText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  usageCard: {
    marginBottom: Theme.spacing.xl,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageStat: {
    alignItems: 'center',
  },
  usageStatValue: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
  },
  usageStatLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
  footer: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  actionButton: {
    width: '100%',
  },
});
