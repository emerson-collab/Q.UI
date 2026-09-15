import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";

export const operation_ref = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme" as const;
export const capability_ref = "Q.UI.CAPABILITY.UI_THEME@V0109" as const;
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
const request_schema = {"additionalProperties":false,"properties":{"theme_selector":{"additionalProperties":false,"properties":{"context_constraints":{"additionalProperties":true,"type":"object"},"theme_material":{"additionalProperties":false,"properties":{"content_hash":{"pattern":"^sha256:[0-9a-f]{64}$","type":"string"},"presentation_rules":{"additionalProperties":true,"type":"object"},"theme_ref":{"minLength":3,"pattern":"^.+@V[0-9]{4}$","type":"string"},"theme_version":{"pattern":"^V[0-9]{4}$","type":"string"}},"required":["theme_ref","theme_version","presentation_rules","content_hash"],"type":"object"}},"required":["theme_material"],"type":"object"},"ui_context":{"additionalProperties":true,"type":"object"},"ui_module_artifact_ref":{"minLength":1,"type":"string"}},"required":["theme_selector"],"type":"object"} as const;
const SELECTOR_ERROR_CODE = "UI_THEME_SELECTOR_UNRESOLVED" as const;
const CONTEXT_ERROR_CODE = "UI_THEME_CONTEXT_INCOMPATIBLE" as const;
const SELECTOR_ERROR_MESSAGE = "The schema-valid self-contained theme selector fails Theme identity or Theme content-integrity resolution." as const;
const CONTEXT_ERROR_MESSAGE = "The schema-valid resolved theme is incompatible with the declared UI context constraints." as const;

