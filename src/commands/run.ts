/* eslint-disable no-console */
import { spawn } from "child_process";
import path from "path";
import chalk from "chalk";
import fs from "fs";

type RunOptions = { endpoint?: string; exitOnComplete?: boolean };

/**
 * Execute a MOVA plan.
 * - If endpoint is provided, POST the plan to the MCP gateway.
 * - Otherwise run the local mova-agent script.
 */
export async function runCommand(
  planFile: string,
  options: RunOptions
): Promise<void> {
  const exitOnComplete = options.exitOnComplete !== false;
  const absolutePlan = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(absolutePlan)) {
    console.error(chalk.red(`Plan file not found: ${absolutePlan}`));
    if (exitOnComplete) {
      process.exit(1);
    }
    throw new Error("Plan file not found");
  }

  if (options.endpoint) {
    // Send via HTTP to MCP gateway
    const fetch = (await import("node-fetch")).default;
    try {
      const planRaw = fs.readFileSync(absolutePlan, "utf8");
      const planData: unknown = JSON.parse(planRaw);
      const resp = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planData }),
      });
      const payload = await resp.json();
      if (resp.ok) {
        console.log(chalk.green(`✅ Executed via MCP gateway`));
        console.log(JSON.stringify(payload, null, 2));
        if (exitOnComplete) {
          process.exit(0);
        }
        return;
      } else {
        console.error(chalk.red(`❌ MCP error ${resp.status}`));
        console.error(JSON.stringify(payload, null, 2));
        if (exitOnComplete) {
          process.exit(1);
        }
        throw new Error(`MCP error ${resp.status}`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error(chalk.red(`Network error: ${message}`));
      if (exitOnComplete) {
        process.exit(1);
      }
      throw e instanceof Error ? e : new Error(message);
    }
  } else {
    // Run locally using the existing mova-agent script
    const agentPath = path.resolve(
      process.cwd(),
      "tools",
      "mova-agent.ts"
    );
    const child = spawn("npx", ["ts-node", agentPath, "--plan", absolutePlan], {
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code) => {
        if (exitOnComplete) {
          process.exit(code ?? 0);
        } else if (code && code !== 0) {
          reject(new Error(`Agent exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }
}
