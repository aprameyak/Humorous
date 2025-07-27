import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onAnonymousSignIn: () => Promise<void>;
}

export default function LoginScreen({ onSignIn, onAnonymousSignIn }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      await onAnonymousSignIn();
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Humorous</Text>
          <Text style={styles.subtitle}>Personalized jokes just for you! 😂</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password (optional)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, styles.emailButton]}
              onPress={handleEmailSignIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : 'Sign In with Email'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.anonymousButton]}
              onPress={handleAnonymousSignIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : '🎭 Continue Anonymously'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Continue anonymously to start enjoying personalized jokes immediately!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 50,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  emailButton: {
    backgroundColor: '#FF6B6B',
  },
  anonymousButton: {
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 15,
    fontSize: 14,
  },
  disclaimer: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
}); 