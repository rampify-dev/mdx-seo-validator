import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface FaviconInfo {
  exists: boolean;
  path?: string;
  type?: 'ico' | 'svg' | 'png' | 'next-metadata';
  uri?: vscode.Uri;
}

/**
 * Detect favicon in common locations for different frameworks
 */
export async function detectFavicon(workspaceFolder: vscode.WorkspaceFolder): Promise<FaviconInfo> {
  const basePath = workspaceFolder.uri.fsPath;

  // Common favicon locations (in order of priority)
  const locations = [
    // Next.js App Router (app/favicon.ico, app/icon.png, app/icon.svg)
    { path: path.join(basePath, 'app', 'favicon.ico'), type: 'next-metadata' as const },
    { path: path.join(basePath, 'app', 'icon.svg'), type: 'next-metadata' as const },
    { path: path.join(basePath, 'app', 'icon.png'), type: 'next-metadata' as const },

    // Standard public folder (Next.js Pages Router, Astro, etc.)
    { path: path.join(basePath, 'public', 'favicon.ico'), type: 'ico' as const },
    { path: path.join(basePath, 'public', 'favicon.svg'), type: 'svg' as const },
    { path: path.join(basePath, 'public', 'favicon.png'), type: 'png' as const },

    // Root level (classic location)
    { path: path.join(basePath, 'favicon.ico'), type: 'ico' as const },
    { path: path.join(basePath, 'favicon.svg'), type: 'svg' as const },
    { path: path.join(basePath, 'favicon.png'), type: 'png' as const },

    // Astro public folder
    { path: path.join(basePath, 'public', 'assets', 'favicon.svg'), type: 'svg' as const },
  ];

  for (const location of locations) {
    if (fs.existsSync(location.path)) {
      return {
        exists: true,
        path: location.path,
        type: location.type,
        uri: vscode.Uri.file(location.path)
      };
    }
  }

  return { exists: false };
}

/**
 * Get data URI for favicon to display in webview
 */
export function getFaviconDataUri(faviconPath: string): string | null {
  try {
    const ext = path.extname(faviconPath).toLowerCase();
    const buffer = fs.readFileSync(faviconPath);
    const base64 = buffer.toString('base64');

    switch (ext) {
      case '.svg':
        return `data:image/svg+xml;base64,${base64}`;
      case '.png':
        return `data:image/png;base64,${base64}`;
      case '.ico':
        return `data:image/x-icon;base64,${base64}`;
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}
