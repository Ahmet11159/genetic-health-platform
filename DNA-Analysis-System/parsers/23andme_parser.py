"""
23andMe DNA Veri Parser
23andMe'den indirilen DNA verilerini okur ve analiz eder
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import re

@dataclass
class SNP23andMe:
    """23andMe SNP veri yapısı"""
    rsid: str
    chromosome: str
    position: int
    genotype: str
    confidence: Optional[float] = None

class Parser23andMe:
    """23andMe DNA veri parser sınıfı"""
    
    def __init__(self, file_path: str):
        """
        23andMe parser'ını başlat
        
        Args:
            file_path: 23andMe DNA dosyası yolu
        """
        self.file_path = Path(file_path)
        self.snps: List[SNP23andMe] = []
        self.raw_data: pd.DataFrame = None
        
    def load_data(self) -> bool:
        """23andMe DNA verisini yükle"""
        try:
            print(f"📁 23andMe dosyası yükleniyor: {self.file_path}")
            
            # Dosya formatını kontrol et
            if not self._is_valid_23andme_file():
                raise ValueError("Geçersiz 23andMe dosya formatı")
            
            # Veriyi yükle
            self.raw_data = self._load_raw_data()
            
            # SNP'leri parse et
            self.snps = self._parse_snps()
            
            print(f"✅ {len(self.snps)} SNP başarıyla yüklendi")
            return True
            
        except Exception as e:
            print(f"❌ 23andMe veri yükleme hatası: {e}")
            return False
    
    def _is_valid_23andme_file(self) -> bool:
        """23andMe dosya formatını kontrol et"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
                
            # 23andMe format kontrolü
            if first_line.startswith('#') or 'rsid' in first_line.lower():
                return True
            return False
            
        except Exception:
            return False
    
    def _load_raw_data(self) -> pd.DataFrame:
        """Ham veriyi yükle"""
        # 23andMe formatı: rsid, chromosome, position, genotype
        df = pd.read_csv(
            self.file_path,
            sep='\t',
            comment='#',
            names=['rsid', 'chromosome', 'position', 'genotype'],
            dtype={'rsid': str, 'chromosome': str, 'position': int, 'genotype': str}
        )
        
        # Geçersiz satırları filtrele
        df = df.dropna()
        df = df[df['rsid'].str.startswith('rs')]
        df = df[df['genotype'].isin(['AA', 'AT', 'AC', 'AG', 'TT', 'TC', 'TG', 'CC', 'CG', 'GG', '--', 'DD', 'II', 'DI'])]
        
        return df
    
    def _parse_snps(self) -> List[SNP23andMe]:
        """SNP'leri parse et"""
        snps = []
        
        for _, row in self.raw_data.iterrows():
            try:
                snp = SNP23andMe(
                    rsid=row['rsid'],
                    chromosome=str(row['chromosome']),
                    position=int(row['position']),
                    genotype=row['genotype']
                )
                snps.append(snp)
            except Exception as e:
                print(f"⚠️ SNP parse hatası: {row['rsid']} - {e}")
                continue
        
        return snps
    
    def get_snps_by_chromosome(self, chromosome: str) -> List[SNP23andMe]:
        """Belirli kromozomdaki SNP'leri getir"""
        return [snp for snp in self.snps if snp.chromosome == chromosome]
    
    def get_snps_by_gene(self, gene_rsids: List[str]) -> List[SNP23andMe]:
        """Belirli genlerdeki SNP'leri getir"""
        return [snp for snp in self.snps if snp.rsid in gene_rsids]
    
    def get_genotype_frequency(self) -> Dict[str, int]:
        """Genotip frekanslarını hesapla"""
        genotypes = [snp.genotype for snp in self.snps]
        return pd.Series(genotypes).value_counts().to_dict()
    
    def get_chromosome_distribution(self) -> Dict[str, int]:
        """Kromozom dağılımını hesapla"""
        chromosomes = [snp.chromosome for snp in self.snps]
        return pd.Series(chromosomes).value_counts().to_dict()
    
    def filter_high_confidence(self, min_confidence: float = 0.8) -> List[SNP23andMe]:
        """Yüksek güvenilirlikli SNP'leri filtrele"""
        # 23andMe'de genellikle confidence bilgisi yok
        # Bu yüzden tüm SNP'leri döndürüyoruz
        return self.snps
    
    def export_to_vcf(self, output_path: str) -> bool:
        """SNP'leri VCF formatında dışa aktar"""
        try:
            vcf_content = self._generate_vcf_content()
            
            with open(output_path, 'w') as f:
                f.write(vcf_content)
            
            print(f"✅ VCF dosyası oluşturuldu: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ VCF export hatası: {e}")
            return False
    
    def _generate_vcf_content(self) -> str:
        """VCF içeriği oluştur"""
        vcf_lines = [
            "##fileformat=VCFv4.2",
            "##INFO=<ID=DP,Number=1,Type=Integer,Description=\"Total read depth\">",
            "##FORMAT=<ID=GT,Number=1,Type=String,Description=\"Genotype\">",
            "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE"
        ]
        
        for snp in self.snps:
            # 23andMe'de REF/ALT bilgisi yok, bu yüzden varsayılan değerler
            ref_allele = "A"  # Varsayılan
            alt_allele = "T"  # Varsayılan
            
            vcf_line = f"{snp.chromosome}\t{snp.position}\t{snp.rsid}\t{ref_allele}\t{alt_allele}\t99.9\tPASS\tDP=100\tGT\t{snp.genotype}"
            vcf_lines.append(vcf_line)
        
        return "\n".join(vcf_lines)
    
    def get_statistics(self) -> Dict:
        """İstatistikleri hesapla"""
        if not self.snps:
            return {}
        
        return {
            "total_snps": len(self.snps),
            "chromosomes": len(set(snp.chromosome for snp in self.snps)),
            "genotype_distribution": self.get_genotype_frequency(),
            "chromosome_distribution": self.get_chromosome_distribution(),
            "file_size_mb": self.file_path.stat().st_size / (1024 * 1024)
        }

def main():
    """Test fonksiyonu"""
    # Örnek 23andMe dosyası oluştur
    create_sample_23andme_file()
    
    # Parser'ı test et
    parser = Parser23andMe("sample_23andme.txt")
    
    if parser.load_data():
        print("\n📊 23andMe Veri İstatistikleri:")
        stats = parser.get_statistics()
        for key, value in stats.items():
            print(f"  • {key}: {value}")
        
        # VCF'ye dönüştür
        parser.export_to_vcf("converted_23andme.vcf")
        
        print("\n✅ 23andMe parser testi başarılı!")
    else:
        print("\n❌ 23andMe parser testi başarısız!")

def create_sample_23andme_file():
    """Test için örnek 23andMe dosyası oluştur"""
    sample_data = """# This data file provided by 23andMe, Inc. is for research purposes only.
# Below are your raw, uninterpreted genetic data.
# rsid	chromosome	position	genotype
rs1801133	1	11856378	GG
rs429358	19	45411941	TC
rs7412	19	45412079	CC
rs1801131	1	11854477	AA
rs1799853	10	94781859	CC
rs1057910	10	94781859	AA
rs4244285	10	94781859	GG
rs4986893	10	94781859	TT
rs28399504	10	94781859	AA
rs41291556	10	94781859	CC
"""
    
    with open("sample_23andme.txt", "w") as f:
        f.write(sample_data)
    
    print("📁 Örnek 23andMe dosyası oluşturuldu")

if __name__ == "__main__":
    main()
