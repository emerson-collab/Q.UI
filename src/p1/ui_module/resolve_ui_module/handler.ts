import {
  CAPABILITY_CONTRACT_REF,
  resolveUiModuleRequestSchema,
  resolveUiModuleResponseSchema,
  stableErrorEvaluationOrder,
  stableErrorMessages,
  uiModuleTypeSchemas,
} from "../../export/ui_module/contracts.ts";
import type {
  ControlKind,
  JsonValue,
  ResolveUiModuleOutcome,
  ResolveUiModuleRequest,
  UiActionBinding,
  UiActorClassProjection,
  UiEvidenceViewBinding,
  UiInterfaceProjection,
  UiLogicGraphProjection,
  UiModuleArtifact,
  UiModuleStableErrorCode,
  UiOperationalRelationProjection,
  UiOperationProjection,
  UiPermissionBinding,
  UiPermissionProjection,
  UiReferenceInputBinding,
  UiRequestControlBinding,
  UiResponseViewBinding,
  UiRuleBindingProjection,
  UiStateBinding,
  UiStateMachineProjection,
  UiStateTransitionProjection,
  UiTemporalInputBinding,
  ViewKind,
} from "../../export/ui_module/types.ts";

type UnknownRecord = Record<string, unknown>;

export class UiModuleBoundaryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UiModuleBoundaryValidationError";
  }
}

