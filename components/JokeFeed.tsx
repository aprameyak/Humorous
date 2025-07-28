import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { supabase } from '../supabaseClient';
import { jokeService, Joke } from '../services/jokeService';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface JokeFeedProps {
  onBackToHome: () => void;
}

export default function JokeFeed({ onBackToHome }: JokeFeedProps) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values for swipe gestures
  const swipeAnimations = new Map<string, {
    translateX: Animated.SharedValue<number>;
    translateY: Animated.SharedValue<number>;
    scale: Animated.SharedValue<number>;
    opacity: Animated.SharedValue<number>;
    rotation: Animated.SharedValue<number>;
  }>();

  useEffect(() => {
    loadInitialJokes();
  }, []);

  const loadInitialJokes = async () => {
    try {
      setLoading(true);
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      const initialJokes = await jokeService.getJokesForFeed(userId, 8);
      setJokes(initialJokes);
    } catch (error) {
      console.error('Error loading jokes:', error);
      Alert.alert('Error', 'Failed to load jokes');
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
      setJokes(prev => [...prev, ...moreJokes]);
    } catch (error) {
      console.error('Error loading more jokes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const getSwipeAnimation = (jokeId: string) => {
    if (!swipeAnimations.has(jokeId)) {
      swipeAnimations.set(jokeId, {
        translateX: useSharedValue(0),
        translateY: useSharedValue(0),
        scale: useSharedValue(1),
        opacity: useSharedValue(1),
        rotation: useSharedValue(0),
      });
    }
    return swipeAnimations.get(jokeId)!;
  };

  const handleSwipeGesture = (jokeId: string, joke: Joke) => {
    const animation = getSwipeAnimation(jokeId);
    
    return (event: any) => {
      const { translationX, translationY, velocityX, velocityY, state } = event.nativeEvent;
      
      if (state === State.ACTIVE) {
        // Update animation values during swipe
        animation.translateX.value = translationX;
        animation.translateY.value = translationY;
        animation.scale.value = withSpring(0.95);
        animation.opacity.value = withSpring(0.8);
        animation.rotation.value = translationX * 0.1;
      } else if (state === State.END) {
        const distance = Math.sqrt(translationX * translationX + translationY * translationY);
        const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        let reaction: 'like' | 'dislike' | null = null;
        
        // Determine reaction based on swipe direction and distance
        if (distance > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
          if (translationY < -50 && translationX > 50) {
            reaction = 'like';
          } else if (translationY < -50 && translationX < -50) {
            reaction = 'dislike';
          }
        }
        
        if (reaction) {
          // Animate card off screen
          animation.translateX.value = withTiming(reaction === 'like' ? 500 : -500);
          animation.translateY.value = withTiming(-200);
          animation.opacity.value = withTiming(0);
          animation.scale.value = withTiming(0.8);
          
          // Handle reaction
          runOnJS(handleReaction)(joke, reaction);
          
          // Reset animation values after animation completes
          setTimeout(() => {
            animation.translateX.value = 0;
            animation.translateY.value = 0;
            animation.scale.value = 1;
            animation.opacity.value = 1;
            animation.rotation.value = 0;
          }, 300);
        } else {
          // Spring back to center
          animation.translateX.value = withSpring(0);
          animation.translateY.value = withSpring(0);
          animation.scale.value = withSpring(1);
          animation.opacity.value = withSpring(1);
          animation.rotation.value = withSpring(0);
        }
      }
    };
  };

  const handleReaction = async (joke: Joke, reaction: 'like' | 'dislike') => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      await jokeService.recordReaction(userId, joke.id, reaction);
      
      // Move to next joke
      setTimeout(() => {
        if (currentIndex < jokes.length - 1) {
          setCurrentIndex(prev => prev + 1);
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        } else {
          // Load more jokes if we're at the end
          loadMoreJokes();
        }
      }, 100);
    } catch (error) {
      console.error('Error recording reaction:', error);
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

  const renderJoke = ({ item, index }: { item: Joke; index: number }) => {
    const animation = getSwipeAnimation(item.id);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: animation.translateX.value },
          { translateY: animation.translateY.value },
          { scale: animation.scale.value },
          { rotate: `${animation.rotation.value}deg` },
        ],
        opacity: animation.opacity.value,
      };
    });

    const swipeOverlayStyle = useAnimatedStyle(() => {
      const backgroundColor = animation.translateX.value > 0 ? '#4CAF50' : '#F44336';
      const opacity = Math.min(Math.abs(animation.translateX.value) / 200, 0.3);
      
      return {
        backgroundColor,
        opacity,
      };
    });

    return (
      <PanGestureHandler onGestureEvent={handleSwipeGesture(item.id, item)}>
        <Animated.View style={[styles.jokeCard, animatedStyle]}>
          <View style={styles.jokeContent}>
            <Text style={styles.jokeText}>{item.text}</Text>
            <View style={styles.jokeMeta}>
              <Text style={styles.jokeStyle}>{item.style}</Text>
              <Text style={styles.jokeSource}>{item.source}</Text>
            </View>
          </View>
          
          <Animated.View style={[styles.swipeOverlay, swipeOverlayStyle]} />
        </Animated.View>
      </PanGestureHandler>
    );
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

      <FlatList
        ref={flatListRef}
        data={jokes}
        renderItem={renderJoke}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreJokes}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#FF6B6B" />
              <Text style={styles.footerText}>Loading more jokes...</Text>
            </View>
          ) : null
        }
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
    fontSize: 18,
    marginTop: 20,
  },
  jokeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    margin: 20,
    padding: 25,
    minHeight: 200,
    justifyContent: 'center',
    position: 'relative',
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
  jokeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jokeStyle: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  jokeSource: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
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
}); 