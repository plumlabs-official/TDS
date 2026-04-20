/**
 * CDS Plugin — Shared Constants
 */

/** CDS Figma library file key */
export const CDS_FILE_KEY = 'H36eNEd6o7ZTv4R7VcyLf2';

/** CDS file page IDs (stable across renames) */
export const CDS_PAGE_IDS = {
  COMPONENTS: '20012:2',
  ICONS: '20013:144',
} as const;

// Shape 노드 타입 (Vector 계열)
export const SHAPE_TYPES = [
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
  'LINE',
  'VECTOR',
  'BOOLEAN_OPERATION',
] as const;

// Shape 노드 타입 (기본 도형만)
export const BASIC_SHAPE_TYPES = [
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
] as const;

export type ShapeType = (typeof SHAPE_TYPES)[number];
export type BasicShapeType = (typeof BASIC_SHAPE_TYPES)[number];

// Shape 타입 체크 헬퍼
export function isShapeType(nodeType: string): nodeType is ShapeType {
  return (SHAPE_TYPES as readonly string[]).includes(nodeType);
}

export function isBasicShapeType(nodeType: string): nodeType is BasicShapeType {
  return (BASIC_SHAPE_TYPES as readonly string[]).includes(nodeType);
}
