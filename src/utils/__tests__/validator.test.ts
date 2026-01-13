import { validateFile } from "../validator";
import fs from "fs";
import path from "path";

describe("validator", () => {
  it("validates using a custom schema file", () => {
    const tmp = path.join(__dirname, "__tmp_schema__");
    const schemaPath = path.join(tmp, "schema.json");
    const dataPath = path.join(tmp, "data.json");
    fs.mkdirSync(tmp, { recursive: true });
    fs.writeFileSync(
      schemaPath,
      JSON.stringify({
        $id: "custom.schema",
        type: "object",
        properties: { a: { type: "number" } },
        required: ["a"],
      })
    );
    fs.writeFileSync(dataPath, JSON.stringify({ a: 1 }));
    const result = validateFile(schemaPath, dataPath);
    expect(result.valid).toBe(true);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