class StableProjectionError extends Error {
  readonly code: UiModuleStableErrorCode;
  constructor(code: UiModuleStableErrorCode) {
    super(stableErrorMessages[code]);
    this.name = "StableProjectionError";
    this.code = code;
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every((item) => isStringArray(item));
}

function cloneJson<T>(value: T): T {
  return structuredClone(value);
}

function assertFiniteJsonValue(value: unknown, path = "$"): asserts value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new UiModuleBoundaryValidationError(`NON_FINITE_JSON_NUMBER:${path}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteJsonValue(item, `${path}[${index}]`));
    return;
  }
  if (isRecord(value)) {
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw new UiModuleBoundaryValidationError(`NON_JSON_OBJECT:${path}`);
    }
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "undefined" || typeof item === "function" || typeof item === "symbol" || typeof item === "bigint") {
        throw new UiModuleBoundaryValidationError(`NON_JSON_VALUE:${path}.${key}`);
      }
      assertFiniteJsonValue(item, `${path}.${key}`);
    }
    return;
  }
  throw new UiModuleBoundaryValidationError(`NON_JSON_VALUE:${path}`);
}

function compareUnicodeCodePoint(a: string, b: string): number {
  const aa = Array.from(a, (ch) => ch.codePointAt(0)!);
  const bb = Array.from(b, (ch) => ch.codePointAt(0)!);
  const n = Math.min(aa.length, bb.length);
  for (let i = 0; i < n; i += 1) {
    if (aa[i] !== bb[i]) return aa[i]! - bb[i]!;
  }
  return aa.length - bb.length;
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("NON_FINITE_JSON_NUMBER");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    const keys = Object.keys(value).sort(compareUnicodeCodePoint);
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  throw new Error("NON_JSON_VALUE");
}

async function sha256Text(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return `sha256:${Array.from(digest, (x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function decodePointerSegment(value: string): string {
  return value.replaceAll("~1", "/").replaceAll("~0", "~");
}

function resolveExactRef(root: UnknownRecord, baseRef: string, ref: string): unknown {
  if (ref === baseRef) return root;
  const prefix = `${baseRef}#/`;
  if (!ref.startsWith(prefix)) return undefined;
  const path = ref.slice(prefix.length);
  let current: unknown = root;
  for (const raw of path.split("/")) {
    const segment = decodePointerSegment(raw);
    if (Array.isArray(current)) {
      if (!/^(0|[1-9][0-9]*)$/.test(segment)) return undefined;
      current = current[Number(segment)];
      continue;
    }
    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

function findObjectsByField(root: unknown, field: string, expected: string, out: UnknownRecord[] = []): UnknownRecord[] {
  if (Array.isArray(root)) {
    for (const item of root) findObjectsByField(item, field, expected, out);
    return out;
  }
  if (!isRecord(root)) return out;
  if (root[field] === expected) out.push(root);
  for (const value of Object.values(root)) findObjectsByField(value, field, expected, out);
  return out;
}

function resolveDeclaredObject(
  root: UnknownRecord,
  baseRef: string,
  ref: string,
  identityFields: readonly string[],
): UnknownRecord | undefined {
  const exact = resolveExactRef(root, baseRef, ref);
  if (isRecord(exact)) return exact;
  const matches: UnknownRecord[] = [];
  for (const field of identityFields) findObjectsByField(root, field, ref, matches);
  const unique = [...new Set(matches)];
  return unique.length === 1 ? unique[0] : undefined;
}

function schemaForContractRef(root: UnknownRecord, baseRef: string, ref: string): UnknownRecord | undefined {
  const obj = resolveDeclaredObject(root, baseRef, ref, ["contract_ref", "schema_ref"]);
  if (!obj) return undefined;
  return isRecord(obj.schema) ? obj.schema : obj;
}

function dereferenceSchema(schema: UnknownRecord, root: UnknownRecord, baseRef: string): UnknownRecord | undefined {
  let current: UnknownRecord = schema;
  const visited = new Set<string>();
  while (typeof current.$ref === "string") {
    const ref = current.$ref;
    if (visited.has(ref)) return undefined;
    visited.add(ref);
    const resolved = schemaForContractRef(root, baseRef, ref);
    if (!resolved) return undefined;
    current = resolved;
  }
  return current;
}

function schemaTypes(schema: UnknownRecord): string[] {
  const type = schema.type;
  if (typeof type === "string") return [type];
  if (Array.isArray(type) && type.every((x) => typeof x === "string")) return type as string[];
  return [];
}

function schemaAtPath(
  startSchema: UnknownRecord,
  path: readonly string[],
  root: UnknownRecord,
  baseRef: string,
): UnknownRecord | undefined {
  let current = dereferenceSchema(startSchema, root, baseRef);
  if (!current) return undefined;
  for (const segment of path) {
    current = dereferenceSchema(current, root, baseRef);
    if (!current) return undefined;
    const types = schemaTypes(current);
    if (types.includes("array")) {
      if (!isRecord(current.items)) return undefined;
      current = dereferenceSchema(current.items, root, baseRef);
      if (!current) return undefined;
    }
    if (!isRecord(current.properties)) return undefined;
    const next = current.properties[segment];
    if (!isRecord(next)) return undefined;
    current = dereferenceSchema(next, root, baseRef);
    if (!current) return undefined;
  }
  return current;
}

function schemaCompatible(aRaw: UnknownRecord, bRaw: UnknownRecord, root: UnknownRecord, baseRef: string): boolean {
  const a = dereferenceSchema(aRaw, root, baseRef);
  const b = dereferenceSchema(bRaw, root, baseRef);
  if (!a || !b) return false;
  const at = schemaTypes(a).filter((x) => x !== "null");
  const bt = schemaTypes(b).filter((x) => x !== "null");
  if (at.length === 0 || bt.length === 0 || !at.every((x) => bt.includes(x)) || !bt.every((x) => at.includes(x))) {
    return false;
  }
  if (typeof a.format === "string" || typeof b.format === "string") {
    if (a.format !== b.format) return false;
  }
  if (Array.isArray(a.enum) || Array.isArray(b.enum)) {
    if (!Array.isArray(a.enum) || !Array.isArray(b.enum)) return false;
    if (canonicalJson(a.enum) !== canonicalJson(b.enum)) return false;
  }
  return true;
}

function validateSchema(
  value: unknown,
  rawSchema: UnknownRecord,
  root: UnknownRecord,
  baseRef: string,
  path = "$",
): string[] {
  const errors: string[] = [];
  const schema = dereferenceSchema(rawSchema, root, baseRef);
  if (!schema) return [`${path}:UNRESOLVED_SCHEMA_REF`];

  if (Array.isArray(schema.anyOf)) {
    const branches = schema.anyOf.filter(isRecord);
    if (!branches.some((branch) => validateSchema(value, branch, root, baseRef, path).length === 0)) {
      errors.push(`${path}:ANY_OF`);
      return errors;
    }
  }

  if (Array.isArray(schema.allOf)) {
    for (const item of schema.allOf) {
      if (!isRecord(item)) continue;
      if (isRecord(item.if)) {
        const condition = validateSchema(value, item.if, root, baseRef, path).length === 0;
        if (condition && isRecord(item.then)) {
          errors.push(...validateSchema(value, item.then, root, baseRef, path));
        }
      } else {
        errors.push(...validateSchema(value, item, root, baseRef, path));
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && canonicalJson(value) !== canonicalJson(schema.const)) {
    errors.push(`${path}:CONST`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => canonicalJson(item) === canonicalJson(value))) {
    errors.push(`${path}:ENUM`);
  }

  const types = schemaTypes(schema);
  if (types.length > 0) {
    const matches = types.some((type) => {
      if (type === "null") return value === null;
      if (type === "object") return isRecord(value);
      if (type === "array") return Array.isArray(value);
      if (type === "string") return typeof value === "string";
      if (type === "boolean") return typeof value === "boolean";
      if (type === "number") return typeof value === "number" && Number.isFinite(value);
      if (type === "integer") return typeof value === "number" && Number.isInteger(value);
      return false;
    });
    if (!matches) {
      errors.push(`${path}:TYPE`);
      return errors;
    }
  }

  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) errors.push(`${path}:MIN_LENGTH`);
    if (typeof schema.pattern === "string" && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}:PATTERN`);
  }

  if (typeof value === "number" && typeof schema.minimum === "number" && value < schema.minimum) {
    errors.push(`${path}:MINIMUM`);
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) errors.push(`${path}:MIN_ITEMS`);
    if (schema.uniqueItems === true) {
      const seen = new Set<string>();
      for (const item of value) {
        const key = canonicalJson(item);
        if (seen.has(key)) errors.push(`${path}:UNIQUE_ITEMS`);
        seen.add(key);
      }
    }
    if (isRecord(schema.items)) {
      const itemSchema = schema.items;
      value.forEach((item, index) => errors.push(...validateSchema(item, itemSchema, root, baseRef, `${path}[${index}]`)));
    }
  }

  if (isRecord(value)) {
    if (Array.isArray(schema.required)) {
      for (const name of schema.required) {
        if (typeof name === "string" && !Object.prototype.hasOwnProperty.call(value, name)) {
          errors.push(`${path}.${name}:REQUIRED`);
        }
      }
    }
    const properties = isRecord(schema.properties) ? schema.properties : {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) errors.push(`${path}.${key}:ADDITIONAL_PROPERTY`);
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key) && isRecord(childSchema)) {
        errors.push(...validateSchema(value[key], childSchema, root, baseRef, `${path}.${key}`));
      }
    }
  }
  return errors;
}

const requiredSourceSections = [
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
] as const;

const forbiddenPresentationTopLevelKeys = new Set([
  "theme",
  "render",
  "host",
  "ui_theme",
  "ui_surface",
  "ui_render",
  "ui_host",
  "ui_app",
  "ui_platform",
  "presentation_topology",
  "navigation",
  "page_hierarchy",
  "layout",
  "server",
]);

function assertRequestBoundary(request: unknown): asserts request is ResolveUiModuleRequest {
  assertFiniteJsonValue(request);
  const schemaRoot: UnknownRecord = {
    type_closure: { schemas: uiModuleTypeSchemas },
    contracts: { resolve_ui_module_request_contract: { schema: resolveUiModuleRequestSchema } },
  };
  const errors = validateSchema(
    request,
    resolveUiModuleRequestSchema as unknown as UnknownRecord,
    schemaRoot,
    CAPABILITY_CONTRACT_REF,
  );
  if (errors.length > 0) {
    throw new UiModuleBoundaryValidationError(`REQUEST_SCHEMA_INVALID:${errors.join("|")}`);
  }
}

function validateSourceLineage(request: ResolveUiModuleRequest, source: UnknownRecord): boolean {
  const identity = source.identity;
  if (!isRecord(identity)) return false;
  if (identity.capability_ref !== request.source_capability_ref) return false;
  if (identity.capability_contract_ref !== request.projection_input.source_capability_contract_ref) return false;
  const expectedSurfaceRef = `${request.projection_input.source_capability_contract_ref}#/external_provider_surface`;
  const declaredSurfaceRef = isRecord(source.extraction) && typeof source.extraction.external_provider_surface_ref === "string"
    ? source.extraction.external_provider_surface_ref
    : expectedSurfaceRef;
  if (request.projection_input.source_external_provider_surface_ref !== declaredSurfaceRef) return false;
  if (!/^sha256:[0-9a-f]{64}$/.test(request.projection_input.source_capability_contract_hash)) return false;
  if (!/^sha256:[0-9a-f]{64}$/.test(request.projection_input.source_external_provider_surface_hash)) return false;
  return true;
}

function validateSourceSemanticProjection(source: UnknownRecord, sourceRef: string): boolean {
  for (const section of requiredSourceSections) {
    if (!Object.prototype.hasOwnProperty.call(source, section)) return false;
  }
  if (!isRecord(source.operations) || Object.keys(source.operations).length === 0) return false;
  if (!isRecord(source.interfaces)) return false;
  if (!isRecord(source.contracts)) return false;
  if (!isRecord(source.type_closure)) return false;
  if (!isRecord(source.external_provider_surface)) return false;
  if (!isRecord(source.interface_inventory)) return false;
  if (!isRecord(source.operational_relations)) return false;
  if (!isRecord(source.state_model)) return false;
  if (!isRecord(source.permission_model)) return false;
  if (!isRecord(source.rule_bindings)) return false;

  const versionMatch = sourceRef.match(/@V([0-9]{4,})$/);
  if (!versionMatch) return false;
  const version = Number(versionMatch[1]);
  if (version >= 113 && !Object.prototype.hasOwnProperty.call(source, "instance_variability")) return false;
  return true;
}

function validatePresentationBoundary(source: UnknownRecord): boolean {
  return !Object.keys(source).some((key) => forbiddenPresentationTopLevelKeys.has(key.toLowerCase()));
}

function collectRequestSchemaRefs(source: UnknownRecord, sourceRef: string): Array<{ opRef: string; schemaRef: string; schema: UnknownRecord }> {
  const out: Array<{ opRef: string; schemaRef: string; schema: UnknownRecord }> = [];
  for (const operation of Object.values(source.operations as UnknownRecord)) {
    if (!isRecord(operation) || typeof operation.operation_ref !== "string") continue;
    const interfaceRefs = operationInterfaceRefs(source, operation);
    for (const interfaceRef of interfaceRefs) {
      const iface = resolveDeclaredObject(source, sourceRef, interfaceRef, ["interface_ref"]);
      if (!iface || typeof iface.request_contract_ref !== "string") continue;
      const schema = schemaForContractRef(source, sourceRef, iface.request_contract_ref);
      if (schema) out.push({ opRef: operation.operation_ref, schemaRef: iface.request_contract_ref, schema });
    }
  }
  return out;
}

function fieldSemanticsOf(schema: UnknownRecord): UnknownRecord | undefined {
  return isRecord(schema.x_q_field_semantics) ? schema.x_q_field_semantics : undefined;
}

function validateFieldSemanticCoverage(
  schemaRaw: UnknownRecord,
  source: UnknownRecord,
  sourceRef: string,
  visited = new Set<UnknownRecord>(),
): boolean {
  const schema = dereferenceSchema(schemaRaw, source, sourceRef);
  if (!schema || visited.has(schema)) return Boolean(schema);
  visited.add(schema);
  if (isRecord(schema.properties)) {
    for (const child of Object.values(schema.properties)) {
      if (!isRecord(child)) return false;
      const semantics = fieldSemanticsOf(child);
      if (!semantics) return false;
      if (!["PLAIN_VALUE", "BUSINESS_REFERENCE", "TEMPORAL"].includes(String(semantics.semantic_kind))) return false;
      if (!["GENERAL", "INSTANCE"].includes(String(semantics.variability_class))) return false;
      if (semantics.variability_class === "INSTANCE" && (typeof semantics.instance_variable_ref !== "string" || !semantics.instance_variable_ref)) {
        return false;
      }
      const resolved = dereferenceSchema(child, source, sourceRef);
      if (!resolved) return false;
      const types = schemaTypes(resolved);
      if (types.includes("object") && isRecord(resolved.properties)) {
        if (!validateFieldSemanticCoverage(resolved, source, sourceRef, visited)) return false;
      }
      if (types.includes("array") && isRecord(resolved.items)) {
        const item = dereferenceSchema(resolved.items, source, sourceRef);
        if (!item) return false;
        if (schemaTypes(item).includes("object") && isRecord(item.properties)) {
          if (!validateFieldSemanticCoverage(item, source, sourceRef, visited)) return false;
        }
      }
    }
  }
  return true;
}

function validateAllFieldSemantics(source: UnknownRecord, sourceRef: string): boolean {
  for (const entry of collectRequestSchemaRefs(source, sourceRef)) {
    if (!validateFieldSemanticCoverage(entry.schema, source, sourceRef)) return false;
  }
  return true;
}

function findContainingObjectWithString(root: unknown, needle: string): UnknownRecord | undefined {
  if (Array.isArray(root)) {
    for (const item of root) {
      const found = findContainingObjectWithString(item, needle);
      if (found) return found;
    }
    return undefined;
  }
  if (!isRecord(root)) return undefined;
  if (Object.values(root).some((value) => value === needle)) return root;
  for (const value of Object.values(root)) {
    const found = findContainingObjectWithString(value, needle);
    if (found) return found;
  }
  return undefined;
}

function exactlyOneDeclaredObject(root: UnknownRecord, field: string, ref: string): UnknownRecord | undefined {
  const primarySection = field === "operation_ref" ? root.operations : field === "interface_ref" ? root.interfaces : undefined;
  if (isRecord(primarySection)) {
    const primaryMatches = Object.values(primarySection).filter((item) => isRecord(item) && item[field] === ref) as UnknownRecord[];
    if (primaryMatches.length === 1) return primaryMatches[0];
    if (primaryMatches.length > 1) return undefined;
  }
  const matches = findObjectsByField(root, field, ref).filter((item) => {
    if (field === "operation_ref") {
      return typeof item.operation_ref === "string"
        && (typeof item.operation_id === "string" || Array.isArray(item.interface_refs) || typeof item.primary_interface_ref === "string");
    }
    if (field === "interface_ref") {
      return typeof item.interface_ref === "string"
        && typeof item.request_contract_ref === "string"
        && typeof item.response_contract_ref === "string";
    }
    return true;
  });
  const unique = [...new Set(matches)];
  return unique.length === 1 ? unique[0] : undefined;
}

function referenceSemanticsComplete(
  fieldSchemaRaw: UnknownRecord,
  semantics: UnknownRecord,
  source: UnknownRecord,
  sourceRef: string,
): boolean {
  const ownerMode = semantics.reference_owner_mode;
  const resolutionMode = semantics.resolution_mode;
  const cardinality = semantics.selection_cardinality;
  if (!["SELF", "DECLARED_DEPENDENCY", "EXTERNAL_OPAQUE"].includes(String(ownerMode))) return false;
  if (!["ENUMERABLE_LOOKUP", "EXACT_READ", "OPAQUE_MANUAL"].includes(String(resolutionMode))) return false;
  if (!["ONE", "MANY"].includes(String(cardinality))) return false;
  if (typeof semantics.manual_entry_allowed !== "boolean") return false;

  if (ownerMode === "EXTERNAL_OPAQUE") {
    return resolutionMode === "OPAQUE_MANUAL"
      && semantics.manual_entry_allowed === true
      && semantics.local_dependency_ref === null
      && semantics.identity_field_path === null
      && semantics.display_field_paths === null
      && semantics.read_operation_ref === null
      && semantics.read_interface_ref === null
      && semantics.read_request_identity_field_path === null
      && semantics.read_result_object_path === null
      && semantics.lookup_operation_ref === null
      && semantics.lookup_interface_ref === null
      && semantics.lookup_request_input_template === null
      && semantics.lookup_result_collection_path === null;
  }

  if (typeof semantics.reference_owner_ref !== "string" || !semantics.reference_owner_ref) return false;
  if (!isStringArray(semantics.identity_field_path) || !isStringMatrix(semantics.display_field_paths)) return false;
  if (typeof semantics.read_operation_ref !== "string" || !semantics.read_operation_ref) return false;
  if (typeof semantics.read_interface_ref !== "string" || !semantics.read_interface_ref) return false;
  if (!isStringArray(semantics.read_request_identity_field_path) || !isStringArray(semantics.read_result_object_path)) return false;

  if (ownerMode === "SELF") {
    if (semantics.reference_owner_ref !== sourceRef) return false;
    if (semantics.local_dependency_ref !== null) return false;
  } else {
    if (typeof semantics.local_dependency_ref !== "string" || !semantics.local_dependency_ref) return false;
    const dependencyObject = findContainingObjectWithString(source.dependencies, semantics.local_dependency_ref);
    if (!dependencyObject) return false;
    if (!Object.values(dependencyObject).some((value) => value === semantics.reference_owner_ref)) return false;
  }

  const readOperation = exactlyOneDeclaredObject(source, "operation_ref", semantics.read_operation_ref);
  const readInterface = exactlyOneDeclaredObject(source, "interface_ref", semantics.read_interface_ref);
  if (!readOperation || !readInterface || readInterface.operation_ref !== semantics.read_operation_ref) return false;
  if (typeof readInterface.request_contract_ref !== "string" || typeof readInterface.response_contract_ref !== "string") return false;
  const readRequest = schemaForContractRef(source, sourceRef, readInterface.request_contract_ref);
  const readResponse = schemaForContractRef(source, sourceRef, readInterface.response_contract_ref);
  if (!readRequest || !readResponse) return false;
  if (!schemaAtPath(readRequest, semantics.read_request_identity_field_path, source, sourceRef)) return false;
  const candidateSchema = schemaAtPath(readResponse, semantics.read_result_object_path, source, sourceRef);
  if (!candidateSchema) return false;
  const identitySchema = schemaAtPath(candidateSchema, semantics.identity_field_path, source, sourceRef);
  if (!identitySchema) return false;
  for (const path of semantics.display_field_paths) {
    if (!schemaAtPath(candidateSchema, path, source, sourceRef)) return false;
  }

  const fieldSchema = dereferenceSchema(fieldSchemaRaw, source, sourceRef);
  if (!fieldSchema) return false;
  const fieldTypes = schemaTypes(fieldSchema);
  if (cardinality === "ONE") {
    if (fieldTypes.includes("array") || !schemaCompatible(fieldSchema, identitySchema, source, sourceRef)) return false;
  } else {
    if (!fieldTypes.includes("array") || !isRecord(fieldSchema.items) || !schemaCompatible(fieldSchema.items, identitySchema, source, sourceRef)) {
      return false;
    }
  }

  if (resolutionMode === "ENUMERABLE_LOOKUP") {
    if (typeof semantics.lookup_operation_ref !== "string" || !semantics.lookup_operation_ref) return false;
    if (typeof semantics.lookup_interface_ref !== "string" || !semantics.lookup_interface_ref) return false;
    if (!isRecord(semantics.lookup_request_input_template)) return false;
    if (!isStringArray(semantics.lookup_result_collection_path)) return false;
    const lookupOperation = exactlyOneDeclaredObject(source, "operation_ref", semantics.lookup_operation_ref);
    const lookupInterface = exactlyOneDeclaredObject(source, "interface_ref", semantics.lookup_interface_ref);
    if (!lookupOperation || !lookupInterface || lookupInterface.operation_ref !== semantics.lookup_operation_ref) return false;
    if (typeof lookupInterface.request_contract_ref !== "string" || typeof lookupInterface.response_contract_ref !== "string") return false;
    const lookupRequest = schemaForContractRef(source, sourceRef, lookupInterface.request_contract_ref);
    const lookupResponse = schemaForContractRef(source, sourceRef, lookupInterface.response_contract_ref);
    if (!lookupRequest || !lookupResponse) return false;
    if (validateSchema(semantics.lookup_request_input_template, lookupRequest, source, sourceRef).length > 0) return false;
    const collection = schemaAtPath(lookupResponse, semantics.lookup_result_collection_path, source, sourceRef);
    if (!collection || !schemaTypes(collection).includes("array")) return false;
  } else if (
    semantics.lookup_operation_ref !== null
    || semantics.lookup_interface_ref !== null
    || semantics.lookup_request_input_template !== null
    || semantics.lookup_result_collection_path !== null
  ) {
    return false;
  }

  return true;
}

function temporalSemanticsComplete(
  fieldSchemaRaw: UnknownRecord,
  semantics: UnknownRecord,
  source: UnknownRecord,
  sourceRef: string,
): boolean {
  const kind = semantics.temporal_kind;
  const fieldSchema = dereferenceSchema(fieldSchemaRaw, source, sourceRef);
  if (!fieldSchema) return false;
  const scalarFormats: Record<string, string> = {
    DATE: "date",
    TIME: "time",
    DATE_TIME: "date-time",
    DURATION: "duration",
  };
  if (typeof kind === "string" && Object.prototype.hasOwnProperty.call(scalarFormats, kind)) {
    return schemaTypes(fieldSchema).includes("string")
      && fieldSchema.format === scalarFormats[kind]
      && semantics.json_schema_format === scalarFormats[kind]
      && semantics.range_start_path === null
      && semantics.range_end_path === null
      && semantics.range_endpoint_kind === null;
  }
  if (kind !== "RANGE") return false;
  if (!schemaTypes(fieldSchema).includes("object")) return false;
  if (semantics.json_schema_format !== null) return false;
  if (!isStringArray(semantics.range_start_path) || !isStringArray(semantics.range_end_path)) return false;
  if (canonicalJson(semantics.range_start_path) === canonicalJson(semantics.range_end_path)) return false;
  if (!["DATE", "TIME", "DATE_TIME"].includes(String(semantics.range_endpoint_kind))) return false;
  const expectedFormat = scalarFormats[String(semantics.range_endpoint_kind)];
  const start = schemaAtPath(fieldSchema, semantics.range_start_path, source, sourceRef);
  const end = schemaAtPath(fieldSchema, semantics.range_end_path, source, sourceRef);
  return Boolean(
    start
    && end
    && schemaTypes(start).includes("string")
    && schemaTypes(end).includes("string")
    && start.format === expectedFormat
    && end.format === expectedFormat
  );
}

function validateSpecialBindings(source: UnknownRecord, sourceRef: string): {
  referenceBindingValid: boolean;
  temporalBindingValid: boolean;
  referenceSemanticsPresent: boolean;
  temporalSemanticsPresent: boolean;
} {
  let referenceBindingValid = true;
  let temporalBindingValid = true;
  let referenceSemanticsPresent = true;
  let temporalSemanticsPresent = true;

  const visit = (schemaRaw: UnknownRecord, visited = new Set<UnknownRecord>()) => {
    const schema = dereferenceSchema(schemaRaw, source, sourceRef);
    if (!schema || visited.has(schema)) return;
    visited.add(schema);
    if (isRecord(schema.properties)) {
      for (const child of Object.values(schema.properties)) {
        if (!isRecord(child)) continue;
        const semantics = fieldSemanticsOf(child);
        if (semantics?.semantic_kind === "BUSINESS_REFERENCE") {
          if (!Object.prototype.hasOwnProperty.call(semantics, "reference_owner_mode")) {
            referenceSemanticsPresent = false;
          } else if (!referenceSemanticsComplete(child, semantics, source, sourceRef)) {
            referenceBindingValid = false;
          }
        }
        if (semantics?.semantic_kind === "TEMPORAL") {
          if (!Object.prototype.hasOwnProperty.call(semantics, "temporal_kind")) {
            temporalSemanticsPresent = false;
          } else if (!temporalSemanticsComplete(child, semantics, source, sourceRef)) {
            temporalBindingValid = false;
          }
        }
        const resolved = dereferenceSchema(child, source, sourceRef);
        if (!resolved) continue;
        if (schemaTypes(resolved).includes("object") && isRecord(resolved.properties)) visit(resolved, visited);
        if (schemaTypes(resolved).includes("array") && isRecord(resolved.items)) {
          const item = dereferenceSchema(resolved.items, source, sourceRef);
          if (item && schemaTypes(item).includes("object") && isRecord(item.properties)) visit(item, visited);
        }
      }
    }
  };

  for (const entry of collectRequestSchemaRefs(source, sourceRef)) visit(entry.schema);
  return { referenceBindingValid, temporalBindingValid, referenceSemanticsPresent, temporalSemanticsPresent };
}

function operationInterfaceRefs(source: UnknownRecord, operation: UnknownRecord): string[] {
  if (Array.isArray(operation.interface_refs) && operation.interface_refs.every((x) => typeof x === "string")) {
    return operation.interface_refs as string[];
  }
  const refs: string[] = [];
  for (const iface of Object.values(source.interfaces as UnknownRecord)) {
    if (isRecord(iface) && iface.operation_ref === operation.operation_ref && typeof iface.interface_ref === "string") {
      refs.push(iface.interface_ref);
    }
  }
  return refs;
}

function normalizeReferenceBinding(
  fieldSchema: UnknownRecord,
  semantics: UnknownRecord,
): UiReferenceInputBinding {
  return {
    source_reference_semantics: cloneJson(semantics),
    reference_owner_mode: semantics.reference_owner_mode as UiReferenceInputBinding["reference_owner_mode"],
    reference_owner_ref: (semantics.reference_owner_ref ?? null) as string | null,
    local_dependency_ref: (semantics.local_dependency_ref ?? null) as string | null,
    resolution_mode: semantics.resolution_mode as UiReferenceInputBinding["resolution_mode"],
    selection_cardinality: semantics.selection_cardinality as UiReferenceInputBinding["selection_cardinality"],
    manual_entry_allowed: Boolean(semantics.manual_entry_allowed),
    identity_field_path: (semantics.identity_field_path ?? null) as string[] | null,
    display_field_paths: (semantics.display_field_paths ?? null) as string[][] | null,
    read_operation_ref: (semantics.read_operation_ref ?? null) as string | null,
    read_interface_ref: (semantics.read_interface_ref ?? null) as string | null,
    read_request_identity_field_path: (semantics.read_request_identity_field_path ?? null) as string[] | null,
    read_result_object_path: (semantics.read_result_object_path ?? null) as string[] | null,
    lookup_operation_ref: (semantics.lookup_operation_ref ?? null) as string | null,
    lookup_interface_ref: (semantics.lookup_interface_ref ?? null) as string | null,
    lookup_request_input_template: (semantics.lookup_request_input_template ?? null) as Record<string, unknown> | null,
    lookup_result_collection_path: (semantics.lookup_result_collection_path ?? null) as string[] | null,
  };
}

function normalizeTemporalBinding(semantics: UnknownRecord): UiTemporalInputBinding {
  return {
    source_temporal_semantics: cloneJson(semantics),
    temporal_kind: semantics.temporal_kind as UiTemporalInputBinding["temporal_kind"],
    json_schema_format: (semantics.json_schema_format ?? null) as UiTemporalInputBinding["json_schema_format"],
    range_start_path: (semantics.range_start_path ?? null) as string[] | null,
    range_end_path: (semantics.range_end_path ?? null) as string[] | null,
    range_endpoint_kind: (semantics.range_endpoint_kind ?? null) as UiTemporalInputBinding["range_endpoint_kind"],
  };
}

function plainControlKind(schemaRaw: UnknownRecord, source: UnknownRecord, sourceRef: string): ControlKind | undefined {
  const schema = dereferenceSchema(schemaRaw, source, sourceRef);
  if (!schema) return undefined;
  if (Array.isArray(schema.enum)) return "SELECT_INPUT";
  const types = schemaTypes(schema).filter((type) => type !== "null");
  if (types.length !== 1) return undefined;
  switch (types[0]) {
    case "string": return "TEXT_INPUT";
    case "integer":
    case "number": return "NUMBER_INPUT";
    case "boolean": return "BOOLEAN_INPUT";
    case "array": return "COLLECTION_INPUT";
    case "object": return "STRUCTURED_INPUT";
    default: return undefined;
  }
}

function responseViewKind(schemaRaw: UnknownRecord, source: UnknownRecord, sourceRef: string): ViewKind | undefined {
  const schema = dereferenceSchema(schemaRaw, source, sourceRef);
  if (!schema) return undefined;
  if (Array.isArray(schema.enum)) return "VALUE_VIEW";
  const types = schemaTypes(schema).filter((type) => type !== "null");
  if (types.length !== 1) return undefined;
  switch (types[0]) {
    case "string":
    case "integer":
    case "number":
    case "boolean": return "VALUE_VIEW";
    case "array": return "COLLECTION_VIEW";
    case "object": return "STRUCTURED_VIEW";
    default: return undefined;
  }
}

function instanceVariableKind(source: UnknownRecord, ref: string): string | undefined {
  const iv = source.instance_variability;
  if (!isRecord(iv) || !Array.isArray(iv.instance_variables)) return undefined;
  const matches = iv.instance_variables.filter((item) => isRecord(item) && item.instance_variable_ref === ref);
  if (matches.length !== 1) return undefined;
  const match = matches[0] as UnknownRecord;
  return typeof match.kind === "string" ? match.kind : typeof match.instance_variable_kind === "string" ? match.instance_variable_kind : undefined;
}

function controlsForInterface(
  source: UnknownRecord,
  sourceRef: string,
  operationRef: string,
  requestContractRef: string,
): UiRequestControlBinding[] {
  const schema = schemaForContractRef(source, sourceRef, requestContractRef);
  if (!schema || !isRecord(schema.properties)) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
  const required = new Set(Array.isArray(schema.required) ? schema.required.filter((x): x is string => typeof x === "string") : []);
  const controls: UiRequestControlBinding[] = [];
  Object.entries(schema.properties).forEach(([field, rawFieldSchema], index) => {
    if (!isRecord(rawFieldSchema)) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
    const semantics = fieldSemanticsOf(rawFieldSchema);
    if (!semantics) throw new StableProjectionError("UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE");
    const variabilityClass = semantics.variability_class as "GENERAL" | "INSTANCE";
    let instanceVariableRef: string | null = null;
    if (variabilityClass === "INSTANCE") {
      if (typeof semantics.instance_variable_ref !== "string" || !semantics.instance_variable_ref) {
        throw new StableProjectionError("UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE");
      }
      if (instanceVariableKind(source, semantics.instance_variable_ref) !== "VALUE_PARAMETER") {
        throw new StableProjectionError("UI_MODULE_OUTPUT_GRAMMAR_INVALID");
      }
      instanceVariableRef = semantics.instance_variable_ref;
    }
    let controlKind: ControlKind | undefined;
    let referenceBinding: UiReferenceInputBinding | null = null;
    let temporalBinding: UiTemporalInputBinding | null = null;
    if (semantics.semantic_kind === "BUSINESS_REFERENCE") {
      controlKind = "REFERENCE_INPUT";
      referenceBinding = normalizeReferenceBinding(rawFieldSchema, semantics);
    } else if (semantics.semantic_kind === "TEMPORAL") {
      controlKind = "TEMPORAL_INPUT";
      temporalBinding = normalizeTemporalBinding(semantics);
    } else if (semantics.semantic_kind === "PLAIN_VALUE") {
      controlKind = plainControlKind(rawFieldSchema, source, sourceRef);
    }
    if (!controlKind) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
    controls.push({
      source_operation_ref: operationRef,
      source_request_contract_ref: requestContractRef,
      source_field_path: [field],
      source_field_schema: cloneJson(rawFieldSchema),
      control_kind: controlKind,
      required: required.has(field),
      field_order: index,
      reference_binding: referenceBinding,
      temporal_binding: temporalBinding,
      variability_class: variabilityClass,
      instance_variable_ref: instanceVariableRef,
    });
  });
  return controls;
}

function viewsForInterface(
  source: UnknownRecord,
  sourceRef: string,
  operationRef: string,
  responseContractRef: string,
): UiResponseViewBinding[] {
  const schema = schemaForContractRef(source, sourceRef, responseContractRef);
  if (!schema || !isRecord(schema.properties)) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
  const views: UiResponseViewBinding[] = [];
  Object.entries(schema.properties).forEach(([field, rawFieldSchema], index) => {
    if (!isRecord(rawFieldSchema)) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
    const viewKind = responseViewKind(rawFieldSchema, source, sourceRef);
    if (!viewKind) throw new StableProjectionError("UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
    views.push({
      source_operation_ref: operationRef,
      source_response_contract_ref: responseContractRef,
      source_field_path: [field],
      source_field_schema: cloneJson(rawFieldSchema),
      view_kind: viewKind,
      field_order: index,
    });
  });
  return views;
}

function providerInterfaceRefs(source: UnknownRecord): string[] {
  const surface = source.external_provider_surface;
  if (!isRecord(surface) || !Array.isArray(surface.provider_interface_refs)) return [];
  if (!surface.provider_interface_refs.every((x) => typeof x === "string")) return [];
  return [...surface.provider_interface_refs] as string[];
}

function projectOperations(
  request: ResolveUiModuleRequest,
  source: UnknownRecord,
): { operations: UiOperationProjection[]; actions: UiActionBinding[] } {
  const sourceRef = request.projection_input.source_capability_contract_ref;
  const providerRefs = providerInterfaceRefs(source);
  const operations: UiOperationProjection[] = [];
  const actions: UiActionBinding[] = [];

  for (const operation of Object.values(source.operations as UnknownRecord)) {
    if (!isRecord(operation) || typeof operation.operation_ref !== "string") {
      throw new StableProjectionError("UI_MODULE_OPERATION_COVERAGE_INCOMPLETE");
    }
    const interfaceProjections: UiInterfaceProjection[] = [];
    const executableInterfaceRefs: string[] = [];
    for (const interfaceRef of operationInterfaceRefs(source, operation)) {
      const iface = resolveDeclaredObject(source, sourceRef, interfaceRef, ["interface_ref"]);
      if (!iface || iface.operation_ref !== operation.operation_ref) {
        throw new StableProjectionError("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE");
      }
      if (
        typeof iface.request_contract_ref !== "string"
        || typeof iface.response_contract_ref !== "string"
        || typeof iface.outcome_contract_ref !== "string"
        || typeof iface.stable_error_contract_ref !== "string"
      ) {
        throw new StableProjectionError("UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE");
      }
      const requestControls = controlsForInterface(source, sourceRef, operation.operation_ref, iface.request_contract_ref);
      const responseViews = viewsForInterface(source, sourceRef, operation.operation_ref, iface.response_contract_ref);
      const executable = providerRefs.includes(interfaceRef);
      const projection: UiInterfaceProjection = {
        source_operation_ref: operation.operation_ref,
        source_interface_ref: interfaceRef,
        source_request_contract_ref: iface.request_contract_ref,
        source_response_contract_ref: iface.response_contract_ref,
        source_outcome_contract_ref: iface.outcome_contract_ref,
        source_stable_error_contract_ref: iface.stable_error_contract_ref,
        request_controls: requestControls,
        response_views: responseViews,
        executable,
      };
      interfaceProjections.push(projection);
      if (executable) {
        executableInterfaceRefs.push(interfaceRef);
        actions.push({
          source_capability_ref: request.source_capability_ref,
          source_capability_contract_ref: sourceRef,
          source_capability_contract_hash: request.projection_input.source_capability_contract_hash,
          source_external_provider_surface_ref: request.projection_input.source_external_provider_surface_ref,
          source_external_provider_surface_hash: request.projection_input.source_external_provider_surface_hash,
          source_operation_ref: operation.operation_ref,
          source_interface_ref: interfaceRef,
          source_request_contract_ref: iface.request_contract_ref,
          source_response_contract_ref: iface.response_contract_ref,
          source_outcome_contract_ref: iface.outcome_contract_ref,
          source_stable_error_contract_ref: iface.stable_error_contract_ref,
          request_controls: cloneJson(requestControls),
          response_views: cloneJson(responseViews),
          executable: true,
        });
      }
    }
    operations.push({
      source_operation_ref: operation.operation_ref,
      interface_projections: interfaceProjections,
      executable_interface_refs: executableInterfaceRefs,
    });
  }
  return { operations, actions };
}

function stateBindings(source: UnknownRecord): UiStateBinding[] {
  const out: UiStateBinding[] = [];
  const model = source.state_model;
  if (!isRecord(model) || model.mode === "STATELESS") return out;
  if (!Array.isArray(model.state_machines)) throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
  model.state_machines.forEach((machine, machineIndex) => {
    if (!isRecord(machine)) throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
    const path = Array.isArray(machine.state_field_path) && machine.state_field_path.every((x) => typeof x === "string")
      ? machine.state_field_path as string[]
      : ["state_model", "state_machines", String(machineIndex)];
    const bindings = Array.isArray(machine.operation_state_bindings) ? machine.operation_state_bindings : [];
    for (const binding of bindings) {
      if (!isRecord(binding)) throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
      out.push({
        source_operation_ref: typeof binding.operation_ref === "string" ? binding.operation_ref : null,
        source_state_path: cloneJson(path),
        source_state_semantics: cloneJson(binding),
      });
    }
  });
  return out;
}

function permissionBindings(source: UnknownRecord): UiPermissionBinding[] {
  const out: UiPermissionBinding[] = [];
  const model = source.permission_model;
  if (!isRecord(model) || !Array.isArray(model.operation_permission_bindings)) return out;
  model.operation_permission_bindings.forEach((binding, index) => {
    if (!isRecord(binding)) throw new StableProjectionError("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID");
    out.push({
      source_operation_ref: typeof binding.operation_ref === "string" ? binding.operation_ref : null,
      source_permission_path: ["permission_model", "operation_permission_bindings", String(index)],
      source_permission_semantics: cloneJson(binding),
    });
  });
  return out;
}

function evidenceViews(source: UnknownRecord): UiEvidenceViewBinding[] {
  const projection = source.evidence_projection;
  if (projection === undefined) return [];
  if (!isRecord(projection)) throw new StableProjectionError("UI_MODULE_OUTPUT_GRAMMAR_INVALID");
  const out: UiEvidenceViewBinding[] = [];
  for (const [key, value] of Object.entries(projection)) {
    out.push({
      source_operation_ref: isRecord(value) && typeof value.operation_ref === "string" ? value.operation_ref : null,
      source_evidence_path: ["evidence_projection", key],
      source_evidence_semantics: cloneJson(value),
    });
  }
  return out;
}

function logicProjection(source: UnknownRecord): UiLogicGraphProjection {
  const operationalRelations: UiOperationalRelationProjection[] = [];
  const stateMachines: UiStateMachineProjection[] = [];
  const stateTransitions: UiStateTransitionProjection[] = [];
  const permissions: UiPermissionProjection[] = [];
  const actorClasses: UiActorClassProjection[] = [];
  const ruleBindings: UiRuleBindingProjection[] = [];

  const relations = source.operational_relations;
  if (!isRecord(relations)) throw new StableProjectionError("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID");
  if (relations.mode !== "NONE") {
    if (!Array.isArray(relations.relations)) throw new StableProjectionError("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID");
    for (const relation of relations.relations) {
      if (!isRecord(relation)) throw new StableProjectionError("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID");
      const required = [
        "relation_ref",
        "consumer_operation_ref",
        "local_dependency_ref",
        "provider_capability_contract_ref",
        "provider_operation_ref",
        "provider_interface_ref",
      ] as const;
      if (!required.every((key) => typeof relation[key] === "string" && relation[key])) {
        throw new StableProjectionError("UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID");
      }
      operationalRelations.push({
        source_relation_ref: relation.relation_ref as string,
        source_consumer_operation_ref: relation.consumer_operation_ref as string,
        source_local_dependency_ref: relation.local_dependency_ref as string,
        source_provider_capability_contract_ref: relation.provider_capability_contract_ref as string,
        source_provider_operation_ref: relation.provider_operation_ref as string,
        source_provider_interface_ref: relation.provider_interface_ref as string,
        source_relation_semantics: cloneJson(relation),
      });
    }
  }

  const states = source.state_model;
  if (!isRecord(states)) throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
  if (states.mode !== "STATELESS") {
    if (!Array.isArray(states.state_machines)) throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
    for (const machine of states.state_machines) {
      if (!isRecord(machine) || typeof machine.state_machine_ref !== "string" || typeof machine.subject_schema_ref !== "string") {
        throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
      }
      stateMachines.push({
        source_state_machine_ref: machine.state_machine_ref,
        source_subject_schema_ref: machine.subject_schema_ref,
        source_state_machine_semantics: cloneJson(machine),
      });
      if (!Array.isArray(machine.transitions)) continue;
      for (const transition of machine.transitions) {
        if (
          !isRecord(transition)
          || typeof transition.transition_ref !== "string"
          || typeof transition.operation_ref !== "string"
        ) {
          throw new StableProjectionError("UI_MODULE_STATE_MODEL_PROJECTION_INVALID");
        }
        stateTransitions.push({
          source_state_machine_ref: machine.state_machine_ref,
          source_transition_ref: transition.transition_ref,
          source_operation_ref: transition.operation_ref,
          source_transition_semantics: cloneJson(transition),
        });
      }
    }
  }

  const permissionModel = source.permission_model;
  if (!isRecord(permissionModel)) throw new StableProjectionError("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID");
  if (Array.isArray(permissionModel.operation_permission_bindings)) {
    for (const permission of permissionModel.operation_permission_bindings) {
      if (
        !isRecord(permission)
        || typeof permission.permission_ref !== "string"
        || typeof permission.operation_ref !== "string"
        || !["UNRESTRICTED", "RESTRICTED"].includes(String(permission.access_mode))
      ) {
        throw new StableProjectionError("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID");
      }
      permissions.push({
        source_permission_ref: permission.permission_ref,
        source_operation_ref: permission.operation_ref,
        source_access_mode: permission.access_mode as "UNRESTRICTED" | "RESTRICTED",
        source_permission_semantics: cloneJson(permission),
      });
    }
  }
  if (Array.isArray(permissionModel.actor_classes)) {
    for (const actor of permissionModel.actor_classes) {
      if (
        !isRecord(actor)
        || typeof actor.actor_class_ref !== "string"
        || !["BUSINESS_REFERENCE", "EXTERNAL_AUTHORITY"].includes(String(actor.identity_source_kind))
      ) {
        throw new StableProjectionError("UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID");
      }
      actorClasses.push({
        source_actor_class_ref: actor.actor_class_ref,
        source_identity_source_kind: actor.identity_source_kind as "BUSINESS_REFERENCE" | "EXTERNAL_AUTHORITY",
        source_actor_class_semantics: cloneJson(actor),
      });
    }
  }

  const ruleModel = source.rule_bindings;
  if (!isRecord(ruleModel) || !Array.isArray(ruleModel.bindings)) {
    throw new StableProjectionError("UI_MODULE_RULE_BINDING_PROJECTION_INVALID");
  }
  for (const binding of ruleModel.bindings) {
    if (
      !isRecord(binding)
      || typeof binding.rule_ref !== "string"
      || typeof binding.enforcement_phase !== "string"
      || typeof binding.evaluation_realization_mode !== "string"
    ) {
      throw new StableProjectionError("UI_MODULE_RULE_BINDING_PROJECTION_INVALID");
    }
    ruleBindings.push({
      source_rule_ref: binding.rule_ref,
      source_enforcement_phase: binding.enforcement_phase as UiRuleBindingProjection["source_enforcement_phase"],
      source_evaluation_realization_mode: binding.evaluation_realization_mode as UiRuleBindingProjection["source_evaluation_realization_mode"],
      source_rule_binding_semantics: cloneJson(binding),
    });
  }

  return {
    operational_relations: operationalRelations,
    state_machines: stateMachines,
    state_transitions: stateTransitions,
    permissions,
    actor_classes: actorClasses,
    rule_bindings: ruleBindings,
    status: "COMPLETE",
  };
}

function exactStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((x) => typeof x === "string")) return undefined;
  return value as string[];
}

function sameArray(a: readonly unknown[], b: readonly unknown[]): boolean {
  return canonicalJson(a) === canonicalJson(b);
}

function evaluateRule(
  ruleId: string,
  request: ResolveUiModuleRequest,
  source: UnknownRecord,
  artifact: UiModuleArtifact,
): boolean {
  const sourceRef = request.projection_input.source_capability_contract_ref;
  const sourceOperationRefs = Object.values(source.operations as UnknownRecord)
    .filter(isRecord)
    .map((op) => op.operation_ref)
    .filter((x): x is string => typeof x === "string");
  const sourceInterfaceRefs = Object.values(source.interfaces as UnknownRecord)
    .filter(isRecord)
    .map((iface) => iface.interface_ref)
    .filter((x): x is string => typeof x === "string");
  const providerRefs = providerInterfaceRefs(source);
  const projectedOperationRefs = artifact.semantic_model.operation_projections.map((op) => op.source_operation_ref);
  const projectedInterfaceRefs = artifact.semantic_model.operation_projections.flatMap((op) => op.interface_projections.map((i) => i.source_interface_ref));
  const actionRefs = artifact.action_bindings.map((a) => a.source_interface_ref);

  switch (ruleId) {
    case "QUI-MOD-001":
      return validateSourceLineage(request, source) && validatePresentationBoundary(source);
    case "QUI-MOD-002":
    case "QUI-MOD-007":
      return artifact.source_semantic_snapshot === source || canonicalJson(artifact.source_semantic_snapshot) === canonicalJson(source);
    case "QUI-MOD-003":
      return artifact.semantic_model.operation_projections.every((op) =>
        op.interface_projections.every((iface) =>
          iface.request_controls.every((control) => isRecord(control.source_field_schema))
          && iface.response_views.every((view) => isRecord(view.source_field_schema))
        )
      );
    case "QUI-MOD-004":
      return validatePresentationBoundary(source);
    case "QUI-MOD-006":
      return /^sha256:[0-9a-f]{64}$/.test(artifact.content_hash) && artifact.ui_module_ref === artifact.content_hash;
    case "QUI-MOD-008":
    case "UI_MODULE.R011":
      return actionRefs.every((ref) => providerRefs.includes(ref)) && providerRefs.every((ref) => actionRefs.includes(ref));
    case "UI_MODULE.R009":
      return !("host" in artifact) && !("theme" in artifact) && !("runtime_lifecycle" in artifact);
    case "UI_MODULE.R010":
      return artifact.source_lineage.source_capability_contract_hash === request.projection_input.source_capability_contract_hash
        && artifact.source_lineage.source_external_provider_surface_hash === request.projection_input.source_external_provider_surface_hash;
    case "UI_MODULE.R012":
      return artifact.source_lineage.source_capability_ref === request.source_capability_ref
        && artifact.source_lineage.source_capability_contract_ref === request.projection_input.source_capability_contract_ref
        && artifact.source_lineage.source_external_provider_surface_ref === request.projection_input.source_external_provider_surface_ref;
    case "UI_MODULE.R013":
      return canonicalJson(artifact.source_semantic_snapshot) === canonicalJson(source);
    case "UI_MODULE.R014":
      return sameArray(sourceOperationRefs, projectedOperationRefs);
    case "UI_MODULE.R015":
      return sameArray(sourceInterfaceRefs, projectedInterfaceRefs)
        && artifact.semantic_model.operation_projections.every((op) =>
          op.interface_projections.every((iface) => {
            const sourceIface = resolveDeclaredObject(source, sourceRef, iface.source_interface_ref, ["interface_ref"]);
            return Boolean(
              sourceIface
              && sourceIface.operation_ref === op.source_operation_ref
              && sourceIface.request_contract_ref === iface.source_request_contract_ref
              && sourceIface.response_contract_ref === iface.source_response_contract_ref
              && sourceIface.outcome_contract_ref === iface.source_outcome_contract_ref
              && sourceIface.stable_error_contract_ref === iface.source_stable_error_contract_ref
            );
          })
        );
    case "UI_MODULE.R016":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) => {
        const schema = schemaForContractRef(source, sourceRef, iface.source_request_contract_ref);
        if (!schema || !isRecord(schema.properties)) return false;
        const fields = Object.keys(schema.properties);
        return sameArray(fields, iface.request_controls.map((c) => c.source_field_path[0]))
          && iface.request_controls.every((c, i) => c.field_order === i);
      }));
    case "UI_MODULE.R017":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) => {
        const schema = schemaForContractRef(source, sourceRef, iface.source_response_contract_ref);
        if (!schema || !isRecord(schema.properties)) return false;
        const fields = Object.keys(schema.properties);
        return sameArray(fields, iface.response_views.map((v) => v.source_field_path[0]))
          && iface.response_views.every((v, i) => v.field_order === i);
      }));
    case "UI_MODULE.R018":
      return artifact.action_bindings.every((action) => {
        const projection = artifact.semantic_model.operation_projections
          .flatMap((op) => op.interface_projections)
          .find((iface) => iface.source_interface_ref === action.source_interface_ref);
        return Boolean(
          projection
          && canonicalJson(projection.request_controls) === canonicalJson(action.request_controls)
          && canonicalJson(projection.response_views) === canonicalJson(action.response_views)
          && action.source_capability_ref === request.source_capability_ref
        );
      });
    case "UI_MODULE.R019":
      return artifact.semantic_model.coverage.status === "COMPLETE"
        && sameArray(sourceOperationRefs, artifact.semantic_model.coverage.source_operation_refs)
        && sameArray(projectedOperationRefs, artifact.semantic_model.coverage.projected_operation_refs)
        && sameArray(sourceInterfaceRefs, artifact.semantic_model.coverage.source_interface_refs)
        && sameArray(projectedInterfaceRefs, artifact.semantic_model.coverage.projected_interface_refs)
        && sameArray(providerRefs, artifact.semantic_model.coverage.source_provider_interface_refs)
        && sameArray(actionRefs, artifact.semantic_model.coverage.bound_action_interface_refs);
    case "UI_MODULE.R020": {
      const schemaRoot: UnknownRecord = { type_closure: { schemas: uiModuleTypeSchemas } };
      return validateSchema(
        artifact,
        (uiModuleTypeSchemas as unknown as UnknownRecord).ui_module_artifact as UnknownRecord,
        schemaRoot,
        CAPABILITY_CONTRACT_REF,
      ).length === 0;
    }
    case "UI_MODULE.R021":
      return artifact.state_bindings.length === stateBindings(source).length
        && artifact.permission_bindings.length === permissionBindings(source).length
        && artifact.evidence_views.length === evidenceViews(source).length;
    case "UI_MODULE.R022":
      return evaluateRule("UI_MODULE.R014", request, source, artifact)
        && evaluateRule("UI_MODULE.R015", request, source, artifact)
        && evaluateRule("UI_MODULE.R016", request, source, artifact)
        && evaluateRule("UI_MODULE.R017", request, source, artifact)
        && evaluateRule("UI_MODULE.R018", request, source, artifact);
    case "UI_MODULE.R023":
    case "UI_MODULE.R039":
      return validateAllFieldSemantics(source, sourceRef);
    case "UI_MODULE.R024":
    case "UI_MODULE.R025":
    case "UI_MODULE.R026":
    case "UI_MODULE.R029":
      return validateSpecialBindings(source, sourceRef).referenceBindingValid;
    case "UI_MODULE.R027":
    case "UI_MODULE.R028":
      return validateSpecialBindings(source, sourceRef).temporalBindingValid;
    case "UI_MODULE.R030":
      return artifact.semantic_model.semantic_model_version === "Q_UI_MODULE_SEMANTIC_MODEL_V6";
    case "UI_MODULE.R033":
      return validateSourceSemanticProjection(source, sourceRef);
    case "UI_MODULE.R034":
      return canonicalJson(artifact.logic_projection.operational_relations.map((x) => x.source_relation_semantics))
        === canonicalJson((isRecord(source.operational_relations) && Array.isArray(source.operational_relations.relations)) ? source.operational_relations.relations : []);
    case "UI_MODULE.R035":
      return artifact.logic_projection.status === "COMPLETE"
        && artifact.logic_projection.state_machines.length === (
          isRecord(source.state_model) && Array.isArray(source.state_model.state_machines) ? source.state_model.state_machines.length : 0
        );
    case "UI_MODULE.R036":
      return artifact.logic_projection.permissions.length === (
        isRecord(source.permission_model) && Array.isArray(source.permission_model.operation_permission_bindings)
          ? source.permission_model.operation_permission_bindings.length
          : 0
      )
        && artifact.logic_projection.actor_classes.length === (
          isRecord(source.permission_model) && Array.isArray(source.permission_model.actor_classes)
            ? source.permission_model.actor_classes.length
            : 0
        );
    case "UI_MODULE.R037":
      return artifact.logic_projection.rule_bindings.length === (
        isRecord(source.rule_bindings) && Array.isArray(source.rule_bindings.bindings) ? source.rule_bindings.bindings.length : 0
      )
        && artifact.logic_projection.rule_bindings.every((binding) => {
          const sourceBinding = (source.rule_bindings as UnknownRecord).bindings;
          return Array.isArray(sourceBinding) && sourceBinding.some((x) =>
            isRecord(x)
            && x.rule_ref === binding.source_rule_ref
            && x.enforcement_phase === binding.source_enforcement_phase
            && x.evaluation_realization_mode === binding.source_evaluation_realization_mode
          );
        });
    case "UI_MODULE.R038":
      return artifact.logic_projection.status === "COMPLETE"
        && evaluateRule("UI_MODULE.R034", request, source, artifact)
        && evaluateRule("UI_MODULE.R035", request, source, artifact)
        && evaluateRule("UI_MODULE.R036", request, source, artifact)
        && evaluateRule("UI_MODULE.R037", request, source, artifact);
    case "Q-UI-UI_MODULE-040":
      return !Object.prototype.hasOwnProperty.call(source, "instance_variability")
        || canonicalJson(artifact.source_semantic_snapshot.instance_variability) === canonicalJson(source.instance_variability);
    case "Q-UI-UI_MODULE-041":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) =>
        iface.request_controls.every((control) =>
          (control.variability_class === "GENERAL" && control.instance_variable_ref === null)
          || (control.variability_class === "INSTANCE" && typeof control.instance_variable_ref === "string" && control.instance_variable_ref.length > 0)
        )
      ));
    case "Q-UI-UI_MODULE-042":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) =>
        iface.request_controls.every((control) => !Object.prototype.hasOwnProperty.call(control, "instance_value"))
      ));
    case "Q-UI-UI_MODULE-043": {
      const v = Number(sourceRef.match(/@V([0-9]{4,})$/)?.[1] ?? Number.NaN);
      return Object.prototype.hasOwnProperty.call(source, "instance_variability") || (Number.isFinite(v) && v < 113);
    }
    case "Q-UI-UI_MODULE-044":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) =>
        iface.request_controls.every((control) =>
          control.variability_class !== "INSTANCE"
          || (control.instance_variable_ref !== null && instanceVariableKind(source, control.instance_variable_ref) === "VALUE_PARAMETER")
        )
      ));
    case "Q-UI-UI_MODULE-045":
      return !("target_stage" in artifact)
        && !("target_slot" in artifact)
        && !("skeleton_token" in artifact)
        && !("materialization_connection_evidence" in artifact);
    case "Q-UI-UI_MODULE-046":
      return artifact.semantic_model.operation_projections.every((op) => op.interface_projections.every((iface) =>
        iface.request_controls.every((control) => {
          const leaf = control.source_field_path.at(-1);
          return !["capability_id", "operation_id"].includes(String(leaf)) || control.variability_class === "GENERAL";
        })
      ));
    case "Q-UI-UI_MODULE-049":
      return artifact.source_lineage.source_capability_contract_ref === sourceRef
        && artifact.source_lineage.source_capability_contract_hash === request.projection_input.source_capability_contract_hash;
    case "Q-UI-UI_MODULE-051":
      return evaluateRule("Q-UI-UI_MODULE-044", request, source, artifact);
    default:
      return false;
  }
}

