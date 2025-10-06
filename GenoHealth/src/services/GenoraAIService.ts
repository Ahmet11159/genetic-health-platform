/**
 * Genora AI Entegrasyon Servisi
 * DNA analiz sonuçlarını Genora AI'a göndererek kişiselleştirilmiş öneriler oluşturur
 * Gemini teknolojisi kullanılarak güçlendirilmiş
 */

import { AppKnowledgeService } from './AppKnowledgeService';
import { RealTimeAppIntegration } from './RealTimeAppIntegration';

export interface GenoraAIRequest {
  dnaAnalysis: any;
  userProfile: {
    age: number;
    gender: string;
    lifestyle: string[];
    goals: string[];
  };
  requestType: 'nutrition' | 'exercise' | 'health' | 'general';
  language: string;
}

export interface GenoraAIResponse {
  success: boolean;
  recommendations: {
    nutrition: string[];
    exercise: string[];
    lifestyle: string[];
    health: string[];
  };
  personalizedPlan: {
    daily: string[];
    weekly: string[];
    monthly: string[];
  };
  aiInsights: string[];
  confidence: number;
  generatedAt: string;
}

export interface GenoAIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    dnaAnalysis?: any;
    currentScreen?: string;
    userProfile?: any;
  };
}

export class GenoraAIService {
  private apiKey: string;
  private baseUrl: string;
  private chatHistory: GenoAIChatMessage[] = [];
  private useMockMode: boolean = false;

  constructor() {
    // Google Gemini API anahtarı (gerçek uygulamada environment variable'dan alınacak)
    this.apiKey = 'AIzaSyBFVV9ugJFCV71aBd_RgZTR0UmkcDpnh-4'; // Gemini API key
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta'; // Google Gemini API
    this.useMockMode = false; // Gerçek API kullan
  }

