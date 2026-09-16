import assert from "node:assert/strict";
import test from "node:test";

import * as entryModule from "../../../../src/p1/export/ui_theme/entry.ts";

test("UI_THEME public entry is the exact static extraction and does not export the handler", () => {
  assert.equal(
    entryModule.CAPABILITY_CONTRACT_REF,
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109",
  );
  assert.equal(
    entryModule.CAPABILITY_CONTRACT_HASH,
    "sha256:590e487297c89b1b91a838ac97eae4d309e80db9cc1502e7bbfba55f5560536f",
  );
  assert.deepEqual(entryModule.entry.interface_refs, [
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke",
  ]);
  assert.equal("handler" in entryModule, false);
  assert.equal("resolve_ui_theme" in entryModule, false);
  assert.equal(
    entryModule.capability_extraction_metadata.external_provider_surface_hash,
    null,
  );
  assert.equal(
    entryModule.capability_extraction_metadata
      .external_provider_surface_hash_resolution,
    "EXTERNAL_SURFACE_AND_CLOSURE_BINDING_AFTER_IMMUTABLE_SOURCE_FINALIZATION",
  );
});
