export class SampleDriver {
  async execute(input: any): Promise<any> {
    // TODO: implement driver logic
    return { ok: true, input };
  }
}

export function sampleFactory() {
  return new SampleDriver();
}
