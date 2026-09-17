import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0114" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/resolve_ui_surface` as const;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const UI_SURFACE_ARTIFACT_FIELDS = new Set(["ui_surface_ref","presentation_context_kind","presentation_context_ref","presentation_context_provider_contract_ref","ui_module_refs","regions","slots","navigation_projection","interaction_bindings","resolved_target_context","content_hash"]);
function isObject(v: unknown): v is Record<string, unknown> { return v !== null && typeof v === "object" && !Array.isArray(v); }
function obj(v: unknown, code: string, field: string): Record<string, unknown> { if (!isObject(v)) throw new StableRuntimeError(code, `${field} must be object`); return v; }
function str(v: unknown, code: string, field: string): string { if (typeof v !== "string" || v.length === 0) throw new StableRuntimeError(code, `${field} must be non-empty string`); return v; }
function stable(v: unknown): unknown { if (Array.isArray(v)) return Object.freeze(v.map(stable)); if (isObject(v)) { const o: Record<string, unknown> = {}; for (const k of Object.keys(v).sort()) o[k] = stable(v[k]); return Object.freeze(o); } return v; }
function canonical(v: unknown): string { return JSON.stringify(stable(v)); }
function sha(v: unknown): string { return `sha256:${createHash("sha256").update(canonical(v), "utf8").digest("hex")}`; }
function verifyArtifact(value: unknown): Record<string, unknown> {
  const artifact = obj(value, "UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "resolution_input.ui_surface_artifact");
  const keys = Object.keys(artifact);
  if (keys.length !== UI_SURFACE_ARTIFACT_FIELDS.size || keys.some((key) => !UI_SURFACE_ARTIFACT_FIELDS.has(key))) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "ui_surface_artifact contains undeclared or missing fields");
  const contentHash = str(artifact.content_hash, "UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "ui_surface_artifact.content_hash");
  if (!SHA256.test(contentHash)) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "surface content_hash must be sha256");
  if (artifact.presentation_context_kind !== "APPLICATION" && artifact.presentation_context_kind !== "PLATFORM") throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "presentation_context_kind invalid");
  str(artifact.presentation_context_ref, "UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "presentation_context_ref");
  str(artifact.presentation_context_provider_contract_ref, "UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "presentation_context_provider_contract_ref");
  if (!Array.isArray(artifact.ui_module_refs) || artifact.ui_module_refs.length === 0 || artifact.ui_module_refs.some((ref) => typeof ref !== "string" || ref.length === 0) || new Set(artifact.ui_module_refs).size !== artifact.ui_module_refs.length) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "ui_module_refs invalid");
  for (const key of ["regions","slots","navigation_projection","interaction_bindings"] as const) if (!Array.isArray(artifact[key])) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", `${key} must be array`);
  const body: Record<string, unknown> = {}; for (const [k, v] of Object.entries(artifact)) if (k !== "content_hash") body[k] = v;
  if (sha(body) !== contentHash) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "surface content_hash mismatch");
  return artifact;
}

export async function handler(input: unknown): Promise<Readonly<Record<string, unknown>>> {
  const request = obj(input, "UI_SURFACE_TARGET_UNSUPPORTED", "input");
  if (Object.keys(request).some((k) => !["ui_surface_ref", "resolution_input"].includes(k))) throw new StableRuntimeError("UI_SURFACE_TARGET_UNSUPPORTED", "undeclared resolve_ui_surface input field");
  const ui_surface_ref = str(request.ui_surface_ref, "UI_SURFACE_TARGET_UNSUPPORTED", "ui_surface_ref");
  const resolution = obj(request.resolution_input, "UI_SURFACE_TARGET_UNSUPPORTED", "resolution_input");
  if (Object.keys(resolution).some((k) => !["ui_surface_artifact", "target_context"].includes(k))) throw new StableRuntimeError("UI_SURFACE_TARGET_UNSUPPORTED", "undeclared resolution_input field");
  const artifact = verifyArtifact(resolution.ui_surface_artifact);
  if (artifact.ui_surface_ref !== ui_surface_ref) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "ui_surface_ref does not match exact composed artifact");
  if (artifact.resolved_target_context !== null) throw new StableRuntimeError("UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED", "Surface is already target-resolved");
  const target_context = obj(resolution.target_context, "UI_SURFACE_TARGET_UNSUPPORTED", "target_context");
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(artifact)) if (k !== "content_hash" && k !== "resolved_target_context") body[k] = stable(v);
  body.resolved_target_context = stable(target_context);
  const frozen = deep_freeze(body);
  return deep_freeze({ ui_surface_artifact: deep_freeze({ ...frozen, content_hash: sha(frozen) }) });
}
