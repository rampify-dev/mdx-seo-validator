import * as vscode from 'vscode';
import type { ParsedDocument, ValidationData, Category, Rule } from '../types';

export function validateSEO(
  parsed: ParsedDocument,
  faviconInfo?: { exists: boolean; dataUri?: string; type?: string }
): ValidationData {
  const { frontmatter, headings, images, links } = parsed;

  // Validate title
  const title = frontmatter.title || '';
  const titleLength = title.length;
  const titleStatus = titleLength >= 50 && titleLength <= 60 ? 'optimal'
                    : titleLength >= 30 && titleLength <= 70 ? 'warning'
                    : 'error';
  const titleTruncated = titleLength > 60 ? title.slice(0, 57) + '...' : title;

  // Validate description
  const description = frontmatter.description || '';
  const descLength = description.length;
  const descStatus = descLength >= 150 && descLength <= 160 ? 'optimal'
                   : descLength >= 120 && descLength <= 170 ? 'warning'
                   : 'error';
  const descTruncated = descLength > 160 ? description.slice(0, 157) + '...' : description;

  // Build categories
  const categories: Category[] = [
    buildMetaTagsCategory(frontmatter, title, description, faviconInfo, parsed.metaTags),
    buildContentCategory(headings, parsed.content),
    buildImagesCategory(images),
    buildLinksCategory(links)
  ];

  // Calculate overall score
  const score = calculateScore(categories);

  // Get site domain from configuration
  const config = vscode.workspace.getConfiguration('seo');
  const siteDomain = config.get<string>('siteDomain') || 'example.com';
  const breadcrumb = `${siteDomain} › blog › post`;

  return {
    title: {
      text: title,
      length: titleLength,
      status: titleStatus,
      truncated: titleTruncated
    },
    description: {
      text: description,
      length: descLength,
      status: descStatus,
      truncated: descTruncated
    },
    url: {
      breadcrumb,
      status: 'optimal'
    },
    favicon: faviconInfo,
    score,
    categories
  };
}

function buildMetaTagsCategory(
  frontmatter: any,
  title: string,
  description: string,
  faviconInfo?: { exists: boolean; dataUri?: string; type?: string },
  metaTags?: {
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    ogUrl: string | null;
  }
): Category {
  const rules: Rule[] = [];

  // Favicon check
  if (faviconInfo) {
    rules.push({
      id: 'favicon',
      name: 'Favicon',
      status: faviconInfo.exists ? 'pass' : 'warning',
      message: faviconInfo.exists
        ? `Present (${faviconInfo.type})`
        : 'Missing (using fallback)',
      canFix: false
    });
  }

  // Title length
  const titleLength = title.length;
  rules.push({
    id: 'title-length',
    name: 'Title Length',
    status: titleLength >= 50 && titleLength <= 60 ? 'pass'
          : titleLength >= 30 && titleLength <= 70 ? 'warning'
          : 'error',
    message: `${titleLength} characters`,
    value: `${titleLength}/60`,
    line: 2, // Typically line 2 in frontmatter
    canFix: true
  });

  // Meta description
  const descLength = description.length;
  rules.push({
    id: 'description-length',
    name: 'Meta Description',
    status: descLength >= 150 && descLength <= 160 ? 'pass'
          : descLength >= 120 && descLength <= 170 ? 'warning'
          : 'error',
    message: `${descLength} characters`,
    value: `${descLength}/160`,
    line: 3,
    canFix: true
  });

  // Publication date
  const hasDate = !!(frontmatter.date || frontmatter.publishedAt || frontmatter.published_date);
  const dateValue = frontmatter.date || frontmatter.publishedAt || frontmatter.published_date;

  rules.push({
    id: 'publication-date',
    name: 'Publication Date',
    status: hasDate ? 'pass' : 'warning',
    message: hasDate
      ? `Present (${dateValue})`
      : 'Missing (recommended for SEO)',
    canFix: true
  });

  // Featured image
  const hasImage = !!(frontmatter.image || frontmatter.ogImage || frontmatter.cover);
  const imageValue = frontmatter.image || frontmatter.ogImage || frontmatter.cover;

  rules.push({
    id: 'featured-image',
    name: 'Featured Image',
    status: hasImage ? 'pass' : 'warning',
    message: hasImage
      ? `Present (${typeof imageValue === 'string' ? imageValue.split('/').pop() : 'set'})`
      : 'Missing (recommended for social sharing)',
    canFix: true
  });

  // Canonical URL
  const hasCanonicalFrontmatter = !!frontmatter.canonical;
  const hasCanonicalMeta = !!metaTags?.canonical;
  const hasCanonical = hasCanonicalFrontmatter || hasCanonicalMeta;

  let canonicalMessage = 'Missing';
  let canonicalStatus: 'pass' | 'warning' = 'warning';

  if (hasCanonical) {
    canonicalStatus = 'pass';
    if (hasCanonicalFrontmatter && hasCanonicalMeta) {
      canonicalMessage = 'Present (frontmatter + inline)';
    } else if (hasCanonicalFrontmatter) {
      canonicalMessage = 'Present (frontmatter)';
    } else if (hasCanonicalMeta) {
      canonicalMessage = 'Present (inline meta tag)';
    }
  }

  rules.push({
    id: 'canonical-url',
    name: 'Canonical URL',
    status: canonicalStatus,
    message: canonicalMessage,
    line: frontmatter.canonical ? 5 : undefined,
    canFix: true
  });

  // Open Graph tags
  const hasOGFrontmatter = frontmatter.ogTitle && frontmatter.ogDescription && frontmatter.ogImage;
  const hasOGMeta = metaTags?.ogTitle && metaTags?.ogDescription && metaTags?.ogImage;

  // Count how many OG tags are present
  const ogCount = [
    frontmatter.ogTitle || metaTags?.ogTitle,
    frontmatter.ogDescription || metaTags?.ogDescription,
    frontmatter.ogImage || metaTags?.ogImage,
    frontmatter.ogUrl || metaTags?.ogUrl
  ].filter(Boolean).length;

  let hasOG = false;
  let ogMessage = 'Missing some tags';
  let ogStatus: 'pass' | 'warning' = 'warning';

  if (hasOGFrontmatter || hasOGMeta) {
    hasOG = true;
    ogStatus = 'pass';

    if (ogCount === 4) {
      ogMessage = hasOGFrontmatter && hasOGMeta ? '4/4 present (frontmatter + inline)'
                : hasOGFrontmatter ? '4/4 present (frontmatter)'
                : '4/4 present (inline meta tags)';
    } else if (ogCount > 0) {
      ogMessage = `${ogCount}/4 present`;
      ogStatus = 'warning'; // Partial OG is a warning
    }
  }

  rules.push({
    id: 'og-tags',
    name: 'Open Graph Tags',
    status: ogStatus,
    message: ogMessage,
    canFix: true
  });

  const passing = rules.filter(r => r.status === 'pass').length;
  const score = Math.round((passing / rules.length) * 100);

  return {
    id: 'meta-tags',
    name: 'Meta Tags',
    score,
    passing,
    total: rules.length,
    rules
  };
}

