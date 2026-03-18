/**
 * TDS Plugin — Shared Type Definitions
 */

export type ModuleName = 'renamer' | 'docs' | 'migrator';

/** UI → Plugin message */
export interface PluginMessage {
  type: string;
  [key: string]: any;
}

/** Plugin → UI message */
export interface UIMessage {
  type: string;
  module?: ModuleName;
  [key: string]: any;
}

/** Module interface — every module exports this from index.ts */
export interface TDSModule {
  name: ModuleName;
  /** Handle a UI message. Return true if handled. */
  handleMessage(msg: PluginMessage): Promise<boolean>;
  /** Handle a menu command. Return true if handled. */
  handleCommand(command: string): Promise<boolean>;
}

/** Rename entry (Renamer module) */
export interface RenameEntry {
  nodeId: string;
  before: string;
  after: string;
  reason: string;
}

/** Wrapper warning (Renamer module) */
export interface WrapperWarning {
  nodeId: string;
  nodeName: string;
  childName: string;
  reason: string;
}

/** Property issue (Renamer module) */
export interface PropertyIssue {
  nodeName: string;
  nodeId: string;
  property: string;
  issue: 'missing-prefix' | 'not-camelCase' | 'value-not-lowercase' | 'special-char' | 'name-order';
  current: string;
  suggested: string;
  severity: 'major' | 'minor' | 'warning';
}

/** Renamer analysis result */
export interface RenamerResult {
  mode: 'product' | 'library';
  entries: RenameEntry[];
  propertyIssues: PropertyIssue[];
  wrapperWarnings: WrapperWarning[];
  skipped: number;
  total: number;
}
