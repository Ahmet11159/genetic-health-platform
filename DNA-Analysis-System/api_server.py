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
import time
import threading

# DNA analiz sistemini import et
sys.path.append(os.path.dirname(__file__))
from dna_analyzer import DNAAnalyzer
from gemini_ai_analyzer import GeminiDNAAnalyzer
from cache_manager import cache_manager
from parallel_processor import parallel_processor
from memory_manager import memory_manager
from streaming_processor import streaming_processor
from database_optimizer import db_pool
from query_optimizer import query_optimizer
from monitoring_system import system_monitor
from error_tracker import error_tracker

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

# Gemini AI analizörünü başlat
gemini_analyzer = None
try:
    # Environment variable'ı kontrol et
    api_key = os.getenv('GEMINI_API_KEY')
    print(f"🔑 API Key bulundu: {api_key[:10]}..." if api_key else "❌ API Key bulunamadı")
    if api_key:
        gemini_analyzer = GeminiDNAAnalyzer(api_key)
        print("🤖 Gemini AI analizörü başlatıldı")
    else:
        print("⚠️ GEMINI_API_KEY environment variable bulunamadı")
except Exception as e:
    print(f"⚠️ Gemini AI başlatılamadı: {e}")
    import traceback
    traceback.print_exc()
    gemini_analyzer = None

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
            
            # Temel analizi çalıştır
            results = analyzer.analyze()
            
            # Gemini AI ile gelişmiş analiz yap
            enhanced_analysis = {}
            print(f"🔍 Gemini analyzer durumu: {gemini_analyzer is not None}")
            if gemini_analyzer:
                try:
                    print("🤖 Gemini AI ile gelişmiş analiz yapılıyor...")
                    
                    # Genetik varyantları Gemini'ye gönder
                    variants = getattr(analyzer, 'raw_genetic_data', [])[:20]  # İlk 20 varyant
                    gemini_health = gemini_analyzer.analyze_genetic_variants(variants)
                    
                    # Beslenme analizi
                    genetic_profile = {
                        'variants': variants,
                        'health_risks': results.health_risks
                    }
                    gemini_nutrition = gemini_analyzer.analyze_nutrition_needs(genetic_profile)
                    
                    # Egzersiz analizi
                    gemini_exercise = gemini_analyzer.analyze_exercise_needs(genetic_profile)
                    
                    # Takviye analizi
                    gemini_supplements = gemini_analyzer.analyze_supplement_needs(genetic_profile)
                    
                    enhanced_analysis = {
                        'gemini_health_analysis': gemini_health,
                        'gemini_nutrition_analysis': gemini_nutrition,
                        'gemini_exercise_analysis': gemini_exercise,
                        'gemini_supplement_analysis': gemini_supplements,
                        'ai_enhanced': True
                    }
                    
                    print("✅ Gemini AI analizi tamamlandı")
                    
                except Exception as e:
                    print(f"⚠️ Gemini AI analiz hatası: {e}")
                    enhanced_analysis = {'ai_enhanced': False, 'error': str(e)}
            else:
                enhanced_analysis = {'ai_enhanced': False, 'reason': 'Gemini AI kullanılamıyor'}
            
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
                'processing_stats': analyzer.processing_stats,
                'enhanced_analysis': enhanced_analysis
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

