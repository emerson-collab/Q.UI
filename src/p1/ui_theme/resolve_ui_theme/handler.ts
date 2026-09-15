import { createHash } from "node:crypto";

import {
  StableRuntimeError,
  deep_freeze,
} from "../../../p0/runtime_contract.ts";
import {
  register_business_operation,
} from "../../business_runtime/business_operation_registry.ts";
import {
  CAPABILITY_REF,
  RESOLVE_UI_THEME_OPERATION_REF,
} from "../../export/ui_theme/contracts.ts";
import type {
  JsonObject,
  JsonValue,
  ResolveUIThemeRequest,
  ResolveUIThemeResponse,
  UIThemeMaterial,
  UIThemeSelector,
} from "../../export/ui_theme/types.ts";

const SHA256_RE = /^sha256:[0-9a-f]{64}$/;
const VERSION_RE = /^V[0-9]{4}$/;
const THEME_REF_RE = /^.+@V[0-9]{4}$/;

const SELECTOR_UNRESOLVED_MESSAGE =
  "The schema-valid self-contained theme selector fails Theme identity or Theme content-integrity resolution.";
const CONTEXT_INCOMPATIBLE_MESSAGE =
  "The schema-valid resolved theme is incompatible with the declared UI context constraints.";

function schema_violation(): never {
  throw new TypeError("resolve_ui_theme request payload schema violation");
}

function assert_well_formed_unicode(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) schema_violation();
      index += 1;
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) schema_violation();
  }
}

function assert_data_descriptor(
  descriptor: PropertyDescriptor,
): asserts descriptor is PropertyDescriptor & { value: unknown } {
  if (!descriptor.enumerable || !("value" in descriptor)) schema_violation();
}

function clone_json_value(
  value: unknown,
  seen = new WeakSet<object>(),
): JsonValue {
  if (value === null || typeof value === "boolean") return value;

  if (typeof value === "string") {
    assert_well_formed_unicode(value);
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) schema_violation();
    return value;
  }

  if (
    typeof value === "undefined"
    || typeof value === "function"
    || typeof value === "symbol"
    || typeof value === "bigint"
  ) {
    schema_violation();
  }

  if (typeof value !== "object") schema_violation();
  if (seen.has(value)) schema_violation();
  seen.add(value);

  if (Object.getOwnPropertySymbols(value).length !== 0) schema_violation();

  if (Array.isArray(value)) {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Object.keys(value);
    if (keys.length !== value.length) schema_violation();

    const output: JsonValue[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const key = String(index);
      const descriptor = descriptors[key];
      if (descriptor === undefined) schema_violation();
      assert_data_descriptor(descriptor);
      output.push(clone_json_value(descriptor.value, seen));
    }

    for (const key of Object.keys(descriptors)) {
      if (key === "length") continue;
      if (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length) {
        schema_violation();
      }
    }

    seen.delete(value);
    return output;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) schema_violation();

  const output = Object.create(null) as Record<string, JsonValue>;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Object.keys(descriptors)) {
    const descriptor = descriptors[key]!;
    assert_data_descriptor(descriptor);
    assert_well_formed_unicode(key);
    output[key] = clone_json_value(descriptor.value, seen);
  }

  seen.delete(value);
  return output;
}

