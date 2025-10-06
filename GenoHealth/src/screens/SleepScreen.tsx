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

type SleepScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Sleep'>;
type SleepScreenRouteProp = RouteProp<RootStackParamList, 'Sleep'>;

interface Props {
  navigation: SleepScreenNavigationProp;
  route: SleepScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function SleepScreen({ navigation, route }: Props) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analysis' | 'tips' | 'tracking'>('overview');
  const [sleepData, setSleepData] = useState<any>(null);

  useEffect(() => {
    // Simulated sleep data based on DNA analysis
    setSleepData({
      geneticProfile: {
        chronotype: 'Evening Owl',
        sleepDuration: '7-8 hours',
        deepSleep: 'High',
        remSleep: 'Normal',
        sleepEfficiency: 'Good',
        caffeineSensitivity: 'High'
      },
      lastNight: {
        totalSleep: 7.5,
        deepSleep: 1.8,
        remSleep: 1.5,
        lightSleep: 4.2,
        sleepEfficiency: 92,
        bedTime: '23:30',
        wakeTime: '07:00',
        sleepScore: 85
      },
      weeklyAverage: {
        totalSleep: 7.2,
        bedTime: '23:45',
        wakeTime: '07:15',
        sleepScore: 82
      },
      recommendations: [
        'Yatmadan 1 saat önce ekranları kapatın',
        'Yatak odanızı serin ve karanlık tutun',
        'Düzenli uyku saatleri belirleyin',
        'Kafein alımınızı sınırlayın',
        'Rahatlatıcı aktiviteler yapın'
      ],
      tips: {
        environment: [
          'Oda sıcaklığını 18-22°C arasında tutun',
          'Gürültü seviyesini minimize edin',
          'Kaliteli yatak ve yastık kullanın',
          'Elektronik cihazları odadan çıkarın'
        ],
        routine: [
          'Her gün aynı saatte yatın ve kalkın',
          'Yatmadan önce rahatlatıcı rutin oluşturun',
          'Gün içinde düzenli egzersiz yapın',
          'Öğleden sonra kafein almayın'
        ],
        nutrition: [
          'Yatmadan 3 saat önce yemek yemeyin',
          'Alkol alımını sınırlayın',
          'Kafein alımını azaltın',
          'Su alımınızı gün içine yayın'
        ]
      }
    });
  }, []);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Sleep Score */}
      <ProfessionalCard title="Uyku Skorunuz" style={styles.card}>
        <View style={styles.sleepScoreContainer}>
          <Text style={styles.sleepScoreValue}>{sleepData?.lastNight.sleepScore}</Text>
          <Text style={styles.sleepScoreLabel}>/100</Text>
          <Text style={styles.sleepScoreDescription}>Mükemmel Uyku</Text>
        </View>
      </ProfessionalCard>

      {/* Last Night's Sleep */}
      <ProfessionalCard title="Dün Gece Uykunuz" style={styles.card}>
        <View style={styles.sleepStats}>
          <View style={styles.sleepStatItem}>
            <Ionicons name="time" size={24} color="#9C27B0" />
            <Text style={styles.sleepStatValue}>{sleepData?.lastNight.totalSleep}h</Text>
            <Text style={styles.sleepStatLabel}>Toplam Uyku</Text>
          </View>
          <View style={styles.sleepStatItem}>
            <Ionicons name="moon" size={24} color="#2196F3" />
            <Text style={styles.sleepStatValue}>{sleepData?.lastNight.deepSleep}h</Text>
            <Text style={styles.sleepStatLabel}>Derin Uyku</Text>
          </View>
          <View style={styles.sleepStatItem}>
            <Ionicons name="eye" size={24} color="#4CAF50" />
            <Text style={styles.sleepStatValue}>{sleepData?.lastNight.remSleep}h</Text>
            <Text style={styles.sleepStatLabel}>REM Uyku</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Genetic Profile */}
      <ProfessionalCard title="Genetik Uyku Profiliniz" style={styles.card}>
        <View style={styles.geneticProfile}>
          <View style={styles.geneticItem}>
            <Ionicons name="moon" size={20} color="#9C27B0" />
            <Text style={styles.geneticLabel}>Kronotip:</Text>
            <Text style={styles.geneticValue}>{sleepData?.geneticProfile.chronotype}</Text>
          </View>
          <View style={styles.geneticItem}>
            <Ionicons name="time" size={20} color="#2196F3" />
            <Text style={styles.geneticLabel}>İdeal Süre:</Text>
            <Text style={styles.geneticValue}>{sleepData?.geneticProfile.sleepDuration}</Text>
          </View>
          <View style={styles.geneticItem}>
            <Ionicons name="cafe" size={20} color="#FF9800" />
            <Text style={styles.geneticLabel}>Kafein Hassasiyeti:</Text>
            <Text style={styles.geneticValue}>{sleepData?.geneticProfile.caffeineSensitivity}</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderAnalysis = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Uyku Analizi" style={styles.card}>
        <Text style={styles.cardDescription}>
          Son 7 günlük uyku verilerinizin detaylı analizi
        </Text>
        
        <View style={styles.analysisChart}>
          <Text style={styles.chartTitle}>Uyku Süresi Trendi</Text>
          <View style={styles.chartBars}>
            {[7.2, 7.5, 6.8, 7.3, 7.1, 7.6, 7.5].map((value, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View style={[styles.chartBar, { height: value * 10 }]} />
                <Text style={styles.chartBarLabel}>{['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Uyku Kalitesi Değerlendirmesi" style={styles.card}>
        <View style={styles.qualityMetrics}>
          <View style={styles.qualityItem}>
            <Text style={styles.qualityLabel}>Uyku Verimliliği</Text>
            <View style={styles.qualityBar}>
              <View style={[styles.qualityBarFill, { width: `${sleepData?.lastNight.sleepEfficiency}%` }]} />
            </View>
            <Text style={styles.qualityValue}>{sleepData?.lastNight.sleepEfficiency}%</Text>
          </View>
          
          <View style={styles.qualityItem}>
            <Text style={styles.qualityLabel}>Derin Uyku Oranı</Text>
            <View style={styles.qualityBar}>
              <View style={[styles.qualityBarFill, { width: '24%', backgroundColor: '#2196F3' }]} />
            </View>
            <Text style={styles.qualityValue}>24%</Text>
          </View>
          
          <View style={styles.qualityItem}>
            <Text style={styles.qualityLabel}>REM Uyku Oranı</Text>
            <View style={styles.qualityBar}>
              <View style={[styles.qualityBarFill, { width: '20%', backgroundColor: '#4CAF50' }]} />
            </View>
            <Text style={styles.qualityValue}>20%</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderTips = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Uyku Ortamı" style={styles.card}>
        <View style={styles.tipsList}>
          {sleepData?.tips.environment.map((tip: string, index: number) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="home" size={20} color="#9C27B0" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Uyku Rutini" style={styles.card}>
        <View style={styles.tipsList}>
          {sleepData?.tips.routine.map((tip: string, index: number) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="time" size={20} color="#2196F3" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Beslenme Önerileri" style={styles.card}>
        <View style={styles.tipsList}>
          {sleepData?.tips.nutrition.map((tip: string, index: number) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="nutrition" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderTracking = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Uyku Takibi" style={styles.card}>
        <Text style={styles.cardDescription}>
          Uyku alışkanlıklarınızı takip edin ve iyileştirin
        </Text>
        
        <View style={styles.trackingList}>
          <View style={styles.trackingItem}>
            <Ionicons name="bed" size={24} color="#9C27B0" />
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Yatma Saati</Text>
              <Text style={styles.trackingValue}>{sleepData?.lastNight.bedTime}</Text>
            </View>
          </View>
          
          <View style={styles.trackingItem}>
            <Ionicons name="alarm" size={24} color="#2196F3" />
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Kalkma Saati</Text>
              <Text style={styles.trackingValue}>{sleepData?.lastNight.wakeTime}</Text>
            </View>
          </View>
          
          <View style={styles.trackingItem}>
            <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Haftalık Ortalama</Text>
              <Text style={styles.trackingValue}>{sleepData?.weeklyAverage.totalSleep}h</Text>
            </View>
          </View>
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Haftalık Hedefler" style={styles.card}>
        <View style={styles.goalsList}>
          <View style={styles.goalItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>7-8 saat uyku hedefi</Text>
          </View>
          <View style={styles.goalItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>Düzenli yatma saati</Text>
          </View>
          <View style={styles.goalItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>%90+ uyku verimliliği</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#9C27B0', '#BA68C8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Uyku Analizi</Text>
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
            style={[styles.tab, selectedTab === 'analysis' && styles.activeTab]}
            onPress={() => setSelectedTab('analysis')}
          >
            <Text style={[styles.tabText, selectedTab === 'analysis' && styles.activeTabText]}>
              Analiz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'tips' && styles.activeTab]}
            onPress={() => setSelectedTab('tips')}
          >
            <Text style={[styles.tabText, selectedTab === 'tips' && styles.activeTabText]}>
              İpuçları
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'tracking' && styles.activeTab]}
            onPress={() => setSelectedTab('tracking')}
          >
            <Text style={[styles.tabText, selectedTab === 'tracking' && styles.activeTabText]}>
              Takip
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'analysis' && renderAnalysis()}
        {selectedTab === 'tips' && renderTips()}
        {selectedTab === 'tracking' && renderTracking()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <ProfessionalButton
          title="Uyku Kaydı Ekle"
          variant="gradient"
          gradient={[Theme.colors.accent.deepPurple, '#BA68C8']}
          icon="add"
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
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#9C27B0',
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
  sleepScoreContainer: {
    alignItems: 'center',
    padding: 20,
  },
  sleepScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  sleepScoreLabel: {
    fontSize: 24,
    color: '#666',
    marginLeft: 5,
  },
  sleepScoreDescription: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 10,
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sleepStatItem: {
    alignItems: 'center',
  },
  sleepStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginTop: 8,
  },
  sleepStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  geneticProfile: {
    marginTop: 15,
  },
  geneticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  geneticLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    minWidth: 120,
  },
  geneticValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  analysisChart: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 20,
    backgroundColor: '#9C27B0',
    borderRadius: 2,
    marginBottom: 5,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#666',
  },
  qualityMetrics: {
    marginTop: 15,
  },
  qualityItem: {
    marginBottom: 20,
  },
  qualityLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  qualityBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  qualityBarFill: {
    height: 8,
    backgroundColor: '#9C27B0',
    borderRadius: 4,
  },
  qualityValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  tipsList: {
    marginTop: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  trackingList: {
    marginTop: 15,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  trackingContent: {
    flex: 1,
    marginLeft: 15,
  },
  trackingTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalsList: {
    marginTop: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalText: {
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