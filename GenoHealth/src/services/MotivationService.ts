// Motivasyon ve başarı rozetleri servisi
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'dna' | 'nutrition' | 'exercise' | 'sleep' | 'health' | 'streak';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface DailyMotivation {
  id: string;
  message: string;
  category: 'genetic' | 'health' | 'lifestyle' | 'achievement';
  geneticBasis?: string;
  emoji: string;
  date: Date;
}

export interface UserStats {
  totalPoints: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  level: number;
  nextLevelPoints: number;
}

export class MotivationService {
  private static achievements: Achievement[] = [];
  private static dailyMotivations: DailyMotivation[] = [];
  private static userStats: UserStats = {
    totalPoints: 0,
    achievementsUnlocked: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    level: 1,
    nextLevelPoints: 100
  };

  /**
   * Motivasyon servisini başlatır
   */
  static initialize(): void {
    this.initializeAchievements();
    this.generateDailyMotivation();
  }

  /**
   * Başarı rozetlerini oluşturur
   */
  private static initializeAchievements(): void {
    this.achievements = [
      // DNA Analizi Rozetleri
      {
        id: 'dna_first_upload',
        title: '🧬 DNA Keşfi',
        description: 'İlk DNA dosyanızı yüklediniz!',
        icon: 'dna',
        color: '#4CAF50',
        category: 'dna',
        unlockedAt: new Date(),
        rarity: 'common',
        points: 50
      },
      {
        id: 'dna_analysis_complete',
        title: '🔬 Genetik Uzmanı',
        description: 'DNA analizinizi tamamladınız!',
        icon: 'flask',
        color: '#2196F3',
        category: 'dna',
        unlockedAt: new Date(),
        rarity: 'rare',
        points: 100
      },
      
      // Beslenme Rozetleri
      {
        id: 'nutrition_week_complete',
        title: '🥗 Beslenme Ustası',
        description: '1 hafta beslenme planını takip ettiniz!',
        icon: 'nutrition',
        color: '#FF9800',
        category: 'nutrition',
        unlockedAt: new Date(),
        rarity: 'common',
        points: 75
      },
      {
        id: 'nutrition_month_complete',
        title: '🍎 Sağlık Gurusu',
        description: '1 ay beslenme planını takip ettiniz!',
        icon: 'leaf',
        color: '#4CAF50',
        category: 'nutrition',
        unlockedAt: new Date(),
        rarity: 'epic',
        points: 200
      },
      
      // Egzersiz Rozetleri
      {
        id: 'exercise_week_complete',
        title: '💪 Antrenman Şampiyonu',
        description: '1 hafta egzersiz planını tamamladınız!',
        icon: 'fitness',
        color: '#F44336',
        category: 'exercise',
        unlockedAt: new Date(),
        rarity: 'common',
        points: 75
      },
      {
        id: 'exercise_month_complete',
        title: '🏆 Fitness Efsanesi',
        description: '1 ay egzersiz planını tamamladınız!',
        icon: 'trophy',
        color: '#FFD700',
        category: 'exercise',
        unlockedAt: new Date(),
        rarity: 'legendary',
        points: 300
      },
      
      // Uyku Rozetleri
      {
        id: 'sleep_week_complete',
        title: '😴 Uyku Ustası',
        description: '1 hafta uyku planını takip ettiniz!',
        icon: 'moon',
        color: '#9C27B0',
        category: 'sleep',
        unlockedAt: new Date(),
        rarity: 'common',
        points: 75
      },
      
      // Streak Rozetleri
      {
        id: 'streak_7_days',
        title: '🔥 7 Günlük Seri',
        description: '7 gün üst üste uygulamayı kullandınız!',
        icon: 'flame',
        color: '#FF5722',
        category: 'streak',
        unlockedAt: new Date(),
        rarity: 'rare',
        points: 100
      },
      {
        id: 'streak_30_days',
        title: '⭐ 30 Günlük Efsane',
        description: '30 gün üst üste uygulamayı kullandınız!',
        icon: 'star',
        color: '#FFD700',
        category: 'streak',
        unlockedAt: new Date(),
        rarity: 'legendary',
        points: 500
      },
      
      // Sağlık Rozetleri
      {
        id: 'health_goal_complete',
        title: '🎯 Hedef Avcısı',
        description: 'İlk sağlık hedefinizi tamamladınız!',
        icon: 'target',
        color: '#4CAF50',
        category: 'health',
        unlockedAt: new Date(),
        rarity: 'common',
        points: 50
      },
      {
        id: 'all_goals_complete',
        title: '👑 Sağlık Kralı',
        description: 'Tüm sağlık hedeflerinizi tamamladınız!',
        icon: 'crown',
        color: '#FFD700',
        category: 'health',
        unlockedAt: new Date(),
        rarity: 'legendary',
        points: 400
      }
    ];
  }