const operationEnforcedRules = [
  "QUI-MOD-001","QUI-MOD-002","QUI-MOD-003","QUI-MOD-004","QUI-MOD-006","QUI-MOD-007","QUI-MOD-008",
  "UI_MODULE.R009","UI_MODULE.R010","UI_MODULE.R011","UI_MODULE.R012","UI_MODULE.R013","UI_MODULE.R014","UI_MODULE.R015",
  "UI_MODULE.R016","UI_MODULE.R017","UI_MODULE.R018","UI_MODULE.R019","UI_MODULE.R020","UI_MODULE.R021","UI_MODULE.R022",
  "UI_MODULE.R023","UI_MODULE.R024","UI_MODULE.R025","UI_MODULE.R026","UI_MODULE.R027","UI_MODULE.R028","UI_MODULE.R029",
  "UI_MODULE.R030","UI_MODULE.R033","UI_MODULE.R034","UI_MODULE.R035","UI_MODULE.R036","UI_MODULE.R037","UI_MODULE.R038",
  "UI_MODULE.R039","Q-UI-UI_MODULE-040","Q-UI-UI_MODULE-041","Q-UI-UI_MODULE-042","Q-UI-UI_MODULE-043","Q-UI-UI_MODULE-044",
  "Q-UI-UI_MODULE-045","Q-UI-UI_MODULE-046","Q-UI-UI_MODULE-049","Q-UI-UI_MODULE-051",
] as const;

