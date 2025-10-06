"""
Klinik Doğrulama Sistemi
ACMG/AMP, FDA, CPIC, ClinGen standartları
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import json
from pathlib import Path

class ACMGCriteria(Enum):
    """ACMG/AMP patogenisite kriterleri"""
    PVS1 = "Very Strong"  # Null variant in gene where LOF is known disease mechanism
    PS1 = "Strong"        # Same amino acid change as established pathogenic variant
    PS2 = "Strong"        # De novo variant in patient with disease and no family history
    PS3 = "Strong"        # Well-established functional studies show damaging effect
    PS4 = "Strong"        # Prevalence in affected >> controls
    PM1 = "Moderate"      # Located in mutational hot spot or functional domain
    PM2 = "Moderate"      # Absent from population databases
    PM3 = "Moderate"      # For recessive disorders, detected in trans with pathogenic variant
    PM4 = "Moderate"      # Protein length changes due to in-frame indels
    PM5 = "Moderate"      # Novel missense change at same position as pathogenic variant
    PM6 = "Moderate"      # Assumed de novo without confirmation of paternity/maternity
    PP1 = "Supporting"    # Cosegregation with disease
    PP2 = "Supporting"    # Missense variant in gene with low missense variation
    PP3 = "Supporting"    # Multiple lines of computational evidence
    PP4 = "Supporting"    # Patient's phenotype matches gene-specific condition
    PP5 = "Supporting"    # Reputable source reports variant as pathogenic
    BA1 = "Benign"        # Allele frequency >5% in population
    BS1 = "Benign"        # Allele frequency greater than expected for disorder
    BS2 = "Benign"        # Well-established functional studies show no effect
    BS3 = "Benign"        # Lack of segregation in affected members
    BS4 = "Benign"        # Lack of segregation in unaffected members
    BP1 = "Benign"        # Missense variant in gene where primarily LOF is pathogenic
    BP2 = "Benign"        # Variant found in trans with pathogenic variant
    BP3 = "Benign"        # In-frame indels in repetitive region
    BP4 = "Benign"        # Multiple lines of computational evidence suggest no impact
    BP5 = "Benign"        # Variant found in case with alternate molecular basis
    BP6 = "Benign"        # Reputable source reports variant as benign
    BP7 = "Benign"        # Silent variant with no predicted impact

@dataclass
class ACMGClassification:
    """ACMG sınıflandırma sonucu"""
    variant_id: str
    gene: str
    classification: str  # Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign
    criteria_met: List[ACMGCriteria]
    criteria_scores: Dict[str, int]
    total_score: int
    confidence: str
    clinical_action: str

@dataclass
class FDAApproval:
    """FDA onay bilgisi"""
    drug: str
    gene: str
    indication: str
    approval_date: str
    biomarker: str
    clinical_evidence: str
    dosage_guidance: str

@dataclass
class CPICGuideline:
    """CPIC kılavuzu"""
    drug: str
    gene: str
    phenotype: str
    recommendation: str
    evidence_level: str
    clinical_action: str
    alternative_drugs: List[str]

@dataclass
class ClinGenEvidence:
    """ClinGen kanıt seviyesi"""
    gene: str
    disease: str
    evidence_level: str  # Definitive, Strong, Moderate, Limited, Disputed
    inheritance_pattern: str
    clinical_validity: str
    last_reviewed: str

class ClinicalValidationSystem:
    """Klinik doğrulama sistemi"""
    
    def __init__(self):
        """Klinik doğrulama sistemini başlat"""
        self.acmg_criteria = self._load_acmg_criteria()
        self.fda_approvals = self._load_fda_approvals()
        self.cpic_guidelines = self._load_cpic_guidelines()
        self.clingen_evidence = self._load_clingen_evidence()
    
    def classify_variant_acmg(
        self, 
        variant: Dict, 
        phenotype: str = None
    ) -> ACMGClassification:
        """ACMG/AMP kriterlerine göre varyant sınıflandırması"""
        print(f"🏥 {variant.get('rsid', 'Unknown')} için ACMG sınıflandırması...")
        
        criteria_met = []
        criteria_scores = {
            'pathogenic': 0,
            'benign': 0
        }
        
        # PVS1: Null variant in gene where LOF is known disease mechanism
        if self._is_lof_variant(variant) and self._is_lof_disease_mechanism(variant.get('gene')):
            criteria_met.append(ACMGCriteria.PVS1)
            criteria_scores['pathogenic'] += 4
        
        # PS1: Same amino acid change as established pathogenic variant
        if self._is_same_aa_as_pathogenic(variant):
            criteria_met.append(ACMGCriteria.PS1)
            criteria_scores['pathogenic'] += 4
        
        # PS2: De novo variant
        if variant.get('de_novo', False):
            criteria_met.append(ACMGCriteria.PS2)
            criteria_scores['pathogenic'] += 4
        
        # PS3: Functional studies show damaging effect
        if self._has_damaging_functional_evidence(variant):
            criteria_met.append(ACMGCriteria.PS3)
            criteria_scores['pathogenic'] += 4
        
        # PS4: Prevalence in affected >> controls
        if self._has_high_prevalence_in_affected(variant):
            criteria_met.append(ACMGCriteria.PS4)
            criteria_scores['pathogenic'] += 4
        
        # PM1: Located in mutational hot spot
        if self._is_in_mutational_hotspot(variant):
            criteria_met.append(ACMGCriteria.PM1)
            criteria_scores['pathogenic'] += 2
        
        # PM2: Absent from population databases
        if self._is_absent_from_population_databases(variant):
            criteria_met.append(ACMGCriteria.PM2)
            criteria_scores['pathogenic'] += 2
        
        # PP3: Multiple lines of computational evidence
        if self._has_computational_evidence(variant):
            criteria_met.append(ACMGCriteria.PP3)
            criteria_scores['pathogenic'] += 1
        
        # PP4: Patient's phenotype matches gene-specific condition
        if phenotype and self._phenotype_matches_gene(variant.get('gene'), phenotype):
            criteria_met.append(ACMGCriteria.PP4)
            criteria_scores['pathogenic'] += 1
        
        # BA1: Allele frequency >5% in population
        if variant.get('allele_frequency', 0) > 0.05:
            criteria_met.append(ACMGCriteria.BA1)
            criteria_scores['benign'] += 4
        
        # BS1: Allele frequency greater than expected
        if self._frequency_greater_than_expected(variant):
            criteria_met.append(ACMGCriteria.BS1)
            criteria_scores['benign'] += 2
        
        # BS2: Functional studies show no effect
        if self._has_benign_functional_evidence(variant):
            criteria_met.append(ACMGCriteria.BS2)
            criteria_scores['benign'] += 2
        
        # BP4: Computational evidence suggests no impact
        if self._has_benign_computational_evidence(variant):
            criteria_met.append(ACMGCriteria.BP4)
            criteria_scores['benign'] += 1
        
        # Toplam skor hesapla
        total_score = criteria_scores['pathogenic'] - criteria_scores['benign']
        
        # Sınıflandırma
        classification, confidence, clinical_action = self._determine_classification(total_score)
        
        return ACMGClassification(
            variant_id=variant.get('rsid', 'Unknown'),
            gene=variant.get('gene', 'Unknown'),
            classification=classification,
            criteria_met=criteria_met,
            criteria_scores=criteria_scores,
            total_score=total_score,
            confidence=confidence,
            clinical_action=clinical_action
        )
    
    def get_fda_approval_info(self, drug: str, gene: str) -> Optional[FDAApproval]:
        """FDA onay bilgisi al"""
        for approval in self.fda_approvals:
            if approval.drug.lower() == drug.lower() and approval.gene == gene:
                return approval
        return None
    
    def get_cpic_guideline(self, drug: str, gene: str) -> Optional[CPICGuideline]:
        """CPIC kılavuzu al"""
        for guideline in self.cpic_guidelines:
            if guideline.drug.lower() == drug.lower() and guideline.gene == gene:
                return guideline
        return None
    
    def get_clingen_evidence(self, gene: str, disease: str) -> Optional[ClinGenEvidence]:
        """ClinGen kanıt seviyesi al"""
        for evidence in self.clingen_evidence:
            if evidence.gene == gene and evidence.disease.lower() == disease.lower():
                return evidence
        return None
    
    def generate_clinical_report(
        self, 
        variants: List[Dict], 
        phenotype: str = None
    ) -> Dict:
        """Klinik rapor oluştur"""
        print("📋 Klinik rapor oluşturuluyor...")
        
        report = {
            'summary': {
                'total_variants': len(variants),
                'pathogenic_variants': 0,
                'likely_pathogenic_variants': 0,
                'vus_variants': 0,
                'likely_benign_variants': 0,
                'benign_variants': 0
            },
            'acmg_classifications': [],
            'fda_approvals': [],
            'cpic_guidelines': [],
            'clingen_evidence': [],
            'clinical_recommendations': []
        }
        
        # Her varyant için ACMG sınıflandırması
        for variant in variants:
            acmg_result = self.classify_variant_acmg(variant, phenotype)
            report['acmg_classifications'].append(acmg_result.__dict__)
            
            # Özet güncelle
            classification = acmg_result.classification
            if classification == 'Pathogenic':
                report['summary']['pathogenic_variants'] += 1
            elif classification == 'Likely Pathogenic':
                report['summary']['likely_pathogenic_variants'] += 1
            elif classification == 'VUS':
                report['summary']['vus_variants'] += 1
            elif classification == 'Likely Benign':
                report['summary']['likely_benign_variants'] += 1
            elif classification == 'Benign':
                report['summary']['benign_variants'] += 1
        
        # FDA onayları
        for variant in variants:
            if variant.get('gene'):
                fda_info = self.get_fda_approval_info('Warfarin', variant['gene'])
                if fda_info:
                    report['fda_approvals'].append(fda_info.__dict__)
        
        # CPIC kılavuzları
        for variant in variants:
            if variant.get('gene'):
                cpic_guideline = self.get_cpic_guideline('Warfarin', variant['gene'])
                if cpic_guideline:
                    report['cpic_guidelines'].append(cpic_guideline.__dict__)
        
        # ClinGen kanıtları
        for variant in variants:
            if variant.get('gene'):
                clingen_evidence = self.get_clingen_evidence(variant['gene'], 'Cardiovascular disease')
                if clingen_evidence:
                    report['clingen_evidence'].append(clingen_evidence.__dict__)
        
        # Klinik öneriler
        report['clinical_recommendations'] = self._generate_clinical_recommendations(report)
        
        return report
    
    def _load_acmg_criteria(self) -> Dict:
        """ACMG kriterlerini yükle"""
        return {
            'lof_genes': ['MTHFR', 'BRCA1', 'BRCA2', 'TP53'],
            'hotspot_genes': ['TP53', 'KRAS', 'BRAF'],
            'functional_evidence': ['MTHFR', 'CYP2C9', 'CYP2C19']
        }
    
    def _load_fda_approvals(self) -> List[FDAApproval]:
        """FDA onaylarını yükle"""
        return [
            FDAApproval(
                drug='Warfarin',
                gene='CYP2C9',
                indication='Anticoagulation',
                approval_date='2007-08-16',
                biomarker='CYP2C9 genotype',
                clinical_evidence='Level 1A',
                dosage_guidance='Reduce dose by 25-50% for poor metabolizers'
            ),
            FDAApproval(
                drug='Clopidogrel',
                gene='CYP2C19',
                indication='Antiplatelet therapy',
                approval_date='2010-03-12',
                biomarker='CYP2C19 genotype',
                clinical_evidence='Level 1A',
                dosage_guidance='Consider alternative therapy for poor metabolizers'
            )
        ]
    
    def _load_cpic_guidelines(self) -> List[CPICGuideline]:
        """CPIC kılavuzlarını yükle"""
        return [
            CPICGuideline(
                drug='Warfarin',
                gene='CYP2C9',
                phenotype='Poor metabolizer',
                recommendation='Reduce dose by 25-50%',
                evidence_level='1A',
                clinical_action='Dose adjustment required',
                alternative_drugs=['Apixaban', 'Rivaroxaban']
            ),
            CPICGuideline(
                drug='Clopidogrel',
                gene='CYP2C19',
                phenotype='Poor metabolizer',
                recommendation='Use alternative antiplatelet therapy',
                evidence_level='1A',
                clinical_action='Alternative therapy recommended',
                alternative_drugs=['Prasugrel', 'Ticagrelor']
            )
        ]
    
    def _load_clingen_evidence(self) -> List[ClinGenEvidence]:
        """ClinGen kanıtlarını yükle"""
        return [
            ClinGenEvidence(
                gene='MTHFR',
                disease='Methylenetetrahydrofolate reductase deficiency',
                evidence_level='Definitive',
                inheritance_pattern='Autosomal recessive',
                clinical_validity='Definitive',
                last_reviewed='2023-01-15'
            ),
            ClinGenEvidence(
                gene='APOE',
                disease='Alzheimer disease',
                evidence_level='Strong',
                inheritance_pattern='Multifactorial',
                clinical_validity='Strong',
                last_reviewed='2023-02-20'
            )
        ]
    
    def _is_lof_variant(self, variant: Dict) -> bool:
        """Loss-of-function varyant mı?"""
        # Basit kontrol
        return variant.get('variant_type') == 'nonsense' or variant.get('variant_type') == 'frameshift'
    
    def _is_lof_disease_mechanism(self, gene: str) -> bool:
        """LOF hastalık mekanizması mı?"""
        return gene in self.acmg_criteria['lof_genes']
    
    def _is_same_aa_as_pathogenic(self, variant: Dict) -> bool:
        """Aynı amino asit değişikliği mi?"""
        # Basit kontrol
        return variant.get('same_as_pathogenic', False)
    
    def _has_damaging_functional_evidence(self, variant: Dict) -> bool:
        """Zararlı fonksiyonel kanıt var mı?"""
        gene = variant.get('gene')
        if gene in self.acmg_criteria['functional_evidence']:
            return variant.get('functional_evidence', {}).get('damaging', False)
        return False
    
    def _has_high_prevalence_in_affected(self, variant: Dict) -> bool:
        """Etkilenenlerde yüksek prevalans var mı?"""
        return variant.get('prevalence_in_affected', 0) > 0.1
    
    def _is_in_mutational_hotspot(self, variant: Dict) -> bool:
        """Mutasyon hotspot'unda mı?"""
        gene = variant.get('gene')
        return gene in self.acmg_criteria['hotspot_genes']
    
    def _is_absent_from_population_databases(self, variant: Dict) -> bool:
        """Popülasyon veritabanlarında yok mu?"""
        return variant.get('allele_frequency', 0) < 0.001
    
    def _has_computational_evidence(self, variant: Dict) -> bool:
        """Hesaplamalı kanıt var mı?"""
        return variant.get('cadd_score', 0) > 15 or variant.get('sift_score', 1) < 0.05
    
    def _phenotype_matches_gene(self, gene: str, phenotype: str) -> bool:
        """Fenotip gen ile eşleşiyor mu?"""
        # Basit eşleştirme
        gene_phenotypes = {
            'MTHFR': ['cardiovascular', 'thrombosis', 'neural tube defects'],
            'APOE': ['alzheimer', 'dementia', 'cardiovascular'],
            'CYP2C9': ['warfarin', 'bleeding', 'anticoagulation']
        }
        
        if gene in gene_phenotypes:
            return any(p in phenotype.lower() for p in gene_phenotypes[gene])
        return False
    
    def _frequency_greater_than_expected(self, variant: Dict) -> bool:
        """Beklenenden yüksek frekans mı?"""
        return variant.get('allele_frequency', 0) > 0.1
    
    def _has_benign_functional_evidence(self, variant: Dict) -> bool:
        """Benign fonksiyonel kanıt var mı?"""
        return variant.get('functional_evidence', {}).get('benign', False)
    
    def _has_benign_computational_evidence(self, variant: Dict) -> bool:
        """Benign hesaplamalı kanıt var mı?"""
        return variant.get('cadd_score', 0) < 5 and variant.get('sift_score', 1) > 0.5
    
    def _determine_classification(self, total_score: int) -> Tuple[str, str, str]:
        """Sınıflandırma belirle"""
        if total_score >= 8:
            return 'Pathogenic', 'High', 'Immediate clinical action required'
        elif total_score >= 6:
            return 'Likely Pathogenic', 'Moderate', 'Consider clinical action'
        elif total_score >= 2:
            return 'VUS', 'Low', 'Monitor and re-evaluate'
        elif total_score <= -2:
            return 'Likely Benign', 'Low', 'No clinical action needed'
        else:
            return 'Benign', 'High', 'No clinical significance'
    
    def _generate_clinical_recommendations(self, report: Dict) -> List[str]:
        """Klinik öneriler oluştur"""
        recommendations = []
        
        pathogenic_count = report['summary']['pathogenic_variants']
        likely_pathogenic_count = report['summary']['likely_pathogenic_variants']
        
        if pathogenic_count > 0:
            recommendations.append(f"🚨 {pathogenic_count} pathogenic variant detected - Immediate clinical action required")
        
        if likely_pathogenic_count > 0:
            recommendations.append(f"⚠️ {likely_pathogenic_count} likely pathogenic variant detected - Consider clinical action")
        
        if report['fda_approvals']:
            recommendations.append("💊 FDA-approved pharmacogenomic testing available")
        
        if report['cpic_guidelines']:
            recommendations.append("📋 CPIC guidelines available for drug dosing")
        
        return recommendations

