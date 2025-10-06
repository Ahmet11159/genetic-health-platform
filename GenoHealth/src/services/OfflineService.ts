// Offline mod desteği servisi
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AnalysisResult } from '../types/DNA';
import { HealthData } from './HealthDataSyncService';
import { FamilyMember } from './FamilyComparisonService';

export interface OfflineData {
  id: string;
  type: 'dna_analysis' | 'health_data' | 'family_member' | 'user_settings' | 'achievements' | 'notifications';
  data: any;
  timestamp: Date;
  synced: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface OfflineStatus {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  storageUsed: number;
  storageLimit: number;
}

export interface SyncQueue {
  pendingItems: OfflineData[];
  failedItems: OfflineData[];
  retryCount: number;
  lastRetryTime: Date | null;
}

export class OfflineService {
  private static isOnline = true;
  private static isOfflineMode = false;
  private static syncQueue: SyncQueue = {
    pendingItems: [],
    failedItems: [],
    retryCount: 0,
    lastRetryTime: null
  };
  private static storageKeys = {
    dnaAnalysis: 'dna_analysis_offline',
    healthData: 'health_data_offline',
    familyMembers: 'family_members_offline',
    userSettings: 'user_settings_offline',
    achievements: 'achievements_offline',
    notifications: 'notifications_offline',
    syncQueue: 'sync_queue_offline'
  };

  /**
   * Offline servisini başlatır
   */
  static async initialize(): Promise<void> {
    try {
      // Ağ durumunu dinle
      NetInfo.addEventListener(state => {
        this.isOnline = state.isConnected ?? false;
        this.isOfflineMode = !this.isOnline;
        
        if (this.isOnline && this.syncQueue.pendingItems.length > 0) {
          this.syncPendingData();
        }
      });

      // Mevcut verileri yükle
      await this.loadOfflineData();
      
      console.log('Offline Service initialized!');
    } catch (error) {
      console.error('Offline service initialization error:', error);
    }
  }

  /**
   * Offline verileri yükler
   */
  private static async loadOfflineData(): Promise<void> {
    try {
      const syncQueueData = await AsyncStorage.getItem(this.storageKeys.syncQueue);
      if (syncQueueData) {
        this.syncQueue = JSON.parse(syncQueueData);
      }
    } catch (error) {
      console.error('Load offline data error:', error);
    }
  }

  /**
   * Offline verileri kaydeder
   */
  private static async saveOfflineData(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.storageKeys.syncQueue,
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error('Save offline data error:', error);
    }
  }

  /**
   * DNA analizi offline kaydeder
   */
  static async saveDNAAnalysis(analysisData: AnalysisResult): Promise<void> {
    const offlineData: OfflineData = {
      id: `dna_${Date.now()}`,
      type: 'dna_analysis',
      data: analysisData,
      timestamp: new Date(),
      synced: false,
      priority: 'high'
    };

    await this.saveOfflineItem(offlineData);
  }

  /**
   * Sağlık verisi offline kaydeder
   */
  static async saveHealthData(healthData: HealthData[]): Promise<void> {
    const offlineData: OfflineData = {
      id: `health_${Date.now()}`,
      type: 'health_data',
      data: healthData,
      timestamp: new Date(),
      synced: false,
      priority: 'medium'
    };

    await this.saveOfflineItem(offlineData);
  }

  /**
   * Aile üyesi offline kaydeder
   */
  static async saveFamilyMember(familyMember: FamilyMember): Promise<void> {
    const offlineData: OfflineData = {
      id: `family_${Date.now()}`,
      type: 'family_member',
      data: familyMember,
      timestamp: new Date(),
      synced: false,
      priority: 'medium'
    };

    await this.saveOfflineItem(offlineData);
  }

  /**
   * Kullanıcı ayarları offline kaydeder
   */
  static async saveUserSettings(settings: any): Promise<void> {
    const offlineData: OfflineData = {
      id: `settings_${Date.now()}`,
      type: 'user_settings',
      data: settings,
      timestamp: new Date(),
      synced: false,
      priority: 'low'
    };

    await this.saveOfflineItem(offlineData);
  }

