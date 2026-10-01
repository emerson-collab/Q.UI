export type JsonPrimitive = null | boolean | number | string;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type JsonObject = { readonly [key: string]: JsonValue };

export type ThemePhase = "SKELETON" | "RENDER";

export interface SkeletonThemeMaterial {
  readonly material_kind: "SKELETON";
  readonly role_presentation: JsonObject;
  readonly navigation_treatment: JsonObject;
  readonly arrangement_treatment: JsonObject;
  readonly grouping_treatment: JsonObject;
  readonly progressive_disclosure_treatment: JsonObject;
  readonly responsive_treatment: JsonObject;
  readonly density_treatment: JsonObject;
  readonly interaction_presentation_treatment: JsonObject;
}

export interface RenderThemeMaterial {
  readonly material_kind: "RENDER";
  readonly color: JsonObject;
  readonly typography: JsonObject;
  readonly spacing: JsonObject;
  readonly radius_and_shape: JsonObject;
  readonly border_and_elevation: JsonObject;
  readonly iconography_appearance: JsonObject;
  readonly visual_density: JsonObject;
  readonly surface_appearance: JsonObject;
  readonly component_appearance: JsonObject;
  readonly visual_motion_treatment: JsonObject;
  readonly appearance_variants: JsonObject;
  readonly accessibility_visual_requirements: JsonObject;
}

export type ThemeMaterial = SkeletonThemeMaterial | RenderThemeMaterial;

export interface ThemeInstanceRecord {
  readonly instance_id: string;
  readonly instance_version: string;
  readonly theme_instance_ref: string;
  readonly theme_phase: ThemePhase;
  readonly theme_name: string;
  readonly theme_material: ThemeMaterial;
  readonly content_hash: string;
}

export interface ThemeSelectionRecord {
  readonly subject_ref: string;
  readonly theme_phase: ThemePhase;
  readonly selected_theme_instance_ref: string;
  readonly selected_theme_instance_hash: string;
  readonly selection_source: "MANUAL";
  readonly selection_hash: string;
}

export interface ResolvedSelectedTheme {
  readonly selection: ThemeSelectionRecord;
  readonly theme_instance: ThemeInstanceRecord;
}

export interface RegisterThemeInstanceRequest {
  readonly instance_id: string;
  readonly instance_version: string;
  readonly theme_instance_ref: string;
  readonly theme_phase: ThemePhase;
  readonly theme_name: string;
  readonly theme_material: ThemeMaterial;
}
export interface RegisterThemeInstanceResponse { readonly theme_instance: ThemeInstanceRecord; }

export interface ListThemeInstancesRequest { readonly theme_phase?: ThemePhase | null; }
export interface ListThemeInstancesResponse { readonly theme_instances: readonly ThemeInstanceRecord[]; }

export interface SetThemeSelectionRequest {
  readonly subject_ref: string;
  readonly theme_phase: ThemePhase;
  readonly selected_theme_instance_ref: string;
}
export interface SetThemeSelectionResponse { readonly theme_selection: ThemeSelectionRecord; }

export interface ResolveSelectedThemeRequest { readonly subject_ref: string; readonly theme_phase: ThemePhase; }
export interface ResolveSelectedThemeResponse { readonly resolved_theme: ResolvedSelectedTheme; }

export type UIThemeStableErrorCode =
  | "UI_THEME_INSTANCE_PHASE_MATERIAL_MISMATCH"
  | "UI_THEME_INSTANCE_REF_CONFLICT"
  | "UI_THEME_INSTANCE_IDENTITY_CONFLICT"
  | "UI_THEME_REGISTRY_READ_FAILED"
  | "UI_THEME_INSTANCE_NOT_FOUND"
  | "UI_THEME_SELECTION_PHASE_MISMATCH"
  | "UI_THEME_SELECTION_UNRESOLVED"
  | "UI_THEME_SELECTED_INSTANCE_UNRESOLVED";

export interface UIThemeStableError { readonly code: UIThemeStableErrorCode; readonly message: string; }
