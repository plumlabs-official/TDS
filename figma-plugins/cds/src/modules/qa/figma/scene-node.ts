import type { ContractNode, ContractPaint } from '../core';

export interface TokenCatalog {
  colorHexes: Set<string>;
}

export async function buildTokenCatalog(): Promise<TokenCatalog> {
  const colorHexes = new Set<string>();
  try {
    const variables = await figma.variables.getLocalVariablesAsync();
    for (const variable of variables) {
      if (variable.resolvedType !== 'COLOR') continue;
      for (const value of Object.values(variable.valuesByMode)) {
        if (isRgb(value)) colorHexes.add(rgbToHex(value));
      }
    }
  } catch (e) {
    // Variable APIs can be unavailable in older contexts; audit still returns style/binding counts.
  }
  try {
    const paintStyles = await figma.getLocalPaintStylesAsync();
    for (const style of paintStyles) {
      for (const paint of style.paints) {
        if (paint.type === 'SOLID') colorHexes.add(rgbToHex(paint.color));
      }
    }
  } catch (e) {
    // Style APIs can be unavailable in some MCP contexts.
  }
  return { colorHexes };
}

export function sceneNodeToContractNode(node: SceneNode, tokenCatalog: TokenCatalog): ContractNode {
  const anyNode = node as any;
  const contract: ContractNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    layoutMode: safeRead(() => anyNode.layoutMode),
    layoutSizingHorizontal: safeRead(() => anyNode.layoutSizingHorizontal),
    layoutSizingVertical: safeRead(() => anyNode.layoutSizingVertical),
    layoutAlign: safeRead(() => anyNode.layoutAlign),
    primaryAxisAlignItems: safeRead(() => anyNode.primaryAxisAlignItems),
    counterAxisAlignItems: safeRead(() => anyNode.counterAxisAlignItems),
    textAlignHorizontal: node.type === 'TEXT' ? safeRead(() => anyNode.textAlignHorizontal) : undefined,
    textAlignVertical: node.type === 'TEXT' ? safeRead(() => anyNode.textAlignVertical) : undefined,
    textAutoResize: node.type === 'TEXT' ? safeRead(() => anyNode.textAutoResize) : undefined,
    textTruncation: node.type === 'TEXT' ? safeRead(() => anyNode.textTruncation) : undefined,
    textStyleId: node.type === 'TEXT' ? readStyleId(safeRead(() => anyNode.textStyleId)) : null,
    gridStyleId: readStyleId(safeRead(() => anyNode.gridStyleId)),
    effectStyleId: readStyleId(safeRead(() => anyNode.effectStyleId)),
    boundVariables: safeRead(() => anyNode.boundVariables),
    fills: readPaints(safeRead(() => anyNode.fills), tokenCatalog),
    strokes: readPaints(safeRead(() => anyNode.strokes), tokenCatalog),
    effects: readEffects(safeRead(() => anyNode.effects)),
    componentPropertyDefinitions: safeRead(() => anyNode.componentPropertyDefinitions),
    componentPropertyReferences: safeRead(() => anyNode.componentPropertyReferences),
    componentProperties: safeRead(() => anyNode.componentProperties),
    isExposedInstance: safeRead(() => anyNode.isExposedInstance),
    tokenEligible: node.type === 'TEXT',
  };

  if ('children' in node && node.type !== 'INSTANCE') {
    contract.children = node.children.map((child) => sceneNodeToContractNode(child, tokenCatalog));
  }

  return contract;
}

function safeRead<T>(read: () => T): T | undefined {
  try {
    return read();
  } catch (e) {
    return undefined;
  }
}

function readStyleId(styleId: unknown): string | null {
  return typeof styleId === 'string' ? styleId : null;
}

function readPaints(value: unknown, tokenCatalog: TokenCatalog): ContractPaint[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((paint) => {
    const anyPaint = paint as any;
    return {
      type: anyPaint.type,
      boundVariables: anyPaint.boundVariables,
      tokenEligible: hasPaintBinding(anyPaint) || solidPaintMatchesToken(anyPaint, tokenCatalog),
      color: anyPaint.color,
    };
  });
}

function readEffects(value: unknown): Array<{ boundVariables?: Record<string, unknown>; tokenEligible?: boolean }> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((effect) => {
    const anyEffect = effect as any;
    return {
      boundVariables: anyEffect.boundVariables,
      tokenEligible: Boolean(anyEffect.boundVariables && Object.keys(anyEffect.boundVariables).length > 0),
    };
  });
}

function hasPaintBinding(paint: any): boolean {
  return Boolean(paint.boundVariables && Object.keys(paint.boundVariables).length > 0);
}

function solidPaintMatchesToken(paint: any, tokenCatalog: TokenCatalog): boolean {
  return paint.type === 'SOLID' && isRgb(paint.color) && tokenCatalog.colorHexes.has(rgbToHex(paint.color));
}

function isRgb(value: unknown): value is RGB {
  return Boolean(value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value);
}

function rgbToHex(color: RGB): string {
  const toHex = (n: number) => ('0' + Math.round(n * 255).toString(16).toUpperCase()).slice(-2);
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}
