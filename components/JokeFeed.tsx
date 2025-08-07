import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { jokeService, Joke } from '../services/jokeService';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

  const SWIPE_THRESHOLD = 50; // More lenient
  const SWIPE_VELOCITY_THRESHOLD = 200; // More lenient

interface JokeFeedProps {
  readonly onBackToHome: () => void;
}

export default function JokeFeed({ onBackToHome }: JokeFeedProps) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Simplified animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Handle preloading when joke changes (no animation reset to avoid conflicts)
  useEffect(() => {
    // Preload more jokes when user is getting close to the end
    if (currentIndex >= jokes.length - 3 && !loadingMore && jokes.length > 5 && currentIndex > 0) {
      loadMoreJokes();
    }
  }, [currentIndex]);

  // Simplified animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const swipeOverlayStyle = useAnimatedStyle(() => {
    const backgroundColor = translateY.value < 0 ? '#4CAF50' : '#F44336';
    const overlayOpacity = Math.min(Math.abs(translateY.value) / 200, 0.3);
    
    return {
      backgroundColor,
      opacity: overlayOpacity,
    };
  });

  useEffect(() => {
    loadInitialJokes();
  }, []);

  const loadInitialJokes = async () => {
    try {
      setLoading(true);
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      const initialJokes = await jokeService.getJokesForFeed(userId, 8);
      
      // If we don't have enough jokes, try to load more
      if (initialJokes.length < 5) {
        const moreJokes = await jokeService.getJokesForFeed(userId, 8);
        const allJokes = [...initialJokes, ...moreJokes];
        setJokes(allJokes);
      } else {
        setJokes(initialJokes);
      }
    } catch (error) {
      console.error('JokeFeed: Error loading jokes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreJokes = async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      const moreJokes = await jokeService.getJokesForFeed(userId, 5);
      setJokes(prev => {
        const newJokes = [...prev, ...moreJokes];
        return newJokes;
      });
      return moreJokes; // Return the loaded jokes
    } catch (error) {
      console.error('Error loading more jokes:', error);
      return [];
    } finally {
      setLoadingMore(false);
    }
  };

  // Store last translation for mouse gesture detection
  const lastTranslation = useRef({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationY } = event;
      
      // Update visual feedback
      translateY.value = translationY * 0.3;
      opacity.value = 1 - Math.abs(translationY) / 400;
      
      // Store translation for mouse gesture detection
      lastTranslation.current = { x: event.translationX, y: translationY };
      
      // For mouse input, detect reaction during ACTIVE state if gesture is big enough
      if (Math.abs(translationY) > 100) {
        runOnJS(handleNextJoke)();
        
        // Reset immediately
        translateY.value = 0;
        opacity.value = 1;
      }
    })
    .onEnd((event) => {
      let reaction: 'next' | null = null;
      
      // Use stored translation for detection
      const finalY = event.translationY || lastTranslation.current.y;
      
      if (Math.abs(finalY) > 60) {
        reaction = 'next';
      }
      
      if (reaction) {
        runOnJS(handleNextJoke)();
      }
      
      // Reset animation
      translateY.value = withSpring(0);
      opacity.value = withSpring(1);
      lastTranslation.current = { x: 0, y: 0 };
    });

  const handleNextJoke = () => {
    try {
      // Move to next joke without recording reaction
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // If we're approaching the end, load more jokes in background
      if (nextIndex >= jokes.length - 2 && !loadingMore) {
        loadMoreJokes();
      }
    } catch (error) {
      console.error('Error in handleNextJoke:', error);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading jokes...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.jokeContainer}>
        {jokes[currentIndex] ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.jokeCard, animatedStyle]}>
              <View style={styles.jokeContent}>
                <Text style={styles.jokeText}>{jokes[currentIndex].text}</Text>
              </View>
              
              <Animated.View style={[styles.swipeOverlay, swipeOverlayStyle]} />
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading more jokes...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  jokeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
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
  jokeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    margin: 20,
    padding: 30,
    minHeight: 300,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  jokeContent: {
    zIndex: 1,
  },
  jokeText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 0,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 10,
  },
  nextJokeLoading: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(42, 42, 42, 0.9)',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextJokeLoadingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
}); 