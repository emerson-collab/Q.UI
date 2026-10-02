import test from "node:test";
import assert from "node:assert/strict";
import { createUiModuleClient } from "../../../../src/p1/export/ui_module/client.ts";
import { capability_extraction_metadata } from "../../../../src/p1/export/ui_module/metadata.ts";

test("PUBLIC_EXPORT_ENTRY_METADATA_CLOSURE", async () => {
  assert.equal(capability_extraction_metadata.capability_contract_ref, "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126");
  assert.deepEqual(capability_extraction_metadata.public_operation_refs, [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/operations/resolve_ui_module",
  ]);
  assert.deepEqual(capability_extraction_metadata.public_interface_refs, [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/interfaces/ui_module_resolution_invoke",
  ]);
  assert.equal(capability_extraction_metadata.stable_error_refs.length, 1);

  const client = createUiModuleClient(async () => ({
    outcome_type: "stable_error",
    stable_error: {
      code: "UI_MODULE_OUTPUT_GRAMMAR_INVALID",
      message: "sentinel",
    },
  }));
  const outcome = await client.resolve_ui_module({} as never);
  assert.equal(outcome.outcome_type, "stable_error");
});
