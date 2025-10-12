"""
Streaming DNA Processor
Büyük DNA dosyalarını memory-efficient şekilde işler
"""

import os
import gc
from typing import Iterator, Dict, Any, List, Optional, Generator
from pathlib import Path
import tempfile
import json
import time
from memory_manager import memory_manager

class StreamingDNAProcessor:
    """Büyük DNA dosyalarını streaming ile işleyen sınıf"""
    
    def __init__(self, chunk_size: int = 1000, max_memory_mb: int = 512):
        """
        Streaming processor'ı başlat
        
        Args:
            chunk_size: Her chunk'ta işlenecek varyant sayısı
            max_memory_mb: Maksimum memory kullanımı (MB)
        """
        self.chunk_size = chunk_size
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.processed_variants = 0
        self.total_variants = 0
        self.processing_stats = {
            'chunks_processed': 0,
            'memory_cleanups': 0,
            'processing_time': 0,
            'errors': 0
        }
        
        print(f"🌊 Streaming DNA Processor başlatıldı: Chunk {chunk_size}, Max {max_memory_mb}MB")
    
    def process_dna_file_streaming(self, file_path: str) -> Generator[Dict[str, Any], None, None]:
        """
        DNA dosyasını streaming ile işle
        
        Args:
            file_path: DNA dosyası yolu
            
        Yields:
            İşlenmiş varyant chunk'ları
        """
        print(f"🌊 Streaming işleme başlatılıyor: {file_path}")
        
        start_time = time.time()
        chunk_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                # Dosya boyutunu tahmin et
                file_size = os.path.getsize(file_path)
                estimated_variants = file_size // 50  # Yaklaşık tahmin
                self.total_variants = estimated_variants
                
                print(f"📊 Tahmini varyant sayısı: {estimated_variants}")
                
                # Chunk'lar halinde işle
                for chunk in self._read_file_in_chunks(file):
                    if not chunk:
                        break
                    
                    # Memory kontrolü
                    if not memory_manager.check_memory_limit():
                        print("⚠️ Memory limiti aşıldı, temizlik yapılıyor...")
                        memory_manager.cleanup_memory()
                        self.processing_stats['memory_cleanups'] += 1
                    
                    # Chunk'ı işle
                    processed_chunk = self._process_chunk(chunk, chunk_count)
                    
                    if processed_chunk:
                        chunk_count += 1
                        self.processed_variants += len(chunk)
                        self.processing_stats['chunks_processed'] = chunk_count
                        
                        yield processed_chunk
                        
                        # Progress güncelle
                        if chunk_count % 10 == 0:
                            progress = (self.processed_variants / estimated_variants) * 100
                            print(f"📈 İlerleme: {progress:.1f}% ({self.processed_variants} varyant)")
                    
                    # Her 5 chunk'ta bir garbage collection
                    if chunk_count % 5 == 0:
                        gc.collect()
        
        except Exception as e:
            print(f"❌ Streaming işleme hatası: {e}")
            self.processing_stats['errors'] += 1
            raise
        
        finally:
            self.processing_stats['processing_time'] = time.time() - start_time
            print(f"✅ Streaming işleme tamamlandı: {chunk_count} chunk, {self.processed_variants} varyant")
    
    def _read_file_in_chunks(self, file) -> Generator[List[Dict], None, None]:
        """Dosyayı chunk'lar halinde oku"""
        current_chunk = []
        
        for line in file:
            line = line.strip()
            
            # Boş satırları ve yorumları atla
            if not line or line.startswith('#'):
                continue
            
            # Varyantı parse et
            variant = self._parse_variant_line(line)
            if variant:
                current_chunk.append(variant)
            
            # Chunk dolu olduğunda yield et
            if len(current_chunk) >= self.chunk_size:
                yield current_chunk
                current_chunk = []
        
        # Son chunk'ı yield et
        if current_chunk:
            yield current_chunk
    
    def _parse_variant_line(self, line: str) -> Optional[Dict[str, Any]]:
        """Tek bir varyant satırını parse et"""
        try:
            parts = line.split('\t')
            if len(parts) >= 4:
                return {
                    'rsid': parts[0].strip(),
                    'chromosome': parts[1].strip(),
                    'position': int(parts[2].strip()),
                    'genotype': parts[3].strip(),
                    'quality': 0.95,  # Varsayılan kalite
                    'coverage': 25    # Varsayılan coverage
                }
        except (ValueError, IndexError) as e:
            print(f"⚠️ Varyant parse hatası: {line[:50]}... - {e}")
        
        return None
    
    def _process_chunk(self, chunk: List[Dict], chunk_index: int) -> Optional[Dict[str, Any]]:
        """Tek bir chunk'ı işle"""
        try:
            # Chunk işleme simülasyonu
            processed_variants = []
            
            for variant in chunk:
                # Basit işleme
                processed_variant = {
                    **variant,
                    'processed': True,
                    'chunk_index': chunk_index,
                    'processing_time': time.time()
                }
                processed_variants.append(processed_variant)
            
            return {
                'chunk_index': chunk_index,
                'variants': processed_variants,
                'variant_count': len(processed_variants),
                'processing_time': time.time(),
                'memory_usage': memory_manager.get_memory_usage()
            }
            
        except Exception as e:
            print(f"❌ Chunk işleme hatası: {e}")
            self.processing_stats['errors'] += 1
            return None
    
    def process_dna_file_with_callback(self, file_path: str, 
                                     progress_callback: callable = None,
                                     result_callback: callable = None) -> Dict[str, Any]:
        """
        DNA dosyasını callback'ler ile işle
        
        Args:
            file_path: DNA dosyası yolu
            progress_callback: İlerleme callback'i
            result_callback: Sonuç callback'i
            
        Returns:
            İşleme sonuçları
        """
        print(f"🌊 Callback'li streaming işleme başlatılıyor: {file_path}")
        
        all_results = []
        start_time = time.time()
        
        try:
            for chunk_result in self.process_dna_file_streaming(file_path):
                all_results.append(chunk_result)
                
                # Progress callback
                if progress_callback:
                    progress = (self.processed_variants / self.total_variants) * 100
                    progress_callback(progress, chunk_result)
                
                # Result callback
                if result_callback:
                    result_callback(chunk_result)
            
            # Final results
            final_result = {
                'total_variants': self.processed_variants,
                'chunks_processed': len(all_results),
                'processing_time': time.time() - start_time,
                'memory_stats': memory_manager.get_memory_report(),
                'processing_stats': self.processing_stats,
                'success': True
            }
            
            return final_result
            
        except Exception as e:
            print(f"❌ Callback'li işleme hatası: {e}")
            return {
                'success': False,
                'error': str(e),
                'processed_variants': self.processed_variants,
                'processing_time': time.time() - start_time
            }
    
    def create_memory_efficient_temp_file(self, dna_data: str) -> str:
        """Memory-efficient geçici dosya oluştur"""
        try:
            # Geçici dosya oluştur
            temp_file = tempfile.NamedTemporaryFile(
                mode='w', 
                suffix='.txt', 
                delete=False,
                encoding='utf-8'
            )
            
            # DNA verisini yaz
            temp_file.write(dna_data)
            temp_file.close()
            
            print(f"📁 Geçici dosya oluşturuldu: {temp_file.name}")
            return temp_file.name
            
        except Exception as e:
            print(f"❌ Geçici dosya oluşturma hatası: {e}")
            raise
    
    def cleanup_temp_file(self, file_path: str):
        """Geçici dosyayı temizle"""
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                print(f"🗑️ Geçici dosya silindi: {file_path}")
        except Exception as e:
            print(f"⚠️ Geçici dosya silme hatası: {e}")
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """İşleme istatistiklerini döndür"""
        return {
            **self.processing_stats,
            'processed_variants': self.processed_variants,
            'total_variants': self.total_variants,
            'chunk_size': self.chunk_size,
            'memory_usage': memory_manager.get_memory_usage()
        }
    
    def optimize_for_memory(self) -> Dict[str, Any]:
        """Memory için optimize et"""
        print("🔧 Memory optimizasyonu yapılıyor...")
        
        # Chunk boyutunu küçült
        if self.chunk_size > 500:
            self.chunk_size = 500
            print(f"📉 Chunk boyutu küçültüldü: {self.chunk_size}")
        
        # Memory temizliği
        cleanup_result = memory_manager.cleanup_memory()
        
        # Garbage collection
        gc.collect()
        
        return {
            'new_chunk_size': self.chunk_size,
            'cleanup_result': cleanup_result,
            'memory_usage': memory_manager.get_memory_usage()
        }

# Global streaming processor instance
streaming_processor = StreamingDNAProcessor()
