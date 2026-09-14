export type JsonObject = Readonly<Record<string, unknown>>;

export interface ResolveUiThemeRequest {
  readonly theme_selector: JsonObject;
  readonly ui_context?: JsonObject;
  readonly ui_module_artifact_ref?: string;
}

export interface UiThemeArtifact {
  readonly theme_ref: string;
  readonly theme_version: string;
  readonly presentation_rules: JsonObject;
  readonly content_hash: string;
}

export interface ResolveUiThemeResponse {
  readonly ui_theme_artifact: UiThemeArtifact;
}

export type UiThemeStableErrorCode =
  | "UI_THEME_SELECTOR_UNRESOLVED"
  | "UI_THEME_CONTEXT_INCOMPATIBLE"
  | "UI_THEME_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN";

export interface UiThemeStableError {
  readonly code: UiThemeStableErrorCode;
  readonly message: string;
}
