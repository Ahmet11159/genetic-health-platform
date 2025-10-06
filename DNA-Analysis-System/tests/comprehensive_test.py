"""
Kapsamlı DNA Analiz Sistemi Testi
Tüm özelliklerin test edilmesi ve doğrulanması
"""

import sys
import os
import json
import time
from pathlib import Path

# Ana modülü import et
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dna_analyzer import DNAAnalyzer, AnalysisType

class ComprehensiveTester:
    """Kapsamlı test sınıfı"""
    
    def __init__(self):
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }
    
    def run_all_tests(self):
        """Tüm testleri çalıştır"""
        print("🧪 Kapsamlı DNA Analiz Sistemi Testi Başlatılıyor...")
        print("=" * 60)
        
        # Test 1: 23andMe Format Testi
        self.test_23andme_format()
        
        # Test 2: Gerçek Veritabanları Testi
        self.test_real_databases()
        
        # Test 3: Bilimsel Algoritmalar Testi
        self.test_scientific_algorithms()
        
        # Test 4: Performans Testi
        self.test_performance()
        
        # Test 5: Hata Yönetimi Testi
        self.test_error_handling()
        
        # Test 6: Sonuç Doğrulama Testi
        self.test_result_validation()
        
        # Test sonuçlarını göster
        self.print_test_summary()
        
        return self.test_results
    
    def test_23andme_format(self):
        """23andMe format testi"""
        print("\n📋 Test 1: 23andMe Format Desteği")
        print("-" * 40)
        
        try:
            # 23andMe dosyasını test et
            analyzer = DNAAnalyzer("sample_23andme.txt")
            
            # Veri yükleme testi
            if analyzer.load_dna_data():
                self.add_test_result("23andMe Veri Yükleme", True, "10 SNP başarıyla yüklendi")
            else:
                self.add_test_result("23andMe Veri Yükleme", False, "Veri yükleme başarısız")
                return
            
            # Analiz testi
            results = analyzer.analyze()
            
            # Temel sonuç kontrolü
            if results.variant_count > 0:
                self.add_test_result("23andMe Analiz", True, f"{results.variant_count} varyant analiz edildi")
            else:
                self.add_test_result("23andMe Analiz", False, "Analiz sonucu boş")
            
            # Gen analizi kontrolü
            if len(results.analyzed_genes) > 0:
                self.add_test_result("Gen Analizi", True, f"{len(results.analyzed_genes)} gen analiz edildi")
            else:
                self.add_test_result("Gen Analizi", False, "Gen analizi başarısız")
            
        except Exception as e:
            self.add_test_result("23andMe Format Testi", False, f"Hata: {str(e)}")
    
    def test_real_databases(self):
        """Gerçek veritabanları testi"""
        print("\n📋 Test 2: Gerçek Veritabanları Entegrasyonu")
        print("-" * 40)
        
        try:
            analyzer = DNAAnalyzer("sample_23andme.txt")
            analyzer.load_dna_data()
            results = analyzer.analyze()
            
            # ClinVar verisi kontrolü
            if analyzer.clinvar_data and len(analyzer.clinvar_data) > 0:
                self.add_test_result("ClinVar Entegrasyonu", True, f"{len(analyzer.clinvar_data)} ClinVar varyantı")
            else:
                self.add_test_result("ClinVar Entegrasyonu", False, "ClinVar verisi yok")
            
            # PharmGKB verisi kontrolü
            if analyzer.pharmgkb_data and len(analyzer.pharmgkb_data) > 0:
                self.add_test_result("PharmGKB Entegrasyonu", True, f"{len(analyzer.pharmgkb_data)} PharmGKB varyantı")
            else:
                self.add_test_result("PharmGKB Entegrasyonu", False, "PharmGKB verisi yok")
            
            # GWAS verisi kontrolü
            if analyzer.gwas_data and len(analyzer.gwas_data) > 0:
                self.add_test_result("GWAS Entegrasyonu", True, f"{len(analyzer.gwas_data)} GWAS varyantı")
            else:
                self.add_test_result("GWAS Entegrasyonu", False, "GWAS verisi yok")
            
        except Exception as e:
            self.add_test_result("Gerçek Veritabanları Testi", False, f"Hata: {str(e)}")
    
    def test_scientific_algorithms(self):
        """Bilimsel algoritmalar testi"""
        print("\n📋 Test 3: Bilimsel Algoritmalar")
        print("-" * 40)
        
        try:
            analyzer = DNAAnalyzer("sample_23andme.txt")
            analyzer.load_dna_data()
            results = analyzer.analyze()
            
            # Poligenik risk skorları kontrolü
            if results.polygenic_risk_scores and len(results.polygenic_risk_scores) > 0:
                self.add_test_result("Poligenik Risk Skorları", True, f"{len(results.polygenic_risk_scores)} özellik için PRS")
            else:
                self.add_test_result("Poligenik Risk Skorları", False, "PRS hesaplanamadı")
            
            # Popülasyon frekansları kontrolü
            if results.population_frequencies and len(results.population_frequencies) > 0:
                self.add_test_result("Popülasyon Frekansları", True, f"{len(results.population_frequencies)} RSID için frekans")
            else:
                self.add_test_result("Popülasyon Frekansları", False, "Popülasyon frekansları hesaplanamadı")
            
            # Fonksiyonel etkiler kontrolü
            if results.functional_impacts and len(results.functional_impacts) > 0:
                self.add_test_result("Fonksiyonel Etkiler", True, f"{len(results.functional_impacts)} varyant için etki")
            else:
                self.add_test_result("Fonksiyonel Etkiler", False, "Fonksiyonel etkiler hesaplanamadı")
            
            # Kalıtılabilirlik kontrolü
            if results.heritability_scores and len(results.heritability_scores) > 0:
                self.add_test_result("Kalıtılabilirlik", True, f"{len(results.heritability_scores)} özellik için h²")
            else:
                self.add_test_result("Kalıtılabilirlik", False, "Kalıtılabilirlik hesaplanamadı")
            
        except Exception as e:
            self.add_test_result("Bilimsel Algoritmalar Testi", False, f"Hata: {str(e)}")
    
    def test_performance(self):
        """Performans testi"""
        print("\n📋 Test 4: Performans Testi")
        print("-" * 40)
        
        try:
            start_time = time.time()
            
            analyzer = DNAAnalyzer("sample_23andme.txt")
            analyzer.load_dna_data()
            results = analyzer.analyze()
            
            end_time = time.time()
            execution_time = end_time - start_time
            
            # Performans kriterleri
            if execution_time < 10:  # 10 saniyeden az
                self.add_test_result("Performans", True, f"Analiz {execution_time:.2f} saniyede tamamlandı")
            else:
                self.add_test_result("Performans", False, f"Analiz çok yavaş: {execution_time:.2f} saniye")
            
            # Bellek kullanımı kontrolü
            import psutil
            memory_usage = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            if memory_usage < 500:  # 500 MB'den az
                self.add_test_result("Bellek Kullanımı", True, f"Bellek kullanımı: {memory_usage:.1f} MB")
            else:
                self.add_test_result("Bellek Kullanımı", False, f"Çok fazla bellek: {memory_usage:.1f} MB")
            
        except Exception as e:
            self.add_test_result("Performans Testi", False, f"Hata: {str(e)}")
    
    def test_error_handling(self):
        """Hata yönetimi testi"""
        print("\n📋 Test 5: Hata Yönetimi")
        print("-" * 40)
        
        try:
            # Geçersiz dosya testi
            analyzer = DNAAnalyzer("nonexistent_file.txt")
            result = analyzer.load_dna_data()
            if not result:
                self.add_test_result("Geçersiz Dosya", True, "Hata doğru yakalandı")
            else:
                self.add_test_result("Geçersiz Dosya", False, "Hata yakalanmadı")
            
            # Boş analiz testi
            try:
                analyzer = DNAAnalyzer("sample_23andme.txt")
                # Veri yüklemeden analiz yapmaya çalış
                analyzer.analyze()
                self.add_test_result("Boş Analiz", False, "Hata yakalanmadı")
            except ValueError:
                self.add_test_result("Boş Analiz", True, "Hata doğru yakalandı")
            
        except Exception as e:
            self.add_test_result("Hata Yönetimi Testi", False, f"Hata: {str(e)}")
    
    def test_result_validation(self):
        """Sonuç doğrulama testi"""
        print("\n📋 Test 6: Sonuç Doğrulama")
        print("-" * 40)
        
        try:
            analyzer = DNAAnalyzer("sample_23andme.txt")
            analyzer.load_dna_data()
            results = analyzer.analyze()
            
            # JSON export testi
            try:
                output_file = analyzer.export_results("json", "test_validation.json")
                if Path(output_file).exists():
                    self.add_test_result("JSON Export", True, "Sonuçlar başarıyla kaydedildi")
                else:
                    self.add_test_result("JSON Export", False, "Dosya oluşturulamadı")
            except Exception as e:
                self.add_test_result("JSON Export", False, f"Export hatası: {str(e)}")
            
            # Sonuç yapısı kontrolü
            required_fields = [
                'variant_count', 'analyzed_genes', 'health_risks',
                'drug_interactions', 'confidence_score', 'analysis_date'
            ]
            
            missing_fields = []
            for field in required_fields:
                if not hasattr(results, field) or getattr(results, field) is None:
                    missing_fields.append(field)
            
            if not missing_fields:
                self.add_test_result("Sonuç Yapısı", True, "Tüm gerekli alanlar mevcut")
            else:
                self.add_test_result("Sonuç Yapısı", False, f"Eksik alanlar: {missing_fields}")
            
            # Veri kalitesi kontrolü
            if results.confidence_score > 0.5:
                self.add_test_result("Veri Kalitesi", True, f"Güvenilirlik skoru: {results.confidence_score:.2f}")
            else:
                self.add_test_result("Veri Kalitesi", False, f"Düşük güvenilirlik: {results.confidence_score:.2f}")
            
        except Exception as e:
            self.add_test_result("Sonuç Doğrulama Testi", False, f"Hata: {str(e)}")
    
    def add_test_result(self, test_name: str, passed: bool, message: str):
        """Test sonucu ekle"""
        self.test_results['total_tests'] += 1
        if passed:
            self.test_results['passed_tests'] += 1
            status = "✅ PASS"
        else:
            self.test_results['failed_tests'] += 1
            status = "❌ FAIL"
        
        self.test_results['test_details'].append({
            'test_name': test_name,
            'passed': passed,
            'message': message
        })
        
        print(f"  {status} {test_name}: {message}")
    
    def print_test_summary(self):
        """Test özetini yazdır"""
        print("\n" + "=" * 60)
        print("📊 TEST ÖZETİ")
        print("=" * 60)
        
        total = self.test_results['total_tests']
        passed = self.test_results['passed_tests']
        failed = self.test_results['failed_tests']
        
        print(f"Toplam Test: {total}")
        print(f"Başarılı: {passed} ({passed/total*100:.1f}%)")
        print(f"Başarısız: {failed} ({failed/total*100:.1f}%)")
        
        if failed == 0:
            print("\n🎉 TÜM TESTLER BAŞARILI!")
            print("DNA Analiz Sistemi tamamen çalışır durumda!")
        else:
            print(f"\n⚠️ {failed} test başarısız!")
            print("Başarısız testler:")
            for test in self.test_results['test_details']:
                if not test['passed']:
                    print(f"  • {test['test_name']}: {test['message']}")
        
        # Sonuçları dosyaya kaydet
        with open("test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n📄 Detaylı sonuçlar test_results.json dosyasına kaydedildi")

def main():
    """Ana test fonksiyonu"""
    tester = ComprehensiveTester()
    results = tester.run_all_tests()
    
    # Test sonucuna göre exit code
    if results['failed_tests'] == 0:
        exit(0)  # Başarılı
    else:
        exit(1)  # Başarısız

if __name__ == "__main__":
    main()
