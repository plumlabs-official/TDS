import type { ContractException, ContractNode, LayoutContractSummary } from './types';

const STRUCTURAL_NAMES = /^(Header|Footer|Body|Section|Info|Meta|Action|Description|Sidebar|Form|Navbar|Tab Bar|Scroll Area|Top Meta Row|Metrics Row|Lounge Info|Info Body|Description Row|Title Slot)$/;
const RIGHT_ACTION_NAMES = /^(Timestamp|Detail Link|Action|Close Button|.* Button|.* Action|.* Link)$/;
const MAX_ISSUES = 50;

export function collectLayoutContract(
  root: ContractNode,
  exceptions: ContractException[] = [],
): LayoutContractSummary {
  const issues: string[] = [];
  let checked = 0;

  walkWithParent(root, undefined, (node, parent) => {
    checked++;
    if (isExcepted(exceptions, node.id, 'layout', node.name)) return;

    if ((node.type === 'COMPONENT' || node.type === 'FRAME') && isRootLike(node, parent)) {
      if (!hasAutoLayout(node)) pushIssue(issues, `${node.id}:root-auto-layout`);
    }

    if (isContainerNode(node) && STRUCTURAL_NAMES.test(node.name) && node.name !== 'Hero Spacer' && !hasAutoLayout(node)) {
      pushIssue(issues, `${node.id}:structural-auto-layout`);
    }

    if (/^(Title|Description|Lounge Name)$/.test(node.name) && isFixedText(node) && !hasTruncation(node)) {
      pushIssue(issues, `${node.id}:bounded-text`);
    }

    if (node.name === 'Title Slot' && hasAutoLayout(node)) {
      const title = (node.children || []).find((child) => child.name === 'Title');
      if (node.primaryAxisAlignItems !== 'MAX' || title?.textAlignVertical !== 'BOTTOM') {
        pushIssue(issues, `${node.id}:title-growth`);
      }
    }

    if (RIGHT_ACTION_NAMES.test(node.name) && parent && !hasAutoLayout(parent)) {
      pushIssue(issues, `${node.id}:right-action-row`);
    }
  });

  return {
    issues,
    checked,
    exceptions,
    truncated: issues.length >= MAX_ISSUES,
  };
}

function isRootLike(node: ContractNode, parent: ContractNode | undefined): boolean {
  if (!parent) return node.type !== 'COMPONENT_SET';
  return parent.type === 'COMPONENT_SET' && node.type === 'COMPONENT';
}

function hasAutoLayout(node: ContractNode): boolean {
  return Boolean(node.layoutMode && node.layoutMode !== 'NONE');
}

function isContainerNode(node: ContractNode): boolean {
  return node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'GROUP';
}

function isFixedText(node: ContractNode): boolean {
  return node.type === 'TEXT' && node.layoutSizingVertical === 'FIXED';
}

function hasTruncation(node: ContractNode): boolean {
  return node.textAutoResize === 'TRUNCATE' || node.textTruncation === 'ENDING';
}

function pushIssue(issues: string[], issue: string): void {
  if (issues.length < MAX_ISSUES) issues.push(issue);
}

function isExcepted(exceptions: ContractException[], nodeId: string, prefix: string, nodeName?: string): boolean {
  return exceptions.some((ex) =>
    ex.ruleId.startsWith(prefix) && (ex.nodeId === nodeId || (nodeName && ex.nodeName === nodeName)),
  );
}

function walkWithParent(
  node: ContractNode,
  parent: ContractNode | undefined,
  visit: (node: ContractNode, parent: ContractNode | undefined) => void,
): void {
  visit(node, parent);
  if (node.type === 'INSTANCE') return;
  for (const child of node.children || []) walkWithParent(child, node, visit);
}
