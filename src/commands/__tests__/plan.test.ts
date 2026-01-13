import fs from "fs";
import path from "path";
import { planCommand } from "../plan";

describe("planCommand", () => {
  const tmp = path.join(__dirname, "__tmp_plan__");
  const schemaPath = path.join(tmp, "schema.json");
  const planPath = path.join(tmp, "plan.json");

  beforeAll(() => {
    fs.mkdirSync(tmp, { recursive: true });
    fs.writeFileSync(
      schemaPath,
      JSON.stringify({
        $id: "test.schema",
        type: "object",
        properties: { foo: { type: "string" } },
        required: ["foo"],
      })
    );
    fs.writeFileSync(planPath, JSON.stringify({ foo: "bar" }));
  });

  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("validates a plan successfully", async () => {
    await expect(
      planCommand(planPath, { schema: schemaPath, exitOnComplete: false })
    ).resolves.not.toThrow();
  });
});
