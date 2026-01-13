import fs from "fs";
import path from "path";
import { driverAdd } from "../driver";

describe("driverAdd", () => {
  const cwd = process.cwd();
  const tmp = path.join(__dirname, "__tmp_driver__");

  beforeEach(() => {
    fs.mkdirSync(tmp, { recursive: true });
    process.chdir(tmp);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("creates driver file and registers it", () => {
    driverAdd("sample");
    const driverPath = path.join(tmp, "src", "drivers", "sample.ts");
    const indexPath = path.join(tmp, "src", "drivers", "index.ts");
    expect(fs.existsSync(driverPath)).toBe(true);
    expect(fs.readFileSync(indexPath, "utf8")).toContain('registerDriver("sample"');
  });
});
