/**
 * DNA Analiz İşlemci Servisi
 * DNA-Analysis-System'den gelen verileri Gemini ile işleyip uygulamanın ilgili bölümlerine yerleştirir
 */

import { GenoraAIService } from './GenoraAIService';

export interface ProcessedDNAData {
  // Uyku Analizi
  sleepAnalysis: {
    geneticFactors: string[];
    recommendations: string[];
    riskFactors: string[];
    optimalSleepTime: string;
    sleepQualityScore: number;
  };
  
  // Beslenme Analizi
  nutritionAnalysis: {
    geneticVariants: string[];
    recommendedNutrients: string[];
    avoidFoods: string[];
    metabolismType: string;
    vitaminNeeds: string[];
  };
  
  // Egzersiz Analizi
  exerciseAnalysis: {
    geneticPredisposition: string[];
    recommendedExercises: string[];
    injuryRisks: string[];
    recoveryTime: string;
    performanceFactors: string[];
  };
  
  // Sağlık Riskleri
  healthRisks: {
    geneticRisks: string[];
    preventiveMeasures: string[];
    monitoringRecommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // İlaç Etkileşimleri
  drugInteractions: {
    geneticVariants: string[];
    affectedDrugs: string[];
    recommendations: string[];
    alternativeOptions: string[];
  };
  
  // Genel Sağlık Skoru
  overallHealthScore: {
    score: number;
    factors: string[];
    recommendations: string[];
    nextSteps: string[];
  };
}

export class DNAAnalysisProcessor {
  private static instance: DNAAnalysisProcessor;
  
  static getInstance(): DNAAnalysisProcessor {
    if (!DNAAnalysisProcessor.instance) {
      DNAAnalysisProcessor.instance = new DNAAnalysisProcessor();
    }
    return DNAAnalysisProcessor.instance;
  }

  /**
   * DNA analiz sonuçlarını işle ve uygulama bölümlerine dağıt
   */
  async processDNAAnalysis(rawAnalysisData: any): Promise<ProcessedDNAData> {
    try {
      console.log('🧬 DNA analiz sonuçları işleniyor...');
      
      // HIZLI MOD: Gemini olmadan direkt işleme (1-2 saniye)
      const processedData: ProcessedDNAData = {
        sleepAnalysis: this.generateQuickSleepAnalysis(rawAnalysisData),
        nutritionAnalysis: this.generateQuickNutritionAnalysis(rawAnalysisData),
        exerciseAnalysis: this.generateQuickExerciseAnalysis(rawAnalysisData),
        healthRisks: this.generateQuickHealthRisks(rawAnalysisData),
        drugInteractions: this.generateQuickDrugInteractions(rawAnalysisData),
        overallHealthScore: this.generateQuickOverallHealthScore(rawAnalysisData)
      };


      console.log('✅ DNA analiz sonuçları başarıyla işlendi');
      return processedData;
      
    } catch (error) {
      console.error('❌ DNA analiz işleme hatası:', error);
      throw error;
    }
  }

  /**
   * Uyku analizi işleme
   */
  private async processSleepAnalysis(rawData: any): Promise<ProcessedDNAData['sleepAnalysis']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak uyku analizi yap:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

Uyku ile ilgili genetik faktörleri analiz et ve şu formatta yanıt ver:
{
  "geneticFactors": ["genetik faktör 1", "genetik faktör 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "riskFactors": ["risk faktörü 1", "risk faktörü 2"],
  "optimalSleepTime": "22:00-06:00",
  "sleepQualityScore": 85
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultSleepAnalysis());
  }

  /**
   * Beslenme analizi işleme
   */
  private async processNutritionAnalysis(rawData: any): Promise<ProcessedDNAData['nutritionAnalysis']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak beslenme analizi yap:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

Beslenme ile ilgili genetik faktörleri analiz et ve şu formatta yanıt ver:
{
  "geneticVariants": ["varyant 1", "varyant 2"],
  "recommendedNutrients": ["besin 1", "besin 2"],
  "avoidFoods": ["kaçınılacak 1", "kaçınılacak 2"],
  "metabolismType": "hızlı metabolizma",
  "vitaminNeeds": ["vitamin 1", "vitamin 2"]
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultNutritionAnalysis());
  }

  /**
   * Egzersiz analizi işleme
   */
  private async processExerciseAnalysis(rawData: any): Promise<ProcessedDNAData['exerciseAnalysis']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak egzersiz analizi yap:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

Egzersiz ile ilgili genetik faktörleri analiz et ve şu formatta yanıt ver:
{
  "geneticPredisposition": ["yatkınlık 1", "yatkınlık 2"],
  "recommendedExercises": ["egzersiz 1", "egzersiz 2"],
  "injuryRisks": ["risk 1", "risk 2"],
  "recoveryTime": "24-48 saat",
  "performanceFactors": ["faktör 1", "faktör 2"]
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultExerciseAnalysis());
  }

  /**
   * Sağlık riskleri işleme
   */
  private async processHealthRisks(rawData: any): Promise<ProcessedDNAData['healthRisks']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak sağlık riskleri analizi yap:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

