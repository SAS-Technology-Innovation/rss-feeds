# RSS Feed Aggregator for Cloudflare Workers

A powerful RSS feed aggregator that fetches multiple RSS/Atom feeds and combines them into a single, unified feed. Built for Cloudflare Workers with support for both RSS 2.0 and Atom formats.

## Features

- **Multi-Source Aggregation** - Combine multiple RSS and Atom feeds into one
- **Automatic Parsing** - Supports both RSS 2.0 and Atom feed formats
- **Smart Sorting** - Items automatically sorted by publication date (newest first)
- **Source Attribution** - Each item includes its original source information
- **Configurable Limits** - Control the maximum number of items in the combined feed
- **Full HTML Support** - Preserves rich HTML content from source feeds
- **Fast & Scalable** - Powered by Cloudflare Workers edge network
- **TypeScript** - Fully typed for better developer experience

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

### Configuration

Edit `src/config.ts` to configure your RSS feed sources:

```typescript
export const aggregatorConfig: AggregatorConfig = {
  title: 'My Aggregated RSS Feed',
  description: 'A combined feed from multiple sources',
  link: 'https://your-worker.workers.dev',
  maxItems: 50, // Limit to 50 most recent items

  sources: [
    {
      url: 'https://hnrss.org/frontpage',
      title: 'Hacker News',
    },
    {
      url: 'https://blog.cloudflare.com/rss/',
      title: 'Cloudflare Blog',
    },
    // Add more feeds here
  ],
};
```

### Deployment

1. Authenticate with Cloudflare:

```bash
npx wrangler login
```

2. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Your aggregated feed will be available at `https://your-worker.workers.dev/rss`

## Usage

### Adding Feed Sources

Add RSS or Atom feeds to the `sources` array in `src/config.ts`:

```typescript
sources: [
  {
    url: 'https://example.com/feed.xml',  // RSS or Atom feed URL
    title: 'Example Feed',                 // Display name for this source
  },
  // Add more sources...
]
```

### Configuration Options

```typescript
interface AggregatorConfig {
  title: string;           // Title of your aggregated feed
  description: string;     // Description of your aggregated feed
  link: string;           // URL where your feed is hosted
  sources: SourceFeed[];  // Array of feed sources
  maxItems?: number;      // Maximum items in combined feed (optional)
  language?: string;      // Feed language, e.g., 'en-us' (optional)
  copyright?: string;     // Copyright notice (optional)
}
```

### How It Works

1. The aggregator fetches all configured RSS/Atom feeds in parallel
2. Parses each feed (supports both RSS 2.0 and Atom formats)
3. Extracts items from each feed with source attribution
4. Combines all items and sorts by publication date (newest first)
5. Limits the result to `maxItems` if configured
6. Generates a unified RSS 2.0 feed

### Supported Feed Formats

The aggregator automatically detects and parses:
- **RSS 2.0** - Standard RSS format
- **Atom** - Modern Atom syndication format

Both formats are converted to a unified RSS 2.0 output feed.

## Project Structure

```
rss-feeds/
├── src/
│   ├── index.ts             # Main Cloudflare Worker entry point
│   ├── config.ts            # Feed sources configuration
│   ├── feed-aggregator.ts   # Feed fetching and aggregation logic
│   ├── rss-parser.ts        # RSS/Atom feed parser
│   ├── rss-builder.ts       # RSS 2.0 feed builder
│   ├── types.ts             # TypeScript type definitions
│   └── example-config.ts    # Example configuration (unused)
├── wrangler.toml            # Cloudflare Workers configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## API Endpoints

- `/` - Landing page showing configured sources and feed information
- `/rss` or `/feed` - Aggregated RSS feed XML

## Use Cases

### Personal News Aggregator
Combine your favorite blogs and news sites into one feed:
```typescript
sources: [
  { url: 'https://hnrss.org/frontpage', title: 'Hacker News' },
  { url: 'https://blog.cloudflare.com/rss/', title: 'Cloudflare' },
  { url: 'https://github.blog/feed/', title: 'GitHub Blog' },
]
```

### Team Updates Dashboard
Aggregate multiple team blogs or project feeds:
```typescript
sources: [
  { url: 'https://engineering-blog.example.com/feed', title: 'Engineering' },
  { url: 'https://product-blog.example.com/feed', title: 'Product' },
  { url: 'https://design-blog.example.com/feed', title: 'Design' },
]
```

### Content Curation
Combine feeds from specific topics or niches:
```typescript
sources: [
  { url: 'https://source1.com/rss', title: 'Source 1' },
  { url: 'https://source2.com/atom', title: 'Source 2' },
  { url: 'https://source3.com/feed.xml', title: 'Source 3' },
]
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
