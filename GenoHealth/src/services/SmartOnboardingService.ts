// Akıllı onboarding servisi
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticFeedbackService } from './HapticFeedbackService';
import { AccessibilityService } from './AccessibilityService';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'introduction' | 'feature' | 'tutorial' | 'personalization' | 'completion';
  required: boolean;
  completed: boolean;
  order: number;
  estimatedTime: number; // saniye
  interactive: boolean;
  personalized: boolean;
  data?: any;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  skippedSteps: number;
  timeSpent: number; // saniye
  startTime: number;
  endTime?: number;
  personalized: boolean;
  userPreferences: any;
  completionRate: number;
}

export interface PersonalizationData {
  userGoals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  healthConditions: string[];
  lifestyle: 'active' | 'moderate' | 'sedentary';
  age: number;
  gender: 'male' | 'female' | 'other';
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    hapticFeedback: boolean;
    voiceGuidance: boolean;
    animations: boolean;
  };
}

export interface SmartRecommendation {
  type: 'feature' | 'tip' | 'reminder' | 'goal';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  personalized: boolean;
  reasoning: string;
  action?: string;
  data?: any;
}

export class SmartOnboardingService {
  private static isInitialized = false;
  private static steps: Map<string, OnboardingStep> = new Map();
  private static progress: OnboardingProgress = {
    currentStep: 0,
    totalSteps: 0,
    completedSteps: 0,
    skippedSteps: 0,
    timeSpent: 0,
    startTime: 0,
    personalized: false,
    userPreferences: {},
    completionRate: 0,
  };
  private static personalizationData: PersonalizationData = {
    userGoals: [],
    experienceLevel: 'beginner',
    interests: [],
    healthConditions: [],
    lifestyle: 'moderate',
    age: 25,
    gender: 'other',
    preferences: {
      notifications: true,
      darkMode: false,
      hapticFeedback: true,
      voiceGuidance: true,
      animations: true,
    },
  };
  private static smartRecommendations: SmartRecommendation[] = [];

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Onboarding adımlarını yükle
      await this.loadOnboardingSteps();

      // İlerlemeyi yükle
      await this.loadProgress();

      // Kişiselleştirme verilerini yükle
      await this.loadPersonalizationData();

      // Akıllı önerileri yükle
      await this.loadSmartRecommendations();

