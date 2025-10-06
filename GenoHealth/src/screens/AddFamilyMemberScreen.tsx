import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { FamilyManagementService, FamilyMember } from '../services/FamilyManagementService';
import Theme from '../constants/Theme';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalButton from '../components/ProfessionalButton';

type AddFamilyMemberScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddFamilyMember'>;

interface Props {
  navigation: AddFamilyMemberScreenNavigationProp;
  route: {
    params: {
      familyId: string;
    };
  };
}

const { width } = Dimensions.get('window');

const RELATIONSHIPS = [
  { key: 'parent', label: 'Ebeveyn', icon: 'people' },
  { key: 'sibling', label: 'Kardeş', icon: 'person' },
  { key: 'child', label: 'Çocuk', icon: 'child' },
  { key: 'grandparent', label: 'Büyükanne/Büyükbaba', icon: 'person-circle' },
  { key: 'aunt_uncle', label: 'Teyze/Amca', icon: 'person-outline' },
  { key: 'cousin', label: 'Kuzen', icon: 'people-outline' },
  { key: 'spouse', label: 'Eş', icon: 'heart' },
  { key: 'other', label: 'Diğer', icon: 'person-add' },
];

const GENDERS = [
  { key: 'male', label: 'Erkek', icon: 'male' },
  { key: 'female', label: 'Kadın', icon: 'female' },
  { key: 'other', label: 'Diğer', icon: 'person' },
];

export default function AddFamilyMemberScreen({ navigation, route }: Props) {
  const { familyId } = route.params;
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'parent' as FamilyMember['relationship'],
    gender: 'male' as FamilyMember['gender'],
    birthDate: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Doğum tarihi gereklidir';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        newErrors.birthDate = 'Geçerli bir doğum tarihi girin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const familyService = FamilyManagementService.getInstance();
      await familyService.initialize();

      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      await familyService.addFamilyMember(familyId, {
        name: formData.name.trim(),
        relationship: formData.relationship,
        gender: formData.gender,
        birthDate: formData.birthDate,
        age,
      });

      Alert.alert(
        'Başarılı',
        'Aile üyesi başarıyla eklendi!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Add family member error:', error);
      Alert.alert('Hata', 'Aile üyesi eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.headerTitle}>Aile Üyesi Ekle</Text>
            <Text style={styles.headerSubtitle}>Yeni aile üyesi bilgilerini girin</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View 
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.formCard}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        
        {/* Ad Soyad */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ad Soyad *</Text>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color={Theme.colors.neutral[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ad soyad girin"
              placeholderTextColor={Theme.colors.neutral[500]}
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Doğum Tarihi */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Doğum Tarihi *</Text>
          <View style={[styles.inputContainer, errors.birthDate && styles.inputError]}>
            <Ionicons name="calendar-outline" size={20} color={Theme.colors.neutral[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Theme.colors.neutral[500]}
              value={formData.birthDate}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, birthDate: text }));
                if (errors.birthDate) {
                  setErrors(prev => ({ ...prev, birthDate: '' }));
                }
              }}
              keyboardType="numeric"
            />
          </View>
          {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
        </View>

        {/* Akrabalık İlişkisi */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Akrabalık İlişkisi *</Text>
          <View style={styles.relationshipGrid}>
            {RELATIONSHIPS.map((relationship) => (
              <TouchableOpacity
                key={relationship.key}
                style={[
                  styles.relationshipButton,
                  formData.relationship === relationship.key && styles.relationshipButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, relationship: relationship.key as FamilyMember['relationship'] }))}
              >
                <Ionicons
                  name={relationship.icon as any}
                  size={24}
                  color={formData.relationship === relationship.key ? 'white' : Theme.colors.primary[500]}
                />
                <Text style={[
                  styles.relationshipText,
                  formData.relationship === relationship.key && styles.relationshipTextActive,
                ]}>
                  {relationship.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cinsiyet */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cinsiyet *</Text>
          <View style={styles.genderContainer}>
            {GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender.key}
                style={[
                  styles.genderButton,
                  formData.gender === gender.key && styles.genderButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, gender: gender.key as FamilyMember['gender'] }))}
              >
                <Ionicons
                  name={gender.icon as any}
                  size={24}
                  color={formData.gender === gender.key ? 'white' : Theme.colors.primary[500]}
                />
                <Text style={[
                  styles.genderText,
                  formData.gender === gender.key && styles.genderTextActive,
                ]}>
                  {gender.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  const renderPreview = () => (
    <Animated.View 
      style={[
        styles.previewContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ProfessionalCard variant="elevated" style={styles.previewCard}>
        <Text style={styles.sectionTitle}>Önizleme</Text>
        
        <View style={styles.previewContent}>
          <View style={styles.avatarContainer}>
            <Ionicons 
              name={formData.gender === 'male' ? 'male' : formData.gender === 'female' ? 'female' : 'person'} 
              size={48} 
              color={Theme.colors.primary[500]} 
            />
          </View>
          
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>
              {formData.name || 'Ad Soyad'}
            </Text>
            <Text style={styles.previewRelationship}>
              {RELATIONSHIPS.find(r => r.key === formData.relationship)?.label || 'Akrabalık'}
            </Text>
            <Text style={styles.previewGender}>
              {GENDERS.find(g => g.key === formData.gender)?.label || 'Cinsiyet'}
            </Text>
            {formData.birthDate && (
              <Text style={styles.previewAge}>
                {new Date().getFullYear() - new Date(formData.birthDate).getFullYear()} yaşında
              </Text>
            )}
          </View>
        </View>
      </ProfessionalCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[500]} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
        {renderPreview()}
        
        <View style={styles.buttonContainer}>
          <ProfessionalButton
            title="Aile Üyesi Ekle"
            variant="gradient"
            gradient={[Theme.colors.primary[500], Theme.colors.primary[600]]}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  formContainer: {
    marginBottom: Theme.spacing.lg,
  },
  formCard: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    paddingHorizontal: Theme.spacing.md,
    height: 50,
  },
  inputError: {
    borderColor: Theme.colors.semantic.error,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.semantic.error,
    marginTop: Theme.spacing.xs,
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  relationshipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    minWidth: (width - Theme.spacing.lg * 2 - Theme.spacing.sm * 2) / 2,
  },
  relationshipButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  relationshipText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  relationshipTextActive: {
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.xs,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
  genderButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  genderText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  genderTextActive: {
    color: 'white',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  previewContainer: {
    marginBottom: Theme.spacing.lg,
  },
  previewCard: {
    padding: Theme.spacing.lg,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.lg,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  previewRelationship: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  previewGender: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
    marginBottom: Theme.spacing.xs,
  },
  previewAge: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.fontWeight.medium,
  },
  buttonContainer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing['4xl'],
  },
  submitButton: {
    marginHorizontal: Theme.spacing.md,
  },
});