# RSS Feed Generator for Cloudflare Workers

A simple, fast, and flexible RSS feed generator built for Cloudflare Workers with full HTML embedding support.

## Features

- **Full HTML Support** - Embed rich HTML content in your feed items using CDATA sections
- **RSS 2.0 Compliant** - Standards-compliant RSS feeds that work with all RSS readers
- **TypeScript** - Fully typed for better developer experience
- **Easy to Use** - Simple API for creating custom feeds
- **Fast & Scalable** - Powered by Cloudflare Workers edge network
- **Customizable** - Flexible configuration for all RSS 2.0 fields

## Quick Start

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:8787` to see the landing page, and `http://localhost:8787/rss` for the RSS feed.

### Deployment

1. Update `wrangler.toml` with your Cloudflare account ID
2. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Usage

### Basic Example

```typescript
import { RSSFeedBuilder } from './rss-builder';
import { FeedConfig, FeedItem } from './types';

// Configure your feed
const feedConfig: FeedConfig = {
  title: 'My Blog',
  description: 'Latest posts from my blog',
  link: 'https://myblog.com',
  language: 'en-us',
  lastBuildDate: new Date(),
};

// Create feed items with HTML content
const items: FeedItem[] = [
  {
    title: 'My First Post',
    link: 'https://myblog.com/posts/first',
    description: `
      <h2>Welcome!</h2>
      <p>This is my first post with <strong>HTML content</strong>.</p>
      <img src="https://example.com/image.jpg" alt="Post image" />
    `,
    pubDate: new Date(),
    author: 'author@example.com (Author Name)',
  },
];

// Build the RSS feed
const rss = new RSSFeedBuilder(feedConfig);
const xml = rss.addItems(items).build();

// Return as response
return new Response(xml, {
  headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
});
```

### HTML Content in Feeds

The RSS builder properly handles HTML content using CDATA sections:

```typescript
const item: FeedItem = {
  title: 'Rich Content Post',
  link: 'https://example.com/post',
  description: `
    <article>
      <h2>Article Title</h2>
      <p>This supports <em>all HTML tags</em>:</p>
      <ul>
        <li>Lists</li>
        <li>Links: <a href="https://example.com">Click here</a></li>
        <li>Images: <img src="image.jpg" alt="Description" /></li>
        <li>Code: <code>const x = 1;</code></li>
      </ul>
      <blockquote>Quotes work too!</blockquote>
    </article>
  `,
  pubDate: new Date(),
};
```

### Feed Configuration Options

```typescript
interface FeedConfig {
  // Required
  title: string;
  description: string;
  link: string;

  // Optional
  language?: string; // e.g., 'en-us'
  copyright?: string;
  managingEditor?: string; // email (name)
  webMaster?: string; // email (name)
  pubDate?: Date;
  lastBuildDate?: Date;
  category?: string;
  generator?: string;
  docs?: string;
  ttl?: number; // Time to live in minutes
  image?: FeedImage; // Feed logo/image
}
```

### Feed Item Options

```typescript
interface FeedItem {
  // Required
  title: string;
  link: string;
  description: string; // Can contain HTML

  // Optional
  author?: string; // email (name)
  category?: string;
  comments?: string; // URL to comments
  enclosure?: FeedEnclosure; // Media file
  guid?: string; // Unique identifier
  pubDate?: Date;
  source?: FeedSource;
}
```

## Project Structure

```
rss-feeds/
├── src/
│   ├── index.ts          # Main Cloudflare Worker entry point
│   ├── rss-builder.ts    # RSS feed builder class
│   └── types.ts          # TypeScript type definitions
├── wrangler.toml         # Cloudflare Workers configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## API Endpoints

- `/` - Landing page with feed information
- `/rss` or `/feed` - RSS feed XML

## Customization

### Modify Feed Content

Edit `src/index.ts` and update the `generateRSSFeed()` function with your custom feed configuration and items.

### Add Dynamic Content

Fetch content from external APIs, databases (Cloudflare D1, KV), or other sources:

```typescript
async function generateRSSFeed(): Promise<Response> {
  // Fetch from KV, D1, or external API
  const posts = await fetchPostsFromDatabase();

  const items: FeedItem[] = posts.map(post => ({
    title: post.title,
    link: post.url,
    description: post.content, // HTML content
    pubDate: new Date(post.publishedAt),
  }));

  const rss = new RSSFeedBuilder(feedConfig);
  return new Response(rss.addItems(items).build(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
```

### Add Images to Feed

```typescript
const feedConfig: FeedConfig = {
  title: 'My Feed',
  description: 'Feed description',
  link: 'https://example.com',
  image: {
    url: 'https://example.com/logo.png',
    title: 'My Feed Logo',
    link: 'https://example.com',
    width: 144,
    height: 144,
  },
};
```

### Add Media Enclosures

```typescript
const item: FeedItem = {
  title: 'Podcast Episode 1',
  link: 'https://example.com/episode-1',
  description: 'First episode of our podcast',
  enclosure: {
    url: 'https://example.com/episode-1.mp3',
    length: 12345678, // File size in bytes
    type: 'audio/mpeg',
  },
};
```

## RSS 2.0 Specification

This generator follows the [RSS 2.0 specification](https://www.rssboard.org/rss-specification).

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run build` - Build TypeScript
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

### Requirements

- Node.js 18+
- Cloudflare Workers account (for deployment)
- Wrangler CLI

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
