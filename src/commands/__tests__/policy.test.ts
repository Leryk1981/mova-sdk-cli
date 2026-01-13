import fs from "fs";
import path from "path";
import { policySet, policyShow } from "../policy";

describe("policy commands", () => {
  const cwd = process.cwd();
  const tmp = path.join(__dirname, "__tmp_policy__");
  const profilePath = path.join(tmp, "configs", "instruction_profile.default.json");

  beforeEach(() => {
    fs.mkdirSync(tmp, { recursive: true });
    process.chdir(tmp);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("sets and shows policy", async () => {
    await policySet({ role: "admin", verb: "noop", allow: true, deny: false });
    expect(fs.existsSync(profilePath)).toBe(true);
    const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    expect(profile.rules).toEqual([{ role: "admin", verb: "noop", action: "allow" }]);
    await policyShow(); // should not throw
  });
});
