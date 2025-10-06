"""
Machine Learning Algoritmaları
Deep Learning, Ensemble, Bayesian, Pathway Analysis
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
import json
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import lightgbm as lgb
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

@dataclass
class MLPrediction:
    """ML tahmin sonucu"""
    model_name: str
    prediction: float
    confidence: float
    feature_importance: Dict[str, float]
    cross_validation_score: float

@dataclass
class PathwayAnalysis:
    """Pathway analiz sonucu"""
    pathway_name: str
    genes: List[str]
    p_value: float
    fdr_corrected: float
    enrichment_score: float
    pathway_genes: List[str]
    overlap_genes: List[str]

@dataclass
class GeneInteraction:
    """Gen-gen etkileşimi"""
    gene1: str
    gene2: str
    interaction_type: str
    interaction_strength: float
    p_value: float
    biological_function: str

class AdvancedMLAlgorithms:
    """Gelişmiş ML algoritmaları sınıfı"""
    
    def __init__(self):
        """ML algoritmalarını başlat"""
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        
        # Model tanımları
        self.model_configs = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'neural_network': MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42),
            'svm': SVC(probability=True, random_state=42),
            'logistic_regression': LogisticRegression(random_state=42, max_iter=1000),
            'xgboost': xgb.XGBClassifier(random_state=42),
            'lightgbm': lgb.LGBMClassifier(random_state=42, verbose=-1)
        }
    
    def train_ensemble_model(
        self, 
        X: np.ndarray, 
        y: np.ndarray, 
        trait: str,
        test_size: float = 0.2
    ) -> Dict[str, MLPrediction]:
        """Ensemble model eğitimi"""
        print(f"🤖 {trait} için ensemble model eğitiliyor...")
        
        # Veriyi böl
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
        # Özellik ölçeklendirme
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers[trait] = scaler
        
        predictions = {}
        
        # Her model için eğitim
        for model_name, model in self.model_configs.items():
            try:
                # Model eğitimi
                if model_name in ['neural_network', 'svm', 'logistic_regression']:
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict_proba(X_test_scaled)[:, 1]
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict_proba(X_test)[:, 1]
                
                # Performans metrikleri
                y_pred_binary = (y_pred > 0.5).astype(int)
                accuracy = accuracy_score(y_test, y_pred_binary)
                precision = precision_score(y_test, y_pred_binary, average='weighted')
                recall = recall_score(y_test, y_pred_binary, average='weighted')
                f1 = f1_score(y_test, y_pred_binary, average='weighted')
                
                # Cross-validation
                if model_name in ['neural_network', 'svm', 'logistic_regression']:
                    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
                else:
                    cv_scores = cross_val_score(model, X_train, y_train, cv=5)
                
                # Feature importance
                if hasattr(model, 'feature_importances_'):
                    feature_importance = dict(zip(range(len(X[0])), model.feature_importances_))
                else:
                    feature_importance = {}
                
                # Sonuç kaydet
                predictions[model_name] = MLPrediction(
                    model_name=model_name,
                    prediction=np.mean(y_pred),
                    confidence=np.std(y_pred),
                    feature_importance=feature_importance,
                    cross_validation_score=np.mean(cv_scores)
                )
                
                # Model kaydet
                self.models[f"{trait}_{model_name}"] = model
                
                print(f"  ✅ {model_name}: CV Score = {np.mean(cv_scores):.3f}")
                
            except Exception as e:
                print(f"  ❌ {model_name} hatası: {e}")
                continue
        
        return predictions
    
    def predict_disease_risk(
        self, 
        variants: List[Dict], 
        trait: str
    ) -> Dict[str, float]:
        """Hastalık riski tahmini"""
        print(f"🔮 {trait} için hastalık riski tahmin ediliyor...")
        
        # Özellik vektörü oluştur
        features = self._create_feature_vector(variants)
        
        if features is None or len(features) == 0:
            return {}
        
        predictions = {}
        
        # Her model için tahmin
        for model_name in self.model_configs.keys():
            model_key = f"{trait}_{model_name}"
            if model_key in self.models:
                try:
                    model = self.models[model_key]
                    scaler = self.scalers.get(trait)
                    
                    # Özellik ölçeklendirme
                    if scaler and model_name in ['neural_network', 'svm', 'logistic_regression']:
                        features_scaled = scaler.transform([features])
                        pred = model.predict_proba(features_scaled)[0][1]
                    else:
                        pred = model.predict_proba([features])[0][1]
                    
                    predictions[model_name] = pred
                    
                except Exception as e:
                    print(f"  ⚠️ {model_name} tahmin hatası: {e}")
                    continue
        
        return predictions
    
    def analyze_pathways(
        self, 
        variants: List[Dict], 
        background_genes: List[str]
    ) -> List[PathwayAnalysis]:
        """Pathway analizi"""
        print("🛤️ Pathway analizi yapılıyor...")
        
        # Varyant genlerini topla
        variant_genes = [v.get('gene', '') for v in variants if v.get('gene')]
        variant_genes = list(set(variant_genes))
        
        if not variant_genes:
            return []
        
        # Pathway veritabanı (gerçek implementasyon için KEGG, Reactome kullanılacak)
        pathways = self._get_pathway_database()
        
        pathway_results = []
        
        for pathway_name, pathway_genes in pathways.items():
            # Overlap hesapla
            overlap_genes = list(set(variant_genes) & set(pathway_genes))
            
            if len(overlap_genes) == 0:
                continue
            
            # Enrichment analizi (Fisher's exact test)
            a = len(overlap_genes)  # Pathway'deki varyant genler
            b = len(pathway_genes) - a  # Pathway'deki diğer genler
            c = len(variant_genes) - a  # Varyant genlerdeki diğer genler
            d = len(background_genes) - a - b - c  # Background'daki diğer genler
            
            # Fisher's exact test
            odds_ratio, p_value = stats.fisher_exact([[a, b], [c, d]])
            
            # FDR düzeltmesi (basit)
            fdr_corrected = p_value * len(pathways)
            
            # Enrichment skoru
            enrichment_score = (a / len(pathway_genes)) / (len(variant_genes) / len(background_genes))
            
            pathway_result = PathwayAnalysis(
                pathway_name=pathway_name,
                genes=pathway_genes,
                p_value=p_value,
                fdr_corrected=fdr_corrected,
                enrichment_score=enrichment_score,
                pathway_genes=pathway_genes,
                overlap_genes=overlap_genes
            )
            
            pathway_results.append(pathway_result)
        
        # P-value'a göre sırala
        pathway_results.sort(key=lambda x: x.p_value)
        
        return pathway_results
    
    def analyze_gene_interactions(
        self, 
        variants: List[Dict]
    ) -> List[GeneInteraction]:
        """Gen-gen etkileşim analizi"""
        print("🔗 Gen-gen etkileşim analizi yapılıyor...")
        
        # Varyant genlerini topla
        variant_genes = [v.get('gene', '') for v in variants if v.get('gene')]
        variant_genes = list(set(variant_genes))
        
        if len(variant_genes) < 2:
            return []
        
        interactions = []
        
        # Her gen çifti için etkileşim analizi
        for i, gene1 in enumerate(variant_genes):
            for gene2 in variant_genes[i+1:]:
                # Etkileşim gücü hesapla (basit korelasyon)
                interaction_strength = self._calculate_interaction_strength(gene1, gene2, variants)
                
                # P-value hesapla
                p_value = self._calculate_interaction_pvalue(gene1, gene2, variants)
                
                # Etkileşim türü belirle
                interaction_type = self._determine_interaction_type(interaction_strength)
                
                # Biyolojik fonksiyon
                biological_function = self._get_biological_function(gene1, gene2)
                
                interaction = GeneInteraction(
                    gene1=gene1,
                    gene2=gene2,
                    interaction_type=interaction_type,
                    interaction_strength=interaction_strength,
                    p_value=p_value,
                    biological_function=biological_function
                )
                
                interactions.append(interaction)
        
        # Etkileşim gücüne göre sırala
        interactions.sort(key=lambda x: x.interaction_strength, reverse=True)
        
        return interactions
    
    def calculate_rare_variant_burden(
        self, 
        variants: List[Dict], 
        gene: str
    ) -> Dict[str, float]:
        """Rare variant burden analizi"""
        print(f"🔍 {gene} için rare variant burden analizi...")
        
        # Gen-specific varyantları filtrele
        gene_variants = [v for v in variants if v.get('gene') == gene]
        
        if not gene_variants:
            return {}
        
        # Rare variant kriterleri
        rare_threshold = 0.01  # %1'den az frekans
        
        rare_variants = []
        for variant in gene_variants:
            # Frekans bilgisi varsa kontrol et
            frequency = variant.get('frequency', 0.5)  # Varsayılan
            if frequency < rare_threshold:
                rare_variants.append(variant)
        
        # Burden skorları
        burden_scores = {
            'total_variants': len(gene_variants),
            'rare_variants': len(rare_variants),
            'burden_ratio': len(rare_variants) / len(gene_variants) if gene_variants else 0,
            'pathogenic_rare': len([v for v in rare_variants if v.get('pathogenicity', 0) > 0.7]),
            'burden_score': sum(v.get('effect_size', 0) for v in rare_variants)
        }
        
        return burden_scores
    
    def _create_feature_vector(self, variants: List[Dict]) -> Optional[np.ndarray]:
        """Özellik vektörü oluştur"""
        if not variants:
            return None
        
        # Özellikler
        features = []
        
        for variant in variants:
            # Genotip özellikleri
            genotype = variant.get('genotype', '')
            if genotype == 'AA':
                features.extend([1, 0, 0])  # Homozygous reference
            elif genotype == 'AT' or genotype == 'AC' or genotype == 'AG':
                features.extend([0, 1, 0])  # Heterozygous
            elif genotype == 'TT' or genotype == 'CC' or genotype == 'GG':
                features.extend([0, 0, 1])  # Homozygous alternative
            else:
                features.extend([0, 0, 0])  # Unknown
            
            # Diğer özellikler
            features.append(variant.get('effect_size', 0))
            features.append(variant.get('p_value', 1))
            features.append(variant.get('quality_score', 0) / 100)
            features.append(1 if variant.get('pathogenicity', 0) > 0.5 else 0)
        
        return np.array(features)
    
    def _get_pathway_database(self) -> Dict[str, List[str]]:
        """Pathway veritabanı (örnek)"""
        return {
            'Folate metabolism': ['MTHFR', 'MTR', 'MTRR', 'DHFR', 'TYMS'],
            'Cholesterol metabolism': ['APOE', 'LDLR', 'PCSK9', 'CETP', 'ABCG5'],
            'Drug metabolism': ['CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'DPYD'],
            'DNA repair': ['BRCA1', 'BRCA2', 'ATM', 'CHEK2', 'PALB2'],
            'Immune response': ['HLA-A', 'HLA-B', 'HLA-C', 'HLA-DRB1', 'HLA-DQB1']
        }
    
    def _calculate_interaction_strength(self, gene1: str, gene2: str, variants: List[Dict]) -> float:
        """Etkileşim gücü hesapla"""
        # Basit korelasyon benzeri hesaplama
        gene1_variants = [v for v in variants if v.get('gene') == gene1]
        gene2_variants = [v for v in variants if v.get('gene') == gene2]
        
        if not gene1_variants or not gene2_variants:
            return 0.0
        
        # Etkileşim skoru (basit)
        interaction_score = len(gene1_variants) * len(gene2_variants) / 100
        return min(interaction_score, 1.0)
    
    def _calculate_interaction_pvalue(self, gene1: str, gene2: str, variants: List[Dict]) -> float:
        """Etkileşim p-value hesapla"""
        # Basit p-value hesaplama
        interaction_strength = self._calculate_interaction_strength(gene1, gene2, variants)
        return max(0.001, 1.0 - interaction_strength)
    
    def _determine_interaction_type(self, strength: float) -> str:
        """Etkileşim türü belirle"""
        if strength > 0.8:
            return "Strong"
        elif strength > 0.5:
            return "Moderate"
        elif strength > 0.2:
            return "Weak"
        else:
            return "None"
    
    def _get_biological_function(self, gene1: str, gene2: str) -> str:
        """Biyolojik fonksiyon belirle"""
        # Basit fonksiyon eşleştirmesi
        functions = {
            ('MTHFR', 'MTR'): 'Folate metabolism',
            ('APOE', 'LDLR'): 'Cholesterol transport',
            ('CYP2C9', 'CYP2C19'): 'Drug metabolism',
            ('BRCA1', 'BRCA2'): 'DNA repair'
        }
        
        return functions.get((gene1, gene2), 'Unknown function')

def main():
    """Test fonksiyonu"""
    print("🧪 Gelişmiş ML Algoritmaları Test Başlatılıyor...")
    
    # Test verileri
    test_variants = [
        {'gene': 'MTHFR', 'genotype': 'GG', 'effect_size': 0.15, 'p_value': 1e-8, 'quality_score': 99},
        {'gene': 'APOE', 'genotype': 'TC', 'effect_size': 0.25, 'p_value': 5e-12, 'quality_score': 98},
        {'gene': 'CYP2C9', 'genotype': 'AA', 'effect_size': 0.10, 'p_value': 0.01, 'quality_score': 95}
    ]
    
    # ML algoritmalarını başlat
    ml = AdvancedMLAlgorithms()
    
    # Örnek eğitim verisi oluştur
    X = np.random.rand(100, 12)  # 100 örnek, 12 özellik
    y = np.random.randint(0, 2, 100)  # Binary sınıflandırma
    
    # Ensemble model eğitimi
    predictions = ml.train_ensemble_model(X, y, 'cardiovascular_disease')
    
    print(f"\n📊 Ensemble Model Sonuçları:")
    for model_name, pred in predictions.items():
        print(f"  • {model_name}: CV Score = {pred.cross_validation_score:.3f}")
    
    # Pathway analizi
    pathways = ml.analyze_pathways(test_variants, ['MTHFR', 'APOE', 'CYP2C9', 'MTR', 'LDLR'])
    print(f"\n🛤️ Pathway Analizi:")
    for pathway in pathways[:3]:  # İlk 3'ü göster
        print(f"  • {pathway.pathway_name}: p={pathway.p_value:.3e}, overlap={len(pathway.overlap_genes)}")
    
    # Gen-gen etkileşimleri
    interactions = ml.analyze_gene_interactions(test_variants)
    print(f"\n🔗 Gen-Gen Etkileşimleri:")
    for interaction in interactions[:3]:  # İlk 3'ü göster
        print(f"  • {interaction.gene1}-{interaction.gene2}: {interaction.interaction_type} ({interaction.interaction_strength:.3f})")
    
    # Rare variant burden
    burden = ml.calculate_rare_variant_burden(test_variants, 'MTHFR')
    print(f"\n🔍 Rare Variant Burden (MTHFR):")
    for key, value in burden.items():
        print(f"  • {key}: {value}")
    
    print("\n✅ Gelişmiş ML algoritmaları testi tamamlandı!")

if __name__ == "__main__":
    main()
