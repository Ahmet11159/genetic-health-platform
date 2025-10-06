import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';

import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: Props) {
  const [userProfile, setUserProfile] = useState({
    name: 'Kullanıcı',
    email: 'user@example.com',
    memberSince: '2024',
    dnaUploaded: false,
    analysisCompleted: false,
    healthScore: 0,
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'tr',
    }
  });

  const [hasDNAData, setHasDNAData] = useState(false);

  useEffect(() => {
    loadUserProfile();
    checkDNAStatus();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUserProfile({
          name: currentUser.name,
          email: currentUser.email,
          memberSince: new Date(currentUser.createdAt).getFullYear().toString(),
          dnaUploaded: hasDNAData,
          analysisCompleted: hasDNAData,
          healthScore: 85,
          preferences: {
            notifications: currentUser.preferences?.notifications ?? true,
            darkMode: currentUser.preferences?.darkMode ?? false,
            language: currentUser.preferences?.language ?? 'tr',
          }
        });
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    }
  };

  const checkDNAStatus = async () => {
    try {
      const dnaStatus = await AsyncStorage.getItem('hasDNAData');
      setHasDNAData(dnaStatus === 'true');
    } catch (error) {
      console.error('DNA durumu kontrol hatası:', error);
    }
  };

  const handleSettingChange = async (setting: string, value: any) => {
    try {
      const updatedProfile = {
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          [setting]: value
        }
      };
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Ayar güncelleme hatası:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Çıkış yapma hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[Theme.colors.primary[800], Theme.colors.primary[600], Theme.colors.primary[500]]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
        <Text style={styles.memberSince}>Üye olma tarihi: {userProfile.memberSince}</Text>
      </View>
    </LinearGradient>
  );

  const renderHealthOverview = () => (
    <ProfessionalCard variant="elevated" size="lg" style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Ionicons name="heart" size={24} color={Theme.colors.semantic.error} />
        <Text style={styles.healthTitle}>Sağlık Durumu</Text>
      </View>
      
      <View style={styles.healthStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{hasDNAData ? '78' : '--'}</Text>
          <Text style={styles.statLabel}>Sağlık Skoru</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{hasDNAData ? '5' : '0'}</Text>
          <Text style={styles.statLabel}>Genetik Varyant</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{hasDNAData ? '94%' : '--'}</Text>
          <Text style={styles.statLabel}>Güvenilirlik</Text>
        </View>
      </View>

      {!hasDNAData && (
        <ProfessionalButton
          title="DNA Analizi Yap"
          variant="gradient"
          gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
          icon="dna"
          iconPosition="left"
          onPress={() => navigation.navigate('DNAUpload')}
          style={styles.dnaButton}
        />
      )}
    </ProfessionalCard>
  );

  const renderSettings = () => (
    <ProfessionalCard variant="elevated" size="lg" style={styles.settingsCard}>
      <View style={styles.settingsHeader}>
        <Ionicons name="settings" size={24} color={Theme.colors.primary[600]} />
        <Text style={styles.settingsTitle}>Ayarlar</Text>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={20} color={Theme.colors.text.primary} />
          <Text style={styles.settingLabel}>Bildirimler</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            userProfile.preferences.notifications && styles.toggleActive
          ]}
          onPress={() => handleSettingChange('notifications', !userProfile.preferences.notifications)}
        >
          <View style={[
            styles.toggleThumb,
            userProfile.preferences.notifications && styles.toggleThumbActive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="moon" size={20} color={Theme.colors.text.primary} />
          <Text style={styles.settingLabel}>Karanlık Mod</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            userProfile.preferences.darkMode && styles.toggleActive
          ]}
          onPress={() => handleSettingChange('darkMode', !userProfile.preferences.darkMode)}
        >
          <View style={[
            styles.toggleThumb,
            userProfile.preferences.darkMode && styles.toggleThumbActive
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="language" size={20} color={Theme.colors.text.primary} />
          <Text style={styles.settingLabel}>Dil</Text>
        </View>
        <Text style={styles.settingValue}>Türkçe</Text>
      </View>
    </ProfessionalCard>
  );

  const renderMenuItems = () => (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="document-text" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.menuItemText}>Analiz Raporlarım</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="download" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.menuItemText}>Verilerimi İndir</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="shield-checkmark" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.menuItemText}>Gizlilik ve Güvenlik</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="help-circle" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.menuItemText}>Yardım ve Destek</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="information-circle" size={20} color={Theme.colors.primary[600]} />
          <Text style={styles.menuItemText}>Hakkında</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[800]} />
      
      {renderProfileHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHealthOverview()}
        {renderSettings()}
        {renderMenuItems()}
        
        <ProfessionalButton
          title="Çıkış Yap"
          variant="outline"
          color={Theme.colors.semantic.error}
          icon="log-out"
          iconPosition="left"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing['3xl'],
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  userName: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    marginBottom: Theme.spacing.xs,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Theme.spacing.xs,
  },
  memberSince: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  healthCard: {
    marginBottom: Theme.spacing.lg,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  healthTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  dnaButton: {
    width: '100%',
  },
  settingsCard: {
    marginBottom: Theme.spacing.lg,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  settingsTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
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
  settingLabel: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  settingValue: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.neutral[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Theme.colors.primary[500],
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  menuContainer: {
    marginBottom: Theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  logoutButton: {
    width: '100%',
    marginTop: Theme.spacing.lg,
  },
});