const ruleFailureCode: Record<(typeof operationEnforcedRules)[number], UiModuleStableErrorCode> = {
  "QUI-MOD-001":"UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
  "QUI-MOD-002":"UI_MODULE_SOURCE_OPERATION_EXECUTION_FORBIDDEN",
  "QUI-MOD-003":"UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
  "QUI-MOD-004":"UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN",
  "QUI-MOD-006":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "QUI-MOD-007":"UI_MODULE_SOURCE_OPERATION_EXECUTION_FORBIDDEN",
  "QUI-MOD-008":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R009":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R010":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R011":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R012":"UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
  "UI_MODULE.R013":"UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
  "UI_MODULE.R014":"UI_MODULE_OPERATION_COVERAGE_INCOMPLETE",
  "UI_MODULE.R015":"UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE",
  "UI_MODULE.R016":"UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
  "UI_MODULE.R017":"UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS",
  "UI_MODULE.R018":"UI_MODULE_ACTION_LINEAGE_INCOMPLETE",
  "UI_MODULE.R019":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R020":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R021":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R022":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R023":"UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  "UI_MODULE.R024":"UI_MODULE_REFERENCE_BINDING_INVALID",
  "UI_MODULE.R025":"UI_MODULE_REFERENCE_BINDING_INVALID",
  "UI_MODULE.R026":"UI_MODULE_REFERENCE_BINDING_INVALID",
  "UI_MODULE.R027":"UI_MODULE_TEMPORAL_BINDING_INVALID",
  "UI_MODULE.R028":"UI_MODULE_TEMPORAL_BINDING_INVALID",
  "UI_MODULE.R029":"UI_MODULE_REFERENCE_BINDING_INVALID",
  "UI_MODULE.R030":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "UI_MODULE.R033":"UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
  "UI_MODULE.R034":"UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID",
  "UI_MODULE.R035":"UI_MODULE_STATE_MODEL_PROJECTION_INVALID",
  "UI_MODULE.R036":"UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID",
  "UI_MODULE.R037":"UI_MODULE_RULE_BINDING_PROJECTION_INVALID",
  "UI_MODULE.R038":"UI_MODULE_LOGIC_GRAPH_COVERAGE_INCOMPLETE",
  "UI_MODULE.R039":"UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE",
  "Q-UI-UI_MODULE-040":"UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
  "Q-UI-UI_MODULE-041":"UI_MODULE_FIELD_COVERAGE_INCOMPLETE",
  "Q-UI-UI_MODULE-042":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "Q-UI-UI_MODULE-043":"UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID",
  "Q-UI-UI_MODULE-044":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "Q-UI-UI_MODULE-045":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "Q-UI-UI_MODULE-046":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
  "Q-UI-UI_MODULE-049":"UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED",
  "Q-UI-UI_MODULE-051":"UI_MODULE_OUTPUT_GRAMMAR_INVALID",
};

