/**
 * NEWS AGGREGATOR - Automated content updates
 * 
 * Fetches news from NewsAPI and RSS feeds to trigger
 * automated content updates for "live" rabbit holes.
 * 
 * FREE TIER LIMITS:
 * - NewsAPI: 100 requests/day (no credit card required)
 * - RSS Feeds: Unlimited (free)
 * 
 * SETUP:
 * 1. Get NewsAPI key from https://newsapi.org/register
 * 2. Add to .env: EXPO_PUBLIC_NEWS_API_KEY=your_key_here
 */

import { RabbitHole } from '@/types';

// ==================================================
// CONFIGURATION
// ==================================================

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

// Topic to search query mapping
const TOPIC_QUERIES: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'ChatGPT', 'GPT', 'AI safety', 'LLM'],
  technology: ['tech', 'startup', 'Silicon Valley', 'innovation'],
  science: ['scientific discovery', 'research breakthrough', 'scientists'],
  physics: ['physics', 'quantum', 'particle physics', 'CERN'],
  space: ['NASA', 'SpaceX', 'space exploration', 'astronomy', 'Mars'],
  biology: ['biology', 'genetics', 'CRISPR', 'evolution'],
  psychology: ['psychology', 'neuroscience', 'brain research', 'mental health'],
  economics: ['economics', 'economy', 'markets', 'inflation', 'cryptocurrency'],
  history: ['historical discovery', 'archaeology', 'ancient'],
  environment: ['climate change', 'renewable energy', 'sustainability', 'carbon'],
};

