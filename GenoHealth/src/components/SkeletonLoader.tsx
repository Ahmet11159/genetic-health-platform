import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animationType?: 'pulse' | 'wave' | 'shimmer' | 'fade';
  duration?: number;
  colors?: string[];
  children?: React.ReactNode;
}

export default function SkeletonLoader({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 8,
  style,
  animationType = 'shimmer',
  duration = 1500,
  colors = ['#E0E0E0', '#F0F0F0', '#E0E0E0'],
  children
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue, duration]);

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'pulse':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.6, 1, 0.6],
          }),
        };
      case 'wave':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, width],
              }),
            },
          ],
        };
      case 'shimmer':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 100],
              }),
            },
          ],
        };
      case 'fade':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.8, 0.3],
          }),
        };
      default:
        return {};
    }
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    return (
      <View
        style={[
          styles.skeleton,
          {
            width: skeletonWidth,
            height,
            borderRadius,
          },
          style,
        ]}
      >
        {animationType === 'shimmer' && (
          <Animated.View
            style={[
              styles.shimmerOverlay,
              getAnimationStyle(),
            ]}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {animationType === 'shimmer' ? (
        <View
          style={[
            styles.skeleton,
            {
              width: skeletonWidth,
              height,
              borderRadius,
              backgroundColor: colors[0],
            },
            style,
          ]}
        >
          <Animated.View
            style={[
              styles.shimmerOverlay,
              getAnimationStyle(),
            ]}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.skeleton,
            {
              width: skeletonWidth,
              height,
              borderRadius,
              backgroundColor: colors[0],
            },
            style,
            getAnimationStyle(),
          ]}
        />
      )}
    </View>
  );
}

// Özel skeleton bileşenleri
export function SkeletonCard({ style }: { style?: any }) {
  return (
    <View style={[styles.cardContainer, style]}>
      <SkeletonLoader height={200} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="80%" height={20} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 12 }} />
        <View style={styles.cardFooter}>
          <SkeletonLoader width="40%" height={14} />
          <SkeletonLoader width="30%" height={14} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ itemCount = 5, style }: { itemCount?: number; style?: any }) {
  return (
    <View style={[styles.listContainer, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={50} height={50} borderRadius={25} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="70%" height={18} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="50%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonProfile({ style }: { style?: any }) {
  return (
    <View style={[styles.profileContainer, style]}>
      <SkeletonLoader width={100} height={100} borderRadius={50} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="60%" height={24} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="40%" height={16} style={{ marginBottom: 16 }} />
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <SkeletonLoader width={60} height={20} />
          <SkeletonLoader width={40} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={60} height={20} />
          <SkeletonLoader width={40} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={60} height={20} />
          <SkeletonLoader width={40} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonChart({ style }: { style?: any }) {
  return (
    <View style={[styles.chartContainer, style]}>
      <SkeletonLoader width="100%" height={200} borderRadius={12} />
      <View style={styles.chartLabels}>
        <SkeletonLoader width="20%" height={14} />
        <SkeletonLoader width="20%" height={14} />
        <SkeletonLoader width="20%" height={14} />
        <SkeletonLoader width="20%" height={14} />
        <SkeletonLoader width="20%" height={14} />
      </View>
    </View>
  );
}

export function SkeletonDNAAnalysis({ style }: { style?: any }) {
  return (
    <View style={[styles.dnaContainer, style]}>
      <View style={styles.dnaHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={styles.dnaHeaderContent}>
          <SkeletonLoader width="70%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="50%" height={16} />
        </View>
      </View>
      <View style={styles.dnaContent}>
        <SkeletonLoader width="100%" height={120} borderRadius={8} style={{ marginBottom: 16 }} />
        <View style={styles.dnaStats}>
          <View style={styles.dnaStatItem}>
            <SkeletonLoader width={40} height={20} />
            <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.dnaStatItem}>
            <SkeletonLoader width={40} height={20} />
            <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.dnaStatItem}>
            <SkeletonLoader width={40} height={20} />
            <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  profileContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dnaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  dnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dnaHeaderContent: {
    flex: 1,
    marginLeft: 16,
  },
  dnaContent: {
    marginTop: 8,
  },
  dnaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  dnaStatItem: {
    alignItems: 'center',
  },
});


