import { randomUUID } from "crypto";

export async function getUuid(): Promise<string> {
  const { v4 } = await import("uuid").catch(() => ({ v4: randomUUID }));
  return v4();
}
