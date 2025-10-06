# GenoHealth & DNA Analysis System

Bu repository, genetik sağlık analizi ve DNA veri işleme için geliştirilmiş iki ana projeyi içerir.

## 📱 GenoHealth - Mobil Uygulama

GenoHealth, kullanıcıların genetik verilerini analiz ederek kişiselleştirilmiş sağlık önerileri sunan React Native tabanlı mobil uygulamadır.

### Özellikler
- DNA dosya yükleme ve analizi
- Kişiselleştirilmiş beslenme planları
- Egzersiz önerileri
- Sağlık takibi
- Aile üyeleri ile karşılaştırma
- Premium analiz özellikleri
- AI destekli sağlık asistanı

### Teknolojiler
- React Native
- TypeScript
- Expo
- React Navigation
- Context API

## 🧬 DNA-Analysis-System - Backend Servisi

DNA-Analysis-System, genetik veri analizi için geliştirilmiş Python tabanlı backend servisidir.

### Özellikler
- 23andMe dosya formatı desteği
- VCF formatı desteği
- Genetik varyant analizi
- Popülasyon analizi
- Klinik validasyon
- Makine öğrenmesi algoritmaları
- Gerçek zamanlı API servisi

### Teknolojiler
- Python 3.9+
- Flask
- NumPy
- Pandas
- Scikit-learn
- Biopython

## 🚀 Kurulum

### GenoHealth (Mobil Uygulama)
```bash
cd GenoHealth
npm install
npx expo start
```

### DNA-Analysis-System (Backend)
```bash
cd DNA-Analysis-System
python -m venv venv
source venv/bin/activate  # macOS/Linux
# veya
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python api_server.py
```

## 📁 Proje Yapısı

```
adsız klasör/
├── GenoHealth/                 # React Native mobil uygulama
│   ├── src/
│   │   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   ├── screens/           # Uygulama ekranları
│   │   ├── services/          # API servisleri
│   │   ├── types/             # TypeScript tip tanımları
│   │   └── utils/             # Yardımcı fonksiyonlar
│   └── assets/                # Görsel dosyalar
├── DNA-Analysis-System/        # Python backend servisi
│   ├── algorithms/            # ML ve bilimsel algoritmalar
│   ├── parsers/               # DNA dosya parser'ları
│   ├── databases/             # Veritabanı bağlantıları
│   ├── clinical/              # Klinik validasyon
│   └── population/            # Popülasyon analizi
└── README.md                  # Bu dosya
```

## 🔗 API Entegrasyonu

GenoHealth uygulaması, DNA-Analysis-System backend servisi ile entegre çalışır:

- DNA dosyaları backend'e yüklenir
- Analiz sonuçları mobil uygulamaya geri döner
- Kullanıcı verileri güvenli şekilde işlenir

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

## 👨‍💻 Geliştirici

Ahmet Köymen

---

**Not:** Bu repository, genetik sağlık analizi ve DNA veri işleme konularında araştırma ve geliştirme amaçlıdır.
