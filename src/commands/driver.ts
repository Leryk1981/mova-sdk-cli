/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import chalk from "chalk";

function resolveDriversPaths() {
  const driversDir = path.resolve(process.cwd(), "src", "drivers");
  const indexPath = path.join(driversDir, "index.ts");
  return { driversDir, indexPath };
}

function ensureIndex() {
  const { driversDir, indexPath } = resolveDriversPaths();
  if (!fs.existsSync(driversDir)) {
    fs.mkdirSync(driversDir, { recursive: true });
  }
  if (!fs.existsSync(indexPath)) {
    const content = `const registry: Record<string, any> = {};\n\nexport function registerDriver(name: string, factory: () => any) {\n  registry[name] = factory;\n}\n\nexport function getDriver(name: string) {\n  if (!registry[name]) {\n    throw new Error(\`Driver not found: \${name}\`);\n  }\n  return registry[name]();\n}\n\nexport function listDrivers(): string[] {\n  return Object.keys(registry);\n}\n`;
    fs.writeFileSync(indexPath, content);
  }
}

export function driverAdd(name: string) {
  ensureIndex();
  const { driversDir, indexPath } = resolveDriversPaths();
  const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Driver`;
  const targetFile = path.join(driversDir, `${name}.ts`);
  if (fs.existsSync(targetFile)) {
    console.error(chalk.red(`Driver already exists: ${targetFile}`));
    process.exit(1);
  }

  const driverContent = `export class ${className} {\n  async execute(input: any): Promise<any> {\n    // TODO: implement driver logic\n    return { ok: true, input };\n  }\n}\n\nexport function ${name}Factory() {\n  return new ${className}();\n}\n`;
  fs.writeFileSync(targetFile, driverContent);

  let indexContent = fs.readFileSync(indexPath, "utf8");
  const registerSnippet = `registerDriver("${name}", ${name}Factory);\n`;
  if (!indexContent.includes(registerSnippet)) {
    if (!indexContent.includes("registerDriver")) {
      indexContent += "\n" + registerSnippet;
    } else {
      indexContent += registerSnippet;
    }
    if (!indexContent.includes(`import { ${name}Factory } from "./${name}";`)) {
      indexContent =
        `import { ${name}Factory } from "./${name}";\n` + indexContent;
    }
    fs.writeFileSync(indexPath, indexContent);
  }

  console.log(chalk.green(`Driver created: ${targetFile}`));
}
