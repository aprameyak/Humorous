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
import { useJokes } from '../hooks/useJokes';
import { useSupabase } from '../hooks/useSupabase';

const { height } = Dimensions.get('window');

interface Joke {
  id: string;
  text: string;
  humorStyle: string;
  timestamp: number;
}

export default function JokeFeed() {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  const { generateJoke, loading: generatingJoke } = useJokes();
  const { user, updatePreferences, recordReaction, getTopHumorStyles, markJokeAsSeen, isJokeSeen } = useSupabase();

  useEffect(() => {
    loadInitialJokes();
  }, []);

  const loadInitialJokes = async () => {
    try {
      setLoading(true);
      const initialJokes = await generateInitialJokes();
      setJokes(initialJokes);
    } catch (error) {
      console.error('Error loading jokes:', error);
      Alert.alert('Error', 'Failed to load jokes');
    } finally {
      setLoading(false);
    }
  };

  const generateInitialJokes = async (): Promise<Joke[]> => {
    const humorStyles = ['pun', 'dark', 'relatable_female', 'dad_jokes', 'clever', 'observational'];
    const initialJokes: Joke[] = [];
    
    for (let i = 0; i < 5; i++) {
      const style = humorStyles[Math.floor(Math.random() * humorStyles.length)];
      let joke = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      // Try to generate a unique joke
      while (!joke && attempts < maxAttempts) {
        const candidateJoke = await generateJoke(style);
        if (candidateJoke) {
          const isSeen = await isJokeSeen(candidateJoke);
          if (!isSeen) {
            joke = candidateJoke;
            // Mark as seen immediately
            await markJokeAsSeen(candidateJoke, style);
          }
        }
        attempts++;
      }
      
      if (joke) {
        initialJokes.push({
          id: `joke-${Date.now()}-${i}`,
          text: joke,
          humorStyle: style,
          timestamp: Date.now(),
        });
      }
    }
    
    return initialJokes;
  };

  const handleReaction = async (joke: Joke, reaction: 'like' | 'dislike') => {
    try {
      // Record reaction in Supabase
      await recordReaction(joke.id, reaction, joke.humorStyle);
      
      // Update user preferences based on reaction (stronger weight for engagement)
      const weight = reaction === 'like' ? 2 : -1;
      await updatePreferences(joke.humorStyle, weight);
      
      // Auto-scroll to next joke after reaction
      setTimeout(() => {
        if (currentJokeIndex < jokes.length - 1) {
          const nextIndex = currentJokeIndex + 1;
          setCurrentJokeIndex(nextIndex);
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
      }, 500);
      
      // Generate more jokes in the background based on updated preferences
      generateSmartJoke();
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  };

  const generateSmartJoke = async () => {
    try {
      const topStyles = getTopHumorStyles();
      
      // Use algorithm to pick the best style based on user preferences
      const selectedStyle = topStyles.length > 0 
        ? topStyles[Math.floor(Math.random() * Math.min(3, topStyles.length))]
        : 'clever'; // default fallback
      
      const newJoke = await generateJoke(selectedStyle);
      if (newJoke) {
        const newJokeObj: Joke = {
          id: `joke-${Date.now()}-${Math.random()}`,
          text: newJoke,
          humorStyle: selectedStyle,
          timestamp: Date.now(),
        };
        
        setJokes(prev => [...prev, newJokeObj]);
      }
    } catch (error) {
      console.error('Error generating smart joke:', error);
    }
  };

  const handleSwipeUp = () => {
    if (currentJokeIndex < jokes.length - 1) {
      const nextIndex = currentJokeIndex + 1;
      setCurrentJokeIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      
      // Generate more content when user is near the end
      if (nextIndex >= jokes.length - 2) {
        generateSmartJoke();
      }
    }
  };

  const handleSwipeDown = () => {
    if (currentJokeIndex > 0) {
      const prevIndex = currentJokeIndex - 1;
      setCurrentJokeIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const renderJoke = ({ item, index }: { item: Joke; index: number }) => (
    <View style={styles.jokeContainer}>
      <View style={styles.jokeContent}>
        <Text style={styles.jokeText}>{item.text}</Text>
        
        <View style={styles.reactionContainer}>
          <TouchableOpacity
            style={[styles.reactionButton, styles.likeButton]}
            onPress={() => handleReaction(item, 'like')}
          >
            <Text style={styles.reactionText}>😂</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.reactionButton, styles.dislikeButton]}
            onPress={() => handleReaction(item, 'dislike')}
          >
            <Text style={styles.reactionText}>😐</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        snapToInterval={height - 100}
        decelerationRate="fast"
        style={styles.flatList}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / (height - 100));
          setCurrentJokeIndex(index);
          
          // Generate more content when near the end
          if (index >= jokes.length - 2) {
            generateSmartJoke();
          }
          
          // Track view time for algorithm (passive engagement)
          if (jokes[index]) {
            recordReaction(jokes[index].id, 'view', jokes[index].humorStyle);
          }
        }}
        onScrollBeginDrag={() => {
          // Track that user is actively scrolling (engagement signal)
        }}
      />
      
      {generatingJoke && (
        <View style={styles.generatingOverlay}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.generatingText}>Generating new joke...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  jokeContainer: {
    height: height - 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  jokeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
  },
  jokeText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
    fontWeight: '500',
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  reactionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  reactionText: {
    fontSize: 24,
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
  generatingOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 20,
  },
  generatingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
}); 