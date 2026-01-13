export class SampleDriver {
  async execute(input: unknown): Promise<{ ok: boolean; input: unknown }> {
    // TODO: implement driver logic
    return { ok: true, input };
  }
}

export function sampleFactory() {
  return new SampleDriver();
}
