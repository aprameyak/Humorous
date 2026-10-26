# Humorous

Humorous is an iOS app for scrolling through jokes one card at a time. You sign in with email and password, open the feed, and swipe to get the next joke. It is built with Expo and React Native, uses Supabase for accounts, and is listed on the [App Store](https://apps.apple.com/app/id6749724481).

This repo also contains `webapp/`, a small Next.js site with the app's landing, support and privacy pages.

## Features

- Full-screen joke feed: swipe up or down past a threshold to move to the next joke (`components/JokeFeed.tsx`).
- Jokes are pulled from the public [Official Joke API](https://official-joke-api.appspot.com/random_ten), with [JokeAPI](https://v2.jokeapi.dev/) as a fallback, shuffled and cached in memory.
- The feed preloads more jokes once you are halfway through the current batch.
- Email and password sign up and sign in through Supabase Auth (`components/LoginScreen.tsx`).
- Profile screen with links to support and privacy pages, log out, and account deletion via a Supabase Edge Function named `delete-account`.
- While signed in, a timer refills the joke cache every 5 minutes (`services/backgroundJob.ts`). This runs only while the app is open; it is not an OS background task.

## Tech stack

- Expo SDK 53, React Native 0.79, React 19, TypeScript
- react-native-gesture-handler and react-native-reanimated for the swipe card
- Supabase (`@supabase/supabase-js`) for auth
- EAS Build and EAS Update for iOS builds
- Next.js 15 for `webapp/`

## Getting started

Prerequisites: Node.js 20 (the version CI uses), npm, and for native iOS runs, Xcode with CocoaPods. A Supabase project is required for sign in.

```bash
git clone https://github.com/aprameyak/Humorous
cd Humorous
npm install
cp .env.example .env
npm start
```

Fill in `.env` before starting. The variables are listed in `.env.example`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY` (optional, see "How it works")
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (listed but not read anywhere in the current code)

Scripts from `package.json`:

| Command | What it runs |
| --- | --- |
| `npm start` | `expo start` |
| `npm run ios` | `expo run:ios` (builds the native project in `ios/`) |
| `npm run android` | `expo run:android` |
| `npm run web` | `expo start --web` |

Type checking, as in CI: `npx tsc --noEmit`.

`eas.json` defines `development`, `preview` and `production` build profiles, so a store build is `eas build -p ios --profile production` with the EAS CLI.

### Web app

```bash
cd webapp
npm install
npm run dev
```

`npm run build` and `npm start` produce and serve a production build. The site has three routes: `/`, `/support` and `/privacy`.

## How it works

- `App.tsx` reads the Supabase session. Without one it shows `LoginScreen`; with one it switches between `HomeScreen`, `JokeFeed` and `ProfileScreen` using local state (there is no navigation library). It also handles deep links containing `access_token` and `refresh_token` and starts or stops the background job on auth changes.
- `services/jokeService.ts` is the joke source used by the feed. `generateJokesBatch()` fetches ten jokes from the Official Joke API (or five from JokeAPI if that returns nothing), shuffles them, and keeps up to 50 in an in-memory cache. `getJokesForFeed()` hands out jokes the session has not shown yet. Jokes are not stored in Supabase.
- `jokeService.ts` also calls Google Gemini (`gemini-1.5-flash-latest`) for extra jokes, but it sends the API key as an `Authorization: Bearer` header instead of the `key` query parameter, so expect those requests to fail and the feed to come from the joke APIs until that is fixed.
- `supabaseClient.ts` creates the Supabase client from the two `EXPO_PUBLIC_SUPABASE_*` variables. `config.ts` holds the Gemini settings and app constants.
- `hooks/useJokes.ts` and `hooks/useSupabase.ts` contain an earlier design with Gemini-generated jokes, per-user humor style weights (`user_preferences`), reactions (`joke_reactions`) and seen jokes (`seen_jokes`). These hooks are not imported by any screen. The home screen describes swipe up as like and swipe down as dislike, but the feed currently treats both as "next" and does not record reactions.
- The Supabase table schema and the `delete-account` function are not included in this repo.

## Project structure

```
App.tsx              screen switching, auth session, deep links
components/          HomeScreen, JokeFeed, LoginScreen, ProfileScreen
services/            jokeService.ts, backgroundJob.ts, jokeAPI.js
hooks/               useJokes.ts, useSupabase.ts (currently unused)
supabaseClient.ts    Supabase client
config.ts            Gemini and app settings
ios/                 native iOS project
app.json, eas.json   Expo and EAS configuration
webapp/              Next.js landing, support and privacy pages
PRIVACY_POLICY.md, TERMS_OF_SERVICE.md
```

## Contributing

Issues and pull requests are welcome. Run `npx tsc --noEmit` in the root and `npm run build` in `webapp/` before opening a PR; CI runs both on pushes and pull requests to `main`.

## License

MIT, see [LICENSE](LICENSE).
