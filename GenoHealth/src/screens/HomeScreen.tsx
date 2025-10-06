import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';
import ProfessionalLoadingScreen from '../components/ProfessionalLoadingScreen';
import PremiumOverlay from '../components/PremiumOverlay';
import { SubscriptionService } from '../services/SubscriptionService';
import { useApp } from '../contexts/AppContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const { state, actions } = useApp();
  const [dailyTip, setDailyTip] = useState<string>('');
  const [showFullTip, setShowFullTip] = useState<boolean>(false);
  const [showPremiumOverlay, setShowPremiumOverlay] = useState<boolean>(false);
  const [premiumFeature, setPremiumFeature] = useState<string>('');
  const [subscriptionService] = useState<SubscriptionService>(SubscriptionService.getInstance());
  const [userStats, setUserStats] = useState({
    variants: 1247,
    confidence: 99,
    lastAnalysis: '2024-01-15',
  });
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Servisleri başlat
    const initializeServices = async () => {
      try {
        await subscriptionService.initialize();
        const isSubscribed = await subscriptionService.isUserSubscribed();
        actions.setSubscription(isSubscribed);
      } catch (error) {
        console.error('Service initialization error:', error);
      }
    };

  // DNA yükleme durumunu kontrol et
  const checkDNAStatus = async () => {
    try {
      const hasDNA = await AsyncStorage.getItem('hasDNAData');
      if (hasDNA === 'true' && !state.hasDNAData) {
        actions.setDNAData(true);
      }
    } catch (error) {
      console.error('DNA durumu kontrol hatası:', error);
    }
  };

    initializeServices();
    checkDNAStatus();

    // Başlatma animasyonları
    const timer = setTimeout(() => {
      actions.updateUser({ 
        usage: { 
          ...state.user?.usage, 
          lastActive: new Date().toISOString() 
        } 
      });
      setDailyTip('DNA analiziniz size özel sağlık önerileri sunar. Düzenli egzersiz ve beslenme planınızı takip edin.');
    }, 2000);

    // Animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animasyonu - daha güvenli değerler
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.01,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => clearTimeout(timer);
  }, []);

  // DNA durumunu her ekran focus olduğunda kontrol et
  useFocusEffect(
    React.useCallback(() => {
      const checkDNAStatus = async () => {
        try {
          const hasDNA = await AsyncStorage.getItem('hasDNAData');
          console.log('DNA durumu kontrol ediliyor:', hasDNA);
          if (hasDNA === 'true' && !state.hasDNAData) {
            actions.setDNAData(true);
            console.log('hasDNAData true olarak ayarlandı');
          } else if (hasDNA !== 'true' && state.hasDNAData) {
            actions.setDNAData(false);
            console.log('hasDNAData false olarak ayarlandı');
          }
        } catch (error) {
          console.error('DNA durumu kontrol hatası:', error);
        }
      };

      checkDNAStatus();
    }, [state.hasDNAData])
  );

  // DNA durumunu sürekli kontrol et (her 2 saniyede bir)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const hasDNA = await AsyncStorage.getItem('hasDNAData');
        if (hasDNA === 'true' && !state.hasDNAData) {
          console.log('DNA durumu interval ile güncellendi');
          actions.setDNAData(true);
        }
      } catch (error) {
        console.error('DNA durumu interval kontrol hatası:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state.hasDNAData]);

  const features = [
    {
      title: 'DNA Analizi',
      description: 'Genetik verilerinizi analiz edin',
      icon: 'analytics-outline',
      color: '#4CAF50',
      screen: 'DNAUpload' as keyof RootStackParamList,
      gradient: ['#4CAF50', '#66BB6A'],
    },
    {
      title: 'Beslenme',
      description: 'Kişiselleştirilmiş beslenme planı',
      icon: 'nutrition-outline',
      color: '#FF9800',
      screen: 'Nutrition' as keyof RootStackParamList,
      gradient: ['#FF9800', '#FFB74D'],
    },
    {
      title: 'Egzersiz',
      description: 'Genetik yapınıza uygun egzersizler',
      icon: 'fitness-outline',
      color: '#2196F3',
      screen: 'Exercise' as keyof RootStackParamList,
      gradient: ['#2196F3', '#64B5F6'],
    },
    {
      title: 'Sağlık Takibi',
      description: 'Gerçek zamanlı sağlık izleme',
      icon: 'pulse-outline',
      color: '#E91E63',
      screen: 'HealthMonitoring' as keyof RootStackParamList,
      gradient: ['#E91E63', '#F06292'],
    },
    {
        title: 'Genora AI',
        description: 'Kişiselleştirilmiş AI asistanınız',
      icon: 'sparkles-outline',
      color: '#9C27B0',
      screen: 'GenoAIAssistant' as keyof RootStackParamList,
      gradient: ['#9C27B0', '#BA68C8'],
    },
    {
      title: 'Uyku Analizi',
      description: 'Uyku kalitesi ve genetik faktörler',
      icon: 'moon-outline',
      color: '#9C27B0',
      screen: 'Sleep' as keyof RootStackParamList,
      gradient: ['#9C27B0', '#BA68C8'],
    },
    {
      title: 'Takviyeler',
      description: 'Kişiselleştirilmiş vitamin önerileri',
      icon: 'medical-outline',
      color: '#00BCD4',
      screen: 'Supplements' as keyof RootStackParamList,
      gradient: ['#00BCD4', '#4DD0E1'],
    },
    {
      title: 'Premium',
      description: 'Gelişmiş özellikler ve analizler',
      icon: 'diamond-outline',
      color: '#FFD700',
      screen: 'AdvancedPremium' as keyof RootStackParamList,
      gradient: ['#FFD700', '#FFA726'],
    },
  ];

  const handleFeaturePress = async (screen: keyof RootStackParamList) => {
    console.log('Feature pressed:', screen);
    console.log('hasDNAData:', state.hasDNAData);
    
    // Güncel abonelik durumunu kontrol et
    const currentSubscriptionStatus = await subscriptionService.isUserSubscribed();
    console.log('Current subscription status:', currentSubscriptionStatus);
    
    // Premium özellik kontrolü
    if (!currentSubscriptionStatus) {
      const featureNames: { [key: string]: string } = {
        'Nutrition': 'Beslenme Planları',
        'Exercise': 'Egzersiz Programları',
        'HealthMonitoring': 'Sağlık Takibi',
        'Sleep': 'Uyku Analizi',
        'Supplements': 'Takviye Önerileri',
        'DNAUpload': 'DNA Analizi',
        'Analysis': 'Detaylı Analiz',
        'Profile': 'Profil Yönetimi',
        'DailyTips': 'Günlük İpuçları',
        'Premium': 'Premium Özellikler',
      };
      
      setPremiumFeature(featureNames[screen] || 'Bu özellik');
      setShowPremiumOverlay(true);
      return;
    }
    
    // DNA durumunu tekrar kontrol et
    try {
      const hasDNA = await AsyncStorage.getItem('hasDNAData');
      console.log('Son DNA durumu kontrolü:', hasDNA);
      if (hasDNA === 'true' && !state.hasDNAData) {
        actions.setDNAData(true);
        console.log('DNA durumu son anda güncellendi');
      }
    } catch (error) {
      console.error('Son DNA kontrol hatası:', error);
    }
    
    if (screen !== 'DNAUpload' && !state.hasDNAData) {
      Alert.alert(
        'DNA Analizi Gerekli',
        'Bu özelliği kullanmak için önce DNA analizinizi yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'DNA Yükle', onPress: () => navigation.navigate('DNAUpload') },
        ]
      );
    } else {
      console.log('Navigating to:', screen);
      navigation.navigate(screen as any);
    }
  };

  // Loading durumu
  if (state.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[800]} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Professional Header */}
        <Animated.View 
          style={[
            styles.professionalHeader,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={[Theme.colors.primary[800], Theme.colors.primary[600], Theme.colors.primary[500]]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.brandInfo}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="dna" size={48} color={Theme.colors.text.inverse} />
              </Animated.View>
              <Text style={styles.brandName}>GenoHealth</Text>
              <Text style={styles.brandTagline}>DNA Analizi & Sağlık</Text>
            </View>
          </LinearGradient>
        </Animated.View>

      {/* Daily Tip Card */}
      <Animated.View 
        style={[
          styles.dailyTipContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ProfessionalCard
          variant="elevated"
          size="lg"
          style={styles.dailyTipCard}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={24} color={Theme.colors.accent.amber} />
            <Text style={styles.cardTitle}>Bugünün Genetik İpucu</Text>
          </View>
          <Text style={styles.dailyTipText} numberOfLines={showFullTip ? undefined : 3}>
            {dailyTip}
          </Text>
          
          {dailyTip.length > 100 && (
            <TouchableOpacity 
              style={styles.readMoreButton}
              onPress={() => setShowFullTip(!showFullTip)}
              activeOpacity={0.7}
            >
              <Text style={styles.readMoreText}>
                {showFullTip ? 'Daha az göster' : 'Devamını oku'}
              </Text>
              <Ionicons 
                name={showFullTip ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={Theme.colors.primary[600]} 
              />
            </TouchableOpacity>
          )}
          
          <ProfessionalButton
            title="Tüm İpuçları"
            variant="outline"
            size="sm"
            icon="chevron-forward"
            iconPosition="right"
            onPress={() => navigation.navigate('DailyTips')}
            style={styles.dailyTipButton}
          />
        </ProfessionalCard>
      </Animated.View>

      {/* User Stats */}
      <Animated.View 
        style={[
          styles.statsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.sectionTitle}>Analiz Durumunuz</Text>
        <View style={styles.statsGrid}>
          <ProfessionalCard
            variant="elevated"
            size="sm"
            style={styles.statCard}
          >
            <Ionicons name="analytics" size={24} color={Theme.colors.primary[500]} />
            <Text style={styles.statNumber}>{userStats.variants.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Genetik Varyantlar</Text>
          </ProfessionalCard>

          <ProfessionalCard
            variant="elevated"
            size="sm"
            style={styles.statCard}
          >
            <Ionicons name="shield-checkmark" size={24} color={Theme.colors.secondary[500]} />
            <Text style={styles.statNumber}>%{userStats.confidence}</Text>
            <Text style={styles.statLabel}>Güvenilirlik</Text>
          </ProfessionalCard>

          <ProfessionalCard
            variant="elevated"
            size="sm"
            style={styles.statCard}
          >
            <Ionicons name="calendar" size={24} color={Theme.colors.accent.orange} />
            <Text style={styles.statNumber}>
              {new Date(userStats.lastAnalysis).toLocaleDateString('tr-TR')}
            </Text>
            <Text style={styles.statLabel}>Son Analiz</Text>
          </ProfessionalCard>
        </View>
      </Animated.View>

      {/* Features Grid */}
      <Animated.View 
        style={[
          styles.featuresContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.sectionTitle}>Özellikler</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleFeaturePress(feature.screen)}
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureCardContent}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={feature.icon as any} size={28} color={Theme.colors.text.inverse} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.inverse} style={styles.featureChevron} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Scientific Info */}
      <Animated.View 
        style={[
          styles.scienceContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.scienceCard}>
          <LinearGradient
            colors={[Theme.colors.secondary[800], Theme.colors.secondary[600], Theme.colors.secondary[500]]}
            style={styles.scienceCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.scienceTitle}>Bilimsel DNA Analizi</Text>
            <View style={styles.scienceInfo}>
              <View style={styles.scienceTextContainer}>
                <Text style={styles.scienceSubtitle}>Bilimsel DNA Analizi</Text>
                <Text style={styles.scienceDescription}>
                  1247 genetik varyant analizi • ClinVar, dbSNP, OMIM veritabanları • 
                  Poligenik risk skorları %99 güvenilirlik
                </Text>
              </View>
              <View style={styles.scienceTextContainer}>
                <Text style={styles.scienceSubtitle}>QWEN AI Kişiselleştirme</Text>
                <Text style={styles.scienceDescription}>
                  Gelişmiş yapay zeka • Kişiselleştirilmiş öneriler • 
                  Gerçek zamanlı analiz ve güncellemeler
                </Text>
              </View>
              <View style={styles.scienceTextContainer}>
                <Text style={styles.scienceSubtitle}>Hibrit Sistem</Text>
                <Text style={styles.scienceDescription}>
                  Bilimsel doğruluk + AI yorumu • En yüksek kalite • 
                  Sürekli öğrenen algoritma
                </Text>
              </View>
            </View>
            <Text style={styles.scienceFooterText}>
              GenoHealth - DNA analizinde yeni nesil teknoloji
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Security Info */}
      <Animated.View 
        style={[
          styles.securityContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ProfessionalCard
          variant="elevated"
          size="md"
          style={styles.securityCard}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={Theme.colors.primary[600]} />
            <Text style={styles.cardTitle}>Gizlilik ve Güvenlik</Text>
          </View>
          <Text style={styles.securityText}>
            DNA verileriniz cihazınızda kalır, asla sunucuya gönderilmez.
          </Text>
        </ProfessionalCard>
      </Animated.View>
      </ScrollView>

      {/* Premium Overlay */}
      <PremiumOverlay
        visible={showPremiumOverlay}
        onClose={() => setShowPremiumOverlay(false)}
        onSubscribe={() => {
          setShowPremiumOverlay(false);
          navigation.navigate('Premium');
        }}
        feature={premiumFeature}
        title="Premium Özellik"
        description="Bu özelliği kullanmak için premium üyelik gereklidir."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  professionalHeader: {
    marginBottom: Theme.spacing.md,
  },
  headerGradient: {
    padding: Theme.spacing['2xl'],
    paddingTop: Theme.spacing['3xl'],
    borderBottomLeftRadius: Theme.borderRadius['3xl'],
    borderBottomRightRadius: Theme.borderRadius['3xl'],
  },
  brandInfo: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  dailyTipContainer: {
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  dailyTipCard: {
    // ProfessionalCard handles styling
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cardTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.xs,
  },
  dailyTipText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
    marginBottom: Theme.spacing.md,
  },
  dailyTipButton: {
    marginTop: Theme.spacing.sm,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.xs,
  },
  readMoreText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  statsContainer: {
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - Theme.spacing['2xl']) / 3,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'column',
    gap: Theme.spacing.sm,
  },
  featureCard: {
    width: '100%',
    marginBottom: 0,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  featureCardGradient: {
    padding: Theme.spacing.lg,
  },
  featureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginBottom: Theme.spacing.xs,
  },
  featureDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
  },
  featureChevron: {
    opacity: 0.7,
  },
  scienceContainer: {
    marginHorizontal: 0,
    marginBottom: Theme.spacing.sm,
  },
  scienceCard: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  scienceCardGradient: {
    padding: Theme.spacing.md,
  },
  scienceTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  scienceInfo: {
    width: '100%',
  },
  scienceTextContainer: {
    marginBottom: Theme.spacing.sm,
  },
  scienceSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
    marginBottom: Theme.spacing.xs,
  },
  scienceDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
  },
  scienceFooterText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  securityContainer: {
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  securityCard: {
    // ProfessionalCard handles styling
  },
  securityText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[600],
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
  },
});