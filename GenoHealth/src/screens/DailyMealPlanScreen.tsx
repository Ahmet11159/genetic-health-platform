import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type DailyMealPlanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DailyMealPlan'>;
type DailyMealPlanScreenRouteProp = RouteProp<RootStackParamList, 'DailyMealPlan'>;

interface Props {
  navigation: DailyMealPlanScreenNavigationProp;
  route: DailyMealPlanScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function DailyMealPlanScreen({ navigation, route }: Props) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const [waterIntake, setWaterIntake] = useState(0);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const plan = route.params?.plan || {
    id: 'genetic',
    title: 'Genetik Beslenme Planı',
    description: 'DNA analizinize göre kişiselleştirilmiş beslenme planı',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
  };

  const progress = route.params?.progress || { week: 1, day: 1, completed: 0 };

  const weeklyMealPlan = [
    {
      day: 'Pazartesi',
      date: '15 Ocak',
      meals: [
        {
          id: 'breakfast',
          name: 'Kahvaltı',
          time: '08:00',
          calories: 450,
          protein: 25,
          carbs: 35,
          fat: 20,
          foods: [
            { name: 'Yulaf ezmesi', amount: '50g', calories: 180 },
            { name: 'Muz', amount: '1 adet', calories: 105 },
            { name: 'Badem', amount: '15g', calories: 90 },
            { name: 'Süt', amount: '200ml', calories: 75 }
          ],
          recommendations: [
            'Yulaf ezmesi metabolizmanızı hızlandırır',
            'Badem sağlıklı yağlar içerir',
            'Muz potasyum açısından zengindir'
          ]
        },
        {
          id: 'snack1',
          name: 'Ara Öğün',
          time: '10:30',
          calories: 150,
          protein: 8,
          carbs: 15,
          fat: 6,
          foods: [
            { name: 'Elma', amount: '1 adet', calories: 80 },
            { name: 'Fıstık ezmesi', amount: '1 yemek kaşığı', calories: 70 }
          ],
          recommendations: [
            'Elma lif açısından zengindir',
            'Fıstık ezmesi protein sağlar'
          ]
        },
        {
          id: 'lunch',
          name: 'Öğle Yemeği',
          time: '13:00',
          calories: 600,
          protein: 35,
          carbs: 45,
          fat: 25,
          foods: [
            { name: 'Izgara tavuk göğsü', amount: '150g', calories: 250 },
            { name: 'Quinoa', amount: '80g', calories: 200 },
            { name: 'Brokoli', amount: '100g', calories: 50 },
            { name: 'Zeytinyağı', amount: '1 yemek kaşığı', calories: 100 }
          ],
          recommendations: [
            'Tavuk göğsü yüksek protein içerir',
            'Quinoa tam protein kaynağıdır',
            'Brokoli antioksidan açısından zengindir'
          ]
        },
        {
          id: 'snack2',
          name: 'Ara Öğün',
          time: '16:00',
          calories: 200,
          protein: 12,
          carbs: 20,
          fat: 8,
          foods: [
            { name: 'Yoğurt', amount: '150g', calories: 120 },
            { name: 'Çilek', amount: '100g', calories: 50 },
            { name: 'Chia tohumu', amount: '1 çay kaşığı', calories: 30 }
          ],
          recommendations: [
            'Yoğurt probiyotik içerir',
            'Çilek C vitamini açısından zengindir',
            'Chia tohumu omega-3 sağlar'
          ]
        },
        {
          id: 'dinner',
          name: 'Akşam Yemeği',
          time: '19:00',
          calories: 500,
          protein: 30,
          carbs: 40,
          fat: 22,
          foods: [
            { name: 'Somon balığı', amount: '120g', calories: 200 },
            { name: 'Tatlı patates', amount: '100g', calories: 90 },
            { name: 'Ispanak', amount: '80g', calories: 20 },
            { name: 'Avokado', amount: '50g', calories: 80 },
            { name: 'Limon', amount: '1/2 adet', calories: 10 }
          ],
          recommendations: [
            'Somon omega-3 açısından zengindir',
            'Tatlı patates beta-karoten içerir',
            'Ispanak demir açısından zengindir'
          ]
        }
      ]
    },
    {
      day: 'Salı',
      date: '16 Ocak',
      meals: [
        {
          id: 'breakfast',
          name: 'Kahvaltı',
          time: '08:00',
          calories: 420,
          protein: 22,
          carbs: 38,
          fat: 18,
          foods: [
            { name: 'Yumurta', amount: '2 adet', calories: 140 },
            { name: 'Tam buğday ekmeği', amount: '2 dilim', calories: 160 },
            { name: 'Avokado', amount: '1/2 adet', calories: 80 },
            { name: 'Domates', amount: '1 adet', calories: 20 },
            { name: 'Tuzsuz tereyağı', amount: '1 çay kaşığı', calories: 20 }
          ],
          recommendations: [
            'Yumurta tam protein kaynağıdır',
            'Tam buğday ekmeği lif içerir',
            'Avokado sağlıklı yağlar sağlar'
          ]
        },
        {
          id: 'snack1',
          name: 'Ara Öğün',
          time: '10:30',
          calories: 120,
          protein: 6,
          carbs: 18,
          fat: 4,
          foods: [
            { name: 'Portakal', amount: '1 adet', calories: 60 },
            { name: 'Badem', amount: '10g', calories: 60 }
          ],
          recommendations: [
            'Portakal C vitamini açısından zengindir',
            'Badem magnezyum sağlar'
          ]
        },
        {
          id: 'lunch',
          name: 'Öğle Yemeği',
          time: '13:00',
          calories: 580,
          protein: 32,
          carbs: 42,
          fat: 28,
          foods: [
            { name: 'Hindi göğsü', amount: '120g', calories: 200 },
            { name: 'Bulgur', amount: '70g', calories: 180 },
            { name: 'Mantar', amount: '100g', calories: 30 },
            { name: 'Zeytinyağı', amount: '1 yemek kaşığı', calories: 100 },
            { name: 'Maydanoz', amount: '20g', calories: 10 }
          ],
          recommendations: [
            'Hindi göğsü düşük yağlı protein',
            'Bulgur B vitamini içerir',
            'Mantar selenyum sağlar'
          ]
        },
        {
          id: 'snack2',
          name: 'Ara Öğün',
          time: '16:00',
          calories: 180,
          protein: 10,
          carbs: 22,
          fat: 6,
          foods: [
            { name: 'Kefir', amount: '200ml', calories: 100 },
            { name: 'Muz', amount: '1/2 adet', calories: 50 },
            { name: 'Ceviz', amount: '3 adet', calories: 30 }
          ],
          recommendations: [
            'Kefir probiyotik içerir',
            'Muz potasyum sağlar',
            'Ceviz omega-3 içerir'
          ]
        },
        {
          id: 'dinner',
          name: 'Akşam Yemeği',
          time: '19:00',
          calories: 480,
          protein: 28,
          carbs: 35,
          fat: 24,
          foods: [
            { name: 'Izgara balık', amount: '130g', calories: 180 },
            { name: 'Kinoa', amount: '60g', calories: 150 },
            { name: 'Karnabahar', amount: '100g', calories: 25 },
            { name: 'Zeytinyağı', amount: '1 yemek kaşığı', calories: 100 },
            { name: 'Limon', amount: '1/2 adet', calories: 10 }
          ],
          recommendations: [
            'Balık omega-3 açısından zengindir',
            'Kinoa tam protein kaynağıdır',
            'Karnabahar C vitamini içerir'
          ]
        }
      ]
    }
  ];

