/**
 * RSS Feed Aggregator for Cloudflare Workers
 * Fetches and combines multiple RSS feeds into one
 */

import { RSSFeedBuilder } from './rss-builder';
import { FeedAggregator } from './feed-aggregator';
import { RSSParser } from './rss-parser';
import { aggregatorConfig } from './config';
import { FeedConfig } from './types';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for embedding
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle different routes
    if (url.pathname === '/rss' || url.pathname === '/feed') {
      return generateRSSFeed();
    }

    if (url.pathname === '/') {
      return new Response(getHTMLPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname === '/embed') {
      return new Response(getEmbedWidget(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        },
      });
    }

    if (url.pathname === '/embed-info') {
      return new Response(getEmbedInfoPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname === '/api/news') {
      return getNewsAPI(corsHeaders);
    }

    if (url.pathname === '/debug') {
      return getDebugInfo(corsHeaders);
    }

    return new Response('Not Found', { status: 404 });
  },
};

/**
 * Generate an aggregated RSS feed from multiple sources
 */
async function generateRSSFeed(): Promise<Response> {
  try {
    // Fetch and aggregate feeds
    const feedItems = await FeedAggregator.aggregate(
      aggregatorConfig.sources,
      aggregatorConfig.maxItems
    );

    // Configure the combined feed
    const feedConfig: FeedConfig = {
      title: aggregatorConfig.title,
      description: aggregatorConfig.description,
      link: aggregatorConfig.link,
      language: aggregatorConfig.language,
      copyright: aggregatorConfig.copyright,
      lastBuildDate: new Date(),
      generator: 'RSS Feed Aggregator for Cloudflare Workers',
    };

    // Build the RSS feed
    const rssBuilder = new RSSFeedBuilder(feedConfig);
    const rssXML = rssBuilder.addItems(feedItems).build();

    return new Response(rssXML, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}

/**
 * Generate HTML landing page with SAS styling
 */
function getHTMLPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI News Feed</title>
  <meta name="description" content="Latest artificial intelligence news from leading sources">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      padding: 0;
      line-height: 1.8;
      color: #333333;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .embed-banner {
      background: #1a4190;
      color: white;
      padding: 12px 20px;
      text-align: center;
      margin: -20px -20px 20px -20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
    }

    .embed-banner-text {
      font-size: 0.95rem;
      font-weight: 500;
    }

    .embed-btn {
      background: white;
      color: #1a4190;
      padding: 8px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      border: 2px solid white;
    }

    .embed-btn:hover {
      background: #f0f0f0;
    }

    .header {
      text-align: center;
      padding: 20px 20px 15px 20px;
      margin-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h1 {
      color: #1a4190;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .header p {
      color: #666666;
      font-size: 0.9rem;
    }

    .news-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .news-item {
      display: flex;
      gap: 20px;
      padding: 24px 0;
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.2s ease;
    }

    .news-item:hover {
      background: #f9f9f9;
    }

    .news-item:last-child {
      border-bottom: none;
    }

    .news-image-container {
      flex-shrink: 0;
      width: 200px;
      height: 130px;
    }

    .news-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 2px;
    }

    .news-content {
      flex: 1;
      min-width: 0;
    }

    .news-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }

    .news-source {
      color: #1a4190;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
    }

    .news-date {
      color: #999999;
      font-size: 0.85rem;
    }

    .news-title {
      color: #1a1a1a;
      font-size: 1.3rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 8px;
      font-family: "proxima-nova", sans-serif;
    }

    .news-title a {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .news-title a:hover {
      color: #1a4190;
    }

    .news-description {
      color: #666666;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-top: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
      font-size: 1.1rem;
    }

    .loading-spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #1a4190;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .sources-list {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .sources-list h3 {
      color: #1a4190;
      font-family: "bebas-neue", sans-serif;
      font-size: 1.3rem;
      margin-bottom: 15px;
    }

    .sources-list ul {
      list-style: none;
      padding: 0;
    }

    .sources-list li {
      padding: 8px 0;
      color: #4a4a4a;
      border-bottom: 1px solid #e0e0e0;
    }

    .sources-list li:last-child {
      border-bottom: none;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .embed-banner {
        flex-direction: column;
        gap: 10px;
        padding: 15px;
        margin: -16px -16px 20px -16px;
      }

      .embed-banner-text {
        font-size: 0.9rem;
      }

      .news-item {
        flex-direction: column;
        gap: 12px;
        padding: 20px 0;
      }

      .news-image-container {
        width: 100%;
        height: 180px;
      }

      .news-title {
        font-size: 1.15rem;
      }

      .header h1 {
        font-size: 1.3rem;
      }

      .header {
        padding: 15px 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="embed-banner">
      <span class="embed-banner-text">💡 Want to embed this feed on your website?</span>
      <a href="/embed-info" class="embed-btn">Get Embed Code</a>
    </div>

    <div class="header">
      <h1>AI News Aggregator</h1>
      <p>Latest artificial intelligence news from leading sources</p>
    </div>

    <div id="news-container">
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading latest AI news...</p>
      </div>
    </div>

    <div class="sources-list">
      <h3>News Sources (${aggregatorConfig.sources.length})</h3>
      <ul>
        ${aggregatorConfig.sources.map(source => `<li><strong>${source.title}</strong></li>`).join('\n        ')}
      </ul>
    </div>
  </div>

  <script>
    let allItems = [];
    let displayedCount = 0;
    const itemsPerPage = 15;

    // Fetch and display latest news items
    async function loadNews() {
      try {
        const response = await fetch('/rss');
        if (!response.ok) throw new Error('Failed to fetch feed');

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const items = xml.querySelectorAll('item');
        const container = document.getElementById('news-container');

        if (items.length === 0) {
          container.innerHTML = '<p class="loading">No news items found.</p>';
          return;
        }

        allItems = Array.from(items);

        const newsList = document.createElement('div');
        newsList.className = 'news-list';
        newsList.id = 'news-list';

        container.innerHTML = '';
        container.appendChild(newsList);

        // Display initial items
        displayMoreItems();

        // Setup infinite scroll
        window.addEventListener('scroll', handleScroll);

      } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('news-container').innerHTML =
          '<p class="loading">Error loading news. Please try again later.</p>';
      }
    }

    function displayMoreItems() {
      const newsList = document.getElementById('news-list');
      if (!newsList) return;

      const itemsToDisplay = allItems.slice(displayedCount, displayedCount + itemsPerPage);

      itemsToDisplay.forEach(item => {
          const title = item.querySelector('title')?.textContent || 'No title';
          const link = item.querySelector('link')?.textContent || '#';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const source = item.querySelector('source')?.textContent || 'Unknown';

          // Extract image from multiple possible locations
          let imageUrl = '';

          // Try media:content (common in feeds)
          const mediaContent = item.querySelector('content[medium="image"]') || item.querySelector('content[url]');
          if (mediaContent) {
            imageUrl = mediaContent.getAttribute('url') || '';
          }

          // Try media:thumbnail
          if (!imageUrl) {
            const mediaThumbnail = item.querySelector('thumbnail');
            if (mediaThumbnail) {
              imageUrl = mediaThumbnail.getAttribute('url') || '';
            }
          }

          // Try enclosure
          if (!imageUrl) {
            const enclosure = item.querySelector('enclosure');
            if (enclosure) {
              const type = enclosure.getAttribute('type') || '';
              if (type.startsWith('image/')) {
                imageUrl = enclosure.getAttribute('url') || '';
              }
            }
          }

          // Extract from description HTML
          if (!imageUrl && description) {
            const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          const newsItem = document.createElement('div');
          newsItem.className = 'news-item';

          const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 180);
          const date = pubDate ? new Date(pubDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : '';

          let imageHtml = '';
          if (imageUrl) {
            imageHtml = \`
              <div class="news-image-container">
                <img src="\${imageUrl}" alt="\${title}" class="news-image"
                     onerror="this.parentElement.style.display='none'">
              </div>
            \`;
          }

          newsItem.innerHTML = \`
            \${imageHtml}
            <div class="news-content">
              <div class="news-meta">
                <span class="news-source">\${source}</span>
                <span class="news-date">\${date}</span>
              </div>
              <h2 class="news-title"><a href="\${link}" target="_blank" rel="noopener">\${title}</a></h2>
              <p class="news-description">\${cleanDesc}</p>
            </div>
          \`;

          newsList.appendChild(newsItem);
      });

      displayedCount += itemsToDisplay.length;
    }

    function handleScroll() {
      // Check if user has scrolled near the bottom
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;

      if (scrollPosition >= threshold && displayedCount < allItems.length) {
        displayMoreItems();
      }
    }

    // Load news on page load
    window.addEventListener('load', loadNews);
  </script>
</body>
</html>`;
}

/**
 * News API endpoint - returns JSON data for embedding
 */
async function getNewsAPI(corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // Fetch and aggregate feeds directly instead of calling /rss endpoint
    const feedItems = await FeedAggregator.aggregate(
      aggregatorConfig.sources,
      aggregatorConfig.maxItems
    );

    // Convert feed items to API format
    const items = feedItems.slice(0, 50).map(item => {
      // Extract image from description
      let imageUrl = '';
      const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }

      return {
        title: item.title,
        link: item.link,
        description: item.description.replace(/<[^>]*>/g, '').substring(0, 200),
        pubDate: item.pubDate ? item.pubDate.toUTCString() : '',
        source: item.source?.title || 'Unknown',
        image: imageUrl
      };
    });

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}

/**
 * DEPRECATED - Old API implementation using RSS parsing
 */
async function getNewsAPI_OLD(corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const response = await fetch('/rss', {
      headers: { 'Accept': 'application/rss+xml' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const text = await response.text();

    // Simple XML parsing to extract news items
    const items: any[] = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/gi);

    for (const match of itemMatches) {
      const itemXML = match[1];

      const titleMatch = itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) ||
                        itemXML.match(/<title>(.*?)<\/title>/i);
      const linkMatch = itemXML.match(/<link>(.*?)<\/link>/i);
      const descMatch = itemXML.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
                       itemXML.match(/<description>([\s\S]*?)<\/description>/i);
      const pubDateMatch = itemXML.match(/<pubDate>(.*?)<\/pubDate>/i);
      const sourceMatch = itemXML.match(/<source[^>]*>(.*?)<\/source>/i);

      const description = descMatch ? descMatch[1] : '';

      // Extract image from multiple possible locations
      let imageUrl = '';

      // Try media:content
      const mediaContentMatch = itemXML.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaContentMatch) {
        imageUrl = mediaContentMatch[1];
      }

      // Try media:thumbnail
      if (!imageUrl) {
        const mediaThumbnailMatch = itemXML.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
        if (mediaThumbnailMatch) {
          imageUrl = mediaThumbnailMatch[1];
        }
      }

      // Try enclosure with image type
      if (!imageUrl) {
        const enclosureMatch = itemXML.match(/<enclosure[^>]+type=["']image\/[^"']*["'][^>]+url=["']([^"']+)["']/i) ||
                              itemXML.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\/[^"']*["']/i);
        if (enclosureMatch) {
          imageUrl = enclosureMatch[1];
        }
      }

      // Extract from description HTML
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      items.push({
        title: titleMatch ? titleMatch[1] : '',
        link: linkMatch ? linkMatch[1] : '',
        description: description.replace(/<[^>]*>/g, '').substring(0, 200),
        pubDate: pubDateMatch ? pubDateMatch[1] : '',
        source: sourceMatch ? sourceMatch[1] : '',
        image: imageUrl
      });

      if (items.length >= 20) break;
    }

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}

/**
 * Embed widget - lightweight embeddable version
 */
function getEmbedWidget(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: transparent;
      line-height: 1.6;
      color: #333333;
    }

    .news-feed {
      max-width: 100%;
    }

    .news-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .news-item:hover {
      background: #f9f9f9;
    }

    .news-item:last-child {
      border-bottom: none;
    }

    .news-image-container {
      flex-shrink: 0;
      width: 150px;
      height: 100px;
    }

    .news-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 2px;
    }

    .news-content {
      flex: 1;
      min-width: 0;
    }

    .news-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
      font-size: 0.75rem;
    }

    .news-source {
      color: #1a4190;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.5px;
    }

    .news-date {
      color: #999999;
      font-size: 0.75rem;
    }

    .news-title {
      color: #1a1a1a;
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .news-title a {
      color: inherit;
      text-decoration: none;
    }

    .news-title a:hover {
      color: #1a4190;
    }

    .news-description {
      color: #666666;
      font-size: 0.85rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loading {
      text-align: center;
      padding: 30px;
      color: #666;
    }

    @media (max-width: 600px) {
      .news-item {
        flex-direction: column;
        gap: 10px;
      }

      .news-image-container {
        width: 100%;
        height: 150px;
      }
    }
  </style>
</head>
<body>
  <div class="news-feed" id="news-feed">
    <div class="loading">Loading AI news...</div>
  </div>

  <script>
    (async function() {
      try {
        const response = await fetch('https://rss-feed-generator.sas-innovation.workers.dev/api/news');
        const items = await response.json();

        const feed = document.getElementById('news-feed');
        feed.innerHTML = '';

        // Display all items (up to 50)
        items.slice(0, 50).forEach(item => {
          const newsItem = document.createElement('div');
          newsItem.className = 'news-item';

          const cleanDesc = item.description;
          const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : '';

          let imageHtml = '';
          if (item.image) {
            imageHtml = \`
              <div class="news-image-container">
                <img src="\${item.image}" alt="\${item.title}" class="news-image"
                     onerror="this.parentElement.style.display='none'">
              </div>
            \`;
          }

          newsItem.innerHTML = \`
            \${imageHtml}
            <div class="news-content">
              <div class="news-meta">
                <span class="news-source">\${item.source}</span>
                <span class="news-date">\${date}</span>
              </div>
              <h3 class="news-title"><a href="\${item.link}" target="_blank" rel="noopener">\${item.title}</a></h3>
              <p class="news-description">\${cleanDesc}</p>
            </div>
          \`;

          feed.appendChild(newsItem);
        });
      } catch (error) {
        document.getElementById('news-feed').innerHTML = '<div class="loading">Failed to load news.</div>';
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Embed info page with instructions
 */
function getEmbedInfoPage(): string {
  const embedUrl = 'https://rss-feed-generator.sas-innovation.workers.dev/embed';
  const apiUrl = 'https://rss-feed-generator.sas-innovation.workers.dev/api/news';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Embed AI News Feed - Instructions</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      line-height: 1.8;
      color: #333333;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      color: #1a4190;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .header p {
      color: #666666;
      font-size: 1.1rem;
    }

    .section {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #1a4190;
    }

    .section h2 {
      color: #1a4190;
      font-weight: 700;
      font-size: 1.5rem;
      margin-bottom: 15px;
    }

    .section h3 {
      color: #1a4190;
      font-size: 1.3rem;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .code-block {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .code-block code {
      color: #f8f8f2;
    }

    .demo-container {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }

    .demo-title {
      color: #1a4190;
      font-weight: 600;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }

    .btn {
      display: inline-block;
      background: #1a4190;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 10px 10px 0;
      transition: background 0.3s ease;
    }

    .btn:hover {
      background: #4e7bae;
    }

    .btn-secondary {
      background: #666;
    }

    .btn-secondary:hover {
      background: #888;
    }

    ul, ol {
      margin-left: 20px;
      margin-top: 10px;
      margin-bottom: 10px;
    }

    li {
      margin-bottom: 8px;
    }

    .feature-list {
      list-style: none;
      margin-left: 0;
    }

    .feature-list li:before {
      content: "✓ ";
      color: #1a4190;
      font-weight: bold;
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }

      .section {
        padding: 20px;
      }

      .header h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Embed AI News Feed</h1>
      <p>Integrate the latest AI news into your website</p>
    </div>

    <div class="section">
      <h2>Quick Start</h2>
      <p>Copy and paste the code below to embed the AI news feed on your website:</p>

      <div class="code-block"><code>&lt;iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e0e0e0; border-radius: 4px;"
  title="AI News Feed"&gt;
&lt;/iframe&gt;</code></div>

      <a href="#demo" class="btn">See Live Demo</a>
      <a href="/" class="btn btn-secondary">View Full Feed</a>
    </div>

    <div class="section">
      <h2>Embedding Options</h2>

      <h3>Option 1: Simple iFrame Embed</h3>
      <p>The easiest way to embed the news feed. Just copy the code above and paste it into your HTML.</p>
      <ul class="feature-list">
        <li>No JavaScript required</li>
        <li>Automatically updates with latest news</li>
        <li>Responsive and mobile-friendly</li>
        <li>Works on any website</li>
      </ul>

      <h3>Option 2: Custom Integration via API</h3>
      <p>For advanced users who want more control over styling and layout:</p>

      <div class="code-block"><code>&lt;div id="ai-news"&gt;&lt;/div&gt;

&lt;script&gt;
fetch('${apiUrl}')
  .then(response => response.json())
  .then(items => {
    const container = document.getElementById('ai-news');

    items.forEach(item => {
      const article = document.createElement('div');
      article.innerHTML = \`
        &lt;h3&gt;&lt;a href="\${item.link}"&gt;\${item.title}&lt;/a&gt;&lt;/h3&gt;
        &lt;p&gt;\${item.description}&lt;/p&gt;
        &lt;small&gt;\${item.source} - \${new Date(item.pubDate).toLocaleDateString()}&lt;/small&gt;
      \`;
      container.appendChild(article);
    });
  });
&lt;/script&gt;</code></div>
    </div>

    <div class="section">
      <h2>API Documentation</h2>

      <h3>Endpoint</h3>
      <div class="code-block"><code>GET ${apiUrl}</code></div>

      <h3>Response Format</h3>
      <p>Returns JSON array of news items:</p>
      <div class="code-block"><code>[
  {
    "title": "Article Title",
    "link": "https://...",
    "description": "Article excerpt...",
    "pubDate": "Mon, 28 Oct 2024 12:00:00 GMT",
    "source": "TechCrunch AI",
    "image": "https://..."
  },
  ...
]</code></div>

      <h3>CORS Support</h3>
      <p>The API includes CORS headers, allowing you to fetch data from any domain:</p>
      <ul class="feature-list">
        <li>Access-Control-Allow-Origin: *</li>
        <li>No authentication required</li>
        <li>Up to 20 latest articles</li>
        <li>Cached for performance</li>
      </ul>
    </div>

    <div class="section">
      <h2>Customization</h2>
      <p>You can customize the appearance of the embedded feed:</p>

      <h3>iFrame Sizing</h3>
      <ul>
        <li><strong>Width:</strong> Set to "100%" for responsive or fixed pixel value (e.g., "800px")</li>
        <li><strong>Height:</strong> Recommended 600-800px depending on your layout</li>
      </ul>

      <h3>Styling with API</h3>
      <p>When using the API endpoint, apply your own CSS to match your website's design. The data structure gives you complete control over presentation.</p>
    </div>

    <div class="section" id="demo">
      <h2>Live Demo</h2>
      <div class="demo-title">Preview of embedded feed:</div>
      <div class="demo-container">
        <iframe
          src="${embedUrl}"
          width="100%"
          height="500"
          frameborder="0"
          style="border: none;"
          title="AI News Feed Demo">
        </iframe>
      </div>
    </div>

    <div class="section">
      <h2>News Sources</h2>
      <p>The feed aggregates content from these trusted AI news sources:</p>
      <ul>
        ${aggregatorConfig.sources.map(source => `<li><strong>${source.title}</strong></li>`).join('\n        ')}
      </ul>
    </div>

    <div class="section">
      <h2>Support</h2>
      <p>Need help with integration? Here are some resources:</p>
      <ul>
        <li><a href="/" style="color: #1a4190;">View full news feed</a></li>
        <li><a href="${embedUrl}" style="color: #1a4190;" target="_blank">Open embed widget directly</a></li>
        <li><a href="${apiUrl}" style="color: #1a4190;" target="_blank">View raw API response</a></li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Debug endpoint to test individual feed sources
 */
async function getDebugInfo(corsHeaders: Record<string, string>): Promise<Response> {
  const results: any[] = [];

  for (const source of aggregatorConfig.sources) {
    try {
      const startTime = Date.now();
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'RSS-Feed-Aggregator/1.0',
        },
      });
      const fetchTime = Date.now() - startTime;

      const xmlContent = await response.text();
      const parseStartTime = Date.now();
      const items = RSSParser.parse(xmlContent, source.url, source.title);
      const parseTime = Date.now() - parseStartTime;

      results.push({
        source: source.title,
        url: source.url,
        status: response.ok ? 'success' : 'failed',
        httpStatus: response.status,
        fetchTime: `${fetchTime}ms`,
        parseTime: `${parseTime}ms`,
        itemCount: items.length,
        contentLength: xmlContent.length,
        firstItem: items[0] ? {
          title: items[0].title,
          hasDescription: !!items[0].description,
          hasDate: !!items[0].pubDate
        } : null
      });
    } catch (error: any) {
      results.push({
        source: source.title,
        url: source.url,
        status: 'error',
        error: error.message || String(error)
      });
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
  });
}
