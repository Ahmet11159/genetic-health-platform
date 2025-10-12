"""
Veritabanı Optimizasyon Sistemi
DNA analizi için veritabanı performansını optimize eder
"""

import sqlite3
import threading
import time
import json
from typing import Dict, Any, List, Optional, Tuple
from contextlib import contextmanager
from queue import Queue, Empty
import logging
from pathlib import Path
import hashlib

class DatabaseConnectionPool:
    """Veritabanı bağlantı havuzu yöneticisi"""
    
    def __init__(self, db_path: str, max_connections: int = 10, 
                 timeout: int = 30, check_same_thread: bool = False):
        """
        Connection pool'u başlat
        
        Args:
            db_path: Veritabanı dosya yolu
            max_connections: Maksimum bağlantı sayısı
            timeout: Bağlantı timeout süresi (saniye)
            check_same_thread: SQLite thread kontrolü
        """
        self.db_path = db_path
        self.max_connections = max_connections
        self.timeout = timeout
        self.check_same_thread = check_same_thread
        
        # Bağlantı havuzu
        self.connection_pool = Queue(maxsize=max_connections)
        self.active_connections = set()
        self.connection_stats = {
            'created': 0,
            'reused': 0,
            'closed': 0,
            'timeouts': 0,
            'errors': 0
        }
        
        # Thread safety
        self.lock = threading.Lock()
        
        # Veritabanını başlat
        self._initialize_database()
        
        print(f"🗄️ Database Connection Pool başlatıldı: {max_connections} bağlantı")
    
    def _initialize_database(self):
        """Veritabanını başlat ve tabloları oluştur"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Optimized tables oluştur
                self._create_optimized_tables(cursor)
                
                # Indexes oluştur
                self._create_optimized_indexes(cursor)
                
                conn.commit()
                print("✅ Veritabanı tabloları ve indexler oluşturuldu")
                
        except Exception as e:
            print(f"❌ Veritabanı başlatma hatası: {e}")
            raise
    
    def _create_optimized_tables(self, cursor):
        """Optimize edilmiş tablolar oluştur"""
        
        # Genetic variants tablosu (optimized)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS genetic_variants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rsid TEXT NOT NULL,
                chromosome TEXT NOT NULL,
                position INTEGER NOT NULL,
                genotype TEXT NOT NULL,
                gene TEXT,
                impact TEXT,
                frequency REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Health risks tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_risks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variant_id INTEGER,
                risk_type TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                confidence REAL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES genetic_variants(id)
            )
        ''')
        
        # Drug interactions tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS drug_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variant_id INTEGER,
                drug_name TEXT NOT NULL,
                interaction_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                recommendation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES genetic_variants(id)
            )
        ''')
        
        # Analysis cache tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cache_key TEXT UNIQUE NOT NULL,
                analysis_data TEXT NOT NULL,
                analysis_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        ''')
        
        # Performance metrics tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS performance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_type TEXT NOT NULL,
                execution_time REAL NOT NULL,
                memory_usage REAL,
                success BOOLEAN NOT NULL,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    def _create_optimized_indexes(self, cursor):
        """Performans için optimize edilmiş indexler oluştur"""
        
        indexes = [
            # Genetic variants indexes
            "CREATE INDEX IF NOT EXISTS idx_variants_rsid ON genetic_variants(rsid)",
            "CREATE INDEX IF NOT EXISTS idx_variants_chromosome ON genetic_variants(chromosome)",
            "CREATE INDEX IF NOT EXISTS idx_variants_position ON genetic_variants(position)",
            "CREATE INDEX IF NOT EXISTS idx_variants_gene ON genetic_variants(gene)",
            "CREATE INDEX IF NOT EXISTS idx_variants_compound ON genetic_variants(chromosome, position)",
            
            # Health risks indexes
            "CREATE INDEX IF NOT EXISTS idx_health_risks_variant ON health_risks(variant_id)",
            "CREATE INDEX IF NOT EXISTS idx_health_risks_type ON health_risks(risk_type)",
            "CREATE INDEX IF NOT EXISTS idx_health_risks_level ON health_risks(risk_level)",
            
            # Drug interactions indexes
            "CREATE INDEX IF NOT EXISTS idx_drug_interactions_variant ON drug_interactions(variant_id)",
            "CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug ON drug_interactions(drug_name)",
            "CREATE INDEX IF NOT EXISTS idx_drug_interactions_type ON drug_interactions(interaction_type)",
            
            # Cache indexes
            "CREATE INDEX IF NOT EXISTS idx_cache_key ON analysis_cache(cache_key)",
            "CREATE INDEX IF NOT EXISTS idx_cache_type ON analysis_cache(analysis_type)",
            "CREATE INDEX IF NOT EXISTS idx_cache_expires ON analysis_cache(expires_at)",
            
            # Performance metrics indexes
            "CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(operation_type)",
            "CREATE INDEX IF NOT EXISTS idx_performance_time ON performance_metrics(execution_time)",
            "CREATE INDEX IF NOT EXISTS idx_performance_created ON performance_metrics(created_at)"
        ]
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
            except Exception as e:
                print(f"⚠️ Index oluşturma hatası: {e}")
    
    @contextmanager
    def _get_connection(self):
        """Bağlantı havuzundan bağlantı al"""
        conn = None
        try:
            # Havuzdan bağlantı almaya çalış
            try:
                conn = self.connection_pool.get(timeout=self.timeout)
                self.connection_stats['reused'] += 1
            except Empty:
                # Yeni bağlantı oluştur
                conn = sqlite3.connect(
                    self.db_path,
                    check_same_thread=self.check_same_thread,
                    timeout=self.timeout
                )
                conn.row_factory = sqlite3.Row
                self.connection_stats['created'] += 1
            
            # Bağlantıyı aktif olarak işaretle
            with self.lock:
                self.active_connections.add(conn)
            
            yield conn
            
        except Exception as e:
            self.connection_stats['errors'] += 1
            print(f"❌ Veritabanı bağlantı hatası: {e}")
            raise
        finally:
            if conn:
                # Bağlantıyı havuzuna geri ver
                try:
                    with self.lock:
                        self.active_connections.discard(conn)
                    
                    # Bağlantıyı test et
                    conn.execute("SELECT 1").fetchone()
                    
                    # Havuza geri ver
                    self.connection_pool.put(conn)
                    
                except Exception as e:
                    # Bağlantı bozuksa kapat
                    try:
                        conn.close()
                        self.connection_stats['closed'] += 1
                    except:
                        pass
    
    def execute_query(self, query: str, params: Tuple = ()) -> List[Dict]:
        """Optimize edilmiş sorgu çalıştır"""
        start_time = time.time()
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                
                # Sonuçları dict olarak döndür
                columns = [description[0] for description in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
                # Performance metriklerini kaydet
                execution_time = time.time() - start_time
                self._log_performance_metric('query', execution_time, True)
                
                return results
                
        except Exception as e:
            execution_time = time.time() - start_time
            self._log_performance_metric('query', execution_time, False, str(e))
            raise
    
    def execute_batch(self, queries: List[Tuple[str, Tuple]]) -> List[Any]:
        """Batch sorguları çalıştır"""
        start_time = time.time()
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                results = []
                
                for query, params in queries:
                    cursor.execute(query, params)
                    if query.strip().upper().startswith('SELECT'):
                        columns = [description[0] for description in cursor.description]
                        results.append([dict(zip(columns, row)) for row in cursor.fetchall()])
                    else:
                        results.append(cursor.rowcount)
                
                conn.commit()
                
                # Performance metriklerini kaydet
                execution_time = time.time() - start_time
                self._log_performance_metric('batch', execution_time, True)
                
                return results
                
        except Exception as e:
            execution_time = time.time() - start_time
            self._log_performance_metric('batch', execution_time, False, str(e))
            raise
    
    def _log_performance_metric(self, operation_type: str, execution_time: float, 
                               success: bool, error_message: str = None):
        """Performance metriklerini kaydet"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO performance_metrics 
                    (operation_type, execution_time, success, error_message)
                    VALUES (?, ?, ?, ?)
                ''', (operation_type, execution_time, success, error_message))
                conn.commit()
        except Exception as e:
            print(f"⚠️ Performance metrik kaydetme hatası: {e}")
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Performance istatistiklerini döndür"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Genel istatistikler
                cursor.execute('''
                    SELECT 
                        operation_type,
                        COUNT(*) as count,
                        AVG(execution_time) as avg_time,
                        MAX(execution_time) as max_time,
                        MIN(execution_time) as min_time,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count
                    FROM performance_metrics 
                    WHERE created_at > datetime('now', '-1 hour')
                    GROUP BY operation_type
                ''')
                
                stats = cursor.fetchall()
                
                return {
                    'connection_stats': self.connection_stats,
                    'active_connections': len(self.active_connections),
                    'pool_size': self.connection_pool.qsize(),
                    'performance_stats': [dict(row) for row in stats]
                }
                
        except Exception as e:
            print(f"⚠️ Performance stats hatası: {e}")
            return {}
    
    def optimize_database(self) -> Dict[str, Any]:
        """Veritabanını optimize et"""
        print("🔧 Veritabanı optimizasyonu başlatılıyor...")
        
        start_time = time.time()
        optimization_results = {}
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # 1. ANALYZE komutu
                cursor.execute("ANALYZE")
                optimization_results['analyze'] = "Tamamlandı"
                
                # 2. VACUUM komutu
                cursor.execute("VACUUM")
                optimization_results['vacuum'] = "Tamamlandı"
                
                # 3. Index kullanım istatistikleri
                cursor.execute("PRAGMA index_list(genetic_variants)")
                indexes = cursor.fetchall()
                optimization_results['indexes'] = len(indexes)
                
                # 4. Veritabanı boyutu
                cursor.execute("PRAGMA page_count")
                page_count = cursor.fetchone()[0]
                cursor.execute("PRAGMA page_size")
                page_size = cursor.fetchone()[0]
                db_size = page_count * page_size
                optimization_results['database_size_mb'] = round(db_size / 1024 / 1024, 2)
                
                conn.commit()
                
                optimization_time = time.time() - start_time
                optimization_results['optimization_time'] = round(optimization_time, 2)
                optimization_results['success'] = True
                
                print(f"✅ Veritabanı optimizasyonu tamamlandı: {optimization_time:.2f}s")
                
        except Exception as e:
            optimization_results['success'] = False
            optimization_results['error'] = str(e)
            print(f"❌ Veritabanı optimizasyon hatası: {e}")
        
        return optimization_results
    
    def cleanup_old_data(self, days: int = 30) -> Dict[str, Any]:
        """Eski verileri temizle"""
        print(f"🗑️ {days} günden eski veriler temizleniyor...")
        
        start_time = time.time()
        cleanup_results = {}
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Eski performance metrics'leri sil
                cursor.execute('''
                    DELETE FROM performance_metrics 
                    WHERE created_at < datetime('now', '-{} days')
                '''.format(days))
                performance_deleted = cursor.rowcount
                
                # Eski cache'leri sil
                cursor.execute('''
                    DELETE FROM analysis_cache 
                    WHERE expires_at < datetime('now')
                ''')
                cache_deleted = cursor.rowcount
                
                conn.commit()
                
                cleanup_time = time.time() - start_time
                cleanup_results = {
                    'performance_metrics_deleted': performance_deleted,
                    'cache_entries_deleted': cache_deleted,
                    'cleanup_time': round(cleanup_time, 2),
                    'success': True
                }
                
                print(f"✅ Temizlik tamamlandı: {performance_deleted} performance, {cache_deleted} cache")
                
        except Exception as e:
            cleanup_results = {
                'success': False,
                'error': str(e)
            }
            print(f"❌ Temizlik hatası: {e}")
        
        return cleanup_results
    
    def close_all_connections(self):
        """Tüm bağlantıları kapat"""
        print("🛑 Tüm veritabanı bağlantıları kapatılıyor...")
        
        # Aktif bağlantıları kapat
        with self.lock:
            for conn in list(self.active_connections):
                try:
                    conn.close()
                    self.active_connections.discard(conn)
                except:
                    pass
        
        # Havuzdaki bağlantıları kapat
        while not self.connection_pool.empty():
            try:
                conn = self.connection_pool.get_nowait()
                conn.close()
            except:
                break
        
        print("✅ Tüm bağlantılar kapatıldı")

# Global database pool instance
db_pool = DatabaseConnectionPool("dna_analysis.db")
