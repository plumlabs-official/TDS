/**
 * Nearest-Match Algorithms — Color, Text Style, Effect Style
 *
 * Source: migrate-to-tds/code.js (lines 333-544)
 * Functions accept lookup maps as parameters (built by caller at runtime).
 */

// ── Color Matching ──────────────────────────────────────

const MAX_COLOR_DISTANCE = 30;

export interface ColorMatchResult {
  variable: Variable;
  distance: number;
}

/**
 * Find the nearest TDS color variable by Euclidean distance in RGBA space.
 * @param r,g,b — 0-255 integer values
 * @param a — 0-100 integer alpha percentage
 * @param colorToVariable — reverse map { "R_G_B_A": Variable }
 */
export function findNearestColor(
  r: number, g: number, b: number, a: number,
  colorToVariable: Record<string, Variable>,
  cache?: Record<string, ColorMatchResult | null>,
): ColorMatchResult | null {
  const cacheKey = r + '_' + g + '_' + b + '_' + a;
  if (cache && cache[cacheKey] !== undefined) return cache[cacheKey];

  let bestVar: Variable | null = null;
  let bestDist = Infinity;

  for (const key in colorToVariable) {
    const parts = key.split('_');
    const cr = parseInt(parts[0]), cg = parseInt(parts[1]), cb = parseInt(parts[2]);
    const ca = parseInt(parts[3]);
    const dist = Math.sqrt(
      (r - cr) * (r - cr) + (g - cg) * (g - cg) + (b - cb) * (b - cb)
      + Math.pow((a - ca) * 2.55, 2)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestVar = colorToVariable[key];
    }
  }

  let result: ColorMatchResult | null = null;
  if (bestVar && bestDist <= MAX_COLOR_DISTANCE) {
    result = { variable: bestVar, distance: Math.round(bestDist) };
  }
  if (cache) cache[cacheKey] = result;
  return result;
}

// ── Variable Name Lookup ────────────────────────────────

/**
 * Find a TDS variable by name (full path or short name fallback).
 */
export function findTdsVariable(
  originalName: string,
  variableByFullName: Record<string, Variable>,
  variableByShortName: Record<string, Variable>,
): Variable | null {
  const parts = originalName.split('/');
  const shortName = parts[parts.length - 1];
  if (variableByFullName[originalName]) return variableByFullName[originalName];
  if (variableByShortName[shortName]) return variableByShortName[shortName];
  return null;
}

// ── Effect Style Matching ───────────────────────────────

const MAX_EFFECT_DISTANCE = 50;

/**
 * Serialize an effect array into a deterministic string key for exact-match lookup.
 */
export function serializeEffects(effects: readonly Effect[]): string | null {
  if (!effects || effects.length === 0) return null;
  const parts: string[] = [];
  for (const e of effects) {
    if (!e.visible) continue;
    const part = e.type + '_'
      + Math.round('offset' in e && e.offset ? e.offset.x : 0) + '_'
      + Math.round('offset' in e && e.offset ? e.offset.y : 0) + '_'
      + Math.round('radius' in e ? (e.radius || 0) : 0) + '_'
      + Math.round('spread' in e ? (e.spread || 0) : 0);
    parts.push(part);
  }
  parts.sort();
  return parts.join('|');
}

interface EffectVector {
  x: number;
  y: number;
  radius: number;
  spread: number;
}

function extractEffectVector(effects: readonly Effect[]): EffectVector | null {
  for (const e of effects) {
    if (e.visible && e.type === 'DROP_SHADOW') {
      return {
        x: e.offset ? e.offset.x : 0,
        y: e.offset ? e.offset.y : 0,
        radius: e.radius || 0,
        spread: e.spread || 0,
      };
    }
  }
  return null;
}

/**
 * Find TDS effect style by name (full or short name).
 */
export function findTdsEffectStyle(
  originalName: string,
  effectByName: Record<string, EffectStyle>,
  effectByShortName: Record<string, EffectStyle>,
): EffectStyle | null {
  if (effectByName[originalName]) return effectByName[originalName];
  if (effectByName['shadows/' + originalName]) return effectByName['shadows/' + originalName];
  const parts = originalName.split('/');
  const shortName = parts[parts.length - 1];
  if (effectByShortName[shortName]) return effectByShortName[shortName];
  return null;
}

/**
 * Find nearest TDS effect style by Euclidean distance in shadow property space.
 */
export function findNearestTdsEffect(
  effects: readonly Effect[],
  tdsEffectStyles: EffectStyle[],
): EffectStyle | null {
  const srcVec = extractEffectVector(effects);
  if (!srcVec) return null;

  let bestStyle: EffectStyle | null = null;
  let bestDist = Infinity;

  for (const tds of tdsEffectStyles) {
    const tgtVec = extractEffectVector(tds.effects);
    if (!tgtVec) continue;
    const dist = Math.sqrt(
      Math.pow(srcVec.x - tgtVec.x, 2) +
      Math.pow(srcVec.y - tgtVec.y, 2) +
      Math.pow(srcVec.radius - tgtVec.radius, 2) +
      Math.pow(srcVec.spread - tgtVec.spread, 2)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestStyle = tds;
    }
  }

  if (bestStyle && bestDist <= MAX_EFFECT_DISTANCE) {
    console.log('Nearest effect: dist=' + Math.round(bestDist) + ' → ' + bestStyle.name);
    return bestStyle;
  }
  return null;
}

// ── Text Style Matching ─────────────────────────────────

const MAX_FONTSIZE_DISTANCE = 4;
const MAX_WEIGHT_DISTANCE = 100;

/** fontName.style → numeric weight */
export const STYLE_TO_WEIGHT: Record<string, number> = {
  'Thin': 100, 'ExtraLight': 200, 'Light': 300,
  'Regular': 400, 'Medium': 500, 'SemiBold': 600,
  'Bold': 700, 'ExtraBold': 800, 'Black': 900,
};

/** Numeric weight → variable name */
export const WEIGHT_NAME_MAP: Record<number, string> = {
  100: 'font-thin', 200: 'font-extralight', 300: 'font-light',
  400: 'font-normal', 500: 'font-medium', 600: 'font-semibold',
  700: 'font-bold', 800: 'font-extrabold', 900: 'font-black',
};

/**
 * Find nearest TDS text style by fontSize + fontWeight + lineHeight.
 * @param textStyleByProps — map of "fontSize_lineHeight_weight" → TextStyle
 */
export function findNearestTextStyle(
  fontSize: number,
  lineHeight: number | null,
  fontWeight: number,
  textStyleByProps: Record<string, TextStyle>,
): TextStyle | null {
  let bestStyle: TextStyle | null = null;
  let bestDist = Infinity;

  for (const key in textStyleByProps) {
    const kParts = key.split('_');
    const tfs = parseInt(kParts[0]), tlh = parseInt(kParts[1]), tfw = parseInt(kParts[2]);
    const fsDist = Math.abs(fontSize - tfs);
    if (fsDist > MAX_FONTSIZE_DISTANCE) continue;
    const fwDist = Math.abs(fontWeight - tfw);
    if (fwDist > MAX_WEIGHT_DISTANCE) continue;
    const lhDist = lineHeight ? Math.abs(lineHeight - tlh) : 0;
    const combinedDist = fsDist * 3 + (fwDist / 100) * 2 + lhDist;
    if (combinedDist < bestDist) {
      bestDist = combinedDist;
      bestStyle = textStyleByProps[key];
    }
  }

  if (bestStyle) {
    console.log('Nearest text style: dist=' + Math.round(bestDist) + ' → ' + bestStyle.name);
  }
  return bestStyle;
}
