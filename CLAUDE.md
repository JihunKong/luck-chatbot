# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a KakaoTalk chatbot application for fortune telling and horoscope services (사주·운세 카카오톡 챗봇). Users provide their birth date, time, and receive personalized fortune readings powered by OpenAI's ChatGPT API.

## Project Setup Status

**Important**: This repository is currently in the initial planning stage. No code implementation exists yet. The following structure needs to be created:

### Required Project Initialization

Since this is a Next.js project that will be deployed on Vercel, initialize with:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @supabase/supabase-js openai axios
```

### Development Commands (Once Initialized)

```bash
# Development
npm run dev        # Start development server on localhost:3000

# Build & Production
npm run build      # Build for production
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## Architecture Overview

### API Structure
The application will use Next.js API Routes (App Router) for serverless functions:

- `/api/kakao/webhook` - Main webhook endpoint for Kakao Chat API
  - Handles incoming messages from KakaoTalk
  - Validates input format (YYYY-MM-DD for birth date, HH:mm for birth time)
  - Manages conversation context using user_key as UUID
  
- `/api/fortune` - Fortune analysis endpoint
  - Fetches current time from WorldTimeAPI
  - Calls OpenAI ChatGPT API for fortune analysis
  - Returns formatted response

### Database Schema (Supabase/Firebase)

**conversations** table:
- `id` (UUID, primary key)
- `user_key` (string, unique) - Kakao user identifier
- `messages` (JSONB array) - Conversation history
- `user_data` (JSONB) - Birth date/time information
- `created_at`, `updated_at` (timestamps)

### External Service Integration

1. **Kakao i Open Builder**: Configure webhook URL after deployment
2. **OpenAI API**: GPT-4 or GPT-3.5-turbo for fortune analysis
3. **WorldTimeAPI**: Get accurate Seoul time without authentication
4. **Supabase/Firebase**: User data and conversation persistence

## Environment Variables Required

Create `.env.local` with:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
KAKAO_API_KEY=
```

## Key Implementation Considerations

1. **Input Validation**: Strictly validate date/time formats before processing
2. **Error Handling**: Return user-friendly Korean messages for all error cases
3. **Rate Limiting**: Implement per-user rate limiting to prevent API abuse
4. **Context Management**: Maintain conversation history for natural interactions
5. **Response Format**: Follow Kakao's skillResponse format specification

## Deployment Process

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy and get production URL
5. Register webhook URL in Kakao i Open Builder
6. Test with actual KakaoTalk messages