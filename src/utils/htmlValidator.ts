import axios from 'axios';
import * as cheerio from 'cheerio';

export interface RenderedMetadata {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaOrg: {
    types: string[];
    count: number;
  };
  hasH1: boolean;
  h1Text: string | null;
}

export interface HtmlValidationResult {
  success: boolean;
  url: string;
  metadata?: RenderedMetadata;
  error?: string;
}

/**
 * Fetch and validate rendered HTML from dev server
 */
export async function validateRenderedHtml(
  url: string,
  timeout: number = 5000
): Promise<HtmlValidationResult> {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'MDX-SEO-Validator/1.0'
      },
      validateStatus: (status) => status === 200
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract meta tags
    const metadata: RenderedMetadata = {
      // Basic meta tags
      title: $('title').first().text() || null,
      description: $('meta[name="description"]').attr('content') || null,
      canonical: $('link[rel="canonical"]').attr('href') || null,

      // Open Graph
      ogTitle: $('meta[property="og:title"]').attr('content') || null,
      ogDescription: $('meta[property="og:description"]').attr('content') || null,
      ogImage: $('meta[property="og:image"]').attr('content') || null,
      ogUrl: $('meta[property="og:url"]').attr('content') || null,
      ogType: $('meta[property="og:type"]').attr('content') || null,

      // Twitter Cards
      twitterCard: $('meta[name="twitter:card"]').attr('content') || null,
      twitterTitle: $('meta[name="twitter:title"]').attr('content') || null,
      twitterDescription: $('meta[name="twitter:description"]').attr('content') || null,
      twitterImage: $('meta[name="twitter:image"]').attr('content') || null,

      // Schema.org (JSON-LD)
      schemaOrg: extractSchemaOrg($),

      // Heading structure
      hasH1: $('h1').length > 0,
      h1Text: $('h1').first().text() || null
    };

    return {
      success: true,
      url,
      metadata
    };
  } catch (error: any) {
    return {
      success: false,
      url,
      error: error.code === 'ECONNREFUSED'
        ? 'Dev server not running'
        : error.message || 'Failed to fetch page'
    };
  }
}

/**
 * Extract Schema.org data from JSON-LD scripts
 */
function extractSchemaOrg($: cheerio.CheerioAPI): { types: string[]; count: number } {
  const types = new Set<string>();
  let count = 0;

  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const json = JSON.parse($(elem).html() || '{}');
      count++;

      // Handle single schema or array
      const schemas = Array.isArray(json) ? json : [json];

      schemas.forEach(schema => {
        if (schema['@type']) {
          types.add(schema['@type']);
        }
      });
    } catch (e) {
      // Invalid JSON, skip
    }
  });

  return {
    types: Array.from(types),
    count
  };
}

/**
 * Build URL from file path based on user configuration
 */
export function buildUrlFromPath(
  filePath: string,
  devServerUrl: string,
  contentPath: string,
  urlPattern: string
): string | null {
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1];

  // CASE 1: File-system routing (page.mdx, page.tsx, or Astro/Remix pages)
  // Examples:
  //   app/docs/context-driven-development/page.mdx → /docs/context-driven-development
  //   app/blog/page.mdx → /blog
  //   src/pages/about.mdx → /about (Astro)
  if (isPageFile(fileName)) {
    return buildPageFileUrl(pathParts, fileName, devServerUrl);
  }

  // CASE 2: Content files with slug-based routing
  // Example: content/blog/my-post.mdx + pattern "/blog/{slug}" → /blog/my-post
  const slug = fileName.replace(/\.(mdx|md)$/, '');
  const contentIndex = pathParts.indexOf(contentPath);

  if (contentIndex === -1) {
    return null;
  }

  const url = urlPattern.replace('{slug}', slug);
  return `${devServerUrl}${url}`;
}

/**
 * Check if file is a page file (Next.js, Astro, Remix)
 */
function isPageFile(fileName: string): boolean {
  return fileName === 'page.mdx' ||
         fileName === 'page.tsx' ||
         fileName === 'page.jsx' ||
         fileName.match(/^\[.*\]\.mdx$/) !== null; // Astro/Remix dynamic routes
}

/**
 * Build URL for page files based on file-system routing
 */
function buildPageFileUrl(pathParts: string[], fileName: string, devServerUrl: string): string {
  // Find the app/src directory (framework root)
  const appIndex = pathParts.findIndex(part => part === 'app' || part === 'src');

  if (appIndex === -1) {
    return devServerUrl;
  }

  // Extract route parts after app/src
  const routeParts = pathParts.slice(appIndex + 1);

  // Remove page.mdx/page.tsx from the end
  if (fileName.startsWith('page.')) {
    routeParts.pop();
  }

  // Remove 'pages' directory if it exists (Astro/Remix)
  if (routeParts[0] === 'pages') {
    routeParts.shift();
  }

  // Build URL path
  const urlPath = routeParts.length > 0 ? '/' + routeParts.join('/') : '/';

  return `${devServerUrl}${urlPath}`;
}
