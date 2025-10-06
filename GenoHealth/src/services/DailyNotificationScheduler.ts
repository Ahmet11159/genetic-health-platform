/**
 * Günlük Bildirim Zamanlayıcı Servisi
 * Kullanıcılara düzenli bildirimler gönderir
 */

import { NotificationService } from './NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyNotificationSchedule {
  id: string;
  type: 'daily_health_tip' | 'nutrition_reminder' | 'exercise_reminder' | 'sleep_reminder' | 'supplement_reminder';
  time: string; // HH:MM format
  enabled: boolean;
  lastSent?: Date;
  nextScheduled?: Date;
}

export interface NotificationContent {
  dailyHealthTips: string[];
  nutritionReminders: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snack: string[];
  };
  exerciseReminders: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  sleepReminders: {
    bedtime: string[];
    preparation: string[];
  };
  supplementReminders: {
    morning: string[];
    evening: string[];
  };
}

export class DailyNotificationScheduler {
  private static instance: DailyNotificationScheduler;
  private notificationService: NotificationService;
  private schedules: DailyNotificationSchedule[] = [];
  private content: NotificationContent;
  private isInitialized = false;

  static getInstance(): DailyNotificationScheduler {
    if (!DailyNotificationScheduler.instance) {
      DailyNotificationScheduler.instance = new DailyNotificationScheduler();
    }
    return DailyNotificationScheduler.instance;
  }

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.content = this.getDefaultContent();
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Bildirim servisini başlat
      await this.notificationService.initialize();

      // Zamanlamaları yükle
      await this.loadSchedules();

      // Varsayılan zamanlamaları oluştur
      if (this.schedules.length === 0) {
        await this.createDefaultSchedules();
      }

      // Zamanlanmış bildirimleri ayarla
      await this.scheduleAllNotifications();

