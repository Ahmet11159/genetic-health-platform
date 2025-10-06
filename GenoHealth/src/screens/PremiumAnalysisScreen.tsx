import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { PremiumAnalysisResult } from '../services/PremiumGeneticAnalyzer';
import PremiumCard from '../components/PremiumCard';

type PremiumAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type PremiumAnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

interface Props {
  navigation: PremiumAnalysisScreenNavigationProp;
  route: PremiumAnalysisScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function PremiumAnalysisScreen({ navigation, route }: Props) {
  const [analysisData, setAnalysisData] = useState<PremiumAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    try {
      // Premium analiz simülasyonu
      setTimeout(() => {
        const mockAnalysis: PremiumAnalysisResult = {
          healthTraits: [
            {
              trait: 'Alzheimer Riski',
              value: 'Yüksek Risk',
              description: 'APOE ε4 geniniz Alzheimer riskini 3-15 kat artırıyor',
              riskLevel: 'very_high',
              confidence: 98,
              recommendations: ['Kardiyovasküler egzersiz', 'Mediterranean diyeti', 'Beyin egzersizleri'],
              scientificSources: ['ClinVar', 'dbSNP', 'OMIM'],
              relatedGenes: ['APOE'],
              polygenicScore: 2.5,
              effectSize: 2.5,
              populationFrequency: 0.14,
              clinicalSignificance: 'Yüksek Klinik Önem',
              evidenceLevel: 'A',
              populationSpecificity: ['European', 'Asian'],
              ageDependency: 'elderly',
              genderSpecificity: 'both',
              lifestyleFactors: ['exercise', 'diet', 'sleep'],
              drugInteractions: ['statins'],
              monitoringFrequency: '3 months',
              followUpRequired: true,
              urgencyLevel: 'high'
            },
            {
              trait: 'Diyabet Riski',
              value: 'Orta Risk',
              description: 'TCF7L2 geniniz Tip 2 diyabet riskini %40 artırıyor',
              riskLevel: 'high',
              confidence: 95,
              recommendations: ['Karbonhidrat sınırlama', 'Düzenli egzersiz', 'Kan şekeri takibi'],
              scientificSources: ['ClinVar', 'dbSNP', 'OMIM'],
              relatedGenes: ['TCF7L2'],
              polygenicScore: 1.4,
              effectSize: 1.4,
              populationFrequency: 0.3,
              clinicalSignificance: 'Yüksek Klinik Önem',
              evidenceLevel: 'A',
              populationSpecificity: ['European', 'Asian', 'African'],
              ageDependency: 'adult',
              genderSpecificity: 'both',
              lifestyleFactors: ['diet', 'exercise', 'weight_management'],
              drugInteractions: ['metformin', 'insulin'],
              monitoringFrequency: '3 months',
              followUpRequired: true,
              urgencyLevel: 'high'
            },
            {
              trait: 'Kardiyovasküler Risk',
              value: 'Yüksek Risk',
              description: '9p21 geniniz kalp hastalığı riskini %25 artırıyor',
              riskLevel: 'high',
              confidence: 97,
              recommendations: ['Kardiyovasküler egzersiz', 'Sağlıklı beslenme', 'Stres yönetimi'],
              scientificSources: ['ClinVar', 'dbSNP', 'OMIM'],
              relatedGenes: ['CDKN2A'],
              polygenicScore: 1.3,
              effectSize: 1.3,
              populationFrequency: 0.4,
              clinicalSignificance: 'Yüksek Klinik Önem',
              evidenceLevel: 'A',
              populationSpecificity: ['European', 'Asian', 'African'],
              ageDependency: 'adult',
              genderSpecificity: 'both',
              lifestyleFactors: ['exercise', 'diet', 'stress'],
              drugInteractions: ['statins', 'aspirin'],
              monitoringFrequency: '3 months',
              followUpRequired: true,
              urgencyLevel: 'high'
            }
          ],
          nutritionTraits: [],
          exerciseTraits: [],
          sleepTraits: [],
          drugInteractions: [],
          riskFactors: ['Alzheimer', 'Diyabet', 'Kalp Hastalığı'],
          recommendations: ['Düzenli egzersiz', 'Sağlıklı beslenme', 'Stres yönetimi'],
          confidence: 99,
          lastUpdated: new Date().toISOString(),
          totalVariantsAnalyzed: 1247,
          qualityMetrics: {
            callRate: 99.2,
            averageCoverage: 35.8,
            contamination: 0.1,
            heterozygosity: 0.32,
            inbreedingCoefficient: 0.01,
            populationAncestry: 0.95
          },
          populationAncestry: {
            primary: 'European',
            secondary: ['Asian', 'African'],
            confidence: 95,
            admixture: { 'European': 0.75, 'Asian': 0.15, 'African': 0.10 }
          },
          geneticRiskProfile: {
            overallRisk: 'high',
            riskFactors: ['Alzheimer', 'Diyabet', 'Kalp Hastalığı'],
            protectiveFactors: ['Folat Metabolizması', 'Antioksidan Kapasitesi'],
            recommendations: ['Düzenli sağlık kontrolleri', 'Yaşam tarzı değişiklikleri']
          },
          personalizedInsights: {
            metabolism: 'Yavaş metabolizma, kafein duyarlılığı yüksek',
            aging: 'Hızlı yaşlanma riski, antioksidan ihtiyacı',
            immunity: 'Güçlü bağışıklık sistemi, enfeksiyon direnci',
            cognitive: 'Yüksek bilişsel gerileme riski',
            cardiovascular: 'Yüksek kalp hastalığı riski'
          }
        };

        setAnalysisData(mockAnalysis);
        setIsLoading(false);

        // Animasyonları başlat
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          })
        ]).start();
      }, 3000);
    } catch (error) {
      console.error('Premium analysis error:', error);
      setIsLoading(false);
    }
  };

  const getRiskGradient = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return ['#4CAF50', '#66BB6A'];
      case 'moderate': return ['#FF9800', '#FFB74D'];
      case 'high': return ['#F44336', '#EF5350'];
      case 'very_high': return ['#D32F2F', '#E57373'];
      default: return ['#9E9E9E', '#BDBDBD'];
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'checkmark-circle';
      case 'moderate': return 'warning';
      case 'high': return 'alert-circle';
      case 'very_high': return 'skull';
      default: return 'help-circle';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingTitle}>Premium DNA Analizi</Text>
            <Text style={styles.loadingSubtitle}>
              1247 genetik varyant analiz ediliyor...
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>%99 Güvenilirlik</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!analysisData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Analiz Hatası</Text>
        <Text style={styles.errorText}>
          Premium DNA analizi sırasında bir hata oluştu.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name="diamond" size={48} color="#FFD700" />
          <Text style={styles.title}>Premium DNA Analizi</Text>
          <Text style={styles.subtitle}>
            %{analysisData.confidence} güvenilirlik ile {analysisData.totalVariantsAnalyzed} varyant analiz edildi
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Kalite Metrikleri */}
        <View style={styles.qualityCard}>
          <Text style={styles.qualityTitle}>Analiz Kalitesi</Text>
          <View style={styles.qualityMetrics}>
            <View style={styles.qualityMetric}>
              <Text style={styles.qualityValue}>%{analysisData.qualityMetrics.callRate}</Text>
              <Text style={styles.qualityLabel}>Call Rate</Text>
            </View>
            <View style={styles.qualityMetric}>
              <Text style={styles.qualityValue}>{analysisData.qualityMetrics.averageCoverage}x</Text>
              <Text style={styles.qualityLabel}>Coverage</Text>
            </View>
            <View style={styles.qualityMetric}>
              <Text style={styles.qualityValue}>%{analysisData.qualityMetrics.populationAncestry * 100}</Text>
              <Text style={styles.qualityLabel}>Ancestry</Text>
            </View>
          </View>
        </View>

        {/* Risk Profili */}
        <View style={styles.riskProfileCard}>
          <Text style={styles.riskProfileTitle}>Genetik Risk Profili</Text>
          <View style={styles.riskProfileContent}>
            <View style={styles.riskLevelContainer}>
              <Text style={styles.riskLevelText}>
                {analysisData.geneticRiskProfile.overallRisk === 'low' ? 'Düşük Risk' :
                 analysisData.geneticRiskProfile.overallRisk === 'moderate' ? 'Orta Risk' :
                 analysisData.geneticRiskProfile.overallRisk === 'high' ? 'Yüksek Risk' : 'Çok Yüksek Risk'}
              </Text>
            </View>
            <Text style={styles.riskProfileDescription}>
              {analysisData.geneticRiskProfile.riskFactors.length} risk faktörü tespit edildi
            </Text>
          </View>
        </View>

        {/* Sağlık Özellikleri */}
        <View style={styles.traitsSection}>
          <Text style={styles.sectionTitle}>Sağlık Özellikleri</Text>
          {analysisData.healthTraits.map((trait, index) => (
            <PremiumCard
              key={index}
              title={trait.trait}
              subtitle={trait.description}
              icon={getRiskIcon(trait.riskLevel)}
              gradient={getRiskGradient(trait.riskLevel)}
              confidence={trait.confidence}
              riskLevel={trait.riskLevel}
              features={trait.recommendations.slice(0, 3)}
              onPress={() => {}}
            />
          ))}
        </View>

        {/* Kişiselleştirilmiş İçgörüler */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Kişiselleştirilmiş İçgörüler</Text>
          <View style={styles.insightsContent}>
            <View style={styles.insightItem}>
              <Ionicons name="flame" size={20} color="#FF6B6B" />
              <Text style={styles.insightText}>{analysisData.personalizedInsights.metabolism}</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="time" size={20} color="#FF9800" />
              <Text style={styles.insightText}>{analysisData.personalizedInsights.aging}</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="shield" size={20} color="#4CAF50" />
              <Text style={styles.insightText}>{analysisData.personalizedInsights.immunity}</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="brain" size={20} color="#9C27B0" />
              <Text style={styles.insightText}>{analysisData.personalizedInsights.cognitive}</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="heart" size={20} color="#F44336" />
              <Text style={styles.insightText}>{analysisData.personalizedInsights.cardiovascular}</Text>
            </View>
          </View>
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('MealPlan', { analysisData })}
          >
            <Ionicons name="restaurant" size={20} color="#fff" />
            <Text style={styles.buttonText}>Haftalık Beslenme Planları</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Exercise', { analysisData })}
          >
            <Ionicons name="fitness" size={20} color="#4CAF50" />
            <Text style={styles.secondaryButtonText}>Egzersiz Planı</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    width: '99%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  qualityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  qualityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  qualityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualityMetric: {
    alignItems: 'center',
  },
  qualityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  qualityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  riskProfileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  riskProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  riskProfileContent: {
    alignItems: 'center',
  },
  riskLevelContainer: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  riskLevelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskProfileDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  traitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightsContent: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});