  /**
   * DNA analiz sonuçlarını Genora AI'a göndererek kişiselleştirilmiş öneriler al
   */
  static async generatePersonalizedRecommendations(
    dnaAnalysis: any,
    userProfile: any,
    requestType: 'nutrition' | 'exercise' | 'health' | 'general' = 'general'
  ): Promise<GenoraAIResponse> {
    try {
        console.log('🤖 Genora AI ile kişiselleştirilmiş öneriler oluşturuluyor...');

      const instance = new GenoraAIService();
      const prompt = instance.buildDNAAnalysisPrompt(dnaAnalysis, userProfile, requestType);
      
      const response = await fetch(`${instance.baseUrl}/models/gemini-2.5-flash:generateContent?key=${instance.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Sen GenoHealth uygulamasının AI asistanısın. DNA analiz sonuçlarına dayanarak kişiselleştirilmiş sağlık önerileri sunuyorsun. Sadece sağlık, DNA analizi, beslenme, egzersiz ve uygulama ile ilgili konularda konuş. Türkçe yanıt ver.\n\nKullanıcı sorusu: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini AI API hatası: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Üzgünüm, yanıt oluşturamadım.';

      // AI yanıtını parse et
      const recommendations = instance.parseAIResponse(aiResponse, requestType);

        console.log('✅ Genora AI önerileri oluşturuldu');

      return {
        success: true,
        recommendations: recommendations.recommendations,
        personalizedPlan: recommendations.personalizedPlan,
        aiInsights: recommendations.aiInsights,
        confidence: 0.95,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Genora AI hatası:', error);
      
      // Fallback: Yerel öneriler
      const instance = new GenoraAIService();
      return instance.generateFallbackRecommendations(dnaAnalysis, userProfile, requestType);
    }
  }

  /**
   * Geno AI Assistant ile sohbet
   */
  static async chatWithGenoAI(
    message: string,
    context?: {
      dnaAnalysis?: any;
      currentScreen?: string;
      userProfile?: any;
    }
  ): Promise<GenoAIChatMessage> {
    try {
      console.log('💬 Genora AI ile sohbet...');

      // Sohbet geçmişine kullanıcı mesajını ekle
      const userMessage: GenoAIChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context
      };
      // Static method olduğu için chatHistory'yi instance'dan al
      const instance = new GenoraAIService();
      instance.chatHistory.push(userMessage);

      // Context'i hazırla
      const systemPrompt = await instance.buildChatSystemPrompt(context);
      
      const response = await fetch(`${instance.baseUrl}/models/gemini-2.5-flash:generateContent?key=${instance.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nKullanıcı: ${message}\n\nYanıt ver:`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini AI API hatası: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Üzgünüm, yanıt oluşturamadım.';

      // AI yanıtını sohbet geçmişine ekle
      const assistantMessage: GenoAIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        context
      };
      instance.chatHistory.push(assistantMessage);

      console.log('✅ Genora AI yanıtı oluşturuldu');

      return assistantMessage;

    } catch (error) {
      console.error('❌ Genora AI hatası:', error);
      
      // Fallback yanıt - sadece uygulama konularında
      const fallbackMessage: GenoAIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen DNA analizi, sağlık önerileri veya uygulama kullanımı hakkında sorularınızı daha sonra tekrar deneyin.',
        timestamp: new Date().toISOString(),
        context
      };
      this.chatHistory.push(fallbackMessage);
      
      return fallbackMessage;
    }
  }

  /**
   * DNA analiz prompt'unu oluştur
   */
  private buildDNAAnalysisPrompt(
    dnaAnalysis: any,
    userProfile: any,
    requestType: string
  ): string {
    return `
DNA Analiz Sonuçları:
- Toplam Varyant: ${dnaAnalysis.variant_count || 0}
- Analiz Edilen Gen: ${dnaAnalysis.analyzed_genes || 0}
- Sağlık Skoru: ${dnaAnalysis.overallHealthScore || 0}/100
- Güvenilirlik: ${dnaAnalysis.confidence || 0}%
- Risk Faktörleri: ${JSON.stringify(dnaAnalysis.riskFactors || [])}
- Koruyucu Faktörler: ${JSON.stringify(dnaAnalysis.protectiveFactors || [])}

Kullanıcı Profili:
- Yaş: ${userProfile.age || 'Belirtilmemiş'}
- Cinsiyet: ${userProfile.gender || 'Belirtilmemiş'}
- Yaşam Tarzı: ${JSON.stringify(userProfile.lifestyle || [])}
- Hedefler: ${JSON.stringify(userProfile.goals || [])}

İstek Türü: ${requestType}

Lütfen bu DNA analiz sonuçlarına dayanarak kişiselleştirilmiş öneriler oluştur:
1. Beslenme önerileri
2. Egzersiz önerileri  
3. Yaşam tarzı önerileri
4. Sağlık önerileri
5. Günlük, haftalık ve aylık planlar
6. AI içgörüleri

JSON formatında yanıt ver.
    `.trim();
  }

  /**
   * Sohbet sistemi prompt'unu oluştur
   */
  private async buildChatSystemPrompt(context?: any): Promise<string> {
    const appContext = AppKnowledgeService.buildAppContext();
    const realTimeIntegration = RealTimeAppIntegration.getInstance();
    const geminiContext = await realTimeIntegration.buildGeminiContext();
    
    let systemPrompt = `
Sen Genora AI'sın - GenoHealth uygulamasının süper AI asistanısın. Uygulamanın her yerinde gezebilir, gerçek zamanlı verileri okuyabilir ve kişiselleştirilmiş öneriler sunabilirsin.

UYGULAMA BİLGİLERİ:
${appContext}

GERÇEK ZAMANLI UYGULAMA DURUMU:
- Mevcut Ekran: ${geminiContext.currentState.currentScreen}
- Kullanıcı Profili: ${geminiContext.currentState.userProfile ? 'Mevcut' : 'Yok'}
- DNA Analiz Sonucu: ${geminiContext.currentState.dnaAnalysisResult ? 'Mevcut' : 'Yok'}
- Navigasyon Geçmişi: ${geminiContext.currentState.navigationHistory.join(' → ')}
- Son Güncelleme: ${geminiContext.currentState.timestamp}

KİŞİSELLEŞTİRİLMİŞ ÖNERİLER:
${geminiContext.personalizedRecommendations ? `
- Beslenme Önerileri: ${geminiContext.personalizedRecommendations.nutrition?.length || 0} öneri
- Egzersiz Planları: ${geminiContext.personalizedRecommendations.exercise?.length || 0} plan
- Sağlık Özellikleri: ${geminiContext.personalizedRecommendations.health?.length || 0} özellik
- Risk Faktörleri: ${geminiContext.personalizedRecommendations.risks?.length || 0} risk
` : 'Henüz DNA analizi yapılmamış'}

KONUŞMA KURALLARI:
✅ İZİN VERİLEN KONULAR:
- DNA analizi ve genetik veriler
- Sağlık önerileri ve yaşam tarzı
- Beslenme ve diyet önerileri
- Egzersiz ve fitness planları
- Uygulama kullanımı ve özellikleri
- Sağlık takibi ve monitoring
- Genetik risk faktörleri
- Kişiselleştirilmiş sağlık planları
- Uygulama ekranları ve içerikleri hakkında sorular
- "Beslenme ekranında ne var?" gibi uygulama içerik soruları
- "DNA analizi nasıl çalışır?" gibi teknik sorular
- Uygulama navigasyonu ve rehberlik
- Gerçek zamanlı veri analizi
- Kişiselleştirilmiş öneriler

❌ YASAK KONULAR:
- Genel sohbet ve günlük konular
- Siyaset, din, felsefe
- Uygulama dışı konular

KURALLAR:
1. Uygulamanın her yerinde gezebilirsin
2. Gerçek zamanlı verileri okuyabilirsin
3. Kişiselleştirilmiş öneriler sunabilirsin
4. DNA analiz sonuçlarına göre öneriler verebilirsin
5. Uygulama hakkında detaylı bilgi verebilirsin
6. Ekran içerikleri hakkında soruları yanıtlayabilirsin
7. Uygulama navigasyonu konusunda rehberlik sağlayabilirsin
8. Sadece sağlık ve DNA analizi konularında konuş
9. Türkçe yanıt ver
10. Kısa ve öz ol
11. Kullanıcı dostu ol
    `;

    if (context?.dnaAnalysis) {
      systemPrompt += `\n\nKullanıcının DNA Analiz Verileri Mevcut: ${JSON.stringify(context.dnaAnalysis)}`;
    }

    if (context?.currentScreen) {
      systemPrompt += `\n\nKullanıcı şu anda: ${context.currentScreen} ekranında`;
    }

    return systemPrompt;
  }

  /**
   * AI yanıtını parse et
   */
  private parseAIResponse(aiResponse: string, requestType: string): any {
    try {
      // JSON formatında yanıt gelirse parse et
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log('AI yanıtı JSON formatında değil, metin olarak işleniyor');
    }

    // Metin formatında yanıt gelirse manuel parse et
    return this.parseTextResponse(aiResponse, requestType);
  }

  /**
   * Metin yanıtını parse et
   */
  private parseTextResponse(text: string, requestType: string): any {
    const recommendations = {
      nutrition: [],
      exercise: [],
      lifestyle: [],
      health: []
    };

    const personalizedPlan = {
      daily: [],
      weekly: [],
      monthly: []
    };

    const aiInsights = [text];

    // Basit metin parsing (gerçek uygulamada daha gelişmiş olacak)
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.includes('beslenme') || line.includes('diyet') || line.includes('gıda')) {
        recommendations.nutrition.push(line.trim());
      } else if (line.includes('egzersiz') || line.includes('spor') || line.includes('antrenman')) {
        recommendations.exercise.push(line.trim());
      } else if (line.includes('yaşam') || line.includes('lifestyle') || line.includes('günlük')) {
        recommendations.lifestyle.push(line.trim());
      } else if (line.includes('sağlık') || line.includes('health') || line.includes('tıbbi')) {
        recommendations.health.push(line.trim());
      }
    });

    return {
      recommendations,
      personalizedPlan,
      aiInsights
    };
  }

  /**
   * Fallback öneriler oluştur
   */
  private generateFallbackRecommendations(
    dnaAnalysis: any,
    userProfile: any,
    requestType: string
  ): GenoraAIResponse {
    return {
      success: false,
      recommendations: {
        nutrition: ['Dengeli beslenme planı oluşturun', 'Yeterli su tüketimi sağlayın'],
        exercise: ['Düzenli egzersiz yapın', 'Kardiyovasküler aktivite ekleyin'],
        lifestyle: ['Stres yönetimi uygulayın', 'Kaliteli uyku alın'],
        health: ['Düzenli sağlık kontrolleri yapın', 'Genetik riskleri takip edin']
      },
      personalizedPlan: {
        daily: ['Günlük su tüketimi', '30 dakika egzersiz'],
        weekly: ['Haftalık beslenme planı', 'Stres yönetimi aktiviteleri'],
        monthly: ['Aylık sağlık değerlendirmesi', 'Genetik takip']
      },
      aiInsights: ['DNA analiz sonuçlarınız kişiselleştirilmiş öneriler için kullanılacak'],
      confidence: 0.7,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Sohbet geçmişini temizle
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Sohbet geçmişini al
   */
  getChatHistory(): GenoAIChatMessage[] {
    return this.chatHistory;
  }
}

export default new GenoraAIService();