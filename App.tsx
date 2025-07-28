import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from './supabaseClient';
import LoginScreen from './components/LoginScreen';
import JokeFeed from './components/JokeFeed';
import { Session } from '@supabase/supabase-js';
import { backgroundJobService } from './services/backgroundJob';

const { height } = Dimensions.get('window');

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure URL linking
    const url = 'com.humorous.app://auth/callback';
    console.log('App URL:', url);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      
      // Start background job when user is authenticated
      if (session?.user) {
        backgroundJobService.start();
      } else {
        backgroundJobService.stop();
      }
      
      setLoading(false);
    });

    // Handle deep linking
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      if (url.includes('auth/callback') || url.includes('access_token')) {
        try {
          const urlObj = new URL(url);
          const access_token = urlObj.searchParams.get('access_token');
          const refresh_token = urlObj.searchParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              console.error('Error setting session from deep link:', error);
            } else {
              console.log('Session set successfully from deep link:', data);
            }
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
        }
      }
    };

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming links
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription?.remove();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading Humorous...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {session ? <JokeFeed /> : <LoginScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
});
