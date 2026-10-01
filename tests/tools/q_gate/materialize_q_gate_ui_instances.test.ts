import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  Q_GATE_PRESENTATION_SUBJECT_REF,
  Q_GATE_THEME_INSTANCE_BINDINGS,
  materializeQGateUiInstances,
} from "../../../tools/q_gate/materialize_q_gate_ui_instances.ts";

type J = null | boolean | number | string | J[] | { [key: string]: J };
function canon(v: J): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  return `{${Object.keys(v).sort()
    .map((k) => `${JSON.stringify(k)}:${canon(v[k] as J)}`).join(",")}}`;
}
function sha(v: J): string {
  return "sha256:" + createHash("sha256").update(canon(v), "utf8").digest("hex");
}

function renderArtifact(surface: any) {
  const render_material = {
    surface,
    render_theme_resolution: {
      selection: {
        subject_ref: Q_GATE_PRESENTATION_SUBJECT_REF,
        theme_phase: "RENDER",
      },
      theme_instance: {
        theme_instance_ref:
          Q_GATE_THEME_INSTANCE_BINDINGS.render.theme_instance_ref,
        content_hash: Q_GATE_THEME_INSTANCE_BINDINGS.render.content_hash,
      },
    },
    application_mode: "RENDER_THEME_VISUAL_LAYER_NO_STRUCTURAL_MUTATION",
  };
  const semantic = {
    ui_surface_ref: surface.ui_surface_ref,
    renderer_provider_ref: "q.ui.renderer.browser@V0100",
    theme_ref: Q_GATE_THEME_INSTANCE_BINDINGS.render.theme_instance_ref,
    target_profile_ref: surface.resolved_target_context.target_profile_ref,
    ui_surface_hash: surface.content_hash,
    theme_hash: Q_GATE_THEME_INSTANCE_BINDINGS.render.content_hash,
    render_material,
  };
  return {
    render_artifact_ref: "q.ui.render.gate.primary@V0170",
    ...semantic,
    content_hash: sha(semantic as unknown as J),
  };
}

test("Q.Gate concrete projection uses exact Gate subject and projected instance paths", async () => {
  const surface = {
    ui_surface_ref: "q.ui.surface.gate.primary@V0170",
    source_presentation: {},
    theme_subject_ref: Q_GATE_PRESENTATION_SUBJECT_REF,
    resolved_target_context: {
      target_profile_ref: "q.ui.target.browser.desktop@V0100",
    },
    content_hash:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  };
  const render = renderArtifact(surface);
  const files = new Map<string, Uint8Array>();
  const calls: Array<{ op: string; input: any }> = [];

  const result = await materializeQGateUiInstances(
    {
      async register_theme_instance(input: any) {
        calls.push({ op: "register", input });
        return {};
      },
      async list_theme_instances(input: any) {
        calls.push({ op: "list", input });
        return {};
      },
      async set_theme_selection(input: any) {
        calls.push({ op: "select", input });
        return {};
      },
      async resolve_selected_theme(input: any) {
        calls.push({ op: "resolve", input });
        return {};
      },
    },
    surface,
    render,
    {
      verifyResolvedSurfaceArtifact: () => true,
      verifyRenderArtifact: () => true,
    },
    {
      verifyExactSourceIdentity: () => true,
    },
    {
      async writeImmutableJson(path, bytes) {
        if (files.has(path)) throw new Error("duplicate");
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
    result.surface_instance_path,
    "instances/ui_surface/gate_ui_surface/V0170/surface_instance.json",
  );
  assert.equal(
    result.render_instance_path,
    "instances/ui_render/gate_ui_render/V0170/render_instance.json",
  );
  assert.equal(
    calls.filter((x) => x.op === "select").every(
      (x) => x.input.subject_ref === Q_GATE_PRESENTATION_SUBJECT_REF,
    ),
    true,
  );
});

test("Q.Gate concrete projection rejects a Surface with a different Theme subject", async () => {
  await assert.rejects(
    () => materializeQGateUiInstances(
      {
        async register_theme_instance() { return {}; },
        async list_theme_instances() { return {}; },
        async set_theme_selection() { return {}; },
        async resolve_selected_theme() { return {}; },
      },
      {
        ui_surface_ref: "x",
        source_presentation: {},
        theme_subject_ref: "different",
        resolved_target_context: { target_profile_ref: "target" },
        content_hash:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
      {},
      {
        verifyResolvedSurfaceArtifact: () => true,
        verifyRenderArtifact: () => true,
      },
      { verifyExactSourceIdentity: () => true },
      {
        async writeImmutableJson() {},
        async readExactBytes() { return new Uint8Array(); },
      },
    ),
    (error: unknown) =>
      (error as { code?: string }).code === "Q_GATE_UI_SURFACE_SUBJECT_MISMATCH",
  );
});