      this.isInitialized = true;
      console.log('Daily Notification Scheduler initialized!');
      return true;
    } catch (error) {
      console.error('Daily notification scheduler initialization error:', error);
      return false;
    }
  }

  /**
   * Varsayılan zamanlamaları oluşturur
   */
  private async createDefaultSchedules(): Promise<void> {
    const defaultSchedules: DailyNotificationSchedule[] = [
      {
        id: 'daily_health_tip',
        type: 'daily_health_tip',
        time: '09:00',
        enabled: true,
      },
      {
        id: 'breakfast_reminder',
        type: 'nutrition_reminder',
        time: '08:00',
        enabled: true,
      },
      {
        id: 'lunch_reminder',
        type: 'nutrition_reminder',
        time: '13:00',
        enabled: true,
      },
      {
        id: 'dinner_reminder',
        type: 'nutrition_reminder',
        time: '19:00',
        enabled: true,
      },
      {
        id: 'morning_exercise',
        type: 'exercise_reminder',
        time: '07:00',
        enabled: true,
      },
      {
        id: 'evening_exercise',
        type: 'exercise_reminder',
        time: '18:00',
        enabled: true,
      },
      {
        id: 'sleep_reminder',
        type: 'sleep_reminder',
        time: '22:00',
        enabled: true,
      },
      {
        id: 'morning_supplements',
        type: 'supplement_reminder',
        time: '08:30',
        enabled: true,
      },
      {
        id: 'evening_supplements',
        type: 'supplement_reminder',
        time: '20:00',
        enabled: true,
      },
    ];

    this.schedules = defaultSchedules;
    await this.saveSchedules();
  }

  /**
   * Tüm zamanlanmış bildirimleri ayarlar
   */
  private async scheduleAllNotifications(): Promise<void> {
    for (const schedule of this.schedules) {
      if (schedule.enabled) {
        await this.scheduleNotification(schedule);
      }
    }
  }

  /**
   * Belirli bir bildirimi zamanlar
   */
  private async scheduleNotification(schedule: DailyNotificationSchedule): Promise<void> {
    try {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Eğer zaman geçmişse, ertesi güne ayarla
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      // Bildirim içeriğini oluştur
      const content = await this.getNotificationContent(schedule.type);
      if (!content) return;

      // Bildirimi zamanla
      await this.notificationService.scheduleNotification(
        {
          id: schedule.id,
          type: schedule.type,
          title: content.title,
          body: content.body,
          priority: 'normal',
          category: schedule.type,
          data: { scheduleId: schedule.id },
        },
        scheduledTime,
        'daily'
      );

      // Zamanlamayı güncelle
      schedule.nextScheduled = scheduledTime;
      await this.saveSchedules();

      console.log(`Scheduled ${schedule.type} for ${scheduledTime.toLocaleString()}`);
    } catch (error) {
      console.error(`Schedule notification error for ${schedule.type}:`, error);
    }
  }

  /**
   * Bildirim içeriğini oluşturur
   */
  private async getNotificationContent(type: string): Promise<{ title: string; body: string } | null> {
    const randomIndex = Math.floor(Math.random() * 3); // 0-2 arası rastgele sayı

    switch (type) {
      case 'daily_health_tip':
        return {
          title: '💡 Günlük Sağlık İpucu',
          body: this.content.dailyHealthTips[randomIndex],
        };

      case 'nutrition_reminder':
        const meal = this.getCurrentMeal();
        const nutritionTips = this.content.nutritionReminders[meal];
        return {
          title: `🍽️ ${meal === 'breakfast' ? 'Kahvaltı' : meal === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'} Zamanı`,
          body: nutritionTips[randomIndex],
        };

      case 'exercise_reminder':
        const timeOfDay = this.getTimeOfDay();
        const exerciseTips = this.content.exerciseReminders[timeOfDay];
        return {
          title: '💪 Egzersiz Zamanı!',
          body: exerciseTips[randomIndex],
        };

      case 'sleep_reminder':
        return {
          title: '😴 Uyku Zamanı',
          body: this.content.sleepReminders.bedtime[randomIndex],
        };

      case 'supplement_reminder':
        const supplementTime = this.getSupplementTime();
        const supplementTips = this.content.supplementReminders[supplementTime];
        return {
          title: '💊 Takviye Zamanı',
          body: supplementTips[randomIndex],
        };

      default:
        return null;
    }
  }

  /**
   * Mevcut öğünü belirler
   */
  private getCurrentMeal(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 19) return 'snack';
    return 'dinner';
  }

  /**
   * Günün zamanını belirler
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Takviye zamanını belirler
   */
  private getSupplementTime(): 'morning' | 'evening' {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : 'evening';
  }

  /**
   * Zamanlamaları yükler
   */
  private async loadSchedules(): Promise<void> {
    try {
      const savedSchedules = await AsyncStorage.getItem('dailyNotificationSchedules');
      if (savedSchedules) {
        this.schedules = JSON.parse(savedSchedules);
      }
    } catch (error) {
      console.error('Load schedules error:', error);
    }
  }

  /**
   * Zamanlamaları kaydeder
   */
  private async saveSchedules(): Promise<void> {
    try {
      await AsyncStorage.setItem('dailyNotificationSchedules', JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Save schedules error:', error);
    }
  }

  /**
   * Varsayılan içerikleri döndürür
   */
  private getDefaultContent(): NotificationContent {
    return {
      dailyHealthTips: [
        'Günde en az 8 bardak su içmeyi unutmayın. Hidrasyon genel sağlığınız için çok önemli.',
        'Düzenli egzersiz yapmak sadece fiziksel değil, mental sağlığınız için de faydalıdır.',
        'Yeterli uyku almak bağışıklık sisteminizi güçlendirir ve stres seviyenizi azaltır.',
        'Taze meyve ve sebze tüketmek antioksidan alımınızı artırır.',
        'Meditasyon ve derin nefes egzersizleri stres yönetiminde etkilidir.',
        'Sosyal bağlantılarınızı güçlü tutmak mental sağlığınız için önemlidir.',
        'Düzenli sağlık kontrolleri yaptırmak erken teşhis için kritiktir.',
        'Güneş ışığından yeterince faydalanmak D vitamini seviyenizi artırır.',
        'Kafein tüketimini öğleden sonra sınırlamak uyku kalitenizi artırır.',
        'Probiyotik içeren besinler bağırsak sağlığınızı destekler.',
      ],
      nutritionReminders: {
        breakfast: [
          'Kahvaltıda protein ve lif açısından zengin besinler tercih edin.',
          'Sabah kahvaltısında yumurta, tam tahıl ve taze meyve tüketin.',
          'Kahvaltıyı atlamak metabolizmanızı yavaşlatabilir.',
        ],
        lunch: [
          'Öğle yemeğinde renkli sebzeler ve yağsız protein tercih edin.',
          'Öğle yemeğinde tam tahıl karbonhidratlar tüketin.',
          'Öğle yemeğinde bol su içmeyi unutmayın.',
        ],
        dinner: [
          'Akşam yemeğinde hafif ve sindirimi kolay besinler tercih edin.',
          'Akşam yemeğini yatmadan 3 saat önce bitirin.',
          'Akşam yemeğinde sebze ağırlıklı beslenin.',
        ],
        snack: [
          'Ara öğünlerde kuruyemiş ve meyve tercih edin.',
          'Ara öğünlerde şekerli atıştırmalıklardan kaçının.',
          'Ara öğünlerde protein içeren besinler tüketin.',
        ],
      },
      exerciseReminders: {
        morning: [
          'Sabah egzersizi günün geri kalanında enerjinizi artırır.',
          'Sabah yürüyüşü yapmak güne iyi başlamanızı sağlar.',
          'Sabah yoga yapmak esnekliğinizi artırır.',
        ],
        afternoon: [
          'Öğleden sonra egzersiz yapmak stres seviyenizi azaltır.',
          'Öğleden sonra kısa yürüyüşler yapabilirsiniz.',
          'Öğleden sonra germe egzersizleri yapın.',
        ],
        evening: [
          'Akşam egzersizi günün stresini atmanızı sağlar.',
          'Akşam yürüyüşü yapmak uyku kalitenizi artırır.',
          'Akşam hafif egzersizler yapabilirsiniz.',
        ],
      },
      sleepReminders: {
        bedtime: [
          'Yatmadan 1 saat önce elektronik cihazları kapatın.',
          'Yatmadan önce rahatlatıcı aktiviteler yapın.',
          'Yatmadan önce ılık bir duş alın.',
        ],
        preparation: [
          'Yatak odanızı serin ve karanlık tutun.',
          'Yatmadan önce kafein tüketmeyin.',
          'Düzenli uyku saatleri belirleyin.',
        ],
      },
      supplementReminders: {
        morning: [
          'Sabah vitaminlerinizi yemekle birlikte alın.',
          'Sabah D vitamini almayı unutmayın.',
          'Sabah omega-3 takviyesi alın.',
        ],
        evening: [
          'Akşam magnezyum takviyesi alın.',
          'Akşam melatonin takviyesi uyku kalitenizi artırır.',
          'Akşam probiyotik takviyesi alın.',
        ],
      },
    };
  }

  /**
   * Zamanlamayı günceller
   */
  async updateSchedule(scheduleId: string, updates: Partial<DailyNotificationSchedule>): Promise<void> {
    try {
      const scheduleIndex = this.schedules.findIndex(s => s.id === scheduleId);
      if (scheduleIndex === -1) return;

      this.schedules[scheduleIndex] = { ...this.schedules[scheduleIndex], ...updates };
      await this.saveSchedules();

      // Eğer etkinleştirildiyse yeniden zamanla
      if (updates.enabled) {
        await this.scheduleNotification(this.schedules[scheduleIndex]);
      }
    } catch (error) {
      console.error('Update schedule error:', error);
    }
  }

  /**
   * Tüm zamanlamaları iptal eder
   */
  async cancelAllSchedules(): Promise<void> {
    try {
      await this.notificationService.cancelAllNotifications();
      this.schedules.forEach(schedule => {
        schedule.enabled = false;
        schedule.nextScheduled = undefined;
      });
      await this.saveSchedules();
    } catch (error) {
      console.error('Cancel all schedules error:', error);
    }
  }

  /**
   * Mevcut zamanlamaları döndürür
   */
  getSchedules(): DailyNotificationSchedule[] {
    return this.schedules;
  }

  /**
   * Manuel bildirim gönderir
   */
  async sendManualNotification(type: string): Promise<boolean> {
    try {
      const content = await this.getNotificationContent(type);
      if (!content) return false;

      return await this.notificationService.sendNotification({
        id: `manual_${type}_${Date.now()}`,
        type: type as any,
        title: content.title,
        body: content.body,
        priority: 'normal',
        category: type,
      });
    } catch (error) {
      console.error('Send manual notification error:', error);
      return false;
    }
  }
}

