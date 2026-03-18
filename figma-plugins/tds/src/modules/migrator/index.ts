/**
 * Migrator Module — TDS style migration, effect detach, icon color binding
 *
 * Entry point for the migrator module. Routes UI messages to handlers.
 */

import type { TDSModule, PluginMessage } from '../../types';
import { ensureVarsLoaded } from '../../shared/variables';
import { handleMigrate } from './migrate';
import { handleDetachEffects } from './effect-detacher';
import { handleBindIconColors } from './icon-binder';

export const migratorModule: TDSModule = {
  name: 'migrator',

  async handleMessage(msg: PluginMessage): Promise<boolean> {
    switch (msg.type) {
      case 'migrate': {
        await ensureVarsLoaded();
        const result = await handleMigrate();
        figma.ui.postMessage({ type: 'result', module: 'migrator', text: result });
        return true;
      }
      case 'detach-effects': {
        const result = await handleDetachEffects();
        figma.ui.postMessage({ type: 'result', module: 'migrator', text: result });
        return true;
      }
      case 'bind-icon-colors': {
        await ensureVarsLoaded();
        const result = await handleBindIconColors();
        figma.ui.postMessage({ type: 'result', module: 'migrator', text: result });
        return true;
      }
      default:
        return false;
    }
  },

  async handleCommand(command: string): Promise<boolean> {
    return this.handleMessage({ type: command });
  },
};
