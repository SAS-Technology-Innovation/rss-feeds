/**
 * RSS Feed Parser
 * Parses RSS 2.0 and Atom feeds into a common format
 */

import { FeedItem } from './types';

export class RSSParser {
  /**
   * Parse RSS/Atom XML content into FeedItem array
   */
  static parse(xmlContent: string, sourceUrl: string, sourceTitle?: string): FeedItem[] {
    const items: FeedItem[] = [];

    // Detect feed type (RSS 2.0 or Atom)
    const isAtom = xmlContent.includes('<feed') && xmlContent.includes('xmlns="http://www.w3.org/2005/Atom"');

    if (isAtom) {
      return this.parseAtom(xmlContent, sourceUrl, sourceTitle);
    } else {
      return this.parseRSS(xmlContent, sourceUrl, sourceTitle);
    }
  }

  /**
   * Parse RSS 2.0 feed
   */
  private static parseRSS(xmlContent: string, sourceUrl: string, sourceTitle?: string): FeedItem[] {
    const items: FeedItem[] = [];

    // Extract all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const itemMatches = xmlContent.matchAll(itemRegex);

    for (const match of itemMatches) {
      const itemXML = match[1];

      const item: FeedItem = {
        title: this.extractTag(itemXML, 'title') || 'Untitled',
        link: this.extractTag(itemXML, 'link') || '',
        description: this.extractCDATA(itemXML, 'description') || this.extractTag(itemXML, 'description') || '',
      };

      // Optional fields
      const author = this.extractTag(itemXML, 'author') || this.extractTag(itemXML, 'dc:creator');
      if (author) item.author = author;

      const category = this.extractTag(itemXML, 'category');
      if (category) item.category = category;

      const guid = this.extractTag(itemXML, 'guid');
      if (guid) item.guid = guid;

      const pubDateStr = this.extractTag(itemXML, 'pubDate') || this.extractTag(itemXML, 'dc:date');
      if (pubDateStr) {
        item.pubDate = new Date(pubDateStr);
      }

      // Add source information
      if (sourceTitle) {
        item.source = { url: sourceUrl, title: sourceTitle };
      }

      items.push(item);
    }

    return items;
  }

  /**
   * Parse Atom feed
   */
  private static parseAtom(xmlContent: string, sourceUrl: string, sourceTitle?: string): FeedItem[] {
    const items: FeedItem[] = [];

    // Extract all <entry> elements
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    const entryMatches = xmlContent.matchAll(entryRegex);

    for (const match of entryMatches) {
      const entryXML = match[1];

      // Extract link href
      const linkMatch = entryXML.match(/<link[^>]*href=["']([^"']+)["']/i);
      const link = linkMatch ? linkMatch[1] : '';

      const item: FeedItem = {
        title: this.extractTag(entryXML, 'title') || 'Untitled',
        link: link,
        description:
          this.extractCDATA(entryXML, 'content') ||
          this.extractTag(entryXML, 'content') ||
          this.extractCDATA(entryXML, 'summary') ||
          this.extractTag(entryXML, 'summary') || '',
      };

      // Optional fields
      const author = this.extractTag(entryXML, 'author');
      if (author) {
        const authorName = this.extractTag(author, 'name');
        if (authorName) item.author = authorName;
      }

      const category = this.extractTag(entryXML, 'category');
      if (category) item.category = category;

      const id = this.extractTag(entryXML, 'id');
      if (id) item.guid = id;

      const publishedStr = this.extractTag(entryXML, 'published') || this.extractTag(entryXML, 'updated');
      if (publishedStr) {
        item.pubDate = new Date(publishedStr);
      }

      // Add source information
      if (sourceTitle) {
        item.source = { url: sourceUrl, title: sourceTitle };
      }

      items.push(item);
    }

    return items;
  }

  /**
   * Extract content from a tag (handles namespaced tags too)
   */
  private static extractTag(xml: string, tagName: string): string | null {
    // Try exact tag name first
    let regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    let match = xml.match(regex);

    // If not found, try with namespace prefix (e.g., dc:creator)
    if (!match && !tagName.includes(':')) {
      regex = new RegExp(`<[^:]*:${tagName}[^>]*>([\\s\\S]*?)<\/[^:]*:${tagName}>`, 'i');
      match = xml.match(regex);
    }

    if (match) {
      return this.decodeHTML(match[1].trim());
    }
    return null;
  }

  /**
   * Extract CDATA content from a tag
   */
  private static extractCDATA(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tagName}>`, 'i');
    const match = xml.match(regex);
    if (match) {
      return match[1].trim();
    }
    return null;
  }

  /**
   * Decode HTML entities
   */
  private static decodeHTML(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
}
