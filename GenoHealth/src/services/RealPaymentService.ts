import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Gerçek ödeme servisi - Stripe, Apple Pay, Google Pay entegrasyonu
export class RealPaymentService {
  private static instance: RealPaymentService;
  private isInitialized = false;
  private currentSubscription: any = null;

  static getInstance(): RealPaymentService {
    if (!RealPaymentService.instance) {
      RealPaymentService.instance = new RealPaymentService();
    }
    return RealPaymentService.instance;
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
      console.log('Real Payment Service initialized!');
      return true;
    } catch (error) {
      console.error('Real Payment service initialization error:', error);
      return false;
    }
  }

  /**
   * Mevcut aboneliği yükler
   */
  private async loadCurrentSubscription(): Promise<void> {
    try {
      const subscription = await AsyncStorage.getItem('realSubscription');
      if (subscription) {
        this.currentSubscription = JSON.parse(subscription);
      }
    } catch (error) {
      console.error('Load subscription error:', error);
    }
  }

  /**
   * Abonelik planlarını getirir
   */
  getAvailablePlans() {
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
        originalPrice: 348,
        discount: 14,
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
   * Ödeme işlemi başlatır
   */
  async processPayment(
    planId: string,
    paymentMethod: string,
    billingAddress?: any,
    couponCode?: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
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

      // Gerçek ödeme işlemi simülasyonu
      const paymentResult = await this.simulateRealPayment({
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

        return {
          success: true,
          transactionId: paymentResult.transactionId,
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
   * Gerçek ödeme simülasyonu (Stripe, Apple Pay, Google Pay entegrasyonu)
   */
  private async simulateRealPayment(paymentData: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Gerçek uygulamada burada Stripe, Apple Pay, Google Pay entegrasyonu olacak
    
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
    planId: string,
    transactionId: string,
    paymentMethod: string,
    billingAddress?: any
  ): Promise<any> {
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
    }

    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user_id',
      planId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      nextBillingDate: endDate.toISOString(),
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
  async validateCoupon(code: string, planId: string): Promise<any> {
    const coupons = [
      {
        code: 'WELCOME20',
        description: 'Yeni kullanıcılar için %20 indirim',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 1000,
        usedCount: 150,
        applicablePlans: ['monthly', 'yearly', 'family'],
      },
      {
        code: 'FAMILY50',
        description: 'Aile planı için 50 TL indirim',
        discountType: 'fixed',
        discountValue: 50,
        minAmount: 49,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 500,
        usedCount: 75,
        applicablePlans: ['family'],
      },
      {
        code: 'YEARLY100',
        description: 'Yıllık plan için 100 TL indirim',
        discountType: 'fixed',
        discountValue: 100,
        minAmount: 299,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        usageLimit: 200,
        usedCount: 45,
        applicablePlans: ['yearly'],
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
  private applyCoupon(price: number, coupon: any): number {
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
  getCurrentSubscription(): any {
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
   * Aboneliği iptal eder
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      if (!this.currentSubscription) return false;

      // Gerçek uygulamada burada Stripe API ile iptal işlemi yapılacak
      this.currentSubscription.status = 'cancelled';
      this.currentSubscription.autoRenew = false;
      
      await this.saveCurrentSubscription();
      
      // AsyncStorage'ı temizle
      await AsyncStorage.removeItem('isSubscribed');
      await AsyncStorage.removeItem('subscriptionInfo');
      
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  /**
   * Abonelik planını değiştirir
   */
  async changePlan(newPlanId: string): Promise<boolean> {
    try {
      if (!this.currentSubscription) return false;

      const plans = this.getAvailablePlans();
      const newPlan = plans.find(p => p.id === newPlanId);
      if (!newPlan) return false;

      // Gerçek uygulamada burada Stripe API ile plan değişikliği yapılacak
      this.currentSubscription.planId = newPlanId;
      this.currentSubscription.features = newPlan.features;
      this.currentSubscription.limitations = newPlan.limitations;
      
      await this.saveCurrentSubscription();
      
      return true;
    } catch (error) {
      console.error('Change plan error:', error);
      return false;
    }
  }

  /**
   * Mevcut aboneliği kaydeder
   */
  private async saveCurrentSubscription(): Promise<void> {
    try {
      await AsyncStorage.setItem('realSubscription', JSON.stringify(this.currentSubscription));
      await AsyncStorage.setItem('isSubscribed', 'true');
      await AsyncStorage.setItem('subscriptionInfo', JSON.stringify(this.currentSubscription));
    } catch (error) {
      console.error('Save subscription error:', error);
    }
  }

  /**
   * Kullanım limitini kontrol eder
   */
  checkUsageLimit(limitType: string): boolean {
    if (!this.currentSubscription) return false;
    
    const plan = this.getAvailablePlans().find(p => p.id === this.currentSubscription.planId);
    if (!plan) return false;

    const limit = plan.limitations[limitType as keyof typeof plan.limitations];
    if (limit === -1) return true; // Sınırsız
    
    const currentUsage = this.currentSubscription.usage[limitType];
    return currentUsage < limit;
  }

  /**
   * Kullanım sayacını artırır
   */
  async incrementUsage(limitType: string): Promise<void> {
    try {
      if (!this.currentSubscription) return;
      
      this.currentSubscription.usage[limitType] = (this.currentSubscription.usage[limitType] || 0) + 1;
      await this.saveCurrentSubscription();
    } catch (error) {
      console.error('Increment usage error:', error);
    }
  }

  /**
   * Abonelik geçmişini getirir
   */
  async getSubscriptionHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem('subscriptionHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Get subscription history error:', error);
      return [];
    }
  }

  /**
   * Fatura bilgilerini getirir
   */
  async getInvoiceHistory(): Promise<any[]> {
    try {
      const invoices = await AsyncStorage.getItem('invoiceHistory');
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error('Get invoice history error:', error);
      return [];
    }
  }
}