@app.route('/cache/stats', methods=['GET'])
def get_cache_stats():
    """Cache istatistiklerini döndür"""
    try:
        stats = cache_manager.get_stats()
        return jsonify({
            'success': True,
            'cache_stats': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Cache'i temizle"""
    try:
        cleared_count = cache_manager.clear_expired()
        return jsonify({
            'success': True,
            'message': f'{cleared_count} süresi dolmuş cache temizlendi'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/performance/stats', methods=['GET'])
def get_performance_stats():
    """Performans istatistiklerini döndür"""
    try:
        parallel_stats = parallel_processor.get_performance_stats()
        cache_stats = cache_manager.get_stats()
        
        return jsonify({
            'success': True,
            'performance_stats': {
                'parallel_processing': parallel_stats,
                'caching': cache_stats,
                'system_info': {
                    'cpu_count': os.cpu_count(),
                    'memory_usage': 'N/A'
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze/fast', methods=['POST'])
def analyze_dna_fast():
    """Hızlı DNA analizi - sadece temel analiz"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data or 'dna_data' not in data:
            return jsonify({
                'success': False,
                'error': 'DNA verisi gerekli'
            }), 400
        
        dna_data = data['dna_data']
        platform = data.get('platform', '23andme')
        
        print(f"⚡ Hızlı DNA analizi başlatılıyor... Platform: {platform}")
        
        # Memory kontrolü
        if not memory_manager.check_memory_limit():
            return jsonify({
                'success': False,
                'error': 'Memory limiti aşıldı, lütfen daha sonra tekrar deneyin'
            }), 507
        
        # Cache kontrolü
        cached_result = cache_manager.get(dna_data, 'fast')
        if cached_result:
            return jsonify({
                'success': True,
                'analysis': cached_result,
                'message': 'Hızlı analiz cache\'den döndürüldü',
                'cached': True,
                'processing_time': time.time() - start_time
            })
        
        # Geçici dosya oluştur
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
            temp_file.write(dna_data)
            temp_file_path = temp_file.name
        
        try:
            # DNA analizörünü başlat
            analyzer = DNAAnalyzer(temp_file_path)
            
            # Sadece temel analiz (hızlı)
            results = analyzer.analyze()
            
            # Basit sonuç
            analysis_result = {
                'variant_count': len(results.variants) if hasattr(results, 'variants') else 0,
                'health_risks': results.health_risks,
                'confidence_score': results.confidence_score,
                'analysis_date': results.analysis_date,
                'fast_analysis': True
            }
            
            # Cache'e kaydet
            cache_manager.set(dna_data, analysis_result, 'fast', ttl_hours=12)
            
            return jsonify({
                'success': True,
                'analysis': analysis_result,
                'message': 'Hızlı DNA analizi tamamlandı',
                'cached': False,
                'processing_time': time.time() - start_time
            })
            
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'processing_time': time.time() - start_time
        }), 500

@app.route('/analyze/streaming', methods=['POST'])
def analyze_dna_streaming():
    """Streaming DNA analizi - büyük dosyalar için"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data or 'dna_data' not in data:
            return jsonify({
                'success': False,
                'error': 'DNA verisi gerekli'
            }), 400
        
        dna_data = data['dna_data']
        platform = data.get('platform', '23andme')
        
        print(f"🌊 Streaming DNA analizi başlatılıyor... Platform: {platform}")
        
        # Memory kontrolü
        if not memory_manager.check_memory_limit():
            return jsonify({
                'success': False,
                'error': 'Memory limiti aşıldı, lütfen daha sonra tekrar deneyin'
            }), 507
        
        # Geçici dosya oluştur
        temp_file_path = streaming_processor.create_memory_efficient_temp_file(dna_data)
        
        try:
            # Streaming işleme
            all_results = []
            
            def progress_callback(progress, chunk_result):
                print(f"📈 Streaming ilerleme: {progress:.1f}%")
            
            def result_callback(chunk_result):
                all_results.append(chunk_result)
            
            # Streaming işleme başlat
            final_result = streaming_processor.process_dna_file_with_callback(
                temp_file_path,
                progress_callback=progress_callback,
                result_callback=result_callback
            )
            
            if final_result['success']:
                return jsonify({
                    'success': True,
                    'analysis': {
                        'variant_count': final_result['total_variants'],
                        'chunks_processed': final_result['chunks_processed'],
                        'processing_time': final_result['processing_time'],
                        'memory_stats': final_result['memory_stats'],
                        'streaming_analysis': True
                    },
                    'message': 'Streaming DNA analizi tamamlandı',
                    'processing_time': time.time() - start_time
                })
            else:
                return jsonify({
                    'success': False,
                    'error': final_result.get('error', 'Streaming analiz hatası'),
                    'processing_time': time.time() - start_time
                }), 500
            
        finally:
            streaming_processor.cleanup_temp_file(temp_file_path)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'processing_time': time.time() - start_time
        }), 500

@app.route('/memory/stats', methods=['GET'])
def get_memory_stats():
    """Memory istatistiklerini döndür"""
    try:
        memory_report = memory_manager.get_memory_report()
        return jsonify({
            'success': True,
            'memory_stats': memory_report
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/memory/cleanup', methods=['POST'])
def cleanup_memory():
    """Memory temizliği yap"""
    try:
        cleanup_result = memory_manager.cleanup_memory()
        return jsonify({
            'success': True,
            'cleanup_result': cleanup_result,
            'message': 'Memory temizliği tamamlandı'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/memory/optimize', methods=['POST'])
def optimize_memory():
    """Memory optimizasyonu yap"""
    try:
        optimization_result = memory_manager.optimize_memory_usage()
        return jsonify({
            'success': True,
            'optimization_result': optimization_result,
            'message': 'Memory optimizasyonu tamamlandı'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/database/stats', methods=['GET'])
def get_database_stats():
    """Veritabanı istatistiklerini döndür"""
    try:
        db_stats = db_pool.get_performance_stats()
        query_stats = query_optimizer.get_performance_report()
        
        return jsonify({
            'success': True,
            'database_stats': db_stats,
            'query_stats': query_stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/database/optimize', methods=['POST'])
def optimize_database():
    """Veritabanını optimize et"""
    try:
        db_optimization = db_pool.optimize_database()
        query_optimization = query_optimizer.optimize_queries()
        
        return jsonify({
            'success': True,
            'database_optimization': db_optimization,
            'query_optimization': query_optimization,
            'message': 'Veritabanı optimizasyonu tamamlandı'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/database/cleanup', methods=['POST'])
def cleanup_database():
    """Veritabanını temizle"""
    try:
        cleanup_result = db_pool.cleanup_old_data(days=30)
        query_optimizer.clear_query_cache()
        
        return jsonify({
            'success': True,
            'cleanup_result': cleanup_result,
            'message': 'Veritabanı temizliği tamamlandı'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/variants/search', methods=['GET'])
def search_variants():
    """Varyantları ara"""
    try:
        rsid = request.args.get('rsid')
        chromosome = request.args.get('chromosome')
        gene = request.args.get('gene')
        
        if rsid:
            results = query_optimizer.get_genetic_variants_by_rsid(rsid)
        elif chromosome:
            start_pos = request.args.get('start_pos', type=int)
            end_pos = request.args.get('end_pos', type=int)
            results = query_optimizer.get_variants_by_chromosome(
                chromosome, start_pos, end_pos
            )
        elif gene:
            results = query_optimizer.search_variants_by_gene(gene)
        else:
            return jsonify({
                'success': False,
                'error': 'Arama parametresi gerekli (rsid, chromosome, gene)'
            }), 400
        
        return jsonify({
            'success': True,
            'variants': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/variants/health-risks/<int:variant_id>', methods=['GET'])
def get_variant_health_risks(variant_id):
    """Varyanta göre sağlık risklerini getir"""
    try:
        results = query_optimizer.get_health_risks_by_variant(variant_id)
        
        return jsonify({
            'success': True,
            'health_risks': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/variants/drug-interactions/<int:variant_id>', methods=['GET'])
def get_variant_drug_interactions(variant_id):
    """Varyanta göre ilaç etkileşimlerini getir"""
    try:
        results = query_optimizer.get_drug_interactions_by_variant(variant_id)
        
        return jsonify({
            'success': True,
            'drug_interactions': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/variants/high-impact', methods=['GET'])
def get_high_impact_variants():
    """Yüksek etkili varyantları getir"""
    try:
        min_frequency = request.args.get('min_frequency', 0.01, type=float)
        results = query_optimizer.get_high_impact_variants(min_frequency)
        
        return jsonify({
            'success': True,
            'variants': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/status', methods=['GET'])
def get_monitoring_status():
    """Sistem monitoring durumunu döndür"""
    try:
        status = system_monitor.get_system_status()
        return jsonify({
            'success': True,
            'monitoring_status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/performance', methods=['GET'])
def get_performance_report():
    """Performance raporunu döndür"""
    try:
        report = system_monitor.get_performance_report()
        return jsonify({
            'success': True,
            'performance_report': report
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/errors', methods=['GET'])
def get_error_summary():
    """Hata özetini döndür"""
    try:
        summary = error_tracker.get_error_summary()
        return jsonify({
            'success': True,
            'error_summary': summary
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/errors/category/<category>', methods=['GET'])
def get_errors_by_category(category):
    """Kategoriye göre hataları getir"""
    try:
        errors = error_tracker.get_errors_by_category(category)
        return jsonify({
            'success': True,
            'errors': errors,
            'count': len(errors)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/errors/severity/<severity>', methods=['GET'])
def get_errors_by_severity(severity):
    """Şiddete göre hataları getir"""
    try:
        errors = error_tracker.get_errors_by_severity(severity.upper())
        return jsonify({
            'success': True,
            'errors': errors,
            'count': len(errors)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/health', methods=['GET'])
def get_health_score():
    """Sistem sağlık skorunu döndür"""
    try:
        health = error_tracker.get_health_score()
        return jsonify({
            'success': True,
            'health_score': health
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/monitoring/cleanup', methods=['POST'])
def cleanup_monitoring_data():
    """Monitoring verilerini temizle"""
    try:
        days = request.json.get('days', 7) if request.json else 7
        
        system_monitor.clear_old_data(days)
        error_tracker.clear_old_errors(days)
        
        return jsonify({
            'success': True,
            'message': f'{days} günden eski monitoring verileri temizlendi'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Paralel işleyiciyi başlat
    parallel_processor.start_background_workers()
    
    # Memory monitoring'i başlat
    memory_manager.start_memory_monitoring(interval=30)
    
    # System monitoring'i başlat
    system_monitor.start_monitoring(interval=15)
    
    print("🧬 DNA Analiz API Sunucusu başlatılıyor...")
    print("🌍 http://localhost:5001 adresinde çalışıyor")
    print("📊 Test: http://localhost:5001/test")
    print("🔬 Analiz: POST http://localhost:5001/analyze")
    print("⚡ Hızlı analiz: POST http://localhost:5001/analyze/fast")
    print("🌊 Streaming analiz: POST http://localhost:5001/analyze/streaming")
    print("📈 Cache istatistikleri: GET http://localhost:5001/cache/stats")
    print("📊 Performans istatistikleri: GET http://localhost:5001/performance/stats")
    print("🧠 Memory istatistikleri: GET http://localhost:5001/memory/stats")
    print("🧹 Memory temizliği: POST http://localhost:5001/memory/cleanup")
    print("🔧 Memory optimizasyonu: POST http://localhost:5001/memory/optimize")
    print("🗄️ Veritabanı istatistikleri: GET http://localhost:5001/database/stats")
    print("🔧 Veritabanı optimizasyonu: POST http://localhost:5001/database/optimize")
    print("🧹 Veritabanı temizliği: POST http://localhost:5001/database/cleanup")
    print("🔍 Varyant arama: GET http://localhost:5001/variants/search")
    print("🏥 Sağlık riskleri: GET http://localhost:5001/variants/health-risks/{id}")
    print("💊 İlaç etkileşimleri: GET http://localhost:5001/variants/drug-interactions/{id}")
    print("⚡ Yüksek etkili varyantlar: GET http://localhost:5001/variants/high-impact")
    print("📊 Monitoring durumu: GET http://localhost:5001/monitoring/status")
    print("📈 Performance raporu: GET http://localhost:5001/monitoring/performance")
    print("🚨 Hata özeti: GET http://localhost:5001/monitoring/errors")
    print("🏥 Sistem sağlığı: GET http://localhost:5001/monitoring/health")
    
    try:
        app.run(host='0.0.0.0', port=5001, debug=True)
    finally:
        # Temizlik
        parallel_processor.stop_background_workers()
        memory_manager.stop_memory_monitoring()
        system_monitor.stop_monitoring()