function buildArtifact(request: ResolveUiModuleRequest, source: UnknownRecord): UiModuleArtifact {
  const projected = projectOperations(request, source);
  const sourceOperationRefs = Object.values(source.operations as UnknownRecord)
    .filter(isRecord)
    .map((op) => op.operation_ref)
    .filter((x): x is string => typeof x === "string");
  const sourceInterfaceRefs = Object.values(source.interfaces as UnknownRecord)
    .filter(isRecord)
    .map((iface) => iface.interface_ref)
    .filter((x): x is string => typeof x === "string");
  const projectedOperationRefs = projected.operations.map((op) => op.source_operation_ref);
  const projectedInterfaceRefs = projected.operations.flatMap((op) => op.interface_projections.map((iface) => iface.source_interface_ref));
  const providerRefs = providerInterfaceRefs(source);
  const actionRefs = projected.actions.map((action) => action.source_interface_ref);

  return {
    ui_module_ref: "",
    source_capability_ref: request.source_capability_ref,
    projection_ref: request.projection_ref,
    source_lineage: {
      source_capability_ref: request.source_capability_ref,
      source_capability_contract_ref: request.projection_input.source_capability_contract_ref,
      source_capability_contract_hash: request.projection_input.source_capability_contract_hash,
      source_external_provider_surface_ref: request.projection_input.source_external_provider_surface_ref,
      source_external_provider_surface_hash: request.projection_input.source_external_provider_surface_hash,
    },
    source_semantic_snapshot: cloneJson(source),
    semantic_model: {
      semantic_model_version: "Q_UI_MODULE_SEMANTIC_MODEL_V6",
      operation_projections: projected.operations,
      coverage: {
        source_operation_refs: sourceOperationRefs,
        projected_operation_refs: projectedOperationRefs,
        source_interface_refs: sourceInterfaceRefs,
        projected_interface_refs: projectedInterfaceRefs,
        source_provider_interface_refs: providerRefs,
        bound_action_interface_refs: actionRefs,
        status: "COMPLETE",
      },
    },
    action_bindings: projected.actions,
    state_bindings: stateBindings(source),
    permission_bindings: permissionBindings(source),
    evidence_views: evidenceViews(source),
    logic_projection: logicProjection(source),
    content_hash: "",
  };
}

