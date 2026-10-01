import { createHash } from "node:crypto";

export const UI_RENDER_CONTRACT_REF =
  "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0118" as const;
export const UI_RENDER_CONTRACT_HASH =
  "sha256:db67e85de45e162a89e8a9110815ec1bc6cd6844228044c0d56f94275839a83d" as const;
export const Q_PROMPT_ARTIFACT_CONTENT_HASH =
  "sha256:2562a0735ad4caebe868c509ca4574e3c26e0c2f1ec309eae08b81bf57a51af1" as const;
export const IMPLEMENTATION_OBLIGATION_SNAPSHOT_HASH =
  "sha256:6e129bab6042c87394c17202447dfb9ef9e3836d613e5024998483009e12c335" as const;
export const INSTANCE_CAPABILITY_ID = "ui_render" as const;
export const INSTANCE_FILE_NAME = "render_instance.json" as const;

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

export interface UiRenderArtifact extends JsonObject {
  readonly render_artifact_ref: string;
  readonly ui_surface_ref: string;
  readonly renderer_provider_ref: string;
  readonly theme_ref: string;
  readonly target_profile_ref: string;
  readonly content_hash: string;
  readonly ui_surface_hash: string;
  readonly theme_hash: string;
  readonly render_material: JsonObject;
}

export interface UiRenderInstanceRecord {
  readonly source_p1_capability_contract_ref: string;
  readonly source_capability_id: string;
  readonly source_capability_version: string;
  readonly instance_id: string;
  readonly instance_version: string;
  readonly render_artifact_ref: string;
  readonly render_artifact_hash: string;
  readonly render_artifact: UiRenderArtifact;
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

export class UiRenderInstanceMaterializationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "UiRenderInstanceMaterializationError";
    this.code = code;
  }
}

function fail(code: string, message: string): never {
  throw new UiRenderInstanceMaterializationError(code, message);
}

function compareUnicodeCodepoints(left: string, right: string): number {
  const a = Array.from(left);
  const b = Array.from(right);
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const ac = a[i]!.codePointAt(0)!;
    const bc = b[i]!.codePointAt(0)!;
    if (ac !== bc) return ac - bc;
  }
  return a.length - b.length;
}

function cloneJson(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "non-finite JSON number");
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (
    typeof value === "undefined"
    || typeof value === "bigint"
    || typeof value === "symbol"
    || typeof value === "function"
  ) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "value is not JSON");
  }
  if (typeof value !== "object") {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "value is not JSON");
  }
  if (seen.has(value)) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "cyclic JSON is forbidden");
  }
  seen.add(value);

  if (Object.getOwnPropertySymbols(value).length !== 0) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "symbol-keyed JSON is forbidden");
  }

  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) {
      fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "sparse or extended JSON array");
    }
    const out = value.map((item) => cloneJson(item, seen));
    seen.delete(value);
    return out;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "non-plain JSON object");
  }

  const out: Record<string, JsonValue> = {};
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if (!descriptor.enumerable || !("value" in descriptor)) {
      fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "non-data JSON property");
    }
    out[key] = cloneJson(descriptor.value, seen);
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
    .sort(compareUnicodeCodepoints)
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
      "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source P1 Capability Contract ref must be exact and versioned",
    );
  }
  if (!LOWER_SNAKE.test(identity.source_capability_id)) {
    fail(
      "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source_capability_id must be lower_snake_case",
    );
  }
  if (!VERSION.test(identity.source_capability_version)) {
    fail(
      "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source_capability_version must match Vdddd",
    );
  }
  if (
    versionFromExactRef(identity.source_p1_capability_contract_ref)
    !== identity.source_capability_version
  ) {
    fail(
      "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source Contract version must equal source_capability_version",
    );
  }
}

function stringField(value: JsonValue | undefined, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", `${field} is required`);
  }
  return value;
}

