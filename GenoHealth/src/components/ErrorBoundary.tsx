import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import ProfessionalButton from './ProfessionalButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to analytics or crash reporting service
    this.logError(error, errorInfo);
  }

  logError = (error: Error, errorInfo: any) => {
    // In a real app, you would send this to your crash reporting service
    console.error('Error logged:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportError = () => {
    // In a real app, you would open a bug report form or email
    console.log('User wants to report error:', this.state.error);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.errorContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={64} color={Theme.colors.semantic.error} />
              </View>
              
              <Text style={styles.title}>Bir Hata Oluştu</Text>
              <Text style={styles.subtitle}>
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Hata Detayları:</Text>
                  <Text style={styles.errorMessage}>{this.state.error.message}</Text>
                  {this.state.error.stack && (
                    <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                  )}
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <ProfessionalButton
                  title="Tekrar Dene"
                  onPress={this.handleRetry}
                  variant="primary"
                  size="lg"
                  style={styles.retryButton}
                />
                
                <ProfessionalButton
                  title="Hata Bildir"
                  onPress={this.handleReportError}
                  variant="outline"
                  size="lg"
                  style={styles.reportButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
    marginBottom: Theme.spacing.xl,
  },
  errorDetails: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  errorTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.semantic.error,
    marginBottom: Theme.spacing.sm,
  },
  errorMessage: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: Theme.spacing.sm,
  },
  errorStack: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: Theme.typography.lineHeight.tight * Theme.typography.fontSize.xs,
  },
  buttonContainer: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  retryButton: {
    marginBottom: Theme.spacing.sm,
  },
  reportButton: {
    marginBottom: 0,
  },
});
