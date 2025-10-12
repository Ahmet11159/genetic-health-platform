"""
Gelişmiş Caching Sistemi
DNA analiz sonuçlarını cache'leyerek performansı artırır
"""

import json
import hashlib
import os
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import redis
from pathlib import Path

class DNACacheManager:
    """DNA analiz sonuçları için gelişmiş cache yöneticisi"""
    
    def __init__(self, cache_dir: str = "cache", redis_url: str = None):
        """
        Cache yöneticisini başlat
        
        Args:
            cache_dir: Cache dosyalarının saklanacağı dizin
            redis_url: Redis bağlantı URL'si (opsiyonel)
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Redis bağlantısı (opsiyonel)
        self.redis_client = None
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url)
                self.redis_client.ping()
                print("✅ Redis cache aktif")
            except:
                print("⚠️ Redis kullanılamıyor, dosya cache kullanılacak")
        
        # Cache istatistikleri
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'total_size': 0
        }
    
    def _generate_cache_key(self, dna_data: str, analysis_type: str = "full") -> str:
        """DNA verisinden cache anahtarı oluştur"""
        # DNA verisinin hash'ini al
        data_hash = hashlib.md5(dna_data.encode()).hexdigest()
        return f"dna_analysis_{analysis_type}_{data_hash}"
    
    def _get_file_path(self, cache_key: str) -> Path:
        """Cache dosya yolunu döndür"""
        return self.cache_dir / f"{cache_key}.json"
    
    def get(self, dna_data: str, analysis_type: str = "full") -> Optional[Dict[str, Any]]:
        """
        Cache'den analiz sonucunu al
        
        Args:
            dna_data: DNA verisi
            analysis_type: Analiz tipi (full, health, nutrition, etc.)
            
        Returns:
            Cache'deki analiz sonucu veya None
        """
        cache_key = self._generate_cache_key(dna_data, analysis_type)
        
        try:
            # Önce Redis'i dene
            if self.redis_client:
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    result = json.loads(cached_data)
                    # Cache süresi kontrolü
                    if self._is_cache_valid(result):
                        self.stats['hits'] += 1
                        print(f"🎯 Cache HIT: {analysis_type} analizi")
                        return result['data']
                    else:
                        # Süresi dolmuş cache'i sil
                        self.redis_client.delete(cache_key)
            
            # Dosya cache'ini kontrol et
            file_path = self._get_file_path(cache_key)
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    result = json.load(f)
                
                if self._is_cache_valid(result):
                    self.stats['hits'] += 1
                    print(f"🎯 Cache HIT: {analysis_type} analizi (dosya)")
                    return result['data']
                else:
                    # Süresi dolmuş dosyayı sil
                    file_path.unlink()
            
            self.stats['misses'] += 1
            print(f"❌ Cache MISS: {analysis_type} analizi")
            return None
            
        except Exception as e:
            print(f"⚠️ Cache okuma hatası: {e}")
            self.stats['misses'] += 1
            return None
    
    def set(self, dna_data: str, analysis_result: Dict[str, Any], 
            analysis_type: str = "full", ttl_hours: int = 24) -> bool:
        """
        Analiz sonucunu cache'e kaydet
        
        Args:
            dna_data: DNA verisi
            analysis_result: Analiz sonucu
            analysis_type: Analiz tipi
            ttl_hours: Cache süresi (saat)
            
        Returns:
            Başarı durumu
        """
        cache_key = self._generate_cache_key(dna_data, analysis_type)
        
        cache_data = {
            'data': analysis_result,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=ttl_hours)).isoformat(),
            'analysis_type': analysis_type,
            'data_size': len(json.dumps(analysis_result))
        }
        
        try:
            # Redis'e kaydet
            if self.redis_client:
                self.redis_client.setex(
                    cache_key, 
                    ttl_hours * 3600,  # saniye cinsinden
                    json.dumps(cache_data)
                )
                print(f"💾 Redis cache'e kaydedildi: {analysis_type}")
            
            # Dosya cache'ine kaydet
            file_path = self._get_file_path(cache_key)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            
            self.stats['sets'] += 1
            self.stats['total_size'] += cache_data['data_size']
            print(f"💾 Dosya cache'e kaydedildi: {analysis_type}")
            return True
            
        except Exception as e:
            print(f"❌ Cache kaydetme hatası: {e}")
            return False
    
    def _is_cache_valid(self, cache_data: Dict[str, Any]) -> bool:
        """Cache'in geçerli olup olmadığını kontrol et"""
        try:
            expires_at = datetime.fromisoformat(cache_data['expires_at'])
            return datetime.now() < expires_at
        except:
            return False
    
    def delete(self, dna_data: str, analysis_type: str = "full") -> bool:
        """Cache'den analiz sonucunu sil"""
        cache_key = self._generate_cache_key(dna_data, analysis_type)
        
        try:
            # Redis'ten sil
            if self.redis_client:
                self.redis_client.delete(cache_key)
            
            # Dosyadan sil
            file_path = self._get_file_path(cache_key)
            if file_path.exists():
                file_path.unlink()
            
            self.stats['deletes'] += 1
            print(f"🗑️ Cache silindi: {analysis_type}")
            return True
            
        except Exception as e:
            print(f"❌ Cache silme hatası: {e}")
            return False
    
    def clear_expired(self) -> int:
        """Süresi dolmuş cache'leri temizle"""
        cleared_count = 0
        
        try:
            # Dosya cache'lerini kontrol et
            for file_path in self.cache_dir.glob("*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        cache_data = json.load(f)
                    
                    if not self._is_cache_valid(cache_data):
                        file_path.unlink()
                        cleared_count += 1
                        print(f"🗑️ Süresi dolmuş cache silindi: {file_path.name}")
                        
                except Exception as e:
                    print(f"⚠️ Cache dosyası okunamadı: {file_path.name} - {e}")
            
            print(f"✅ {cleared_count} süresi dolmuş cache temizlendi")
            return cleared_count
            
        except Exception as e:
            print(f"❌ Cache temizleme hatası: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Cache istatistiklerini döndür"""
        hit_rate = 0
        if self.stats['hits'] + self.stats['misses'] > 0:
            hit_rate = self.stats['hits'] / (self.stats['hits'] + self.stats['misses'])
        
        return {
            **self.stats,
            'hit_rate': round(hit_rate * 100, 2),
            'cache_dir': str(self.cache_dir),
            'redis_active': self.redis_client is not None
        }
    
    def cleanup_old_files(self, days: int = 7) -> int:
        """Belirtilen günden eski dosyaları temizle"""
        cutoff_time = time.time() - (days * 24 * 3600)
        cleaned_count = 0
        
        try:
            for file_path in self.cache_dir.glob("*.json"):
                if file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    cleaned_count += 1
                    print(f"🗑️ Eski dosya silindi: {file_path.name}")
            
            print(f"✅ {cleaned_count} eski dosya temizlendi")
            return cleaned_count
            
        except Exception as e:
            print(f"❌ Eski dosya temizleme hatası: {e}")
            return 0

# Global cache manager instance
cache_manager = DNACacheManager()