function schema_violation(): never { throw new TypeError("resolve_ui_theme request payload schema violation"); }
function clone_json(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return value;
  if (typeof value === "number") { if (!Number.isFinite(value)) schema_violation(); return value; }
  if (typeof value !== "object" || value === undefined) schema_violation();
  if (seen.has(value as object)) schema_violation(); seen.add(value as object);
  if (Object.getOwnPropertySymbols(value as object).length !== 0) schema_violation();
  if (Array.isArray(value)) { const out: JsonValue[] = []; for (let i=0;i<value.length;i+=1) { if (!Object.prototype.hasOwnProperty.call(value, i)) schema_violation(); out.push(clone_json(value[i], seen)); } seen.delete(value); return out; }
  const proto = Object.getPrototypeOf(value); if (proto !== Object.prototype && proto !== null) schema_violation();
  const out: JsonObject = {}; for (const key of Object.keys(value as object)) { const d = Object.getOwnPropertyDescriptor(value as object, key); if (!d || !d.enumerable || !("value" in d)) schema_violation(); out[key] = clone_json(d.value, seen); } seen.delete(value as object); return out;
}
function is_object(value: JsonValue): value is JsonObject { return value !== null && !Array.isArray(value) && typeof value === "object"; }
function matches_type(value: JsonValue, type: string): boolean { if (type === "null") return value === null; if (type === "boolean") return typeof value === "boolean"; if (type === "string") return typeof value === "string"; if (type === "number") return typeof value === "number" && Number.isFinite(value); if (type === "integer") return typeof value === "number" && Number.isInteger(value); if (type === "array") return Array.isArray(value); if (type === "object") return is_object(value); return false; }
function validate_schema(schema: any, value: JsonValue): boolean {
  if (schema === true) return true; if (schema === false || schema === null || Array.isArray(schema) || typeof schema !== "object") return false;
  if (Object.prototype.hasOwnProperty.call(schema, "const") && canonical_json(value) !== canonical_json(schema.const)) return false;
  if (Array.isArray(schema.enum) && !schema.enum.some((x: JsonValue) => canonical_json(x) === canonical_json(value))) return false;
  if (typeof schema.type === "string" && !matches_type(value, schema.type)) return false;
  if (Array.isArray(schema.type) && !schema.type.some((x: unknown) => typeof x === "string" && matches_type(value, x))) return false;
  if (typeof value === "string") { if (typeof schema.minLength === "number" && [...value].length < schema.minLength) return false; if (typeof schema.maxLength === "number" && [...value].length > schema.maxLength) return false; if (typeof schema.pattern === "string" && !(new RegExp(schema.pattern, "u")).test(value)) return false; }
  if (Array.isArray(value)) { if (typeof schema.minItems === "number" && value.length < schema.minItems) return false; if (typeof schema.maxItems === "number" && value.length > schema.maxItems) return false; if (schema.items !== undefined && !value.every((x) => validate_schema(schema.items, x))) return false; }
  if (is_object(value)) { const required = Array.isArray(schema.required) ? schema.required : []; if (!required.every((k: unknown) => typeof k === "string" && Object.prototype.hasOwnProperty.call(value, k))) return false; const props = schema.properties && typeof schema.properties === "object" && !Array.isArray(schema.properties) ? schema.properties : {}; for (const [k,s] of Object.entries(props)) if (Object.prototype.hasOwnProperty.call(value,k) && !validate_schema(s, value[k]!)) return false; for (const k of Object.keys(value)) { if (Object.prototype.hasOwnProperty.call(props,k)) continue; if (schema.additionalProperties === false) return false; if (schema.additionalProperties && schema.additionalProperties !== true && !validate_schema(schema.additionalProperties,value[k]!)) return false; } }
  return true;
}
function canonical_json(value: JsonValue): string { if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value); if (Array.isArray(value)) return "[" + value.map(canonical_json).join(",") + "]"; const keys=Object.keys(value).sort(); return "{" + keys.map((k)=>JSON.stringify(k) + ":" + canonical_json(value[k]!)).join(",") + "}"; }
function selector_unresolved(): never { throw new StableRuntimeError(SELECTOR_ERROR_CODE, SELECTOR_ERROR_MESSAGE); }
function context_incompatible(): never { throw new StableRuntimeError(CONTEXT_ERROR_CODE, CONTEXT_ERROR_MESSAGE); }
export async function handler(input: unknown): Promise<unknown> {
  const requestValue = clone_json(input); if (!validate_schema(request_schema, requestValue) || !is_object(requestValue)) schema_violation();
  const selector = requestValue.theme_selector; if (!is_object(selector)) schema_violation(); const material = selector.theme_material; if (!is_object(material)) schema_violation();
  const themeRef = material.theme_ref; const themeVersion = material.theme_version; const presentationRules = material.presentation_rules; const contentHash = material.content_hash;
  if (typeof themeRef !== "string" || typeof themeVersion !== "string" || !is_object(presentationRules) || typeof contentHash !== "string") schema_violation();
  const delimiter = themeRef.lastIndexOf("@"); if (delimiter <= 0 || themeRef.slice(delimiter + 1) !== themeVersion) selector_unresolved();
  const hashSubject: JsonObject = { theme_ref: themeRef, theme_version: themeVersion, presentation_rules: presentationRules }; const actualHash = "sha256:" + createHash("sha256").update(canonical_json(hashSubject), "utf8").digest("hex"); if (actualHash !== contentHash) selector_unresolved();
  const constraints = selector.context_constraints; const uiContext = requestValue.ui_context; if (constraints !== undefined) { if (!is_object(constraints)) schema_violation(); if (Object.keys(constraints).length > 0) { if (uiContext === undefined || !is_object(uiContext)) context_incompatible(); for (const key of Object.keys(constraints)) { if (!Object.prototype.hasOwnProperty.call(uiContext,key) || canonical_json(uiContext[key]!) !== canonical_json(constraints[key]!)) context_incompatible(); } } }
  const copied = clone_json(presentationRules); if (!is_object(copied)) schema_violation();
  return deep_freeze({ "ui_theme_artifact": { theme_ref: themeRef, theme_version: themeVersion, presentation_rules: copied, content_hash: contentHash, resolver_capability_ref: capability_ref, resolver_operation_ref: operation_ref } });
}
register_business_operation(operation_ref, handler);
export default handler;
