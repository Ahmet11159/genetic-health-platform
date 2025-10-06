import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'premium' | 'pro';
  subscriptionExpiry?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: 'tr' | 'en';
    units: 'metric' | 'imperial';
  };
  healthProfile: {
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    healthGoals: string[];
    medicalConditions: string[];
    medications: string[];
  };
  dnaData: {
    hasData: boolean;
    analysisId?: string;
    uploadDate?: string;
    lastAnalysis?: string;
    fileSize?: number;
    variantCount?: number;
  };
  usage: {
    dnaAnalyses: number;
    reportsGenerated: number;
    familyMembers: number;
    healthTipsRead: number;
    exercisesCompleted: number;
    lastActive: string;
  };
}

export interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  hasDNAData: boolean;
  isSubscribed: boolean;
  subscriptionInfo: any;
  currentAnalysis: any;
  familyMembers: any[];
  achievements: any[];
  notifications: any[];
  offlineMode: boolean;
  lastSync: string | null;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOGGED_IN'; payload: boolean }
  | { type: 'SET_DNA_DATA'; payload: boolean }
  | { type: 'SET_SUBSCRIPTION'; payload: { isSubscribed: boolean; info: any } }
  | { type: 'SET_ANALYSIS'; payload: any }
  | { type: 'SET_FAMILY_MEMBERS'; payload: any[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: any[] }
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'SET_OFFLINE_MODE'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_USAGE'; payload: Partial<User['usage']> }
  | { type: 'RESET_APP' };

// Initial state
const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  hasDNAData: false,
  isSubscribed: false,
  subscriptionInfo: null,
  currentAnalysis: null,
  familyMembers: [],
  achievements: [],
  notifications: [],
  offlineMode: false,
  lastSync: null,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_LOGGED_IN':
      return { ...state, isLoggedIn: action.payload };
    
    case 'SET_DNA_DATA':
      return { ...state, hasDNAData: action.payload };
    
    case 'SET_SUBSCRIPTION':
      return { 
        ...state, 
        isSubscribed: action.payload.isSubscribed,
        subscriptionInfo: action.payload.info 
      };
    
    case 'SET_ANALYSIS':
      return { ...state, currentAnalysis: action.payload };
    
    case 'SET_FAMILY_MEMBERS':
      return { ...state, familyMembers: action.payload };
    
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'SET_OFFLINE_MODE':
      return { ...state, offlineMode: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
    
    case 'UPDATE_USAGE':
      return { 
        ...state, 
        user: state.user ? { 
          ...state.user, 
          usage: { ...state.user.usage, ...action.payload } 
        } : null 
      };
    
    case 'RESET_APP':
      return initialState;
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    login: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    updateUsage: (updates: Partial<User['usage']>) => Promise<void>;
    setDNAData: (hasData: boolean, analysisData?: any) => Promise<void>;
    setSubscription: (isSubscribed: boolean, info?: any) => Promise<void>;
    setAnalysis: (analysis: any) => Promise<void>;
    addFamilyMember: (member: any) => Promise<void>;
    removeFamilyMember: (id: string) => Promise<void>;
    addAchievement: (achievement: any) => Promise<void>;
    addNotification: (notification: any) => Promise<void>;
    clearError: () => void;
    resetApp: () => Promise<void>;
  };
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load user data
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_LOGGED_IN', payload: true });
      }
      
      // Load DNA data status
      const hasDNAData = await AsyncStorage.getItem('hasDNAData');
      dispatch({ type: 'SET_DNA_DATA', payload: hasDNAData === 'true' });
      
      // Load subscription status
      const isSubscribed = await AsyncStorage.getItem('isSubscribed');
      const subscriptionInfo = await AsyncStorage.getItem('subscriptionInfo');
      dispatch({ 
        type: 'SET_SUBSCRIPTION', 
        payload: { 
          isSubscribed: isSubscribed === 'true',
          info: subscriptionInfo ? JSON.parse(subscriptionInfo) : null
        }
      });
      
      // Load analysis data
      const analysisData = await AsyncStorage.getItem('analysisData');
      if (analysisData) {
        dispatch({ type: 'SET_ANALYSIS', payload: JSON.parse(analysisData) });
      }
      
      // Load family members
      const familyData = await AsyncStorage.getItem('familyMembers');
      if (familyData) {
        dispatch({ type: 'SET_FAMILY_MEMBERS', payload: JSON.parse(familyData) });
      }
      
      // Load achievements
      const achievementsData = await AsyncStorage.getItem('achievements');
      if (achievementsData) {
        dispatch({ type: 'SET_ACHIEVEMENTS', payload: JSON.parse(achievementsData) });
      }
      
      // Load notifications
      const notificationsData = await AsyncStorage.getItem('notifications');
      if (notificationsData) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: JSON.parse(notificationsData) });
      }
      
      // Set last sync
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date().toISOString() });
      
    } catch (error) {
      console.error('App initialization error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Uygulama başlatılırken bir hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actions
  const actions = {
    login: async (user: User) => {
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_LOGGED_IN', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Login error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Giriş yapılırken bir hata oluştu' });
      }
    },

    logout: async () => {
      try {
        await AsyncStorage.multiRemove([
          'userData',
          'isLoggedIn',
          'hasDNAData',
          'analysisData',
          'subscriptionInfo',
          'isSubscribed',
          'familyMembers',
          'achievements',
          'notifications'
        ]);
        dispatch({ type: 'RESET_APP' });
      } catch (error) {
        console.error('Logout error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Çıkış yapılırken bir hata oluştu' });
      }
    },

    updateUser: async (updates: Partial<User>) => {
      try {
        if (state.user) {
          const updatedUser = { ...state.user, ...updates };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          dispatch({ type: 'UPDATE_USER', payload: updates });
        }
      } catch (error) {
        console.error('Update user error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Kullanıcı bilgileri güncellenirken bir hata oluştu' });
      }
    },

    updateUsage: async (updates: Partial<User['usage']>) => {
      try {
        if (state.user) {
          const updatedUsage = { ...state.user.usage, ...updates };
          const updatedUser = { ...state.user, usage: updatedUsage };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          dispatch({ type: 'UPDATE_USAGE', payload: updates });
        }
      } catch (error) {
        console.error('Update usage error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Kullanım bilgileri güncellenirken bir hata oluştu' });
      }
    },

    setDNAData: async (hasData: boolean, analysisData?: any) => {
      try {
        await AsyncStorage.setItem('hasDNAData', hasData.toString());
        dispatch({ type: 'SET_DNA_DATA', payload: hasData });
        
        if (analysisData) {
          await AsyncStorage.setItem('analysisData', JSON.stringify(analysisData));
          dispatch({ type: 'SET_ANALYSIS', payload: analysisData });
        }
      } catch (error) {
        console.error('Set DNA data error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'DNA verisi kaydedilirken bir hata oluştu' });
      }
    },

    setSubscription: async (isSubscribed: boolean, info?: any) => {
      try {
        await AsyncStorage.setItem('isSubscribed', isSubscribed.toString());
        if (info) {
          await AsyncStorage.setItem('subscriptionInfo', JSON.stringify(info));
        }
        dispatch({ type: 'SET_SUBSCRIPTION', payload: { isSubscribed, info } });
      } catch (error) {
        console.error('Set subscription error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Abonelik bilgileri kaydedilirken bir hata oluştu' });
      }
    },

    setAnalysis: async (analysis: any) => {
      try {
        await AsyncStorage.setItem('analysisData', JSON.stringify(analysis));
        dispatch({ type: 'SET_ANALYSIS', payload: analysis });
      } catch (error) {
        console.error('Set analysis error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Analiz verisi kaydedilirken bir hata oluştu' });
      }
    },

    addFamilyMember: async (member: any) => {
      try {
        const updatedMembers = [...state.familyMembers, member];
        await AsyncStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
        dispatch({ type: 'SET_FAMILY_MEMBERS', payload: updatedMembers });
      } catch (error) {
        console.error('Add family member error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Aile üyesi eklenirken bir hata oluştu' });
      }
    },

    removeFamilyMember: async (id: string) => {
      try {
        const updatedMembers = state.familyMembers.filter(member => member.id !== id);
        await AsyncStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
        dispatch({ type: 'SET_FAMILY_MEMBERS', payload: updatedMembers });
      } catch (error) {
        console.error('Remove family member error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Aile üyesi silinirken bir hata oluştu' });
      }
    },

    addAchievement: async (achievement: any) => {
      try {
        const updatedAchievements = [...state.achievements, achievement];
        await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
        dispatch({ type: 'SET_ACHIEVEMENTS', payload: updatedAchievements });
      } catch (error) {
        console.error('Add achievement error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Başarı eklenirken bir hata oluştu' });
      }
    },

    addNotification: async (notification: any) => {
      try {
        const updatedNotifications = [...state.notifications, notification];
        await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
      } catch (error) {
        console.error('Add notification error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Bildirim eklenirken bir hata oluştu' });
      }
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },

    resetApp: async () => {
      try {
        await AsyncStorage.clear();
        dispatch({ type: 'RESET_APP' });
      } catch (error) {
        console.error('Reset app error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Uygulama sıfırlanırken bir hata oluştu' });
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

