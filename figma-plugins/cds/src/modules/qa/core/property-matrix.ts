import type {
  ContractNode,
  ContractPropertyDefinition,
  ExposedInstanceEvidence,
  PropertyFieldMismatch,
  PropertyReferenceMatrixRow,
  PropertyReferenceMatrixSummary,
  PropertyReferenceTarget,
} from './types';

const EXPECTED_FIELD: Record<string, string> = {
  TEXT: 'characters',
  BOOLEAN: 'visible',
  INSTANCE_SWAP: 'mainComponent',
};

const MAX_ROWS = 50;

export function collectPropertyReferenceMatrix(root: ContractNode): PropertyReferenceMatrixSummary {
  const definitions = root.componentPropertyDefinitions || {};
  const referenced = new Map<string, PropertyReferenceTarget[]>();
  const exposedInstanceEvidence = new Map<string, ExposedInstanceEvidence[]>();

  walkForCurrentComponent(root, (node) => {
    for (const [field, key] of Object.entries(node.componentPropertyReferences || {})) {
      if (!referenced.has(key)) referenced.set(key, []);
      referenced.get(key)!.push({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        field,
      });
    }

    if (node.type === 'INSTANCE' && node.isExposedInstance) {
      for (const key of Object.keys(node.componentProperties || {})) {
        if (!definitions[key]) continue;
        if (!exposedInstanceEvidence.has(key)) exposedInstanceEvidence.set(key, []);
        exposedInstanceEvidence.get(key)!.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          evidence: 'isExposedInstance',
        });
      }
    }
  });

  const matrix = Object.entries(definitions)
    .filter(([, def]) => def.type !== 'VARIANT')
    .map(([key, def]) => rowForDefinition(key, def, referenced, exposedInstanceEvidence));

  const fieldMismatches = collectFieldMismatches(matrix);
  const danglingRefs = [...referenced.keys()].filter((key) => !definitions[key]);
  const unreferenced = matrix.filter(
    (row) => row.targets.length === 0 && row.exposedInstanceEvidence.length === 0,
  );

  const truncated = matrix.length > MAX_ROWS
    || unreferenced.length > MAX_ROWS
    || danglingRefs.length > MAX_ROWS
    || fieldMismatches.length > MAX_ROWS;

  return {
    definitionCount: Object.keys(definitions).length,
    nonVariantDefinitionCount: matrix.length,
    referencedNonVariantCount: matrix.filter(
      (row) => row.targets.length > 0 || row.exposedInstanceEvidence.length > 0,
    ).length,
    matrix: matrix.slice(0, MAX_ROWS),
    unreferenced: unreferenced.slice(0, MAX_ROWS),
    danglingRefs: danglingRefs.slice(0, MAX_ROWS),
    fieldMismatches: fieldMismatches.slice(0, MAX_ROWS),
    truncated,
  };
}

function rowForDefinition(
  key: string,
  def: ContractPropertyDefinition,
  referenced: Map<string, PropertyReferenceTarget[]>,
  exposedInstanceEvidence: Map<string, ExposedInstanceEvidence[]>,
): PropertyReferenceMatrixRow {
  return {
    key,
    name: def.name,
    type: def.type,
    targets: referenced.get(key) || [],
    exposedInstanceEvidence: exposedInstanceEvidence.get(key) || [],
  };
}

function collectFieldMismatches(matrix: PropertyReferenceMatrixRow[]): PropertyFieldMismatch[] {
  return matrix.flatMap((row) => {
    const expectedField = EXPECTED_FIELD[row.type];
    if (!expectedField) return [];
    return row.targets
      .filter((target) => target.field !== expectedField)
      .map((target) => ({
        ...target,
        key: row.key,
        type: row.type,
        expectedField,
      }));
  });
}

function walkForCurrentComponent(node: ContractNode, visit: (node: ContractNode) => void): void {
  visit(node);
  if (node.type === 'INSTANCE') return;
  for (const child of node.children || []) walkForCurrentComponent(child, visit);
}
