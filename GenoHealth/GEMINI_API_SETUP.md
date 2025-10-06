# 🤖 Google Gemini AI API Kurulumu

## 📋 **Adım 1: Google AI Studio'ya Git**
1. https://aistudio.google.com/ adresine git
2. Google hesabınla giriş yap
3. "Get API Key" butonuna tıkla

## 🔑 **Adım 2: API Anahtarı Al**
1. "Create API Key" butonuna tıkla
2. Proje seç (yoksa yeni proje oluştur)
3. API anahtarını kopyala

## ⚙️ **Adım 3: API Anahtarını Ekle**
1. `src/services/QwenAIService.ts` dosyasını aç
2. 56. satırda `YOUR_GEMINI_API_KEY` yerine API anahtarını yapıştır:

```typescript
this.apiKey = 'AIzaSyB...'; // Buraya API anahtarını yapıştır
```

## 🚀 **Adım 4: Test Et**
1. Uygulamayı yeniden başlat
2. Geno AI Assistant'a git
3. "Merhaba" yaz ve test et

## 💰 **Maliyet**
- **Ücretsiz**: Ayda 60 istek
- **Ücretli**: $0.0005 per 1K token (çok ucuz!)

## 🔒 **Güvenlik**
- API anahtarını asla public repository'de paylaşma
- Production'da environment variable kullan

## 🆘 **Sorun Giderme**
- **401 Hatası**: API anahtarı yanlış
- **403 Hatası**: API anahtarı aktif değil
- **429 Hatası**: Rate limit aşıldı

## 📞 **Destek**
- Google AI Studio: https://aistudio.google.com/
- Dokümantasyon: https://ai.google.dev/docs
