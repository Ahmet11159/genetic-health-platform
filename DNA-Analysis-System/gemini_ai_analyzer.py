"""
Gemini AI Destekli DNA Analiz Modülü
Gelişmiş genetik analiz ve kişiselleştirilmiş öneriler için Gemini AI kullanır
"""

import google.generativeai as genai
import json
import os
from typing import Dict, List, Any, Optional

class GeminiDNAAnalyzer:
    def __init__(self, api_key: str = None):
        """
        Gemini AI DNA Analizörü başlatır
        
        Args:
            api_key: Gemini API anahtarı (None ise environment variable'dan alır)
        """
        if api_key:
            genai.configure(api_key=api_key)
        else:
            # Environment variable'dan API key al
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable gerekli")
            genai.configure(api_key=api_key)
        
        # Gemini Pro modelini başlat
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Analiz promptları
        self.analysis_prompts = {
            'health_risks': """
            Sen bir genetik uzmanısın. Aşağıdaki genetik varyantları analiz et ve sağlık risklerini değerlendir:
            
            Varyantlar: {variants}
            
            Her varyant için:
            1. Gen adı ve fonksiyonu
            2. Genotip analizi (homozygous/heterozygous)
            3. Sağlık riski seviyesi (Düşük/Orta/Yüksek)
            4. İlgili hastalıklar/koşullar
            5. Önleyici öneriler
            6. Güvenilirlik skoru (0-1)
            
            JSON formatında yanıtla:
            {{
                "variants": [
                    {{
                        "rsid": "rs1801133",
                        "gene": "MTHFR",
                        "genotype": "TT",
                        "risk_level": "Yüksek",
                        "conditions": ["Yüksek homosistein", "Kalp hastalığı riski"],
                        "recommendations": ["Methylfolate takviyesi", "B12 vitamini"],
                        "confidence": 0.95
                    }}
                ],
                "overall_risk_score": 0.7,
                "priority_actions": ["Folat takviyesi", "Homosistein testi"]
            }}
            """,
            
            'nutrition': """
            Sen bir beslenme uzmanısın. Genetik profile göre kişiselleştirilmiş beslenme önerileri ver:
            
            Genetik Profil: {genetic_profile}
            
            Analiz et:
            1. Metabolizma tipi (hızlı/yavaş/normal)
            2. Vitamin/mineral ihtiyaçları
            3. Besin intoleransları
            4. Makro besin oranları
            5. Özel besin önerileri
            
            JSON formatında yanıtla:
            {{
                "metabolism_type": "Hızlı",
                "calorie_needs": {{
                    "daily": 2200,
                    "macros": {{
                        "protein": "25%",
                        "carbs": "45%",
                        "fat": "30%"
                    }}
                }},
                "vitamin_needs": {{
                    "B12": "Yüksek doz gerekli",
                    "D3": "Normal",
                    "Folate": "Aktif form gerekli"
                }},
                "food_recommendations": [
                    "Yüksek proteinli besinler",
                    "Omega-3 zengini balıklar",
                    "Yeşil yapraklı sebzeler"
                ],
                "avoid_foods": ["İşlenmiş gıdalar", "Yüksek şekerli içecekler"]
            }}
            """,
            
            'exercise': """
            Sen bir egzersiz fizyologusun. Genetik profile göre egzersiz önerileri ver:
            
            Genetik Profil: {genetic_profile}
            
            Analiz et:
            1. Kas tipi (power/endurance/mixed)
            2. Dayanıklılık kapasitesi
            3. Güç geliştirme potansiyeli
            4. Toparlanma hızı
            5. Yaralanma riski
            
            JSON formatında yanıtla:
            {{
                "muscle_type": "Power",
                "exercise_recommendations": {{
                    "cardio": {{
                        "type": "HIIT",
                        "frequency": "3x/hafta",
                        "duration": "20-30 dakika"
                    }},
                    "strength": {{
                        "type": "Compound movements",
                        "frequency": "4x/hafta",
                        "intensity": "Yüksek"
                    }}
                }},
                "recovery_needs": "48-72 saat",
                "injury_prevention": ["Isınma", "Esneklik çalışması"],
                "performance_tips": ["Kreatin takviyesi", "Protein timing"]
            }}
            """,
            
            'supplements': """
            Sen bir takviye uzmanısın. Genetik profile göre takviye önerileri ver:
            
            Genetik Profil: {genetic_profile}
            
            Analiz et:
            1. Vitamin/mineral eksiklikleri
            2. Gen varyantlarına göre ihtiyaçlar
            3. Dozaj önerileri
            4. Etkileşimler
            5. Öncelik sırası
            
            JSON formatında yanıtla:
            {{
                "essential_supplements": [
                    {{
                        "name": "Methylfolate",
                        "dosage": "1000-2000 mcg/gün",
                        "reason": "MTHFR gen varyantı",
                        "priority": "Yüksek"
                    }}
                ],
                "optional_supplements": [
                    {{
                        "name": "Omega-3",
                        "dosage": "2000-3000 mg/gün",
                        "reason": "APOE4 gen varyantı",
                        "priority": "Orta"
                    }}
                ],
                "avoid_supplements": ["Sentetik folik asit"],
                "timing_recommendations": "Sabah yemekle"
            }}
            """
        }
    
    def analyze_genetic_variants(self, variants: List[Dict]) -> Dict[str, Any]:
        """
        Genetik varyantları Gemini AI ile analiz eder
        
        Args:
            variants: Genetik varyant listesi
            
        Returns:
            Analiz sonuçları
        """
        try:
            # Varyantları string formatına çevir
            variants_str = json.dumps(variants, indent=2)
            
            # Gemini'ye gönder
            prompt = self.analysis_prompts['health_risks'].format(variants=variants_str)
            response = self.model.generate_content(prompt)
            
            # JSON parse et
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            print(f"Gemini analiz hatası: {e}")
            return self._fallback_analysis(variants)
    
    def analyze_nutrition_needs(self, genetic_profile: Dict) -> Dict[str, Any]:
        """
        Beslenme ihtiyaçlarını analiz eder
        
        Args:
            genetic_profile: Genetik profil verisi
            
        Returns:
            Beslenme önerileri
        """
        try:
            profile_str = json.dumps(genetic_profile, indent=2)
            prompt = self.analysis_prompts['nutrition'].format(genetic_profile=profile_str)
            response = self.model.generate_content(prompt)
            
            return json.loads(response.text)
            
        except Exception as e:
            print(f"Beslenme analiz hatası: {e}")
            return self._fallback_nutrition_analysis(genetic_profile)
    
    def analyze_exercise_needs(self, genetic_profile: Dict) -> Dict[str, Any]:
        """
        Egzersiz ihtiyaçlarını analiz eder
        
        Args:
            genetic_profile: Genetik profil verisi
            
        Returns:
            Egzersiz önerileri
        """
        try:
            profile_str = json.dumps(genetic_profile, indent=2)
            prompt = self.analysis_prompts['exercise'].format(genetic_profile=profile_str)
            response = self.model.generate_content(prompt)
            
            return json.loads(response.text)
            
        except Exception as e:
            print(f"Egzersiz analiz hatası: {e}")
            return self._fallback_exercise_analysis(genetic_profile)
    
    def analyze_supplement_needs(self, genetic_profile: Dict) -> Dict[str, Any]:
        """
        Takviye ihtiyaçlarını analiz eder
        
        Args:
            genetic_profile: Genetik profil verisi
            
        Returns:
            Takviye önerileri
        """
        try:
            profile_str = json.dumps(genetic_profile, indent=2)
            prompt = self.analysis_prompts['supplements'].format(genetic_profile=profile_str)
            response = self.model.generate_content(prompt)
            
            return json.loads(response.text)
            
        except Exception as e:
            print(f"Takviye analiz hatası: {e}")
            return self._fallback_supplement_analysis(genetic_profile)
    
    def _fallback_analysis(self, variants: List[Dict]) -> Dict[str, Any]:
        """Gemini başarısız olursa fallback analiz"""
        return {
            "variants": [
                {
                    "rsid": v.get("rsid", "unknown"),
                    "gene": "Unknown",
                    "genotype": v.get("genotype", "unknown"),
                    "risk_level": "Orta",
                    "conditions": ["Genel sağlık riski"],
                    "recommendations": ["Düzenli sağlık kontrolü"],
                    "confidence": 0.5
                }
                for v in variants[:5]  # İlk 5 varyant
            ],
            "overall_risk_score": 0.5,
            "priority_actions": ["Genel sağlık önerileri"]
        }
    
    def _fallback_nutrition_analysis(self, profile: Dict) -> Dict[str, Any]:
        """Fallback beslenme analizi"""
        return {
            "metabolism_type": "Normal",
            "calorie_needs": {"daily": 2000, "macros": {"protein": "20%", "carbs": "50%", "fat": "30%"}},
            "vitamin_needs": {"B12": "Normal", "D3": "Normal", "Folate": "Normal"},
            "food_recommendations": ["Dengeli beslenme", "Meyve ve sebze"],
            "avoid_foods": ["İşlenmiş gıdalar"]
        }
    
    def _fallback_exercise_analysis(self, profile: Dict) -> Dict[str, Any]:
        """Fallback egzersiz analizi"""
        return {
            "muscle_type": "Mixed",
            "exercise_recommendations": {
                "cardio": {"type": "Orta yoğunluk", "frequency": "3x/hafta", "duration": "30 dakika"},
                "strength": {"type": "Temel hareketler", "frequency": "2x/hafta", "intensity": "Orta"}
            },
            "recovery_needs": "24-48 saat",
            "injury_prevention": ["Isınma"],
            "performance_tips": ["Düzenli antrenman"]
        }
    
    def _fallback_supplement_analysis(self, profile: Dict) -> Dict[str, Any]:
        """Fallback takviye analizi"""
        return {
            "essential_supplements": [
                {"name": "Multivitamin", "dosage": "1 tablet/gün", "reason": "Genel sağlık", "priority": "Orta"}
            ],
            "optional_supplements": [],
            "avoid_supplements": [],
            "timing_recommendations": "Sabah yemekle"
        }

# Test fonksiyonu
if __name__ == "__main__":
    # Test için örnek varyantlar
    test_variants = [
        {"rsid": "rs1801133", "genotype": "TT", "chromosome": "1", "position": 11856378},
        {"rsid": "rs429358", "genotype": "CT", "chromosome": "19", "position": 45411941}
    ]
    
    try:
        analyzer = GeminiDNAAnalyzer()
        result = analyzer.analyze_genetic_variants(test_variants)
        print("Gemini analiz sonucu:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Test hatası: {e}")
        print("GEMINI_API_KEY environment variable'ını ayarlayın")