function hashField(value: JsonValue | undefined, field: string): string {
  const text = stringField(value, field);
  if (!SHA256.test(text)) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", `${field} must be exact sha256`);
  }
  return text;
}

function validateRenderArtifact(artifactInput: unknown): UiRenderArtifact {
  const value = cloneJson(artifactInput);
  if (!isObject(value)) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "Render Artifact must be object");
  }

  const required = [
    "render_artifact_ref",
    "ui_surface_ref",
    "renderer_provider_ref",
    "theme_ref",
    "target_profile_ref",
    "content_hash",
    "ui_surface_hash",
    "theme_hash",
    "render_material",
  ] as const;
  const keys = Object.keys(value);
  if (
    keys.length !== required.length
    || keys.some((key) => !required.includes(key as typeof required[number]))
  ) {
    fail(
      "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
      "Render Artifact has undeclared or missing fields",
    );
  }

  const render_material = value.render_material;
  if (!isObject(render_material)) {
    fail("UI_RENDER_INSTANCE_ARTIFACT_INVALID", "render_material must be object");
  }
  const materialKeys = Object.keys(render_material);
  const requiredMaterial = [
    "surface",
    "render_theme_resolution",
    "application_mode",
  ] as const;
  if (
    materialKeys.length !== requiredMaterial.length
    || materialKeys.some(
      (key) => !requiredMaterial.includes(key as typeof requiredMaterial[number]),
    )
  ) {
    fail(
      "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
      "render_material has undeclared or missing fields",
    );
  }
  if (
    render_material.application_mode
    !== "RENDER_THEME_VISUAL_LAYER_NO_STRUCTURAL_MUTATION"
  ) {
    fail(
      "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
      "render_material.application_mode mismatch",
    );
  }
  if (
    !isObject(render_material.surface)
    || !isObject(render_material.render_theme_resolution)
  ) {
    fail(
      "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
      "render_material lineage material must be object",
    );
  }

  const render_artifact_ref = stringField(
    value.render_artifact_ref,
    "render_artifact_ref",
  );
  const ui_surface_ref = stringField(value.ui_surface_ref, "ui_surface_ref");
  const renderer_provider_ref = stringField(
    value.renderer_provider_ref,
    "renderer_provider_ref",
  );
  const theme_ref = stringField(value.theme_ref, "theme_ref");
  const target_profile_ref = stringField(
    value.target_profile_ref,
    "target_profile_ref",
  );
  const content_hash = hashField(value.content_hash, "content_hash");
  const ui_surface_hash = hashField(value.ui_surface_hash, "ui_surface_hash");
  const theme_hash = hashField(value.theme_hash, "theme_hash");

  const semanticHashSubject: JsonObject = {
    ui_surface_ref,
    renderer_provider_ref,
    theme_ref,
    target_profile_ref,
    ui_surface_hash,
    theme_hash,
    render_material,
  };
  if (sha256Utf8(canonicalJson(semanticHashSubject)) !== content_hash) {
    fail(
      "UI_RENDER_INSTANCE_ARTIFACT_INVALID",
      "Render Artifact content_hash verification failed",
    );
  }

  return Object.freeze({
    render_artifact_ref,
    ui_surface_ref,
    renderer_provider_ref,
    theme_ref,
    target_profile_ref,
    content_hash,
    ui_surface_hash,
    theme_hash,
    render_material,
  }) as UiRenderArtifact;
}

export function projectUiRenderInstanceIdentity(
  source: Readonly<SourceP1CapabilityIdentity>,
): Readonly<{
  instance_id: string;
  instance_version: string;
}> {
  validateSourceIdentityShape(source);
  return Object.freeze({
    instance_id: `${source.source_capability_id}_ui_render`,
    instance_version: source.source_capability_version,
  });
}

