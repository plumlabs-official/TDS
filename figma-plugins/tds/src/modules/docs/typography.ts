/**
 * Docs Module — Typography Page Generator
 *
 * Generates a Typography showcase page from local text styles.
 * Source: tds-docs/code.js lines 197-363
 */

import {
  makeALFrame,
  makeRootFrame,
  makeLabel,
  preloadInterFonts,
  getOrCreateDocPage,
} from '../../shared/figma-helpers';
import { bindPaint, TITLE_COLOR } from '../../shared/color-utils';

// ─── Constants ─────────────────────────────────────────

const BUCKETS = ['4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const;

const WEIGHT_ORDER = [
  'font-thin', 'font-extralight', 'font-light',
  'font-normal', 'font-medium', 'font-semibold',
  'font-bold', 'font-extrabold', 'font-black',
] as const;

const EXAMPLE_TEXTS: Record<string, string> = {
  'xs':   'The quick brown fox jumps over the lazy dog',
  'sm':   'The quick brown fox jumps over the lazy dog',
  'base': 'The quick brown fox jumps over the lazy dog',
  'lg':   'Designing systems that scale beautifully',
  'xl':   'Building with design tokens',
  '2xl':  'TDS Component Library',
  '3xl':  'Design Systems',
  '4xl':  'Typography',
};

const PRETENDARD_STYLES = [
  'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold',
  'Black', 'Light', 'ExtraLight', 'Thin',
] as const;

// ─── Helpers ───────────────────────────────────────────

function getBucket(styleName: string): string | null {
  for (const bucket of BUCKETS) {
    if (styleName.indexOf('text-' + bucket) === 0) return bucket;
  }
  return null;
}

function getWeightOrder(styleName: string): number {
  for (let i = 0; i < WEIGHT_ORDER.length; i++) {
    if (styleName.indexOf(WEIGHT_ORDER[i]) !== -1) return i;
  }
  return 99;
}

function figmaFontStyle(styleName: string): string {
  if (styleName.indexOf('font-black') !== -1) return 'Black';
  if (styleName.indexOf('font-extrabold') !== -1) return 'ExtraBold';
  if (styleName.indexOf('font-bold') !== -1) return 'Bold';
  if (styleName.indexOf('font-semibold') !== -1) return 'SemiBold';
  if (styleName.indexOf('font-medium') !== -1) return 'Medium';
  if (styleName.indexOf('font-light') !== -1) return 'Light';
  if (styleName.indexOf('font-extralight') !== -1) return 'ExtraLight';
  if (styleName.indexOf('font-thin') !== -1) return 'Thin';
  return 'Regular';
}

// ─── Main Generator ────────────────────────────────────

export async function handleGenTypography(): Promise<void> {
  figma.notify('Generating typography page...');

  const textStyles = await figma.getLocalTextStylesAsync();
  if (textStyles.length === 0) {
    figma.notify('No text styles found', { error: true });
    return;
  }

  // Group styles by bucket
  const bucketMap: Record<string, TextStyle[]> = {};
  for (const s of textStyles) {
    const bucket = getBucket(s.name);
    if (!bucket) continue;
    if (!bucketMap[bucket]) bucketMap[bucket] = [];
    bucketMap[bucket].push(s);
  }

  // Sort each bucket by weight
  for (const key of Object.keys(bucketMap)) {
    bucketMap[key].sort((a, b) => getWeightOrder(a.name) - getWeightOrder(b.name));
  }

  const page = getOrCreateDocPage('Typography');
  figma.currentPage = page;

  await preloadInterFonts();

  // Load Pretendard font styles
  for (const pStyle of PRETENDARD_STYLES) {
    try { await figma.loadFontAsync({ family: 'Pretendard', style: pStyle }); } catch (_e) { /* skip */ }
  }

  const root = makeRootFrame('Typography Showcase');

  const title = makeLabel('Typography', 36, 'foreground', 'Semi Bold');
  root.appendChild(title);

  const subtitle = makeLabel('TDS Text Styles — Pretendard', 16, 'muted-foreground');
  root.appendChild(subtitle);

  let totalCount = 0;

  for (let bi = 0; bi < BUCKETS.length; bi++) {
    const bk = BUCKETS[bi];
    const styles = bucketMap[bk];
    if (!styles || styles.length === 0) continue;

    const section = makeALFrame({
      name: 'Section: text-' + bk,
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
    });

    const sizeInfo = styles[0].fontSize ? ' — ' + styles[0].fontSize + 'px' : '';
    const header = makeLabel('text-' + bk + sizeInfo, 14, 'muted-foreground', 'Medium');
    section.appendChild(header);

    for (const style of styles) {
      const row = makeALFrame({
        name: style.name,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 32,
      });
      row.counterAxisAlignItems = 'CENTER';

      const nameLabel = makeLabel(style.name, 12, 'muted-foreground');
      nameLabel.resize(280, nameLabel.height);
      nameLabel.textAutoResize = 'HEIGHT';
      row.appendChild(nameLabel);
      nameLabel.layoutSizingHorizontal = 'FIXED';

      const fStyle = figmaFontStyle(style.name);
      try {
        await figma.loadFontAsync({ family: 'Pretendard', style: fStyle });
      } catch (_e) {
        try { await figma.loadFontAsync({ family: 'Pretendard', style: 'Regular' }); } catch (_e2) { /* skip */ }
      }

      const example = figma.createText();
      example.fontName = { family: 'Pretendard', style: fStyle };
      example.characters = EXAMPLE_TEXTS[bk] || 'The quick brown fox';
      example.fills = [bindPaint(TITLE_COLOR, 'foreground')];

      try {
        await example.setTextStyleIdAsync(style.id);
      } catch (e) {
        console.log('Failed to apply style: ' + style.name + ' - ' + (e as Error).message);
      }

      row.appendChild(example);
      example.layoutSizingHorizontal = 'FILL';

      section.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      totalCount++;
    }

    root.appendChild(section);
    section.layoutSizingHorizontal = 'FILL';

    // Add divider between sections (not after last)
    if (bi < BUCKETS.length - 1 && bucketMap[BUCKETS[bi + 1]]) {
      const divider = figma.createLine();
      divider.name = 'Divider';
      divider.resize(1072, 0);
      divider.strokes = [bindPaint({ r: 0.89, g: 0.89, b: 0.91 }, 'border')];
      divider.strokeWeight = 1;
      root.appendChild(divider);
      divider.layoutSizingHorizontal = 'FILL';
    }
  }

  root.x = 100;
  root.y = 100;
  figma.viewport.scrollAndZoomIntoView([root]);

  figma.notify('Typography page created: ' + totalCount + ' styles');
}
