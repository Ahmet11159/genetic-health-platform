// Tutorial ve yardım servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // Element ID veya selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  arrow?: boolean;
  skipable?: boolean;
  action?: 'tap' | 'swipe' | 'longPress' | 'none';
  highlight?: boolean;
  order: number;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'advanced' | 'help';
  steps: TutorialStep[];
  completed: boolean;
  lastCompleted?: Date;
  version: string;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
  skipped: boolean;
}

export class TutorialService {
  private static tutorials: Tutorial[] = [];
  private static currentTutorial: Tutorial | null = null;
  private static currentStep: number = 0;
  private static progress: TutorialProgress | null = null;
  private static listeners: ((tutorial: Tutorial | null, step: number) => void)[] = [];

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<void> {
    try {
      await this.loadTutorials();
      await this.loadProgress();
      this.setupDefaultTutorials();
      console.log('Tutorial Service initialized!');
    } catch (error) {
      console.error('Tutorial service initialization error:', error);
    }
  }

  /**
   * Varsayılan tutorial'ları ayarlar
   */
  private static setupDefaultTutorials(): void {
    if (this.tutorials.length === 0) {
      this.tutorials = [
        this.createDNAAnalysisTutorial(),
        this.createHealthTrackingTutorial(),
        this.createFamilyComparisonTutorial(),
        this.createAdvancedAnalyticsTutorial(),
        this.createOfflineModeTutorial(),
      ];
    }
  }

  /**
   * DNA Analizi tutorial'ı oluşturur
   */
  private static createDNAAnalysisTutorial(): Tutorial {
    return {
      id: 'dna_analysis',
      name: 'DNA Analizi Rehberi',
      description: 'DNA dosyanızı nasıl yükleyeceğinizi ve analiz sonuçlarını nasıl okuyacağınızı öğrenin',
      category: 'feature',
      version: '1.0.0',
      completed: false,
      steps: [
        {
          id: 'dna_upload',
          title: 'DNA Dosyası Yükleme',
          description: 'DNA dosyanızı yüklemek için bu butona dokunun',
          target: 'dna_upload_button',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 1,
        },
        {
          id: 'dna_format',
          title: 'Desteklenen Formatlar',
          description: '23andMe, AncestryDNA, MyHeritage ve FamilyTreeDNA formatları desteklenir',
          target: 'dna_format_info',
          position: 'top',
          arrow: true,
          action: 'none',
          highlight: false,
          order: 2,
        },
        {
          id: 'analysis_progress',
          title: 'Analiz Süreci',
          description: 'DNA analizi 1247 genetik varyant üzerinde gerçekleştirilir',
          target: 'analysis_progress',
          position: 'center',
          arrow: false,
          action: 'none',
          highlight: true,
          order: 3,
        },
        {
          id: 'analysis_results',
          title: 'Sonuçları İnceleme',
          description: 'Analiz sonuçlarınızı detaylı olarak inceleyebilirsiniz',
          target: 'analysis_results',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 4,
        },
      ],
    };
  }

  /**
   * Sağlık Takibi tutorial'ı oluşturur
   */
  private static createHealthTrackingTutorial(): Tutorial {
    return {
      id: 'health_tracking',
      name: 'Sağlık Takibi Rehberi',
      description: 'Sağlık verilerinizi nasıl takip edeceğinizi ve analiz edeceğinizi öğrenin',
      category: 'feature',
      version: '1.0.0',
      completed: false,
      steps: [
        {
          id: 'health_sync',
          title: 'Sağlık Verisi Senkronizasyonu',
          description: 'HealthKit veya Google Fit ile verilerinizi senkronize edin',
          target: 'health_sync_button',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 1,
        },
        {
          id: 'health_metrics',
          title: 'Sağlık Metrikleri',
          description: 'Adım sayısı, kalp atış hızı, uyku kalitesi gibi metrikleri takip edin',
          target: 'health_metrics',
          position: 'top',
          arrow: true,
          action: 'none',
          highlight: false,
          order: 2,
        },
        {
          id: 'health_alerts',
          title: 'Sağlık Uyarıları',
          description: 'Genetik risklere göre kişiselleştirilmiş uyarılar alın',
          target: 'health_alerts',
          position: 'right',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 3,
        },
      ],
    };
  }

  /**
   * Aile Karşılaştırması tutorial'ı oluşturur
   */
  private static createFamilyComparisonTutorial(): Tutorial {
    return {
      id: 'family_comparison',
      name: 'Aile Karşılaştırması Rehberi',
      description: 'Aile üyelerinizle genetik profillerinizi nasıl karşılaştıracağınızı öğrenin',
      category: 'feature',
      version: '1.0.0',
      completed: false,
      steps: [
        {
          id: 'add_family_member',
          title: 'Aile Üyesi Ekleme',
          description: 'Aile üyelerinizi eklemek için bu butona dokunun',
          target: 'add_family_button',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 1,
        },
        {
          id: 'family_comparison',
          title: 'Genetik Karşılaştırma',
          description: 'Aile üyelerinizle ortak genetik varyantları keşfedin',
          target: 'family_comparison',
          position: 'center',
          arrow: false,
          action: 'none',
          highlight: true,
          order: 2,
        },
        {
          id: 'family_recommendations',
          title: 'Aile Önerileri',
          description: 'Aile genetik profiline göre öneriler alın',
          target: 'family_recommendations',
          position: 'top',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 3,
        },
      ],
    };
  }

