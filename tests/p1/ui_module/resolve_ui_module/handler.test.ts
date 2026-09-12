import assert from "node:assert/strict";
import test from "node:test";
import { StableRuntimeError } from "../../../../src/p0/runtime_contract.ts";
import { handler } from "../../../../src/p1/ui_module/resolve_ui_module/handler.ts";

function projectionInput() {
  const contractRef = "Q.TEST.CONTRACT.CAPABILITY.EXAMPLE@V0100";
  const requestRef = `${contractRef}#/contracts/create_request`;
  const responseRef = `${contractRef}#/contracts/create_response`;
  const interfaceRef = `${contractRef}#/interfaces/example_create_invoke`;
  const operationRef = `${contractRef}#/operations/create_example`;
  return {
    source_capability_ref: "Q.TEST.CAPABILITY.EXAMPLE@V0100",
    projection_ref: "Q.TEST.UI.MODULE.EXAMPLE@V0100",
    projection_input: {
      source_capability_contract_ref: contractRef,
      source_capability_contract_hash: `sha256:${"2".repeat(64)}`,
      source_external_provider_surface_ref: `${contractRef}#/external_provider_surface`,
      source_external_provider_surface_hash: `sha256:${"3".repeat(64)}`,
      source_capability_semantic_projection: {
        operations: {
          create_example: {
            operation_ref: operationRef,
            request_contract_ref: requestRef,
            response_contract_ref: responseRef,
          },
        },
        interfaces: {
          example_create_invoke: {
            interface_ref: interfaceRef,
            operation_ref: operationRef,
          },
        },
        contracts: {
          create_request: {
            contract_ref: requestRef,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                priority: { enum: ["HIGH", "LOW"] },
                count: { type: ["integer", "null"] },
              },
              required: ["name", "priority"],
            },
          },
          create_response: {
            contract_ref: responseRef,
            schema: {
              type: "object",
              properties: {
                example_ref: { type: "string" },
                revision: { type: "integer" },
              },
              required: ["example_ref", "revision"],
            },
          },
        },
        type_closure: {},
        stable_errors: {},
        interface_inventory: {},
        external_provider_surface: { provider_interface_refs: [interfaceRef] },
        state_model: { allowed_business_states: ["DRAFT", "ACTIVE"] },
      },
    },
  };
}

test("UI Module V0111 deterministically projects exact external provider interfaces", async () => {
  const result = await handler(projectionInput());
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.semantic_model.version, "Q_UI_MODULE_SEMANTIC_MODEL_V2");
  assert.equal(artifact.action_bindings.length, 1);
  assert.deepEqual(
    artifact.action_bindings[0].controls.map((x: any) => [x.field_name, x.control_kind, x.required]),
    [["name", "TEXT_INPUT", true], ["priority", "SELECT_INPUT", true], ["count", "NUMBER_INPUT", false]],
  );
  assert.match(artifact.content_hash, /^sha256:[0-9a-f]{64}$/);
});

test("UI Module V0111 does not expose interfaces absent from exact External Provider Surface", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.external_provider_surface = { provider_interface_refs: [] };
  const result = await handler(input);
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.action_bindings.length, 0);
});

test("UI Module V0111 fails closed for ambiguous payload schema", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.contracts.create_request.schema.properties.name = {};
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
  );
});
