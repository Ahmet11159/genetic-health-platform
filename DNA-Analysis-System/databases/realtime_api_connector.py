"""
Gerçek Zamanlı API Bağlantıları
ClinVar, PharmGKB, GWAS Catalog için canlı veri bağlantıları
"""

import requests
import json
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

@dataclass
class APIConnection:
    """API bağlantı bilgileri"""
    base_url: str
    api_key: Optional[str] = None
    rate_limit: int = 1  # requests per second
    last_request: Optional[datetime] = None

class RealTimeAPIConnector:
    """Gerçek zamanlı API bağlantı sınıfı"""
    
    def __init__(self):
        """API bağlantılarını başlat"""
        self.connections = {
            'clinvar': APIConnection(
                base_url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
                rate_limit=3
            ),
            'pharmgkb': APIConnection(
                base_url="https://api.pharmgkb.org/v1/",
                rate_limit=2
            ),
            'gwas': APIConnection(
                base_url="https://www.ebi.ac.uk/gwas/api/",
                rate_limit=2
            ),
            'gwas_alt': APIConnection(
                base_url="https://www.ebi.ac.uk/gwas/rest/api/",
                rate_limit=2
            ),
            'dbsnp': APIConnection(
                base_url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
                rate_limit=3
            ),
            'exac': APIConnection(
                base_url="https://exac.broadinstitute.org/api/",
                rate_limit=1
            )
        }
        
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = timedelta(hours=24)  # 24 saat cache
        
        print("🌐 Gerçek Zamanlı API Bağlantıları başlatıldı")
    
    def query_clinvar(self, rsid: str) -> Optional[Dict]:
        """ClinVar'dan gerçek zamanlı veri çek"""
        try:
            # Cache kontrolü
            cache_key = f"clinvar_{rsid}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]
            
            # Rate limiting
            self._wait_for_rate_limit('clinvar')
            
            # ClinVar API sorgusu
            url = f"{self.connections['clinvar'].base_url}esearch.fcgi"
            params = {
                'db': 'clinvar',
                'term': rsid,
                'retmode': 'json',
                'retmax': 1
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'esearchresult' in data and 'idlist' in data['esearchresult']:
                id_list = data['esearchresult']['idlist']
                if id_list:
                    # Detaylı veri çek
                    detail_data = self._get_clinvar_details(id_list[0])
                    if detail_data:
                        self._cache_data(cache_key, detail_data)
                        return detail_data
            
            return None
            
        except Exception as e:
            print(f"⚠️ ClinVar API hatası {rsid}: {e}")
            return None
    
    def query_pharmgkb(self, rsid: str) -> Optional[Dict]:
        """PharmGKB'den gerçek zamanlı veri çek"""
        try:
            cache_key = f"pharmgkb_{rsid}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]
            
            self._wait_for_rate_limit('pharmgkb')
            
            # PharmGKB API sorgusu
            url = f"{self.connections['pharmgkb'].base_url}data/variant/{rsid}"
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'GenoHealth-DNA-Analyzer/1.0'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self._cache_data(cache_key, data)
                return data
            elif response.status_code == 404:
                # Varyant bulunamadı
                return None
            else:
                response.raise_for_status()
                
        except Exception as e:
            print(f"⚠️ PharmGKB API hatası {rsid}: {e}")
            return None
    
    def query_gwas_catalog(self, rsid: str) -> Optional[Dict]:
        """GWAS Catalog'dan gerçek zamanlı veri çek"""
        try:
            cache_key = f"gwas_{rsid}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]
            
            # İlk endpoint'i dene
            result = self._try_gwas_endpoint('gwas', rsid)
            if result:
                self._cache_data(cache_key, result)
                return result
            
            # Alternatif endpoint'i dene
            result = self._try_gwas_endpoint('gwas_alt', rsid)
            if result:
                self._cache_data(cache_key, result)
                return result
            
            print(f"ℹ️ GWAS'da varyant bulunamadı: {rsid}")
            return None
            
        except Exception as e:
            print(f"⚠️ GWAS API hatası {rsid}: {e}")
            return None
    
    def _try_gwas_endpoint(self, endpoint_name: str, rsid: str) -> Optional[Dict]:
        """GWAS endpoint'ini dene"""
        try:
            self._wait_for_rate_limit(endpoint_name)
            
            connection = self.connections[endpoint_name]
            
            # Farklı parametre kombinasyonları dene
            param_combinations = [
                {'variantId': rsid, 'size': 100},
                {'variant_id': rsid, 'size': 100},
                {'rsid': rsid, 'size': 100},
                {'variant': rsid, 'size': 100}
            ]
            
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'GenoHealth-DNA-Analyzer/1.0'
            }
            
            for params in param_combinations:
                try:
                    url = f"{connection.base_url}associations"
                    response = requests.get(url, params=params, headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Farklı response formatları için kontrol
                        associations = []
                        if '_embedded' in data and 'associations' in data['_embedded']:
                            associations = data['_embedded']['associations']
                        elif 'associations' in data:
                            associations = data['associations']
                        elif isinstance(data, list):
                            associations = data
                        
                        if associations:
                            return self._process_gwas_data(associations)
                    
                except requests.exceptions.RequestException:
                    continue
            
            return None
            
        except Exception as e:
            print(f"⚠️ {endpoint_name} endpoint hatası {rsid}: {e}")
            return None
    
    def query_dbsnp(self, rsid: str) -> Optional[Dict]:
        """dbSNP'den gerçek zamanlı veri çek"""
        try:
            cache_key = f"dbsnp_{rsid}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]
            
            self._wait_for_rate_limit('dbsnp')
            
            # dbSNP API sorgusu
            url = f"{self.connections['dbsnp'].base_url}esummary.fcgi"
            params = {
                'db': 'snp',
                'id': rsid,
                'retmode': 'json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'result' in data and rsid in data['result']:
                snp_data = data['result'][rsid]
                processed_data = self._process_dbsnp_data(snp_data)
                self._cache_data(cache_key, processed_data)
                return processed_data
            
            return None
            
        except Exception as e:
            print(f"⚠️ dbSNP API hatası {rsid}: {e}")
            return None
    
    def query_exac(self, rsid: str) -> Optional[Dict]:
        """ExAC'den gerçek zamanlı veri çek"""
        try:
            cache_key = f"exac_{rsid}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]
            
            self._wait_for_rate_limit('exac')
            
            # ExAC API sorgusu
            url = f"{self.connections['exac'].base_url}variant/{rsid}"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self._cache_data(cache_key, data)
                return data
            elif response.status_code == 404:
                return None
            else:
                response.raise_for_status()
                
        except Exception as e:
            print(f"⚠️ ExAC API hatası {rsid}: {e}")
            return None
    
    def _get_clinvar_details(self, clinvar_id: str) -> Optional[Dict]:
        """ClinVar detaylı veri çek"""
        try:
            url = f"{self.connections['clinvar'].base_url}esummary.fcgi"
            params = {
                'db': 'clinvar',
                'id': clinvar_id,
                'retmode': 'json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'result' in data and clinvar_id in data['result']:
                return self._process_clinvar_data(data['result'][clinvar_id])
            
            return None
            
        except Exception as e:
            print(f"⚠️ ClinVar detay hatası {clinvar_id}: {e}")
            return None
    
    def _process_clinvar_data(self, clinvar_data: Dict) -> Dict:
        """ClinVar verisini işle"""
        processed = {
            'clinical_significance': 'Unknown',
            'diseases': [],
            'review_status': 'Unknown',
            'last_evaluated': None
        }
        
        try:
            # Clinical significance
            if 'clinical_significance' in clinvar_data:
                processed['clinical_significance'] = clinvar_data['clinical_significance']
            
            # Diseases
            if 'diseases' in clinvar_data:
                processed['diseases'] = clinvar_data['diseases']
            
            # Review status
            if 'review_status' in clinvar_data:
                processed['review_status'] = clinvar_data['review_status']
            
            # Last evaluated
            if 'last_evaluated' in clinvar_data:
                processed['last_evaluated'] = clinvar_data['last_evaluated']
                
        except Exception as e:
            print(f"⚠️ ClinVar veri işleme hatası: {e}")
        
        return processed
    
    def _process_gwas_data(self, associations: List[Dict]) -> Dict:
        """GWAS verisini işle"""
        processed = {
            'associations': [],
            'diseases': [],
            'p_values': [],
            'effect_sizes': []
        }
        
        try:
            for assoc in associations:
                processed['associations'].append({
                    'disease_trait': assoc.get('diseaseTrait', {}).get('trait', 'Unknown'),
                    'p_value': assoc.get('pvalue', 0),
                    'effect_size': assoc.get('beta', 0),
                    'study': assoc.get('study', {}).get('studyTag', 'Unknown')
                })
                
                # Diseases listesi
                disease = assoc.get('diseaseTrait', {}).get('trait', 'Unknown')
                if disease not in processed['diseases']:
                    processed['diseases'].append(disease)
                
                # P-values
                p_val = assoc.get('pvalue', 0)
                if p_val > 0:
                    processed['p_values'].append(p_val)
                
                # Effect sizes
                effect = assoc.get('beta', 0)
                if effect != 0:
                    processed['effect_sizes'].append(effect)
                    
        except Exception as e:
            print(f"⚠️ GWAS veri işleme hatası: {e}")
        
        return processed
    
    def _process_dbsnp_data(self, dbsnp_data: Dict) -> Dict:
        """dbSNP verisini işle"""
        processed = {
            'chromosome': 'Unknown',
            'position': 0,
            'ref_allele': 'Unknown',
            'alt_allele': 'Unknown',
            'allele_frequencies': {},
            'clinical_significance': 'Unknown'
        }
        
        try:
            # Chromosome
            if 'chr' in dbsnp_data:
                processed['chromosome'] = dbsnp_data['chr']
            
            # Position
            if 'chrpos' in dbsnp_data:
                processed['position'] = dbsnp_data['chrpos']
            
            # Alleles
            if 'allele_origin' in dbsnp_data:
                alleles = dbsnp_data['allele_origin'].split('/')
                if len(alleles) >= 2:
                    processed['ref_allele'] = alleles[0]
                    processed['alt_allele'] = alleles[1]
            
            # Allele frequencies
            if 'allele_freq' in dbsnp_data:
                processed['allele_frequencies'] = dbsnp_data['allele_freq']
            
            # Clinical significance
            if 'clinical' in dbsnp_data:
                processed['clinical_significance'] = dbsnp_data['clinical']
                
        except Exception as e:
            print(f"⚠️ dbSNP veri işleme hatası: {e}")
        
        return processed
    
    def _wait_for_rate_limit(self, api_name: str):
        """Rate limiting kontrolü"""
        connection = self.connections[api_name]
        
        if connection.last_request:
            time_since_last = datetime.now() - connection.last_request
            min_interval = 1.0 / connection.rate_limit
            
            if time_since_last.total_seconds() < min_interval:
                sleep_time = min_interval - time_since_last.total_seconds()
                time.sleep(sleep_time)
        
        connection.last_request = datetime.now()
    
    def _is_cached(self, cache_key: str) -> bool:
        """Cache kontrolü"""
        if cache_key in self.cache:
            if cache_key in self.cache_expiry:
                if datetime.now() < self.cache_expiry[cache_key]:
                    return True
                else:
                    # Cache süresi dolmuş
                    del self.cache[cache_key]
                    del self.cache_expiry[cache_key]
        
        return False
    
    def _cache_data(self, cache_key: str, data: Any):
        """Veriyi cache'e kaydet"""
        self.cache[cache_key] = data
        self.cache_expiry[cache_key] = datetime.now() + self.cache_duration
    
    def get_cache_stats(self) -> Dict:
        """Cache istatistikleri"""
        total_cached = len(self.cache)
        expired_keys = []
        
        for key, expiry in self.cache_expiry.items():
            if datetime.now() > expiry:
                expired_keys.append(key)
        
        return {
            'total_cached': total_cached,
            'expired_keys': len(expired_keys),
            'cache_duration_hours': self.cache_duration.total_seconds() / 3600
        }
    
    def clear_cache(self):
        """Cache'i temizle"""
        self.cache.clear()
        self.cache_expiry.clear()
        print("🗑️ API Cache temizlendi")
    
    def test_all_connections(self) -> Dict[str, bool]:
        """Tüm API bağlantılarını test et"""
        results = {}
        
        # Test rsid'leri
        test_rsids = ['rs1801133', 'rs429358', 'rs7412']
        
        for api_name in self.connections.keys():
            try:
                if api_name == 'clinvar':
                    result = self.query_clinvar(test_rsids[0])
                elif api_name == 'pharmgkb':
                    result = self.query_pharmgkb(test_rsids[0])
                elif api_name == 'gwas':
                    result = self.query_gwas_catalog(test_rsids[0])
                elif api_name == 'dbsnp':
                    result = self.query_dbsnp(test_rsids[0])
                elif api_name == 'exac':
                    result = self.query_exac(test_rsids[0])
                
                results[api_name] = result is not None
                
            except Exception as e:
                print(f"⚠️ {api_name} API test hatası: {e}")
                results[api_name] = False
        
        return results
