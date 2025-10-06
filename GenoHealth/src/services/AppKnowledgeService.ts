/**
 * Uygulama Bilgi Servisi
 * Gemini AI'ın uygulama içeriğini tanıması için
 */

export interface AppScreen {
  name: string;
  title: string;
  description: string;
  features: string[];
  content: string;
  navigation: string;
}

export interface AppFeature {
  name: string;
  description: string;
  screens: string[];
  benefits: string[];
}

export class AppKnowledgeService {
  private static appScreens: AppScreen[] = [
    {
      name: 'HomeScreen',
      title: 'Ana Sayfa',
      description: 'GenoHealth uygulamasının ana dashboard ekranı',
      features: [
        'DNA Analizi başlatma',
        'Hızlı erişim butonları',
        'Son analiz sonuçları',
        'Geno AI Assistant erişimi'
      ],
      content: 'Ana sayfa, kullanıcıların DNA analizi başlatabileceği, son sonuçları görüntüleyebileceği ve tüm uygulama özelliklerine hızlı erişim sağlayabileceği merkezi hub\'dır.',
      navigation: 'Ana ekran - tüm özelliklere erişim noktası'
    },
    {
      name: 'DNAUploadScreen',
      title: 'DNA Yükleme',
      description: '23andMe ve diğer DNA test sonuçlarını yükleme ekranı',
      features: [
        '23andMe dosya yükleme',
        'VCF format desteği',
        'Dosya doğrulama',
        'Analiz başlatma'
      ],
      content: 'Bu ekranda kullanıcılar 23andMe, AncestryDNA veya diğer DNA test sonuçlarını yükleyebilir. Desteklenen formatlar: 23andMe (.txt), VCF (.vcf). Dosya yüklendikten sonra gerçek bilimsel veritabanları kullanılarak analiz başlatılır.',
      navigation: 'DNA Yükle → Analiz başlat'
    },
    {
      name: 'AnalysisScreen',
      title: 'DNA Analiz Sonuçları',
      description: 'Detaylı DNA analiz sonuçlarının görüntülendiği ekran',
      features: [
        'Genetik varyantlar',
        'Sağlık riskleri',
        'Beslenme önerileri',
        'Egzersiz planları',
        'İlaç etkileşimleri',
        'Popülasyon analizi'
      ],
      content: 'DNA analiz sonuçları bu ekranda detaylı olarak gösterilir. Genetik varyantlar, sağlık riskleri, beslenme önerileri, egzersiz planları ve ilaç etkileşimleri gibi kişiselleştirilmiş bilgiler sunulur. Tüm veriler gerçek bilimsel veritabanlarından (ClinVar, PharmGKB, GWAS Catalog) alınır.',
      navigation: 'Analiz → Sonuçları görüntüle'
    },
    {
      name: 'NutritionScreen',
      title: 'Beslenme Önerileri',
      description: 'DNA analizine dayalı kişiselleştirilmiş beslenme önerileri',
      features: [
        'Genetik beslenme analizi',
        'Vitamin ve mineral önerileri',
        'Gıda intoleransları',
        'Metabolizma analizi',
        'Kişiselleştirilmiş diyet planı'
      ],
      content: 'DNA analizinize göre kişiselleştirilmiş beslenme önerileri sunar. Hangi vitaminleri daha fazla almanız gerektiği, hangi gıdalardan kaçınmanız gerektiği ve metabolizmanıza uygun beslenme planı önerileri içerir.',
      navigation: 'Beslenme → Kişiselleştirilmiş öneriler'
    },
    {
      name: 'ExerciseScreen',
      title: 'Egzersiz Planları',
      description: 'Genetik yatkınlığa göre egzersiz önerileri',
      features: [
        'Kas tipi analizi',
        'Dayanıklılık potansiyeli',
        'Yaralanma riski',
        'Optimal egzersiz türleri',
        'Antrenman planları'
      ],
      content: 'Genetik yapınıza göre hangi egzersiz türlerinin sizin için daha etkili olacağını, yaralanma risklerinizi ve optimal antrenman planlarınızı gösterir.',
      navigation: 'Egzersiz → Kişiselleştirilmiş planlar'
    },
    {
      name: 'HealthMonitoringScreen',
      title: 'Sağlık Takibi',
      description: 'Genetik risklere dayalı sağlık takip sistemi',
      features: [
        'Sağlık riskleri takibi',
        'Erken uyarı sistemi',
        'Doktor önerileri',
        'Test takvimi',
        'Sağlık hedefleri'
      ],
      content: 'DNA analizinizde tespit edilen sağlık risklerinizi takip eder, hangi testleri ne sıklıkla yaptırmanız gerektiğini söyler ve sağlık hedeflerinizi belirlemenize yardımcı olur.',
      navigation: 'Sağlık → Risk takibi'
    },
    {
      name: 'GenoAIAssistantScreen',
      title: 'Geno AI Assistant',
      description: 'Kişiselleştirilmiş AI asistanı',
      features: [
        'DNA analizi hakkında sorular',
        'Beslenme danışmanlığı',
        'Egzersiz önerileri',
        'Sağlık soruları',
        'Uygulama rehberliği'
      ],
      content: 'Size özel AI asistanınız. DNA analiz sonuçlarınız, beslenme, egzersiz ve sağlık konularında sorularınızı yanıtlar. Uygulamanın tüm özellikleri hakkında bilgi verebilir.',
      navigation: 'AI Assistant → Sohbet et'
    }
  ];