  /**
   * Gelişmiş Analitik tutorial'ı oluşturur
   */
  private static createAdvancedAnalyticsTutorial(): Tutorial {
    return {
      id: 'advanced_analytics',
      name: 'Gelişmiş Analitik Rehberi',
      description: 'Veri analizi ve trend grafiklerini nasıl kullanacağınızı öğrenin',
      category: 'advanced',
      version: '1.0.0',
      completed: false,
      steps: [
        {
          id: 'analytics_access',
          title: 'Analitik Erişimi',
          description: 'Gelişmiş analitik özelliklerine erişmek için bu menüyü kullanın',
          target: 'analytics_menu',
          position: 'right',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 1,
        },
        {
          id: 'trend_analysis',
          title: 'Trend Analizi',
          description: 'Sağlık verilerinizdeki trendleri analiz edin',
          target: 'trend_chart',
          position: 'center',
          arrow: false,
          action: 'none',
          highlight: true,
          order: 2,
        },
        {
          id: 'correlation_analysis',
          title: 'Korelasyon Analizi',
          description: 'Farklı sağlık metrikleri arasındaki ilişkileri keşfedin',
          target: 'correlation_data',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 3,
        },
      ],
    };
  }

  /**
   * Offline Mod tutorial'ı oluşturur
   */
  private static createOfflineModeTutorial(): Tutorial {
    return {
      id: 'offline_mode',
      name: 'Offline Mod Rehberi',
      description: 'İnternet bağlantısı olmadan uygulamayı nasıl kullanacağınızı öğrenin',
      category: 'help',
      version: '1.0.0',
      completed: false,
      steps: [
        {
          id: 'offline_status',
          title: 'Offline Durumu',
          description: 'Bağlantı durumunuzu buradan takip edebilirsiniz',
          target: 'offline_status',
          position: 'bottom',
          arrow: true,
          action: 'tap',
          highlight: true,
          order: 1,
        },
        {
          id: 'offline_features',
          title: 'Offline Özellikler',
          description: 'Hangi özelliklerin offline çalıştığını öğrenin',
          target: 'offline_features',
          position: 'top',
          arrow: true,
          action: 'none',
          highlight: false,
          order: 2,
        },
        {
          id: 'sync_data',
          title: 'Veri Senkronizasyonu',
          description: 'Bağlantı kurulduğunda verileriniz otomatik senkronize edilir',
          target: 'sync_button',
          position: 'center',
          arrow: false,
          action: 'tap',
          highlight: true,
          order: 3,
        },
      ],
    };
  }

  /**
   * Tutorial'ları yükler
   */
  private static async loadTutorials(): Promise<void> {
    try {
      const savedTutorials = await AsyncStorage.getItem('tutorials');
      if (savedTutorials) {
        this.tutorials = JSON.parse(savedTutorials);
      }
    } catch (error) {
      console.error('Load tutorials error:', error);
    }
  }

  /**
   * Tutorial ilerlemesini yükler
   */
  private static async loadProgress(): Promise<void> {
    try {
      const savedProgress = await AsyncStorage.getItem('tutorial_progress');
      if (savedProgress) {
        this.progress = JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error('Load progress error:', error);
    }
  }

  /**
   * Tutorial'ları kaydeder
   */
  private static async saveTutorials(): Promise<void> {
    try {
      await AsyncStorage.setItem('tutorials', JSON.stringify(this.tutorials));
    } catch (error) {
      console.error('Save tutorials error:', error);
    }
  }

  /**
   * Tutorial ilerlemesini kaydeder
   */
  private static async saveProgress(): Promise<void> {
    try {
      if (this.progress) {
        await AsyncStorage.setItem('tutorial_progress', JSON.stringify(this.progress));
      }
    } catch (error) {
      console.error('Save progress error:', error);
    }
  }

  /**
   * Tutorial başlatır
   */
  static startTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.find(t => t.id === tutorialId);
    if (!tutorial) return false;

    this.currentTutorial = tutorial;
    this.currentStep = 0;
    this.progress = {
      tutorialId,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date(),
      skipped: false,
    };

    this.notifyListeners();
    return true;
  }

