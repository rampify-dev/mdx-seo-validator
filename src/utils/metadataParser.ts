import * as fs from 'fs';
import * as path from 'path';

export interface ExtractedMetadata {
  source: 'generateMetadata' | 'static' | 'none';
  filePath: string;
  fileName: string;

  // Detected fields
  hasTitle: boolean;
  hasTitleTemplate?: boolean;
  titleSource?: string; // 'static' | 'dynamic' | 'frontmatter'

  hasDescription: boolean;
  descriptionSource?: string;

  hasCanonical: boolean;
  canonicalSource?: string;

  hasOpenGraph: boolean;
  ogFields: {
    title: boolean;
    description: boolean;
    images: boolean;
    url: boolean;
  };
  ogSource?: string;

  // References to frontmatter fields (for validation)
  usesFrontmatterFields: string[];

  // Field dependencies with fallback detection
  fieldDependencies: FieldDependency[];

  // Raw extracted code (for debugging)
  rawCode?: string;
}

export interface FieldDependency {
  field: string; // e.g., "title", "ogImage", "description"
  path: string; // e.g., "post.title", "frontmatter.ogImage"
  hasFallback: boolean;
  fallbackValue?: string; // e.g., "'/default-og.png'", "generateOGImage(post.title)"
  isRequired: boolean; // true if no fallback
}

/**
 * Parse a TypeScript/JavaScript file for Next.js metadata
 */
export function parseNextJsMetadata(filePath: string): ExtractedMetadata | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  // Try to find generateMetadata function
  const generateMetadataMatch = content.match(
    /export\s+(?:async\s+)?function\s+generateMetadata\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{([\s\S]*?)(?:\n}(?:\n|$))/m
  );

  if (generateMetadataMatch) {
    return parseGenerateMetadataFunction(generateMetadataMatch[1], filePath, fileName);
  }

  // Try to find static metadata export
  const staticMetadataMatch = content.match(
    /export\s+const\s+metadata\s*(?::\s*Metadata)?\s*=\s*({[\s\S]*?});/m
  );

  if (staticMetadataMatch) {
    return parseStaticMetadata(staticMetadataMatch[1], filePath, fileName);
  }

  return {
    source: 'none',
    filePath,
    fileName,
    hasTitle: false,
    hasDescription: false,
    hasCanonical: false,
    hasOpenGraph: false,
    ogFields: {
      title: false,
      description: false,
      images: false,
      url: false
    },
    usesFrontmatterFields: [],
    fieldDependencies: []
  };
}

function parseGenerateMetadataFunction(functionBody: string, filePath: string, fileName: string): ExtractedMetadata {
  const result: ExtractedMetadata = {
    source: 'generateMetadata',
    filePath,
    fileName,
    hasTitle: false,
    hasDescription: false,
    hasCanonical: false,
    hasOpenGraph: false,
    ogFields: {
      title: false,
      description: false,
      images: false,
      url: false
    },
    usesFrontmatterFields: [],
    fieldDependencies: [],
    rawCode: functionBody
  };

  // Extract field dependencies with fallback detection
  result.fieldDependencies = extractFieldDependencies(functionBody);

  // Extract the return object
  const returnMatch = functionBody.match(/return\s+({[\s\S]*})/);
  if (!returnMatch) {
    return result;
  }

  const returnObject = returnMatch[1];

  // Check for title
  if (/title\s*:\s*/.test(returnObject)) {
    result.hasTitle = true;
    result.titleSource = detectSource(returnObject, 'title');
    extractFrontmatterRefs(returnObject, 'title', result.usesFrontmatterFields);
  }

  // Check for description
  if (/description\s*:\s*/.test(returnObject)) {
    result.hasDescription = true;
    result.descriptionSource = detectSource(returnObject, 'description');
    extractFrontmatterRefs(returnObject, 'description', result.usesFrontmatterFields);
  }

  // Check for canonical (in alternates.canonical)
  if (/alternates\s*:\s*{[\s\S]*?canonical\s*:\s*/.test(returnObject)) {
    result.hasCanonical = true;
    result.canonicalSource = 'dynamic';
  }

  // Check for openGraph
  const ogMatch = returnObject.match(/openGraph\s*:\s*{([\s\S]*?)(?:},|\}$)/);
  if (ogMatch) {
    result.hasOpenGraph = true;
    const ogObject = ogMatch[1];

    result.ogFields.title = /title\s*:\s*/.test(ogObject);
    result.ogFields.description = /description\s*:\s*/.test(ogObject);
    result.ogFields.images = /images\s*:\s*/.test(ogObject);
    result.ogFields.url = /url\s*:\s*/.test(ogObject);

    result.ogSource = 'dynamic';

    // Extract frontmatter references from OG fields
    extractFrontmatterRefs(ogObject, 'title', result.usesFrontmatterFields);
    extractFrontmatterRefs(ogObject, 'description', result.usesFrontmatterFields);
    extractFrontmatterRefs(ogObject, 'image', result.usesFrontmatterFields);
    extractFrontmatterRefs(ogObject, 'ogImage', result.usesFrontmatterFields);
  }

  return result;
}

