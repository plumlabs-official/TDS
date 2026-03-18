/**
 * Icon Color Binder — Bind Lucide icon strokes/fills to foreground variable
 *
 * Source: migrate-to-tds/code.js handleBindIconColors() (lines 109-225)
 */

import { ensureVarsLoaded, getModeCollection } from '../../shared/variables';

/**
 * Find and bind Lucide icon strokes/fills to the foreground variable from Mode Collection.
 */
export async function handleBindIconColors(): Promise<string> {
  const targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  const scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  // Mode Collection에서 foreground 변수 찾기
  await ensureVarsLoaded();
  const modeCollection = getModeCollection();
  if (!modeCollection) {
    figma.notify('Mode Collection not found.');
    return 'Mode Collection not found';
  }

  const variables = await figma.variables.getLocalVariablesAsync();
  let foregroundVar: Variable | null = null;
  for (let v = 0; v < variables.length; v++) {
    if (variables[v].variableCollectionId === modeCollection.id && variables[v].name === 'foreground') {
      foregroundVar = variables[v];
      break;
    }
  }
  if (!foregroundVar) {
    figma.notify('foreground variable not found in Mode Collection.');
    return 'foreground variable not found';
  }
  console.log('Found foreground variable: ' + foregroundVar.id);

  let count = 0;

  async function bindNode(node: SceneNode): Promise<void> {
    // Lucide Icons 컴포넌트 내부의 stroke 바인딩
    const isLucideIcon = node.name && node.name.indexOf('Lucide Icons /') === 0;

    if (isLucideIcon) {
      await bindChildStrokes(node);
    }

    if ('children' in node) {
      for (let i = 0; i < (node as ChildrenMixin).children.length; i++) {
        await bindNode((node as ChildrenMixin).children[i]);
      }
    }
  }

  async function bindChildStrokes(node: SceneNode): Promise<void> {
    if ('strokes' in node) {
      const strokeNode = node as MinimalStrokesMixin & SceneNode;
      const strokes = strokeNode.strokes;
      if (strokes && strokes !== (figma.mixed as any) && strokes.length > 0) {
        const newStrokes: Paint[] = [];
        let changed = false;
        for (let si = 0; si < strokes.length; si++) {
          let stroke = JSON.parse(JSON.stringify(strokes[si])) as Paint;
          // 이미 바인딩되어 있으면 스킵
          const bv = (node as any).boundVariables;
          const alreadyBound = bv && bv.strokes && bv.strokes[si];
          if (!alreadyBound && stroke.type === 'SOLID') {
            try {
              stroke = figma.variables.setBoundVariableForPaint(stroke, 'color', foregroundVar!);
              changed = true;
              count++;
              console.log('Bound stroke to foreground on ' + node.name);
            } catch (err) {
              console.log('Stroke bind error on ' + node.name + ': ' + (err as Error).message);
            }
          }
          newStrokes.push(stroke);
        }
        if (changed) strokeNode.strokes = newStrokes;
      }
    }

    // fills도 확인 (일부 아이콘은 fill로 색상 적용)
    if ('fills' in node) {
      const fillNode = node as MinimalFillsMixin & SceneNode;
      const fills = fillNode.fills;
      if (fills && fills !== figma.mixed && (fills as readonly Paint[]).length > 0) {
        const fillsArr = fills as readonly Paint[];
        const newFills: Paint[] = [];
        let fillChanged = false;
        for (let fi = 0; fi < fillsArr.length; fi++) {
          let fill = JSON.parse(JSON.stringify(fillsArr[fi])) as Paint;
          const bv = (node as any).boundVariables;
          const alreadyBound = bv && bv.fills && bv.fills[fi];
          if (!alreadyBound && fill.type === 'SOLID') {
            // 배경색(#FFFFFF)은 스킵, 전경색만 바인딩
            const r = fill.color.r, g = fill.color.g, b = fill.color.b;
            const isWhite = r > 0.95 && g > 0.95 && b > 0.95;
            if (!isWhite) {
              try {
                fill = figma.variables.setBoundVariableForPaint(fill, 'color', foregroundVar!);
                fillChanged = true;
                count++;
                console.log('Bound fill to foreground on ' + node.name);
              } catch (err) {
                console.log('Fill bind error on ' + node.name + ': ' + (err as Error).message);
              }
            }
          }
          newFills.push(fill);
        }
        if (fillChanged) fillNode.fills = newFills;
      }
    }

    if ('children' in node) {
      for (let i = 0; i < (node as ChildrenMixin).children.length; i++) {
        await bindChildStrokes((node as ChildrenMixin).children[i]);
      }
    }
  }

  for (let n = 0; n < targets.length; n++) {
    await bindNode(targets[n]);
  }

  const msg = 'Bound ' + count + ' color(s) to foreground (' + scope + ')';
  figma.notify(msg);
  return msg;
}