async function finalizeArtifact(artifact: UiModuleArtifact): Promise<UiModuleArtifact> {
  const hashSubject = cloneJson(artifact) as UiModuleArtifact;
  delete (hashSubject as unknown as UnknownRecord).ui_module_ref;
  delete (hashSubject as unknown as UnknownRecord).content_hash;
  const contentHash = await sha256Text(canonicalJson(hashSubject));
  artifact.content_hash = contentHash;
  artifact.ui_module_ref = contentHash;
  return artifact;
}

function stableError(code: UiModuleStableErrorCode): ResolveUiModuleOutcome {
  return {
    outcome_type: "stable_error",
    stable_error: { code, message: stableErrorMessages[code] },
  };
}

function preProjectionError(
  request: ResolveUiModuleRequest,
  source: UnknownRecord,
): UiModuleStableErrorCode | null {
  const sourceRef = request.projection_input.source_capability_contract_ref;

  // Declared StableError order is authoritative.
  if (!validateSourceLineage(request, source)) return "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED";
  if (!validateSourceSemanticProjection(source, sourceRef)) return "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID";
  if (!validateAllFieldSemantics(source, sourceRef)) return "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE";

  const special = validateSpecialBindings(source, sourceRef);
  if (!special.referenceBindingValid) return "UI_MODULE_REFERENCE_BINDING_INVALID";
  if (!special.temporalBindingValid) return "UI_MODULE_TEMPORAL_BINDING_INVALID";

  // Payload-schema mapping is tested before semantic-ambiguity errors per the declared order.
  try {
    for (const entry of collectRequestSchemaRefs(source, sourceRef)) {
      if (!isRecord(entry.schema.properties)) return "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS";
      for (const fieldSchema of Object.values(entry.schema.properties)) {
        if (!isRecord(fieldSchema)) return "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS";
        const semantics = fieldSemanticsOf(fieldSchema);
        if (semantics?.semantic_kind === "PLAIN_VALUE" && !plainControlKind(fieldSchema, source, sourceRef)) {
          return "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS";
        }
      }
    }
  } catch {
    return "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS";
  }

  if (!special.temporalSemanticsPresent) return "UI_MODULE_TEMPORAL_SEMANTICS_AMBIGUOUS";
  if (!special.referenceSemanticsPresent) return "UI_MODULE_REFERENCE_SEMANTICS_AMBIGUOUS";

  if (!validatePresentationBoundary(source)) return "UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN";
  return null;
}

