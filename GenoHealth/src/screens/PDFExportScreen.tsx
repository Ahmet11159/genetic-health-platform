import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  Switch,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ReportExportService, ReportConfig, ReportData, ReportType, ExportFormat } from '../services/ReportExportService';
import { FamilyManagementService } from '../services/FamilyManagementService';
import { AdvancedDNAAnalysisService } from '../services/AdvancedDNAAnalysisService';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type PDFExportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PDFExport'>;

interface Props {
  navigation: PDFExportScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const REPORT_TYPES: { key: ReportType; label: string; description: string; icon: string }[] = [
  {
    key: 'dna_analysis',
    label: 'DNA Analiz Raporu',
    description: 'Genetik analiz sonuçları ve öneriler',
    icon: 'analytics',
  },
  {
    key: 'family_comparison',
    label: 'Aile Karşılaştırma',
    description: 'Aile üyeleri arasında genetik karşılaştırma',
    icon: 'people',
  },
  {
    key: 'health_summary',
    label: 'Sağlık Özeti',
    description: 'Genel sağlık durumu ve risk analizi',
    icon: 'heart',
  },
  {
    key: 'nutrition_plan',
    label: 'Beslenme Planı',
    description: 'Kişiselleştirilmiş beslenme önerileri',
    icon: 'restaurant',
  },
  {
    key: 'exercise_plan',
    label: 'Egzersiz Planı',
    description: 'Genetik yapıya uygun egzersiz programı',
    icon: 'fitness',
  },
  {
    key: 'supplement_plan',
    label: 'Takviye Planı',
    description: 'Kişiselleştirilmiş vitamin ve takviye önerileri',
    icon: 'medical',
  },
  {
    key: 'comprehensive_health',
    label: 'Kapsamlı Sağlık Raporu',
    description: 'Tüm analizlerin birleşik raporu',
    icon: 'document-text',
  },
];

const EXPORT_FORMATS: { key: ExportFormat; label: string; description: string; icon: string }[] = [
  {
    key: 'pdf',
    label: 'PDF',
    description: 'Yazdırılabilir ve paylaşılabilir format',
    icon: 'document',
  },
  {
    key: 'excel',
    label: 'Excel',
    description: 'Veri analizi için uygun format',
    icon: 'grid',
  },
  {
    key: 'csv',
    label: 'CSV',
    description: 'Basit veri formatı',
    icon: 'list',
  },
  {
    key: 'json',
    label: 'JSON',
    description: 'Geliştiriciler için veri formatı',
    icon: 'code',
  },
];

export default function PDFExportScreen({ navigation }: Props) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('dna_analysis');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    includeCharts: true,
    includeRawData: false,
    includeRecommendations: true,
    includeFamilyData: false,
    language: 'tr',
    theme: 'light',
    watermark: true,
  });
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportData[]>([]);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadSavedReports();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadSavedReports = async () => {
    try {
      const reportService = ReportExportService.getInstance();
      await reportService.initialize();
      const reports = await reportService.getSavedReports();
      setSavedReports(reports);
    } catch (error) {
      console.error('Load saved reports error:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      const reportService = ReportExportService.getInstance();
      await reportService.initialize();

      const finalConfig: ReportConfig = {
        type: selectedReportType,
        format: selectedFormat,
        includeCharts: config.includeCharts || false,
        includeRawData: config.includeRawData || false,
        includeRecommendations: config.includeRecommendations || false,
        includeFamilyData: config.includeFamilyData || false,
        language: config.language || 'tr',
        theme: config.theme || 'light',
        watermark: config.watermark || false,
        customTitle: customTitle || undefined,
        customSubtitle: customSubtitle || undefined,
      };

      let reportData: ReportData;

      switch (selectedReportType) {
        case 'dna_analysis':
          const analysisService = AdvancedDNAAnalysisService.getInstance();
          await analysisService.initialize();
          const analysisData = await analysisService.getLastAnalysisResult();
          reportData = await reportService.generateDNAAnalysisReport(analysisData, finalConfig);
          break;

        case 'family_comparison':
          const familyService = FamilyManagementService.getInstance();
          await familyService.initialize();
          const familyGroups = familyService.getUserFamilyGroups('current_user_id');
          if (familyGroups.length === 0) {
            Alert.alert('Hata', 'Aile grubu bulunamadı');
            return;
          }
          const familyGroup = familyGroups[0];
          const latestComparison = familyGroup.comparisons[familyGroup.comparisons.length - 1];
          reportData = await reportService.generateFamilyComparisonReport(
            latestComparison,
            familyGroup,
            finalConfig
          );
          break;

        case 'comprehensive_health':
          const comprehensiveAnalysisData = await AdvancedDNAAnalysisService.getInstance().getLastAnalysisResult();
          const comprehensiveFamilyData = familyService.getUserFamilyGroups('current_user_id')[0];
          reportData = await reportService.generateComprehensiveHealthReport(
            { name: 'Kullanıcı', email: 'user@example.com' },
            comprehensiveAnalysisData,
            comprehensiveFamilyData,
            finalConfig
          );
          break;

        default:
          Alert.alert('Hata', 'Bu rapor türü henüz desteklenmiyor');
          return;
      }

      Alert.alert(
        'Başarılı',
        'Rapor başarıyla oluşturuldu!',
        [
          {
            text: 'Raporları Görüntüle',
            onPress: () => loadSavedReports(),
          },
          {
            text: 'Tamam',
            onPress: () => {},
          },
        ]
      );

    } catch (error) {
      console.error('Generate report error:', error);
      Alert.alert('Hata', 'Rapor oluşturulurken bir hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareReport = async (reportData: ReportData) => {
    try {
      const reportService = ReportExportService.getInstance();
      await reportService.shareReport(reportData);
    } catch (error) {
      console.error('Share report error:', error);
      Alert.alert('Hata', 'Rapor paylaşılırken bir hata oluştu');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportService = ReportExportService.getInstance();
      await reportService.deleteReport(reportId);
      await loadSavedReports();
      Alert.alert('Başarılı', 'Rapor silindi');
    } catch (error) {
      console.error('Delete report error:', error);
      Alert.alert('Hata', 'Rapor silinirken bir hata oluştu');
    }
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[Theme.colors.primary[500], Theme.colors.primary[700]]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Rapor Export</Text>
            <Text style={styles.headerSubtitle}>PDF, Excel ve diğer formatlarda rapor oluştur</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderReportTypeSelection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Rapor Türü Seçin</Text>
        <View style={styles.reportTypesGrid}>
          {REPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.reportTypeButton,
                selectedReportType === type.key && styles.reportTypeButtonActive,
              ]}
              onPress={() => setSelectedReportType(type.key)}
            >
              <Ionicons
                name={type.icon as any}
                size={32}
                color={selectedReportType === type.key ? 'white' : Theme.colors.primary[500]}
              />
              <Text style={[
                styles.reportTypeLabel,
                selectedReportType === type.key && styles.reportTypeLabelActive,
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.reportTypeDescription,
                selectedReportType === type.key && styles.reportTypeDescriptionActive,
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderFormatSelection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Export Formatı</Text>
        <View style={styles.formatsGrid}>
          {EXPORT_FORMATS.map((format) => (
            <TouchableOpacity
              key={format.key}
              style={[
                styles.formatButton,
                selectedFormat === format.key && styles.formatButtonActive,
              ]}
              onPress={() => setSelectedFormat(format.key)}
            >
              <Ionicons
                name={format.icon as any}
                size={24}
                color={selectedFormat === format.key ? 'white' : Theme.colors.primary[500]}
              />
              <Text style={[
                styles.formatLabel,
                selectedFormat === format.key && styles.formatLabelActive,
              ]}>
                {format.label}
              </Text>
              <Text style={[
                styles.formatDescription,
                selectedFormat === format.key && styles.formatDescriptionActive,
              ]}>
                {format.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderCustomizationOptions = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Özelleştirme Seçenekleri</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Özel Başlık (Opsiyonel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Rapor için özel başlık girin"
            placeholderTextColor={Theme.colors.neutral[500]}
            value={customTitle}
            onChangeText={setCustomTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Özel Alt Başlık (Opsiyonel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Rapor için özel alt başlık girin"
            placeholderTextColor={Theme.colors.neutral[500]}
            value={customSubtitle}
            onChangeText={setCustomSubtitle}
          />
        </View>

        <View style={styles.optionsGrid}>
          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Grafikler Dahil</Text>
            <Switch
              value={config.includeCharts}
              onValueChange={(value) => setConfig(prev => ({ ...prev, includeCharts: value }))}
              trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
              thumbColor={config.includeCharts ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
            />
          </View>

          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Ham Veri Dahil</Text>
            <Switch
              value={config.includeRawData}
              onValueChange={(value) => setConfig(prev => ({ ...prev, includeRawData: value }))}
              trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
              thumbColor={config.includeRawData ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
            />
          </View>

          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Öneriler Dahil</Text>
            <Switch
              value={config.includeRecommendations}
              onValueChange={(value) => setConfig(prev => ({ ...prev, includeRecommendations: value }))}
              trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
              thumbColor={config.includeRecommendations ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
            />
          </View>

          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Aile Verisi Dahil</Text>
            <Switch
              value={config.includeFamilyData}
              onValueChange={(value) => setConfig(prev => ({ ...prev, includeFamilyData: value }))}
              trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
              thumbColor={config.includeFamilyData ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
            />
          </View>

          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Filigran</Text>
            <Switch
              value={config.watermark}
              onValueChange={(value) => setConfig(prev => ({ ...prev, watermark: value }))}
              trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
              thumbColor={config.watermark ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
            />
          </View>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderSavedReports = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Kaydedilmiş Raporlar</Text>
        
        {savedReports.length === 0 ? (
          <View style={styles.noReportsContainer}>
            <Ionicons name="document-outline" size={48} color={Theme.colors.neutral[400]} />
            <Text style={styles.noReportsText}>Henüz kaydedilmiş rapor yok</Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {savedReports.map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportSubtitle}>{report.subtitle}</Text>
                  <Text style={styles.reportDate}>
                    {new Date(report.generatedAt).toLocaleDateString('tr-TR')}
                  </Text>
                  <Text style={styles.reportSize}>
                    {(report.metadata.fileSize / 1024).toFixed(2)} KB
                  </Text>
                </View>
                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareReport(report)}
                  >
                    <Ionicons name="share" size={20} color={Theme.colors.primary[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteReport(report.id)}
                  >
                    <Ionicons name="trash" size={20} color={Theme.colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ProfessionalCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderReportTypeSelection()}
        {renderFormatSelection()}
        {renderCustomizationOptions()}
        {renderSavedReports()}
        
        <View style={styles.buttonContainer}>
          <ProfessionalButton
            title="Rapor Oluştur"
            variant="gradient"
            gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
            onPress={handleGenerateReport}
            loading={isGenerating}
            style={styles.generateButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  headerGradient: {
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Theme.spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  card: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  reportTypeButton: {
    width: (width - Theme.spacing.lg * 2 - Theme.spacing.md) / 2,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
  },
  reportTypeButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  reportTypeLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  reportTypeLabelActive: {
    color: 'white',
  },
  reportTypeDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  reportTypeDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  formatButton: {
    width: (width - Theme.spacing.lg * 2 - Theme.spacing.sm * 3) / 4,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
  },
  formatButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  formatLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.xs,
  },
  formatLabelActive: {
    color: 'white',
  },
  formatDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  formatDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  textInput: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  optionsGrid: {
    gap: Theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  optionLabel: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  noReportsContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['2xl'],
  },
  noReportsText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  reportsList: {
    gap: Theme.spacing.md,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  reportSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  reportDate: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
  },
  reportSize: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.primary[500],
    marginTop: Theme.spacing.xs,
  },
  reportActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    padding: Theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing['4xl'],
  },
  generateButton: {
    marginHorizontal: Theme.spacing.md,
  },
});