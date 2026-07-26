# Humorous

![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)

## About

**Humorous** is a TikTok-style iOS joke app built with **React Native** and **Expo** that delivers a personalized feed of AI-generated jokes. It uses **Google Gemini Pro** to generate jokes across styles like puns, dad jokes, dark humor, and observational comedy, then learns your preferences by tracking reactions over time to continuously improve what it shows you.

## Features

- Vertical swipe-based joke feed with full-screen cards and smooth spring animations
- AI-generated jokes powered by Google Gemini Pro across multiple humor styles
- Automatic preference learning — tracks reactions to adjust humor style weights without manual input
- Google OAuth authentication via Expo Auth Session
- Preloads jokes in the background as you scroll to minimize wait times
- Real-time data sync with Supabase for user profiles and preference storage
- Dark theme with clean typography throughout

## Technology Stack

- **Mobile**: React Native, Expo, TypeScript
- **Backend/Database**: Supabase
- **AI**: Google Gemini Pro API
- **Auth**: Google OAuth via Expo Auth Session
