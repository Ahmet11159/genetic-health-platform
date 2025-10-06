/**
 * Premium Ödeme Servisi
 * Güvenli ödeme işlemleri ve abonelik yönetimi
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Abonelik planları
export type SubscriptionPlan = 'monthly' | 'yearly' | 'family';

// Ödeme durumları
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

// Ödeme yöntemleri
export type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'paypal' | 'bank_transfer';

// Abonelik durumları
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'paused' | 'trial';

// Plan detayları
export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  limitations: {
    maxFamilyMembers?: number;
    maxReports?: number;
    maxDNAAnalyses?: number;
    advancedAnalytics?: boolean;
    prioritySupport?: boolean;
    customReports?: boolean;
    apiAccess?: boolean;
  };
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
}

// Ödeme bilgileri
export interface PaymentInfo {
  id: string;
  userId: string;
  planId: SubscriptionPlan;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: string;
  expiryDate?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cardInfo?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

// Abonelik bilgileri
export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  nextBillingDate?: string;
  paymentInfo: PaymentInfo;
  features: string[];
  usage: {
    familyMembers: number;
    reportsGenerated: number;
    dnaAnalyses: number;
    lastAnalysisDate?: string;
  };
}

// Fatura bilgileri
export interface InvoiceInfo {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  downloadUrl?: string;
}

// Ödeme sonucu
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  subscriptionId?: string;
  error?: string;
  message?: string;
}

// Kupon bilgileri
export interface CouponInfo {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  applicablePlans: SubscriptionPlan[];
}

export class PaymentService {
  private static instance: PaymentService;
  private isInitialized = false;
  private currentSubscription: SubscriptionInfo | null = null;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Mevcut aboneliği yükle
      await this.loadCurrentSubscription();

      this.isInitialized = true;
      console.log('Payment Service initialized!');
      return true;
    } catch (error) {
      console.error('Payment service initialization error:', error);
      return false;
    }
  }

  /**
   * Mevcut aboneliği yükler
   */
  private async loadCurrentSubscription(): Promise<void> {
    try {
      const subscription = await AsyncStorage.getItem('currentSubscription');
      if (subscription) {
        this.currentSubscription = JSON.parse(subscription);
      }
    } catch (error) {
      console.error('Load subscription error:', error);
    }
  }

  /**
   * Tüm planları getirir
   */
  getAvailablePlans(): PlanDetails[] {
    return [
      {
        id: 'monthly',
        name: 'Aylık Abonelik',
        description: 'Tüm özelliklere aylık erişim',
        price: 29,
        currency: 'TRY',
        billingCycle: 'monthly',
        features: [
          'Kapsamlı DNA Analizi',
          'Kişiselleştirilmiş Beslenme Planları',
          'Kişiselleştirilmiş Egzersiz Programları',
          'Sağlık Takibi ve İzleme',
          'Uyku Analizi ve Öneriler',
          'Takviye Önerileri',
          'İlaç Etkileşimleri Analizi',
          'PDF Rapor Dışa Aktarma',
          'Günlük Sağlık İpuçları',
          'E-posta Desteği',
        ],
        limitations: {
          maxFamilyMembers: 0,
          maxReports: -1,
          maxDNAAnalyses: -1,
          advancedAnalytics: true,
          prioritySupport: false,
          customReports: true,
          apiAccess: false,
        },
      },
      {
        id: 'yearly',
        name: 'Yıllık Abonelik',
        description: 'Tüm özelliklere yıllık erişim. 2 ay ücretsiz!',
        price: 299,
        currency: 'TRY',
        billingCycle: 'yearly',
        originalPrice: 348, // 29 * 12
        discount: 14, // 2 ay ücretsiz
        features: [
          'Aylık Plan Tüm Özellikleri',
          '2 Ay Ücretsiz (24.99 TL/ay)',
          'Öncelikli Destek',
          'Gelişmiş Analiz Raporları',
          'Özel Sağlık Danışmanlığı',
          'Aile Üyesi Ekleme (3 kişi)',
          'Gelişmiş Bildirimler',
          'Özel İçerik ve Makaleler',
        ],
        popular: true,
        limitations: {
          maxFamilyMembers: 3,
          maxReports: -1,
          maxDNAAnalyses: -1,
          advancedAnalytics: true,
          prioritySupport: true,
          customReports: true,
          apiAccess: false,
        },
      },
      {
        id: 'family',
        name: 'Aile Aboneliği',
        description: '5 kişiye kadar aile üyeleri için',
        price: 49,
        currency: 'TRY',
        billingCycle: 'monthly',
        features: [
          'Aylık Plan Tüm Özellikleri',
          '5 Aile Üyesi Ekleme',
          'Aile Sağlık Karşılaştırması',
          'Çocuklar İçin Özel Raporlar',
          'Aile Sağlık Yönetimi',
          'Aile Grup Bildirimleri',
          'Aile Sağlık Takvimi',
          'Öncelikli Aile Desteği',
        ],
        limitations: {
          maxFamilyMembers: 5,
          maxReports: -1,
          maxDNAAnalyses: -1,
          advancedAnalytics: true,
          prioritySupport: true,
          customReports: true,
          apiAccess: false,
        },
      },
    ];
  }

  /**
   * Yıllık planları getirir (indirimli)
   */
  getYearlyPlans(): PlanDetails[] {
    const monthlyPlans = this.getAvailablePlans().filter(plan => plan.id !== 'free');
    
    return monthlyPlans.map(plan => ({
      ...plan,
      billingCycle: 'yearly' as const,
      originalPrice: plan.price * 12,
      price: Math.round(plan.price * 12 * 0.8), // %20 indirim
      discount: 20,
    }));
  }

  /**
   * Ödeme işlemi başlatır
   */
  async processPayment(
    planId: SubscriptionPlan,
    paymentMethod: PaymentMethod,
    billingAddress?: any,
    couponCode?: string
  ): Promise<PaymentResult> {
    try {
      const plans = this.getAvailablePlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return {
          success: false,
          error: 'Geçersiz plan seçimi',
        };
      }

      // Kupon kontrolü
      let finalPrice = plan.price;
      if (couponCode) {
        const coupon = await this.validateCoupon(couponCode, planId);
        if (coupon) {
          finalPrice = this.applyCoupon(plan.price, coupon);
        }
      }

      // Ödeme simülasyonu (gerçek uygulamada payment gateway entegrasyonu)
      const paymentResult = await this.simulatePayment({
        planId,
        amount: finalPrice,
        currency: plan.currency,
        paymentMethod,
        billingAddress,
      });

      if (paymentResult.success) {
        // Abonelik oluştur
        const subscription = await this.createSubscription(
          planId,
          paymentResult.transactionId!,
          paymentMethod,
          billingAddress
        );

        // Mevcut aboneliği güncelle
        this.currentSubscription = subscription;
        await this.saveCurrentSubscription();
        
        // AsyncStorage'a abonelik durumunu kaydet
        await AsyncStorage.setItem('isSubscribed', 'true');
        await AsyncStorage.setItem('subscriptionInfo', JSON.stringify(subscription));

        return {
          success: true,
          transactionId: paymentResult.transactionId,
          subscriptionId: subscription.id,
          message: 'Ödeme başarıyla tamamlandı!',
        };
      }

      return paymentResult;
    } catch (error) {
      console.error('Process payment error:', error);
      return {
        success: false,
        error: 'Ödeme işlemi sırasında bir hata oluştu',
      };
    }
  }

  /**
   * Ödeme simülasyonu
   */
  private async simulatePayment(paymentData: any): Promise<PaymentResult> {
    // Gerçek uygulamada burada payment gateway (Stripe, PayPal, vb.) entegrasyonu olacak
    return new Promise((resolve) => {
      setTimeout(() => {
        // %95 başarı oranı ile simülasyon
        const success = Math.random() > 0.05;
        
        if (success) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          });
        } else {
          resolve({
            success: false,
            error: 'Ödeme işlemi başarısız oldu',
          });
        }
      }, 2000);
    });
  }

  /**
   * Abonelik oluşturur
   */
  private async createSubscription(
    planId: SubscriptionPlan,
    transactionId: string,
    paymentMethod: PaymentMethod,
    billingAddress?: any
  ): Promise<SubscriptionInfo> {
    const plan = this.getAvailablePlans().find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan bulunamadı');
    }

    const now = new Date();
    const endDate = new Date();
    
    // Abonelik süresini hesapla
    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billingCycle === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100); // 100 yıl
    }

    const subscription: SubscriptionInfo = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user_id', // Gerçek uygulamada auth'dan alınacak
      planId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      nextBillingDate: plan.billingCycle !== 'lifetime' ? endDate.toISOString() : undefined,
      paymentInfo: {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user_id',
        planId,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod,
        status: 'completed',
        transactionId,
        paymentDate: now.toISOString(),
        expiryDate: endDate.toISOString(),
        billingAddress,
      },
      features: plan.features,
      usage: {
        familyMembers: 0,
        reportsGenerated: 0,
        dnaAnalyses: 0,
      },
    };

    return subscription;
  }

  /**
   * Kupon doğrular
   */
  async validateCoupon(code: string, planId: SubscriptionPlan): Promise<CouponInfo | null> {
    // Gerçek uygulamada burada veritabanından kupon kontrolü yapılacak
    const coupons: CouponInfo[] = [
      {
        code: 'WELCOME20',
        description: 'Yeni kullanıcılar için %20 indirim',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 1000,
        usedCount: 150,
        applicablePlans: ['basic', 'premium', 'family'],
      },
      {
        code: 'FAMILY50',
        description: 'Aile planı için 50 TL indirim',
        discountType: 'fixed',
        discountValue: 50,
        minAmount: 99.99,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 500,
        usedCount: 75,
        applicablePlans: ['family'],
      },
      {
        code: 'PREMIUM30',
        description: 'Premium plan için %30 indirim',
        discountType: 'percentage',
        discountValue: 30,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 200,
        usedCount: 45,
        applicablePlans: ['premium'],
      },
    ];

    const coupon = coupons.find(c => c.code === code);
    if (!coupon) return null;

    // Geçerlilik kontrolü
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now < validFrom || now > validUntil) return null;

    // Kullanım limiti kontrolü
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return null;

    // Plan uygunluğu kontrolü
    if (!coupon.applicablePlans.includes(planId)) return null;

    return coupon;
  }

  /**
   * Kupon indirimini uygular
   */
  private applyCoupon(price: number, coupon: CouponInfo): number {
    if (coupon.discountType === 'percentage') {
      const discount = (price * coupon.discountValue) / 100;
      const maxDiscount = coupon.maxDiscount || discount;
      return Math.max(0, price - Math.min(discount, maxDiscount));
    } else {
      return Math.max(0, price - coupon.discountValue);
    }
  }

  /**
   * Mevcut aboneliği getirir
   */
  getCurrentSubscription(): SubscriptionInfo | null {
    return this.currentSubscription;
  }

  /**
   * Abonelik durumunu kontrol eder
   */
  isSubscriptionActive(): boolean {
    if (!this.currentSubscription) return false;
    
    const now = new Date();
    const endDate = new Date(this.currentSubscription.endDate);
    
    return this.currentSubscription.status === 'active' && now < endDate;
  }

  /**
   * Plan özelliğine erişim kontrolü
   */
  hasFeatureAccess(feature: string): boolean {
    if (!this.currentSubscription) return false;
    
    const plan = this.getAvailablePlans().find(p => p.id === this.currentSubscription!.planId);
    if (!plan) return false;

    return plan.features.includes(feature);
  }

  /**
   * Kullanım limitini kontrol eder
   */
  checkUsageLimit(limitType: keyof SubscriptionInfo['usage']): boolean {
    if (!this.currentSubscription) return false;
    
    const plan = this.getAvailablePlans().find(p => p.id === this.currentSubscription!.planId);
    if (!plan) return false;

    const limit = plan.limitations[limitType === 'familyMembers' ? 'maxFamilyMembers' : 
                                  limitType === 'reportsGenerated' ? 'maxReports' : 
                                  'maxDNAAnalyses'];
    
    if (limit === -1) return true; // Sınırsız
    if (limit === undefined) return false;
    
    return this.currentSubscription.usage[limitType] < limit;
  }

  /**
   * Kullanım sayacını artırır
   */
  async incrementUsage(limitType: keyof SubscriptionInfo['usage']): Promise<void> {
    if (!this.currentSubscription) return;
    
    this.currentSubscription.usage[limitType]++;
    await this.saveCurrentSubscription();
  }

  /**
   * Aboneliği iptal eder
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      if (!this.currentSubscription) return false;
      
      this.currentSubscription.status = 'cancelled';
      this.currentSubscription.autoRenew = false;
      
      await this.saveCurrentSubscription();
      
      Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi');
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      Alert.alert('Hata', 'Abonelik iptal edilirken bir hata oluştu');
      return false;
    }
  }

  /**
   * Aboneliği yeniler
   */
  async renewSubscription(): Promise<PaymentResult> {
    if (!this.currentSubscription) {
      return {
        success: false,
        error: 'Aktif abonelik bulunamadı',
      };
    }

    return await this.processPayment(
      this.currentSubscription.planId,
      this.currentSubscription.paymentInfo.paymentMethod,
      this.currentSubscription.paymentInfo.billingAddress
    );
  }

  /**
   * Faturaları getirir
   */
  async getInvoices(): Promise<InvoiceInfo[]> {
    try {
      const invoices = await AsyncStorage.getItem('userInvoices');
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error('Get invoices error:', error);
      return [];
    }
  }

  /**
   * Fatura oluşturur
   */
  private async createInvoice(subscription: SubscriptionInfo): Promise<InvoiceInfo> {
    const invoice: InvoiceInfo = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: subscription.paymentInfo.amount,
      currency: subscription.paymentInfo.currency,
      status: 'completed',
      issueDate: subscription.paymentInfo.paymentDate,
      dueDate: subscription.paymentInfo.paymentDate,
      paidDate: subscription.paymentInfo.paymentDate,
      items: [{
        description: `${subscription.planId} abonelik planı`,
        quantity: 1,
        unitPrice: subscription.paymentInfo.amount,
        total: subscription.paymentInfo.amount,
      }],
      subtotal: subscription.paymentInfo.amount,
      tax: 0,
      total: subscription.paymentInfo.amount,
      paymentMethod: subscription.paymentInfo.paymentMethod,
    };

    // Faturayı kaydet
    const invoices = await this.getInvoices();
    invoices.push(invoice);
    await AsyncStorage.setItem('userInvoices', JSON.stringify(invoices));

    return invoice;
  }

  /**
   * Mevcut aboneliği kaydeder
   */
  private async saveCurrentSubscription(): Promise<void> {
    try {
      if (this.currentSubscription) {
        await AsyncStorage.setItem('currentSubscription', JSON.stringify(this.currentSubscription));
      }
    } catch (error) {
      console.error('Save subscription error:', error);
    }
  }

  /**
   * Plan değiştirir
   */
  async changePlan(newPlanId: SubscriptionPlan): Promise<PaymentResult> {
    try {
      const currentPlan = this.currentSubscription?.planId;
      if (currentPlan === newPlanId) {
        return {
          success: false,
          error: 'Zaten bu planda aboneliğiniz var',
        };
      }

      // Yeni plan için ödeme işlemi
      const paymentResult = await this.processPayment(
        newPlanId,
        this.currentSubscription?.paymentInfo.paymentMethod || 'credit_card',
        this.currentSubscription?.paymentInfo.billingAddress
      );

      if (paymentResult.success) {
        Alert.alert('Başarılı', 'Planınız başarıyla değiştirildi');
      }

      return paymentResult;
    } catch (error) {
      console.error('Change plan error:', error);
      return {
        success: false,
        error: 'Plan değiştirilirken bir hata oluştu',
      };
    }
  }

  /**
   * Deneme süresi başlatır
   */
  async startTrial(planId: SubscriptionPlan): Promise<boolean> {
    try {
      const trialSubscription: SubscriptionInfo = {
        id: `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user_id',
        planId,
        status: 'trial',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün
        autoRenew: false,
        paymentInfo: {
          id: `trial_pay_${Date.now()}`,
          userId: 'current_user_id',
          planId,
          amount: 0,
          currency: 'TRY',
          paymentMethod: 'credit_card',
          status: 'completed',
          paymentDate: new Date().toISOString(),
        },
        features: this.getAvailablePlans().find(p => p.id === planId)?.features || [],
        usage: {
          familyMembers: 0,
          reportsGenerated: 0,
          dnaAnalyses: 0,
        },
      };

      this.currentSubscription = trialSubscription;
      await this.saveCurrentSubscription();

      Alert.alert('Başarılı', '7 günlük deneme süreniz başladı!');
      return true;
    } catch (error) {
      console.error('Start trial error:', error);
      return false;
    }
  }

  /**
   * Abonelik geçmişini getirir
   */
  async getSubscriptionHistory(): Promise<SubscriptionInfo[]> {
    try {
      const history = await AsyncStorage.getItem('subscriptionHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Get subscription history error:', error);
      return [];
    }
  }
}
