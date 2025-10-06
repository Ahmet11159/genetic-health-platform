import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { AnimationService } from '../services/AnimationService';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

interface OnboardingPage {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  features: string[];
  color: string;
}

const onboardingPages: OnboardingPage[] = [
  {
    id: 1,
    title: 'DNA Analizi',
    subtitle: 'Bilimsel Temelli',
    description: '1247 genetik varyant analizi ile kişiselleştirilmiş sağlık önerileri alın',
    icon: 'dna',
    gradient: ['#667eea', '#764ba2'],
    features: [
      'ClinVar, dbSNP, OMIM veritabanları',
      'Poligenik risk skorları',
      '%99 güvenilirlik',
      'Bilimsel doğruluk'
    ],
    color: '#667eea'
  },
  {
    id: 2,
    title: 'AI Kişiselleştirme',
    subtitle: 'QWEN AI Teknolojisi',
    description: 'Gelişmiş yapay zeka ile genetik verilerinizi yorumlayın ve öneriler alın',
    icon: 'brain',
    gradient: ['#FF6B6B', '#FF8E8E'],
    features: [
      'QWEN AI entegrasyonu',
      'Kişiselleştirilmiş öneriler',
      'Genetik veri yorumlama',
      '%95 AI güveni'
    ],
    color: '#FF6B6B'
  },
  {
    id: 3,
    title: 'Sağlık Takibi',
    subtitle: 'Gerçek Zamanlı',
    description: 'Sağlık verilerinizi takip edin, trendleri analiz edin ve hedeflerinize ulaşın',
    icon: 'pulse',
    gradient: ['#4CAF50', '#66BB6A'],
    features: [
      'HealthKit & Google Fit entegrasyonu',
      'Gerçek zamanlı uyarılar',
      'Trend analizi',
      'Hedef takibi'
    ],
    color: '#4CAF50'
  },
  {
    id: 4,
    title: 'Aile Analizi',
    subtitle: 'Genetik Karşılaştırma',
    description: 'Aile üyelerinizle genetik profillerinizi karşılaştırın ve ortak özellikleri keşfedin',
    icon: 'people',
    gradient: ['#9C27B0', '#BA68C8'],
    features: [
      'Aile üyesi ekleme',
      'Genetik karşılaştırma',
      'Ortak varyantlar',
      'Aile önerileri'
    ],
    color: '#9C27B0'
  }
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // İlk sayfa animasyonu
    startPageAnimation();
    
    // Progress bar animasyonu
    Animated.timing(progressAnim, {
      toValue: (currentPage + 1) / onboardingPages.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentPage]);

  const startPageAnimation = () => {
    setIsAnimating(true);
    
    // Paralel animasyonlar
    Animated.parallel([
      AnimationService.fadeIn(fadeAnim, { duration: 600 }),
      AnimationService.slideInLeft(slideAnim, { duration: 800 }),
      AnimationService.scale(scaleAnim, 1, { duration: 600 }),
    ]).start(() => {
      setIsAnimating(false);
    });

    // İkon döndürme animasyonu
    AnimationService.rotate(iconRotateAnim, { duration: 2000 }).start();
  };

  const nextPage = () => {
    if (currentPage < onboardingPages.length - 1) {
      // Haptic feedback
      HapticFeedbackService.trigger('button_press');
      
      // Sayfa geçiş animasyonu
      Animated.sequence([
        AnimationService.fadeOut(fadeAnim, { duration: 200 }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPage(currentPage + 1);
        slideAnim.setValue(width);
        startPageAnimation();
      });
    } else {
      // Onboarding tamamlandı
      completeOnboarding();
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      // Haptic feedback
      HapticFeedbackService.trigger('button_press');
      
      // Sayfa geçiş animasyonu
      Animated.sequence([
        AnimationService.fadeOut(fadeAnim, { duration: 200 }),
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPage(currentPage - 1);
        slideAnim.setValue(-width);
        startPageAnimation();
      });
    }
  };

  const skipOnboarding = () => {
    HapticFeedbackService.trigger('button_press');
    completeOnboarding();
  };

  const completeOnboarding = () => {
    HapticFeedbackService.trigger('success');
    
    // Tamamlama animasyonu
    Animated.parallel([
      AnimationService.scale(scaleAnim, 1.1, { duration: 200 }),
      AnimationService.fadeOut(fadeAnim, { duration: 300 }),
    ]).start(() => {
      navigation.navigate('Home');
    });
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex !== currentPage) {
      HapticFeedbackService.trigger('selection');
      setCurrentPage(pageIndex);
    }
  };

  const renderPage = (page: OnboardingPage, index: number) => {
    const isActive = index === currentPage;
    
    return (
      <Animated.View
        key={page.id}
        style={[
          styles.pageContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={page.gradient}
          style={styles.pageGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* İkon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: iconRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}
                ]
              }
            ]}
          >
            <Ionicons name={page.icon as any} size={80} color="#fff" />
          </Animated.View>

          {/* Başlık */}
          <Text style={styles.pageTitle}>{page.title}</Text>
          <Text style={styles.pageSubtitle}>{page.subtitle}</Text>
          
          {/* Açıklama */}
          <Text style={styles.pageDescription}>{page.description}</Text>

          {/* Özellikler */}
          <View style={styles.featuresContainer}>
            {page.features.map((feature, featureIndex) => (
              <Animated.View
                key={featureIndex}
                style={[
                  styles.featureItem,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim }
                    ]
                  }
                ]}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      {onboardingPages.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.progressDot,
            index === currentPage && styles.progressDotActive
          ]}
          onPress={() => goToPage(index)}
        />
      ))}
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {/* Geri Butonu */}
      {currentPage > 0 && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={previousPage}
          disabled={isAnimating}
        >
          <Ionicons name="chevron-back" size={24} color="#667eea" />
          <Text style={styles.navButtonText}>Geri</Text>
        </TouchableOpacity>
      )}

      {/* Boşluk */}
      <View style={{ flex: 1 }} />

      {/* Atla Butonu */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipOnboarding}
        disabled={isAnimating}
      >
        <Text style={styles.skipButtonText}>Atla</Text>
      </TouchableOpacity>

      {/* İleri Butonu */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: onboardingPages[currentPage]?.color || '#667eea' }
        ]}
        onPress={nextPage}
        disabled={isAnimating}
      >
        <Text style={styles.nextButtonText}>
          {currentPage === onboardingPages.length - 1 ? 'Başla' : 'İleri'}
        </Text>
        <Ionicons 
          name={currentPage === onboardingPages.length - 1 ? "checkmark" : "chevron-forward"} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Sayfa İçeriği */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {renderPage(onboardingPages[currentPage], currentPage)}
      </ScrollView>

      {/* Progress Dots */}
      {renderProgressDots()}

      {/* Navigation Buttons */}
      {renderNavigationButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  pageDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});