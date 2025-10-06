// PDF Export Servisi - Genetik raporları PDF olarak dışa aktarma
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AnalysisResult } from '../types/DNA';

export interface PDFReportData {
  userInfo: {
    name: string;
    email: string;
    dateOfBirth: string;
    gender: string;
  };
  analysisResult: AnalysisResult;
  generatedDate: Date;
  reportId: string;
}

export interface PDFExportOptions {
  includeGeneticVariants: boolean;
  includeRiskFactors: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  language: 'tr' | 'en';
  format: 'detailed' | 'summary';
}

export class PDFExportService {
  private static defaultOptions: PDFExportOptions = {
    includeGeneticVariants: true,
    includeRiskFactors: true,
    includeRecommendations: true,
    includeCharts: true,
    language: 'tr',
    format: 'detailed'
  };

  /**
   * Genetik raporu PDF olarak dışa aktarır
   */
  static async exportGeneticReport(
    reportData: PDFReportData,
    options: Partial<PDFExportOptions> = {}
  ): Promise<string> {
    try {
      const exportOptions = { ...this.defaultOptions, ...options };
      const htmlContent = this.generateHTMLReport(reportData, exportOptions);
      
      // PDF oluştur
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Dosya adını oluştur
      const fileName = `GenoHealth_Rapor_${reportData.reportId}_${this.formatDate(reportData.generatedDate)}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Dosyayı kopyala
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      return newUri;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('PDF oluşturulamadı');
    }
  }

  /**
   * PDF'i paylaşır
   */
  static async sharePDF(pdfUri: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Genetik Rapor Paylaş',
        });
      } else {
        throw new Error('Paylaşım özelliği mevcut değil');
      }
    } catch (error) {
      console.error('PDF sharing error:', error);
      throw new Error('PDF paylaşılamadı');
    }
  }

  /**
   * HTML rapor içeriği oluşturur
   */
  private static generateHTMLReport(
    reportData: PDFReportData,
    options: PDFExportOptions
  ): string {
    const { userInfo, analysisResult, generatedDate } = reportData;
    
    return `
      <!DOCTYPE html>
      <html lang="${options.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GenoHealth Genetik Rapor</title>
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="container">
          ${this.generateHeader(userInfo, generatedDate)}
          ${this.generateSummary(analysisResult)}
          ${options.includeGeneticVariants ? this.generateGeneticVariants(analysisResult) : ''}
          ${options.includeRiskFactors ? this.generateRiskFactors(analysisResult) : ''}
          ${options.includeRecommendations ? this.generateRecommendations(analysisResult) : ''}
          ${this.generateFooter()}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * CSS stilleri
   */
  private static getCSSStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        font-weight: 300;
      }
      
      .header .subtitle {
        font-size: 1.2em;
        opacity: 0.9;
      }
      
      .header .date {
        margin-top: 20px;
        font-size: 0.9em;
        opacity: 0.8;
      }
      
      .section {
        padding: 30px 40px;
        border-bottom: 1px solid #eee;
      }
      
      .section:last-child {
        border-bottom: none;
      }
      
      .section h2 {
        color: #667eea;
        font-size: 1.8em;
        margin-bottom: 20px;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }
      
      .section h3 {
        color: #333;
        font-size: 1.3em;
        margin: 20px 0 10px 0;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .stat-card {
        background: #f8f9ff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        border-left: 4px solid #667eea;
      }
      
      .stat-value {
        font-size: 2em;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
      }
      
      .stat-label {
        color: #666;
        font-size: 0.9em;
      }
      
      .variant-list {
        margin: 20px 0;
      }
      
      .variant-item {
        background: #f8f9ff;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #4CAF50;
      }
      
      .variant-name {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      
      .variant-details {
        color: #666;
        font-size: 0.9em;
      }
      
      .risk-item {
        background: #fff3cd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
      }
      
      .risk-high {
        background: #f8d7da;
        border-left-color: #dc3545;
      }
      
      .risk-medium {
        background: #fff3cd;
        border-left-color: #ffc107;
      }
      
      .risk-low {
        background: #d4edda;
        border-left-color: #28a745;
      }
      
      .recommendation-item {
        background: #e7f3ff;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #2196F3;
      }
      
      .recommendation-title {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      
      .recommendation-desc {
        color: #666;
        font-size: 0.9em;
      }
      
      .footer {
        background: #f8f9fa;
        padding: 20px 40px;
        text-align: center;
        color: #666;
        font-size: 0.9em;
      }
      
      .disclaimer {
        background: #fff3cd;
        padding: 15px;
        margin: 20px 0;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
        font-size: 0.9em;
      }
      
      .confidence-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        margin-left: 10px;
      }
      
      .confidence-high {
        background: #d4edda;
        color: #155724;
      }
      
      .confidence-medium {
        background: #fff3cd;
        color: #856404;
      }
      
      .confidence-low {
        background: #f8d7da;
        color: #721c24;
      }
    `;
  }

  /**
   * Rapor başlığı oluşturur
   */
  private static generateHeader(userInfo: any, generatedDate: Date): string {
    return `
      <div class="header">
        <h1>🧬 GenoHealth</h1>
        <p class="subtitle">Kişiselleştirilmiş Genetik Sağlık Raporu</p>
        <div class="date">
          <strong>Rapor Tarihi:</strong> ${this.formatDate(generatedDate)}<br>
          <strong>Hasta:</strong> ${userInfo.name}<br>
          <strong>E-posta:</strong> ${userInfo.email}
        </div>
      </div>
    `;
  }

  /**
   * Özet bölümü oluşturur
   */
  private static generateSummary(analysisResult: AnalysisResult): string {
    return `
      <div class="section">
        <h2>📊 Analiz Özeti</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${analysisResult.confidence}%</div>
            <div class="stat-label">Güvenilirlik</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analysisResult.geneticVariants.length}</div>
            <div class="stat-label">Analiz Edilen Varyant</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analysisResult.riskFactors.length}</div>
            <div class="stat-label">Risk Faktörü</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analysisResult.recommendations.length}</div>
            <div class="stat-label">Öneri</div>
          </div>
        </div>
        
