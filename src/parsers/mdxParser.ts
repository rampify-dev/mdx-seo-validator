import matter from 'gray-matter';
import type { ParsedDocument, Heading, Image, Link } from '../types';

export function parseDocument(content: string): ParsedDocument {
  // Parse frontmatter
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Extract headings
  const headings = extractHeadings(markdownContent);

  // Extract images
  const images = extractImages(markdownContent);

  // Extract links
  const links = extractLinks(markdownContent);

  // Extract meta tags
  const canonical = extractCanonical(markdownContent);
  const ogTags = extractOpenGraphTags(markdownContent);

  return {
    frontmatter,
    content: markdownContent,
    headings,
    images,
    links,
    metaTags: {
      canonical,
      ogTitle: ogTags.title,
      ogDescription: ogTags.description,
      ogImage: ogTags.image,
      ogUrl: ogTags.url
    }
  };
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: index
      });
    }
  });

  return headings;
}

function extractImages(content: string): Image[] {
  const images: Image[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Markdown images: ![alt](src)
    const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(line)) !== null) {
      images.push({
        alt: match[1],
        src: match[2],
        line: index
      });
    }

    // JSX images: <Image alt="..." src="..." />
    const jsxRegex = /<Image[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/g;
    while ((match = jsxRegex.exec(line)) !== null) {
      images.push({
        alt: match[1],
        src: match[2],
        line: index
      });
    }
  });

  return images;
}

function extractLinks(content: string): Link[] {
  const links: Link[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Markdown links: [text](href)
    const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(line)) !== null) {
      // Skip images
      if (!line.substring(match.index - 1, match.index).startsWith('!')) {
        const href = match[2];
        links.push({
          text: match[1],
          href,
          isInternal: href.startsWith('/') || href.startsWith('#'),
          line: index
        });
      }
    }
  });

  return links;
}

function extractCanonical(content: string): string | null {
  // Look for <link rel="canonical" href="..." />
  const canonicalRegex = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i;
  const match = content.match(canonicalRegex);
  if (match) {
    return match[1];
  }

  // Also check reverse order: href before rel
  const canonicalRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*\/?>/i;
  const match2 = content.match(canonicalRegex2);
  if (match2) {
    return match2[1];
  }

  return null;
}

function extractOpenGraphTags(content: string): {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
} {
  const ogTags = {
    title: null as string | null,
    description: null as string | null,
    image: null as string | null,
    url: null as string | null
  };

  // Extract og:title
  const titleMatch = content.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i);
  if (titleMatch) {
    ogTags.title = titleMatch[1];
  } else {
    // Check reverse order
    const titleMatch2 = content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*\/?>/i);
    if (titleMatch2) {
      ogTags.title = titleMatch2[1];
    }
  }

  // Extract og:description
  const descMatch = content.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i);
  if (descMatch) {
    ogTags.description = descMatch[1];
  } else {
    const descMatch2 = content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*\/?>/i);
    if (descMatch2) {
      ogTags.description = descMatch2[1];
    }
  }

  // Extract og:image
  const imageMatch = content.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i);
  if (imageMatch) {
    ogTags.image = imageMatch[1];
  } else {
    const imageMatch2 = content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*\/?>/i);
    if (imageMatch2) {
      ogTags.image = imageMatch2[1];
    }
  }

  // Extract og:url
  const urlMatch = content.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i);
  if (urlMatch) {
    ogTags.url = urlMatch[1];
  } else {
    const urlMatch2 = content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:url["'][^>]*\/?>/i);
    if (urlMatch2) {
      ogTags.url = urlMatch2[1];
    }
  }

  return ogTags;
}
