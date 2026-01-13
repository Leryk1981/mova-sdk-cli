import fs from "fs";
import path from "path";
import { initCommand } from "../init";

describe("initCommand", () => {
  const tmp = path.join(__dirname, "__tmp__");

  afterEach(() => {
    if (fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("creates scaffold directories and files", async () => {
    await initCommand(tmp);
    expect(fs.existsSync(path.join(tmp, "configs", "instruction_profile.default.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "configs", "token_budget.default.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "plans", "plan.sample.json"))).toBe(true);
  });
});
