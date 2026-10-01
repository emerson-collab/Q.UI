import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  materializeP1CapabilityUiSurfaceInstance,
  type JsonValue,
} from "../../../tools/ui_surface/materialize_p1_capability_ui_surface_instance.ts";

function compareCodepoints(a: string, b: string): number {
  const aa = Array.from(a);
  const bb = Array.from(b);
  const n = Math.min(aa.length, bb.length);
  for (let i = 0; i < n; i += 1) {
    const ac = aa[i]!.codePointAt(0)!;
    const bc = bb[i]!.codePointAt(0)!;
    if (ac !== bc) return ac - bc;
  }
  return aa.length - bb.length;
}
function canonical(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort(compareCodepoints)
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key]!)}`)
    .join(",")}}`;
}
function sha(value: JsonValue): string {
  return `sha256:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`;
}
function surface() {
  const source_presentation = {
    source_capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_APP@V0110",
    source_capability_contract_hash:
      "sha256:ef92c6d99e4eef032b68acfc472865a6b428751ec372100cbb41be689c4b7306",
    presentation_context_ref: "presentation:q-gate",
    presentation_context_hash:
      "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    presentation_context: {
      theme_subject_ref: "q-gate:ui",
      skeleton: { regions: ["header", "navigation", "workspace"] },
    },
  };
  const resolved_target_context = {
    target_profile_ref: "target:web-desktop@V0100",
    target_profile_hash:
      "sha256:2222222222222222222222222222222222222222222222222222222222222222",
    device_context: { class: "desktop" },
    accessibility_context: { reduced_motion: false },
  };
  const hash = sha({
    source_presentation,
    theme_subject_ref: "q-gate:ui",
    resolved_target_context,
  });
  return {
    ui_surface_ref: "surface:q-gate",
    source_presentation,
    theme_subject_ref: "q-gate:ui",
    resolved_target_context,
    content_hash: hash,
  };
}
const resolver = async (ref: string) => {
  assert.equal(ref, "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170");
  return { capability_id: "gate", capability_version: "V0170" };
};

test("projects exact P1 Capability identity into the canonical Surface Instance path", async () => {
  const artifact = surface();
  const result = await materializeP1CapabilityUiSurfaceInstance({
    source_p1_capability_contract_ref:
      "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
    source_capability_id: "gate",
    source_capability_version: "V0170",
    ui_surface_ref: artifact.ui_surface_ref,
    ui_surface_hash: artifact.content_hash,
    surface_artifact: artifact,
  }, resolver);

  assert.equal(result.record.instance_id, "gate_ui_surface");
  assert.equal(result.record.instance_version, "V0170");
  assert.equal(
    result.relative_path,
    "instances/ui_surface/gate_ui_surface/V0170/surface_instance.json",
  );
  assert.match(result.record.instance_content_hash, /^sha256:[0-9a-f]{64}$/);
  assert.equal(JSON.parse(result.file_content).ui_surface_ref, "surface:q-gate");
});

test("fails closed when exact source Contract identity does not resolve to declared id/version", async () => {
  const artifact = surface();
  await assert.rejects(
    () => materializeP1CapabilityUiSurfaceInstance({
      source_p1_capability_contract_ref:
        "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
      source_capability_id: "other",
      source_capability_version: "V0170",
      ui_surface_ref: artifact.ui_surface_ref,
      ui_surface_hash: artifact.content_hash,
      surface_artifact: artifact,
    }, resolver),
    /identity mismatch/,
  );
});

test("fails closed on unresolved Surface or Surface ref/hash mismatch", async () => {
  const artifact = surface();
  await assert.rejects(
    () => materializeP1CapabilityUiSurfaceInstance({
      source_p1_capability_contract_ref:
        "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
      source_capability_id: "gate",
      source_capability_version: "V0170",
      ui_surface_ref: artifact.ui_surface_ref,
      ui_surface_hash:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      surface_artifact: artifact,
    }, resolver),
    /ui_surface_hash/,
  );

  await assert.rejects(
    () => materializeP1CapabilityUiSurfaceInstance({
      source_p1_capability_contract_ref:
        "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
      source_capability_id: "gate",
      source_capability_version: "V0170",
      ui_surface_ref: artifact.ui_surface_ref,
      ui_surface_hash: artifact.content_hash,
      surface_artifact: { ...artifact, resolved_target_context: null },
    }, resolver),
    /resolved Surface/,
  );
});

test("projection is deterministic across source object key insertion order", async () => {
  const a = surface();
  const b = {
    content_hash: a.content_hash,
    resolved_target_context: a.resolved_target_context,
    theme_subject_ref: a.theme_subject_ref,
    source_presentation: a.source_presentation,
    ui_surface_ref: a.ui_surface_ref,
  };
  const left = await materializeP1CapabilityUiSurfaceInstance({
    source_p1_capability_contract_ref:
      "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
    source_capability_id: "gate",
    source_capability_version: "V0170",
    ui_surface_ref: a.ui_surface_ref,
    ui_surface_hash: a.content_hash,
    surface_artifact: a,
  }, resolver);
  const right = await materializeP1CapabilityUiSurfaceInstance({
    source_p1_capability_contract_ref:
      "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
    source_capability_id: "gate",
    source_capability_version: "V0170",
    ui_surface_ref: b.ui_surface_ref,
    ui_surface_hash: b.content_hash,
    surface_artifact: b,
  }, resolver);
  assert.equal(
    left.record.instance_content_hash,
    right.record.instance_content_hash,
  );
});
