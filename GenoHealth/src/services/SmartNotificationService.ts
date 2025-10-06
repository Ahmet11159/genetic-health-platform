import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Akıllı bildirim servisi - Premium kullanıcılar için özel bildirimler
export class SmartNotificationService {
  private static instance: SmartNotificationService;
  private isInitialized = false;
  private notificationSettings: any = {};

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Bildirim izinlerini iste
      await this.requestPermissions();
      
      // Bildirim ayarlarını yükle
      await this.loadNotificationSettings();
      
      // Bildirim handler'larını ayarla
      this.setupNotificationHandlers();

      this.isInitialized = true;
      console.log('Smart Notification Service initialized!');
      return true;
    } catch (error) {
      console.error('Smart Notification service initialization error:', error);
      return false;
    }
  }

  /**
   * Bildirim izinlerini ister
   */
  private async requestPermissions(): Promise<void> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
    }
  }

  /**
   * Bildirim ayarlarını yükler
   */
  private async loadNotificationSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.notificationSettings = JSON.parse(settings);
      } else {
        // Varsayılan ayarlar
        this.notificationSettings = {
          subscriptionReminders: true,
          healthTips: true,
          dnaAnalysisComplete: true,
          weeklyReports: true,
          familyUpdates: true,
          promotionalOffers: false,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
          },
          frequency: 'daily', // daily, weekly, monthly
        };
        await this.saveNotificationSettings();
      }
    } catch (error) {
      console.error('Load notification settings error:', error);
    }
  }

  /**
   * Bildirim ayarlarını kaydeder
   */
  private async saveNotificationSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    } catch (error) {
      console.error('Save notification settings error:', error);
    }
  }

  /**
   * Bildirim handler'larını ayarlar
   */
  private setupNotificationHandlers(): void {
    // Bildirim geldiğinde ne yapılacağı
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * Abonelik hatırlatıcı bildirimi gönderir
   */
  async sendSubscriptionReminder(daysLeft: number): Promise<void> {
    if (!this.notificationSettings.subscriptionReminders) return;

    let title = '';
    let body = '';

    if (daysLeft === 7) {
      title = 'Aboneliğiniz 1 Hafta Sonra Yenilenecek';
      body = 'Aboneliğinizin otomatik yenilenmesi için ödeme bilgilerinizi kontrol edin.';
    } else if (daysLeft === 3) {
      title = 'Aboneliğiniz 3 Gün Sonra Yenilenecek';
      body = 'Ödeme bilgilerinizi güncelleyin veya aboneliğinizi yönetin.';
    } else if (daysLeft === 1) {
      title = 'Aboneliğiniz Yarın Yenilenecek';
      body = 'Son gün! Aboneliğinizin kesintisiz devam etmesi için ödeme bilgilerinizi kontrol edin.';
    } else if (daysLeft === 0) {
      title = 'Aboneliğiniz Bugün Yenilenecek';
      body = 'Aboneliğiniz bugün otomatik olarak yenilenecek.';
    }

    if (title && body) {
      await this.scheduleNotification({
        title,
        body,
        data: { type: 'subscription_reminder', daysLeft },
        trigger: { seconds: 1 },
      });
    }
  }

  /**
   * DNA analizi tamamlandı bildirimi
   */
  async sendDNAAnalysisCompleteNotification(analysisData: any): Promise<void> {
    if (!this.notificationSettings.dnaAnalysisComplete) return;

    const title = 'DNA Analiziniz Tamamlandı! 🧬';
    const body = `${analysisData.totalVariants} genetik varyant analiz edildi. Sonuçlarınızı inceleyin.`;

    await this.scheduleNotification({
      title,
      body,
      data: { type: 'dna_analysis_complete', analysisId: analysisData.analysisId },
      trigger: { seconds: 1 },
    });
  }

  /**
   * Sağlık ipucu bildirimi
   */
  async sendHealthTipNotification(tip: string): Promise<void> {
    if (!this.notificationSettings.healthTips) return;

    const title = 'Günlük Sağlık İpucu 💡';
    const body = tip;

    await this.scheduleNotification({
      title,
      body,
      data: { type: 'health_tip' },
      trigger: { seconds: 1 },
    });
  }

  /**
   * Haftalık rapor bildirimi
   */
  async sendWeeklyReportNotification(reportData: any): Promise<void> {
    if (!this.notificationSettings.weeklyReports) return;

    const title = 'Haftalık Sağlık Raporunuz Hazır 📊';
    const body = `Bu hafta ${reportData.dnaAnalyses} analiz, ${reportData.reportsGenerated} rapor oluşturdunuz.`;

    await this.scheduleNotification({
      title,
      body,
      data: { type: 'weekly_report', reportData },
      trigger: { seconds: 1 },
    });
  }

  /**
   * Aile güncellemesi bildirimi
   */
  async sendFamilyUpdateNotification(familyMember: string, update: string): Promise<void> {
    if (!this.notificationSettings.familyUpdates) return;

    const title = 'Aile Güncellemesi 👨‍👩‍👧‍👦';
    const body = `${familyMember} için ${update}`;

    await this.scheduleNotification({
      title,
      body,
      data: { type: 'family_update', familyMember, update },
      trigger: { seconds: 1 },
    });
  }

  /**
   * Promosyon teklifi bildirimi
   */
  async sendPromotionalOfferNotification(offer: any): Promise<void> {
    if (!this.notificationSettings.promotionalOffers) return;

    const title = 'Özel Teklif! 🎉';
    const body = `${offer.description} - Sadece ${offer.daysLeft} gün kaldı!`;

    await this.scheduleNotification({
      title,
      body,
      data: { type: 'promotional_offer', offer },
      trigger: { seconds: 1 },
    });
  }

  /**
   * Bildirim zamanlar
   */
  async scheduleNotification(notification: any): Promise<void> {
    try {
      // Sessiz saatleri kontrol et
      if (this.isQuietHours()) {
        // Sessiz saatlerde bildirim gönderme, ertesi güne ertele
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        notification.trigger = { date: tomorrow };
      }

      await Notifications.scheduleNotificationAsync(notification);
    } catch (error) {
      console.error('Schedule notification error:', error);
    }
  }

  /**
   * Sessiz saatleri kontrol eder
   */
  private isQuietHours(): boolean {
    if (!this.notificationSettings.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.timeToMinutes(this.notificationSettings.quietHours.start);
    const endTime = this.timeToMinutes(this.notificationSettings.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Gece yarısını geçen sessiz saatler
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Saat formatını dakikaya çevirir
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Günlük sağlık ipuçları zamanlar
   */
  async scheduleDailyHealthTips(): Promise<void> {
    if (!this.notificationSettings.healthTips) return;

    const healthTips = [
      'Günde 8 bardak su içmeyi unutmayın! 💧',
      'Düzenli egzersiz yapmak genetik potansiyelinizi artırır. 🏃‍♂️',
      'Kaliteli uyku, DNA onarımını destekler. 😴',
      'Antioksidan açısından zengin besinler tüketin. 🥗',
      'Stres yönetimi genetik sağlığınızı korur. 🧘‍♀️',
      'Düzenli check-up yaptırmayı ihmal etmeyin. 🏥',
      'Güneş ışığından yeterince faydalanın. ☀️',
    ];

    // Her gün saat 09:00'da ipucu gönder
    const trigger = {
      hour: 9,
      minute: 0,
      repeats: true,
    };

    for (let i = 0; i < healthTips.length; i++) {
      await this.scheduleNotification({
        title: 'Günlük Sağlık İpucu 💡',
        body: healthTips[i],
        data: { type: 'daily_health_tip', day: i + 1 },
        trigger,
      });
    }
  }

  /**
   * Haftalık rapor zamanlar
   */
  async scheduleWeeklyReports(): Promise<void> {
    if (!this.notificationSettings.weeklyReports) return;

    // Her pazartesi saat 10:00'da haftalık rapor gönder
    const trigger = {
      weekday: 2, // Pazartesi
      hour: 10,
      minute: 0,
      repeats: true,
    };

    await this.scheduleNotification({
      title: 'Haftalık Sağlık Raporunuz Hazır 📊',
      body: 'Bu haftaki aktivitelerinizi ve ilerlemenizi inceleyin.',
      data: { type: 'weekly_report' },
      trigger,
    });
  }

  /**
   * Bildirim ayarlarını günceller
   */
  async updateNotificationSettings(settings: any): Promise<void> {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      await this.saveNotificationSettings();
    } catch (error) {
      console.error('Update notification settings error:', error);
    }
  }

  /**
   * Bildirim ayarlarını getirir
   */
  getNotificationSettings(): any {
    return this.notificationSettings;
  }

  /**
   * Tüm bildirimleri temizler
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Clear notifications error:', error);
    }
  }

  /**
   * Belirli tipte bildirimleri temizler
   */
  async clearNotificationsByType(type: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Clear notifications by type error:', error);
    }
  }

  /**
   * Bildirim geçmişini getirir
   */
  async getNotificationHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem('notificationHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Get notification history error:', error);
      return [];
    }
  }

  /**
   * Bildirim geçmişine ekler
   */
  private async addToHistory(notification: any): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      history.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
      });
      
      // Son 100 bildirimi sakla
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Add to notification history error:', error);
    }
  }
}