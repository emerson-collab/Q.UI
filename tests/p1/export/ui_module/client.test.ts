import test from "node:test";
import assert from "node:assert/strict";
import { create_client } from "../../../../src/p1/export/ui_module/client.ts";

test("ui_module client invokes the exact frozen V0123 public Operation ref with owner-local business payload only", async () => {
  const calls: Array<{ operation_ref: string; input: unknown }> = [];
  const client = create_client({
    async invoke(operation_ref, input) {
      calls.push({ operation_ref, input });
      return { ui_module_artifact: {} };
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
  });

  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.operation_ref,
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0123#/operations/resolve_ui_module",
  );
  assert.deepEqual(Object.keys(calls[0]?.input as Record<string, unknown>).sort(), [
    "projection_input",
    "projection_ref",
    "source_capability_ref",
  ]);
});
