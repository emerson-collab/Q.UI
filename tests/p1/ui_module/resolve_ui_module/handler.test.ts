import assert from "node:assert/strict";
import test from "node:test";
import { StableRuntimeError } from "../../../../src/p0/runtime_contract.ts";
import { handler, SEMANTIC_MODEL_VERSION } from "../../../../src/p1/ui_module/resolve_ui_module/handler.ts";

function projectionInput() {
  const contractRef = "Q.TEST.CONTRACT.CAPABILITY.EXAMPLE@V0100";
  const requestRef = `${contractRef}#/contracts/create_request`;
  const responseRef = `${contractRef}#/contracts/create_response`;
  const stableErrorRef = `${contractRef}#/stable_errors/create_example`;
  const outcomeRef = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/outcome_contracts/call_outcome";
  const interfaceRef = `${contractRef}#/interfaces/example_create_invoke`;
  const operationRef = `${contractRef}#/operations/create_example`;
  const capabilityRef = "Q.TEST.CAPABILITY.EXAMPLE@V0100";
  return {
    source_capability_ref: capabilityRef,
    projection_ref: "Q.TEST.UI.MODULE.PROJECTION.EXAMPLE@V0100",
    projection_input: {
      source_capability_contract_ref: contractRef,
      source_capability_contract_hash: `sha256:${"2".repeat(64)}`,
      source_external_provider_surface_ref: `${contractRef}#/external_provider_surface`,
      source_external_provider_surface_hash: `sha256:${"3".repeat(64)}`,
      source_capability_semantic_projection: {
        identity: { capability_ref: capabilityRef, capability_contract_ref: contractRef },
        ownership: {},
        operations: {
          create_example: {
            operation_ref: operationRef,
            request_contract_ref: requestRef,
            response_contract_ref: responseRef,
            stable_error_contract_ref: stableErrorRef,
            outcome_contract_ref: outcomeRef,
            interface_refs: [interfaceRef],
          },
        },
        interfaces: {
          example_create_invoke: {
            interface_ref: interfaceRef,
            operation_ref: operationRef,
            request_contract_ref: requestRef,
            response_contract_ref: responseRef,
            stable_error_contract_ref: stableErrorRef,
            outcome_contract_ref: outcomeRef,
          },
        },
        contracts: {
          create_request: {
            contract_ref: requestRef,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  x_q_field_semantics: { semantic_kind: "PLAIN_VALUE" },
                },
                priority: {
                  enum: ["HIGH", "LOW"],
                  x_q_field_semantics: { semantic_kind: "PLAIN_VALUE" },
                },
                external_ref: {
                  type: "string",
                  x_q_field_semantics: {
                    semantic_kind: "BUSINESS_REFERENCE",
                    reference_owner_mode: "EXTERNAL_OPAQUE",
                    resolution_mode: "OPAQUE_MANUAL",
                    selection_cardinality: "ONE",
                    manual_entry_allowed: true,
                  },
                },
                due_at: {
                  type: "string",
                  format: "date-time",
                  x_q_field_semantics: {
                    semantic_kind: "TEMPORAL",
                    temporal_kind: "DATE_TIME",
                  },
                },
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
        dependencies: {},
        extraction: { external_provider_surface_ref: `${contractRef}#/external_provider_surface` },
        compatibility: {},
        source_integrity: {},
        persistence_requirements: {},
        capability_rules: {},
        external_provider_surface: { provider_interface_refs: [interfaceRef] },
        interface_inventory: {},
        operational_relations: { mode: "NONE", relations: [], operation_dependency_bindings: [] },
        state_model: { mode: "STATELESS", state_machines: [] },
        permission_model: {
          mode: "UNRESTRICTED",
          actor_classes: [],
          operation_permission_bindings: [{
            permission_ref: `${contractRef}#/permission_model/operation_permission_bindings/create_example`,
            operation_ref: operationRef,
            access_mode: "UNRESTRICTED",
            actor_class_refs: [],
            authorization_rule_refs: [],
            denial_stable_error_code: null,
          }],
        },
        rule_bindings: { mode: "NONE", bindings: [] },
      },
    },
  };
}

test("V0117 emits V6 closed semantic model with exact source lineage", async () => {
  const result = await handler(projectionInput());
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.semantic_model.semantic_model_version, SEMANTIC_MODEL_VERSION);
  assert.equal(artifact.semantic_model.operation_projections.length, 1);
  assert.equal(artifact.action_bindings.length, 1);
  assert.equal(artifact.logic_projection.status, "COMPLETE");
  assert.equal(artifact.logic_projection.permissions.length, 1);
  assert.deepEqual(
    artifact.action_bindings[0].request_controls.map((x: any) => [x.source_field_path[0], x.control_kind, x.required, x.field_order]),
    [
      ["name", "TEXT_INPUT", true, 0],
      ["priority", "SELECT_INPUT", true, 1],
      ["external_ref", "REFERENCE_INPUT", false, 2],
      ["due_at", "TEMPORAL_INPUT", false, 3],
    ],
  );
  assert.equal(artifact.action_bindings[0].request_controls[2].reference_binding.reference_owner_mode, "EXTERNAL_OPAQUE");
  assert.equal(artifact.action_bindings[0].request_controls[3].temporal_binding.json_schema_format, "date-time");
  assert.equal(artifact.ui_module_ref, artifact.content_hash);
  assert.match(artifact.content_hash, /^sha256:[0-9a-f]{64}$/);
  assert.equal(artifact.source_lineage.source_capability_ref, projectionInput().source_capability_ref);
});

test("V0117 preserves internal interfaces but only provider interfaces become actions", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.external_provider_surface = { provider_interface_refs: [] };
  const result = await handler(input);
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.semantic_model.operation_projections[0].interface_projections.length, 1);
  assert.equal(artifact.semantic_model.operation_projections[0].interface_projections[0].executable, false);
  assert.equal(artifact.action_bindings.length, 0);
});

test("V0117 fails closed when request field semantics are missing", async () => {
  const input: any = projectionInput();
  delete input.projection_input.source_capability_semantic_projection.contracts.create_request.schema.properties.name.x_q_field_semantics;
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  );
});

test("V0117 fails closed when temporal annotation conflicts with exact schema format", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.contracts.create_request.schema.properties.due_at.format = "date";
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_TEMPORAL_BINDING_INVALID",
  );
});

test("V0117 artifact hash excludes logical identity but includes projection semantics", async () => {
  const inputA: any = projectionInput();
  const a = (await handler(inputA)).ui_module_artifact as Record<string, any>;
  const inputB: any = projectionInput();
  inputB.projection_ref = "Q.TEST.UI.MODULE.PROJECTION.EXAMPLE.ALT@V0100";
  const b = (await handler(inputB)).ui_module_artifact as Record<string, any>;
  assert.notEqual(a.content_hash, b.content_hash);
  assert.equal(a.ui_module_ref, a.content_hash);
  assert.equal(b.ui_module_ref, b.content_hash);
});