      this.isInitialized = true;
      console.log('Akıllı onboarding servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Onboarding servisi başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Onboarding adımlarını yükler
   */
  private static async loadOnboardingSteps(): Promise<void> {
    try {
      const stepsData = await AsyncStorage.getItem('onboarding_steps');
      if (stepsData) {
        const steps = JSON.parse(stepsData);
        steps.forEach((step: OnboardingStep) => {
          this.steps.set(step.id, step);
        });
      } else {
        // Varsayılan adımları oluştur
        await this.createDefaultSteps();
      }
    } catch (error) {
      console.error('Onboarding adımlarını yükleme hatası:', error);
    }
  }

  /**
   * Varsayılan adımları oluşturur
   */
  private static async createDefaultSteps(): Promise<void> {
    const defaultSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'GenoHealth\'e Hoş Geldiniz!',
        description: 'DNA analizi ile kişiselleştirilmiş sağlık önerileri alın',
        icon: 'dna',
        category: 'introduction',
        required: true,
        completed: false,
        order: 1,
        estimatedTime: 30,
        interactive: false,
        personalized: false,
      },
      {
        id: 'dna_upload',
        title: 'DNA Dosyanızı Yükleyin',
        description: '23andMe, AncestryDNA veya diğer formatlardan DNA dosyanızı yükleyin',
        icon: 'cloud-upload',
        category: 'feature',
        required: true,
        completed: false,
        order: 2,
        estimatedTime: 60,
        interactive: true,
        personalized: false,
      },
      {
        id: 'analysis_overview',
        title: 'DNA Analizi Nasıl Çalışır?',
        description: '1247 genetik varyant analizi ve %99 güvenilirlik',
        icon: 'analytics',
        category: 'tutorial',
        required: true,
        completed: false,
        order: 3,
        estimatedTime: 45,
        interactive: true,
        personalized: false,
      },
      {
        id: 'personalization_setup',
        title: 'Kişiselleştirme Ayarları',
        description: 'Sağlık hedeflerinizi ve tercihlerinizi belirleyin',
        icon: 'person',
        category: 'personalization',
        required: false,
        completed: false,
        order: 4,
        estimatedTime: 90,
        interactive: true,
        personalized: true,
      },
      {
        id: 'ai_features',
        title: 'AI Destekli Özellikler',
        description: 'QWEN AI ile kişiselleştirilmiş öneriler',
        icon: 'brain',
        category: 'feature',
        required: false,
        completed: false,
        order: 5,
        estimatedTime: 60,
        interactive: true,
        personalized: true,
      },
      {
        id: 'health_monitoring',
        title: 'Sağlık Takibi',
        description: 'Gerçek zamanlı sağlık izleme ve uyarılar',
        icon: 'pulse',
        category: 'feature',
        required: false,
        completed: false,
        order: 6,
        estimatedTime: 45,
        interactive: true,
        personalized: true,
      },
      {
        id: 'notifications_setup',
        title: 'Bildirim Ayarları',
        description: 'Akıllı bildirimler ve hatırlatıcılar',
        icon: 'notifications',
        category: 'personalization',
        required: false,
        completed: false,
        order: 7,
        estimatedTime: 30,
        interactive: true,
        personalized: true,
      },
      {
        id: 'completion',
        title: 'Hazırsınız!',
        description: 'GenoHealth deneyiminize başlayabilirsiniz',
        icon: 'checkmark-circle',
        category: 'completion',
        required: true,
        completed: false,
        order: 8,
        estimatedTime: 20,
        interactive: false,
        personalized: false,
      },
    ];

    defaultSteps.forEach(step => {
      this.steps.set(step.id, step);
    });

