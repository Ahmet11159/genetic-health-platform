import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context
import { AppProvider, useApp } from './src/contexts/AppContext';

// Components
import ErrorBoundary from './src/components/ErrorBoundary';
import AdvancedLoadingScreen from './src/components/AdvancedLoadingScreen';

// Advanced Services
import { AdvancedGeneticAlgorithm } from './src/services/AdvancedGeneticAlgorithm';
import { AdvancedMLService } from './src/services/AdvancedMLService';
import { AdvancedPerformanceService } from './src/services/AdvancedPerformanceService';
import { RealTimeAppIntegration } from './src/services/RealTimeAppIntegration';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DNAUploadScreen from './src/screens/DNAUploadScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import SleepScreen from './src/screens/SleepScreen';
import SupplementsScreen from './src/screens/SupplementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DailyTipsScreen from './src/screens/DailyTipsScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import DailyMealPlanScreen from './src/screens/DailyMealPlanScreen';
import AIPersonalizationScreen from './src/screens/AIPersonalizationScreen';
import HealthMonitoringScreen from './src/screens/HealthMonitoringScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import HealthDataSyncScreen from './src/screens/HealthDataSyncScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import PDFExportScreen from './src/screens/PDFExportScreen';
import FamilyComparisonScreen from './src/screens/FamilyComparisonScreen';
import AddFamilyMemberScreen from './src/screens/AddFamilyMemberScreen';
import AdvancedAnalyticsScreen from './src/screens/AdvancedAnalyticsScreen';
import OfflineStatusScreen from './src/screens/OfflineStatusScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import PaymentMethodScreen from './src/screens/PaymentMethodScreen';
import AdvancedPremiumScreen from './src/screens/AdvancedPremiumScreen';
import PremiumAnalyticsScreen from './src/screens/PremiumAnalyticsScreen';
import GenoAIAssistantScreen from './src/screens/GenoAIAssistantScreen';

// Types
import { DNAReport, AnalysisResult } from './src/types/DNA';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  DNAUpload: undefined;
  Analysis: { dnaData?: DNAReport; forceNewAnalysis?: boolean };
  Nutrition: { analysisData: AnalysisResult };
  Exercise: { analysisData: AnalysisResult };
  Sleep: { analysisData: AnalysisResult };
  Supplements: { analysisData: AnalysisResult };
  Profile: undefined;
  DailyTips: undefined;
  MealPlan: { analysisData: AnalysisResult };
  DailyMealPlan: { plan: any; progress: any };
  AIPersonalization: undefined;
  HealthMonitoring: undefined;
  GenoAIAssistant: undefined;
  Achievements: undefined;
  HealthDataSync: undefined;
  NotificationSettings: undefined;
  PDFExport: { analysisData: AnalysisResult };
  FamilyComparison: undefined;
  AddFamilyMember: undefined;
  AdvancedAnalytics: undefined;
  OfflineStatus: undefined;
  Onboarding: undefined;
  Premium: undefined;
  PaymentMethod: { 
    selectedPlan: {
      id: string;
      name: string;
      price: number;
      currency: string;
    };
  };
  AdvancedPremium: undefined;
  PremiumAnalytics: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Main App Component with Context
