/**
 * TYPE DEFINITIONS
 * 
 * These define the "shape" of our data. TypeScript uses these to:
 * - Provide autocomplete in your editor
 * - Catch errors (like typos in property names)
 * - Document what data looks like
 * 
 * SYNTAX GUIDE:
 * - 'type' or 'interface' = defines a shape
 * - property: type = this property is required
 * - property?: type = this property is optional (the ? makes it optional)
 * - string | number = can be either string OR number (union type)
 */

// ==================================================
// WIKIPEDIA API TYPES
// ==================================================

/**
 * Article summary from Wikipedia's REST API
 * 
 * This matches what Wikipedia returns from:
 * https://en.wikipedia.org/api/rest_v1/page/random/summary
 */
export type WikipediaArticle = {
  // Page identifier (used for fetching full content)
  pageid: number;
  
  // Article title
  title: string;
  
  // Short text extract (the summary)
  extract: string;
  
  // Thumbnail image (optional - not all articles have images)
  thumbnail?: {
    source: string;  // URL to the image
    width: number;
    height: number;
  };
  
  // Full-size image (optional)
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  
  // URL to the Wikipedia page
  content_urls: {
    desktop: {
      page: string;  // Full article URL
    };
    mobile: {
      page: string;
    };
  };
  
  // Article description (very short, like a subtitle)
  description?: string;
};

/**
 * Full article content from Wikipedia
 * Used when expanding a card into a thread
 */
export type WikipediaFullArticle = {
  pageid: number;
  title: string;
  extract: string;           // Plain text summary
  extract_html?: string;     // HTML formatted summary (if available)
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string };
    mobile: { page: string };
  };
  // Additional sections (we'll parse these into thread format)
  sections?: ArticleSection[];
};

/**
 * A section of an article (for thread display)
 */
export type ArticleSection = {
  title: string;
  content: string;
  level: number;  // Heading level (1 = h1, 2 = h2, etc.)
};

// ==================================================
// APP DATA TYPES
// ==================================================

/**
 * A feed item (what we show in the scrolling feed)
 * Based on WikipediaArticle but simplified for our UI
 */
export type FeedItem = {
  // Unique identifier (Wikipedia page ID as string)
  id: string;
  
  // Display title
  title: string;
  
  // Short description/summary
  extract: string;
  
  // Image URL (optional)
  thumbnailUrl?: string;
  
  // Full Wikipedia URL
  wikipediaUrl: string;
  
  // Is this item saved/bookmarked?
  isSaved?: boolean;
};

/**
 * A saved item (stored in Supabase)
 */
export type SavedItem = {
  id: string;           // Supabase row ID
  wikipedia_id: string; // Wikipedia page ID
  title: string;
  extract?: string;
  thumbnail_url?: string;
  saved_at: string;     // ISO timestamp
};

// ==================================================
// API RESPONSE TYPES
// ==================================================

/**
 * Generic API response wrapper
 * Helps handle success/error states consistently
 */
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};
