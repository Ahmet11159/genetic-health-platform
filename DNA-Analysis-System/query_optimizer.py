"""
Query Optimizer
DNA analizi için veritabanı sorgularını optimize eder
"""

import time
import json
from typing import Dict, Any, List, Optional, Tuple
from database_optimizer import db_pool
import hashlib

class QueryOptimizer:
    """Veritabanı sorgu optimizatörü"""
    
    def __init__(self):
        """Query optimizer'ı başlat"""
        self.query_cache = {}
        self.query_stats = {
            'total_queries': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'avg_execution_time': 0,
            'slow_queries': 0
        }
        
        print("🔍 Query Optimizer başlatıldı")
    
    def execute_optimized_query(self, query: str, params: Tuple = (), 
                               use_cache: bool = True, cache_ttl: int = 3600) -> List[Dict]:
        """
        Optimize edilmiş sorgu çalıştır
        
        Args:
            query: SQL sorgusu
            params: Sorgu parametreleri
            use_cache: Cache kullanılsın mı
            cache_ttl: Cache süresi (saniye)
            
        Returns:
            Sorgu sonuçları
        """
        start_time = time.time()
        
        # Cache kontrolü
        if use_cache:
            cache_key = self._generate_cache_key(query, params)
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                self.query_stats['cache_hits'] += 1
                return cached_result
        
        # Sorguyu çalıştır
        try:
            results = db_pool.execute_query(query, params)
            
            # Cache'e kaydet
            if use_cache:
                self._cache_result(cache_key, results, cache_ttl)
            
            # İstatistikleri güncelle
            execution_time = time.time() - start_time
            self._update_query_stats(execution_time)
            
            return results
            
        except Exception as e:
            print(f"❌ Query hatası: {e}")
            raise
    
    def _generate_cache_key(self, query: str, params: Tuple) -> str:
        """Cache anahtarı oluştur"""
        query_data = f"{query}:{params}"
        return hashlib.md5(query_data.encode()).hexdigest()
    
    def _get_cached_result(self, cache_key: str) -> Optional[List[Dict]]:
        """Cache'den sonuç al"""
        if cache_key in self.query_cache:
            cached_data = self.query_cache[cache_key]
            if time.time() < cached_data['expires_at']:
                return cached_data['data']
            else:
                # Süresi dolmuş cache'i sil
                del self.query_cache[cache_key]
        return None
    
    def _cache_result(self, cache_key: str, data: List[Dict], ttl: int):
        """Sonucu cache'e kaydet"""
        self.query_cache[cache_key] = {
            'data': data,
            'expires_at': time.time() + ttl
        }
    
    def _update_query_stats(self, execution_time: float):
        """Query istatistiklerini güncelle"""
        self.query_stats['total_queries'] += 1
        
        # Ortalama execution time hesapla
        total_time = self.query_stats['avg_execution_time'] * (self.query_stats['total_queries'] - 1)
        self.query_stats['avg_execution_time'] = (total_time + execution_time) / self.query_stats['total_queries']
        
        # Yavaş sorguları say
        if execution_time > 1.0:  # 1 saniyeden uzun
            self.query_stats['slow_queries'] += 1
    
    def get_genetic_variants_by_rsid(self, rsid: str) -> List[Dict]:
        """RSID'ye göre genetik varyantları getir"""
        query = '''
            SELECT * FROM genetic_variants 
            WHERE rsid = ?
            ORDER BY position
        '''
        return self.execute_optimized_query(query, (rsid,))
    
    def get_variants_by_chromosome(self, chromosome: str, start_pos: int = None, 
                                  end_pos: int = None) -> List[Dict]:
        """Kromozoma göre varyantları getir"""
        if start_pos and end_pos:
            query = '''
                SELECT * FROM genetic_variants 
                WHERE chromosome = ? AND position BETWEEN ? AND ?
                ORDER BY position
            '''
            params = (chromosome, start_pos, end_pos)
        else:
            query = '''
                SELECT * FROM genetic_variants 
                WHERE chromosome = ?
                ORDER BY position
            '''
            params = (chromosome,)
        
        return self.execute_optimized_query(query, params)
    
    def get_health_risks_by_variant(self, variant_id: int) -> List[Dict]:
        """Varyanta göre sağlık risklerini getir"""
        query = '''
            SELECT hr.*, gv.rsid, gv.gene
            FROM health_risks hr
            JOIN genetic_variants gv ON hr.variant_id = gv.id
            WHERE hr.variant_id = ?
            ORDER BY hr.confidence DESC
        '''
        return self.execute_optimized_query(query, (variant_id,))
    
    def get_drug_interactions_by_variant(self, variant_id: int) -> List[Dict]:
        """Varyanta göre ilaç etkileşimlerini getir"""
        query = '''
            SELECT di.*, gv.rsid, gv.gene
            FROM drug_interactions di
            JOIN genetic_variants gv ON di.variant_id = gv.id
            WHERE di.variant_id = ?
            ORDER BY di.severity DESC
        '''
        return self.execute_optimized_query(query, (variant_id,))
    
    def search_variants_by_gene(self, gene: str) -> List[Dict]:
        """Gene göre varyantları ara"""
        query = '''
            SELECT * FROM genetic_variants 
            WHERE gene LIKE ?
            ORDER BY position
        '''
        return self.execute_optimized_query(query, (f'%{gene}%',))
    
    def get_high_impact_variants(self, min_frequency: float = 0.01) -> List[Dict]:
        """Yüksek etkili varyantları getir"""
        query = '''
            SELECT * FROM genetic_variants 
            WHERE impact IN ('HIGH', 'MODERATE') 
            AND frequency >= ?
            ORDER BY frequency DESC
        '''
        return self.execute_optimized_query(query, (min_frequency,))
    
    def get_analysis_cache(self, cache_key: str) -> Optional[Dict]:
        """Analiz cache'ini getir"""
        query = '''
            SELECT analysis_data, analysis_type, created_at, expires_at
            FROM analysis_cache 
            WHERE cache_key = ? AND expires_at > datetime('now')
        '''
        results = self.execute_optimized_query(query, (cache_key,))
        
        if results:
            try:
                return {
                    'data': json.loads(results[0]['analysis_data']),
                    'type': results[0]['analysis_type'],
                    'created_at': results[0]['created_at'],
                    'expires_at': results[0]['expires_at']
                }
            except json.JSONDecodeError:
                return None
        
        return None
    
    def set_analysis_cache(self, cache_key: str, data: Dict, 
                          analysis_type: str, ttl_hours: int = 24) -> bool:
        """Analiz cache'ini kaydet"""
        try:
            query = '''
                INSERT OR REPLACE INTO analysis_cache 
                (cache_key, analysis_data, analysis_type, expires_at)
                VALUES (?, ?, ?, datetime('now', '+{} hours'))
            '''.format(ttl_hours)
            
            db_pool.execute_query(query, (
                cache_key,
                json.dumps(data),
                analysis_type
            ))
            
            return True
            
        except Exception as e:
            print(f"❌ Cache kaydetme hatası: {e}")
            return False
    
    def batch_insert_variants(self, variants: List[Dict]) -> int:
        """Varyantları toplu olarak ekle"""
        if not variants:
            return 0
        
        query = '''
            INSERT OR REPLACE INTO genetic_variants 
            (rsid, chromosome, position, genotype, gene, impact, frequency)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        '''
        
        batch_data = []
        for variant in variants:
            batch_data.append((
                variant.get('rsid', ''),
                variant.get('chromosome', ''),
                variant.get('position', 0),
                variant.get('genotype', ''),
                variant.get('gene', ''),
                variant.get('impact', ''),
                variant.get('frequency', 0.0)
            ))
        
        try:
            results = db_pool.execute_batch([(query, params) for params in batch_data])
            return len(variants)
        except Exception as e:
            print(f"❌ Batch insert hatası: {e}")
            return 0
    
    def batch_insert_health_risks(self, health_risks: List[Dict]) -> int:
        """Sağlık risklerini toplu olarak ekle"""
        if not health_risks:
            return 0
        
        query = '''
            INSERT INTO health_risks 
            (variant_id, risk_type, risk_level, confidence, description)
            VALUES (?, ?, ?, ?, ?)
        '''
        
        batch_data = []
        for risk in health_risks:
            batch_data.append((
                risk.get('variant_id', 0),
                risk.get('risk_type', ''),
                risk.get('risk_level', ''),
                risk.get('confidence', 0.0),
                risk.get('description', '')
            ))
        
        try:
            results = db_pool.execute_batch([(query, params) for params in batch_data])
            return len(health_risks)
        except Exception as e:
            print(f"❌ Health risks batch insert hatası: {e}")
            return 0
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Performance raporu döndür"""
        db_stats = db_pool.get_performance_stats()
        
        return {
            'query_optimizer_stats': self.query_stats,
            'database_stats': db_stats,
            'cache_size': len(self.query_cache),
            'cache_hit_rate': (
                self.query_stats['cache_hits'] / 
                max(self.query_stats['total_queries'], 1) * 100
            )
        }
    
    def clear_query_cache(self):
        """Query cache'ini temizle"""
        self.query_cache.clear()
        print("🗑️ Query cache temizlendi")
    
    def optimize_queries(self) -> Dict[str, Any]:
        """Sorguları optimize et"""
        print("🔧 Query optimizasyonu başlatılıyor...")
        
        start_time = time.time()
        optimization_results = {}
        
        try:
            # 1. Veritabanını optimize et
            db_optimization = db_pool.optimize_database()
            optimization_results['database_optimization'] = db_optimization
            
            # 2. Cache'i temizle
            self.clear_query_cache()
            optimization_results['cache_cleared'] = True
            
            # 3. Eski verileri temizle
            cleanup_results = db_pool.cleanup_old_data(days=7)
            optimization_results['cleanup'] = cleanup_results
            
            optimization_time = time.time() - start_time
            optimization_results['optimization_time'] = round(optimization_time, 2)
            optimization_results['success'] = True
            
            print(f"✅ Query optimizasyonu tamamlandı: {optimization_time:.2f}s")
            
        except Exception as e:
            optimization_results['success'] = False
            optimization_results['error'] = str(e)
            print(f"❌ Query optimizasyon hatası: {e}")
        
        return optimization_results

# Global query optimizer instance
query_optimizer = QueryOptimizer()
