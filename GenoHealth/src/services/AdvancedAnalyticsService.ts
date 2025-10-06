// Gelişmiş veri analizi ve trend grafikleri servisi
import { AnalysisResult } from '../types/DNA';
import { HealthData } from './HealthDataSyncService';

export interface TrendData {
  date: Date;
  value: number;
  category: string;
  metadata?: any;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export interface HealthTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  data: TrendData[];
  prediction?: {
    nextValue: number;
    confidence: number;
  };
}

export interface GeneticInsight {
  gene: string;
  insight: string;
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
  timeframe: string;
}

export interface HealthScore {
  overall: number;
  categories: {
    nutrition: number;
    exercise: number;
    sleep: number;
    stress: number;
    genetics: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface CorrelationAnalysis {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
  interpretation: string;
  recommendation: string;
}

export class AdvancedAnalyticsService {
  private static trendData: TrendData[] = [];
  private static healthScores: HealthScore[] = [];
  private static geneticInsights: GeneticInsight[] = [];

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.generateMockData();
  }

  /**
   * Mock veri oluşturur
   */
  private static generateMockData(): void {
    const now = new Date();
    
    // Sağlık skorları oluştur
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      this.healthScores.push({
        overall: Math.floor(Math.random() * 20) + 70, // 70-90 arası
        categories: {
          nutrition: Math.floor(Math.random() * 20) + 70,
          exercise: Math.floor(Math.random() * 20) + 70,
          sleep: Math.floor(Math.random() * 20) + 70,
          stress: Math.floor(Math.random() * 20) + 70,
          genetics: Math.floor(Math.random() * 20) + 70,
        },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: date
      });
    }

    // Trend verileri oluştur
    const metrics = ['adım_sayısı', 'kalp_atış_hızı', 'uyku_süresi', 'stres_seviyesi', 'enerji_seviyesi'];
    for (const metric of metrics) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
        this.trendData.push({
          date,
          value: Math.floor(Math.random() * 100) + 50,
          category: metric,
          metadata: { source: 'device' }
        });
      }
    }

    // Genetik içgörüler oluştur
    this.geneticInsights = [
      {
        gene: 'MTHFR',
        insight: 'Folat metabolizması iyileşiyor',
        confidence: 85,
        trend: 'improving',
        recommendations: ['Folat takviyesi devam et', 'Yeşil yapraklı sebzeleri artır'],
        timeframe: 'Son 3 ay'
      },
      {
        gene: 'COMT',
        insight: 'Stres yönetimi becerileri gelişiyor',
        confidence: 78,
        trend: 'improving',
        recommendations: ['Meditasyon rutinini sürdür', 'Kafein tüketimini azalt'],
        timeframe: 'Son 2 ay'
      },
      {
        gene: 'APOE',
        insight: 'Bellek fonksiyonları stabil',
        confidence: 92,
        trend: 'stable',
        recommendations: ['Omega-3 takviyesi al', 'Zihinsel egzersizler yap'],
        timeframe: 'Son 6 ay'
      }
    ];
  }

  /**
   * Sağlık trendlerini getirir
   */
  static getHealthTrends(metric: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): HealthTrend {
    const filteredData = this.trendData.filter(d => d.category === metric);
    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
    const recentData = filteredData.slice(-days);
    
    const trend = this.calculateTrend(recentData);
    const changePercent = this.calculateChangePercent(recentData);
    const prediction = this.generatePrediction(recentData);

    return {
      metric,
      trend,
      changePercent,
      period,
      data: recentData,
      prediction
    };
  }

  /**
   * Trend hesaplar
   */
  private static calculateTrend(data: TrendData[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  /**
   * Değişim yüzdesini hesaplar
   */
  private static calculateChangePercent(data: TrendData[]): number {
    if (data.length < 2) return 0;
    
    const first = data[0].value;
    const last = data[data.length - 1].value;
    
    return Math.round(((last - first) / first) * 100);
  }

  /**
   * Tahmin oluşturur
   */
  private static generatePrediction(data: TrendData[]): { nextValue: number; confidence: number } {
    if (data.length < 3) {
      return { nextValue: data[data.length - 1]?.value || 0, confidence: 50 };
    }
    
    // Basit lineer regresyon
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextValue = slope * n + intercept;
    const confidence = Math.min(95, Math.max(60, 100 - Math.abs(slope) * 10));
    
    return { nextValue: Math.round(nextValue), confidence };
  }

  /**
   * Sağlık skorunu getirir
   */
  static getHealthScore(): HealthScore {
    const latest = this.healthScores[this.healthScores.length - 1];
    return latest || {
      overall: 75,
      categories: {
        nutrition: 75,
        exercise: 75,
        sleep: 75,
        stress: 75,
        genetics: 75,
      },
      trend: 'stable',
      lastUpdated: new Date()
    };
  }

  /**
   * Sağlık skoru trendini getirir
   */
  static getHealthScoreTrend(period: 'week' | 'month' | 'quarter' = 'month'): ChartData {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const recentScores = this.healthScores.slice(-days);
    
    return {
      labels: recentScores.map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (recentScores.length - 1 - i));
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: recentScores.map(s => s.overall),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 3
        }
      ]
    };
  }

  /**
   * Kategori bazlı sağlık skorları
   */
  static getCategoryScores(): ChartData {
    const latest = this.getHealthScore();
    
    return {
      labels: ['Beslenme', 'Egzersiz', 'Uyku', 'Stres', 'Genetik'],
      datasets: [
        {
          data: [
            latest.categories.nutrition,
            latest.categories.exercise,
            latest.categories.sleep,
            latest.categories.stress,
            latest.categories.genetics
          ],
          color: (opacity = 1) => `rgba(103, 126, 234, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }

  /**
   * Genetik içgörüleri getirir
   */
  static getGeneticInsights(): GeneticInsight[] {
    return this.geneticInsights;
  }

  /**
   * Korelasyon analizi yapar
   */
  static analyzeCorrelations(): CorrelationAnalysis[] {
    const correlations: CorrelationAnalysis[] = [];
    
    // Adım sayısı ve uyku kalitesi korelasyonu
    const stepsData = this.trendData.filter(d => d.category === 'adım_sayısı');
    const sleepData = this.trendData.filter(d => d.category === 'uyku_süresi');
    
    if (stepsData.length > 0 && sleepData.length > 0) {
      const correlation = this.calculateCorrelation(stepsData, sleepData);
      correlations.push({
        metric1: 'Adım Sayısı',
        metric2: 'Uyku Kalitesi',
        correlation,
        significance: Math.abs(correlation) > 0.7 ? 'high' : Math.abs(correlation) > 0.4 ? 'medium' : 'low',
        interpretation: correlation > 0 ? 'Pozitif korelasyon: Daha fazla adım, daha iyi uyku' : 'Negatif korelasyon: Daha fazla adım, daha az uyku',
        recommendation: correlation > 0 ? 'Günlük yürüyüş rutinini sürdür' : 'Egzersiz ve uyku dengesini gözden geçir'
      });
    }

    // Stres ve kalp atış hızı korelasyonu
    const stressData = this.trendData.filter(d => d.category === 'stres_seviyesi');
    const heartData = this.trendData.filter(d => d.category === 'kalp_atış_hızı');
    
    if (stressData.length > 0 && heartData.length > 0) {
      const correlation = this.calculateCorrelation(stressData, heartData);
      correlations.push({
        metric1: 'Stres Seviyesi',
        metric2: 'Kalp Atış Hızı',
        correlation,
        significance: Math.abs(correlation) > 0.7 ? 'high' : Math.abs(correlation) > 0.4 ? 'medium' : 'low',
        interpretation: correlation > 0 ? 'Pozitif korelasyon: Yüksek stres, yüksek kalp atış hızı' : 'Negatif korelasyon: Yüksek stres, düşük kalp atış hızı',
        recommendation: correlation > 0 ? 'Stres yönetimi teknikleri uygula' : 'Kalp sağlığını kontrol et'
      });
    }

    return correlations;
  }

  /**
   * Korelasyon hesaplar
   */
  private static calculateCorrelation(data1: TrendData[], data2: TrendData[]): number {
    if (data1.length !== data2.length || data1.length < 2) return 0;
    
    const n = data1.length;
    const sum1 = data1.reduce((sum, d) => sum + d.value, 0);
    const sum2 = data2.reduce((sum, d) => sum + d.value, 0);
    const sum1Sq = data1.reduce((sum, d) => sum + d.value * d.value, 0);
    const sum2Sq = data2.reduce((sum, d) => sum + d.value * d.value, 0);
    const sum12 = data1.reduce((sum, d, i) => sum + d.value * data2[i].value, 0);
    
    const numerator = n * sum12 - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Günlük özet oluşturur
   */
  static generateDailySummary(): {
    score: number;
    trends: string[];
    recommendations: string[];
    achievements: string[];
  } {
    const healthScore = this.getHealthScore();
    const trends = this.healthScores.slice(-7); // Son 7 gün
    const trendDirection = trends.length > 1 ? 
      (trends[trends.length - 1].overall > trends[0].overall ? 'up' : 'down') : 'stable';
    
    const summary = {
      score: healthScore.overall,
      trends: [],
      recommendations: [],
      achievements: []
    } as any;

    // Trend mesajları
    if (trendDirection === 'up') {
      summary.trends.push('Sağlık skorunuz son 7 günde %5 arttı! 📈');
    } else if (trendDirection === 'down') {
      summary.trends.push('Sağlık skorunuzda düşüş var, dikkat edin 📉');
    } else {
      summary.trends.push('Sağlık skorunuz stabil durumda 📊');
    }

    // Öneriler
    if (healthScore.categories.nutrition < 70) {
      summary.recommendations.push('Beslenme skorunuz düşük, daha sağlıklı beslenin');
    }
    if (healthScore.categories.exercise < 70) {
      summary.recommendations.push('Egzersiz skorunuz düşük, daha aktif olun');
    }
    if (healthScore.categories.sleep < 70) {
      summary.recommendations.push('Uyku skorunuz düşük, uyku düzeninizi iyileştirin');
    }

    // Başarılar
    if (healthScore.overall > 85) {
      summary.achievements.push('Mükemmel sağlık skoru! 🏆');
    }
    if (healthScore.categories.genetics > 90) {
      summary.achievements.push('Genetik potansiyelinizi maksimum kullanıyorsunuz! 🧬');
    }

    return summary;
  }

  /**
   * Haftalık rapor oluşturur
   */
  static generateWeeklyReport(): {
    period: string;
    overallScore: number;
    scoreChange: number;
    topInsights: string[];
    recommendations: string[];
    nextWeekGoals: string[];
  } {
    const currentWeek = this.healthScores.slice(-7);
    const previousWeek = this.healthScores.slice(-14, -7);
    
    const currentAvg = currentWeek.reduce((sum, s) => sum + s.overall, 0) / currentWeek.length;
    const previousAvg = previousWeek.length > 0 ? 
      previousWeek.reduce((sum, s) => sum + s.overall, 0) / previousWeek.length : currentAvg;
    
    const scoreChange = Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
    
    return {
      period: 'Bu Hafta',
      overallScore: Math.round(currentAvg),
      scoreChange,
      topInsights: [
        'Genetik profilinize göre beslenme planınız çok başarılı',
        'Egzersiz rutininiz genetik potansiyelinizi destekliyor',
        'Uyku kaliteniz genetik kronotipinize uygun'
      ],
      recommendations: [
        'Folat takviyesini sürdürün',
        'Haftada 3 kez ağırlık antrenmanı yapın',
        '22:00-06:00 arası uyku düzenini koruyun'
      ],
      nextWeekGoals: [
        'Günlük adım hedefini 10.000\'e çıkarın',
        'Stres yönetimi tekniklerini uygulayın',
        'Su tüketimini günde 2.5L\'ye çıkarın'
      ]
    };
  }

  /**
   * Aylık trend analizi
   */
  static getMonthlyTrends(): {
    month: string;
    trends: { metric: string; change: number; direction: 'up' | 'down' | 'stable' }[];
    insights: string[];
  } {
    const last30Days = this.trendData.slice(-30);
    const metrics = ['adım_sayısı', 'kalp_atış_hızı', 'uyku_süresi', 'stres_seviyesi', 'enerji_seviyesi'];
    
    const trends = metrics.map(metric => {
      const data = last30Days.filter(d => d.category === metric);
      const firstHalf = data.slice(0, 15);
      const secondHalf = data.slice(15);
      
      const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
      
      const change = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
      const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
      
      return {
        metric: metric.replace('_', ' ').toUpperCase(),
        change: Math.abs(change),
        direction
      };
    });

    return {
      month: 'Bu Ay',
      trends,
      insights: [
        'Genetik profilinize uygun yaşam tarzı değişiklikleri başarılı',
        'Sağlık verileriniz genetik öngörülerle uyumlu',
        'Kişiselleştirilmiş öneriler etkili oluyor'
      ]
    };
  }
}


