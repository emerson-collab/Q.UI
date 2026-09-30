import assert from "node:assert/strict";
import test from "node:test";
import { StableRuntimeError } from "../../../../src/p0/runtime_contract.ts";
import { handler, SEMANTIC_MODEL_VERSION } from "../../../../src/p1/ui_module/resolve_ui_module/handler.ts";

function projectionInput() {
  const contractRef = "Q.TEST.CONTRACT.CAPABILITY.EXAMPLE@V0100";
  const requestRef = `${contractRef}#/contracts/create_request`;
  const responseRef = `${contractRef}#/contracts/create_response`;
  const stableErrorRef = `${contractRef}#/stable_errors/create_example`;
  const outcomeRef = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0183#/outcome_contracts/call_outcome";
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
            payload_boundary: "input",
            input_schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  x_q_field_semantics: { semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" },
                },
                priority: {
                  enum: ["HIGH", "LOW"],
                  x_q_field_semantics: { semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" },
                },
                external_ref: {
                  type: "string",
                  x_q_field_semantics: {
                    semantic_kind: "BUSINESS_REFERENCE",
                    variability_class: "GENERAL",
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
                    variability_class: "GENERAL",
                    temporal_kind: "DATE_TIME",
                  },
                },
              },
              required: ["name", "priority"],
            },
          },
          create_response: {
            contract_ref: responseRef,
            payload_boundary: "runtime_result",
            runtime_result_schema: {
              type: "object",
              properties: {
                example_ref: { type: "string" },
                revision: { type: "integer" },
              },
              required: ["example_ref", "revision"],
            },
          },
        },
        type_closure: { schemas: {} },
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

function selfReferenceInput() {
  const input: any = projectionInput();
  const source = input.projection_input.source_capability_semantic_projection;
  const contractRef = input.projection_input.source_capability_contract_ref;
  const outcomeRef = source.operations.create_example.outcome_contract_ref;
  const stableErrorRef = source.operations.create_example.stable_error_contract_ref;
  const readOperationRef = `${contractRef}#/operations/read_example`;
  const readInterfaceRef = `${contractRef}#/interfaces/example_read_invoke`;
  const readRequestRef = `${contractRef}#/contracts/read_example_request`;
  const readResponseRef = `${contractRef}#/contracts/read_example_response`;
  const referenceSemantics = {
    semantic_kind: "BUSINESS_REFERENCE",
    variability_class: "GENERAL",
    reference_owner_mode: "SELF",
    reference_owner_ref: contractRef,
    resolution_mode: "EXACT_READ",
    selection_cardinality: "ONE",
    manual_entry_allowed: false,
    identity_field_path: "example_ref",
    display_field_paths: ["name"],
    read_operation_ref: readOperationRef,
    read_interface_ref: readInterfaceRef,
    read_request_identity_field_path: "example_ref",
    read_result_object_path: "example",
  };

  source.contracts.create_request.input_schema.properties.external_ref.x_q_field_semantics = referenceSemantics;
  source.operations.read_example = {
    operation_ref: readOperationRef,
    request_contract_ref: readRequestRef,
    response_contract_ref: readResponseRef,
    stable_error_contract_ref: stableErrorRef,
    outcome_contract_ref: outcomeRef,
    interface_refs: [readInterfaceRef],
  };
  source.interfaces.example_read_invoke = {
    interface_ref: readInterfaceRef,
    operation_ref: readOperationRef,
    request_contract_ref: readRequestRef,
    response_contract_ref: readResponseRef,
    stable_error_contract_ref: stableErrorRef,
    outcome_contract_ref: outcomeRef,
  };
  source.contracts.read_example_request = {
    contract_ref: readRequestRef,
    payload_boundary: "input",
    input_schema: {
      type: "object",
      properties: {
        example_ref: {
          type: "string",
          x_q_field_semantics: referenceSemantics,
        },
      },
      required: ["example_ref"],
    },
  };
  source.contracts.read_example_response = {
    contract_ref: readResponseRef,
    payload_boundary: "runtime_result",
    runtime_result_schema: {
      type: "object",
      properties: {
        example: {
          $ref: `${contractRef}#/type_closure/schemas/example`,
        },
      },
      required: ["example"],
    },
  };
  source.type_closure.schemas.example = {
    type: "object",
    properties: {
      example_ref: { type: "string" },
      name: { type: "string" },
    },
    required: ["example_ref", "name"],
  };
  source.permission_model.operation_permission_bindings.push({
    permission_ref: `${contractRef}#/permission_model/operation_permission_bindings/read_example`,
    operation_ref: readOperationRef,
    access_mode: "UNRESTRICTED",
    actor_class_refs: [],
    authorization_rule_refs: [],
    denial_stable_error_code: null,
  });

  return input;
}

