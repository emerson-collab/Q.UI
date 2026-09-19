import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0117" as const;
export const CAPABILITY_CONTRACT_HASH = "sha256:f140c539648338fe408fe60aa7e84e8e41bcae8583aa9150f7a5ba3e6a222b01" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/resolve_ui_module` as const;
export const SEMANTIC_MODEL_VERSION = "Q_UI_MODULE_SEMANTIC_MODEL_V6" as const;

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const REQUIRED_SOURCE_SECTIONS = Object.freeze([
  "identity",
  "ownership",
  "operations",
  "interfaces",
  "contracts",
  "type_closure",
  "stable_errors",
  "dependencies",
  "extraction",
  "compatibility",
  "source_integrity",
  "persistence_requirements",
  "capability_rules",
  "external_provider_surface",
  "interface_inventory",
  "operational_relations",
  "state_model",
  "permission_model",
  "rule_bindings",
] as const);

const PLAIN_CONTROL_MAPPING = Object.freeze({
  string: "TEXT_INPUT",
  integer: "NUMBER_INPUT",
  number: "NUMBER_INPUT",
  boolean: "BOOLEAN_INPUT",
  array: "COLLECTION_INPUT",
  object: "STRUCTURED_INPUT",
} as const);

const RESPONSE_VIEW_MAPPING = Object.freeze({
  string: "VALUE_VIEW",
  integer: "VALUE_VIEW",
  number: "VALUE_VIEW",
  boolean: "VALUE_VIEW",
  array: "COLLECTION_VIEW",
  object: "STRUCTURED_VIEW",
} as const);

const TEMPORAL_FORMAT_BY_KIND = Object.freeze({
  DATE: "date",
  TIME: "time",
  DATE_TIME: "date-time",
  DURATION: "duration",
} as const);

const SPECIAL_SEMANTIC_KEYS = new Set([
  "reference_owner_mode",
  "reference_owner_ref",
  "local_dependency_ref",
  "resolution_mode",
  "selection_cardinality",
  "manual_entry_allowed",
  "identity_field_path",
  "display_field_paths",
  "read_operation_ref",
  "read_interface_ref",
  "read_request_identity_field_path",
  "read_result_object_path",
  "lookup_operation_ref",
  "lookup_interface_ref",
  "lookup_request_input_template",
  "lookup_result_collection_path",
  "temporal_kind",
  "range_start_path",
  "range_end_path",
  "range_endpoint_kind",
]);

function fail(code: string, message: string): never {
  throw new StableRuntimeError(code, message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function objectValue(value: unknown, code: string, field: string): Record<string, unknown> {
  if (!isObject(value)) fail(code, `${field} must be an object`);
  return value;
}

function stringValue(value: unknown, code: string, field: string): string {
  if (typeof value !== "string" || value.length === 0) fail(code, `${field} must be a non-empty string`);
  return value;
}

function hashValue(value: unknown, code: string, field: string): string {
  const text = stringValue(value, code, field);
  if (!SHA256.test(text)) fail(code, `${field} must be sha256:<64_lower_hex>`);
  return text;
}

function booleanValue(value: unknown, code: string, field: string): boolean {
  if (typeof value !== "boolean") fail(code, `${field} must be boolean`);
  return value;
}

function arrayValue(value: unknown, code: string, field: string): readonly unknown[] {
  if (!Array.isArray(value)) fail(code, `${field} must be an array`);
  return value;
}

function stringArray(value: unknown, code: string, field: string): readonly string[] {
  const values = arrayValue(value, code, field).map((item, index) => stringValue(item, code, `${field}[${index}]`));
  return Object.freeze(values);
}

function pathValue(value: unknown, code: string, field: string): readonly string[] {
  const path = stringArray(value, code, field);
  if (path.length === 0) fail(code, `${field} must not be empty`);
  return path;
}

function nullableString(value: unknown, code: string, field: string): string | null {
  if (value === undefined || value === null) return null;
  return stringValue(value, code, field);
}

function nullablePath(value: unknown, code: string, field: string): readonly string[] | null {
  if (value === undefined || value === null) return null;
  return pathValue(value, code, field);
}

/**
 * Capability Contract owner-local field paths may be carried as a single exact field
 * name or as an explicit segment array. UI Module normalizes only that carrier shape;
 * it never splits dotted strings or invents aliases.
 */
function sourcePathValue(value: unknown, code: string, field: string): readonly string[] {
  if (typeof value === "string") return Object.freeze([stringValue(value, code, field)]);
  return pathValue(value, code, field);
}

function nullableSourcePath(value: unknown, code: string, field: string): readonly string[] | null {
  if (value === undefined || value === null) return null;
  return sourcePathValue(value, code, field);
}

function pathListValue(value: unknown, code: string, field: string): readonly (readonly string[])[] {
  return Object.freeze(arrayValue(value, code, field).map((item, index) => pathValue(item, code, `${field}[${index}]`)));
}

function nullablePathList(value: unknown, code: string, field: string): readonly (readonly string[])[] | null {
  if (value === undefined || value === null) return null;
  return pathListValue(value, code, field);
}

function sourcePathListValue(value: unknown, code: string, field: string): readonly (readonly string[])[] {
  return Object.freeze(arrayValue(value, code, field).map((item, index) => (
    typeof item === "string"
      ? Object.freeze([stringValue(item, code, `${field}[${index}]`)])
      : sourcePathValue(item, code, `${field}[${index}]`)
  )));
}

function nullableSourcePathList(value: unknown, code: string, field: string): readonly (readonly string[])[] | null {
  if (value === undefined || value === null) return null;
  return sourcePathListValue(value, code, field);
}

function assertAllowedKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, code: string, field: string): void {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) fail(code, `${field} contains undeclared keys: ${unknown.join(", ")}`);
}

function clonePreservingOrder(value: unknown): unknown {
  if (Array.isArray(value)) return Object.freeze(value.map(clonePreservingOrder));
  if (isObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) out[key] = clonePreservingOrder(nested);
    return Object.freeze(out);
  }
  return value;
}

function compareUnicodeCodepoints(left: string, right: string): number {
  const a = Array.from(left);
  const b = Array.from(right);
  const n = Math.min(a.length, b.length);
  for (let index = 0; index < n; index += 1) {
    const ac = a[index]!.codePointAt(0)!;
    const bc = b[index]!.codePointAt(0)!;
    if (ac !== bc) return ac - bc;
  }
  return a.length - b.length;
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("UI_MODULE_OUTPUT_GRAMMAR_INVALID", "artifact JSON contains a non-finite number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isObject(value)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort(compareUnicodeCodepoints)) {
      const nested = value[key];
      if (nested === undefined || typeof nested === "function" || typeof nested === "symbol" || typeof nested === "bigint") {
        fail("UI_MODULE_OUTPUT_GRAMMAR_INVALID", `artifact JSON contains unsupported value at ${key}`);
      }
      out[key] = canonicalize(nested);
    }
    return out;
  }
  fail("UI_MODULE_OUTPUT_GRAMMAR_INVALID", `artifact JSON contains unsupported value type ${typeof value}`);
}

function sha256CanonicalJson(value: unknown): string {
  const canonical = canonicalize(value);
  return `sha256:${createHash("sha256").update(JSON.stringify(canonical), "utf8").digest("hex")}`;
}

function collectStrings(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string") out.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (isObject(value)) Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

function effectiveSchemaType(schema: Record<string, unknown>, code: string, field: string): keyof typeof PLAIN_CONTROL_MAPPING {
  const declared = schema.type;
  if (typeof declared === "string" && declared in PLAIN_CONTROL_MAPPING) return declared as keyof typeof PLAIN_CONTROL_MAPPING;
  if (Array.isArray(declared)) {
    const nonNull = declared.filter((item): item is string => typeof item === "string" && item !== "null");
    if (nonNull.length === 1 && nonNull[0]! in PLAIN_CONTROL_MAPPING) return nonNull[0]! as keyof typeof PLAIN_CONTROL_MAPPING;
    if (nonNull.length > 1) fail(code, `${field}.type has multiple non-null variants without an exact source discriminator`);
  }
  fail(code, `${field} has no exact supported JSON Schema type`);
}

function schemaAtPath(root: Record<string, unknown>, path: readonly string[], code: string, field: string): Record<string, unknown> {
  let current = root;
  for (const segment of path) {
    const properties = objectValue(current.properties, code, `${field}.properties`);
    const next = properties[segment];
    if (next === undefined) fail(code, `${field} path ${JSON.stringify(path)} is unresolved`);
    current = objectValue(next, code, `${field}.${segment}`);
  }
  return current;
}

function schemaForSelectedReference(fieldSchema: Record<string, unknown>, cardinality: string, field: string): Record<string, unknown> {
  const type = effectiveSchemaType(fieldSchema, "UI_MODULE_REFERENCE_BINDING_INVALID", field);
  if (cardinality === "ONE") {
    if (type === "array") fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} cardinality ONE cannot use an array schema`);
    return fieldSchema;
  }
  if (cardinality === "MANY") {
    if (type !== "array") fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} cardinality MANY requires an array schema`);
    return objectValue(fieldSchema.items, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.items`);
  }
  fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} selection_cardinality is invalid`);
}

function objectByRef(
  collection: Record<string, unknown>,
  refField: string,
  ref: string,
  code: string,
  label: string,
): Record<string, unknown> {
  const matches = Object.values(collection).filter((value) => isObject(value) && value[refField] === ref) as Record<string, unknown>[];
  if (matches.length !== 1) fail(code, `${label} ${ref} must resolve exactly once`);
  return matches[0]!;
}

function contractByRef(contracts: Record<string, unknown>, ref: string): Record<string, unknown> {
  return objectByRef(contracts, "contract_ref", ref, "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED", "contract");
}

function contractSchema(contract: Record<string, unknown>, ref: string): Record<string, unknown> {
  const candidates = [
    ["schema", contract.schema],
    ["input_schema", contract.input_schema],
    ["runtime_result_schema", contract.runtime_result_schema],
  ].filter((entry): entry is [string, Record<string, unknown>] => isObject(entry[1]));

  if (candidates.length !== 1) {
    fail(
      "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
      `${ref} must expose exactly one machine-readable owner-local payload schema`,
    );
  }
  return candidates[0]![1];
}

function ownerLocalSchemaShape(
  schema: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  code: string,
  field: string,
  seen: ReadonlySet<string> = new Set<string>(),
): Record<string, unknown> {
  if (schema.$ref === undefined) return schema;

  const ref = stringValue(schema.$ref, code, `${field}.$ref`);
  const prefix = `${sourceContractRef}#/type_closure/schemas/`;
  if (!ref.startsWith(prefix)) {
    fail(code, `${field} references schema outside the exact source owner type_closure: ${ref}`);
  }
  const schemaName = ref.slice(prefix.length);
  if (schemaName.length === 0 || schemaName.includes("/")) {
    fail(code, `${field} has an unsupported owner-local schema ref ${ref}`);
  }
  if (seen.has(ref)) fail(code, `${field} contains an owner-local schema reference cycle at ${ref}`);

  const typeClosure = objectValue(source.type_closure, code, "source.type_closure");
  const schemas = objectValue(typeClosure.schemas, code, "source.type_closure.schemas");
  const target = objectValue(schemas[schemaName], code, `source.type_closure.schemas.${schemaName}`);
  const nextSeen = new Set(seen);
  nextSeen.add(ref);
  return ownerLocalSchemaShape(target, source, sourceContractRef, code, field, nextSeen);
}