export function uiRenderInstanceRelativePath(
  instance_id: string,
  instance_version: string,
): string {
  if (!LOWER_SNAKE.test(instance_id) || !VERSION.test(instance_version)) {
    fail(
      "UI_RENDER_INSTANCE_IDENTITY_INVALID",
      "projected Instance identity is invalid",
    );
  }
  return `instances/${INSTANCE_CAPABILITY_ID}/${instance_id}/${instance_version}/${INSTANCE_FILE_NAME}`;
}

function recordWithoutHash(
  source: Readonly<SourceP1CapabilityIdentity>,
  artifact: UiRenderArtifact,
): Omit<UiRenderInstanceRecord, "instance_content_hash"> {
  const projected = projectUiRenderInstanceIdentity(source);
  return {
    source_p1_capability_contract_ref: source.source_p1_capability_contract_ref,
    source_capability_id: source.source_capability_id,
    source_capability_version: source.source_capability_version,
    instance_id: projected.instance_id,
    instance_version: projected.instance_version,
    render_artifact_ref: artifact.render_artifact_ref,
    render_artifact_hash: artifact.content_hash,
    render_artifact: artifact,
  };
}

export function buildUiRenderInstanceRecord(
  source: Readonly<SourceP1CapabilityIdentity>,
  renderArtifact: unknown,
): Readonly<UiRenderInstanceRecord> {
  const artifact = validateRenderArtifact(renderArtifact);
  const base = recordWithoutHash(source, artifact);
  const instance_content_hash = sha256Utf8(canonicalJson(cloneJson(base)));
  return Object.freeze({
    ...base,
    instance_content_hash,
  });
}

export function encodeUiRenderInstanceRecord(
  record: Readonly<UiRenderInstanceRecord>,
): Uint8Array {
  return Buffer.from(canonicalJson(cloneJson(record)) + "\n", "utf8");
}

export async function materializeUiRenderInstance(
  source: Readonly<SourceP1CapabilityIdentity>,
  renderArtifact: unknown,
  verifier: SourceP1CapabilityIdentityVerifier,
  writer: StaticInstanceWriter,
): Promise<Readonly<{
  relative_path: string;
  record: UiRenderInstanceRecord;
}>> {
  validateSourceIdentityShape(source);

  if (!(await verifier.verifyExactSourceIdentity(source))) {
    fail(
      "UI_RENDER_INSTANCE_SOURCE_IDENTITY_INVALID",
      "source P1 Capability identity did not verify exactly",
    );
  }

  const record = buildUiRenderInstanceRecord(source, renderArtifact);
  const relative_path = uiRenderInstanceRelativePath(
    record.instance_id,
    record.instance_version,
  );
  const expectedBytes = encodeUiRenderInstanceRecord(record);

  await writer.writeImmutableJson(relative_path, expectedBytes);
  const actualBytes = await writer.readExactBytes(relative_path);

  if (
    actualBytes.byteLength !== expectedBytes.byteLength
    || Buffer.compare(Buffer.from(actualBytes), Buffer.from(expectedBytes)) !== 0
  ) {
    fail(
      "UI_RENDER_INSTANCE_READBACK_MISMATCH",
      "render_instance.json exact readback mismatch",
    );
  }

  const parsed = JSON.parse(Buffer.from(actualBytes).toString("utf8"));
  const readRecord = cloneJson(parsed);
  if (!isObject(readRecord)) {
    fail(
      "UI_RENDER_INSTANCE_READBACK_MISMATCH",
      "render_instance.json readback is not object",
    );
  }

  const readHash = readRecord.instance_content_hash;
  if (typeof readHash !== "string" || !SHA256.test(readHash)) {
    fail(
      "UI_RENDER_INSTANCE_READBACK_MISMATCH",
      "instance_content_hash is invalid",
    );
  }

  const { instance_content_hash: _ignored, ...subject } = readRecord;
  if (sha256Utf8(canonicalJson(subject)) !== readHash) {
    fail(
      "UI_RENDER_INSTANCE_READBACK_MISMATCH",
      "instance_content_hash verification failed",
    );
  }

  return Object.freeze({ relative_path, record });
}
