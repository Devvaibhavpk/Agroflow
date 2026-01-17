# Agroflow 🌾

An AI-powered agricultural monitoring and assistant platform built with Next.js.

## Features

- **Real-time Dashboard** - Monitor temperature, humidity, and soil moisture from ESP32 sensors
- **AI Chatbot** - Get agricultural advice powered by Google Gemini AI in 8+ languages
- **Smart Irrigation** - Automated water pump control based on sensor data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Google Gemini API (for AI chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (for sensor data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ask` | POST | AI chatbot with multi-language support |
| `/api/health` | GET | Health check |
| `/api/sample-data` | GET | Sample sensor data with analysis |

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **AI**: Google Gemini 2.0 Flash
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Auth**: Clerk
