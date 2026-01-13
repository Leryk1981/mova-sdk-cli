import Ajv2020 from "ajv/dist/2020.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Loads all JSON schemas from @leryk1981/mova-spec package.
 * Returns an initialized Ajv instance with all schemas added.
 */
export function createValidator(): Ajv2020 {
  const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: false });

  try {
    // Resolve the location of the installed package
    const specPackagePath = require.resolve("@leryk1981/mova-spec");
    const packageDir = path.dirname(specPackagePath);
    const schemasDir = path.resolve(packageDir, "..", "schemas");

    const entries = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json"));
    for (const entry of entries) {
      const fullPath = path.join(schemasDir, entry);
      const raw = fs.readFileSync(fullPath, "utf8");
      const schema = JSON.parse(raw);
      ajv.addSchema(schema, schema.$id || pathToFileURL(fullPath).href);
    }
  } catch {
    // Package might be unavailable in dev; continue with empty registry
  }

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
