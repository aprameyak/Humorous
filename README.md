# Humorous - AI-Powered Personalized Joke Feed

![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)

A TikTok-style joke app that generates personalized jokes using the Gemini API and Supabase. The app learns your humor preferences and tailors jokes to your taste without requiring manual input.

## 🚀 Features

- **AI-Generated Jokes**: Dynamic joke generation using Google's Gemini Pro API
- **Personalized Feed**: Learns your humor preferences automatically
- **TikTok-Style UI**: Vertical scrolling with full-screen joke cards
- **Smart Preference Engine**: Tracks reaction time and input to adjust preferences
- **Google OAuth**: Secure authentication with Google
- **Real-time Learning**: Updates humor style weights based on reactions
- **Dark Theme**: Modern, clean interface

## 🛠️ Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** for authentication and data storage
- **Google Gemini Pro API** for AI joke generation
- **Expo Linking** for OAuth flow

## 📱 App Structure

```
Humorous/
├── App.tsx                 # Main app entry point
├── supabaseClient.ts       # Supabase configuration
├── components/
│   ├── LoginScreen.tsx     # Google OAuth login
│   └── JokeFeed.tsx       # TikTok-style joke feed
├── hooks/
│   ├── useJokes.ts        # Gemini API integration
│   └── useSupabase.ts     # Supabase data management
└── .env.local             # Environment variables
```

## 🎯 Core Features

### Authentication
- Google OAuth sign-in
- Session management
- Secure user data storage

### Joke Generation
- AI-powered jokes using Gemini Pro
- Multiple humor styles: pun, dark, relatable_female, dad_jokes, clever, observational
- Clean, modern content (no politics/religion)

### Preference Learning
- Tracks user reactions (like/dislike)
- Updates humor style weights automatically
- Generates jokes based on top preferred styles

### TikTok-Style Interface
- Vertical scrolling feed
- Full-screen joke cards
- Reaction buttons (😂/😐)
- Smooth animations and transitions

## 🗄️ Database Schema

### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### joke_reactions
```sql
CREATE TABLE joke_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  joke_id TEXT NOT NULL,
  reaction TEXT CHECK (reaction IN ('like', 'dislike')),
  humor_style TEXT NOT NULL,
  reaction_time TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local` with your API keys:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Enable Google OAuth in Authentication > Providers
3. Create the database tables (see schema above)
4. Set up Row Level Security (RLS) policies

### 3. Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `humorous://login-callback`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
npx expo start
```

## 🎨 UI/UX Features

- **Dark Theme**: Consistent black background
- **Modern Typography**: Clean, readable text
- **Smooth Animations**: Fluid transitions between jokes
- **Intuitive Gestures**: Easy reaction system
- **Loading States**: Clear feedback during API calls

## 🔒 Security

- Row Level Security (RLS) on all tables
- Secure OAuth flow with Google
- Environment variable protection
- Input validation and sanitization

## 🚀 Performance

- Optimized joke generation
- Efficient preference tracking
- Minimal API calls
- Smooth scrolling performance

## 📊 Analytics

The app tracks:
- User reaction patterns
- Humor style preferences
- Engagement metrics
- Performance data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **EMFILE Error**: Increase file descriptor limits
   ```bash
   ulimit -n 65536
   ```

2. **API Key Issues**: Verify environment variables are loaded correctly

3. **OAuth Errors**: Check redirect URIs in Google Cloud Console

4. **Database Errors**: Ensure RLS policies are configured correctly

### Support

For issues and questions, please check the troubleshooting section or create an issue in the repository. 