/**
 * Rapor Export Servisi
 * DNA analiz sonuçlarını PDF/Excel formatında export eder
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform } from 'react-native';

// Rapor türleri
export type ReportType = 
  | 'dna_analysis'
  | 'family_comparison'
  | 'health_summary'
  | 'nutrition_plan'
  | 'exercise_plan'
  | 'supplement_plan'
  | 'comprehensive_health';

// Export formatları
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// Rapor konfigürasyonu
export interface ReportConfig {
  type: ReportType;
  format: ExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  includeRecommendations: boolean;
  includeFamilyData: boolean;
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
  watermark: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

// Rapor verisi
export interface ReportData {
  id: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  generatedBy: string;
  data: any;
  metadata: {
    version: string;
    totalPages: number;
    fileSize: number;
    checksum: string;
  };
}

// PDF oluşturma seçenekleri
export interface PDFOptions {
  html: string;
  base64?: boolean;
  width?: number;
  height?: number;
  padding?: number;
  margin?: number;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

// Excel oluşturma seçenekleri
export interface ExcelOptions {
  data: any[];
  sheetName: string;
  headers: string[];
  styles?: any;
}

export class ReportExportService {
  private static instance: ReportExportService;
  private isInitialized = false;

  static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService();
    }
    return ReportExportService.instance;
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Dosya sistemi izinlerini kontrol et
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        console.warn('File system permissions not granted');
      }

      this.isInitialized = true;
      console.log('Report Export Service initialized!');
      return true;
    } catch (error) {
      console.error('Report export service initialization error:', error);
      return false;
    }
  }

  /**
   * DNA analiz raporu oluşturur
   */
  async generateDNAAnalysisReport(
    analysisData: any,
    config: Partial<ReportConfig> = {}
  ): Promise<ReportData> {
    try {
      const defaultConfig: ReportConfig = {
        type: 'dna_analysis',
        format: 'pdf',
        includeCharts: true,
        includeRawData: false,
        includeRecommendations: true,
        includeFamilyData: false,
        language: 'tr',
        theme: 'light',
        watermark: true,
        ...config,
      };

      const reportData: ReportData = {
        id: `dna_report_${Date.now()}`,
        title: defaultConfig.customTitle || 'DNA Analiz Raporu',
        subtitle: defaultConfig.customSubtitle || 'Genetik Analiz Sonuçları',
        generatedAt: new Date().toISOString(),
        generatedBy: 'GenoHealth',
        data: analysisData,
        metadata: {
          version: '1.0.0',
          totalPages: 0,
          fileSize: 0,
          checksum: '',
        },
      };

      // HTML içeriği oluştur
      const htmlContent = await this.generateDNAAnalysisHTML(reportData, defaultConfig);
      
      // PDF oluştur
      if (defaultConfig.format === 'pdf') {
        const pdfUri = await this.generatePDF(htmlContent, defaultConfig);
        reportData.metadata.fileSize = await this.getFileSize(pdfUri);
      }

      // Raporu kaydet
      await this.saveReport(reportData);

      return reportData;
    } catch (error) {
      console.error('Generate DNA analysis report error:', error);
      throw error;
    }
  }

  /**
   * Aile karşılaştırma raporu oluşturur
   */
  async generateFamilyComparisonReport(
    comparisonData: any,
    familyData: any,
    config: Partial<ReportConfig> = {}
  ): Promise<ReportData> {
    try {
      const defaultConfig: ReportConfig = {
        type: 'family_comparison',
        format: 'pdf',
        includeCharts: true,
        includeRawData: false,
        includeRecommendations: true,
        includeFamilyData: true,
        language: 'tr',
        theme: 'light',
        watermark: true,
        ...config,
      };

      const reportData: ReportData = {
        id: `family_report_${Date.now()}`,
        title: defaultConfig.customTitle || 'Aile Genetik Karşılaştırma Raporu',
        subtitle: defaultConfig.customSubtitle || 'Aile Üyeleri Arasında Genetik Analiz',
        generatedAt: new Date().toISOString(),
        generatedBy: 'GenoHealth',
        data: { comparison: comparisonData, family: familyData },
        metadata: {
          version: '1.0.0',
          totalPages: 0,
          fileSize: 0,
          checksum: '',
        },
      };

      // HTML içeriği oluştur
      const htmlContent = await this.generateFamilyComparisonHTML(reportData, defaultConfig);
      
      // PDF oluştur
      if (defaultConfig.format === 'pdf') {
        const pdfUri = await this.generatePDF(htmlContent, defaultConfig);
        reportData.metadata.fileSize = await this.getFileSize(pdfUri);
      }

      // Raporu kaydet
      await this.saveReport(reportData);

      return reportData;
    } catch (error) {
      console.error('Generate family comparison report error:', error);
      throw error;
    }
  }

  /**
   * Kapsamlı sağlık raporu oluşturur
   */
  async generateComprehensiveHealthReport(
    userData: any,
    analysisData: any,
    familyData: any,
    config: Partial<ReportConfig> = {}
  ): Promise<ReportData> {
    try {
      const defaultConfig: ReportConfig = {
        type: 'comprehensive_health',
        format: 'pdf',
        includeCharts: true,
        includeRawData: true,
        includeRecommendations: true,
        includeFamilyData: true,
        language: 'tr',
        theme: 'light',
        watermark: true,
        ...config,
      };

      const reportData: ReportData = {
        id: `comprehensive_report_${Date.now()}`,
        title: defaultConfig.customTitle || 'Kapsamlı Sağlık Raporu',
        subtitle: defaultConfig.customSubtitle || 'Genetik Tabanlı Sağlık Analizi ve Öneriler',
        generatedAt: new Date().toISOString(),
        generatedBy: 'GenoHealth',
        data: { user: userData, analysis: analysisData, family: familyData },
        metadata: {
          version: '1.0.0',
          totalPages: 0,
          fileSize: 0,
          checksum: '',
        },
      };

      // HTML içeriği oluştur
      const htmlContent = await this.generateComprehensiveHealthHTML(reportData, defaultConfig);
      
      // PDF oluştur
      if (defaultConfig.format === 'pdf') {
        const pdfUri = await this.generatePDF(htmlContent, defaultConfig);
        reportData.metadata.fileSize = await this.getFileSize(pdfUri);
      }

      // Raporu kaydet
      await this.saveReport(reportData);

      return reportData;
    } catch (error) {
      console.error('Generate comprehensive health report error:', error);
      throw error;
    }
  }

  /**
   * DNA analiz raporu HTML'i oluşturur
   */
  private async generateDNAAnalysisHTML(reportData: ReportData, config: ReportConfig): Promise<string> {
    const { data } = reportData;
    
    return `
      <!DOCTYPE html>
      <html lang="${config.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
          ${this.getReportStyles(config.theme)}
        </style>
      </head>
      <body>
        <div class="report-container">
          ${this.generateReportHeader(reportData, config)}
          
          <div class="report-content">
            <section class="executive-summary">
              <h2>Genel Bakış</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <h3>Sağlık Skoru</h3>
                  <div class="score-value">${data.overallHealthScore || 0}/100</div>
                </div>
                <div class="summary-item">
                  <h3>Güvenilirlik</h3>
                  <div class="score-value">%${Math.round((data.confidence || 0) * 100)}</div>
                </div>
                <div class="summary-item">
                  <h3>Toplam Varyant</h3>
                  <div class="score-value">${data.totalVariants || 0}</div>
                </div>
                <div class="summary-item">
                  <h3>Önemli Varyant</h3>
                  <div class="score-value">${data.significantVariants || 0}</div>
                </div>
              </div>
            </section>

            <section class="genetic-variants">
              <h2>Genetik Varyantlar</h2>
              <div class="variants-table">
                <table>
                  <thead>
                    <tr>
                      <th>Gen</th>
                      <th>RS ID</th>
                      <th>Genotip</th>
                      <th>Önem</th>
                      <th>Sağlık Etkisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.generateVariantsTableRows(data.geneticVariants || [])}
                  </tbody>
                </table>
              </div>
            </section>

            <section class="health-recommendations">
              <h2>Sağlık Önerileri</h2>
              <div class="recommendations-grid">
                ${this.generateRecommendationsHTML(data.nutritionRecommendations || [], 'Beslenme')}
                ${this.generateRecommendationsHTML(data.exerciseRecommendations || [], 'Egzersiz')}
                ${this.generateRecommendationsHTML(data.sleepRecommendations || [], 'Uyku')}
              </div>
            </section>

            ${config.includeRawData ? this.generateRawDataSection(data) : ''}
          </div>

          ${this.generateReportFooter(reportData, config)}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Aile karşılaştırma raporu HTML'i oluşturur
   */
  private async generateFamilyComparisonHTML(reportData: ReportData, config: ReportConfig): Promise<string> {
    const { data } = reportData;
    const { comparison, family } = data;
    
    return `
      <!DOCTYPE html>
      <html lang="${config.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
          ${this.getReportStyles(config.theme)}
        </style>
      </head>
      <body>
        <div class="report-container">
          ${this.generateReportHeader(reportData, config)}
          
          <div class="report-content">
            <section class="family-overview">
              <h2>Aile Genel Bakış</h2>
              <div class="family-stats">
                <div class="stat-item">
                  <h3>Aile Üyesi Sayısı</h3>
                  <div class="stat-value">${family?.members?.length || 0}</div>
                </div>
                <div class="stat-item">
                  <h3>Paylaşılan Varyant</h3>
                  <div class="stat-value">${comparison?.sharedVariants?.length || 0}</div>
                </div>
                <div class="stat-item">
                  <h3>Benzersiz Varyant</h3>
                  <div class="stat-value">${comparison?.uniqueVariants?.length || 0}</div>
                </div>
                <div class="stat-item">
                  <h3>Ortak Özellik</h3>
                  <div class="stat-value">${comparison?.commonTraits?.length || 0}</div>
                </div>
              </div>
            </section>

            <section class="shared-variants">
              <h2>Paylaşılan Genetik Varyantlar</h2>
              <div class="variants-table">
                <table>
                  <thead>
                    <tr>
                      <th>Gen</th>
                      <th>RS ID</th>
                      <th>Genotip</th>
                      <th>Aile Frekansı</th>
                      <th>Popülasyon Frekansı</th>
                      <th>Sağlık Etkisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.generateSharedVariantsTableRows(comparison?.sharedVariants || [])}
                  </tbody>
                </table>
              </div>
            </section>

            <section class="common-traits">
              <h2>Ortak Aile Özellikleri</h2>
              <div class="traits-grid">
                ${this.generateCommonTraitsHTML(comparison?.commonTraits || [])}
              </div>
            </section>

            <section class="health-insights">
              <h2>Sağlık İçgörüleri</h2>
              <div class="insights-grid">
                ${this.generateHealthInsightsHTML(comparison?.healthInsights || [])}
              </div>
            </section>

            ${config.includeRecommendations ? this.generateFamilyRecommendationsHTML(comparison?.recommendations || []) : ''}
          </div>

          ${this.generateReportFooter(reportData, config)}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Kapsamlı sağlık raporu HTML'i oluşturur
   */
  private async generateComprehensiveHealthHTML(reportData: ReportData, config: ReportConfig): Promise<string> {
    const { data } = reportData;
    const { user, analysis, family } = data;
    
    return `
      <!DOCTYPE html>
      <html lang="${config.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
          ${this.getReportStyles(config.theme)}
        </style>
      </head>
      <body>
        <div class="report-container">
          ${this.generateReportHeader(reportData, config)}
          
          <div class="report-content">
            <section class="executive-summary">
              <h2>Genel Bakış</h2>
              <div class="summary-content">
                <p>Bu rapor, ${user?.name || 'Kullanıcı'} için genetik analiz sonuçlarına dayalı kapsamlı sağlık değerlendirmesini içermektedir.</p>
                <div class="key-metrics">
                  <div class="metric">
                    <h3>Genel Sağlık Skoru</h3>
                    <div class="metric-value">${analysis?.overallHealthScore || 0}/100</div>
                  </div>
                  <div class="metric">
                    <h3>Analiz Güvenilirliği</h3>
                    <div class="metric-value">%${Math.round((analysis?.confidence || 0) * 100)}</div>
                  </div>
                  <div class="metric">
                    <h3>Analiz Edilen Varyant</h3>
                    <div class="metric-value">${analysis?.totalVariants || 0}</div>
                  </div>
                </div>
              </div>
            </section>

            <section class="genetic-profile">
              <h2>Genetik Profil</h2>
              <div class="profile-content">
                ${this.generateGeneticProfileHTML(analysis)}
              </div>
            </section>

            <section class="health-recommendations">
              <h2>Kişiselleştirilmiş Sağlık Önerileri</h2>
              <div class="recommendations-content">
                ${this.generateComprehensiveRecommendationsHTML(analysis)}
              </div>
            </section>

            ${family ? this.generateFamilySectionHTML(family) : ''}
            
            ${config.includeRawData ? this.generateRawDataSection(analysis) : ''}
          </div>

          ${this.generateReportFooter(reportData, config)}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * PDF oluşturur
   */
  private async generatePDF(htmlContent: string, config: ReportConfig): Promise<string> {
    try {
      const pdfOptions: PDFOptions = {
        html: htmlContent,
        base64: false,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
        padding: 20,
        margin: 20,
        orientation: 'portrait',
        quality: 0.8,
      };

      const { uri } = await Print.printToFileAsync(pdfOptions);
      return uri;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Excel dosyası oluşturur
   */
  private async generateExcel(data: any[], options: ExcelOptions): Promise<string> {
    try {
      // Excel oluşturma mantığı burada implement edilecek
      // Şimdilik CSV formatında export edelim
      const csvContent = this.convertToCSV(data, options.headers);
      const fileName = `${options.sheetName}_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return fileUri;
    } catch (error) {
      console.error('Excel generation error:', error);
      throw error;
    }
  }

  /**
   * CSV formatına dönüştürür
   */
  private convertToCSV(data: any[], headers: string[]): string {
    const csvRows = [];
    
    // Header satırı
    csvRows.push(headers.join(','));
    
    // Veri satırları
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Rapor stillerini döndürür
   */
  private getReportStyles(theme: 'light' | 'dark'): string {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#333333';
    const secondaryColor = isDark ? '#666666' : '#666666';
    const primaryColor = '#4CAF50';
    const borderColor = isDark ? '#333333' : '#e0e0e0';

    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: ${bgColor};
        color: ${textColor};
        line-height: 1.6;
      }
      
      .report-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: ${bgColor};
      }
      
      .report-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid ${primaryColor};
      }
      
      .report-title {
        font-size: 28px;
        font-weight: bold;
        color: ${primaryColor};
        margin-bottom: 10px;
      }
      
      .report-subtitle {
        font-size: 16px;
        color: ${secondaryColor};
        margin-bottom: 20px;
      }
      
      .report-meta {
        font-size: 12px;
        color: ${secondaryColor};
      }
      
      .report-content {
        margin-bottom: 40px;
      }
      
      section {
        margin-bottom: 30px;
      }
      
      h2 {
        font-size: 20px;
        font-weight: bold;
        color: ${primaryColor};
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 1px solid ${borderColor};
      }
      
      h3 {
        font-size: 16px;
        font-weight: semibold;
        color: ${textColor};
        margin-bottom: 10px;
      }
      
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .summary-item {
        text-align: center;
        padding: 20px;
        background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        border-radius: 8px;
        border: 1px solid ${borderColor};
      }
      
      .score-value {
        font-size: 24px;
        font-weight: bold;
        color: ${primaryColor};
        margin-top: 10px;
      }
      
      .variants-table {
        overflow-x: auto;
        margin-bottom: 20px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        background-color: ${isDark ? '#2a2a2a' : '#ffffff'};
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid ${borderColor};
      }
      
      th {
        background-color: ${primaryColor};
        color: white;
        font-weight: bold;
      }
      
      tr:hover {
        background-color: ${isDark ? '#333333' : '#f5f5f5'};
      }
      
      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .recommendation-card {
        padding: 20px;
        background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        border-radius: 8px;
        border-left: 4px solid ${primaryColor};
      }
      
      .recommendation-title {
        font-size: 16px;
        font-weight: bold;
        color: ${primaryColor};
        margin-bottom: 10px;
      }
      
      .recommendation-list {
        list-style: none;
      }
      
      .recommendation-list li {
        padding: 5px 0;
        border-bottom: 1px solid ${borderColor};
      }
      
      .recommendation-list li:last-child {
        border-bottom: none;
      }
      
      .report-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid ${borderColor};
        text-align: center;
        font-size: 12px;
        color: ${secondaryColor};
      }
      
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 48px;
        color: rgba(76, 175, 80, 0.1);
        pointer-events: none;
        z-index: -1;
      }
      
      @media print {
        .report-container {
          max-width: none;
          margin: 0;
          padding: 0;
        }
        
        .report-header {
          page-break-after: avoid;
        }
        
        section {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Rapor başlığını oluşturur
   */
  private generateReportHeader(reportData: ReportData, config: ReportConfig): string {
    return `
      <div class="report-header">
        <h1 class="report-title">${reportData.title}</h1>
        <p class="report-subtitle">${reportData.subtitle}</p>
        <div class="report-meta">
          <p>Oluşturulma Tarihi: ${new Date(reportData.generatedAt).toLocaleDateString('tr-TR')}</p>
          <p>Oluşturan: ${reportData.generatedBy}</p>
          <p>Rapor ID: ${reportData.id}</p>
        </div>
        ${config.watermark ? '<div class="watermark">GenoHealth</div>' : ''}
      </div>
    `;
  }

  /**
   * Rapor alt bilgisini oluşturur
   */
  private generateReportFooter(reportData: ReportData, config: ReportConfig): string {
    return `
      <div class="report-footer">
        <p>Bu rapor GenoHealth tarafından oluşturulmuştur.</p>
        <p>Rapor ID: ${reportData.id} | Versiyon: ${reportData.metadata.version}</p>
        <p>Dosya Boyutu: ${(reportData.metadata.fileSize / 1024).toFixed(2)} KB</p>
        <p>© 2024 GenoHealth. Tüm hakları saklıdır.</p>
      </div>
    `;
  }

  /**
   * Varyantlar tablosu satırlarını oluşturur
   */
  private generateVariantsTableRows(variants: any[]): string {
    return variants.map(variant => `
      <tr>
        <td>${variant.gene || '-'}</td>
        <td>${variant.rsId || '-'}</td>
        <td>${variant.genotype || '-'}</td>
        <td>${variant.significance || '-'}</td>
        <td>${variant.healthImpact || '-'}</td>
      </tr>
    `).join('');
  }

  /**
   * Paylaşılan varyantlar tablosu satırlarını oluşturur
   */
  private generateSharedVariantsTableRows(variants: any[]): string {
    return variants.map(variant => `
      <tr>
        <td>${variant.gene || '-'}</td>
        <td>${variant.rsid || '-'}</td>
        <td>${variant.genotype || '-'}</td>
        <td>%${Math.round((variant.familyFrequency || 0) * 100)}</td>
        <td>%${Math.round((variant.populationFrequency || 0) * 100)}</td>
        <td>${variant.healthImpact || '-'}</td>
      </tr>
    `).join('');
  }

  /**
   * Öneriler HTML'ini oluşturur
   */
  private generateRecommendationsHTML(recommendations: string[], title: string): string {
    if (!recommendations || recommendations.length === 0) return '';
    
    return `
      <div class="recommendation-card">
        <h3 class="recommendation-title">${title}</h3>
        <ul class="recommendation-list">
          ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Ortak özellikler HTML'ini oluşturur
   */
  private generateCommonTraitsHTML(traits: any[]): string {
    return traits.map(trait => `
      <div class="recommendation-card">
        <h3 class="recommendation-title">${trait.trait}</h3>
        <p><strong>Yaygınlık:</strong> %${trait.prevalence}</p>
        <p><strong>Açıklama:</strong> ${trait.description}</p>
        <p><strong>Genetik Temel:</strong> ${trait.geneticBasis}</p>
        <ul class="recommendation-list">
          ${trait.healthImplications?.map((imp: string) => `<li>${imp}</li>`).join('') || ''}
        </ul>
      </div>
    `).join('');
  }

  /**
   * Sağlık içgörüleri HTML'ini oluşturur
   */
  private generateHealthInsightsHTML(insights: any[]): string {
    return insights.map(insight => `
      <div class="recommendation-card">
        <h3 class="recommendation-title">${insight.category}</h3>
        <p><strong>İçgörü:</strong> ${insight.insight}</p>
        <p><strong>Kanıt:</strong> ${insight.evidence}</p>
        <p><strong>Şiddet:</strong> ${insight.severity}</p>
        <ul class="recommendation-list">
          ${insight.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
        </ul>
      </div>
    `).join('');
  }

  /**
   * Aile önerileri HTML'ini oluşturur
   */
  private generateFamilyRecommendationsHTML(recommendations: any[]): string {
    return `
      <section class="family-recommendations">
        <h2>Aile Önerileri</h2>
        <div class="recommendations-grid">
          ${recommendations.map(rec => `
            <div class="recommendation-card">
              <h3 class="recommendation-title">${rec.title}</h3>
              <p><strong>Tip:</strong> ${rec.type}</p>
              <p><strong>Öncelik:</strong> ${rec.priority}</p>
              <p><strong>Açıklama:</strong> ${rec.description}</p>
              <p><strong>Zaman Çizelgesi:</strong> ${rec.timeline}</p>
              <ul class="recommendation-list">
                ${rec.resources?.map((res: string) => `<li>${res}</li>`).join('') || ''}
              </ul>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Genetik profil HTML'ini oluşturur
   */
  private generateGeneticProfileHTML(analysis: any): string {
    return `
      <div class="profile-content">
        <p>Genetik analiz sonuçlarına göre kişiselleştirilmiş sağlık profiliniz aşağıda detaylandırılmıştır.</p>
        <div class="summary-grid">
          <div class="summary-item">
            <h3>Genel Sağlık Skoru</h3>
            <div class="score-value">${analysis?.overallHealthScore || 0}/100</div>
          </div>
          <div class="summary-item">
            <h3>Analiz Güvenilirliği</h3>
            <div class="score-value">%${Math.round((analysis?.confidence || 0) * 100)}</div>
          </div>
          <div class="summary-item">
            <h3>Toplam Varyant</h3>
            <div class="score-value">${analysis?.totalVariants || 0}</div>
          </div>
          <div class="summary-item">
            <h3>Önemli Varyant</h3>
            <div class="score-value">${analysis?.significantVariants || 0}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Kapsamlı öneriler HTML'ini oluşturur
   */
  private generateComprehensiveRecommendationsHTML(analysis: any): string {
    return `
      <div class="recommendations-content">
        ${this.generateRecommendationsHTML(analysis?.nutritionRecommendations || [], 'Beslenme Önerileri')}
        ${this.generateRecommendationsHTML(analysis?.exerciseRecommendations || [], 'Egzersiz Önerileri')}
        ${this.generateRecommendationsHTML(analysis?.sleepRecommendations || [], 'Uyku Önerileri')}
        ${this.generateRecommendationsHTML(analysis?.stressManagementRecommendations || [], 'Stres Yönetimi')}
      </div>
    `;
  }

  /**
   * Aile bölümü HTML'ini oluşturur
   */
  private generateFamilySectionHTML(family: any): string {
    return `
      <section class="family-section">
        <h2>Aile Bilgileri</h2>
        <div class="family-info">
          <p><strong>Aile Adı:</strong> ${family.name || 'Bilinmiyor'}</p>
          <p><strong>Toplam Üye:</strong> ${family.members?.length || 0}</p>
          <p><strong>Aktif Üye:</strong> ${family.members?.filter((m: any) => m.isActive).length || 0}</p>
          <p><strong>DNA Verisi Olan:</strong> ${family.members?.filter((m: any) => m.hasDNAData).length || 0}</p>
        </div>
      </section>
    `;
  }

  /**
   * Ham veri bölümü HTML'ini oluşturur
   */
  private generateRawDataSection(data: any): string {
    return `
      <section class="raw-data">
        <h2>Ham Veri</h2>
        <div class="raw-data-content">
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      </section>
    `;
  }

  /**
   * Dosya boyutunu alır
   */
  private async getFileSize(uri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.size || 0;
    } catch (error) {
      console.error('Get file size error:', error);
      return 0;
    }
  }

  /**
   * Raporu kaydeder
   */
  private async saveReport(reportData: ReportData): Promise<void> {
    try {
      const reports = await this.getSavedReports();
      reports.push(reportData);
      await AsyncStorage.setItem('exportedReports', JSON.stringify(reports));
    } catch (error) {
      console.error('Save report error:', error);
    }
  }

  /**
   * Kaydedilmiş raporları getirir
   */
  async getSavedReports(): Promise<ReportData[]> {
    try {
      const reports = await AsyncStorage.getItem('exportedReports');
      return reports ? JSON.parse(reports) : [];
    } catch (error) {
      console.error('Get saved reports error:', error);
      return [];
    }
  }

  /**
   * Raporu paylaşır
   */
  async shareReport(reportData: ReportData): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(reportData.data.fileUri || '');
      } else {
        // Android için farklı implementasyon
        await Sharing.shareAsync(reportData.data.fileUri || '');
      }
    } catch (error) {
      console.error('Share report error:', error);
      throw error;
    }
  }

  /**
   * Raporu siler
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      const reports = await this.getSavedReports();
      const filteredReports = reports.filter(r => r.id !== reportId);
      await AsyncStorage.setItem('exportedReports', JSON.stringify(filteredReports));
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  }
}
