/**
 * Wikipedia scraper — generates learn cards from real articles
 *
 * Usage: npm run scrape
 *
 * For each topic:
 * 1. Fetch Wikipedia article via free REST API (no key needed)
 * 2. Split into sections → one card per section
 * 3. Check source_url for duplicates before inserting
 * 4. Insert cards with series_id grouping them together
 * 5. Wire related_post_id chain between them
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Topics to scrape
// ---------------------------------------------------------------------------

const TOPICS: { slug: string; topics: string[]; wikipediaTitle: string }[] = [
  // EE
  { slug: 'fourier-transform', topics: ['mathematics', 'ee'], wikipediaTitle: 'Fourier_transform' },
  { slug: 'phase-locked-loop', topics: ['ee', 'technology'], wikipediaTitle: 'Phase-locked_loop' },
  { slug: 'skin-effect', topics: ['ee', 'physics'], wikipediaTitle: 'Skin_effect' },
  { slug: 'switched-mode-power-supply', topics: ['ee', 'technology'], wikipediaTitle: 'Switched-mode_power_supply' },
  { slug: 'nyquist-shannon', topics: ['ee', 'mathematics'], wikipediaTitle: 'Nyquist%E2%80%93Shannon_sampling_theorem' },
  // CS
  { slug: 'b-tree', topics: ['cs', 'technology'], wikipediaTitle: 'B-tree' },
  { slug: 'cap-theorem', topics: ['cs', 'technology'], wikipediaTitle: 'CAP_theorem' },
  { slug: 'bloom-filter', topics: ['cs', 'mathematics'], wikipediaTitle: 'Bloom_filter' },
  { slug: 'copy-on-write', topics: ['cs', 'technology'], wikipediaTitle: 'Copy-on-write' },
  { slug: 'crdt', topics: ['cs', 'technology'], wikipediaTitle: 'Conflict-free_replicated_data_type' },
  // AI
  { slug: 'attention-mechanism', topics: ['ai', 'cs'], wikipediaTitle: 'Attention_(machine_learning)' },
  { slug: 'backpropagation', topics: ['ai', 'cs'], wikipediaTitle: 'Backpropagation' },
  { slug: 'quantization-ml', topics: ['ai', 'cs'], wikipediaTitle: 'Quantization_(signal_processing)' },
  { slug: 'rlhf', topics: ['ai', 'cs'], wikipediaTitle: 'Reinforcement_learning_from_human_feedback' },
  { slug: 'mixture-of-experts', topics: ['ai', 'cs'], wikipediaTitle: 'Mixture_of_experts' },
];

// ---------------------------------------------------------------------------
// Wikipedia API
// ---------------------------------------------------------------------------

type WikiSection = {
  title: string;
  content: string;
};

type WikiArticle = {
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
  sections: WikiSection[];
};

async function fetchWikipediaArticle(wikipediaTitle: string): Promise<WikiArticle | null> {
  try {
    // Fetch thumbnail via summary endpoint
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}`,
      { headers: { 'User-Agent': 'iScroll/1.0 (learning app)' } }
    );
    const summaryData = summaryRes.ok ? await summaryRes.json() as {
      title: string;
      thumbnail?: { source: string };
      content_urls: { desktop: { page: string } };
    } : null;

    const sourceUrl = summaryData?.content_urls?.desktop?.page
      ?? `https://en.wikipedia.org/wiki/${wikipediaTitle}`;
    const thumbnailUrl = summaryData?.thumbnail?.source ?? null;

    // Fetch full plain-text article via action API
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikipediaTitle}&prop=extracts&explaintext=true&exsectionformat=wiki&format=json&origin=*`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'User-Agent': 'iScroll/1.0 (learning app)' },
    });
    if (!apiRes.ok) {
      console.warn(`  ⚠ API fetch failed for ${wikipediaTitle}: ${apiRes.status}`);
      return null;
    }

    const apiData = await apiRes.json() as {
      query: { pages: Record<string, { title: string; extract?: string }> };
    };
    const page = Object.values(apiData.query.pages)[0];
    if (!page?.extract) {
      console.warn(`  ⚠ No extract for ${wikipediaTitle}`);
      return null;
    }

    const title = page.title;
    const fullText = cleanWikiText(page.extract);

    // Split into sections by == Heading == markers
    const rawSections: WikiSection[] = [];
    const parts = fullText.split(/\n(={2,3}[^=]+={2,3})\n/);

    // parts[0] is intro, then alternating: heading, content, heading, content...
    const introText = parts[0].trim();
    if (introText.length > 100) {
      rawSections.push({ title, content: introText });
    }

    for (let i = 1; i < parts.length - 1; i += 2) {
      const heading = parts[i].replace(/={2,3}/g, '').trim();
      const content = parts[i + 1]?.trim() ?? '';
      // Skip short sections, references, see-also, notes, external links
      const skip = ['see also', 'references', 'notes', 'external links', 'further reading', 'bibliography'];
      if (content.length > 200 && !skip.some(s => heading.toLowerCase().includes(s))) {
        rawSections.push({ title: heading, content });
      }
    }

    // Limit to 6 sections, trim each to ~700 chars ending on a sentence
    const sections = rawSections
      .slice(0, 6)
      .map(sec => ({
        title: sec.title,
        content: trimToSentence(sec.content, 700),
      }))
      .filter(sec => sec.content.length > 100);

    return { title, summary: introText.slice(0, 200), thumbnailUrl, sourceUrl, sections };
  } catch (err) {
    console.warn(`  ⚠ Error fetching ${wikipediaTitle}:`, err);
    return null;
  }
}

// Clean Wikipedia plain text — strip math, citations, and other artifacts
function cleanWikiText(text: string): string {
  let cleaned = text;

  // Strip inline math expressions: $...$, $$...$$, \(...\), \[...\]
  cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$/g, '');
  cleaned = cleaned.replace(/\$[^$\n]*?\$/g, '');
  cleaned = cleaned.replace(/\\\[[\s\S]*?\\\]/g, '');
  cleaned = cleaned.replace(/\\\([\s\S]*?\\\)/g, '');

  // Strip {\displaystyle ...} and similar LaTeX environments — multi-pass for nesting
  for (let i = 0; i < 8; i++) {
    cleaned = cleaned.replace(/\{[^{}]*\}/g, '');
  }
  // Catch any remaining { or } stragglers
  cleaned = cleaned.replace(/[{}]/g, '');

  // Strip LaTeX commands: \alpha, \sum, \frac, etc.
  cleaned = cleaned.replace(/\\[a-zA-Z]+\s*/g, '');

  // Strip subscripts and superscripts: w_i, x^2, f_{ij}
  cleaned = cleaned.replace(/[_^]\{?[a-zA-Z0-9,\s]*\}?/g, '');

  return cleaned
    .replace(/\[[0-9,\s]+\]/g, '')           // citation numbers [1] [1,2] [23]
    .replace(/\[citation needed\]/gi, '')     // [citation needed]
    .replace(/\[note [0-9]+\]/gi, '')         // [note 1]
    .replace(/\(listen\)/gi, '')              // audio links
    .replace(/^={2,}\s*.+\s*={2,}$/gm, '')   // leftover == section headers ==
    .replace(/\n{3,}/g, '\n\n')              // collapse excessive newlines
    .replace(/[ \t]{2,}/g, ' ')              // collapse spaces
    .replace(/\s*\n\s*/g, ' ')               // collapse newlines into spaces within paragraphs
    .replace(/\s{2,}/g, ' ')                 // any remaining double spaces
    .trim();
}

