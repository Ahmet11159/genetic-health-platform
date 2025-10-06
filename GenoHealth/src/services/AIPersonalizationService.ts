// AI destekli kişiselleştirme servisi
import { LocalAIService } from './LocalAIService';
import { GenoraAIService } from './GenoraAIService';

export interface AIPersonalizationProfile {
  userId: string;
  geneticProfile: any;
  lifestyleData: {
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goals: string[];
    preferences: {
      diet: string[];
      exercise: string[];
      sleep: string[];
    };
    healthConditions: string[];
    medications: string[];
  };
  aiInsights: {
    personality: string;
    motivationStyle: string;
    learningStyle: string;
    communicationStyle: string;
    riskTolerance: 'low' | 'moderate' | 'high';
    preferredApproach: 'conservative' | 'balanced' | 'aggressive';
  };
  personalizedRecommendations: {
    nutrition: AIPersonalizedRecommendation[];
    exercise: AIPersonalizedRecommendation[];
    lifestyle: AIPersonalizedRecommendation[];
    health: AIPersonalizedRecommendation[];
  };
  lastUpdated: string;
}

export interface AIPersonalizedRecommendation {
  id: string;
  category: 'nutrition' | 'exercise' | 'lifestyle' | 'health';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string;
  expectedOutcome: string;
  aiConfidence: number;
  personalizedFor: string;
  relatedGenes: string[];
  scientificBasis: string[];
  implementationSteps: string[];
  monitoringTips: string[];
  alternatives: string[];
}

export class AIPersonalizationService {
  private static isInitialized = false;

  static async initialize() {
    if (!this.isInitialized) {
      this.isInitialized = await LocalAIService.initialize();
    }
    return this.isInitialized;
  }

  /**
   * AI destekli kişiselleştirilmiş profil oluşturur
   */
  static async createPersonalizedProfile(
    geneticProfile: any,
    lifestyleData: any
  ): Promise<AIPersonalizationProfile> {
    try {
      // AI servisini başlat
      await this.initialize();
      
      // AI ile kişilik analizi
      const personalityAnalysis = await this.analyzePersonality(geneticProfile, lifestyleData);
      
      // AI ile motivasyon stili analizi
      const motivationStyle = await this.analyzeMotivationStyle(geneticProfile, lifestyleData);
      
      // AI ile öğrenme stili analizi
      const learningStyle = await this.analyzeLearningStyle(geneticProfile, lifestyleData);
      
      // AI ile iletişim stili analizi
      const communicationStyle = await this.analyzeCommunicationStyle(geneticProfile, lifestyleData);
      
      // Risk toleransı analizi
      const riskTolerance = await this.analyzeRiskTolerance(geneticProfile, lifestyleData);
      
      // Tercih edilen yaklaşım analizi
      const preferredApproach = await this.analyzePreferredApproach(geneticProfile, lifestyleData);
      
      // Kişiselleştirilmiş öneriler oluştur
      const personalizedRecommendations = await this.generatePersonalizedRecommendations(
        geneticProfile,
        lifestyleData,
        {
          personality: personalityAnalysis,
          motivationStyle,
          learningStyle,
          communicationStyle,
          riskTolerance,
          preferredApproach
        }
      );

      return {
        userId: `user_${Date.now()}`,
        geneticProfile,
        lifestyleData,
        aiInsights: {
          personality: personalityAnalysis,
          motivationStyle,
          learningStyle,
          communicationStyle,
          riskTolerance,
          preferredApproach
        },
        personalizedRecommendations,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI personalization error:', error);
      throw new Error('AI kişiselleştirme oluşturulamadı');
    }
  }

  /**
   * AI ile kişilik analizi
   */
  private static async analyzePersonality(geneticProfile: any, lifestyleData: any): Promise<string> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak kişilik analizi yap:
    
    Genetik Profil: ${JSON.stringify(geneticProfile.healthTraits?.slice(0, 5) || [])}
    Yaş: ${lifestyleData.age}
    Cinsiyet: ${lifestyleData.gender}
    Aktivite Seviyesi: ${lifestyleData.activityLevel}
    Hedefler: ${lifestyleData.goals?.join(', ') || 'Belirtilmemiş'}
    
    Bu verilere dayanarak kişinin kişilik özelliklerini analiz et ve kısa bir özet ver.
    `;

    try {
      const response = await this.callAI(prompt);
      return response || 'Analitik ve hedef odaklı kişilik';
    } catch (error) {
      return 'Analitik ve hedef odaklı kişilik';
    }
  }

  /**
   * AI ile motivasyon stili analizi
   */
  private static async analyzeMotivationStyle(geneticProfile: any, lifestyleData: any): Promise<string> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak motivasyon stili analizi yap:
    
    Genetik Risk Faktörleri: ${geneticProfile.riskFactors?.join(', ') || 'Düşük'}
    Hedefler: ${lifestyleData.goals?.join(', ') || 'Genel sağlık'}
    Aktivite Seviyesi: ${lifestyleData.activityLevel}
    
    Bu verilere dayanarak kişinin motivasyon stili nasıl olmalı? (içsel/dışsal, kısa vadeli/uzun vadeli, bireysel/grup)
    `;

    try {
      const response = await this.callAI(prompt);
      return response || 'İçsel motivasyon, uzun vadeli hedefler';
    } catch (error) {
      return 'İçsel motivasyon, uzun vadeli hedefler';
    }
  }

