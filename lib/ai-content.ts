/**
 * AI CONTENT GENERATION - Google Gemini Integration
 * 
 * Generates narrative episodic content for rabbit holes using
 * Google's Gemini API (FREE tier: 1,500 requests/day).
 * 
 * KEY FUNCTIONS:
 * - generateRabbitHoleStructure: Create a new rabbit hole outline
 * - generateEpisode: Generate content for a single episode
 * - generateUpdateFromNews: Synthesize news into narrative update
 * 
 * SETUP:
 * 1. Get API key from https://ai.google.dev
 * 2. Add to .env: EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
 */

import { RabbitHole, Episode, RabbitHoleType } from '@/types';

// ==================================================
// CONFIGURATION
// ==================================================

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Content parameters
const EPISODE_WORD_COUNT = { min: 300, max: 500 };
const SUMMARY_WORD_COUNT = { min: 30, max: 50 };

// ==================================================
// TYPES
// ==================================================

type GeneratedRabbitHole = {
  title: string;
  description: string;
  hookText: string;
  type: RabbitHoleType;
  topics: string[];
  episodes: GeneratedEpisodeOutline[];
};

type GeneratedEpisodeOutline = {
  episodeNumber: number;
  title: string;
  summary: string;
};

type GeneratedEpisode = {
  title: string;
  content: string;
  summary: string;
};

type NewsArticle = {
  title: string;
  description: string;
  content?: string;
  url: string;
  publishedAt: string;
  source: { name: string };
};

// ==================================================
// SYSTEM PROMPTS
// ==================================================

const SYSTEM_PROMPTS = {
  rabbitHoleCreator: `You are a master storyteller creating episodic learning content. Your goal is to transform complex topics into engaging narrative journeys that create FOMO and make people want to learn more.

Guidelines:
- Create content that hooks people emotionally
- Use cliffhangers and teasers between episodes
- Make abstract concepts relatable with analogies and stories
- Each episode should feel like a mini-revelation
- End every episode with a compelling preview of what's next
- Write in a conversational, engaging tone (not academic)

Format: Respond ONLY with valid JSON, no markdown or explanation.`,

  episodeWriter: `You are a narrative content writer creating episode ${'{episodeNumber}'} of a learning series. Your episode should:

1. Open with a hook that immediately grabs attention
2. Build on previous episodes (if not episode 1)
3. Include at least one surprising fact or insight
4. Use storytelling techniques (conflict, characters, stakes)
5. End with a cliffhanger or teaser for the next episode
6. Be ${EPISODE_WORD_COUNT.min}-${EPISODE_WORD_COUNT.max} words

Write in a conversational, engaging style. Make readers feel like they're discovering secrets.

Format: Respond ONLY with valid JSON, no markdown or explanation.`,

  newsIntegrator: `You are a narrative journalist who transforms breaking news into engaging story updates. Your update should:

1. Connect the news to the existing rabbit hole narrative
2. Explain why this matters to the reader
3. Create urgency ("This changes everything...")
4. End with implications for the future
5. Be ${EPISODE_WORD_COUNT.min}-${EPISODE_WORD_COUNT.max} words

Write in an urgent, exciting tone. Make readers feel like they're witnessing history.

Format: Respond ONLY with valid JSON, no markdown or explanation.`,
};

// ==================================================
// API HELPER
// ==================================================

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No content in Gemini response');
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

function parseJsonResponse<T>(response: string): T {
  // Clean up the response - remove markdown code blocks if present
  let cleaned = response.trim();
  
  // Remove ```json and ``` markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON response:', cleaned);
    throw new Error(`Invalid JSON response from AI: ${error}`);
  }
}

// ==================================================
// RABBIT HOLE GENERATION
// ==================================================

/**
 * Generate a complete rabbit hole structure with episode outlines
 * 
 * @param topic - The main topic to explore
 * @param numEpisodes - Number of episodes to outline (default 5)
 * @param type - Type of rabbit hole: "series" or "live"
 * @returns Generated rabbit hole structure
 */
