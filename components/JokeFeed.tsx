import React, { useState, useEffect, useRef } from 'react';
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

  // Use proportional thresholds so behavior is consistent across devices
  const SWIPE_THRESHOLD_FRACTION = 0.10; // 10% of screen height
  const swipeThreshold = height * SWIPE_THRESHOLD_FRACTION;

interface JokeFeedProps {
  readonly onBackToHome: () => void;
  readonly onOpenProfile: () => void;
}

export default function JokeFeed({ onBackToHome, onOpenProfile }: JokeFeedProps) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Simplified animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Handle preloading when joke changes (no animation reset to avoid conflicts)
  useEffect(() => {
    // Preload more jokes when user reaches halfway through current jokes
    const halfwayPoint = Math.floor(jokes.length / 2);
    console.log('JokeFeed: Checking preload. currentIndex=', currentIndex, 'halfwayPoint=', halfwayPoint, 'jokes.length=', jokes.length);
    
    if (currentIndex >= halfwayPoint && !loadingMore && jokes.length >= 4 && currentIndex > 0) {
      console.log('JokeFeed: Reached halfway point, preloading more jokes');
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
    const overlayOpacity = Math.min(Math.abs(translateY.value) / Math.max(height * 0.5, 1), 0.3);
    
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
  const jokesLengthRef = useRef(0);

  useEffect(() => {
    jokesLengthRef.current = jokes.length;
  }, [jokes.length]);

  useEffect(() => {
    console.log('JokeFeed: Joke content check. currentIndex=', currentIndex, 'jokes[currentIndex]=', jokes[currentIndex] ? 'exists' : 'missing');
  }, [jokes, currentIndex]);

  useEffect(() => {
    console.log('JokeFeed: currentIndex=', currentIndex, 'jokesLen=', jokes.length);
  }, [currentIndex, jokes.length]);

  const logGestureEnd = (finalY: number, isAdvancing: boolean) => {
    console.log('JokeFeed: gestureEnd finalY=', finalY, 'isAdvancingRef.current=', isAdvancing);
  };

  const handleGestureEnd = (finalY: number) => {
    console.log('JokeFeed: handleGestureEnd called with finalY=', finalY);
    if (Math.abs(finalY) > swipeThreshold) {
      console.log('JokeFeed: Swipe threshold met, calling advanceSafely');
      advanceSafely();
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only animation, no complex logic
      translateY.value = event.translationY * 0.3;
      opacity.value = 1 - Math.abs(event.translationY) / 400;
    })
    .onEnd((event) => {
      // Reset animation
      translateY.value = withSpring(0);
      opacity.value = withSpring(1);
      
      // Handle gesture logic on JS thread
      runOnJS(handleGestureEnd)(event.translationY);
    });

  const advanceSafely = async () => {
    try {
      console.log('JokeFeed: advanceSafely called; loadingMore=', loadingMore, 'currentIndex=', currentIndex, 'jokes.length=', jokes.length);
      
      // Safety checks
      if (loadingMore) {
        console.log('JokeFeed: Skipping advance - loading more jokes');
        return;
      }
      
      if (jokes.length === 0) {
        console.log('JokeFeed: No jokes available');
        return;
      }
      
      if (!jokes[currentIndex]) {
        console.log('JokeFeed: Current joke missing');
        return;
      }

      const nextIndex = currentIndex + 1;

      // If we're at or beyond the last available joke, try to load more first
      if (nextIndex >= jokes.length) {
        console.log('JokeFeed: Need to load more jokes');
        const more = await loadMoreJokes();
        console.log('JokeFeed: loadMoreJokes returned count=', Array.isArray(more) ? more.length : 'n/a');
        if (!more || more.length === 0) {
          console.log('JokeFeed: No more jokes available');
          return;
        }
      }

      // Safely advance if within bounds
      setCurrentIndex((prev) => {
        const candidate = prev + 1;
        const maxIndex = Math.max(0, jokes.length - 1);
        const newIndex = candidate <= maxIndex ? candidate : prev;
        console.log('JokeFeed: Updating currentIndex from', prev, 'to', newIndex);
        return newIndex;
      });
    } catch (error) {
      console.error('Error in advanceSafely:', error);
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
  
  const currentJoke = jokes[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.profileButton} onPress={onOpenProfile}>
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.jokeContainer}>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.jokeCard, animatedStyle]}>
            <View style={styles.jokeContent}>
              {currentJoke ? (
                <Text style={styles.jokeText}>{currentJoke.text}</Text>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6B6B" />
                  <Text style={styles.loadingText}>Loading more jokes...</Text>
                </View>
              )}
            </View>
            <Animated.View style={[styles.swipeOverlay, swipeOverlayStyle]} />
          </Animated.View>
        </GestureDetector>
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  profileIconText: {
    fontSize: 20,
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