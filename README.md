# Humorous - AI-Powered Personalized Joke Feed

![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)

A TikTok-style joke app that generates personalized jokes using the Gemini API and Supabase. The app learns your humor preferences and tailors jokes to your taste without requiring manual input.

## 🚀 Features
- **AI-Generated Jokes**: Dynamic joke generation using Google's Gemini Pro API
- **Personalized Feed**: Learns your humor preferences automatically
- **TikTok-Style UI**: Vertical scrolling with full-screen joke cards
- **Smart Preference Engine**: Tracks reaction times and adjusts humor styles
- **Anonymous Authentication**: Seamless sign-in with Supabase
- **Real-time Learning**: Updates preferences based on your reactions
- **Multiple Humor Styles**: pun, dark, relatable_female, dad_jokes, clever, observational

## 🎯 How It Works

1. **Smart Authentication**: Anonymous sign-in for instant access
2. **Preference Learning**: App starts with balanced humor style weights
3. **AI Generation**: Gemini API creates jokes in your preferred styles
4. **Reaction Tracking**: Your likes, dislikes, and reaction times update preferences
5. **Personalized Feed**: Next jokes are generated based on your top humor styles

## 🏗️ Architecture

- **Frontend**: React Native with Expo
- **Authentication**: Supabase Auth (anonymous + email)
- **Database**: Supabase (user preferences, reactions)
- **AI**: Google Gemini Pro API
- **State Management**: React hooks with custom logic

## 1️⃣ Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Supabase account](https://supabase.com/) (free tier is fine)
- [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini API key

### 2.1. Clone & Install
```sh
# Clone the repo (or create a new Expo app and add these files)
git clone <your-repo-url> Humorous
cd Humorous
npm install
npx expo install @supabase/supabase-js
```

### 2.2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, create these tables:

#### Table: `user_preferences`
| Name        | Type      | Notes                    |
|-------------|-----------|--------------------------|
| user_id     | uuid      | Primary Key              |
| preferences | jsonb     | Humor style weights      |
| updated_at  | timestamp | default now()            |

#### Table: `joke_reactions`
| Name          | Type      | Notes                    |
|---------------|-----------|--------------------------|
| id            | uuid      | Primary Key              |
| user_id       | uuid      | User who reacted         |
| joke_id       | text      | Generated joke ID        |
| liked         | boolean   | Like/dislike            |
| reaction_time | integer   | Time in milliseconds     |
| humor_style   | text      | Style of the joke        |
| created_at    | timestamp | default now()            |

3. Enable **anonymous sign-in** in Supabase Auth (for easy onboarding).

### 2.3. Configure API Keys
1. Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

2. Get your Supabase credentials from your project settings
3. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2.4. Run the App
```sh
# Start the development server
npx expo start --ios

# Or for web development
npx expo start --web
```

## 🎮 Usage

1. **Launch the app** - You'll be automatically signed in anonymously
2. **Swipe through jokes** - Use vertical scrolling like TikTok
3. **React to jokes** - Tap like/dislike buttons or swipe quickly
4. **Watch it learn** - The app adapts to your humor preferences
5. **Enjoy personalized content** - Jokes get better as you use the app

## 🔧 Customization

### Adding New Humor Styles
Edit `hooks/useSupabase.ts` to add new humor styles to the `UserPreferences` interface.

### Modifying Joke Generation
Update the prompt in `hooks/useJokes.ts` to change how jokes are generated.

### UI Customization
Modify components in the `components/` directory to change the app's appearance.

## 🚀 Deployment

### iOS App Store
1. Build the app: `npx expo build:ios`
2. Submit to App Store Connect
3. Configure app signing and certificates

### Android Play Store
1. Build the app: `npx expo build:android`
2. Generate signed APK/AAB
3. Upload to Google Play Console

## 🐛 Troubleshooting

### Common Issues
- **EMFILE Error**: Run `ulimit -n 65536` to increase file descriptors
- **API Key Issues**: Ensure your `.env` file has complete API keys
- **Simulator Problems**: Try `npx expo start --clear` to clear cache

### Development Tips
- Use `npx expo start --ios` for iOS development
- Use `npx expo start --web` for web testing
- Check the Expo logs for detailed error messages

## 📱 Screenshots

*Add screenshots of your app here*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native platform
- [Supabase](https://supabase.com/) for backend services
- [Google Gemini](https://ai.google.dev/) for AI-powered joke generation
- [React Native](https://reactnative.dev/) for the mobile framework

---

**Made with ❤️ for humor lovers everywhere**
