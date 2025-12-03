# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MDX SEO Validator is a VS Code extension that provides real-time SEO validation for MDX/Markdown files with a live Google search preview. Built by Rampify for content-driven sites (Next.js, Astro, Remix, etc.).

## Commands

### Development
```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Build for production
npm run build

# Package extension as .vsix
npm run package
```

### Testing the Extension
1. Run `npm run dev` to start watch mode
2. Press `F5` in VS Code to launch Extension Development Host
3. Open an `.mdx` or `.md` file in the development window
4. Open the SEO Validator panel from the Activity Bar (left sidebar)
5. Check Developer Tools (`Cmd+Shift+I`) for debugging webview messages

## Architecture

### Design Philosophy: Vanilla HTML over React

The webview UI uses **vanilla HTML/CSS/JavaScript** instead of React/Vue. This is intentional:
- Performance: <100ms load time vs 2-10s with frameworks
- Simplicity: Single-file webview, no build complexity
- Size: ~10KB inline HTML vs 500KB+ framework bundles

The entire webview is defined in `src/providers/WebviewProvider.ts` with inline HTML, CSS, and JavaScript.

### Core Components

**Extension Lifecycle** (`src/extension.ts`)
- Registers webview provider and commands
- Sets up auto-validation with 300ms debounce on text changes
- Handles editor change events

**Webview Provider** (`src/providers/WebviewProvider.ts`)
- Manages the SEO preview panel (inline HTML/CSS/JS)
- Orchestrates validation pipeline:
  1. Parse document with `mdxParser`
  2. Detect favicon with `faviconDetector`
  3. Validate SEO with `seoValidator`
  4. Optionally validate rendered HTML with `htmlValidator`
- Sends validation data to webview via `postMessage`

**Parsers** (`src/parsers/mdxParser.ts`)
- Parses frontmatter with `gray-matter`
- Extracts headings, images, links from markdown
- Extracts inline meta tags (canonical, OG tags) from MDX

**Validators** (`src/validators/seoValidator.ts`)
- Validates title length (30-60 chars optimal, 50-60 best)
- Validates description length (150-160 chars optimal)
- Checks heading hierarchy, image alt text, internal links
- Calculates weighted SEO score (meta tags 30%, content 25%, images 10%, links 10%)
- Returns category-based validation results

**HTML Validator** (`src/utils/htmlValidator.ts`)
- Fetches rendered HTML from dev server (configurable via `seo.devServerUrl`)
- Uses cheerio to extract actual meta tags (what Google sees)
- Validates Open Graph tags, Twitter Cards, Schema.org JSON-LD
- Only runs when `seo.devServerUrl` is configured

**Metadata Parser** (`src/utils/metadataParser.ts`)
- Parses Next.js `generateMetadata` and static `metadata` exports
- Detects field dependencies and fallbacks
- Used for framework-aware validation (future feature)

### Data Flow

```
User edits .mdx file
  → onDidChangeTextDocument (300ms debounce)
  → WebviewProvider.validateDocument()
  → parseDocument() → Parse frontmatter + extract content
  → detectFavicon() → Find favicon in workspace
  → validateRenderedHtml() → Fetch rendered HTML (if configured)
  → validateSEO() → Calculate scores and rules
  → postMessage() → Send to webview
  → Webview updates Google Search Preview + validation rules
```

### Configuration System

Settings in `package.json` → `contributes.configuration`:
- `seo.siteDomain`: Domain for URL preview (default: "example.com")
- `seo.devServerUrl`: Dev server URL for rendered HTML validation (optional)
- `seo.contentPath`: Content directory path (default: "content")
- `seo.urlPattern`: URL pattern with `{slug}` placeholder (default: "/blog/{slug}")

When `devServerUrl` is configured, the extension fetches rendered HTML to validate actual output.

### Validation Precedence

**Framework metadata takes precedence over frontmatter:**
- If Next.js `generateMetadata` defines a field, it overrides frontmatter
- Frontmatter is used as fallback when framework metadata doesn't provide a field
- This matches how frameworks actually render pages

Example: If `page.tsx` has `generateMetadata` that returns `title: post.title`, the extension validates `post.title` (not frontmatter.title).

## File Structure

```
src/
├── extension.ts              # Extension entry point
├── providers/
│   └── WebviewProvider.ts    # Webview UI (inline HTML/CSS/JS)
├── validators/
│   └── seoValidator.ts       # SEO validation logic
├── parsers/
│   └── mdxParser.ts          # MDX/Markdown parsing
├── utils/
│   ├── faviconDetector.ts    # Framework-aware favicon detection
│   ├── frameworkDetector.ts  # Detect Next.js/Astro/Remix
│   ├── htmlValidator.ts      # Rendered HTML validation
│   └── metadataParser.ts     # Next.js metadata extraction
└── types/
    └── index.ts              # TypeScript interfaces
```

## Working with the Webview

The webview is defined in `WebviewProvider.ts` as a single inline HTML string. To modify the UI:

1. **Styles**: Edit the `<style>` tag
2. **Markup**: Edit the HTML template string
3. **Logic**: Edit the `<script>` tag
4. **Communication**: Use `window.postMessage()` (webview → extension) and `webview.postMessage()` (extension → webview)

Message types:
- `ready`: Webview initialized
- `no-file`: Show "open MDX file" prompt
- `validation-data`: SEO validation results
- `open-url`: Open external URL

## Testing Workflow

1. Open extension in VS Code
2. Run `npm run dev` (watch mode)
3. Press `F5` to launch Extension Development Host
4. Open test MDX file (e.g., `test/sample.mdx`)
5. Make changes and verify real-time updates
6. Check Developer Tools console for errors

## Commit Conventions

Follow Conventional Commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring

## Extension Architecture Notes

This extension uses VS Code's webview view API (not webview panel):
- Webview is in the Activity Bar, not a separate panel
- Uses `registerWebviewViewProvider` instead of `createWebviewPanel`
- Persists when hidden (state maintained)
- Less intrusive than panels

## Future Features (from README roadmap)

- Schema.org JSON-LD validation
- Open Graph tag validation
- Quick fix suggestions
- Export SEO report
- Bulk validation for multiple files
- Custom validation rules
