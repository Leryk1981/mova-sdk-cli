import fs from "fs";
import path from "path";
import { runCommand } from "../run";

jest.mock("node-fetch", () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    ok: true,
    status: 200,
    async json() {
      return { status: "ok" };
    },
  })),
}));

describe("runCommand", () => {
  const tmp = path.join(__dirname, "__tmp_run__");
  const planPath = path.join(tmp, "plan.json");

  beforeAll(() => {
    fs.mkdirSync(tmp, { recursive: true });
    fs.writeFileSync(planPath, JSON.stringify({ foo: "bar" }));
  });

  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("runs via endpoint using fetch", async () => {
    await expect(
      runCommand(planPath, { endpoint: "http://localhost", exitOnComplete: false })
    ).resolves.not.toThrow();
  });
});
