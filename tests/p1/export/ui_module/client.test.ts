import test from "node:test";
import assert from "node:assert/strict";
import { create_client } from "../../../../src/p1/export/ui_module/client.ts";

test("ui_module client invokes the exact frozen V0117 public Operation ref without importing a Handler", async () => {
  const calls: Array<{ operation_ref: string; input: unknown }> = [];
  const client = create_client({
    async invoke(operation_ref, input) {
      calls.push({ operation_ref, input });
      return {
        outcome_type: "stable_error",
        stable_error: { case: "test" },
        evidence_ref: "sha256:" + "0".repeat(64),
        trace_id: "t",
        request_id: "r",
      };
    },
  });
  await client.resolve_ui_module({
    source_capability_ref: "Q.EXAMPLE.CAPABILITY.PAGE@V0100",
    projection_ref: "Q.UI.MODULE@V0100",
    projection_input: {
      source_capability_contract_ref: "Q.EXAMPLE.CONTRACT.CAPABILITY.PAGE@V0100",
      source_capability_contract_hash: "sha256:" + "1".repeat(64),
      source_external_provider_surface_ref: "Q.EXAMPLE.CONTRACT.CAPABILITY.PAGE@V0100#/external_provider_surface",
      source_external_provider_surface_hash: "sha256:" + "2".repeat(64),
      source_capability_semantic_projection: {},
    },
    trace_id: "t",
    request_id: "r",
  });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.operation_ref,
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0117#/operations/resolve_ui_module",
  );
});
