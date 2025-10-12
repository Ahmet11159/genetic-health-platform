"""
Güvenlik Yönetim Sistemi
DNA analiz sistemi için güvenlik önlemleri
"""

import time
import hashlib
import hmac
import secrets
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict, deque
import threading
import logging
from functools import wraps

class RateLimiter:
    """Rate limiting sınıfı"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        """
        Rate limiter'ı başlat
        
        Args:
            max_requests: Pencere başına maksimum istek sayısı
            window_seconds: Pencere süresi (saniye)
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
        self.lock = threading.Lock()
        
        print(f"🚨 Rate Limiter başlatıldı: {max_requests} istek/{window_seconds}s")
    
    def is_allowed(self, client_id: str) -> Tuple[bool, Dict[str, Any]]:
        """
        İsteğin izin verilip verilmediğini kontrol et
        
        Args:
            client_id: İstemci kimliği
            
        Returns:
            (izin_verildi, bilgi_dict)
        """
        current_time = time.time()
        
        with self.lock:
            # Eski istekleri temizle
            while (self.requests[client_id] and 
                   self.requests[client_id][0] < current_time - self.window_seconds):
                self.requests[client_id].popleft()
            
            # Mevcut istek sayısını kontrol et
            current_requests = len(self.requests[client_id])
            
            if current_requests >= self.max_requests:
                return False, {
                    'allowed': False,
                    'current_requests': current_requests,
                    'max_requests': self.max_requests,
                    'reset_time': self.requests[client_id][0] + self.window_seconds,
                    'retry_after': int(self.requests[client_id][0] + self.window_seconds - current_time)
                }
            
            # İsteği kaydet
            self.requests[client_id].append(current_time)
            
            return True, {
                'allowed': True,
                'current_requests': current_requests + 1,
                'max_requests': self.max_requests,
                'remaining': self.max_requests - (current_requests + 1)
            }
    
    def get_client_stats(self, client_id: str) -> Dict[str, Any]:
        """İstemci istatistiklerini döndür"""
        current_time = time.time()
        
        with self.lock:
            # Eski istekleri temizle
            while (self.requests[client_id] and 
                   self.requests[client_id][0] < current_time - self.window_seconds):
                self.requests[client_id].popleft()
            
            return {
                'client_id': client_id,
                'current_requests': len(self.requests[client_id]),
                'max_requests': self.max_requests,
                'window_seconds': self.window_seconds,
                'reset_time': self.requests[client_id][0] + self.window_seconds if self.requests[client_id] else None
            }

