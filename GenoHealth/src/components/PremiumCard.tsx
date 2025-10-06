import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PremiumCardProps {
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  onPress: () => void;
  isActive?: boolean;
  confidence?: number;
  riskLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  features?: string[];
  price?: string;
  isPremium?: boolean;
}

const { width } = Dimensions.get('window');

export default function PremiumCard({
  title,
  subtitle,
  icon,
  gradient,
  onPress,
  isActive = false,
  confidence,
  riskLevel,
  features = [],
  price,
  isPremium = false
}: PremiumCardProps) {
  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#F44336';
      case 'very_high': return '#D32F2F';
      default: return '#9E9E9E';
    }
  };

  const getRiskText = (level?: string) => {
    switch (level) {
      case 'low': return 'Düşük Risk';
      case 'moderate': return 'Orta Risk';
      case 'high': return 'Yüksek Risk';
      case 'very_high': return 'Çok Yüksek Risk';
      default: return 'Normal';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Premium Badge */}
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {confidence && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>%{confidence}</Text>
              <Text style={styles.confidenceLabel}>Güvenilirlik</Text>
            </View>
          )}
        </View>

        {/* Risk Level */}
        {riskLevel && (
          <View style={styles.riskContainer}>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskLevel) }]}>
              <Text style={styles.riskText}>{getRiskText(riskLevel)}</Text>
            </View>
          </View>
        )}

        {/* Features */}
        {features.length > 0 && (
          <View style={styles.featuresContainer}>
            {features.slice(0, 3).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            {features.length > 3 && (
              <Text style={styles.moreFeatures}>+{features.length - 3} daha</Text>
            )}
          </View>
        )}

        {/* Price */}
        {price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>
              {isActive ? 'Aktif' : 'Seç'}
            </Text>
            <Ionicons 
              name={isActive ? "checkmark-circle" : "arrow-forward"} 
              size={16} 
              color="#fff" 
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  activeContainer: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 160,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  confidenceLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  riskContainer: {
    marginBottom: 12,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  moreFeatures: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});


