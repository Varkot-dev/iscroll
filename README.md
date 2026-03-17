# iScroll

A TikTok-style full-screen snap-scroll learning feed built with React Native + Expo. Each card is a ~150-word concept. Cards chain into related concepts. The feed adapts based on engagement signals.

---

## Architecture

### Data Flow
```
Supabase → lib/posts.ts → usePostFeed → index.tsx → LearnCard
```

Each layer has exactly one job:

| File | Responsibility |
|------|---------------|
| `lib/posts.ts` | Supabase queries only. No React, no UI. |
| `hooks/usePostFeed.ts` | Feed state and pagination logic only. |
| `components/LearnCard.tsx` | Renders one card. No data fetching. |
| `app/(tabs)/index.tsx` | Wires hook + component together. |
| `types/index.ts` | Data shapes only. |

### Pagination

Cursor-based pagination anchored to `(published_at, id)` — not offset. Prevents duplicates when cards are injected mid-session via the chain mechanic. `loadingMoreRef` is a `useRef` mutex (not state) to block stacked fetches from rapid scrolling without triggering re-renders.

### Chain Mechanic

Tapping "Explore → X" on a card calls `appendItemAt(post, currentIndex)` — splices the related card directly after the current position in the feed array, then scrolls to it. If the card is already in the feed, scrolls to the existing position. No feed reload.

### Engagement Tracking

Every `view` (>1s dwell), `chain_tap`, `save`, and `unsave` writes to `engagement_events`. A Supabase view (`topic_engagement_scores`) aggregates weighted scores per user per topic. The feed reads this on load to identify "in orbit" topics and surfaces that signal on the card UI.

Non-critical: all engagement writes are wrapped in try/catch and log warnings on failure. A failed track event never crashes the UX.

---

## Database Schema

```sql
posts
  id uuid PK
  title text
  content text
  summary text
  wow_fact text
  depth integer          -- 1 (surface) to 5 (expert)
  source_url text
  related_post_id uuid   -- FK posts(id), drives chain mechanic
  related_post_title text -- denormalized for chain button display
  series_id uuid         -- groups cards from the same source article
  series_position integer
  series_total integer
  series_title text
  published_at timestamptz

post_topics
  post_id uuid FK
  topic text
  kind text              -- 'topic' | 'subtopic'

saved_posts
  user_id text
  post_id uuid FK
  saved_at timestamptz

engagement_events
  user_id text
  post_id uuid FK
  event_type text        -- 'view' | 'chain_tap' | 'save' | 'unsave'
  duration_ms integer    -- only for view events
  created_at timestamptz

-- Materialized view
topic_engagement_scores
  user_id text
  topic text
  score numeric          -- weighted aggregate
  event_count integer
  last_engaged_at timestamptz
```

### Constraints
- `related_post_id` CHECK `(related_post_id IS DISTINCT FROM id)` — no self-chains
- `related_post_id` ON DELETE SET NULL — deleting a card does not cascade

---

## Key Design Decisions

**Why cursor pagination over offset?** Offset pagination breaks when cards are inserted mid-session via chain injections. A `(published_at, id)` cursor is stable regardless of insertions.

**Why `useRef` for the loading mutex?** Changing a ref does not trigger a re-render. A loading mutex is an implementation detail, not UI state — `useState` would cause unnecessary re-renders on every scroll event.

**Why `transformPost`?** Walls off raw DB column names (`wow_fact`, `related_post_id`) from app camelCase. If the schema changes, only `transformPost` needs updating.

**Why pass serialized post to detail screen?** The detail screen receives the full post as a JSON param — no extra DB fetch on tap. The data is already in memory from the feed.

**Why `seriesBlue` for the progress bar?** Series context is distinct from topic engagement (accent). Using a separate color (`#7890c8`) makes the two systems visually separable at a glance.

---

## Feed UI

### LearnCard
Full-screen card with:
- Series progress bar — fills left to right based on `seriesPosition / seriesTotal`
- Topic pills — filled background + "IN YOUR ORBIT" badge when user has high engagement on that topic
- Title, content, SIGNAL callout box (`wowFact`)
- Chain button — injects next related card into feed at current position
- Bookmark toggle — persists to `saved_posts`
- Tap anywhere on card body — opens detail screen

### Detail Screen (`app/post/[id].tsx`)
- Full content
- DIVE DEEPER — filled subtopic pills
- SIGNAL callout
- Source link via `Linking.openURL`
- Related by topic rail — horizontal strip of up to 5 cards sharing the same primary topic

### Saved Tab
- List of bookmarked posts with topic, title, summary
- Pull to refresh
- Inline unsave

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

Create `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database

Run migrations in order in the Supabase SQL editor:

```
supabase/schema-posts.sql
supabase/migration-add-chain-fields.sql
supabase/migration-add-series-fields.sql
```

### 4. Seed

```bash
npm run seed
```

Inserts 50 learn cards across 12 topic chains. Two-pass: insert all cards first to collect UUIDs, then wire `related_post_id` chain links in a second pass.

### 5. Start

```bash
npx expo start --clear
```

---

## Scripts

```bash
npm run seed              # seed 50 learn cards to Supabase
npx expo start            # start Metro bundler
npx expo start --clear    # start with cleared Metro cache
npx tsc --noEmit          # typecheck
```

---

## Stack

- **React Native** via Expo SDK 54
- **Expo Router** — file-based navigation
- **Supabase** — Postgres backend
- **TypeScript** — strict mode
- **react-native-safe-area-context**
- **@expo/vector-icons** — Ionicons

---

## Project Status

Active development. Current focus: Wikipedia scraper for auto-generating card chains from source articles, series context system for grouping cards by origin article, adaptive depth feed algorithm.
