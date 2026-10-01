import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUiSurfaceInstanceRecord,
  materializeUiSurfaceInstance,
  projectUiSurfaceInstanceIdentity,
  uiSurfaceInstanceRelativePath,
} from "../../../tools/ui_surface/materialize_p1_capability_ui_surface_instance.ts";

const source = {
  source_p1_capability_contract_ref:
    "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
  source_capability_id: "gate",
  source_capability_version: "V0170",
} as const;

const artifact = {
  ui_surface_ref: "q.ui.surface.gate.primary@V0170",
  source_presentation: {
    source_capability_contract_ref:
      "Q.UI.CONTRACT.CAPABILITY.UI_APP@V0110",
  },
  theme_subject_ref: "q.gate.presentation.primary",
  resolved_target_context: {
    target_profile_ref: "q.ui.target.browser.desktop@V0100",
    target_profile_hash:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    device_context: {},
    accessibility_context: {},
  },
  content_hash:
    "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
} as const;

test("projects Surface Instance identity from exact source P1 Capability identity", () => {
  assert.deepEqual(projectUiSurfaceInstanceIdentity(source), {
    instance_id: "gate_ui_surface",
    instance_version: "V0170",
  });
  assert.equal(
    uiSurfaceInstanceRelativePath("gate_ui_surface", "V0170"),
    "instances/ui_surface/gate_ui_surface/V0170/surface_instance.json",
  );
});

test("builds deterministic Surface Instance record distinct from artifact identity", () => {
  const a = buildUiSurfaceInstanceRecord(source, artifact);
  const b = buildUiSurfaceInstanceRecord(source, artifact);
  assert.deepEqual(a, b);
  assert.equal(a.instance_id, "gate_ui_surface");
  assert.equal(a.instance_version, "V0170");
  assert.equal(a.ui_surface_ref, artifact.ui_surface_ref);
  assert.equal(a.ui_surface_hash, artifact.content_hash);
  assert.match(a.instance_content_hash, /^sha256:[0-9a-f]{64}$/);
});

test("materializes exact canonical bytes and verifies readback", async () => {
  const files = new Map<string, Uint8Array>();
  const result = await materializeUiSurfaceInstance(
    source,
    artifact,
    {
      verifyExactSourceIdentity(identity) {
        return identity.source_p1_capability_contract_ref ===
          source.source_p1_capability_contract_ref;
      },
    },
    {
      async writeImmutableJson(path, bytes) {
        assert.equal(files.has(path), false);
        files.set(path, Buffer.from(bytes));
      },
      async readExactBytes(path) {
        const bytes = files.get(path);
        if (bytes === undefined) throw new Error("missing");
        return Buffer.from(bytes);
      },
    },
  );

  assert.equal(
    result.relative_path,
    "instances/ui_surface/gate_ui_surface/V0170/surface_instance.json",
  );
});

test("fails closed when source Capability identity does not verify", async () => {
  await assert.rejects(
    () => materializeUiSurfaceInstance(
      source,
      artifact,
      { verifyExactSourceIdentity: () => false },
      {
        async writeImmutableJson() {},
        async readExactBytes() { return new Uint8Array(); },
      },
    ),
    (error: unknown) =>
      (error as { code?: string }).code ===
        "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
  );
});

test("rejects unresolved Surface artifact", () => {
  assert.throws(
    () => buildUiSurfaceInstanceRecord(source, {
      ...artifact,
      resolved_target_context: null,
    }),
    (error: unknown) =>
      (error as { code?: string }).code ===
        "UI_SURFACE_INSTANCE_ARTIFACT_INVALID",
  );
});
