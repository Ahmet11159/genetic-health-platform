// Kullanıcı profili ve tercihleri
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
  preferences: {
    dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';
    allergies: string[];
    restrictions: string[];
    language: 'tr' | 'en';
    notifications: boolean;
  };
  dnaData?: DNAReport;
  analysisResult?: AnalysisResult;
  createdAt: string;
  lastActive: string;
}

// Günlük öneriler ve takip
export interface DailyRecommendation {
  id: string;
  date: string;
  type: 'nutrition' | 'exercise' | 'sleep' | 'supplement' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
  relatedGenes: string[];
  scientificSource?: string;
}

export interface WeeklyPlan {
  week: number;
  startDate: string;
  endDate: string;
  nutritionPlan: {
    dailyCalories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
    };
    meals: MealPlan[];
    supplements: SupplementPlan[];
  };
  exercisePlan: {
    dailyMinutes: number;
    activities: ExerciseActivity[];
  };
  sleepPlan: {
    bedtime: string;
    wakeTime: string;
    duration: number;
    recommendations: string[];
  };
  healthTips: string[];
}

export interface MealPlan {
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  ingredients: string[];
  instructions: string;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamins: { [key: string]: number };
  };
  relatedGenes: string[];
}

export interface ExerciseActivity {
  name: string;
  duration: number; // minutes
  intensity: 'low' | 'moderate' | 'high';
  type: 'cardio' | 'strength' | 'flexibility' | 'balance';
  description: string;
  relatedGenes: string[];
}

export interface SupplementPlan {
  name: string;
  dosage: string;
  timing: 'morning' | 'afternoon' | 'evening' | 'with_meal';
  duration: string;
  relatedGenes: string[];
  scientificSource: string;
}

// Bildirimler ve hatırlatmalar
export interface Notification {
  id: string;
  type: 'daily_tip' | 'reminder' | 'achievement' | 'warning';
  title: string;
  message: string;
  scheduledTime: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedGenes: string[];
}

// Sağlık verileri
export interface HealthData {
  date: string;
  sleep: {
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
  };
  exercise: {
    duration: number;
    type: string;
    intensity: number;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mood: number;
  energy: number;
  stress: number;
}

// Import DNA types
import { DNAReport, AnalysisResult } from './DNA';