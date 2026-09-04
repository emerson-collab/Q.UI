import { createHash } from "node:crypto";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
function objectValue(value: unknown, field: string): JsonObject { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${field} must be an object`); return value as JsonObject; }
function stringValue(value: unknown, field: string): string { if (typeof value !== "string" || value.length === 0) throw new TypeError(`${field} must be a non-empty string`); return value; }
function arrayValue(value: unknown, field: string): readonly unknown[] { if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`); return value; }
function stableClone(value: unknown): unknown { if (Array.isArray(value)) return Object.freeze(value.map(stableClone)); if (value !== null && typeof value === "object") { const source = value as Record<string, unknown>; const out: Record<string, unknown> = {}; for (const key of Object.keys(source).sort()) out[key] = stableClone(source[key]); return Object.freeze(out); } return value; }
function canonical(value: unknown): string { return JSON.stringify(stableClone(value)); }
function sha256Json(value: unknown): string { return `sha256:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`; }
export interface StableErrorOutcome { readonly outcome_type: "stable_error"; readonly stable_error: Readonly<{ case: string }>; readonly evidence_ref: string; readonly trace_id: string; readonly request_id: string; }
function stableError(trace_id: string, request_id: string, semantic_case: string): StableErrorOutcome { const stable_error = Object.freeze({ case: semantic_case }); return Object.freeze({ outcome_type: "stable_error" as const, stable_error, evidence_ref: sha256Json({ operation_ref: OPERATION_REF, stable_error, trace_id, request_id }), trace_id, request_id }); }
export const CAPABILITY_ID = "ui_module" as const;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106" as const;
export const OPERATION_ID = "resolve_ui_module" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/${OPERATION_ID}` as const;
export interface ResolveUiModuleRequest { readonly source_capability_ref: string; readonly projection_ref: string; readonly projection_input: unknown; readonly trace_id: string; readonly request_id: string; }
export interface UiModuleArtifact { readonly ui_module_ref: string; readonly source_capability_ref: string; readonly projection_ref: string; readonly semantic_model: unknown; readonly action_bindings: readonly unknown[]; readonly state_bindings: readonly unknown[]; readonly evidence_views: readonly unknown[]; readonly content_hash: string; }
export interface ResolveUiModuleResponse { readonly outcome_type: "response"; readonly ui_module_artifact: UiModuleArtifact; readonly evidence_ref: string; readonly receipt_ref: string; readonly trace_id: string; readonly request_id: string; }
export type ResolveUiModuleOutcome = ResolveUiModuleResponse | StableErrorOutcome;
export async function handler(input: unknown): Promise<ResolveUiModuleOutcome> {
  const request = objectValue(input, "input"); const source_capability_ref = stringValue(request.source_capability_ref, "source_capability_ref"); const projection_ref = stringValue(request.projection_ref, "projection_ref"); const trace_id = stringValue(request.trace_id, "trace_id"); const request_id = stringValue(request.request_id, "request_id"); const projection_input = objectValue(request.projection_input, "projection_input");
  if (projection_input.semantic_model === undefined) return stableError(trace_id, request_id, "framework input invalid");
  let action_bindings: readonly unknown[]; let state_bindings: readonly unknown[]; let evidence_views: readonly unknown[];
  try { action_bindings = arrayValue(projection_input.action_bindings, "projection_input.action_bindings"); state_bindings = arrayValue(projection_input.state_bindings, "projection_input.state_bindings"); evidence_views = arrayValue(projection_input.evidence_views, "projection_input.evidence_views"); }
  catch { return stableError(trace_id, request_id, "framework input invalid"); }
  const artifact_body = stableClone({ ui_module_ref: projection_ref, source_capability_ref, projection_ref, semantic_model: projection_input.semantic_model, action_bindings, state_bindings, evidence_views }) as JsonObject;
  const ui_module_artifact = Object.freeze({ ...artifact_body, content_hash: sha256Json(artifact_body) }) as unknown as UiModuleArtifact;
  const evidence_ref = sha256Json({ operation_ref: OPERATION_REF, ui_module_artifact, trace_id, request_id }); const receipt_ref = sha256Json({ operation_ref: OPERATION_REF, outcome_type: "response", ui_module_artifact, evidence_ref, trace_id, request_id });
  return Object.freeze({ outcome_type: "response" as const, ui_module_artifact, evidence_ref, receipt_ref, trace_id, request_id });
}
register_business_operation(OPERATION_REF, handler);
