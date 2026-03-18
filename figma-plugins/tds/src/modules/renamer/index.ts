/**
 * Renamer Module — TDSModule interface implementation
 */

import type { TDSModule, PluginMessage } from '../../types';
import {
  analyzeProductDesign,
  applyProductRenames,
  analyzeTDSLibrary,
  unwrapSingleChildWrappers,
} from './renamer';

function handleRenameProduct(): void {
  const result = analyzeProductDesign();
  if (result.entries.length === 0) {
    figma.notify('변경할 레이어가 없습니다.', { timeout: 2000 });
    figma.ui.postMessage({ type: 'result', module: 'renamer', text: '변경 없음' });
    return;
  }
  figma.ui.postMessage({
    type: 'rename-preview',
    module: 'renamer',
    mode: 'product',
    entries: result.entries,
    wrapperWarnings: result.wrapperWarnings,
    skipped: result.skipped,
    total: result.total,
  });
  let msg = result.entries.length + '건 변경 제안 (' + result.skipped + '건 TDS skip)';
  if (result.wrapperWarnings.length > 0) msg += ' + ' + result.wrapperWarnings.length + '건 래퍼 경고';
  figma.notify(msg, { timeout: 3000 });
}

function handleRenameTDS(): void {
  const result = analyzeTDSLibrary();
  figma.ui.postMessage({
    type: 'rename-preview',
    module: 'renamer',
    mode: 'library',
    entries: result.entries,
    propertyIssues: result.propertyIssues,
    total: result.total,
  });
  const issueCount = result.entries.length + result.propertyIssues.length;
  if (issueCount === 0) {
    figma.notify('이슈 없음. 정책 준수 ✅', { timeout: 2000 });
  } else {
    figma.notify(`${issueCount}건 이슈 발견`, { timeout: 3000 });
  }
}

export const renamerModule: TDSModule = {
  name: 'renamer',

  async handleMessage(msg: PluginMessage): Promise<boolean> {
    switch (msg.type) {
      case 'rename-product':
        handleRenameProduct();
        return true;

      case 'rename-tds':
        handleRenameTDS();
        return true;

      case 'apply-renames':
        if (msg.entries) {
          const count = await applyProductRenames(msg.entries);
          figma.notify('✅ ' + count + '건 리네이밍 완료');
          figma.ui.postMessage({ type: 'result', module: 'renamer', text: count + '건 적용 완료' });
        }
        return true;

      case 'unwrap-wrappers':
        if (msg.nodeIds) {
          const count = await unwrapSingleChildWrappers(msg.nodeIds);
          figma.notify('✅ ' + count + '건 래퍼 언래핑 완료');
          figma.ui.postMessage({ type: 'result', module: 'renamer', text: count + '건 언래핑 완료' });
        }
        return true;

      default:
        return false;
    }
  },

  async handleCommand(command: string): Promise<boolean> {
    switch (command) {
      case 'rename-product':
        handleRenameProduct();
        return true;
      case 'rename-tds':
        handleRenameTDS();
        return true;
      default:
        return false;
    }
  },
};
