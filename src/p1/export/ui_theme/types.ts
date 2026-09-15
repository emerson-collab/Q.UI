// Generated deterministically from Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109 (sha256:590e487297c89b1b91a838ac97eae4d309e80db9cc1502e7bbfba55f5560536f).
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type UiThemeArtifact = { readonly content_hash: string; readonly presentation_rules: { readonly [key: string]: unknown; }; readonly resolver_capability_ref: "Q.UI.CAPABILITY.UI_THEME@V0109"; readonly resolver_operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme"; readonly theme_ref: string; readonly theme_version: string; };
export type UiThemeMaterial = { readonly content_hash: string; readonly presentation_rules: { readonly [key: string]: unknown; }; readonly theme_ref: string; readonly theme_version: string; };
export type UiThemeSelector = { readonly context_constraints?: { readonly [key: string]: unknown; }; readonly theme_material: UiThemeMaterial; };
export type ResolveUiThemeRequest = { readonly theme_selector: UiThemeSelector; readonly ui_context?: { readonly [key: string]: unknown; }; readonly ui_module_artifact_ref?: string; };
export type ResolveUiThemeResponse = { readonly ui_theme_artifact: UiThemeArtifact; };
export type StableErrorCode = "UI_THEME_SELECTOR_UNRESOLVED" | "UI_THEME_CONTEXT_INCOMPATIBLE";
