import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';
import InteractiveElement from '../components/InteractiveElement';

type DailyTipsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DailyTips'>;

interface Props {
  navigation: DailyTipsScreenNavigationProp;
}

const { width } = Dimensions.get('window');

interface DailyTip {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'health' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  geneticRelevance: string;
  actionItems: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  date: string;
}

export default function DailyTipsScreen({ navigation }: Props) {
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [hasDNAData, setHasDNAData] = useState(false);

  const categories = [
    { id: 'all', name: 'Tümü', icon: 'apps', color: Theme.colors.primary[500] },
    { id: 'nutrition', name: 'Beslenme', icon: 'nutrition', color: Theme.colors.semantic.success },
    { id: 'exercise', name: 'Egzersiz', icon: 'fitness', color: Theme.colors.semantic.warning },
    { id: 'sleep', name: 'Uyku', icon: 'moon', color: Theme.colors.secondary[500] },
    { id: 'health', name: 'Sağlık', icon: 'medical', color: Theme.colors.semantic.error },
    { id: 'lifestyle', name: 'Yaşam Tarzı', icon: 'leaf', color: Theme.colors.accent.amber },
  ];

  useEffect(() => {
    loadTips();
    checkDNAStatus();
  }, []);

  const loadTips = async () => {
    try {
      const savedTips = await AsyncStorage.getItem('dailyTips');
      if (savedTips) {
        setTips(JSON.parse(savedTips));
      } else {
        generateDefaultTips();
      }
    } catch (error) {
      console.error('İpuçları yükleme hatası:', error);
      generateDefaultTips();
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

  const generateDefaultTips = () => {
    const defaultTips: DailyTip[] = [
      {
        id: '1',
        title: 'Su İçme Alışkanlığı',
        description: 'Günde en az 8 bardak su içmeyi hedefleyin. Su, vücudunuzun optimal çalışması için kritik öneme sahiptir.',
        category: 'nutrition',
        priority: 'high',
        geneticRelevance: 'Hidrasyon genleriniz optimal su alımını destekliyor',
        actionItems: [
          'Sabah kalktığınızda 1 bardak su için',
          'Her yemekten önce 1 bardak su için',
          'Su içmeyi hatırlatmak için telefon uygulaması kullanın'
        ],
        estimatedTime: '5 dakika',
        difficulty: 'easy',
        completed: false,
        date: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Yürüyüş Yapın',
        description: 'Günde en az 30 dakika tempolu yürüyüş yapın. Bu, kardiyovasküler sağlığınızı iyileştirir.',
        category: 'exercise',
        priority: 'high',
        geneticRelevance: 'Aktif yaşam tarzı genleriniz yürüyüşü destekliyor',
        actionItems: [
          'Sabah veya akşam 30 dakika yürüyüş yapın',
          'Mümkünse doğada yürüyüş yapın',
          'Adım sayar uygulaması kullanın'
        ],
        estimatedTime: '30 dakika',
        difficulty: 'easy',
        completed: false,
        date: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Düzenli Uyku Saatleri',
        description: 'Her gün aynı saatte yatın ve kalkın. Düzenli uyku, vücudunuzun doğal ritmini korur.',
        category: 'sleep',
        priority: 'high',
        geneticRelevance: 'Uyku genleriniz düzenli saatleri tercih ediyor',
        actionItems: [
          'Yatmadan 1 saat önce elektronik cihazları kapatın',
          'Yatak odanızı serin ve karanlık tutun',
          'Rahatlatıcı müzik dinleyin'
        ],
        estimatedTime: '1 saat',
        difficulty: 'medium',
        completed: false,
        date: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Stres Yönetimi',
        description: 'Günlük stres seviyenizi kontrol altında tutun. Meditasyon ve nefes egzersizleri yapın.',
        category: 'health',
        priority: 'medium',
        geneticRelevance: 'Stres genleriniz meditasyonu destekliyor',
        actionItems: [
          'Günde 10 dakika meditasyon yapın',
          'Derin nefes egzersizleri uygulayın',
          'Stresli durumlarda 5 dakika mola verin'
        ],
        estimatedTime: '15 dakika',
        difficulty: 'medium',
        completed: false,
        date: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Meyve ve Sebze Tüketimi',
        description: 'Günde en az 5 porsiyon meyve ve sebze tüketin. Renkli beslenme, antioksidan alımını artırır.',
        category: 'nutrition',
        priority: 'high',
        geneticRelevance: 'Antioksidan genleriniz renkli beslenmeyi destekliyor',
        actionItems: [
          'Her öğünde en az 1 porsiyon sebze tüketin',
          'Ara öğünlerde meyve yiyin',
          'Smoothie yaparak meyve-sebze karışımı hazırlayın'
        ],
        estimatedTime: '10 dakika',
        difficulty: 'easy',
        completed: false,
        date: new Date().toISOString()
      }
    ];

    setTips(defaultTips);
    AsyncStorage.setItem('dailyTips', JSON.stringify(defaultTips));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTips();
    setRefreshing(false);
  };

  const toggleTipCompletion = async (tipId: string) => {
    const updatedTips = tips.map(tip => 
      tip.id === tipId ? { ...tip, completed: !tip.completed } : tip
    );
    setTips(updatedTips);
    await AsyncStorage.setItem('dailyTips', JSON.stringify(updatedTips));
  };

  const getFilteredTips = () => {
    if (selectedCategory === 'all') {
      return tips;
    }
    return tips.filter(tip => tip.category === selectedCategory);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Theme.colors.semantic.error;
      case 'medium': return Theme.colors.semantic.warning;
      case 'low': return Theme.colors.semantic.success;
      default: return Theme.colors.text.tertiary;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Theme.colors.semantic.success;
      case 'medium': return Theme.colors.semantic.warning;
      case 'hard': return Theme.colors.semantic.error;
      default: return Theme.colors.text.tertiary;
    }
  };

  const renderTipCard = (tip: DailyTip) => (
    <ProfessionalCard key={tip.id} variant="elevated" size="lg" style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipInfo}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <InteractiveElement
            content={tip.description}
            maxLines={2}
            expandText="Devamını oku"
            collapseText="Daha az göster"
            contentStyle={styles.tipDescription}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.completeButton,
            tip.completed && styles.completedButton
          ]}
          onPress={() => toggleTipCompletion(tip.id)}
        >
          <Ionicons
            name={tip.completed ? 'checkmark' : 'add'}
            size={20}
            color={tip.completed ? '#fff' : Theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tipMeta}>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor(tip.priority) + '20' }
        ]}>
          <Text style={[
            styles.priorityText,
            { color: getPriorityColor(tip.priority) }
          ]}>
            {tip.priority === 'high' ? 'Yüksek' : 
             tip.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
          </Text>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(tip.difficulty) + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: getDifficultyColor(tip.difficulty) }
          ]}>
            {tip.difficulty === 'easy' ? 'Kolay' : 
             tip.difficulty === 'medium' ? 'Orta' : 'Zor'}
          </Text>
        </View>
        <Text style={styles.timeText}>{tip.estimatedTime}</Text>
      </View>

      <View style={styles.geneticRelevance}>
        <Text style={styles.geneticTitle}>Genetik İlgisi:</Text>
        <Text style={styles.geneticText}>{tip.geneticRelevance}</Text>
      </View>

      <View style={styles.actionItems}>
        <Text style={styles.actionTitle}>Yapılacaklar:</Text>
        {tip.actionItems.map((item, index) => (
          <View key={index} style={styles.actionItem}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.primary[500]} />
            <Text style={styles.actionText}>{item}</Text>
          </View>
        ))}
      </View>
    </ProfessionalCard>
  );

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
        <Text style={styles.headerTitle}>Günlük İpuçları</Text>
        <Text style={styles.headerSubtitle}>
          DNA analizinize göre kişiselleştirilmiş günlük öneriler
        </Text>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
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
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!hasDNAData && (
          <ProfessionalCard variant="elevated" size="md" style={styles.dnaCard}>
            <View style={styles.dnaCardHeader}>
              <Ionicons name="dna" size={24} color={Theme.colors.primary[600]} />
              <Text style={styles.dnaCardTitle}>DNA Analizi Gerekli</Text>
            </View>
            <Text style={styles.dnaCardText}>
              Kişiselleştirilmiş ipuçları almak için önce DNA analizinizi yapın.
            </Text>
            <ProfessionalButton
              title="DNA Analizi Yap"
              variant="gradient"
              gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
              icon="dna"
              iconPosition="left"
              onPress={() => navigation.navigate('DNAUpload')}
              style={styles.dnaButton}
            />
          </ProfessionalCard>
        )}

        {getFilteredTips().map(renderTipCard)}
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
    padding: Theme.spacing.lg,
  },
  dnaCard: {
    marginBottom: Theme.spacing.lg,
  },
  dnaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  dnaCardTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  dnaCardText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  dnaButton: {
    width: '100%',
  },
  tipCard: {
    marginBottom: Theme.spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  tipDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
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
  difficultyBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  timeText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },
  geneticRelevance: {
    backgroundColor: Theme.colors.primary[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  geneticTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.primary[700],
    marginBottom: Theme.spacing.xs,
  },
  geneticText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal,
  },
  actionItems: {
    marginTop: Theme.spacing.sm,
  },
  actionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  actionText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
});