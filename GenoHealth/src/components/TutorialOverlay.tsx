import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TutorialService, TutorialStep } from '../services/TutorialService';
import { HapticFeedbackService } from '../services/HapticFeedbackService';
import { AnimationService } from '../services/AnimationService';

const { width, height } = Dimensions.get('window');

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  step: TutorialStep | null;
  stepIndex: number;
  totalSteps: number;
}

export default function TutorialOverlay({
  visible,
  onClose,
  onNext,
  onPrevious,
  onSkip,
  step,
  stepIndex,
  totalSteps,
}: TutorialOverlayProps) {
  const [overlayStyle, setOverlayStyle] = useState<any>({});
  const [tooltipStyle, setTooltipStyle] = useState<any>({});
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && step) {
      startAnimation();
      calculatePositions();
    }
  }, [visible, step]);

  const startAnimation = () => {
    // Fade in animasyonu
    Animated.parallel([
      AnimationService.fadeIn(fadeAnim, { duration: 300 }),
      AnimationService.scale(scaleAnim, 1, { duration: 400 }),
      AnimationService.slideInBottom(slideAnim, { duration: 500 }),
    ]).start();

    // Pulse animasyonu
    AnimationService.pulse(pulseAnim, { duration: 2000 }).start();
  };

  const calculatePositions = () => {
    if (!step) return;

    // Mock pozisyon hesaplama - gerçek uygulamada element pozisyonu alınır
    const mockPositions = {
      top: { top: 100, left: width / 2 - 150 },
      bottom: { bottom: 200, left: width / 2 - 150 },
      left: { top: height / 2 - 100, left: 50 },
      right: { top: height / 2 - 100, right: 50 },
      center: { top: height / 2 - 100, left: width / 2 - 150 },
    };

    setTooltipStyle(mockPositions[step.position] || mockPositions.center);
  };

  const handleNext = () => {
    HapticFeedbackService.trigger('button_press');
    onNext();
  };

  const handlePrevious = () => {
    HapticFeedbackService.trigger('button_press');
    onPrevious();
  };

  const handleSkip = () => {
    HapticFeedbackService.trigger('button_press');
    onSkip();
  };

  const handleClose = () => {
    HapticFeedbackService.trigger('button_press');
    onClose();
  };

  if (!visible || !step) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.8)" barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Highlight Area */}
        {step.highlight && (
          <Animated.View
            style={[
              styles.highlightArea,
              {
                transform: [
                  { scale: pulseAnim }
                ]
              }
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            tooltipStyle,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.tooltipGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Arrow */}
            {step.arrow && (
              <View
                style={[
                  styles.arrow,
                  styles[`arrow${step.position.charAt(0).toUpperCase() + step.position.slice(1)}` as keyof typeof styles]
                ]}
              />
            )}

            {/* Header */}
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>{step.title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.tooltipDescription}>{step.description}</Text>

            {/* Action Hint */}
            {step.action && step.action !== 'none' && (
              <View style={styles.actionHint}>
                <Ionicons 
                  name={
                    step.action === 'tap' ? 'hand' :
                    step.action === 'swipe' ? 'swap-horizontal' :
                    step.action === 'longPress' ? 'timer' : 'hand'
                  } 
                  size={16} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
                <Text style={styles.actionHintText}>
                  {step.action === 'tap' ? 'Dokunun' :
                   step.action === 'swipe' ? 'Kaydırın' :
                   step.action === 'longPress' ? 'Uzun basın' : 'Etkileşim kurun'}
                </Text>
              </View>
            )}

            {/* Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {stepIndex + 1} / {totalSteps}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${((stepIndex + 1) / totalSteps) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              {/* Previous Button */}
              {stepIndex > 0 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={20} color="#667eea" />
                  <Text style={styles.navButtonText}>Geri</Text>
                </TouchableOpacity>
              )}

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* Skip Button */}
              {step.skipable !== false && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipButtonText}>Atla</Text>
                </TouchableOpacity>
              )}

              {/* Next Button */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {stepIndex === totalSteps - 1 ? 'Tamamla' : 'İleri'}
                </Text>
                <Ionicons 
                  name={stepIndex === totalSteps - 1 ? "checkmark" : "chevron-forward"} 
                  size={16} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightArea: {
    position: 'absolute',
    width: 200,
    height: 100,
    backgroundColor: 'rgba(103, 126, 234, 0.3)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  tooltip: {
    position: 'absolute',
    width: 300,
    minHeight: 200,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  tooltipGradient: {
    padding: 20,
    borderRadius: 16,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  arrowTop: {
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#764ba2',
  },
  arrowBottom: {
    top: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#764ba2',
  },
  arrowLeft: {
    right: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#764ba2',
  },
  arrowRight: {
    left: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#764ba2',
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tooltipDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  actionHintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
});


