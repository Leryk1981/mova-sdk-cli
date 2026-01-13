/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import chalk from "chalk";

type PolicyAction = "allow" | "deny";
type PolicyRule = { role: string; verb: string; action: PolicyAction };
type PolicyProfile = { rules: PolicyRule[]; roles: string[] };

function getProfilePath() {
  return path.resolve(process.cwd(), "configs", "instruction_profile.default.json");
}

function normalizeProfile(data: unknown): PolicyProfile {
  if (data && typeof data === "object") {
    const record = data as { rules?: unknown; roles?: unknown };
    const rules = Array.isArray(record.rules)
      ? record.rules.filter((rule): rule is PolicyRule => {
          if (!rule || typeof rule !== "object") {
            return false;
          }
          const candidate = rule as PolicyRule;
          return (
            typeof candidate.role === "string" &&
            typeof candidate.verb === "string" &&
            (candidate.action === "allow" || candidate.action === "deny")
          );
        })
      : [];
    const roles = Array.isArray(record.roles)
      ? record.roles.filter((role): role is string => typeof role === "string")
      : [];
    return { rules, roles };
  }
  return { rules: [], roles: [] };
}

function readProfile(): PolicyProfile {
  const profilePath = getProfilePath();
  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(path.dirname(profilePath), { recursive: true });
    const initial: PolicyProfile = { rules: [], roles: ["admin", "user", "service"] };
    fs.writeFileSync(profilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(profilePath, "utf8");
  return normalizeProfile(raw ? JSON.parse(raw) : {});
}

function writeProfile(profile: PolicyProfile) {
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
    (rule) => rule.role === options.role && rule.verb === options.verb
  );
  const rule: PolicyRule = { role: options.role, verb: options.verb, action };
  if (existingIdx >= 0) {
    profile.rules[existingIdx] = rule;
  } else {
    profile.rules.push(rule);
  }

  writeProfile(profile);
  console.log(chalk.green(`Policy updated: ${options.role} ${options.verb} -> ${action}`));
}
