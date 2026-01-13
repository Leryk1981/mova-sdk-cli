import fs from "fs";
import os from "os";
import path from "path";
import { execSync, spawnSync } from "child_process";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const cliEntry = path.join(repoRoot, "dist", "cli.js");

function ensureCliBuilt() {
  if (!fs.existsSync(cliEntry)) {
    execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
  }
}

function runCli(args: string[], options: { cwd?: string } = {}) {
  const result = spawnSync("node", [cliEntry, ...args], {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      MOVA_SCHEMAS_DIR: path.join(repoRoot, "schemas"),
      MOVA_SMOKE_MODE: "1",
    },
  });
  if (result.error) {
    const message = result.error instanceof Error ? result.error.message : String(result.error);
    throw new Error(`CLI execution failed: ${message}`);
  }
  return result;
}

describe("smoke: CLI -> agent -> episodes", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mova-smoke-"));
  const projectDir = path.join(tmpRoot, "project");
  const episodesDir = path.join(repoRoot, "episodes");
  const schemaPath = path.join(projectDir, "plan.schema.json");
  let episodeFilesBefore: string[] = [];

  beforeAll(() => {
    ensureCliBuilt();
    fs.mkdirSync(projectDir, { recursive: true });
    // init
    const initRes = runCli(["init", projectDir], { cwd: repoRoot });
    expect(initRes.status).toBe(0);
    // lightweight schema for validation to avoid external refs
    fs.writeFileSync(
      schemaPath,
      JSON.stringify(
        {
          $id: "integration.plan.schema",
          type: "object",
          properties: {
            verb: { type: "string" },
            payload: { type: "object" },
            steps: { type: "array" },
          },
          required: ["payload"],
        },
        null,
        2
      )
    );
    // capture existing episodes (if any)
    if (fs.existsSync(episodesDir)) {
      episodeFilesBefore = fs.readdirSync(episodesDir).filter((f) => f.endsWith(".json"));
    }
  });

  afterAll(() => {
    // cleanup episodes created during test
    if (fs.existsSync(episodesDir)) {
      const current = fs.readdirSync(episodesDir).filter((f) => f.endsWith(".json"));
      const toRemove = current.filter((f) => !episodeFilesBefore.includes(f));
      for (const f of toRemove) {
        fs.rmSync(path.join(episodesDir, f), { force: true });
      }
      if (episodeFilesBefore.length === 0 && fs.readdirSync(episodesDir).length === 0) {
        fs.rmdirSync(episodesDir);
      }
    }
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("runs init -> plan -> run -> episode:export", () => {
    const planPath = path.join(projectDir, "plans", "plan.sample.json");

    // plan validation
    const planRes = runCli(["plan", "-s", schemaPath, planPath], { cwd: projectDir });
    if (planRes.status !== 0) {
      throw new Error(`plan failed: ${planRes.stderr || planRes.stdout}`);
    }
    expect(planRes.stdout).toContain("PASS");

    // run plan (uses repo root to access tools/mova-agent.ts)
    const runRes = runCli(["run", planPath], { cwd: repoRoot });
    if (runRes.status !== 0) {
      throw new Error(`run failed: ${runRes.stderr || runRes.stdout}`);
    }

    // episodes should exist in repoRoot/episodes
    expect(fs.existsSync(episodesDir)).toBe(true);
    const episodeFiles = fs.readdirSync(episodesDir).filter((f) => f.endsWith(".json"));
    const newEpisode = episodeFiles.find((f) => !episodeFilesBefore.includes(f));
    expect(newEpisode).toBeDefined();

    const episodeContent = JSON.parse(
      fs.readFileSync(path.join(episodesDir, newEpisode as string), "utf8")
    );
    const episodeId = episodeContent.episode_id || episodeContent.id;
    expect(episodeId).toBeTruthy();

    // export episode
    const exportPath = path.join(projectDir, "exported_episode.json");
    const exportRes = runCli(
      ["episode:export", String(episodeId), "--format", "json", "--output", exportPath],
      { cwd: repoRoot }
    );
    expect(exportRes.status).toBe(0);
    expect(fs.existsSync(exportPath)).toBe(true);
    const exported = JSON.parse(fs.readFileSync(exportPath, "utf8"));
    expect(exported.episode_id || exported.id).toBe(episodeId);
  });
});
