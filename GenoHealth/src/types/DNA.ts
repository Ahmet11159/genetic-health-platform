// DNA ve genetik analiz tipleri
export interface DNAVariant {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  gene?: string;
  significance?: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic';
}

export interface DNAReport {
  variants: DNAVariant[];
  metadata: {
    uploadDate: string;
    source: '23andme' | 'ancestry' | 'myheritage' | 'other';
    version: string;
    totalVariants: number;
  };
}

export interface GeneticTrait {
  trait: string;
  value: string;
  description: string;
  riskLevel: 'low' | 'moderate' | 'high';
  confidence: number;
  recommendations: string[];
  scientificSources: string[];
  relatedGenes: string[];
}

export interface NutritionTrait {
  nutrient: string;
  requirement: 'increased' | 'normal' | 'decreased';
  description: string;
  foods: string[];
  supplements?: string[];
  dailyAmount?: string;
  relatedGenes: string[];
}

export interface ExerciseTrait {
  trait: string;
  type: 'endurance' | 'power' | 'flexibility' | 'injury_risk';
  value: string;
  description: string;
  recommendations: string[];
  relatedGenes: string[];
}

export interface SleepTrait {
  trait: string;
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  description: string;
  recommendations: string[];
  relatedGenes: string[];
}

export interface DrugInteraction {
  drug: string;
  gene: string;
  effect: 'reduced' | 'increased' | 'no_effect' | 'adverse';
  description: string;
  recommendation: string;
}

export interface AnalysisResult {
  healthTraits: GeneticTrait[];
  nutritionTraits: NutritionTrait[];
  exerciseTraits: ExerciseTrait[];
  sleepTraits: SleepTrait[];
  drugInteractions: DrugInteraction[];
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
  lastUpdated: string;
}