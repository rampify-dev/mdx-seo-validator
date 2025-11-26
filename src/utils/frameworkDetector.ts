import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export type Framework = 'nextjs-app' | 'nextjs-pages' | 'astro' | 'remix' | 'unknown';

export interface FrameworkInfo {
  type: Framework;
  configPath?: string;
  hasAppDir?: boolean;
  hasPagesDir?: boolean;
}

/**
 * Detect the framework being used in the workspace
 */
export async function detectFramework(workspaceFolder: vscode.WorkspaceFolder): Promise<FrameworkInfo> {
  const rootPath = workspaceFolder.uri.fsPath;

  // Check for Next.js
  const nextConfigs = [
    'next.config.js',
    'next.config.ts',
    'next.config.mjs'
  ];

  for (const config of nextConfigs) {
    const configPath = path.join(rootPath, config);
    if (fs.existsSync(configPath)) {
      // Determine if App Router or Pages Router
      const hasAppDir = fs.existsSync(path.join(rootPath, 'app'));
      const hasPagesDir = fs.existsSync(path.join(rootPath, 'pages'));

      return {
        type: hasAppDir ? 'nextjs-app' : 'nextjs-pages',
        configPath,
        hasAppDir,
        hasPagesDir
      };
    }
  }

  // Check for Astro
  const astroConfigs = [
    'astro.config.mjs',
    'astro.config.ts',
    'astro.config.js'
  ];

  for (const config of astroConfigs) {
    const configPath = path.join(rootPath, config);
    if (fs.existsSync(configPath)) {
      return {
        type: 'astro',
        configPath
      };
    }
  }

  // Check for Remix
  const remixConfigs = [
    'remix.config.js',
    'remix.config.ts'
  ];

  for (const config of remixConfigs) {
    const configPath = path.join(rootPath, config);
    if (fs.existsSync(configPath)) {
      return {
        type: 'remix',
        configPath
      };
    }
  }

  return { type: 'unknown' };
}

/**
 * Find metadata-generating files for a given MDX file
 */
export function findMetadataFiles(mdxFilePath: string, framework: Framework): string[] {
  const files: string[] = [];
  const dir = path.dirname(mdxFilePath);

  if (framework === 'nextjs-app') {
    // Look for page.tsx/page.ts in same directory
    const pageTsx = path.join(dir, 'page.tsx');
    const pageTs = path.join(dir, 'page.ts');

    if (fs.existsSync(pageTsx)) {
      files.push(pageTsx);
    } else if (fs.existsSync(pageTs)) {
      files.push(pageTs);
    }

    // Look for layout.tsx/layout.ts in same and parent directories
    let currentDir = dir;
    const rootDir = path.parse(dir).root;

    while (currentDir !== rootDir) {
      const layoutTsx = path.join(currentDir, 'layout.tsx');
      const layoutTs = path.join(currentDir, 'layout.ts');

      if (fs.existsSync(layoutTsx) && !files.includes(layoutTsx)) {
        files.push(layoutTsx);
      } else if (fs.existsSync(layoutTs) && !files.includes(layoutTs)) {
        files.push(layoutTs);
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }
  }

  if (framework === 'nextjs-pages') {
    // Look for _app.tsx, _document.tsx
    // This is more complex as pages can be anywhere
    // For now, we'll skip this or implement later
  }

  if (framework === 'astro') {
    // Look for layout files in src/layouts/
    // This varies by project structure
  }

  return files;
}
