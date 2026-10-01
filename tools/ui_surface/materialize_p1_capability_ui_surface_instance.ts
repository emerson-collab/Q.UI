import { createHash } from "node:crypto";

export const UI_SURFACE_CONTRACT_REF =
  "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0123" as const;
export const UI_SURFACE_CONTRACT_HASH =
  "sha256:05e2acb1d87d427fa5be34dc3b66f9c1dbbaa33504eb88dc7554534692a5d85d" as const;
export const Q_PROMPT_ARTIFACT_CONTENT_HASH =
  "sha256:7fa722266ec376cea62ef1d58fec04a17b5d8e2d81318c0f13eac32aad926c63" as const;
export const IMPLEMENTATION_OBLIGATION_SNAPSHOT_HASH =
  "sha256:4bc3d68b37981c4686e0696ce73190d71249a236e66dbfab42c87f7750846ef6" as const;
export const INSTANCE_CAPABILITY_ID = "ui_surface" as const;
export const INSTANCE_FILE_NAME = "surface_instance.json" as const;

const LOWER_SNAKE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const VERSION = /^V[0-9]{4}$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const EXACT_CONTRACT_REF = /^.+@V[0-9]{4}$/;

export type JsonPrimitive = null | boolean | number | string;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };
export type JsonObject = { readonly [key: string]: JsonValue };

export interface SourceP1CapabilityIdentity {
  readonly source_p1_capability_contract_ref: string;
  readonly source_capability_id: string;
  readonly source_capability_version: string;
}

export interface ResolvedUiSurfaceArtifact extends JsonObject {
  readonly ui_surface_ref: string;
  readonly source_presentation: JsonValue;
  readonly theme_subject_ref: string;
  readonly resolved_target_context: JsonObject;
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
  readonly surface_artifact: ResolvedUiSurfaceArtifact;
  readonly instance_content_hash: string;
}

export interface SourceP1CapabilityIdentityVerifier {
  verifyExactSourceIdentity(
    identity: Readonly<SourceP1CapabilityIdentity>,
  ): boolean | Promise<boolean>;
}

export interface StaticInstanceWriter {
  writeImmutableJson(
    relative_path: string,
    exact_bytes: Uint8Array,
  ): Promise<void>;
  readExactBytes(relative_path: string): Promise<Uint8Array>;
}

export class UiSurfaceInstanceMaterializationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "UiSurfaceInstanceMaterializationError";
    this.code = code;
  }
}

function fail(code: string, message: string): never {
  throw new UiSurfaceInstanceMaterializationError(code, message);
}

function cloneJson(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "non-finite JSON number");
    }
    return value;
  }

  if (typeof value !== "object") {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "value is not JSON");
  }
  if (seen.has(value)) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "cyclic JSON is forbidden");
  }
  seen.add(value);

  if (Array.isArray(value)) {
    const out = value.map((item) => cloneJson(item, seen));
    seen.delete(value);
    return out;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "non-plain JSON object");
  }

  const out: Record<string, JsonValue> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    out[key] = cloneJson((value as Record<string, unknown>)[key], seen);
  }
  seen.delete(value);
  return out;
}

function isObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key]!)}`)
    .join(",")}}`;
}

function sha256Utf8(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function versionFromExactRef(ref: string): string | null {
  const at = ref.lastIndexOf("@");
  if (at < 1) return null;
  const version = ref.slice(at + 1);
  return VERSION.test(version) ? version : null;
}

function validateSourceIdentityShape(
  identity: Readonly<SourceP1CapabilityIdentity>,
): void {
  if (!EXACT_CONTRACT_REF.test(identity.source_p1_capability_contract_ref)) {
    fail(
      "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source P1 Capability Contract ref must be exact and versioned",
    );
  }
  if (!LOWER_SNAKE.test(identity.source_capability_id)) {
    fail(
      "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source_capability_id must be lower_snake_case",
    );
  }
  if (!VERSION.test(identity.source_capability_version)) {
    fail(
      "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source_capability_version must match Vdddd",
    );
  }
  if (
    versionFromExactRef(identity.source_p1_capability_contract_ref)
    !== identity.source_capability_version
  ) {
    fail(
      "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source Contract version must equal source_capability_version",
    );
  }
}

function validateResolvedSurfaceArtifact(
  artifactInput: unknown,
): ResolvedUiSurfaceArtifact {
  const value = cloneJson(artifactInput);
  if (!isObject(value)) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "Surface artifact must be an object");
  }

  const ui_surface_ref = value.ui_surface_ref;
  const source_presentation = value.source_presentation;
  const theme_subject_ref = value.theme_subject_ref;
  const resolved_target_context = value.resolved_target_context;
  const content_hash = value.content_hash;

  if (typeof ui_surface_ref !== "string" || ui_surface_ref.length === 0) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "ui_surface_ref is required");
  }
  if (source_presentation === undefined) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "source_presentation is required");
  }
  if (typeof theme_subject_ref !== "string" || theme_subject_ref.length === 0) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "theme_subject_ref is required");
  }
  if (!isObject(resolved_target_context as JsonValue)) {
    fail(
      "UI_SURFACE_INSTANCE_ARTIFACT_INVALID",
      "Surface must be resolved before static Instance materialization",
    );
  }
  if (typeof content_hash !== "string" || !SHA256.test(content_hash)) {
    fail("UI_SURFACE_INSTANCE_ARTIFACT_INVALID", "content_hash must be exact sha256");
  }

  return Object.freeze({
    ...value,
    ui_surface_ref,
    source_presentation,
    theme_subject_ref,
    resolved_target_context,
    content_hash,
  }) as ResolvedUiSurfaceArtifact;
}

