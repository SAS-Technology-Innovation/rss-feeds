/**
 * Type definitions for RSS Feed Generator
 */

export interface FeedConfig {
  title: string;
  description: string;
  link: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  pubDate?: Date;
  lastBuildDate?: Date;
  category?: string;
  generator?: string;
  docs?: string;
  ttl?: number;
  image?: FeedImage;
}

export interface FeedImage {
  url: string;
  title: string;
  link: string;
  width?: number;
  height?: number;
  description?: string;
}

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  author?: string;
  category?: string;
  comments?: string;
  enclosure?: FeedEnclosure;
  guid?: string;
  pubDate?: Date;
  source?: FeedSource;
}

export interface FeedEnclosure {
  url: string;
  length: number;
  type: string;
}

export interface FeedSource {
  url: string;
  title: string;
}

export interface AggregatorConfig {
  title: string;
  description: string;
  link: string;
  sources: SourceFeed[];
  maxItems?: number; // Maximum number of items in the combined feed
  language?: string;
  copyright?: string;
}

export interface SourceFeed {
  url: string;
  title: string;
}
