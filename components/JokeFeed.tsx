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
import { supabase } from '../supabaseClient';
import { jokeService } from '../services/jokeService';
import { useSupabase } from '../hooks/useSupabase';

const { height, width } = Dimensions.get('window');

interface Joke {
  id: string;
  text: string;
  style: string;
  timestamp: number;
  source: string;
}

export default function JokeFeed() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollThrottle = 1000; // 1 second between scrolls
  
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
    return (
      <View style={styles.jokeContainer}>
        <View style={styles.jokeCard}>
          <Text style={styles.jokeText}>{item.text}</Text>
          <View style={styles.jokeMeta}>
            <Text style={styles.jokeStyle}>{item.style}</Text>
            <Text style={styles.jokeSource}>{item.source}</Text>
          </View>
          
          {/* Simple reaction buttons */}
          <View style={styles.reactionButtons}>
            <TouchableOpacity 
              style={[styles.reactionButton, styles.dislikeButton]}
              onPress={() => handleReaction(item, 'dislike')}
            >
              <Text style={styles.reactionButtonText}>👎</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reactionButton, styles.likeButton]}
              onPress={() => handleReaction(item, 'like')}
            >
              <Text style={styles.reactionButtonText}>👍</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <Text style={styles.headerTitle}>Humorous</Text>
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
  reactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  reactionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#F44336',
  },
  reactionButtonText: {
    fontSize: 24,
    color: '#fff',
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