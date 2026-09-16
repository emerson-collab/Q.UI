import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  create_ui_theme_client,
} from "../../../../src/p1/export/ui_theme/client.ts";
import type {
  ResolveUIThemeRequest,
} from "../../../../src/p1/export/ui_theme/types.ts";

function request(): ResolveUIThemeRequest {
  const presentation_rules = { density: "compact" };
  const theme_ref = "q.ui.theme.sample@V0109";
  const theme_version = "V0109";
  const canonical =
    `{"presentation_rules":{"density":"compact"},"theme_ref":"${theme_ref}","theme_version":"${theme_version}"}`;
  const content_hash =
    `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;

  return {
    theme_selector: {
      theme_material: {
        theme_ref,
        theme_version,
        presentation_rules,
        content_hash,
      },
    },
  };
}

test("UI_THEME client invokes only the exact declared External Provider Interface", async () => {
  const seen: Array<{ interface_ref: string; input: ResolveUIThemeRequest }> = [];
  const client = create_ui_theme_client(async (interface_ref, input) => {
    seen.push({ interface_ref, input });
    return { marker: "transport-owned-outcome" } as const;
  });

  const input = request();
  const result = await client.resolve_ui_theme(input);

  assert.deepEqual(result, { marker: "transport-owned-outcome" });
  assert.deepEqual(seen, [{
    interface_ref:
      "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke",
    input,
  }]);
});
