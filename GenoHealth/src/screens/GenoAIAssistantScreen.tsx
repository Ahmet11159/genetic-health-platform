import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import Theme from '../constants/Theme';
import { GenoraAIService, GenoAIChatMessage } from '../services/GenoraAIService';
import { useNavigationTracking } from '../hooks/useNavigationTracking';

const GenoAIAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, dnaAnalysis } = useApp();
  const [messages, setMessages] = useState<GenoAIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Navigation tracking'i etkinleştir
  useNavigationTracking();

  useEffect(() => {
    // Hoş geldin mesajı
    const welcomeMessage: GenoAIChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Merhaba! Ben Genora AI'yım. 🧬\n\nDNA analiz sonuçlarınıza dayanarak kişiselleştirilmiş sağlık önerileri sunabilirim. Size nasıl yardımcı olabilirim?`,
      timestamp: new Date().toISOString(),
      context: {
        dnaAnalysis,
        currentScreen: 'GenoAIAssistant',
        userProfile: user
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: GenoAIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      context: {
        dnaAnalysis,
        currentScreen: 'GenoAIAssistant',
        userProfile: user
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await GenoraAIService.chatWithGenoAI(
        inputText.trim(),
        {
          dnaAnalysis,
          currentScreen: 'GenoAIAssistant',
          userProfile: user
        }
      );

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Genora AI hatası:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: GenoAIChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.messageIcon}>
            <Ionicons
              name={isUser ? 'person' : 'sparkles'}
              size={20}
              color={isUser ? Theme.colors.primary[500] : Theme.colors.accent.purple}
            />
          </View>
          <Text style={styles.messageRole}>
            {isUser ? 'Siz' : 'Geno AI'}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.assistantMessageText
        ]}>
          {message.content}
        </Text>
      </View>
    );
  };

  const quickActions = [
    {
      title: 'DNA Analizim',
      icon: 'analytics',
      action: () => {
        setInputText('DNA analiz sonuçlarımı göster ve açıkla');
      }
    },
    {
      title: 'Beslenme Önerisi',
      icon: 'nutrition',
      action: () => {
        setInputText('DNA analizime göre beslenme önerilerim neler?');
      }
    },
    {
      title: 'Egzersiz Planı',
      icon: 'fitness',
      action: () => {
        setInputText('Genetik yatkınlığıma göre egzersiz planım nasıl olmalı?');
      }
    },
    {
      title: 'Sağlık Takibi',
      icon: 'medical',
      action: () => {
        setInputText('Sağlık durumumu nasıl takip etmeliyim?');
      }
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={24} color={Theme.colors.accent.purple} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Genora AI</Text>
              <Text style={styles.headerSubtitle}>Kişiselleştirilmiş AI Asistanınız</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={action.action}
            >
              <Ionicons
                name={action.icon as any}
                size={20}
                color={Theme.colors.primary[500]}
              />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  <Ionicons name="sparkles" size={20} color={Theme.colors.accent.purple} />
                </View>
                <Text style={styles.messageRole}>Geno AI</Text>
              </View>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Theme.colors.accent.purple} />
                <Text style={styles.loadingText}>Düşünüyor...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Geno AI'a soru sorun..."
            placeholderTextColor={Theme.colors.text.secondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Theme.colors.white : Theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  backButton: {
    marginRight: Theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.accent.purple + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: '700' as const,
    color: Theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: 2,
  },
  quickActionsContainer: {
    maxHeight: 80,
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  quickActionsContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary[50],
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    marginRight: Theme.spacing.sm,
  },
  quickActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: '600' as const,
    color: Theme.colors.primary[500],
    marginLeft: Theme.spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Theme.spacing.lg,
  },
  messageContainer: {
    marginBottom: Theme.spacing.md,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.xs,
  },
  messageRole: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: '600' as const,
    color: Theme.colors.text.secondary,
    flex: 1,
  },
  messageTime: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },
  messageText: {
    fontSize: Theme.typography.fontSize.base,
    lineHeight: 20,
  },
  userMessageText: {
    color: Theme.colors.white,
    backgroundColor: Theme.colors.primary[500],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderBottomRightRadius: 4,
  },
  assistantMessageText: {
    color: Theme.colors.text.primary,
    backgroundColor: Theme.colors.background.secondary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  textInput: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    maxHeight: 100,
    marginRight: Theme.spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.background.tertiary,
  },
});

export default GenoAIAssistantScreen;
