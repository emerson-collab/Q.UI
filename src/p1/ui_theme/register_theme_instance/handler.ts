import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { REGISTER_THEME_INSTANCE_OPERATION_REF } from "../../export/ui_theme/contracts.ts";
import type {
  JsonObject, JsonValue, RegisterThemeInstanceRequest, RegisterThemeInstanceResponse,
  ThemeInstanceRecord, ThemeMaterial, ThemePhase, ThemeSelectionRecord,
} from "../../export/ui_theme/types.ts";

const SHA256_RE = /^sha256:[0-9a-f]{64}$/;
const REGISTER_MESSAGES = Object.freeze({
  UI_THEME_INSTANCE_PHASE_MATERIAL_MISMATCH: "The supplied Theme material kind does not equal the declared Theme phase.",
  UI_THEME_INSTANCE_REF_CONFLICT: "The exact theme_instance_ref already exists with a different canonical content hash.",
  UI_THEME_INSTANCE_IDENTITY_CONFLICT: "The supplied Theme Instance ref or exact instance_id plus instance_version identity conflicts with a different registered immutable Theme Instance identity or content hash.",
} as const);

export type ThemeInstanceRegistrationResult =
  | { readonly kind: "REGISTERED" | "EXISTING"; readonly record: ThemeInstanceRecord }
  | { readonly kind: "REF_CONFLICT"; readonly record: ThemeInstanceRecord }
  | { readonly kind: "IDENTITY_CONFLICT"; readonly record: ThemeInstanceRecord };

export interface UIThemePersistence {
  register_theme_instance(record: ThemeInstanceRecord): Promise<ThemeInstanceRegistrationResult>;
  list_theme_instances(): Promise<readonly ThemeInstanceRecord[]>;
  get_theme_instance_by_ref(theme_instance_ref: string): Promise<ThemeInstanceRecord | null>;
  set_theme_selection(selection: ThemeSelectionRecord): Promise<void>;
  get_theme_selection(subject_ref: string, theme_phase: ThemePhase): Promise<ThemeSelectionRecord | null>;
}

let persistence: UIThemePersistence | undefined;
export function install_ui_theme_persistence(next: UIThemePersistence): void {
  if (persistence !== undefined && persistence !== next) throw new Error("UI_THEME_PERSISTENCE_ALREADY_BOUND");
  persistence = next;
}
export function require_ui_theme_persistence(): UIThemePersistence {
  if (persistence === undefined) throw new Error("UI_THEME_PERSISTENCE_UNBOUND");
  return persistence;
}

export function schema_violation(): never { throw new TypeError("UI_THEME request payload schema violation"); }

function assert_well_formed_unicode(value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    const c = value.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const n = value.charCodeAt(i + 1);
      if (!(n >= 0xdc00 && n <= 0xdfff)) schema_violation();
      i += 1;
    } else if (c >= 0xdc00 && c <= 0xdfff) schema_violation();
  }
}

export function clone_json_value(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") { assert_well_formed_unicode(value); return value; }
  if (typeof value === "number") { if (!Number.isFinite(value)) schema_violation(); return value; }
  if (["undefined","function","symbol","bigint"].includes(typeof value)) schema_violation();
  if (typeof value !== "object") schema_violation();
  if (seen.has(value)) schema_violation();
  seen.add(value);
  if (Object.getOwnPropertySymbols(value).length !== 0) schema_violation();
  if (Array.isArray(value)) {
    const out: JsonValue[] = [];
    for (let i=0;i<value.length;i+=1) {
      const d=Object.getOwnPropertyDescriptor(value,String(i));
      if (d===undefined || !("value" in d) || !d.enumerable) schema_violation();
      out.push(clone_json_value(d.value,seen));
    }
    if (Object.keys(value).length !== value.length) schema_violation();
    seen.delete(value); return out;
  }
  const proto=Object.getPrototypeOf(value); if (proto!==Object.prototype && proto!==null) schema_violation();
  const out: Record<string,JsonValue>={};
  for (const [key,d] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!("value" in d) || !d.enumerable) schema_violation();
    assert_well_formed_unicode(key); out[key]=clone_json_value(d.value,seen);
  }
  seen.delete(value); return out;
}

