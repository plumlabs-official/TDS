/**
 * CDS 라이브러리 프로퍼티 점검 (Mode 2)
 *
 * naming-policy v1.1 기준:
 * - Boolean: camelCase + show/is/has 접두어
 * - Variant Property Key: camelCase
 * - Variant Value: lowercase
 * - 특수문자 금지
 */

export interface PropertyIssue {
  nodeName: string;
  nodeId: string;
  property: string;
  issue: 'missing-prefix' | 'not-camelCase' | 'value-not-lowercase' | 'special-char' | 'name-order';
  current: string;
  suggested: string;
  severity: 'major' | 'minor' | 'warning';
}

const BOOLEAN_PREFIXES = ['show', 'is', 'has'];
const SPECIAL_CHAR_PATTERN = /[↳:]/;

/**
 * 컴포넌트/컴포넌트셋의 프로퍼티 점검
 */
export function checkComponentProperties(node: SceneNode): PropertyIssue[] {
  if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') return [];
  const issues: PropertyIssue[] = [];

  const props = node.type === 'COMPONENT_SET'
    ? (node as ComponentSetNode).componentPropertyDefinitions
    : (node as ComponentNode).componentPropertyDefinitions;

  if (!props) return issues;

  for (const [key, def] of Object.entries(props)) {
    // Figma 내부 ID 접미사 제거 (#20158:0 등)
    const cleanKey = key.replace(/#\d+:\d+$/, '');

    // 특수문자 검사
    if (SPECIAL_CHAR_PATTERN.test(cleanKey)) {
      issues.push({
        nodeName: node.name,
        nodeId: node.id,
        property: key,
        issue: 'special-char',
        current: cleanKey,
        suggested: cleanKey.replace(SPECIAL_CHAR_PATTERN, '').trim(),
        severity: 'minor',
      });
    }

    if (def.type === 'BOOLEAN') {
      // Boolean 접두어 검사
      const hasPrefix = BOOLEAN_PREFIXES.some((p) =>
        cleanKey.toLowerCase().startsWith(p.toLowerCase())
      );
      if (!hasPrefix) {
        issues.push({
          nodeName: node.name,
          nodeId: node.id,
          property: key,
          issue: 'missing-prefix',
          current: cleanKey,
          suggested: `show${cleanKey.charAt(0).toUpperCase()}${cleanKey.slice(1)}`,
          severity: 'minor',
        });
      }

      // camelCase 검사 (공백 포함이면 실패)
      if (cleanKey.includes(' ')) {
        const camel = toCamelCase(cleanKey);
        issues.push({
          nodeName: node.name,
          nodeId: node.id,
          property: key,
          issue: 'not-camelCase',
          current: cleanKey,
          suggested: camel,
          severity: 'minor',
        });
      }
    }

    if (def.type === 'VARIANT') {
      // Variant value lowercase 검사
      const values = def.variantOptions || [];
      for (const val of values) {
        if (val !== val.toLowerCase()) {
          issues.push({
            nodeName: node.name,
            nodeId: node.id,
            property: `${cleanKey}=${val}`,
            issue: 'value-not-lowercase',
            current: val,
            suggested: val.toLowerCase(),
            severity: 'warning',
          });
        }
      }
    }
  }

  return issues;
}

/**
 * 컴포넌트 내부 파트명 순서 점검
 * naming-policy: CDS 내부 = [컴포넌트][파트] (e.g., Sheet Content)
 */
export function checkPartNameOrder(node: SceneNode): PropertyIssue[] {
  if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') return [];
  const issues: PropertyIssue[] = [];
  const componentName = node.name.split('/')[0].trim();

  if (!('children' in node)) return issues;
  const children = (node as ComponentSetNode).children;

  for (const child of children) {
    if (child.type === 'INSTANCE') continue; // 인스턴스 내부는 skip
    const parts = child.name.split(' ');
    if (parts.length < 2) continue;

    // "Content Sheet" → 역할이 먼저, 컴포넌트가 뒤 → 역전
    const lastWord = parts[parts.length - 1];
    if (lastWord === componentName && parts[0] !== componentName) {
      issues.push({
        nodeName: child.name,
        nodeId: child.id,
        property: 'layer-name',
        issue: 'name-order',
        current: child.name,
        suggested: `${componentName} ${parts.slice(0, -1).join(' ')}`,
        severity: 'minor',
      });
    }
  }

  return issues;
}

function toCamelCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}