function sourceSchemaAtPath(
  root: Record<string, unknown>,
  path: readonly string[],
  source: Record<string, unknown>,
  sourceContractRef: string,
  code: string,
  field: string,
): Record<string, unknown> {
  let current = root;
  for (const segment of path) {
    const shape = ownerLocalSchemaShape(current, source, sourceContractRef, code, field);
    const properties = objectValue(shape.properties, code, `${field}.properties`);
    const next = properties[segment];
    if (next === undefined) fail(code, `${field} path ${JSON.stringify(path)} is unresolved`);
    current = objectValue(next, code, `${field}.${segment}`);
  }
  return ownerLocalSchemaShape(current, source, sourceContractRef, code, field);
}

function assertReferenceCarrierTypeCompatible(
  selectedSchema: Record<string, unknown>,
  candidateSchema: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  field: string,
  role: string,
): void {
  const selectedType = effectiveSchemaType(
    ownerLocalSchemaShape(selectedSchema, source, sourceContractRef, "UI_MODULE_REFERENCE_BINDING_INVALID", field),
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.selected_reference_value`,
  );
  const candidateType = effectiveSchemaType(
    ownerLocalSchemaShape(candidateSchema, source, sourceContractRef, "UI_MODULE_REFERENCE_BINDING_INVALID", field),
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.${role}`,
  );
  if (selectedType !== candidateType) {
    fail(
      "UI_MODULE_REFERENCE_BINDING_INVALID",
      `${field} ${role} schema type ${candidateType} is incompatible with selected reference value type ${selectedType}`,
    );
  }
}


const UNSUPPORTED_TEMPLATE_ASSERTION_KEYWORDS = Object.freeze([
  "allOf", "anyOf", "oneOf", "not", "if", "then", "else",
  "dependentRequired", "dependentSchemas", "propertyNames", "patternProperties",
  "unevaluatedProperties", "unevaluatedItems", "contains", "minContains", "maxContains",
  "prefixItems", "multipleOf",
] as const);

function jsonValueKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number" && Number.isInteger(value)) return "integer";
  return typeof value;
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function assertTemplateConformsToSchema(
  value: unknown,
  schema: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  field: string,
): void {
  const shape = ownerLocalSchemaShape(
    schema,
    source,
    sourceContractRef,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    field,
  );

  for (const keyword of UNSUPPORTED_TEMPLATE_ASSERTION_KEYWORDS) {
    if (shape[keyword] !== undefined) {
      fail(
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field} uses unsupported JSON Schema assertion keyword ${keyword}; exact template conformance cannot be proven`,
      );
    }
  }

  if (shape.const !== undefined && !jsonEqual(value, shape.const)) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} does not satisfy const`);
  }
  if (shape.enum !== undefined) {
    const values = arrayValue(shape.enum, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.enum`);
    if (!values.some((candidate) => jsonEqual(value, candidate))) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} does not satisfy enum`);
    }
  }

  const declaredType = shape.type;
  if (declaredType !== undefined) {
    const allowed = (Array.isArray(declaredType) ? declaredType : [declaredType]).map((item, index) =>
      stringValue(item, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.type[${index}]`)
    );
    const actual = jsonValueKind(value);
    const matches = allowed.some((type) => (
      type === actual || (type === "number" && actual === "integer")
    ));
    if (!matches) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} has JSON kind ${actual}, expected ${allowed.join("|")}`);
    }
  }

  if (typeof value === "string") {
    if (shape.minLength !== undefined) {
      const minLength = Number(shape.minLength);
      if (!Number.isInteger(minLength) || minLength < 0 || Array.from(value).length < minLength) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates minLength`);
      }
    }
    if (shape.maxLength !== undefined) {
      const maxLength = Number(shape.maxLength);
      if (!Number.isInteger(maxLength) || maxLength < 0 || Array.from(value).length > maxLength) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates maxLength`);
      }
    }
    if (shape.pattern !== undefined) {
      const pattern = stringValue(shape.pattern, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.pattern`);
      let expression: RegExp;
      try {
        expression = new RegExp(pattern, "u");
      } catch {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.pattern is invalid`);
      }
      if (!expression.test(value)) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates pattern`);
    }
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} must be finite JSON number`);
    if (shape.minimum !== undefined && value < Number(shape.minimum)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates minimum`);
    }
    if (shape.maximum !== undefined && value > Number(shape.maximum)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates maximum`);
    }
    if (shape.exclusiveMinimum !== undefined && value <= Number(shape.exclusiveMinimum)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates exclusiveMinimum`);
    }
    if (shape.exclusiveMaximum !== undefined && value >= Number(shape.exclusiveMaximum)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates exclusiveMaximum`);
    }
  }

  if (Array.isArray(value)) {
    if (shape.minItems !== undefined && value.length < Number(shape.minItems)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates minItems`);
    }
    if (shape.maxItems !== undefined && value.length > Number(shape.maxItems)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates maxItems`);
    }
    if (shape.uniqueItems === true) {
      for (let i = 0; i < value.length; i += 1) {
        if (value.slice(0, i).some((item) => jsonEqual(item, value[i]))) {
          fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates uniqueItems`);
        }
      }
    }
    if (shape.items !== undefined) {
      const itemSchema = objectValue(shape.items, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.items`);
      value.forEach((item, index) =>
        assertTemplateConformsToSchema(item, itemSchema, source, sourceContractRef, `${field}[${index}]`)
      );
    }
  }

  if (isObject(value)) {
    const properties = shape.properties === undefined
      ? {}
      : objectValue(shape.properties, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.properties`);
    const required = shape.required === undefined
      ? []
      : stringArray(shape.required, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.required`);
    for (const key of required) {
      if (!(key in value)) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} is missing required property ${key}`);
    }
    if (shape.minProperties !== undefined && Object.keys(value).length < Number(shape.minProperties)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates minProperties`);
    }
    if (shape.maxProperties !== undefined && Object.keys(value).length > Number(shape.maxProperties)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} violates maxProperties`);
    }

    for (const [key, nested] of Object.entries(value)) {
      const declared = properties[key];
      if (declared !== undefined) {
        assertTemplateConformsToSchema(
          nested,
          objectValue(declared, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.properties.${key}`),
          source,
          sourceContractRef,
          `${field}.${key}`,
        );
        continue;
      }
      if (shape.additionalProperties === false) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} contains undeclared property ${key}`);
      }
      if (isObject(shape.additionalProperties)) {
        assertTemplateConformsToSchema(
          nested,
          shape.additionalProperties,
          source,
          sourceContractRef,
          `${field}.${key}`,
        );
      }
    }
  }
}

function fieldSemantics(descriptor: Record<string, unknown>, field: string): Record<string, unknown> {
  const semantics = objectValue(
    descriptor.x_q_field_semantics,
    "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
    `${field}.x_q_field_semantics`,
  );
  const kind = stringValue(
    semantics.semantic_kind,
    "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
    `${field}.x_q_field_semantics.semantic_kind`,
  );
  if (!["PLAIN_VALUE", "BUSINESS_REFERENCE", "TEMPORAL"].includes(kind)) {
    fail("UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE", `${field} has unknown semantic_kind ${kind}`);
  }
  if (kind === "PLAIN_VALUE") {
    const conflicts = Object.keys(semantics).filter((key) => key !== "semantic_kind" && SPECIAL_SEMANTIC_KEYS.has(key));
    if (conflicts.length > 0) {
      fail("UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE", `${field} PLAIN_VALUE contains special semantic material`);
    }
    const type = descriptor.type;
    const effective = typeof type === "string" || Array.isArray(type)
      ? effectiveSchemaType(descriptor, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", field)
      : null;
    if (effective === "string" && ["date", "time", "date-time", "duration"].includes(String(descriptor.format ?? ""))) {
      fail("UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE", `${field} recognized temporal format cannot be classified PLAIN_VALUE`);
    }
  }
  return semantics;
}

function assertSourceResolverPair(
  source: Record<string, unknown>,
  operationRef: string,
  interfaceRef: string,
  ownerMode: string,
  localDependencyRef: string | null,
  ownerRef: string,
  field: string,
): void {
  const operations = source.operations as Record<string, unknown>;
  const interfaces = source.interfaces as Record<string, unknown>;
  if (ownerMode === "SELF") {
    const operation = objectByRef(
      operations,
      "operation_ref",
      operationRef,
      "UI_MODULE_REFERENCE_BINDING_INVALID",
      `${field}.read operation`,
    );
    const iface = objectByRef(
      interfaces,
      "interface_ref",
      interfaceRef,
      "UI_MODULE_REFERENCE_BINDING_INVALID",
      `${field}.read interface`,
    );
    if (iface.operation_ref !== operationRef) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} read Interface does not belong to read Operation`);
    const interfaceRefs = stringArray(operation.interface_refs, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.read operation.interface_refs`);
    if (!interfaceRefs.includes(interfaceRef)) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} read Interface is absent from read Operation`);
    return;
  }

  if (localDependencyRef === null) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} declared dependency requires local_dependency_ref`);
  }
  const dependency = objectByRef(
    objectValue(source.dependencies, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.dependencies"),
    "local_dependency_ref",
    localDependencyRef,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.declared dependency`,
  );
  if (dependency.provider_capability_contract_ref !== ownerRef) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} reference_owner_ref does not equal selected dependency provider Contract`);
  }
  const allowedOperations = stringArray(
    dependency.allowed_operation_refs,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.declared dependency.allowed_operation_refs`,
  );
  const allowedInterfaces = stringArray(
    dependency.allowed_interface_refs,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.declared dependency.allowed_interface_refs`,
  );
  if (!allowedOperations.includes(operationRef) || !allowedInterfaces.includes(interfaceRef)) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} resolver Operation/Interface is not allowed by the selected dependency`);
  }
}

