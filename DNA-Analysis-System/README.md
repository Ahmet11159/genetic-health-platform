# DNA Analysis System

## 🧬 Gerçek DNA Analiz Sistemi

Bu proje, GenoHealth uygulaması için gerçek DNA analizi yapan bağımsız bir sistemdir.

## 🚀 Özellikler

- **Gerçek DNA Veri Analizi**: VCF, FASTA, FASTQ formatlarını destekler
- **Genetik Varyant Analizi**: SNP, indel, CNV analizi
- **Hastalık Risk Analizi**: Poligenik risk skorları
- **Farmakogenomik**: İlaç etkileşim analizi
- **Beslenme Genetiği**: Metabolizma analizi
- **Egzersiz Genetiği**: Fiziksel performans analizi

## 📦 Kurulum

```bash
# Virtual environment oluştur
python3 -m venv venv

# Aktif et
source venv/bin/activate  # macOS/Linux
# veya
venv\Scripts\activate     # Windows

# Gerekli paketleri yükle
pip install -r requirements.txt
```

## 🔬 Kullanım

```python
from dna_analyzer import DNAAnalyzer

# DNA verisini yükle
analyzer = DNAAnalyzer("sample.vcf")

# Analiz yap
results = analyzer.analyze()

# Sonuçları görüntüle
print(results)
```

## 📊 Çıktı Formatları

- JSON (API entegrasyonu için)
- CSV (Excel uyumlu)
- PDF (Rapor formatı)
- HTML (Web görüntüleme)

## 🧪 Test

```bash
python -m pytest tests/
```

## 📈 Bilimsel Doğruluk

- PubMed referansları
- ClinVar veritabanı entegrasyonu
- GWAS katalogları
- PharmGKB veritabanı

## 🔗 Entegrasyon

Bu sistem, GenoHealth uygulamasına API olarak entegre edilecektir.
