import { sampleFactory } from "./sample";

export interface Driver {
  execute(input: unknown): Promise<unknown> | unknown;
}

type DriverFactory = () => Driver;

const registry: Record<string, DriverFactory> = {};

export function registerDriver(name: string, factory: DriverFactory) {
  registry[name] = factory;
}

export function getDriver(name: string): Driver {
  if (!registry[name]) {
    throw new Error(`Driver not found: ${name}`);
  }
  return registry[name]();
}

export function listDrivers(): string[] {
  return Object.keys(registry);
}
registerDriver("sample", sampleFactory);
