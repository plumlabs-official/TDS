/**
 * Component Instance Swap — Replace remote component instances with local TDS ones
 *
 * Source: migrate-to-tds/code.js swapComponentInstances() + findVariantInSet() + traverseAndSwap()
 * (lines 875-1055)
 */

import { TDS_PAGE_IDS } from '../../constants';

export interface SwapResult {
  swapped: number;
  skipped: number;
  missed: number;
}

/**
 * Find a matching variant within a COMPONENT_SET.
 * 1. Exact variant name match
 * 2. Variant property value comparison
 * 3. Fallback: default variant (first child)
 */
function findVariantInSet(
  localSet: ComponentSetNode,
  compName: string,
  node: InstanceNode,
): ComponentNode | null {
  // 1. 정확한 variant 이름 매칭
  for (let c = 0; c < localSet.children.length; c++) {
    if (localSet.children[c].name === compName) return localSet.children[c] as ComponentNode;
  }

  // 2. variant 프로퍼티 값 비교
  const variantProps: Record<string, string> = {};
  try {
    const props = node.componentProperties;
    for (const key in props) {
      if (props[key].type === 'VARIANT') {
        variantProps[key] = props[key].value as string;
      }
    }
  } catch (e) {
    // ignore
  }

  const propKeys = Object.keys(variantProps);
  if (propKeys.length > 0) {
    for (let c = 0; c < localSet.children.length; c++) {
      const candidate = localSet.children[c] as ComponentNode;
      const candidateProps: Record<string, string> = {};
      try {
        const cpArr = candidate.name.split(', ');
        for (let cp = 0; cp < cpArr.length; cp++) {
          const parts = cpArr[cp].split('=');
          if (parts.length === 2) candidateProps[parts[0].trim()] = parts[1].trim();
        }
      } catch (e) {
        // ignore
      }
      let matchAll = true;
      let matchCount = 0;
      for (let vk = 0; vk < propKeys.length; vk++) {
        const k = propKeys[vk];
        if (candidateProps[k] !== undefined) {
          if (candidateProps[k] !== variantProps[k]) { matchAll = false; break; }
          matchCount++;
        }
      }
      if (matchAll && matchCount > 0) return candidate;
    }
  }

  // 3. fallback: default variant (첫 번째)
  return localSet.children.length > 0 ? localSet.children[0] as ComponentNode : null;
}

/**
 * Swap remote component instances with local TDS components.
 * Builds a component index from TDS source pages, then traverses target nodes.
 *
 * 3-tier matching:
 * 1. Exact standalone component name
 * 2. Parent COMPONENT_SET name (for variants)
 * 3. Node name as COMPONENT_SET key
 */
