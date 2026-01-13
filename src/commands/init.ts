/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import chalk from "chalk";

export async function initCommand(projectName: string = ".") {
  const targetDir = path.resolve(process.cwd(), projectName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const configsDir = path.join(targetDir, "configs");
  const episodesDir = path.join(targetDir, "episodes");
  const plansDir = path.join(targetDir, "plans");

  fs.mkdirSync(configsDir, { recursive: true });
  fs.mkdirSync(episodesDir, { recursive: true });
  fs.mkdirSync(plansDir, { recursive: true });

  const profilePath = path.join(configsDir, "instruction_profile.default.json");
  if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(
      profilePath,
      JSON.stringify(
        {
          roles: ["admin", "user", "service"],
          rules: [],
          caps: {
            max_timeout_ms: 10000,
            max_data_size: 102400,
            max_steps: 20,
          },
        },
        null,
        2
      )
    );
  }

  const budgetPath = path.join(configsDir, "token_budget.default.json");
  if (!fs.existsSync(budgetPath)) {
    fs.writeFileSync(
      budgetPath,
      JSON.stringify(
        {
          version: "1.0",
          limits: {
            max_model_calls: 10,
            max_input_tokens: 20000,
            max_output_tokens: 20000,
          },
          policy: {
            on_budget_exceeded: "warn",
          },
        },
        null,
        2
      )
    );
  }

  const samplePlanPath = path.join(plansDir, "plan.sample.json");
  if (!fs.existsSync(samplePlanPath)) {
    fs.writeFileSync(
      samplePlanPath,
      JSON.stringify(
        {
          verb: "execute",
          subject_ref: "request/sample",
          object_ref: "execution_plan",
          payload: {
            steps: [
              {
                id: "step-1",
                verb: "noop",
                connector_id: "noop-connector",
                input: { message: "hello" },
                tool_binding: {
                  driver_kind: "noop",
                  limits: {
                    timeout_ms: 1000,
                    max_data_size: 10240,
                  },
                },
              },
            ],
          },
        },
        null,
        2
      )
    );
  }

  console.log(chalk.green(`MOVA project initialized at ${targetDir}`));
}
