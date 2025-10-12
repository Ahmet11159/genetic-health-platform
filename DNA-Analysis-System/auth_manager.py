"""
Authentication Yönetim Sistemi
DNA analiz sistemi için kimlik doğrulama
"""

import hashlib
import hmac
import secrets
import time
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
import json
import logging

class AuthManager:
    """Authentication yöneticisi"""
    
    def __init__(self, secret_key: str = None):
        """
        Auth manager'ı başlat
        
        Args:
            secret_key: JWT secret key (None ise otomatik oluştur)
        """
        self.secret_key = secret_key or secrets.token_urlsafe(32)
        self.users = {}  # Gerçek uygulamada veritabanında olmalı
        self.sessions = {}
        self.refresh_tokens = {}
        
        # JWT ayarları
        self.jwt_algorithm = 'HS256'
        self.access_token_expiry = timedelta(hours=1)
        self.refresh_token_expiry = timedelta(days=30)
        
        print("🔐 Auth Manager başlatıldı")
    
    def hash_password(self, password: str) -> str:
        """Şifreyi hash'le"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Şifreyi doğrula"""
        try:
            salt, hash_hex = password_hash.split(':')
            password_hash_check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return hmac.compare_digest(hash_hex, password_hash_check.hex())
        except:
            return False
    
    def register_user(self, username: str, email: str, password: str, 
                     full_name: str = None) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Kullanıcı kaydı
        
        Args:
            username: Kullanıcı adı
            email: E-posta
            password: Şifre
            full_name: Tam ad
            
        Returns:
            (başarılı, mesaj, kullanıcı_bilgileri)
        """
        try:
            # Kullanıcı adı kontrolü
            if username in self.users:
                return False, "Kullanıcı adı zaten kullanılıyor", {}
            
            # E-posta kontrolü
            for user in self.users.values():
                if user['email'] == email:
                    return False, "E-posta zaten kullanılıyor", {}
            
            # Şifre güçlülük kontrolü
            if len(password) < 8:
                return False, "Şifre en az 8 karakter olmalı", {}
            
            # Kullanıcı oluştur
            user_id = secrets.token_urlsafe(16)
            password_hash = self.hash_password(password)
            
            user_data = {
                'user_id': user_id,
                'username': username,
                'email': email,
                'full_name': full_name or username,
                'password_hash': password_hash,
                'created_at': datetime.now().isoformat(),
                'last_login': None,
                'is_active': True,
                'is_verified': False,
                'role': 'user'
            }
            
            self.users[username] = user_data
            
            return True, "Kullanıcı başarıyla kaydedildi", {
                'user_id': user_id,
                'username': username,
                'email': email,
                'full_name': user_data['full_name']
            }
            
        except Exception as e:
            return False, f"Kayıt hatası: {str(e)}", {}
    
    def authenticate_user(self, username: str, password: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Kullanıcı kimlik doğrulama
        
        Args:
            username: Kullanıcı adı
            password: Şifre
            
        Returns:
            (başarılı, mesaj, kullanıcı_bilgileri)
        """
        try:
            if username not in self.users:
                return False, "Kullanıcı bulunamadı", {}
            
            user = self.users[username]
            
            if not user['is_active']:
                return False, "Hesap deaktif", {}
            
            if not self.verify_password(password, user['password_hash']):
                return False, "Geçersiz şifre", {}
            
            # Son giriş zamanını güncelle
            user['last_login'] = datetime.now().isoformat()
            
            return True, "Giriş başarılı", {
                'user_id': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role']
            }
            
        except Exception as e:
            return False, f"Kimlik doğrulama hatası: {str(e)}", {}
    
    def generate_tokens(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """JWT token'ları oluştur"""
        try:
            current_time = datetime.utcnow()
            
            # Access token payload
            access_payload = {
                'user_id': user_data['user_id'],
                'username': user_data['username'],
                'role': user_data['role'],
                'type': 'access',
                'iat': current_time,
                'exp': current_time + self.access_token_expiry
            }
            
            # Refresh token payload
            refresh_payload = {
                'user_id': user_data['user_id'],
                'username': user_data['username'],
                'type': 'refresh',
                'iat': current_time,
                'exp': current_time + self.refresh_token_expiry
            }
            
            # Token'ları oluştur
            access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.jwt_algorithm)
            refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.jwt_algorithm)
            
            # Refresh token'ı kaydet
            self.refresh_tokens[refresh_token] = {
                'user_id': user_data['user_id'],
                'created_at': current_time.isoformat(),
                'is_active': True
            }
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer',
                'expires_in': int(self.access_token_expiry.total_seconds())
            }
            
        except Exception as e:
            raise Exception(f"Token oluşturma hatası: {str(e)}")
    
    def verify_token(self, token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        JWT token'ı doğrula
        
        Args:
            token: JWT token
            
        Returns:
            (geçerli, payload)
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.jwt_algorithm])
            
            # Token tipini kontrol et
            if payload.get('type') != 'access':
                return False, {}
            
            # Kullanıcı aktif mi kontrol et
            username = payload.get('username')
            if username and username in self.users:
                user = self.users[username]
                if not user['is_active']:
                    return False, {}
            
            return True, payload
            
        except jwt.ExpiredSignatureError:
            return False, {'error': 'Token süresi dolmuş'}
        except jwt.InvalidTokenError:
            return False, {'error': 'Geçersiz token'}
        except Exception as e:
            return False, {'error': f'Token doğrulama hatası: {str(e)}'}
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Access token'ı yenile
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            (başarılı, mesaj, yeni_tokenlar)
        """
        try:
            # Refresh token'ı doğrula
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.jwt_algorithm])
            
            if payload.get('type') != 'refresh':
                return False, "Geçersiz refresh token", {}
            
            # Refresh token kayıtlı mı kontrol et
            if refresh_token not in self.refresh_tokens:
                return False, "Refresh token bulunamadı", {}
            
            refresh_info = self.refresh_tokens[refresh_token]
            if not refresh_info['is_active']:
                return False, "Refresh token deaktif", {}
            
            # Kullanıcı bilgilerini al
            username = payload.get('username')
            if username not in self.users:
                return False, "Kullanıcı bulunamadı", {}
            
            user = self.users[username]
            if not user['is_active']:
                return False, "Hesap deaktif", {}
            
            # Yeni token'ları oluştur
            user_data = {
                'user_id': user['user_id'],
                'username': user['username'],
                'role': user['role']
            }
            
            new_tokens = self.generate_tokens(user_data)
            
            # Eski refresh token'ı deaktif et
            self.refresh_tokens[refresh_token]['is_active'] = False
            
            return True, "Token başarıyla yenilendi", new_tokens
            
        except jwt.ExpiredSignatureError:
            return False, "Refresh token süresi dolmuş", {}
        except jwt.InvalidTokenError:
            return False, "Geçersiz refresh token", {}
        except Exception as e:
            return False, f"Token yenileme hatası: {str(e)}", {}
    
    def revoke_token(self, token: str) -> bool:
        """Token'ı iptal et"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.jwt_algorithm])
            
            if payload.get('type') == 'refresh':
                if token in self.refresh_tokens:
                    self.refresh_tokens[token]['is_active'] = False
                    return True
            
            return False
            
        except:
            return False
    
    def get_user_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Token'dan kullanıcı bilgilerini al"""
        try:
            is_valid, payload = self.verify_token(token)
            
            if not is_valid:
                return None
            
            username = payload.get('username')
            if username and username in self.users:
                user = self.users[username].copy()
                # Hassas bilgileri kaldır
                user.pop('password_hash', None)
                return user
            
            return None
            
        except:
            return None
    
    def change_password(self, username: str, old_password: str, new_password: str) -> Tuple[bool, str]:
        """Şifre değiştir"""
        try:
            if username not in self.users:
                return False, "Kullanıcı bulunamadı"
            
            user = self.users[username]
            
            # Eski şifreyi doğrula
            if not self.verify_password(old_password, user['password_hash']):
                return False, "Eski şifre yanlış"
            
            # Yeni şifre güçlülük kontrolü
            if len(new_password) < 8:
                return False, "Yeni şifre en az 8 karakter olmalı"
            
            # Şifreyi güncelle
            user['password_hash'] = self.hash_password(new_password)
            
            return True, "Şifre başarıyla değiştirildi"
            
        except Exception as e:
            return False, f"Şifre değiştirme hatası: {str(e)}"
    
    def deactivate_user(self, username: str) -> bool:
        """Kullanıcıyı deaktif et"""
        try:
            if username in self.users:
                self.users[username]['is_active'] = False
                
                # Tüm refresh token'ları deaktif et
                for token, info in self.refresh_tokens.items():
                    if info['user_id'] == self.users[username]['user_id']:
                        info['is_active'] = False
                
                return True
            
            return False
            
        except:
            return False
    
    def get_auth_stats(self) -> Dict[str, Any]:
        """Authentication istatistiklerini döndür"""
        active_users = sum(1 for user in self.users.values() if user['is_active'])
        active_sessions = sum(1 for session in self.sessions.values() if session['is_active'])
        active_refresh_tokens = sum(1 for token in self.refresh_tokens.values() if token['is_active'])
        
        return {
            'total_users': len(self.users),
            'active_users': active_users,
            'active_sessions': active_sessions,
            'active_refresh_tokens': active_refresh_tokens,
            'jwt_settings': {
                'algorithm': self.jwt_algorithm,
                'access_token_expiry_hours': self.access_token_expiry.total_seconds() / 3600,
                'refresh_token_expiry_days': self.refresh_token_expiry.days
            }
        }

# Global auth manager instance
auth_manager = AuthManager()