export function projectUiSurfaceInstanceIdentity(
  source: Readonly<SourceP1CapabilityIdentity>,
): Readonly<{
  instance_id: string;
  instance_version: string;
}> {
  validateSourceIdentityShape(source);
  return Object.freeze({
    instance_id: `${source.source_capability_id}_ui_surface`,
    instance_version: source.source_capability_version,
  });
}

export function uiSurfaceInstanceRelativePath(
  instance_id: string,
  instance_version: string,
): string {
  if (!LOWER_SNAKE.test(instance_id) || !VERSION.test(instance_version)) {
    fail(
      "UI_SURFACE_INSTANCE_IDENTITY_INVALID",
      "projected Instance identity is invalid",
    );
  }
  return `instances/${INSTANCE_CAPABILITY_ID}/${instance_id}/${instance_version}/${INSTANCE_FILE_NAME}`;
}

function recordWithoutHash(
  source: Readonly<SourceP1CapabilityIdentity>,
  artifact: ResolvedUiSurfaceArtifact,
): Omit<UiSurfaceInstanceRecord, "instance_content_hash"> {
  const projected = projectUiSurfaceInstanceIdentity(source);
  return {
    source_p1_capability_contract_ref: source.source_p1_capability_contract_ref,
    source_capability_id: source.source_capability_id,
    source_capability_version: source.source_capability_version,
    instance_id: projected.instance_id,
    instance_version: projected.instance_version,
    ui_surface_ref: artifact.ui_surface_ref,
    ui_surface_hash: artifact.content_hash,
    surface_artifact: artifact,
  };
}

export function buildUiSurfaceInstanceRecord(
  source: Readonly<SourceP1CapabilityIdentity>,
  resolvedSurfaceArtifact: unknown,
): Readonly<UiSurfaceInstanceRecord> {
  const artifact = validateResolvedSurfaceArtifact(resolvedSurfaceArtifact);
  const base = recordWithoutHash(source, artifact);
  const hashSubject = cloneJson(base);
  const instance_content_hash = sha256Utf8(canonicalJson(hashSubject));
  return Object.freeze({
    ...base,
    instance_content_hash,
  });
}

export function encodeUiSurfaceInstanceRecord(
  record: Readonly<UiSurfaceInstanceRecord>,
): Uint8Array {
  const value = cloneJson(record);
  return Buffer.from(canonicalJson(value) + "\n", "utf8");
}

export async function materializeUiSurfaceInstance(
  source: Readonly<SourceP1CapabilityIdentity>,
  resolvedSurfaceArtifact: unknown,
  verifier: SourceP1CapabilityIdentityVerifier,
  writer: StaticInstanceWriter,
): Promise<Readonly<{
  relative_path: string;
  record: UiSurfaceInstanceRecord;
}>> {
  validateSourceIdentityShape(source);

  if (!(await verifier.verifyExactSourceIdentity(source))) {
    fail(
      "UI_SURFACE_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source P1 Capability identity did not verify exactly",
    );
  }

  const record = buildUiSurfaceInstanceRecord(source, resolvedSurfaceArtifact);
  const relative_path = uiSurfaceInstanceRelativePath(
    record.instance_id,
    record.instance_version,
  );
  const expectedBytes = encodeUiSurfaceInstanceRecord(record);

  await writer.writeImmutableJson(relative_path, expectedBytes);
  const actualBytes = await writer.readExactBytes(relative_path);

  if (
    actualBytes.byteLength !== expectedBytes.byteLength
    || Buffer.compare(Buffer.from(actualBytes), Buffer.from(expectedBytes)) !== 0
  ) {
    fail(
      "UI_SURFACE_INSTANCE_READBACK_MISMATCH",
      "surface_instance.json exact readback mismatch",
    );
  }

  const parsed = JSON.parse(Buffer.from(actualBytes).toString("utf8"));
  const readRecord = cloneJson(parsed);
  if (!isObject(readRecord)) {
    fail(
      "UI_SURFACE_INSTANCE_READBACK_MISMATCH",
      "surface_instance.json readback is not an object",
    );
  }

  const readHash = readRecord.instance_content_hash;
  if (typeof readHash !== "string" || !SHA256.test(readHash)) {
    fail(
      "UI_SURFACE_INSTANCE_READBACK_MISMATCH",
      "instance_content_hash is invalid",
    );
  }

  const { instance_content_hash: _ignored, ...subject } = readRecord;
  if (sha256Utf8(canonicalJson(subject)) !== readHash) {
    fail(
      "UI_SURFACE_INSTANCE_READBACK_MISMATCH",
      "instance_content_hash verification failed",
    );
  }

  return Object.freeze({ relative_path, record });
}
