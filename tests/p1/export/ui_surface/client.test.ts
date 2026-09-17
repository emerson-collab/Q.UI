import test from "node:test";
import assert from "node:assert/strict";
import { create_client } from "../../../../src/p1/export/ui_surface/client.ts";

test("ui_surface client invokes the exact frozen public Operation ref without importing a Handler", async () => {
  const calls: Array<{operation_ref:string; input:unknown}> = [];
  const client = create_client({ async invoke(operation_ref, input) { calls.push({ operation_ref, input }); return { ui_surface_artifact:{} }; } });
  await client.create_ui_surface({ ui_surface_ref:"Q.UI.SURFACE@V0100", surface_input:{} as never });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.operation_ref, "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0114#/operations/create_ui_surface");
});
