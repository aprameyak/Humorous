import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from './supabaseClient';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import JokeFeed from './components/JokeFeed';
import { Session } from '@supabase/supabase-js';
import { backgroundJobService } from './services/backgroundJob';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeed, setShowFeed] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    // Configure URL linking
    // Reserved for future deep link use if needed
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(false);
      
      // Start/stop background job based on auth state
      if (session) {
        backgroundJobService.start();
      } else {
        backgroundJobService.stop();
      }
    });

    // Handle deep linking
    const handleDeepLink = async (url: string) => {
      if (url.includes('auth/callback') || url.includes('access_token')) {
        try {
          const urlObj = new URL(url);
          const access_token = urlObj.searchParams.get('access_token');
          const refresh_token = urlObj.searchParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              console.error('Error setting session from deep link:', error);
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

  const handleEnterFeed = () => {
    setShowFeed(true);
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
  };

  const handleBackToHome = () => {
    setShowFeed(false);
  };

  let content;
  if (session || guestMode) {
    if (showFeed) {
      content = <JokeFeed onBackToHome={handleBackToHome} />;
    } else {
      content = <HomeScreen onEnterFeed={handleEnterFeed} showDeleteAccount={!!session} />;
    }
  } else {
    content = <LoginScreen onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
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
