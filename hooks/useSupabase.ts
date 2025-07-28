import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserPreferences {
  [key: string]: number;
}

interface SeenJoke {
  joke_hash: string;
  humor_style: string;
  seen_at: string;
}

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadUserPreferences(user.id);
      }
      
      setLoading(false);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserPreferences(session.user.id);
        } else {
          setPreferences({});
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

if (data?.preferences) {
        setPreferences(data.preferences);
      } else {
        // Initialize default preferences
        const defaultPreferences = {
          pun: 0,
          dark: 0,
          relatable_female: 0,
          dad_jokes: 0,
          clever: 0,
          observational: 0,
        };
        setPreferences(defaultPreferences);
        
        // Check if preferences exist before saving to the database
        const { count } = await supabase
          .from('user_preferences')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        
        if (count === 0) {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: userId,
              preferences: defaultPreferences,
            });
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const updatePreferences = async (humorStyle: string, change: number) => {
    if (!user) return;

    try {
      const newPreferences = {
        ...preferences,
        [humorStyle]: Math.max(0, Math.min(10, (preferences[humorStyle] || 0) + change)),
      };

      setPreferences(newPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
        });

      if (error) {
        console.error('Error updating preferences:', error);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const recordReaction = async (jokeId: string, reaction: 'like' | 'dislike' | 'view', humorStyle: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('joke_reactions')
        .insert({
          user_id: user.id,
          joke_id: jokeId,
          reaction,
          humor_style: humorStyle,
          reaction_time: new Date().toISOString(),
        });

      if (error) {
        console.error('Error recording reaction:', error);
      }
      
      // For views, also update preferences slightly (passive engagement)
      if (reaction === 'view') {
        await updatePreferences(humorStyle, 0.1);
      }
    } catch (error) {
      console.error('Error recording reaction:', error);
    }
  };

  const getTopHumorStyles = (): string[] => {
    const sortedStyles = Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .map(([style]) => style);
    
    return sortedStyles.slice(0, 3);
  };

  // Create a simple hash from joke text for tracking
  const createJokeHash = (jokeText: string): string => {
    let hash = 0;
    for (let i = 0; i < jokeText.length; i++) {
      const char = jokeText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  };

  const markJokeAsSeen = async (jokeText: string, humorStyle: string) => {
    if (!user) return;

    try {
      const jokeHash = createJokeHash(jokeText);
      
      const { error } = await supabase
        .from('seen_jokes')
        .insert({
          user_id: user.id,
          joke_hash: jokeHash,
          humor_style: humorStyle,
          seen_at: new Date().toISOString(),
        });

      if (error && error.code !== '23505') { // Ignore duplicate errors
        console.error('Error marking joke as seen:', error);
      }
    } catch (error) {
      console.error('Error marking joke as seen:', error);
    }
  };

  const isJokeSeen = async (jokeText: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const jokeHash = createJokeHash(jokeText);
      
      const { data, error } = await supabase
        .from('seen_jokes')
        .select('joke_hash')
        .eq('user_id', user.id)
        .eq('joke_hash', jokeHash)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if joke is seen:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if joke is seen:', error);
      return false;
    }
  };

  const getSeenJokesCount = async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from('seen_jokes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error getting seen jokes count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting seen jokes count:', error);
      return 0;
    }
  };

  return {
    user,
    preferences,
    loading,
    updatePreferences,
    recordReaction,
    getTopHumorStyles,
    markJokeAsSeen,
    isJokeSeen,
    getSeenJokesCount,
  };
}; 