# Configuration Guide

## Settings

Configure the MDX SEO Validator extension through VS Code settings:

### 1. Site Domain
**Setting:** `seo.siteDomain`
**Default:** `example.com`
**Description:** Your production site domain (used in Google Search Preview)

```jsonc
{
  "seo.siteDomain": "workware.dev"
}
```

### 2. Dev Server URL (Rendered HTML Validation)
**Setting:** `seo.devServerUrl`
**Default:** `` (empty - feature disabled)
**Description:** Your local development server URL

```jsonc
{
  "seo.devServerUrl": "http://localhost:3000"
}
```

**When configured**, the extension will:
- Fetch the rendered HTML from your dev server
- Extract actual meta tags, Open Graph tags, Twitter Cards
- Validate Schema.org JSON-LD
- Show what **actually renders** (what Google sees)

**When not configured**, the extension will:
- Only validate frontmatter and inline MDX meta tags
- Show "Rendered HTML Validation" section as hidden

### 3. Content Path
**Setting:** `seo.contentPath`
**Default:** `content`
**Description:** Path to your content directory relative to workspace root

```jsonc
{
  "seo.contentPath": "content"
}
```

### 4. URL Pattern
**Setting:** `seo.urlPattern`
**Default:** `/blog/{slug}`
**Description:** URL pattern for content pages

```jsonc
{
  "seo.urlPattern": "/blog/{slug}"
}
```

The `{slug}` placeholder will be replaced with the MDX filename (without extension).

## Example Configurations

### Next.js Blog (Standard)
```jsonc
{
  "seo.siteDomain": "myblog.com",
  "seo.devServerUrl": "http://localhost:3000",
  "seo.contentPath": "content",
  "seo.urlPattern": "/blog/{slug}"
}
```

**File:** `content/blog/my-post.mdx`
**Dev URL:** `http://localhost:3000/blog/my-post`

### Astro Documentation Site
```jsonc
{
  "seo.siteDomain": "docs.example.com",
  "seo.devServerUrl": "http://localhost:4321",
  "seo.contentPath": "src/content/docs",
  "seo.urlPattern": "/docs/{slug}"
}
```

**File:** `src/content/docs/getting-started.mdx`
**Dev URL:** `http://localhost:4321/docs/getting-started`

### Remix Blog
```jsonc
{
  "seo.siteDomain": "remix-blog.com",
  "seo.devServerUrl": "http://localhost:3000",
  "seo.contentPath": "app/routes/blog",
  "seo.urlPattern": "/blog/{slug}"
}
```

## How It Works

### 1. Frontmatter Validation (Always Active)
- Validates frontmatter fields (title, description, image, etc.)
- Checks title/description length for SEO best practices
- Fast, real-time, no server required

### 2. Rendered HTML Validation (Optional - Requires Dev Server)
- Extension builds URL from your file path automatically
- **Auto-detects page files** (`page.mdx`, `page.tsx`) using file-system routing
- **Auto-detects content files** using `contentPath` and `urlPattern` settings
- Fetches rendered HTML from dev server
- Extracts actual meta tags using cheerio (same as Rampify)
- Shows what Google actually sees

### URL Building Logic

The extension automatically detects two patterns:

**Pattern 1: Page Files (File-System Routing)**
```
app/docs/context-driven-development/page.mdx → /docs/context-driven-development
app/blog/page.mdx → /blog
src/pages/about.mdx → /about (Astro)
```
No configuration needed - works automatically!

**Pattern 2: Content Files (Slug-Based Routing)**
```
content/blog/my-post.mdx + urlPattern "/blog/{slug}" → /blog/my-post
```
Uses `contentPath` and `urlPattern` settings.

### Benefits of Rendered HTML Validation

✅ **Truth, not assumptions** - See what actually renders
✅ **Framework-agnostic** - Works with Next.js, Astro, Remix, anything
✅ **Simple** - No complex TypeScript parsing
✅ **Reliable** - Validates final HTML output
✅ **Comprehensive** - Checks meta tags, OG tags, Twitter Cards, Schema.org

### Troubleshooting

**"Dev server not running" error:**
1. Make sure your dev server is actually running
2. Check that `seo.devServerUrl` matches your server's URL
3. Verify the URL pattern is correct for your framework

**Rendered HTML section not showing:**
- Configure `seo.devServerUrl` in settings
- Reload VS Code window

**Wrong URL being fetched:**
- Check `seo.contentPath` matches your content directory
- Verify `seo.urlPattern` matches your routing structure
- Check console logs for the generated URL