  /**
   * Başarı rozetleri offline kaydeder
   */
  static async saveAchievements(achievements: any[]): Promise<void> {
    const offlineData: OfflineData = {
      id: `achievements_${Date.now()}`,
      type: 'achievements',
      data: achievements,
      timestamp: new Date(),
      synced: false,
      priority: 'low'
    };

    await this.saveOfflineItem(offlineData);
  }

  /**
   * Offline öğe kaydeder
   */
  private static async saveOfflineItem(offlineData: OfflineData): Promise<void> {
    try {
      // Öncelik sırasına göre ekle
      if (offlineData.priority === 'high') {
        this.syncQueue.pendingItems.unshift(offlineData);
      } else {
        this.syncQueue.pendingItems.push(offlineData);
      }

      // Depolama sınırını kontrol et
      await this.checkStorageLimit();

      // Veriyi kaydet
      await this.saveOfflineData();

      // Eğer online ise hemen senkronize et
      if (this.isOnline) {
        await this.syncPendingData();
      }
    } catch (error) {
      console.error('Save offline item error:', error);
    }
  }

  /**
   * Depolama sınırını kontrol eder
   */
  private static async checkStorageLimit(): Promise<void> {
    const maxItems = 1000; // Maksimum 1000 öğe
    
    if (this.syncQueue.pendingItems.length > maxItems) {
      // En eski düşük öncelikli öğeleri sil
      this.syncQueue.pendingItems = this.syncQueue.pendingItems
        .filter(item => item.priority !== 'low')
        .slice(0, maxItems);
    }
  }

