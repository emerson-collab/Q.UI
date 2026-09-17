import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0112" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/execute_ui_render` as const;
export const UI_SURFACE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0114" as const;
export const UI_SURFACE_CONTRACT_HASH = "sha256:3016cb8cd975d0441a13fc0837e351e91b4a0ff7771307ad7530c451fa991bb5" as const;
export const THEME_BINDING_CONTRACT_REF = "Q.THEME.CONTRACT.CAPABILITY.THEME_BINDING@V0107" as const;
export const THEME_BINDING_CONTRACT_HASH = "sha256:696835c7ba463ab2f7094696f76292fb178c677242d03275f6e3f6d78c637090" as const;
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function isObject(v: unknown): v is Record<string, unknown> { return v !== null && typeof v === "object" && !Array.isArray(v); }
function obj(v: unknown, code: string, field: string): Record<string, unknown> { if (!isObject(v)) throw new StableRuntimeError(code, `${field} must be object`); return v; }
function str(v: unknown, code: string, field: string): string { if (typeof v !== "string" || v.length === 0) throw new StableRuntimeError(code, `${field} must be non-empty string`); return v; }
function stable(v: unknown): unknown { if (Array.isArray(v)) return Object.freeze(v.map(stable)); if (isObject(v)) { const o: Record<string, unknown> = {}; for (const k of Object.keys(v).sort()) o[k] = stable(v[k]); return Object.freeze(o); } return v; }
function canonical(v: unknown): string { return JSON.stringify(stable(v)); }
function sha(v: unknown): string { return `sha256:${createHash("sha256").update(canonical(v), "utf8").digest("hex")}`; }
function verifyHashBoundArtifact(value: unknown, code: string, field: string): Record<string, unknown> { const artifact = obj(value, code, field); const contentHash = str(artifact.content_hash, code, `${field}.content_hash`); if (!SHA256.test(contentHash)) throw new StableRuntimeError(code, `${field}.content_hash must be sha256`); const body: Record<string, unknown> = {}; for (const [k, v] of Object.entries(artifact)) if (k !== "content_hash") body[k] = v; if (sha(body) !== contentHash) throw new StableRuntimeError(code, `${field}.content_hash mismatch`); return artifact; }
function stableError(trace_id: string, request_id: string, semantic_case: "theme binding missing or invalid" | "renderer unavailable" | "target/theme incompatibility") {
  const stable_error = deep_freeze({ case: semantic_case });
  return deep_freeze({ outcome_type: "stable_error" as const, stable_error, evidence_ref: sha({ operation_ref: OPERATION_REF, stable_error, trace_id, request_id }), trace_id, request_id });
}

export async function handler(input: unknown): Promise<Readonly<Record<string, unknown>>> {
  const request = obj(input, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "input");
  const trace_id = str(request.trace_id, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "trace_id");
  const request_id = str(request.request_id, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "request_id");
  if (Object.keys(request).some((k) => !["ui_render_ref", "ui_surface_ref", "render_input", "trace_id", "request_id"].includes(k))) return stableError(trace_id, request_id, "target/theme incompatibility");
  const ui_render_ref = str(request.ui_render_ref, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "ui_render_ref");
  const ui_surface_ref = str(request.ui_surface_ref, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "ui_surface_ref");
  let renderInput: Record<string, unknown>;
  try { renderInput = obj(request.render_input, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "render_input"); } catch { return stableError(trace_id, request_id, "target/theme incompatibility"); }
  if (Object.keys(renderInput).some((k) => !["ui_surface_artifact", "theme_binding_artifact", "renderer_provider_ref", "target_profile_ref"].includes(k))) return stableError(trace_id, request_id, "target/theme incompatibility");

  let surface: Record<string, unknown>;
  try { surface = verifyHashBoundArtifact(renderInput.ui_surface_artifact, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "render_input.ui_surface_artifact"); } catch { return stableError(trace_id, request_id, "target/theme incompatibility"); }
  if (surface.ui_surface_ref !== ui_surface_ref || !isObject(surface.resolved_target_context)) return stableError(trace_id, request_id, "target/theme incompatibility");

  let theme: Record<string, unknown>;
  try { theme = verifyHashBoundArtifact(renderInput.theme_binding_artifact, "UI_RENDER_THEME_BINDING_MISSING_OR_INVALID", "render_input.theme_binding_artifact"); } catch { return stableError(trace_id, request_id, "theme binding missing or invalid"); }
  let theme_ref: string;
  try { theme_ref = str(theme.effective_theme_ref, "UI_RENDER_THEME_BINDING_MISSING_OR_INVALID", "theme_binding_artifact.effective_theme_ref"); } catch { return stableError(trace_id, request_id, "theme binding missing or invalid"); }
  if (!Array.isArray(theme.bindings) || theme.bindings.length === 0) return stableError(trace_id, request_id, "theme binding missing or invalid");

  let renderer_provider_ref: string;
  try { renderer_provider_ref = str(renderInput.renderer_provider_ref, "UI_RENDER_RENDERER_UNAVAILABLE", "renderer_provider_ref"); } catch { return stableError(trace_id, request_id, "renderer unavailable"); }
  let target_profile_ref: string;
  try { target_profile_ref = str(renderInput.target_profile_ref, "UI_RENDER_TARGET_THEME_INCOMPATIBLE", "target_profile_ref"); } catch { return stableError(trace_id, request_id, "target/theme incompatibility"); }

  const body = deep_freeze({ render_artifact_ref: ui_render_ref, ui_surface_ref, ui_surface_hash: surface.content_hash, renderer_provider_ref, theme_ref, theme_binding_hash: theme.content_hash, target_profile_ref });
  const ui_render_artifact = deep_freeze({ ...body, content_hash: sha(body) });
  const receipt_ref = sha({ operation_ref: OPERATION_REF, ui_render_artifact, trace_id, request_id });
  const evidence_ref = sha({ operation_ref: OPERATION_REF, ui_render_artifact, receipt_ref, trace_id, request_id });
  return deep_freeze({ outcome_type: "response" as const, ui_render_artifact, evidence_ref, receipt_ref, trace_id, request_id });
}
