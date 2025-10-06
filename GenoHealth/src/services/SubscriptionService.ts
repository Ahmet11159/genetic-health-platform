import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentService, SubscriptionInfo } from './PaymentService';

export class SubscriptionService {
  private static instance: SubscriptionService;
  private paymentService: PaymentService;
  private isSubscribed: boolean = false;
  private subscriptionInfo: SubscriptionInfo | null = null;

  private constructor() {
    this.paymentService = PaymentService.getInstance();
  }

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<void> {
    try {
      await this.paymentService.initialize();
      await this.loadSubscriptionStatus();
      console.log('SubscriptionService initialized');
    } catch (error) {
      console.error('SubscriptionService initialization error:', error);
    }
  }

  /**
   * Abonelik durumunu yükler
   */
  private async loadSubscriptionStatus(): Promise<void> {
    try {
      // Önce AsyncStorage'dan kontrol et
      const isSubscribedStorage = await AsyncStorage.getItem('isSubscribed');
      const subscriptionInfoStorage = await AsyncStorage.getItem('subscriptionInfo');
      
      if (isSubscribedStorage === 'true' && subscriptionInfoStorage) {
        this.isSubscribed = true;
        this.subscriptionInfo = JSON.parse(subscriptionInfoStorage);
        console.log('Subscription loaded from AsyncStorage:', this.subscriptionInfo);
      } else {
        // AsyncStorage'da yoksa PaymentService'den kontrol et
        const subscription = this.paymentService.getCurrentSubscription();
        this.subscriptionInfo = subscription;
        this.isSubscribed = this.paymentService.isSubscriptionActive();
        
        // PaymentService'de varsa AsyncStorage'a kaydet
        if (this.isSubscribed && subscription) {
          await AsyncStorage.setItem('isSubscribed', 'true');
          await AsyncStorage.setItem('subscriptionInfo', JSON.stringify(subscription));
        }
      }
    } catch (error) {
      console.error('Load subscription status error:', error);
    }
  }

  /**
   * Abonelik durumunu kontrol eder
   */
  async isUserSubscribed(): Promise<boolean> {
    try {
      await this.loadSubscriptionStatus();
      return this.isSubscribed;
    } catch (error) {
      console.error('Check subscription status error:', error);
      return false;
    }
  }

  /**
   * Abonelik bilgilerini getirir
   */
  getSubscriptionInfo(): SubscriptionInfo | null {
    return this.subscriptionInfo;
  }

  /**
   * Premium özellik kontrolü
   */
  hasPremiumAccess(): boolean {
    return this.isSubscribed;
  }

  /**
   * Belirli bir özelliğe erişim kontrolü
   */
  hasFeatureAccess(feature: string): boolean {
    if (!this.isSubscribed) return false;
    return this.paymentService.hasFeatureAccess(feature);
  }

  /**
   * Abonelik durumunu günceller
   */
  async updateSubscriptionStatus(): Promise<void> {
    await this.loadSubscriptionStatus();
  }

  /**
   * Abonelik planını değiştirir
   */
  async changePlan(planId: 'monthly' | 'yearly' | 'family'): Promise<boolean> {
    try {
      const result = await this.paymentService.changePlan(planId);
      if (result.success) {
        await this.updateSubscriptionStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Change plan error:', error);
      return false;
    }
  }

  /**
   * Aboneliği iptal eder
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      const result = await this.paymentService.cancelSubscription();
      if (result) {
        await this.updateSubscriptionStatus();
        
        // AsyncStorage'ı temizle
        await AsyncStorage.removeItem('isSubscribed');
        await AsyncStorage.removeItem('subscriptionInfo');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  /**
   * Kullanım limitini kontrol eder
   */
  checkUsageLimit(limitType: 'familyMembers' | 'reportsGenerated' | 'dnaAnalyses'): boolean {
    return this.paymentService.checkUsageLimit(limitType);
  }

  /**
   * Kullanım sayacını artırır
   */
  async incrementUsage(limitType: 'familyMembers' | 'reportsGenerated' | 'dnaAnalyses'): Promise<void> {
    await this.paymentService.incrementUsage(limitType);
  }

  /**
   * Abonelik geçmişini getirir
   */
  async getSubscriptionHistory(): Promise<SubscriptionInfo[]> {
    return await this.paymentService.getSubscriptionHistory();
  }

  /**
   * Mevcut plan bilgilerini getirir
   */
  getCurrentPlanInfo() {
    if (!this.subscriptionInfo) return null;
    
    const plans = this.paymentService.getAvailablePlans();
    return plans.find(plan => plan.id === this.subscriptionInfo!.planId);
  }

  /**
   * Abonelik süresini getirir (gün cinsinden)
   */
  getDaysRemaining(): number {
    if (!this.subscriptionInfo) return 0;
    
    const now = new Date();
    const endDate = new Date(this.subscriptionInfo.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Abonelik durumu metnini getirir
   */
  getSubscriptionStatusText(): string {
    if (!this.subscriptionInfo) return 'Abonelik Yok';
    
    const daysRemaining = this.getDaysRemaining();
    
    if (this.subscriptionInfo.status === 'active') {
      if (daysRemaining > 30) {
        return `${Math.floor(daysRemaining / 30)} ay kaldı`;
      } else if (daysRemaining > 0) {
        return `${daysRemaining} gün kaldı`;
      } else {
        return 'Süresi Doldu';
      }
    } else if (this.subscriptionInfo.status === 'trial') {
      return `${daysRemaining} gün deneme süresi`;
    } else if (this.subscriptionInfo.status === 'cancelled') {
      return 'İptal Edildi';
    } else {
      return 'Bilinmiyor';
    }
  }
}
