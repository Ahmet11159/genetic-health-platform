import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { EnhancedText, H1, BodyText } from '../components/EnhancedText';
import { EnhancedCard } from '../components/EnhancedCard';

type AchievementsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Achievements'>;

interface Props {
  navigation: AchievementsScreenNavigationProp;
}

export default function AchievementsScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <H1 color="#333" style={styles.title}>Başarı Rozetleri</H1>
        <BodyText color="#666" style={styles.subtitle}>
          Sağlık hedeflerinizdeki ilerlemeniz
        </BodyText>
        
        <EnhancedCard
          title="Geliştirme Aşamasında"
          description="Bu özellik yakında eklenecek"
          variant="outlined"
          style={styles.card}
        >
          <BodyText color="#666">
            Başarı rozetleri özelliği şu anda geliştirilmektedir.
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