import {
  runCompletionGate,
  runCleanupProbe,
  assertNoContractProbeLeftovers,
  type CompletionGateInput,
} from './figma/live-audit';
import {
  runFixtureManifest,
  validateCreationDecision,
  type ComponentContractFixture,
  type CreationDecision,
} from './core';

const api = {
  runCreationGate(input: CreationDecision) {
    const errors = validateCreationDecision(input);
    if (errors.length > 0) throw new Error(errors.join('; '));
    return input;
  },
  runCompletionGate(input: CompletionGateInput) {
    return runCompletionGate(input);
  },
  runFixtureManifest(fixture: ComponentContractFixture) {
    return runFixtureManifest(fixture);
  },
  runCleanupProbe(componentNodeId: string) {
    return runCleanupProbe(componentNodeId);
  },
  assertNoContractProbeLeftovers(runId: string) {
    return assertNoContractProbeLeftovers(runId);
  },
};

(globalThis as any).CDSContractAudit = api;