function parseStaticMetadata(metadataObject: string, filePath: string, fileName: string): ExtractedMetadata {
  const result: ExtractedMetadata = {
    source: 'static',
    filePath,
    fileName,
    hasTitle: false,
    hasDescription: false,
    hasCanonical: false,
    hasOpenGraph: false,
    ogFields: {
      title: false,
      description: false,
      images: false,
      url: false
    },
    usesFrontmatterFields: [],
    fieldDependencies: extractFieldDependencies(metadataObject),
    rawCode: metadataObject
  };

  // Check for title
  if (/title\s*:\s*['"`]/.test(metadataObject)) {
    result.hasTitle = true;
    result.titleSource = 'static';
  }

  // Check for description
  if (/description\s*:\s*['"`]/.test(metadataObject)) {
    result.hasDescription = true;
    result.descriptionSource = 'static';
  }

  // Check for canonical
  if (/alternates\s*:\s*{[\s\S]*?canonical\s*:\s*['"`]/.test(metadataObject)) {
    result.hasCanonical = true;
    result.canonicalSource = 'static';
  }

  // Check for openGraph
  const ogMatch = metadataObject.match(/openGraph\s*:\s*{([\s\S]*?)}/);
  if (ogMatch) {
    result.hasOpenGraph = true;
    const ogObject = ogMatch[1];

    result.ogFields.title = /title\s*:\s*['"`]/.test(ogObject);
    result.ogFields.description = /description\s*:\s*['"`]/.test(ogObject);
    result.ogFields.images = /images\s*:\s*\[/.test(ogObject);
    result.ogFields.url = /url\s*:\s*['"`]/.test(ogObject);

    result.ogSource = 'static';
  }

  return result;
}

function detectSource(code: string, field: string): string {
  // Check if the field value is a string literal (static)
  const staticPattern = new RegExp(`${field}\\s*:\\s*['"\`]`);
  if (staticPattern.test(code)) {
    return 'static';
  }

  // Check if it references frontmatter or props
  const frontmatterPattern = new RegExp(`${field}\\s*:\\s*(?:post|frontmatter|data)\\.`);
  if (frontmatterPattern.test(code)) {
    return 'frontmatter';
  }

  return 'dynamic';
}

function extractFrontmatterRefs(code: string, field: string, refs: string[]): void {
  // Look for patterns like: post.title, frontmatter.ogImage, data.description
  const patterns = [
    new RegExp(`(?:post|frontmatter|data)\\.(${field})`, 'g'),
    new RegExp(`(?:post|frontmatter|data)\\.([a-zA-Z_][a-zA-Z0-9_]*)`, 'g')
  ];

  for (const pattern of patterns) {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      const fieldName = match[1];
      if (fieldName && !refs.includes(fieldName)) {
        refs.push(fieldName);
      }
    }
  }
}

/**
 * Extract field dependencies from metadata code with fallback detection
 */
function extractFieldDependencies(code: string): FieldDependency[] {
  const dependencies: FieldDependency[] = [];
  const seen = new Set<string>();

  // Patterns to detect field references with fallbacks
  const patterns = [
    // Nullish coalescing: post.ogImage ?? '/default.png'
    /(?:post|frontmatter|data)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\?\?\s*([^,}\n]+)/g,

    // Logical OR: post.ogImage || '/default.png'
    /(?:post|frontmatter|data)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\|\s*([^,}\n]+)/g,

    // Ternary: post.ogImage ? post.ogImage : '/default.png'
    /(?:post|frontmatter|data)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\?\s*(?:post|frontmatter|data)\.\1\s*:\s*([^,}\n]+)/g,

    // Simple reference: post.title (no fallback)
    /(?:post|frontmatter|data)\.([a-zA-Z_][a-zA-Z0-9_]*)(?!\s*(\?\?|\|\||\?))/g
  ];

  // First pass: detect references with fallbacks
  for (let i = 0; i < 3; i++) {
    const pattern = patterns[i];
    const matches = code.matchAll(pattern);

    for (const match of matches) {
      const field = match[1];
      const fallback = match[2]?.trim();

      if (field && !seen.has(field)) {
        seen.add(field);
        dependencies.push({
          field,
          path: `post.${field}`,
          hasFallback: true,
          fallbackValue: fallback,
          isRequired: false
        });
      }
    }
  }

  // Second pass: detect references without fallbacks
  const simplePattern = patterns[3];
  const simpleMatches = code.matchAll(simplePattern);

  for (const match of simpleMatches) {
    const field = match[1];

    if (field && !seen.has(field)) {
      seen.add(field);
      dependencies.push({
        field,
        path: `post.${field}`,
        hasFallback: false,
        isRequired: true
      });
    }
  }

  return dependencies;
}

/**
 * Validate extracted metadata against SEO best practices
 */
export function validateMetadata(metadata: ExtractedMetadata): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const maxScore = 5;

  if (metadata.source === 'none') {
    return {
      score: 0,
      issues: ['No metadata configuration found in page.tsx or layout.tsx'],
      suggestions: ['Add generateMetadata() function or export const metadata']
    };
  }

  // Check title
  if (metadata.hasTitle) {
    score++;
  } else {
    issues.push('Missing title field');
  }

  // Check description
  if (metadata.hasDescription) {
    score++;
  } else {
    issues.push('Missing description field');
  }

  // Check canonical
  if (metadata.hasCanonical) {
    score++;
  } else {
    suggestions.push('Consider adding alternates.canonical for SEO');
  }

  // Check Open Graph
  if (metadata.hasOpenGraph) {
    score++;

    const ogMissing: string[] = [];
    if (!metadata.ogFields.title) ogMissing.push('title');
    if (!metadata.ogFields.description) ogMissing.push('description');
    if (!metadata.ogFields.images) ogMissing.push('images');

    if (ogMissing.length > 0) {
      suggestions.push(`Add missing OG fields: ${ogMissing.join(', ')}`);
    }
  } else {
    suggestions.push('Add openGraph object for social sharing');
  }

  // Bonus point for complete OG
  if (metadata.ogFields.title && metadata.ogFields.description && metadata.ogFields.images) {
    score++;
  }

  return {
    score: Math.round((score / maxScore) * 100),
    issues,
    suggestions
  };
}
