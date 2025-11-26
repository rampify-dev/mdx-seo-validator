# Contributing to MDX SEO Validator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mdx-seo-validator.git
   cd mdx-seo-validator
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run in development mode:**
   ```bash
   npm run dev
   ```
5. **Press F5** in VS Code to launch the extension

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Edit code in `src/`
   - Extension auto-rebuilds in watch mode
   - Reload the Extension Development Host window (`Cmd+R`) to test

3. **Test your changes:**
   - Open a `.mdx` or `.md` file in the Extension Development Host
   - Verify the SEO Preview panel works correctly
   - Check the webview Developer Tools (`Cmd+Shift+I`) for errors

4. **Build for production:**
   ```bash
   npm run build
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use VS Code's built-in formatter
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants

### Git Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

#### Format
```
<type>: <description>

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, no logic change)
- **refactor**: Code restructure (same behavior)
- **test**: Adding or updating tests
- **chore**: Maintenance (deps, config, build)

#### Examples
```bash
feat: add schema.org validation
fix: correct title length calculation
docs: update installation instructions
refactor: extract parser logic to separate module
chore: update dependencies
```

#### Best Practices
- **One logical change per commit**
- Commits should be independently testable
- Use `git add -p` to stage partial changes
- Write clear, descriptive commit messages

### Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG)
2. **Ensure the build succeeds:**
   ```bash
   npm run build
   ```
3. **Push your branch:**
   ```bash
   git push origin feat/your-feature-name
   ```
4. **Open a Pull Request** on GitHub
5. **Describe your changes:**
   - What problem does it solve?
   - How did you test it?
   - Any breaking changes?

### Code Review

- Be respectful and constructive
- Address feedback promptly
- Update your PR based on review comments
- Squash commits if requested

## Project Architecture

### Webview Design

The extension uses **vanilla HTML/CSS/JS** for the webview:
- All UI code is in `src/providers/WebviewProvider.ts`
- Inline HTML template string (no external files)
- No build step for webview (performance benefit)
- Standard web APIs only (no frameworks)

**Why vanilla?**
- <100ms load time vs 2-10s with frameworks
- No build complexity or dependency churn
- Easier to debug and maintain
- Appropriate for this use case

### Validation Logic

- **Parser** (`src/parsers/mdxParser.ts`): Extracts frontmatter and content
- **Validator** (`src/validators/seoValidator.ts`): Applies SEO rules
- **Utilities** (`src/utils/`): Helper functions (favicon detection, etc.)

### Extension Lifecycle

1. Extension activates on `.mdx` or `.md` file open
2. Webview panel registers in Activity Bar
3. Document changes trigger validation (300ms debounce)
4. Validation results sent to webview via `postMessage`
5. Webview updates UI in real-time

## Adding New Validation Rules

1. **Define the rule** in `src/validators/seoValidator.ts`:
   ```typescript
   rules.push({
     id: 'your-rule-id',
     name: 'Your Rule Name',
     status: condition ? 'pass' : 'error',
     message: 'Description of the issue',
     canFix: false
   });
   ```

2. **Update the category score calculation**

3. **Test with various MDX files**

4. **Update documentation** (README validation rules section)

## Testing

Currently, testing is manual:
1. Create test `.mdx` files with various scenarios
2. Verify validation rules trigger correctly
3. Check webview displays properly
4. Test in different VS Code themes

**Future:** Add automated tests (PRs welcome!)

## Questions?

- Open an issue for bugs or feature requests
- Tag issues with appropriate labels
- Be patient and respectful

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
