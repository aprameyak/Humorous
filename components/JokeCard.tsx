import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Joke } from '../hooks/useJokes';

const { width, height } = Dimensions.get('window');

interface JokeCardProps {
  joke: Joke;
  onLike: (jokeId: string, liked: boolean, reactionTime: number) => void;
  onSkip: (jokeId: string, reactionTime: number) => void;
}

export default function JokeCard({ joke, onLike, onSkip }: JokeCardProps) {
  const [showPunchline, setShowPunchline] = useState(false);
  const [startTime] = useState(Date.now());
  const [hasReacted, setHasReacted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReveal = () => {
    if (!showPunchline) {
      setShowPunchline(true);
    }
  };

  const handleLike = () => {
    if (hasReacted) return;
    
    const reactionTime = Date.now() - startTime;
    setHasReacted(true);
    onLike(joke.id, true, reactionTime);
  };

  const handleDislike = () => {
    if (hasReacted) return;
    
    const reactionTime = Date.now() - startTime;
    setHasReacted(true);
    onLike(joke.id, false, reactionTime);
  };

  const handleSkip = () => {
    if (hasReacted) return;
    
    const reactionTime = Date.now() - startTime;
    setHasReacted(true);
    onSkip(joke.id, reactionTime);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.setup}>{joke.setup}</Text>
        
        {showPunchline ? (
          <Animated.View style={styles.punchlineContainer}>
            <Text style={styles.punchline}>{joke.punchline}</Text>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.revealButton} onPress={handleReveal}>
            <Text style={styles.revealText}>👆 Tap to reveal punchline</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleLike}
          disabled={hasReacted}
        >
          <Text style={styles.actionIcon}>😂</Text>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={handleDislike}
          disabled={hasReacted}
        >
          <Text style={styles.actionIcon}>😐</Text>
          <Text style={styles.actionText}>Meh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={handleSkip}
          disabled={hasReacted}
        >
          <Text style={styles.actionIcon}>⏭️</Text>
          <Text style={styles.actionText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.humorStyle}>#{joke.humor_style.replace('_', ' ')}</Text>
        <Text style={styles.timestamp}>
          {new Date(joke.created_at).toLocaleTimeString()}
        </Text>
      </View>

      {/* Reaction Feedback */}
      {hasReacted && (
        <View style={styles.reactionFeedback}>
          <Text style={styles.feedbackText}>Thanks for your feedback! 🎉</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height - 100,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  setup: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
  },
  punchlineContainer: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  punchline: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
  },
  revealButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  revealText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#FF9800',
  },
  skipButton: {
    backgroundColor: '#9E9E9E',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  humorStyle: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  reactionFeedback: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 