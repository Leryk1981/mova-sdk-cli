import { sampleFactory } from "./sample";
const registry: Record<string, any> = {};

export function registerDriver(name: string, factory: () => any) {
  registry[name] = factory;
}

export function getDriver(name: string) {
  if (!registry[name]) {
    throw new Error(`Driver not found: ${name}`);
  }
  return registry[name]();
}

export function listDrivers(): string[] {
  return Object.keys(registry);
}
registerDriver("sample", sampleFactory);