  /**
   * AI ile öğrenme stili analizi
   */
  private static async analyzeLearningStyle(geneticProfile: any, lifestyleData: any): Promise<string> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak öğrenme stili analizi yap:
    
    Genetik Özellikler: ${geneticProfile.healthTraits?.map((t: any) => t.trait).join(', ') || 'Normal'}
    Yaş: ${lifestyleData.age}
    Hedefler: ${lifestyleData.goals?.join(', ') || 'Genel sağlık'}
    
    Bu verilere dayanarak kişinin öğrenme stili nasıl olmalı? (görsel/işitsel/kinestetik, adım adım/detaylı, pratik/teorik)
    `;

    try {
      const response = await this.callAI(prompt);
      return response || 'Görsel ve pratik öğrenme';
    } catch (error) {
      return 'Görsel ve pratik öğrenme';
    }
  }

  /**
   * AI ile iletişim stili analizi
   */
  private static async analyzeCommunicationStyle(geneticProfile: any, lifestyleData: any): Promise<string> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak iletişim stili analizi yap:
    
    Genetik Profil: ${geneticProfile.healthTraits?.slice(0, 3).map((t: any) => t.trait).join(', ') || 'Normal'}
    Yaş: ${lifestyleData.age}
    Cinsiyet: ${lifestyleData.gender}
    
    Bu verilere dayanarak kişinin iletişim stili nasıl olmalı? (direkt/diplomatik, detaylı/özet, teknik/basit)
    `;

