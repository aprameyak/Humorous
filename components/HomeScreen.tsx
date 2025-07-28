import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { supabase } from '../supabaseClient';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onEnterFeed: () => void;
}

export default function HomeScreen({ onEnterFeed }: HomeScreenProps) {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEnterFeedPress = () => {
    console.log('Enter feed button pressed');
    onEnterFeed();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Humorous</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.content} onPress={handleEnterFeedPress} activeOpacity={0.9}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Humorous!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your daily dose of laughter, one swipe at a time
          </Text>
        </View>

        <View style={styles.gestureSection}>
          <Text style={styles.sectionTitle}>How to React</Text>
          
          <View style={styles.gestureCard}>
            <View style={styles.gestureInfo}>
              <Text style={styles.gestureTitle}>Swipe Up + Right</Text>
              <Text style={styles.gestureDescription}>Like the joke</Text>
            </View>
          </View>

          <View style={styles.gestureCard}>
            <View style={styles.gestureInfo}>
              <Text style={styles.gestureTitle}>Swipe Up + Left</Text>
              <Text style={styles.gestureDescription}>Dislike the joke</Text>
            </View>
          </View>

          <View style={styles.gestureCard}>
            <View style={styles.gestureInfo}>
              <Text style={styles.gestureTitle}>Swipe Up/Down</Text>
              <Text style={styles.gestureDescription}>Scroll through jokes</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap anywhere to enter your feed</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  gestureSection: {
    marginBottom: 40,
  },
  gestureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  gestureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gestureText: {
    fontSize: 24,
  },
  gestureInfo: {
    flex: 1,
  },
  gestureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  gestureDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  enterButton: {
    backgroundColor: '#4285f4',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  enterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  tapHint: {
    alignItems: 'center',
    marginTop: 20,
  },
  tapHintText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
}); 