  /**
   * Bekleyen verileri senkronize eder
   */
  static async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.pendingItems.length === 0) {
      return;
    }

    try {
      const itemsToSync = [...this.syncQueue.pendingItems];
      this.syncQueue.pendingItems = [];

      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          item.synced = true;
        } catch (error) {
          console.error('Sync item error:', error);
          item.synced = false;
          this.syncQueue.failedItems.push(item);
        }
      }

      // Başarısız öğeleri tekrar dene
      await this.retryFailedItems();

      await this.saveOfflineData();
    } catch (error) {
      console.error('Sync pending data error:', error);
    }
  }

  /**
   * Tek öğeyi senkronize eder
   */
  private static async syncItem(item: OfflineData): Promise<void> {
    // Burada gerçek API çağrıları yapılacak
    // Şimdilik mock implementasyon
    
    switch (item.type) {
      case 'dna_analysis':
        console.log('Syncing DNA analysis:', item.id);
        break;
      case 'health_data':
        console.log('Syncing health data:', item.id);
        break;
      case 'family_member':
        console.log('Syncing family member:', item.id);
        break;
      case 'user_settings':
        console.log('Syncing user settings:', item.id);
        break;
      case 'achievements':
        console.log('Syncing achievements:', item.id);
        break;
      case 'notifications':
        console.log('Syncing notifications:', item.id);
        break;
    }

    // Mock gecikme
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Başarısız öğeleri tekrar dener
   */
  private static async retryFailedItems(): Promise<void> {
    if (this.syncQueue.failedItems.length === 0) return;

    const now = new Date();
    const retryInterval = 5 * 60 * 1000; // 5 dakika

    if (this.syncQueue.lastRetryTime && 
        now.getTime() - this.syncQueue.lastRetryTime.getTime() < retryInterval) {
      return;
    }

    this.syncQueue.retryCount++;
    this.syncQueue.lastRetryTime = now;

    const itemsToRetry = [...this.syncQueue.failedItems];
    this.syncQueue.failedItems = [];

    for (const item of itemsToRetry) {
      if (this.syncQueue.retryCount < 3) { // Maksimum 3 deneme
        try {
          await this.syncItem(item);
          item.synced = true;
        } catch (error) {
          this.syncQueue.failedItems.push(item);
        }
      }
    }
  }

  /**
   * Offline durumunu getirir
   */
  static getOfflineStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      isOfflineMode: this.isOfflineMode,
      pendingSyncCount: this.syncQueue.pendingItems.length,
      lastSyncTime: this.syncQueue.lastRetryTime,
      storageUsed: this.syncQueue.pendingItems.length + this.syncQueue.failedItems.length,
      storageLimit: 1000
    };
  }

  /**
   * Bekleyen senkronizasyon sayısını getirir
   */
  static getPendingSyncCount(): number {
    return this.syncQueue.pendingItems.length + this.syncQueue.failedItems.length;
  }

  /**
   * Offline modda mı kontrol eder
   */
  static isOfflineModeActive(): boolean {
    return this.isOfflineMode;
  }

  /**
   * Online modda mı kontrol eder
   */
  static isOnlineModeActive(): boolean {
    return this.isOnline;
  }

  /**
   * Offline verileri temizler
   */
  static async clearOfflineData(): Promise<void> {
    try {
      this.syncQueue = {
        pendingItems: [],
        failedItems: [],
        retryCount: 0,
        lastRetryTime: null
      };

      await this.saveOfflineData();
    } catch (error) {
      console.error('Clear offline data error:', error);
    }
  }

  /**
   * Senkronize edilmiş verileri temizler
   */
  static async clearSyncedData(): Promise<void> {
    try {
      this.syncQueue.pendingItems = this.syncQueue.pendingItems.filter(item => !item.synced);
      this.syncQueue.failedItems = this.syncQueue.failedItems.filter(item => !item.synced);
      
      await this.saveOfflineData();
    } catch (error) {
      console.error('Clear synced data error:', error);
    }
  }

  /**
   * Offline veri boyutunu hesaplar
   */
  static async getStorageSize(): Promise<number> {
    try {
      const keys = Object.values(this.storageKeys);
      let totalSize = 0;

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Get storage size error:', error);
      return 0;
    }
  }

  /**
   * Offline veri özetini getirir
   */
  static getOfflineSummary(): {
    totalItems: number;
    pendingItems: number;
    failedItems: number;
    syncedItems: number;
    storageUsed: number;
    lastSyncTime: Date | null;
  } {
    const syncedItems = this.syncQueue.pendingItems.filter(item => item.synced).length;
    
    return {
      totalItems: this.syncQueue.pendingItems.length + this.syncQueue.failedItems.length,
      pendingItems: this.syncQueue.pendingItems.length,
      failedItems: this.syncQueue.failedItems.length,
      syncedItems,
      storageUsed: this.syncQueue.pendingItems.length + this.syncQueue.failedItems.length,
      lastSyncTime: this.syncQueue.lastRetryTime
    };
  }

  /**
   * Manuel senkronizasyon başlatır
   */
  static async forceSync(): Promise<boolean> {
    try {
      if (!this.isOnline) {
        throw new Error('İnternet bağlantısı yok');
      }

      await this.syncPendingData();
      return true;
    } catch (error) {
      console.error('Force sync error:', error);
      return false;
    }
  }

  /**
   * Offline mod bildirimi oluşturur
   */
  static getOfflineNotification(): string {
    if (this.isOfflineMode) {
      return 'Offline modda çalışıyorsunuz. Verileriniz senkronize edilecek.';
    } else if (this.syncQueue.pendingItems.length > 0) {
      return `${this.syncQueue.pendingItems.length} öğe senkronize bekliyor.`;
    } else {
      return 'Tüm veriler senkronize edildi.';
    }
  }

  /**
   * Offline veri yedekleme
   */
  static async backupOfflineData(): Promise<string> {
    try {
      const backupData = {
        syncQueue: this.syncQueue,
        timestamp: new Date(),
        version: '1.0.0'
      };

      const backupString = JSON.stringify(backupData);
      const backupId = `backup_${Date.now()}`;
      
      await AsyncStorage.setItem(`backup_${backupId}`, backupString);
      
      return backupId;
    } catch (error) {
      console.error('Backup offline data error:', error);
      throw error;
    }
  }

  /**
   * Offline veri geri yükleme
   */
  static async restoreOfflineData(backupId: string): Promise<boolean> {
    try {
      const backupData = await AsyncStorage.getItem(`backup_${backupId}`);
      if (!backupData) {
        throw new Error('Yedek bulunamadı');
      }

      const backup = JSON.parse(backupData);
      this.syncQueue = backup.syncQueue;
      
      await this.saveOfflineData();
      return true;
    } catch (error) {
      console.error('Restore offline data error:', error);
      return false;
    }
  }
}


