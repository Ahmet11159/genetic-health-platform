import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { PaymentService, PlanDetails, SubscriptionInfo, PaymentMethod } from '../services/PaymentService';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type PremiumScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Premium'>;

interface Props {
  navigation: PremiumScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string; description: string }[] = [
  {
    key: 'credit_card',
    label: 'Kredi Kartı',
    icon: 'card',
    description: 'Visa, Mastercard, American Express',
  },
  {
    key: 'apple_pay',
    label: 'Apple Pay',
    icon: 'logo-apple',
    description: 'Hızlı ve güvenli ödeme',
  },
  {
    key: 'google_pay',
    label: 'Google Pay',
    icon: 'logo-google',
    description: 'Hızlı ve güvenli ödeme',
  },
  {
    key: 'paypal',
    label: 'PayPal',
    icon: 'logo-paypal',
    description: 'Güvenli online ödeme',
  },
];

export default function PremiumScreen({ navigation }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [showCouponInput, setShowCouponInput] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const paymentService = PaymentService.getInstance();
      await paymentService.initialize();
      
      const currentSub = paymentService.getCurrentSubscription();
      setCurrentSubscription(currentSub);
      
      const availablePlans = billingCycle === 'monthly' 
        ? paymentService.getAvailablePlans()
        : paymentService.getYearlyPlans();
      setPlans(availablePlans);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
    loadData(); // Planları yeniden yükle
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;

    try {
      const paymentService = PaymentService.getInstance();
      const coupon = await paymentService.validateCoupon(couponCode, selectedPlan as any);
      
      if (coupon) {
        setAppliedCoupon(coupon);
        Alert.alert('Başarılı', `Kupon uygulandı: ${coupon.description}`);
      } else {
        Alert.alert('Hata', 'Geçersiz veya süresi dolmuş kupon kodu');
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      Alert.alert('Hata', 'Kupon uygulanırken bir hata oluştu');
    }
  };

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);

      const paymentService = PaymentService.getInstance();
      const result = await paymentService.processPayment(
        selectedPlan as any,
        selectedPaymentMethod,
        undefined,
        appliedCoupon?.code
      );

      if (result.success) {
        Alert.alert(
          'Başarılı',
          'Premium aboneliğiniz başarıyla aktifleştirildi!',
          [
            {
              text: 'Tamam',
              onPress: () => {
                setCurrentSubscription(paymentService.getCurrentSubscription());
                setAppliedCoupon(null);
                setCouponCode('');
              },
            },
          ]
        );
      } else {
        Alert.alert('Hata', result.error || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Hata', 'Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      const paymentService = PaymentService.getInstance();
      const success = await paymentService.startTrial(selectedPlan as any);
      
      if (success) {
        setCurrentSubscription(paymentService.getCurrentSubscription());
      }
    } catch (error) {
      console.error('Start trial error:', error);
      Alert.alert('Hata', 'Deneme süresi başlatılırken bir hata oluştu');
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Aboneliği İptal Et',
      'Aboneliğinizi iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            const paymentService = PaymentService.getInstance();
            const success = await paymentService.cancelSubscription();
            if (success) {
              setCurrentSubscription(paymentService.getCurrentSubscription());
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[Theme.colors.primary[500], Theme.colors.primary[700]]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Premium Özellikler</Text>
            <Text style={styles.headerSubtitle}>Genetik analizinizi geliştirin</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCurrentSubscription = () => {
    if (!currentSubscription) return null;

    return (
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ProfessionalCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Mevcut Aboneliğiniz</Text>
          
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.subscriptionPlan}>
                {plans.find(p => p.id === currentSubscription.planId)?.name || currentSubscription.planId}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: currentSubscription.status === 'active' ? Theme.colors.semantic.success : Theme.colors.semantic.error }
              ]}>
                <Text style={styles.statusText}>
                  {currentSubscription.status === 'active' ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.subscriptionDate}>
              Başlangıç: {new Date(currentSubscription.startDate).toLocaleDateString('tr-TR')}
            </Text>
            <Text style={styles.subscriptionDate}>
              Bitiş: {new Date(currentSubscription.endDate).toLocaleDateString('tr-TR')}
            </Text>
            
            {currentSubscription.status === 'active' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Aboneliği İptal Et</Text>
              </TouchableOpacity>
            )}
          </View>
        </ProfessionalCard>
      </Animated.View>
    );
  };

  const renderBillingCycleToggle = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Faturalandırma Dönemi</Text>
        
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => handleBillingCycleChange('monthly')}
          >
            <Text style={[
              styles.toggleText,
              billingCycle === 'monthly' && styles.toggleTextActive,
            ]}>
              Aylık
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'yearly' && styles.toggleButtonActive,
            ]}
            onPress={() => handleBillingCycleChange('yearly')}
          >
            <Text style={[
              styles.toggleText,
              billingCycle === 'yearly' && styles.toggleTextActive,
            ]}>
              Yıllık
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>%20 İndirim</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderPlans = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Plan Seçin</Text>
        
        <View style={styles.plansContainer}>
          {plans.filter(plan => plan.id !== 'free').map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
                plan.popular && styles.planCardPopular,
              ]}
              onPress={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popüler</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPrice}>
                  <Text style={styles.planPriceAmount}>
                    ₺{plan.price}
                  </Text>
                  <Text style={styles.planPricePeriod}>
                    /{plan.billingCycle === 'monthly' ? 'ay' : 'yıl'}
                  </Text>
                </View>
                {plan.originalPrice && plan.originalPrice > plan.price && (
                  <Text style={styles.planOriginalPrice}>
                    ₺{plan.originalPrice}
                  </Text>
                )}
              </View>
              
              <Text style={styles.planDescription}>{plan.description}</Text>
              
              <View style={styles.planFeatures}>
                {plan.features.slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color={Theme.colors.semantic.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {plan.features.length > 4 && (
                  <Text style={styles.moreFeaturesText}>
                    +{plan.features.length - 4} daha fazla özellik
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderPaymentMethod = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
        
        <View style={styles.paymentMethodsGrid}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.paymentMethodButton,
                selectedPaymentMethod === method.key && styles.paymentMethodButtonActive,
              ]}
              onPress={() => setSelectedPaymentMethod(method.key)}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={selectedPaymentMethod === method.key ? 'white' : Theme.colors.primary[500]}
              />
              <Text style={[
                styles.paymentMethodLabel,
                selectedPaymentMethod === method.key && styles.paymentMethodLabelActive,
              ]}>
                {method.label}
              </Text>
              <Text style={[
                styles.paymentMethodDescription,
                selectedPaymentMethod === method.key && styles.paymentMethodDescriptionActive,
              ]}>
                {method.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderCouponSection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <View style={styles.couponHeader}>
          <Text style={styles.sectionTitle}>Kupon Kodu</Text>
          <TouchableOpacity
            style={styles.couponToggle}
            onPress={() => setShowCouponInput(!showCouponInput)}
          >
            <Text style={styles.couponToggleText}>
              {showCouponInput ? 'Gizle' : 'Kupon Var'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showCouponInput && (
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Kupon kodunu girin"
              placeholderTextColor={Theme.colors.neutral[500]}
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity
              style={styles.couponApplyButton}
              onPress={handleCouponApply}
            >
              <Text style={styles.couponApplyText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {appliedCoupon && (
          <View style={styles.appliedCoupon}>
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.semantic.success} />
            <Text style={styles.appliedCouponText}>
              {appliedCoupon.description} uygulandı
            </Text>
          </View>
        )}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderPurchaseButton = () => {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    if (!selectedPlanData) return null;

    const finalPrice = appliedCoupon 
      ? (selectedPlanData.price * (100 - appliedCoupon.discountValue) / 100)
      : selectedPlanData.price;

    return (
      <Animated.View 
        style={[
          styles.purchaseSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ProfessionalCard variant="elevated" style={styles.purchaseCard}>
          <View style={styles.purchaseSummary}>
            <Text style={styles.purchaseTitle}>Ödeme Özeti</Text>
            <View style={styles.purchaseDetails}>
              <Text style={styles.purchaseItem}>
                {selectedPlanData.name} Planı
              </Text>
              <Text style={styles.purchasePrice}>
                ₺{selectedPlanData.price}
              </Text>
            </View>
            {appliedCoupon && (
              <View style={styles.purchaseDetails}>
                <Text style={styles.purchaseItem}>
                  İndirim ({appliedCoupon.discountValue}%)
                </Text>
                <Text style={styles.purchaseDiscount}>
                  -₺{selectedPlanData.price - finalPrice}
                </Text>
              </View>
            )}
            <View style={[styles.purchaseDetails, styles.purchaseTotal]}>
              <Text style={styles.purchaseTotalText}>Toplam</Text>
              <Text style={styles.purchaseTotalPrice}>₺{finalPrice.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.purchaseButtons}>
            <ProfessionalButton
              title="7 Günlük Deneme Başlat"
              variant="outline"
              onPress={handleStartTrial}
              style={styles.trialButton}
            />
            <ProfessionalButton
              title={`₺${finalPrice.toFixed(2)} - Satın Al`}
              variant="gradient"
              gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
              onPress={handlePurchase}
              loading={isProcessing}
              style={styles.purchaseButton}
            />
          </View>
        </ProfessionalCard>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentSubscription()}
        {renderBillingCycleToggle()}
        {renderPlans()}
        {renderPaymentMethod()}
        {renderCouponSection()}
        {renderPurchaseButton()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  headerGradient: {
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Theme.spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  card: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  subscriptionInfo: {
    gap: Theme.spacing.sm,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionPlan: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  subscriptionDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.semantic.error,
    borderRadius: Theme.borderRadius.sm,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    position: 'relative',
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary[500],
  },
  toggleText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
  },
  toggleTextActive: {
    color: 'white',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Theme.colors.semantic.success,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  savingsText: {
    fontSize: Theme.typography.fontSize.xs,
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  plansContainer: {
    gap: Theme.spacing.md,
  },
  planCard: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    position: 'relative',
  },
  planCardActive: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  planCardPopular: {
    borderColor: Theme.colors.accent.amber,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.accent.amber,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  popularText: {
    fontSize: Theme.typography.fontSize.xs,
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  planHeader: {
    marginBottom: Theme.spacing.sm,
  },
  planName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPriceAmount: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[500],
  },
  planPricePeriod: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
  planOriginalPrice: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginTop: Theme.spacing.xs,
  },
  planDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
  },
  planFeatures: {
    gap: Theme.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  featureText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  moreFeaturesText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontStyle: 'italic',
    marginTop: Theme.spacing.xs,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  paymentMethodButton: {
    width: (width - Theme.spacing.lg * 2 - Theme.spacing.sm) / 2,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  paymentMethodLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.xs,
  },
  paymentMethodLabelActive: {
    color: 'white',
  },
  paymentMethodDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  paymentMethodDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  couponToggle: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[100],
    borderRadius: Theme.borderRadius.sm,
  },
  couponToggleText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  couponApplyButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.lg,
  },
  couponApplyText: {
    color: 'white',
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.semantic.success + '20',
    borderRadius: Theme.borderRadius.lg,
  },
  appliedCouponText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.semantic.success,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  purchaseSection: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing['4xl'],
  },
  purchaseCard: {
    padding: Theme.spacing.lg,
  },
  purchaseSummary: {
    marginBottom: Theme.spacing.lg,
  },
  purchaseTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  purchaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  purchaseItem: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  purchasePrice: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  purchaseDiscount: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.semantic.success,
  },
  purchaseTotal: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
  },
  purchaseTotalText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },
  purchaseTotalPrice: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[500],
  },
  purchaseButtons: {
    gap: Theme.spacing.md,
  },
  trialButton: {
    marginBottom: Theme.spacing.sm,
  },
  purchaseButton: {
    // Styles are handled by ProfessionalButton
  },
});
