import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { useHapticFeedback } from './useHapticFeedback';

export const useMicroInteractions = () => {
  const { triggerLight, triggerSelection, triggerSuccess } = useHapticFeedback();

  // Button press animation
  const createButtonPressAnimation = useCallback(() => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const pressIn = () => {
      triggerLight();
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const pressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    return { scaleAnim, pressIn, pressOut };
  }, [triggerLight]);

  // Card hover animation
  const createCardHoverAnimation = useCallback(() => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(0)).current;

    const hoverIn = () => {
      triggerSelection();
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        })
      ]).start();
    };

    const hoverOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        })
      ]).start();
    };

    return { scaleAnim, shadowAnim, hoverIn, hoverOut };
  }, [triggerSelection]);

  // Success animation
  const createSuccessAnimation = useCallback(() => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const triggerSuccess = () => {
      triggerSuccess();
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      ]).start();
    };

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return { scaleAnim, rotateInterpolate, triggerSuccess };
  }, [triggerSuccess]);

  // Loading animation
  const createLoadingAnimation = useCallback(() => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startLoading = () => {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      rotateAnimation.start();
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    };

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return { rotateInterpolate, pulseAnim, startLoading };
  }, []);

  // Progress animation
  const createProgressAnimation = useCallback((progress: number) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    const animateProgress = () => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    return { progressAnim, animateProgress };
  }, []);

  // Fade in animation
  const createFadeInAnimation = useCallback(() => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const fadeIn = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    };

    return { fadeAnim, slideAnim, fadeIn };
  }, []);

  // Bounce animation
  const createBounceAnimation = useCallback(() => {
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    };

    const bounceInterpolate = bounceAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    return { bounceInterpolate, bounce };
  }, []);

  return {
    createButtonPressAnimation,
    createCardHoverAnimation,
    createSuccessAnimation,
    createLoadingAnimation,
    createProgressAnimation,
    createFadeInAnimation,
    createBounceAnimation,
  };
};


