import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { supabase } from '../supabaseClient';
import { jokeService } from '../services/jokeService';
import { useSupabase } from '../hooks/useSupabase';

const { height, width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100; // Distance threshold for swipe
const SWIPE_VELOCITY_THRESHOLD = 500; // Velocity threshold for quick swipes

interface Joke {
  id: string;
  text: string;
  style: string;
  timestamp: number;
  source: string;
}

interface JokeFeedProps {
  onBackToHome: () => void;
}

export default function JokeFeed({ onBackToHome }: JokeFeedProps) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollThrottle = 1000; // 1 second between scrolls
  
  // Animation values for each joke
  const swipeAnimations = useRef<Map<string, {
    translateX: Animated.Value;
    translateY: Animated.Value;
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
  }>>(new Map()).current;
  
  const { user } = useSupabase();

  useEffect(() => {
    loadInitialJokes();
  }, []);

  const loadInitialJokes = async () => {
    try {
      setLoading(true);
      const initialJokes = await jokeService.getJokesForFeed(user?.id || 'anonymous', 8);
      setJokes(initialJokes);
    } catch (error) {
      console.error('Error loading jokes:', error);
      Alert.alert('Error', 'Failed to load jokes');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreJokes = useCallback(async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      const moreJokes = await jokeService.getJokesForFeed(user?.id || 'anonymous', 5);
      setJokes(prev => [...prev, ...moreJokes]);
    } catch (error) {
      console.error('Error loading more jokes:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, user?.id]);

  const handleReaction = async (joke: Joke, reaction: 'like' | 'dislike') => {
    if (!user?.id) return;
    
    try {
      // Record reaction
      await jokeService.recordReaction(user.id, joke.id, reaction);
      
      // Auto-scroll to next joke after a short delay
      setTimeout(() => {
        if (currentIndex < jokes.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  };

  const getSwipeAnimation = (jokeId: string) => {
    if (!swipeAnimations.has(jokeId)) {
      swipeAnimations.set(jokeId, {
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
      });
    }
    return swipeAnimations.get(jokeId)!;
  };

  const handleSwipeGesture = useCallback((event: any, joke: Joke) => {
    const { translationX, translationY, velocityX, velocityY, state } = event.nativeEvent;
    const animation = getSwipeAnimation(joke.id);
    
    if (state === State.ACTIVE) {
      // Update position during swipe
      animation.translateX.setValue(translationX);
      animation.translateY.setValue(translationY);
      
      // Calculate rotation based on swipe direction
      const rotationValue = translationX * 0.1; // Rotate based on horizontal movement
      animation.rotation.setValue(rotationValue);
      
      // Scale and opacity based on swipe distance
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      const scaleValue = Math.max(0.8, 1 - distance / 1000);
      const opacityValue = Math.max(0.3, 1 - distance / 800);
      
      animation.scale.setValue(scaleValue);
      animation.opacity.setValue(opacityValue);
      
    } else if (state === State.END) {
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      
      // Determine reaction based on swipe direction
      let reaction: 'like' | 'dislike' | null = null;
      
      if (distance > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
        // Swipe up + right = like
        if (translationY < -50 && translationX > 50) {
          reaction = 'like';
        }
        // Swipe up + left = dislike
        else if (translationY < -50 && translationX < -50) {
          reaction = 'dislike';
        }
      }
      
      if (reaction) {
        handleReaction(joke, reaction);
      }
      
      // Animate back to center or off screen
      Animated.parallel([
        Animated.spring(animation.translateX, {
          toValue: reaction ? (reaction === 'like' ? width : -width) : 0,
          useNativeDriver: true,
        }),
        Animated.spring(animation.translateY, {
          toValue: reaction ? -height : 0,
          useNativeDriver: true,
        }),
        Animated.spring(animation.scale, {
          toValue: reaction ? 0.8 : 1,
          useNativeDriver: true,
        }),
        Animated.spring(animation.opacity, {
          toValue: reaction ? 0 : 1,
          useNativeDriver: true,
        }),
        Animated.spring(animation.rotation, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset values for next swipe
        animation.translateX.setValue(0);
        animation.translateY.setValue(0);
        animation.scale.setValue(1);
        animation.opacity.setValue(1);
        animation.rotation.setValue(0);
      });
    }
  }, [currentIndex, jokes.length, handleReaction]);

  const handleScroll = useCallback((event: any) => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollThrottle) {
      return; // Throttle rapid scrolling
    }
    lastScrollTime.current = now;
    
    const offsetY = event.nativeEvent.contentOffset.y;
    const itemHeight = height;
    const newIndex = Math.round(offsetY / itemHeight);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      
      // Load more jokes when approaching the end
      if (newIndex >= jokes.length - 3) {
        loadMoreJokes();
      }
    }
  }, [currentIndex, jokes.length, loadMoreJokes]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderJoke = ({ item, index }: { item: Joke; index: number }) => {
    const animation = getSwipeAnimation(item.id);
    
    return (
      <View style={styles.jokeContainer}>
        <PanGestureHandler
          onGestureEvent={(event) => handleSwipeGesture(event, item)}
          onHandlerStateChange={(event) => handleSwipeGesture(event, item)}
        >
          <Animated.View
            style={[
              styles.jokeCard,
              {
                transform: [
                  { translateX: animation.translateX },
                  { translateY: animation.translateY },
                  { scale: animation.scale },
                  { rotate: animation.rotation.interpolate({
                    inputRange: [-100, 0, 100],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }) },
                ],
                opacity: animation.opacity,
              },
            ]}
          >
            {/* Swipe feedback overlay */}
            <Animated.View
              style={[
                styles.swipeOverlay,
                {
                  backgroundColor: animation.translateX.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: ['#F44336', 'transparent', '#4CAF50'],
                  }),
                  opacity: animation.translateX.interpolate({
                    inputRange: [-100, 0, 100],
                    outputRange: [0.2, 0, 0.2],
                  }),
                },
              ]}
            />
            
            <Text style={styles.jokeText}>{item.text}</Text>
            <View style={styles.jokeMeta}>
              <Text style={styles.jokeStyle}>{item.style}</Text>
              <Text style={styles.jokeSource}>{item.source}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4285f4" />
        <Text style={styles.footerText}>Loading more jokes...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Loading your joke feed...</Text>
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
      
      <FlatList
        ref={flatListRef}
        data={jokes}
        renderItem={renderJoke}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListFooterComponent={renderFooter}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
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
    fontSize: 16,
    marginTop: 15,
  },
  jokeContainer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  jokeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    minHeight: 300,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  jokeText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '500',
  },
  jokeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  jokeStyle: {
    fontSize: 14,
    color: '#888',
    textTransform: 'capitalize',
  },
  jokeSource: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
}); 