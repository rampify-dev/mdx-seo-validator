import * as vscode from 'vscode';
import { parseDocument } from '../parsers/mdxParser';
import { validateSEO } from '../validators/seoValidator';
import { detectFavicon, getFaviconDataUri } from '../utils/faviconDetector';

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
      if (data.type === 'ready') {
        // Webview is ready, send initial data
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          this.validateDocument(editor.document);
        }
      }
    });
  }

  public async validateDocument(document: vscode.TextDocument) {
    if (!this._view) {
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

    // Validate SEO
    const validation = validateSEO(parsed, faviconInfo);

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
  </style>
</head>
<body>
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

  <div class="section">
    <h2>Validation Rules</h2>
    <div id="categories"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'validation-update') {
        updateUI(message.data);
      }
    });

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
    }

    // Tell extension we're ready
    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
  }
}
