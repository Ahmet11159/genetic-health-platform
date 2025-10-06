"""
23andMe DNA Analiz Testi
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dna_analyzer import DNAAnalyzer, AnalysisType
import json

def test_23andme_analysis():
    """23andMe DNA analizini test et"""
    print("🧪 23andMe DNA Analiz Testi Başlatılıyor...")
    
    # 23andMe dosyasını test et
    analyzer = DNAAnalyzer("sample_23andme.txt")
    
    if analyzer.load_dna_data():
        print("✅ 23andMe verisi başarıyla yüklendi")
        
        # Analiz yap
        results = analyzer.analyze()
        
        # Sonuçları göster
        print("\n📊 23andMe Analiz Sonuçları:")
        print(f"Varyant Sayısı: {results.variant_count}")
        print(f"Analiz Edilen Genler: {results.analyzed_genes}")
        print(f"Güvenilirlik Skoru: {results.confidence_score:.2f}")
        
        # Sağlık riskleri
        if results.health_risks:
            print("\n🏥 Sağlık Riskleri:")
            for risk, score in results.health_risks.items():
                print(f"  • {risk}: {score:.2f}")
        
        # İlaç etkileşimleri
        if results.drug_interactions:
            print("\n💊 İlaç Etkileşimleri:")
            for drug, interaction in results.drug_interactions.items():
                print(f"  • {drug}: {interaction}")
        
        # Beslenme önerileri
        if results.nutrition_recommendations:
            print("\n🍎 Beslenme Önerileri:")
            for nutrient, rec in results.nutrition_recommendations.items():
                print(f"  • {nutrient}: {rec}")
        
        # Egzersiz önerileri
        if results.exercise_recommendations:
            print("\n💪 Egzersiz Önerileri:")
            for exercise, rec in results.exercise_recommendations.items():
                print(f"  • {exercise}: {rec}")
        
        # Taşıyıcı durumu
        if results.carrier_status:
            print("\n🧬 Taşıyıcı Durumu:")
            for gene, status in results.carrier_status.items():
                print(f"  • {gene}: {status}")
        
        # Özellik tahminleri
        if results.trait_predictions:
            print("\n🎯 Özellik Tahminleri:")
            for trait, prediction in results.trait_predictions.items():
                print(f"  • {trait}: {prediction}")
        
        # Sonuçları JSON olarak kaydet
        output_file = analyzer.export_results("json", "23andme_analysis_results.json")
        print(f"\n💾 Sonuçlar {output_file} dosyasına kaydedildi")
        
        return True
    else:
        print("❌ 23andMe veri yükleme başarısız")
        return False

if __name__ == "__main__":
    success = test_23andme_analysis()
    if success:
        print("\n🎉 23andMe analiz testi başarıyla tamamlandı!")
    else:
        print("\n❌ 23andMe analiz testi başarısız!")
