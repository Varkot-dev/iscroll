# iScroll

An educational doom-scrolling app — Twitter's addictive UX, but for learning. Scroll through interesting facts, tap to dive deeper, and actually retain what you learn.

## Features (v0.1)

- 📱 Infinite scroll feed of interesting content
- 📖 Tap to expand into detailed "threads"
- 🔖 Save/bookmark articles for later
- 📚 Content from Wikipedia API

## Tech Stack

- **React Native + Expo** - Cross-platform mobile development
- **Expo Router** - File-based navigation
- **Supabase** - Database and authentication
- **Wikipedia API** - Content source

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/iscroll.git
   cd iscroll
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
iscroll/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Feed screen
│   │   └── saved.tsx       # Saved items
│   ├── thread/[id].tsx     # Article thread view
│   └── _layout.tsx         # Root layout
├── components/             # Reusable components
├── lib/                    # Utility functions
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

## Development

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

## Roadmap

- [x] v0.1 - Basic feed, threads, bookmarks
- [ ] v0.2 - User tracking and personalization
- [ ] v0.3 - Comprehension questions
- [ ] v0.4 - Spaced repetition system
- [ ] v0.5 - Custom topic input

## License

MIT
