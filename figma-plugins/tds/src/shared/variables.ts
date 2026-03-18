/**
 * TDS Mode Collection Variable Loading & Cache
 *
 * Source: tds-docs/code.js loadTdsVars() (lines 14-33)
 * D2: ensureVarsLoaded() pattern for race condition safety
 */

/** Cached TDS COLOR variables from Mode Collection, keyed by variable name */
let tdsVarCache: Record<string, Variable> = {};
let modeCollectionCache: VariableCollection | null = null;
let varsPromise: Promise<VariableCollection | null> | null = null;

/** Internal loader */
async function doLoadTdsVars(): Promise<VariableCollection | null> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  modeCollectionCache = collections.find(c => c.name === 'Mode') ?? null;
  if (!modeCollectionCache) return null;

  const allVars = await figma.variables.getLocalVariablesAsync();
  for (const v of allVars) {
    if (v.variableCollectionId === modeCollectionCache.id && v.resolvedType === 'COLOR') {
      tdsVarCache[v.name] = v;
    }
  }
  console.log('TDS vars loaded: ' + Object.keys(tdsVarCache).length);
  return modeCollectionCache;
}

/** Start pre-loading (called once on plugin startup). Safe to call multiple times. */
export function loadTdsVars(): Promise<VariableCollection | null> {
  if (!varsPromise) varsPromise = doLoadTdsVars();
  return varsPromise;
}

/** Ensure vars are loaded before proceeding. Resolves instantly if already done. */
export async function ensureVarsLoaded(): Promise<void> {
  await loadTdsVars();
}

/** Get the cached TDS variable map (read-only after loading) */
export function getTdsVars(): Record<string, Variable> {
  return tdsVarCache;
}

/** Get the cached Mode Collection */
export function getModeCollection(): VariableCollection | null {
  return modeCollectionCache;
}

/** Get all Mode Collection variables (COLOR + non-COLOR). Requires separate load. */
export async function getAllModeVariables(): Promise<Variable[]> {
  await ensureVarsLoaded();
  if (!modeCollectionCache) return [];
  const allVars = await figma.variables.getLocalVariablesAsync();
  return allVars.filter(v => v.variableCollectionId === modeCollectionCache!.id);
}
