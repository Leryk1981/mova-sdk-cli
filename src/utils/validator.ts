import Ajv2020 from "ajv/dist/2020.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import draft7Meta from "ajv/dist/refs/json-schema-draft-07.json";

function loadSchemasFromDir(ajv: Ajv2020, dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".json") || f.endsWith(".schema.json"));
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const raw = fs.readFileSync(fullPath, "utf8");
    const schema = JSON.parse(raw);
    const primaryId = schema.$id || pathToFileURL(fullPath).href;
    ajv.addSchema(schema, primaryId);
    // Also register by filename to help resolve relative $ref like "ds.mova_agent_step_v1.schema.json"
    const baseId = entry;
    if (baseId !== primaryId) {
      ajv.addSchema(schema, baseId);
    }
  }
}

/**
 * Loads all JSON schemas from @leryk1981/mova-spec package.
 * Returns an initialized Ajv instance with all schemas added.
 */
export function createValidator(): Ajv2020 {
  const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: false });
  ajv.addMetaSchema(draft7Meta);

  try {
    // Resolve the location of the installed package
    const specPackagePath = require.resolve("@leryk1981/mova-spec");
    const packageDir = path.dirname(specPackagePath);
    const schemasDir = path.resolve(packageDir, "..", "schemas");
    loadSchemasFromDir(ajv, schemasDir);
  } catch {
    // Package might be unavailable in dev; continue with empty registry
  }

  // Optionally load schemas from a local directory (e.g., repo root)
  const localSchemasDir =
    process.env.MOVA_SCHEMAS_DIR || path.resolve(process.cwd(), "schemas");
  loadSchemasFromDir(ajv, localSchemasDir);

  return ajv;
}

/**
 * Validates a JSON file against a schema reference.
 * @param schemaRef schema $id or path to a schema file
 * @param jsonFilePath path to the JSON file to validate
 * @returns { valid: boolean, errors?: AjvError[] }
 */
export function validateFile(schemaRef: string, jsonFilePath: string) {
  const ajv = createValidator();

  // Resolve schema (by $id or by file path)
  let validator = ajv.getSchema(schemaRef);
  if (!validator) {
    const resolvedPath = path.resolve(schemaRef);
    if (fs.existsSync(resolvedPath) && resolvedPath.endsWith(".json")) {
      const raw = fs.readFileSync(resolvedPath, "utf8");
      const parsed = JSON.parse(raw);
      const id = parsed.$id || pathToFileURL(resolvedPath).href;
      ajv.addSchema(parsed, id);
      validator = ajv.getSchema(id);
    }
  }

  if (!validator) {
    throw new Error(`Schema not found: ${schemaRef}`);
  }

  const dataRaw = fs.readFileSync(jsonFilePath, "utf8");
  const data = JSON.parse(dataRaw);
  const valid = validator(data);

  return { valid, errors: validator.errors ?? [] };
}