export function is_json_object(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exact_keys(value: JsonObject, allowed: readonly string[], required: readonly string[]): boolean {
  const keys=Object.keys(value), set=new Set(allowed);
  return keys.every(k=>set.has(k)) && required.every(k=>Object.prototype.hasOwnProperty.call(value,k));
}
export function validate_theme_phase(value: JsonValue): ThemePhase {
  if (value !== "SKELETON" && value !== "RENDER") schema_violation(); return value;
}
function require_object(value: JsonValue): JsonObject { if (!is_json_object(value)) schema_violation(); return value; }

export function validate_theme_material(value: JsonValue): ThemeMaterial {
  const v=require_object(value);
  if (v.material_kind === "SKELETON") {
    const keys=["material_kind","role_presentation","navigation_treatment","arrangement_treatment","grouping_treatment","progressive_disclosure_treatment","responsive_treatment","density_treatment","interaction_presentation_treatment"] as const;
    if (!exact_keys(v,keys,keys)) schema_violation();
    for (const k of keys.slice(1)) require_object(v[k]!);
    return v as unknown as ThemeMaterial;
  }
  if (v.material_kind === "RENDER") {
    const keys=["material_kind","color","typography","spacing","radius_and_shape","border_and_elevation","iconography_appearance","visual_density","surface_appearance","component_appearance","visual_motion_treatment","appearance_variants","accessibility_visual_requirements"] as const;
    if (!exact_keys(v,keys,keys)) schema_violation();
    for (const k of keys.slice(1)) require_object(v[k]!);
    return v as unknown as ThemeMaterial;
  }
  schema_violation();
}

export function canonical_json(value: JsonValue): string {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonical_json).join(",") + "]";
  const objectValue = value as JsonObject;
  return "{" + Object.keys(objectValue).sort().map(k=>JSON.stringify(k) + ":" + canonical_json(objectValue[k]!)).join(",") + "}";
}
function sha256(value: JsonValue): string { return "sha256:" + createHash("sha256").update(canonical_json(value),"utf8").digest("hex"); }

export function theme_instance_hash(record: Omit<ThemeInstanceRecord,"content_hash">): string {
  return sha256({
    instance_id: record.instance_id, instance_version: record.instance_version, theme_instance_ref: record.theme_instance_ref,
    theme_phase: record.theme_phase, theme_name: record.theme_name, theme_material: record.theme_material as unknown as JsonValue,
  });
}
export function theme_selection_hash(record: Omit<ThemeSelectionRecord,"selection_hash">): string {
  return sha256({
    subject_ref:record.subject_ref, theme_phase:record.theme_phase, selected_theme_instance_ref:record.selected_theme_instance_ref,
    selected_theme_instance_hash:record.selected_theme_instance_hash, selection_source:record.selection_source,
  });
}

export function validate_theme_instance_record(input: unknown): ThemeInstanceRecord {
  const value=clone_json_value(input); if (!is_json_object(value)) schema_violation();
  const keys=["instance_id","instance_version","theme_instance_ref","theme_phase","theme_name","theme_material","content_hash"] as const;
  if (!exact_keys(value,keys,keys)) schema_violation();
  for (const k of ["instance_id","instance_version","theme_instance_ref","theme_name"] as const) if (typeof value[k]!=="string" || value[k]!.length<1) schema_violation();
  const phase=validate_theme_phase(value.theme_phase!); const material=validate_theme_material(value.theme_material!);
  if (typeof value.content_hash!=="string" || !SHA256_RE.test(value.content_hash)) schema_violation();
  if (material.material_kind!==phase) schema_violation();
  const record={instance_id:value.instance_id as string,instance_version:value.instance_version as string,theme_instance_ref:value.theme_instance_ref as string,theme_phase:phase,theme_name:value.theme_name as string,theme_material:material,content_hash:value.content_hash as string};
  if (theme_instance_hash(record)!==record.content_hash) schema_violation();
  return deep_freeze(record);
}

