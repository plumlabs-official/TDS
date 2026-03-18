/**
 * Figma Frame/Label Builder Utilities
 *
 * Source: tds-docs/code.js (lines 50-119)
 */

import { bindPaint, LABEL_COLOR, TITLE_COLOR } from './color-utils';

export interface ALFrameOptions {
  name?: string;
  layoutMode?: 'VERTICAL' | 'HORIZONTAL';
  itemSpacing?: number;
  padding?: number;
  fills?: Paint[];
  cornerRadius?: number;
  width?: number;
  primarySizing?: 'AUTO' | 'FIXED';
  counterSizing?: 'AUTO' | 'FIXED';
}

export function makeALFrame(opts: ALFrameOptions): FrameNode {
  const f = figma.createFrame();
  f.name = opts.name || 'Frame';
  f.layoutMode = opts.layoutMode || 'VERTICAL';
  f.itemSpacing = opts.itemSpacing !== undefined ? opts.itemSpacing : 0;
  const pad = opts.padding !== undefined ? opts.padding : 0;
  f.paddingTop = pad; f.paddingBottom = pad;
  f.paddingLeft = pad; f.paddingRight = pad;
  f.primaryAxisSizingMode = opts.primarySizing || 'AUTO';
  f.counterAxisSizingMode = opts.counterSizing || 'AUTO';
  f.fills = opts.fills !== undefined ? opts.fills : [];
  if (opts.cornerRadius) f.cornerRadius = opts.cornerRadius;
  if (opts.width) f.resize(opts.width, f.height);
  return f;
}

/** Root frame with white background bound to TDS 'background' variable */
export function makeRootFrame(name: string, width?: number): FrameNode {
  return makeALFrame({
    name,
    layoutMode: 'VERTICAL',
    itemSpacing: 48,
    padding: 64,
    fills: [bindPaint({ r: 1, g: 1, b: 1 }, 'background')],
    counterSizing: 'FIXED',
    width: width || 1200,
  });
}

/** Create text node with TDS color variable binding. Caller must pre-load Inter fonts. */
export function makeLabel(
  text: string,
  fontSize: number,
  varName: string,
  fontStyle?: string,
): TextNode {
  const style = fontStyle || 'Regular';
  const t = figma.createText();
  t.fontName = { family: 'Inter', style };
  t.fontSize = fontSize || 12;
  t.characters = text;
  const fallback = varName === 'foreground' ? TITLE_COLOR : LABEL_COLOR;
  t.fills = [bindPaint(fallback, varName)];
  return t;
}

/** Preload Inter font styles needed by docs generation */
export async function preloadInterFonts(): Promise<void> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
}

/**
 * Get or create a documentation page. Clears existing children if page exists.
 * Matches page names with prefix handling (e.g., "↳ Typography").
 */
export function getOrCreateDocPage(name: string): PageNode {
  for (let i = 0; i < figma.root.children.length; i++) {
    const pageName = figma.root.children[i].name;
    const trimmed = pageName.trim();
    if (trimmed === name || trimmed.endsWith(' ' + name) || trimmed.endsWith('↳ ' + name)) {
      const existingPage = figma.root.children[i];
      const children = existingPage.children.slice();
      for (const child of children) {
        child.remove();
      }
      console.log('Reusing existing page: ' + pageName);
      return existingPage;
    }
  }
  const page = figma.createPage();
  page.name = name;
  console.log('Created new page: ' + name);
  return page;
}
