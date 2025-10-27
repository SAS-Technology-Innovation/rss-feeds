/**
 * RSS Feed Builder
 * Generates RSS 2.0 compliant XML with HTML content support
 */

import { FeedConfig, FeedItem } from './types';

export class RSSFeedBuilder {
  private config: FeedConfig;
  private items: FeedItem[] = [];

  constructor(config: FeedConfig) {
    this.config = config;
  }

  /**
   * Add a single item to the feed
   */
  addItem(item: FeedItem): RSSFeedBuilder {
    this.items.push(item);
    return this;
  }

  /**
   * Add multiple items to the feed
   */
  addItems(items: FeedItem[]): RSSFeedBuilder {
    this.items.push(...items);
    return this;
  }

  /**
   * Build and return the RSS XML string
   */
  build(): string {
    const xml: string[] = [];

    // XML declaration
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">');
    xml.push('<channel>');

    // Required channel elements
    xml.push(`<title>${this.escapeXML(this.config.title)}</title>`);
    xml.push(`<link>${this.escapeXML(this.config.link)}</link>`);
    xml.push(`<description>${this.escapeXML(this.config.description)}</description>`);

    // Optional channel elements
    if (this.config.language) {
      xml.push(`<language>${this.escapeXML(this.config.language)}</language>`);
    }

    if (this.config.copyright) {
      xml.push(`<copyright>${this.escapeXML(this.config.copyright)}</copyright>`);
    }

    if (this.config.managingEditor) {
      xml.push(`<managingEditor>${this.escapeXML(this.config.managingEditor)}</managingEditor>`);
    }

    if (this.config.webMaster) {
      xml.push(`<webMaster>${this.escapeXML(this.config.webMaster)}</webMaster>`);
    }

    if (this.config.pubDate) {
      xml.push(`<pubDate>${this.formatDate(this.config.pubDate)}</pubDate>`);
    }

    if (this.config.lastBuildDate) {
      xml.push(`<lastBuildDate>${this.formatDate(this.config.lastBuildDate)}</lastBuildDate>`);
    }

    if (this.config.category) {
      xml.push(`<category>${this.escapeXML(this.config.category)}</category>`);
    }

    // Generator
    const generator = this.config.generator || 'RSS Feed Generator for Cloudflare Workers';
    xml.push(`<generator>${this.escapeXML(generator)}</generator>`);

    if (this.config.docs) {
      xml.push(`<docs>${this.escapeXML(this.config.docs)}</docs>`);
    }

    if (this.config.ttl) {
      xml.push(`<ttl>${this.config.ttl}</ttl>`);
    }

    // Image
    if (this.config.image) {
      xml.push('<image>');
      xml.push(`<url>${this.escapeXML(this.config.image.url)}</url>`);
      xml.push(`<title>${this.escapeXML(this.config.image.title)}</title>`);
      xml.push(`<link>${this.escapeXML(this.config.image.link)}</link>`);
      if (this.config.image.width) {
        xml.push(`<width>${this.config.image.width}</width>`);
      }
      if (this.config.image.height) {
        xml.push(`<height>${this.config.image.height}</height>`);
      }
      if (this.config.image.description) {
        xml.push(`<description>${this.escapeXML(this.config.image.description)}</description>`);
      }
      xml.push('</image>');
    }

    // Atom self link
    xml.push(`<atom:link href="${this.escapeXML(this.config.link)}/rss" rel="self" type="application/rss+xml" />`);

    // Add items
    for (const item of this.items) {
      xml.push(this.buildItem(item));
    }

    xml.push('</channel>');
    xml.push('</rss>');

    return xml.join('\n');
  }

  /**
   * Build a single RSS item
   */
  private buildItem(item: FeedItem): string {
    const xml: string[] = [];

    xml.push('<item>');
    xml.push(`<title>${this.escapeXML(item.title)}</title>`);
    xml.push(`<link>${this.escapeXML(item.link)}</link>`);

    // Description with HTML content using CDATA
    xml.push(`<description><![CDATA[${item.description}]]></description>`);

    if (item.author) {
      xml.push(`<author>${this.escapeXML(item.author)}</author>`);
    }

    if (item.category) {
      xml.push(`<category>${this.escapeXML(item.category)}</category>`);
    }

    if (item.comments) {
      xml.push(`<comments>${this.escapeXML(item.comments)}</comments>`);
    }

    if (item.enclosure) {
      xml.push(
        `<enclosure url="${this.escapeXML(item.enclosure.url)}" ` +
        `length="${item.enclosure.length}" ` +
        `type="${this.escapeXML(item.enclosure.type)}" />`
      );
    }

    // GUID
    const guid = item.guid || item.link;
    const isPermaLink = item.guid ? 'false' : 'true';
    xml.push(`<guid isPermaLink="${isPermaLink}">${this.escapeXML(guid)}</guid>`);

    if (item.pubDate) {
      xml.push(`<pubDate>${this.formatDate(item.pubDate)}</pubDate>`);
    }

    if (item.source) {
      xml.push(`<source url="${this.escapeXML(item.source.url)}">${this.escapeXML(item.source.title)}</source>`);
    }

    xml.push('</item>');

    return xml.join('\n');
  }

  /**
   * Escape special XML characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Format date to RFC 822 format (required by RSS 2.0)
   */
  private formatDate(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[date.getUTCDay()];
    const dayNum = date.getUTCDate().toString().padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
  }
}