  private static appFeatures: AppFeature[] = [
    {
      name: 'DNA Analizi',
      description: '23andMe seviyesinde profesyonel DNA analizi',
      screens: ['DNAUploadScreen', 'AnalysisScreen'],
      benefits: [
        '600,000+ genetik varyant analizi',
        'Gerçek bilimsel veritabanları',
        'Klinik doğrulama',
        'Kişiselleştirilmiş raporlar'
      ]
    },
    {
      name: 'Beslenme Önerileri',
      description: 'Genetik yapıya göre beslenme danışmanlığı',
      screens: ['NutritionScreen', 'AnalysisScreen'],
      benefits: [
        'Vitamin ve mineral analizi',
        'Gıda intolerans tespiti',
        'Metabolizma optimizasyonu',
        'Kişiselleştirilmiş diyet planı'
      ]
    },
    {
      name: 'Egzersiz Planları',
      description: 'Genetik yatkınlığa göre fitness önerileri',
      screens: ['ExerciseScreen', 'AnalysisScreen'],
      benefits: [
        'Kas tipi analizi',
        'Yaralanma riski değerlendirmesi',
        'Optimal antrenman türleri',
        'Performans optimizasyonu'
      ]
    },
    {
      name: 'Sağlık Takibi',
      description: 'Genetik risklere dayalı sağlık monitoring',
      screens: ['HealthMonitoringScreen', 'AnalysisScreen'],
      benefits: [
        'Erken uyarı sistemi',
        'Test takvimi',
        'Doktor önerileri',
        'Sağlık hedefleri'
      ]
    },
    {
      name: 'AI Assistant',
      description: 'Kişiselleştirilmiş yapay zeka asistanı',
      screens: ['GenoAIAssistantScreen'],
      benefits: [
        '7/24 danışmanlık',
        'Kişiselleştirilmiş öneriler',
        'Uygulama rehberliği',
        'Sohbet desteği'
      ]
    }
  ];

  /**
   * Uygulama hakkında genel bilgi
   */
  static getAppOverview(): string {
    return `
GenoHealth - Kişiselleştirilmiş Sağlık Uygulaması

GenoHealth, DNA analizi temelinde kişiselleştirilmiş sağlık önerileri sunan kapsamlı bir mobil uygulamadır.

ANA ÖZELLİKLER:
• DNA Analizi: 23andMe seviyesinde profesyonel genetik analiz
• Beslenme Danışmanlığı: Genetik yapıya göre beslenme önerileri
• Egzersiz Planları: Kişiselleştirilmiş fitness rehberliği
• Sağlık Takibi: Genetik risklere dayalı monitoring
• AI Assistant: 7/24 kişiselleştirilmiş danışmanlık

TEKNİK ÖZELLİKLER:
• 600,000+ genetik varyant analizi
• Gerçek bilimsel veritabanları (ClinVar, PharmGKB, GWAS)
• Google Gemini AI entegrasyonu
• React Native tabanlı mobil uygulama
• Python Flask API backend

HEDEF KİTLE:
• Sağlık bilincine sahip bireyler
• DNA test sonuçlarını anlamak isteyenler
• Kişiselleştirilmiş sağlık önerileri arayanlar
• Fitness ve beslenme optimizasyonu isteyenler
    `.trim();
  }

  /**
   * Belirli bir ekran hakkında bilgi al
   */
  static getScreenInfo(screenName: string): AppScreen | null {
    return this.appScreens.find(screen => 
      screen.name.toLowerCase() === screenName.toLowerCase() ||
      screen.title.toLowerCase() === screenName.toLowerCase()
    ) || null;
  }

  /**
   * Belirli bir özellik hakkında bilgi al
   */
  static getFeatureInfo(featureName: string): AppFeature | null {
    return this.appFeatures.find(feature => 
      feature.name.toLowerCase() === featureName.toLowerCase()
    ) || null;
  }

  /**
   * Tüm ekranları listele
   */
  static getAllScreens(): AppScreen[] {
    return this.appScreens;
  }

  /**
   * Tüm özellikleri listele
   */
  static getAllFeatures(): AppFeature[] {
    return this.appFeatures;
  }

  /**
   * Arama yap
   */
  static search(query: string): { screens: AppScreen[], features: AppFeature[] } {
    const lowerQuery = query.toLowerCase();
    
    const matchingScreens = this.appScreens.filter(screen => 
      screen.name.toLowerCase().includes(lowerQuery) ||
      screen.title.toLowerCase().includes(lowerQuery) ||
      screen.description.toLowerCase().includes(lowerQuery) ||
      screen.content.toLowerCase().includes(lowerQuery) ||
      screen.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    );

    const matchingFeatures = this.appFeatures.filter(feature => 
      feature.name.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery) ||
      feature.benefits.some(benefit => benefit.toLowerCase().includes(lowerQuery))
    );

    return { screens: matchingScreens, features: matchingFeatures };
  }

  /**
   * Gemini AI için uygulama context'i oluştur
   */
  static buildAppContext(): string {
    const overview = this.getAppOverview();
    const screens = this.appScreens.map(screen => 
      `\n${screen.title} (${screen.name}): ${screen.description}\nÖzellikler: ${screen.features.join(', ')}\nİçerik: ${screen.content}`
    ).join('\n');
    
    const features = this.appFeatures.map(feature => 
      `\n${feature.name}: ${feature.description}\nFaydalar: ${feature.benefits.join(', ')}`
    ).join('\n');

    return `
${overview}

UYGULAMA EKRANLARI:
${screens}

UYGULAMA ÖZELLİKLERİ:
${features}

KULLANIM TALİMATLARI:
• Kullanıcılar "Beslenme ekranında ne var?" gibi sorular sorabilir
• "DNA analizi nasıl çalışır?" gibi teknik sorular yanıtlanabilir
• "Hangi özellikler mevcut?" gibi genel sorular yanıtlanabilir
• Uygulama navigasyonu hakkında rehberlik sağlanabilir
    `.trim();
  }
}
