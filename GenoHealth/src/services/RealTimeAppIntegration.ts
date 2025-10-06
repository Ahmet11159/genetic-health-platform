/**
 * Real-time App Integration Service
 * Gemini AI'ın uygulamanın her yerinde gezebilmesi ve gerçek zamanlı verileri okuyabilmesi için
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppStateData {
  currentScreen: string;
  userProfile: any;
  dnaAnalysisResult: any;
  navigationHistory: string[];
  appData: {
    nutritionData: any;
    exerciseData: any;
    healthData: any;
    aiConversations: any[];
  };
  timestamp: string;
}

export interface GeminiAppContext {
  currentState: AppStateData;
  availableScreens: string[];
  userActions: string[];
  personalizedRecommendations: any;
  realTimeData: any;
}

export class RealTimeAppIntegration {
  private static instance: RealTimeAppIntegration;
  private appState: AppStateData | null = null;
  private listeners: ((data: AppStateData) => void)[] = [];
  private isMonitoring = false;
  private appStateSubscription: any = null;

  static getInstance(): RealTimeAppIntegration {
    if (!RealTimeAppIntegration.instance) {
      RealTimeAppIntegration.instance = new RealTimeAppIntegration();
    }
    return RealTimeAppIntegration.instance;
  }

  /**
   * Uygulama durumunu izlemeye başla
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Real-time App Integration başlatıldı');
    
    // App state değişikliklerini izle (modern subscription API)
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    
    // Periyodik olarak uygulama durumunu güncelle
    setInterval(() => {
      this.updateAppState();
    }, 5000); // Her 5 saniyede bir güncelle
  }

  /**
   * Uygulama durumu değişikliklerini işle
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      this.updateAppState();
    }
  };

  /**
   * Uygulama durumunu güncelle
   */
  async updateAppState(): Promise<void> {
    try {
      const currentScreen = await this.getCurrentScreen();
      const userProfile = await this.getUserProfile();
      const dnaAnalysisResult = await this.getDNAAnalysisResult();
      const navigationHistory = await this.getNavigationHistory();
      const appData = await this.getAppData();

      const newAppState: AppStateData = {
        currentScreen,
        userProfile,
        dnaAnalysisResult,
        navigationHistory,
        appData,
        timestamp: new Date().toISOString()
      };

      this.appState = newAppState;
      
      // Listeners'ları bilgilendir
      this.listeners.forEach(listener => listener(newAppState));
      
      console.log('📊 Uygulama durumu güncellendi:', currentScreen);
    } catch (error) {
      console.error('❌ Uygulama durumu güncellenirken hata:', error);
    }
  }

  /**
   * Mevcut ekranı al
   */
  private async getCurrentScreen(): Promise<string> {
    try {
      const currentScreen = await AsyncStorage.getItem('currentScreen');
      return currentScreen || 'HomeScreen';
    } catch {
      return 'HomeScreen';
    }
  }

  /**
   * Kullanıcı profilini al
   */
  private async getUserProfile(): Promise<any> {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  }

  /**
   * DNA analiz sonuçlarını al
   */
  private async getDNAAnalysisResult(): Promise<any> {
    try {
      const result = await AsyncStorage.getItem('dnaAnalysisResult');
      return result ? JSON.parse(result) : null;
    } catch {
      return null;
    }
  }

  /**
   * Navigasyon geçmişini al
   */
  private async getNavigationHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem('navigationHistory');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  /**
   * Uygulama verilerini al
   */
  private async getAppData(): Promise<any> {
    try {
      const nutritionData = await AsyncStorage.getItem('nutritionData');
      const exerciseData = await AsyncStorage.getItem('exerciseData');
      const healthData = await AsyncStorage.getItem('healthData');
      const aiConversations = await AsyncStorage.getItem('aiConversations');

      return {
        nutritionData: nutritionData ? JSON.parse(nutritionData) : null,
        exerciseData: exerciseData ? JSON.parse(exerciseData) : null,
        healthData: healthData ? JSON.parse(healthData) : null,
        aiConversations: aiConversations ? JSON.parse(aiConversations) : []
      };
    } catch {
      return {
        nutritionData: null,
        exerciseData: null,
        healthData: null,
        aiConversations: []
      };
    }
  }

  /**
   * Gemini AI için context oluştur
   */
  async buildGeminiContext(): Promise<GeminiAppContext> {
    if (!this.appState) {
      await this.updateAppState();
    }

    const availableScreens = [
      'HomeScreen',
      'DNAUploadScreen', 
      'AnalysisScreen',
      'NutritionScreen',
      'ExerciseScreen',
      'HealthMonitoringScreen',
      'GenoAIAssistantScreen'
    ];

    const userActions = [
      'DNA dosyası yükleme',
      'Analiz sonuçlarını görüntüleme',
      'Beslenme önerilerini inceleme',
      'Egzersiz planlarını görme',
      'Sağlık takibini kontrol etme',
      'AI ile sohbet etme'
    ];

    const personalizedRecommendations = this.appState?.dnaAnalysisResult ? {
      nutrition: this.appState.dnaAnalysisResult.nutritionRecommendations || [],
      exercise: this.appState.dnaAnalysisResult.exerciseRecommendations || [],
      health: this.appState.dnaAnalysisResult.healthTraits || [],
      risks: this.appState.dnaAnalysisResult.riskFactors || []
    } : null;

    return {
      currentState: this.appState!,
      availableScreens,
      userActions,
      personalizedRecommendations,
      realTimeData: {
        lastUpdate: this.appState?.timestamp,
        screenCount: this.appState?.navigationHistory.length || 0,
        hasDNAData: !!this.appState?.dnaAnalysisResult,
        hasUserProfile: !!this.appState?.userProfile
      }
    };
  }

  /**
   * Ekran değişikliğini kaydet
   */
  async setCurrentScreen(screenName: string): Promise<void> {
    try {
      await AsyncStorage.setItem('currentScreen', screenName);
      
      // Navigasyon geçmişine ekle
      const history = await this.getNavigationHistory();
      history.push(screenName);
      if (history.length > 10) history.shift(); // Son 10 ekranı tut
      await AsyncStorage.setItem('navigationHistory', JSON.stringify(history));
      
      await this.updateAppState();
    } catch (error) {
      console.error('❌ Ekran değişikliği kaydedilemedi:', error);
    }
  }

  /**
   * DNA analiz sonucunu kaydet
   */
  async setDNAAnalysisResult(result: any): Promise<void> {
    try {
      await AsyncStorage.setItem('dnaAnalysisResult', JSON.stringify(result));
      await this.updateAppState();
    } catch (error) {
      console.error('❌ DNA analiz sonucu kaydedilemedi:', error);
    }
  }

  /**
   * Kullanıcı profilini kaydet
   */
  async setUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await this.updateAppState();
    } catch (error) {
      console.error('❌ Kullanıcı profili kaydedilemedi:', error);
    }
  }

  /**
   * Uygulama verilerini kaydet
   */
  async setAppData(dataType: 'nutrition' | 'exercise' | 'health' | 'aiConversations', data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`${dataType}Data`, JSON.stringify(data));
      await this.updateAppState();
    } catch (error) {
      console.error(`❌ ${dataType} verisi kaydedilemedi:`, error);
    }
  }

  /**
   * State değişikliklerini dinle
   */
  addStateListener(listener: (data: AppStateData) => void): void {
    this.listeners.push(listener);
  }

  /**
   * State listener'ını kaldır
   */
  removeStateListener(listener: (data: AppStateData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Mevcut durumu al
   */
  getCurrentState(): AppStateData | null {
    return this.appState;
  }

  /**
   * İzlemeyi durdur
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    try {
      // AppState.removeEventListener deprecated, subscription kullan
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
      }
    } catch (error) {
      console.log('AppState cleanup error:', error);
    }
    console.log('🛑 Real-time App Integration durduruldu');
  }
}
