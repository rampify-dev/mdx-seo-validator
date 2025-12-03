# VS Code Marketplace Publishing Checklist

## ✅ Prerequisites (Must Have)

### 1. Publisher Account Setup
- [ ] Create publisher at https://marketplace.visualstudio.com/manage
- [ ] Create Personal Access Token (PAT) from Azure DevOps
  - Go to: https://dev.azure.com/[your-org]/_usersSettings/tokens
  - Scopes: **Marketplace (Publish)**
  - Save the token securely
- [ ] Login with vsce: `npx vsce login rampify`

### 2. Package Configuration
- [x] Icon added (public/icon-128.png) - 128x128 PNG
- [x] Publisher set in package.json
- [x] Description is clear and keyword-rich
- [x] Categories set correctly
- [x] Keywords optimized
- [ ] Version bumped to 1.0.0 (currently 0.1.0)

### 3. Documentation
- [x] README.md is comprehensive
- [ ] Add screenshots/GIFs to README
  - [ ] Screenshot 1: Google Search Preview with live updates
  - [ ] Screenshot 2: SEO validation panel with scores
  - [ ] Screenshot 3: Settings configuration
- [x] LICENSE file exists
- [x] CONTRIBUTING.md exists
- [x] CHANGELOG.md exists

### 4. Testing
- [ ] Test on macOS (your current platform)
- [ ] Test on Windows (if possible)
- [ ] Test on Linux (if possible)
- [ ] Test with Next.js project
- [ ] Test with Astro project
- [ ] Test with content files (slug-based routing)
- [ ] Test with page files (file-system routing)
- [ ] Test without dev server configured (frontmatter only)

## 📸 Screenshots Needed

### Screenshot 1: Live Google Preview
**Show:**
- VS Code editor with MDX file open
- SEO Validator panel on the side
- Google search preview updating in real-time
- Character counts and color indicators

**Caption:** "Real-time Google search preview as you type"

### Screenshot 2: SEO Validation
**Show:**
- Validation rules with pass/fail/warning indicators
- SEO score (0-100)
- Category breakdown
- Specific recommendations

**Caption:** "Comprehensive SEO validation with actionable feedback"

### Screenshot 3: Settings
**Show:**
- VS Code settings page
- SEO extension settings configured
- devServerUrl, siteDomain, etc.

**Caption:** "Simple configuration for your framework"

## 🚀 Publishing Steps

### 1. Prepare Package
```bash
# Bump version to 1.0.0
npm version major

# Build production version
npm run build

# Test package creation
npm run package
```

### 2. Publish
```bash
# Login (first time only)
npx vsce login rampify

# Publish to marketplace
npx vsce publish
```

### 3. Post-Publishing
- [ ] Verify extension appears on marketplace
- [ ] Test installing from marketplace
- [ ] Share on Twitter/X
- [ ] Share on Dev.to
- [ ] Add marketplace badge to README
- [ ] Update Rampify website to mention the extension

## 📝 Marketplace Listing

### Short Description (80 chars)
```
SEO validation for developers - Real-time preview & meta tag checking for MDX
```

### Tags (from package.json keywords)
Already configured in package.json ✅

### Categories
- [x] Linters ✅
- [x] Other ✅

### Pricing
Free ✅

## 🎯 Optional (Can Add Later)

- [ ] Add demo GIF/video to README
- [ ] Create YouTube demo video
- [ ] Set up GitHub Actions for automated publishing
- [ ] Add telemetry/analytics (respect privacy)
- [ ] Create extension update notifications
- [ ] Add "Rate this extension" prompt

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Monitor GitHub issues
- [ ] Respond to marketplace reviews
- [ ] Check download numbers
- [ ] Look for bug reports

### Month 1
- [ ] Analyze usage patterns
- [ ] Collect feature requests
- [ ] Plan next version
- [ ] Write blog post about learnings

## 🔗 Resources

- VS Code Publishing Guide: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Marketplace Management: https://marketplace.visualstudio.com/manage/publishers/rampify
- vsce CLI Docs: https://github.com/microsoft/vscode-vsce

## ⚠️ Common Gotchas

1. **Personal Access Token** - Must have Marketplace (Publish) scope
2. **Publisher Name** - Must match exactly in package.json and PAT
3. **Icon Path** - Must be relative to package.json
4. **README Images** - Use absolute URLs or relative paths that work in marketplace
5. **Version** - Can't republish same version (must bump)
