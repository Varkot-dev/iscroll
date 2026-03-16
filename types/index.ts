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
// POST TYPES
// ==================================================

/**
 * A simple post - like a tweet, but with longer content
 * Just scroll and discover interesting topics
 */
export type Post = {
  id: string;
  title: string;                    // Post headline
  content: string;                  // Main content (300-800 words)
  topics: string[];                 // Topics: ['ai', 'cursor', 'claude', 'weather', 'physics', etc.]
  publishedAt: string;              // When it was published
  thumbnailUrl?: string;            // Optional image
  sourceUrl?: string;               // Optional source link
  summary?: string;                 // Brief summary for preview
  wowFact?: string;                 // Highlighted callout sentence
  relatedPostId?: string;           // UUID of the next card in the chain
  relatedPostTitle?: string;        // Denormalized for chain button display
};

// ==================================================
// FEED TYPES
// ==================================================

/**
 * A feed item - just a post (simple Twitter-like experience)
 */
export type FeedItem = {
  id: string;
  type: 'post';
  post: Post;
  reason?: string;                  // Optional: 'trending', 'fresh', etc.
};

// ==================================================
// SAVED ITEM TYPES
// ==================================================

/**
 * A saved/bookmarked post
 */
export type SavedItem = {
  id: string;
  userId: string;
  postId: string;

  // Display info (denormalized for quick rendering)
  title: string;
  summary?: string;
  thumbnailUrl?: string;

  // Timestamps
  savedAt: string;
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

/**
 * Paginated response for lists
 */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// ==================================================
// TOPIC TYPES
// ==================================================

/**
 * Predefined topic categories
 */
export const TOPICS = [
  'science',
  'technology',
  'history',
  'economics',
  'psychology',
  'physics',
  'biology',
  'ai',
  'space',
  'politics',
  'philosophy',
  'mathematics',
  'medicine',
  'environment',
  'culture',
] as const;

export type Topic = typeof TOPICS[number];

/**
 * Topic with metadata
 */
export type TopicInfo = {
  id: Topic;
  label: string;
  color: string;
  icon: string;
};

// ==================================================
// ENGAGEMENT TYPES
// ==================================================

/**
 * The types of things a user can do that signal interest in a topic.
 * Used to drive adaptive depth — more engagement = deeper content served.
 *
 * - 'view'       : card was visible on screen (logged with duration_ms)
 * - 'chain_tap'  : user tapped the chain button (strongest signal — active curiosity)
 * - 'save'       : user bookmarked the card
 * - 'unsave'     : user removed bookmark (weak negative signal)
 */
export type EngagementEventType = 'view' | 'chain_tap' | 'save' | 'unsave';

export type EngagementEvent = {
  userId: string;
  postId: string;
  eventType: EngagementEventType;
  durationMs?: number;   // only for 'view' events — how long card was visible
  topics: string[];      // denormalized from the post — lets us aggregate by topic without joins
};

// ==================================================
// UTILITY TYPES
// ==================================================

/**
 * Deep partial - makes all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * User identifier type (for future auth integration)
 */
export type UserId = string;

/**
 * Anonymous user constant
 */
export const ANONYMOUS_USER_ID = 'anonymous';
