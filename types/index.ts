/**
 * TYPE DEFINITIONS v2.0 - RABBIT HOLES
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
// RABBIT HOLE TYPES
// ==================================================

/**
 * Types of rabbit holes
 * - "series": Structured course with planned episodes (finite)
 * - "live": Ongoing topic with news-triggered updates (infinite)
 */
export type RabbitHoleType = 'series' | 'live';

/**
 * Status of a rabbit hole
 * - "active": New episodes can be added, currently running
 * - "completed": Series is finished (only for type="series")
 * - "upcoming": Teaser for coming soon content
 */
export type RabbitHoleStatus = 'active' | 'completed' | 'upcoming';

/**
 * A rabbit hole - a topic users can follow
 * Contains multiple episodes that form a narrative journey
 */
export type RabbitHole = {
  // Unique identifier (UUID)
  id: string;
  
  // Display title (e.g., "The Race to Nuclear Fusion")
  title: string;
  
  // Longer description of what this covers
  description: string;
  
  // FOMO-inducing teaser text shown in feed cards
  // e.g., "Scientists just achieved net energy gain for the third time..."
  hookText: string;
  
  // Type of content
  type: RabbitHoleType;
  
  // Current status
  status: RabbitHoleStatus;
  
  // Total number of episodes
  totalEpisodes: number;
  
  // Computed: Number of unread episodes for current user
  unreadEpisodes?: number;
  
  // Optional thumbnail image URL
  thumbnailUrl?: string;
  
  // Topic tags for categorization and discovery
  topics: string[];
  
  // Timestamps
  createdAt: string;
  lastUpdated: string;
  
  // Computed: Is the current user subscribed?
  isSubscribed?: boolean;
};

/**
 * Minimal rabbit hole info for list displays
 */
export type RabbitHoleSummary = Pick<RabbitHole, 
  'id' | 'title' | 'hookText' | 'type' | 'status' | 
  'totalEpisodes' | 'unreadEpisodes' | 'thumbnailUrl' | 'isSubscribed'
>;

// ==================================================
// EPISODE TYPES
// ==================================================

/**
 * Content format types for episodes
 */
export type EpisodeContentType = 'text' | 'video' | 'interactive';

/**
 * An episode - individual content piece within a rabbit hole
 * This is what users actually read/consume
 */
export type Episode = {
  // Unique identifier (UUID)
  id: string;
  
  // Which rabbit hole this belongs to
  rabbitHoleId: string;
  
  // Episode number (1, 2, 3, etc.)
  episodeNumber: number;
  
  // Episode title (e.g., "Chapter 1: The Beginning")
  title: string;
  
  // Main AI-generated narrative content (300-500 words)
  content: string;
  
  // Content format type
  contentType: EpisodeContentType;
  
  // When this episode was published
  publishedAt: string;
  
  // Is this a news-triggered update episode?
  isUpdate: boolean;
  
  // Source URL if from news aggregation
  sourceUrl?: string;
  
  // Brief summary for "previously on" sections
  summary?: string;
  
  // Computed: Has the current user read this?
  isRead?: boolean;
};

/**
 * Episode with parent rabbit hole info
 * Used when displaying episodes in context
 */
export type EpisodeWithRabbitHole = Episode & {
  rabbitHole: Pick<RabbitHole, 'id' | 'title' | 'type' | 'status'>;
};

// ==================================================
// SUBSCRIPTION TYPES
// ==================================================

/**
 * A user's subscription to a rabbit hole
 * Tracks following status and progress
 */
export type Subscription = {
  // Unique identifier
  id: string;
  
  // User identifier
  userId: string;
  
  // Which rabbit hole they're subscribed to
  rabbitHoleId: string;
  
  // When they subscribed
  subscribedAt: string;
  
  // Last episode they've seen (for unread calculations)
  lastSeenEpisode: number;
  
  // Notification preferences
  notifyNewEpisodes: boolean;
};

/**
 * Subscription with computed fields for UI
 */
export type SubscriptionWithDetails = Subscription & {
  // Rabbit hole details
  rabbitHole: RabbitHole;
  
  // Computed unread count
  unreadCount: number;
};

// ==================================================
// USER PROGRESS TYPES
// ==================================================

/**
 * User's reading progress on an episode
 */
export type UserProgress = {
  id: string;
  userId: string;
  episodeId: string;
  completedAt: string;
  readingTimeSeconds?: number;
};

// ==================================================
// FEED TYPES
// ==================================================

/**
 * A feed item now represents a single episode (like a tweet/article)
 */
export type FeedItem = {
  id: string;                      // Unique feed item id
  type: 'episode';                 // Feed is episode-first
  episode: Episode;                // The article/chapter itself
  rabbitHole: Pick<RabbitHole,     // Context for the episode
    'id' | 'title' | 'hookText' | 'topics'
  >;
  reason?: string;                 // Optional surface reason (trending, fresh, etc.)
};

/**
 * Legacy FeedItem type for backward compatibility with Wikipedia
 * @deprecated Use FeedItem instead
 */
export type LegacyFeedItem = {
  id: string;
  title: string;
  extract: string;
  thumbnailUrl?: string;
  wikipediaUrl: string;
  isSaved?: boolean;
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
// SAVED ITEM TYPES
// ==================================================

/**
 * A saved/bookmarked item
 * Can be an episode or a whole rabbit hole
 */
export type SavedItem = {
  id: string;
  userId: string;
  
  // Legacy Wikipedia fields (for backward compatibility)
  wikipediaId?: string;
  
  // New rabbit hole fields
  episodeId?: string;
  rabbitHoleId?: string;
  
  // Display info
  title: string;
  extract?: string;
  thumbnailUrl?: string;
  
  // Timestamps
  savedAt: string;
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
// LEGACY WIKIPEDIA TYPES (DEPRECATED)
// ==================================================
// Keeping for backward compatibility during migration

/**
 * @deprecated Use Episode instead
 */
export type WikipediaArticle = {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string };
    mobile: { page: string };
  };
  description?: string;
};

/**
 * @deprecated Use Episode instead
 */
export type WikipediaFullArticle = WikipediaArticle & {
  extract_html?: string;
  sections?: ArticleSection[];
};

/**
 * @deprecated Will be replaced by Episode sections
 */
export type ArticleSection = {
  title: string;
  content: string;
  level: number;
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
