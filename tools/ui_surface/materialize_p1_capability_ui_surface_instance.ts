import { createHash } from "node:crypto";

export type JsonPrimitive = null | boolean | number | string;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };
export type JsonObject = { readonly [key: string]: JsonValue };

export interface SourceP1CapabilityIdentity {
  readonly capability_id: string;
  readonly capability_version: string;
}

export type SourceP1CapabilityIdentityResolver = (
  exactCapabilityContractRef: string,
) => SourceP1CapabilityIdentity | Promise<SourceP1CapabilityIdentity>;

export interface PresentationBinding {
  readonly source_capability_contract_ref: string;
  readonly source_capability_contract_hash: string;
  readonly presentation_context_ref: string;
  readonly presentation_context_hash: string;
  readonly presentation_context: JsonObject;
}

export interface TargetContext {
  readonly target_profile_ref: string;
  readonly target_profile_hash: string;
  readonly device_context: JsonObject;
  readonly accessibility_context: JsonObject;
}

export interface UiSurfaceArtifact {
  readonly ui_surface_ref: string;
  readonly source_presentation: PresentationBinding;
  readonly theme_subject_ref: string;
  readonly resolved_target_context: TargetContext | null;
  readonly content_hash: string;
}

export interface UiSurfaceInstanceRecord {
  readonly source_p1_capability_contract_ref: string;
  readonly source_capability_id: string;
  readonly source_capability_version: string;
  readonly instance_id: string;
  readonly instance_version: string;
  readonly ui_surface_ref: string;
  readonly ui_surface_hash: string;
  readonly surface_artifact: UiSurfaceArtifact;
  readonly instance_content_hash: string;
}

export interface MaterializeUiSurfaceInstanceRequest {
  readonly source_p1_capability_contract_ref: string;
  readonly source_capability_id: string;
  readonly source_capability_version: string;
  readonly ui_surface_ref: string;
  readonly ui_surface_hash: string;
  readonly surface_artifact: UiSurfaceArtifact;
}

export interface MaterializedUiSurfaceInstance {
  readonly relative_path: string;
  readonly record: UiSurfaceInstanceRecord;
  readonly file_content: string;
}

const SHA256_RE = /^sha256:[0-9a-f]{64}$/;
const LOWER_SNAKE_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const VERSION_RE = /^V[0-9]{4}$/;
const EXACT_CONTRACT_REF_RE = /^[A-Z0-9_.:-]+@V[0-9]{4}$/;

function fail(message: string): never {
  throw new Error(`UI_SURFACE_INSTANCE_MATERIALIZATION_FAILED: ${message}`);
}

function compareUnicodeCodepoints(left: string, right: string): number {
  const a = Array.from(left);
  const b = Array.from(right);
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const ac = a[index]!.codePointAt(0)!;
    const bc = b[index]!.codePointAt(0)!;
    if (ac !== bc) return ac - bc;
  }
  return a.length - b.length;
}

function cloneJson(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("non-finite JSON number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (
    typeof value === "undefined"
    || typeof value === "bigint"
    || typeof value === "symbol"
    || typeof value === "function"
  ) {
    fail("non-JSON value");
  }
  if (typeof value !== "object") fail("non-JSON value");
  if (seen.has(value)) fail("cyclic JSON value");
  seen.add(value);

  if (Object.getOwnPropertySymbols(value).length !== 0) {
    fail("symbol-keyed JSON value");
  }

  if (Array.isArray(value)) {
    const out: JsonValue[] = [];
    if (Object.keys(value).length !== value.length) {
      fail("sparse or extended JSON array");
    }
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (
        descriptor === undefined
        || !descriptor.enumerable
        || !("value" in descriptor)
      ) {
        fail("non-data JSON array entry");
      }
      out.push(cloneJson(descriptor.value, seen));
    }
    seen.delete(value);
    return out;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail("non-plain JSON object");
  }

  const out: Record<string, JsonValue> = {};
  for (
    const [key, descriptor] of
    Object.entries(Object.getOwnPropertyDescriptors(value))
  ) {
    if (!descriptor.enumerable || !("value" in descriptor)) {
      fail("non-data JSON object property");
    }
    out[key] = cloneJson(descriptor.value, seen);
  }

  seen.delete(value);
  return out;
}

function isObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value: unknown, field: string): JsonObject {
  const cloned = cloneJson(value);
  if (!isObject(cloned)) fail(`${field} must be object`);
  return cloned;
}

function requireExactKeys(
  value: JsonObject,
  allowed: readonly string[],
  field: string,
): void {
  const keys = Object.keys(value);
  const allowedSet = new Set(allowed);
  if (
    keys.length !== allowed.length
    || keys.some((key) => !allowedSet.has(key))
    || allowed.some((key) => !Object.prototype.hasOwnProperty.call(value, key))
  ) {
    fail(`${field} has undeclared or missing fields`);
  }
}

function requireString(value: JsonValue | undefined, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${field} must be nonempty string`);
  }
  return value;
}

function requireHash(value: JsonValue | undefined, field: string): string {
  const text = requireString(value, field);
  if (!SHA256_RE.test(text)) fail(`${field} must be sha256`);
  return text;
}

function canonicalJson(value: JsonValue): string {
  if (
    value === null
    || typeof value === "boolean"
    || typeof value === "number"
    || typeof value === "string"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }

  const keys = Object.keys(value).sort(compareUnicodeCodepoints);
  return `{${keys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJson(value[key]!)}`,
  ).join(",")}}`;
}

function sha256(value: JsonValue): string {
  return `sha256:${createHash("sha256")
    .update(canonicalJson(value), "utf8")
    .digest("hex")}`;
}

function verifyPresentationBinding(value: unknown): PresentationBinding {
  const binding = requireObject(value, "surface_artifact.source_presentation");
  requireExactKeys(
    binding,
    [
      "source_capability_contract_ref",
      "source_capability_contract_hash",
      "presentation_context_ref",
      "presentation_context_hash",
      "presentation_context",
    ],
    "surface_artifact.source_presentation",
  );

  const presentationContext = requireObject(
    binding.presentation_context,
    "surface_artifact.source_presentation.presentation_context",
  );

  return Object.freeze({
    source_capability_contract_ref: requireString(
      binding.source_capability_contract_ref,
      "source_capability_contract_ref",
    ),
    source_capability_contract_hash: requireHash(
      binding.source_capability_contract_hash,
      "source_capability_contract_hash",
    ),
    presentation_context_ref: requireString(
      binding.presentation_context_ref,
      "presentation_context_ref",
    ),
    presentation_context_hash: requireHash(
      binding.presentation_context_hash,
      "presentation_context_hash",
    ),
    presentation_context: Object.freeze(presentationContext),
  });
}

function verifyTargetContext(value: unknown): TargetContext {
  const target = requireObject(
    value,
    "surface_artifact.resolved_target_context",
  );
  requireExactKeys(
    target,
    [
      "target_profile_ref",
      "target_profile_hash",
      "device_context",
      "accessibility_context",
    ],
    "surface_artifact.resolved_target_context",
  );

  return Object.freeze({
    target_profile_ref: requireString(
      target.target_profile_ref,
      "target_profile_ref",
    ),
    target_profile_hash: requireHash(
      target.target_profile_hash,
      "target_profile_hash",
    ),
    device_context: Object.freeze(
      requireObject(target.device_context, "device_context"),
    ),
    accessibility_context: Object.freeze(
      requireObject(target.accessibility_context, "accessibility_context"),
    ),
  });
}

function verifyResolvedSurfaceArtifact(value: unknown): UiSurfaceArtifact {
  const artifact = requireObject(value, "surface_artifact");
  requireExactKeys(
    artifact,
    [
      "ui_surface_ref",
      "source_presentation",
      "theme_subject_ref",
      "resolved_target_context",
      "content_hash",
    ],
    "surface_artifact",
  );

  if (artifact.resolved_target_context === null) {
    fail("Surface Instance requires an exact resolved Surface");
  }

  const exact: Omit<UiSurfaceArtifact, "content_hash"> = {
    ui_surface_ref: requireString(
      artifact.ui_surface_ref,
      "surface_artifact.ui_surface_ref",
    ),
    source_presentation: verifyPresentationBinding(
      artifact.source_presentation,
    ),
    theme_subject_ref: requireString(
      artifact.theme_subject_ref,
      "surface_artifact.theme_subject_ref",
    ),
    resolved_target_context: verifyTargetContext(
      artifact.resolved_target_context,
    ),
  };

  const contentHash = requireHash(
    artifact.content_hash,
    "surface_artifact.content_hash",
  );

  const surfaceHashSubject = cloneJson({
    source_presentation: exact.source_presentation,
    theme_subject_ref: exact.theme_subject_ref,
    resolved_target_context: exact.resolved_target_context,
  });

  if (sha256(surfaceHashSubject) !== contentHash) {
    fail("Surface artifact content_hash mismatch");
  }

  return Object.freeze({
    ...exact,
    content_hash: contentHash,
  });
}

function serializeRecord(record: UiSurfaceInstanceRecord): string {
  const json = cloneJson(record);
  if (!isObject(json)) fail("instance record must be object");
  const keys = Object.keys(json).sort(compareUnicodeCodepoints);
  const ordered: Record<string, JsonValue> = {};
  for (const key of keys) ordered[key] = json[key]!;
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

export async function materializeP1CapabilityUiSurfaceInstance(
  request: MaterializeUiSurfaceInstanceRequest,
  resolveSourceIdentity: SourceP1CapabilityIdentityResolver,
): Promise<MaterializedUiSurfaceInstance> {
  const sourceRef = request.source_p1_capability_contract_ref;
  const sourceId = request.source_capability_id;
  const sourceVersion = request.source_capability_version;

  if (!EXACT_CONTRACT_REF_RE.test(sourceRef)) {
    fail("source_p1_capability_contract_ref must be exact versioned Contract ref");
  }
  if (!LOWER_SNAKE_RE.test(sourceId)) {
    fail("source_capability_id must be lower_snake_case");
  }
  if (!VERSION_RE.test(sourceVersion)) {
    fail("source_capability_version must match Vdddd");
  }
  if (!sourceRef.endsWith(`@${sourceVersion}`)) {
    fail("source Contract ref version does not equal source_capability_version");
  }

  const resolvedIdentity = await resolveSourceIdentity(sourceRef);
  if (
    resolvedIdentity.capability_id !== sourceId
    || resolvedIdentity.capability_version !== sourceVersion
  ) {
    fail("source Contract ref/id/version identity mismatch");
  }

  const surface = verifyResolvedSurfaceArtifact(request.surface_artifact);
  if (surface.ui_surface_ref !== request.ui_surface_ref) {
    fail("ui_surface_ref does not equal surface_artifact.ui_surface_ref");
  }
  if (surface.content_hash !== request.ui_surface_hash) {
    fail("ui_surface_hash does not equal surface_artifact.content_hash");
  }

  const instance_id = `${sourceId}_ui_surface`;
  const instance_version = sourceVersion;

  const hashSubject = cloneJson({
    source_p1_capability_contract_ref: sourceRef,
    source_capability_id: sourceId,
    source_capability_version: sourceVersion,
    instance_id,
    instance_version,
    ui_surface_ref: request.ui_surface_ref,
    ui_surface_hash: request.ui_surface_hash,
    surface_artifact: surface,
  });

  const record: UiSurfaceInstanceRecord = Object.freeze({
    source_p1_capability_contract_ref: sourceRef,
    source_capability_id: sourceId,
    source_capability_version: sourceVersion,
    instance_id,
    instance_version,
    ui_surface_ref: request.ui_surface_ref,
    ui_surface_hash: request.ui_surface_hash,
    surface_artifact: surface,
    instance_content_hash: sha256(hashSubject),
  });

  const relative_path =
    `instances/ui_surface/${instance_id}/${instance_version}/surface_instance.json`;

  return Object.freeze({
    relative_path,
    record,
    file_content: serializeRecord(record),
  });
}