export async function resolve_ui_module(request: ResolveUiModuleRequest): Promise<ResolveUiModuleOutcome> {
  assertRequestBoundary(request);
  const source = request.projection_input.source_capability_semantic_projection;
  if (!isRecord(source)) {
    return stableError("UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID");
  }

  const preError = preProjectionError(request, source);
  if (preError) return stableError(preError);

  try {
    const artifact = await finalizeArtifact(buildArtifact(request, source));

    for (const code of stableErrorEvaluationOrder) {
      const applicableRules = operationEnforcedRules.filter((ruleId) => ruleFailureCode[ruleId] === code);
      for (const ruleId of applicableRules) {
        if (!evaluateRule(ruleId, request, source, artifact)) return stableError(code);
      }
    }

    const responsePayload = { ui_module_artifact: artifact };
    const schemaRoot: UnknownRecord = { type_closure: { schemas: uiModuleTypeSchemas } };
    const responseErrors = validateSchema(
      responsePayload,
      resolveUiModuleResponseSchema as unknown as UnknownRecord,
      schemaRoot,
      CAPABILITY_CONTRACT_REF,
    );
    if (responseErrors.length > 0) return stableError("UI_MODULE_OUTPUT_GRAMMAR_INVALID");

    return { outcome_type: "response", runtime_result: responsePayload };
  } catch (error) {
    if (error instanceof StableProjectionError) return stableError(error.code);
    throw error;
  }
}

export const __internal = {
  canonicalJson,
  compareUnicodeCodePoint,
  evaluateRule,
  operationEnforcedRules,
  ruleFailureCode,
  validateSchema,
  validateSpecialBindings,
  validateAllFieldSemantics,
  validatePresentationBoundary,
};
