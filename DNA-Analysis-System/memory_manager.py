"""
Memory Yönetim Sistemi
DNA analizi sırasında memory kullanımını optimize eder
"""

import psutil
import gc
import sys
import os
import time
from typing import Dict, Any, List, Optional
from pathlib import Path
import threading
from collections import defaultdict
import tracemalloc

class MemoryManager:
    """Memory kullanımını yöneten sınıf"""
    
    def __init__(self, max_memory_mb: int = 1024, cleanup_threshold: float = 0.8):
        """
        Memory yöneticisini başlat
        
        Args:
            max_memory_mb: Maksimum memory kullanımı (MB)
            cleanup_threshold: Temizlik eşiği (0.0-1.0)
        """
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.cleanup_threshold = cleanup_threshold
        self.process = psutil.Process()
        
        # Memory tracking
        self.memory_usage_history = []
        self.peak_memory = 0
        self.cleanup_count = 0
        self.gc_count = 0
        
        # Memory leak detection
        self.object_counts = defaultdict(int)
        self.leak_threshold = 1000
        
        # Monitoring
        self.is_monitoring = False
        self.monitor_thread = None
        
        # Memory profiling
        self.tracemalloc_enabled = False
        
        print(f"🧠 Memory Manager başlatıldı: Max {max_memory_mb}MB, Cleanup {cleanup_threshold*100}%")
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Mevcut memory kullanımını döndür"""
        try:
            memory_info = self.process.memory_info()
            system_memory = psutil.virtual_memory()
            
            current_memory = memory_info.rss
            memory_percent = (current_memory / self.max_memory_bytes) * 100
            
            return {
                'current_memory_mb': round(current_memory / 1024 / 1024, 2),
                'memory_percent': round(memory_percent, 2),
                'peak_memory_mb': round(self.peak_memory / 1024 / 1024, 2),
                'system_memory_percent': system_memory.percent,
                'available_memory_mb': round(system_memory.available / 1024 / 1024, 2),
                'memory_limit_mb': round(self.max_memory_bytes / 1024 / 1024, 2),
                'is_over_limit': current_memory > self.max_memory_bytes,
                'needs_cleanup': memory_percent > (self.cleanup_threshold * 100)
            }
        except Exception as e:
            print(f"⚠️ Memory bilgisi alınamadı: {e}")
            return {}
    
    def check_memory_limit(self) -> bool:
        """Memory limitini kontrol et"""
        memory_info = self.get_memory_usage()
        
        if memory_info.get('is_over_limit', False):
            print(f"⚠️ Memory limiti aşıldı: {memory_info['current_memory_mb']}MB / {memory_info['memory_limit_mb']}MB")
            return False
        
        if memory_info.get('needs_cleanup', False):
            print(f"🧹 Memory temizliği gerekli: {memory_info['memory_percent']:.1f}%")
            self.cleanup_memory()
        
        return True
    
    def cleanup_memory(self) -> Dict[str, Any]:
        """Memory temizliği yap"""
        print("🧹 Memory temizliği başlatılıyor...")
        
        cleanup_start = time.time()
        initial_memory = self.get_memory_usage().get('current_memory_mb', 0)
        
        # 1. Garbage Collection
        collected = gc.collect()
        self.gc_count += 1
        
        # 2. Memory-intensive objects'leri temizle
        cleared_objects = self._clear_memory_intensive_objects()
        
        # 3. Cache temizliği (eğer cache manager varsa)
        cache_cleared = self._clear_caches()
        
        # 4. Memory history temizliği
        if len(self.memory_usage_history) > 1000:
            self.memory_usage_history = self.memory_usage_history[-500:]
        
        cleanup_time = time.time() - cleanup_start
        final_memory = self.get_memory_usage().get('current_memory_mb', 0)
        memory_freed = initial_memory - final_memory
        
        self.cleanup_count += 1
        
        print(f"✅ Memory temizliği tamamlandı: {memory_freed:.1f}MB serbest bırakıldı ({cleanup_time:.2f}s)")
        
        return {
            'memory_freed_mb': round(memory_freed, 2),
            'cleanup_time': round(cleanup_time, 2),
            'gc_collected': collected,
            'objects_cleared': cleared_objects,
            'cache_cleared': cache_cleared,
            'cleanup_count': self.cleanup_count
        }
    
    def _clear_memory_intensive_objects(self) -> int:
        """Memory yoğun objeleri temizle"""
        cleared_count = 0
        
        try:
            # Büyük listeleri temizle
            for obj in gc.get_objects():
                if isinstance(obj, list) and len(obj) > 10000:
                    obj.clear()
                    cleared_count += 1
                elif isinstance(obj, dict) and len(obj) > 5000:
                    obj.clear()
                    cleared_count += 1
            
            # String cache temizliği
            if hasattr(sys, '_clear_type_cache'):
                sys._clear_type_cache()
                cleared_count += 1
            
        except Exception as e:
            print(f"⚠️ Object temizleme hatası: {e}")
        
        return cleared_count
    
    def _clear_caches(self) -> bool:
        """Cache'leri temizle"""
        try:
            # Cache manager varsa temizle
            from cache_manager import cache_manager
            if cache_manager:
                cache_manager.clear_expired()
                return True
        except ImportError:
            pass
        except Exception as e:
            print(f"⚠️ Cache temizleme hatası: {e}")
        
        return False
    
    def start_memory_monitoring(self, interval: int = 30):
        """Memory monitoring'i başlat"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(
            target=self._memory_monitor_loop,
            args=(interval,),
            daemon=True
        )
        self.monitor_thread.start()
        
        print(f"📊 Memory monitoring başlatıldı (her {interval}s)")
    
    def stop_memory_monitoring(self):
        """Memory monitoring'i durdur"""
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        print("📊 Memory monitoring durduruldu")
    
    def _memory_monitor_loop(self, interval: int):
        """Memory monitoring döngüsü"""
        while self.is_monitoring:
            try:
                memory_info = self.get_memory_usage()
                self.memory_usage_history.append({
                    'timestamp': time.time(),
                    'memory_mb': memory_info.get('current_memory_mb', 0),
                    'memory_percent': memory_info.get('memory_percent', 0)
                })
                
                # Peak memory güncelle
                current_memory = memory_info.get('current_memory_mb', 0) * 1024 * 1024
                if current_memory > self.peak_memory:
                    self.peak_memory = current_memory
                
                # Memory leak kontrolü
                self._check_memory_leaks()
                
                # Otomatik temizlik
                if memory_info.get('needs_cleanup', False):
                    self.cleanup_memory()
                
                time.sleep(interval)
                
            except Exception as e:
                print(f"⚠️ Memory monitoring hatası: {e}")
                time.sleep(interval)
    
    def _check_memory_leaks(self):
        """Memory leak kontrolü yap"""
        try:
            # Object sayılarını kontrol et
            for obj in gc.get_objects():
                obj_type = type(obj).__name__
                self.object_counts[obj_type] += 1
            
            # Şüpheli artışları kontrol et
            for obj_type, count in self.object_counts.items():
                if count > self.leak_threshold:
                    print(f"⚠️ Potansiyel memory leak: {obj_type} = {count}")
            
            # Object counts'u sıfırla
            self.object_counts.clear()
            
        except Exception as e:
            print(f"⚠️ Memory leak kontrolü hatası: {e}")
    
    def start_memory_profiling(self):
        """Memory profiling'i başlat"""
        if not self.tracemalloc_enabled:
            tracemalloc.start()
            self.tracemalloc_enabled = True
            print("📊 Memory profiling başlatıldı")
    
    def stop_memory_profiling(self) -> Dict[str, Any]:
        """Memory profiling'i durdur ve rapor al"""
        if not self.tracemalloc_enabled:
            return {}
        
        try:
            current, peak = tracemalloc.get_traced_memory()
            snapshot = tracemalloc.take_snapshot()
            top_stats = snapshot.statistics('lineno')
            
            tracemalloc.stop()
            self.tracemalloc_enabled = False
            
            return {
                'current_memory_mb': round(current / 1024 / 1024, 2),
                'peak_memory_mb': round(peak / 1024 / 1024, 2),
                'top_allocations': [
                    {
                        'filename': stat.traceback.format()[0],
                        'size_mb': round(stat.size / 1024 / 1024, 2),
                        'count': stat.count
                    }
                    for stat in top_stats[:10]
                ]
            }
            
        except Exception as e:
            print(f"⚠️ Memory profiling hatası: {e}")
            return {}
    
    def optimize_memory_usage(self) -> Dict[str, Any]:
        """Memory kullanımını optimize et"""
        print("🔧 Memory optimizasyonu başlatılıyor...")
        
        optimization_start = time.time()
        
        # 1. Memory temizliği
        cleanup_result = self.cleanup_memory()
        
        # 2. Garbage collection ayarları
        gc.set_threshold(700, 10, 10)  # Daha agresif GC
        
        # 3. Memory profiling başlat
        self.start_memory_profiling()
        
        optimization_time = time.time() - optimization_start
        
        return {
            'optimization_time': round(optimization_time, 2),
            'cleanup_result': cleanup_result,
            'gc_thresholds': gc.get_threshold(),
            'memory_info': self.get_memory_usage()
        }
    
    def get_memory_report(self) -> Dict[str, Any]:
        """Detaylı memory raporu döndür"""
        memory_info = self.get_memory_usage()
        
        return {
            'current_status': memory_info,
            'peak_memory_mb': round(self.peak_memory / 1024 / 1024, 2),
            'cleanup_count': self.cleanup_count,
            'gc_count': self.gc_count,
            'monitoring_active': self.is_monitoring,
            'profiling_active': self.tracemalloc_enabled,
            'memory_history_count': len(self.memory_usage_history),
            'recent_memory_usage': self.memory_usage_history[-10:] if self.memory_usage_history else []
        }
    
    def __del__(self):
        """Destructor - monitoring'i durdur"""
        self.stop_memory_monitoring()
        if self.tracemalloc_enabled:
            tracemalloc.stop()

# Global memory manager instance
memory_manager = MemoryManager()