export async function generateRabbitHoleStructure(
  topic: string,
  numEpisodes: number = 5,
  type: RabbitHoleType = 'series'
): Promise<GeneratedRabbitHole> {
  const prompt = `${SYSTEM_PROMPTS.rabbitHoleCreator}

Create a rabbit hole structure for the topic: "${topic}"
Type: ${type} (${type === 'series' ? 'structured course with planned episodes' : 'ongoing topic with news-driven updates'})
Number of episodes: ${numEpisodes}

Return JSON with this exact structure:
{
  "title": "Engaging title that creates curiosity",
  "description": "2-3 sentence description of what readers will learn",
  "hookText": "FOMO-inducing teaser (1 sentence, ~100 chars, ends with '...')",
  "type": "${type}",
  "topics": ["topic1", "topic2", "topic3"],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1: The Hook",
      "summary": "Brief summary of what this episode covers"
    }
    // ... more episodes
  ]
}

Make the hookText create urgency and FOMO. Examples:
- "Scientists just discovered something that rewrites everything we thought we knew about..."
- "The hidden truth that governments don't want you to know about..."
- "What happens next will determine the future of humanity..."`;

  const response = await callGemini(prompt);
  return parseJsonResponse<GeneratedRabbitHole>(response);
}

// ==================================================
// EPISODE GENERATION
// ==================================================

/**
 * Generate full content for a single episode
 * 
 * @param rabbitHole - The parent rabbit hole
 * @param episodeNumber - Which episode to generate
 * @param previousSummaries - Summaries of previous episodes for context
 * @returns Generated episode content
 */
export async function generateEpisode(
  rabbitHole: Pick<RabbitHole, 'title' | 'description' | 'type'>,
  episodeNumber: number,
  previousSummaries: string[] = []
): Promise<GeneratedEpisode> {
  const previousContext = previousSummaries.length > 0
    ? `\n\nPrevious episodes:\n${previousSummaries.map((s, i) => `Episode ${i + 1}: ${s}`).join('\n')}`
    : '';

  const prompt = `${SYSTEM_PROMPTS.episodeWriter.replace('{episodeNumber}', String(episodeNumber))}

Rabbit hole: "${rabbitHole.title}"
Description: ${rabbitHole.description}
Episode number: ${episodeNumber}${previousContext}

Return JSON with this exact structure:
{
  "title": "Episode ${episodeNumber}: [Catchy Title]",
  "content": "Full episode content (${EPISODE_WORD_COUNT.min}-${EPISODE_WORD_COUNT.max} words). Use paragraphs separated by \\n\\n. Include a hook at the start and cliffhanger at the end.",
  "summary": "Brief summary for 'previously on' sections (${SUMMARY_WORD_COUNT.min}-${SUMMARY_WORD_COUNT.max} words)"
}`;

  const response = await callGemini(prompt);
  return parseJsonResponse<GeneratedEpisode>(response);
}

// ==================================================
// NEWS-TO-NARRATIVE GENERATION
// ==================================================

/**
 * Transform news articles into a narrative update episode
 * 
 * @param rabbitHole - The parent rabbit hole
 * @param newsArticles - Relevant news articles to synthesize
 * @param lastEpisodeSummary - Summary of the last episode for context
 * @returns Generated update episode content
 */
