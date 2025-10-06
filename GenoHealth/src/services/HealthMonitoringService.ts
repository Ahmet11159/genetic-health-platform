// Gerçek zamanlı sağlık takibi ve uyarı sistemi
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'reminder';
  title: string;
  message: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'medication' | 'checkup';
  priority: number; // 1-10 (10 = en yüksek)
  geneticBasis: string;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
  scheduledTime?: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  geneticFactors: string[];
}

export interface HealthGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: 'nutrition' | 'exercise' | 'sleep' | 'health';
  geneticOptimized: boolean;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'overdue';
}

export class HealthMonitoringService {
  private static alerts: HealthAlert[] = [];
  private static metrics: HealthMetric[] = [];
  private static goals: HealthGoal[] = [];
  private static isInitialized = false;

  /**
   * Sağlık takip servisini başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        // Bildirim izinlerini al
        await this.requestNotificationPermissions();
        
        // Varsayılan metrikleri oluştur
        this.initializeDefaultMetrics();
        
        // Varsayılan hedefleri oluştur
        this.initializeDefaultGoals();
        
        // Zamanlanmış uyarıları başlat
        this.schedulePeriodicAlerts();
        
        this.isInitialized = true;
        console.log('Health Monitoring Service initialized!');
      }
      return true;
    } catch (error) {
      console.error('Health monitoring initialization error:', error);
      return false;
    }
  }

  /**
   * Bildirim izinlerini ister
   */
  private static async requestNotificationPermissions(): Promise<void> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    }
  }

  /**
   * Varsayılan sağlık metriklerini oluşturur
   */
  private static initializeDefaultMetrics(): void {
    this.metrics = [
      {
        id: 'sleep_quality',
        name: 'Uyku Kalitesi',
        value: 85,
        unit: '%',
        target: 90,
        status: 'good',
        trend: 'up',
        lastUpdated: new Date(),
        geneticFactors: ['PER3', 'CLOCK']
      },
      {
        id: 'stress_level',
        name: 'Stres Seviyesi',
        value: 35,
        unit: '%',
        target: 20,
        status: 'warning',
        trend: 'down',
        lastUpdated: new Date(),
        geneticFactors: ['COMT', 'BDNF']
      },
      {
        id: 'energy_level',
        name: 'Enerji Seviyesi',
        value: 78,
        unit: '%',
        target: 85,
        status: 'good',
        trend: 'stable',
        lastUpdated: new Date(),
        geneticFactors: ['MTHFR', 'CYP1A2']
      },
      {
        id: 'hydration',
        name: 'Hidrasyon',
        value: 65,
        unit: '%',
        target: 80,
        status: 'warning',
        trend: 'up',
        lastUpdated: new Date(),
        geneticFactors: ['AQP2', 'ADH']
      }
    ];
  }

  /**
   * Varsayılan sağlık hedeflerini oluşturur
   */
  private static initializeDefaultGoals(): void {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.goals = [
      {
        id: 'sleep_goal',
        title: 'Uyku Kalitesi Hedefi',
        description: 'Genetik kronotipinize göre optimal uyku düzeni',
        target: 90,
        current: 85,
        unit: '%',
        deadline: nextWeek,
        category: 'sleep',
        geneticOptimized: true,
        progress: 94,
        status: 'active'
      },
      {
        id: 'nutrition_goal',
        title: 'Beslenme Hedefi',
        description: 'Genetik metabolizmanıza göre beslenme planı',
        target: 100,
        current: 75,
        unit: '%',
        deadline: nextMonth,
        category: 'nutrition',
        geneticOptimized: true,
        progress: 75,
        status: 'active'
      },
      {
        id: 'exercise_goal',
        title: 'Egzersiz Hedefi',
        description: 'Kas tipinize uygun antrenman programı',
        target: 5,
        current: 3,
        unit: 'gün/hafta',
        deadline: nextWeek,
        category: 'exercise',
        geneticOptimized: true,
        progress: 60,
        status: 'active'
      }
    ];
  }

  /**
   * Periyodik uyarıları zamanlar
   */
  private static schedulePeriodicAlerts(): void {
    // Günlük uyku uyarısı
    this.scheduleDailyAlert('sleep', 'Uyku Zamanı', 'Genetik kronotipinize göre uyku zamanı geldi!', 22, 0);
    
    // Haftalık sağlık kontrolü
    this.scheduleWeeklyAlert('checkup', 'Haftalık Sağlık Kontrolü', 'Genetik risk faktörlerinizi kontrol edin');
    
    // Beslenme hatırlatmaları
    this.scheduleMealReminders();
  }

  /**
   * Günlük uyarı zamanlar
   */
  private static scheduleDailyAlert(
    category: HealthAlert['category'],
    title: string,
    message: string,
    hour: number,
    minute: number
  ): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // Eğer bugünün saati geçtiyse, yarına al
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification({
      content: {
        title,
        body: message,
        data: { category, type: 'daily_reminder' }
      },
      trigger: {
        hour,
        minute,
        repeats: true
      }
    });
  }

  /**
   * Haftalık uyarı zamanlar
   */
  private static scheduleWeeklyAlert(
    category: HealthAlert['category'],
    title: string,
    message: string
  ): void {
    this.scheduleNotification({
      content: {
        title,
        body: message,
        data: { category, type: 'weekly_checkup' }
      },
      trigger: {
        weekday: 1, // Pazartesi
        hour: 9,
        minute: 0,
        repeats: true
      }
    });
  }

  /**
   * Yemek hatırlatmalarını zamanlar
   */
  private static scheduleMealReminders(): void {
    const mealTimes = [
      { time: '08:00', name: 'Kahvaltı', message: 'Genetik metabolizmanıza göre kahvaltı zamanı!' },
      { time: '12:00', name: 'Öğle Yemeği', message: 'Optimal beslenme için öğle yemeği zamanı' },
      { time: '15:00', name: 'Ara Öğün', message: 'Kan şekeri dengesi için ara öğün' },
      { time: '18:00', name: 'Akşam Yemeği', message: 'Genetik ihtiyaçlarınıza göre akşam yemeği' }
    ];

    mealTimes.forEach(meal => {
      const [hour, minute] = meal.time.split(':').map(Number);
      this.scheduleDailyAlert('nutrition', meal.name, meal.message, hour, minute);
    });
  }

  /**
   * Bildirim zamanlar
   */
  private static async scheduleNotification(notification: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync(notification);
    } catch (error) {
      console.error('Notification scheduling error:', error);
    }
  }

  /**
   * Genetik risk faktörlerine göre uyarı oluşturur
   */
  static async createGeneticAlert(
    geneticProfile: any,
    category: HealthAlert['category']
  ): Promise<HealthAlert | null> {
    try {
      let alert: HealthAlert | null = null;

      // Alzheimer riski kontrolü
      if (geneticProfile.riskFactors?.includes('Alzheimer')) {
        alert = {
          id: `genetic_${Date.now()}`,
          type: 'warning',
          title: 'Alzheimer Riski Uyarısı',
          message: 'APOE ε4 geniniz Alzheimer riskini artırıyor. Kardiyovasküler egzersiz ve Mediterranean diyeti önerilir.',
          category: 'checkup',
          priority: 8,
          geneticBasis: 'APOE ε4 geni',
          actionRequired: true,
          actionText: 'Doktor Konsültasyonu',
          isRead: false,
          createdAt: new Date()
        };
      }

      // Diyabet riski kontrolü
      if (geneticProfile.riskFactors?.includes('Diyabet')) {
        alert = {
          id: `genetic_${Date.now()}`,
          type: 'warning',
          title: 'Diyabet Riski Uyarısı',
          message: 'TCF7L2 geniniz Tip 2 diyabet riskini %40 artırıyor. Karbonhidrat sınırlaması ve düzenli egzersiz önerilir.',
          category: 'nutrition',
          priority: 7,
          geneticBasis: 'TCF7L2 geni',
          actionRequired: true,
          actionText: 'Beslenme Planı',
          isRead: false,
          createdAt: new Date()
        };
      }

      // Kalp hastalığı riski kontrolü
      if (geneticProfile.riskFactors?.includes('Kalp Hastalığı')) {
        alert = {
          id: `genetic_${Date.now()}`,
          type: 'critical',
          title: 'Kardiyovasküler Risk Uyarısı',
          message: '9p21 geniniz kalp hastalığı riskini %25 artırıyor. Acil yaşam tarzı değişiklikleri gerekli.',
          category: 'checkup',
          priority: 9,
          geneticBasis: '9p21 geni',
          actionRequired: true,
          actionText: 'Acil Doktor Randevusu',
          isRead: false,
          createdAt: new Date()
        };
      }

      if (alert) {
        this.alerts.push(alert);
        await this.sendNotification(alert);
      }

      return alert;
    } catch (error) {
      console.error('Genetic alert creation error:', error);
      return null;
    }
  }

  /**
   * Bildirim gönderir
   */
  private static async sendNotification(alert: HealthAlert): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.message,
          data: { alertId: alert.id, category: alert.category }
        },
        trigger: null // Hemen gönder
      });
    } catch (error) {
      console.error('Notification sending error:', error);
    }
  }

  /**
   * Sağlık metriklerini günceller
   */
  static updateMetric(metricId: string, value: number): void {
    const metric = this.metrics.find(m => m.id === metricId);
    if (metric) {
      metric.value = value;
      metric.lastUpdated = new Date();
      
      // Durumu güncelle
      if (value >= metric.target * 0.9) {
        metric.status = 'excellent';
      } else if (value >= metric.target * 0.7) {
        metric.status = 'good';
      } else if (value >= metric.target * 0.5) {
        metric.status = 'warning';
      } else {
        metric.status = 'critical';
      }

      // Kritik durumda uyarı oluştur
      if (metric.status === 'critical') {
        this.createMetricAlert(metric);
      }
    }
  }

  /**
   * Metrik uyarısı oluşturur
   */
  private static createMetricAlert(metric: HealthMetric): void {
    const alert: HealthAlert = {
      id: `metric_${metric.id}_${Date.now()}`,
      type: 'critical',
      title: `${metric.name} Kritik Seviyede`,
      message: `${metric.name} değeriniz ${metric.value}${metric.unit}, hedef ${metric.target}${metric.unit}. Acil önlem gerekli!`,
      category: 'checkup',
      priority: 9,
      geneticBasis: metric.geneticFactors.join(', '),
      actionRequired: true,
      actionText: 'Acil Müdahale',
      isRead: false,
      createdAt: new Date()
    };

    this.alerts.push(alert);
    this.sendNotification(alert);
  }

  /**
   * Hedef ilerlemesini günceller
   */
  static updateGoalProgress(goalId: string, progress: number): void {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      goal.current = progress;
      goal.progress = (progress / goal.target) * 100;
      goal.status = goal.progress >= 100 ? 'completed' : 'active';

      // Hedef tamamlandığında kutlama uyarısı
      if (goal.status === 'completed') {
        this.createGoalCompletionAlert(goal);
      }
    }
  }

  /**
   * Hedef tamamlama uyarısı oluşturur
   */
  private static createGoalCompletionAlert(goal: HealthGoal): void {
    const alert: HealthAlert = {
      id: `goal_${goal.id}_${Date.now()}`,
      type: 'info',
      title: '🎉 Hedef Tamamlandı!',
      message: `${goal.title} hedefinizi başarıyla tamamladınız! Genetik optimizasyonunuz çalışıyor.`,
      category: goal.category,
      priority: 5,
      geneticBasis: goal.geneticOptimized ? 'Genetik optimize edilmiş hedef' : 'Standart hedef',
      actionRequired: false,
      isRead: false,
      createdAt: new Date()
    };

    this.alerts.push(alert);
    this.sendNotification(alert);
  }

  /**
   * Tüm uyarıları getirir
   */
  static getAlerts(): HealthAlert[] {
    return this.alerts.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Okunmamış uyarıları getirir
   */
  static getUnreadAlerts(): HealthAlert[] {
    return this.alerts.filter(alert => !alert.isRead);
  }

  /**
   * Uyarıyı okundu olarak işaretler
   */
  static markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  /**
   * Sağlık metriklerini getirir
   */
  static getMetrics(): HealthMetric[] {
    return this.metrics;
  }

  /**
   * Sağlık hedeflerini getirir
   */
  static getGoals(): HealthGoal[] {
    return this.goals;
  }

  /**
   * Aktif hedefleri getirir
   */
  static getActiveGoals(): HealthGoal[] {
    return this.goals.filter(goal => goal.status === 'active');
  }

  /**
   * Sağlık durumu özetini getirir
   */
  static getHealthSummary(): {
    totalAlerts: number;
    unreadAlerts: number;
    criticalAlerts: number;
    activeGoals: number;
    completedGoals: number;
    averageMetricStatus: number;
  } {
    const unreadAlerts = this.getUnreadAlerts();
    const criticalAlerts = this.alerts.filter(a => a.type === 'critical').length;
    const activeGoals = this.getActiveGoals().length;
    const completedGoals = this.goals.filter(g => g.status === 'completed').length;
    
    const averageMetricStatus = this.metrics.reduce((sum, metric) => {
      const statusValue = metric.status === 'excellent' ? 4 : 
                         metric.status === 'good' ? 3 : 
                         metric.status === 'warning' ? 2 : 1;
      return sum + statusValue;
    }, 0) / this.metrics.length;

    return {
      totalAlerts: this.alerts.length,
      unreadAlerts: unreadAlerts.length,
      criticalAlerts,
      activeGoals,
      completedGoals,
      averageMetricStatus
    };
  }
}


