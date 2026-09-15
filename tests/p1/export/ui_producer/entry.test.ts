import test from "node:test";
import assert from "node:assert/strict";
import { resolve_business_operation } from "../../../../src/p1/business_runtime/business_operation_registry.ts";
import { entry, stage_extension } from "../../../../src/p1/export/ui_producer/entry.ts";

test("ui_producer extraction entry registers exactly the Contract Operations on the fixed P1/P0 skeleton", () => {
  assert.equal(entry.capability_ref, "Q.UI.CAPABILITY.UI_PRODUCER@V0107");
  assert.equal(entry.capability_contract_ref, "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107");
  assert.equal(stage_extension.stage_contract_ref, "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179");
  assert.deepEqual(stage_extension.consumed_interface_refs, [
    "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134#/interfaces/runtime_execution_invoke",
  ]);
  assert.deepEqual(stage_extension.provided_interface_refs, [
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_app_invoke",
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_platform_invoke",
  ]);
  assert.equal(typeof resolve_business_operation("Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app"), "function");
  assert.equal(typeof resolve_business_operation("Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform"), "function");
  assert.equal("handler" in entry, false);
});