    try {
      const response = await this.callAI(prompt);
      return response || 'Direkt ve bilimsel';
    } catch (error) {
      return 'Direkt ve bilimsel';
    }
  }

  /**
   * AI ile risk toleransı analizi
   */
  private static async analyzeRiskTolerance(geneticProfile: any, lifestyleData: any): Promise<'low' | 'moderate' | 'high'> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak risk toleransı analizi yap:
    
    Genetik Risk Faktörleri: ${geneticProfile.riskFactors?.length || 0} adet
    Yaş: ${lifestyleData.age}
    Sağlık Durumu: ${lifestyleData.healthConditions?.length || 0} durum
    
    Bu verilere dayanarak risk toleransı: düşük, orta veya yüksek?
    `;

    try {
      const response = await this.callAI(prompt);
      if (response?.toLowerCase().includes('yüksek')) return 'high';
      if (response?.toLowerCase().includes('düşük')) return 'low';
      return 'moderate';
    } catch (error) {
      return 'moderate';
    }
  }

  /**
   * AI ile tercih edilen yaklaşım analizi
   */
  private static async analyzePreferredApproach(geneticProfile: any, lifestyleData: any): Promise<'conservative' | 'balanced' | 'aggressive'> {
    const prompt = `
    Genetik profil ve yaşam tarzı verilerine dayanarak tercih edilen yaklaşım analizi yap:
    
    Genetik Risk Seviyesi: ${geneticProfile.geneticRiskProfile?.overallRisk || 'moderate'}
    Yaş: ${lifestyleData.age}
    Aktivite Seviyesi: ${lifestyleData.activityLevel}
    
    Bu verilere dayanarak yaklaşım: muhafazakar, dengeli veya agresif?
    `;

    try {
      const response = await this.callAI(prompt);
      if (response?.toLowerCase().includes('agresif')) return 'aggressive';
      if (response?.toLowerCase().includes('muhafazakar')) return 'conservative';
      return 'balanced';
    } catch (error) {
      return 'balanced';
    }
  }

  /**
   * AI ile kişiselleştirilmiş öneriler oluşturur
   */
  private static async generatePersonalizedRecommendations(
    geneticProfile: any,
    lifestyleData: any,
    aiInsights: any
  ): Promise<{ nutrition: AIPersonalizedRecommendation[]; exercise: AIPersonalizedRecommendation[]; lifestyle: AIPersonalizedRecommendation[]; health: AIPersonalizedRecommendation[] }> {
    
    const nutritionRecommendations = await this.generateNutritionRecommendations(geneticProfile, lifestyleData, aiInsights);
    const exerciseRecommendations = await this.generateExerciseRecommendations(geneticProfile, lifestyleData, aiInsights);
    const lifestyleRecommendations = await this.generateLifestyleRecommendations(geneticProfile, lifestyleData, aiInsights);
    const healthRecommendations = await this.generateHealthRecommendations(geneticProfile, lifestyleData, aiInsights);

    return {
      nutrition: nutritionRecommendations,
      exercise: exerciseRecommendations,
      lifestyle: lifestyleRecommendations,
      health: healthRecommendations
    };
  }

  /**
   * AI ile beslenme önerileri oluşturur
   */
  private static async generateNutritionRecommendations(
    geneticProfile: any,
    lifestyleData: any,
    aiInsights: any
  ): Promise<AIPersonalizedRecommendation[]> {
    try {
      // QWEN AI ile genetik analiz
      const genoraResponse = await GenoraAIService.generateGeneticAnalysis(
        geneticProfile,
        'nutrition',
        lifestyleData
      );
      
      return this.parseQwenResponse(genoraResponse.text, 'nutrition');
    } catch (error) {
      console.error('QWEN nutrition analysis error:', error);
      return this.getDefaultNutritionRecommendations(geneticProfile, lifestyleData);
    }
  }

  /**
   * AI ile egzersiz önerileri oluşturur
   */
  private static async generateExerciseRecommendations(
    geneticProfile: any,
    lifestyleData: any,
    aiInsights: any
  ): Promise<AIPersonalizedRecommendation[]> {
    try {
      // QWEN AI ile genetik analiz
      const genoraResponse = await GenoraAIService.generateGeneticAnalysis(
        geneticProfile,
        'exercise',
        lifestyleData
      );
      
      return this.parseQwenResponse(genoraResponse.text, 'exercise');
    } catch (error) {
      console.error('QWEN exercise analysis error:', error);
      return this.getDefaultExerciseRecommendations(geneticProfile, lifestyleData);
    }
  }

  /**
   * AI ile yaşam tarzı önerileri oluşturur
   */
  private static async generateLifestyleRecommendations(
    geneticProfile: any,
    lifestyleData: any,
    aiInsights: any
  ): Promise<AIPersonalizedRecommendation[]> {
    try {
      // QWEN AI ile genetik analiz
      const genoraResponse = await GenoraAIService.generateGeneticAnalysis(
        geneticProfile,
        'lifestyle',
        lifestyleData
      );
      
      return this.parseQwenResponse(genoraResponse.text, 'lifestyle');
    } catch (error) {
      console.error('QWEN lifestyle analysis error:', error);
      return this.getDefaultLifestyleRecommendations(geneticProfile, lifestyleData);
    }
  }

  /**
   * AI ile sağlık önerileri oluşturur
   */
  private static async generateHealthRecommendations(
    geneticProfile: any,
    lifestyleData: any,
    aiInsights: any
  ): Promise<AIPersonalizedRecommendation[]> {
    try {
      // QWEN AI ile genetik analiz
      const genoraResponse = await GenoraAIService.generateGeneticAnalysis(
        geneticProfile,
        'health',
        lifestyleData
      );
      
      return this.parseQwenResponse(genoraResponse.text, 'health');
    } catch (error) {
      console.error('QWEN health analysis error:', error);
      return this.getDefaultHealthRecommendations(geneticProfile, lifestyleData);
    }
  }

  /**
   * AI çağrısı yapar
   */
  private static async callAI(prompt: string): Promise<string> {
    try {
      const response = await LocalAIService.generateText(prompt);
      return response.text;
    } catch (error) {
      console.error('AI call error:', error);
      throw error;
    }
  }

  /**
   * QWEN AI yanıtını önerilere dönüştürür
   */
  private static parseQwenResponse(response: string, category: string): AIPersonalizedRecommendation[] {
    try {
      const recommendations: AIPersonalizedRecommendation[] = [];
      
      // QWEN yanıtını parse et
      const lines = response.split('\n').filter(line => line.trim());
      
      let currentRecommendation: Partial<AIPersonalizedRecommendation> = {};
      let recommendationIndex = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('GENETİK ANALİZ') || trimmedLine.includes('RİSK DEĞERLENDİRMESİ')) {
          // Yeni öneri başlıyor
          if (Object.keys(currentRecommendation).length > 0) {
            recommendations.push(this.finalizeRecommendation(currentRecommendation, category, recommendationIndex));
            recommendationIndex++;
          }
          currentRecommendation = {
            id: `qwen_${category}_${recommendationIndex}`,
            category: category as any,
            title: this.extractTitle(trimmedLine),
            description: '',
            reasoning: '',
            priority: 'medium',
            difficulty: 'medium',
            timeRequired: '30 dakika/gün',
            expectedOutcome: 'Sağlık iyileştirmesi',
            aiConfidence: 0.85,
            personalizedFor: 'QWEN AI analizi',
            relatedGenes: [],
            scientificBasis: [],
            implementationSteps: [],
            monitoringTips: [],
            alternatives: []
          };
        } else if (trimmedLine.includes('KİŞİSELLEŞTİRİLMİŞ ÖNERİLER') || trimmedLine.match(/^\d+\./)) {
          // Öneri detayları
          if (currentRecommendation.title) {
            currentRecommendation.description = trimmedLine;
          }
        } else if (trimmedLine.includes('UYGULAMA ADIMLARI')) {
          // Uygulama adımları
          currentRecommendation.implementationSteps = [trimmedLine];
        } else if (trimmedLine.includes('BİLİMSEL TEMEL')) {
          // Bilimsel temel
          currentRecommendation.scientificBasis = [trimmedLine];
        } else if (trimmedLine.includes('TAKİP ÖNERİLERİ')) {
          // Takip önerileri
          currentRecommendation.monitoringTips = [trimmedLine];
        }
      }
      
      // Son öneriyi ekle
      if (Object.keys(currentRecommendation).length > 0) {
        recommendations.push(this.finalizeRecommendation(currentRecommendation, category, recommendationIndex));
      }
      
      return recommendations.length > 0 ? recommendations : this.getDefaultRecommendations(category);
    } catch (error) {
      console.error('QWEN response parsing error:', error);
      return this.getDefaultRecommendations(category);
    }
  }

  /**
   * Öneriyi tamamlar
   */
  private static finalizeRecommendation(
    recommendation: Partial<AIPersonalizedRecommendation>, 
    category: string, 
    index: number
  ): AIPersonalizedRecommendation {
    return {
      id: recommendation.id || `qwen_${category}_${index}`,
      category: category as any,
      title: recommendation.title || `${category} Önerisi ${index + 1}`,
      description: recommendation.description || 'QWEN AI tarafından oluşturulmuş öneri',
      reasoning: recommendation.reasoning || 'Genetik profil analizi',
      priority: recommendation.priority || 'medium',
      difficulty: recommendation.difficulty || 'medium',
      timeRequired: recommendation.timeRequired || '30 dakika/gün',
      expectedOutcome: recommendation.expectedOutcome || 'Sağlık iyileştirmesi',
      aiConfidence: recommendation.aiConfidence || 0.85,
      personalizedFor: recommendation.personalizedFor || 'QWEN AI analizi',
      relatedGenes: recommendation.relatedGenes || ['MTHFR', 'COMT'],
      scientificBasis: recommendation.scientificBasis || ['Nutrigenomics'],
      implementationSteps: recommendation.implementationSteps || ['Plan oluştur', 'Uygula'],
      monitoringTips: recommendation.monitoringTips || ['Düzenli takip'],
      alternatives: recommendation.alternatives || ['Alternatif yöntemler']
    };
  }

  /**
   * Başlık çıkarır
   */
  private static extractTitle(line: string): string {
    if (line.includes('GENETİK ANALİZ')) return 'Genetik Analiz Önerisi';
    if (line.includes('RİSK DEĞERLENDİRMESİ')) return 'Risk Değerlendirme Önerisi';
    if (line.includes('KİŞİSELLEŞTİRİLMİŞ ÖNERİLER')) return 'Kişiselleştirilmiş Öneri';
    return 'AI Önerisi';
  }

  /**
   * AI yanıtını önerilere dönüştürür
   */
  private static parseRecommendations(response: string, category: string): AIPersonalizedRecommendation[] {
    // AI yanıtını parse et ve önerilere dönüştür
    // Bu kısım AI yanıt formatına göre özelleştirilebilir
    return this.getDefaultRecommendations(category);
  }

  /**
   * Varsayılan öneriler
   */
  private static getDefaultRecommendations(category: string): AIPersonalizedRecommendation[] {
    const recommendations: { [key: string]: AIPersonalizedRecommendation[] } = {
      nutrition: this.getDefaultNutritionRecommendations({}, {}),
      exercise: this.getDefaultExerciseRecommendations({}, {}),
      lifestyle: this.getDefaultLifestyleRecommendations({}, {}),
      health: this.getDefaultHealthRecommendations({}, {})
    };

    return recommendations[category] || [];
  }

  private static getDefaultNutritionRecommendations(geneticProfile: any, lifestyleData: any): AIPersonalizedRecommendation[] {
    return [
      {
        id: 'ai_nutrition_1',
        category: 'nutrition',
        title: 'Kişiselleştirilmiş Beslenme Planı',
        description: 'DNA analizinize göre optimize edilmiş beslenme programı',
        reasoning: 'Genetik metabolizma profiliniz ve yaşam tarzınıza uygun',
        priority: 'high',
        difficulty: 'medium',
        timeRequired: '30 dakika/gün',
        expectedOutcome: 'Optimal beslenme ve enerji seviyesi',
        aiConfidence: 95,
        personalizedFor: 'Genetik metabolizma profili',
        relatedGenes: ['MTHFR', 'CYP1A2'],
        scientificBasis: ['Nutrigenomics', 'Metabolic pathways'],
        implementationSteps: ['Plan oluştur', 'Malzemeleri hazırla', 'Uygula'],
        monitoringTips: ['Günlük takip', 'Haftalık değerlendirme'],
        alternatives: ['Alternatif besinler', 'Farklı pişirme yöntemleri']
      }
    ];
  }

  private static getDefaultExerciseRecommendations(geneticProfile: any, lifestyleData: any): AIPersonalizedRecommendation[] {
    return [
      {
        id: 'ai_exercise_1',
        category: 'exercise',
        title: 'Genetik Kas Tipi Egzersizi',
        description: 'ACTN3 geninize göre optimize edilmiş egzersiz programı',
        reasoning: 'Kas tipi genetik profilinize uygun antrenman',
        priority: 'high',
        difficulty: 'medium',
        timeRequired: '45 dakika/gün',
        expectedOutcome: 'Optimal kas gelişimi ve performans',
        aiConfidence: 92,
        personalizedFor: 'Kas tipi genetik profili',
        relatedGenes: ['ACTN3', 'ADRB2'],
        scientificBasis: ['Exercise genomics', 'Muscle physiology'],
        implementationSteps: ['Program oluştur', 'Ekipman hazırla', 'Başla'],
        monitoringTips: ['Performans takibi', 'İlerleme ölçümü'],
        alternatives: ['Alternatif egzersizler', 'Farklı yoğunluklar']
      }
    ];
  }

  private static getDefaultLifestyleRecommendations(geneticProfile: any, lifestyleData: any): AIPersonalizedRecommendation[] {
    return [
      {
        id: 'ai_lifestyle_1',
        category: 'lifestyle',
        title: 'Kronotip Uyku Programı',
        description: 'PER3 geninize göre optimize edilmiş uyku düzeni',
        reasoning: 'Genetik uyku ritminize uygun program',
        priority: 'medium',
        difficulty: 'easy',
        timeRequired: '5 dakika/gün',
        expectedOutcome: 'Daha iyi uyku kalitesi ve enerji',
        aiConfidence: 88,
        personalizedFor: 'Kronotip genetik profili',
        relatedGenes: ['PER3', 'CLOCK'],
        scientificBasis: ['Chronobiology', 'Sleep genetics'],
        implementationSteps: ['Uyku saatlerini belirle', 'Rutin oluştur', 'Uygula'],
        monitoringTips: ['Uyku takibi', 'Enerji seviyesi ölçümü'],
        alternatives: ['Farklı uyku saatleri', 'Alternatif rutinler']
      }
    ];
  }

  private static getDefaultHealthRecommendations(geneticProfile: any, lifestyleData: any): AIPersonalizedRecommendation[] {
    return [
      {
        id: 'ai_health_1',
        category: 'health',
        title: 'Genetik Risk Yönetimi',
        description: 'Genetik risk faktörlerinize göre önleyici sağlık planı',
        reasoning: 'Yüksek risk faktörleriniz için özel önlemler',
        priority: 'critical',
        difficulty: 'hard',
        timeRequired: '60 dakika/hafta',
        expectedOutcome: 'Risk faktörlerinin azaltılması',
        aiConfidence: 98,
        personalizedFor: 'Genetik risk profili',
        relatedGenes: ['APOE', 'TCF7L2'],
        scientificBasis: ['Preventive medicine', 'Genetic risk assessment'],
        implementationSteps: ['Risk değerlendirmesi', 'Plan oluştur', 'Uygula'],
        monitoringTips: ['Düzenli kontroller', 'Biyomarker takibi'],
        alternatives: ['Alternatif önlemler', 'Farklı yaklaşımlar']
      }
    ];
  }
}
