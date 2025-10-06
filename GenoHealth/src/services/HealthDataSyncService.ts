// Basit sağlık veri senkronizasyon servisi
// HealthKit (iOS) ve Google Fit (Android) entegrasyonu

export interface HealthData {
  id: string;
  type: 'steps' | 'heartRate' | 'sleep' | 'weight' | 'calories' | 'distance';
  value: number;
  unit: string;
  date: Date;
  source: 'manual' | 'healthkit' | 'googlefit' | 'device';
  geneticOptimized?: boolean;
}

export interface HealthSyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  dataCount: number;
  platform: 'ios' | 'android' | 'unknown';
  permissions: {
    steps: boolean;
    heartRate: boolean;
    sleep: boolean;
    weight: boolean;
  };
}

export interface GeneticHealthInsight {
  type: string;
  currentValue: number;
  geneticOptimal: number;
  recommendation: string;
  geneticBasis: string;
  confidence: number;
}

export class HealthDataSyncService {
  private static healthData: HealthData[] = [];
  private static syncStatus: HealthSyncStatus = {
    isConnected: false,
    lastSync: null,
    dataCount: 0,
    platform: 'unknown',
    permissions: {
      steps: false,
      heartRate: false,
      sleep: false,
      weight: false
    }
  };

  /**
   * Sağlık veri senkronizasyon servisini başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      // Platform tespiti
      this.detectPlatform();
      
      // Varsayılan verileri oluştur
      this.initializeMockData();
      
      // Senkronizasyon durumunu güncelle
      this.syncStatus.isConnected = true;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.dataCount = this.healthData.length;
      
      console.log('Health Data Sync Service initialized!');
      return true;
    } catch (error) {
      console.error('Health sync initialization error:', error);
      return false;
    }
  }

  /**
   * Platform tespiti yapar
   */
  private static detectPlatform(): void {
    // React Native'de platform tespiti
    const Platform = require('react-native').Platform;
    this.syncStatus.platform = Platform.OS === 'ios' ? 'ios' : 'android';
  }

  /**
   * Varsayılan sağlık verilerini oluşturur
   */
  private static initializeMockData(): void {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

    this.healthData = [
      // Adım sayısı verileri
      {
        id: 'steps_1',
        type: 'steps',
        value: 8500,
        unit: 'steps',
        date: today,
        source: 'healthkit',
        geneticOptimized: true
      },
      {
        id: 'steps_2',
        type: 'steps',
        value: 9200,
        unit: 'steps',
        date: yesterday,
        source: 'googlefit',
        geneticOptimized: true
      },
      
      // Kalp atış hızı verileri
      {
        id: 'heart_1',
        type: 'heartRate',
        value: 72,
        unit: 'bpm',
        date: today,
        source: 'healthkit',
        geneticOptimized: true
      },
      
      // Uyku verileri
      {
        id: 'sleep_1',
        type: 'sleep',
        value: 7.5,
        unit: 'hours',
        date: today,
        source: 'device',
        geneticOptimized: true
      },
      
      // Kilo verileri
      {
        id: 'weight_1',
        type: 'weight',
        value: 75.2,
        unit: 'kg',
        date: today,
        source: 'manual',
        geneticOptimized: false
      },
      
      // Kalori verileri
      {
        id: 'calories_1',
        type: 'calories',
        value: 2100,
        unit: 'kcal',
        date: today,
        source: 'healthkit',
        geneticOptimized: true
      },
      
      // Mesafe verileri
      {
        id: 'distance_1',
        type: 'distance',
        value: 6.2,
        unit: 'km',
        date: today,
        source: 'googlefit',
        geneticOptimized: true
      }
    ];
  }

  /**
   * Sağlık verilerini getirir
   */
  static getHealthData(type?: string): HealthData[] {
    if (type) {
      return this.healthData.filter(data => data.type === type);
    }
    return this.healthData;
  }