// Trim text to maxChars but end on a complete sentence
function trimToSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const trimmed = text.slice(0, maxChars);
  const lastPeriod = trimmed.lastIndexOf('.');
  return lastPeriod > maxChars * 0.5 ? trimmed.slice(0, lastPeriod + 1) : trimmed;
}

// Generate a simple wow fact from content (first surprising-sounding sentence)
function extractWowFact(content: string): string {
  const sentences = content.split(/(?<=[.!?])\s+/);
  // Pick the longest sentence as the "wow fact" — usually most information-dense
  const sorted = [...sentences].sort((a, b) => b.length - a.length);
  return sorted[0]?.slice(0, 200) || sentences[0] || '';
}

// ---------------------------------------------------------------------------
// Duplicate check
// ---------------------------------------------------------------------------

async function urlAlreadyExists(sourceUrl: string): Promise<boolean> {
  const { data } = await supabase
    .from('posts')
    .select('id')
    .eq('source_url', sourceUrl)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Insert helpers
// ---------------------------------------------------------------------------

async function insertCard(card: {
  title: string;
  content: string;
  summary: string;
  wowFact: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
  topics: string[];
  seriesId: string;
  seriesPosition: number;
  seriesTitle: string;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: card.title,
      content: card.content,
      summary: card.summary,
      wow_fact: card.wowFact,
      thumbnail_url: card.thumbnailUrl,
      source_url: card.sourceUrl,
      series_id: card.seriesId,
      series_position: card.seriesPosition,
      series_title: card.seriesTitle,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.warn(`  ⚠ Insert failed for "${card.title}": ${error.message}`);
    return null;
  }
  return data.id as string;
}

async function insertTopics(postId: string, topics: string[]): Promise<void> {
  if (!topics.length) return;
  const { error } = await supabase
    .from('post_topics')
    .insert(topics.map(topic => ({ post_id: postId, topic })));
  if (error) console.warn(`  ⚠ Topics insert warning: ${error.message}`);
}

async function wireChain(postId: string, nextId: string, nextTitle: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ related_post_id: nextId, related_post_title: nextTitle })
    .eq('id', postId);
  if (error) console.warn(`  ⚠ Chain wire failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function scrapeArticle(entry: typeof TOPICS[number]): Promise<void> {
  console.log(`\n📖 Scraping: ${entry.wikipediaTitle}`);

  const article = await fetchWikipediaArticle(entry.wikipediaTitle);
  if (!article || article.sections.length === 0) {
    console.log(`  ✗ No content found, skipping`);
    return;
  }

  // Duplicate check — use the article's source URL
  if (await urlAlreadyExists(article.sourceUrl)) {
    console.log(`  ✓ Already in DB, skipping`);
    return;
  }

  const seriesId = randomUUID();
  const insertedIds: string[] = [];

  // Pass 1 — insert all cards
  for (let i = 0; i < article.sections.length; i++) {
    const section = article.sections[i];
    const id = await insertCard({
      title: section.title,
      content: section.content,
      summary: section.content.slice(0, 150) + '...',
      wowFact: extractWowFact(section.content),
      thumbnailUrl: i === 0 ? article.thumbnailUrl : null, // only first card gets image
      sourceUrl: article.sourceUrl,
      topics: entry.topics,
      seriesId,
      seriesPosition: i + 1,
      seriesTitle: article.title,
    });

    if (id) {
      await insertTopics(id, entry.topics);
      insertedIds.push(id);
      console.log(`  ✓ Card ${i + 1}/${article.sections.length}: "${section.title}"`);
    }
  }

  // Pass 2 — wire chains
  for (let i = 0; i < insertedIds.length - 1; i++) {
    await wireChain(
      insertedIds[i],
      insertedIds[i + 1],
      article.sections[i + 1].title
    );
  }

  console.log(`  ⇒ ${insertedIds.length} cards chained as series "${article.title}"`);
}

async function main() {
  console.log(`Scraping ${TOPICS.length} topics from Wikipedia...`);

  for (const entry of TOPICS) {
    await scrapeArticle(entry);
    // Small delay to be polite to Wikipedia's servers
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