export function validate_theme_selection_record(input: unknown): ThemeSelectionRecord {
  const value=clone_json_value(input); if (!is_json_object(value)) schema_violation();
  const keys=["subject_ref","theme_phase","selected_theme_instance_ref","selected_theme_instance_hash","selection_source","selection_hash"] as const;
  if (!exact_keys(value,keys,keys)) schema_violation();
  if (typeof value.subject_ref!=="string" || value.subject_ref.length<1 || typeof value.selected_theme_instance_ref!=="string" || value.selected_theme_instance_ref.length<1) schema_violation();
  const phase=validate_theme_phase(value.theme_phase!);
  if (typeof value.selected_theme_instance_hash!=="string" || !SHA256_RE.test(value.selected_theme_instance_hash) || value.selection_source!=="MANUAL" || typeof value.selection_hash!=="string" || !SHA256_RE.test(value.selection_hash)) schema_violation();
  const record={subject_ref:value.subject_ref,theme_phase:phase,selected_theme_instance_ref:value.selected_theme_instance_ref,selected_theme_instance_hash:value.selected_theme_instance_hash,selection_source:"MANUAL" as const,selection_hash:value.selection_hash};
  if (theme_selection_hash(record)!==record.selection_hash) schema_violation();
  return deep_freeze(record);
}

function validate_request(input: unknown): RegisterThemeInstanceRequest {
  const value=clone_json_value(input); if (!is_json_object(value)) schema_violation();
  const keys=["instance_id","instance_version","theme_instance_ref","theme_phase","theme_name","theme_material"] as const;
  if (!exact_keys(value,keys,keys)) schema_violation();
  for (const k of ["instance_id","instance_version","theme_instance_ref","theme_name"] as const) if (typeof value[k]!=="string" || value[k]!.length<1) schema_violation();
  return {instance_id:value.instance_id as string,instance_version:value.instance_version as string,theme_instance_ref:value.theme_instance_ref as string,theme_phase:validate_theme_phase(value.theme_phase!),theme_name:value.theme_name as string,theme_material:validate_theme_material(value.theme_material!)};
}

function stable(code: keyof typeof REGISTER_MESSAGES): never { throw new StableRuntimeError(code,REGISTER_MESSAGES[code]); }

export async function handler(input: unknown): Promise<RegisterThemeInstanceResponse> {
  const request=validate_request(input);
  if (request.theme_material.material_kind!==request.theme_phase) stable("UI_THEME_INSTANCE_PHASE_MATERIAL_MISMATCH");
  const partial={instance_id:request.instance_id,instance_version:request.instance_version,theme_instance_ref:request.theme_instance_ref,theme_phase:request.theme_phase,theme_name:request.theme_name,theme_material:request.theme_material};
  const record=deep_freeze({...partial,content_hash:theme_instance_hash(partial)} satisfies ThemeInstanceRecord);
  const result=await require_ui_theme_persistence().register_theme_instance(record);
  if (result.kind==="REF_CONFLICT") stable("UI_THEME_INSTANCE_REF_CONFLICT");
  if (result.kind==="IDENTITY_CONFLICT") stable("UI_THEME_INSTANCE_IDENTITY_CONFLICT");
  const exact=validate_theme_instance_record(result.record);
  if (exact.theme_instance_ref!==record.theme_instance_ref || exact.instance_id!==record.instance_id || exact.instance_version!==record.instance_version || exact.content_hash!==record.content_hash) stable("UI_THEME_INSTANCE_IDENTITY_CONFLICT");
  return deep_freeze({theme_instance:exact});
}
register_business_operation(REGISTER_THEME_INSTANCE_OPERATION_REF,handler);
export default handler;
