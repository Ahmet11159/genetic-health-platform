"""
Error Tracking Sistemi
Hataları takip eder ve analiz eder
"""

import traceback
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import logging

class ErrorTracker:
    """Hata takip sınıfı"""
    
    def __init__(self, max_errors: int = 1000):
        """
        Error tracker'ı başlat
        
        Args:
            max_errors: Maksimum hata sayısı
        """
        self.max_errors = max_errors
        self.errors = deque(maxlen=max_errors)
        self.error_counts = defaultdict(int)
        self.error_patterns = defaultdict(int)
        
        # Error kategorileri
        self.error_categories = {
            'database': ['sql', 'connection', 'query', 'timeout'],
            'memory': ['memory', 'leak', 'oom', 'allocation'],
            'network': ['connection', 'timeout', 'dns', 'http'],
            'validation': ['validation', 'invalid', 'format', 'type'],
            'authentication': ['auth', 'permission', 'access', 'token'],
            'api': ['api', 'endpoint', 'request', 'response'],
            'file': ['file', 'io', 'read', 'write', 'permission'],
            'unknown': []
        }
        
        # Error severity levels
        self.severity_levels = {
            'CRITICAL': 5,  # Sistem çöker
            'HIGH': 4,      # Önemli fonksiyon çalışmaz
            'MEDIUM': 3,    # Bazı özellikler çalışmaz
            'LOW': 2,       # Performans etkilenir
            'INFO': 1       # Bilgi amaçlı
        }
        
        print("🚨 Error Tracker başlatıldı")
    
    def track_error(self, error: Exception, context: Dict[str, Any] = None, 
                   severity: str = 'MEDIUM') -> str:
        """
        Hatayı takip et
        
        Args:
            error: Hata objesi
            context: Hata bağlamı
            severity: Hata şiddeti
            
        Returns:
            Error ID
        """
        try:
            error_id = f"ERR_{int(time.time() * 1000)}"
            
            # Hata detaylarını topla
            error_info = {
                'id': error_id,
                'timestamp': datetime.now().isoformat(),
                'type': type(error).__name__,
                'message': str(error),
                'severity': severity,
                'severity_level': self.severity_levels.get(severity, 3),
                'context': context or {},
                'traceback': traceback.format_exc(),
                'category': self._categorize_error(error),
                'pattern': self._extract_pattern(error)
            }
            
            # Hatayı kaydet
            self.errors.append(error_info)
            
            # İstatistikleri güncelle
            self.error_counts[error_info['type']] += 1
            self.error_patterns[error_info['pattern']] += 1
            
            # Logla
            self._log_error(error_info)
            
            return error_id
            
        except Exception as e:
            print(f"❌ Error tracking hatası: {e}")
            return "TRACKING_ERROR"
    
    def _categorize_error(self, error: Exception) -> str:
        """Hatayı kategorize et"""
        error_message = str(error).lower()
        error_type = type(error).__name__.lower()
        
        for category, keywords in self.error_categories.items():
            for keyword in keywords:
                if keyword in error_message or keyword in error_type:
                    return category
        
        return 'unknown'
    
    def _extract_pattern(self, error: Exception) -> str:
        """Hata pattern'ini çıkar"""
        error_message = str(error)
        
        # Yaygın pattern'ler
        patterns = {
            'connection_timeout': 'connection.*timeout',
            'memory_error': 'memory.*error|out of memory',
            'validation_error': 'validation.*error|invalid.*input',
            'permission_error': 'permission.*denied|access.*denied',
            'file_not_found': 'file.*not.*found|no such file',
            'database_error': 'database.*error|sql.*error',
            'network_error': 'network.*error|connection.*refused'
        }
        
        import re
        for pattern_name, pattern_regex in patterns.items():
            if re.search(pattern_regex, error_message, re.IGNORECASE):
                return pattern_name
        
        return 'generic_error'
    
    def _log_error(self, error_info: Dict[str, Any]):
        """Hatayı logla"""
        severity = error_info['severity']
        error_id = error_info['id']
        error_type = error_info['type']
        message = error_info['message']
        category = error_info['category']
        
        log_message = f"🚨 ERROR {error_id}: {error_type} - {message} [{category}]"
        
        if severity in ['CRITICAL', 'HIGH']:
            print(f"❌ {log_message}")
        elif severity == 'MEDIUM':
            print(f"⚠️ {log_message}")
        else:
            print(f"ℹ️ {log_message}")
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Hata özetini döndür"""
        try:
            total_errors = len(self.errors)
            
            if total_errors == 0:
                return {
                    'total_errors': 0,
                    'message': 'No errors tracked'
                }
            
            # Son 24 saat
            one_day_ago = datetime.now() - timedelta(days=1)
            recent_errors = [
                e for e in self.errors 
                if datetime.fromisoformat(e['timestamp']) > one_day_ago
            ]
            
            # Kategori dağılımı
            category_distribution = defaultdict(int)
            for error in recent_errors:
                category_distribution[error['category']] += 1
            
            # Severity dağılımı
            severity_distribution = defaultdict(int)
            for error in recent_errors:
                severity_distribution[error['severity']] += 1
            
            # En yaygın hatalar
            top_errors = sorted(
                self.error_counts.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
            
            # En yaygın pattern'ler
            top_patterns = sorted(
                self.error_patterns.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
            
            return {
                'total_errors': total_errors,
                'recent_errors_24h': len(recent_errors),
                'category_distribution': dict(category_distribution),
                'severity_distribution': dict(severity_distribution),
                'top_errors': top_errors,
                'top_patterns': top_patterns,
                'critical_errors': len([e for e in recent_errors if e['severity'] == 'CRITICAL']),
                'high_errors': len([e for e in recent_errors if e['severity'] == 'HIGH'])
            }
            
        except Exception as e:
            return {'error': f'Error summary hatası: {e}'}
    
    def get_errors_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Kategoriye göre hataları getir"""
        try:
            return [
                error for error in self.errors 
                if error['category'] == category
            ]
        except Exception as e:
            return []
    
    def get_errors_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """Şiddete göre hataları getir"""
        try:
            return [
                error for error in self.errors 
                if error['severity'] == severity
            ]
        except Exception as e:
            return []
    
    def get_recent_errors(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Son N saatteki hataları getir"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            return [
                error for error in self.errors 
                if datetime.fromisoformat(error['timestamp']) > cutoff_time
            ]
        except Exception as e:
            return []
    
    def clear_old_errors(self, days: int = 7):
        """Eski hataları temizle"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Eski hataları filtrele
            old_errors = [
                error for error in self.errors 
                if datetime.fromisoformat(error['timestamp']) <= cutoff_date
            ]
            
            # Yeni deque oluştur
            self.errors = deque(
                [error for error in self.errors 
                 if datetime.fromisoformat(error['timestamp']) > cutoff_date],
                maxlen=self.max_errors
            )
            
            print(f"🗑️ {len(old_errors)} eski hata temizlendi")
            
        except Exception as e:
            print(f"❌ Error temizleme hatası: {e}")
    
    def get_health_score(self) -> Dict[str, Any]:
        """Sistem sağlık skorunu hesapla"""
        try:
            recent_errors = self.get_recent_errors(hours=1)  # Son 1 saat
            
            if not recent_errors:
                return {
                    'health_score': 100,
                    'status': 'excellent',
                    'message': 'No errors in the last hour'
                }
            
            # Skor hesaplama
            base_score = 100
            
            # Critical hatalar -30 puan
            critical_count = len([e for e in recent_errors if e['severity'] == 'CRITICAL'])
            base_score -= critical_count * 30
            
            # High hatalar -20 puan
            high_count = len([e for e in recent_errors if e['severity'] == 'HIGH'])
            base_score -= high_count * 20
            
            # Medium hatalar -10 puan
            medium_count = len([e for e in recent_errors if e['severity'] == 'MEDIUM'])
            base_score -= medium_count * 10
            
            # Low hatalar -5 puan
            low_count = len([e for e in recent_errors if e['severity'] == 'LOW'])
            base_score -= low_count * 5
            
            # Skor sınırla
            health_score = max(0, min(100, base_score))
            
            # Status belirle
            if health_score >= 90:
                status = 'excellent'
            elif health_score >= 70:
                status = 'good'
            elif health_score >= 50:
                status = 'warning'
            elif health_score >= 30:
                status = 'critical'
            else:
                status = 'emergency'
            
            return {
                'health_score': health_score,
                'status': status,
                'recent_errors_count': len(recent_errors),
                'critical_errors': critical_count,
                'high_errors': high_count,
                'medium_errors': medium_count,
                'low_errors': low_count
            }
            
        except Exception as e:
            return {
                'health_score': 0,
                'status': 'error',
                'error': str(e)
            }

# Global error tracker instance
error_tracker = ErrorTracker()