function enumerableSelfReferenceInput() {
  const input: any = selfReferenceInput();
  const source = input.projection_input.source_capability_semantic_projection;
  const contractRef = input.projection_input.source_capability_contract_ref;
  const outcomeRef = source.operations.create_example.outcome_contract_ref;
  const stableErrorRef = source.operations.create_example.stable_error_contract_ref;
  const lookupOperationRef = `${contractRef}#/operations/lookup_example`;
  const lookupInterfaceRef = `${contractRef}#/interfaces/example_lookup_invoke`;
  const lookupRequestRef = `${contractRef}#/contracts/lookup_example_request`;
  const lookupResponseRef = `${contractRef}#/contracts/lookup_example_response`;

  const semantics = source.contracts.create_request.input_schema.properties.external_ref.x_q_field_semantics;
  semantics.resolution_mode = "ENUMERABLE_LOOKUP";
  semantics.lookup_operation_ref = lookupOperationRef;
  semantics.lookup_interface_ref = lookupInterfaceRef;
  semantics.lookup_request_input_template = { filters: {} };
  semantics.lookup_result_collection_path = "items";

  source.operations.lookup_example = {
    operation_ref: lookupOperationRef,
    request_contract_ref: lookupRequestRef,
    response_contract_ref: lookupResponseRef,
    stable_error_contract_ref: stableErrorRef,
    outcome_contract_ref: outcomeRef,
    interface_refs: [lookupInterfaceRef],
  };
  source.interfaces.example_lookup_invoke = {
    interface_ref: lookupInterfaceRef,
    operation_ref: lookupOperationRef,
    request_contract_ref: lookupRequestRef,
    response_contract_ref: lookupResponseRef,
    stable_error_contract_ref: stableErrorRef,
    outcome_contract_ref: outcomeRef,
  };
  source.contracts.lookup_example_request = {
    contract_ref: lookupRequestRef,
    payload_boundary: "input",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        filters: {
          type: "object",
          additionalProperties: false,
          properties: {},
          x_q_field_semantics: { semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" },
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          x_q_field_semantics: { semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" },
        },
      },
      required: ["filters"],
    },
  };
  source.contracts.lookup_example_response = {
    contract_ref: lookupResponseRef,
    payload_boundary: "runtime_result",
    runtime_result_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { $ref: `${contractRef}#/type_closure/schemas/example` },
        },
        next_cursor: { type: "string" },
      },
      required: ["items"],
    },
  };
  source.permission_model.operation_permission_bindings.push({
    permission_ref: `${contractRef}#/permission_model/operation_permission_bindings/lookup_example`,
    operation_ref: lookupOperationRef,
    access_mode: "UNRESTRICTED",
    actor_class_refs: [],
    authorization_rule_refs: [],
    denial_stable_error_code: null,
  });

  return input;
}

