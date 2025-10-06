// Kullanıcı kimlik doğrulama servisi
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  isVerified: boolean;
  subscription: 'free' | 'premium' | 'pro';
  preferences?: UserPreferences;
  healthProfile?: HealthProfile;
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  voiceGuidance: boolean;
  animations: boolean;
  language: 'tr' | 'en';
  units: 'metric' | 'imperial';
}

export interface HealthProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bloodType?: string;
  allergies: string[];
  medications: string[];
  healthConditions: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export class AuthService {
  private static currentUser: User | null = null;
  private static isInitialized = false;

  /**
   * Auth servisini başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Mevcut kullanıcıyı yükle
      await this.loadCurrentUser();
      
      this.isInitialized = true;
      console.log('Auth Service initialized!');
      return true;
    } catch (error) {
      console.error('Auth service initialization error:', error);
      return false;
    }
  }

  /**
   * Mevcut kullanıcıyı yükler
   */
  private static async loadCurrentUser(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      
      if (userData && isLoggedIn === 'true') {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Load current user error:', error);
    }
  }

  /**
   * Kullanıcı girişi yapar
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Simüle edilmiş giriş işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Email validasyonu
      if (!this.validateEmail(credentials.email)) {
        return {
          success: false,
          message: 'Geçerli bir email adresi girin',
        };
      }

      // Şifre validasyonu
      if (!this.validatePassword(credentials.password)) {
        return {
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır',
        };
      }

      // Kullanıcı oluştur (gerçek uygulamada API'den gelecek)
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: true,
        subscription: 'free',
        preferences: {
          notifications: true,
          darkMode: false,
          hapticFeedback: true,
          voiceGuidance: true,
          animations: true,
          language: 'tr',
          units: 'metric',
        },
        healthProfile: {
          age: 25,
          gender: 'other',
          height: 170,
          weight: 70,
          allergies: [],
          medications: [],
          healthConditions: [],
          fitnessLevel: 'beginner',
          goals: [],
        },
      };

      // Kullanıcıyı kaydet
      await this.saveUser(user, credentials.rememberMe);
      
      this.currentUser = user;

      return {
        success: true,
        user,
        token: this.generateToken(),
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Giriş yapılırken bir hata oluştu',
      };
    }
  }

  /**
   * Kullanıcı kaydı yapar
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Simüle edilmiş kayıt işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validasyonlar
      if (!this.validateEmail(data.email)) {
        return {
          success: false,
          message: 'Geçerli bir email adresi girin',
        };
      }

      if (!this.validatePassword(data.password)) {
        return {
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır',
        };
      }

      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: 'Şifreler eşleşmiyor',
        };
      }

      if (!data.name.trim()) {
        return {
          success: false,
          message: 'Ad soyad gereklidir',
        };
      }

      // Kullanıcı oluştur
      const user: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name.trim(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: false,
        subscription: 'free',
        preferences: {
          notifications: true,
          darkMode: false,
          hapticFeedback: true,
          voiceGuidance: true,
          animations: true,
          language: 'tr',
          units: 'metric',
        },
        healthProfile: {
          age: 25,
          gender: 'other',
          height: 170,
          weight: 70,
          allergies: [],
          medications: [],
          healthConditions: [],
          fitnessLevel: 'beginner',
          goals: [],
        },
      };

      // Kullanıcıyı kaydet
      await this.saveUser(user, false);
      
      this.currentUser = user;

      return {
        success: true,
        user,
        token: this.generateToken(),
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Hesap oluşturulurken bir hata oluştu',
      };
    }
  }

  /**
   * Kullanıcı çıkışı yapar
   */
  static async logout(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('authToken');
      
      this.currentUser = null;
      
      console.log('User logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Mevcut kullanıcıyı döndürür
   */
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Kullanıcı giriş yapmış mı kontrol eder
   */
  static isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Kullanıcı verilerini günceller
   */
  static async updateUser(updates: Partial<User>): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      const updatedUser = { ...this.currentUser, ...updates };
      
      await this.saveUser(updatedUser, true);
      this.currentUser = updatedUser;
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  /**
   * Kullanıcı tercihlerini günceller
   */
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      const updatedPreferences = {
        ...this.currentUser.preferences,
        ...preferences,
      };

      return await this.updateUser({ preferences: updatedPreferences });
    } catch (error) {
      console.error('Update preferences error:', error);
      return false;
    }
  }

  /**
   * Sağlık profilini günceller
   */
  static async updateHealthProfile(healthProfile: Partial<HealthProfile>): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      const updatedHealthProfile = {
        ...this.currentUser.healthProfile,
        ...healthProfile,
      };

      return await this.updateUser({ healthProfile: updatedHealthProfile });
    } catch (error) {
      console.error('Update health profile error:', error);
      return false;
    }
  }

  /**
   * Şifre sıfırlama talebi gönderir
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Simüle edilmiş şifre sıfırlama
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!this.validateEmail(email)) {
        return false;
      }

      // Gerçek uygulamada email gönderilecek
      console.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  /**
   * Email validasyonu
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Şifre validasyonu
   */
  private static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Kullanıcıyı kaydeder
   */
  private static async saveUser(user: User, rememberMe: boolean = false): Promise<void> {
    const userData = {
      ...user,
      rememberMe,
    };

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('authToken', this.generateToken());
  }

  /**
   * Token oluşturur
   */
  private static generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Kullanıcı aboneliğini kontrol eder
   */
  static hasSubscription(subscription: 'free' | 'premium' | 'pro'): boolean {
    if (!this.currentUser) return false;

    const subscriptionLevels = {
      free: 0,
      premium: 1,
      pro: 2,
    };

    return subscriptionLevels[this.currentUser.subscription] >= subscriptionLevels[subscription];
  }

  /**
   * Premium özellik erişimi kontrol eder
   */
  static hasPremiumAccess(): boolean {
    return this.hasSubscription('premium');
  }

  /**
   * Pro özellik erişimi kontrol eder
   */
  static hasProAccess(): boolean {
    return this.hasSubscription('pro');
  }
}
