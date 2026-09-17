import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0114" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/create_ui_surface` as const;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const APP_CONTRACT = "Q.APP.CONTRACT.CAPABILITY.APPLICATION_PRESENTATION@V0110" as const;
const APP_CONTRACT_HASH = "sha256:f3796b74dd89801f43b14f430b6e41966847cfcdc381c9fa355a4d6e4ba03da5" as const;
const APP_INTERFACE = `${APP_CONTRACT}#/interfaces/application_presentation_invoke` as const;
const APP_OPERATION = `${APP_CONTRACT}#/operations/resolve_application_presentation` as const;
const PLATFORM_CONTRACT = "Q.PLATFORM.CONTRACT.CAPABILITY.PLATFORM_WORKBENCH@V0107" as const;
const PLATFORM_CONTRACT_HASH = "sha256:2d4b199d7af94e5206fcebc81c3b58310e446b2cf39a19fb28e2f611cb5dcc49" as const;
const PLATFORM_INTERFACE = `${PLATFORM_CONTRACT}#/interfaces/platform_workbench_invoke` as const;
const PLATFORM_OPERATION = `${PLATFORM_CONTRACT}#/operations/render_platform_workbench` as const;
const PRESENTATION_ENVELOPE_FIELDS = new Set(["presentation_context_kind","provider_capability_contract_ref","provider_capability_contract_hash","provider_interface_ref","provider_operation_ref","presentation_context_ref","presentation_context_hash","presentation_context_artifact"]);
const UI_MODULE_FIELDS = new Set(["ui_module_ref","source_capability_ref","projection_ref","semantic_model","action_bindings","state_bindings","evidence_views","content_hash"]);

