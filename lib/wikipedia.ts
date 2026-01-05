/**
 * WIKIPEDIA API WRAPPER
 * 
 * This file contains functions to fetch content from Wikipedia.
 * Wikipedia has a free API that doesn't require authentication!
 * 
 * KEY CONCEPTS:
 * - fetch(): Makes HTTP requests to get data
 * - async/await: Handles asynchronous operations (things that take time)
 * - try/catch: Handles errors gracefully
 * 
 * API DOCUMENTATION:
 * https://en.wikipedia.org/api/rest_v1/
 */

import { WikipediaArticle, FeedItem } from '@/types';

// Base URL for Wikipedia's REST API
const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';

/**
 * Fetch a single random article summary from Wikipedia
 * 
 * HOW IT WORKS:
 * 1. Send request to Wikipedia's "random" endpoint
 * 2. Wikipedia picks a random article and sends back its summary
 * 3. We return the data (or null if something went wrong)
 */
async function fetchRandomArticle(): Promise<WikipediaArticle | null> {
  try {
    // fetch() sends an HTTP GET request to this URL
    const response = await fetch(`${WIKIPEDIA_API}/page/random/summary`);
    
    // Check if the request was successful (status 200-299)
    if (!response.ok) {
      console.error('Wikipedia API error:', response.status);
      return null;
    }
    
    // Parse the JSON response into a JavaScript object
    const data: WikipediaArticle = await response.json();
    return data;
    
  } catch (error) {
    // Something went wrong (network error, etc.)
    console.error('Error fetching random article:', error);
    return null;
  }
}

/**
 * Fetch multiple random articles for the feed
 * 
 * @param count - How many articles to fetch (default: 10)
 * @returns Array of FeedItem objects ready for display
 * 
 * HOW IT WORKS:
 * 1. Create an array of promises (pending API calls)
 * 2. Wait for all of them to complete with Promise.all()
 * 3. Filter out any failures (nulls)
 * 4. Transform Wikipedia data into our FeedItem format
 */
export async function getRandomArticles(count: number = 10): Promise<FeedItem[]> {
  try {
    // Create an array of fetch promises
    // Array(count).fill(null) creates [null, null, ...] with 'count' items
    // .map() transforms each null into a fetch call
    const promises = Array(count)
      .fill(null)
      .map(() => fetchRandomArticle());
    
    // Wait for ALL fetches to complete
    // Promise.all() runs them in parallel (faster than one-by-one)
    const articles = await Promise.all(promises);
    
    // Filter out any null results (failed fetches)
    // Then transform each article into our FeedItem format
    const feedItems: FeedItem[] = articles
      .filter((article): article is WikipediaArticle => article !== null)
      .map(transformToFeedItem);
    
    return feedItems;
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Fetch a specific article by its title
 * 
 * @param title - The Wikipedia article title
 * @returns The article data or null if not found
 * 
 * Used when user taps a card to see the full thread
 */
export async function getArticleByTitle(title: string): Promise<WikipediaArticle | null> {
  try {
    // Encode the title for URL (spaces become %20, etc.)
    const encodedTitle = encodeURIComponent(title);
    
    const response = await fetch(`${WIKIPEDIA_API}/page/summary/${encodedTitle}`);
    
    if (!response.ok) {
      console.error('Wikipedia API error:', response.status);
      return null;
    }
    
    const data: WikipediaArticle = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Get the full HTML content of an article
 * Used for the expanded thread view
 * 
 * @param title - The Wikipedia article title
 * @returns HTML string of the article content
 */
export async function getArticleContent(title: string): Promise<string | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    
    const response = await fetch(`${WIKIPEDIA_API}/page/html/${encodedTitle}`);
    
    if (!response.ok) {
      console.error('Wikipedia API error:', response.status);
      return null;
    }
    
    // This returns HTML, not JSON
    const html = await response.text();
    return html;
    
  } catch (error) {
    console.error('Error fetching article content:', error);
    return null;
  }
}

/**
 * Get related articles (articles linked from this one)
 * Useful for "related concepts" feature
 * 
 * @param title - The Wikipedia article title
 * @returns Array of related article titles
 */
export async function getRelatedArticles(title: string): Promise<string[]> {
  try {
    const encodedTitle = encodeURIComponent(title);
    
    // Use the MediaWiki API for links
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&titles=${encodedTitle}&prop=links&pllimit=10&format=json&origin=*`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0] as any;
    const links = page?.links || [];
    
    return links.map((link: any) => link.title);
    
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

// ==================================================
// HELPER FUNCTIONS
// ==================================================

/**
 * Transform Wikipedia API response into our FeedItem format
 * 
 * This keeps our app code cleaner - we work with FeedItem everywhere,
 * and only this file knows about Wikipedia's specific format.
 */
function transformToFeedItem(article: WikipediaArticle): FeedItem {
  return {
    id: article.pageid.toString(),
    title: article.title,
    extract: article.extract || 'No description available.',
    thumbnailUrl: article.thumbnail?.source,
    wikipediaUrl: article.content_urls.desktop.page,
    isSaved: false, // Will be updated when we check saved items
  };
}

/**
 * Clean and truncate text for display
 * 
 * @param text - Raw text from Wikipedia
 * @param maxLength - Maximum characters (default: 200)
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  
  // Find the last space before maxLength to avoid cutting words
  const lastSpace = text.lastIndexOf(' ', maxLength);
  const cutoff = lastSpace > 0 ? lastSpace : maxLength;
  
  return text.substring(0, cutoff) + '...';
}
