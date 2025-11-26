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

  return {
    frontmatter,
    content: markdownContent,
    headings,
    images,
    links
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
