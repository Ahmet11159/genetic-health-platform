import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { EnhancedText, H1, BodyText } from '../components/EnhancedText';
import { EnhancedCard } from '../components/EnhancedCard';

type AdvancedAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdvancedAnalytics'>;

interface Props {
  navigation: AdvancedAnalyticsScreenNavigationProp;
}

export default function AdvancedAnalyticsScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <H1 color="#333" style={styles.title}>Gelişmiş Analitik</H1>
        <BodyText color="#666" style={styles.subtitle}>
          Detaylı genetik analiz ve raporlar
        </BodyText>
        
        <EnhancedCard
          title="Geliştirme Aşamasında"
          description="Bu özellik yakında eklenecek"
          variant="outlined"
          style={styles.card}
        >
          <BodyText color="#666">
            Gelişmiş analitik özelliği şu anda geliştirilmektedir.
          </BodyText>
        </EnhancedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
});