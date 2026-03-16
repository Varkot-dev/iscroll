# iScroll — Claude Engineering Guide

## What this file is
Two things in one:
1. A primer for any agent starting a new session — read this first, understand the project, then act
2. A living engineering log — lessons learned, mistakes made, decisions justified. Updated as we build.

---

## Project in one sentence
iScroll is a TikTok-style full-screen snap-scroll learning feed. Each card is a ~150 word concept. Cards chain into related concepts. Eventually: adaptive depth based on engagement, PDF ingestion, and inline animations.

---

## Current state (as of 2026-03-16)

### What's built
- Full-screen snap-scroll feed (`app/(tabs)/index.tsx`) using `FlatList` with `pagingEnabled`
- `LearnCard` component — title, content, SIGNAL callout box, chain button, bookmark
- `StarField` component — 80 twinkling stars using React Native `Animated` (not reanimated)
- Deep space UI theme — `#0a0a0f` background, `#a8b8d8` accent, minimal typography
- `usePostFeed` hook — cursor-based pagination, `appendItemAt` for mid-feed injection
- Chain mechanic — tap a link to inject the next related card directly after current position
- Save/unsave posts — persisted to Supabase `saved_posts` table
- Saved tab — display-only list of bookmarked posts
- Supabase schema — `posts`, `post_topics`, `saved_posts` tables + chain columns
- Seed script — 50 learn cards across 12 topic chains
- CLAUDE.md + PRIMER.md — session onboarding and engineering log

### What's NOT done yet
- Text brightness fix (body text `textSecondary` too dim)
- Wikipedia scraper — auto-generate cards from real articles (free, no API key)
- Series/context system — group cards by article, `series_id`, `series_position`
- "Need context?" panel — horizontal chain map showing position in series
- Expand/collapse card mechanic with image
- Adaptive depth feed algorithm
- PDF ingestion
- Animations

### Branch
`init-project` — PRs merge to `main`

---

## Architecture

### File responsibilities — one job per file
```
lib/posts.ts          — ONLY talks to Supabase. No React, no UI.
hooks/usePostFeed.ts  — ONLY manages feed state and pagination logic.
components/LearnCard  — ONLY renders one card. No data fetching.
app/(tabs)/index.tsx  — ONLY wires hook + component together.
types/index.ts        — ONLY defines data shapes.
```

If a file's job description has "and" in it, it needs to be split.

### Data flow
```
Supabase → lib/posts.ts → usePostFeed → index.tsx → LearnCard
```

### Key patterns
- **Cursor-based pagination** — anchor to last seen post's `publishedAt + id`, not offset. Prevents duplicates when new content is inserted mid-session.
- **appendItemAt** — injects a chained card at `currentIndex + 1` in the items array, then scrolls to it. Avoids full feed reload.
- **transformPost** — walls off raw DB column names (`wow_fact`) from app camelCase (`wowFact`). If DB schema changes, only `transformPost` needs updating.

### Database tables
- `posts` — id, title, content, summary, wow_fact, related_post_id, related_post_title, published_at
- `post_topics` — post_id, topic (separate table — a post can have many topics)
- `saved_posts` — user_id, post_id, saved_at
- `engagement_events` — user_id, post_id, event_type, duration_ms, created_at

### Database views
- `topic_engagement_scores` — aggregated per user per topic: score (weighted), event_count, last_engaged_at

---

## Product vision (long term)
1. **Adaptive depth** — track engagement (time on card, chain taps, saves) → serve progressively deeper content on engaged topics
2. **PDF/document ingestion** — user uploads textbook or notes → Claude chunks into learn cards → cards enter the feed mixed with general content
3. **Animations** — 3blue1brown-style math animations. Most viable path: pre-render server-side with Manim (Python) → embed as video in cards. In-app rendering via Motion Canvas + expo-skia is possible but high effort.

---

## Engineering lessons learned

### 2026-03-16
- **Don't run migrations before the base schema exists.** The `migration-add-chain-fields.sql` failed with "relation posts does not exist" because `schema-posts.sql` had never been run on the Supabase project. Always confirm base tables exist before running migrations. In future: add a comment at the top of migration files stating which schema version they depend on.
- **Stage deletions explicitly.** When committing a refactor that deletes many files, verify `git status` shows deletions are staged before committing. In this session, old episode/rabbit-hole files were deleted locally but not staged — they persisted as unstaged deletions across the commit.
- **Pre-existing TS errors should be fixed immediately.** Found two pre-existing TypeScript errors (`Typography.normal` duplicate key, `Badge.tsx` never type) that were unrelated to our changes but still needed fixing before `tsc --noEmit` passed. Don't leave broken types in the codebase even if you didn't introduce them.
- **Non-critical operations must never throw.** `lib/engagement.ts` catches all errors and logs warnings instead. A failed analytics write should never crash the user experience. Pattern: wrap in try/catch, console.warn, return gracefully.
- **Use refs not state for mutexes.** `loadingMoreRef` in `usePostFeed` prevents stacked fetches from rapid scrolling. A `useRef` is the right tool here because changing it shouldn't trigger a re-render — it's an internal implementation detail, not UI state.
- **Build the data layer before the UI layer.** Engagement tracking infrastructure (table, view, lib functions) was built before any UI wires into it. When UI work starts, the plumbing is already there. Don't design UI and data simultaneously.
- **Don't use react-native-reanimated for background effects in Expo Go.** The reanimated native binary version in Expo Go often mismatches the JS version after SDK upgrades. For non-critical animations like StarField, use React Native's built-in `Animated` API instead — zero native dependency, works everywhere.
- **Expo SDK upgrades require peer dep flags.** `npm install expo@~54.0.0 --legacy-peer-deps` is the reliable upgrade path. `npx expo install --fix` alone fails when there are peer conflicts.
- **Always pin reanimated to the Expo SDK compatible version.** After SDK upgrade, run `npx expo install react-native-reanimated` (not `npm install`) to get the correct version. Never manually install `react-native-worklets` — it's an internal dep of reanimated v4 and causes version mismatches in Expo Go.
- **Seed scripts need ES module compatible imports.** When `package.json` has `"type": "module"` or tsconfig targets ESM, `require()` and `__dirname` are unavailable. Use `import` and `fileURLToPath(import.meta.url)` instead. Run with `ts-node --esm`.
- **MASTER GUIDELINES.md is the source of truth for engineering principles.** Key rules: ship smallest working slice first (Gall's Law), build only what's needed now (YAGNI), data integrity enforced at DB layer, abstract only after third repetition, non-critical ops never throw. Read it at the start of every session.

---

## How to work with Varshith
- He is a freshman learning to code. Explain decisions, don't just make them.
- Ask him what he thinks before giving the answer — he learns by reasoning first.
- He wants to eventually work as a peer engineer, not just direct an AI. Treat conversations as pair programming, not task delegation.
- Keep explanations grounded in the actual code we've written, not generic examples.
- He has good product instincts. Trust them.
