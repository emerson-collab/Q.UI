import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "../../../../src/p1/export/ui_theme/client.ts";

test("client invokes only declared interfaces", async () => {
  const seen: string[] = [];
  const client = createClient(async (ref) => { seen.push(ref); return {}; });
  for (const fn of Object.values(client)) await fn({});
  assert.deepEqual(seen.sort(), ["Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke"]);
});
