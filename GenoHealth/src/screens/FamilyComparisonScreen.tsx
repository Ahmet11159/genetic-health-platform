import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { FamilyManagementService, FamilyComparison, FamilyGroup } from '../services/FamilyManagementService';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type FamilyComparisonScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FamilyComparison'>;

interface Props {
  navigation: FamilyComparisonScreenNavigationProp;
  route: {
    params: {
      familyId: string;
      comparisonId?: string;
    };
  };
}

const { width } = Dimensions.get('window');

export default function FamilyComparisonScreen({ navigation, route }: Props) {
  const { familyId, comparisonId } = route.params;
  
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [comparison, setComparison] = useState<FamilyComparison | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const familyService = FamilyManagementService.getInstance();
      await familyService.initialize();
      
      const family = familyService.getFamilyGroup(familyId);
      setFamilyGroup(family);
      
      if (comparisonId) {
        const comp = familyService.getFamilyComparison(familyId, comparisonId);
        setComparison(comp || null);
      } else if (family?.comparisons.length) {
        // En son karşılaştırmayı göster
        const latestComparison = family.comparisons[family.comparisons.length - 1];
        setComparison(latestComparison);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Load data error:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNewComparison = async () => {
    if (!familyGroup || familyGroup.members.length < 2) {
      Alert.alert('Hata', 'En az 2 aile üyesi gereklidir');
      return;
    }

    try {
      const familyService = FamilyManagementService.getInstance();
      const newComparison = await familyService.performFamilyComparison(
        familyId,
        familyGroup.members.map(m => m.id)
      );
      
      setComparison(newComparison);
      Alert.alert('Başarılı', 'Yeni genetik karşılaştırma tamamlandı!');
    } catch (error) {
      console.error('New comparison error:', error);
      Alert.alert('Hata', 'Karşılaştırma oluşturulurken bir hata oluştu');
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
            <Text style={styles.headerTitle}>Aile Genetik Analizi</Text>
            <Text style={styles.headerSubtitle}>
              {familyGroup?.name || 'Aile Grubu'} - Genetik Karşılaştırma
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              // Menu options
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTabNavigation = () => (
    <Animated.View 
      style={[
        styles.tabContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {[
          { key: 'overview', label: 'Genel Bakış', icon: 'analytics' },
          { key: 'shared', label: 'Paylaşılan Varyantlar', icon: 'people' },
          { key: 'unique', label: 'Benzersiz Varyantlar', icon: 'person' },
          { key: 'traits', label: 'Ortak Özellikler', icon: 'star' },
          { key: 'insights', label: 'Sağlık İçgörüleri', icon: 'bulb' },
          { key: 'recommendations', label: 'Öneriler', icon: 'checkmark-circle' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.key ? 'white' : Theme.colors.primary[500]}
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderOverview = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Karşılaştırma Özeti</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{comparison?.members.length || 0}</Text>
            <Text style={styles.statLabel}>Aile Üyesi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{comparison?.sharedVariants.length || 0}</Text>
            <Text style={styles.statLabel}>Paylaşılan Varyant</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{comparison?.uniqueVariants.length || 0}</Text>
            <Text style={styles.statLabel}>Benzersiz Varyant</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{comparison?.commonTraits.length || 0}</Text>
            <Text style={styles.statLabel}>Ortak Özellik</Text>
          </View>
        </View>

        <View style={styles.riskAssessment}>
          <Text style={styles.riskTitle}>Genel Risk Değerlendirmesi</Text>
          <View style={[
            styles.riskBadge,
            { backgroundColor: comparison?.riskAssessment.overallRisk === 'high' ? Theme.colors.semantic.error : 
                              comparison?.riskAssessment.overallRisk === 'moderate' ? Theme.colors.semantic.warning : 
                              Theme.colors.semantic.success }
          ]}>
            <Text style={styles.riskText}>
              {comparison?.riskAssessment.overallRisk === 'high' ? 'Yüksek Risk' :
               comparison?.riskAssessment.overallRisk === 'moderate' ? 'Orta Risk' : 'Düşük Risk'}
            </Text>
          </View>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderSharedVariants = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Paylaşılan Genetik Varyantlar</Text>
        
        {comparison?.sharedVariants.map((variant, index) => (
          <View key={index} style={styles.variantItem}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantGene}>{variant.gene}</Text>
              <Text style={styles.variantRsid}>{variant.rsid}</Text>
            </View>
            <Text style={styles.variantDescription}>{variant.healthImpact}</Text>
            <View style={styles.variantStats}>
              <View style={styles.variantStat}>
                <Text style={styles.variantStatLabel}>Aile Frekansı</Text>
                <Text style={styles.variantStatValue}>%{Math.round(variant.familyFrequency * 100)}</Text>
              </View>
              <View style={styles.variantStat}>
                <Text style={styles.variantStatLabel}>Popülasyon Frekansı</Text>
                <Text style={styles.variantStatValue}>%{Math.round(variant.populationFrequency * 100)}</Text>
              </View>
            </View>
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Öneriler:</Text>
              {variant.recommendations.map((rec, recIndex) => (
                <Text key={recIndex} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>
          </View>
        ))}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderUniqueVariants = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Benzersiz Genetik Varyantlar</Text>
        
        {comparison?.uniqueVariants.map((variant, index) => {
          const member = familyGroup?.members.find(m => m.id === variant.member);
          return (
            <View key={index} style={styles.variantItem}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantGene}>{variant.gene}</Text>
                <Text style={styles.variantRsid}>{variant.rsid}</Text>
              </View>
              <Text style={styles.variantMember}>{member?.name || 'Bilinmeyen Üye'}</Text>
              <Text style={styles.variantDescription}>{variant.healthImpact}</Text>
              <View style={styles.variantStats}>
                <View style={styles.variantStat}>
                  <Text style={styles.variantStatLabel}>Popülasyon Frekansı</Text>
                  <Text style={styles.variantStatValue}>%{Math.round(variant.populationFrequency * 100)}</Text>
                </View>
              </View>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Öneriler:</Text>
                {variant.recommendations.map((rec, recIndex) => (
                  <Text key={recIndex} style={styles.recommendationItem}>• {rec}</Text>
                ))}
              </View>
            </View>
          );
        })}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderCommonTraits = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Ortak Aile Özellikleri</Text>
        
        {comparison?.commonTraits.map((trait, index) => (
          <View key={index} style={styles.traitItem}>
            <View style={styles.traitHeader}>
              <Text style={styles.traitName}>{trait.trait}</Text>
              <Text style={styles.traitPrevalence}>%{trait.prevalence}</Text>
            </View>
            <Text style={styles.traitDescription}>{trait.description}</Text>
            <Text style={styles.traitBasis}>Genetik Temel: {trait.geneticBasis}</Text>
            <View style={styles.traitImplications}>
              <Text style={styles.traitImplicationsTitle}>Sağlık Etkileri:</Text>
              {trait.healthImplications.map((implication, impIndex) => (
                <Text key={impIndex} style={styles.traitImplicationItem}>• {implication}</Text>
              ))}
            </View>
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Öneriler:</Text>
              {trait.recommendations.map((rec, recIndex) => (
                <Text key={recIndex} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>
          </View>
        ))}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderHealthInsights = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Sağlık İçgörüleri</Text>
        
        {comparison?.healthInsights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightCategory}>
                {insight.category === 'cardiovascular' ? 'Kardiyovasküler' :
                 insight.category === 'neurological' ? 'Nörolojik' :
                 insight.category === 'metabolic' ? 'Metabolik' :
                 insight.category === 'cancer' ? 'Kanser' :
                 insight.category === 'immune' ? 'Bağışıklık' : 'Mental Sağlık'}
              </Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: insight.severity === 'high' ? Theme.colors.semantic.error : 
                                  insight.severity === 'moderate' ? Theme.colors.semantic.warning : 
                                  Theme.colors.semantic.success }
              ]}>
                <Text style={styles.severityText}>
                  {insight.severity === 'high' ? 'Yüksek' :
                   insight.severity === 'moderate' ? 'Orta' : 'Düşük'}
                </Text>
              </View>
            </View>
            <Text style={styles.insightText}>{insight.insight}</Text>
            <Text style={styles.insightEvidence}>Kanıt: {insight.evidence}</Text>
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Öneriler:</Text>
              {insight.recommendations.map((rec, recIndex) => (
                <Text key={recIndex} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>
          </View>
        ))}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderRecommendations = () => (
    <Animated.View 
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Aile Önerileri</Text>
        
        {comparison?.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: recommendation.priority === 'high' ? Theme.colors.semantic.error : 
                                  recommendation.priority === 'medium' ? Theme.colors.semantic.warning : 
                                  Theme.colors.semantic.success }
              ]}>
                <Text style={styles.priorityText}>
                  {recommendation.priority === 'high' ? 'Yüksek' :
                   recommendation.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                </Text>
              </View>
            </View>
            <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
            <Text style={styles.recommendationTimeline}>Zaman Çizelgesi: {recommendation.timeline}</Text>
            <View style={styles.resourcesContainer}>
              <Text style={styles.resourcesTitle}>Kaynaklar:</Text>
              {recommendation.resources.map((resource, resIndex) => (
                <Text key={resIndex} style={styles.resourceItem}>• {resource}</Text>
              ))}
            </View>
          </View>
        ))}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'shared':
        return renderSharedVariants();
      case 'unique':
        return renderUniqueVariants();
      case 'traits':
        return renderCommonTraits();
      case 'insights':
        return renderHealthInsights();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      {renderTabNavigation()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {comparison ? (
          renderContent()
        ) : (
          <Animated.View 
            style={[
              styles.noDataContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ProfessionalCard variant="elevated" style={styles.noDataCard}>
              <Ionicons name="analytics" size={64} color={Theme.colors.neutral[400]} />
              <Text style={styles.noDataTitle}>Henüz Karşılaştırma Yok</Text>
              <Text style={styles.noDataDescription}>
                Aile üyeleri arasında genetik karşılaştırma yapmak için aşağıdaki butona tıklayın.
              </Text>
              <ProfessionalButton
                title="Yeni Karşılaştırma Yap"
                variant="gradient"
                gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
                onPress={handleNewComparison}
                style={styles.newComparisonButton}
              />
            </ProfessionalCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  menuButton: {
    padding: Theme.spacing.sm,
  },
  tabContainer: {
    marginBottom: Theme.spacing.lg,
  },
  tabScrollContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
  tabButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  tabText: {
    marginLeft: Theme.spacing.xs,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.lg,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  statValue: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[500],
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  riskAssessment: {
    alignItems: 'center',
  },
  riskTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  riskBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
  riskText: {
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  variantItem: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  variantGene: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  variantRsid: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  variantDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  variantStats: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  variantStat: {
    flex: 1,
    alignItems: 'center',
  },
  variantStatLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  variantStatValue: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.primary[500],
  },
  variantMember: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  recommendationsContainer: {
    marginTop: Theme.spacing.sm,
  },
  recommendationsTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  recommendationItem: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  traitItem: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  traitName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  traitPrevalence: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.primary[500],
  },
  traitDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  traitBasis: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  traitImplications: {
    marginBottom: Theme.spacing.sm,
  },
  traitImplicationsTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  traitImplicationItem: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  insightItem: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  insightCategory: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
  },
  severityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  severityText: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  insightText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  insightEvidence: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  recommendationCard: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  recommendationTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  priorityText: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  recommendationDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  recommendationTimeline: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  resourcesContainer: {
    marginTop: Theme.spacing.sm,
  },
  resourcesTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  resourceItem: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  noDataContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing['4xl'],
  },
  noDataCard: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  noDataDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  newComparisonButton: {
    marginTop: Theme.spacing.lg,
  },
});