  const handleMealComplete = (mealId: string) => {
    const newCompleted = new Set(completedMeals);
    if (newCompleted.has(mealId)) {
      newCompleted.delete(mealId);
    } else {
      newCompleted.add(mealId);
    }
    setCompletedMeals(newCompleted);
  };

  const handleWaterIntake = () => {
    setWaterIntake(prev => Math.min(prev + 250, 3000));
  };

  const getTotalCalories = () => {
    return weeklyMealPlan[selectedDay].meals.reduce((total, meal) => total + meal.calories, 0);
  };

  const getTotalProtein = () => {
    return weeklyMealPlan[selectedDay].meals.reduce((total, meal) => total + meal.protein, 0);
  };

  const getTotalCarbs = () => {
    return weeklyMealPlan[selectedDay].meals.reduce((total, meal) => total + meal.carbs, 0);
  };

  const getTotalFat = () => {
    return weeklyMealPlan[selectedDay].meals.reduce((total, meal) => total + meal.fat, 0);
  };

  const getCompletedMealsCount = () => {
    return completedMeals.size;
  };

  const getProgressPercentage = () => {
    return (getCompletedMealsCount() / weeklyMealPlan[selectedDay].meals.length) * 100;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={plan.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planSubtitle}>
              Hafta {progress.week} - Gün {progress.day}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Math.round(getProgressPercentage())}%</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weeklyMealPlan.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDay
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayName,
                { color: selectedDay === index ? '#fff' : '#666' }
              ]}>
                {day.day}
              </Text>
              <Text style={[
                styles.dayDate,
                { color: selectedDay === index ? 'rgba(255,255,255,0.8)' : '#999' }
              ]}>
                {day.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nutrition Summary */}
      <Animated.View
        style={[
          styles.nutritionSummary,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.summaryTitle}>Günlük Besin Değerleri</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{getTotalCalories()}</Text>
            <Text style={styles.nutritionLabel}>Kalori</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{getTotalProtein()}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{getTotalCarbs()}g</Text>
            <Text style={styles.nutritionLabel}>Karbonhidrat</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{getTotalFat()}g</Text>
            <Text style={styles.nutritionLabel}>Yağ</Text>
          </View>
        </View>
      </Animated.View>

      {/* Water Intake */}
      <Animated.View
        style={[
          styles.waterIntake,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.waterHeader}>
          <Ionicons name="water" size={24} color="#2196F3" />
          <Text style={styles.waterTitle}>Su Tüketimi</Text>
          <Text style={styles.waterAmount}>{waterIntake}ml / 3000ml</Text>
        </View>
        <View style={styles.waterBar}>
          <View style={[styles.waterProgress, { width: `${(waterIntake / 3000) * 100}%` }]} />
        </View>
        <TouchableOpacity
          style={styles.waterButton}
          onPress={handleWaterIntake}
        >
          <Ionicons name="add" size={20} color="#2196F3" />
          <Text style={styles.waterButtonText}>250ml Ekle</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Meals */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.mealsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {weeklyMealPlan[selectedDay].meals.map((meal, index) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <View style={styles.mealStats}>
                  <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                  <Text style={styles.mealMacros}>
                    P: {meal.protein}g | K: {meal.carbs}g | Y: {meal.fat}g
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    completedMeals.has(meal.id) && styles.completedButton
                  ]}
                  onPress={() => handleMealComplete(meal.id)}
                >
                  <Ionicons
                    name={completedMeals.has(meal.id) ? 'checkmark' : 'add'}
                    size={20}
                    color={completedMeals.has(meal.id) ? '#fff' : '#4CAF50'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.foodsContainer}>
                <Text style={styles.foodsTitle}>Yiyecekler:</Text>
                {meal.foods.map((food, foodIndex) => (
                  <View key={foodIndex} style={styles.foodItem}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodAmount}>{food.amount}</Text>
                    <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                  </View>
                ))}
              </View>

              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Öneriler:</Text>
                {meal.recommendations.map((rec, recIndex) => (
                  <View key={recIndex} style={styles.recommendationItem}>
                    <Ionicons name="bulb" size={16} color="#FFC107" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  daySelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedDay: {
    backgroundColor: '#4CAF50',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayDate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  nutritionSummary: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  waterIntake: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  waterAmount: {
    fontSize: 14,
    color: '#666',
  },
  waterBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  waterProgress: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  waterButtonText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mealsContainer: {
    padding: 20,
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  mealMacros: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  foodsContainer: {
    marginBottom: 16,
  },
  foodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  foodAmount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  foodCalories: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recommendationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
});