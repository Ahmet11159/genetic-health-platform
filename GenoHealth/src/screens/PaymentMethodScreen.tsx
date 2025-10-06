import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

import Theme from '../constants/Theme';
import ProfessionalButton from '../components/ProfessionalButton';

type PaymentMethodScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentMethod'>;

interface Props {
  navigation: PaymentMethodScreenNavigationProp;
  visible: boolean;
  onClose: () => void;
  onPaymentMethodSelected: (method: string) => void;
  selectedPlan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

const { width, height } = Dimensions.get('window');

export default function PaymentMethodScreen({ 
  navigation, 
  visible, 
  onClose, 
  onPaymentMethodSelected,
  selectedPlan 
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
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

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleCouponApply = () => {
    if (!couponCode.trim()) {
      Alert.alert('Hata', 'Lütfen kupon kodunu girin');
      return;
    }

    // Kupon simülasyonu
    const validCoupons = ['WELCOME20', 'FAMILY50', 'YEARLY100'];
    const discountRates = { 'WELCOME20': 20, 'FAMILY50': 50, 'YEARLY100': 100 };
    
    if (validCoupons.includes(couponCode.toUpperCase())) {
      const discount = discountRates[couponCode.toUpperCase() as keyof typeof discountRates];
      setCouponDiscount(discount);
      setCouponApplied(true);
      Alert.alert('Başarılı!', `%${discount} indirim uygulandı!`);
    } else {
      Alert.alert('Hata', 'Geçersiz kupon kodu');
    }
  };

  const handleContinue = () => {
    onPaymentMethodSelected(selectedMethod);
    handleClose();
  };

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Kredi Kartı',
      description: 'Visa, Mastercard, American Express',
      icon: 'card-outline',
      color: Theme.colors.primary[500],
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Hızlı ve güvenli ödeme',
      icon: 'logo-apple',
      color: '#000000',
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      description: 'Hızlı ve güvenli ödeme',
      icon: 'logo-google',
      color: '#4285F4',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Güvenli online ödeme',
      icon: 'logo-paypal',
      color: '#0070BA',
    },
  ];

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    const discount = couponApplied ? (selectedPlan.price * couponDiscount) / 100 : 0;
    return selectedPlan.price - discount;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView
          intensity={20}
          tint="dark"
          style={styles.blurContainer}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={[Theme.colors.primary[500], Theme.colors.primary[600]]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Ionicons name="card" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Ödeme Yöntemi</Text>
                <Text style={styles.headerSubtitle}>Güvenli ödeme seçenekleri</Text>
              </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
              {/* Plan Info */}
              {selectedPlan && (
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{selectedPlan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      {selectedPlan.price} {selectedPlan.currency}
                    </Text>
                    {couponApplied && (
                      <Text style={styles.discountedPrice}>
                        {calculateTotal()} {selectedPlan.currency}
                      </Text>
                    )}
                  </View>
                  {couponApplied && (
                    <Text style={styles.discountText}>
                      %{couponDiscount} indirim uygulandı!
                    </Text>
                  )}
                </View>
              )}

              {/* Payment Methods */}
              <View style={styles.paymentMethodsContainer}>
                <Text style={styles.sectionTitle}>Ödeme Yöntemi Seçin</Text>
                
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodCard,
                      selectedMethod === method.id && styles.selectedPaymentMethod,
                    ]}
                    onPress={() => handleMethodSelect(method.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.paymentMethodContent}>
                      <View style={[
                        styles.paymentMethodIcon,
                        { backgroundColor: method.color + '20' }
                      ]}>
                        <Ionicons 
                          name={method.icon as any} 
                          size={24} 
                          color={method.color} 
                        />
                      </View>
                      
                      <View style={styles.paymentMethodInfo}>
                        <Text style={[
                          styles.paymentMethodName,
                          selectedMethod === method.id && styles.selectedPaymentMethodName
                        ]}>
                          {method.name}
                        </Text>
                        <Text style={styles.paymentMethodDescription}>
                          {method.description}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.radioButton,
                        selectedMethod === method.id && styles.selectedRadioButton
                      ]}>
                        {selectedMethod === method.id && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Coupon Section */}
              <View style={styles.couponContainer}>
                <Text style={styles.sectionTitle}>Kupon Kodu</Text>
                <View style={styles.couponInputContainer}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Kupon kodunu girin"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    placeholderTextColor={Theme.colors.text.tertiary}
                  />
                  <TouchableOpacity
                    style={[
                      styles.couponButton,
                      couponApplied && styles.couponButtonApplied
                    ]}
                    onPress={handleCouponApply}
                    disabled={couponApplied}
                  >
                    <Text style={[
                      styles.couponButtonText,
                      couponApplied && styles.couponButtonTextApplied
                    ]}>
                      {couponApplied ? 'Uygulandı' : 'Uygula'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {couponApplied && (
                  <View style={styles.couponSuccess}>
                    <Ionicons name="checkmark-circle" size={16} color={Theme.colors.semantic.success} />
                    <Text style={styles.couponSuccessText}>
                      %{couponDiscount} indirim uygulandı!
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ProfessionalButton
                title={`${calculateTotal()} ${selectedPlan?.currency} ile Devam Et`}
                onPress={handleContinue}
                variant="primary"
                size="lg"
                style={styles.continueButton}
              />
              
              <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.95,
    maxHeight: height * 0.85,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
  },
  header: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    padding: Theme.spacing.sm,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: '700' as const,
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
    padding: Theme.spacing.xl,
  },
  planInfo: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  planName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: '700' as const,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  originalPrice: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: '700' as const,
    color: Theme.colors.primary[600],
  },
  discountedPrice: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: '700' as const,
    color: Theme.colors.semantic.success,
  },
  discountText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.semantic.success,
    fontWeight: '600' as const,
    marginTop: Theme.spacing.xs,
  },
  paymentMethodsContainer: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: '700' as const,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  paymentMethodCard: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
  },
  selectedPaymentMethod: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  selectedPaymentMethodName: {
    color: Theme.colors.primary[700],
  },
  paymentMethodDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  couponContainer: {
    marginBottom: Theme.spacing.xl,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  couponButton: {
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponButtonApplied: {
    backgroundColor: Theme.colors.semantic.success,
  },
  couponButtonText: {
    color: '#fff',
    fontSize: Theme.typography.fontSize.base,
    fontWeight: '600' as const,
  },
  couponButtonTextApplied: {
    color: '#fff',
  },
  couponSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  couponSuccessText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.semantic.success,
    fontWeight: '600' as const,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingTop: 0,
  },
  continueButton: {
    marginBottom: Theme.spacing.lg,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Theme.spacing.sm,
  },
  cancelText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
});
