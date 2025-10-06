/**
 * Gelişmiş Push Notification Servisi
 * Kullanıcılara kişiselleştirilmiş bildirimler gönderir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Bildirim türleri
export type NotificationType = 
  | 'dna_analysis_complete'
  | 'daily_health_tip'
  | 'nutrition_reminder'
  | 'exercise_reminder'
  | 'sleep_reminder'
  | 'supplement_reminder'
  | 'health_checkup'
  | 'app_update'
  | 'premium_feature'
  | 'family_analysis'
  | 'weekly_report'
  | 'monthly_insights';

// Bildirim öncelik seviyeleri
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Bildirim verisi
export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority: NotificationPriority;
  scheduledTime?: Date;
  repeatInterval?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  category?: string;
  sound?: string;
  badge?: number;
  color?: string;
  icon?: string;
  largeIcon?: string;
  vibrate?: boolean;
  silent?: boolean;
  sticky?: boolean;
  autoCancel?: boolean;
  ongoing?: boolean;
  localOnly?: boolean;
  tag?: string;
  group?: string;
  sortKey?: string;
  visibility?: 'public' | 'private' | 'secret';
  lights?: boolean;
  lightColor?: string;
  lightOnMs?: number;
  lightOffMs?: number;
  when?: number;
  usesChronometer?: boolean;
  showTimestamp?: boolean;
  progress?: number;
  progressMax?: number;
  progressIndeterminate?: boolean;
  number?: number;
  ticker?: string;
  subText?: string;
  style?: 'default' | 'bigtext' | 'inbox' | 'bigpicture' | 'media';
  bigText?: string;
  bigPicture?: string;
  inboxStyle?: {
    summaryText?: string;
    title?: string;
    lines: string[];
  };
  mediaStyle?: {
    title?: string;
    subtitle?: string;
    description?: string;
    htmlDescription?: string;
    largeIcon?: string;
    contentUri?: string;
    metadata?: any;
  };
}

// Bildirim ayarları
export interface NotificationSettings {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  frequency: 'low' | 'medium' | 'high';
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  priority: NotificationPriority;
  categories: string[];
}

// Bildirim istatistikleri
export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalDismissed: number;
  deliveryRate: number;
  openRate: number;
  lastSent?: Date;
  mostPopularType?: NotificationType;
  averageOpenTime?: number; // seconds
}

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings;
  private stats: NotificationStats;
  private isInitialized = false;
  private expoPushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.settings = this.getDefaultSettings();
    this.stats = this.getDefaultStats();
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Bildirim izinlerini iste
      await this.requestPermissions();

      // Expo push token al
      await this.registerForPushNotifications();

      // Ayarları yükle
      await this.loadSettings();

      // İstatistikleri yükle
      await this.loadStats();

      // Bildirim handler'ları ayarla
      this.setupNotificationHandlers();

      this.isInitialized = true;
      console.log('Notification Service initialized!');
      return true;
    } catch (error) {
      console.error('Notification service initialization error:', error);
      return false;
    }
  }

  /**
   * Bildirim izinlerini ister
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Bildirim İzni',
          'Bildirimleri alabilmek için lütfen izin verin.',
          [{ text: 'Tamam' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Push notification token'ı alır
   */
  private async registerForPushNotifications(): Promise<void> {
    // Push notifications devre dışı - development için
    console.log('🔕 Push notifications devre dışı (development)');
    return;
  }

  /**
   * Bildirim handler'larını ayarlar
   */
  private setupNotificationHandlers(): void {
    // Bildirim geldiğinde
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.updateStats('delivered');
    });

    // Bildirime tıklandığında
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.updateStats('opened');
      this.handleNotificationResponse(response);
    });

    // Bildirim ayarları
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: this.settings.sound,
        shouldSetBadge: this.settings.badge,
      }),
    });
  }

  /**
   * Bildirim gönderir
   */
  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    // Push notifications devre dışı - development için
    console.log('🔕 Notification devre dışı (development):', notificationData.title);
    return true;
  }

  /**
   * DNA analiz tamamlandı bildirimi
   */
  async sendDNAAnalysisCompleteNotification(analysisData: any): Promise<boolean> {
    const notification: NotificationData = {
      id: `dna_analysis_${Date.now()}`,
      type: 'dna_analysis_complete',
      title: '🧬 DNA Analiziniz Hazır!',
      body: `Analiz tamamlandı. Sağlık skorunuz: ${analysisData.overallHealthScore}/100. Detayları görüntüleyin.`,
      data: { analysisId: analysisData.analysisId },
      priority: 'high',
      category: 'dna_analysis',
      color: '#4CAF50',
      icon: 'dna',
      bigText: `DNA analiziniz başarıyla tamamlandı!\n\n` +
               `📊 Sağlık Skoru: ${analysisData.overallHealthScore}/100\n` +
               `🔬 Güvenilirlik: %${Math.round(analysisData.confidence * 100)}\n` +
               `📈 Varyant Sayısı: ${analysisData.totalVariants}\n` +
               `🎯 Kanıt Seviyesi: ${analysisData.evidenceLevel}\n\n` +
               `Kişiselleştirilmiş önerilerinizi görüntülemek için dokunun.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Günlük sağlık ipucu bildirimi
   */
  async sendDailyHealthTipNotification(tip: string): Promise<boolean> {
    const notification: NotificationData = {
      id: `daily_tip_${Date.now()}`,
      type: 'daily_health_tip',
      title: '💡 Günlük Sağlık İpucu',
      body: tip,
      priority: 'normal',
      category: 'health_tip',
      color: '#2196F3',
      icon: 'bulb',
      bigText: `Günlük Sağlık İpucu\n\n${tip}\n\nBu ipucu genetik profilinize göre kişiselleştirilmiştir.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Beslenme hatırlatması bildirimi
   */
  async sendNutritionReminderNotification(meal: string, recommendation: string): Promise<boolean> {
    const notification: NotificationData = {
      id: `nutrition_${Date.now()}`,
      type: 'nutrition_reminder',
      title: `🍽️ ${meal} Zamanı!`,
      body: recommendation,
      priority: 'normal',
      category: 'nutrition',
      color: '#FF9800',
      icon: 'restaurant',
      bigText: `${meal} Zamanı!\n\n${recommendation}\n\nBu öneri genetik metabolizma profilinize göre hazırlanmıştır.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Egzersiz hatırlatması bildirimi
   */
  async sendExerciseReminderNotification(exercise: string, duration: string): Promise<boolean> {
    const notification: NotificationData = {
      id: `exercise_${Date.now()}`,
      type: 'exercise_reminder',
      title: '💪 Egzersiz Zamanı!',
      body: `${exercise} - ${duration}`,
      priority: 'normal',
      category: 'exercise',
      color: '#E91E63',
      icon: 'fitness',
      bigText: `Egzersiz Zamanı!\n\n${exercise}\nSüre: ${duration}\n\nBu egzersiz genetik yapınıza en uygun seçilmiştir.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Uyku hatırlatması bildirimi
   */
  async sendSleepReminderNotification(bedtime: string, tip: string): Promise<boolean> {
    const notification: NotificationData = {
      id: `sleep_${Date.now()}`,
      type: 'sleep_reminder',
      title: '😴 Uyku Zamanı',
      body: `Yatma saati: ${bedtime}\n${tip}`,
      priority: 'normal',
      category: 'sleep',
      color: '#9C27B0',
      icon: 'moon',
      bigText: `Uyku Zamanı\n\nYatma saati: ${bedtime}\n\n${tip}\n\nBu öneri genetik uyku profilinize göre hazırlanmıştır.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Takviye hatırlatması bildirimi
   */
  async sendSupplementReminderNotification(supplement: string, dosage: string): Promise<boolean> {
    const notification: NotificationData = {
      id: `supplement_${Date.now()}`,
      type: 'supplement_reminder',
      title: '💊 Takviye Zamanı',
      body: `${supplement} - ${dosage}`,
      priority: 'normal',
      category: 'supplement',
      color: '#00BCD4',
      icon: 'medical',
      bigText: `Takviye Zamanı\n\n${supplement}\nDoz: ${dosage}\n\nBu takviye genetik ihtiyaçlarınıza göre önerilmiştir.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Haftalık rapor bildirimi
   */
  async sendWeeklyReportNotification(stats: any): Promise<boolean> {
    const notification: NotificationData = {
      id: `weekly_report_${Date.now()}`,
      type: 'weekly_report',
      title: '📊 Haftalık Sağlık Raporunuz',
      body: `Bu hafta ${stats.completedGoals} hedefinizi tamamladınız!`,
      priority: 'normal',
      category: 'report',
      color: '#4CAF50',
      icon: 'analytics',
      bigText: `Haftalık Sağlık Raporunuz\n\n` +
               `✅ Tamamlanan Hedefler: ${stats.completedGoals}\n` +
               `📈 Sağlık Skoru: ${stats.healthScore}/100\n` +
               `🏃 Egzersiz Günleri: ${stats.exerciseDays}\n` +
               `🍎 Beslenme Puanı: ${stats.nutritionScore}/100\n\n` +
               `Detaylı raporu görüntülemek için dokunun.`,
      style: 'bigtext',
      autoCancel: true,
    };

    return await this.sendNotification(notification);
  }

  /**
   * Zamanlanmış bildirim oluşturur
   */
  async scheduleNotification(
    notificationData: NotificationData,
    triggerDate: Date,
    repeatInterval?: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): Promise<boolean> {
    try {
      notificationData.scheduledTime = triggerDate;
      notificationData.repeatInterval = repeatInterval;
      return await this.sendNotification(notificationData);
    } catch (error) {
      console.error('Schedule notification error:', error);
      return false;
    }
  }

  /**
   * Tüm bildirimleri iptal eder
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Cancel notifications error:', error);
    }
  }

  /**
   * Belirli bildirimi iptal eder
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  /**
   * Bildirim ayarlarını günceller
   */
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
      console.log('Notification settings updated');
    } catch (error) {
      console.error('Update settings error:', error);
    }
  }

  /**
   * Ayarları yükler
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  }

  /**
   * İstatistikleri yükler
   */
  private async loadStats(): Promise<void> {
    try {
      const savedStats = await AsyncStorage.getItem('notificationStats');
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  /**
   * İstatistikleri günceller
   */
  private async updateStats(action: 'sent' | 'delivered' | 'opened' | 'dismissed'): Promise<void> {
    try {
      switch (action) {
        case 'sent':
          this.stats.totalSent++;
          this.stats.lastSent = new Date();
          break;
        case 'delivered':
          this.stats.totalDelivered++;
          break;
        case 'opened':
          this.stats.totalOpened++;
          break;
        case 'dismissed':
          this.stats.totalDismissed++;
          break;
      }

      // Oranları hesapla
      this.stats.deliveryRate = this.stats.totalSent > 0 
        ? (this.stats.totalDelivered / this.stats.totalSent) * 100 
        : 0;
      
      this.stats.openRate = this.stats.totalDelivered > 0 
        ? (this.stats.totalOpened / this.stats.totalDelivered) * 100 
        : 0;

      await AsyncStorage.setItem('notificationStats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Update stats error:', error);
    }
  }

  /**
   * Bildirim yanıtını işler
   */
  private handleNotificationResponse(response: any): void {
    const { notification } = response;
    const { type, data } = notification.request.content;

    console.log('Handling notification response:', type, data);

    // Bildirim türüne göre işlem yap
    switch (type) {
      case 'dna_analysis_complete':
        // DNA analiz sayfasına git
        break;
      case 'daily_health_tip':
        // Günlük ipuçları sayfasına git
        break;
      case 'nutrition_reminder':
        // Beslenme sayfasına git
        break;
      case 'exercise_reminder':
        // Egzersiz sayfasına git
        break;
      case 'sleep_reminder':
        // Uyku sayfasına git
        break;
      case 'supplement_reminder':
        // Takviyeler sayfasına git
        break;
      case 'weekly_report':
        // Rapor sayfasına git
        break;
    }
  }

  /**
   * Sessiz saatleri kontrol eder
   */
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.timeToMinutes(this.settings.quietHours.start);
    const endTime = this.timeToMinutes(this.settings.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Saat:dakika formatını dakikaya çevirir
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Android öncelik seviyesini döndürür
   */
  private getAndroidPriority(priority: NotificationPriority): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'low': return Notifications.AndroidNotificationPriority.LOW;
      case 'normal': return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'high': return Notifications.AndroidNotificationPriority.HIGH;
      case 'urgent': return Notifications.AndroidNotificationPriority.MAX;
      default: return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  /**
   * Tekrar aralığını saniyeye çevirir
   */
  private getRepeatIntervalSeconds(interval?: string): number | undefined {
    if (!interval) return undefined;
    
    switch (interval) {
      case 'hourly': return 3600;
      case 'daily': return 86400;
      case 'weekly': return 604800;
      case 'monthly': return 2592000;
      default: return undefined;
    }
  }

  /**
   * Varsayılan ayarları döndürür
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      types: {
        dna_analysis_complete: true,
        daily_health_tip: true,
        nutrition_reminder: true,
        exercise_reminder: true,
        sleep_reminder: true,
        supplement_reminder: true,
        health_checkup: true,
        app_update: true,
        premium_feature: true,
        family_analysis: true,
        weekly_report: true,
        monthly_insights: true,
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'medium',
      sound: true,
      vibration: true,
      badge: true,
      priority: 'normal',
      categories: ['dna_analysis', 'health_tip', 'nutrition', 'exercise', 'sleep', 'supplement', 'report'],
    };
  }

  /**
   * Varsayılan istatistikleri döndürür
   */
  private getDefaultStats(): NotificationStats {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalDismissed: 0,
      deliveryRate: 0,
      openRate: 0,
    };
  }

  /**
   * Mevcut ayarları döndürür
   */
  getSettings(): NotificationSettings {
    return this.settings;
  }

  /**
   * Mevcut istatistikleri döndürür
   */
  getStats(): NotificationStats {
    return this.stats;
  }

  /**
   * Expo push token'ı döndürür
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}
