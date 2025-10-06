/**
 * Aile Üyesi Yönetimi Servisi
 * Aile üyeleri arasında genetik karşılaştırma ve analiz
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './NotificationService';

// Aile üyesi veri yapıları
export interface FamilyMember {
  id: string;
  userId: string; // Ana kullanıcının ID'si
  name: string;
  relationship: 'parent' | 'sibling' | 'child' | 'grandparent' | 'aunt_uncle' | 'cousin' | 'spouse' | 'other';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age?: number;
  avatar?: string;
  isActive: boolean;
  hasDNAData: boolean;
  dnaAnalysisId?: string;
  lastAnalysisDate?: string;
  healthScore?: number;
  riskFactors: string[];
  protectiveFactors: string[];
  sharedVariants: number;
  uniqueVariants: number;
  commonTraits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyComparison {
  id: string;
  familyId: string;
  members: string[]; // Family member IDs
  comparisonDate: string;
  sharedVariants: SharedVariant[];
  uniqueVariants: UniqueVariant[];
  commonTraits: CommonTrait[];
  healthInsights: HealthInsight[];
  recommendations: FamilyRecommendation[];
  riskAssessment: FamilyRiskAssessment;
  protectiveFactors: FamilyProtectiveFactor[];
}

export interface SharedVariant {
  rsid: string;
  gene: string;
  chromosome: string;
  position: number;
  genotype: string;
  significance: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic';
  populationFrequency: number;
  familyFrequency: number;
  healthImpact: string;
  recommendations: string[];
  members: string[]; // Which family members have this variant
}

export interface UniqueVariant {
  rsid: string;
  gene: string;
  chromosome: string;
  position: number;
  genotype: string;
  significance: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic';
  populationFrequency: number;
  healthImpact: string;
  recommendations: string[];
  member: string; // Which family member has this unique variant
}

export interface CommonTrait {
  trait: string;
  description: string;
  prevalence: number; // Percentage of family members with this trait
  geneticBasis: string;
  healthImplications: string[];
  recommendations: string[];
  members: string[];
}

export interface HealthInsight {
  category: 'cardiovascular' | 'neurological' | 'metabolic' | 'cancer' | 'immune' | 'mental_health';
  insight: string;
  evidence: string;
  recommendations: string[];
  affectedMembers: string[];
  severity: 'low' | 'moderate' | 'high';
}

export interface FamilyRecommendation {
  type: 'lifestyle' | 'medical' | 'screening' | 'genetic_counseling';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetMembers: string[];
  timeline: string;
  resources: string[];
}

export interface FamilyRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  riskFactors: {
    factor: string;
    severity: 'low' | 'moderate' | 'high';
    affectedMembers: string[];
    recommendations: string[];
  }[];
  protectiveFactors: {
    factor: string;
    strength: 'low' | 'moderate' | 'high';
    affectedMembers: string[];
    benefits: string[];
  }[];
}

export interface FamilyProtectiveFactor {
  factor: string;
  description: string;
  prevalence: number;
  healthBenefits: string[];
  recommendations: string[];
  members: string[];
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeName?: string;
  relationship: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitationCode: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  comparisons: FamilyComparison[];
  privacySettings: {
    shareDNAData: boolean;
    shareHealthData: boolean;
    allowComparisons: boolean;
    notificationSettings: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export class FamilyManagementService {
  private static instance: FamilyManagementService;
  private notificationService: NotificationService;
  private families: Map<string, FamilyGroup> = new Map();
  private isInitialized = false;

  static getInstance(): FamilyManagementService {
    if (!FamilyManagementService.instance) {
      FamilyManagementService.instance = new FamilyManagementService();
    }
    return FamilyManagementService.instance;
  }

  constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  /**
   * Servisi başlatır
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Bildirim servisini başlat
      await this.notificationService.initialize();

      // Aile verilerini yükle
      await this.loadFamilyData();

      this.isInitialized = true;
      console.log('Family Management Service initialized!');
      return true;
    } catch (error) {
      console.error('Family management service initialization error:', error);
      return false;
    }
  }

  /**
   * Aile grubu oluşturur
   */
  async createFamilyGroup(name: string, description?: string, ownerId: string): Promise<FamilyGroup> {
    try {
      const familyGroup: FamilyGroup = {
        id: `family_${Date.now()}`,
        name,
        description,
        ownerId,
        members: [],
        invitations: [],
        comparisons: [],
        privacySettings: {
          shareDNAData: true,
          shareHealthData: true,
          allowComparisons: true,
          notificationSettings: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.families.set(familyGroup.id, familyGroup);
      await this.saveFamilyData();

      console.log('Family group created:', familyGroup.id);
      return familyGroup;
    } catch (error) {
      console.error('Create family group error:', error);
      throw error;
    }
  }

  /**
   * Aile üyesi ekler
   */
  async addFamilyMember(
    familyId: string,
    memberData: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isActive' | 'hasDNAData' | 'sharedVariants' | 'uniqueVariants' | 'commonTraits' | 'riskFactors' | 'protectiveFactors'>
  ): Promise<FamilyMember> {
    try {
      const family = this.families.get(familyId);
      if (!family) {
        throw new Error('Family group not found');
      }

      const familyMember: FamilyMember = {
        id: `member_${Date.now()}`,
        userId: family.ownerId,
        ...memberData,
        isActive: true,
        hasDNAData: false,
        sharedVariants: 0,
        uniqueVariants: 0,
        commonTraits: [],
        riskFactors: [],
        protectiveFactors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      family.members.push(familyMember);
      family.updatedAt = new Date().toISOString();

      this.families.set(familyId, family);
      await this.saveFamilyData();

      // Bildirim gönder
      await this.notificationService.sendNotification({
        id: `family_member_added_${Date.now()}`,
        type: 'family_analysis',
        title: '👨‍👩‍👧‍👦 Yeni Aile Üyesi Eklendi',
        body: `${familyMember.name} aile grubunuza eklendi.`,
        priority: 'normal',
        category: 'family',
        data: { familyId, memberId: familyMember.id },
      });

      console.log('Family member added:', familyMember.id);
      return familyMember;
    } catch (error) {
      console.error('Add family member error:', error);
      throw error;
    }
  }

  /**
   * Aile üyesi günceller
   */
  async updateFamilyMember(familyId: string, memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    try {
      const family = this.families.get(familyId);
      if (!family) {
        throw new Error('Family group not found');
      }

      const memberIndex = family.members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) {
        throw new Error('Family member not found');
      }

      family.members[memberIndex] = {
        ...family.members[memberIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      family.updatedAt = new Date().toISOString();
      this.families.set(familyId, family);
      await this.saveFamilyData();

      console.log('Family member updated:', memberId);
      return family.members[memberIndex];
    } catch (error) {
      console.error('Update family member error:', error);
      throw error;
    }
  }

  /**
   * Aile üyesi siler
   */
  async removeFamilyMember(familyId: string, memberId: string): Promise<void> {
    try {
      const family = this.families.get(familyId);
      if (!family) {
        throw new Error('Family group not found');
      }

      family.members = family.members.filter(m => m.id !== memberId);
      family.updatedAt = new Date().toISOString();

      this.families.set(familyId, family);
      await this.saveFamilyData();

      console.log('Family member removed:', memberId);
    } catch (error) {
      console.error('Remove family member error:', error);
      throw error;
    }
  }

  /**
   * Aile üyeleri arasında genetik karşılaştırma yapar
   */
  async performFamilyComparison(familyId: string, memberIds: string[]): Promise<FamilyComparison> {
    try {
      const family = this.families.get(familyId);
      if (!family) {
        throw new Error('Family group not found');
      }

      // Seçilen üyeleri al
      const selectedMembers = family.members.filter(m => memberIds.includes(m.id));
      if (selectedMembers.length < 2) {
        throw new Error('At least 2 family members required for comparison');
      }

      // Simüle edilmiş genetik karşılaştırma verileri
      const comparison: FamilyComparison = {
        id: `comparison_${Date.now()}`,
        familyId,
        members: memberIds,
        comparisonDate: new Date().toISOString(),
        sharedVariants: this.generateSharedVariants(selectedMembers),
        uniqueVariants: this.generateUniqueVariants(selectedMembers),
        commonTraits: this.generateCommonTraits(selectedMembers),
        healthInsights: this.generateHealthInsights(selectedMembers),
        recommendations: this.generateFamilyRecommendations(selectedMembers),
        riskAssessment: this.generateFamilyRiskAssessment(selectedMembers),
        protectiveFactors: this.generateFamilyProtectiveFactors(selectedMembers),
      };

      family.comparisons.push(comparison);
      family.updatedAt = new Date().toISOString();

      this.families.set(familyId, family);
      await this.saveFamilyData();

      // Bildirim gönder
      await this.notificationService.sendNotification({
        id: `family_comparison_${Date.now()}`,
        type: 'family_analysis',
        title: '🧬 Aile Genetik Karşılaştırması Tamamlandı',
        body: `${selectedMembers.length} aile üyesi arasında genetik analiz tamamlandı.`,
        priority: 'normal',
        category: 'family',
        data: { familyId, comparisonId: comparison.id },
      });

      console.log('Family comparison completed:', comparison.id);
      return comparison;
    } catch (error) {
      console.error('Family comparison error:', error);
      throw error;
    }
  }

  /**
   * Paylaşılan varyantları oluşturur
   */
  private generateSharedVariants(members: FamilyMember[]): SharedVariant[] {
    return [
      {
        rsid: 'rs1801133',
        gene: 'MTHFR',
        chromosome: '1',
        position: 11856378,
        genotype: 'AG',
        significance: 'likely_pathogenic',
        populationFrequency: 0.32,
        familyFrequency: 0.75, // 3 out of 4 members
        healthImpact: 'Folat metabolizması etkilenir, homosistein seviyeleri artabilir',
        recommendations: [
          'Aktif folat (5-MTHF) takviyesi alın',
          'B12 vitamini seviyelerini kontrol ettirin',
          'Düzenli homosistein testi yaptırın'
        ],
        members: members.slice(0, 3).map(m => m.id),
      },
      {
        rsid: 'rs429358',
        gene: 'APOE',
        chromosome: '19',
        position: 45411941,
        genotype: 'TC',
        significance: 'pathogenic',
        populationFrequency: 0.14,
        familyFrequency: 0.50, // 2 out of 4 members
        healthImpact: 'Alzheimer hastalığı riski artar',
        recommendations: [
          'Beyin egzersizleri yapın',
          'Omega-3 takviyesi alın',
          'Düzenli kardiyovasküler egzersiz yapın'
        ],
        members: members.slice(0, 2).map(m => m.id),
      },
    ];
  }

  /**
   * Benzersiz varyantları oluşturur
   */
  private generateUniqueVariants(members: FamilyMember[]): UniqueVariant[] {
    return [
      {
        rsid: 'rs4680',
        gene: 'COMT',
        chromosome: '22',
        position: 19951271,
        genotype: 'GG',
        significance: 'uncertain',
        populationFrequency: 0.50,
        healthImpact: 'Dopamin metabolizması etkilenir',
        recommendations: [
          'Stres yönetimi teknikleri uygulayın',
          'Düzenli egzersiz yapın',
          'Yeterli uyku alın'
        ],
        member: members[0].id,
      },
      {
        rsid: 'rs1801282',
        gene: 'PPARG',
        chromosome: '3',
        position: 12345678,
        genotype: 'CC',
        significance: 'likely_benign',
        populationFrequency: 0.85,
        healthImpact: 'Tip 2 diyabet riski azalır',
        recommendations: [
          'Sağlıklı beslenme düzeni sürdürün',
          'Düzenli egzersiz yapın',
          'Kan şekeri seviyelerini takip edin'
        ],
        member: members[1].id,
      },
    ];
  }

  /**
   * Ortak özellikleri oluşturur
   */
  private generateCommonTraits(members: FamilyMember[]): CommonTrait[] {
    return [
      {
        trait: 'Yüksek Metabolizma',
        description: 'Aile üyelerinde hızlı metabolizma görülür',
        prevalence: 75,
        geneticBasis: 'PPARG geni varyantları',
        healthImplications: [
          'Kilo verme kolaylığı',
          'Yüksek enerji seviyeleri',
          'Artmış kalori ihtiyacı'
        ],
        recommendations: [
          'Yüksek kalorili besinler tüketin',
          'Düzenli egzersiz yapın',
          'Yeterli protein alın'
        ],
        members: members.slice(0, 3).map(m => m.id),
      },
      {
        trait: 'Güçlü Bağışıklık Sistemi',
        description: 'Aile üyelerinde güçlü bağışıklık sistemi',
        prevalence: 100,
        geneticBasis: 'HLA geni kompleksi',
        healthImplications: [
          'Az enfeksiyon riski',
          'Hızlı iyileşme',
          'Güçlü antikor üretimi'
        ],
        recommendations: [
          'Düzenli aşı olun',
          'Sağlıklı beslenin',
          'Stres yönetimi yapın'
        ],
        members: members.map(m => m.id),
      },
    ];
  }

  /**
   * Sağlık içgörülerini oluşturur
   */
  private generateHealthInsights(members: FamilyMember[]): HealthInsight[] {
    return [
      {
        category: 'cardiovascular',
        insight: 'Aile genelinde kardiyovasküler hastalık riski yüksek',
        evidence: 'MTHFR geni varyantları ve aile geçmişi',
        recommendations: [
          'Düzenli kardiyovasküler egzersiz yapın',
          'Sağlıklı beslenme düzeni sürdürün',
          'Düzenli kalp kontrolleri yaptırın'
        ],
        affectedMembers: members.slice(0, 3).map(m => m.id),
        severity: 'high',
      },
      {
        category: 'neurological',
        insight: 'Alzheimer hastalığı riski aile genelinde mevcut',
        evidence: 'APOE geni varyantları',
        recommendations: [
          'Beyin egzersizleri yapın',
          'Sosyal aktivitelere katılın',
          'Omega-3 takviyesi alın'
        ],
        affectedMembers: members.slice(0, 2).map(m => m.id),
        severity: 'moderate',
      },
    ];
  }

  /**
   * Aile önerilerini oluşturur
   */
  private generateFamilyRecommendations(members: FamilyMember[]): FamilyRecommendation[] {
    return [
      {
        type: 'lifestyle',
        title: 'Aile Egzersiz Programı',
        description: 'Tüm aile üyeleri için ortak egzersiz programı',
        priority: 'high',
        targetMembers: members.map(m => m.id),
        timeline: 'Haftalık',
        resources: [
          'Aile yürüyüşleri',
          'Evde egzersiz programları',
          'Spor salonu üyeliği'
        ],
      },
      {
        type: 'medical',
        title: 'Düzenli Sağlık Kontrolleri',
        description: 'Aile genelinde düzenli sağlık kontrolleri',
        priority: 'high',
        targetMembers: members.map(m => m.id),
        timeline: 'Yıllık',
        resources: [
          'Genel sağlık kontrolü',
          'Kardiyovasküler değerlendirme',
          'Nörolojik değerlendirme'
        ],
      },
      {
        type: 'genetic_counseling',
        title: 'Genetik Danışmanlık',
        description: 'Aile genelinde genetik danışmanlık hizmeti',
        priority: 'medium',
        targetMembers: members.map(m => m.id),
        timeline: '6 aylık',
        resources: [
          'Genetik danışman randevusu',
          'Aile genetik haritası',
          'Risk değerlendirmesi'
        ],
      },
    ];
  }

  /**
   * Aile risk değerlendirmesi oluşturur
   */
  private generateFamilyRiskAssessment(members: FamilyMember[]): FamilyRiskAssessment {
    return {
      overallRisk: 'moderate',
      riskFactors: [
        {
          factor: 'Kardiyovasküler Hastalık',
          severity: 'high',
          affectedMembers: members.slice(0, 3).map(m => m.id),
          recommendations: [
            'Düzenli egzersiz yapın',
            'Sağlıklı beslenin',
            'Stres yönetimi uygulayın'
          ],
        },
        {
          factor: 'Alzheimer Hastalığı',
          severity: 'moderate',
          affectedMembers: members.slice(0, 2).map(m => m.id),
          recommendations: [
            'Beyin egzersizleri yapın',
            'Sosyal aktivitelere katılın',
            'Omega-3 takviyesi alın'
          ],
        },
      ],
      protectiveFactors: [
        {
          factor: 'Güçlü Bağışıklık Sistemi',
          strength: 'high',
          affectedMembers: members.map(m => m.id),
          benefits: [
            'Az enfeksiyon riski',
            'Hızlı iyileşme',
            'Güçlü antikor üretimi'
          ],
        },
        {
          factor: 'Yüksek Metabolizma',
          strength: 'moderate',
          affectedMembers: members.slice(0, 3).map(m => m.id),
          benefits: [
            'Kilo verme kolaylığı',
            'Yüksek enerji seviyeleri',
            'Sağlıklı vücut kompozisyonu'
          ],
        },
      ],
    };
  }

  /**
   * Aile koruyucu faktörlerini oluşturur
   */
  private generateFamilyProtectiveFactors(members: FamilyMember[]): FamilyProtectiveFactor[] {
    return [
      {
        factor: 'Güçlü Bağışıklık Sistemi',
        description: 'Aile genelinde güçlü bağışıklık sistemi',
        prevalence: 100,
        healthBenefits: [
          'Az enfeksiyon riski',
          'Hızlı iyileşme',
          'Güçlü antikor üretimi'
        ],
        recommendations: [
          'Düzenli aşı olun',
          'Sağlıklı beslenin',
          'Stres yönetimi yapın'
        ],
        members: members.map(m => m.id),
      },
      {
        factor: 'Yüksek Metabolizma',
        description: 'Aile genelinde hızlı metabolizma',
        prevalence: 75,
        healthBenefits: [
          'Kilo verme kolaylığı',
          'Yüksek enerji seviyeleri',
          'Sağlıklı vücut kompozisyonu'
        ],
        recommendations: [
          'Yüksek kalorili besinler tüketin',
          'Düzenli egzersiz yapın',
          'Yeterli protein alın'
        ],
        members: members.slice(0, 3).map(m => m.id),
      },
    ];
  }

  /**
   * Aile davetiyesi oluşturur
   */
  async createFamilyInvitation(
    familyId: string,
    inviterId: string,
    inviteeEmail: string,
    inviteeName?: string,
    relationship?: string
  ): Promise<FamilyInvitation> {
    try {
      const family = this.families.get(familyId);
      if (!family) {
        throw new Error('Family group not found');
      }

      const invitation: FamilyInvitation = {
        id: `invitation_${Date.now()}`,
        familyId,
        inviterId,
        inviteeEmail,
        inviteeName,
        relationship: relationship || 'family_member',
        status: 'pending',
        invitationCode: this.generateInvitationCode(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString(),
      };

      family.invitations.push(invitation);
      family.updatedAt = new Date().toISOString();

      this.families.set(familyId, family);
      await this.saveFamilyData();

      // Bildirim gönder
      await this.notificationService.sendNotification({
        id: `family_invitation_${Date.now()}`,
        type: 'family_analysis',
        title: '👨‍👩‍👧‍👦 Aile Davetiyesi',
        body: `${inviteeName || inviteeEmail} aile grubunuza davet edildi.`,
        priority: 'normal',
        category: 'family',
        data: { familyId, invitationId: invitation.id },
      });

      console.log('Family invitation created:', invitation.id);
      return invitation;
    } catch (error) {
      console.error('Create family invitation error:', error);
      throw error;
    }
  }

  /**
   * Davet kodu oluşturur
   */
  private generateInvitationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Aile verilerini yükler
   */
  private async loadFamilyData(): Promise<void> {
    try {
      const savedFamilies = await AsyncStorage.getItem('familyData');
      if (savedFamilies) {
        const families = JSON.parse(savedFamilies);
        families.forEach((family: FamilyGroup) => {
          this.families.set(family.id, family);
        });
      }
    } catch (error) {
      console.error('Load family data error:', error);
    }
  }

  /**
   * Aile verilerini kaydeder
   */
  private async saveFamilyData(): Promise<void> {
    try {
      const familiesArray = Array.from(this.families.values());
      await AsyncStorage.setItem('familyData', JSON.stringify(familiesArray));
    } catch (error) {
      console.error('Save family data error:', error);
    }
  }

  /**
   * Aile grubunu getirir
   */
  getFamilyGroup(familyId: string): FamilyGroup | undefined {
    return this.families.get(familyId);
  }

  /**
   * Kullanıcının aile gruplarını getirir
   */
  getUserFamilyGroups(userId: string): FamilyGroup[] {
    return Array.from(this.families.values()).filter(family => 
      family.ownerId === userId || family.members.some(member => member.userId === userId)
    );
  }

  /**
   * Aile üyesini getirir
   */
  getFamilyMember(familyId: string, memberId: string): FamilyMember | undefined {
    const family = this.families.get(familyId);
    return family?.members.find(m => m.id === memberId);
  }

  /**
   * Aile karşılaştırmasını getirir
   */
  getFamilyComparison(familyId: string, comparisonId: string): FamilyComparison | undefined {
    const family = this.families.get(familyId);
    return family?.comparisons.find(c => c.id === comparisonId);
  }

  /**
   * Aile istatistiklerini getirir
   */
  getFamilyStats(familyId: string): any {
    const family = this.families.get(familyId);
    if (!family) return null;

    return {
      totalMembers: family.members.length,
      activeMembers: family.members.filter(m => m.isActive).length,
      membersWithDNA: family.members.filter(m => m.hasDNAData).length,
      totalComparisons: family.comparisons.length,
      pendingInvitations: family.invitations.filter(i => i.status === 'pending').length,
      averageHealthScore: family.members.reduce((sum, m) => sum + (m.healthScore || 0), 0) / family.members.length,
      commonRiskFactors: this.getCommonRiskFactors(family.members),
      commonProtectiveFactors: this.getCommonProtectiveFactors(family.members),
    };
  }

  /**
   * Ortak risk faktörlerini getirir
   */
  private getCommonRiskFactors(members: FamilyMember[]): string[] {
    const allRiskFactors = members.flatMap(m => m.riskFactors);
    const factorCounts = allRiskFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(factorCounts)
      .filter(([_, count]) => count > 1)
      .map(([factor, _]) => factor);
  }

  /**
   * Ortak koruyucu faktörleri getirir
   */
  private getCommonProtectiveFactors(members: FamilyMember[]): string[] {
    const allProtectiveFactors = members.flatMap(m => m.protectiveFactors);
    const factorCounts = allProtectiveFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(factorCounts)
      .filter(([_, count]) => count > 1)
      .map(([factor, _]) => factor);
  }
}