function isObject(v: unknown): v is Record<string, unknown> { return v !== null && typeof v === "object" && !Array.isArray(v); }
function obj(v: unknown, code: string, field: string): Record<string, unknown> { if (!isObject(v)) throw new StableRuntimeError(code, `${field} must be object`); return v; }
function str(v: unknown, code: string, field: string): string { if (typeof v !== "string" || v.length === 0) throw new StableRuntimeError(code, `${field} must be non-empty string`); return v; }
function hash(v: unknown, code: string, field: string): string { const s = str(v, code, field); if (!SHA256.test(s)) throw new StableRuntimeError(code, `${field} must be sha256`); return s; }
function stable(v: unknown): unknown { if (Array.isArray(v)) return Object.freeze(v.map(stable)); if (isObject(v)) { const o: Record<string, unknown> = {}; for (const k of Object.keys(v).sort()) o[k] = stable(v[k]); return Object.freeze(o); } return v; }
function canonical(v: unknown): string { return JSON.stringify(stable(v)); }
function sha(v: unknown): string { return `sha256:${createHash("sha256").update(canonical(v), "utf8").digest("hex")}`; }
function urn(kind: string, v: unknown): string { return `urn:q:${kind}:${sha(v).slice(7)}`; }
function exactFields(value: Record<string, unknown>, fields: ReadonlySet<string>, code: string, field: string): void { const keys = Object.keys(value); if (keys.length !== fields.size || keys.some((key) => !fields.has(key))) throw new StableRuntimeError(code, `${field} contains undeclared or missing fields`); }
function verifyHashBoundArtifact(value: unknown, code: string, field: string): Record<string, unknown> { const artifact = obj(value, code, field); const contentHash = hash(artifact.content_hash, code, `${field}.content_hash`); const body: Record<string, unknown> = {}; for (const [k, v] of Object.entries(artifact)) if (k !== "content_hash") body[k] = v; if (sha(body) !== contentHash) throw new StableRuntimeError(code, `${field}.content_hash mismatch`); return artifact; }
function verifyPresentationContext(envelopeValue: unknown): Readonly<{ kind: "APPLICATION" | "PLATFORM"; ref: string; artifact: Record<string, unknown> }> {
  const e = obj(envelopeValue, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context");
  exactFields(e, PRESENTATION_ENVELOPE_FIELDS, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context");
  const kind = str(e.presentation_context_kind, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context_kind");
  if (kind !== "APPLICATION" && kind !== "PLATFORM") throw new StableRuntimeError("UI_SURFACE_DUAL_PRESENTATION_CONTEXT_FORBIDDEN", "exactly one APPLICATION or PLATFORM context is required");
  const providerContract = str(e.provider_capability_contract_ref, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "provider_capability_contract_ref");
  const providerHash = hash(e.provider_capability_contract_hash, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "provider_capability_contract_hash");
  const providerInterface = str(e.provider_interface_ref, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "provider_interface_ref");
  const providerOperation = str(e.provider_operation_ref, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "provider_operation_ref");
  const expected = kind === "APPLICATION" ? { contract: APP_CONTRACT, hash: APP_CONTRACT_HASH, interface: APP_INTERFACE, operation: APP_OPERATION } : { contract: PLATFORM_CONTRACT, hash: PLATFORM_CONTRACT_HASH, interface: PLATFORM_INTERFACE, operation: PLATFORM_OPERATION };
  if (providerContract !== expected.contract || providerHash !== expected.hash || providerInterface !== expected.interface || providerOperation !== expected.operation) throw new StableRuntimeError("UI_SURFACE_PRESENTATION_CONTEXT_PROVIDER_MISMATCH", "presentation context provider identity/hash does not match context kind");
  const ref = str(e.presentation_context_ref, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context_ref");
  const contextHash = hash(e.presentation_context_hash, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context_hash");
  const artifact = verifyHashBoundArtifact(e.presentation_context_artifact, "UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation_context_artifact");
  if (artifact.presentation_context_kind !== kind || artifact.presentation_context_ref !== ref || artifact.content_hash !== contextHash) throw new StableRuntimeError("UI_SURFACE_PRESENTATION_CONTEXT_UNRESOLVED", "presentation context ref/hash/artifact mismatch");
  return Object.freeze({ kind, ref, artifact });
}
function verifyUiModule(value: unknown, index: number): Record<string, unknown> {
  const field = `ui_module_artifacts[${index}]`;
  const module = verifyHashBoundArtifact(value, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", field);
  exactFields(module, UI_MODULE_FIELDS, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", field);
  str(module.ui_module_ref, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", `${field}.ui_module_ref`);
  str(module.source_capability_ref, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", `${field}.source_capability_ref`);
  str(module.projection_ref, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", `${field}.projection_ref`);
  obj(module.semantic_model, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", `${field}.semantic_model`);
  for (const key of ["action_bindings", "state_bindings", "evidence_views"] as const) if (!Array.isArray(module[key])) throw new StableRuntimeError("UI_SURFACE_MODULE_LINEAGE_CONFLICT", `${field}.${key} must be array`);
  return module;
}

export async function handler(input: unknown): Promise<Readonly<Record<string, unknown>>> {
  const request = obj(input, "UI_SURFACE_CONTEXT_MODULE_COMPOSITION_FAILED", "input");
  if (Object.keys(request).some((k) => !["ui_surface_ref", "surface_input"].includes(k))) throw new StableRuntimeError("UI_SURFACE_CONTEXT_MODULE_COMPOSITION_FAILED", "undeclared create_ui_surface input field");
  const ui_surface_ref = str(request.ui_surface_ref, "UI_SURFACE_CONTEXT_MODULE_COMPOSITION_FAILED", "ui_surface_ref");
  const surfaceInput = obj(request.surface_input, "UI_SURFACE_CONTEXT_MODULE_COMPOSITION_FAILED", "surface_input");
  if (Object.keys(surfaceInput).some((k) => !["presentation_context", "ui_module_artifacts"].includes(k))) throw new StableRuntimeError("UI_SURFACE_CONTEXT_MODULE_COMPOSITION_FAILED", "undeclared surface_input field");
  const context = verifyPresentationContext(surfaceInput.presentation_context);
  if (!Array.isArray(surfaceInput.ui_module_artifacts) || surfaceInput.ui_module_artifacts.length === 0) throw new StableRuntimeError("UI_SURFACE_MODULE_LINEAGE_CONFLICT", "at least one exact UI Module artifact is required");
  const modules = surfaceInput.ui_module_artifacts.map((v, i) => verifyUiModule(v, i));
  const moduleRefs = modules.map((m, i) => str(m.ui_module_ref, "UI_SURFACE_MODULE_LINEAGE_CONFLICT", `ui_module_artifacts[${i}].ui_module_ref`));
  if (new Set(moduleRefs).size !== moduleRefs.length) throw new StableRuntimeError("UI_SURFACE_MODULE_LINEAGE_CONFLICT", "duplicate UI Module ref");
  const region_ref = urn("ui-region", { presentation_context_kind: context.kind, presentation_context_ref: context.ref });
  const regions = Object.freeze([deep_freeze({ region_ref, presentation_context_kind: context.kind, presentation_context_ref: context.ref, ordinal_position: 1 })]);
  const slots = Object.freeze(modules.map((_m, index) => { const ui_module_ref = moduleRefs[index]!; return deep_freeze({ slot_ref: urn("ui-slot", { ui_surface_ref, ui_module_ref, ordinal_position: index + 1 }), region_ref, ui_module_ref, ordinal_position: index + 1 }); }));
  const navigation_projection = Object.freeze([deep_freeze({ presentation_context_ref: context.ref, presentation_context_kind: context.kind, surface_requirements: stable(context.artifact.surface_requirements ?? {}) })]);
  const interaction_bindings: unknown[] = [];
  modules.forEach((m, index) => { const actions = m.action_bindings as unknown[]; const slot = slots[index]!; for (const action of actions) { if (!isObject(action)) throw new StableRuntimeError("UI_SURFACE_MODULE_LINEAGE_CONFLICT", "action binding must be object"); interaction_bindings.push(deep_freeze({ ...(stable(action) as Record<string, unknown>), ui_module_ref: slot.ui_module_ref, slot_ref: slot.slot_ref })); } });
  const body = deep_freeze({ ui_surface_ref, presentation_context_kind: context.kind, presentation_context_ref: context.ref, presentation_context_provider_contract_ref: context.kind === "APPLICATION" ? APP_CONTRACT : PLATFORM_CONTRACT, ui_module_refs: Object.freeze(moduleRefs), regions, slots, navigation_projection, interaction_bindings: Object.freeze(interaction_bindings), resolved_target_context: null });
  return deep_freeze({ ui_surface_artifact: deep_freeze({ ...body, content_hash: sha(body) }) });
}
