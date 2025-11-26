import * as vscode from 'vscode';
import { SEOWebviewProvider } from './providers/WebviewProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('MDX SEO Validator is now active!');

  // Register the webview provider
  const provider = new SEOWebviewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SEOWebviewProvider.viewType,
      provider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('seo.openPreview', () => {
      vscode.commands.executeCommand('workbench.view.extension.seo-validator');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('seo.validateFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        provider.validateDocument(editor.document);
      }
    })
  );

  // Auto-validate when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        provider.validateDocument(editor.document);
      }
    })
  );

  // Auto-validate when document changes (debounced)
  let timeout: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) {
        if (editor.document.languageId === 'mdx' || editor.document.languageId === 'markdown') {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            provider.validateDocument(editor.document);
          }, 300);
        }
      }
    })
  );

  // Validate current document on activation
  const editor = vscode.window.activeTextEditor;
  if (editor && (editor.document.languageId === 'mdx' || editor.document.languageId === 'markdown')) {
    provider.validateDocument(editor.document);
  }
}

export function deactivate() {}