function buildReferenceBinding(
  descriptor: Record<string, unknown>,
  semantics: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  field: string,
): JsonObject {
  const ownerMode = stringValue(semantics.reference_owner_mode, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.reference_owner_mode`);
  if (!["SELF", "DECLARED_DEPENDENCY", "EXTERNAL_OPAQUE"].includes(ownerMode)) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.reference_owner_mode is invalid`);
  }
  const resolutionMode = stringValue(semantics.resolution_mode, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.resolution_mode`);
  if (!["ENUMERABLE_LOOKUP", "EXACT_READ", "OPAQUE_MANUAL"].includes(resolutionMode)) {
    fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.resolution_mode is invalid`);
  }
  const cardinality = stringValue(semantics.selection_cardinality, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.selection_cardinality`);
  if (!["ONE", "MANY"].includes(cardinality)) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.selection_cardinality is invalid`);
  const manualEntryAllowed = booleanValue(semantics.manual_entry_allowed, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.manual_entry_allowed`);

  const selectedReferenceSchema = schemaForSelectedReference(
    ownerLocalSchemaShape(descriptor, source, sourceContractRef, "UI_MODULE_REFERENCE_BINDING_INVALID", field),
    cardinality,
    field,
  );

  let referenceOwnerRef = nullableString(semantics.reference_owner_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.reference_owner_ref`);
  let localDependencyRef = nullableString(semantics.local_dependency_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.local_dependency_ref`);
  let identityFieldPath = nullableSourcePath(semantics.identity_field_path, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.identity_field_path`);
  let displayFieldPaths = nullableSourcePathList(semantics.display_field_paths, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.display_field_paths`);
  let readOperationRef = nullableString(semantics.read_operation_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.read_operation_ref`);
  let readInterfaceRef = nullableString(semantics.read_interface_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.read_interface_ref`);
  let readRequestIdentityFieldPath = nullableSourcePath(
    semantics.read_request_identity_field_path,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.read_request_identity_field_path`,
  );
  let readResultObjectPath = nullableSourcePath(
    semantics.read_result_object_path,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.read_result_object_path`,
  );
  let lookupOperationRef = nullableString(semantics.lookup_operation_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.lookup_operation_ref`);
  let lookupInterfaceRef = nullableString(semantics.lookup_interface_ref, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.lookup_interface_ref`);
  const lookupRequestInputTemplate = semantics.lookup_request_input_template === undefined || semantics.lookup_request_input_template === null
    ? null
    : clonePreservingOrder(objectValue(
        semantics.lookup_request_input_template,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.lookup_request_input_template`,
      ));
  let lookupResultCollectionPath = nullableSourcePath(
    semantics.lookup_result_collection_path,
    "UI_MODULE_REFERENCE_BINDING_INVALID",
    `${field}.lookup_result_collection_path`,
  );

  if (ownerMode === "EXTERNAL_OPAQUE") {
    if (resolutionMode !== "OPAQUE_MANUAL" || manualEntryAllowed !== true || localDependencyRef !== null) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} EXTERNAL_OPAQUE must be OPAQUE_MANUAL with manual entry and no local dependency`);
    }
    if (
      identityFieldPath !== null || displayFieldPaths !== null || readOperationRef !== null || readInterfaceRef !== null
      || readRequestIdentityFieldPath !== null || readResultObjectPath !== null || lookupOperationRef !== null
      || lookupInterfaceRef !== null || lookupRequestInputTemplate !== null || lookupResultCollectionPath !== null
    ) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} EXTERNAL_OPAQUE must not fabricate resolver authority`);
    }
  } else {
    if (referenceOwnerRef === null) fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.reference_owner_ref is required`);
    if (ownerMode === "SELF") {
      if (referenceOwnerRef !== sourceContractRef || localDependencyRef !== null) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} SELF owner must be the exact source Capability Contract and have no local dependency`);
      }
    } else if (localDependencyRef === null) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} DECLARED_DEPENDENCY requires local_dependency_ref`);
    }
    if (!["EXACT_READ", "ENUMERABLE_LOOKUP"].includes(resolutionMode)) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} resolvable reference must use EXACT_READ or ENUMERABLE_LOOKUP`);
    }
    if (
      identityFieldPath === null || displayFieldPaths === null || readOperationRef === null || readInterfaceRef === null
      || readRequestIdentityFieldPath === null || readResultObjectPath === null
    ) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} resolvable reference is missing read/identity/display closure`);
    }
    assertSourceResolverPair(source, readOperationRef, readInterfaceRef, ownerMode, localDependencyRef, referenceOwnerRef, field);

    if (ownerMode === "SELF") {
      const operations = objectValue(source.operations, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.operations");
      const interfaces = objectValue(source.interfaces, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.interfaces");
      const contracts = objectValue(source.contracts, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.contracts");
      const readOperation = objectByRef(
        operations,
        "operation_ref",
        readOperationRef,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read operation`,
      );
      const readInterface = objectByRef(
        interfaces,
        "interface_ref",
        readInterfaceRef,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read interface`,
      );
      const readRequestRef = stringValue(
        readOperation.request_contract_ref,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read operation.request_contract_ref`,
      );
      const readResponseRef = stringValue(
        readOperation.response_contract_ref,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read operation.response_contract_ref`,
      );
      if (readInterface.request_contract_ref !== readRequestRef || readInterface.response_contract_ref !== readResponseRef) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} read Interface payload Contracts differ from read Operation`);
      }

      const readRequestSchema = contractSchema(contractByRef(contracts, readRequestRef), readRequestRef);
      const readResponseSchema = contractSchema(contractByRef(contracts, readResponseRef), readResponseRef);
      const readIdentitySchema = sourceSchemaAtPath(
        readRequestSchema,
        readRequestIdentityFieldPath,
        source,
        sourceContractRef,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read_request_identity_field_path`,
      );
      assertReferenceCarrierTypeCompatible(
        selectedReferenceSchema,
        readIdentitySchema,
        source,
        sourceContractRef,
        field,
        "read_request_identity_field_path",
      );
      const readResultObject = sourceSchemaAtPath(
        readResponseSchema,
        readResultObjectPath,
        source,
        sourceContractRef,
        "UI_MODULE_REFERENCE_BINDING_INVALID",
        `${field}.read_result_object_path`,
      );
      if (effectiveSchemaType(readResultObject, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.read_result_object_path`) !== "object") {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.read_result_object_path must resolve to an object`);
      }

      if (resolutionMode === "EXACT_READ") {
        const identitySchema = sourceSchemaAtPath(
          readResultObject,
          identityFieldPath,
          source,
          sourceContractRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.identity_field_path`,
        );
        assertReferenceCarrierTypeCompatible(
          selectedReferenceSchema,
          identitySchema,
          source,
          sourceContractRef,
          field,
          "identity_field_path",
        );
        for (let index = 0; index < displayFieldPaths.length; index += 1) {
          sourceSchemaAtPath(
            readResultObject,
            displayFieldPaths[index]!,
            source,
            sourceContractRef,
            "UI_MODULE_REFERENCE_BINDING_INVALID",
            `${field}.display_field_paths[${index}]`,
          );
        }
      }
    }

    if (resolutionMode === "ENUMERABLE_LOOKUP") {
      if (
        lookupOperationRef === null || lookupInterfaceRef === null || lookupRequestInputTemplate === null
        || lookupResultCollectionPath === null
      ) {
        fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} ENUMERABLE_LOOKUP is missing lookup closure`);
      }
      assertSourceResolverPair(source, lookupOperationRef, lookupInterfaceRef, ownerMode, localDependencyRef, referenceOwnerRef, field);

      if (ownerMode === "SELF") {
        const operations = objectValue(source.operations, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.operations");
        const interfaces = objectValue(source.interfaces, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.interfaces");
        const contracts = objectValue(source.contracts, "UI_MODULE_REFERENCE_BINDING_INVALID", "source.contracts");
        const lookupOperation = objectByRef(
          operations,
          "operation_ref",
          lookupOperationRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup operation`,
        );
        const lookupInterface = objectByRef(
          interfaces,
          "interface_ref",
          lookupInterfaceRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup interface`,
        );
        const lookupRequestRef = stringValue(
          lookupOperation.request_contract_ref,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup operation.request_contract_ref`,
        );
        const lookupResponseRef = stringValue(
          lookupOperation.response_contract_ref,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup operation.response_contract_ref`,
        );
        if (lookupInterface.request_contract_ref !== lookupRequestRef || lookupInterface.response_contract_ref !== lookupResponseRef) {
          fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} lookup Interface payload Contracts differ from lookup Operation`);
        }

        const lookupRequestSchema = contractSchema(contractByRef(contracts, lookupRequestRef), lookupRequestRef);
        assertTemplateConformsToSchema(
          lookupRequestInputTemplate,
          lookupRequestSchema,
          source,
          sourceContractRef,
          `${field}.lookup_request_input_template`,
        );

        const lookupResponseSchema = contractSchema(contractByRef(contracts, lookupResponseRef), lookupResponseRef);
        const collectionSchema = sourceSchemaAtPath(
          lookupResponseSchema,
          lookupResultCollectionPath,
          source,
          sourceContractRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup_result_collection_path`,
        );
        if (effectiveSchemaType(collectionSchema, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.lookup_result_collection_path`) !== "array") {
          fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.lookup_result_collection_path must resolve to an array`);
        }
        const candidateSchema = ownerLocalSchemaShape(
          objectValue(collectionSchema.items, "UI_MODULE_REFERENCE_BINDING_INVALID", `${field}.lookup_result_collection_path.items`),
          source,
          sourceContractRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.lookup_result_collection_path.items`,
        );
        const candidateIdentitySchema = sourceSchemaAtPath(
          candidateSchema,
          identityFieldPath,
          source,
          sourceContractRef,
          "UI_MODULE_REFERENCE_BINDING_INVALID",
          `${field}.identity_field_path`,
        );
        assertReferenceCarrierTypeCompatible(
          selectedReferenceSchema,
          candidateIdentitySchema,
          source,
          sourceContractRef,
          field,
          "lookup candidate identity_field_path",
        );
        for (let index = 0; index < displayFieldPaths.length; index += 1) {
          sourceSchemaAtPath(
            candidateSchema,
            displayFieldPaths[index]!,
            source,
            sourceContractRef,
            "UI_MODULE_REFERENCE_BINDING_INVALID",
            `${field}.display_field_paths[${index}]`,
          );
        }
      }
    } else if (
      lookupOperationRef !== null || lookupInterfaceRef !== null || lookupRequestInputTemplate !== null
      || lookupResultCollectionPath !== null
    ) {
      fail("UI_MODULE_REFERENCE_BINDING_INVALID", `${field} EXACT_READ must not carry lookup material`);
    }
  }

  return deep_freeze({
    source_reference_semantics: clonePreservingOrder(semantics),
    reference_owner_mode: ownerMode,
    reference_owner_ref: referenceOwnerRef,
    local_dependency_ref: localDependencyRef,
    resolution_mode: resolutionMode,
    selection_cardinality: cardinality,
    manual_entry_allowed: manualEntryAllowed,
    identity_field_path: identityFieldPath,
    display_field_paths: displayFieldPaths,
    read_operation_ref: readOperationRef,
    read_interface_ref: readInterfaceRef,
    read_request_identity_field_path: readRequestIdentityFieldPath,
    read_result_object_path: readResultObjectPath,
    lookup_operation_ref: lookupOperationRef,
    lookup_interface_ref: lookupInterfaceRef,
    lookup_request_input_template: lookupRequestInputTemplate,
    lookup_result_collection_path: lookupResultCollectionPath,
  });
}