function AppContent() {
  const { state, actions } = useApp();
  const [servicesInitialized, setServicesInitialized] = useState(false);

  useEffect(() => {
    initializeAdvancedServices();
    
    // Real-time App Integration'ı başlat
    const realTimeIntegration = RealTimeAppIntegration.getInstance();
    realTimeIntegration.startMonitoring();
    
    return () => {
      realTimeIntegration.stopMonitoring();
    };
  }, []);

  const initializeAdvancedServices = async () => {
    try {
      console.log('Initializing advanced services...');
      
      // Genetik algoritma servisini başlat
      const geneticService = AdvancedGeneticAlgorithm.getInstance();
      await geneticService.initialize();
      
      // ML servisini başlat
      const mlService = AdvancedMLService.getInstance();
      await mlService.initialize();
      
      // Performans servisini başlat
      const performanceService = AdvancedPerformanceService.getInstance();
      await performanceService.initialize();
      
      // Performans izlemeyi başlat
      performanceService.startMonitoring();
      
      console.log('All advanced services initialized successfully!');
      setServicesInitialized(true);
    } catch (error) {
      console.error('Advanced services initialization error:', error);
      actions.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Servis Hatası',
        message: 'Bazı servisler başlatılamadı',
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (state.isLoading || !servicesInitialized) {
    return (
      <AdvancedLoadingScreen
        message="Uygulama başlatılıyor..."
        type="general"
      />
    );
  }

  if (state.error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2E7D32' }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>Hata: {state.error}</Text>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName={state.isLoggedIn ? "Home" : "Login"}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2E7D32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'GenoHealth' }}
          />
          <Stack.Screen 
            name="DNAUpload" 
            component={DNAUploadScreen} 
            options={{ title: 'DNA Yükle' }}
          />
          <Stack.Screen 
            name="Analysis" 
            component={AnalysisScreen} 
            options={{ title: 'DNA Analizi' }}
          />
          <Stack.Screen 
            name="Nutrition" 
            component={NutritionScreen} 
            options={{ title: 'Beslenme' }}
          />
          <Stack.Screen 
            name="Exercise" 
            component={ExerciseScreen} 
            options={{ title: 'Egzersiz' }}
          />
          <Stack.Screen 
            name="Sleep" 
            component={SleepScreen} 
            options={{ title: 'Uyku' }}
          />
          <Stack.Screen 
            name="Supplements" 
            component={SupplementsScreen} 
            options={{ title: 'Takviyeler' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Profil' }}
          />
          <Stack.Screen 
            name="DailyTips" 
            component={DailyTipsScreen} 
            options={{ title: 'Günlük İpuçları' }}
          />
          <Stack.Screen 
            name="MealPlan" 
            component={MealPlanScreen} 
            options={{ title: 'Beslenme Planları' }}
          />
        <Stack.Screen
          name="DailyMealPlan"
          component={DailyMealPlanScreen}
          options={{ title: 'Günlük Beslenme' }}
        />
        <Stack.Screen
          name="AIPersonalization"
          component={AIPersonalizationScreen}
          options={{ title: 'AI Kişiselleştirme' }}
        />
        <Stack.Screen
          name="HealthMonitoring"
          component={HealthMonitoringScreen}
          options={{ title: 'Sağlık Takibi' }}
        />
        <Stack.Screen
          name="GenoAIAssistant"
          component={GenoAIAssistantScreen}
                 options={{ title: 'Genora AI' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ title: 'Başarı Rozetleri' }}
        />
        <Stack.Screen
          name="HealthDataSync"
          component={HealthDataSyncScreen}
          options={{ title: 'Sağlık Veri Senkronizasyonu' }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ title: 'Bildirim Ayarları' }}
        />
        <Stack.Screen
          name="PDFExport"
          component={PDFExportScreen}
          options={{ title: 'PDF Rapor Oluştur' }}
        />
        <Stack.Screen
          name="FamilyComparison"
          component={FamilyComparisonScreen}
          options={{ title: 'Aile Genetik Karşılaştırması' }}
        />
        <Stack.Screen
          name="AddFamilyMember"
          component={AddFamilyMemberScreen}
          options={{ title: 'Aile Üyesi Ekle' }}
        />
        <Stack.Screen
          name="AdvancedAnalytics"
          component={AdvancedAnalyticsScreen}
          options={{ title: 'Gelişmiş Analitik' }}
        />
        <Stack.Screen
          name="OfflineStatus"
          component={OfflineStatusScreen}
          options={{ title: 'Offline Durumu' }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{ title: 'Premium Özellikler' }}
        />
        <Stack.Screen
          name="PaymentMethod"
          component={PaymentMethodScreen}
          options={{ title: 'Ödeme Yöntemi', headerShown: false }}
        />
        <Stack.Screen
          name="AdvancedPremium"
          component={AdvancedPremiumScreen}
          options={{ title: 'Premium Özellikler', headerShown: false }}
        />
        <Stack.Screen
          name="PremiumAnalytics"
          component={PremiumAnalyticsScreen}
          options={{ title: 'Premium Analitik', headerShown: false }}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Main App Component with Error Boundary
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}