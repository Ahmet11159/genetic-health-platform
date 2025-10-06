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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type SupplementsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Supplements'>;
type SupplementsScreenRouteProp = RouteProp<RootStackParamList, 'Supplements'>;

interface Props {
  navigation: SupplementsScreenNavigationProp;
  route: SupplementsScreenRouteProp;
}

const { width } = Dimensions.get('window');

export default function SupplementsScreen({ navigation, route }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('essential');
  const [selectedSupplements, setSelectedSupplements] = useState<Set<string>>(new Set());
  const [dosageReminders, setDosageReminders] = useState<Map<string, boolean>>(new Map());
  
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

  const supplementCategories = [
    { id: 'essential', name: 'Temel Vitaminler', icon: 'medical', color: '#4CAF50' },
    { id: 'genetic', name: 'Genetik Özel', icon: 'dna', color: '#2196F3' },
    { id: 'performance', name: 'Performans', icon: 'fitness', color: '#FF9800' },
    { id: 'immune', name: 'Bağışıklık', icon: 'shield', color: '#E91E63' },
    { id: 'cognitive', name: 'Bilişsel', icon: 'brain', color: '#9C27B0' },
    { id: 'detox', name: 'Detoks', icon: 'leaf', color: '#8BC34A' },
  ];

  const supplements = {
    essential: [
      {
        id: 'vitamin_d',
        name: 'D Vitamini',
        description: 'Kemik sağlığı ve bağışıklık sistemi için gerekli',
        dosage: '2000 IU/gün',
        timing: 'Sabah yemekle',
        benefits: [
          'Kemik yoğunluğunu artırır',
          'Bağışıklık sistemini güçlendirir',
          'Kas fonksiyonlarını iyileştirir',
          'Kalp sağlığını destekler'
        ],
        geneticRelevance: 'MTHFR geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'A',
        price: '₺45',
        brand: 'Solgar',
        priority: 'high'
      },
      {
        id: 'omega3',
        name: 'Omega-3',
        description: 'Kalp ve beyin sağlığı için esansiyel yağ asitleri',
        dosage: '1000mg/gün',
        timing: 'Yemekle',
        benefits: [
          'Kalp sağlığını destekler',
          'Beyin fonksiyonlarını iyileştirir',
          'İnflamasyonu azaltır',
          'Göz sağlığını korur'
        ],
        geneticRelevance: 'FADS1 geni varyantı nedeniyle metabolizma sorunu',
        evidenceLevel: 'A',
        price: '₺85',
        brand: 'Nordic Naturals',
        priority: 'high'
      },
      {
        id: 'magnesium',
        name: 'Magnezyum',
        description: 'Kas ve sinir fonksiyonları için gerekli mineral',
        dosage: '400mg/gün',
        timing: 'Akşam yatmadan önce',
        benefits: [
          'Kas kramplarını önler',
          'Uyku kalitesini artırır',
          'Stres seviyesini azaltır',
          'Kalp ritmini düzenler'
        ],
        geneticRelevance: 'TRPM6 geni varyantı nedeniyle emilim sorunu',
        evidenceLevel: 'B',
        price: '₺35',
        brand: 'Thorne',
        priority: 'medium'
      }
    ],
    genetic: [
      {
        id: 'folate',
        name: 'Methylfolate (B9)',
        description: 'DNA sentezi ve hücre bölünmesi için gerekli',
        dosage: '800mcg/gün',
        timing: 'Sabah yemekle',
        benefits: [
          'DNA sentezini destekler',
          'Homosistein seviyesini düşürür',
          'Kardiyovasküler sağlığı korur',
          'Nörolojik fonksiyonları iyileştirir'
        ],
        geneticRelevance: 'MTHFR C677T varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'A',
        price: '₺65',
        brand: 'Jarrow Formulas',
        priority: 'high'
      },
      {
        id: 'b12',
        name: 'Methylcobalamin (B12)',
        description: 'Sinir sistemi ve kan hücreleri için gerekli',
        dosage: '1000mcg/gün',
        timing: 'Sabah aç karnına',
        benefits: [
          'Sinir sistemini korur',
          'Enerji üretimini artırır',
          'Hafızayı güçlendirir',
          'Anemi riskini azaltır'
        ],
        geneticRelevance: 'MTRR geni varyantı nedeniyle metabolizma sorunu',
        evidenceLevel: 'A',
        price: '₺55',
        brand: 'Pure Encapsulations',
        priority: 'high'
      },
      {
        id: 'coq10',
        name: 'CoQ10',
        description: 'Hücresel enerji üretimi için gerekli koenzim',
        dosage: '200mg/gün',
        timing: 'Yemekle',
        benefits: [
          'Hücresel enerji üretimini artırır',
          'Kalp sağlığını destekler',
          'Yaşlanma sürecini yavaşlatır',
          'Kas performansını iyileştirir'
        ],
        geneticRelevance: 'COQ2 geni varyantı nedeniyle üretim sorunu',
        evidenceLevel: 'B',
        price: '₺120',
        brand: 'Life Extension',
        priority: 'medium'
      }
    ],
    performance: [
      {
        id: 'creatine',
        name: 'Kreatin Monohidrat',
        description: 'Kas gücü ve dayanıklılık için gerekli',
        dosage: '5g/gün',
        timing: 'Antrenman sonrası',
        benefits: [
          'Kas gücünü artırır',
          'Dayanıklılığı iyileştirir',
          'Kas kütlesini artırır',
          'Toparlanma süresini kısaltır'
        ],
        geneticRelevance: 'ACTN3 geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'A',
        price: '₺75',
        brand: 'Optimum Nutrition',
        priority: 'high'
      },
      {
        id: 'beta_alanine',
        name: 'Beta-Alanin',
        description: 'Kas yorgunluğunu geciktiren amino asit',
        dosage: '3g/gün',
        timing: 'Antrenman öncesi',
        benefits: [
          'Kas yorgunluğunu geciktirir',
          'Antrenman süresini uzatır',
          'Kas dayanıklılığını artırır',
          'Performansı iyileştirir'
        ],
        geneticRelevance: 'CARNOS1 geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'B',
        price: '₺45',
        brand: 'NOW Foods',
        priority: 'medium'
      }
    ],
    immune: [
      {
        id: 'vitamin_c',
        name: 'C Vitamini',
        description: 'Bağışıklık sistemi için gerekli antioksidan',
        dosage: '1000mg/gün',
        timing: 'Sabah yemekle',
        benefits: [
          'Bağışıklık sistemini güçlendirir',
          'Antioksidan etki sağlar',
          'Kollajen sentezini destekler',
          'Demir emilimini artırır'
        ],
        geneticRelevance: 'GULO geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'A',
        price: '₺25',
        brand: 'Nature\'s Bounty',
        priority: 'high'
      },
      {
        id: 'zinc',
        name: 'Çinko',
        description: 'Bağışıklık sistemi ve yara iyileşmesi için gerekli',
        dosage: '15mg/gün',
        timing: 'Yemekle',
        benefits: [
          'Bağışıklık sistemini güçlendirir',
          'Yara iyileşmesini hızlandırır',
          'Tat ve koku duyusunu korur',
          'Hormon üretimini destekler'
        ],
        geneticRelevance: 'SLC30A8 geni varyantı nedeniyle emilim sorunu',
        evidenceLevel: 'B',
        price: '₺30',
        brand: 'Garden of Life',
        priority: 'medium'
      }
    ],
    cognitive: [
      {
        id: 'lions_mane',
        name: 'Aslan Yelesi Mantarı',
        description: 'Beyin sağlığı ve nöroplastisite için adaptojen',
        dosage: '1000mg/gün',
        timing: 'Sabah aç karnına',
        benefits: [
          'Hafızayı güçlendirir',
          'Odaklanmayı artırır',
          'Nöroplastisiteyi destekler',
          'Bilişsel performansı iyileştirir'
        ],
        geneticRelevance: 'BDNF geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'B',
        price: '₺95',
        brand: 'Host Defense',
        priority: 'medium'
      },
      {
        id: 'bacopa',
        name: 'Bacopa Monnieri',
        description: 'Geleneksel Ayurveda bitkisi, hafıza ve öğrenme için',
        dosage: '300mg/gün',
        timing: 'Sabah yemekle',
        benefits: [
          'Hafızayı güçlendirir',
          'Öğrenme kapasitesini artırır',
          'Stres seviyesini azaltır',
          'Bilişsel yaşlanmayı yavaşlatır'
        ],
        geneticRelevance: 'COMT geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'B',
        price: '₺65',
        brand: 'Himalaya',
        priority: 'medium'
      }
    ],
    detox: [
      {
        id: 'milk_thistle',
        name: 'Deve Dikeni',
        description: 'Karaciğer sağlığı ve detoksifikasyon için',
        dosage: '500mg/gün',
        timing: 'Yemekle',
        benefits: [
          'Karaciğer sağlığını korur',
          'Detoksifikasyonu destekler',
          'Antioksidan etki sağlar',
          'Hücre yenilenmesini artırır'
        ],
        geneticRelevance: 'GST geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'B',
        price: '₺40',
        brand: 'Solaray',
        priority: 'medium'
      },
      {
        id: 'n_acetyl_cysteine',
        name: 'N-Acetyl Cysteine (NAC)',
        description: 'Glutatyon üretimi ve detoksifikasyon için',
        dosage: '600mg/gün',
        timing: 'Sabah aç karnına',
        benefits: [
          'Glutatyon üretimini artırır',
          'Detoksifikasyonu destekler',
          'Antioksidan etki sağlar',
          'Akciğer sağlığını korur'
        ],
        geneticRelevance: 'GSTM1 geni varyantı nedeniyle artırılmış ihtiyaç',
        evidenceLevel: 'A',
        price: '₺55',
        brand: 'Jarrow Formulas',
        priority: 'high'
      }
    ]
  };

  const handleSupplementSelect = (supplementId: string) => {
    const newSelected = new Set(selectedSupplements);
    if (newSelected.has(supplementId)) {
      newSelected.delete(supplementId);
    } else {
      newSelected.add(supplementId);
    }
    setSelectedSupplements(newSelected);
  };

  const handleDosageReminder = (supplementId: string) => {
    const newReminders = new Map(dosageReminders);
    newReminders.set(supplementId, !newReminders.get(supplementId));
    setDosageReminders(newReminders);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'A': return '#4CAF50';
      case 'B': return '#FF9800';
      case 'C': return '#F44336';
      default: return '#666';
    }
  };

  const getTotalPrice = () => {
    let total = 0;
    selectedSupplements.forEach(supplementId => {
      Object.values(supplements).flat().forEach(supplement => {
        if (supplement.id === supplementId) {
          total += parseInt(supplement.price.replace('₺', ''));
        }
      });
    });
    return total;
  };

  const renderSupplements = () => {
    const categorySupplements = supplements[selectedCategory as keyof typeof supplements] || [];
    
    return (
      <View style={styles.supplementsContainer}>
        {categorySupplements.map((supplement, index) => (
          <ProfessionalCard key={supplement.id} variant="elevated" size="lg" style={styles.supplementCard}>
            <View style={styles.supplementHeader}>
              <View style={styles.supplementInfo}>
                <Text style={styles.supplementName}>{supplement.name}</Text>
                <Text style={styles.supplementDescription}>{supplement.description}</Text>
                <View style={styles.supplementMeta}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(supplement.priority) + '20' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: getPriorityColor(supplement.priority) }
                    ]}>
                      {supplement.priority === 'high' ? 'Yüksek' : 
                       supplement.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                    </Text>
                  </View>
                  <View style={[
                    styles.evidenceBadge,
                    { backgroundColor: getEvidenceColor(supplement.evidenceLevel) + '20' }
                  ]}>
                    <Text style={[
                      styles.evidenceText,
                      { color: getEvidenceColor(supplement.evidenceLevel) }
                    ]}>
                      Kanıt Seviyesi: {supplement.evidenceLevel}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selectedSupplements.has(supplement.id) && styles.selectedButton
                ]}
                onPress={() => handleSupplementSelect(supplement.id)}
              >
                <Ionicons
                  name={selectedSupplements.has(supplement.id) ? 'checkmark' : 'add'}
                  size={20}
                  color={selectedSupplements.has(supplement.id) ? '#fff' : '#4CAF50'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.supplementDetails}>
              <View style={styles.dosageInfo}>
                <View style={styles.dosageItem}>
                  <Ionicons name="flask" size={16} color="#666" />
                  <Text style={styles.dosageText}>{supplement.dosage}</Text>
                </View>
                <View style={styles.dosageItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.dosageText}>{supplement.timing}</Text>
                </View>
                <View style={styles.dosageItem}>
                  <Ionicons name="card" size={16} color="#666" />
                  <Text style={styles.dosageText}>{supplement.price}</Text>
                </View>
                <View style={styles.dosageItem}>
                  <Ionicons name="business" size={16} color="#666" />
                  <Text style={styles.dosageText}>{supplement.brand}</Text>
                </View>
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Faydaları:</Text>
                {supplement.benefits.map((benefit, benefitIndex) => (
                  <View key={benefitIndex} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.geneticRelevance}>
                <Text style={styles.geneticTitle}>Genetik İlgisi:</Text>
                <Text style={styles.geneticText}>{supplement.geneticRelevance}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.reminderButton,
                  dosageReminders.get(supplement.id) && styles.activeReminder
                ]}
                onPress={() => handleDosageReminder(supplement.id)}
              >
                <Ionicons
                  name={dosageReminders.get(supplement.id) ? 'notifications' : 'notifications-outline'}
                  size={16}
                  color={dosageReminders.get(supplement.id) ? '#fff' : '#666'}
                />
                <Text style={[
                  styles.reminderText,
                  { color: dosageReminders.get(supplement.id) ? '#fff' : '#666' }
                ]}>
                  Hatırlatıcı {dosageReminders.get(supplement.id) ? 'Açık' : 'Kapalı'}
                </Text>
              </TouchableOpacity>
            </View>
          </ProfessionalCard>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[800]} />
      
      {/* Header */}
      <LinearGradient
        colors={[Theme.colors.primary[800], Theme.colors.primary[600], Theme.colors.primary[500]]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Takviye Önerileri</Text>
        <Text style={styles.headerSubtitle}>
          DNA analizinize göre kişiselleştirilmiş takviye önerileri
        </Text>
      </LinearGradient>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {supplementCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.activeCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#fff' : category.color}
              />
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? '#fff' : category.color }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderSupplements()}
        </Animated.View>
      </ScrollView>

      {/* Bottom Summary */}
      {selectedSupplements.size > 0 && (
        <View style={styles.bottomSummary}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryText}>
              {selectedSupplements.size} takviye seçildi
            </Text>
            <Text style={styles.summaryPrice}>
              Toplam: ₺{getTotalPrice()}
            </Text>
          </View>
          <ProfessionalButton
            title="Sipariş Ver"
            variant="gradient"
            gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
            icon="cart"
            iconPosition="left"
            onPress={() => Alert.alert('Sipariş', 'Takviye siparişi özelliği yakında eklenecek')}
            style={styles.orderButton}
          />
        </View>
      )}
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
  backButton: {
    position: 'absolute',
    top: Theme.spacing['3xl'],
    left: Theme.spacing.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: Theme.colors.background.primary,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.neutral[100],
  },
  activeCategory: {
    backgroundColor: Theme.colors.primary[500],
  },
  categoryText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginLeft: Theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.lg,
  },
  supplementsContainer: {
    gap: Theme.spacing.lg,
  },
  supplementCard: {
    marginBottom: Theme.spacing.md,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  supplementDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal,
    marginBottom: Theme.spacing.md,
  },
  supplementMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  priorityText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  evidenceBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  evidenceText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  supplementDetails: {
    gap: Theme.spacing.lg,
  },
  dosageInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dosageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dosageText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  geneticRelevance: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  geneticTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  geneticText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  activeReminder: {
    backgroundColor: '#4CAF50',
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 2,
  },
  orderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  orderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});