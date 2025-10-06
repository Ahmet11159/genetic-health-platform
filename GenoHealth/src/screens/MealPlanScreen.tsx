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

type MealPlanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MealPlan'>;
type MealPlanScreenRouteProp = RouteProp<RootStackParamList, 'MealPlan'>;

interface Props {
  navigation: MealPlanScreenNavigationProp;
  route: MealPlanScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function MealPlanScreen({ navigation, route }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>('genetic');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const mealPlans = [
    {
      id: 'genetic',
      title: 'Genetik Beslenme Planı',
      description: 'DNA analizinize göre kişiselleştirilmiş beslenme planı',
      icon: 'dna',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      features: [
        'Genetik metabolizma analizi',
        'Kişiselleştirilmiş makro besin oranları',
        'Gıda intoleranslarına göre plan',
        'Haftalık menü önerileri',
        'Kalori hesaplama',
        'Besin değeri takibi'
      ],
      duration: '4 hafta',
      difficulty: 'Orta',
      price: 'Premium'
    },
    {
      id: 'weight_loss',
      title: 'Kilo Verme Planı',
      description: 'Sağlıklı ve sürdürülebilir kilo verme programı',
      icon: 'trending-down',
      color: '#FF9800',
      gradient: ['#FF9800', '#FFB74D'],
      features: [
        'Kalori açığı hesaplama',
        'Metabolizma hızlandırma',
        'Protein ağırlıklı beslenme',
        'Günlük egzersiz önerileri',
        'Su tüketimi takibi',
        'Haftalık ölçümler'
      ],
      duration: '8 hafta',
      difficulty: 'Kolay',
      price: 'Ücretsiz'
    },
    {
      id: 'muscle_gain',
      title: 'Kas Geliştirme Planı',
      description: 'Kas kütlesi artırma odaklı beslenme programı',
      icon: 'fitness',
      color: '#2196F3',
      gradient: ['#2196F3', '#64B5F6'],
      features: [
        'Yüksek protein içeriği',
        'Karbonhidrat zamanlaması',
        'Antrenman öncesi/sonrası beslenme',
        'Supplement önerileri',
        'Hidrasyon planı',
        'İlerleme takibi'
      ],
      duration: '12 hafta',
      difficulty: 'Zor',
      price: 'Premium'
    },
    {
      id: 'detox',
      title: 'Detoks Planı',
      description: 'Vücudu temizleyen ve yenileyen beslenme programı',
      icon: 'leaf',
      color: '#8BC34A',
      gradient: ['#8BC34A', '#AED581'],
      features: [
        'Antioksidan zengin besinler',
        'Sıvı detoks programı',
        'Sindirim sistemi destekleyici',
        'Karaciğer temizliği',
        'Bağışıklık güçlendirme',
        'Enerji artırma'
      ],
      duration: '2 hafta',
      difficulty: 'Orta',
      price: 'Ücretsiz'
    },
    {
      id: 'diabetic',
      title: 'Diyabet Dostu Plan',
      description: 'Kan şekeri kontrolü odaklı beslenme programı',
      icon: 'medical',
      color: '#E91E63',
      gradient: ['#E91E63', '#F06292'],
      features: [
        'Düşük glisemik indeks',
        'Karbonhidrat sayımı',
        'Kan şekeri takibi',
        'Doktor onaylı menüler',
        'Porsiyon kontrolü',
        'Acil durum planı'
      ],
      duration: 'Sürekli',
      difficulty: 'Orta',
      price: 'Premium'
    },
    {
      id: 'vegan',
      title: 'Vegan Beslenme Planı',
      description: 'Bitkisel temelli beslenme programı',
      icon: 'leaf-outline',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#8BC34A'],
      features: [
        'Bitkisel protein kaynakları',
        'B12 ve D vitamini takviyesi',
        'Demir emilimi artırma',
        'Çeşitli sebze ve meyve',
        'Sürdürülebilir beslenme',
        'Etik beslenme rehberi'
      ],
      duration: '6 hafta',
      difficulty: 'Kolay',
      price: 'Ücretsiz'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleStartPlan = () => {
    if (!selectedPlan) {
      Alert.alert('Hata', 'Lütfen bir beslenme planı seçin');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('DailyMealPlan', {
        plan: mealPlans.find(p => p.id === selectedPlan),
        progress: { week: 1, day: 1, completed: 0 }
      });
    }, 1500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return '#4CAF50';
      case 'Orta': return '#FF9800';
      case 'Zor': return '#F44336';
      default: return '#666';
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'Ücretsiz': return '#4CAF50';
      case 'Premium': return '#FF9800';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Beslenme Planları</Text>
          <Text style={styles.subtitle}>
            DNA analizinize göre kişiselleştirilmiş beslenme planlarınız
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          {mealPlans.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan
              ]}
              onPress={() => handlePlanSelect(plan.id)}
            >
              <LinearGradient
                colors={selectedPlan === plan.id ? plan.gradient : ['#fff', '#fff']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <View style={[
                    styles.planIcon,
                    { backgroundColor: selectedPlan === plan.id ? 'rgba(255,255,255,0.2)' : plan.color + '20' }
                  ]}>
                    <Ionicons 
                      name={plan.icon as any} 
                      size={24} 
                      color={selectedPlan === plan.id ? '#fff' : plan.color} 
                    />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={[
                      styles.planTitle,
                      { color: selectedPlan === plan.id ? '#fff' : '#333' }
                    ]}>
                      {plan.title}
                    </Text>
                    <Text style={[
                      styles.planDescription,
                      { color: selectedPlan === plan.id ? 'rgba(255,255,255,0.9)' : '#666' }
                    ]}>
                      {plan.description}
                    </Text>
                  </View>
                  {selectedPlan === plan.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.slice(0, 3).map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureItem}>
                      <Ionicons 
                        name="checkmark" 
                        size={16} 
                        color={selectedPlan === plan.id ? '#fff' : plan.color} 
                      />
                      <Text style={[
                        styles.featureText,
                        { color: selectedPlan === plan.id ? 'rgba(255,255,255,0.9)' : '#666' }
                      ]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.planFooter}>
                  <View style={styles.planMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons 
                        name="time" 
                        size={16} 
                        color={selectedPlan === plan.id ? '#fff' : '#666'} 
                      />
                      <Text style={[
                        styles.metaText,
                        { color: selectedPlan === plan.id ? '#fff' : '#666' }
                      ]}>
                        {plan.duration}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons 
                        name="speedometer" 
                        size={16} 
                        color={selectedPlan === plan.id ? '#fff' : getDifficultyColor(plan.difficulty)} 
                      />
                      <Text style={[
                        styles.metaText,
                        { color: selectedPlan === plan.id ? '#fff' : getDifficultyColor(plan.difficulty) }
                      ]}>
                        {plan.difficulty}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons 
                        name="card" 
                        size={16} 
                        color={selectedPlan === plan.id ? '#fff' : getPriceColor(plan.price)} 
                      />
                      <Text style={[
                        styles.metaText,
                        { color: selectedPlan === plan.id ? '#fff' : getPriceColor(plan.price) }
                      ]}>
                        {plan.price}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { opacity: selectedPlan ? 1 : 0.5 }
          ]}
          onPress={handleStartPlan}
          disabled={!selectedPlan || isLoading}
        >
          <LinearGradient
            colors={selectedPlan ? ['#4CAF50', '#66BB6A'] : ['#E0E0E0', '#BDBDBD']}
            style={styles.startGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <Text style={styles.startButtonText}>Yükleniyor...</Text>
            ) : (
              <>
                <Ionicons 
                  name="play" 
                  size={24} 
                  color={selectedPlan ? '#fff' : '#999'} 
                />
                <Text style={[
                  styles.startButtonText,
                  { color: selectedPlan ? '#fff' : '#999' }
                ]}>
                  Planı Başlat
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoTitle}>Beslenme Planı Hakkında</Text>
          </View>
          <Text style={styles.infoText}>
            Seçtiğiniz beslenme planı DNA analizinize göre kişiselleştirilir. 
            Plan süresince günlük menüler, besin değerleri ve ilerleme takibi 
            sağlanır. Düzenli olarak planınızı güncelleyebilir ve hedeflerinize 
            ulaşabilirsiniz.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  planFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  planMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});