function is_json_object(value: JsonValue): value is JsonObject {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

function exact_keys(
  value: JsonObject,
  allowed: readonly string[],
  required: readonly string[],
): boolean {
  const keys = Object.keys(value);
  const allowedSet = new Set(allowed);
  return (
    keys.every((key) => allowedSet.has(key))
    && required.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  );
}

function validate_theme_material(value: JsonValue): UIThemeMaterial {
  if (!is_json_object(value)) schema_violation();
  if (
    !exact_keys(
      value,
      ["theme_ref", "theme_version", "presentation_rules", "content_hash"],
      ["theme_ref", "theme_version", "presentation_rules", "content_hash"],
    )
  ) {
    schema_violation();
  }

  const theme_ref = value.theme_ref;
  const theme_version = value.theme_version;
  const presentation_rules = value.presentation_rules;
  const content_hash = value.content_hash;

  if (
    typeof theme_ref !== "string"
    || theme_ref.length < 3
    || !THEME_REF_RE.test(theme_ref)
    || typeof theme_version !== "string"
    || !VERSION_RE.test(theme_version)
    || !is_json_object(presentation_rules)
    || typeof content_hash !== "string"
    || !SHA256_RE.test(content_hash)
  ) {
    schema_violation();
  }

  return {
    theme_ref,
    theme_version,
    presentation_rules,
    content_hash,
  };
}

function validate_theme_selector(value: JsonValue): UIThemeSelector {
  if (!is_json_object(value)) schema_violation();
  if (
    !exact_keys(
      value,
      ["theme_material", "context_constraints"],
      ["theme_material"],
    )
  ) {
    schema_violation();
  }

  const theme_material = validate_theme_material(value.theme_material);
  const context_constraints = value.context_constraints;
  if (context_constraints !== undefined && !is_json_object(context_constraints)) {
    schema_violation();
  }

  return context_constraints === undefined
    ? { theme_material }
    : { theme_material, context_constraints };
}

function validate_request(input: unknown): ResolveUIThemeRequest {
  const value = clone_json_value(input);
  if (!is_json_object(value)) schema_violation();
  if (
    !exact_keys(
      value,
      ["theme_selector", "ui_context", "ui_module_artifact_ref"],
      ["theme_selector"],
    )
  ) {
    schema_violation();
  }

  const theme_selector = validate_theme_selector(value.theme_selector);
  const ui_context = value.ui_context;
  const ui_module_artifact_ref = value.ui_module_artifact_ref;

  if (ui_context !== undefined && !is_json_object(ui_context)) schema_violation();
  if (
    ui_module_artifact_ref !== undefined
    && (typeof ui_module_artifact_ref !== "string" || ui_module_artifact_ref.length < 1)
  ) {
    schema_violation();
  }

  return {
    theme_selector,
    ...(ui_context === undefined ? {} : { ui_context }),
    ...(ui_module_artifact_ref === undefined
      ? {}
      : { ui_module_artifact_ref }),
  };
}

function canonical_json(value: JsonValue): string {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);

  if (typeof value === "number") {
    if (!Number.isFinite(value)) schema_violation();
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    assert_well_formed_unicode(value);
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonical_json(item)).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${canonical_json(value[key]!)}`)
    .join(",")}}`;
}

function content_hash(material: UIThemeMaterial): string {
  const hashSubject: JsonObject = {
    theme_ref: material.theme_ref,
    theme_version: material.theme_version,
    presentation_rules: material.presentation_rules,
  };
  return `sha256:${createHash("sha256")
    .update(canonical_json(hashSubject), "utf8")
    .digest("hex")}`;
}

function identity_tuple_is_coherent(material: UIThemeMaterial): boolean {
  const delimiter = material.theme_ref.lastIndexOf("@");
  return (
    delimiter > 0
    && material.theme_ref.slice(delimiter + 1) === material.theme_version
  );
}

function context_is_compatible(
  constraints: JsonObject | undefined,
  context: JsonObject | undefined,
): boolean {
  if (constraints === undefined || Object.keys(constraints).length === 0) {
    return true;
  }
  if (context === undefined) return false;

  for (const key of Object.keys(constraints)) {
    if (!Object.prototype.hasOwnProperty.call(context, key)) return false;
    if (canonical_json(context[key]!) !== canonical_json(constraints[key]!)) {
      return false;
    }
  }
  return true;
}

function selector_unresolved(): never {
  throw new StableRuntimeError(
    "UI_THEME_SELECTOR_UNRESOLVED",
    SELECTOR_UNRESOLVED_MESSAGE,
  );
}

function context_incompatible(): never {
  throw new StableRuntimeError(
    "UI_THEME_CONTEXT_INCOMPATIBLE",
    CONTEXT_INCOMPATIBLE_MESSAGE,
  );
}

export async function handler(input: unknown): Promise<ResolveUIThemeResponse> {
  const request = validate_request(input);
  const material = request.theme_selector.theme_material;

  if (!identity_tuple_is_coherent(material)) selector_unresolved();
  if (content_hash(material) !== material.content_hash) selector_unresolved();

  if (
    !context_is_compatible(
      request.theme_selector.context_constraints,
      request.ui_context,
    )
  ) {
    context_incompatible();
  }

  const presentation_rules = clone_json_value(material.presentation_rules);
  if (!is_json_object(presentation_rules)) schema_violation();

  return deep_freeze({
    ui_theme_artifact: {
      theme_ref: material.theme_ref,
      theme_version: material.theme_version,
      presentation_rules,
      content_hash: material.content_hash,
      resolver_capability_ref: CAPABILITY_REF,
      resolver_operation_ref: RESOLVE_UI_THEME_OPERATION_REF,
    },
  });
}

register_business_operation(RESOLVE_UI_THEME_OPERATION_REF, handler);

export default handler;