function buildTemporalBinding(
  descriptor: Record<string, unknown>,
  semantics: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  field: string,
): JsonObject {
  const temporalKind = stringValue(semantics.temporal_kind, "UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.temporal_kind`);
  if (!["DATE", "TIME", "DATE_TIME", "DURATION", "RANGE"].includes(temporalKind)) {
    fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.temporal_kind is invalid`);
  }

  if (temporalKind !== "RANGE") {
    const type = effectiveSchemaType(
      ownerLocalSchemaShape(descriptor, source, sourceContractRef, "UI_MODULE_TEMPORAL_BINDING_INVALID", field),
      "UI_MODULE_TEMPORAL_BINDING_INVALID",
      field,
    );
    const expectedFormat = TEMPORAL_FORMAT_BY_KIND[temporalKind as keyof typeof TEMPORAL_FORMAT_BY_KIND];
    if (type !== "string" || descriptor.format !== expectedFormat) {
      fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field} ${temporalKind} must be string/${expectedFormat}`);
    }
    for (const key of ["range_start_path", "range_end_path", "range_endpoint_kind"]) {
      if (semantics[key] !== undefined && semantics[key] !== null) {
        fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field} scalar temporal semantics must not carry ${key}`);
      }
    }
    return deep_freeze({
      source_temporal_semantics: clonePreservingOrder(semantics),
      temporal_kind: temporalKind,
      json_schema_format: expectedFormat,
      range_start_path: null,
      range_end_path: null,
      range_endpoint_kind: null,
    });
  }

  const rangeRoot = ownerLocalSchemaShape(
    descriptor,
    source,
    sourceContractRef,
    "UI_MODULE_TEMPORAL_BINDING_INVALID",
    field,
  );
  const type = effectiveSchemaType(rangeRoot, "UI_MODULE_TEMPORAL_BINDING_INVALID", field);
  if (type !== "object" || descriptor.format !== undefined) {
    fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field} RANGE must be an object without scalar format`);
  }
  const startPath = sourcePathValue(semantics.range_start_path, "UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.range_start_path`);
  const endPath = sourcePathValue(semantics.range_end_path, "UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.range_end_path`);
  if (JSON.stringify(startPath) === JSON.stringify(endPath)) {
    fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field} RANGE start and end paths must be distinct`);
  }
  const endpointKind = stringValue(semantics.range_endpoint_kind, "UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.range_endpoint_kind`);
  if (!["DATE", "TIME", "DATE_TIME"].includes(endpointKind)) {
    fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.range_endpoint_kind is invalid`);
  }
  const expected = TEMPORAL_FORMAT_BY_KIND[endpointKind as "DATE" | "TIME" | "DATE_TIME"];
  for (const [name, path] of [["start", startPath], ["end", endPath]] as const) {
    const endpoint = sourceSchemaAtPath(
      rangeRoot,
      path,
      source,
      sourceContractRef,
      "UI_MODULE_TEMPORAL_BINDING_INVALID",
      `${field}.${name}`,
    );
    if (effectiveSchemaType(endpoint, "UI_MODULE_TEMPORAL_BINDING_INVALID", `${field}.${name}`) !== "string" || endpoint.format !== expected) {
      fail("UI_MODULE_TEMPORAL_BINDING_INVALID", `${field} RANGE ${name} endpoint must be string/${expected}`);
    }
  }
  return deep_freeze({
    source_temporal_semantics: clonePreservingOrder(semantics),
    temporal_kind: "RANGE",
    json_schema_format: null,
    range_start_path: startPath,
    range_end_path: endPath,
    range_endpoint_kind: endpointKind,
  });
}

function requestControls(
  schema: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  operationRef: string,
  requestContractRef: string,
): readonly JsonObject[] {
  if (schema.type !== "object") fail("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", `${requestContractRef}.schema.type must be object`);
  const properties = objectValue(schema.properties, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", `${requestContractRef}.schema.properties`);
  const required = new Set(
    schema.required === undefined
      ? []
      : stringArray(schema.required, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", `${requestContractRef}.schema.required`),
  );
  for (const name of required) {
    if (!(name in properties)) fail("UI_MODULE_FIELD_COVERAGE_INCOMPLETE", `${requestContractRef} required field ${name} is absent from properties`);
  }

  const controls = Object.entries(properties).map(([fieldName, raw], index) => {
    const field = `${requestContractRef}.schema.properties.${fieldName}`;
    const descriptor = objectValue(raw, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", field);
    const semantics = fieldSemantics(descriptor, field);
    const semanticKind = semantics.semantic_kind as string;
    const structuralSchema = ownerLocalSchemaShape(
      descriptor,
      source,
      sourceContractRef,
      "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
      field,
    );

    let controlKind: string;
    let referenceBinding: JsonObject | null = null;
    let temporalBinding: JsonObject | null = null;

    if (semanticKind === "BUSINESS_REFERENCE") {
      controlKind = "REFERENCE_INPUT";
      referenceBinding = buildReferenceBinding(descriptor, semantics, source, sourceContractRef, field);
    } else if (semanticKind === "TEMPORAL") {
      controlKind = "TEMPORAL_INPUT";
      temporalBinding = buildTemporalBinding(descriptor, semantics, source, sourceContractRef, field);
    } else if (Array.isArray(structuralSchema.enum) && structuralSchema.enum.length > 0) {
      controlKind = "SELECT_INPUT";
    } else {
      const type = effectiveSchemaType(structuralSchema, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", field);
      controlKind = PLAIN_CONTROL_MAPPING[type];
    }

    return deep_freeze({
      source_operation_ref: operationRef,
      source_request_contract_ref: requestContractRef,
      source_field_path: Object.freeze([fieldName]),
      source_field_schema: clonePreservingOrder(descriptor),
      control_kind: controlKind,
      required: required.has(fieldName),
      field_order: index,
      reference_binding: referenceBinding,
      temporal_binding: temporalBinding,
    });
  });
  return Object.freeze(controls);
}

function responseViews(
  schema: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceContractRef: string,
  operationRef: string,
  responseContractRef: string,
): readonly JsonObject[] {
  if (schema.type !== "object") fail("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", `${responseContractRef}.schema.type must be object`);
  const properties = objectValue(schema.properties, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", `${responseContractRef}.schema.properties`);
  return Object.freeze(Object.entries(properties).map(([fieldName, raw], index) => {
    const field = `${responseContractRef}.schema.properties.${fieldName}`;
    const descriptor = objectValue(raw, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", field);
    const structuralSchema = ownerLocalSchemaShape(
      descriptor,
      source,
      sourceContractRef,
      "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
      field,
    );
    let viewKind: string;
    if (Array.isArray(structuralSchema.enum) && structuralSchema.enum.length > 0) viewKind = "VALUE_VIEW";
    else {
      const type = effectiveSchemaType(structuralSchema, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS", field);
      viewKind = RESPONSE_VIEW_MAPPING[type];
    }
    return deep_freeze({
      source_operation_ref: operationRef,
      source_response_contract_ref: responseContractRef,
      source_field_path: Object.freeze([fieldName]),
      source_field_schema: clonePreservingOrder(descriptor),
      view_kind: viewKind,
      field_order: index,
    });
  }));
}

function buildStateBindings(stateModel: Record<string, unknown>): readonly JsonObject[] {
  const mode = stringValue(stateModel.mode, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.mode");
  const machines = arrayValue(stateModel.state_machines, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.state_machines");
  if (mode === "STATELESS") {
    if (machines.length !== 0) fail("UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "STATELESS state_model must have no state_machines");
    return Object.freeze([]);
  }
  if (mode !== "STATEFUL" || machines.length === 0) {
    fail("UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.mode must be STATELESS or non-empty STATEFUL");
  }
  return Object.freeze(machines.map((raw, index) => {
    const machine = objectValue(raw, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}]`);
    return deep_freeze({
      source_operation_ref: null,
      source_state_path: Object.freeze(["state_model", "state_machines", String(index)]),
      source_state_semantics: clonePreservingOrder(machine),
    });
  }));
}

