import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { NotificationService, NotificationSettings, NotificationType } from '../services/NotificationService';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationSettings'>;

interface Props {
  navigation: NotificationSettingsScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadSettings();
    startAnimations();
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
        duration: 600,
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

  const loadSettings = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.initialize();
      
      const currentSettings = notificationService.getSettings();
      setSettings(currentSettings);
      setIsLoading(false);
    } catch (error) {
      console.error('Settings loading error:', error);
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);

    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Setting update error:', error);
    }
  };

  const updateNotificationType = async (type: NotificationType, enabled: boolean) => {
    if (!settings) return;

    const newTypes = { ...settings.types, [type]: enabled };
    const newSettings = { ...settings, types: newTypes };
    setSettings(newSettings);
    setHasChanges(true);

    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ types: newTypes });
    } catch (error) {
      console.error('Notification type update error:', error);
    }
  };

  const updateQuietHours = async (key: 'enabled' | 'start' | 'end', value: any) => {
    if (!settings) return;

    const newQuietHours = { ...settings.quietHours, [key]: value };
    const newSettings = { ...settings, quietHours: newQuietHours };
    setSettings(newSettings);
    setHasChanges(true);

    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ quietHours: newQuietHours });
    } catch (error) {
      console.error('Quiet hours update error:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setHasChanges(false);
      Alert.alert('Başarılı', 'Bildirim ayarları güncellendi!');
    } catch (error) {
      console.error('Save settings error:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  const handleTestNotification = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendDailyHealthTipNotification(
        'Bu bir test bildirimidir. Bildirim ayarlarınız doğru çalışıyor!'
      );
      Alert.alert('Test Bildirimi', 'Test bildirimi gönderildi!');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Hata', 'Test bildirimi gönderilemedi');
    }
  };

  const getNotificationTypeInfo = (type: NotificationType) => {
    const typeInfo = {
      dna_analysis_complete: {
        title: 'DNA Analiz Sonuçları',
        description: 'Analiz tamamlandığında bildirim alın',
        icon: 'analytics',
        color: '#4CAF50',
      },
      daily_health_tip: {
        title: 'Günlük Sağlık İpuçları',
        description: 'Kişiselleştirilmiş sağlık önerileri',
        icon: 'bulb',
        color: '#2196F3',
      },
      nutrition_reminder: {
        title: 'Beslenme Hatırlatmaları',
        description: 'Yemek zamanı ve beslenme önerileri',
        icon: 'restaurant',
        color: '#FF9800',
      },
      exercise_reminder: {
        title: 'Egzersiz Hatırlatmaları',
        description: 'Antrenman zamanı ve egzersiz önerileri',
        icon: 'fitness',
        color: '#E91E63',
      },
      sleep_reminder: {
        title: 'Uyku Hatırlatmaları',
        description: 'Yatma saati ve uyku önerileri',
        icon: 'moon',
        color: '#9C27B0',
      },
      supplement_reminder: {
        title: 'Takviye Hatırlatmaları',
        description: 'Vitamin ve takviye alma zamanları',
        icon: 'medical',
        color: '#00BCD4',
      },
      health_checkup: {
        title: 'Sağlık Kontrol Hatırlatmaları',
        description: 'Düzenli sağlık kontrolleri',
        icon: 'heart',
        color: '#F44336',
      },
      app_update: {
        title: 'Uygulama Güncellemeleri',
        description: 'Yeni özellikler ve güncellemeler',
        icon: 'refresh',
        color: '#607D8B',
      },
      premium_feature: {
        title: 'Premium Özellikler',
        description: 'Premium özellikler hakkında bilgiler',
        icon: 'star',
        color: '#FFD700',
      },
      family_analysis: {
        title: 'Aile Analizi',
        description: 'Aile üyeleri analiz sonuçları',
        icon: 'people',
        color: '#9C27B0',
      },
      weekly_report: {
        title: 'Haftalık Raporlar',
        description: 'Haftalık sağlık özet raporları',
        icon: 'bar-chart',
        color: '#4CAF50',
      },
      monthly_insights: {
        title: 'Aylık İçgörüler',
        description: 'Aylık sağlık trend analizleri',
        icon: 'trending-up',
        color: '#2196F3',
      },
    };

    return typeInfo[type] || {
      title: 'Bildirim',
      description: 'Genel bildirim',
      icon: 'notifications',
      color: '#757575',
    };
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
            <Text style={styles.headerSubtitle}>Kişiselleştirilmiş bildirimler</Text>
          </View>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderGeneralSettings = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={Theme.colors.primary[500]} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Bildirimleri Etkinleştir</Text>
              <Text style={styles.settingDescription}>Tüm bildirimleri aç/kapat</Text>
            </View>
          </View>
          <Switch
            value={settings?.enabled || false}
            onValueChange={(value) => updateSetting('enabled', value)}
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
            thumbColor={settings?.enabled ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={24} color={Theme.colors.primary[500]} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Ses</Text>
              <Text style={styles.settingDescription}>Bildirim seslerini aç/kapat</Text>
            </View>
          </View>
          <Switch
            value={settings?.sound || false}
            onValueChange={(value) => updateSetting('sound', value)}
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
            thumbColor={settings?.sound ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={24} color={Theme.colors.primary[500]} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Titreşim</Text>
              <Text style={styles.settingDescription}>Bildirim titreşimlerini aç/kapat</Text>
            </View>
          </View>
          <Switch
            value={settings?.vibration || false}
            onValueChange={(value) => updateSetting('vibration', value)}
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
            thumbColor={settings?.vibration ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="ellipse" size={24} color={Theme.colors.primary[500]} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Rozet</Text>
              <Text style={styles.settingDescription}>Uygulama ikonunda rozet göster</Text>
            </View>
          </View>
          <Switch
            value={settings?.badge || false}
            onValueChange={(value) => updateSetting('badge', value)}
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
            thumbColor={settings?.badge ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
          />
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderQuietHours = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Sessiz Saatler</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={Theme.colors.primary[500]} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Sessiz Saatleri Etkinleştir</Text>
              <Text style={styles.settingDescription}>Belirli saatlerde bildirimleri sustur</Text>
            </View>
          </View>
          <Switch
            value={settings?.quietHours.enabled || false}
            onValueChange={(value) => updateQuietHours('enabled', value)}
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
            thumbColor={settings?.quietHours.enabled ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
          />
        </View>

        {settings?.quietHours.enabled && (
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Başlangıç</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.quietHours.start}</Text>
                <Ionicons name="chevron-down" size={16} color={Theme.colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Bitiş</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.quietHours.end}</Text>
                <Ionicons name="chevron-down" size={16} color={Theme.colors.neutral[500]} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderNotificationTypes = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Bildirim Türleri</Text>
        
        {settings && Object.entries(settings.types).map(([type, enabled]) => {
          const typeInfo = getNotificationTypeInfo(type as NotificationType);
          return (
            <View key={type} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>{typeInfo.title}</Text>
                  <Text style={styles.settingDescription}>{typeInfo.description}</Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={(value) => updateNotificationType(type as NotificationType, value)}
                trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[200] }}
                thumbColor={enabled ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
              />
            </View>
          );
        })}
      </ProfessionalCard>
    </Animated.View>
  );

  const renderFrequencySettings = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Bildirim Sıklığı</Text>
        
        <View style={styles.frequencyContainer}>
          {['low', 'medium', 'high'].map((frequency) => (
            <TouchableOpacity
              key={frequency}
              style={[
                styles.frequencyButton,
                settings?.frequency === frequency && styles.frequencyButtonActive,
              ]}
              onPress={() => updateSetting('frequency', frequency)}
            >
              <Text style={[
                styles.frequencyText,
                settings?.frequency === frequency && styles.frequencyTextActive,
              ]}>
                {frequency === 'low' ? 'Düşük' : frequency === 'medium' ? 'Orta' : 'Yüksek'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderGeneralSettings()}
        {renderQuietHours()}
        {renderNotificationTypes()}
        {renderFrequencySettings()}
        
        {hasChanges && (
          <View style={styles.saveContainer}>
            <ProfessionalButton
              title="Değişiklikleri Kaydet"
              variant="gradient"
              gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
              onPress={handleSaveSettings}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  headerGradient: {
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Theme.spacing.xs,
  },
  testButton: {
    padding: Theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  card: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
  },
  settingDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  timeContainer: {
    marginTop: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  timeLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
  timeText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.xs,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  frequencyText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  frequencyTextActive: {
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  saveContainer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing['4xl'],
  },
  saveButton: {
    marginHorizontal: Theme.spacing.md,
  },
});