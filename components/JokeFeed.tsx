import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useJokes } from '../hooks/useJokes';
import { useSupabase } from '../hooks/useSupabase';
import JokeCard from './JokeCard';

const { height } = Dimensions.get('window');

interface JokeFeedProps {
  userId: string;
}

export default function JokeFeed({ userId }: JokeFeedProps) {
  const { jokes, loading, error, fetchNextJoke } = useJokes();
  const { getTopHumorStyles, updatePreferences } = useSupabase();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadInitialJokes();
  }, []);

  const loadInitialJokes = async () => {
    const topStyles = getTopHumorStyles(3);
    await fetchNextJoke(topStyles);
  };

  const loadNextJoke = async () => {
    if (isLoadingNext) return;
    
    setIsLoadingNext(true);
    const topStyles = getTopHumorStyles(3);
    await fetchNextJoke(topStyles);
    setIsLoadingNext(false);
  };

  const handleLike = async (jokeId: string, liked: boolean, reactionTime: number) => {
    const joke = jokes.find(j => j.id === jokeId);
    if (!joke) return;

    await updatePreferences({
      joke_id: jokeId,
      liked,
      reaction_time: reactionTime,
      humor_style: joke.humor_style,
    });

    // Load next joke after a short delay
    setTimeout(() => {
      loadNextJoke();
    }, 1000);
  };

  const handleSkip = async (jokeId: string, reactionTime: number) => {
    const joke = jokes.find(j => j.id === jokeId);
    if (!joke) return;

    await updatePreferences({
      joke_id: jokeId,
      liked: false,
      reaction_time: reactionTime,
      humor_style: joke.humor_style,
    });

    // Load next joke immediately
    loadNextJoke();
  };

  const renderJokeCard = ({ item: joke, index }: { item: any; index: number }) => (
    <JokeCard
      joke={joke}
      onLike={handleLike}
      onSkip={handleSkip}
    />
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
      
      // Preload next joke when user is near the end
      if (viewableItems[0].index >= jokes.length - 1) {
        loadNextJoke();
      }
    }
  }).current;

  const renderLoadingItem = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Generating your next joke...</Text>
    </View>
  );

  const renderHeader = () => (
          <View style={styles.header}>
        <Text style={styles.title}>Humorous</Text>
        <Text style={styles.subtitle}>Personalized for you 😂</Text>
      </View>
  );

  const renderFooter = () => {
    if (isLoadingNext) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.footerText}>Loading more jokes...</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && jokes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Setting up your personalized feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && jokes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>😅 Oops! Something went wrong</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialJokes}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={jokes}
        renderItem={renderJokeCard}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 100}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        ListFooterComponent={renderFooter}
        onEndReached={loadNextJoke}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 30,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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