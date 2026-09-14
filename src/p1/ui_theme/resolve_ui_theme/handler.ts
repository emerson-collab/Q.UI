export const CAPABILITY_REF = "Q.UI.CAPABILITY.UI_THEME@V0107" as const;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107" as const;
export const OPERATION_ID = "resolve_ui_theme" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/${OPERATION_ID}` as const;

export type StableErrorCode =
  | "UI_THEME_SELECTOR_UNRESOLVED"
  | "UI_THEME_CONTEXT_INCOMPATIBLE"
  | "UI_THEME_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN";

export interface UiThemeArtifact {
  readonly theme_ref: string;
  readonly theme_version: string;
  readonly presentation_rules: Readonly<Record<string, unknown>>;
  readonly content_hash: string;
}

export interface ResolveUiThemeResponse {
  readonly ui_theme_artifact: UiThemeArtifact;
}

export interface UiThemeStableError {
  readonly code: StableErrorCode;
  readonly message: string;
}

type HandlerResult =
  | Readonly<{ kind: "response"; response: ResolveUiThemeResponse }>
  | Readonly<{ kind: "stable_error"; stable_error: UiThemeStableError }>;

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const REQUEST_KEYS = new Set(["theme_selector", "ui_context", "ui_module_artifact_ref"]);
const ERROR_MESSAGES: Readonly<Record<StableErrorCode, string>> = Object.freeze({
  UI_THEME_SELECTOR_UNRESOLVED: "The governed theme selector cannot be resolved.",
  UI_THEME_CONTEXT_INCOMPATIBLE: "The governed UI context is incompatible with the resolved theme.",
  UI_THEME_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN: "Theme resolution would require prohibited business-semantic inference.",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function fail(code: StableErrorCode): HandlerResult {
  return Object.freeze({
    kind: "stable_error" as const,
    stable_error: Object.freeze({ code, message: ERROR_MESSAGES[code] }),
  });
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") return value;
  const object = value as object;
  if (seen.has(object)) return value;
  seen.add(object);
  for (const nested of Object.values(object as Record<string, unknown>)) deepFreeze(nested, seen);
  return Object.freeze(value);
}

function cloneJsonSafe(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite number");
    return value;
  }
  if (typeof value !== "object") throw new TypeError("non-JSON value");

  const object = value as object;
  if (seen.has(object)) throw new TypeError("cyclic value");
  seen.add(object);

  try {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        if (!(index in value)) throw new TypeError("sparse array");
      }
      return value.map((item) => cloneJsonSafe(item, seen));
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError("non-plain object");
    if (Object.getOwnPropertySymbols(value).length !== 0) throw new TypeError("symbol key");

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const clone: Record<string, unknown> = {};
    for (const key of Object.keys(descriptors).sort()) {
      const descriptor = descriptors[key];
      if (descriptor === undefined || descriptor.enumerable !== true || "get" in descriptor || "set" in descriptor) {
        throw new TypeError("non-data property");
      }
      clone[key] = cloneJsonSafe(descriptor.value, seen);
    }
    return clone;
  } finally {
    seen.delete(object);
  }
}

function asSafeRecord(value: unknown): Record<string, unknown> {
  const cloned = cloneJsonSafe(value);
  if (!isRecord(cloned)) throw new TypeError("object required");
  return cloned;
}

function resolveSelector(selectorValue: unknown): UiThemeArtifact | null {
  let selector: Record<string, unknown>;
  try {
    selector = asSafeRecord(selectorValue);
  } catch {
    return null;
  }

  const themeRef = selector.theme_ref;
  const themeVersion = selector.theme_version;
  const presentationRules = selector.presentation_rules;
  const contentHash = selector.content_hash;

  if (typeof themeRef !== "string" || themeRef.length === 0) return null;
  if (typeof themeVersion !== "string" || themeVersion.length === 0) return null;
  if (!isRecord(presentationRules)) return null;
  if (typeof contentHash !== "string" || !SHA256.test(contentHash)) return null;

  return deepFreeze({
    theme_ref: themeRef,
    theme_version: themeVersion,
    presentation_rules: presentationRules,
    content_hash: contentHash,
  });
}

export async function handler(input: unknown): Promise<HandlerResult> {
  if (!isRecord(input)) return fail("UI_THEME_SELECTOR_UNRESOLVED");
  if (Object.keys(input).some((key) => !REQUEST_KEYS.has(key))) return fail("UI_THEME_SELECTOR_UNRESOLVED");
  if (!("theme_selector" in input)) return fail("UI_THEME_SELECTOR_UNRESOLVED");

  if ("ui_context" in input) {
    try {
      asSafeRecord(input.ui_context);
    } catch {
      return fail("UI_THEME_CONTEXT_INCOMPATIBLE");
    }
  }

  if ("ui_module_artifact_ref" in input) {
    if (typeof input.ui_module_artifact_ref !== "string" || input.ui_module_artifact_ref.length === 0) {
      return fail("UI_THEME_CONTEXT_INCOMPATIBLE");
    }
  }

  const artifact = resolveSelector(input.theme_selector);
  if (artifact === null) return fail("UI_THEME_SELECTOR_UNRESOLVED");

  return deepFreeze({
    kind: "response" as const,
    response: { ui_theme_artifact: artifact },
  });
}
