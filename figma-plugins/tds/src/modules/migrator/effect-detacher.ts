/**
 * Effect Detacher — Remove DROP_SHADOW effects, preserve focus/ styles
 *
 * Source: migrate-to-tds/code.js handleDetachEffects() (lines 33-105)
 */

/**
 * Detach effect styles from selected nodes or entire page.
 * Removes DROP_SHADOW effects, preserves focus/ ring styles, skips Ghost buttons.
 */
export async function handleDetachEffects(): Promise<string> {
  const targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  const scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  let count = 0;

  async function detachNode(node: SceneNode): Promise<void> {
    // 디버그: 노드의 effect 관련 속성 확인
    const hasEffectStyleId = 'effectStyleId' in node;
    const effectStyleId = hasEffectStyleId ? (node as any).effectStyleId : 'N/A';
    const hasEffects = 'effects' in node && (node as any).effects && (node as any).effects.length > 0;
    if (hasEffects || effectStyleId) {
      console.log('[DEBUG] ' + node.name + ' | type: ' + node.type + ' | effectStyleId: ' + effectStyleId + ' | effects: ' + (hasEffects ? (node as any).effects.length : 0));
    }

    // Ghost 타입 버튼은 스킵 (Focus ring effect 유지)
    if (node.name && node.name.indexOf('Type=Ghost') !== -1) {
      return;
    }

    // effectStyleId가 있는 경우 — async API로 해제
    if (hasEffectStyleId && (node as any).effectStyleId && (node as any).effectStyleId !== figma.mixed) {
      try {
        const currentStyle = await figma.getStyleByIdAsync((node as any).effectStyleId);
        const styleName = currentStyle ? currentStyle.name : (node as any).effectStyleId;
        // focus/ 스타일은 보존 (focus ring도 DROP_SHADOW 타입이므로)
        if (styleName && styleName.indexOf('focus/') === 0) {
          console.log('Preserved focus style: ' + styleName + ' on ' + node.name);
        } else {
          await (node as any).setEffectStyleIdAsync('');
          // DROP_SHADOW만 제거, 나머지 effect 유지
          const remaining = (node as any).effects.filter((e: Effect) => e.type !== 'DROP_SHADOW');
          (node as any).effects = remaining;
          count++;
          console.log('Removed: ' + styleName + ' on ' + node.name);
        }
      } catch (err) {
        try {
          const remaining = (node as any).effects.filter((e: Effect) => e.type !== 'DROP_SHADOW');
          (node as any).effects = remaining;
          count++;
          console.log('Removed (fallback): ' + node.name);
        } catch (err2) {
          console.log('Error on ' + node.name + ': ' + (err as Error).message);
        }
      }
    }
    // effectStyleId 없지만 effects 배열이 있는 경우
    else if (hasEffects) {
      const hadShadow = (node as any).effects.some((e: Effect) => e.type === 'DROP_SHADOW');
      if (hadShadow) {
        (node as any).effects = (node as any).effects.filter((e: Effect) => e.type !== 'DROP_SHADOW');
        count++;
        console.log('Removed local drop shadows on ' + node.name);
      }
    }

    if ('children' in node) {
      for (let i = 0; i < (node as ChildrenMixin).children.length; i++) {
        await detachNode((node as ChildrenMixin).children[i]);
      }
    }
  }

  for (let n = 0; n < targets.length; n++) {
    await detachNode(targets[n]);
  }

  const msg = 'Removed ' + count + ' effect(s) from ' + scope;
  figma.notify(msg);
  return msg;
}
