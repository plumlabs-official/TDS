/**
 * TDS Plugin — Shared Utilities Re-export
 */

export { loadTdsVars, ensureVarsLoaded, getTdsVars, getModeCollection, getAllModeVariables } from './variables';
export { rgbToHex, findLightModeId, getLightModeIdForCollection, resolveColorValue, bindPaint, LABEL_COLOR, TITLE_COLOR } from './color-utils';
export { isTDSInstance, walkTree, getTargetNodes } from './tree-utils';
export { makeALFrame, makeRootFrame, makeLabel, preloadInterFonts, getOrCreateDocPage } from './figma-helpers';
export type { ALFrameOptions } from './figma-helpers';
export {
  findNearestColor, findTdsVariable, serializeEffects, findTdsEffectStyle,
  findNearestTdsEffect, findNearestTextStyle, STYLE_TO_WEIGHT, WEIGHT_NAME_MAP,
} from './matching';
export type { ColorMatchResult } from './matching';
