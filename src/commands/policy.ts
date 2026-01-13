/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import chalk from "chalk";

type PolicyAction = "allow" | "deny";

function getProfilePath() {
  return path.resolve(process.cwd(), "configs", "instruction_profile.default.json");
}

function readProfile(): any {
  const profilePath = getProfilePath();
  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(path.dirname(profilePath), { recursive: true });
    const initial = { rules: [], roles: ["admin", "user", "service"] };
    fs.writeFileSync(profilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(profilePath, "utf8");
  return JSON.parse(raw || "{}");
}

function writeProfile(profile: any) {
  const profilePath = getProfilePath();
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
}

export async function policyShow() {
  const profile = readProfile();
  console.log(JSON.stringify(profile, null, 2));
}

export async function policySet(options: {
  role: string;
  verb: string;
  allow?: boolean;
  deny?: boolean;
}) {
  if (!options.role || !options.verb) {
    console.error(chalk.red("Role and verb are required"));
    process.exit(1);
  }
  const action: PolicyAction = options.allow ? "allow" : options.deny ? "deny" : "allow";

  const profile = readProfile();
  profile.rules = profile.rules || [];

  const existingIdx = profile.rules.findIndex(
    (r: any) => r.role === options.role && r.verb === options.verb
  );
  const rule = { role: options.role, verb: options.verb, action };
  if (existingIdx >= 0) {
    profile.rules[existingIdx] = rule;
  } else {
    profile.rules.push(rule);
  }

  writeProfile(profile);
  console.log(chalk.green(`Policy updated: ${options.role} ${options.verb} -> ${action}`));
}
