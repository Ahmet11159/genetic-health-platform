import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  isVerified: boolean;
  subscription: 'free' | 'premium' | 'pro';
}

export default function LoginScreen({ navigation }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    startAnimations();
    checkExistingUser();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkExistingUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.rememberMe) {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('User check error:', error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir email adresi girin');
      return;
    }

    setIsLoading(true);

    try {
      // Simüle edilmiş giriş işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userData: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: true,
        subscription: 'free',
      };

      await AsyncStorage.setItem('userData', JSON.stringify({
        ...userData,
        rememberMe,
      }));

      await AsyncStorage.setItem('isLoggedIn', 'true');

      Alert.alert('Başarılı', 'Giriş yapıldı!', [
        {
          text: 'Tamam',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir email adresi girin');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);

    try {
      // Simüle edilmiş kayıt işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: false,
        subscription: 'free',
      };

      await AsyncStorage.setItem('userData', JSON.stringify({
        ...userData,
        rememberMe,
      }));

      await AsyncStorage.setItem('isLoggedIn', 'true');

      Alert.alert('Başarılı', 'Hesap oluşturuldu!', [
        {
          text: 'Tamam',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Hesap oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Şifre Sıfırlama',
      'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
      [{ text: 'Tamam' }]
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[Theme.colors.primary[500], Theme.colors.primary[700]]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="analytics" size={40} color="white" />
            <Text style={styles.logoText}>GenoHealth</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View 
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.formCard}>
        <View style={styles.formContent}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Theme.colors.neutral[500]} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Adınızı ve soyadınızı girin"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Theme.colors.neutral[500]} />
              <TextInput
                style={styles.textInput}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.neutral[500]} />
              <TextInput
                style={styles.textInput}
                placeholder="Şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={Theme.colors.neutral[500]} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre Tekrar</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.neutral[500]} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>
          )}

          {isLogin && (
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.rememberMeText}>Beni hatırla</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            </View>
          )}

          <ProfessionalButton
            title={isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
            variant="gradient"
            gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
            icon={isLogin ? "log-in" : "person-add"}
            iconPosition="left"
            onPress={isLogin ? handleLogin : handleRegister}
            loading={isLoading}
            style={styles.submitButton}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchButton}>
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderFeatures = () => (
    <Animated.View 
      style={[
        styles.featuresContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.featuresTitle}>Neden GenoHealth?</Text>
      <View style={styles.featuresGrid}>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={24} color={Theme.colors.primary[500]} />
          <Text style={styles.featureText}>Güvenli</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="analytics" size={24} color={Theme.colors.primary[500]} />
          <Text style={styles.featureText}>Bilimsel</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="person" size={24} color={Theme.colors.primary[500]} />
          <Text style={styles.featureText}>Kişisel</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={24} color={Theme.colors.primary[500]} />
          <Text style={styles.featureText}>Gelişmiş</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderHeader()}
        {renderForm()}
        {renderFeatures()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  headerGradient: {
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  logoText: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: '700' as const,
    color: 'white',
    marginLeft: Theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  formCard: {
    padding: Theme.spacing.xl,
  },
  formContent: {
    gap: Theme.spacing.lg,
  },
  inputGroup: {
    gap: Theme.spacing.sm,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: '500' as const,
    color: Theme.colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  textInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  eyeButton: {
    padding: Theme.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  rememberMeText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  forgotPasswordText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontWeight: '500' as const,
  },
  submitButton: {
    marginTop: Theme.spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  switchText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginRight: Theme.spacing.sm,
  },
  switchButton: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontWeight: '600' as const,
  },
  featuresContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing['4xl'],
  },
  featuresTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: '600' as const,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    minWidth: (width - Theme.spacing['2xl']) / 4,
  },
  featureText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
});
