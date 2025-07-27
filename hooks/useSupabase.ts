import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface UserPreferences {
  pun: number;
  dark: number;
  relatable_female: number;
  dad_jokes: number;
  clever: number;
  observational: number;
}

export interface JokeReaction {
  joke_id: string;
  liked: boolean;
  reaction_time: number;
  humor_style: string;
}

export const useSupabase = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    pun: 0.5,
    dark: 0.5,
    relatable_female: 0.5,
    dad_jokes: 0.5,
    clever: 0.5,
    observational: 0.5,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserPreferences(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.log('No existing preferences, using defaults');
    }
  };

  const signInAnonymously = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updatePreferences = async (reaction: JokeReaction) => {
    if (!user) return;

    const { humor_style, liked, reaction_time } = reaction;
    const weightChange = liked ? 0.1 : -0.05;
    const timeBonus = reaction_time < 2000 ? 0.05 : 0; // Bonus for quick reactions

    const newPreferences = { ...preferences };
    newPreferences[humor_style as keyof UserPreferences] = Math.max(0, Math.min(1, 
      newPreferences[humor_style as keyof UserPreferences] + weightChange + timeBonus
    ));

    setPreferences(newPreferences);

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Save reaction
      await supabase.from('joke_reactions').insert({
        user_id: user.id,
        joke_id: reaction.joke_id,
        liked: reaction.liked,
        reaction_time: reaction.reaction_time,
        humor_style: reaction.humor_style,
      });

    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getTopHumorStyles = (count: number = 2): string[] => {
    const sorted = Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([style]) => style);
    
    return sorted;
  };

  return {
    user,
    loading,
    preferences,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updatePreferences,
    getTopHumorStyles,
  };
}; 