/**
 * Docs Module — Page Utilities
 *
 * Color swatch builder for the Colors page.
 * Note: getOrCreateDocPage lives in ../../shared/figma-helpers.ts
 */

import { makeALFrame, makeLabel } from '../../shared/figma-helpers';
import { bindPaint, rgbToHex } from '../../shared/color-utils';

/**
 * Create a color swatch card: rectangle + name label + hex label.
 * The rectangle fill is bound to the given Figma Variable.
 */
export async function createColorSwatch(
  colorVar: Variable,
  resolvedRGB: RGBA,
  ringVar: Variable | null,
): Promise<FrameNode> {
  const wrapper = makeALFrame({
    name: colorVar.name,
    layoutMode: 'VERTICAL',
    itemSpacing: 6,
  });

  const rect = figma.createRectangle();
  rect.name = 'Swatch';
  rect.resize(88, 56);
  rect.cornerRadius = 8;

  let paint: SolidPaint = {
    type: 'SOLID',
    color: { r: resolvedRGB.r, g: resolvedRGB.g, b: resolvedRGB.b },
  };
  if (resolvedRGB.a !== undefined && resolvedRGB.a < 1) {
    paint = { ...paint, opacity: resolvedRGB.a };
  }
  try {
    paint = figma.variables.setBoundVariableForPaint(paint, 'color', colorVar);
  } catch (e) {
    console.log('Bind failed: ' + colorVar.name + ' - ' + (e as Error).message);
  }
  rect.fills = [paint];

  if (ringVar) {
    const strokePaint = bindPaint({ r: 0.89, g: 0.89, b: 0.91 }, 'ring');
    rect.strokes = [strokePaint];
    rect.strokeWeight = 1;
  }

  wrapper.appendChild(rect);

  const nameLabel = makeLabel(colorVar.name, 11, 'foreground', 'Medium');
  wrapper.appendChild(nameLabel);
  nameLabel.layoutSizingHorizontal = 'FIXED';
  nameLabel.resize(88, nameLabel.height);
  nameLabel.textAutoResize = 'HEIGHT';

  let hex = rgbToHex(resolvedRGB.r, resolvedRGB.g, resolvedRGB.b);
  if (resolvedRGB.a !== undefined && resolvedRGB.a < 1) {
    hex += ' ' + Math.round(resolvedRGB.a * 100) + '%';
  }
  const hexLabel = makeLabel(hex, 10, 'muted-foreground');
  wrapper.appendChild(hexLabel);

  return wrapper;
}
