/**
 * Migrate Orchestrator — Main migration handler
 *
 * Source: migrate-to-cds/code.js handleMigrate() (lines 229-871)
 * Builds all lookup maps fresh each run, then processes each target node.
 */

import { resolveColorValue } from '../../shared/color-utils';
import { findLightModeId } from '../../shared/color-utils';
import { ensureVarsLoaded, getModeCollection, getAllModeVariables } from '../../shared/variables';
import { serializeEffects } from '../../shared/matching';
import { buildTextContext } from './text-migration';
import { processNode, MigrationContext, MigrationStats, NearestStats } from './style-migration';
import { swapComponentInstances } from './component-swap';

/**
 * Main migration entry point.
 * Builds all lookup maps, processes each target node, then swaps component instances.
 * Returns a result message with stats.
 */
export async function handleMigrate(): Promise<string> {
  const targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  const scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  // CDS 리소스 로드
  await ensureVarsLoaded();
  const variables = await figma.variables.getLocalVariablesAsync();
  const effectStyles = await figma.getLocalEffectStylesAsync();

  const modeCollection = getModeCollection();
  if (!modeCollection) {
    figma.notify('Mode Collection not found.');
    return 'Mode Collection not found';
  }

  console.log('Variables: ' + variables.length + ', Effects: ' + effectStyles.length);

  // Mode Collection 변수만 필터
  const modeVariables = await getAllModeVariables();
  console.log('Mode Collection variables: ' + modeVariables.length);

  // 이름으로 검색 맵 (루트 레벨 우선)
  const variableByFullName: Record<string, Variable> = {};
  const variableByShortName: Record<string, Variable> = {};

  for (let i = 0; i < modeVariables.length; i++) {
    const v = modeVariables[i];
    const fullName = v.name;
    const parts = fullName.split('/');
    const shortName = parts[parts.length - 1];
    const isRootLevel = parts.length === 1;

    variableByFullName[fullName] = v;

    if (isRootLevel) {
      variableByShortName[shortName] = v;
    } else if (!variableByShortName[shortName]) {
      variableByShortName[shortName] = v;
    }
  }

  // alias 체인 resolve — uses shared resolveColorValue with cross-collection fix
  const defaultModeId = findLightModeId(modeCollection);

  // COLOR 변수의 resolved value → 변수 역방향 맵 (alias resolve 포함, alpha 포함)
  const colorToVariable: Record<string, Variable> = {};
  for (let cv = 0; cv < modeVariables.length; cv++) {
    const mVar = modeVariables[cv];
    if (mVar.resolvedType !== 'COLOR') continue;
    // custom/ 변수는 제외 (기존 fill 스왑 로직과 일관)
    if (mVar.name.indexOf('custom/') === 0) continue;
    const colorVal = await resolveColorValue(mVar, defaultModeId);
    if (!colorVal) continue;
    const r = Math.round(colorVal.r * 255);
    const g = Math.round(colorVal.g * 255);
    const b = Math.round(colorVal.b * 255);
    const a = Math.round((colorVal.a !== undefined ? colorVal.a : 1) * 100);
    const colorKey = r + '_' + g + '_' + b + '_' + a;
    if (!colorToVariable[colorKey]) {
      colorToVariable[colorKey] = mVar;
      console.log('Color map: ' + colorKey + ' → ' + mVar.name);
    }
  }
  console.log('Color map: ' + Object.keys(colorToVariable).length + ' entries');

  // Effect style maps
  const effectByName: Record<string, EffectStyle> = {};
  const effectByShortName: Record<string, EffectStyle> = {};
  for (let e = 0; e < effectStyles.length; e++) {
    const effectName = effectStyles[e].name;
    effectByName[effectName] = effectStyles[e];
    const effectParts = effectName.split('/');
    if (effectParts.length > 1) {
      effectByShortName[effectParts[effectParts.length - 1]] = effectStyles[e];
    }
  }

  // CDS Effect Style만 필터 (shadows/ prefix)
  const cdsEffectStyles: EffectStyle[] = [];
  for (let es = 0; es < effectStyles.length; es++) {
    if (effectStyles[es].name.indexOf('shadows/') === 0) {
      cdsEffectStyles.push(effectStyles[es]);
    }
  }
  console.log('CDS Effect Styles: ' + cdsEffectStyles.length);

  // Effect Style 속성 기반 맵 (CDS만)
  const effectStyleByProps: Record<string, EffectStyle> = {};
  for (let es = 0; es < cdsEffectStyles.length; es++) {
    const eStyle = cdsEffectStyles[es];
    const eKey = serializeEffects(eStyle.effects);
    if (eKey && !effectStyleByProps[eKey]) {
      effectStyleByProps[eKey] = eStyle;
      console.log('Effect map: ' + eKey + ' → ' + eStyle.name);
    }
  }
  console.log('Effect Style props map: ' + Object.keys(effectStyleByProps).length + ' entries');

  // Build text migration context
  const textCtx = await buildTextContext();

  // Stats
  const stats: MigrationStats = { effects: 0, fills: 0, strokes: 0, textStyles: 0, inferredStyles: 0, colorTokens: 0, fonts: 0, skipped: 0 };
  const nearestStats: NearestStats = { colorCount: 0, colorTotalDist: 0, effectCount: 0, effectTotalDist: 0, textCount: 0 };
  const nearestColorCache: Record<string, any> = {};

  // Build migration context
  const ctx: MigrationContext = {
    modeCollection,
    variableByFullName,
    variableByShortName,
    colorToVariable,
    nearestColorCache,
    effectByName,
    effectByShortName,
    effectStyleByProps,
    cdsEffectStyles,
    textCtx,
    stats,
    nearestStats,
  };

  // Process all target nodes
  for (let n = 0; n < targets.length; n++) {
    await processNode(targets[n], ctx);
  }

  // === Component Instance Swap (통합) ===
  const compSwapResult = await swapComponentInstances(targets, scope);

  const total = stats.effects + stats.fills + stats.strokes + stats.textStyles + stats.inferredStyles + stats.colorTokens + stats.fonts;
  const msg = 'Effect ' + stats.effects + ', Fill ' + stats.fills + ', Stroke ' + stats.strokes + ', Text ' + stats.textStyles + ', Inferred ' + stats.inferredStyles + ', Color ' + stats.colorTokens + ', Font ' + stats.fonts + ', Comp ' + compSwapResult.swapped + ' (' + scope + ', skip: ' + stats.skipped + ')';
  figma.notify('Done: ' + msg);
  console.log('Stats:', stats);
  console.log('Component swap:', compSwapResult);

  // 근사 매칭 요약
  if (nearestStats.colorCount > 0) {
    console.log('[SUMMARY] Nearest color matches: ' + nearestStats.colorCount + ' (avg dist: ' + Math.round(nearestStats.colorTotalDist / nearestStats.colorCount) + ')');
  }
  if (nearestStats.effectCount > 0) {
    console.log('[SUMMARY] Nearest effect matches: ' + nearestStats.effectCount + ' (avg dist: ' + Math.round(nearestStats.effectTotalDist / nearestStats.effectCount) + ')');
  }
  if (nearestStats.textCount) {
    console.log('[SUMMARY] Nearest text style matches: ' + nearestStats.textCount);
  }

  return msg;
}
