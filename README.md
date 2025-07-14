# LaughALot

A simple, swipeable joke generator app built with Expo (React Native, TypeScript) and Supabase.

## 🚀 Features
- Swipeable joke cards (like Tinder)
- Tap to reveal punchline
- Like/dislike jokes with swipe
- Feedback stored in Supabase
- Works out-of-the-box with mock data

---

## 1️⃣ Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Supabase account](https://supabase.com/) (free tier is fine)

---

## 2️⃣ Setup Instructions

### 2.1. Clone & Install
```sh
# Clone the repo (or create a new Expo app and add these files)
git clone <your-repo-url> LaughALot
cd LaughALot
npm install
npx expo install react-native-deck-swiper @supabase/supabase-js
```

### 2.2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, create these tables:

#### Table: `jokes`
| Name      | Type      | Notes         |
|-----------|-----------|---------------|
| id        | uuid      | Primary Key   |
| setup     | text      |               |
| punchline | text      |               |
| topic     | text      | (optional)    |
| created_at| timestamp | default now() |

#### Table: `user_feedback`
| Name      | Type      | Notes         |
|-----------|-----------|---------------|
| id        | uuid      | Primary Key   |
| user_id   | uuid      | (optional)    |
| joke_id   | uuid      | FK to jokes   |
| liked     | boolean   |               |
| timestamp | timestamp | default now() |

3. Enable **anonymous sign-in** in Supabase Auth (for easy onboarding).
4. (Optional) Add some jokes manually in the `jokes` table.

### 2.3. Configure Supabase in the App
- Open `supabaseClient.ts` and replace:
  - `SUPABASE_URL` with your project URL (from Supabase dashboard)
  - `SUPABASE_ANON_KEY` with your anon public key

---

## 3️⃣ Running the App
```sh
npx expo start
```
- Scan the QR code with Expo Go (iOS/Android) or run on an emulator.
- The app will use mock jokes if Supabase is not configured.

---

## 4️⃣ Customization & Next Steps
- Add more jokes in Supabase for a richer experience
- (Optional) Add user authentication for tracking individual users
- (Optional) Add OpenAI joke generation and embeddings for personalization

---

## 🛠️ Troubleshooting
- If you see only mock jokes, check your Supabase URL/key and table setup
- For any issues, check the Expo and Supabase docs

---

## 📄 License
MIT 

---

## 5️⃣ Automated Joke Seeding & Embeddings

### 5.1. Seed Jokes with Embeddings

1. Get your OpenAI API key and Supabase service key (see Supabase dashboard > Project Settings > API).
2. Edit `generateJokes.ts` and fill in your keys and Supabase URL.
3. Run:

```sh
npm install openai @supabase/supabase-js
npx ts-node generateJokes.ts
```

- This will insert jokes from `jokesDataset.json` and some AI remixes, all with embeddings, into your Supabase `jokes` table.

### 5.2. Enable Vector Search in Supabase

1. Add an `embedding` column to your `jokes` table:
   - Type: `float8[]`
2. Enable the [pgvector extension](https://supabase.com/docs/guides/database/extensions/pgvector):
   - In Supabase SQL editor, run:
     ```sql
     create extension if not exists vector;
     alter table jokes add column if not exists embedding vector(1536);
     ```
3. Now you can use vector similarity queries for RAG.

### 5.3. Example: Personalized Joke Feed (RAG)

To fetch jokes similar to a user's humor fingerprint:

```sql
select * from jokes
order by embedding <#> '[USER_EMBEDDING]'::vector
limit 10;
```

- Compute `[USER_EMBEDDING]` as the average of the embeddings of jokes the user liked.
- You can do this in Supabase SQL or in your app code.

---

## 6️⃣ App Store Deployment

- See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for building and submitting to the App Store.
- Make sure to set your app icon, splash, and metadata in `app.json`.
- Do **not** include your API keys in the public repo or client app.

--- 

---

## 7️⃣ Personalized Joke Feed (RAG)

### 7.1. Set Up Vector Search Function in Supabase

In the Supabase SQL editor, run:

```sql
CREATE OR REPLACE FUNCTION match_jokes(query_embedding vector(1536), match_count int)
RETURNS TABLE(id uuid, setup text, punchline text, topic text, embedding vector)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT id, setup, punchline, topic, embedding
  FROM jokes
  ORDER BY embedding <#> query_embedding
  LIMIT match_count;
END;
$$;
```

This enables fast, personalized vector search for jokes.

### 7.2. Using the Personalized Feed in Your App

- See `personalizedFeed.ts` for example code.
- To fetch personalized jokes for a user:

```ts
import { fetchPersonalizedJokes } from './personalizedFeed';

const jokes = await fetchPersonalizedJokes(user_id, 10);
```

- The function will:
  - Compute the user's humor fingerprint (average embedding of liked jokes)
  - Query Supabase for the most similar jokes
  - Fallback to random jokes if no likes yet

---

## 8️⃣ Final Checklist Before App Store Submission
- [ ] Add your Supabase and OpenAI keys (never commit to repo)
- [ ] Run the joke seeding script
- [ ] Enable vector search and the match_jokes function
- [ ] Test personalized feed logic
- [ ] Set app icon, splash, and metadata in app.json
- [ ] Build and submit with Expo EAS

--- 