        <div class="disclaimer">
          <strong>⚠️ Önemli Uyarı:</strong> Bu rapor sadece bilgilendirme amaçlıdır ve profesyonel tıbbi tavsiye yerine geçmez. 
          Sağlık kararlarınızı almadan önce mutlaka doktorunuza danışın.
        </div>
      </div>
    `;
  }

  /**
   * Genetik varyantlar bölümü oluşturur
   */
  private static generateGeneticVariants(analysisResult: AnalysisResult): string {
    return `
      <div class="section">
        <h2>🧬 Genetik Varyantlar</h2>
        <div class="variant-list">
          ${analysisResult.geneticVariants.map(variant => `
            <div class="variant-item">
              <div class="variant-name">${variant.gene} - ${variant.variant}</div>
              <div class="variant-details">
                <strong>Genotip:</strong> ${variant.genotype}<br>
                <strong>Fenotip:</strong> ${variant.phenotype}<br>
                <strong>Klinik Önem:</strong> ${variant.clinicalSignificance}
                <span class="confidence-badge confidence-${variant.confidence > 80 ? 'high' : variant.confidence > 60 ? 'medium' : 'low'}">
                  %${variant.confidence} güven
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Risk faktörleri bölümü oluşturur
   */
  private static generateRiskFactors(analysisResult: AnalysisResult): string {
    return `
      <div class="section">
        <h2>⚠️ Risk Faktörleri</h2>
        <div class="risk-list">
          ${analysisResult.riskFactors.map(risk => `
            <div class="risk-item risk-${risk.level}">
              <div class="variant-name">${risk.condition}</div>
              <div class="variant-details">
                <strong>Risk Seviyesi:</strong> ${risk.level.toUpperCase()}<br>
                <strong>Genetik Temel:</strong> ${risk.geneticBasis}<br>
                <strong>Açıklama:</strong> ${risk.description}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Öneriler bölümü oluşturur
   */
  private static generateRecommendations(analysisResult: AnalysisResult): string {
    return `
      <div class="section">
        <h2>💡 Kişiselleştirilmiş Öneriler</h2>
        <div class="recommendation-list">
          ${analysisResult.recommendations.map(rec => `
            <div class="recommendation-item">
              <div class="recommendation-title">${rec.category} - ${rec.title}</div>
              <div class="recommendation-desc">
                <strong>Öneri:</strong> ${rec.description}<br>
                <strong>Bilimsel Temel:</strong> ${rec.scientificBasis}<br>
                <strong>Uygulama:</strong> ${rec.implementation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Footer oluşturur
   */
  private static generateFooter(): string {
    return `
      <div class="footer">
        <p><strong>GenoHealth</strong> - Kişiselleştirilmiş Genetik Sağlık Analizi</p>
        <p>Bu rapor GenoHealth platformu tarafından oluşturulmuştur.</p>
        <p>Daha fazla bilgi için: www.genohealth.com</p>
      </div>
    `;
  }

  /**
   * Tarihi formatlar
   */
  private static formatDate(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Basit özet rapor oluşturur
   */
  static async exportSummaryReport(
    reportData: PDFReportData
  ): Promise<string> {
    return this.exportGeneticReport(reportData, {
      includeGeneticVariants: false,
      includeRiskFactors: true,
      includeRecommendations: true,
      includeCharts: false,
      format: 'summary'
    });
  }

  /**
   * Detaylı rapor oluşturur
   */
  static async exportDetailedReport(
    reportData: PDFReportData
  ): Promise<string> {
    return this.exportGeneticReport(reportData, {
      includeGeneticVariants: true,
      includeRiskFactors: true,
      includeRecommendations: true,
      includeCharts: true,
      format: 'detailed'
    });
  }

  /**
   * Rapor şablonunu önizler
   */
  static async previewReport(
    reportData: PDFReportData,
    options: Partial<PDFExportOptions> = {}
  ): Promise<string> {
    const exportOptions = { ...this.defaultOptions, ...options };
    return this.generateHTMLReport(reportData, exportOptions);
  }

  /**
   * Mevcut PDF dosyalarını listeler
   */
  static async listExportedReports(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      return files.filter(file => file.endsWith('.pdf'));
    } catch (error) {
      console.error('PDF list error:', error);
      return [];
    }
  }

  /**
   * PDF dosyasını siler
   */
  static async deleteReport(fileName: string): Promise<void> {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.deleteAsync(fileUri);
    } catch (error) {
      console.error('PDF delete error:', error);
      throw new Error('PDF silinemedi');
    }
  }
}