function buildPermissionBindings(permissionModel: Record<string, unknown>): readonly JsonObject[] {
  const mode = stringValue(permissionModel.mode, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model.mode");
  if (!["UNRESTRICTED", "DECLARED"].includes(mode)) {
    fail("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model.mode must be UNRESTRICTED or DECLARED");
  }
  const bindings = arrayValue(
    permissionModel.operation_permission_bindings,
    "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID",
    "permission_model.operation_permission_bindings",
  );
  return Object.freeze(bindings.map((raw, index) => {
    const binding = objectValue(raw, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}]`);
    const operationRef = stringValue(binding.operation_ref, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}].operation_ref`);
    return deep_freeze({
      source_operation_ref: operationRef,
      source_permission_path: Object.freeze(["permission_model", "operation_permission_bindings", String(index)]),
      source_permission_semantics: clonePreservingOrder(binding),
    });
  }));
}

function buildEvidenceViews(source: Record<string, unknown>): readonly JsonObject[] {
  if (source.evidence_projection === undefined) return Object.freeze([]);
  return Object.freeze([deep_freeze({
    source_operation_ref: null,
    source_evidence_path: Object.freeze(["evidence_projection"]),
    source_evidence_semantics: clonePreservingOrder(source.evidence_projection),
  })]);
}

