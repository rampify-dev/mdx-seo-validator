# Changelog

All notable changes to the "MDX SEO Validator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-26

### Added
- Initial release of MDX SEO Validator
- Real-time Google Search preview
- Live SEO validation as you type
- Favicon detection for multiple frameworks (Next.js, Astro, generic)
- Meta Tags validation (title, description, canonical, OG tags)
- Content Structure validation (heading hierarchy, word count)
- Images validation (alt text checking)
- Links validation (internal link count)
- SEO score calculation (0-100) with category breakdown
- Color-coded progress bars for title and description
- Detailed rule-by-rule feedback with status indicators
- Support for MDX and Markdown files
- VS Code Activity Bar integration
- Automatic activation on `.mdx` and `.md` files

### Technical
- Vanilla HTML/CSS/JS webview for performance
- TypeScript with strict mode
- Framework-aware favicon detection
- 300ms debounced validation
- Inline webview architecture (<100ms load time)

[unreleased]: https://github.com/rampify/mdx-seo-validator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rampify/mdx-seo-validator/releases/tag/v0.1.0
