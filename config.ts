// Configuration file for JokeTok app
// Copy this file to config.local.ts and add your actual API keys

export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  },
  
  // Gemini API Configuration
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  },
  
  // App Configuration
  app: {
    name: 'JokeTok',
    version: '1.0.0',
    maxJokesInCache: 10,
    reactionTimeThreshold: 2000, // ms
    preferenceUpdateWeight: 0.1,
    preferenceDecreaseWeight: 0.05,
  },
};

// Instructions for setup:
// 1. Create a .env file in the root directory
// 2. Add your API keys:
//    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
//    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
//    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key 