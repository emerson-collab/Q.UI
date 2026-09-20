import test from "node:test";
import assert from "node:assert/strict";
import { entry, stage_extension } from "../../../../src/p1/export/ui_module/entry.ts";
import { P1_CONTRACT_REF } from "../../../../src/p1/business_runtime/stage_extension_contract.ts";

test("ui_module V0120 extraction entry preserves exact Capability identity and uses the repository-owned fixed P1 stage extension", () => {
  assert.equal(entry.capability_ref, "Q.UI.CAPABILITY.UI_MODULE@V0120");
  assert.equal(entry.capability_contract_ref, "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120");
  assert.equal(stage_extension.stage_contract_ref, P1_CONTRACT_REF);
  assert.deepEqual(stage_extension.consumed_interface_refs, [
    "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134#/interfaces/runtime_execution_invoke",
  ]);
  assert.equal("handler" in entry, false);
});
