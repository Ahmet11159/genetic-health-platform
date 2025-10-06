"""
DNA Analysis System - Test Modülü
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dna_analyzer import DNAAnalyzer, AnalysisType
import json

def test_dna_analyzer():
    """DNA analizörünü test et"""
    print("🧪 DNA Analiz Sistemi Test Başlatılıyor...")
    
    # Test için örnek VCF dosyası oluştur
    create_sample_vcf()
    
    # Analizörü başlat
    analyzer = DNAAnalyzer("sample.vcf")
    
    # DNA verisini yükle
    if analyzer.load_dna_data():
        print("✅ DNA verisi başarıyla yüklendi")
        
        # Analiz yap
        results = analyzer.analyze()
        
        # Sonuçları göster
        print("\n📊 Analiz Sonuçları:")
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
        output_file = analyzer.export_results("json", "test_results.json")
        print(f"\n💾 Sonuçlar {output_file} dosyasına kaydedildi")
        
        return True
    else:
        print("❌ DNA veri yükleme başarısız")
        return False

def create_sample_vcf():
    """Test için örnek VCF dosyası oluştur"""
    vcf_content = """##fileformat=VCFv4.2
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total read depth">
##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Read depth">
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	SAMPLE
1	11856378	rs1801133	G	A	99.9	PASS	DP=100;AF=0.3	GT:DP	0/1:50
19	45411941	rs429358	T	C	99.8	PASS	DP=95;AF=0.2	GT:DP	0/1:48
19	45412079	rs7412	C	T	99.7	PASS	DP=88;AF=0.15	GT:DP	1/1:44
"""
    
    with open("sample.vcf", "w") as f:
        f.write(vcf_content)
    
    print("📁 Örnek VCF dosyası oluşturuldu")

if __name__ == "__main__":
    success = test_dna_analyzer()
    if success:
        print("\n🎉 Test başarıyla tamamlandı!")
    else:
        print("\n❌ Test başarısız!")