test("V0123 emits V6 closed semantic model with exact source lineage", async () => {
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
  assert.deepEqual(
    artifact.action_bindings[0].request_controls.map((x: any) => [x.variability_class, x.instance_variable_ref]),
    [["GENERAL", null], ["GENERAL", null], ["GENERAL", null], ["GENERAL", null]],
  );
  assert.equal(artifact.ui_module_ref, artifact.content_hash);
  assert.match(artifact.content_hash, /^sha256:[0-9a-f]{64}$/);
  assert.equal(artifact.source_lineage.source_capability_ref, projectionInput().source_capability_ref);
});

test("V0123 preserves internal interfaces but only provider interfaces become actions", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.external_provider_surface = { provider_interface_refs: [] };
  const result = await handler(input);
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.semantic_model.operation_projections[0].interface_projections.length, 1);
  assert.equal(artifact.semantic_model.operation_projections[0].interface_projections[0].executable, false);
  assert.equal(artifact.action_bindings.length, 0);
});

test("V0123 reads current Capability Contract input_schema/runtime_result_schema carriers", async () => {
  const result = await handler(projectionInput());
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.action_bindings[0].request_controls.length, 4);
  assert.equal(artifact.action_bindings[0].response_views.length, 2);
});

test("V0123 normalizes exact single-segment source reference paths and resolves owner-local type_closure refs", async () => {
  const result = await handler(selfReferenceInput());
  const artifact = result.ui_module_artifact as Record<string, any>;
  const reference = artifact.action_bindings[0].request_controls.find((x: any) => x.source_field_path[0] === "external_ref").reference_binding;
  assert.deepEqual(reference.identity_field_path, ["example_ref"]);
  assert.deepEqual(reference.display_field_paths, [["name"]]);
  assert.deepEqual(reference.read_request_identity_field_path, ["example_ref"]);
  assert.deepEqual(reference.read_result_object_path, ["example"]);
  assert.equal(reference.source_reference_semantics.identity_field_path, "example_ref");
  assert.equal(artifact.semantic_model.operation_projections.length, 2);
});

test("V0123 validates ENUMERABLE_LOOKUP template against the exact lookup request schema", async () => {
  const result = await handler(enumerableSelfReferenceInput());
  const artifact = result.ui_module_artifact as Record<string, any>;
  const reference = artifact.action_bindings[0].request_controls.find((x: any) => x.source_field_path[0] === "external_ref").reference_binding;
  assert.equal(reference.resolution_mode, "ENUMERABLE_LOOKUP");
  assert.deepEqual(reference.lookup_result_collection_path, ["items"]);
  assert.deepEqual(reference.lookup_request_input_template, { filters: {} });
});

test("V0123 fails closed when ENUMERABLE_LOOKUP template violates the exact lookup request schema", async () => {
  const input: any = enumerableSelfReferenceInput();
  input.projection_input.source_capability_semantic_projection.contracts.create_request
    .input_schema.properties.external_ref.x_q_field_semantics.lookup_request_input_template = { limit: 10 };
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_REFERENCE_BINDING_INVALID",
  );
});

test("V0123 fails closed when SELF reference read_result_object_path is unresolved", async () => {
  const input: any = selfReferenceInput();
  input.projection_input.source_capability_semantic_projection.contracts.create_request
    .input_schema.properties.external_ref.x_q_field_semantics.read_result_object_path = "missing";
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_REFERENCE_BINDING_INVALID",
  );
});

test("V0123 fails closed when SELF reference identity schema is incompatible", async () => {
  const input: any = selfReferenceInput();
  input.projection_input.source_capability_semantic_projection.type_closure.schemas.example
    .properties.example_ref.type = "integer";
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_REFERENCE_BINDING_INVALID",
  );
});

test("V0123 fails closed when request field semantics are missing", async () => {
  const input: any = projectionInput();
  delete input.projection_input.source_capability_semantic_projection.contracts.create_request.input_schema.properties.name.x_q_field_semantics;
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  );
});

