import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { supabase } from './supabaseClient';
import { TouchableOpacity } from 'react-native-gesture-handler';

// Type definitions
interface Joke {
  id: string;
  setup: string;
  punchline: string;
  topic?: string;
}

// Fallback mock jokes
const MOCK_JOKES: Joke[] = [
  { id: '1', setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field!' },
  { id: '2', setup: 'Why don’t skeletons fight each other?', punchline: 'They don’t have the guts.' },
  { id: '3', setup: 'What do you call fake spaghetti?', punchline: 'An impasta.' },
];

export default function App() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPunchline, setShowPunchline] = useState<{ [key: number]: boolean }>({});
  const swiperRef = useRef<Swiper<Joke>>(null);

  useEffect(() => {
    const fetchJokes = async () => {
      try {
        const { data, error } = await supabase
          .from('jokes')
          .select('id, setup, punchline, topic')
          .limit(20);
        if (error || !data) throw error;
        setJokes(data);
      } catch (e) {
        setJokes(MOCK_JOKES);
      } finally {
        setLoading(false);
      }
    };
    fetchJokes();
  }, []);

  const handleSwipe = async (cardIndex: number, liked: boolean) => {
    const joke = jokes[cardIndex];
    try {
      await supabase.from('user_feedback').insert([
        {
          joke_id: joke.id,
          liked,
          // user_id: (add user id if you implement auth)
        },
      ]);
    } catch (e) {
      // fallback: ignore errors for now
    }
  };

  const renderCard = (joke: Joke, index: number) => (
    <View style={styles.card}>
      <Text style={styles.setup}>{joke.setup}</Text>
      {showPunchline[index] ? (
        <Text style={styles.punchline}>{joke.punchline}</Text>
      ) : (
        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setShowPunchline((prev) => ({ ...prev, [index]: true }))}
        >
          <Text style={styles.revealText}>Tap to reveal punchline</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LaughALot</Text>
      <Swiper
        ref={swiperRef}
        cards={jokes}
        renderCard={renderCard}
        onSwipedLeft={(i) => handleSwipe(i, false)}
        onSwipedRight={(i) => handleSwipe(i, true)}
        cardIndex={0}
        backgroundColor={'#f0f0f0'}
        stackSize={3}
        stackSeparation={15}
        animateCardOpacity
        disableTopSwipe
        disableBottomSwipe
        overlayLabels={{
          left: {
            title: 'Nope',
            style: {
              label: { color: 'red', fontSize: 24 },
              wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 20, marginLeft: -20 },
            },
          },
          right: {
            title: 'Like',
            style: {
              label: { color: 'green', fontSize: 24 },
              wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 20, marginLeft: 20 },
            },
          },
        }}
        containerStyle={{ flex: 1 }}
        onSwipedAll={() => Alert.alert('No more jokes!')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4a148c',
  },
  card: {
    flex: 0.7,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4a148c',
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  setup: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  punchline: {
    fontSize: 20,
    color: '#388e3c',
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  revealButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#e1bee7',
    borderRadius: 8,
  },
  revealText: {
    color: '#4a148c',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 