/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import chalk from "chalk";

function readEpisodeFile(filePath: string): any[] {
  const ext = path.extname(filePath);
  if (ext === ".jsonl") {
    const lines = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);
    return lines.map((l) => JSON.parse(l));
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return [JSON.parse(raw)];
}

export async function episodeList(options: { verb?: string; tool?: string }) {
  const episodesDir = path.resolve(process.cwd(), "episodes");
  if (!fs.existsSync(episodesDir)) {
    console.error(chalk.red(`Episodes directory not found: ${episodesDir}`));
    process.exit(1);
  }

  const entries = fs.readdirSync(episodesDir).filter((f) => f.endsWith(".json") || f.endsWith(".jsonl"));
  for (const entry of entries) {
    const fullPath = path.join(episodesDir, entry);
    const episodes = readEpisodeFile(fullPath);
    for (const ep of episodes) {
      const verbMatch = options.verb ? ep.verb === options.verb || ep.episode_type === options.verb : true;
      const toolMatch = options.tool ? ep.tool_id === options.tool || ep.connector_id === options.tool : true;
      if (verbMatch && toolMatch) {
        console.log(`${entry}: ${ep.episode_id || ep.id || "unknown"} | ${ep.episode_type || ep.verb || ""}`);
      }
    }
  }
}

export async function episodeExport(
  episodeId: string,
  options: { format?: "json" | "csv"; output?: string }
) {
  const episodesDir = path.resolve(process.cwd(), "episodes");
  if (!fs.existsSync(episodesDir)) {
    console.error(chalk.red(`Episodes directory not found: ${episodesDir}`));
    process.exit(1);
  }

  const entries = fs.readdirSync(episodesDir).filter((f) => f.endsWith(".json") || f.endsWith(".jsonl"));
  for (const entry of entries) {
    const fullPath = path.join(episodesDir, entry);
    const episodes = readEpisodeFile(fullPath);
    const match = episodes.find((ep) => ep.episode_id === episodeId || ep.id === episodeId);
    if (match) {
      const format = options.format || "json";
      const outputPath =
        options.output ||
        path.join(process.cwd(), `${episodeId}.${format === "json" ? "json" : "csv"}`);
      if (format === "json") {
        fs.writeFileSync(outputPath, JSON.stringify(match, null, 2));
      } else {
        const headers = Object.keys(match);
        const values = headers.map((h) => JSON.stringify(match[h] ?? ""));
        const csv = `${headers.join(",")}\n${values.join(",")}\n`;
        fs.writeFileSync(outputPath, csv);
      }
      console.log(chalk.green(`Exported episode to ${outputPath}`));
      return;
    }
  }

  console.error(chalk.red(`Episode not found: ${episodeId}`));
  process.exit(1);
}
