import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { EnhancedText, H1, BodyText } from '../components/EnhancedText';
import { EnhancedCard } from '../components/EnhancedCard';

type OfflineStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OfflineStatus'>;

interface Props {
  navigation: OfflineStatusScreenNavigationProp;
}

export default function OfflineStatusScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <H1 color="#333" style={styles.title}>Offline Durumu</H1>
        <BodyText color="#666" style={styles.subtitle}>
          Çevrimdışı mod ve senkronizasyon
        </BodyText>
        
        <EnhancedCard
          title="Geliştirme Aşamasında"
          description="Bu özellik yakında eklenecek"
          variant="outlined"
          style={styles.card}
        >
          <BodyText color="#666">
            Offline durumu özelliği şu anda geliştirilmektedir.
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