import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  buildUiRenderInstanceRecord,
  materializeUiRenderInstance,
  projectUiRenderInstanceIdentity,
  uiRenderInstanceRelativePath,
  type JsonValue,
} from "../../../tools/ui_render/materialize_p1_capability_ui_render_instance.ts";

function compareCodepoints(a: string, b: string): number {
  const aa = Array.from(a), bb = Array.from(b), n = Math.min(aa.length, bb.length);
  for (let i = 0; i < n; i += 1) {
    const ac = aa[i]!.codePointAt(0)!, bc = bb[i]!.codePointAt(0)!;
    if (ac !== bc) return ac - bc;
  }
  return aa.length - bb.length;
}
function canonical(v: JsonValue): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  return `{${Object.keys(v).sort(compareCodepoints)
    .map((k) => `${JSON.stringify(k)}:${canonical(v[k]!)}`).join(",")}}`;
}
function sha(v: JsonValue): string {
  return `sha256:${createHash("sha256").update(canonical(v), "utf8").digest("hex")}`;
}

const source = {
  source_p1_capability_contract_ref:
    "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
  source_capability_id: "gate",
  source_capability_version: "V0170",
} as const;

function renderArtifact() {
  const render_material = {
    surface: {
      ui_surface_ref: "q.ui.surface.gate.primary@V0170",
      resolved_target_context: {
        target_profile_ref: "q.ui.target.browser.desktop@V0100",
      },
    },
    render_theme_resolution: {
      selection: { subject_ref: "q.gate.presentation.primary" },
      theme_instance: { theme_instance_ref: "gate_github_render@V0170" },
    },
    application_mode: "RENDER_THEME_VISUAL_LAYER_NO_STRUCTURAL_MUTATION",
  };
  const semantic = {
    ui_surface_ref: "q.ui.surface.gate.primary@V0170",
    renderer_provider_ref: "q.ui.renderer.browser@V0100",
    theme_ref: "gate_github_render@V0170",
    target_profile_ref: "q.ui.target.browser.desktop@V0100",
    ui_surface_hash:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    theme_hash:
      "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    render_material,
  };
  return {
    render_artifact_ref: "q.ui.render.gate.primary@V0170",
    ...semantic,
    content_hash: sha(semantic),
  } as const;
}

test("projects Render Instance identity from exact source P1 Capability identity", () => {
  assert.deepEqual(projectUiRenderInstanceIdentity(source), {
    instance_id: "gate_ui_render",
    instance_version: "V0170",
  });
  assert.equal(
    uiRenderInstanceRelativePath("gate_ui_render", "V0170"),
    "instances/ui_render/gate_ui_render/V0170/render_instance.json",
  );
});

test("builds deterministic Render Instance record distinct from artifact identity", () => {
  const artifact = renderArtifact();
  const a = buildUiRenderInstanceRecord(source, artifact);
  const b = buildUiRenderInstanceRecord(source, artifact);
  assert.deepEqual(a, b);
  assert.equal(a.instance_id, "gate_ui_render");
  assert.equal(a.render_artifact_ref, artifact.render_artifact_ref);
  assert.equal(a.render_artifact_hash, artifact.content_hash);
  assert.match(a.instance_content_hash, /^sha256:[0-9a-f]{64}$/);
});

test("materializes canonical bytes and verifies exact readback", async () => {
  const files = new Map<string, Uint8Array>();
  const result = await materializeUiRenderInstance(
    source,
    renderArtifact(),
    {
      verifyExactSourceIdentity(identity) {
        return identity.source_p1_capability_contract_ref
          === source.source_p1_capability_contract_ref;
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
    "instances/ui_render/gate_ui_render/V0170/render_instance.json",
  );
});

test("fails closed when source Capability identity does not verify", async () => {
  await assert.rejects(
    () => materializeUiRenderInstance(
      source,
      renderArtifact(),
      { verifyExactSourceIdentity: () => false },
      {
        async writeImmutableJson() {},
        async readExactBytes() { return new Uint8Array(); },
      },
    ),
    (error: unknown) =>
      (error as { code?: string }).code
        === "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
  );
});

test("rejects Render Artifact whose content hash does not verify", () => {
  const artifact = renderArtifact();
  assert.throws(
    () => buildUiRenderInstanceRecord(source, {
      ...artifact,
      content_hash:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    }),
    (error: unknown) =>
      (error as { code?: string }).code
        === "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
  );
});
