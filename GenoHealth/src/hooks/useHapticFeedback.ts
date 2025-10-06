import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';

export const useHapticFeedback = () => {
  const triggerSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const triggerWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const triggerLight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerMedium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerHeavy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const triggerSelection = () => {
    Haptics.selectionAsync();
  };

  return {
    triggerSuccess,
    triggerError,
    triggerWarning,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSelection,
  };
};


