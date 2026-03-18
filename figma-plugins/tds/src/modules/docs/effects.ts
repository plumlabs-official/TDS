/**
 * Docs Module — Effects Page Generator
 *
 * Generates an Effects showcase page from local effect styles.
 * Source: tds-docs/code.js lines 603-728
 */

import {
  makeALFrame,
  makeRootFrame,
  makeLabel,
  preloadInterFonts,
  getOrCreateDocPage,
} from '../../shared/figma-helpers';
import { bindPaint } from '../../shared/color-utils';

// ─── Constants ─────────────────────────────────────────

/** Tailwind shadow size ordering (baseName after stripping "shadows/" prefix) */
const EFFECT_ORDER = ['2xs', 'xs', 'sm', 'shadow', 'md', 'lg', 'xl', '2xl'] as const;

// ─── Helpers ───────────────────────────────────────────

function getEffectOrder(baseName: string): number {
  for (let i = 0; i < EFFECT_ORDER.length; i++) {
    if (baseName === EFFECT_ORDER[i]) return i;
  }
  // focus/ etc. go after shadows
  if (baseName.indexOf('focus') === 0) return 100 + baseName.length;
  return 99;
}

interface ShadowLikeEffect {
  type: string;
  color?: RGBA;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

function effectToCSS(effects: readonly Effect[]): string {
  const parts: string[] = [];
  for (const e of effects) {
    if (e.type !== 'DROP_SHADOW' && e.type !== 'INNER_SHADOW') continue;
    const se = e as unknown as ShadowLikeEffect;
    const prefix = e.type === 'INNER_SHADOW' ? 'inset ' : '';
    const c = se.color || { r: 0, g: 0, b: 0, a: 1 };
    const x = se.offset ? se.offset.x : 0;
    const y = se.offset ? se.offset.y : 0;
    const blur = se.radius || 0;
    const spread = se.spread || 0;
    const alpha = c.a !== undefined ? c.a : 1;
    parts.push(
      prefix + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' +
      'rgba(' + Math.round(c.r * 255) + ', ' + Math.round(c.g * 255) + ', ' + Math.round(c.b * 255) + ', ' + alpha.toFixed(2) + ')',
    );
  }
  return parts.length > 0 ? 'box-shadow: ' + parts.join(',\n             ') : 'none';
}

// ─── Main Generator ────────────────────────────────────

interface ShadowEntry {
  style: EffectStyle;
  baseName: string;
}

export async function handleGenEffects(): Promise<void> {
  figma.notify('Generating effects page...');

  const effectStyles = await figma.getLocalEffectStylesAsync();
  if (effectStyles.length === 0) {
    figma.notify('No effect styles found', { error: true });
    return;
  }

  const shadowStyles: ShadowEntry[] = [];
  for (const s of effectStyles) {
    const baseName = s.name.indexOf('shadows/') === 0 ? s.name.substring(8) : s.name;
    shadowStyles.push({ style: s, baseName });
  }

  if (shadowStyles.length === 0) {
    figma.notify('No shadow effect styles found', { error: true });
    return;
  }

  shadowStyles.sort((a, b) => getEffectOrder(a.baseName) - getEffectOrder(b.baseName));

  // Debug: sort order
  console.log('Effect sort order: ' + shadowStyles.map(s => s.baseName).join(', '));

  const page = getOrCreateDocPage('Effects');
  figma.currentPage = page;

  await preloadInterFonts();

  const root = makeRootFrame('Effects Showcase');
  root.itemSpacing = 40;

  const title = makeLabel('Effects', 36, 'foreground', 'Semi Bold');
  root.appendChild(title);

  const subtitle = makeLabel('TDS Effect Styles — Box Shadows', 16, 'muted-foreground');
  root.appendChild(subtitle);

  let totalCount = 0;

  for (const item of shadowStyles) {
    const { style, baseName } = item;

    const row = makeALFrame({
      name: baseName,
      layoutMode: 'HORIZONTAL',
      itemSpacing: 32,
    });
    row.counterAxisAlignItems = 'CENTER';

    const rect = figma.createRectangle();
    rect.name = 'Preview';
    rect.resize(96, 96);
    rect.cornerRadius = 8;
    rect.fills = [bindPaint({ r: 1, g: 1, b: 1 }, 'background')];

    try {
      await rect.setEffectStyleIdAsync(style.id);
    } catch (e) {
      console.log('Failed to apply effect style: ' + style.name + ' - ' + (e as Error).message);
    }

    row.appendChild(rect);

    const nameLabel = makeLabel(baseName, 14, 'foreground', 'Medium');
    nameLabel.resize(160, nameLabel.height);
    nameLabel.textAutoResize = 'HEIGHT';
    row.appendChild(nameLabel);
    nameLabel.layoutSizingHorizontal = 'FIXED';

    const cssText = effectToCSS(style.effects);
    const cssLabel = makeLabel(cssText, 12, 'muted-foreground');
    row.appendChild(cssLabel);
    cssLabel.layoutSizingHorizontal = 'FILL';

    root.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    totalCount++;
  }

  root.x = 100;
  root.y = 100;
  figma.viewport.scrollAndZoomIntoView([root]);

  figma.notify('Effects page created: ' + totalCount + ' styles');
}
