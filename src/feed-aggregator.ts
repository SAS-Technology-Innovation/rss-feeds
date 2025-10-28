/**
 * RSS Feed Aggregator
 * Fetches and combines multiple RSS feeds into one
 */

import { RSSParser } from './rss-parser';
import { FeedItem } from './types';

export interface SourceFeed {
  url: string;
  title: string;
}

export class FeedAggregator {
  /**
   * Fetch and aggregate multiple RSS feeds
   */
  static async aggregate(sources: SourceFeed[], maxItems?: number): Promise<FeedItem[]> {
    const allItems: FeedItem[] = [];

    // Fetch all feeds in parallel
    const fetchPromises = sources.map((source) =>
      this.fetchFeed(source.url, source.title).catch((error) => {
        console.error(`Failed to fetch ${source.url}:`, error);
        return []; // Return empty array on error, don't fail entire aggregation
      })
    );

    const results = await Promise.all(fetchPromises);

    // Combine all items
    for (const items of results) {
      allItems.push(...items);
    }

    // Sort by publication date (newest first)
    allItems.sort((a, b) => {
      const dateA = a.pubDate ? a.pubDate.getTime() : 0;
      const dateB = b.pubDate ? b.pubDate.getTime() : 0;
      return dateB - dateA;
    });

    // Limit number of items if specified
    if (maxItems && maxItems > 0) {
      return allItems.slice(0, maxItems);
    }

    return allItems;
  }

  /**
   * Fetch and parse a single RSS feed
   */
  private static async fetchFeed(url: string, title: string): Promise<FeedItem[]> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RSS-Feed-Aggregator/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlContent = await response.text();
      return RSSParser.parse(xmlContent, url, title);
    } catch (error) {
      console.error(`Error fetching feed from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get feed metadata from XML content
   */
  static extractFeedMetadata(xmlContent: string): { title?: string; description?: string; link?: string } {
    const metadata: { title?: string; description?: string; link?: string } = {};

    // Check if it's an Atom feed
    const isAtom = xmlContent.includes('<feed') && xmlContent.includes('xmlns="http://www.w3.org/2005/Atom"');

    if (isAtom) {
      // Extract Atom feed metadata
      const titleMatch = xmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) metadata.title = titleMatch[1].trim();

      const subtitleMatch = xmlContent.match(/<subtitle[^>]*>([^<]+)<\/subtitle>/i);
      if (subtitleMatch) metadata.description = subtitleMatch[1].trim();

      const linkMatch = xmlContent.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
      if (linkMatch) metadata.link = linkMatch[1].trim();
    } else {
      // Extract RSS 2.0 metadata
      const channelMatch = xmlContent.match(/<channel>([\s\S]*?)<\/channel>/i);
      if (channelMatch) {
        const channelContent = channelMatch[1];

        const titleMatch = channelContent.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) metadata.title = titleMatch[1].trim();

        const descMatch = channelContent.match(/<description>([^<]+)<\/description>/i);
        if (descMatch) metadata.description = descMatch[1].trim();

        const linkMatch = channelContent.match(/<link>([^<]+)<\/link>/i);
        if (linkMatch) metadata.link = linkMatch[1].trim();
      }
    }

    return metadata;
  }
}
