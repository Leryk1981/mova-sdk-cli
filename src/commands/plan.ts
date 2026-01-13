/* eslint-disable no-console */
import { validateFile } from "../utils/validator";
import chalk from "chalk";

type PlanOptions = { schema: string; exitOnComplete?: boolean };

/**
 * Validate a MOVA plan JSON file against a given schema.
 * Usage: mova plan -slt;schemaIdOrPath> <planFile>
 */
export async function planCommand(planFile: string, options: PlanOptions): Promise<void> {
  const exitOnComplete = options.exitOnComplete !== false;
  try {
    const result = validateFile(options.schema, planFile);
    if (result.valid) {
      console.log(chalk.green(`PASS ${planFile}`));
    } else {
      console.log(chalk.red(`FAIL ${planFile}`));
      result.errors.forEach((err: any) => {
        const loc = err.instancePath || "/";
        console.log(`  ${loc}: ${err.message}`);
      });
    }
    if (exitOnComplete) {
      process.exit(result.valid ? 0 : 2);
    }
    if (!result.valid) {
      throw new Error("Plan validation failed");
    }
    return;
  } catch (e: any) {
    console.error(chalk.red(`Error: ${e.message}`));
    if (exitOnComplete) {
      process.exit(1);
    }
    throw e;
  }
}
