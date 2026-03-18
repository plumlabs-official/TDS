/**
 * Docs Module — Colors Page Generator
 *
 * Generates a Color showcase page from Mode Collection variables.
 * Source: tds-docs/code.js lines 365-601
 */

import {
  makeALFrame,
  makeRootFrame,
  makeLabel,
  preloadInterFonts,
  getOrCreateDocPage,
} from '../../shared/figma-helpers';
import { resolveColorValue, rgbToHex, findLightModeId, bindPaint } from '../../shared/color-utils';
import { ensureVarsLoaded, getModeCollection, getAllModeVariables, getTdsVars } from '../../shared/variables';
import { createColorSwatch } from './page-utils';

// ─── Constants ─────────────────────────────────────────

interface ColorGroup {
  key: string;
  label: string;
}

const COLOR_GROUPS: readonly ColorGroup[] = [
  { key: 'background',  label: 'Background' },
  { key: 'foreground',  label: 'Foreground' },
  { key: 'primary',     label: 'Primary' },
  { key: 'secondary',   label: 'Secondary' },
  { key: 'destructive', label: 'Destructive' },
  { key: 'muted',       label: 'Muted' },
  { key: 'accent',      label: 'Accent' },
  { key: 'card',        label: 'Card' },
  { key: 'popover',     label: 'Popover' },
  { key: 'border',      label: 'Border' },
  { key: 'input',       label: 'Input' },
  { key: 'ring',        label: 'Ring' },
  { key: 'sidebar',     label: 'Sidebar' },
  { key: 'chart',       label: 'Chart' },
] as const;

// ─── Helpers ───────────────────────────────────────────

interface GroupedVars {
  groups: Record<string, Variable[]>;
  ungrouped: Variable[];
}

function groupColorVars(vars: Variable[]): GroupedVars {
  const groups: Record<string, Variable[]> = {};
  const ungrouped: Variable[] = [];

  for (const v of vars) {
    let matched = false;
    for (const group of COLOR_GROUPS) {
      const key = group.key;
      if (v.name === key || v.name.indexOf(key + '-') === 0 || v.name.indexOf(key + '/') !== -1) {
        if (!groups[key]) groups[key] = [];
        groups[key].push(v);
        matched = true;
        break;
      }
    }
    if (!matched) ungrouped.push(v);
  }
  return { groups, ungrouped };
}

// ─── Main Generator ────────────────────────────────────

export async function handleGenColors(): Promise<void> {
  figma.notify('Generating color page...');

  await ensureVarsLoaded();

  const modeCollection = getModeCollection();
  if (!modeCollection) {
    figma.notify('Mode collection not found', { error: true });
    return;
  }

  const defaultModeId = findLightModeId(modeCollection);
  console.log(
    'Mode collection modes:',
    modeCollection.modes.map(m => m.name + '(' + m.modeId + ')').join(', '),
  );

  // Get all COLOR variables from Mode collection, excluding custom/ prefix
  const allModeVars = await getAllModeVariables();
  const modeVars = allModeVars.filter(
    v => v.resolvedType === 'COLOR' && v.name.indexOf('custom/') !== 0,
  );

  if (modeVars.length === 0) {
    figma.notify('No color variables found in Mode collection', { error: true });
    return;
  }

  const tdsVars = getTdsVars();
  const ringVar = tdsVars['ring'] || null;

  // Resolve all color values
  const resolvedMap: Record<string, RGBA> = {};
  for (const v of modeVars) {
    const resolved = await resolveColorValue(v, defaultModeId);
    if (resolved) {
      resolvedMap[v.id] = resolved;
    }
  }

  // Debug: foreground value
  for (const v of modeVars) {
    if (v.name === 'foreground') {
      const fgRgb = resolvedMap[v.id];
      if (fgRgb) {
        console.log('foreground resolved to: ' + rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b));
      }
      break;
    }
  }

  const grouped = groupColorVars(modeVars);

  const page = getOrCreateDocPage('Colors');
  figma.currentPage = page;

  await preloadInterFonts();

  const root = makeRootFrame('Color Showcase');

  const title = makeLabel('Colors', 36, 'foreground', 'Semi Bold');
  root.appendChild(title);

  const subtitle = makeLabel('TDS Mode Collection — Semantic Color Tokens', 16, 'muted-foreground');
  root.appendChild(subtitle);

  let totalCount = 0;

  for (const colorGroup of COLOR_GROUPS) {
    const groupKey = colorGroup.key;
    const groupLabel = colorGroup.label;
    const groupVars = grouped.groups[groupKey];
    if (!groupVars || groupVars.length === 0) continue;

    const section = makeALFrame({
      name: 'Group: ' + groupLabel,
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
    });

    const groupHeader = makeLabel(groupLabel.toUpperCase(), 12, 'muted-foreground', 'Medium');
    section.appendChild(groupHeader);

    const swatchRow = makeALFrame({
      name: 'Swatches: ' + groupLabel,
      layoutMode: 'HORIZONTAL',
      itemSpacing: 16,
    });
    swatchRow.layoutWrap = 'WRAP';

    for (const colorVar of groupVars) {
      const rgb = resolvedMap[colorVar.id];
      if (!rgb) continue;

      const swatch = await createColorSwatch(colorVar, rgb, ringVar);
      swatchRow.appendChild(swatch);
      totalCount++;
    }

    section.appendChild(swatchRow);
    swatchRow.layoutSizingHorizontal = 'FILL';
    root.appendChild(section);
    section.layoutSizingHorizontal = 'FILL';
  }

  // Ungrouped ("Other") section
  if (grouped.ungrouped.length > 0) {
    const otherSection = makeALFrame({
      name: 'Group: Other',
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
    });

    const otherHeader = makeLabel('OTHER', 12, 'muted-foreground', 'Medium');
    otherSection.appendChild(otherHeader);

    const otherRow = makeALFrame({
      name: 'Swatches: Other',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 16,
    });
    otherRow.layoutWrap = 'WRAP';

    for (const uVar of grouped.ungrouped) {
      const uRgb = resolvedMap[uVar.id];
      if (!uRgb) continue;

      const uSwatch = await createColorSwatch(uVar, uRgb, ringVar);
      otherRow.appendChild(uSwatch);
      totalCount++;
    }

    otherSection.appendChild(otherRow);
    otherRow.layoutSizingHorizontal = 'FILL';
    root.appendChild(otherSection);
    otherSection.layoutSizingHorizontal = 'FILL';
  }

  root.x = 100;
  root.y = 100;
  figma.viewport.scrollAndZoomIntoView([root]);

  figma.notify('Color page created: ' + totalCount + ' swatches');
}
