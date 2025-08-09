# Humorous - AI-Powered Personalized Joke Feed

![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)

A TikTok-style joke app that generates personalized jokes using the Gemini API and Supabase. The app learns your humor preferences and tailors jokes to your taste without requiring manual input.

## Features

- **AI-Generated Jokes**: Dynamic joke generation using Google's Gemini Pro API
- **Personalized Feed**: Learns your humor preferences automatically
- **TikTok-Style UI**: Vertical scrolling with full-screen joke cards
- **Smart Preference Engine**: Tracks reaction time and input to adjust preferences
- **Google OAuth**: Secure authentication with Google
- **Real-time Learning**: Updates humor style weights based on reactions
- **Dark Theme**: Modern, clean interface

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** for authentication and data storage
- **Google Gemini Pro API** for AI joke generation
- **Expo Linking** for OAuth flow

## Core Features

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
- 
## UI/UX Features

- **Dark Theme**: Consistent black background
- **Modern Typography**: Clean, readable text
- **Smooth Animations**: Fluid transitions between jokes
- **Intuitive Gestures**: Easy reaction system
- **Loading States**: Clear feedback during API calls

## Security

- Row Level Security (RLS) on all tables
- Secure OAuth flow with Google
- Environment variable protection
- Input validation and sanitization

## Performance

- Optimized joke generation
- Efficient preference tracking
- Minimal API calls
- Smooth scrolling performance

## Analytics

The app tracks:
- User reaction patterns
- Humor style preferences
- Engagement metrics
- Performance data