function buildContentCategory(headings: any[], content: string): Category {
  const rules: Rule[] = [];

  // Heading hierarchy
  const h1Count = headings.filter(h => h.level === 1).length;
  rules.push({
    id: 'heading-hierarchy',
    name: 'Heading Hierarchy',
    status: h1Count === 1 ? 'pass' : 'warning',
    message: h1Count === 1 ? 'Valid (1 H1)' : `${h1Count} H1 tags found`,
    canFix: false
  });

  // Word count
  const wordCount = content.split(/\s+/).length;
  rules.push({
    id: 'word-count',
    name: 'Word Count',
    status: wordCount >= 1500 ? 'pass' : wordCount >= 1000 ? 'warning' : 'error',
    message: `${wordCount} words`,
    value: `${wordCount}/1500`,
    canFix: false
  });

  const passing = rules.filter(r => r.status === 'pass').length;
  const score = Math.round((passing / rules.length) * 100);

  return {
    id: 'content',
    name: 'Content Structure',
    score,
    passing,
    total: rules.length,
    rules
  };
}

function buildImagesCategory(images: any[]): Category {
  const rules: Rule[] = [];

  // Alt text
  const missingAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
  rules.push({
    id: 'image-alt-text',
    name: 'Image Alt Text',
    status: missingAlt === 0 ? 'pass' : 'error',
    message: missingAlt === 0 ? `All ${images.length} images have alt text` : `${missingAlt} images missing alt text`,
    value: `${images.length - missingAlt}/${images.length}`,
    canFix: true
  });

  const passing = rules.filter(r => r.status === 'pass').length;
  const score = rules.length > 0 ? Math.round((passing / rules.length) * 100) : 100;

  return {
    id: 'images',
    name: 'Images',
    score,
    passing,
    total: rules.length,
    rules
  };
}

function buildLinksCategory(links: any[]): Category {
  const rules: Rule[] = [];

  // Internal links
  const internalLinks = links.filter(l => l.isInternal).length;
  rules.push({
    id: 'internal-links',
    name: 'Internal Links',
    status: internalLinks >= 3 ? 'pass' : internalLinks >= 1 ? 'info' : 'warning',
    message: `${internalLinks} internal links`,
    value: `${internalLinks}/3`,
    canFix: true
  });

  const passing = rules.filter(r => r.status === 'pass').length;
  const score = Math.round((passing / rules.length) * 100);

  return {
    id: 'links',
    name: 'Links',
    score,
    passing,
    total: rules.length,
    rules
  };
}

function calculateScore(categories: Category[]): number {
  // Weighted average
  const weights = {
    'meta-tags': 0.30,
    'content': 0.25,
    'images': 0.10,
    'links': 0.10
  };

  let totalScore = 0;
  let totalWeight = 0;

  categories.forEach(category => {
    const weight = (weights as any)[category.id] || 0.1;
    totalScore += category.score * weight;
    totalWeight += weight;
  });

  return Math.round(totalScore / totalWeight);
}
