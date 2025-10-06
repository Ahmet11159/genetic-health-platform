#!/usr/bin/env python3
"""
DNA Analiz API Sunucusu
GenoHealth uygulaması için Python DNA analiz sistemini API olarak sunar
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sys
from pathlib import Path

# DNA analiz sistemini import et
sys.path.append(os.path.dirname(__file__))
from dna_analyzer import DNAAnalyzer

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

@app.route('/health', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    return jsonify({
        'status': 'healthy',
        'service': 'DNA Analysis API',
        'version': '1.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze_dna():
    """DNA analizi yap"""
    try:
        data = request.get_json()
        
        if not data or 'dna_data' not in data:
            return jsonify({'error': 'DNA verisi gerekli'}), 400
        
        dna_data = data['dna_data']
        platform = data.get('platform', '23andMe')
        
        # Geçici dosya oluştur
        temp_file = f"temp_dna_{hash(str(dna_data))}.txt"
        
        try:
            # DNA verisini dosyaya yaz (23andMe formatında)
            with open(temp_file, 'w') as f:
                f.write("# This file contains data exported from 23andMe\n")
                f.write("# Data format: rsid\tchromosome\tposition\tgenotype\n")
                f.write(dna_data)
            
            # DNA analizini yap
            analyzer = DNAAnalyzer(temp_file)
            
            if not analyzer.load_dna_data():
                return jsonify({'error': 'DNA verisi yüklenemedi'}), 400
            
            # Analizi çalıştır
            results = analyzer.analyze()
            
            # Sonuçları JSON'a çevir
            analysis_result = {
                'variant_count': results.variant_count,
                'analyzed_genes': results.analyzed_genes,
                'analysis_date': results.analysis_date,
                'confidence_score': results.confidence_score,
                'health_risks': results.health_risks,
                'drug_interactions': results.drug_interactions,
                'nutrition_recommendations': results.nutrition_recommendations,
                'exercise_recommendations': results.exercise_recommendations,
                'carrier_status': results.carrier_status,
                'population_frequencies': results.population_frequencies,
                'functional_impacts': results.functional_impacts,
                'processing_stats': analyzer.processing_stats
            }
            
            return jsonify({
                'success': True,
                'analysis': analysis_result
            })
            
        finally:
            # Geçici dosyayı sil
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test_analysis():
    """Test analizi yap"""
    try:
        # Test verisi ile analiz yap
        test_file = "sample_from_report.txt"
        
        if not os.path.exists(test_file):
            return jsonify({'error': 'Test dosyası bulunamadı'}), 404
        
        analyzer = DNAAnalyzer(test_file)
        
        if not analyzer.load_dna_data():
            return jsonify({'error': 'Test verisi yüklenemedi'}), 400
        
        results = analyzer.analyze()
        
        return jsonify({
            'success': True,
            'test_analysis': {
                'variant_count': results.variant_count,
                'analyzed_genes': results.analyzed_genes,
                'health_risks_count': len(results.health_risks),
                'drug_interactions_count': len(results.drug_interactions),
                'processing_time': analyzer.processing_stats.get('processing_time', 0)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🧬 DNA Analiz API Sunucusu başlatılıyor...")
    print("🌍 http://localhost:5001 adresinde çalışıyor")
    print("📊 Test: http://localhost:5001/test")
    print("🔬 Analiz: POST http://localhost:5001/analyze")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