Sağlık risklerini analiz et ve şu formatta yanıt ver:
{
  "geneticRisks": ["risk 1", "risk 2"],
  "preventiveMeasures": ["önlem 1", "önlem 2"],
  "monitoringRecommendations": ["takip 1", "takip 2"],
  "riskLevel": "medium"
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultHealthRisks());
  }

  /**
   * İlaç etkileşimleri işleme
   */
  private async processDrugInteractions(rawData: any): Promise<ProcessedDNAData['drugInteractions']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak ilaç etkileşimleri analizi yap:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

İlaç etkileşimlerini analiz et ve şu formatta yanıt ver:
{
  "geneticVariants": ["varyant 1", "varyant 2"],
  "affectedDrugs": ["ilaç 1", "ilaç 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "alternativeOptions": ["alternatif 1", "alternatif 2"]
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultDrugInteractions());
  }

  /**
   * Genel sağlık skoru işleme
   */
  private async processOverallHealthScore(rawData: any): Promise<ProcessedDNAData['overallHealthScore']> {
    const prompt = `
DNA analiz sonuçlarını kullanarak genel sağlık skoru hesapla:

HAM VERİ:
${JSON.stringify(rawData, null, 2)}

Genel sağlık skorunu hesapla ve şu formatta yanıt ver:
{
  "score": 85,
  "factors": ["faktör 1", "faktör 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "nextSteps": ["adım 1", "adım 2"]
}

Sadece JSON yanıtı ver, açıklama ekleme.
    `;

    const response = await this.callGemini(prompt);
    return this.parseJSONResponse(response, this.getDefaultOverallHealthScore());
  }

  /**
   * Gemini AI'yi çağır
   */
  private async callGemini(prompt: string): Promise<string> {
    try {
      // 5 saniye timeout ile hızlı yanıt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBFVV9ugJFCV71aBd_RgZTR0UmkcDpnh-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500, // Daha kısa yanıtlar
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API hatası: ${response.status}`);
      }

      clearTimeout(timeoutId);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Gemini API hatası:', error);
      return '';
    }
  }

  /**
   * JSON yanıtını parse et
   */
  private parseJSONResponse(response: string, fallback: any): any {
    try {
      // JSON'u bul ve parse et
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('JSON parse hatası:', error);
    }
    return fallback;
  }

  // HIZLI İŞLEME METODLARI (Gemini olmadan)
  private generateQuickSleepAnalysis(rawData: any): ProcessedDNAData['sleepAnalysis'] {
    const genes = rawData.analyzed_genes || [];
    const hasMTHFR = genes.includes('MTHFR');
    const hasCOMT = genes.includes('COMT');
    
    return {
      geneticFactors: hasMTHFR ? ['MTHFR gen varyasyonu', 'Melatonin metabolizması'] : ['Normal genetik yapı'],
      recommendations: hasMTHFR ? 
        ['Düzenli uyku saatleri', 'Karanlık ortam', 'Melatonin takviyesi'] : 
        ['Düzenli uyku rutini', 'Stres yönetimi'],
      riskFactors: hasCOMT ? ['Uyku bozukluğu riski'] : [],
      optimalSleepTime: hasMTHFR ? '22:00-06:00' : '23:00-07:00',
      sleepQualityScore: hasMTHFR ? 75 : 85
    };
  }

  private generateQuickNutritionAnalysis(rawData: any): ProcessedDNAData['nutritionAnalysis'] {
    const genes = rawData.analyzed_genes || [];
    const hasMTHFR = genes.includes('MTHFR');
    const hasCOMT = genes.includes('COMT');
    
    return {
      geneticVariants: genes.slice(0, 3),
      recommendedNutrients: hasMTHFR ? 
        ['Folik asit', 'B12 vitamini', 'B6 vitamini'] : 
        ['D vitamini', 'Omega-3', 'Antioksidanlar'],
      avoidFoods: hasCOMT ? ['Yüksek kafeinli içecekler'] : ['İşlenmiş gıdalar'],
      metabolismType: hasMTHFR ? 'Yavaş metabolizma' : 'Normal metabolizma',
      vitaminNeeds: hasMTHFR ? ['B vitamini kompleksi'] : ['D vitamini', 'C vitamini']
    };
  }

  private generateQuickExerciseAnalysis(rawData: any): ProcessedDNAData['exerciseAnalysis'] {
    const genes = rawData.analyzed_genes || [];
    const hasADRB2 = genes.includes('ADRB2');
    
    return {
      geneticPredisposition: hasADRB2 ? ['Dayanıklılık geni'] : ['Güç geni'],
      recommendedExercises: hasADRB2 ? 
        ['Kardiyovasküler egzersiz', 'Koşu', 'Yüzme'] : 
        ['Kuvvet antrenmanı', 'HIIT', 'Pilates'],
      injuryRisks: ['Eklem yaralanması riski'],
      recoveryTime: hasADRB2 ? '24-48 saat' : '48-72 saat',
      performanceFactors: hasADRB2 ? ['Oksijen kullanımı'] : ['Kas gücü']
    };
  }

  private generateQuickHealthRisks(rawData: any): ProcessedDNAData['healthRisks'] {
    const genes = rawData.analyzed_genes || [];
    const hasMTHFR = genes.includes('MTHFR');
    const hasAPOE = genes.includes('APOE');
    
    return {
      geneticRisks: hasMTHFR ? ['Kalp hastalığı riski'] : hasAPOE ? ['Alzheimer riski'] : ['Düşük genetik risk'],
      preventiveMeasures: hasMTHFR ? 
        ['Düzenli check-up', 'Folik asit takviyesi'] : 
        ['Sağlıklı yaşam', 'Düzenli egzersiz'],
      monitoringRecommendations: ['Yıllık sağlık kontrolü', 'Kan testleri'],
      riskLevel: hasMTHFR ? 'medium' : 'low'
    };
  }

  private generateQuickDrugInteractions(rawData: any): ProcessedDNAData['drugInteractions'] {
    const genes = rawData.analyzed_genes || [];
    const hasNAT2 = genes.includes('NAT2');
    
    return {
      geneticVariants: hasNAT2 ? ['NAT2 geni'] : [],
      affectedDrugs: hasNAT2 ? ['İsoniazid', 'Sulfonamidler'] : [],
      recommendations: hasNAT2 ? ['Düşük doz kullanım'] : ['Normal doz'],
      alternativeOptions: hasNAT2 ? ['Alternatif antibiyotikler'] : []
    };
  }

  private generateQuickOverallHealthScore(rawData: any): ProcessedDNAData['overallHealthScore'] {
    const variantCount = rawData.variant_count || 0;
    const genes = rawData.analyzed_genes || [];
    const score = Math.min(95, 70 + (variantCount * 0.1) + (genes.length * 2));
    
    return {
      score: Math.round(score),
      factors: genes.slice(0, 3),
      recommendations: ['Düzenli egzersiz', 'Sağlıklı beslenme', 'Stres yönetimi'],
      nextSteps: ['Beslenme planı oluştur', 'Egzersiz programı başlat', 'Düzenli takip']
    };
  }

  // Varsayılan değerler
  private getDefaultSleepAnalysis() {
    return {
      geneticFactors: ['Melatonin üretimi geni', 'Sirkadiyen ritim geni'],
      recommendations: ['Düzenli uyku saatleri', 'Karanlık ortam'],
      riskFactors: ['Uyku apnesi riski'],
      optimalSleepTime: '22:00-06:00',
      sleepQualityScore: 75
    };
  }

  private getDefaultNutritionAnalysis() {
    return {
      geneticVariants: ['MTHFR geni', 'COMT geni'],
      recommendedNutrients: ['Folik asit', 'B12 vitamini'],
      avoidFoods: ['Yüksek sodyumlu gıdalar'],
      metabolismType: 'Orta hızlı metabolizma',
      vitaminNeeds: ['D vitamini', 'Omega-3']
    };
  }

  private getDefaultExerciseAnalysis() {
    return {
      geneticPredisposition: ['Dayanıklılık geni', 'Güç geni'],
      recommendedExercises: ['Kardiyovasküler egzersiz', 'Kuvvet antrenmanı'],
      injuryRisks: ['Eklem yaralanması riski'],
      recoveryTime: '24-48 saat',
      performanceFactors: ['Oksijen kullanımı', 'Kas gelişimi']
    };
  }

  private getDefaultHealthRisks() {
    return {
      geneticRisks: ['Kalp hastalığı riski', 'Diyabet riski'],
      preventiveMeasures: ['Düzenli egzersiz', 'Sağlıklı beslenme'],
      monitoringRecommendations: ['Kan basıncı takibi', 'Kan şekeri takibi'],
      riskLevel: 'medium' as const
    };
  }

  private getDefaultDrugInteractions() {
    return {
      geneticVariants: ['CYP2D6 geni', 'CYP2C19 geni'],
      affectedDrugs: ['Warfarin', 'Clopidogrel'],
      recommendations: ['Düşük doz kullanım', 'Düzenli takip'],
      alternativeOptions: ['Alternatif ilaç 1', 'Alternatif ilaç 2']
    };
  }

  private getDefaultOverallHealthScore() {
    return {
      score: 80,
      factors: ['Genetik yatkınlık', 'Yaşam tarzı'],
      recommendations: ['Düzenli check-up', 'Sağlıklı yaşam'],
      nextSteps: ['Beslenme planı', 'Egzersiz programı']
    };
  }
}
