/**
 * Tree Traversal Utilities
 *
 * Source: tds/src/modules/renamer/utils.ts (D5: 3 functions extracted)
 */

/**
 * TDS 라이브러리 인스턴스인지 확인
 * INSTANCE 타입이고 mainComponent 접근 가능하거나 componentProperties가 있으면 true
 */
export function isTDSInstance(node: SceneNode): boolean {
  if (node.type !== 'INSTANCE') return false;
  const instance = node as InstanceNode;

  try {
    if (instance.mainComponent) return true;
  } catch (e) {
    // 외부 라이브러리 접근 실패 또는 컴포넌트 에러
  }

  try {
    return instance.componentProperties !== undefined
      && Object.keys(instance.componentProperties).length > 0;
  } catch (e) {
    // componentProperties 접근 실패 (컴포넌트 에러 있는 노드)
    return true; // 안전하게 TDS로 간주 (skip)
  }
}

/**
 * 노드 트리 순회 (depth-first)
 */
export function* walkTree(nodes: readonly SceneNode[]): Generator<SceneNode> {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    yield node;
    if ('children' in node) {
      yield* walkTree((node as FrameNode).children);
    }
  }
}

/**
 * 선택된 노드 또는 페이지 top-level 프레임 반환
 */
export function getTargetNodes(): readonly SceneNode[] {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) return selection;

  const result: SceneNode[] = [];
  const children = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const n = children[i];
    if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') {
      result.push(n);
    }
  }
  return result;
}
