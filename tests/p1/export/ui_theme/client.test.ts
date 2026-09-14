import test from "node:test";
import assert from "node:assert/strict";
import { create_client } from "../../../../src/p1/export/ui_theme/client.ts";

test("ui_theme client invokes only the exact public Operation ref and does not import the Handler", async () => {
  const calls: Array<{ operation_ref: string; input: unknown }> = [];
  const client = create_client({
    async invoke(operation_ref, input) {
      calls.push({ operation_ref, input });
      return { outcome_type: "stable_error" };
    },
  });
  const input = {
    theme_selector: {
      theme_ref: "Q.UI.THEME.CORE@V0100",
      theme_version: "V0100",
      presentation_rules: {},
      content_hash: `sha256:${"a".repeat(64)}`,
    },
  };
  await client.resolve_ui_theme(input);
  assert.deepEqual(calls, [{
    operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/operations/resolve_ui_theme",
    input,
  }]);
});