// RSS feeds for supplemental content
const RSS_FEEDS: Record<string, string[]> = {
  general: [
    'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  ],
  tech: [
    'https://feeds.arstechnica.com/arstechnica/technology-lab',
    'https://www.theverge.com/rss/index.xml',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://phys.org/rss-feed/',
  ],
  ai: [
    'https://news.google.com/rss/search?q=artificial+intelligence',
  ],
};

// ==================================================
// TYPES
// ==================================================

export type NewsArticle = {
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
};

type NewsAPIResponse = {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
};

// ==================================================
// NEWSAPI FUNCTIONS
// ==================================================

/**
 * Fetch news from NewsAPI for a specific query
 */
export async function fetchNewsFromAPI(
  query: string,
  options: {
    pageSize?: number;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    language?: string;
    from?: string; // ISO date string
  } = {}
): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NewsAPI key not configured. Set EXPO_PUBLIC_NEWS_API_KEY in .env');
    return [];
  }

  const { pageSize = 5, sortBy = 'relevancy', language = 'en', from } = options;

  try {
    const params = new URLSearchParams({
      q: query,
      apiKey: NEWS_API_KEY,
      pageSize: String(pageSize),
      sortBy,
      language,
    });

    if (from) {
      params.append('from', from);
    }

    const response = await fetch(`${NEWS_API_URL}/everything?${params}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('NewsAPI error:', error);
      return [];
    }

    const data: NewsAPIResponse = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

/**
 * Fetch news relevant to a rabbit hole's topics
 */
export async function fetchNewsForRabbitHole(
  rabbitHole: RabbitHole,
  options: { pageSize?: number; daysBack?: number } = {}
): Promise<NewsArticle[]> {
  const { pageSize = 5, daysBack = 7 } = options;

  // Build search query from topics
  const queries = rabbitHole.topics.flatMap(topic => 
    TOPIC_QUERIES[topic.toLowerCase()] || [topic]
  );

  // Also include title keywords
  const titleWords = rabbitHole.title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3);
  
  const searchQuery = [...new Set([...queries, ...titleWords])]
    .slice(0, 5)
    .join(' OR ');

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysBack);

  return fetchNewsFromAPI(searchQuery, {
    pageSize,
    sortBy: 'relevancy',
    from: fromDate.toISOString().split('T')[0],
  });
}

// ==================================================
// RSS FUNCTIONS
// ==================================================

/**
 * Parse RSS feed (simple XML parser)
 * Note: For production, use a library like rss-parser
 */
export async function fetchRSSFeed(feedUrl: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) return [];

    const xml = await response.text();
    const articles: NewsArticle[] = [];

    // Simple regex-based XML parsing (use proper XML parser in production)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      
      const titleMatch = item.match(titleRegex);
      const descMatch = item.match(descRegex);
      const linkMatch = item.match(linkRegex);
      const dateMatch = item.match(pubDateRegex);

      if (titleMatch && linkMatch) {
        articles.push({
          title: titleMatch[1] || titleMatch[2] || '',
          description: descMatch?.[1] || descMatch?.[2] || '',
          url: linkMatch[1],
          publishedAt: dateMatch?.[1] || new Date().toISOString(),
          source: {
            id: null,
            name: new URL(feedUrl).hostname,
          },
        });
      }
    }

    return articles.slice(0, 10); // Limit results
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Fetch news from RSS feeds for a topic
 */
export async function fetchRSSForTopic(topic: string): Promise<NewsArticle[]> {
  const feeds = RSS_FEEDS[topic.toLowerCase()] || RSS_FEEDS.general;
  
  const results = await Promise.all(
    feeds.map(feed => fetchRSSFeed(feed))
  );

  return results.flat();
}

// ==================================================
// COMBINED FETCH (Hybrid approach)
// ==================================================

/**
 * Fetch news using NewsAPI first, fall back to RSS if limit reached
 */
export async function fetchNewsHybrid(
  rabbitHole: RabbitHole,
  options: { pageSize?: number } = {}
): Promise<NewsArticle[]> {
  const { pageSize = 5 } = options;

  // Try NewsAPI first
  const apiNews = await fetchNewsForRabbitHole(rabbitHole, { pageSize });
  
  if (apiNews.length >= pageSize) {
    return apiNews;
  }

  // Fall back to RSS for additional content
  const rssNews = await Promise.all(
    rabbitHole.topics.map(topic => fetchRSSForTopic(topic))
  );

  // Combine and deduplicate
  const allNews = [...apiNews, ...rssNews.flat()];
  const seen = new Set<string>();
  
  return allNews.filter(article => {
    const key = article.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, pageSize);
}

// ==================================================
// RELEVANCE FILTERING
// ==================================================

/**
 * Filter articles by relevance to a rabbit hole
 */
export function filterRelevantArticles(
  articles: NewsArticle[],
  rabbitHole: RabbitHole,
  minScore: number = 2
): NewsArticle[] {
  const keywords = [
    ...rabbitHole.topics,
    ...rabbitHole.title.toLowerCase().split(' '),
    ...rabbitHole.description.toLowerCase().split(' '),
  ].filter(w => w.length > 3);

  return articles.filter(article => {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    const score = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    return score >= minScore;
  });
}

// ==================================================
// HEALTH CHECK
// ==================================================

/**
 * Check if news services are configured and working
 */
export async function checkNewsHealth(): Promise<{
  newsAPI: { configured: boolean; working: boolean; error?: string };
  rss: { working: boolean };
}> {
  // Check NewsAPI
  let newsAPIResult = { configured: false, working: false, error: undefined as string | undefined };
  
  if (NEWS_API_KEY) {
    newsAPIResult.configured = true;
    try {
      const articles = await fetchNewsFromAPI('test', { pageSize: 1 });
      newsAPIResult.working = articles.length > 0;
    } catch (error) {
      newsAPIResult.error = error instanceof Error ? error.message : 'Unknown error';
    }
  } else {
    newsAPIResult.error = 'EXPO_PUBLIC_NEWS_API_KEY not set';
  }

  // Check RSS
  let rssWorking = false;
  try {
    const articles = await fetchRSSFeed(RSS_FEEDS.general[0]);
    rssWorking = articles.length > 0;
  } catch {
    rssWorking = false;
  }

  return {
    newsAPI: newsAPIResult,
    rss: { working: rssWorking },
  };
}