class InputValidator:
    """Input validation sınıfı"""
    
    def __init__(self):
        """Input validator'ı başlat"""
        self.validation_rules = {
            'dna_data': {
                'max_length': 10 * 1024 * 1024,  # 10MB
                'min_length': 100,
                'allowed_chars': set('ATCGN- \t\n\r'),
                'required_format': '23andme'
            },
            'rsid': {
                'pattern': r'^rs\d+$',
                'max_length': 20,
                'min_length': 3
            },
            'chromosome': {
                'allowed_values': set(str(i) for i in range(1, 23)) | {'X', 'Y', 'MT'},
                'max_length': 5
            },
            'genotype': {
                'pattern': r'^[ATCGN-]{1,2}$',
                'max_length': 2,
                'min_length': 1
            }
        }
        
        print("🔍 Input Validator başlatıldı")
    
    def validate_dna_data(self, dna_data: str) -> Tuple[bool, str]:
        """DNA verisini doğrula"""
        try:
            if not isinstance(dna_data, str):
                return False, "DNA verisi string olmalı"
            
            if len(dna_data) > self.validation_rules['dna_data']['max_length']:
                return False, f"DNA verisi çok büyük (max {self.validation_rules['dna_data']['max_length']} bytes)"
            
            if len(dna_data) < self.validation_rules['dna_data']['min_length']:
                return False, f"DNA verisi çok küçük (min {self.validation_rules['dna_data']['min_length']} bytes)"
            
            # İzin verilen karakterleri kontrol et
            allowed_chars = self.validation_rules['dna_data']['allowed_chars']
            invalid_chars = set(dna_data) - allowed_chars
            if invalid_chars:
                return False, f"Geçersiz karakterler: {invalid_chars}"
            
            # 23andMe format kontrolü
            lines = dna_data.split('\n')
            if not any(line.startswith('#') for line in lines[:10]):
                return False, "23andMe formatı gerekli (# ile başlayan header satırları)"
            
            return True, "DNA verisi geçerli"
            
        except Exception as e:
            return False, f"Validation hatası: {str(e)}"
    
    def validate_rsid(self, rsid: str) -> Tuple[bool, str]:
        """RSID'yi doğrula"""
        try:
            if not isinstance(rsid, str):
                return False, "RSID string olmalı"
            
            if len(rsid) < self.validation_rules['rsid']['min_length']:
                return False, "RSID çok kısa"
            
            if len(rsid) > self.validation_rules['rsid']['max_length']:
                return False, "RSID çok uzun"
            
            import re
            if not re.match(self.validation_rules['rsid']['pattern'], rsid):
                return False, "RSID formatı geçersiz (rs ile başlamalı)"
            
            return True, "RSID geçerli"
            
        except Exception as e:
            return False, f"RSID validation hatası: {str(e)}"
    
    def validate_chromosome(self, chromosome: str) -> Tuple[bool, str]:
        """Kromozom değerini doğrula"""
        try:
            if not isinstance(chromosome, str):
                return False, "Kromozom string olmalı"
            
            if chromosome not in self.validation_rules['chromosome']['allowed_values']:
                return False, f"Geçersiz kromozom: {chromosome}"
            
            return True, "Kromozom geçerli"
            
        except Exception as e:
            return False, f"Kromozom validation hatası: {str(e)}"
    
    def validate_genotype(self, genotype: str) -> Tuple[bool, str]:
        """Genotip değerini doğrula"""
        try:
            if not isinstance(genotype, str):
                return False, "Genotip string olmalı"
            
            if len(genotype) < self.validation_rules['genotype']['min_length']:
                return False, "Genotip çok kısa"
            
            if len(genotype) > self.validation_rules['genotype']['max_length']:
                return False, "Genotip çok uzun"
            
            import re
            if not re.match(self.validation_rules['genotype']['pattern'], genotype):
                return False, "Genotip formatı geçersiz (ATCGN- karakterleri)"
            
            return True, "Genotip geçerli"
            
        except Exception as e:
            return False, f"Genotip validation hatası: {str(e)}"