def main():
    """Test fonksiyonu"""
    print("🧪 Klinik Doğrulama Sistemi Test Başlatılıyor...")
    
    # Test varyantları
    test_variants = [
        {
            'rsid': 'rs1801133',
            'gene': 'MTHFR',
            'variant_type': 'missense',
            'allele_frequency': 0.32,
            'cadd_score': 15.2,
            'sift_score': 0.02,
            'functional_evidence': {'damaging': True}
        },
        {
            'rsid': 'rs429358',
            'gene': 'APOE',
            'variant_type': 'missense',
            'allele_frequency': 0.14,
            'cadd_score': 22.1,
            'sift_score': 0.01,
            'functional_evidence': {'damaging': True}
        }
    ]
    
    # Klinik doğrulama sistemini başlat
    clinical = ClinicalValidationSystem()
    
    # ACMG sınıflandırması
    print("\n🏥 ACMG Sınıflandırması:")
    for variant in test_variants:
        acmg_result = clinical.classify_variant_acmg(variant, 'cardiovascular disease')
        print(f"  • {acmg_result.variant_id} ({acmg_result.gene}): {acmg_result.classification}")
        print(f"    Skor: {acmg_result.total_score}, Güven: {acmg_result.confidence}")
        print(f"    Klinik Aksiyon: {acmg_result.clinical_action}")
    
    # Klinik rapor
    report = clinical.generate_clinical_report(test_variants, 'cardiovascular disease')
    
    print(f"\n📋 Klinik Rapor Özeti:")
    print(f"  • Toplam Varyant: {report['summary']['total_variants']}")
    print(f"  • Pathogenic: {report['summary']['pathogenic_variants']}")
    print(f"  • Likely Pathogenic: {report['summary']['likely_pathogenic_variants']}")
    print(f"  • VUS: {report['summary']['vus_variants']}")
    
    print(f"\n💡 Klinik Öneriler:")
    for rec in report['clinical_recommendations']:
        print(f"  • {rec}")
    
    print("\n✅ Klinik doğrulama sistemi testi tamamlandı!")

if __name__ == "__main__":
    main()
