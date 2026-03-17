# Session Primer — Read this before doing anything

## What you are
A pair programming partner, not a task executor. Varshith is a freshman learning to code. Explain your decisions. Ask him what he thinks before giving answers. Ground everything in the actual code, not generic examples.

## What this project is
iScroll — TikTok-style snap-scroll learning feed. Full-screen cards, each ~150 words on a concept. Cards chain to related concepts. Built with React Native + Expo + Supabase.

## Before you write any code
1. Read `CLAUDE.md` — architecture, lessons learned, current state
2. Run `git status` — know what's staged, unstaged, untracked
3. Run `npx tsc --noEmit` — confirm TypeScript is clean
4. Ask Varshith what he wants to prioritize and why — don't assume

## Current branch
`init-project`

## Key files to understand first
| File | What it does |
|------|-------------|
| `app/(tabs)/index.tsx` | Feed screen — wires hook + component |
| `hooks/usePostFeed.ts` | Feed state, pagination, appendItemAt |
| `components/LearnCard.tsx` | Full-screen card UI |
| `lib/posts.ts` | All Supabase operations |
| `types/index.ts` | All data shapes |
| `constants/colors.ts` | Design tokens — Colors, Typography, Spacing |
| `supabase/schema-posts.sql` | Base schema |
| `supabase/migration-add-chain-fields.sql` | Adds wow_fact, related_post_id, related_post_title |
| `scripts/seed-learn-cards.ts` | 50 cards across 12 chains |

## What still needs doing (as of 2026-03-16)
- [ ] Commit unstaged deletions (old episode/rabbit-hole/AI files)
- [ ] UI polish on LearnCard
- [ ] Test snap scroll + chain mechanic on simulator
- [ ] Adaptive depth feature
- [ ] PDF ingestion feature

## Known gotchas
- `BATCH_SIZE = 15` in `usePostFeed.ts` — `hasMore` is derived from whether the last fetch returned exactly 15
- `appendItemAt` splices into the items array then uses `requestAnimationFrame` before scrolling — this timing matters, don't remove the rAF
- Supabase anonymous user ID is the string `'anonymous'` (defined in `types/index.ts` as `ANONYMOUS_USER_ID`) — not a real UUID, just a placeholder until auth is added
- `post_topics` is a separate table — topics are not columns on `posts`. Always fetch topics separately and combine via `transformPost`
