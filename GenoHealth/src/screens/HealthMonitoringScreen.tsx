import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type HealthMonitoringScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HealthMonitoring'>;

interface Props {
  navigation: HealthMonitoringScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function HealthMonitoringScreen({ navigation }: Props) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vitals' | 'trends' | 'alerts'>('overview');
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    // Simulated health monitoring data
    setHealthData({
      currentVitals: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 36.5,
        oxygenSaturation: 98,
        steps: 8542,
        calories: 2150,
        sleep: 7.5
      },
      trends: {
        heartRate: { trend: 'stable', change: '+2 bpm' },
        bloodPressure: { trend: 'improving', change: '-5 mmHg' },
        weight: { trend: 'decreasing', change: '-1.2 kg' },
        sleep: { trend: 'improving', change: '+0.5 hours' }
      },
      alerts: [
        { type: 'info', message: 'Kalp atış hızınız normal aralıkta', time: '2 saat önce' },
        { type: 'warning', message: 'Su alımınızı artırın', time: '4 saat önce' },
        { type: 'success', message: 'Hedef adım sayısına ulaştınız!', time: '6 saat önce' }
      ],
      recommendations: [
        'Günde 8 bardak su için',
        'Haftada 150 dakika orta yoğunlukta egzersiz yapın',
        '7-9 saat uyuyun',
        'Stres seviyenizi kontrol edin'
      ]
    });
  }, []);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Current Vitals */}
      <ProfessionalCard title="Güncel Vital Değerleriniz" style={styles.card}>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalItem}>
            <Ionicons name="heart" size={24} color="#E91E63" />
            <Text style={styles.vitalValue}>{healthData?.currentVitals.heartRate}</Text>
            <Text style={styles.vitalLabel}>Kalp Atışı</Text>
            <Text style={styles.vitalUnit}>bpm</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="pulse" size={24} color="#F44336" />
            <Text style={styles.vitalValue}>{healthData?.currentVitals.bloodPressure}</Text>
            <Text style={styles.vitalLabel}>Tansiyon</Text>
            <Text style={styles.vitalUnit}>mmHg</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="thermometer" size={24} color="#FF9800" />
            <Text style={styles.vitalValue}>{healthData?.currentVitals.temperature}</Text>
            <Text style={styles.vitalLabel}>Vücut Sıcaklığı</Text>
            <Text style={styles.vitalUnit}>°C</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="water" size={24} color="#2196F3" />
            <Text style={styles.vitalValue}>{healthData?.currentVitals.oxygenSaturation}</Text>
            <Text style={styles.vitalLabel}>Oksijen</Text>
            <Text style={styles.vitalUnit}>%</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Activity Summary */}
      <ProfessionalCard title="Günlük Aktivite Özeti" style={styles.card}>
        <View style={styles.activityGrid}>
          <View style={styles.activityItem}>
            <Ionicons name="walk" size={24} color="#4CAF50" />
            <Text style={styles.activityValue}>{healthData?.currentVitals.steps.toLocaleString()}</Text>
            <Text style={styles.activityLabel}>Adım</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="flame" size={24} color="#FF5722" />
            <Text style={styles.activityValue}>{healthData?.currentVitals.calories}</Text>
            <Text style={styles.activityLabel}>Kalori</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="moon" size={24} color="#9C27B0" />
            <Text style={styles.activityValue}>{healthData?.currentVitals.sleep}h</Text>
            <Text style={styles.activityLabel}>Uyku</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Quick Recommendations */}
      <ProfessionalCard title="Hızlı Öneriler" style={styles.card}>
        <View style={styles.recommendationList}>
          {healthData?.recommendations.map((rec: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderVitals = () => (
    <View style={styles.tabContent}>
      {/* Detailed Vitals */}
      <ProfessionalCard title="Detaylı Vital Değerler" style={styles.card}>
        <View style={styles.detailedVitals}>
          <View style={styles.detailedVitalItem}>
            <View style={styles.detailedVitalHeader}>
              <Ionicons name="heart" size={28} color="#E91E63" />
              <Text style={styles.detailedVitalTitle}>Kalp Atış Hızı</Text>
            </View>
            <Text style={styles.detailedVitalValue}>{healthData?.currentVitals.heartRate} bpm</Text>
            <Text style={styles.detailedVitalStatus}>Normal (60-100 bpm)</Text>
            <View style={styles.detailedVitalChart}>
              <View style={[styles.chartBar, { height: 60, backgroundColor: '#E91E63' }]} />
              <View style={[styles.chartBar, { height: 72, backgroundColor: '#E91E63' }]} />
              <View style={[styles.chartBar, { height: 65, backgroundColor: '#E91E63' }]} />
              <View style={[styles.chartBar, { height: 70, backgroundColor: '#E91E63' }]} />
              <View style={[styles.chartBar, { height: 68, backgroundColor: '#E91E63' }]} />
            </View>
          </View>

          <View style={styles.detailedVitalItem}>
            <View style={styles.detailedVitalHeader}>
              <Ionicons name="pulse" size={28} color="#F44336" />
              <Text style={styles.detailedVitalTitle}>Kan Basıncı</Text>
            </View>
            <Text style={styles.detailedVitalValue}>{healthData?.currentVitals.bloodPressure} mmHg</Text>
            <Text style={styles.detailedVitalStatus}>Normal (120/80 mmHg)</Text>
          </View>

          <View style={styles.detailedVitalItem}>
            <View style={styles.detailedVitalHeader}>
              <Ionicons name="thermometer" size={28} color="#FF9800" />
              <Text style={styles.detailedVitalTitle}>Vücut Sıcaklığı</Text>
            </View>
            <Text style={styles.detailedVitalValue}>{healthData?.currentVitals.temperature}°C</Text>
            <Text style={styles.detailedVitalStatus}>Normal (36.1-37.2°C)</Text>
          </View>

          <View style={styles.detailedVitalItem}>
            <View style={styles.detailedVitalHeader}>
              <Ionicons name="water" size={28} color="#2196F3" />
              <Text style={styles.detailedVitalTitle}>Oksijen Saturasyonu</Text>
            </View>
            <Text style={styles.detailedVitalValue}>{healthData?.currentVitals.oxygenSaturation}%</Text>
            <Text style={styles.detailedVitalStatus}>Mükemmel (95-100%)</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderTrends = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Sağlık Trendleri" style={styles.card}>
        <Text style={styles.cardDescription}>
          Son 30 günlük sağlık verilerinizin analizi
        </Text>
        
        <View style={styles.trendsList}>
          <View style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <Ionicons name="heart" size={24} color="#E91E63" />
              <Text style={styles.trendTitle}>Kalp Atış Hızı</Text>
            </View>
            <View style={styles.trendContent}>
              <Text style={styles.trendStatus}>Stabil</Text>
              <Text style={styles.trendChange}>{healthData?.trends.heartRate.change}</Text>
            </View>
          </View>

          <View style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <Ionicons name="pulse" size={24} color="#F44336" />
              <Text style={styles.trendTitle}>Kan Basıncı</Text>
            </View>
            <View style={styles.trendContent}>
              <Text style={[styles.trendStatus, { color: '#4CAF50' }]}>İyileşiyor</Text>
              <Text style={styles.trendChange}>{healthData?.trends.bloodPressure.change}</Text>
            </View>
          </View>

          <View style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <Ionicons name="scale" size={24} color="#9C27B0" />
              <Text style={styles.trendTitle}>Kilo</Text>
            </View>
            <View style={styles.trendContent}>
              <Text style={[styles.trendStatus, { color: '#4CAF50' }]}>Azalıyor</Text>
              <Text style={styles.trendChange}>{healthData?.trends.weight.change}</Text>
            </View>
          </View>

          <View style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <Ionicons name="moon" size={24} color="#2196F3" />
              <Text style={styles.trendTitle}>Uyku</Text>
            </View>
            <View style={styles.trendContent}>
              <Text style={[styles.trendStatus, { color: '#4CAF50' }]}>İyileşiyor</Text>
              <Text style={styles.trendChange}>{healthData?.trends.sleep.change}</Text>
            </View>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Sağlık Uyarıları" style={styles.card}>
        <Text style={styles.cardDescription}>
          Son sağlık uyarılarınız ve bildirimleriniz
        </Text>
        
        <View style={styles.alertsList}>
          {healthData?.alerts.map((alert: any, index: number) => (
            <View key={index} style={styles.alertItem}>
              <Ionicons 
                name={alert.type === 'success' ? 'checkmark-circle' : 
                      alert.type === 'warning' ? 'warning' : 'information-circle'} 
                size={24} 
                color={alert.type === 'success' ? '#4CAF50' : 
                       alert.type === 'warning' ? '#FF9800' : '#2196F3'} 
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ProfessionalCard>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#E91E63', '#F06292']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sağlık Takibi</Text>
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
            style={[styles.tab, selectedTab === 'vitals' && styles.activeTab]}
            onPress={() => setSelectedTab('vitals')}
          >
            <Text style={[styles.tabText, selectedTab === 'vitals' && styles.activeTabText]}>
              Vital Değerler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'trends' && styles.activeTab]}
            onPress={() => setSelectedTab('trends')}
          >
            <Text style={[styles.tabText, selectedTab === 'trends' && styles.activeTabText]}>
              Trendler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'alerts' && styles.activeTab]}
            onPress={() => setSelectedTab('alerts')}
          >
            <Text style={[styles.tabText, selectedTab === 'alerts' && styles.activeTabText]}>
              Uyarılar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'vitals' && renderVitals()}
        {selectedTab === 'trends' && renderTrends()}
        {selectedTab === 'alerts' && renderAlerts()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <ProfessionalButton
          title="Veri Ekle"
          variant="gradient"
          gradient={[Theme.colors.accent.pink, '#F06292']}
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
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
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
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vitalUnit: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
    marginTop: 8,
  },
  activityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recommendationList: {
    marginTop: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  detailedVitals: {
    marginTop: 15,
  },
  detailedVitalItem: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  detailedVitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailedVitalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  detailedVitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailedVitalStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  detailedVitalChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 15,
    height: 80,
  },
  chartBar: {
    width: 20,
    marginRight: 8,
    borderRadius: 2,
  },
  trendsList: {
    marginTop: 15,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  trendContent: {
    alignItems: 'flex-end',
  },
  trendStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  trendChange: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  alertsList: {
    marginTop: 15,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  alertContent: {
    flex: 1,
    marginLeft: 15,
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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