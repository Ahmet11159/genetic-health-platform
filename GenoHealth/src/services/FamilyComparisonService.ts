// Aile üyeleri için genetik analiz karşılaştırması servisi
import { AnalysisResult } from '../types/DNA';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'parent' | 'sibling' | 'child' | 'grandparent' | 'aunt_uncle' | 'cousin' | 'spouse';
  gender: 'male' | 'female';
  age?: number;
  analysisData: AnalysisResult;
  addedDate: Date;
  isActive: boolean;
}

export interface GeneticComparison {
  member1: FamilyMember;
  member2: FamilyMember;
  commonVariants: CommonVariant[];
  inheritedTraits: InheritedTrait[];
  riskComparison: RiskComparison[];
  recommendations: FamilyRecommendation[];
  similarityScore: number;
  comparisonDate: Date;
}

export interface CommonVariant {
  gene: string;
  variant: string;
  member1Genotype: string;
  member2Genotype: string;
  isIdentical: boolean;
  clinicalSignificance: string;
  inheritancePattern: 'autosomal_dominant' | 'autosomal_recessive' | 'x_linked' | 'mitochondrial';
}

export interface InheritedTrait {
  trait: string;
  inheritanceProbability: number;
  member1HasTrait: boolean;
  member2HasTrait: boolean;
  geneticBasis: string;
  recommendations: string;
}

export interface RiskComparison {
  condition: string;
  member1Risk: 'low' | 'medium' | 'high';
  member2Risk: 'low' | 'medium' | 'high';
  riskDifference: number;
  sharedRiskFactors: string[];
  geneticBasis: string;
}

export interface FamilyRecommendation {
  category: 'nutrition' | 'exercise' | 'lifestyle' | 'health_monitoring' | 'genetic_counseling';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  applicableMembers: string[];
  geneticBasis: string;
}

export class FamilyComparisonService {
  private static familyMembers: FamilyMember[] = [];
  private static comparisons: GeneticComparison[] = [];

  /**
   * Aile üyesi ekler
   */
  static addFamilyMember(member: Omit<FamilyMember, 'id' | 'addedDate' | 'isActive'>): FamilyMember {
    const newMember: FamilyMember = {
      ...member,
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date(),
      isActive: true
    };

    this.familyMembers.push(newMember);
    return newMember;
  }