export async function generateUpdateFromNews(
  rabbitHole: Pick<RabbitHole, 'title' | 'description'>,
  newsArticles: NewsArticle[],
  lastEpisodeSummary: string = ''
): Promise<GeneratedEpisode & { sourceUrl: string }> {
  const newsContext = newsArticles.map(article => 
    `Source: ${article.source.name}
Title: ${article.title}
Summary: ${article.description}
URL: ${article.url}`
  ).join('\n\n');

  const prompt = `${SYSTEM_PROMPTS.newsIntegrator}

Rabbit hole: "${rabbitHole.title}"
Description: ${rabbitHole.description}

${lastEpisodeSummary ? `Last episode summary: ${lastEpisodeSummary}\n` : ''}
Breaking news to integrate:
${newsContext}

Return JSON with this exact structure:
{
  "title": "BREAKING: [Exciting Update Title]",
  "content": "Full narrative update (${EPISODE_WORD_COUNT.min}-${EPISODE_WORD_COUNT.max} words). Connect to previous content, explain significance, create urgency. Use paragraphs separated by \\n\\n.",
  "summary": "Brief summary (${SUMMARY_WORD_COUNT.min}-${SUMMARY_WORD_COUNT.max} words)",
  "sourceUrl": "${newsArticles[0]?.url || ''}"
}`;

  const response = await callGemini(prompt);
  return parseJsonResponse<GeneratedEpisode & { sourceUrl: string }>(response);
}

// ==================================================
// BATCH GENERATION HELPERS
// ==================================================

/**
 * Generate a complete rabbit hole with all episodes
 * 
 * @param topic - The main topic
 * @param numEpisodes - Number of episodes to generate
 * @returns Complete rabbit hole with all episode content
 */
export async function generateCompleteRabbitHole(
  topic: string,
  numEpisodes: number = 5
): Promise<{
  rabbitHole: GeneratedRabbitHole;
  episodes: GeneratedEpisode[];
}> {
  // First, generate the structure
  const rabbitHole = await generateRabbitHoleStructure(topic, numEpisodes);
  
  // Then generate each episode sequentially (needs context from previous)
  const episodes: GeneratedEpisode[] = [];
  const summaries: string[] = [];
  
  for (let i = 1; i <= numEpisodes; i++) {
    console.log(`Generating episode ${i}/${numEpisodes}...`);
    
    const episode = await generateEpisode(rabbitHole, i, summaries);
    episodes.push(episode);
    summaries.push(episode.summary);
    
    // Rate limiting: wait 1 second between calls
    if (i < numEpisodes) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { rabbitHole, episodes };
}

// ==================================================
// CONTENT ENHANCEMENT
// ==================================================

/**
 * Generate a compelling hook text for existing content
 */
export async function generateHookText(
  title: string,
  description: string
): Promise<string> {
  const prompt = `Create a single FOMO-inducing hook sentence for this topic:
Title: ${title}
Description: ${description}

The hook should:
- Be under 120 characters
- Create curiosity and urgency
- End with "..."
- Make people feel they'll miss out if they don't read

Return ONLY the hook text, no quotes or explanation.`;

  const response = await callGemini(prompt);
  return response.trim().replace(/^["']|["']$/g, '');
}

/**
 * Generate topic tags for a rabbit hole
 */
export async function generateTopicTags(
  title: string,
  description: string
): Promise<string[]> {
  const prompt = `Generate 3-5 topic tags for this rabbit hole:
Title: ${title}
Description: ${description}

Valid topics: science, technology, history, economics, psychology, physics, biology, ai, space, politics, philosophy, mathematics, medicine, environment, culture

Return JSON array of lowercase topic strings only. Example: ["science", "physics", "space"]`;

  const response = await callGemini(prompt);
  return parseJsonResponse<string[]>(response);
}

// ==================================================
// HEALTH CHECK
// ==================================================

/**
 * Test if Gemini API is configured and working
 */
export async function checkGeminiHealth(): Promise<{
  configured: boolean;
  working: boolean;
  error?: string;
}> {
  if (!GEMINI_API_KEY) {
    return {
      configured: false,
      working: false,
      error: 'EXPO_PUBLIC_GEMINI_API_KEY not set in environment',
    };
  }

  try {
    const response = await callGemini('Say "OK" if you can read this.');
    return {
      configured: true,
      working: response.toLowerCase().includes('ok'),
    };
  } catch (error) {
    return {
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