    this.progress.totalSteps = defaultSteps.length;
    await this.saveOnboardingSteps();
  }

  /**
   * Onboarding adımlarını kaydeder
   */
  private static async saveOnboardingSteps(): Promise<void> {
    try {
      const steps = Array.from(this.steps.values());
      await AsyncStorage.setItem('onboarding_steps', JSON.stringify(steps));
    } catch (error) {
      console.error('Onboarding adımlarını kaydetme hatası:', error);
    }
  }

  /**
   * İlerlemeyi yükler
   */
  private static async loadProgress(): Promise<void> {
    try {
      const progressData = await AsyncStorage.getItem('onboarding_progress');
      if (progressData) {
        this.progress = { ...this.progress, ...JSON.parse(progressData) };
      }
    } catch (error) {
      console.error('İlerlemeyi yükleme hatası:', error);
    }
  }

  /**
   * İlerlemeyi kaydeder
   */
  private static async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem('onboarding_progress', JSON.stringify(this.progress));
    } catch (error) {
      console.error('İlerlemeyi kaydetme hatası:', error);
    }
  }

  /**
   * Kişiselleştirme verilerini yükler
   */
  private static async loadPersonalizationData(): Promise<void> {
    try {
      const personalizationData = await AsyncStorage.getItem('personalization_data');
      if (personalizationData) {
        this.personalizationData = { ...this.personalizationData, ...JSON.parse(personalizationData) };
      }
    } catch (error) {
      console.error('Kişiselleştirme verilerini yükleme hatası:', error);
    }
  }

  /**
   * Kişiselleştirme verilerini kaydeder
   */
  private static async savePersonalizationData(): Promise<void> {
    try {
      await AsyncStorage.setItem('personalization_data', JSON.stringify(this.personalizationData));
    } catch (error) {
      console.error('Kişiselleştirme verilerini kaydetme hatası:', error);
    }
  }

  /**
   * Akıllı önerileri yükler
   */
  private static async loadSmartRecommendations(): Promise<void> {
    try {
      const recommendationsData = await AsyncStorage.getItem('smart_recommendations');
      if (recommendationsData) {
        this.smartRecommendations = JSON.parse(recommendationsData);
      } else {
        // Varsayılan önerileri oluştur
        await this.generateSmartRecommendations();
      }
    } catch (error) {
      console.error('Akıllı önerileri yükleme hatası:', error);
    }
  }

  /**
   * Akıllı önerileri kaydeder
   */
  private static async saveSmartRecommendations(): Promise<void> {
    try {
      await AsyncStorage.setItem('smart_recommendations', JSON.stringify(this.smartRecommendations));
    } catch (error) {
      console.error('Akıllı önerileri kaydetme hatası:', error);
    }
  }

  /**
   * Akıllı önerileri oluşturur
   */
  private static async generateSmartRecommendations(): Promise<void> {
    const recommendations: SmartRecommendation[] = [
      {
        type: 'feature',
        title: 'DNA Analizi Yapın',
        description: 'Kişiselleştirilmiş sağlık önerileri almak için DNA dosyanızı yükleyin',
        priority: 'high',
        personalized: false,
        reasoning: 'Temel özellik, tüm kullanıcılar için gerekli',
        action: 'navigate_to_dna_upload',
      },
      {
        type: 'tip',
        title: 'Günlük İpuçları',
        description: 'Her gün yeni genetik önerilerinizi alın',
        priority: 'medium',
        personalized: true,
        reasoning: 'Kullanıcı deneyimini artırır',
        action: 'enable_daily_tips',
      },
      {
        type: 'reminder',
        title: 'Sağlık Takibi',
        description: 'Gerçek zamanlı sağlık izleme ve uyarılar',
        priority: 'medium',
        personalized: true,
        reasoning: 'Sağlık hedeflerine ulaşmaya yardımcı olur',
        action: 'setup_health_monitoring',
      },
      {
        type: 'goal',
        title: 'Kişisel Hedefler',
        description: 'Sağlık hedeflerinizi belirleyin ve takip edin',
        priority: 'high',
        personalized: true,
        reasoning: 'Motivasyonu artırır ve odaklanmayı sağlar',
        action: 'set_health_goals',
      },
    ];

    this.smartRecommendations = recommendations;
    await this.saveSmartRecommendations();
  }

  /**
   * Onboarding'i başlatır
   */
  static async startOnboarding(): Promise<void> {
    try {
      this.progress.startTime = Date.now();
      this.progress.currentStep = 0;
      this.progress.completedSteps = 0;
      this.progress.skippedSteps = 0;
      this.progress.timeSpent = 0;
      
      await this.saveProgress();
      
      // Haptic feedback
      HapticFeedbackService.trigger('success');
      
      // Accessibility announcement
      AccessibilityService.announce('Onboarding başlatıldı', 'status');
      
      console.log('Onboarding başlatıldı');
    } catch (error) {
      console.error('Onboarding başlatma hatası:', error);
    }
  }

  /**
   * Adımı tamamlar
   */
  static async completeStep(stepId: string): Promise<void> {
    try {
      const step = this.steps.get(stepId);
      if (step) {
        step.completed = true;
        this.progress.completedSteps++;
        this.progress.currentStep = Math.max(this.progress.currentStep, step.order);
        
        // Tamamlanma oranını hesapla
        this.progress.completionRate = (this.progress.completedSteps / this.progress.totalSteps) * 100;
        
        await this.saveOnboardingSteps();
        await this.saveProgress();
        
        // Haptic feedback
        HapticFeedbackService.trigger('success');
        
        // Accessibility announcement
        AccessibilityService.announce(`${step.title} tamamlandı`, 'success');
        
        console.log(`Adım tamamlandı: ${step.title}`);
      }
    } catch (error) {
      console.error('Adım tamamlama hatası:', error);
    }
  }

  /**
   * Adımı atlar
   */
  static async skipStep(stepId: string): Promise<void> {
    try {
      const step = this.steps.get(stepId);
      if (step && !step.required) {
        this.progress.skippedSteps++;
        await this.saveProgress();
        
        // Haptic feedback
        HapticFeedbackService.trigger('warning');
        
        // Accessibility announcement
        AccessibilityService.announce(`${step.title} atlandı`, 'status');
        
        console.log(`Adım atlandı: ${step.title}`);
      }
    } catch (error) {
      console.error('Adım atlama hatası:', error);
    }
  }

  /**
   * Kişiselleştirme verilerini günceller
   */
  static async updatePersonalizationData(data: Partial<PersonalizationData>): Promise<void> {
    try {
      this.personalizationData = { ...this.personalizationData, ...data };
      this.progress.personalized = true;
      this.progress.userPreferences = data.preferences || {};
      
      await this.savePersonalizationData();
      await this.saveProgress();
      
      // Yeni akıllı öneriler oluştur
      await this.generatePersonalizedRecommendations();
      
      console.log('Kişiselleştirme verileri güncellendi');
    } catch (error) {
      console.error('Kişiselleştirme verilerini güncelleme hatası:', error);
    }
  }

  /**
   * Kişiselleştirilmiş öneriler oluşturur
   */
  private static async generatePersonalizedRecommendations(): Promise<void> {
    const personalizedRecommendations: SmartRecommendation[] = [];
    
    // Yaş bazlı öneriler
    if (this.personalizationData.age < 30) {
      personalizedRecommendations.push({
        type: 'tip',
        title: 'Genç Yetişkin Sağlığı',
        description: 'Genç yaşta sağlık alışkanlıkları oluşturun',
        priority: 'medium',
        personalized: true,
        reasoning: 'Yaş grubuna özel öneri',
        action: 'view_young_adult_tips',
      });
    } else if (this.personalizationData.age > 50) {
      personalizedRecommendations.push({
        type: 'tip',
        title: 'Orta Yaş Sağlığı',
        description: 'Orta yaşta sağlık risklerini yönetin',
        priority: 'high',
        personalized: true,
        reasoning: 'Yaş grubuna özel öneri',
        action: 'view_middle_age_tips',
      });
    }
    
    // Yaşam tarzı bazlı öneriler
    if (this.personalizationData.lifestyle === 'active') {
      personalizedRecommendations.push({
        type: 'feature',
        title: 'Aktif Yaşam Takibi',
        description: 'Aktif yaşam tarzınız için özel takip',
        priority: 'medium',
        personalized: true,
        reasoning: 'Aktif yaşam tarzına uygun',
        action: 'setup_active_lifestyle_tracking',
      });
    } else if (this.personalizationData.lifestyle === 'sedentary') {
      personalizedRecommendations.push({
        type: 'reminder',
        title: 'Hareket Hatırlatıcısı',
        description: 'Düzenli hareket için hatırlatıcılar',
        priority: 'high',
        personalized: true,
        reasoning: 'Sedanter yaşam tarzı için gerekli',
        action: 'setup_movement_reminders',
      });
    }
    
    // Deneyim seviyesi bazlı öneriler
    if (this.personalizationData.experienceLevel === 'beginner') {
      personalizedRecommendations.push({
        type: 'tutorial',
        title: 'Başlangıç Rehberi',
        description: 'GenoHealth\'i nasıl kullanacağınızı öğrenin',
        priority: 'high',
        personalized: true,
        reasoning: 'Yeni kullanıcı için gerekli',
        action: 'start_beginner_tutorial',
      });
    } else if (this.personalizationData.experienceLevel === 'advanced') {
      personalizedRecommendations.push({
        type: 'feature',
        title: 'Gelişmiş Analiz',
        description: 'Detaylı genetik analiz ve raporlar',
        priority: 'medium',
        personalized: true,
        reasoning: 'Deneyimli kullanıcı için uygun',
        action: 'access_advanced_analysis',
      });
    }
    
    // Önerileri birleştir
    this.smartRecommendations = [...this.smartRecommendations, ...personalizedRecommendations];
    await this.saveSmartRecommendations();
  }

  /**
   * Onboarding'i tamamlar
   */
  static async completeOnboarding(): Promise<void> {
    try {
      this.progress.endTime = Date.now();
      this.progress.timeSpent = Math.floor((this.progress.endTime - this.progress.startTime) / 1000);
      
      await this.saveProgress();
      
      // Haptic feedback
      HapticFeedbackService.trigger('success');
      
      // Accessibility announcement
      AccessibilityService.announce('Onboarding tamamlandı! GenoHealth\'e hoş geldiniz', 'success');
      
      console.log('Onboarding tamamlandı');
    } catch (error) {
      console.error('Onboarding tamamlama hatası:', error);
    }
  }

  /**
   * Onboarding adımlarını getirir
   */
  static getOnboardingSteps(): OnboardingStep[] {
    return Array.from(this.steps.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Mevcut adımı getirir
   */
  static getCurrentStep(): OnboardingStep | null {
    const steps = this.getOnboardingSteps();
    return steps.find(step => !step.completed) || null;
  }

  /**
   * İlerlemeyi getirir
   */
  static getProgress(): OnboardingProgress {
    return { ...this.progress };
  }

  /**
   * Kişiselleştirme verilerini getirir
   */
  static getPersonalizationData(): PersonalizationData {
    return { ...this.personalizationData };
  }

  /**
   * Akıllı önerileri getirir
   */
  static getSmartRecommendations(): SmartRecommendation[] {
    return [...this.smartRecommendations];
  }

  /**
   * Öncelikli önerileri getirir
   */
  static getPriorityRecommendations(): SmartRecommendation[] {
    return this.smartRecommendations
      .filter(rec => rec.priority === 'high')
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Kişiselleştirilmiş önerileri getirir
   */
  static getPersonalizedRecommendations(): SmartRecommendation[] {
    return this.smartRecommendations
      .filter(rec => rec.personalized)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Onboarding istatistiklerini getirir
   */
  static getOnboardingStats(): {
    completionRate: number;
    timeSpent: number;
    personalized: boolean;
    recommendations: number;
    nextSteps: OnboardingStep[];
  } {
    const nextSteps = this.getOnboardingSteps().filter(step => !step.completed);
    
    return {
      completionRate: this.progress.completionRate,
      timeSpent: this.progress.timeSpent,
      personalized: this.progress.personalized,
      recommendations: this.smartRecommendations.length,
      nextSteps,
    };
  }

  /**
   * Onboarding'i sıfırlar
   */
  static async resetOnboarding(): Promise<void> {
    try {
      this.steps.clear();
      this.progress = {
        currentStep: 0,
        totalSteps: 0,
        completedSteps: 0,
        skippedSteps: 0,
        timeSpent: 0,
        startTime: 0,
        personalized: false,
        userPreferences: {},
        completionRate: 0,
      };
      this.smartRecommendations = [];
      
      await this.createDefaultSteps();
      await this.saveProgress();
      await this.saveSmartRecommendations();
      
      console.log('Onboarding sıfırlandı');
    } catch (error) {
      console.error('Onboarding sıfırlama hatası:', error);
    }
  }

  /**
   * Servisi temizler
   */
  static async cleanup(): Promise<void> {
    try {
      await this.saveOnboardingSteps();
      await this.saveProgress();
      await this.savePersonalizationData();
      await this.saveSmartRecommendations();
      this.steps.clear();
      this.smartRecommendations = [];
      this.isInitialized = false;
    } catch (error) {
      console.error('Servis temizleme hatası:', error);
    }
  }
}


