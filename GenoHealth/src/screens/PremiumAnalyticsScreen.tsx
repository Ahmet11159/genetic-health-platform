import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';
import { SubscriptionService } from '../services/SubscriptionService';
import { RealPaymentService } from '../services/RealPaymentService';

type PremiumAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PremiumAnalytics'>;

interface Props {
  navigation: PremiumAnalyticsScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function PremiumAnalyticsScreen({ navigation }: Props) {
  // State management
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Services
  const [subscriptionService] = useState<SubscriptionService>(SubscriptionService.getInstance());
  const [paymentService] = useState<RealPaymentService>(RealPaymentService.getInstance());

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    initializeScreen();
    startAnimations();
  }, []);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      await subscriptionService.initialize();
      await paymentService.initialize();
      
      const subscribed = await subscriptionService.isUserSubscribed();
      const info = subscriptionService.getSubscriptionInfo();
      
      setIsSubscribed(subscribed);
      setSubscriptionInfo(info);
      
      if (subscribed) {
        await loadAnalytics();
      }
      
    } catch (error) {
      console.error('Screen initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = {
        usage: {
          dnaAnalyses: parseInt(await AsyncStorage.getItem('dnaAnalysesCount') || '0'),
          reportsGenerated: parseInt(await AsyncStorage.getItem('reportsGeneratedCount') || '0'),
          familyMembers: parseInt(await AsyncStorage.getItem('familyMembersCount') || '0'),
          healthTipsRead: parseInt(await AsyncStorage.getItem('healthTipsReadCount') || '0'),
          exercisesCompleted: parseInt(await AsyncStorage.getItem('exercisesCompletedCount') || '0'),
        },
        trends: {
          weeklyGrowth: 15.3,
          monthlyGrowth: 42.7,
          yearlyGrowth: 156.2,
        },
        achievements: [
          { id: 'first_analysis', name: 'İlk DNA Analizi', earned: true, date: '2024-01-15' },
          { id: 'weekly_user', name: 'Haftalık Kullanıcı', earned: true, date: '2024-01-22' },
          { id: 'family_manager', name: 'Aile Yöneticisi', earned: false, date: null },
          { id: 'health_expert', name: 'Sağlık Uzmanı', earned: false, date: null },
        ],
        insights: {
          mostUsedFeature: 'DNA Analizi',
          averageSessionTime: '12 dakika',
          favoriteTimeOfDay: 'Akşam 19:00-21:00',
          healthScore: 87,
          improvementAreas: ['Egzersiz', 'Uyku Kalitesi'],
        },
        subscription: {
          totalSpent: 348,
          savings: 49,
          nextBilling: '2024-02-15',
          planValue: 'Yıllık Abonelik',
        },
      };
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeScreen();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[Theme.colors.primary[500], Theme.colors.primary[600], Theme.colors.primary[700]]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Ionicons name="analytics" size={48} color="#fff" />
        <Text style={styles.headerTitle}>Premium Analitik</Text>
        <Text style={styles.headerSubtitle}>Sağlık yolculuğunuzu takip edin</Text>
      </View>
    </LinearGradient>
  );

  const renderPeriodSelector = () => (
    <ProfessionalCard variant="md" style={styles.periodSelectorCard}>
      <Text style={styles.sectionTitle}>Zaman Aralığı</Text>
      
      <View style={styles.periodSelector}>
        {[
          { key: 'week', label: 'Hafta', icon: 'calendar-outline' },
          { key: 'month', label: 'Ay', icon: 'calendar' },
          { key: 'year', label: 'Yıl', icon: 'calendar-sharp' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonSelected
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Ionicons 
              name={period.icon as any} 
              size={20} 
              color={selectedPeriod === period.key ? '#fff' : Theme.colors.text.secondary} 
            />
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextSelected
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ProfessionalCard>
  );

  const renderUsageStats = () => {
    if (!analytics) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.usageStatsCard}>
        <Text style={styles.sectionTitle}>Kullanım İstatistikleri</Text>
        
        <View style={styles.usageGrid}>
          <View style={styles.usageItem}>
            <View style={styles.usageIconContainer}>
              <Ionicons name="analytics" size={24} color={Theme.colors.primary[600]} />
            </View>
            <Text style={styles.usageValue}>{analytics.usage.dnaAnalyses}</Text>
            <Text style={styles.usageLabel}>DNA Analizi</Text>
          </View>
          
          <View style={styles.usageItem}>
            <View style={styles.usageIconContainer}>
              <Ionicons name="document-text" size={24} color={Theme.colors.primary[600]} />
            </View>
            <Text style={styles.usageValue}>{analytics.usage.reportsGenerated}</Text>
            <Text style={styles.usageLabel}>Rapor Oluşturuldu</Text>
          </View>
          
          <View style={styles.usageItem}>
            <View style={styles.usageIconContainer}>
              <Ionicons name="people" size={24} color={Theme.colors.primary[600]} />
            </View>
            <Text style={styles.usageValue}>{analytics.usage.familyMembers}</Text>
            <Text style={styles.usageLabel}>Aile Üyesi</Text>
          </View>
          
          <View style={styles.usageItem}>
            <View style={styles.usageIconContainer}>
              <Ionicons name="bulb" size={24} color={Theme.colors.primary[600]} />
            </View>
            <Text style={styles.usageValue}>{analytics.usage.healthTipsRead}</Text>
            <Text style={styles.usageLabel}>İpucu Okundu</Text>
          </View>
        </View>
      </ProfessionalCard>
    );
  };

  const renderTrends = () => {
    if (!analytics) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.trendsCard}>
        <Text style={styles.sectionTitle}>Büyüme Trendleri</Text>
        
        <View style={styles.trendsContainer}>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Haftalık Büyüme</Text>
            <View style={styles.trendValueContainer}>
              <Text style={styles.trendValue}>+{analytics.trends.weeklyGrowth}%</Text>
              <Ionicons name="trending-up" size={16} color={Theme.colors.semantic.success} />
            </View>
          </View>
          
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Aylık Büyüme</Text>
            <View style={styles.trendValueContainer}>
              <Text style={styles.trendValue}>+{analytics.trends.monthlyGrowth}%</Text>
              <Ionicons name="trending-up" size={16} color={Theme.colors.semantic.success} />
            </View>
          </View>
          
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Yıllık Büyüme</Text>
            <View style={styles.trendValueContainer}>
              <Text style={styles.trendValue}>+{analytics.trends.yearlyGrowth}%</Text>
              <Ionicons name="trending-up" size={16} color={Theme.colors.semantic.success} />
            </View>
          </View>
        </View>
      </ProfessionalCard>
    );
  };

  const renderAchievements = () => {
    if (!analytics) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.achievementsCard}>
        <Text style={styles.sectionTitle}>Başarılar</Text>
        
        <View style={styles.achievementsList}>
          {analytics.achievements.map((achievement: any, index: number) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.earned ? Theme.colors.semantic.success : Theme.colors.neutral[200] }
              ]}>
                <Ionicons 
                  name={achievement.earned ? "trophy" : "trophy-outline"} 
                  size={20} 
                  color={achievement.earned ? "#fff" : Theme.colors.text.secondary} 
                />
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementName,
                  { color: achievement.earned ? Theme.colors.text.primary : Theme.colors.text.secondary }
                ]}>
                  {achievement.name}
                </Text>
                {achievement.earned && (
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.date).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
              
              {achievement.earned && (
                <Ionicons name="checkmark-circle" size={24} color={Theme.colors.semantic.success} />
              )}
            </View>
          ))}
        </View>
      </ProfessionalCard>
    );
  };

  const renderInsights = () => {
    if (!analytics) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.insightsCard}>
        <Text style={styles.sectionTitle}>Kişisel İçgörüler</Text>
        
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <Ionicons name="star" size={20} color={Theme.colors.primary[600]} />
            <Text style={styles.insightText}>
              En çok kullandığınız özellik: <Text style={styles.insightHighlight}>{analytics.insights.mostUsedFeature}</Text>
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="time" size={20} color={Theme.colors.primary[600]} />
            <Text style={styles.insightText}>
              Ortalama oturum süresi: <Text style={styles.insightHighlight}>{analytics.insights.averageSessionTime}</Text>
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="clock" size={20} color={Theme.colors.primary[600]} />
            <Text style={styles.insightText}>
              En aktif saatler: <Text style={styles.insightHighlight}>{analytics.insights.favoriteTimeOfDay}</Text>
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="pulse" size={20} color={Theme.colors.primary[600]} />
            <Text style={styles.insightText}>
              Sağlık skorunuz: <Text style={styles.insightHighlight}>{analytics.insights.healthScore}/100</Text>
            </Text>
          </View>
        </View>
      </ProfessionalCard>
    );
  };

  const renderSubscriptionAnalytics = () => {
    if (!analytics) return null;

    return (
      <ProfessionalCard variant="lg" style={styles.subscriptionCard}>
        <Text style={styles.sectionTitle}>Abonelik Analizi</Text>
        
        <View style={styles.subscriptionStats}>
          <View style={styles.subscriptionStat}>
            <Text style={styles.subscriptionStatValue}>₺{analytics.subscription.totalSpent}</Text>
            <Text style={styles.subscriptionStatLabel}>Toplam Harcama</Text>
          </View>
          
          <View style={styles.subscriptionStat}>
            <Text style={styles.subscriptionStatValue}>₺{analytics.subscription.savings}</Text>
            <Text style={styles.subscriptionStatLabel}>Tasarruf</Text>
          </View>
          
          <View style={styles.subscriptionStat}>
            <Text style={styles.subscriptionStatValue}>{analytics.subscription.planValue}</Text>
            <Text style={styles.subscriptionStatLabel}>Mevcut Plan</Text>
          </View>
        </View>
        
        <View style={styles.nextBillingContainer}>
          <Ionicons name="calendar" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.nextBillingText}>
            Sonraki faturalandırma: {new Date(analytics.subscription.nextBilling).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </ProfessionalCard>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!isSubscribed) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
        {renderHeader()}
        
        <View style={styles.noSubscriptionContainer}>
          <Ionicons name="lock-closed" size={64} color={Theme.colors.neutral[400]} />
          <Text style={styles.noSubscriptionTitle}>Premium Gerekli</Text>
          <Text style={styles.noSubscriptionText}>
            Detaylı analitik raporları görüntülemek için premium üyelik gereklidir.
          </Text>
          
          <ProfessionalButton
            title="Premium'a Geç"
            onPress={() => navigation.navigate('AdvancedPremium')}
            variant="primary"
            size="lg"
            style={styles.upgradeButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {renderPeriodSelector()}
          {renderUsageStats()}
          {renderTrends()}
          {renderAchievements()}
          {renderInsights()}
          {renderSubscriptionAnalytics()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.secondary,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    left: Theme.spacing.lg,
    padding: Theme.spacing.sm,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    padding: Theme.spacing.lg,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  noSubscriptionTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  noSubscriptionText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
  },
  upgradeButton: {
    width: '100%',
  },
  periodSelectorCard: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  periodButtonSelected: {
    backgroundColor: Theme.colors.primary[500],
  },
  periodButtonText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.secondary,
  },
  periodButtonTextSelected: {
    color: '#fff',
  },
  usageStatsCard: {
    marginBottom: Theme.spacing.lg,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  usageItem: {
    width: (width - Theme.spacing.lg * 2 - Theme.spacing.md * 3) / 2,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
  },
  usageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  usageValue: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
    marginBottom: Theme.spacing.xs,
  },
  usageLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  trendsCard: {
    marginBottom: Theme.spacing.lg,
  },
  trendsContainer: {
    gap: Theme.spacing.md,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  trendLabel: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  trendValue: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.semantic.success,
  },
  achievementsCard: {
    marginBottom: Theme.spacing.lg,
  },
  achievementsList: {
    gap: Theme.spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.xs,
  },
  achievementDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  insightsCard: {
    marginBottom: Theme.spacing.lg,
  },
  insightsList: {
    gap: Theme.spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  insightText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  insightHighlight: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
  },
  subscriptionCard: {
    marginBottom: Theme.spacing.xl,
  },
  subscriptionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
  },
  subscriptionStat: {
    alignItems: 'center',
  },
  subscriptionStatValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
    marginBottom: Theme.spacing.xs,
  },
  subscriptionStatLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  nextBillingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
  },
  nextBillingText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary[700],
    fontWeight: Theme.typography.fontWeight.medium,
  },
});
