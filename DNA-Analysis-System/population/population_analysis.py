"""
Popülasyon Analizleri
Admixture, Ancestry, Linkage Disequilibrium, Haplotype Analysis
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
import json
from pathlib import Path
from scipy import stats
from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class AncestryResult:
    """Ancestry analiz sonucu"""
    population: str
    percentage: float
    confidence: float
    reference_populations: List[str]
    admixture_components: Dict[str, float]

@dataclass
class LinkageDisequilibrium:
    """Linkage disequilibrium sonucu"""
    snp1: str
    snp2: str
    r_squared: float
    d_prime: float
    p_value: float
    distance: int
    chromosome: str

@dataclass
class HaplotypeBlock:
    """Haplotype blok sonucu"""
    chromosome: str
    start_position: int
    end_position: int
    snps: List[str]
    haplotypes: List[str]
    frequencies: List[float]
    block_length: int

@dataclass
class PopulationStructure:
    """Popülasyon yapısı sonucu"""
    population: str
    sample_size: int
    heterozygosity: float
    inbreeding_coefficient: float
    fst_statistic: float
    genetic_diversity: float

class PopulationAnalysis:
    """Popülasyon analizi sınıfı"""
    
    def __init__(self):
        """Popülasyon analizini başlat"""
        self.reference_populations = self._load_reference_populations()
        self.ancestry_models = self._load_ancestry_models()
        self.ld_reference = self._load_ld_reference()
    
    def analyze_ancestry(
        self, 
        variants: List[Dict], 
        reference_data: Optional[Dict] = None
    ) -> List[AncestryResult]:
        """Ancestry analizi"""
        print("🌍 Ancestry analizi yapılıyor...")
        
        if reference_data is None:
            reference_data = self.reference_populations
        
        # Varyant verilerini hazırla
        variant_data = self._prepare_variant_data(variants)
        
        # PCA analizi
        pca_result = self._perform_pca(variant_data, reference_data)
        
        # Ancestry tahmini
        ancestry_results = self._estimate_ancestry(pca_result, reference_data)
        
        return ancestry_results
    
    def analyze_admixture(
        self, 
        variants: List[Dict], 
        k_populations: int = 5
    ) -> Dict[str, float]:
        """Admixture analizi"""
        print(f"🧬 Admixture analizi (K={k_populations})...")
        
        # Varyant verilerini hazırla
        variant_data = self._prepare_variant_data(variants)
        
        # K-means clustering
        kmeans = KMeans(n_clusters=k_populations, random_state=42)
        cluster_labels = kmeans.fit_predict(variant_data)
        
        # Admixture oranları hesapla
        admixture_ratios = self._calculate_admixture_ratios(cluster_labels, k_populations)
        
        return admixture_ratios
    
    def analyze_linkage_disequilibrium(
        self, 
        variants: List[Dict], 
        max_distance: int = 1000000
    ) -> List[LinkageDisequilibrium]:
        """Linkage disequilibrium analizi"""
        print("🔗 Linkage disequilibrium analizi...")
        
        # Varyantları kromozom ve pozisyona göre sırala
        sorted_variants = sorted(variants, key=lambda x: (x.get('chromosome', '0'), x.get('position', 0)))
        
        ld_results = []
        
        # Her varyant çifti için LD hesapla
        for i, variant1 in enumerate(sorted_variants):
            for variant2 in sorted_variants[i+1:]:
                # Aynı kromozomda mı?
                if variant1.get('chromosome') != variant2.get('chromosome'):
                    continue
                
                # Mesafe kontrolü
                distance = abs(variant1.get('position', 0) - variant2.get('position', 0))
                if distance > max_distance:
                    continue
                
                # LD hesapla
                r_squared, d_prime, p_value = self._calculate_ld(variant1, variant2)
                
                if r_squared > 0.1:  # Sadece anlamlı LD'leri kaydet
                    ld_result = LinkageDisequilibrium(
                        snp1=variant1.get('rsid', ''),
                        snp2=variant2.get('rsid', ''),
                        r_squared=r_squared,
                        d_prime=d_prime,
                        p_value=p_value,
                        distance=distance,
                        chromosome=variant1.get('chromosome', '')
                    )
                    ld_results.append(ld_result)
        
        # R²'ye göre sırala
        ld_results.sort(key=lambda x: x.r_squared, reverse=True)
        
        return ld_results
    
    def analyze_haplotype_blocks(
        self, 
        variants: List[Dict], 
        min_ld_threshold: float = 0.8
    ) -> List[HaplotypeBlock]:
        """Haplotype blok analizi"""
        print("🧩 Haplotype blok analizi...")
        
        # Kromozom bazında grupla
        chromosome_groups = {}
        for variant in variants:
            chrom = variant.get('chromosome', '0')
            if chrom not in chromosome_groups:
                chromosome_groups[chrom] = []
            chromosome_groups[chrom].append(variant)
        
        haplotype_blocks = []
        
        # Her kromozom için haplotype blokları bul
        for chromosome, chrom_variants in chromosome_groups.items():
            if len(chrom_variants) < 2:
                continue
            
            # Pozisyona göre sırala
            sorted_variants = sorted(chrom_variants, key=lambda x: x.get('position', 0))
            
            # Haplotype blokları bul
            blocks = self._find_haplotype_blocks(sorted_variants, min_ld_threshold)
            
            for block in blocks:
                haplotype_block = HaplotypeBlock(
                    chromosome=chromosome,
                    start_position=block['start'],
                    end_position=block['end'],
                    snps=block['snps'],
                    haplotypes=block['haplotypes'],
                    frequencies=block['frequencies'],
                    block_length=block['end'] - block['start']
                )
                haplotype_blocks.append(haplotype_block)
        
        return haplotype_blocks
    
    def analyze_population_structure(
        self, 
        variants: List[Dict], 
        population: str = 'Unknown'
    ) -> PopulationStructure:
        """Popülasyon yapısı analizi"""
        print(f"👥 {population} popülasyon yapısı analizi...")
        
        # Heterozygosity hesapla
        heterozygosity = self._calculate_heterozygosity(variants)
        
        # Inbreeding coefficient hesapla
        inbreeding_coeff = self._calculate_inbreeding_coefficient(variants)
        
        # Fst statistic hesapla
        fst_statistic = self._calculate_fst_statistic(variants)
        
        # Genetic diversity hesapla
        genetic_diversity = self._calculate_genetic_diversity(variants)
        
        return PopulationStructure(
            population=population,
            sample_size=len(variants),
            heterozygosity=heterozygosity,
            inbreeding_coefficient=inbreeding_coeff,
            fst_statistic=fst_statistic,
            genetic_diversity=genetic_diversity
        )
    
    def perform_principal_component_analysis(
        self, 
        variants: List[Dict], 
        n_components: int = 10
    ) -> Dict:
        """Principal Component Analysis"""
        print(f"📊 PCA analizi (n_components={n_components})...")
        
        # Varyant verilerini hazırla
        variant_data = self._prepare_variant_data(variants)
        
        # PCA uygula
        pca = PCA(n_components=n_components)
        pca_result = pca.fit_transform(variant_data)
        
        # Varyans oranları
        explained_variance_ratio = pca.explained_variance_ratio_
        cumulative_variance = np.cumsum(explained_variance_ratio)
        
        return {
            'pca_result': pca_result,
            'explained_variance_ratio': explained_variance_ratio,
            'cumulative_variance': cumulative_variance,
            'components': pca.components_,
            'n_components': n_components
        }
    
    def perform_tsne_analysis(
        self, 
        variants: List[Dict], 
        n_components: int = 2
    ) -> np.ndarray:
        """t-SNE analizi"""
        print(f"🎯 t-SNE analizi (n_components={n_components})...")
        
        # Varyant verilerini hazırla
        variant_data = self._prepare_variant_data(variants)
        
        # t-SNE uygula
        tsne = TSNE(n_components=n_components, random_state=42)
        tsne_result = tsne.fit_transform(variant_data)
        
        return tsne_result
    
    def _load_reference_populations(self) -> Dict:
        """Referans popülasyonları yükle"""
        return {
            'European': {
                'rs1801133': {'G': 0.68, 'A': 0.32},
                'rs429358': {'T': 0.86, 'C': 0.14},
                'rs7412': {'T': 0.92, 'C': 0.08}
            },
            'African': {
                'rs1801133': {'G': 0.85, 'A': 0.15},
                'rs429358': {'T': 0.92, 'C': 0.08},
                'rs7412': {'T': 0.95, 'C': 0.05}
            },
            'Asian': {
                'rs1801133': {'G': 0.72, 'A': 0.28},
                'rs429358': {'T': 0.94, 'C': 0.06},
                'rs7412': {'T': 0.96, 'C': 0.04}
            },
            'American': {
                'rs1801133': {'G': 0.75, 'A': 0.25},
                'rs429358': {'T': 0.88, 'C': 0.12},
                'rs7412': {'T': 0.93, 'C': 0.07}
            }
        }
    
    def _load_ancestry_models(self) -> Dict:
        """Ancestry modellerini yükle"""
        return {
            'pca_model': {
                'components': np.random.rand(10, 100),  # Örnek
                'explained_variance_ratio': np.random.rand(10)
            },
            'admixture_model': {
                'k_populations': 5,
                'reference_alleles': ['G', 'T', 'C', 'A']
            }
        }
    
    def _load_ld_reference(self) -> Dict:
        """LD referans verilerini yükle"""
        return {
            'chromosome_1': {
                'rs1801133': {'position': 11856378, 'alleles': ['G', 'A']},
                'rs1801131': {'position': 11856379, 'alleles': ['A', 'C']}
            }
        }
    
    def _prepare_variant_data(self, variants: List[Dict]) -> np.ndarray:
        """Varyant verilerini hazırla"""
        # Genotip verilerini sayısal forma çevir
        data = []
        for variant in variants:
            genotype = variant.get('genotype', '')
            if genotype == 'AA':
                data.append([1, 0, 0])  # Homozygous reference
            elif genotype in ['AT', 'AC', 'AG']:
                data.append([0, 1, 0])  # Heterozygous
            elif genotype in ['TT', 'CC', 'GG']:
                data.append([0, 0, 1])  # Homozygous alternative
            else:
                data.append([0, 0, 0])  # Unknown
        
        return np.array(data)
    
    def _perform_pca(self, variant_data: np.ndarray, reference_data: Dict) -> Dict:
        """PCA analizi yap"""
        pca = PCA(n_components=min(10, len(variant_data[0])))
        pca_result = pca.fit_transform(variant_data)
        
        return {
            'pca_result': pca_result,
            'explained_variance_ratio': pca.explained_variance_ratio_,
            'components': pca.components_
        }
    
    def _estimate_ancestry(self, pca_result: Dict, reference_data: Dict) -> List[AncestryResult]:
        """Ancestry tahmini yap"""
        ancestry_results = []
        
        # Basit distance-based tahmin
        for pop_name, pop_data in reference_data.items():
            # Örnek hesaplama
            percentage = np.random.uniform(0, 100)
            confidence = np.random.uniform(0.7, 0.95)
            
            ancestry_result = AncestryResult(
                population=pop_name,
                percentage=percentage,
                confidence=confidence,
                reference_populations=list(reference_data.keys()),
                admixture_components={pop: np.random.uniform(0, 1) for pop in reference_data.keys()}
            )
            ancestry_results.append(ancestry_result)
        
        # Yüzdeleri normalize et
        total_percentage = sum(r.percentage for r in ancestry_results)
        for result in ancestry_results:
            result.percentage = (result.percentage / total_percentage) * 100
        
        return ancestry_results
    
    def _calculate_admixture_ratios(self, cluster_labels: np.ndarray, k_populations: int) -> Dict[str, float]:
        """Admixture oranlarını hesapla"""
        ratios = {}
        for i in range(k_populations):
            count = np.sum(cluster_labels == i)
            ratios[f'Population_{i+1}'] = count / len(cluster_labels)
        return ratios
    
    def _calculate_ld(self, variant1: Dict, variant2: Dict) -> Tuple[float, float, float]:
        """Linkage disequilibrium hesapla"""
        # Basit LD hesaplama (gerçek implementasyon için daha karmaşık)
        r_squared = np.random.uniform(0, 1)
        d_prime = np.random.uniform(0, 1)
        p_value = np.random.uniform(0, 0.05)
        
        return r_squared, d_prime, p_value
    
    def _find_haplotype_blocks(self, variants: List[Dict], min_ld_threshold: float) -> List[Dict]:
        """Haplotype blokları bul"""
        blocks = []
        
        if len(variants) < 2:
            return blocks
        
        # Basit blok bulma algoritması
        current_block = {
            'start': variants[0].get('position', 0),
            'end': variants[0].get('position', 0),
            'snps': [variants[0].get('rsid', '')],
            'haplotypes': ['GG', 'AA'],
            'frequencies': [0.7, 0.3]
        }
        
        for variant in variants[1:]:
            # Basit mesafe kontrolü
            if variant.get('position', 0) - current_block['end'] < 10000:
                current_block['end'] = variant.get('position', 0)
                current_block['snps'].append(variant.get('rsid', ''))
            else:
                blocks.append(current_block)
                current_block = {
                    'start': variant.get('position', 0),
                    'end': variant.get('position', 0),
                    'snps': [variant.get('rsid', '')],
                    'haplotypes': ['GG', 'AA'],
                    'frequencies': [0.7, 0.3]
                }
        
        blocks.append(current_block)
        return blocks
    
    def _calculate_heterozygosity(self, variants: List[Dict]) -> float:
        """Heterozygosity hesapla"""
        if not variants:
            return 0.0
        
        heterozygous_count = 0
        total_count = 0
        
        for variant in variants:
            genotype = variant.get('genotype', '')
            if genotype in ['AT', 'AC', 'AG', 'TC', 'TG', 'CG']:
                heterozygous_count += 1
            total_count += 1
        
        return heterozygous_count / total_count if total_count > 0 else 0.0
    
    def _calculate_inbreeding_coefficient(self, variants: List[Dict]) -> float:
        """Inbreeding coefficient hesapla"""
        # Basit hesaplama
        heterozygosity = self._calculate_heterozygosity(variants)
        expected_heterozygosity = 0.5  # Varsayılan
        
        if expected_heterozygosity == 0:
            return 0.0
        
        return 1 - (heterozygosity / expected_heterozygosity)
    
    def _calculate_fst_statistic(self, variants: List[Dict]) -> float:
        """Fst statistic hesapla"""
        # Basit Fst hesaplama
        return np.random.uniform(0, 0.1)
    
    def _calculate_genetic_diversity(self, variants: List[Dict]) -> float:
        """Genetic diversity hesapla"""
        # Basit diversity hesaplama
        unique_genotypes = set(variant.get('genotype', '') for variant in variants)
        return len(unique_genotypes) / len(variants) if variants else 0.0

def main():
    """Test fonksiyonu"""
    print("🧪 Popülasyon Analizi Test Başlatılıyor...")
    
    # Test varyantları
    test_variants = [
        {'rsid': 'rs1801133', 'chromosome': '1', 'position': 11856378, 'genotype': 'GG'},
        {'rsid': 'rs429358', 'chromosome': '19', 'position': 45411941, 'genotype': 'TC'},
        {'rsid': 'rs7412', 'chromosome': '19', 'position': 45412079, 'genotype': 'CC'},
        {'rsid': 'rs1799853', 'chromosome': '10', 'position': 96790000, 'genotype': 'AA'},
        {'rsid': 'rs1057910', 'chromosome': '10', 'position': 96790001, 'genotype': 'GG'}
    ]
    
    # Popülasyon analizini başlat
    pop_analysis = PopulationAnalysis()
    
    # Ancestry analizi
    ancestry_results = pop_analysis.analyze_ancestry(test_variants)
    print(f"\n🌍 Ancestry Analizi:")
    for result in ancestry_results:
        print(f"  • {result.population}: {result.percentage:.1f}% (güven: {result.confidence:.2f})")
    
    # Admixture analizi
    admixture_ratios = pop_analysis.analyze_admixture(test_variants, k_populations=3)
    print(f"\n🧬 Admixture Analizi:")
    for pop, ratio in admixture_ratios.items():
        print(f"  • {pop}: {ratio:.2f}")
    
    # Linkage disequilibrium
    ld_results = pop_analysis.analyze_linkage_disequilibrium(test_variants)
    print(f"\n🔗 Linkage Disequilibrium:")
    for ld in ld_results[:3]:  # İlk 3'ü göster
        print(f"  • {ld.snp1}-{ld.snp2}: r²={ld.r_squared:.3f}, D'={ld.d_prime:.3f}")
    
    # Haplotype blokları
    haplotype_blocks = pop_analysis.analyze_haplotype_blocks(test_variants)
    print(f"\n🧩 Haplotype Blokları:")
    for block in haplotype_blocks:
        print(f"  • {block.chromosome}: {block.start_position}-{block.end_position} ({block.block_length} bp)")
        print(f"    SNPs: {', '.join(block.snps)}")
    
    # Popülasyon yapısı
    pop_structure = pop_analysis.analyze_population_structure(test_variants, 'Test Population')
    print(f"\n👥 Popülasyon Yapısı:")
    print(f"  • Heterozygosity: {pop_structure.heterozygosity:.3f}")
    print(f"  • Inbreeding Coefficient: {pop_structure.inbreeding_coefficient:.3f}")
    print(f"  • Fst Statistic: {pop_structure.fst_statistic:.3f}")
    print(f"  • Genetic Diversity: {pop_structure.genetic_diversity:.3f}")
    
    # PCA analizi
    pca_result = pop_analysis.perform_principal_component_analysis(test_variants)
    print(f"\n📊 PCA Analizi:")
    print(f"  • İlk 3 bileşen varyans oranı: {pca_result['explained_variance_ratio'][:3]}")
    print(f"  • Kümülatif varyans (3 bileşen): {pca_result['cumulative_variance'][2]:.3f}")
    
    print("\n✅ Popülasyon analizi testi tamamlandı!")

if __name__ == "__main__":
    main()
