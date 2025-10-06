// Performans optimizasyon servisi
import { InteractionManager, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export interface PerformanceMetrics {
  appStartTime: number;
  screenLoadTimes: Map<string, number>;
  memoryUsage: number;
  cpuUsage: number;
  batteryLevel: number;
  networkLatency: number;
  renderTimes: Map<string, number>;
  userInteractions: number;
  crashes: number;
  errors: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableMemoryManagement: boolean;
  enableNetworkOptimization: boolean;
  enableRenderOptimization: boolean;
  enableCaching: boolean;
  maxCacheSize: number; // MB
  compressionLevel: number; // 0-9
  preloadThreshold: number; // ms
}

export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number; // time to live in ms
}

export class PerformanceOptimizationService {
  private static isInitialized = false;
  private static metrics: PerformanceMetrics = {
    appStartTime: 0,
    screenLoadTimes: new Map(),
    memoryUsage: 0,
    cpuUsage: 0,
    batteryLevel: 100,
    networkLatency: 0,
    renderTimes: new Map(),
    userInteractions: 0,
    crashes: 0,
    errors: 0,
  };
  private static config: OptimizationConfig = {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableMemoryManagement: true,
    enableNetworkOptimization: true,
    enableRenderOptimization: true,
    enableCaching: true,
    maxCacheSize: 100, // 100MB
    compressionLevel: 6,
    preloadThreshold: 100,
  };
  private static cache: Map<string, CacheItem> = new Map();
  private static preloadQueue: string[] = [];
  private static memoryPressureLevel: 'low' | 'medium' | 'high' = 'low';
  private static isLowPowerMode = false;
  private static networkType: 'wifi' | 'cellular' | 'unknown' = 'unknown';

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Uygulama başlangıç zamanını kaydet
      this.metrics.appStartTime = Date.now();

      // Konfigürasyonu yükle
      await this.loadConfig();

      // Metrikleri yükle
      await this.loadMetrics();

      // Cache'i yükle
      await this.loadCache();

      // Performans izleyicilerini başlat
      this.startPerformanceMonitoring();

      // Memory pressure izleyicisini başlat
      this.startMemoryPressureMonitoring();

      // Network izleyicisini başlat
      this.startNetworkMonitoring();

      // Battery izleyicisini başlat
      this.startBatteryMonitoring();

      this.isInitialized = true;
      console.log('Performans optimizasyon servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Performans servisi başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Konfigürasyonu yükler
   */
  private static async loadConfig(): Promise<void> {
    try {
      const configData = await AsyncStorage.getItem('performance_config');
      if (configData) {
        this.config = { ...this.config, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Konfigürasyon yükleme hatası:', error);
    }
  }

  /**
   * Konfigürasyonu kaydeder
   */
  static async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('performance_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Konfigürasyon kaydetme hatası:', error);
    }
  }

  /**
   * Metrikleri yükler
   */
  private static async loadMetrics(): Promise<void> {
    try {
      const metricsData = await AsyncStorage.getItem('performance_metrics');
      if (metricsData) {
        const parsed = JSON.parse(metricsData);
        this.metrics = {
          ...this.metrics,
          ...parsed,
          screenLoadTimes: new Map(parsed.screenLoadTimes || []),
          renderTimes: new Map(parsed.renderTimes || []),
        };
      }
    } catch (error) {
      console.error('Metrikleri yükleme hatası:', error);
    }
  }

  /**
   * Metrikleri kaydeder
   */
  private static async saveMetrics(): Promise<void> {
    try {
      const metricsToSave = {
        ...this.metrics,
        screenLoadTimes: Array.from(this.metrics.screenLoadTimes.entries()),
        renderTimes: Array.from(this.metrics.renderTimes.entries()),
      };
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(metricsToSave));
    } catch (error) {
      console.error('Metrikleri kaydetme hatası:', error);
    }
  }

