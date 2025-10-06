"""
Bilimsel DNA Analiz Algoritmaları
Poligenik risk skorları, popülasyon frekansları, fonksiyonel etki tahmini
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
import math
from scipy import stats

@dataclass
class PolygenicRiskScore:
    """Poligenik risk skoru"""
    trait: str
    score: float
    percentile: float
    risk_category: str
    confidence_interval: Tuple[float, float]

@dataclass
class PopulationFrequency:
    """Popülasyon frekansı"""
    rsid: str
    population: str
    frequency: float
    sample_size: int
    confidence_level: float

@dataclass
class FunctionalImpact:
    """Fonksiyonel etki tahmini"""
    rsid: str
    gene: str
    impact_score: float
    impact_category: str
    conservation_score: float
    pathogenicity_score: float

class ScientificAlgorithms:
    """Bilimsel analiz algoritmaları"""
    
    def __init__(self):
        """Algoritma sınıfını başlat"""
        self.population_weights = {
            'European': 1.0,
            'African': 0.8,
            'Asian': 0.9,
            'American': 0.85,
            'Mixed': 0.75
        }
    
    def calculate_polygenic_risk_score(
        self, 
        variants: List[Dict], 
        trait: str,
        population: str = 'European'
    ) -> PolygenicRiskScore:
        """
        Poligenik risk skoru hesapla
        
        Args:
            variants: Varyant listesi (rsid, effect_size, p_value, genotype)
            trait: Analiz edilecek özellik
            population: Popülasyon
        
        Returns:
            Poligenik risk skoru
        """
        print(f"🧮 {trait} için poligenik risk skoru hesaplanıyor...")
        
        # Özellik-specific ağırlıklar
        trait_weights = self._get_trait_weights(trait)
        
        # Popülasyon ağırlığı
        pop_weight = self.population_weights.get(population, 1.0)
        
        # Risk skoru hesapla
        total_score = 0.0
        total_weight = 0.0
        
        for variant in variants:
            rsid = variant.get('rsid', '')
            effect_size = variant.get('effect_size', 0.0)
            p_value = variant.get('p_value', 1.0)
            genotype = variant.get('genotype', '')
            
            # P-value filtresi (sadece anlamlı varyantlar)
            if p_value > 0.05:
                continue
            
            # Genotip ağırlığı
            genotype_weight = self._get_genotype_weight(genotype)
            
            # Varyant ağırlığı
            variant_weight = trait_weights.get(rsid, 1.0)
            
            # Skor hesapla
            variant_score = effect_size * genotype_weight * variant_weight * pop_weight
            
            # P-value'ya göre ağırlıklandır
            p_weight = self._get_pvalue_weight(p_value)
            variant_score *= p_weight
            
            total_score += variant_score
            total_weight += variant_weight * p_weight
        
        # Normalize et
        if total_weight > 0:
            normalized_score = total_score / total_weight
        else:
            normalized_score = 0.0
        
        # Percentil hesapla
        percentile = self._calculate_percentile(normalized_score, trait, population)
        
        # Risk kategorisi belirle
        risk_category = self._determine_risk_category(percentile)
        
        # Güven aralığı hesapla
        confidence_interval = self._calculate_confidence_interval(
            normalized_score, total_weight, trait
        )
        
        return PolygenicRiskScore(
            trait=trait,
            score=normalized_score,
            percentile=percentile,
            risk_category=risk_category,
            confidence_interval=confidence_interval
        )
    
    def calculate_population_frequencies(
        self, 
        rsids: List[str], 
        populations: List[str] = None
    ) -> List[PopulationFrequency]:
        """
        Popülasyon frekanslarını hesapla
        
        Args:
            rsids: RSID listesi
            populations: Popülasyon listesi
        
        Returns:
            Popülasyon frekansları
        """
        if populations is None:
            populations = ['European', 'African', 'Asian', 'American']
        
        print(f"🌍 {len(rsids)} RSID için popülasyon frekansları hesaplanıyor...")
        
        frequencies = []
        
        for rsid in rsids:
            for population in populations:
                # Gerçek implementasyon için 1000 Genomes Project API kullanılacak
                # Şimdilik örnek veri
                freq_data = self._get_sample_frequency(rsid, population)
                
                frequency = PopulationFrequency(
                    rsid=rsid,
                    population=population,
                    frequency=freq_data['frequency'],
                    sample_size=freq_data['sample_size'],
                    confidence_level=freq_data['confidence_level']
                )
                
                frequencies.append(frequency)
        
        return frequencies
    
    def predict_functional_impact(
        self, 
        variants: List[Dict]
    ) -> List[FunctionalImpact]:
        """
        Fonksiyonel etki tahmini
        
        Args:
            variants: Varyant listesi
        
        Returns:
            Fonksiyonel etki tahminleri
        """
        print(f"🔬 {len(variants)} varyant için fonksiyonel etki tahmini...")
        
        impacts = []
        
        for variant in variants:
            rsid = variant.get('rsid', '')
            gene = variant.get('gene', '')
            position = variant.get('position', 0)
            
            # Fonksiyonel etki skoru hesapla
            impact_score = self._calculate_impact_score(variant)
            
            # Etki kategorisi belirle
            impact_category = self._categorize_impact(impact_score)
            
            # Korunma skoru hesapla
            conservation_score = self._calculate_conservation_score(position, gene)
            
            # Patogenisite skoru hesapla
            pathogenicity_score = self._calculate_pathogenicity_score(variant)
            
            impact = FunctionalImpact(
                rsid=rsid,
                gene=gene,
                impact_score=impact_score,
                impact_category=impact_category,
                conservation_score=conservation_score,
                pathogenicity_score=pathogenicity_score
            )
            
            impacts.append(impact)
        
        return impacts
    
    def calculate_heritability(self, variants: List[Dict], trait: str) -> float:
        """
        Kalıtılabilirlik hesapla
        
        Args:
            variants: Varyant listesi
            trait: Özellik
        
        Returns:
            Kalıtılabilirlik (h²)
        """
        print(f"🧬 {trait} için kalıtılabilirlik hesaplanıyor...")
        
        # Varyant etki büyüklüklerini topla
        total_variance = sum(variant.get('effect_size', 0) ** 2 for variant in variants)
        
        # Özellik-specific kalıtılabilirlik
        trait_heritability = {
            'height': 0.8,
            'weight': 0.7,
            'intelligence': 0.5,
            'cardiovascular_disease': 0.4,
            'diabetes': 0.3,
            'alzheimer_disease': 0.6
        }
        
        base_heritability = trait_heritability.get(trait, 0.5)
        
        # Varyant etkilerini ekle
        variant_contribution = min(total_variance * 0.1, 0.3)  # Maksimum %30 katkı
        
        heritability = base_heritability + variant_contribution
        heritability = min(heritability, 1.0)  # Maksimum %100
        
        return heritability
    
    def _get_trait_weights(self, trait: str) -> Dict[str, float]:
        """Özellik-specific ağırlıklar"""
        weights = {
            'cardiovascular_disease': {
                'rs1801133': 1.5,  # MTHFR
                'rs429358': 2.0,   # APOE
                'rs7412': 1.8,     # APOE
            },
            'alzheimer_disease': {
                'rs429358': 3.0,   # APOE
                'rs7412': 2.5,     # APOE
            },
            'diabetes': {
                'rs1801133': 1.2,  # MTHFR
            }
        }
        return weights.get(trait, {})
    
    def _get_genotype_weight(self, genotype: str) -> float:
        """Genotip ağırlığı"""
        weights = {
            'AA': 0.0,    # Referans
            'AT': 0.5,    # Heterozigot
            'TT': 1.0,    # Homozigot
            'AC': 0.5,
            'CC': 1.0,
            'AG': 0.5,
            'GG': 1.0,
            'TC': 0.5,
            'TG': 0.5,
            'CG': 0.5,
            '--': 0.0,    # Eksik veri
        }
        return weights.get(genotype, 0.0)
    
    def _get_pvalue_weight(self, p_value: float) -> float:
        """P-value ağırlığı"""
        if p_value < 1e-8:
            return 1.0
        elif p_value < 1e-5:
            return 0.8
        elif p_value < 0.001:
            return 0.6
        elif p_value < 0.01:
            return 0.4
        elif p_value < 0.05:
            return 0.2
        else:
            return 0.0
    
    def _calculate_percentile(self, score: float, trait: str, population: str) -> float:
        """Percentil hesapla"""
        # Gerçek implementasyon için popülasyon verileri kullanılacak
        # Şimdilik örnek dağılım
        mean_scores = {
            'cardiovascular_disease': 0.15,
            'alzheimer_disease': 0.08,
            'diabetes': 0.12
        }
        
        std_scores = {
            'cardiovascular_disease': 0.05,
            'alzheimer_disease': 0.03,
            'diabetes': 0.04
        }
        
        mean = mean_scores.get(trait, 0.1)
        std = std_scores.get(trait, 0.05)
        
        # Z-score hesapla
        z_score = (score - mean) / std
        
        # Percentil hesapla
        percentile = stats.norm.cdf(z_score) * 100
        
        return max(0, min(100, percentile))
    
    def _determine_risk_category(self, percentile: float) -> str:
        """Risk kategorisi belirle"""
        if percentile >= 95:
            return "Çok Yüksek Risk"
        elif percentile >= 80:
            return "Yüksek Risk"
        elif percentile >= 60:
            return "Orta-Yüksek Risk"
        elif percentile >= 40:
            return "Orta Risk"
        elif percentile >= 20:
            return "Orta-Düşük Risk"
        else:
            return "Düşük Risk"
    
    def _calculate_confidence_interval(
        self, 
        score: float, 
        weight: float, 
        trait: str
    ) -> Tuple[float, float]:
        """Güven aralığı hesapla"""
        # Basit güven aralığı hesaplama
        se = 1.0 / math.sqrt(max(weight, 1))
        ci_95 = 1.96 * se
        
        lower = max(0, score - ci_95)
        upper = min(1, score + ci_95)
        
        return (lower, upper)
    
    def _get_sample_frequency(self, rsid: str, population: str) -> Dict:
        """Örnek popülasyon frekansı"""
        # Gerçek implementasyon için 1000 Genomes Project API
        sample_frequencies = {
            'rs1801133': {
                'European': {'frequency': 0.32, 'sample_size': 503, 'confidence_level': 0.95},
                'African': {'frequency': 0.15, 'sample_size': 661, 'confidence_level': 0.95},
                'Asian': {'frequency': 0.28, 'sample_size': 504, 'confidence_level': 0.95},
                'American': {'frequency': 0.25, 'sample_size': 347, 'confidence_level': 0.95}
            },
            'rs429358': {
                'European': {'frequency': 0.14, 'sample_size': 503, 'confidence_level': 0.95},
                'African': {'frequency': 0.08, 'sample_size': 661, 'confidence_level': 0.95},
                'Asian': {'frequency': 0.06, 'sample_size': 504, 'confidence_level': 0.95},
                'American': {'frequency': 0.12, 'sample_size': 347, 'confidence_level': 0.95}
            }
        }
        
        return sample_frequencies.get(rsid, {}).get(population, {
            'frequency': 0.1,
            'sample_size': 100,
            'confidence_level': 0.95
        })
    
    def _calculate_impact_score(self, variant: Dict) -> float:
        """Fonksiyonel etki skoru hesapla"""
        # Basit etki skoru hesaplama
        effect_size = abs(variant.get('effect_size', 0))
        p_value = variant.get('p_value', 1)
        
        # P-value'ya göre ağırlıklandır
        p_weight = -math.log10(max(p_value, 1e-10))
        
        # Etki skoru
        impact_score = effect_size * p_weight / 10  # Normalize et
        
        return min(impact_score, 1.0)
    
    def _categorize_impact(self, impact_score: float) -> str:
        """Etki kategorisi belirle"""
        if impact_score >= 0.8:
            return "Yüksek Etki"
        elif impact_score >= 0.5:
            return "Orta Etki"
        elif impact_score >= 0.2:
            return "Düşük Etki"
        else:
            return "Minimal Etki"
    
    def _calculate_conservation_score(self, position: int, gene: str) -> float:
        """Korunma skoru hesapla"""
        # Basit korunma skoru (gerçek implementasyon için PhyloP kullanılacak)
        return np.random.uniform(0.3, 0.9)
    
    def _calculate_pathogenicity_score(self, variant: Dict) -> float:
        """Patogenisite skoru hesapla"""
        # Basit patogenisite skoru
        effect_size = abs(variant.get('effect_size', 0))
        p_value = variant.get('p_value', 1)
        
        # P-value'ya göre ağırlıklandır
        p_weight = -math.log10(max(p_value, 1e-10))
        
        pathogenicity = effect_size * p_weight / 15  # Normalize et
        
        return min(pathogenicity, 1.0)

def main():
    """Test fonksiyonu"""
    print("🧪 Bilimsel Algoritmalar Test Başlatılıyor...")
    
    # Test verileri
    test_variants = [
        {
            'rsid': 'rs1801133',
            'gene': 'MTHFR',
            'effect_size': 0.15,
            'p_value': 1.2e-8,
            'genotype': 'GG',
            'position': 11856378
        },
        {
            'rsid': 'rs429358',
            'gene': 'APOE',
            'effect_size': 0.25,
            'p_value': 5.4e-12,
            'genotype': 'TC',
            'position': 45411941
        }
    ]
    
    # Algoritma sınıfını başlat
    algorithms = ScientificAlgorithms()
    
    # Poligenik risk skoru hesapla
    prs = algorithms.calculate_polygenic_risk_score(
        test_variants, 
        'cardiovascular_disease', 
        'European'
    )
    
    print(f"\n📊 Poligenik Risk Skoru:")
    print(f"  • Özellik: {prs.trait}")
    print(f"  • Skor: {prs.score:.3f}")
    print(f"  • Percentil: {prs.percentile:.1f}%")
    print(f"  • Risk Kategorisi: {prs.risk_category}")
    print(f"  • Güven Aralığı: {prs.confidence_interval}")
    
    # Popülasyon frekansları
    frequencies = algorithms.calculate_population_frequencies(['rs1801133', 'rs429358'])
    print(f"\n🌍 Popülasyon Frekansları:")
    for freq in frequencies[:4]:  # İlk 4'ü göster
        print(f"  • {freq.rsid} ({freq.population}): {freq.frequency:.3f}")
    
    # Fonksiyonel etki tahmini
    impacts = algorithms.predict_functional_impact(test_variants)
    print(f"\n🔬 Fonksiyonel Etki Tahmini:")
    for impact in impacts:
        print(f"  • {impact.rsid} ({impact.gene}): {impact.impact_category} ({impact.impact_score:.3f})")
    
    # Kalıtılabilirlik
    heritability = algorithms.calculate_heritability(test_variants, 'cardiovascular_disease')
    print(f"\n🧬 Kalıtılabilirlik: {heritability:.3f}")
    
    print("\n✅ Bilimsel algoritmalar testi tamamlandı!")

if __name__ == "__main__":
    main()