  /**
   * Günlük motivasyon mesajı oluşturur
   */
  private static generateDailyMotivation(): void {
    const motivations = [
      // Genetik Motivasyonlar
      {
        message: "DNA'nızın sırlarını keşfetmeye devam edin! Her gün yeni bir şey öğreniyorsunuz. 🧬",
        category: 'genetic' as const,
        geneticBasis: 'Genetik potansiyelinizi ortaya çıkarın',
        emoji: '🧬'
      },
      {
        message: "Genetik profiliniz size özel rehberlik ediyor. Bu benzersizliğinizi kutlayın! ✨",
        category: 'genetic' as const,
        geneticBasis: 'Kişiselleştirilmiş sağlık yolculuğu',
        emoji: '✨'
      },
      
      // Sağlık Motivasyonlar
      {
        message: "Bugün sağlığınız için bir adım daha atın. Her küçük adım büyük değişimlere yol açar! 💪",
        category: 'health' as const,
        emoji: '💪'
      },
      {
        message: "Vücudunuz size teşekkür ediyor! Genetik ihtiyaçlarınızı karşıladığınız için harikasınız! 🌟",
        category: 'health' as const,
        emoji: '🌟'
      },
      
      // Yaşam Tarzı Motivasyonlar
      {
        message: "Genetik kodunuz size en uygun yaşam tarzını gösteriyor. Bu rehberliği takip edin! 🎯",
        category: 'lifestyle' as const,
        emoji: '🎯'
      },
      {
        message: "Her gün DNA'nızla daha uyumlu hale geliyorsunuz. Bu yolculukta yalnız değilsiniz! 🤝",
        category: 'lifestyle' as const,
        emoji: '🤝'
      },
      
      // Başarı Motivasyonlar
      {
        message: "Harika iş çıkarıyorsunuz! Genetik sağlık yolculuğunuzda ilerlemeye devam edin! 🚀",
        category: 'achievement' as const,
        emoji: '🚀'
      },
      {
        message: "Başarılarınız genetik potansiyelinizi ortaya çıkarıyor. Devam edin! 🏆",
        category: 'achievement' as const,
        emoji: '🏆'
      }
    ];

    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    
    this.dailyMotivations = [{
      id: `motivation_${Date.now()}`,
      message: randomMotivation.message,
      category: randomMotivation.category,
      geneticBasis: randomMotivation.geneticBasis,
      emoji: randomMotivation.emoji,
      date: new Date()
    }];
  }

  /**
   * Başarı rozeti kazanır
   */
  static unlockAchievement(achievementId: string): Achievement | null {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.unlockedAt = new Date();
      this.userStats.totalPoints += achievement.points;
      this.userStats.achievementsUnlocked++;
      this.updateLevel();
      return achievement;
    }
    return null;
  }

  /**
   * Kullanıcı seviyesini günceller
   */
  private static updateLevel(): void {
    const pointsPerLevel = 100;
    const newLevel = Math.floor(this.userStats.totalPoints / pointsPerLevel) + 1;
    
    if (newLevel > this.userStats.level) {
      this.userStats.level = newLevel;
      this.userStats.nextLevelPoints = newLevel * pointsPerLevel;
    }
  }

  /**
   * Streak günceller
   */
  static updateStreak(): void {
    this.userStats.currentStreak++;
    this.userStats.totalDaysActive++;
    
    if (this.userStats.currentStreak > this.userStats.longestStreak) {
      this.userStats.longestStreak = this.userStats.currentStreak;
    }

    // Streak rozetlerini kontrol et
    if (this.userStats.currentStreak === 7) {
      this.unlockAchievement('streak_7_days');
    } else if (this.userStats.currentStreak === 30) {
      this.unlockAchievement('streak_30_days');
    }
  }

  /**
   * Streak sıfırlar
   */
  static resetStreak(): void {
    this.userStats.currentStreak = 0;
  }

  /**
   * Tüm başarı rozetlerini getirir
   */
  static getAchievements(): Achievement[] {
    return this.achievements;
  }

  /**
   * Kazanılan başarı rozetlerini getirir
   */
  static getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlockedAt);
  }

  /**
   * Günlük motivasyon mesajını getirir
   */
  static getDailyMotivation(): DailyMotivation | null {
    return this.dailyMotivations[0] || null;
  }

  /**
   * Kullanıcı istatistiklerini getirir
   */
  static getUserStats(): UserStats {
    return { ...this.userStats };
  }

  /**
   * Kategoriye göre başarı rozetlerini getirir
   */
  static getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Nadirliğe göre başarı rozetlerini getirir
   */
  static getAchievementsByRarity(rarity: string): Achievement[] {
    return this.achievements.filter(a => a.rarity === rarity);
  }

  /**
   * En yüksek puanlı başarı rozetlerini getirir
   */
  static getTopAchievements(limit: number = 5): Achievement[] {
    return this.achievements
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  /**
   * Motivasyon mesajı oluşturur
   */
  static generateMotivationalMessage(achievement: Achievement): string {
    const messages = {
      common: [
        "Harika! Yeni bir rozet kazandınız! 🎉",
        "Tebrikler! Başarılarınız devam ediyor! 👏",
        "Mükemmel! Bu rozet sizin! 🏅"
      ],
      rare: [
        "Wow! Nadir bir rozet kazandınız! ⭐",
        "İnanılmaz! Bu gerçekten özel! 🌟",
        "Harika iş! Nadir başarı! 💎"
      ],
      epic: [
        "Efsanevi! Epik bir başarı! 🔥",
        "Muhteşem! Bu gerçekten büyük! 🚀",
        "Harika! Epik rozet sizin! ⚡"
      ],
      legendary: [
        "LEGENDARY! Efsanevi başarı! 👑",
        "İnanılmaz! Bu gerçekten efsanevi! 🏆",
        "Muhteşem! Efsanevi rozet kazandınız! ✨"
      ]
    };

    const categoryMessages = messages[achievement.rarity] || messages.common;
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }
}


