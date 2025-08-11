import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onContinueAsGuest?: () => void;
}

export default function LoginScreen({ onContinueAsGuest }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign In Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign Up Error', error.message);
      } else {
        Alert.alert(
          'Success', 
          'Please check your email for verification link (you can skip this for now and sign in directly)',
          [
            {
              text: 'OK',
              onPress: () => setIsSignUp(false)
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Humorous</Text>
          <Text style={styles.subtitle}>Your Personalized Joke Feed</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp 
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>
            {onContinueAsGuest && (
              <TouchableOpacity
                style={styles.guestButton}
                onPress={onContinueAsGuest}
                disabled={loading}
              >
                <Text style={styles.guestButtonText}>Continue without an account</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButtonText: {
    color: '#4285f4',
    fontSize: 14,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestButtonText: {
    color: '#bbb',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