class SecurityManager:
    """Ana güvenlik yöneticisi"""
    
    def __init__(self):
        """Security manager'ı başlat"""
        self.rate_limiter = RateLimiter()
        self.input_validator = InputValidator()
        self.blocked_ips = set()
        self.suspicious_activities = defaultdict(int)
        self.security_logs = deque(maxlen=1000)
        
        # API anahtarları (gerçek uygulamada veritabanında olmalı)
        self.api_keys = {}
        self.session_tokens = {}
        
        print("🔒 Security Manager başlatıldı")
    
    def get_client_id(self, request) -> str:
        """İstemci kimliğini al"""
        # Gerçek IP adresini al (proxy arkasında olabilir)
        client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ',' in client_ip:
            client_ip = client_ip.split(',')[0].strip()
        
        return client_ip
    
    def check_rate_limit(self, request) -> Tuple[bool, Dict[str, Any]]:
        """Rate limit kontrolü yap"""
        client_id = self.get_client_id(request)
        return self.rate_limiter.is_allowed(client_id)
    
    def validate_request(self, request_data: Dict[str, Any]) -> Tuple[bool, str]:
        """İstek verilerini doğrula"""
        try:
            # DNA verisi kontrolü
            if 'dna_data' in request_data:
                is_valid, message = self.input_validator.validate_dna_data(request_data['dna_data'])
                if not is_valid:
                    return False, f"DNA verisi hatası: {message}"
            
            # RSID kontrolü
            if 'rsid' in request_data:
                is_valid, message = self.input_validator.validate_rsid(request_data['rsid'])
                if not is_valid:
                    return False, f"RSID hatası: {message}"
            
            # Kromozom kontrolü
            if 'chromosome' in request_data:
                is_valid, message = self.input_validator.validate_chromosome(request_data['chromosome'])
                if not is_valid:
                    return False, f"Kromozom hatası: {message}"
            
            return True, "İstek verileri geçerli"
            
        except Exception as e:
            return False, f"Validation hatası: {str(e)}"
    
    def log_security_event(self, event_type: str, client_id: str, details: str):
        """Güvenlik olayını logla"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'type': event_type,
            'client_id': client_id,
            'details': details
        }
        
        self.security_logs.append(event)
        
        # Şüpheli aktivite sayacını artır
        self.suspicious_activities[client_id] += 1
        
        print(f"🚨 Security Event: {event_type} - {client_id} - {details}")
    
    def is_ip_blocked(self, client_id: str) -> bool:
        """IP adresi engellenmiş mi kontrol et"""
        return client_id in self.blocked_ips
    
    def block_ip(self, client_id: str, reason: str):
        """IP adresini engelle"""
        self.blocked_ips.add(client_id)
        self.log_security_event('IP_BLOCKED', client_id, reason)
        print(f"🚫 IP engellendi: {client_id} - {reason}")
    
    def unblock_ip(self, client_id: str):
        """IP adresinin engelini kaldır"""
        self.blocked_ips.discard(client_id)
        self.log_security_event('IP_UNBLOCKED', client_id, "Manuel olarak kaldırıldı")
        print(f"✅ IP engeli kaldırıldı: {client_id}")
    
    def get_security_stats(self) -> Dict[str, Any]:
        """Güvenlik istatistiklerini döndür"""
        return {
            'blocked_ips_count': len(self.blocked_ips),
            'blocked_ips': list(self.blocked_ips),
            'suspicious_activities': dict(self.suspicious_activities),
            'recent_events': list(self.security_logs)[-10:],
            'rate_limiter_stats': {
                'max_requests': self.rate_limiter.max_requests,
                'window_seconds': self.rate_limiter.window_seconds
            }
        }
    
    def generate_api_key(self, client_name: str) -> str:
        """API anahtarı oluştur"""
        api_key = secrets.token_urlsafe(32)
        self.api_keys[api_key] = {
            'client_name': client_name,
            'created_at': datetime.now().isoformat(),
            'last_used': None,
            'is_active': True
        }
        
        self.log_security_event('API_KEY_GENERATED', client_name, f"Key: {api_key[:8]}...")
        return api_key
    
    def validate_api_key(self, api_key: str) -> Tuple[bool, str]:
        """API anahtarını doğrula"""
        if api_key not in self.api_keys:
            return False, "Geçersiz API anahtarı"
        
        key_info = self.api_keys[api_key]
        if not key_info['is_active']:
            return False, "API anahtarı deaktif"
        
        # Son kullanım zamanını güncelle
        key_info['last_used'] = datetime.now().isoformat()
        
        return True, "API anahtarı geçerli"
    
    def revoke_api_key(self, api_key: str) -> bool:
        """API anahtarını iptal et"""
        if api_key in self.api_keys:
            self.api_keys[api_key]['is_active'] = False
            self.log_security_event('API_KEY_REVOKED', api_key[:8], "Anahtar iptal edildi")
            return True
        return False

# Global security manager instance
security_manager = SecurityManager()

def rate_limit_required(max_requests: int = 100, window_seconds: int = 60):
    """Rate limiting decorator"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Flask request objesini al
            from flask import request
            
            client_id = security_manager.get_client_id(request)
            
            # Rate limit kontrolü
            is_allowed, rate_info = security_manager.check_rate_limit(request)
            
            if not is_allowed:
                security_manager.log_security_event('RATE_LIMIT_EXCEEDED', client_id, 
                    f"Limit: {rate_info['max_requests']}, Current: {rate_info['current_requests']}")
                
                from flask import jsonify
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'retry_after': rate_info['retry_after'],
                    'limit': rate_info['max_requests'],
                    'current': rate_info['current_requests']
                }), 429
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def validate_input_required():
    """Input validation decorator"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from flask import request, jsonify
            
            try:
                request_data = request.get_json() or {}
                
                # Input validation
                is_valid, message = security_manager.validate_request(request_data)
                
                if not is_valid:
                    client_id = security_manager.get_client_id(request)
                    security_manager.log_security_event('INVALID_INPUT', client_id, message)
                    
                    return jsonify({
                        'success': False,
                        'error': 'Invalid input',
                        'details': message
                    }), 400
                
                return func(*args, **kwargs)
                
            except Exception as e:
                client_id = security_manager.get_client_id(request)
                security_manager.log_security_event('VALIDATION_ERROR', client_id, str(e))
                
                return jsonify({
                    'success': False,
                    'error': 'Validation error',
                    'details': str(e)
                }), 400
        
        return wrapper
    return decorator