test("V0123 fails closed when temporal annotation conflicts with exact schema format", async () => {
  const input: any = projectionInput();
  input.projection_input.source_capability_semantic_projection.contracts.create_request.input_schema.properties.due_at.format = "date";
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_TEMPORAL_BINDING_INVALID",
  );
});

test("V0123 fails closed when an owner-local referenced temporal schema is classified PLAIN_VALUE", async () => {
  const input: any = projectionInput();
  const source = input.projection_input.source_capability_semantic_projection;
  const contractRef = input.projection_input.source_capability_contract_ref;
  source.type_closure.schemas.temporal_value = { type: "string", format: "date-time" };
  source.contracts.create_request.input_schema.properties.due_at = {
    $ref: `${contractRef}#/type_closure/schemas/temporal_value`,
    x_q_field_semantics: { semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" },
  };
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  );
});

test("V0123 artifact hash excludes logical identity but includes projection semantics", async () => {
  const inputA: any = projectionInput();
  const a = (await handler(inputA)).ui_module_artifact as Record<string, any>;
  const inputB: any = projectionInput();
  inputB.projection_ref = "Q.TEST.UI.MODULE.PROJECTION.EXAMPLE.ALT@V0100";
  const b = (await handler(inputB)).ui_module_artifact as Record<string, any>;
  assert.notEqual(a.content_hash, b.content_hash);
  assert.equal(a.ui_module_ref, a.content_hash);
  assert.equal(b.ui_module_ref, b.content_hash);
});


test("V0123 fails closed when request-field variability_class is missing", async () => {
  const input: any = projectionInput();
  delete input.projection_input.source_capability_semantic_projection.contracts.create_request
    .input_schema.properties.name.x_q_field_semantics.variability_class;
  await assert.rejects(
    () => handler(input),
    (error: unknown) => error instanceof StableRuntimeError && error.code === "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  );
});

test("V0123 preserves exact INSTANCE VALUE_PARAMETER lineage without resolving a value", async () => {
  const input: any = projectionInput();
  const source = input.projection_input.source_capability_semantic_projection;
  const instanceVariableRef = `${input.projection_input.source_capability_contract_ref}#/instance_variability/instance_variables/name`;
  source.contracts.create_request.input_schema.properties.name.x_q_field_semantics = {
    semantic_kind: "PLAIN_VALUE",
    variability_class: "INSTANCE",
    instance_variable_ref: instanceVariableRef,
  };
  source.instance_variability = {
    mode: "DECLARED",
    instance_variables: [{
      instance_variable_ref: instanceVariableRef,
      kind: "VALUE_PARAMETER",
    }],
  };

  const result = await handler(input);
  const artifact = result.ui_module_artifact as Record<string, any>;
  const control = artifact.action_bindings[0].request_controls[0];
  assert.equal(control.variability_class, "INSTANCE");
  assert.equal(control.instance_variable_ref, instanceVariableRef);
  assert.deepEqual(artifact.source_semantic_snapshot.instance_variability, source.instance_variability);
});

test("V0123 preserves non-request policy/provider/port variability only in source snapshot", async () => {
  const input: any = projectionInput();
  const source = input.projection_input.source_capability_semantic_projection;
  source.instance_variability = {
    mode: "DECLARED",
    instance_variables: [
      { instance_variable_ref: "Q.TEST.INSTANCE.VAR.POLICY", kind: "POLICY_SELECTION" },
      { instance_variable_ref: "Q.TEST.INSTANCE.VAR.PROVIDER", kind: "PROVIDER_SELECTION" },
      { instance_variable_ref: "Q.TEST.INSTANCE.VAR.PORT", kind: "PORT_BINDING" },
    ],
  };

  const result = await handler(input);
  const artifact = result.ui_module_artifact as Record<string, any>;
  assert.equal(artifact.action_bindings[0].request_controls.length, 4);
  assert.deepEqual(artifact.source_semantic_snapshot.instance_variability, source.instance_variability);
});
