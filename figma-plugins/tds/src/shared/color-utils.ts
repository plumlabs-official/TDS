/**
 * Color Utilities — Variable resolution, hex conversion, paint binding
 *
 * Source: tds-docs/code.js (superior version with cross-collection alias fix)
 * Bug fix: Migrator's resolveColorValue used modes[0] — now uses findLightModeId
 */

import { getTdsVars } from './variables';

// Fallback colors (used when variable lookup fails)
export const LABEL_COLOR: RGB = { r: 0.388, g: 0.388, b: 0.4 };       // #636366
export const TITLE_COLOR: RGB = { r: 0.035, g: 0.035, b: 0.043 };      // #09090B

/** Cache for Light modeId per collection (cross-collection alias resolution) */
const collectionModeCache: Record<string, string | null> = {};

function toHex(n: number): string {
  return ('0' + n.toString(16).toUpperCase()).slice(-2);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + toHex(Math.round(r * 255)) + toHex(Math.round(g * 255)) + toHex(Math.round(b * 255));
}

/**
 * Find Light mode in a collection. Searches for "light"/"default", falls back to modes[0].
 */
export function findLightModeId(modeCollection: VariableCollection): string {
  for (let i = 0; i < modeCollection.modes.length; i++) {
    const modeName = modeCollection.modes[i].name.toLowerCase();
    if (modeName === 'light' || modeName === 'default' || modeName.indexOf('light') !== -1) {
      return modeCollection.modes[i].modeId;
    }
  }
  return modeCollection.modes[0].modeId;
}

/**
 * Get Light modeId for any collection (cached). Used in cross-collection alias resolution.
 */
export async function getLightModeIdForCollection(collectionId: string): Promise<string | null> {
  if (collectionModeCache[collectionId] !== undefined) {
    return collectionModeCache[collectionId];
  }
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const coll of collections) {
    if (coll.id === collectionId) {
      for (const mode of coll.modes) {
        const name = mode.name.toLowerCase();
        if (name === 'light' || name === 'default' || name.indexOf('light') !== -1) {
          collectionModeCache[collectionId] = mode.modeId;
          return mode.modeId;
        }
      }
      collectionModeCache[collectionId] = coll.modes[0].modeId;
      return coll.modes[0].modeId;
    }
  }
  collectionModeCache[collectionId] = null;
  return null;
}

/**
 * Resolve a color variable's actual value, following alias chains (max 10 hops).
 * Uses per-collection Light mode for cross-collection aliases.
 */
export async function resolveColorValue(
  varObj: Variable,
  defaultModeId: string,
): Promise<RGBA | null> {
  let val: VariableValue | undefined = varObj.valuesByMode[defaultModeId];
  if (val === undefined) {
    const modes = Object.keys(varObj.valuesByMode);
    if (modes.length > 0) val = varObj.valuesByMode[modes[0]];
  }

  let depth = 0;
  while (val && typeof val === 'object' && 'type' in val && (val as any).type === 'VARIABLE_ALIAS' && depth < 10) {
    const aliasVar = await figma.variables.getVariableByIdAsync((val as VariableAlias).id);
    if (!aliasVar) return null;

    // FIX: use alias variable's own collection mode (not the default)
    const aliasModeId = await getLightModeIdForCollection(aliasVar.variableCollectionId);
    let aliasVal: VariableValue | undefined = aliasModeId
      ? aliasVar.valuesByMode[aliasModeId]
      : undefined;
    if (aliasVal === undefined) {
      const aliasModes = Object.keys(aliasVar.valuesByMode);
      if (aliasModes.length > 0) aliasVal = aliasVar.valuesByMode[aliasModes[0]];
    }
    val = aliasVal;
    depth++;
  }

  if (val && typeof val === 'object' && !('type' in val && (val as any).type === 'VARIABLE_ALIAS') && 'r' in val) {
    return val as RGBA;
  }
  return null;
}

/**
 * Create a SolidPaint with TDS variable binding. Falls back to provided color.
 */
export function bindPaint(color: RGB, varName: string): SolidPaint {
  let paint: SolidPaint = { type: 'SOLID', color };
  const v = getTdsVars()[varName];
  if (v) {
    try {
      paint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
    } catch (e) {
      console.log('Bind failed: ' + varName + ' - ' + (e as Error).message);
    }
  }
  return paint;
}
