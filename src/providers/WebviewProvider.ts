import * as vscode from 'vscode';
import { parseDocument } from '../parsers/mdxParser';
import { validateSEO } from '../validators/seoValidator';
import { detectFavicon, getFaviconDataUri } from '../utils/faviconDetector';
import { detectFramework, findMetadataFiles } from '../utils/frameworkDetector';
import { parseNextJsMetadata, validateMetadata, type ExtractedMetadata } from '../utils/metadataParser';

export class SEOWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'seoPreview';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'ready':
          // Webview is ready, send initial data
          const editor = vscode.window.activeTextEditor;
          if (editor && (editor.document.languageId === 'mdx' || editor.document.languageId === 'markdown')) {
            this.validateDocument(editor.document);
          } else {
            // No valid file open, show prompt
            this._view?.webview.postMessage({
              type: 'no-file',
              message: editor
                ? 'Open an MDX or Markdown file to see SEO validation'
                : 'Open an MDX or Markdown file to see SEO validation'
            });
          }
          break;

        case 'open-url':
          // Open external URL
          vscode.env.openExternal(vscode.Uri.parse(data.url));
          break;
      }
    });
  }

  public async validateDocument(document: vscode.TextDocument) {
    if (!this._view) {
      return;
    }

    // Only validate MDX and Markdown files
    if (document.languageId !== 'mdx' && document.languageId !== 'markdown') {
      this._view.webview.postMessage({
        type: 'no-file',
        message: 'Open an MDX or Markdown file to see SEO validation'
      });
      return;
    }

    // Parse the document
    const parsed = parseDocument(document.getText());

    // Detect favicon
    let faviconInfo;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      const favicon = await detectFavicon(workspaceFolder);
      if (favicon.exists && favicon.path) {
        const dataUri = getFaviconDataUri(favicon.path);
        faviconInfo = {
          exists: true,
          dataUri: dataUri || undefined,
          type: favicon.type
        };
      } else {
        faviconInfo = { exists: false };
      }
    }

    // Detect framework and parse metadata files
    let frameworkMetadata;
    if (workspaceFolder) {
      const framework = await detectFramework(workspaceFolder);

      if (framework.type !== 'unknown') {
        const metadataFiles = findMetadataFiles(document.uri.fsPath, framework.type);

        if (metadataFiles.length > 0) {
          // Parse the first metadata file found (usually page.tsx or layout.tsx)
          const extractedMetadata = parseNextJsMetadata(metadataFiles[0]);

          if (extractedMetadata) {
            const validation = validateMetadata(extractedMetadata);

            frameworkMetadata = {
              framework: framework.type,
              hasMetadata: extractedMetadata.source !== 'none',
              fileName: extractedMetadata.fileName,
              source: extractedMetadata.source,
              fields: {
                title: extractedMetadata.hasTitle,
                description: extractedMetadata.hasDescription,
                canonical: extractedMetadata.hasCanonical,
                openGraph: extractedMetadata.hasOpenGraph
              },
              score: validation.score,
              issues: validation.issues,
              suggestions: validation.suggestions
            };
          }
        }
      }
    }

    // Validate SEO
    const validation = validateSEO(parsed, faviconInfo, frameworkMetadata);

    // Send to webview
    this._view.webview.postMessage({
      type: 'validation-update',
      data: validation
    });
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
      line-height: 1.6;
    }
    .section {
      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Google Search Preview Styles */
    .google-preview {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      padding: 16px;
      border-radius: 4px;
      font-family: arial, sans-serif;
    }
    .site-name {
      font-size: 14px;
      font-weight: 400;
      color: var(--vscode-foreground);
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .favicon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--vscode-input-background);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      overflow: hidden;
    }
    .favicon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .breadcrumb {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      line-height: 16px;
    }
    .title {
      font-size: 20px;
      line-height: 26px;
      font-weight: 400;
      color: #8ab4f8;
      margin-bottom: 4px;
      cursor: pointer;
      font-family: arial, sans-serif;
    }
    .title:hover {
      text-decoration: underline;
    }
    .description {
      font-size: 14px;
      line-height: 22px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
      font-family: arial, sans-serif;
    }
    .date-prefix {
      color: var(--vscode-descriptionForeground);
    }

    /* Validation indicators */
    .validation-row {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .char-count {
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      font-family: var(--vscode-font-family);
    }
    .progress-bar {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      position: absolute;
      left: 0;
      top: 0;
    }
    .status-optimal { color: #4ec9b0; }
    .status-warning { color: #ce9178; }
    .status-error { color: #f48771; }
    .score-value {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 8px;
    }
    .category {
      padding: 12px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .category:last-child {
      border-bottom: none;
    }
    .category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      gap: 12px;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .category-name {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }
    .status-circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-circle.pass {
      background: #4ec9b0;
    }
    .status-circle.warning {
      background: #ce9178;
    }
    .status-circle.error {
      background: #f48771;
    }
    .status-circle.info {
      background: #569cd6;
    }
    .rule-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0 6px 18px;
      font-size: 12px;
    }
    .rule-details {
      flex: 1;
    }
    .rule-name {
      font-weight: 400;
      margin-bottom: 2px;
    }
    .rule-message {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--vscode-panel-border);
      text-align: center;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }
    .footer a {
      color: #0e639c;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--vscode-descriptionForeground);
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .empty-state-message {
      font-size: 14px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div id="empty-state" class="empty-state" style="display: none;">
    <div class="empty-state-icon">📄</div>
    <div class="empty-state-message" id="empty-state-text">
      Open an MDX or Markdown file to see SEO validation
    </div>
  </div>

  <div id="content-sections">
  <div class="section">
    <h2>Google Search Preview</h2>
    <div class="google-preview">
      <!-- Site name with favicon -->
      <div class="site-name">
        <span class="favicon" id="favicon">🌐</span>
        <span id="site-name">example.com</span>
      </div>

      <!-- Breadcrumb URL -->
      <div class="breadcrumb" id="breadcrumb">https://example.com › blog › post</div>

      <!-- Title (Google blue) -->
      <div class="title" id="title-preview">No title</div>

      <!-- Description with date -->
      <div class="description" id="desc-preview">
        <span class="date-prefix">Nov 25, 2025 — </span>
        <span id="desc-text">No description</span>
      </div>

      <!-- Validation indicators -->
      <div class="validation-row">
        <div class="char-count">
          <span style="font-weight: 500; flex-shrink: 0;">Title:</span>
          <div class="progress-bar">
            <div class="progress-fill" id="title-progress" style="width: 0%; background: transparent;"></div>
          </div>
          <span id="title-count" class="status-error">0/60</span>
        </div>
        <div class="char-count">
          <span style="font-weight: 500; flex-shrink: 0;">Desc:</span>
          <div class="progress-bar">
            <div class="progress-fill" id="desc-progress" style="width: 0%; background: transparent;"></div>
          </div>
          <span id="desc-count" class="status-error">0/160</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>SEO Score</h2>
    <div class="score-value" id="score-value">0/100</div>
    <div class="progress-bar" style="height: 8px;">
      <div class="progress-fill bg-error" id="score-progress" style="width: 0%"></div>
    </div>
    <div class="score-bar" style="text-align: center; margin-top: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);" id="score-label">
      Poor
    </div>
  </div>

  <div class="section" id="framework-section" style="display: none;">
    <h2>Framework Metadata</h2>
    <div id="framework-content"></div>
  </div>

  <div class="section">
    <h2>Validation Rules</h2>
    <div id="categories"></div>
  </div>

  <div class="footer">
    Powered by <a href="https://rampify.dev" id="rampify-link">Rampify</a> •
    <a href="https://github.com/rampify-dev/mdx-seo-validator" id="github-link">Open Source</a>
  </div>
  </div><!-- end content-sections -->

  <script>
    const vscode = acquireVsCodeApi();

    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'validation-update') {
        showContent();
        updateUI(message.data);
      } else if (message.type === 'no-file') {
        showEmptyState(message.message);
      }
    });

    function showEmptyState(message) {
      document.getElementById('empty-state').style.display = 'block';
      document.getElementById('content-sections').style.display = 'none';
      document.getElementById('empty-state-text').textContent = message;
    }

    function showContent() {
      document.getElementById('empty-state').style.display = 'none';
      document.getElementById('content-sections').style.display = 'block';
    }

    function updateUI(data) {
      if (!data) return;

      // Update title
      if (data.title) {
        document.getElementById('title-preview').textContent = data.title.truncated || data.title.text || 'No title';
        document.getElementById('title-count').textContent = data.title.length + '/60';
        document.getElementById('title-count').className = 'status-' + data.title.status;

        const titleProgress = document.getElementById('title-progress');
        titleProgress.style.width = Math.min((data.title.length / 60) * 100, 100) + '%';
        // Set background color based on status
        const titleColor = data.title.status === 'optimal' ? '#4ec9b0' : data.title.status === 'warning' ? '#ce9178' : '#f48771';
        titleProgress.style.background = titleColor;
      }

      // Update description
      if (data.description) {
        const descText = data.description.truncated || data.description.text || 'No description';
        document.getElementById('desc-text').textContent = descText;
        document.getElementById('desc-count').textContent = data.description.length + '/160';
        document.getElementById('desc-count').className = 'status-' + data.description.status;

        const descProgress = document.getElementById('desc-progress');
        descProgress.style.width = Math.min((data.description.length / 160) * 100, 100) + '%';
        // Set background color based on status
        const descColor = data.description.status === 'optimal' ? '#4ec9b0' : data.description.status === 'warning' ? '#ce9178' : '#f48771';
        descProgress.style.background = descColor;
      }

      // Update URL/breadcrumb
      if (data.url) {
        document.getElementById('breadcrumb').textContent = data.url.breadcrumb;
        // Extract domain for site name
        const domain = data.url.breadcrumb.split(' › ')[0].replace('https://', '').replace('http://', '');
        document.getElementById('site-name').textContent = domain;
      }

      // Update favicon
      const faviconEl = document.getElementById('favicon');
      if (data.favicon && data.favicon.exists && data.favicon.dataUri) {
        // Display actual favicon
        faviconEl.innerHTML = '<img src="' + data.favicon.dataUri + '" alt="Favicon" />';
      } else {
        // Fallback to globe emoji
        faviconEl.innerHTML = '🌐';
      }

      // Update score
      if (data.score !== undefined) {
        document.getElementById('score-value').textContent = data.score + '/100';
        document.getElementById('score-progress').style.width = data.score + '%';
        const scoreClass = data.score >= 90 ? 'optimal' : data.score >= 70 ? 'warning' : 'error';
        const scoreLabel = data.score >= 90 ? 'Excellent' : data.score >= 70 ? 'Good' : data.score >= 50 ? 'Needs Improvement' : 'Poor';
        document.getElementById('score-progress').className = 'progress-fill bg-' + scoreClass;
        document.getElementById('score-label').textContent = scoreLabel;
      }

      // Update categories
      if (data.categories) {
        const categoriesEl = document.getElementById('categories');
        categoriesEl.innerHTML = data.categories.map(cat => {
          const statusClass = cat.score === 100 ? 'pass' : cat.score >= 75 ? 'warning' : 'error';

          // Generate rules HTML
          const rulesHtml = cat.rules.map(rule => \`
            <div class="rule-item">
              <span class="status-circle \${rule.status}"></span>
              <div class="rule-details">
                <div class="rule-name">\${rule.name}</div>
                <div class="rule-message">\${rule.message}</div>
              </div>
            </div>
          \`).join('');

          return \`
            <div class="category">
              <div class="category-header">
                <div class="category-name">
                  <span class="status-circle \${statusClass}"></span>
                  <span>\${cat.name} (\${cat.passing}/\${cat.total} passing)</span>
                </div>
                <span>\${cat.score}%</span>
              </div>
              \${rulesHtml}
            </div>
          \`;
        }).join('');
      }

      // Update framework metadata section
      if (data.frameworkMetadata && data.frameworkMetadata.hasMetadata) {
        const fm = data.frameworkMetadata;
        document.getElementById('framework-section').style.display = 'block';

        const frameworkName = {
          'nextjs-app': 'Next.js App Router',
          'nextjs-pages': 'Next.js Pages Router',
          'astro': 'Astro',
          'remix': 'Remix'
        }[fm.framework] || fm.framework;

        let html = \`
          <div style="margin-bottom: 12px; font-size: 12px; color: var(--vscode-descriptionForeground);">
            <strong>\${frameworkName}</strong> • \${fm.fileName}
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 11px; color: var(--vscode-descriptionForeground);">Type:</span>
            <span style="font-size: 12px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
              \${fm.source === 'generateMetadata' ? 'generateMetadata()' : 'static metadata'}
            </span>
          </div>
        \`;

        // Show fields detected
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">';

        const fields = [
          { name: 'Title', value: fm.fields.title },
          { name: 'Description', value: fm.fields.description },
          { name: 'Canonical', value: fm.fields.canonical },
          { name: 'Open Graph', value: fm.fields.openGraph }
        ];

        fields.forEach(field => {
          const icon = field.value ? '✓' : '✗';
          const color = field.value ? '#4ec9b0' : '#f48771';
          html += \`
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: \${color}; font-weight: bold;">\${icon}</span>
              <span>\${field.name}</span>
            </div>
          \`;
        });

        html += '</div>';

        // Show issues and suggestions
        if (fm.issues && fm.issues.length > 0) {
          html += '<div style="margin-top: 12px; padding: 8px; background: rgba(244, 135, 113, 0.1); border-left: 3px solid #f48771; font-size: 11px;">';
          fm.issues.forEach(issue => {
            html += \`<div style="margin-bottom: 4px;">• \${issue}</div>\`;
          });
          html += '</div>';
        }

        if (fm.suggestions && fm.suggestions.length > 0) {
          html += '<div style="margin-top: 8px; padding: 8px; background: rgba(206, 145, 120, 0.1); border-left: 3px solid #ce9178; font-size: 11px;">';
          fm.suggestions.forEach(suggestion => {
            html += \`<div style="margin-bottom: 4px;">💡 \${suggestion}</div>\`;
          });
          html += '</div>';
        }

        document.getElementById('framework-content').innerHTML = html;
      } else {
        document.getElementById('framework-section').style.display = 'none';
      }
    }

    // Handle footer link clicks
    document.getElementById('rampify-link').addEventListener('click', (e) => {
      e.preventDefault();
      vscode.postMessage({ type: 'open-url', url: 'https://rampify.dev' });
    });

    document.getElementById('github-link').addEventListener('click', (e) => {
      e.preventDefault();
      vscode.postMessage({ type: 'open-url', url: 'https://github.com/rampify-dev/mdx-seo-validator' });
    });

    // Tell extension we're ready
    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
  }
}
