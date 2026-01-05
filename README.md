# iScroll v2.0 - Rabbit Holes

**Learn by following fascinating rabbit holes.** Transform from passive random facts to active narrative engagement with AI-generated episodic content and automated real-time updates.

![iScroll](./assets/icon.png)

## What's New in v2.0

- 🐰 **Rabbit Holes**: Follow curated topics with episodic content
- 📺 **Episodes**: Narrative-driven learning in bite-sized chunks
- 🔔 **Subscriptions**: Get notified when new episodes drop
- 🔥 **FOMO Design**: Engagement-focused UI with urgency badges
- 🤖 **AI Content**: Google Gemini-powered content generation (FREE)
- 📰 **News Updates**: Automated content from real news (FREE)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file in the project root:

```bash
# Supabase (required)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Content Generation (optional - for generating new content)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# News Integration (optional - for automated updates)
EXPO_PUBLIC_NEWS_API_KEY=your_newsapi_key
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Copy the contents of `supabase/schema.sql`
4. Click "Run" to create all tables

### 4. Seed Content

Populate the database with starter content:

```bash
npm run seed
```

### 5. Start the App

```bash
npm start
```

Then scan the QR code with Expo Go (mobile) or press `w` for web.

## API Keys (All FREE)

### Supabase
- Get from: [supabase.com](https://supabase.com)
- Free tier: 500MB database, 2GB bandwidth

### Google Gemini API (optional)
- Get from: [ai.google.dev](https://ai.google.dev)
- Free tier: 1,500 requests/day
- No credit card required

### NewsAPI (optional)
- Get from: [newsapi.org/register](https://newsapi.org/register)
- Free tier: 100 requests/day
- No credit card required

## Project Structure

```
iscroll/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Feed screen
│   │   └── saved.tsx      # Subscriptions screen
│   ├── rabbit-hole/       # Rabbit hole views
│   │   └── [id].tsx
│   └── episode/           # Episode readers
│       └── [id].tsx
├── components/            # UI Components
│   ├── Badge.tsx          # Status badges
│   ├── FeedCard.tsx       # Feed item cards
│   ├── RabbitHoleView.tsx # Full rabbit hole display
│   └── EpisodeView.tsx    # Episode content
├── constants/
│   └── colors.ts          # Design tokens
├── hooks/
│   ├── useFeed.ts         # Feed algorithm
│   └── useSubscriptions.ts# Subscription state
├── lib/
│   ├── supabase.ts        # Database client
│   ├── rabbit-holes.ts    # Database operations
│   ├── ai-content.ts      # AI generation
│   └── news-aggregator.ts # News fetching
├── scripts/
│   └── seed-content.ts    # Content seeding
├── supabase/
│   └── schema.sql         # Database schema
└── types/
    └── index.ts           # TypeScript types
```

## Database Schema

### Core Tables

- **rabbit_holes**: Topics users can follow
- **episodes**: Content pieces within rabbit holes
- **subscriptions**: User follows
- **rabbit_hole_topics**: Topic tags
- **user_progress**: Reading tracking

### Feed Algorithm

The feed prioritizes content in this order:
1. **Subscription updates** (30%) - New episodes in followed topics
2. **Continue watching** (20%) - Unfinished rabbit holes
3. **Discovery** (40%) - New topics based on interests
4. **Trending** (10%) - Popular content

## Design System

### Colors

```typescript
// Engagement colors
urgentRed: '#f91880',     // NEW badges
liveGreen: '#00ba7c',     // LIVE content
seriesBlue: '#7856ff',    // SERIES badge
warningAmber: '#ffb84d',  // Update counts

// Base colors
background: '#000000',
accent: '#1d9bf0',
```

### Badge Types

- `NEW` - Unread content (hot pink)
- `LIVE` - Ongoing updates (green)
- `SERIES` - Structured courses (purple)
- `UPDATES` - Episode counts (amber)

## Seed Content

The seed script includes 5 pre-written rabbit holes:

1. **The AI Alignment Problem** (live) - AI safety and ethics
2. **How Nuclear Fusion Works** (live) - Physics breakthrough
3. **The Fall of Rome** (series) - Historical journey
4. **Your Brain on Dopamine** (series) - Neuroscience
5. **Race to Quantum Computing** (live) - Tech frontier

Each rabbit hole has 2-3 episodes with narrative content.

## Scripts

```bash
# Start development server
npm start

# Seed database with content
npm run seed

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Migration from v1.0

The v2.0 update maintains backward compatibility:
- `saved_items` table supports both Wikipedia IDs and episode IDs
- Legacy Wikipedia feed is available via `useLegacyFeed()` hook
- Existing routes (`/thread/[id]`) still work

## Roadmap

### Phase 2
- [ ] Spaced repetition system
- [ ] Push notifications
- [ ] User authentication

### Phase 3
- [ ] User-generated content
- [ ] Social features
- [ ] Branching narratives

## Cost Breakdown

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Supabase | 500MB DB, 2GB bandwidth | $0 |
| Google Gemini | 1,500 requests/day | $0 |
| NewsAPI | 100 requests/day | $0 |
| Expo | Unlimited | $0 |
| **Total** | | **$0** |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - feel free to use this for learning or building your own apps!

---

Built with ❤️ using Expo, React Native, and Supabase
