export interface ParsedDocument {
  frontmatter: {
    title?: string;
    description?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    date?: string;
    author?: string;
    [key: string]: any;
  };
  content: string;
  headings: Heading[];
  images: Image[];
  links: Link[];
  metaTags: {
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    ogUrl: string | null;
  };
}

export interface Heading {
  level: number;
  text: string;
  line: number;
}

export interface Image {
  alt: string;
  src: string;
  line: number;
}

export interface Link {
  text: string;
  href: string;
  isInternal: boolean;
  line: number;
}

export interface ValidationData {
  title: {
    text: string;
    length: number;
    status: 'optimal' | 'warning' | 'error';
    truncated: string;
  };
  description: {
    text: string;
    length: number;
    status: 'optimal' | 'warning' | 'error';
    truncated: string;
  };
  url: {
    breadcrumb: string;
    status: 'optimal' | 'warning' | 'error';
  };
  favicon?: {
    exists: boolean;
    dataUri?: string;
    type?: string;
  };
  score: number;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  score: number;
  passing: number;
  total: number;
  rules: Rule[];
}

export interface Rule {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  line?: number;
  value?: string | number;
  canFix?: boolean;
}
