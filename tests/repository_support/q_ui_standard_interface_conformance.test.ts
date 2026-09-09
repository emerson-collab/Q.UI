import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { public_contracts as uiModule } from "../../src/p1/export/ui_module/contracts.ts";
import { public_contracts as uiSurface } from "../../src/p1/export/ui_surface/contracts.ts";
import { public_contracts as uiRender } from "../../src/p1/export/ui_render/contracts.ts";
import { public_contracts as uiHost } from "../../src/p1/export/ui_host/contracts.ts";

type InterfaceDefinition = Readonly<{
  surface: string;
  surface_code: string;
  kind: string;
  kind_code: string;
  interface_action: string;
  method_ref: string;
  path: readonly string[];
  static_mount: readonly string[];
  dynamic_mount: readonly string[];
  request_contract_ref: string;
  response_contract_ref: string;
  stable_error_contract_ref: string;
  outcome_contract_ref: string;
  operation_ref: string;
  interface_ref: string;
}>;

type InterfaceProjection = Readonly<{
  capability_contract_hash: string;
  capability_contract_ref: string;
  interfaces: Readonly<Record<string, InterfaceDefinition>>;
}>;

const PATH_FIELDS = new Set([
  "route_key", "capability_id", "operation_id", "trace_id", "request_id", "local_route_key",
  "parent_request_id", "call_path", "call_depth", "local_dependency_id", "hook_point_value",
  "consumer_id", "object_ref", "resolution_key", "lookup_query", "repository_ref", "commit_sha",
  "gate_version", "gate_class", "profile", "subject_ref", "subject_type", "result_ref",
]);

const STATIC_MOUNT_FIELDS = new Set([
  "manifest", "surface", "qreg", "qconfig", "operation_contract", "policy_refs", "hook_binding_refs",
  "target_operation_contract", "cycle_rule", "depth_rule", "dependency_contract_ref", "dependency_client_ref",
  "dependency_binding_ref", "p0_runtime_hook_bind_ref", "consumer_contract", "order", "enabled_rule",
  "p0_runtime_hook_evaluate_ref", "object_contract", "registry_rule", "authority_lock_ref",
  "authority_registry_ref", "profile_contract_ref", "result_contract_ref", "receipt_contract_ref",
  "canonicalization_contract_ref",
]);

const DYNAMIC_MOUNT_FIELDS = new Set([
  "input", "runtime_context", "validated_context", "operation_attempt", "outcome_type", "runtime_result",
  "stable_error", "execution_receipt", "rule_evidence", "child_request_id", "child_call_path", "child_call_depth",
  "context", "provider_resolution", "dependency_request", "mapped_outcome_type", "mapped_runtime_result",
  "mapped_stable_error", "binding_validation", "binding_receipt", "hook_envelope", "hook_decision",
  "hook_evidence", "evidence_ref", "registration_receipt", "exact_resolution", "lookup_result",
  "authority_lock_hash", "freeze_manifest_ref", "freeze_manifest_hash", "protected_set_hash",
  "approved_baseline_ref", "evidence_refs",
]);

async function projection(capabilityId: string): Promise<InterfaceProjection> {
  const url = new URL(`../../spec/p1/${capabilityId}/capability_interfaces.json`, import.meta.url);
  return JSON.parse(await readFile(url, "utf8")) as InterfaceProjection;
}

function assertLayer(fields: readonly string[], allowed: ReadonlySet<string>, label: string): void {
  for (const field of fields) assert.ok(allowed.has(field), `${label}: undeclared standard field ${field}`);
}

function assertStandardCallInterface(definition: InterfaceDefinition, capabilityContractRef: string): void {
  assert.equal(definition.surface, "CALL");
  assert.equal(definition.surface_code, "CALL");
  assert.equal(definition.kind, "CALL_INVOKE");
  assert.equal(definition.kind_code, "M1");
  assert.equal(definition.interface_action, "invoke");
  assert.deepEqual(definition.path, ["request_id", "trace_id"]);
  assert.deepEqual(definition.static_mount, ["operation_contract"]);
  assert.deepEqual(definition.dynamic_mount, ["input", "runtime_context", "outcome_type", "runtime_result", "stable_error", "evidence_ref"]);
  assertLayer(definition.path, PATH_FIELDS, "PATH");
  assertLayer(definition.static_mount, STATIC_MOUNT_FIELDS, "STATIC_MOUNT");
  assertLayer(definition.dynamic_mount, DYNAMIC_MOUNT_FIELDS, "DYNAMIC_MOUNT");
  assert.ok(definition.interface_ref.startsWith(`${capabilityContractRef}#/interfaces/`));
  assert.ok(definition.operation_ref.startsWith(`${capabilityContractRef}#/operations/`));
  assert.ok(definition.request_contract_ref.startsWith(`${definition.operation_ref}/`));
  assert.ok(definition.response_contract_ref.startsWith(`${definition.operation_ref}/`));
  assert.ok(definition.stable_error_contract_ref.startsWith(`${capabilityContractRef}#/stable_errors/`));
  assert.equal(definition.outcome_contract_ref, `${capabilityContractRef}#/type_closure/outcome_contracts/call_outcome`);
}

const capabilities = [
  ["ui_module", uiModule],
  ["ui_surface", uiSurface],
  ["ui_render", uiRender],
  ["ui_host", uiHost],
] as const;

test("Q.UI standard Capability interfaces use only CURRENT governed interface fields", async () => {
  for (const [capabilityId, published] of capabilities) {
    const spec = await projection(capabilityId);
    assert.equal(spec.capability_contract_ref, published.capability_contract_ref);
    assert.equal(spec.capability_contract_hash, published.capability_contract_hash);

    const publishedInterfaces = new Set(Object.values(published.interfaces).map((value) => value.interface_ref));
    const publishedOperations = new Set(Object.values(published.operations).map((value) => value.operation_ref));

    for (const definition of Object.values(spec.interfaces)) {
      assertStandardCallInterface(definition, published.capability_contract_ref);
      assert.ok(publishedInterfaces.has(definition.interface_ref as never), `unpublished interface ${definition.interface_ref}`);
      assert.ok(publishedOperations.has(definition.operation_ref as never), `unpublished operation ${definition.operation_ref}`);
    }
  }
});

test("Q.UI standard Artifact composition dependency chain is exact", () => {
  assert.equal(uiSurface.dependencies.ui_module, uiModule.capability_contract_ref);
  assert.equal(uiRender.dependencies.ui_surface, uiSurface.capability_contract_ref);
  assert.equal(uiHost.dependencies.ui_render, uiRender.capability_contract_ref);
});
