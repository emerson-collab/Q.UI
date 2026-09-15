/* PUBLICATION_ELIGIBLE type projection. Semantic authority: Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type PublicInterfaceRef = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke";
export type PublicOperationRef = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme";
export type PublicContractRef = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@${CURRENT}#/outcome_contracts/call_outcome" | "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/contracts/resolve_ui_theme_request_contract" | "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/contracts/resolve_ui_theme_response_contract" | "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/stable_error_contract";
export type PublicTypeRef = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_artifact" | "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_material" | "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_selector";
export type UiThemeArtifact = { "content_hash": string; "presentation_rules": {  } & Record<string, JsonValue>; "resolver_capability_ref": "Q.UI.CAPABILITY.UI_THEME@V0109"; "resolver_operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme"; "theme_ref": string; "theme_version": string; };
export type UiThemeMaterial = { "content_hash": string; "presentation_rules": {  } & Record<string, JsonValue>; "theme_ref": string; "theme_version": string; };
export type UiThemeSelector = { "context_constraints"?: {  } & Record<string, JsonValue>; "theme_material": { "content_hash": string; "presentation_rules": {  } & Record<string, JsonValue>; "theme_ref": string; "theme_version": string; }; };
