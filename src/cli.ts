#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init";
import { planCommand } from "./commands/plan";
import { runCommand } from "./commands/run";
import { driverAdd } from "./commands/driver";
import { policySet, policyShow } from "./commands/policy";
import { episodeExport, episodeList } from "./commands/episode";

const program = new Command();

program
  .name("mova")
  .description("MOVA SDK CLI – scaffolding, validation and execution of MOVA plans")
  .version("0.1.0");

program
  .command("init")
  .description("Create a new MOVA project scaffold")
  .argument("[projectName]", "Directory name for the new project", ".")
  .action(initCommand);

program
  .command("plan")
  .description("Validate a MOVA plan against its schema")
  .requiredOption("-s, --schema <idOrFile>", "Schema $id or path to schema JSON")
  .argument("<planFile>", "Path to the plan JSON file")
  .action(planCommand);

program
  .command("run")
  .description("Execute a MOVA plan locally or via MCP gateway")
  .option("-e, --endpoint <url>", "MCP gateway URL (if omitted runs locally)")
  .argument("<planFile>", "Path to the plan JSON file")
  .action(runCommand);

program
  .command("driver:add")
  .description("Generate a driver skeleton and register it")
  .argument("<name>", "Driver name")
  .action(driverAdd);

program
  .command("policy:set")
  .description("Set policy rule for role/verb")
  .requiredOption("--role <role>", "Role")
  .requiredOption("--verb <verb>", "Verb/connector id")
  .option("--allow", "Allow action")
  .option("--deny", "Deny action")
  .action(policySet);

program.command("policy:show").description("Show current policy profile").action(policyShow);

program
  .command("episode:list")
  .description("List episodes from episodes directory")
  .option("--verb <verb>", "Filter by verb/episode_type")
  .option("--tool <tool>", "Filter by tool/connector")
  .action(episodeList);

program
  .command("episode:export")
  .description("Export an episode by id")
  .argument("<episodeId>", "Episode id")
  .option("--format <format>", "json|csv", "json")
  .option("--output <path>", "Output path")
  .action(episodeExport);

program.parse(process.argv);
