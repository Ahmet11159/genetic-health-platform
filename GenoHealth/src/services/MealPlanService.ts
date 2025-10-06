// Haftalık beslenme planları servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // dakika
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[]; // 'vegan', 'gluten-free', 'high-protein', etc.
  imageUrl?: string;
}

export interface DayPlan {
  day: number; // 1-7
  date: string;
  meals: {
    breakfast: Meal;
    snack1: Meal;
    lunch: Meal;
    snack2: Meal;
    dinner: Meal;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completed: boolean;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  description: string;
  category: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'detox' | 'mediterranean' | 'keto' | 'vegan';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // hafta sayısı
  targetCalories: number;
  targetProtein: number;
  days: DayPlan[];
  createdAt: string;
  isActive: boolean;
  progress: number; // 0-100
}

export interface UserProgress {
  currentPlanId: string;
  currentWeek: number;
  currentDay: number;
  completedDays: number[];
  streak: number;
  totalWeeksCompleted: number;
  achievements: string[];
  lastActiveDate: string;
}

export class MealPlanService {
  private static readonly STORAGE_KEYS = {
    USER_PROGRESS: 'user_progress',
    ACTIVE_PLANS: 'active_plans',
    COMPLETED_PLANS: 'completed_plans',
    USER_PREFERENCES: 'user_preferences'
  };

  // Haftalık beslenme planları oluştur
  static async generateWeeklyPlans(geneticProfile: any): Promise<WeeklyPlan[]> {
    const plans: WeeklyPlan[] = [];

    // 1. Kilo Verme Planı
    plans.push({
      id: 'weight_loss_1',
      name: 'Genetik Kilo Verme Programı',
      description: 'DNA analizinize göre optimize edilmiş kilo verme planı',
      category: 'weight_loss',
      difficulty: 'beginner',
      duration: 4,
      targetCalories: 1500,
      targetProtein: 120,
      days: await this.generateDayPlans('weight_loss', geneticProfile),
      createdAt: new Date().toISOString(),
      isActive: false,
      progress: 0
    });

    // 2. Kas Geliştirme Planı
    plans.push({
      id: 'muscle_gain_1',
      name: 'Genetik Kas Geliştirme Programı',
      description: 'Genetik profilinize uygun kas geliştirme beslenme planı',
      category: 'muscle_gain',
      difficulty: 'intermediate',
      duration: 6,
      targetCalories: 2200,
      targetProtein: 180,
      days: await this.generateDayPlans('muscle_gain', geneticProfile),
      createdAt: new Date().toISOString(),
      isActive: false,
      progress: 0
    });

    // 3. Sağlıklı Yaşam Planı
    plans.push({
      id: 'maintenance_1',
      name: 'Genetik Sağlıklı Yaşam Programı',
      description: 'DNA analizinize göre optimize edilmiş sağlıklı beslenme',
      category: 'maintenance',
      difficulty: 'beginner',
      duration: 8,
      targetCalories: 1800,
      targetProtein: 140,
      days: await this.generateDayPlans('maintenance', geneticProfile),
      createdAt: new Date().toISOString(),
      isActive: false,
      progress: 0
    });

    // 4. Detoks Planı
    plans.push({
      id: 'detox_1',
      name: 'Genetik Detoks Programı',
      description: 'Genetik detoksifikasyon kapasitenize göre plan',
      category: 'detox',
      difficulty: 'intermediate',
      duration: 2,
      targetCalories: 1200,
      targetProtein: 100,
      days: await this.generateDayPlans('detox', geneticProfile),
      createdAt: new Date().toISOString(),
      isActive: false,
      progress: 0
    });

    return plans;
  }

