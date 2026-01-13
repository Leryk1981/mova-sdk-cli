import fs from "fs";
import path from "path";
import { episodeList, episodeExport } from "../episode";

describe("episode commands", () => {
  const cwd = process.cwd();
  const tmp = path.join(__dirname, "__tmp_episode__");
  const episodesDir = path.join(tmp, "episodes");

  beforeEach(() => {
    fs.mkdirSync(episodesDir, { recursive: true });
    process.chdir(tmp);
    fs.writeFileSync(
      path.join(episodesDir, "sample.json"),
      JSON.stringify({ episode_id: "ep-1", verb: "noop", connector_id: "driver-1" })
    );
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("lists episodes", async () => {
    await expect(episodeList({})).resolves.not.toThrow();
  });

  it("exports episode to json", async () => {
    const out = path.join(tmp, "out.json");
    await episodeExport("ep-1", { format: "json", output: out });
    expect(fs.existsSync(out)).toBe(true);
  });
});
