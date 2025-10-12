"""
Real-time Monitoring Sistemi
DNA analiz sistemini 7/24 izler ve raporlar
"""

import time
import json
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import psutil
import os
from pathlib import Path

class SystemMonitor:
    """Sistem monitoring sınıfı"""
    
    def __init__(self, log_file: str = "system_monitor.log", 
                 alert_thresholds: Dict[str, float] = None):
        """
        Monitoring sistemini başlat
        
        Args:
            log_file: Log dosyası yolu
            alert_thresholds: Uyarı eşikleri
        """
        self.log_file = log_file
        self.alert_thresholds = alert_thresholds or {
            'cpu_percent': 80.0,
            'memory_percent': 85.0,
            'disk_percent': 90.0,
            'response_time': 5.0,
            'error_rate': 10.0
        }
        
        # Monitoring verileri
        self.metrics_history = deque(maxlen=1000)
        self.alerts = deque(maxlen=100)
        self.errors = deque(maxlen=500)
        
        # İstatistikler
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'avg_response_time': 0,
            'uptime_start': time.time(),
            'last_alert': None,
            'alert_count': 0
        }
        
        # Monitoring durumu
        self.is_monitoring = False
        self.monitor_thread = None
        
        # Logging setup
        self._setup_logging()
        
        print("📊 System Monitor başlatıldı")
    
    def _setup_logging(self):
        """Logging sistemini kur"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def start_monitoring(self, interval: int = 10):
        """Monitoring'i başlat"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(
            target=self._monitoring_loop,
            args=(interval,),
            daemon=True
        )
        self.monitor_thread.start()
        
        self.logger.info(f"📊 Monitoring başlatıldı (her {interval}s)")
        print(f"📊 Real-time monitoring başlatıldı (her {interval}s)")
    
    def stop_monitoring(self):
        """Monitoring'i durdur"""
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        self.logger.info("📊 Monitoring durduruldu")
        print("📊 Monitoring durduruldu")
    
    def _monitoring_loop(self, interval: int):
        """Monitoring döngüsü"""
        while self.is_monitoring:
            try:
                # Sistem metriklerini topla
                metrics = self._collect_system_metrics()
                
                # Metrikleri kaydet
                self.metrics_history.append(metrics)
                
                # Uyarıları kontrol et
                self._check_alerts(metrics)
                
                # İstatistikleri güncelle
                self._update_stats(metrics)
                
                time.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"❌ Monitoring hatası: {e}")
                time.sleep(interval)
    
    def _collect_system_metrics(self) -> Dict[str, Any]:
        """Sistem metriklerini topla"""
        try:
            # CPU kullanımı
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory kullanımı
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available / 1024 / 1024 / 1024  # GB
            
            # Disk kullanımı
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            disk_free = disk.free / 1024 / 1024 / 1024  # GB
            
            # Network I/O
            network = psutil.net_io_counters()
            
            # Process bilgileri
            process = psutil.Process()
            process_memory = process.memory_info().rss / 1024 / 1024  # MB
            process_cpu = process.cpu_percent()
            
            return {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': cpu_percent,
                'memory_percent': memory_percent,
                'memory_available_gb': round(memory_available, 2),
                'disk_percent': disk_percent,
                'disk_free_gb': round(disk_free, 2),
                'network_bytes_sent': network.bytes_sent,
                'network_bytes_recv': network.bytes_recv,
                'process_memory_mb': round(process_memory, 2),
                'process_cpu_percent': process_cpu,
                'uptime_seconds': time.time() - self.stats['uptime_start']
            }
            
        except Exception as e:
            self.logger.error(f"❌ Metrik toplama hatası: {e}")
            return {}
    
    def _check_alerts(self, metrics: Dict[str, Any]):
        """Uyarıları kontrol et"""
        try:
            current_time = datetime.now()
            
            # CPU uyarısı
            if metrics.get('cpu_percent', 0) > self.alert_thresholds['cpu_percent']:
                self._trigger_alert('HIGH_CPU', 
                    f"CPU kullanımı yüksek: {metrics['cpu_percent']:.1f}%")
            
            # Memory uyarısı
            if metrics.get('memory_percent', 0) > self.alert_thresholds['memory_percent']:
                self._trigger_alert('HIGH_MEMORY', 
                    f"Memory kullanımı yüksek: {metrics['memory_percent']:.1f}%")
            
            # Disk uyarısı
            if metrics.get('disk_percent', 0) > self.alert_thresholds['disk_percent']:
                self._trigger_alert('HIGH_DISK', 
                    f"Disk kullanımı yüksek: {metrics['disk_percent']:.1f}%")
            
            # Response time uyarısı
            if metrics.get('avg_response_time', 0) > self.alert_thresholds['response_time']:
                self._trigger_alert('SLOW_RESPONSE', 
                    f"Yanıt süresi yavaş: {metrics['avg_response_time']:.2f}s")
            
        except Exception as e:
            self.logger.error(f"❌ Alert kontrolü hatası: {e}")
    
    def _trigger_alert(self, alert_type: str, message: str):
        """Uyarı tetikle"""
        alert = {
            'timestamp': datetime.now().isoformat(),
            'type': alert_type,
            'message': message,
            'severity': 'WARNING'
        }
        
        self.alerts.append(alert)
        self.stats['alert_count'] += 1
        self.stats['last_alert'] = alert['timestamp']
        
        self.logger.warning(f"🚨 ALERT: {alert_type} - {message}")
        print(f"🚨 ALERT: {alert_type} - {message}")
    
    def _update_stats(self, metrics: Dict[str, Any]):
        """İstatistikleri güncelle"""
        try:
            # Response time hesapla (basit simülasyon)
            if len(self.metrics_history) > 1:
                prev_metrics = self.metrics_history[-2]
                current_metrics = metrics
                
                # Basit response time hesaplama
                response_time = 0.1 + (current_metrics.get('cpu_percent', 0) / 1000)
                self.stats['avg_response_time'] = response_time
            
        except Exception as e:
            self.logger.error(f"❌ Stats güncelleme hatası: {e}")
    
    def log_request(self, endpoint: str, method: str, response_time: float, 
                   status_code: int, error: str = None):
        """Request logla"""
        try:
            self.stats['total_requests'] += 1
            
            if 200 <= status_code < 300:
                self.stats['successful_requests'] += 1
            else:
                self.stats['failed_requests'] += 1
                
                # Error logla
                error_info = {
                    'timestamp': datetime.now().isoformat(),
                    'endpoint': endpoint,
                    'method': method,
                    'status_code': status_code,
                    'response_time': response_time,
                    'error': error
                }
                self.errors.append(error_info)
                
                self.logger.error(f"❌ REQUEST ERROR: {method} {endpoint} - {status_code} - {error}")
            
            # Response time güncelle
            if self.stats['total_requests'] > 0:
                total_time = self.stats['avg_response_time'] * (self.stats['total_requests'] - 1)
                self.stats['avg_response_time'] = (total_time + response_time) / self.stats['total_requests']
            
        except Exception as e:
            self.logger.error(f"❌ Request logging hatası: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Sistem durumunu döndür"""
        try:
            current_metrics = self.metrics_history[-1] if self.metrics_history else {}
            
            # Health score hesapla
            health_score = 100
            if current_metrics.get('cpu_percent', 0) > 70:
                health_score -= 20
            if current_metrics.get('memory_percent', 0) > 80:
                health_score -= 30
            if current_metrics.get('disk_percent', 0) > 85:
                health_score -= 25
            if self.stats['avg_response_time'] > 2.0:
                health_score -= 15
            
            health_score = max(0, health_score)
            
            return {
                'status': 'healthy' if health_score > 70 else 'warning' if health_score > 40 else 'critical',
                'health_score': health_score,
                'uptime_seconds': time.time() - self.stats['uptime_start'],
                'current_metrics': current_metrics,
                'stats': self.stats,
                'recent_alerts': list(self.alerts)[-5:],
                'recent_errors': list(self.errors)[-5:],
                'monitoring_active': self.is_monitoring
            }
            
        except Exception as e:
            self.logger.error(f"❌ Status alma hatası: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Performance raporu döndür"""
        try:
            if not self.metrics_history:
                return {'error': 'No metrics available'}
            
            # Son 1 saatlik veriler
            one_hour_ago = datetime.now() - timedelta(hours=1)
            recent_metrics = [
                m for m in self.metrics_history 
                if datetime.fromisoformat(m['timestamp']) > one_hour_ago
            ]
            
            if not recent_metrics:
                recent_metrics = list(self.metrics_history)[-10:]  # Son 10 metrik
            
            # Ortalama değerler
            avg_cpu = sum(m.get('cpu_percent', 0) for m in recent_metrics) / len(recent_metrics)
            avg_memory = sum(m.get('memory_percent', 0) for m in recent_metrics) / len(recent_metrics)
            avg_disk = sum(m.get('disk_percent', 0) for m in recent_metrics) / len(recent_metrics)
            
            # Peak değerler
            peak_cpu = max(m.get('cpu_percent', 0) for m in recent_metrics)
            peak_memory = max(m.get('memory_percent', 0) for m in recent_metrics)
            peak_disk = max(m.get('disk_percent', 0) for m in recent_metrics)
            
            return {
                'period': '1 hour',
                'metrics_count': len(recent_metrics),
                'averages': {
                    'cpu_percent': round(avg_cpu, 2),
                    'memory_percent': round(avg_memory, 2),
                    'disk_percent': round(avg_disk, 2),
                    'response_time': round(self.stats['avg_response_time'], 3)
                },
                'peaks': {
                    'cpu_percent': round(peak_cpu, 2),
                    'memory_percent': round(peak_memory, 2),
                    'disk_percent': round(peak_disk, 2)
                },
                'request_stats': {
                    'total_requests': self.stats['total_requests'],
                    'successful_requests': self.stats['successful_requests'],
                    'failed_requests': self.stats['failed_requests'],
                    'success_rate': round(
                        (self.stats['successful_requests'] / max(self.stats['total_requests'], 1)) * 100, 2
                    )
                },
                'alerts': {
                    'total_alerts': self.stats['alert_count'],
                    'recent_alerts': list(self.alerts)[-10:]
                },
                'errors': {
                    'total_errors': len(self.errors),
                    'recent_errors': list(self.errors)[-10:]
                }
            }
            
        except Exception as e:
            self.logger.error(f"❌ Performance report hatası: {e}")
            return {'error': str(e)}
    
    def clear_old_data(self, days: int = 7):
        """Eski verileri temizle"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Eski metrikleri temizle
            self.metrics_history = deque(
                [m for m in self.metrics_history 
                 if datetime.fromisoformat(m['timestamp']) > cutoff_date],
                maxlen=1000
            )
            
            # Eski alertleri temizle
            self.alerts = deque(
                [a for a in self.alerts 
                 if datetime.fromisoformat(a['timestamp']) > cutoff_date],
                maxlen=100
            )
            
            # Eski errorları temizle
            self.errors = deque(
                [e for e in self.errors 
                 if datetime.fromisoformat(e['timestamp']) > cutoff_date],
                maxlen=500
            )
            
            self.logger.info(f"🗑️ {days} günden eski veriler temizlendi")
            print(f"🗑️ {days} günden eski monitoring verileri temizlendi")
            
        except Exception as e:
            self.logger.error(f"❌ Veri temizleme hatası: {e}")

# Global monitoring instance
system_monitor = SystemMonitor()
