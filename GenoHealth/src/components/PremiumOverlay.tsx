import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import Theme from '../constants/Theme';
import ProfessionalButton from './ProfessionalButton';

interface PremiumOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  feature?: string;
  title?: string;
  description?: string;
}

const { width, height } = Dimensions.get('window');

export default function PremiumOverlay({
  visible,
  onClose,
  onSubscribe,
  feature = 'Bu özellik',
  title = 'Premium Özellik',
  description = 'Bu özelliği kullanmak için premium üyelik gereklidir.',
}: PremiumOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      startAnimations();
    } else {
      resetAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
            <LinearGradient
              colors={[Theme.colors.primary[500], Theme.colors.primary[600], Theme.colors.primary[700]]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.iconContainer}>
                <Ionicons name="diamond" size={48} color="#fff" />
                <View style={styles.iconGlow} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{feature} için Premium Gerekli</Text>
              
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.badgeText}>En Popüler</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.content}>
              <Text style={styles.description}>{description}</Text>
              
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Premium ile neler kazanırsınız:</Text>
                
                {[
                  'Kapsamlı DNA Analizi',
                  'Kişiselleştirilmiş Beslenme Planları',
                  'Kişiselleştirilmiş Egzersiz Programları',
                  'Sağlık Takibi ve İzleme',
                  'Uyku Analizi ve Öneriler',
                  'Takviye Önerileri',
                  'İlaç Etkileşimleri Analizi',
                  'PDF Rapor Dışa Aktarma',
                ].map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={Theme.colors.primary[500]} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingSection}>
                <Text style={styles.pricingSectionTitle}>Abonelik Planları</Text>
                <Text style={styles.pricingSectionSubtitle}>Size en uygun planı seçin</Text>
                
                <View style={styles.pricingContainer}>
                  <View style={styles.pricingCard}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingTitle}>Aylık</Text>
                      <Ionicons name="calendar" size={20} color={Theme.colors.primary[600]} />
                    </View>
                    <Text style={styles.pricingPrice}>29 TL</Text>
                    <Text style={styles.pricingPeriod}>/ay</Text>
                    <View style={styles.pricingFeatures}>
                      <Text style={styles.pricingFeatureText}>• Tüm özellikler</Text>
                      <Text style={styles.pricingFeatureText}>• Aylık ödeme</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.pricingCard, styles.recommendedCard]}>
                    <View style={styles.recommendedBadge}>
                      <Ionicons name="star" size={12} color="#fff" />
                      <Text style={styles.recommendedText}>Önerilen</Text>
                    </View>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingTitle}>Yıllık</Text>
                      <Ionicons name="trophy" size={20} color={Theme.colors.primary[600]} />
                    </View>
                    <Text style={styles.pricingPrice}>299 TL</Text>
                    <Text style={styles.pricingPeriod}>/yıl</Text>
                    <Text style={styles.pricingDiscount}>2 ay ücretsiz!</Text>
                    <View style={styles.pricingFeatures}>
                      <Text style={styles.pricingFeatureText}>• Tüm özellikler</Text>
                      <Text style={styles.pricingFeatureText}>• 3 aile üyesi</Text>
                      <Text style={styles.pricingFeatureText}>• Öncelikli destek</Text>
                    </View>
                  </View>
                  
                  <View style={styles.pricingCard}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingTitle}>Aile</Text>
                      <Ionicons name="people" size={20} color={Theme.colors.primary[600]} />
                    </View>
                    <Text style={styles.pricingPrice}>49 TL</Text>
                    <Text style={styles.pricingPeriod}>/ay</Text>
                    <Text style={styles.pricingNote}>5 kişiye kadar</Text>
                    <View style={styles.pricingFeatures}>
                      <Text style={styles.pricingFeatureText}>• Tüm özellikler</Text>
                      <Text style={styles.pricingFeatureText}>• 5 aile üyesi</Text>
                      <Text style={styles.pricingFeatureText}>• Aile karşılaştırması</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <ProfessionalButton
                title="Premium'a Geç"
                onPress={onSubscribe}
                variant="gradient"
                gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
                style={styles.subscribeButton}
                textStyle={styles.subscribeButtonText}
                icon="diamond"
                iconPosition="left"
              />
              
              <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Şimdi Değil</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    padding: Theme.spacing.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  badgeContainer: {
    marginTop: Theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: {
    color: '#fff',
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    marginLeft: Theme.spacing.xs,
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: Theme.spacing.xl,
  },
  description: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
    marginBottom: Theme.spacing.xl,
  },
  featuresContainer: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  featureText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.md,
    flex: 1,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  pricingSection: {
    marginBottom: Theme.spacing.xl,
  },
  pricingSectionTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  pricingSectionSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    minHeight: 200,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  pricingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  pricingFeatures: {
    marginTop: Theme.spacing.md,
    width: '100%',
  },
  pricingFeatureText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'left',
  },
  recommendedCard: {
    borderColor: Theme.colors.primary[500],
    borderWidth: 2,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Theme.colors.primary[500],
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recommendedText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    marginLeft: Theme.spacing.xs,
  },
  pricingTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  pricingPrice: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
    marginBottom: Theme.spacing.xs,
  },
  pricingPeriod: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  pricingDiscount: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.semantic.success,
    fontWeight: Theme.typography.fontWeight.bold,
    backgroundColor: Theme.colors.semantic.success + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  pricingNote: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingTop: 0,
  },
  subscribeButton: {
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    minHeight: 56,
  },
  subscribeButtonText: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Theme.spacing.sm,
  },
  cancelText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },
});
