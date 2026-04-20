/**
 * CDS Plugin — Unified Entry Point
 *
 * 3개 모듈 통합: Renamer + Docs Generator + Migrator
 * D2: ensureVarsLoaded, D3: error isolation, D7: headless command chain
 */

import { renamerModule } from './modules/renamer';
import { docsModule } from './modules/docs';
import { migratorModule } from './modules/migrator';
import { loadCdsVars } from './shared/variables';
import type { CDSModule, PluginMessage } from './types';

const modules: CDSModule[] = [renamerModule, docsModule, migratorModule];
const command = figma.command;

// Docs 명령: UI 없이 실행 후 종료 (기존 cds-docs 동작 유지) [D7]
const HEADLESS_COMMANDS = ['gen-typography', 'gen-colors', 'gen-effects'];

if (command && HEADLESS_COMMANDS.includes(command)) {
  loadCdsVars().then(async () => {
    try {
      for (const mod of modules) {
        if (await mod.handleCommand(command)) break;
      }
    } catch (err) {
      const error = err as Error;
      console.error('CDS Headless error:', error);
      figma.notify('Error: ' + error.message, { error: true });
    }
    figma.closePlugin();
  });
} else {
  // UI 기반 명령: 패널 열기
  figma.showUI(__html__, {
    width: 360,
    height: 520,
    themeColors: true,
    title: 'CDS',
  });

  // [D2] 프리로딩 시작 (모듈 핸들러에서 ensureVarsLoaded() await)
  loadCdsVars();

  // 메뉴에서 직접 명령어 실행한 경우
  if (command && command !== 'open-ui') {
    (async () => {
      for (const mod of modules) {
        try {
          if (await mod.handleCommand(command)) break;
        } catch (err) {
          const error = err as Error;
          console.error(`[${mod.name}] Command error:`, error);
          figma.notify('Error: ' + error.message, { error: true });
        }
      }
    })();
  }

  // [D3] 모듈별 에러 격리 — 한 모듈 실패가 전체 크래시로 번지지 않음
  figma.ui.onmessage = async (msg: PluginMessage) => {
    for (const mod of modules) {
      try {
        if (await mod.handleMessage(msg)) break;
      } catch (err) {
        const error = err as Error;
        console.error(`[${mod.name}] Error:`, error);
        figma.notify('Error: ' + error.message, { error: true });
        figma.ui.postMessage({ type: 'error', module: mod.name, text: error.message });
        break;
      }
    }
  };
}
