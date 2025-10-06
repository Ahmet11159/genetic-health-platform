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

type NutritionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Nutrition'>;
type NutritionScreenRouteProp = RouteProp<RootStackParamList, 'Nutrition'>;

interface Props {
  navigation: NutritionScreenNavigationProp;
  route: NutritionScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function NutritionScreen({ navigation, route }: Props) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'macros' | 'foods' | 'supplements'>('overview');
  const [nutritionData, setNutritionData] = useState<any>(null);

  useEffect(() => {
    // Simulated nutrition data based on DNA analysis
    setNutritionData({
      geneticProfile: {
        metabolism: 'Fast',
        lactoseIntolerance: false,
        glutenSensitivity: 'Low',
        caffeineMetabolism: 'Fast',
        vitaminD: 'Deficient',
        omega3: 'Normal'
      },
      recommendations: {
        dailyCalories: 2200,
        protein: 120,
        carbs: 250,
        fat: 80,
        fiber: 35
      },
      foods: {
        beneficial: ['Salmon', 'Broccoli', 'Blueberries', 'Almonds', 'Greek Yogurt'],
        avoid: ['Processed Meats', 'Sugary Drinks', 'White Bread', 'Fried Foods'],
        moderate: ['Dairy', 'Gluten', 'Caffeine', 'Red Meat']
      },
      supplements: [
        { name: 'Vitamin D3', dosage: '2000 IU', reason: 'Genetik eksiklik' },
        { name: 'Omega-3', dosage: '1000mg', reason: 'Kalp sağlığı' },
        { name: 'Magnesium', dosage: '400mg', reason: 'Kas fonksiyonu' }
      ]
    });
  }, []);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Genetic Profile */}
      <ProfessionalCard title="Genetik Beslenme Profiliniz" style={styles.card}>
        <View style={styles.profileGrid}>
          <View style={styles.profileItem}>
            <Ionicons name="flash" size={24} color="#4CAF50" />
            <Text style={styles.profileLabel}>Metabolizma</Text>
            <Text style={styles.profileValue}>Hızlı</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="milk" size={24} color="#2196F3" />
            <Text style={styles.profileLabel}>Laktoz</Text>
            <Text style={styles.profileValue}>Toleranslı</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="leaf" size={24} color="#FF9800" />
            <Text style={styles.profileLabel}>Gluten</Text>
            <Text style={styles.profileValue}>Düşük Hassasiyet</Text>
          </View>
          <View style={styles.profileItem}>
            <Ionicons name="cafe" size={24} color="#9C27B0" />
            <Text style={styles.profileLabel}>Kafein</Text>
            <Text style={styles.profileValue}>Hızlı Metabolizma</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Daily Recommendations */}
      <ProfessionalCard title="Günlük Beslenme Hedefleri" style={styles.card}>
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutritionData?.recommendations.dailyCalories}</Text>
            <Text style={styles.macroLabel}>Kalori</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutritionData?.recommendations.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutritionData?.recommendations.carbs}g</Text>
            <Text style={styles.macroLabel}>Karbonhidrat</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutritionData?.recommendations.fat}g</Text>
            <Text style={styles.macroLabel}>Yağ</Text>
          </View>
        </View>
      </ProfessionalCard>

      {/* Quick Tips */}
      <ProfessionalCard title="Hızlı İpuçları" style={styles.card}>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Günde 8-10 bardak su için</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Protein alımınızı gün içine yayın</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Sebze ve meyve çeşitliliğini artırın</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>İşlenmiş gıdalardan kaçının</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderMacros = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Makro Besin Dağılımı" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik profilinize göre optimize edilmiş makro besin dağılımı
        </Text>
        
        <View style={styles.macroBreakdown}>
          <View style={styles.macroBar}>
            <View style={[styles.macroBarFill, { width: '40%', backgroundColor: '#4CAF50' }]} />
            <Text style={styles.macroBarLabel}>Protein %40</Text>
          </View>
          <View style={styles.macroBar}>
            <View style={[styles.macroBarFill, { width: '35%', backgroundColor: '#2196F3' }]} />
            <Text style={styles.macroBarLabel}>Karbonhidrat %35</Text>
          </View>
          <View style={styles.macroBar}>
            <View style={[styles.macroBarFill, { width: '25%', backgroundColor: '#FF9800' }]} />
            <Text style={styles.macroBarLabel}>Yağ %25</Text>
          </View>
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Detaylı Öneriler" style={styles.card}>
        <View style={styles.recommendationList}>
          <View style={styles.recommendationItem}>
            <Ionicons name="nutrition" size={24} color="#4CAF50" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Yüksek Protein</Text>
              <Text style={styles.recommendationText}>
                Hızlı metabolizmanız nedeniyle protein ihtiyacınız yüksek. 
                Her öğünde 25-30g protein alın.
              </Text>
            </View>
          </View>
          
          <View style={styles.recommendationItem}>
            <Ionicons name="leaf" size={24} color="#2196F3" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Kompleks Karbonhidratlar</Text>
              <Text style={styles.recommendationText}>
                Tam tahıllar, sebzeler ve meyveler tercih edin. 
                Basit şekerlerden kaçının.
              </Text>
            </View>
          </View>
          
          <View style={styles.recommendationItem}>
            <Ionicons name="water" size={24} color="#FF9800" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Sağlıklı Yağlar</Text>
              <Text style={styles.recommendationText}>
                Zeytinyağı, avokado, kuruyemiş ve balık yağı öncelikli olsun.
              </Text>
            </View>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderFoods = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Önerilen Besinler" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik profilinize uygun besinler
        </Text>
        
        <View style={styles.foodCategory}>
          <Text style={styles.foodCategoryTitle}>✅ Faydalı Besinler</Text>
          <View style={styles.foodList}>
            {nutritionData?.foods.beneficial.map((food: string, index: number) => (
              <View key={index} style={styles.foodItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.foodName}>{food}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.foodCategory}>
          <Text style={styles.foodCategoryTitle}>⚠️ Kaçınılması Gerekenler</Text>
          <View style={styles.foodList}>
            {nutritionData?.foods.avoid.map((food: string, index: number) => (
              <View key={index} style={styles.foodItem}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.foodName}>{food}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.foodCategory}>
          <Text style={styles.foodCategoryTitle}>⚖️ Ölçülü Tüketin</Text>
          <View style={styles.foodList}>
            {nutritionData?.foods.moderate.map((food: string, index: number) => (
              <View key={index} style={styles.foodItem}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.foodName}>{food}</Text>
              </View>
            ))}
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  const renderSupplements = () => (
    <View style={styles.tabContent}>
      <ProfessionalCard title="Önerilen Takviyeler" style={styles.card}>
        <Text style={styles.cardDescription}>
          Genetik analizinize göre önerilen vitamin ve mineral takviyeleri
        </Text>
        
        <View style={styles.supplementList}>
          {nutritionData?.supplements.map((supplement: any, index: number) => (
            <View key={index} style={styles.supplementItem}>
              <View style={styles.supplementHeader}>
                <Ionicons name="medical" size={24} color="#4CAF50" />
                <View style={styles.supplementInfo}>
                  <Text style={styles.supplementName}>{supplement.name}</Text>
                  <Text style={styles.supplementDosage}>{supplement.dosage}</Text>
                </View>
              </View>
              <Text style={styles.supplementReason}>{supplement.reason}</Text>
            </View>
          ))}
        </View>
      </ProfessionalCard>

      <ProfessionalCard title="Takviye Kullanım İpuçları" style={styles.card}>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="time" size={20} color="#2196F3" />
            <Text style={styles.tipText}>Takviyeleri yemekle birlikte alın</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="water" size={20} color="#2196F3" />
            <Text style={styles.tipText}>Bol su ile için</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="calendar" size={20} color="#2196F3" />
            <Text style={styles.tipText}>Düzenli kullanım önemli</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="medical" size={20} color="#2196F3" />
            <Text style={styles.tipText}>Doktor kontrolünde kullanın</Text>
          </View>
        </View>
      </ProfessionalCard>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beslenme Planı</Text>
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
            style={[styles.tab, selectedTab === 'macros' && styles.activeTab]}
            onPress={() => setSelectedTab('macros')}
          >
            <Text style={[styles.tabText, selectedTab === 'macros' && styles.activeTabText]}>
              Makrolar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'foods' && styles.activeTab]}
            onPress={() => setSelectedTab('foods')}
          >
            <Text style={[styles.tabText, selectedTab === 'foods' && styles.activeTabText]}>
              Besinler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'supplements' && styles.activeTab]}
            onPress={() => setSelectedTab('supplements')}
          >
            <Text style={[styles.tabText, selectedTab === 'supplements' && styles.activeTabText]}>
              Takviyeler
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'macros' && renderMacros()}
        {selectedTab === 'foods' && renderFoods()}
        {selectedTab === 'supplements' && renderSupplements()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <ProfessionalButton
          title="Günlük Plan Oluştur"
          variant="gradient"
          gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
          icon="calendar"
          onPress={() => navigation.navigate('MealPlan')}
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
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
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
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  macroBreakdown: {
    marginTop: 20,
  },
  macroBar: {
    marginBottom: 15,
  },
  macroBarFill: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  macroBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  recommendationList: {
    marginTop: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 15,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  foodCategory: {
    marginBottom: 20,
  },
  foodCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  supplementList: {
    marginTop: 15,
  },
  supplementItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplementInfo: {
    marginLeft: 15,
    flex: 1,
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  supplementDosage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  supplementReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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