  // Günlük planlar oluştur
  private static async generateDayPlans(category: string, geneticProfile: any): Promise<DayPlan[]> {
    const days: DayPlan[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i - 1);

      const dayPlan: DayPlan = {
        day: i,
        date: date.toISOString().split('T')[0],
        meals: {
          breakfast: this.generateMeal('breakfast', category, geneticProfile),
          snack1: this.generateMeal('snack1', category, geneticProfile),
          lunch: this.generateMeal('lunch', category, geneticProfile),
          snack2: this.generateMeal('snack2', category, geneticProfile),
          dinner: this.generateMeal('dinner', category, geneticProfile)
        },
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        completed: false
      };

      // Toplam değerleri hesapla
      Object.values(dayPlan.meals).forEach(meal => {
        dayPlan.totalCalories += meal.calories;
        dayPlan.totalProtein += meal.protein;
        dayPlan.totalCarbs += meal.carbs;
        dayPlan.totalFat += meal.fat;
      });

      days.push(dayPlan);
    }

    return days;
  }

  // Öğün oluştur
  private static generateMeal(mealType: string, category: string, geneticProfile: any): Meal {
    const mealTemplates = this.getMealTemplates(mealType, category, geneticProfile);
    const randomMeal = mealTemplates[Math.floor(Math.random() * mealTemplates.length)];
    
    return {
      ...randomMeal,
      id: `${mealType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Öğün şablonları
  private static getMealTemplates(mealType: string, category: string, geneticProfile: any): Omit<Meal, 'id'>[] {
    const templates: { [key: string]: { [key: string]: Omit<Meal, 'id'>[] } } = {
      breakfast: {
        weight_loss: [
          {
            name: 'Protein Smoothie',
            description: 'Genetik profilinize uygun protein smoothie',
            calories: 250,
            protein: 25,
            carbs: 15,
            fat: 8,
            fiber: 5,
            ingredients: ['Protein tozu', 'Muz', 'Badem sütü', 'Chia tohumu', 'Ispanak'],
            instructions: ['Tüm malzemeleri blender\'a koyun', '2 dakika karıştırın', 'Hemen servis yapın'],
            prepTime: 5,
            difficulty: 'easy',
            tags: ['high-protein', 'quick', 'nutritious']
          },
          {
            name: 'Avokado Toast',
            description: 'Tam tahıl ekmek üzerinde avokado',
            calories: 300,
            protein: 12,
            carbs: 25,
            fat: 18,
            fiber: 8,
            ingredients: ['Tam tahıl ekmek', 'Avokado', 'Limon', 'Tuz', 'Kırmızı pul biber'],
            instructions: ['Ekmekleri kızartın', 'Avokadoyu ezin', 'Limon ve tuz ekleyin', 'Ekmek üzerine sürün'],
            prepTime: 10,
            difficulty: 'easy',
            tags: ['healthy-fats', 'fiber-rich', 'quick']
          }
        ],
        muscle_gain: [
          {
            name: 'Protein Pancake',
            description: 'Yüksek proteinli pancake',
            calories: 450,
            protein: 35,
            carbs: 40,
            fat: 15,
            fiber: 6,
            ingredients: ['Yumurta', 'Protein tozu', 'Yulaf', 'Muz', 'Badem yağı'],
            instructions: ['Malzemeleri karıştırın', 'Tavada pişirin', 'Bal ve meyve ile servis yapın'],
            prepTime: 15,
            difficulty: 'medium',
            tags: ['high-protein', 'muscle-building', 'energizing']
          }
        ],
        maintenance: [
          {
            name: 'Mediterranean Omelet',
            description: 'Akdeniz tarzı omlet',
            calories: 350,
            protein: 20,
            carbs: 12,
            fat: 25,
            fiber: 4,
            ingredients: ['Yumurta', 'Domates', 'Feta peyniri', 'Zeytin', 'Otlar'],
            instructions: ['Yumurtaları çırpın', 'Sebzeleri ekleyin', 'Tavada pişirin', 'Peynir ile servis yapın'],
            prepTime: 12,
            difficulty: 'easy',
            tags: ['mediterranean', 'protein-rich', 'antioxidant']
          }
        ],
        detox: [
          {
            name: 'Green Detox Smoothie',
            description: 'Detoks smoothie',
            calories: 180,
            protein: 8,
            carbs: 25,
            fat: 5,
            fiber: 8,
            ingredients: ['Ispanak', 'Salatalık', 'Limon', 'Zencefil', 'Su'],
            instructions: ['Tüm malzemeleri blender\'a koyun', 'Süzün', 'Hemen için'],
            prepTime: 5,
            difficulty: 'easy',
            tags: ['detox', 'low-calorie', 'alkaline']
          }
        ]
      },
      lunch: {
        weight_loss: [
          {
            name: 'Quinoa Salata',
            description: 'Protein açısından zengin quinoa salatası',
            calories: 400,
            protein: 18,
            carbs: 45,
            fat: 15,
            fiber: 8,
            ingredients: ['Quinoa', 'Salatalık', 'Domates', 'Avokado', 'Feta peyniri', 'Zeytinyağı'],
            instructions: ['Quinoa\'yu pişirin', 'Sebzeleri doğrayın', 'Karıştırın', 'Sos ile servis yapın'],
            prepTime: 20,
            difficulty: 'easy',
            tags: ['high-protein', 'fiber-rich', 'satisfying']
          }
        ],
        muscle_gain: [
          {
            name: 'Tavuk ve Pirinç',
            description: 'Yüksek proteinli tavuk ve pirinç',
            calories: 600,
            protein: 45,
            carbs: 60,
            fat: 12,
            fiber: 4,
            ingredients: ['Tavuk göğsü', 'Kahverengi pirinç', 'Brokoli', 'Havuç', 'Zeytinyağı'],
            instructions: ['Tavukları marine edin', 'Pirinci pişirin', 'Sebzeleri buharda pişirin', 'Servis yapın'],
            prepTime: 30,
            difficulty: 'medium',
            tags: ['high-protein', 'muscle-building', 'complete-meal']
          }
        ],
        maintenance: [
          {
            name: 'Balık ve Sebze',
            description: 'Omega-3 açısından zengin balık yemeği',
            calories: 450,
            protein: 35,
            carbs: 25,
            fat: 20,
            fiber: 6,
            ingredients: ['Somon', 'Brokoli', 'Havuç', 'Patates', 'Otlar'],
            instructions: ['Balığı marine edin', 'Sebzeleri hazırlayın', 'Fırında pişirin', 'Otlar ile servis yapın'],
            prepTime: 25,
            difficulty: 'medium',
            tags: ['omega-3', 'heart-healthy', 'nutritious']
          }
        ],
        detox: [
          {
            name: 'Sebze Çorbası',
            description: 'Detoks sebze çorbası',
            calories: 200,
            protein: 8,
            carbs: 35,
            fat: 4,
            fiber: 10,
            ingredients: ['Kabak', 'Havuç', 'Soğan', 'Sarımsak', 'Otlar', 'Su'],
            instructions: ['Sebzeleri doğrayın', 'Su ile pişirin', 'Blender\'dan geçirin', 'Otlar ile servis yapın'],
            prepTime: 20,
            difficulty: 'easy',
            tags: ['detox', 'low-calorie', 'alkaline']
          }
        ]
      },
      dinner: {
        weight_loss: [
          {
            name: 'Izgara Balık ve Sebze',
            description: 'Hafif ve besleyici akşam yemeği',
            calories: 350,
            protein: 30,
            carbs: 20,
            fat: 15,
            fiber: 6,
            ingredients: ['Levrek', 'Kabak', 'Patlıcan', 'Biber', 'Zeytinyağı'],
            instructions: ['Balığı marine edin', 'Sebzeleri hazırlayın', 'Izgarada pişirin', 'Otlar ile servis yapın'],
            prepTime: 25,
            difficulty: 'medium',
            tags: ['lean-protein', 'low-calorie', 'satisfying']
          }
        ],
        muscle_gain: [
          {
            name: 'Et ve Patates',
            description: 'Kas geliştirme için yüksek protein yemeği',
            calories: 700,
            protein: 55,
            carbs: 50,
            fat: 25,
            fiber: 6,
            ingredients: ['Dana eti', 'Tatlı patates', 'Brokoli', 'Mantar', 'Sarımsak'],
            instructions: ['Eti marine edin', 'Patatesleri fırınlayın', 'Sebzeleri pişirin', 'Servis yapın'],
            prepTime: 40,
            difficulty: 'medium',
            tags: ['high-protein', 'muscle-building', 'energizing']
          }
        ],
        maintenance: [
          {
            name: 'Akdeniz Makarnası',
            description: 'Sağlıklı Akdeniz tarzı makarna',
            calories: 500,
            protein: 20,
            carbs: 65,
            fat: 18,
            fiber: 8,
            ingredients: ['Tam tahıl makarna', 'Domates', 'Zeytin', 'Feta peyniri', 'Otlar'],
            instructions: ['Makarnayı pişirin', 'Sosu hazırlayın', 'Karıştırın', 'Peynir ile servis yapın'],
            prepTime: 20,
            difficulty: 'easy',
            tags: ['mediterranean', 'fiber-rich', 'satisfying']
          }
        ],
        detox: [
          {
            name: 'Buharda Sebze',
            description: 'Hafif detoks sebze yemeği',
            calories: 150,
            protein: 6,
            carbs: 30,
            fat: 2,
            fiber: 12,
            ingredients: ['Brokoli', 'Karnabahar', 'Havuç', 'Fasulye', 'Otlar'],
            instructions: ['Sebzeleri hazırlayın', 'Buharda pişirin', 'Otlar ile servis yapın'],
            prepTime: 15,
            difficulty: 'easy',
            tags: ['detox', 'low-calorie', 'alkaline']
          }
        ]
      },
      snack1: {
        weight_loss: [
          {
            name: 'Badem ve Elma',
            description: 'Sağlıklı ara öğün',
            calories: 150,
            protein: 5,
            carbs: 20,
            fat: 8,
            fiber: 4,
            ingredients: ['Badem', 'Elma', 'Tarçın'],
            instructions: ['Elmayı dilimleyin', 'Badem ile servis yapın', 'Tarçın serpin'],
            prepTime: 2,
            difficulty: 'easy',
            tags: ['healthy-snack', 'fiber-rich', 'quick']
          }
        ],
        muscle_gain: [
          {
            name: 'Protein Bar',
            description: 'Kas geliştirme için protein bar',
            calories: 200,
            protein: 20,
            carbs: 15,
            fat: 8,
            fiber: 3,
            ingredients: ['Protein tozu', 'Yulaf', 'Badem yağı', 'Bal', 'Çikolata'],
            instructions: ['Malzemeleri karıştırın', 'Kalıba dökün', 'Buzdolabında bekletin', 'Dilimleyin'],
            prepTime: 10,
            difficulty: 'easy',
            tags: ['high-protein', 'muscle-building', 'convenient']
          }
        ],
        maintenance: [
          {
            name: 'Yunan Yoğurdu',
            description: 'Protein açısından zengin yoğurt',
            calories: 120,
            protein: 15,
            carbs: 8,
            fat: 4,
            fiber: 0,
            ingredients: ['Yunan yoğurdu', 'Bal', 'Ceviz', 'Meyve'],
            instructions: ['Yoğurdu kaseye koyun', 'Bal ekleyin', 'Ceviz ve meyve ile servis yapın'],
            prepTime: 3,
            difficulty: 'easy',
            tags: ['protein-rich', 'probiotic', 'quick']
          }
        ],
        detox: [
          {
            name: 'Detoks Suyu',
            description: 'Alkali detoks suyu',
            calories: 10,
            protein: 0,
            carbs: 2,
            fat: 0,
            fiber: 0,
            ingredients: ['Su', 'Limon', 'Salatalık', 'Nane', 'Zencefil'],
            instructions: ['Malzemeleri suya koyun', '2 saat bekletin', 'Süzün', 'İçin'],
            prepTime: 5,
            difficulty: 'easy',
            tags: ['detox', 'alkaline', 'hydrating']
          }
        ]
      },
      snack2: {
        weight_loss: [
          {
            name: 'Sebze Çubukları',
            description: 'Düşük kalorili sebze atıştırmalığı',
            calories: 80,
            protein: 3,
            carbs: 15,
            fat: 2,
            fiber: 5,
            ingredients: ['Havuç', 'Salatalık', 'Biber', 'Humus'],
            instructions: ['Sebzeleri çubuk şeklinde kesin', 'Humus ile servis yapın'],
            prepTime: 5,
            difficulty: 'easy',
            tags: ['low-calorie', 'fiber-rich', 'crunchy']
          }
        ],
        muscle_gain: [
          {
            name: 'Protein Shake',
            description: 'Hızlı protein shake',
            calories: 250,
            protein: 30,
            carbs: 15,
            fat: 5,
            fiber: 2,
            ingredients: ['Protein tozu', 'Süt', 'Muz', 'Badem yağı'],
            instructions: ['Malzemeleri blender\'a koyun', 'Karıştırın', 'Hemen için'],
            prepTime: 3,
            difficulty: 'easy',
            tags: ['high-protein', 'quick', 'muscle-building']
          }
        ],
        maintenance: [
          {
            name: 'Kuruyemiş Karışımı',
            description: 'Sağlıklı kuruyemiş karışımı',
            calories: 180,
            protein: 6,
            carbs: 8,
            fat: 15,
            fiber: 3,
            ingredients: ['Ceviz', 'Badem', 'Fındık', 'Kuru üzüm'],
            instructions: ['Kuruyemişleri karıştırın', 'Küçük porsiyonlarda servis yapın'],
            prepTime: 2,
            difficulty: 'easy',
            tags: ['healthy-fats', 'protein-rich', 'convenient']
          }
        ],
        detox: [
          {
            name: 'Yeşil Çay',
            description: 'Antioksidan açısından zengin yeşil çay',
            calories: 5,
            protein: 0,
            carbs: 1,
            fat: 0,
            fiber: 0,
            ingredients: ['Yeşil çay', 'Limon', 'Bal'],
            instructions: ['Çayı demleyin', 'Limon ve bal ekleyin', 'Sıcak için'],
            prepTime: 5,
            difficulty: 'easy',
            tags: ['antioxidant', 'detox', 'warming']
          }
        ]
      }
    };

    return templates[mealType]?.[category] || [];
  }

  // Kullanıcı ilerlemesini kaydet
  static async saveUserProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error('Kullanıcı ilerlemesi kaydedilemedi:', error);
    }
  }

  // Kullanıcı ilerlemesini yükle
  static async loadUserProgress(): Promise<UserProgress | null> {
    try {
      const progress = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROGRESS);
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Kullanıcı ilerlemesi yüklenemedi:', error);
      return null;
    }
  }

  // Günü tamamla
  static async completeDay(planId: string, day: number): Promise<void> {
    try {
      const progress = await this.loadUserProgress();
      if (progress && progress.currentPlanId === planId) {
        if (!progress.completedDays.includes(day)) {
          progress.completedDays.push(day);
          progress.currentDay = day + 1;
          progress.streak += 1;
          progress.lastActiveDate = new Date().toISOString();
          
          await this.saveUserProgress(progress);
        }
      }
    } catch (error) {
      console.error('Gün tamamlanamadı:', error);
    }
  }

  // Haftayı tamamla
  static async completeWeek(planId: string): Promise<void> {
    try {
      const progress = await this.loadUserProgress();
      if (progress && progress.currentPlanId === planId) {
        progress.currentWeek += 1;
        progress.currentDay = 1;
        progress.completedDays = [];
        progress.totalWeeksCompleted += 1;
        progress.lastActiveDate = new Date().toISOString();
        
        await this.saveUserProgress(progress);
      }
    } catch (error) {
      console.error('Hafta tamamlanamadı:', error);
    }
  }

  // Aktif planı değiştir
  static async setActivePlan(planId: string): Promise<void> {
    try {
      const progress = await this.loadUserProgress() || {
        currentPlanId: planId,
        currentWeek: 1,
        currentDay: 1,
        completedDays: [],
        streak: 0,
        totalWeeksCompleted: 0,
        achievements: [],
        lastActiveDate: new Date().toISOString()
      };
      
      progress.currentPlanId = planId;
      progress.currentWeek = 1;
      progress.currentDay = 1;
      progress.completedDays = [];
      
      await this.saveUserProgress(progress);
    } catch (error) {
      console.error('Aktif plan değiştirilemedi:', error);
    }
  }
}


