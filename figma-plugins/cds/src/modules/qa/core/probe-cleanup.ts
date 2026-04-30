export interface RemovableProbe {
  remove(): void;
}

export async function withProbeCleanup<TProbe extends RemovableProbe, TResult>(
  probe: TProbe,
  run: (probe: TProbe) => TResult | Promise<TResult>,
): Promise<TResult> {
  try {
    return await run(probe);
  } finally {
    probe.remove();
  }
}
