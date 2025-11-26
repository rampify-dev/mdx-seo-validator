# MDX SEO Validator

> Real-time SEO validation for MDX/Markdown files with live Google search preview

A VS Code extension that helps you write SEO-optimized content by showing exactly how your page will appear in Google search results, with real-time validation and actionable feedback.

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)

## Features

### 🔍 Live Google Search Preview
See exactly how your page will appear in search results as you type, including:
- Favicon (auto-detected from your project)
- Site domain and breadcrumb URL
- Page title with character count (30-60 optimal)
- Meta description with character count (150-160 optimal)
- Color-coded progress bars (green/yellow/red)

### 📊 SEO Score & Validation
Get instant feedback with:
- Overall SEO score (0-100)
- Category breakdown (Meta Tags, Content, Images, Links)
- Detailed rule-by-rule validation
- Clear indicators of what's passing and failing

### ⚡ Real-Time Updates
Validation happens as you type (300ms debounce) with no manual refresh needed.

### 🎨 Framework Aware
Automatically detects favicons in:
- Next.js (App Router: `app/favicon.ico`, `app/icon.svg`)
- Next.js (Pages Router: `public/favicon.ico`)
- Astro (`public/favicon.svg`)
- Generic projects (`public/` or root `favicon.*`)

## Installation

### From Source (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rampify-dev/mdx-seo-validator.git
   cd mdx-seo-validator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

5. **Launch the extension:**
   - Press `F5` in VS Code
   - A new VS Code window will open with the extension loaded

### From Marketplace (Coming Soon)
Once published, install directly from the VS Code Marketplace.

## Usage

1. **Open any `.mdx` or `.md` file**
   - The extension activates automatically

2. **View the SEO Preview panel**
   - Look for the "SEO Validator" icon in the Activity Bar (left sidebar)
   - Click to open the preview panel

3. **Edit your frontmatter:**
   ```yaml
   ---
   title: "Your SEO-Optimized Title Here"
   description: "A compelling meta description that summarizes your content and includes relevant keywords for better search visibility."
   ---
   ```

4. **Watch the preview update in real-time**
   - Progress bars show character counts
   - Colors indicate optimization status (green = good, yellow = warning, red = needs work)

5. **Review validation rules**
   - See exactly which SEO checks are passing or failing
   - Get specific feedback for each issue

## Validation Rules

### Meta Tags (30% of score)
- ✅ **Favicon**: Detected from project structure
- ✅ **Title Length**: 30-60 characters (50-60 optimal)
- ✅ **Meta Description**: 150-160 characters (optimal)
- ⚠️ **Canonical URL**: Recommended for duplicate content
- ⚠️ **Open Graph Tags**: Required for social sharing

### Content Structure (25% of score)
- ✅ **Heading Hierarchy**: One H1 per page
- ✅ **Word Count**: 1500+ words for blog posts (1000+ minimum)

### Images (10% of score)
- ✅ **Alt Text**: All images must have descriptive alt text

### Links (10% of score)
- ⚠️ **Internal Links**: 3+ recommended for better site structure

## Configuration

Configure in VS Code settings (`Cmd+,` → search "SEO"):

```json
{
  "seo.framework": "auto",          // auto | nextjs-app | nextjs-pages | astro | remix | generic
  "seo.siteDomain": "example.com"   // Your site domain (for URL preview)
}
```

## Architecture

This extension uses **vanilla HTML/CSS/JavaScript** for the webview instead of a framework like React. This is an intentional design choice for:

- ⚡ **Performance**: <100ms load time vs 2-10s with bundled frameworks
- 🎯 **Simplicity**: Single-file webview, no build complexity
- 📦 **Size**: ~10KB inline HTML vs 500KB+ framework bundles
- 🔧 **Maintainability**: Standard web APIs, no framework lock-in

For this focused use case (live SEO preview), vanilla JS provides the best developer and user experience.

## Development

### Project Structure
```
mdx-seo-validator/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── providers/
│   │   └── WebviewProvider.ts    # Webview panel (inline HTML/CSS/JS)
│   ├── validators/
│   │   └── seoValidator.ts       # SEO validation logic
│   ├── parsers/
│   │   └── mdxParser.ts          # MDX/Markdown frontmatter parser
│   ├── utils/
│   │   └── faviconDetector.ts    # Framework-aware favicon detection
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── resources/
│   └── icon.svg                  # Extension icon
└── dist/                         # Compiled output (generated)
```

### Development Workflow

**Watch mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Package extension:**
```bash
npm run package  # Creates .vsix file
```

**Debug the extension:**
1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Open Developer Tools: `Cmd+Shift+I` (in the Extension Development Host window)
4. Check Console for webview messages

### Making Changes

The webview UI is defined in `src/providers/WebviewProvider.ts` using inline HTML:
- **Styles**: CSS in `<style>` tag
- **Markup**: HTML in template string
- **Logic**: JavaScript in `<script>` tag

This approach keeps everything in one file and eliminates build complexity.

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add schema.org validation
fix: correct title length calculation
docs: update README examples
```

## About Rampify

This extension is built by [**Rampify**](https://rampify.dev), an SEO intelligence platform for developers.

### Want More SEO Automation?

While this extension validates individual MDX/Markdown files, Rampify offers **site-wide SEO automation**:

- ✅ **Comprehensive Site Audits** - Crawl your entire site, detect 100+ SEO issues
- ✅ **Google Search Console Integration** - Real-time indexing status, search analytics
- ✅ **AI-Powered Insights** - Get actionable recommendations, not just raw data
- ✅ **Schema.org Generation** - Auto-generate valid JSON-LD for any page type
- ✅ **Content Strategy** - Discover keyword gaps, cannibalization issues
- ✅ **MCP Integration** - Bring SEO intelligence directly into Claude Code, Cursor, Windsurf

**Perfect for:**
- Next.js, Astro, Remix developers
- Technical founders building in public
- Developer agencies managing client sites
- Teams using AI coding tools (Cursor, Claude Code)

[**Try Rampify Free →**](https://rampify.dev)

---

## Roadmap

- [ ] Schema.org JSON-LD validation
- [ ] Open Graph tag validation
- [ ] Quick fix suggestions
- [ ] Export SEO report
- [ ] Bulk validation for multiple files
- [ ] Custom validation rules

## License

MIT © [Rampify](https://github.com/rampify)

## Acknowledgments

Built with:
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [unified](https://github.com/unifiedjs/unified) - Markdown processing
- [VS Code Extension API](https://code.visualstudio.com/api)

---

**Made with ❤️ by the [Rampify](https://rampify.dev) team**