  /**
   * Son 7 günün verilerini getirir
   */
  static getLastWeekData(type?: string): HealthData[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let filteredData = this.healthData.filter(data => data.date >= oneWeekAgo);
    
    if (type) {
      filteredData = filteredData.filter(data => data.type === type);
    }
    
    return filteredData.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Günlük ortalama hesaplar
   */
  static getDailyAverage(type: string, days: number = 7): number {
    const data = this.getLastWeekData(type);
    if (data.length === 0) return 0;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return total / data.length;
  }

  /**
   * Genetik sağlık içgörüleri oluşturur
   */
  static generateGeneticInsights(): GeneticHealthInsight[] {
    const insights: GeneticHealthInsight[] = [];
    
    // Adım sayısı analizi
    const stepsData = this.getLastWeekData('steps');
    const avgSteps = this.getDailyAverage('steps');
    
    if (stepsData.length > 0) {
      insights.push({
        type: 'Adım Sayısı',
        currentValue: avgSteps,
        geneticOptimal: 10000, // Genetik optimal değer
        recommendation: avgSteps < 10000 
          ? 'Genetik profilinize göre günde 10.000 adım hedefleyin. COMT geniniz yavaş metabolizma tipi, daha fazla hareket gerekli.'
          : 'Mükemmel! Genetik ihtiyacınızı karşılıyorsunuz.',
        geneticBasis: 'COMT geni - Yavaş metabolizma tipi',
        confidence: 85
      });
    }
    
    // Kalp atış hızı analizi
    const heartData = this.getLastWeekData('heartRate');
    const avgHeartRate = this.getDailyAverage('heartRate');
    
    if (heartData.length > 0) {
      insights.push({
        type: 'Kalp Atış Hızı',
        currentValue: avgHeartRate,
        geneticOptimal: 65, // Genetik optimal değer
        recommendation: avgHeartRate > 80
          ? 'Kalp atış hızınız yüksek. ADRB2 geniniz stres duyarlılığı gösteriyor, meditasyon ve nefes egzersizleri önerilir.'
          : 'Kalp sağlığınız genetik profilinize uygun.',
        geneticBasis: 'ADRB2 geni - Stres duyarlılığı',
        confidence: 90
      });
    }
    
    // Uyku analizi
    const sleepData = this.getLastWeekData('sleep');
    const avgSleep = this.getDailyAverage('sleep');
    
    if (sleepData.length > 0) {
      insights.push({
        type: 'Uyku Süresi',
        currentValue: avgSleep,
        geneticOptimal: 8, // Genetik optimal değer
        recommendation: avgSleep < 7
          ? 'Uyku süreniz yetersiz. PER3 geniniz erken kuş tipi, 22:00-06:00 arası uyku önerilir.'
          : 'Uyku düzeniniz genetik kronotipinize uygun.',
        geneticBasis: 'PER3 geni - Erken kuş kronotipi',
        confidence: 88
      });
    }
    
    return insights;
  }

  /**
   * Sağlık verisi ekler
   */
  static addHealthData(data: Omit<HealthData, 'id'>): HealthData {
    const newData: HealthData = {
      ...data,
      id: `${data.type}_${Date.now()}`
    };
    
    this.healthData.push(newData);
    this.syncStatus.dataCount = this.healthData.length;
    this.syncStatus.lastSync = new Date();
    
    return newData;
  }

  /**
   * Senkronizasyon durumunu getirir
   */
  static getSyncStatus(): HealthSyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Platform özel senkronizasyon simülasyonu
   */
  static async syncWithPlatform(): Promise<boolean> {
    try {
      // Simüle edilmiş senkronizasyon
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Yeni veriler ekle (simülasyon)
      const newData = this.generateRandomHealthData();
      this.healthData.push(...newData);
      
      this.syncStatus.lastSync = new Date();
      this.syncStatus.dataCount = this.healthData.length;
      
      return true;
    } catch (error) {
      console.error('Platform sync error:', error);
      return false;
    }
  }

  /**
   * Rastgele sağlık verisi oluşturur (simülasyon)
   */
  private static generateRandomHealthData(): HealthData[] {
    const today = new Date();
    const data: HealthData[] = [];
    
    // Rastgele adım sayısı
    data.push({
      id: `steps_${Date.now()}`,
      type: 'steps',
      value: Math.floor(Math.random() * 3000) + 7000, // 7000-10000 arası
      unit: 'steps',
      date: today,
      source: this.syncStatus.platform === 'ios' ? 'healthkit' : 'googlefit',
      geneticOptimized: true
    });
    
    // Rastgele kalp atış hızı
    data.push({
      id: `heart_${Date.now()}`,
      type: 'heartRate',
      value: Math.floor(Math.random() * 20) + 60, // 60-80 arası
      unit: 'bpm',
      date: today,
      source: this.syncStatus.platform === 'ios' ? 'healthkit' : 'googlefit',
      geneticOptimized: true
    });
    
    return data;
  }

  /**
   * Sağlık verilerini temizler
   */
  static clearOldData(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.healthData = this.healthData.filter(data => data.date >= cutoffDate);
    this.syncStatus.dataCount = this.healthData.length;
  }

  /**
   * Veri istatistiklerini getirir
   */
  static getDataStatistics(): {
    totalRecords: number;
    dataByType: { [key: string]: number };
    dataBySource: { [key: string]: number };
    geneticOptimizedCount: number;
    lastSyncDays: number;
  } {
    const dataByType: { [key: string]: number } = {};
    const dataBySource: { [key: string]: number } = {};
    let geneticOptimizedCount = 0;
    
    this.healthData.forEach(data => {
      dataByType[data.type] = (dataByType[data.type] || 0) + 1;
      dataBySource[data.source] = (dataBySource[data.source] || 0) + 1;
      if (data.geneticOptimized) geneticOptimizedCount++;
    });
    
    const lastSyncDays = this.syncStatus.lastSync 
      ? Math.floor((Date.now() - this.syncStatus.lastSync.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return {
      totalRecords: this.healthData.length,
      dataByType,
      dataBySource,
      geneticOptimizedCount,
      lastSyncDays
    };
  }

  /**
   * Sağlık hedeflerini günceller
   */
  static updateHealthGoals(goals: { [key: string]: number }): void {
    // Bu fonksiyon sağlık hedeflerini günceller
    // Şimdilik basit bir implementasyon
    console.log('Health goals updated:', goals);
  }

  /**
   * Veri kalitesi kontrolü
   */
  static validateDataQuality(): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;
    
    // Veri sayısı kontrolü
    if (this.healthData.length < 10) {
      issues.push('Yetersiz veri miktarı');
      score -= 20;
    }
    
    // Güncel veri kontrolü
    const lastData = this.healthData.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    if (lastData) {
      const daysSinceLastData = Math.floor((Date.now() - lastData.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastData > 3) {
        issues.push('Güncel veri eksik');
        score -= 15;
      }
    }
    
    // Genetik optimizasyon kontrolü
    const geneticOptimizedRatio = this.healthData.filter(d => d.geneticOptimized).length / this.healthData.length;
    if (geneticOptimizedRatio < 0.5) {
      issues.push('Düşük genetik optimizasyon oranı');
      score -= 10;
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }
}


