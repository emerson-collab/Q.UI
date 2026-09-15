import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../../../../src/p1/ui_producer/produce_app/handler.ts";

const moduleArtifact = Object.freeze({
  ui_module_ref: "ui-module:app:001",
  semantic_model: Object.freeze({ z: 2, a: "semantic" }),
  action_bindings: Object.freeze([
    Object.freeze({
      source_capability_ref: "Q.EXAMPLE.CAPABILITY@V0100",
      operation_ref: "Q.EXAMPLE.CONTRACT.CAPABILITY.X@V0100#/operations/do_it",
      interface_ref: "Q.EXAMPLE.CONTRACT.CAPABILITY.X@V0100#/interfaces/do_it_invoke",
      input_binding: Object.freeze({ field: "input" }),
      result_binding: Object.freeze({ field: "output" }),
      existing_p2_realization_ref: "opaque-upstream-lineage",
    }),
  ]),
  state_bindings: Object.freeze([Object.freeze({ state: "s" })]),
  evidence_views: Object.freeze([Object.freeze({ evidence: "e" })]),
});

test("produce_app projects one deterministic Host Artifact and preserves upstream bindings opaquely", async () => {
  const first = await handler({
    ui_module_artifact_ref: "ui-module:app:001",
    ui_module_artifact: moduleArtifact,
    host_target: { z: 1, a: 2 },
    production_context: { locale: "en", mode: "application" },
  }) as any;
  const second = await handler({
    production_context: { mode: "application", locale: "en" },
    host_target: { a: 2, z: 1 },
    ui_module_artifact: moduleArtifact,
    ui_module_artifact_ref: "ui-module:app:001",
  }) as any;

  assert.equal(first.host_artifact.producer_operation_id, "produce_app");
  assert.equal(first.host_artifact.runtime_requirements.context_kind, "APP");
  assert.equal(first.host_artifact.source_ui_theme_artifact_ref, null);
  assert.equal(first.host_artifact.ui_structure.theme_presentation_rules, null);
  assert.deepEqual(first.host_artifact.ui_structure.semantic_model, moduleArtifact.semantic_model);
  assert.deepEqual(first.host_artifact.action_bindings, moduleArtifact.action_bindings);
  assert.deepEqual(first.host_artifact.runtime_requirements.state_bindings, moduleArtifact.state_bindings);
  assert.deepEqual(first.host_artifact.runtime_requirements.evidence_views, moduleArtifact.evidence_views);
  assert.equal(first.host_artifact.content_hash, second.host_artifact.content_hash);
  assert.equal(first.host_artifact.host_artifact_ref, `ui_producer_host_artifact:${first.host_artifact.content_hash}`);
  assert.equal("active_mount_hash" in first.host_artifact, false);
  assert.equal("active_mount_set_hash" in first.host_artifact, false);
  assert.equal("dependency_realization_binding" in first.host_artifact, false);
  assert.equal("operation_use_binding" in first.host_artifact, false);
  assert.equal("provider_resolver_state" in first.host_artifact, false);
});

test("produce_app fails closed for unresolved module identity", async () => {
  await assert.rejects(
    () => handler({ ui_module_artifact_ref: "wrong", ui_module_artifact: moduleArtifact }),
    (error: any) => error?.code === "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED",
  );
});

test("produce_app rejects an incomplete theme pair without inventing compatibility semantics", async () => {
  await assert.rejects(
    () => handler({
      ui_module_artifact_ref: "ui-module:app:001",
      ui_module_artifact: moduleArtifact,
      ui_theme_artifact_ref: "theme:001",
    }),
    (error: any) => error?.code === "UI_PRODUCER_THEME_INCOMPATIBLE",
  );
});

test("produce_app rejects undeclared request fields", async () => {
  await assert.rejects(
    () => handler({
      ui_module_artifact_ref: "ui-module:app:001",
      ui_module_artifact: moduleArtifact,
      active_mount_hash: "caller-supplied-forbidden",
    }),
    (error: any) => error?.code === "UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN",
  );
});
