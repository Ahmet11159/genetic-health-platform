/**
 * Navigation Tracking Hook
 * Ekran değişikliklerini takip eder ve RealTimeAppIntegration'a bildirir
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RealTimeAppIntegration } from '../services/RealTimeAppIntegration';

export const useNavigationTracking = () => {
  const navigation = useNavigation();
  const realTimeIntegration = RealTimeAppIntegration.getInstance();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      // Navigation state değişikliğini yakala
      try {
        // getCurrentRoute yerine state'den route name'i al
        const currentRouteName = e.data?.state?.routes?.[e.data.state.index]?.name;
        if (currentRouteName) {
          realTimeIntegration.setCurrentScreen(currentRouteName);
        }
      } catch (error) {
        console.log('Navigation tracking error:', error);
      }
    });

    return unsubscribe;
  }, [navigation, realTimeIntegration]);
};
