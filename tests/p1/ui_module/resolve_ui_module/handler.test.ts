import test from "node:test";
import assert from "node:assert/strict";
import { handler, OPERATION_REF } from "../../../../src/p1/ui_module/resolve_ui_module/handler.ts";
import { registered_business_operation_refs } from "../../../../src/p1/business_runtime/business_operation_registry.ts";

test("resolve_ui_module materializes the closed module artifact", async () => {
  const result = await handler({
    source_capability_ref: "Q.EXAMPLE.CAPABILITY.PAGE@V0100",
    projection_ref: "Q.UI.MODULE.PROJECTION@V0100",
    projection_input: { semantic_model: { regions: ["main"] }, action_bindings: [], state_bindings: [], evidence_views: [] },
    trace_id: "trace-1", request_id: "request-1",
  });
  assert.equal(result.outcome_type, "response");
  if (result.outcome_type !== "response") return;
  assert.equal(result.ui_module_artifact.ui_module_ref, "Q.UI.MODULE.PROJECTION@V0100");
  assert.match(result.ui_module_artifact.content_hash, /^sha256:[0-9a-f]{64}$/);
  assert.ok(registered_business_operation_refs().includes(OPERATION_REF));
});

test("resolve_ui_module fails closed on invalid framework input", async () => {
  const result = await handler({
    source_capability_ref: "Q.EXAMPLE.CAPABILITY.PAGE@V0100",
    projection_ref: "Q.UI.MODULE.PROJECTION@V0100",
    projection_input: { semantic_model: {} },
    trace_id: "trace-2", request_id: "request-2",
  });
  assert.equal(result.outcome_type, "stable_error");
  if (result.outcome_type !== "stable_error") return;
  assert.equal(result.stable_error.case, "framework input invalid");
});
