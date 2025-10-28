/**
 * RSS Feed Aggregator Configuration
 * Add your RSS feed sources here
 */

import { AggregatorConfig } from './types';

export const aggregatorConfig: AggregatorConfig = {
  title: 'AI News Aggregator',
  description: 'Latest artificial intelligence news from leading sources',
  link: 'https://rss-feed-generator.sas-innovation.workers.dev',
  language: 'en-us',
  copyright: `Copyright ${new Date().getFullYear()} SAS Technology and Innovation`,
  maxItems: 100, // Limit to 100 most recent items

  // AI-focused RSS feed sources
  sources: [
    {
      url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
      title: 'TechCrunch AI',
    },
    {
      url: 'https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml',
      title: 'MIT News - AI',
    },
    {
      url: 'https://deepmind.google/blog/rss.xml',
      title: 'Google DeepMind',
    },
    {
      url: 'https://www.artificialintelligence-news.com/feed/',
      title: 'AI News',
    },
  ],
};
