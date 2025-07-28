# Humorous App Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup**
   - Go to your Supabase project dashboard
   - Run the SQL commands from `database_schema.sql` in the SQL editor

4. **API Keys**
   - **Supabase**: Get from your Supabase project settings
   - **Gemini**: Get from [Google AI Studio](https://aistudio.google.com/)

5. **Run the App**
   ```bash
   npm start
   ```

## Features Implemented

✅ **Authentication**: Email/password sign up and sign in
✅ **Joke Feed**: TikTok-style vertical scrolling
✅ **Rate Limiting**: Prevents API abuse (3s between batches)
✅ **Batch Generation**: 8 jokes per batch to avoid rate limits
✅ **Scroll Throttling**: 1s between scroll events
✅ **Mixed Joke Sources**: 60% external API + 40% Gemini AI jokes
✅ **Multiple APIs**: Primary + backup external joke APIs
✅ **Smart Shuffling**: Random mix of API and AI jokes
✅ **Background Jobs**: Periodic mixed joke generation
✅ **Reaction Tracking**: Like/dislike with auto-scroll
✅ **Offline Support**: Cached jokes for smooth experience

## Rate Limits & Performance

- **Batch Size**: 8 jokes per generation
- **Generation Interval**: 3 seconds minimum between batches
- **Scroll Throttle**: 1 second between scroll events
- **Cache Size**: 50 jokes maximum
- **Background Job**: Runs every 5 minutes

## Architecture

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Gemini 2.5 Flash for AI-generated jokes
- **APIs**: Multiple external joke APIs for variety
- **Caching**: In-memory cache with mixed joke sources
- **Rate Limiting**: Multiple layers to prevent API abuse

## Troubleshooting

1. **Auth not working**: Check Supabase URL and anon key
2. **No jokes loading**: Check Gemini API key
3. **Rate limited**: App will automatically fallback to external APIs
4. **Slow scrolling**: App throttles rapid scrolling to prevent abuse 