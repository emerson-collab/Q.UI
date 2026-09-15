export type JsonPrimitive = null | boolean | number | string;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };

export interface UIThemeMaterial {
  readonly theme_ref: string;
  readonly theme_version: string;
  readonly presentation_rules: JsonObject;
  readonly content_hash: string;
}

export interface UIThemeSelector {
  readonly theme_material: UIThemeMaterial;
  readonly context_constraints?: JsonObject;
}

export interface ResolveUIThemeRequest {
  readonly theme_selector: UIThemeSelector;
  readonly ui_context?: JsonObject;
  readonly ui_module_artifact_ref?: string;
}

export interface UIThemeArtifact {
  readonly theme_ref: string;
  readonly theme_version: string;
  readonly presentation_rules: JsonObject;
  readonly content_hash: string;
  readonly resolver_capability_ref: "Q.UI.CAPABILITY.UI_THEME@V0109";
  readonly resolver_operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme";
}

export interface ResolveUIThemeResponse {
  readonly ui_theme_artifact: UIThemeArtifact;
}

export type UIThemeStableErrorCode =
  | "UI_THEME_SELECTOR_UNRESOLVED"
  | "UI_THEME_CONTEXT_INCOMPATIBLE";

export interface UIThemeStableError {
  readonly code: UIThemeStableErrorCode;
  readonly message: string;
}