  /**
   * Sonraki adıma geçer
   */
  static nextStep(): boolean {
    if (!this.currentTutorial || !this.progress) return false;

    const currentStepData = this.currentTutorial.steps[this.currentStep];
    if (currentStepData) {
      this.progress.completedSteps.push(currentStepData.id);
    }

    this.currentStep++;
    this.progress.currentStep = this.currentStep;

    if (this.currentStep >= this.currentTutorial.steps.length) {
      this.completeTutorial();
    } else {
      this.notifyListeners();
    }

    this.saveProgress();
    return true;
  }

  /**
   * Önceki adıma döner
   */
  static previousStep(): boolean {
    if (!this.currentTutorial || this.currentStep <= 0) return false;

    this.currentStep--;
    if (this.progress) {
      this.progress.currentStep = this.currentStep;
    }

    this.notifyListeners();
    this.saveProgress();
    return true;
  }

  /**
   * Tutorial'ı tamamlar
   */
  static completeTutorial(): void {
    if (!this.currentTutorial || !this.progress) return;

    this.currentTutorial.completed = true;
    this.currentTutorial.lastCompleted = new Date();
    this.progress.completedAt = new Date();

    this.saveTutorials();
    this.saveProgress();

    // Tutorial tamamlandı, temizle
    this.currentTutorial = null;
    this.currentStep = 0;
    this.progress = null;

    this.notifyListeners();
  }

  /**
   * Tutorial'ı atlar
   */
  static skipTutorial(): void {
    if (!this.currentTutorial || !this.progress) return;

    this.progress.skipped = true;
    this.progress.completedAt = new Date();

    this.saveProgress();

    // Tutorial atlandı, temizle
    this.currentTutorial = null;
    this.currentStep = 0;
    this.progress = null;

    this.notifyListeners();
  }

  /**
   * Tutorial'ı durdurur
   */
  static stopTutorial(): void {
    this.currentTutorial = null;
    this.currentStep = 0;
    this.progress = null;
    this.notifyListeners();
  }

  /**
   * Mevcut tutorial'ı getirir
   */
  static getCurrentTutorial(): Tutorial | null {
    return this.currentTutorial;
  }

  /**
   * Mevcut adımı getirir
   */
  static getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Mevcut adım verilerini getirir
   */
  static getCurrentStepData(): TutorialStep | null {
    if (!this.currentTutorial) return null;
    return this.currentTutorial.steps[this.currentStep] || null;
  }

  /**
   * Tüm tutorial'ları getirir
   */
  static getAllTutorials(): Tutorial[] {
    return [...this.tutorials];
  }

  /**
   * Kategoriye göre tutorial'ları getirir
   */
  static getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
    return this.tutorials.filter(t => t.category === category);
  }

  /**
   * Tamamlanmış tutorial'ları getirir
   */
  static getCompletedTutorials(): Tutorial[] {
    return this.tutorials.filter(t => t.completed);
  }

  /**
   * Tutorial ilerlemesini getirir
   */
  static getTutorialProgress(tutorialId: string): TutorialProgress | null {
    if (this.progress && this.progress.tutorialId === tutorialId) {
      return this.progress;
    }
    return null;
  }

  /**
   * Tutorial dinleyicisi ekler
   */
  static addTutorialListener(listener: (tutorial: Tutorial | null, step: number) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Dinleyicilere bildirim gönderir
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTutorial, this.currentStep);
      } catch (error) {
        console.error('Tutorial listener error:', error);
      }
    });
  }

  /**
   * Tutorial istatistiklerini getirir
   */
  static getTutorialStats(): {
    totalTutorials: number;
    completedTutorials: number;
    skippedTutorials: number;
    completionRate: number;
    averageCompletionTime: number;
  } {
    const total = this.tutorials.length;
    const completed = this.tutorials.filter(t => t.completed).length;
    const skipped = this.tutorials.filter(t => t.lastCompleted && !t.completed).length;
    
    return {
      totalTutorials: total,
      completedTutorials: completed,
      skippedTutorials: skipped,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageCompletionTime: 0, // Bu gerçek uygulamada hesaplanabilir
    };
  }

  /**
   * Tutorial'ları sıfırlar
   */
  static async resetTutorials(): Promise<void> {
    try {
      this.tutorials.forEach(tutorial => {
        tutorial.completed = false;
        tutorial.lastCompleted = undefined;
      });
      
      await this.saveTutorials();
      await AsyncStorage.removeItem('tutorial_progress');
      
      this.currentTutorial = null;
      this.currentStep = 0;
      this.progress = null;
      
      this.notifyListeners();
    } catch (error) {
      console.error('Reset tutorials error:', error);
    }
  }

  /**
   * Tutorial önerilerini getirir
   */
  static getTutorialRecommendations(): string[] {
    return [
      'DNA analizi tutorial\'ını tamamlayın',
      'Sağlık takibi özelliklerini keşfedin',
      'Aile karşılaştırması nasıl yapılır öğrenin',
      'Gelişmiş analitik özelliklerini keşfedin',
      'Offline mod avantajlarını öğrenin'
    ];
  }
}


