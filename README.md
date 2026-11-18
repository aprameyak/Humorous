# LaughALot

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white&style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white&style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white&style=for-the-badge)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white&style=for-the-badge)

## About

**LaughALot** is a generative AI joke app built with **Next.js** and **React** that produces on-demand humor using **OpenAI GPT-4** via **LangChain**. Enter a topic to get a targeted joke, or leave the field blank for a random one. The API is stateless and fine-tuned with temperature, maxTokens, and top_p parameters for comedic effect. Authentication is managed by **Clerk** and deployments are automated via **GitHub Actions**.

## Features

- Topic-based or random joke generation powered by OpenAI GPT-4
- LangChain integration for prompt chaining and model parameter control
- Clerk authentication supporting email sign-in and Gmail identity federation
- Stateless API — no server-side session or joke storage
- Fine-tuned response parameters (temperature, maxTokens, top_p) for humor optimization
- Material UI interface for a clean, responsive layout
- CI/CD pipeline via GitHub Actions deploying to Vercel

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Material UI (MUI)
- **Backend**: Next.js API Routes
- **AI Integration**: OpenAI GPT-4, LangChain
- **Authentication**: Clerk
- **CI/CD**: GitHub Actions

## Deployment

Visit the live site at [https://laughalot.aprameyak.workers.dev](https://laughalot.aprameyak.workers.dev)
