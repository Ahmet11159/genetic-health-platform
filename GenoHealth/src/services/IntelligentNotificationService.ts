// Akıllı bildirim servisi
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticFeedbackService } from './HapticFeedbackService';

export interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibrate?: boolean;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  category?: string;
  color?: string;
  icon?: string;
  badge?: number;
  autoCancel?: boolean;
  ongoing?: boolean;
  silent?: boolean;
}

export interface SmartNotificationRule {
  id: string;
  name: string;
  condition: (userData: any, context: any) => boolean;
  notification: NotificationConfig;
  priority: number;
  cooldown?: number; // dakika
  maxPerDay?: number;
  enabled: boolean;
}

export interface UserContext {
  geneticProfile?: any;
  healthData?: any;
  preferences?: any;
  behavior?: any;
  timeOfDay?: string;
  dayOfWeek?: string;
  location?: any;
  deviceUsage?: any;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalOpened: number;
  totalDismissed: number;
  totalSnoozed: number;
  engagementRate: number;
  bestTimeToSend: string;
  mostEngagingType: string;
  userSatisfaction: number;
}

export class IntelligentNotificationService {
  private static isInitialized = false;
  private static notificationRules: Map<string, SmartNotificationRule> = new Map();
  private static userContext: UserContext = {};
  private static analytics: NotificationAnalytics = {
    totalSent: 0,
    totalOpened: 0,
    totalDismissed: 0,
    totalSnoozed: 0,
    engagementRate: 0,
    bestTimeToSend: '09:00',
    mostEngagingType: 'health_tip',
    userSatisfaction: 0.8
  };
  private static lastNotificationTimes: Map<string, number> = new Map();
  private static dailyNotificationCounts: Map<string, number> = new Map();

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Bildirim izinlerini iste
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Bildirim izni verilmedi');
        return false;
      }

      // Bildirim kanallarını ayarla (Android)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('health-alerts', {
          name: 'Sağlık Uyarıları',
          description: 'Genetik risk uyarıları ve sağlık bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('daily-tips', {
          name: 'Günlük İpuçları',
          description: 'Günlük sağlık ipuçları ve motivasyon mesajları',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#4ECDC4',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Başarılar',
          description: 'Başarı rozetleri ve ilerleme bildirimleri',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250],
          lightColor: '#FFD700',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Hatırlatıcılar',
          description: 'Günlük hatırlatıcılar ve görevler',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#667eea',
          sound: 'default',
        });
      }

      // Bildirim dinleyicilerini ayarla
      this.setupNotificationListeners();

      // Akıllı kuralları yükle
      await this.loadSmartRules();

      // Kullanıcı bağlamını yükle
      await this.loadUserContext();

      // Analitik verilerini yükle
      await this.loadAnalytics();

      this.isInitialized = true;
      console.log('Akıllı bildirim servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Bildirim servisi başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Bildirim dinleyicilerini ayarlar
   */
  private static setupNotificationListeners(): void {
    // Bildirim geldiğinde
    Notifications.addNotificationReceivedListener(notification => {
      this.analytics.totalSent++;
      this.updateAnalytics();
      
      // Haptic feedback
      HapticFeedbackService.trigger('notification');
    });

    // Bildirime tıklandığında
    Notifications.addNotificationResponseReceivedListener(response => {
      this.analytics.totalOpened++;
      this.updateAnalytics();
      
      // Haptic feedback
      HapticFeedbackService.trigger('success');
    });
  }

  /**
   * Akıllı kuralları yükler
   */
  private static async loadSmartRules(): Promise<void> {
    try {
      const rulesData = await AsyncStorage.getItem('smart_notification_rules');
      if (rulesData) {
        const rules = JSON.parse(rulesData);
        rules.forEach((rule: SmartNotificationRule) => {
          this.notificationRules.set(rule.id, rule);
        });
      } else {
        // Varsayılan kuralları oluştur
        await this.createDefaultRules();
      }
    } catch (error) {
      console.error('Akıllı kuralları yükleme hatası:', error);
    }
  }

  /**
   * Varsayılan kuralları oluşturur
   */
  private static async createDefaultRules(): Promise<void> {
    const defaultRules: SmartNotificationRule[] = [
      {
        id: 'genetic_risk_alert',
        name: 'Genetik Risk Uyarısı',
        condition: (userData, context) => {
          const geneticProfile = userData.geneticProfile;
          if (!geneticProfile) return false;
          
          // Yüksek risk genetik varyantları kontrol et
          const highRiskVariants = geneticProfile.variants?.filter((v: any) => 
            v.riskLevel === 'high' && v.clinicalSignificance === 'pathogenic'
          );
          
          return highRiskVariants && highRiskVariants.length > 0;
        },
        notification: {
          id: 'genetic_risk_alert',
          title: '🧬 Genetik Risk Uyarısı',
          body: 'Yüksek risk genetik varyantınız tespit edildi. Detayları görüntüleyin.',
          category: 'health-alerts',
          priority: 'high',
          color: '#FF6B6B',
          sound: true,
          vibrate: true,
        },
        priority: 10,
        cooldown: 60, // 1 saat
        maxPerDay: 3,
        enabled: true,
      },
      {
        id: 'daily_health_tip',
        name: 'Günlük Sağlık İpucu',
        condition: (userData, context) => {
          const timeOfDay = context.timeOfDay;
          const lastTipTime = this.lastNotificationTimes.get('daily_health_tip');
          const now = Date.now();
          
          // Günlük bir kez, sabah saatlerinde
          return (!lastTipTime || now - lastTipTime > 24 * 60 * 60 * 1000) &&
                 timeOfDay === 'morning';
        },
        notification: {
          id: 'daily_health_tip',
          title: '💡 Günlük Sağlık İpucu',
          body: 'Genetik profilinize özel sağlık önerisi hazır!',
          category: 'daily-tips',
          priority: 'default',
          color: '#4ECDC4',
          sound: true,
        },
        priority: 5,
        cooldown: 1440, // 24 saat
        maxPerDay: 1,
        enabled: true,
      },
      {
        id: 'achievement_unlocked',
        name: 'Başarı Rozeti',
        condition: (userData, context) => {
          const achievements = userData.achievements;
          const lastAchievementTime = this.lastNotificationTimes.get('achievement_unlocked');
          const now = Date.now();
          
          // Yeni başarı varsa ve son bildirimden 1 saat geçmişse
          return achievements?.newAchievements?.length > 0 &&
                 (!lastAchievementTime || now - lastAchievementTime > 60 * 60 * 1000);
        },
        notification: {
          id: 'achievement_unlocked',
          title: '🏆 Yeni Başarı!',
          body: 'Tebrikler! Yeni bir başarı rozeti kazandınız.',
          category: 'achievements',
          priority: 'default',
          color: '#FFD700',
          sound: true,
        },
        priority: 7,
        cooldown: 60, // 1 saat
        maxPerDay: 5,
        enabled: true,
      },
      {
        id: 'hydration_reminder',
        name: 'Su İçme Hatırlatıcısı',
        condition: (userData, context) => {
          const healthData = userData.healthData;
          const timeOfDay = context.timeOfDay;
          const lastHydrationTime = this.lastNotificationTimes.get('hydration_reminder');
          const now = Date.now();
          
          // Son 2 saatte su içmemişse ve çalışma saatlerindeyse
          return healthData?.lastWaterIntake &&
                 now - healthData.lastWaterIntake > 2 * 60 * 60 * 1000 &&
                 ['morning', 'afternoon'].includes(timeOfDay) &&
                 (!lastHydrationTime || now - lastHydrationTime > 2 * 60 * 60 * 1000);
        },
        notification: {
          id: 'hydration_reminder',
          title: '💧 Su İçme Zamanı',
          body: 'Genetik profilinize göre optimal hidrasyon için su içmeyi unutmayın.',
          category: 'reminders',
          priority: 'default',
          color: '#667eea',
          sound: true,
        },
        priority: 3,
        cooldown: 120, // 2 saat
        maxPerDay: 8,
        enabled: true,
      },
      {
        id: 'exercise_reminder',
        name: 'Egzersiz Hatırlatıcısı',
        condition: (userData, context) => {
          const healthData = userData.healthData;
          const timeOfDay = context.timeOfDay;
          const dayOfWeek = context.dayOfWeek;
          const lastExerciseTime = this.lastNotificationTimes.get('exercise_reminder');
          const now = Date.now();
          
          // Son 24 saatte egzersiz yapmamışsa ve hafta içi akşam saatlerindeyse
          return healthData?.lastExerciseTime &&
                 now - healthData.lastExerciseTime > 24 * 60 * 60 * 1000 &&
                 timeOfDay === 'evening' &&
                 ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek) &&
                 (!lastExerciseTime || now - lastExerciseTime > 24 * 60 * 60 * 1000);
        },
        notification: {
          id: 'exercise_reminder',
          title: '🏃‍♂️ Egzersiz Zamanı',
          body: 'Genetik kas tipinize uygun egzersiz programınızı uygulayın.',
          category: 'reminders',
          priority: 'default',
          color: '#FF6B6B',
          sound: true,
        },
        priority: 4,
        cooldown: 1440, // 24 saat
        maxPerDay: 1,
        enabled: true,
      },
      {
        id: 'sleep_reminder',
        name: 'Uyku Hatırlatıcısı',
        condition: (userData, context) => {
          const geneticProfile = userData.geneticProfile;
          const timeOfDay = context.timeOfDay;
          const lastSleepTime = this.lastNotificationTimes.get('sleep_reminder');
          const now = Date.now();
          
          // Genetik uyku genine göre optimal uyku saatinde
          const optimalSleepTime = geneticProfile?.sleepGenes?.optimalSleepTime || '22:00';
          const currentHour = new Date().getHours();
          const optimalHour = parseInt(optimalSleepTime.split(':')[0]);
          
          return timeOfDay === 'evening' &&
                 currentHour >= optimalHour - 1 &&
                 currentHour <= optimalHour + 1 &&
                 (!lastSleepTime || now - lastSleepTime > 24 * 60 * 60 * 1000);
        },
        notification: {
          id: 'sleep_reminder',
          title: '😴 Uyku Zamanı',
          body: 'Genetik uyku ritminize göre optimal uyku saatine yaklaşıyorsunuz.',
          category: 'reminders',
          priority: 'default',
          color: '#9C27B0',
          sound: true,
        },
        priority: 6,
        cooldown: 1440, // 24 saat
        maxPerDay: 1,
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.notificationRules.set(rule.id, rule);
    });

    await this.saveSmartRules();
  }

  /**
   * Akıllı kuralları kaydeder
   */
  private static async saveSmartRules(): Promise<void> {
    try {
      const rules = Array.from(this.notificationRules.values());
      await AsyncStorage.setItem('smart_notification_rules', JSON.stringify(rules));
    } catch (error) {
      console.error('Akıllı kuralları kaydetme hatası:', error);
    }
  }

  /**
   * Kullanıcı bağlamını yükler
   */
  private static async loadUserContext(): Promise<void> {
    try {
      const contextData = await AsyncStorage.getItem('user_context');
      if (contextData) {
        this.userContext = JSON.parse(contextData);
      }
    } catch (error) {
      console.error('Kullanıcı bağlamını yükleme hatası:', error);
    }
  }

  /**
   * Kullanıcı bağlamını günceller
   */
  static async updateUserContext(context: Partial<UserContext>): Promise<void> {
    try {
      this.userContext = { ...this.userContext, ...context };
      await AsyncStorage.setItem('user_context', JSON.stringify(this.userContext));
      
      // Akıllı bildirimleri kontrol et
      await this.checkSmartNotifications();
    } catch (error) {
      console.error('Kullanıcı bağlamını güncelleme hatası:', error);
    }
  }

  /**
   * Analitik verilerini yükler
   */
  private static async loadAnalytics(): Promise<void> {
    try {
      const analyticsData = await AsyncStorage.getItem('notification_analytics');
      if (analyticsData) {
        this.analytics = JSON.parse(analyticsData);
      }
    } catch (error) {
      console.error('Analitik verilerini yükleme hatası:', error);
    }
  }

  /**
   * Analitik verilerini günceller
   */
  private static async updateAnalytics(): Promise<void> {
    try {
      // Engagement rate hesapla
      this.analytics.engagementRate = this.analytics.totalSent > 0 
        ? this.analytics.totalOpened / this.analytics.totalSent 
        : 0;

      await AsyncStorage.setItem('notification_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Analitik verilerini güncelleme hatası:', error);
    }
  }

  /**
   * Akıllı bildirimleri kontrol eder
   */
  static async checkSmartNotifications(): Promise<void> {
    try {
      const now = Date.now();
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();
      
      // Zaman bağlamını güncelle
      let timeOfDay = 'morning';
      if (currentHour >= 6 && currentHour < 12) timeOfDay = 'morning';
      else if (currentHour >= 12 && currentHour < 18) timeOfDay = 'afternoon';
      else if (currentHour >= 18 && currentHour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      this.userContext.timeOfDay = timeOfDay;
      this.userContext.dayOfWeek = dayOfWeek;

      // Kuralları kontrol et
      for (const [ruleId, rule] of this.notificationRules) {
        if (!rule.enabled) continue;

        // Cooldown kontrolü
        const lastTime = this.lastNotificationTimes.get(ruleId);
        if (lastTime && now - lastTime < (rule.cooldown || 0) * 60 * 1000) {
          continue;
        }

        // Günlük limit kontrolü
        const dailyCount = this.dailyNotificationCounts.get(ruleId) || 0;
        if (rule.maxPerDay && dailyCount >= rule.maxPerDay) {
          continue;
        }

        // Kural koşulunu kontrol et
        if (rule.condition(this.userContext, this.userContext)) {
          await this.sendNotification(rule.notification);
          
          // Zamanları güncelle
          this.lastNotificationTimes.set(ruleId, now);
          this.dailyNotificationCounts.set(ruleId, dailyCount + 1);
        }
      }

      // Günlük sayaçları sıfırla (gece yarısında)
      if (currentHour === 0) {
        this.dailyNotificationCounts.clear();
      }
    } catch (error) {
      console.error('Akıllı bildirim kontrol hatası:', error);
    }
  }

  /**
   * Bildirim gönderir
   */
  static async sendNotification(config: NotificationConfig): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data || {},
          sound: config.sound !== false,
          priority: config.priority || 'default',
          categoryIdentifier: config.category,
          color: config.color,
          badge: config.badge,
        },
        trigger: null, // Hemen gönder
      });

      this.analytics.totalSent++;
      await this.updateAnalytics();
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
    }
  }

  /**
   * Zamanlanmış bildirim gönderir
   */
  static async scheduleNotification(
    config: NotificationConfig,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data || {},
          sound: config.sound !== false,
          priority: config.priority || 'default',
          categoryIdentifier: config.category,
          color: config.color,
        },
        trigger,
      });
    } catch (error) {
      console.error('Zamanlanmış bildirim hatası:', error);
    }
  }

  /**
   * Tüm bildirimleri iptal eder
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Bildirimleri iptal etme hatası:', error);
    }
  }

  /**
   * Belirli bildirimi iptal eder
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Bildirimi iptal etme hatası:', error);
    }
  }

  /**
   * Bildirim ayarlarını günceller
   */
  static async updateNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      // Kuralları güncelle
      for (const [ruleId, rule] of this.notificationRules) {
        if (settings.disabledRules?.includes(ruleId)) {
          rule.enabled = false;
        } else if (settings.enabledRules?.includes(ruleId)) {
          rule.enabled = true;
        }
      }
      
      await this.saveSmartRules();
    } catch (error) {
      console.error('Bildirim ayarlarını güncelleme hatası:', error);
    }
  }

  /**
   * Bildirim istatistiklerini getirir
   */
  static getNotificationStats(): NotificationAnalytics {
    return { ...this.analytics };
  }

  /**
   * Akıllı kuralları getirir
   */
  static getSmartRules(): SmartNotificationRule[] {
    return Array.from(this.notificationRules.values());
  }

  /**
   * Kuralı günceller
   */
  static async updateRule(ruleId: string, updates: Partial<SmartNotificationRule>): Promise<void> {
    try {
      const rule = this.notificationRules.get(ruleId);
      if (rule) {
        Object.assign(rule, updates);
        await this.saveSmartRules();
      }
    } catch (error) {
      console.error('Kuralı güncelleme hatası:', error);
    }
  }

  /**
   * Servisi temizler
   */
  static async cleanup(): Promise<void> {
    try {
      await this.cancelAllNotifications();
      this.notificationRules.clear();
      this.lastNotificationTimes.clear();
      this.dailyNotificationCounts.clear();
      this.isInitialized = false;
    } catch (error) {
      console.error('Servis temizleme hatası:', error);
    }
  }
}


