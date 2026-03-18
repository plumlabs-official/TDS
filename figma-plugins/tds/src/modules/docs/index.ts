/**
 * Docs Module — TDSModule interface implementation
 *
 * Generates documentation pages: Typography, Colors, Effects.
 */

import type { TDSModule, PluginMessage } from '../../types';
import { handleGenTypography } from './typography';
import { handleGenColors } from './colors';
import { handleGenEffects } from './effects';

export const docsModule: TDSModule = {
  name: 'docs',

  async handleMessage(msg: PluginMessage): Promise<boolean> {
    switch (msg.type) {
      case 'gen-typography':
        await handleGenTypography();
        figma.ui.postMessage({ type: 'result', module: 'docs', text: 'Typography page generated' });
        return true;

      case 'gen-colors':
        await handleGenColors();
        figma.ui.postMessage({ type: 'result', module: 'docs', text: 'Colors page generated' });
        return true;

      case 'gen-effects':
        await handleGenEffects();
        figma.ui.postMessage({ type: 'result', module: 'docs', text: 'Effects page generated' });
        return true;

      default:
        return false;
    }
  },

  async handleCommand(command: string): Promise<boolean> {
    return this.handleMessage({ type: command });
  },
};
