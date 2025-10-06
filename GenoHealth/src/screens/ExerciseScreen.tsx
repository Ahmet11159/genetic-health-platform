import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type ExerciseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Exercise'>;
type ExerciseScreenRouteProp = RouteProp<RootStackParamList, 'Exercise'>;

interface Props {
  navigation: ExerciseScreenNavigationProp;
  route: ExerciseScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function ExerciseScreen({ navigation, route }: Props) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workouts' | 'recovery' | 'goals'>('overview');
  const [exerciseData, setExerciseData] = useState<any>(null);

  useEffect(() => {
    // Simulated exercise data based on DNA analysis
    setExerciseData({
      geneticProfile: {
        muscleType: 'Fast-twitch dominant',
        endurance: 'High',
        strength: 'Moderate',
        recovery: 'Fast',
        injuryRisk: 'Low',
        flexibility: 'Good'
      },
      recommendations: {
        weeklyWorkouts: 4,
        workoutDuration: 45,
        intensity: 'Moderate-High',
        restDays: 3,
        focusAreas: ['Cardio', 'Strength', 'Flexibility']
      },
      workouts: {
        cardio: [
          { name: 'Koşu', duration: '30-45 dk', intensity: 'Orta-Yüksek', benefits: 'Kalp sağlığı, dayanıklılık' },
          { name: 'Bisiklet', duration: '45-60 dk', intensity: 'Orta', benefits: 'Düşük etkili kardio' },
          { name: 'Yüzme', duration: '30-45 dk', intensity: 'Orta-Yüksek', benefits: 'Tam vücut antrenmanı' }
        ],
        strength: [
          { name: 'Ağırlık Antrenmanı', duration: '45-60 dk', intensity: 'Yüksek', benefits: 'Kas gücü, kemik yoğunluğu' },
          { name: 'Bodyweight', duration: '30-45 dk', intensity: 'Orta-Yüksek', benefits: 'Fonksiyonel güç' },
          { name: 'Pilates', duration: '45-60 dk', intensity: 'Orta', benefits: 'Core gücü, esneklik' }
        ],
        flexibility: [
          { name: 'Yoga', duration: '30-60 dk', intensity: 'Düşük-Orta', benefits: 'Esneklik, denge' },
          { name: 'Stretching', duration: '15-30 dk', intensity: 'Düşük', benefits: 'Kas gevşetme' }
        ]
      },
      recovery: {
        sleepHours: 8,
        restDays: 3,
        techniques: ['Masaj', 'Meditasyon', 'Soğuk duş', 'Aktif dinlenme'],
        supplements: ['Protein', 'BCAA', 'Magnesium', 'Omega-3']
      }
    });
  }, []);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Genetic Profile */}
      <ProfessionalCard title="Genetik Egzersiz Profiliniz" style={styles.card}>
        <View style={styles.profileGrid}>
          <View style={styles.profileItem}>
            <Ionicons name="fitness" size={24} color="#2196F3" />
            <Text style={styles.profileLabel}>Kas Tipi</Text>
            <Text style={styles.profileValue}>Hızlı Kasılan</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="timer" size={24} color="#4CAF50" />
            <Text style={styles.profileLabel}>Dayanıklılık</Text>
            <Text style={styles.profileValue}>Yüksek</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="barbell" size={24} color="#FF9800" />
            <Text style={styles.profileLabel}>Güç</Text>
            <Text style={styles.profileValue}>Orta</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="refresh" size={24} color="#9C27B0" />
            <Text style={styles.profileLabel}>Toparlanma</Text>
            <Text style={styles.profileValue}>Hızlı</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Weekly Plan */}
      <ProfessionalCard title="Haftalık Egzersiz Planı" style={styles.card}>
        <View style={styles.planGrid}>
          <View style={styles.planItem}>
            <Text style={styles.planValue}>{exerciseData?.recommendations.weeklyWorkouts}</Text>
            <Text style={styles.planLabel}>Haftalık Antrenman</Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planValue}>{exerciseData?.recommendations.workoutDuration}dk</Text>
            <Text style={styles.planLabel}>Süre</Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planValue}>{exerciseData?.recommendations.intensity}</Text>
            <Text style={styles.planLabel}>Yoğunluk</Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planValue}>{exerciseData?.recommendations.restDays}</Text>
            <Text style={styles.planLabel}>Dinlenme Günü</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Focus Areas */}
      <ProfessionalCard title="Odaklanılacak Alanlar" style={styles.card}>
        <View style={styles.focusList}>
          {exerciseData?.recommendations.focusAreas.map((area: string, index: number) => (
            <View key={index} style={styles.focusItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={styles.focusText}>{area}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderWorkouts = () => (
    <View style={styles.tabContent}>
      {/* Cardio Workouts */}
      <ProfessionalCard title="Kardiyovasküler Egzersizler" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik profilinize uygun kardio antrenmanları
        </Text>
        <View style={styles.workoutList}>
          {exerciseData?.workouts.cardio.map((workout: any, index: number) => (
            <View key={index} style={styles.workoutItem}>
              <View style={styles.workoutHeader}>
                <Ionicons name="heart" size={24} color="#E91E63" />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDuration}>{workout.duration}</Text>
                </View>
                <Text style={styles.workoutIntensity}>{workout.intensity}</Text>
              </View>
              <Text style={styles.workoutBenefits}>{workout.benefits}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      {/* Strength Workouts */}
      <ProfessionalCard title="Güç Antrenmanları" style={styles.card}>
        <Text style={styles.cardDescription}>
          Kas gücü ve dayanıklılık için önerilen antrenmanlar
        </Text>
        <View style={styles.workoutList}>
          {exerciseData?.workouts.strength.map((workout: any, index: number) => (
            <View key={index} style={styles.workoutItem}>
              <View style={styles.workoutHeader}>
                <Ionicons name="barbell" size={24} color="#FF9800" />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDuration}>{workout.duration}</Text>
                </View>
                <Text style={styles.workoutIntensity}>{workout.intensity}</Text>
              </View>
              <Text style={styles.workoutBenefits}>{workout.benefits}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      {/* Flexibility Workouts */}
      <ProfessionalCard title="Esneklik ve Denge" style={styles.card}>
        <Text style={styles.cardDescription}>
          Esneklik ve denge için önerilen egzersizler
        </Text>
        <View style={styles.workoutList}>
          {exerciseData?.workouts.flexibility.map((workout: any, index: number) => (
            <View key={index} style={styles.workoutItem}>
              <View style={styles.workoutHeader}>
                <Ionicons name="leaf" size={24} color="#4CAF50" />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDuration}>{workout.duration}</Text>
                </View>
                <Text style={styles.workoutIntensity}>{workout.intensity}</Text>
              </View>
              <Text style={styles.workoutBenefits}>{workout.benefits}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderRecovery = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Toparlanma Stratejileri" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik profilinize göre optimize edilmiş toparlanma planı
        </Text>
        
        <View style={styles.recoveryStats}>
          <View style={styles.recoveryItem}>
            <Ionicons name="moon" size={24} color="#9C27B0" />
            <Text style={styles.recoveryValue}>{exerciseData?.recovery.sleepHours} saat</Text>
            <Text style={styles.recoveryLabel}>Uyku</Text>
          </View>
          <View style={styles.recoveryItem}>
            <Ionicons name="calendar" size={24} color="#2196F3" />
            <Text style={styles.recoveryValue}>{exerciseData?.recovery.restDays} gün</Text>
            <Text style={styles.recoveryLabel}>Dinlenme</Text>
          </View>
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Toparlanma Teknikleri" style={styles.card}>
        <View style={styles.techniqueList}>
          {exerciseData?.recovery.techniques.map((technique: string, index: number) => (
            <View key={index} style={styles.techniqueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.techniqueText}>{technique}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Toparlanma Takviyeleri" style={styles.card}>
        <View style={styles.supplementList}>
          {exerciseData?.recovery.supplements.map((supplement: string, index: number) => (
            <View key={index} style={styles.supplementItem}>
              <Ionicons name="medical" size={20} color="#2196F3" />
              <Text style={styles.supplementText}>{supplement}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderGoals = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Hedefleriniz" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik profilinize göre gerçekçi hedefler
        </Text>
        
        <View style={styles.goalList}>
          <View style={styles.goalItem}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>Kısa Vadeli (1-3 ay)</Text>
              <Text style={styles.goalText}>Haftada 4 antrenman ile düzenli egzersiz alışkanlığı</Text>
            </View>
          </View>
          
          <View style={styles.goalItem}>
            <Ionicons name="medal" size={24} color="#C0C0C0" />
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>Orta Vadeli (3-6 ay)</Text>
              <Text style={styles.goalText}>Kardiyovasküler dayanıklılığı %20 artırma</Text>
            </View>
          </View>
          
          <View style={styles.goalItem}>
            <Ionicons name="star" size={24} color="#FF6B6B" />
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>Uzun Vadeli (6-12 ay)</Text>
              <Text style={styles.goalText}>Genel fitness seviyesini optimize etme</Text>
            </View>
          </View>
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="İlerleme Takibi" style={styles.card}>
        <View style={styles.trackingList}>
          <View style={styles.trackingItem}>
            <Ionicons name="pulse" size={20} color="#4CAF50" />
            <Text style={styles.trackingText}>Kalp atış hızı takibi</Text>
          </View>
          <View style={styles.trackingItem}>
            <Ionicons name="timer" size={20} color="#2196F3" />
            <Text style={styles.trackingText}>Antrenman süresi kaydı</Text>
          </View>
          <View style={styles.trackingItem}>
            <Ionicons name="barbell" size={20} color="#FF9800" />
            <Text style={styles.trackingText}>Ağırlık ve tekrar sayıları</Text>
          </View>
          <View style={styles.trackingItem}>
            <Ionicons name="happy" size={20} color="#9C27B0" />
            <Text style={styles.trackingText}>Genel enerji seviyesi</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2196F3', '#64B5F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Egzersiz Planı</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              Genel Bakış
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'workouts' && styles.activeTab]}
            onPress={() => setSelectedTab('workouts')}
          >
            <Text style={[styles.tabText, selectedTab === 'workouts' && styles.activeTabText]}>
              Antrenmanlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'recovery' && styles.activeTab]}
            onPress={() => setSelectedTab('recovery')}
          >
            <Text style={[styles.tabText, selectedTab === 'recovery' && styles.activeTabText]}>
              Toparlanma
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'goals' && styles.activeTab]}
            onPress={() => setSelectedTab('goals')}
          >
            <Text style={[styles.tabText, selectedTab === 'goals' && styles.activeTabText]}>
              Hedefler
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'workouts' && renderWorkouts()}
        {selectedTab === 'recovery' && renderRecovery()}
        {selectedTab === 'goals' && renderGoals()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <ProfessionalButton
          title="Antrenman Başlat"
          variant="gradient"
          gradient={[Theme.colors.secondary[500], Theme.colors.secondary[600]]}
          icon="play"
          onPress={() => {}}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  profileLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  planGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  planItem: {
    alignItems: 'center',
  },
  planValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  planLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  focusList: {
    marginTop: 15,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  workoutList: {
    marginTop: 15,
  },
  workoutItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 15,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workoutIntensity: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutBenefits: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recoveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  recoveryItem: {
    alignItems: 'center',
  },
  recoveryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  recoveryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  techniqueList: {
    marginTop: 15,
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  techniqueText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  supplementList: {
    marginTop: 15,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  supplementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  goalList: {
    marginTop: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  goalContent: {
    flex: 1,
    marginLeft: 15,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  goalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trackingList: {
    marginTop: 15,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    width: '100%',
  },
});