import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../../../../src/p1/ui_producer/produce_platform/handler.ts";

const moduleArtifact = Object.freeze({
  ui_module_ref: "ui-module:platform:001",
  semantic_model: Object.freeze({ platform: true }),
  action_bindings: Object.freeze([Object.freeze({ opaque: Object.freeze({ lineage: "preserve" }) })]),
  state_bindings: Object.freeze([]),
  evidence_views: Object.freeze([]),
});
const themeArtifact = Object.freeze({
  theme_ref: "ui-theme:001",
  presentation_rules: Object.freeze({ density: "compact", tokens: Object.freeze({ spacing: 8 }) }),
});

test("produce_platform projects governed module + optional theme without P2 runtime-state materialization", async () => {
  const result = await handler({
    ui_module_artifact_ref: "ui-module:platform:001",
    ui_module_artifact: moduleArtifact,
    ui_theme_artifact_ref: "ui-theme:001",
    ui_theme_artifact: themeArtifact,
    host_target: { shell: "q-platform" },
    platform_context: { workspace: "main" },
  }) as any;

  assert.equal(result.host_artifact.producer_operation_id, "produce_platform");
  assert.equal(result.host_artifact.runtime_requirements.context_kind, "PLATFORM");
  assert.equal(result.host_artifact.source_ui_theme_artifact_ref, "ui-theme:001");
  assert.deepEqual(result.host_artifact.ui_structure.semantic_model, moduleArtifact.semantic_model);
  assert.deepEqual(result.host_artifact.ui_structure.theme_presentation_rules, themeArtifact.presentation_rules);
  assert.deepEqual(result.host_artifact.action_bindings, moduleArtifact.action_bindings);
  assert.match(result.host_artifact.content_hash, /^sha256:[0-9a-f]{64}$/);
  assert.equal("active_mount_hash" in result.host_artifact, false);
  assert.equal("dependency_realization_binding" in result.host_artifact, false);
});

test("produce_platform requires exact theme identity when the theme pair is present", async () => {
  await assert.rejects(
    () => handler({
      ui_module_artifact_ref: "ui-module:platform:001",
      ui_module_artifact: moduleArtifact,
      ui_theme_artifact_ref: "ui-theme:other",
      ui_theme_artifact: themeArtifact,
    }),
    (error: any) => error?.code === "UI_PRODUCER_THEME_INCOMPATIBLE",
  );
});

test("produce_platform canonicalization ignores object key order but preserves array order", async () => {
  const first = await handler({
    ui_module_artifact_ref: "ui-module:platform:001",
    ui_module_artifact: moduleArtifact,
    host_target: { z: 2, a: 1 },
    platform_context: { z: 2, a: 1 },
  }) as any;
  const second = await handler({
    platform_context: { a: 1, z: 2 },
    host_target: { a: 1, z: 2 },
    ui_module_artifact: moduleArtifact,
    ui_module_artifact_ref: "ui-module:platform:001",
  }) as any;

  assert.equal(first.host_artifact.content_hash, second.host_artifact.content_hash);

  const orderedA = {
    ...moduleArtifact,
    action_bindings: [{ id: "first" }, { id: "second" }],
  };
  const orderedB = {
    ...moduleArtifact,
    action_bindings: [{ id: "second" }, { id: "first" }],
  };
  const a = await handler({
    ui_module_artifact_ref: "ui-module:platform:001",
    ui_module_artifact: orderedA,
  }) as any;
  const b = await handler({
    ui_module_artifact_ref: "ui-module:platform:001",
    ui_module_artifact: orderedB,
  }) as any;

  assert.notEqual(a.host_artifact.content_hash, b.host_artifact.content_hash);
});

test("produce_platform keeps theme presentation separate from module business semantics", async () => {
  const result = await handler({
    ui_module_artifact_ref: "ui-module:platform:001",
    ui_module_artifact: moduleArtifact,
    ui_theme_artifact_ref: "ui-theme:001",
    ui_theme_artifact: themeArtifact,
  }) as any;

  assert.deepEqual(result.host_artifact.ui_structure.semantic_model, { platform: true });
  assert.deepEqual(result.host_artifact.ui_structure.theme_presentation_rules, themeArtifact.presentation_rules);
  assert.equal("density" in result.host_artifact.ui_structure.semantic_model, false);
});