export async function swapComponentInstances(
  targets: readonly SceneNode[],
  scope: string,
): Promise<SwapResult> {
  // 1. 소스 페이지 로드 (ID 기반 — 페이지 이름 변경에 안전)
  const sourcePageIds = [TDS_PAGE_IDS.COMPONENTS, TDS_PAGE_IDS.ICONS];
  const sourcePages: PageNode[] = [];
  for (let p = 0; p < figma.root.children.length; p++) {
    if ((sourcePageIds as readonly string[]).indexOf(figma.root.children[p].id) !== -1) {
      sourcePages.push(figma.root.children[p]);
    }
  }
  if (sourcePages.length === 0) {
    console.log('Source pages not found (IDs: ' + sourcePageIds.join(', ') + ') — skipping component swap');
    return { swapped: 0, skipped: 0, missed: 0 };
  }

  const compMap: Record<string, ComponentNode | ComponentSetNode> = {};

  for (let sp = 0; sp < sourcePages.length; sp++) {
    await sourcePages[sp].loadAsync();

    // 2. 각 페이지에서 standalone COMPONENT만 수집 (variant children 제외)
    const allComps = sourcePages[sp].findAll(
      (n: SceneNode) => n.type === 'COMPONENT',
    ) as ComponentNode[];
    for (let i = 0; i < allComps.length; i++) {
      const comp = allComps[i];
      if (comp.name) {
        const isVariantChild = comp.parent && comp.parent.type === 'COMPONENT_SET';
        if (isVariantChild) continue;
        if (compMap[comp.name] && compMap[comp.name] !== comp) {
          console.log('[WARN] compMap key collision: "' + comp.name + '" — overwriting');
        }
        compMap[comp.name] = comp;
      }
    }
  }

  // COMPONENT_SET도 수집 (variant 매칭용)
  for (let sp2 = 0; sp2 < sourcePages.length; sp2++) {
    const allSets = sourcePages[sp2].findAll(
      (n: SceneNode) => n.type === 'COMPONENT_SET',
    ) as ComponentSetNode[];
    for (let i = 0; i < allSets.length; i++) {
      const cs = allSets[i];
      if (cs.name) {
        compMap['__SET__' + cs.name] = cs;
      }
    }
  }

  const compCount = Object.keys(compMap).length;
  const setNames: string[] = [];
  for (const k in compMap) {
    if (k.indexOf('__SET__') === 0) setNames.push(k.replace('__SET__', ''));
  }
  console.log('TDS components: ' + (compCount - setNames.length) + ', SETs: ' + setNames.length);

  if (compCount === 0) {
    return { swapped: 0, skipped: 0, missed: 0 };
  }

  let swapCount = 0;
  let skipCount = 0;
  let missCount = 0;

  async function traverseAndSwap(node: SceneNode): Promise<void> {
    if (node.type === 'INSTANCE') {
      try {
        const mainComp = await (node as InstanceNode).getMainComponentAsync();

        if (mainComp && mainComp.remote) {
          const compName = mainComp.name;
          let swapped = false;

          // variant 여부 판별 (COMPONENT_SET 자식은 bare name 충돌 위험)
          const isVariant = mainComp.parent && mainComp.parent.type === 'COMPONENT_SET';

          // 1차: standalone 컴포넌트만 bare name 매칭 (variant는 스킵)
          if (!isVariant && compMap[compName]) {
            (node as InstanceNode).swapComponent(compMap[compName] as ComponentNode);
            swapCount++;
            swapped = true;
            console.log('Swapped: ' + node.name + ' → ' + compName);
          }

          // 2차: variant — parent COMPONENT_SET으로 매칭
          if (!swapped && isVariant) {
            const localSet = compMap['__SET__' + mainComp.parent!.name];
            if (localSet && localSet.type === 'COMPONENT_SET') {
              const match = findVariantInSet(localSet as ComponentSetNode, compName, node as InstanceNode);
              if (match) {
                (node as InstanceNode).swapComponent(match);
                swapCount++;
                swapped = true;
                console.log('Swapped (via parent set): ' + node.name + ' → ' + match.name);
              }
            }
          }

          // 3차: node.name으로 COMPONENT_SET 매칭
          if (!swapped) {
            const localSet = compMap['__SET__' + node.name];
            if (localSet && localSet.type === 'COMPONENT_SET') {
              const match = findVariantInSet(localSet as ComponentSetNode, compName, node as InstanceNode);
              if (match) {
                (node as InstanceNode).swapComponent(match);
                swapCount++;
                swapped = true;
                console.log('Swapped (by node.name): ' + node.name + ' → ' + match.name);
              }
            }
          }

          if (!swapped) {
            missCount++;
            console.log('[MISS] remote: node.name=' + node.name + ', mainComp.name=' + compName + ', parent=' + (mainComp.parent ? mainComp.parent.name : 'null'));
          }
        } else if (mainComp) {
          skipCount++;
        }
        // 로컬/원격 모두 children 순회 계속 (중첩 원격 인스턴스 탐지)
      } catch (err) {
        console.log('Swap error on ' + node.name + ': ' + (err as Error).message);
      }
    }
    if ('children' in node) {
      for (let i = 0; i < (node as ChildrenMixin).children.length; i++) {
        await traverseAndSwap((node as ChildrenMixin).children[i]);
      }
    }
  }

  for (let n = 0; n < targets.length; n++) {
    await traverseAndSwap(targets[n]);
  }

  console.log('Component swap: ' + swapCount + ' swapped, ' + skipCount + ' local, ' + missCount + ' missed (' + scope + ')');
  return { swapped: swapCount, skipped: skipCount, missed: missCount };
}
