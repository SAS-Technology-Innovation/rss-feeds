/**
 * Example configuration for custom RSS feeds
 * Copy and modify this to create your own feed
 */

import { FeedConfig, FeedItem } from './types';

/**
 * Example: Blog feed configuration
 */
export const blogFeedConfig: FeedConfig = {
  title: 'My Tech Blog',
  description: 'Latest articles about web development, JavaScript, and technology',
  link: 'https://myblog.example.com',
  language: 'en-us',
  copyright: `Copyright ${new Date().getFullYear()} My Tech Blog`,
  managingEditor: 'editor@example.com (Editor Name)',
  webMaster: 'webmaster@example.com (Webmaster Name)',
  lastBuildDate: new Date(),
  category: 'Technology',
  ttl: 60, // Cache for 60 minutes
  image: {
    url: 'https://myblog.example.com/logo.png',
    title: 'My Tech Blog',
    link: 'https://myblog.example.com',
    width: 144,
    height: 144,
    description: 'My Tech Blog Logo',
  },
};

/**
 * Example: Blog posts with rich HTML content
 */
export const exampleBlogPosts: FeedItem[] = [
  {
    title: 'Getting Started with Cloudflare Workers',
    link: 'https://myblog.example.com/cloudflare-workers-guide',
    description: `
      <article>
        <img src="https://myblog.example.com/images/cloudflare-workers.jpg" alt="Cloudflare Workers" style="max-width: 100%; height: auto;" />

        <h2>Introduction</h2>
        <p>Cloudflare Workers is a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure.</p>

        <h3>Key Benefits</h3>
        <ul>
          <li><strong>Global Edge Network</strong> - Deploy to 200+ cities worldwide</li>
          <li><strong>Zero Cold Starts</strong> - Instant execution with V8 isolates</li>
          <li><strong>Generous Free Tier</strong> - 100,000 requests per day</li>
          <li><strong>Simple Pricing</strong> - Pay only for what you use</li>
        </ul>

        <h3>Quick Example</h3>
        <pre><code>export default {
  async fetch(request) {
    return new Response('Hello World!');
  }
};</code></pre>

        <p><a href="https://myblog.example.com/cloudflare-workers-guide">Read the full article →</a></p>
      </article>
    `,
    pubDate: new Date('2025-01-20'),
    author: 'author@example.com (John Doe)',
    category: 'Tutorials',
    guid: 'https://myblog.example.com/cloudflare-workers-guide',
  },
  {
    title: 'Building RSS Feeds with TypeScript',
    link: 'https://myblog.example.com/rss-feeds-typescript',
    description: `
      <article>
        <h2>Why RSS Still Matters</h2>
        <p>Despite the rise of social media, RSS feeds remain one of the best ways to distribute content. Here's how to build one with TypeScript:</p>

        <blockquote style="border-left: 4px solid #f38020; padding-left: 16px; margin: 20px 0; font-style: italic;">
          "RSS gives users control over their content consumption, free from algorithmic interference."
        </blockquote>

        <h3>Implementation Steps</h3>
        <ol>
          <li>Define TypeScript interfaces for type safety</li>
          <li>Create an RSS builder class</li>
          <li>Generate valid RSS 2.0 XML</li>
          <li>Handle HTML content with CDATA sections</li>
        </ol>

        <div style="background: #f4f4f4; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Pro Tip:</strong> Always validate your RSS feed using tools like the <a href="https://validator.w3.org/feed/">W3C Feed Validator</a>.</p>
        </div>

        <p>Check out the <a href="https://github.com/example/rss-feeds">complete source code on GitHub</a>!</p>
      </article>
    `,
    pubDate: new Date('2025-01-18'),
    author: 'author@example.com (John Doe)',
    category: 'Web Development',
    guid: 'https://myblog.example.com/rss-feeds-typescript',
  },
];

/**
 * Example: Podcast feed configuration
 */
export const podcastFeedConfig: FeedConfig = {
  title: 'The Tech Podcast',
  description: 'Weekly discussions about technology, programming, and software development',
  link: 'https://podcast.example.com',
  language: 'en-us',
  copyright: `© ${new Date().getFullYear()} The Tech Podcast`,
  managingEditor: 'host@example.com (Podcast Host)',
  lastBuildDate: new Date(),
  category: 'Technology',
  image: {
    url: 'https://podcast.example.com/artwork.jpg',
    title: 'The Tech Podcast',
    link: 'https://podcast.example.com',
    width: 1400,
    height: 1400,
  },
};

/**
 * Example: Podcast episodes with audio enclosures
 */
export const examplePodcastEpisodes: FeedItem[] = [
  {
    title: 'Episode 42: The Future of Serverless',
    link: 'https://podcast.example.com/episodes/42',
    description: `
      <p>In this episode, we discuss the future of serverless computing, edge functions, and how they're changing web development.</p>

      <h3>Topics Covered:</h3>
      <ul>
        <li>Evolution of serverless platforms</li>
        <li>Edge computing vs traditional cloud</li>
        <li>Real-world use cases</li>
        <li>Performance considerations</li>
      </ul>

      <p><strong>Guest:</strong> Jane Smith, Senior Developer Advocate at Cloudflare</p>
      <p><strong>Duration:</strong> 45 minutes</p>
    `,
    enclosure: {
      url: 'https://podcast.example.com/episodes/42.mp3',
      length: 43200000, // File size in bytes
      type: 'audio/mpeg',
    },
    pubDate: new Date('2025-01-22'),
    author: 'host@example.com (Podcast Host)',
    guid: 'https://podcast.example.com/episodes/42',
  },
];

/**
 * Example: News feed configuration
 */
export const newsFeedConfig: FeedConfig = {
  title: 'Tech News Daily',
  description: 'Latest news from the world of technology',
  link: 'https://technews.example.com',
  language: 'en-us',
  copyright: 'Public Domain',
  lastBuildDate: new Date(),
  category: 'News',
  ttl: 15, // Update every 15 minutes
};