  /**
   * Cache'i yükler
   */
  private static async loadCache(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('performance_cache');
      if (cacheData) {
        const cacheItems = JSON.parse(cacheData);
        cacheItems.forEach((item: CacheItem) => {
          this.cache.set(item.key, item);
        });
      }
    } catch (error) {
      console.error('Cache yükleme hatası:', error);
    }
  }

  /**
   * Cache'i kaydeder
   */
  private static async saveCache(): Promise<void> {
    try {
      const cacheItems = Array.from(this.cache.values());
      await AsyncStorage.setItem('performance_cache', JSON.stringify(cacheItems));
    } catch (error) {
      console.error('Cache kaydetme hatası:', error);
    }
  }

  /**
   * Performans izleyicilerini başlatır
   */
  private static startPerformanceMonitoring(): void {
    // CPU kullanımını izle
    setInterval(() => {
      this.updateCpuUsage();
    }, 5000);

    // Memory kullanımını izle
    setInterval(() => {
      this.updateMemoryUsage();
    }, 3000);

    // Render sürelerini izle
    this.startRenderMonitoring();
  }

  /**
   * Memory pressure izleyicisini başlatır
   */
  private static startMemoryPressureMonitoring(): void {
    setInterval(() => {
      this.checkMemoryPressure();
    }, 10000);
  }

  /**
   * Network izleyicisini başlatır
   */
  private static startNetworkMonitoring(): void {
    // Network latency ölçümü
    setInterval(() => {
      this.measureNetworkLatency();
    }, 30000);
  }

  /**
   * Battery izleyicisini başlatır
   */
  private static startBatteryMonitoring(): void {
    setInterval(() => {
      this.updateBatteryLevel();
    }, 60000);
  }

  /**
   * CPU kullanımını günceller
   */
  private static updateCpuUsage(): void {
    // Mock CPU usage - gerçek uygulamada native modül kullanılabilir
    this.metrics.cpuUsage = Math.random() * 100;
  }

  /**
   * Memory kullanımını günceller
   */
  private static updateMemoryUsage(): void {
    // Mock memory usage - gerçek uygulamada native modül kullanılabilir
    this.metrics.memoryUsage = Math.random() * 1000; // MB
  }

  /**
   * Render izleyicisini başlatır
   */
  private static startRenderMonitoring(): void {
    // Render sürelerini izle
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('render')) {
        const renderTime = Date.now();
        this.metrics.renderTimes.set('last_render', renderTime);
      }
      originalConsoleLog.apply(console, args);
    };
  }

  /**
   * Memory pressure kontrolü
   */
  private static checkMemoryPressure(): void {
    const memoryUsage = this.metrics.memoryUsage;
    
    if (memoryUsage > 800) {
      this.memoryPressureLevel = 'high';
      this.triggerMemoryCleanup();
    } else if (memoryUsage > 500) {
      this.memoryPressureLevel = 'medium';
      this.optimizeMemoryUsage();
    } else {
      this.memoryPressureLevel = 'low';
    }
  }

  /**
   * Memory cleanup tetikler
   */
  private static triggerMemoryCleanup(): void {
    // Cache'i temizle
    this.cleanupCache();
    
    // Garbage collection tetikle
    if (global.gc) {
      global.gc();
    }
    
    // Preload queue'yu temizle
    this.preloadQueue = [];
  }

  /**
   * Memory kullanımını optimize eder
   */
  private static optimizeMemoryUsage(): void {
    // Eski cache item'larını temizle
    this.cleanupExpiredCache();
    
    // Preload queue'yu sınırla
    if (this.preloadQueue.length > 10) {
      this.preloadQueue = this.preloadQueue.slice(-10);
    }
  }

  /**
   * Network latency ölçer
   */
  private static async measureNetworkLatency(): Promise<void> {
    try {
      const startTime = Date.now();
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      this.metrics.networkLatency = Date.now() - startTime;
    } catch (error) {
      console.error('Network latency ölçüm hatası:', error);
    }
  }

  /**
   * Battery seviyesini günceller
   */
  private static updateBatteryLevel(): void {
    // Mock battery level - gerçek uygulamada native modül kullanılabilir
    this.metrics.batteryLevel = Math.random() * 100;
    
    // Low power mode kontrolü
    this.isLowPowerMode = this.metrics.batteryLevel < 20;
  }

  /**
   * Screen load time kaydeder
   */
  static recordScreenLoadTime(screenName: string, loadTime: number): void {
    this.metrics.screenLoadTimes.set(screenName, loadTime);
    this.saveMetrics();
  }

  /**
   * Render time kaydeder
   */
  static recordRenderTime(componentName: string, renderTime: number): void {
    this.metrics.renderTimes.set(componentName, renderTime);
  }

  /**
   * User interaction kaydeder
   */
  static recordUserInteraction(): void {
    this.metrics.userInteractions++;
  }

  /**
   * Crash kaydeder
   */
  static recordCrash(): void {
    this.metrics.crashes++;
    this.saveMetrics();
  }

  /**
   * Error kaydeder
   */
  static recordError(): void {
    this.metrics.errors++;
    this.saveMetrics();
  }

  /**
   * Lazy loading için data yükler
   */
  static async loadDataLazily<T>(
    key: string,
    loader: () => Promise<T>,
    ttl: number = 300000 // 5 dakika
  ): Promise<T> {
    try {
      // Cache'den kontrol et
      const cached = this.getFromCache<T>(key);
      if (cached) {
        return cached;
      }

      // Data yükle
      const data = await loader();
      
      // Cache'e kaydet
      this.setCache(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Lazy loading hatası:', error);
      throw error;
    }
  }

  /**
   * Image optimizasyonu
   */
  static optimizeImage(
    imageUrl: string,
    width: number,
    height: number,
    quality: number = 80
  ): string {
    if (!this.config.enableImageOptimization) {
      return imageUrl;
    }

    // Image optimization logic
    const optimizedUrl = `${imageUrl}?w=${width}&h=${height}&q=${quality}&f=webp`;
    return optimizedUrl;
  }

  /**
   * Cache'den data getirir
   */
  private static getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL kontrolü
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Access count güncelle
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data as T;
  }

  /**
   * Cache'e data kaydeder
   */
  private static setCache(key: string, data: any, ttl: number): void {
    const size = JSON.stringify(data).length;
    
    // Cache size kontrolü
    if (this.getCacheSize() + size > this.config.maxCacheSize * 1024 * 1024) {
      this.cleanupCache();
    }

    const item: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      size,
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl,
    };

    this.cache.set(key, item);
  }

  /**
   * Cache size hesaplar
   */
  private static getCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, item) => total + item.size, 0);
  }

  /**
   * Cache'i temizler
   */
  private static cleanupCache(): void {
    const items = Array.from(this.cache.values());
    
    // En az erişilen item'ları sil
    items.sort((a, b) => a.accessCount - b.accessCount);
    
    const itemsToDelete = Math.floor(items.length * 0.3); // %30'unu sil
    for (let i = 0; i < itemsToDelete; i++) {
      this.cache.delete(items[i].key);
    }
  }

  /**
   * Expired cache'i temizler
   */
  private static cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Preload queue'ya ekler
   */
  static addToPreloadQueue(key: string): void {
    if (!this.preloadQueue.includes(key)) {
      this.preloadQueue.push(key);
    }
  }

  /**
   * Preload queue'yu işler
   */
  static async processPreloadQueue(loader: (key: string) => Promise<any>): Promise<void> {
    if (this.preloadQueue.length === 0) return;

    const key = this.preloadQueue.shift();
    if (key) {
      try {
        await loader(key);
      } catch (error) {
        console.error('Preload hatası:', error);
      }
    }
  }

  /**
   * Network optimizasyonu
   */
  static optimizeNetworkRequest(
    url: string,
    options: any = {}
  ): { url: string; options: any } {
    if (!this.config.enableNetworkOptimization) {
      return { url, options };
    }

    // Compression ekle
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Accept-Encoding'] = 'gzip, deflate, br';

    // Cache headers ekle
    options.headers['Cache-Control'] = 'max-age=300'; // 5 dakika

    // Low power mode'da daha az data
    if (this.isLowPowerMode) {
      options.headers['X-Low-Power-Mode'] = 'true';
    }

    return { url, options };
  }

  /**
   * Render optimizasyonu
   */
  static optimizeRender(componentName: string): boolean {
    if (!this.config.enableRenderOptimization) {
      return true;
    }

    // Memory pressure'da render'ı geciktir
    if (this.memoryPressureLevel === 'high') {
      return false;
    }

    // Low power mode'da render'ı sınırla
    if (this.isLowPowerMode) {
      return Math.random() > 0.3; // %70 render
    }

    return true;
  }

  /**
   * Interaction Manager ile heavy task'ları yönetir
   */
  static runAfterInteractions(task: () => void): void {
    InteractionManager.runAfterInteractions(task);
  }

  /**
   * Performans metriklerini getirir
   */
  static getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Konfigürasyonu getirir
   */
  static getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Konfigürasyonu günceller
   */
  static async updateConfig(updates: Partial<OptimizationConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  /**
   * Cache istatistiklerini getirir
   */
  static getCacheStats(): {
    size: number;
    items: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const items = Array.from(this.cache.values());
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
    const hitRate = totalAccess > 0 ? items.length / totalAccess : 0;

    return {
      size: this.getCacheSize(),
      items: items.length,
      hitRate,
      memoryUsage: this.metrics.memoryUsage,
    };
  }

  /**
   * Performans raporu oluşturur
   */
  static generatePerformanceReport(): {
    summary: string;
    recommendations: string[];
    metrics: PerformanceMetrics;
    cacheStats: any;
  } {
    const recommendations: string[] = [];
    
    // Memory önerileri
    if (this.metrics.memoryUsage > 500) {
      recommendations.push('Memory kullanımı yüksek. Cache temizliği önerilir.');
    }
    
    // Network önerileri
    if (this.metrics.networkLatency > 1000) {
      recommendations.push('Network latency yüksek. Offline mode kullanılabilir.');
    }
    
    // Battery önerileri
    if (this.metrics.batteryLevel < 30) {
      recommendations.push('Battery seviyesi düşük. Power saving mode aktif.');
    }

    const summary = `Performans: ${this.metrics.cpuUsage.toFixed(1)}% CPU, ${this.metrics.memoryUsage.toFixed(1)}MB Memory, ${this.metrics.networkLatency}ms Network`;

    return {
      summary,
      recommendations,
      metrics: this.metrics,
      cacheStats: this.getCacheStats(),
    };
  }

  /**
   * Servisi temizler
   */
  static async cleanup(): Promise<void> {
    try {
      await this.saveMetrics();
      await this.saveCache();
      this.cache.clear();
      this.preloadQueue = [];
      this.isInitialized = false;
    } catch (error) {
      console.error('Servis temizleme hatası:', error);
    }
  }
}


