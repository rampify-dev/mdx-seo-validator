# MDX SEO Validator

> Real-time SEO validation for MDX/Markdown files with live Google search preview

## Features

- 🔍 **Live Google Search Preview** - See exactly how your page will appear in search results
- ⚡ **Real-time Validation** - Issues appear as you type
- 📊 **SEO Score** - Overall score with category breakdown
- 🎯 **Quick Fixes** - One-click solutions for common issues
- 🎨 **Framework Aware** - Supports Next.js, Astro, Remix, and generic MDX/Markdown

## Getting Started

### Prerequisites

- Node.js 20+
- VS Code 1.80+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rampify/mdx-seo-validator.git
cd mdx-seo-validator
```

2. Install dependencies:
```bash
npm install
cd webview && npm install && cd ..
```

3. Build the extension:
```bash
npm run build
```

4. Run in development mode:
```bash
npm run dev
```

5. Press `F5` in VS Code to launch the extension in a new window

### Development

The extension consists of two parts:

1. **Extension** (`src/`) - VS Code extension code (TypeScript)
2. **Webview** (`webview/`) - React UI for the preview panel

To work on the extension:
```bash
npm run watch:extension
```

To work on the webview:
```bash
npm run watch:webview
```

Or run both concurrently:
```bash
npm run dev
```

## Usage

1. Open any `.mdx` or `.md` file
2. The SEO Preview panel will appear automatically in the sidebar
3. See live preview of Google search result
4. View validation rules and scores
5. Click "Fix" buttons to auto-fix issues

## Configuration

Configure in VS Code settings:

```json
{
  "seo.framework": "auto",
  "seo.siteDomain": "example.com"
}
```

## Validation Rules

### Meta Tags
- Title length (30-60 characters)
- Meta description length (150-160 characters)
- Canonical URL
- Open Graph tags

### Content Structure
- Heading hierarchy
- Word count
- Internal links

### Images
- Alt text on all images

## License

MIT

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
