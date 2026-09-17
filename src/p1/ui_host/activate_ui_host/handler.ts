import { createHash } from "node:crypto";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
function objectValue(value: unknown, field: string): Record<string, unknown> { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${field} must be an object`); return value as Record<string, unknown>; }
function stringValue(value: unknown, field: string): string { if (typeof value !== "string" || value.length === 0) throw new TypeError(`${field} must be a non-empty string`); return value; }
function stableClone(value: unknown): unknown { if (Array.isArray(value)) return Object.freeze(value.map(stableClone)); if (value !== null && typeof value === "object") { const source = value as Record<string, unknown>; const out: Record<string, unknown> = {}; for (const key of Object.keys(source).sort()) out[key] = stableClone(source[key]); return Object.freeze(out); } return value; }
function canonical(value: unknown): string { return JSON.stringify(stableClone(value)); }
function sha256Json(value: unknown): string { return `sha256:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`; }
function exactRenderArtifact(value: unknown, expectedRef: string): Record<string, unknown> | null {
  try {
    const artifact = objectValue(value, "activation_input.ui_render_artifact");
    const required = ["render_artifact_ref", "ui_surface_ref", "renderer_provider_ref", "theme_ref", "target_profile_ref", "content_hash"] as const;
    for (const key of required) stringValue(artifact[key], `activation_input.ui_render_artifact.${key}`);
    if (artifact.render_artifact_ref !== expectedRef || !SHA256.test(String(artifact.content_hash))) return null;
    const body: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(artifact)) if (key !== "content_hash") body[key] = item;
    if (sha256Json(body) !== artifact.content_hash) return null;
    return artifact;
  } catch { return null; }
}
export interface StableErrorOutcome { readonly outcome_type: "stable_error"; readonly stable_error: Readonly<{ case: string }>; readonly evidence_ref: string; readonly trace_id: string; readonly request_id: string; }
function stableError(trace_id: string, request_id: string, semantic_case: "host binding invalid" | "render artifact incompatible" | "activation precondition failed"): StableErrorOutcome { const stable_error = Object.freeze({ case: semantic_case }); return Object.freeze({ outcome_type: "stable_error" as const, stable_error, evidence_ref: sha256Json({ operation_ref: OPERATION_REF, stable_error, trace_id, request_id }), trace_id, request_id }); }
export const CAPABILITY_ID = "ui_host" as const;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0110" as const;
export const OPERATION_ID = "activate_ui_host" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/${OPERATION_ID}` as const;
export const UI_RENDER_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0112" as const;
export const UI_RENDER_CONTRACT_HASH = "sha256:a33e92931c0d7f14a8988ef6e9eadb48c7f17a288313b251f68ba9249ec0c5e7" as const;
export interface UiHostResult { readonly ui_host_ref: string; readonly host_instance_ref: string; readonly render_artifact_ref: string; readonly lifecycle_state: "active" | "inactive"; readonly receipt_ref: string; }

export async function handler(input: unknown): Promise<unknown> {
  const request = objectValue(input, "input");
  const ui_host_ref = stringValue(request.ui_host_ref, "ui_host_ref");
  const render_artifact_ref = stringValue(request.render_artifact_ref, "render_artifact_ref");
  const trace_id = stringValue(request.trace_id, "trace_id");
  const request_id = stringValue(request.request_id, "request_id");
  const activation_input = objectValue(request.activation_input, "activation_input");
  let host_instance_ref: string;
  try { host_instance_ref = stringValue(activation_input.host_instance_ref, "activation_input.host_instance_ref"); objectValue(activation_input.host_binding, "activation_input.host_binding"); }
  catch { return stableError(trace_id, request_id, "host binding invalid"); }
  const renderArtifact = exactRenderArtifact(activation_input.ui_render_artifact, render_artifact_ref);
  if (!renderArtifact) return stableError(trace_id, request_id, "render artifact incompatible");
  const receipt_ref = sha256Json({ operation_ref: OPERATION_REF, ui_host_ref, host_instance_ref, render_artifact_ref, render_artifact_hash: renderArtifact.content_hash, lifecycle_state: "active", trace_id, request_id });
  const ui_host_result = Object.freeze({ ui_host_ref, host_instance_ref, render_artifact_ref, lifecycle_state: "active" as const, receipt_ref });
  const evidence_ref = sha256Json({ operation_ref: OPERATION_REF, ui_host_result, render_artifact_hash: renderArtifact.content_hash, trace_id, request_id });
  return Object.freeze({ outcome_type: "response" as const, ui_host_result, evidence_ref, receipt_ref, trace_id, request_id });
}
register_business_operation(OPERATION_REF, handler);
