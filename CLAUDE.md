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
- `LearnCard` component — title, content, wow fact callout, chain button, bookmark
- `usePostFeed` hook — cursor-based pagination, `appendItemAt` for mid-feed injection
- Chain mechanic — tap a link to inject the next related card directly after current position
- Save/unsave posts — persisted to Supabase `saved_posts` table
- Saved tab — display-only list of bookmarked posts
- Supabase schema — `posts`, `post_topics`, `saved_posts` tables + chain columns
- Seed script — 50 learn cards across 12 topic chains

### What's NOT done yet
- UI polish on LearnCard (currently functional but visually rough)
- Deleted old files (episode/rabbit-hole era) staged but not committed
- Adaptive depth (track engagement, serve deeper content)
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

---

## How to work with Varshith
- He is a freshman learning to code. Explain decisions, don't just make them.
- Ask him what he thinks before giving the answer — he learns by reasoning first.
- He wants to eventually work as a peer engineer, not just direct an AI. Treat conversations as pair programming, not task delegation.
- Keep explanations grounded in the actual code we've written, not generic examples.
- He has good product instincts. Trust them.
