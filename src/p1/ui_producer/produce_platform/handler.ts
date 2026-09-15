import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/produce_platform` as const;
export const INTERFACE_REF = `${CAPABILITY_CONTRACT_REF}#/interfaces/produce_platform_invoke` as const;

type JsonObject = Readonly<Record<string, unknown>>;
type JsonValue = null | boolean | number | string | readonly JsonValue[] | JsonObject;
type StableErrorCode = keyof typeof ERROR_MESSAGES;

const ERROR_MESSAGES = Object.freeze({
  UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED: "The governed UI Module Artifact cannot be resolved.",
  UI_PRODUCER_THEME_INCOMPATIBLE: "The governed UI Theme Artifact is incompatible with the requested production context.",
  UI_PRODUCER_P2_MOUNT_INCOMPLETE: "A business-executing Host action lacks complete governed P2 mount lineage.",
  UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN: "Production would require prohibited business-semantic inference.",
} as const);

function fail(code: StableErrorCode): never {
  throw new StableRuntimeError(code, ERROR_MESSAGES[code]);
}
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function nonEmptyString(value: unknown, code: StableErrorCode): string {
  if (typeof value !== "string" || value.length === 0) fail(code);
  return value;
}
function objectValue(value: unknown, code: StableErrorCode): Record<string, unknown> {
  if (!isObject(value)) fail(code);
  return value;
}
function jsonClone(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return Object.freeze(value.map(jsonClone));
  if (isObject(value)) {
    const result: Record<string, JsonValue> = {};
    for (const key of Object.keys(value)) result[key] = jsonClone(value[key]);
    return Object.freeze(result);
  }
  return fail("UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN");
}
function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item as JsonValue)).join(",")}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key] as JsonValue)}`).join(",")}}`;
}
function sha256(value: JsonValue): string {
  return `sha256:${createHash("sha256").update(canonicalJson(value), "utf8").digest("hex")}`;
}
function requireArray(value: unknown, code: StableErrorCode): readonly unknown[] {
  if (!Array.isArray(value)) fail(code);
  return value;
}
function cloneObjectArray(value: unknown, code: StableErrorCode): readonly JsonObject[] {
  return Object.freeze(requireArray(value, code).map((item) => {
    if (!isObject(item)) fail(code);
    return jsonClone(item) as JsonObject;
  }));
}
function resolvedModule(request: Record<string, unknown>) {
  const expectedRef = nonEmptyString(request.ui_module_artifact_ref, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  const artifact = objectValue(request.ui_module_artifact, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  if (artifact.ui_module_ref !== expectedRef) fail("UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  const semanticModel = objectValue(artifact.semantic_model, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  const actionBindings = cloneObjectArray(artifact.action_bindings, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  const stateBindings = cloneObjectArray(artifact.state_bindings, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED");
  const evidenceViews = Object.freeze(requireArray(artifact.evidence_views, "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED").map(jsonClone));
  return deep_freeze({
    ref: expectedRef,
    semantic_model: jsonClone(semanticModel) as JsonObject,
    action_bindings: actionBindings,
    state_bindings: stateBindings,
    evidence_views: evidenceViews,
  });
}
function resolvedTheme(request: Record<string, unknown>) {
  const hasRef = Object.prototype.hasOwnProperty.call(request, "ui_theme_artifact_ref");
  const hasArtifact = Object.prototype.hasOwnProperty.call(request, "ui_theme_artifact");
  if (hasRef !== hasArtifact) fail("UI_PRODUCER_THEME_INCOMPATIBLE");
  if (!hasRef) return deep_freeze({ ref: null as string | null, presentation_rules: null as JsonObject | null });
  const expectedRef = nonEmptyString(request.ui_theme_artifact_ref, "UI_PRODUCER_THEME_INCOMPATIBLE");
  const artifact = objectValue(request.ui_theme_artifact, "UI_PRODUCER_THEME_INCOMPATIBLE");
  if (artifact.theme_ref !== expectedRef) fail("UI_PRODUCER_THEME_INCOMPATIBLE");
  if (artifact.presentation_rules === null) {
    return deep_freeze({ ref: expectedRef, presentation_rules: null as JsonObject | null });
  }
  const rules = objectValue(artifact.presentation_rules, "UI_PRODUCER_THEME_INCOMPATIBLE");
  return deep_freeze({ ref: expectedRef, presentation_rules: jsonClone(rules) as JsonObject | null });
}
function optionalObject(value: unknown): JsonObject {
  if (value === undefined) return Object.freeze({});
  return jsonClone(objectValue(value, "UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN")) as JsonObject;
}

export async function handler(input: unknown): Promise<Readonly<Record<string, unknown>>> {
  const request = objectValue(input, "UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN");
  const allowed = new Set(["ui_module_artifact_ref", "ui_module_artifact", "ui_theme_artifact_ref", "ui_theme_artifact", "host_target", "platform_context"]);
  if (Object.keys(request).some((key) => !allowed.has(key))) fail("UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN");

  const moduleArtifact = resolvedModule(request);
  const themeArtifact = resolvedTheme(request);
  const hostTarget = optionalObject(request.host_target);
  const context = optionalObject(request.platform_context);

  const hashInput = deep_freeze({
    source_ui_module_artifact_ref: moduleArtifact.ref,
    source_ui_theme_artifact_ref: themeArtifact.ref,
    producer_operation_id: "produce_platform" as const,
    ui_structure: deep_freeze({
      semantic_model: moduleArtifact.semantic_model,
      theme_presentation_rules: themeArtifact.presentation_rules,
    }),
    action_bindings: moduleArtifact.action_bindings,
    runtime_requirements: deep_freeze({
      state_bindings: moduleArtifact.state_bindings,
      evidence_views: moduleArtifact.evidence_views,
      host_target: hostTarget,
      context_kind: "PLATFORM" as const,
      context,
    }),
  });
  const content_hash = sha256(hashInput as unknown as JsonValue);
  const host_artifact = deep_freeze({
    host_artifact_ref: `ui_producer_host_artifact:${content_hash}`,
    ...hashInput,
    content_hash,
  });
  return deep_freeze({ host_artifact });
}