function buildLogicProjection(
  source: Record<string, unknown>,
  sourceOperationRefs: readonly string[],
): JsonObject {
  const operationalRelations = objectValue(
    source.operational_relations,
    "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID",
    "operational_relations",
  );
  const relationMode = stringValue(
    operationalRelations.mode,
    "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID",
    "operational_relations.mode",
  );
  const relations = arrayValue(
    operationalRelations.relations,
    "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID",
    "operational_relations.relations",
  );
  if (relationMode === "NONE") {
    if (relations.length !== 0) fail("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", "operational_relations NONE must have no relations");
    if (operationalRelations.operation_dependency_bindings !== undefined) {
      const uses = arrayValue(
        operationalRelations.operation_dependency_bindings,
        "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID",
        "operational_relations.operation_dependency_bindings",
      );
      if (uses.length !== 0) fail("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", "operational_relations NONE must have no operation dependency bindings");
    }
  } else if (relationMode !== "DECLARED" || relations.length === 0) {
    fail("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", "operational_relations.mode must be NONE or non-empty DECLARED");
  }

  const relationProjection = Object.freeze(relations.map((raw, index) => {
    const relation = objectValue(raw, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}]`);
    return deep_freeze({
      source_relation_ref: stringValue(relation.relation_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].relation_ref`),
      source_consumer_operation_ref: stringValue(relation.consumer_operation_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].consumer_operation_ref`),
      source_local_dependency_ref: stringValue(relation.local_dependency_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].local_dependency_ref`),
      source_provider_capability_contract_ref: stringValue(relation.provider_capability_contract_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].provider_capability_contract_ref`),
      source_provider_operation_ref: stringValue(relation.provider_operation_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].provider_operation_ref`),
      source_provider_interface_ref: stringValue(relation.provider_interface_ref, "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID", `operational_relations.relations[${index}].provider_interface_ref`),
      source_relation_semantics: clonePreservingOrder(relation),
    });
  }));

  const stateModel = objectValue(source.state_model, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model");
  const stateMode = stringValue(stateModel.mode, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.mode");
  const machines = arrayValue(stateModel.state_machines, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.state_machines");
  if (stateMode === "STATELESS") {
    if (machines.length !== 0) fail("UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "STATELESS state_model must have no state_machines");
  } else if (stateMode !== "STATEFUL" || machines.length === 0) {
    fail("UI_MODULE_STATE_MODEL_PROJECTION_INVALID", "state_model.mode must be STATELESS or non-empty STATEFUL");
  }

  const stateMachines: JsonObject[] = [];
  const stateTransitions: JsonObject[] = [];
  for (let index = 0; index < machines.length; index += 1) {
    const machine = objectValue(machines[index], "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}]`);
    const machineRef = stringValue(machine.state_machine_ref, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}].state_machine_ref`);
    const subjectSchemaRef = stringValue(machine.subject_schema_ref, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}].subject_schema_ref`);
    stateMachines.push(deep_freeze({
      source_state_machine_ref: machineRef,
      source_subject_schema_ref: subjectSchemaRef,
      source_state_machine_semantics: clonePreservingOrder(machine),
    }));
    const transitions = arrayValue(machine.transitions, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}].transitions`);
    for (let transitionIndex = 0; transitionIndex < transitions.length; transitionIndex += 1) {
      const transition = objectValue(
        transitions[transitionIndex],
        "UI_MODULE_STATE_MODEL_PROJECTION_INVALID",
        `state_model.state_machines[${index}].transitions[${transitionIndex}]`,
      );
      stateTransitions.push(deep_freeze({
        source_state_machine_ref: machineRef,
        source_transition_ref: stringValue(transition.transition_ref, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}].transitions[${transitionIndex}].transition_ref`),
        source_operation_ref: stringValue(transition.operation_ref, "UI_MODULE_STATE_MODEL_PROJECTION_INVALID", `state_model.state_machines[${index}].transitions[${transitionIndex}].operation_ref`),
        source_transition_semantics: clonePreservingOrder(transition),
      }));
    }
  }

  const permissionModel = objectValue(source.permission_model, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model");
  const permissionMode = stringValue(permissionModel.mode, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model.mode");
  if (!["UNRESTRICTED", "DECLARED"].includes(permissionMode)) {
    fail("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model.mode must be UNRESTRICTED or DECLARED");
  }
  const rawActors = arrayValue(permissionModel.actor_classes, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", "permission_model.actor_classes");
  const actorClasses = Object.freeze(rawActors.map((raw, index) => {
    const actor = objectValue(raw, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.actor_classes[${index}]`);
    const kind = stringValue(actor.identity_source_kind, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.actor_classes[${index}].identity_source_kind`);
    if (!["BUSINESS_REFERENCE", "EXTERNAL_AUTHORITY"].includes(kind)) {
      fail("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.actor_classes[${index}].identity_source_kind is invalid`);
    }
    return deep_freeze({
      source_actor_class_ref: stringValue(actor.actor_class_ref, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.actor_classes[${index}].actor_class_ref`),
      source_identity_source_kind: kind,
      source_actor_class_semantics: clonePreservingOrder(actor),
    });
  }));

  const rawPermissions = arrayValue(
    permissionModel.operation_permission_bindings,
    "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID",
    "permission_model.operation_permission_bindings",
  );
  const permissionRefsByOperation = new Map<string, number>();
  const permissions = Object.freeze(rawPermissions.map((raw, index) => {
    const permission = objectValue(raw, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}]`);
    const operationRef = stringValue(permission.operation_ref, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}].operation_ref`);
    const accessMode = stringValue(permission.access_mode, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}].access_mode`);
    if (!["UNRESTRICTED", "RESTRICTED"].includes(accessMode)) {
      fail("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission binding access_mode ${accessMode} is invalid`);
    }
    permissionRefsByOperation.set(operationRef, (permissionRefsByOperation.get(operationRef) ?? 0) + 1);
    return deep_freeze({
      source_permission_ref: stringValue(permission.permission_ref, "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `permission_model.operation_permission_bindings[${index}].permission_ref`),
      source_operation_ref: operationRef,
      source_access_mode: accessMode,
      source_permission_semantics: clonePreservingOrder(permission),
    });
  }));
  for (const operationRef of sourceOperationRefs) {
    if (permissionRefsByOperation.get(operationRef) !== 1) {
      fail("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID", `operation ${operationRef} must have exactly one permission binding`);
    }
  }

  const ruleBindings = objectValue(source.rule_bindings, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", "rule_bindings");
  const ruleMode = stringValue(ruleBindings.mode, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", "rule_bindings.mode");
  const rawRuleBindings = arrayValue(ruleBindings.bindings, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", "rule_bindings.bindings");
  if (ruleMode === "NONE") {
    if (rawRuleBindings.length !== 0) fail("UI_MODULE_RULE_BINDING_PROJECTION_INVALID", "rule_bindings NONE must have no bindings");
  } else if (ruleMode !== "DECLARED") {
    fail("UI_MODULE_RULE_BINDING_PROJECTION_INVALID", "rule_bindings.mode must be NONE or DECLARED");
  }

  const validPhases = new Set([
    "REQUEST_VALIDATION", "PRECONDITION", "DEPENDENCY_PRECONDITION", "AUTHORIZATION",
    "STATE_GUARD", "POSTCONDITION", "EVIDENCE_ONLY", "INFORMATIONAL",
  ]);
  const validModes = new Set(["OPERATION_ENFORCED", "DEPENDENCY_DECISION", "HUMAN_DECISION", "INFORMATIONAL"]);
  const rules = Object.freeze(rawRuleBindings.map((raw, index) => {
    const binding = objectValue(raw, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", `rule_bindings.bindings[${index}]`);
    const phase = stringValue(binding.enforcement_phase, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", `rule_bindings.bindings[${index}].enforcement_phase`);
    const mode = stringValue(binding.evaluation_realization_mode, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", `rule_bindings.bindings[${index}].evaluation_realization_mode`);
    if (!validPhases.has(phase) || !validModes.has(mode)) {
      fail("UI_MODULE_RULE_BINDING_PROJECTION_INVALID", `rule_bindings.bindings[${index}] has invalid phase or evaluation mode`);
    }
    return deep_freeze({
      source_rule_ref: stringValue(binding.rule_ref, "UI_MODULE_RULE_BINDING_PROJECTION_INVALID", `rule_bindings.bindings[${index}].rule_ref`),
      source_enforcement_phase: phase,
      source_evaluation_realization_mode: mode,
      source_rule_binding_semantics: clonePreservingOrder(binding),
    });
  }));

  return deep_freeze({
    operational_relations: relationProjection,
    state_machines: Object.freeze(stateMachines),
    state_transitions: Object.freeze(stateTransitions),
    permissions,
    actor_classes: actorClasses,
    rule_bindings: rules,
    status: "COMPLETE",
  });
}

export async function handler(input: unknown): Promise<Readonly<Record<string, unknown>>> {
  const request = objectValue(input, "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID", "input");
  assertAllowedKeys(
    request,
    new Set(["source_capability_ref", "projection_ref", "projection_input"]),
    "UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN",
    "input",
  );

  const sourceCapabilityRef = stringValue(
    request.source_capability_ref,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "source_capability_ref",
  );
  const projectionRef = stringValue(
    request.projection_ref,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "projection_ref",
  );
  const projection = objectValue(
    request.projection_input,
    "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
    "projection_input",
  );
  assertAllowedKeys(
    projection,
    new Set([
      "source_capability_contract_ref",
      "source_capability_contract_hash",
      "source_external_provider_surface_ref",
      "source_external_provider_surface_hash",
      "source_capability_semantic_projection",
    ]),
    "UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN",
    "projection_input",
  );

  const sourceContractRef = stringValue(
    projection.source_capability_contract_ref,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "source_capability_contract_ref",
  );
  const sourceContractHash = hashValue(
    projection.source_capability_contract_hash,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "source_capability_contract_hash",
  );
  const sourceSurfaceRef = stringValue(
    projection.source_external_provider_surface_ref,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "source_external_provider_surface_ref",
  );
  const sourceSurfaceHash = hashValue(
    projection.source_external_provider_surface_hash,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "source_external_provider_surface_hash",
  );
  const source = objectValue(
    projection.source_capability_semantic_projection,
    "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
    "source_capability_semantic_projection",
  );

  for (const key of REQUIRED_SOURCE_SECTIONS) {
    objectValue(
      source[key],
      "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
      `source_capability_semantic_projection.${key}`,
    );
  }

  const identity = source.identity as Record<string, unknown>;
  if (
    identity.capability_ref !== sourceCapabilityRef
    || identity.capability_contract_ref !== sourceContractRef
  ) {
    fail("UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED", "request source identity does not equal exact semantic owner identity");
  }
  const extraction = source.extraction as Record<string, unknown>;
  if (extraction.external_provider_surface_ref !== sourceSurfaceRef) {
    fail("UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED", "External Provider Surface ref does not equal exact source extraction identity");
  }

  const operations = source.operations as Record<string, unknown>;
  const interfaces = source.interfaces as Record<string, unknown>;
  const contracts = source.contracts as Record<string, unknown>;
  const providerSurface = source.external_provider_surface as Record<string, unknown>;
  const providerInterfaceRefs = stringArray(
    providerSurface.provider_interface_refs,
    "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
    "external_provider_surface.provider_interface_refs",
  );
  if (new Set(providerInterfaceRefs).size !== providerInterfaceRefs.length) {
    fail("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE", "External Provider Surface contains duplicate Interface refs");
  }
  const providerSet = new Set(providerInterfaceRefs);

  const sourceOperationRefs: string[] = [];
  const sourceInterfaceRefs: string[] = [];
  const projectedInterfaceMap = new Map<string, JsonObject>();
  const operationProjections: JsonObject[] = [];
  const seenOperationRefs = new Set<string>();
  const seenInterfaceRefs = new Set<string>();

  for (const [operationId, rawOperation] of Object.entries(operations)) {
    const operation = objectValue(
      rawOperation,
      "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
      `operations.${operationId}`,
    );
    const operationRef = stringValue(
      operation.operation_ref,
      "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
      `operations.${operationId}.operation_ref`,
    );
    if (seenOperationRefs.has(operationRef)) fail("UI_MODULE_OPERATION_COVERAGE_INCOMPLETE", `duplicate source Operation ${operationRef}`);
    seenOperationRefs.add(operationRef);
    sourceOperationRefs.push(operationRef);

    const operationInterfaceRefs = stringArray(
      operation.interface_refs,
      "UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE",
      `operations.${operationId}.interface_refs`,
    );
    if (new Set(operationInterfaceRefs).size !== operationInterfaceRefs.length) {
      fail("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE", `Operation ${operationRef} contains duplicate Interface refs`);
    }

    const interfaceProjections: JsonObject[] = [];
    const executableInterfaceRefs: string[] = [];
    for (const interfaceRef of operationInterfaceRefs) {
      if (seenInterfaceRefs.has(interfaceRef)) {
        fail("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE", `Interface ${interfaceRef} is projected more than once`);
      }
      seenInterfaceRefs.add(interfaceRef);
      sourceInterfaceRefs.push(interfaceRef);

      const iface = objectByRef(
        interfaces,
        "interface_ref",
        interfaceRef,
        "UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE",
        "source Interface",
      );
      if (iface.operation_ref !== operationRef) {
        fail("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE", `Interface ${interfaceRef} does not belong to Operation ${operationRef}`);
      }

      const requestContractRef = stringValue(
        iface.request_contract_ref,
        "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
        `${interfaceRef}.request_contract_ref`,
      );
      const responseContractRef = stringValue(
        iface.response_contract_ref,
        "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
        `${interfaceRef}.response_contract_ref`,
      );
      const outcomeContractRef = stringValue(
        iface.outcome_contract_ref,
        "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
        `${interfaceRef}.outcome_contract_ref`,
      );
      const stableErrorContractRef = stringValue(
        iface.stable_error_contract_ref,
        "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
        `${interfaceRef}.stable_error_contract_ref`,
      );

      for (const [fieldName, interfaceValue] of [
        ["request_contract_ref", requestContractRef],
        ["response_contract_ref", responseContractRef],
        ["outcome_contract_ref", outcomeContractRef],
        ["stable_error_contract_ref", stableErrorContractRef],
      ] as const) {
        if (operation[fieldName] !== interfaceValue) {
          fail("UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED", `${interfaceRef}.${fieldName} differs from owner Operation`);
        }
      }

      const requestContract = contractByRef(contracts, requestContractRef);
      const responseContract = contractByRef(contracts, responseContractRef);
      const controls = requestControls(
        contractSchema(requestContract, requestContractRef),
        source,
        sourceContractRef,
        operationRef,
        requestContractRef,
      );
      const views = responseViews(
        contractSchema(responseContract, responseContractRef),
        source,
        sourceContractRef,
        operationRef,
        responseContractRef,
      );
      const executable = providerSet.has(interfaceRef);
      if (executable) executableInterfaceRefs.push(interfaceRef);

      const interfaceProjection = deep_freeze({
        source_operation_ref: operationRef,
        source_interface_ref: interfaceRef,
        source_request_contract_ref: requestContractRef,
        source_response_contract_ref: responseContractRef,
        source_outcome_contract_ref: outcomeContractRef,
        source_stable_error_contract_ref: stableErrorContractRef,
        request_controls: controls,
        response_views: views,
        executable,
      });
      interfaceProjections.push(interfaceProjection);
      projectedInterfaceMap.set(interfaceRef, interfaceProjection);
    }

    operationProjections.push(deep_freeze({
      source_operation_ref: operationRef,
      interface_projections: Object.freeze(interfaceProjections),
      executable_interface_refs: Object.freeze(executableInterfaceRefs),
    }));
  }

  if (sourceOperationRefs.length === 0) {
    fail("UI_MODULE_OPERATION_COVERAGE_INCOMPLETE", "source Capability must contain at least one Operation");
  }

  const declaredInterfaceRefs = Object.values(interfaces).map((raw, index) => {
    const iface = objectValue(raw, "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID", `interfaces[${index}]`);
    return stringValue(iface.interface_ref, "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED", `interfaces[${index}].interface_ref`);
  });
  if (
    declaredInterfaceRefs.length !== seenInterfaceRefs.size
    || declaredInterfaceRefs.some((ref) => !seenInterfaceRefs.has(ref))
  ) {
    fail("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE", "not every exact source Interface is projected exactly once");
  }

  const actionBindings: JsonObject[] = [];
  for (const interfaceRef of providerInterfaceRefs) {
    const projectionValue = projectedInterfaceMap.get(interfaceRef);
    if (projectionValue === undefined || projectionValue.executable !== true) {
      fail("UI_MODULE_ACTION_LINEAGE_INCOMPLETE", `provider Interface ${interfaceRef} is unresolved or non-executable`);
    }
    actionBindings.push(deep_freeze({
      source_capability_ref: sourceCapabilityRef,
      source_capability_contract_ref: sourceContractRef,
      source_capability_contract_hash: sourceContractHash,
      source_external_provider_surface_ref: sourceSurfaceRef,
      source_external_provider_surface_hash: sourceSurfaceHash,
      source_operation_ref: projectionValue.source_operation_ref,
      source_interface_ref: projectionValue.source_interface_ref,
      source_request_contract_ref: projectionValue.source_request_contract_ref,
      source_response_contract_ref: projectionValue.source_response_contract_ref,
      source_outcome_contract_ref: projectionValue.source_outcome_contract_ref,
      source_stable_error_contract_ref: projectionValue.source_stable_error_contract_ref,
      request_controls: projectionValue.request_controls,
      response_views: projectionValue.response_views,
      executable: true,
    }));
  }

  const sourceLineage = deep_freeze({
    source_capability_ref: sourceCapabilityRef,
    source_capability_contract_ref: sourceContractRef,
    source_capability_contract_hash: sourceContractHash,
    source_external_provider_surface_ref: sourceSurfaceRef,
    source_external_provider_surface_hash: sourceSurfaceHash,
  });

  const semanticModel = deep_freeze({
    semantic_model_version: SEMANTIC_MODEL_VERSION,
    operation_projections: Object.freeze(operationProjections),
    coverage: deep_freeze({
      source_operation_refs: Object.freeze([...sourceOperationRefs]),
      projected_operation_refs: Object.freeze([...sourceOperationRefs]),
      source_interface_refs: Object.freeze([...sourceInterfaceRefs]),
      projected_interface_refs: Object.freeze([...sourceInterfaceRefs]),
      source_provider_interface_refs: Object.freeze([...providerInterfaceRefs]),
      bound_action_interface_refs: Object.freeze(actionBindings.map((binding) => binding.source_interface_ref as string)),
      status: "COMPLETE",
    }),
  });

  const stateModel = source.state_model as Record<string, unknown>;
  const permissionModel = source.permission_model as Record<string, unknown>;
  const stateBindings = buildStateBindings(stateModel);
  const permissionBindings = buildPermissionBindings(permissionModel);
  const evidenceViews = buildEvidenceViews(source);
  const logicProjection = buildLogicProjection(source, sourceOperationRefs);
  const sourceSemanticSnapshot = clonePreservingOrder(source);

  const hashSubject = deep_freeze({
    source_capability_ref: sourceCapabilityRef,
    projection_ref: projectionRef,
    source_lineage: sourceLineage,
    source_semantic_snapshot: sourceSemanticSnapshot,
    semantic_model: semanticModel,
    action_bindings: Object.freeze(actionBindings),
    state_bindings: stateBindings,
    permission_bindings: permissionBindings,
    evidence_views: evidenceViews,
    logic_projection: logicProjection,
  });
  const contentHash = sha256CanonicalJson(hashSubject);
  const uiModuleRef = contentHash;

  return deep_freeze({
    ui_module_artifact: deep_freeze({
      ui_module_ref: uiModuleRef,
      source_capability_ref: sourceCapabilityRef,
      projection_ref: projectionRef,
      source_lineage: sourceLineage,
      source_semantic_snapshot: sourceSemanticSnapshot,
      semantic_model: semanticModel,
      action_bindings: Object.freeze(actionBindings),
      state_bindings: stateBindings,
      permission_bindings: permissionBindings,
      evidence_views: evidenceViews,
      logic_projection: logicProjection,
      content_hash: contentHash,
    }),
  });
}