  /**
   * Aile üyesi günceller
   */
  static updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): boolean {
    const memberIndex = this.familyMembers.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      this.familyMembers[memberIndex] = { ...this.familyMembers[memberIndex], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Aile üyesi siler
   */
  static removeFamilyMember(memberId: string): boolean {
    const memberIndex = this.familyMembers.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      this.familyMembers[memberIndex].isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Tüm aktif aile üyelerini getirir
   */
  static getFamilyMembers(): FamilyMember[] {
    return this.familyMembers.filter(m => m.isActive);
  }

  /**
   * Belirli bir aile üyesini getirir
   */
  static getFamilyMember(memberId: string): FamilyMember | null {
    return this.familyMembers.find(m => m.id === memberId && m.isActive) || null;
  }

  /**
   * İki aile üyesi arasında genetik karşılaştırma yapar
   */
  static compareMembers(member1Id: string, member2Id: string): GeneticComparison | null {
    const member1 = this.getFamilyMember(member1Id);
    const member2 = this.getFamilyMember(member2Id);

    if (!member1 || !member2) {
      return null;
    }

    const commonVariants = this.findCommonVariants(member1, member2);
    const inheritedTraits = this.analyzeInheritedTraits(member1, member2);
    const riskComparison = this.compareRisks(member1, member2);
    const recommendations = this.generateFamilyRecommendations(member1, member2, commonVariants, inheritedTraits, riskComparison);
    const similarityScore = this.calculateSimilarityScore(member1, member2);

    const comparison: GeneticComparison = {
      member1,
      member2,
      commonVariants,
      inheritedTraits,
      riskComparison,
      recommendations,
      similarityScore,
      comparisonDate: new Date()
    };

    this.comparisons.push(comparison);
    return comparison;
  }

  /**
   * Ortak genetik varyantları bulur
   */
  private static findCommonVariants(member1: FamilyMember, member2: FamilyMember): CommonVariant[] {
    const commonVariants: CommonVariant[] = [];
    
    // Her iki üyenin genetik varyantlarını karşılaştır
    for (const variant1 of member1.analysisData.geneticVariants) {
      const variant2 = member2.analysisData.geneticVariants.find(v => v.gene === variant1.gene);
      
      if (variant2) {
        commonVariants.push({
          gene: variant1.gene,
          variant: variant1.variant,
          member1Genotype: variant1.genotype,
          member2Genotype: variant2.genotype,
          isIdentical: variant1.genotype === variant2.genotype,
          clinicalSignificance: variant1.clinicalSignificance,
          inheritancePattern: this.determineInheritancePattern(variant1.gene)
        });
      }
    }

    return commonVariants;
  }

  /**
   * Kalıtsal özellikleri analiz eder
   */
  private static analyzeInheritedTraits(member1: FamilyMember, member2: FamilyMember): InheritedTrait[] {
    const inheritedTraits: InheritedTrait[] = [];

    // Sağlık özelliklerini karşılaştır
    for (const trait1 of member1.analysisData.healthTraits) {
      const trait2 = member2.analysisData.healthTraits.find(t => t.trait === trait1.trait);
      
      if (trait2) {
        const inheritanceProbability = this.calculateInheritanceProbability(trait1, trait2);
        
        inheritedTraits.push({
          trait: trait1.trait,
          inheritanceProbability,
          member1HasTrait: trait1.riskLevel === 'high',
          member2HasTrait: trait2.riskLevel === 'high',
          geneticBasis: this.getGeneticBasis(trait1.trait),
          recommendations: this.getTraitRecommendations(trait1.trait, inheritanceProbability)
        });
      }
    }

    return inheritedTraits;
  }

  /**
   * Risk faktörlerini karşılaştırır
   */
  private static compareRisks(member1: FamilyMember, member2: FamilyMember): RiskComparison[] {
    const riskComparisons: RiskComparison[] = [];

    // Risk faktörlerini karşılaştır
    for (const risk1 of member1.analysisData.riskFactors) {
      const risk2 = member2.analysisData.riskFactors.find(r => r.condition === risk1.condition);
      
      if (risk2) {
        const riskDifference = this.calculateRiskDifference(risk1.level, risk2.level);
        const sharedRiskFactors = this.findSharedRiskFactors(risk1, risk2);
        
        riskComparisons.push({
          condition: risk1.condition,
          member1Risk: risk1.level,
          member2Risk: risk2.level,
          riskDifference,
          sharedRiskFactors,
          geneticBasis: risk1.geneticBasis
        });
      }
    }

    return riskComparisons;
  }

  /**
   * Aile önerileri oluşturur
   */
  private static generateFamilyRecommendations(
    member1: FamilyMember,
    member2: FamilyMember,
    commonVariants: CommonVariant[],
    inheritedTraits: InheritedTrait[],
    riskComparisons: RiskComparison[]
  ): FamilyRecommendation[] {
    const recommendations: FamilyRecommendation[] = [];

    // Ortak yüksek risk faktörleri için öneriler
    const highRiskConditions = riskComparisons.filter(r => 
      r.member1Risk === 'high' && r.member2Risk === 'high'
    );

    for (const condition of highRiskConditions) {
      recommendations.push({
        category: 'health_monitoring',
        title: `${condition.condition} için Aile Taraması`,
        description: `Her iki aile üyesi de ${condition.condition} için yüksek risk taşıyor. Düzenli kontroller önerilir.`,
        priority: 'high',
        applicableMembers: [member1.id, member2.id],
        geneticBasis: condition.geneticBasis
      });
    }

    // Beslenme önerileri
    const nutritionRecommendations = this.generateNutritionRecommendations(member1, member2, commonVariants);
    recommendations.push(...nutritionRecommendations);

    // Egzersiz önerileri
    const exerciseRecommendations = this.generateExerciseRecommendations(member1, member2, inheritedTraits);
    recommendations.push(...exerciseRecommendations);

    // Yaşam tarzı önerileri
    const lifestyleRecommendations = this.generateLifestyleRecommendations(member1, member2, riskComparisons);
    recommendations.push(...lifestyleRecommendations);

    return recommendations;
  }

  /**
   * Beslenme önerileri oluşturur
   */
  private static generateNutritionRecommendations(
    member1: FamilyMember,
    member2: FamilyMember,
    commonVariants: CommonVariant[]
  ): FamilyRecommendation[] {
    const recommendations: FamilyRecommendation[] = [];

    // MTHFR geni kontrolü
    const mthfrVariant = commonVariants.find(v => v.gene === 'MTHFR');
    if (mthfrVariant && mthfrVariant.isIdentical) {
      recommendations.push({
        category: 'nutrition',
        title: 'Aile Folat Takviyesi',
        description: 'Her iki aile üyesi de MTHFR varyantı taşıyor. Folat takviyesi önerilir.',
        priority: 'high',
        applicableMembers: [member1.id, member2.id],
        geneticBasis: 'MTHFR gen varyantı'
      });
    }

    // COMT geni kontrolü
    const comtVariant = commonVariants.find(v => v.gene === 'COMT');
    if (comtVariant && comtVariant.isIdentical) {
      recommendations.push({
        category: 'nutrition',
        title: 'Kafein Sınırlaması',
        description: 'COMT geniniz yavaş metabolizma tipi. Kafein tüketimini sınırlayın.',
        priority: 'medium',
        applicableMembers: [member1.id, member2.id],
        geneticBasis: 'COMT gen varyantı'
      });
    }

    return recommendations;
  }

  /**
   * Egzersiz önerileri oluşturur
   */
  private static generateExerciseRecommendations(
    member1: FamilyMember,
    member2: FamilyMember,
    inheritedTraits: InheritedTrait[]
  ): FamilyRecommendation[] {
    const recommendations: FamilyRecommendation[] = [];

    // ACTN3 geni kontrolü
    const actn3Trait = inheritedTraits.find(t => t.trait.includes('kas tipi'));
    if (actn3Trait && actn3Trait.inheritanceProbability > 0.7) {
      recommendations.push({
        category: 'exercise',
        title: 'Aile Egzersiz Programı',
        description: 'Genetik kas tipiniz benzer. Ortak egzersiz programı oluşturun.',
        priority: 'medium',
        applicableMembers: [member1.id, member2.id],
        geneticBasis: 'ACTN3 gen varyantı'
      });
    }

    return recommendations;
  }

  /**
   * Yaşam tarzı önerileri oluşturur
   */
  private static generateLifestyleRecommendations(
    member1: FamilyMember,
    member2: FamilyMember,
    riskComparisons: RiskComparison[]
  ): FamilyRecommendation[] {
    const recommendations: FamilyRecommendation[] = [];

    // Kalp hastalığı riski
    const heartDiseaseRisk = riskComparisons.find(r => r.condition.includes('kalp'));
    if (heartDiseaseRisk && heartDiseaseRisk.riskDifference < 0.3) {
      recommendations.push({
        category: 'lifestyle',
        title: 'Aile Kalp Sağlığı Programı',
        description: 'Benzer kalp hastalığı riski. Ortak sağlıklı yaşam tarzı benimseyin.',
        priority: 'high',
        applicableMembers: [member1.id, member2.id],
        geneticBasis: 'Kalp hastalığı genetik risk faktörleri'
      });
    }

    return recommendations;
  }

  /**
   * Benzerlik skorunu hesaplar
   */
  private static calculateSimilarityScore(member1: FamilyMember, member2: FamilyMember): number {
    let score = 0;
    let totalComparisons = 0;

    // Genetik varyant benzerliği
    const commonVariants = this.findCommonVariants(member1, member2);
    const identicalVariants = commonVariants.filter(v => v.isIdentical).length;
    score += (identicalVariants / Math.max(member1.analysisData.geneticVariants.length, member2.analysisData.geneticVariants.length)) * 40;
    totalComparisons += 40;

    // Sağlık özellikleri benzerliği
    const inheritedTraits = this.analyzeInheritedTraits(member1, member2);
    const similarTraits = inheritedTraits.filter(t => t.member1HasTrait === t.member2HasTrait).length;
    score += (similarTraits / Math.max(member1.analysisData.healthTraits.length, member2.analysisData.healthTraits.length)) * 30;
    totalComparisons += 30;

    // Risk faktörleri benzerliği
    const riskComparisons = this.compareRisks(member1, member2);
    const similarRisks = riskComparisons.filter(r => r.member1Risk === r.member2Risk).length;
    score += (similarRisks / Math.max(member1.analysisData.riskFactors.length, member2.analysisData.riskFactors.length)) * 30;
    totalComparisons += 30;

    return Math.round((score / totalComparisons) * 100);
  }

  /**
   * Kalıtım olasılığını hesaplar
   */
  private static calculateInheritanceProbability(trait1: any, trait2: any): number {
    // Basit kalıtım olasılığı hesaplama
    if (trait1.riskLevel === trait2.riskLevel) {
      return 0.8; // Aynı risk seviyesi
    } else if (Math.abs(this.riskLevelToNumber(trait1.riskLevel) - this.riskLevelToNumber(trait2.riskLevel)) === 1) {
      return 0.6; // Yakın risk seviyeleri
    } else {
      return 0.3; // Farklı risk seviyeleri
    }
  }

  /**
   * Risk seviyesini sayıya çevirir
   */
  private static riskLevelToNumber(riskLevel: string): number {
    switch (riskLevel) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 1;
    }
  }

  /**
   * Risk farkını hesaplar
   */
  private static calculateRiskDifference(risk1: string, risk2: string): number {
    return Math.abs(this.riskLevelToNumber(risk1) - this.riskLevelToNumber(risk2));
  }

  /**
   * Ortak risk faktörlerini bulur
   */
  private static findSharedRiskFactors(risk1: any, risk2: any): string[] {
    const shared: string[] = [];
    
    if (risk1.geneticBasis === risk2.geneticBasis) {
      shared.push(risk1.geneticBasis);
    }
    
    return shared;
  }

  /**
   * Kalıtım paterni belirler
   */
  private static determineInheritancePattern(gene: string): string {
    // Basit gen kalıtım paterni belirleme
    const autosomalDominant = ['BRCA1', 'BRCA2', 'APOE'];
    const autosomalRecessive = ['MTHFR', 'COMT'];
    const xLinked = ['FMR1', 'DMD'];
    
    if (autosomalDominant.includes(gene)) return 'autosomal_dominant';
    if (autosomalRecessive.includes(gene)) return 'autosomal_recessive';
    if (xLinked.includes(gene)) return 'x_linked';
    
    return 'autosomal_dominant'; // Varsayılan
  }

  /**
   * Genetik temel bilgisi getirir
   */
  private static getGeneticBasis(trait: string): string {
    const basisMap: { [key: string]: string } = {
      'kas tipi': 'ACTN3 geni',
      'metabolizma': 'COMT geni',
      'folat metabolizması': 'MTHFR geni',
      'kafein metabolizması': 'CYP1A2 geni',
      'uyku düzeni': 'PER3 geni'
    };
    
    return basisMap[trait] || 'Bilinmeyen genetik faktör';
  }

  /**
   * Özellik önerileri getirir
   */
  private static getTraitRecommendations(trait: string, probability: number): string {
    if (probability > 0.7) {
      return `Bu özellik aile içinde güçlü kalıtım gösteriyor. Ortak yaşam tarzı önerileri uygulayın.`;
    } else if (probability > 0.4) {
      return `Bu özellik aile içinde orta düzeyde kalıtım gösteriyor. Bireysel farklılıkları göz önünde bulundurun.`;
    } else {
      return `Bu özellik aile içinde zayıf kalıtım gösteriyor. Bireysel yaklaşım önerilir.`;
    }
  }

  /**
   * Tüm karşılaştırmaları getirir
   */
  static getComparisons(): GeneticComparison[] {
    return this.comparisons;
  }

  /**
   * Belirli bir karşılaştırmayı getirir
   */
  static getComparison(member1Id: string, member2Id: string): GeneticComparison | null {
    return this.comparisons.find(c => 
      (c.member1.id === member1Id && c.member2.id === member2Id) ||
      (c.member1.id === member2Id && c.member2.id === member1Id)
    ) || null;
  }

  /**
   * Aile ağacı oluşturur
   */
  static generateFamilyTree(): any {
    const members = this.getFamilyMembers();
    const tree: any = {
      members: members.map(member => ({
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        gender: member.gender,
        age: member.age,
        isActive: member.isActive
      })),
      relationships: this.generateRelationships(members)
    };

    return tree;
  }

  /**
   * Aile ilişkilerini oluşturur
   */
  private static generateRelationships(members: FamilyMember[]): any[] {
    const relationships: any[] = [];
    
    // Basit ilişki matrisi oluştur
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];
        
        relationships.push({
          from: member1.id,
          to: member2.id,
          relationship: this.determineRelationship(member1.relationship, member2.relationship),
          similarity: this.calculateSimilarityScore(member1, member2)
        });
      }
    }

    return relationships;
  }

  /**
   * İki üye arasındaki ilişkiyi belirler
   */
  private static determineRelationship(rel1: string, rel2: string): string {
    // Basit ilişki belirleme mantığı
    if (rel1 === 'parent' && rel2 === 'child') return 'parent_child';
    if (rel1 === 'child' && rel2 === 'parent') return 'parent_child';
    if (rel1 === 'sibling' && rel2 === 'sibling') return 'siblings';
    if (rel1 === 'spouse' && rel2 === 'spouse') return 'spouses';
    
    return 'family_member';
  }
}


