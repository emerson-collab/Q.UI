export type JsonObject = Readonly<Record<string, unknown>>;

export type ProducerStableErrorCode =
  | "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED"
  | "UI_PRODUCER_THEME_INCOMPATIBLE"
  | "UI_PRODUCER_P2_MOUNT_INCOMPLETE"
  | "UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN";

/** External governed artifact bodies remain owned by UI_MODULE/UI_THEME contracts. */
export type GovernedUiModuleArtifact = unknown;
export type GovernedUiThemeArtifact = unknown;

type ThemeAbsent = Readonly<{
  ui_theme_artifact_ref?: never;
  ui_theme_artifact?: never;
}>;
type ThemePresent = Readonly<{
  ui_theme_artifact_ref: string;
  ui_theme_artifact: GovernedUiThemeArtifact;
}>;
export type ThemeInputPair = ThemeAbsent | ThemePresent;

export type ProduceAppRequest = Readonly<{
  ui_module_artifact_ref: string;
  ui_module_artifact: GovernedUiModuleArtifact;
  host_target?: JsonObject;
  production_context?: JsonObject;
}> & ThemeInputPair;

export type ProducePlatformRequest = Readonly<{
  ui_module_artifact_ref: string;
  ui_module_artifact: GovernedUiModuleArtifact;
  host_target?: JsonObject;
  platform_context?: JsonObject;
}> & ThemeInputPair;

export interface HostArtifactStructure {
  readonly semantic_model: JsonObject;
  readonly theme_presentation_rules: JsonObject | null;
}

export interface HostArtifactRuntimeRequirements {
  readonly state_bindings: readonly JsonObject[];
  readonly evidence_views: readonly unknown[];
  readonly host_target: JsonObject;
  readonly context_kind: "APP" | "PLATFORM";
  readonly context: JsonObject;
}

export interface HostArtifact {
  readonly host_artifact_ref: string;
  readonly source_ui_module_artifact_ref: string;
  readonly source_ui_theme_artifact_ref: string | null;
  readonly producer_operation_id: "produce_app" | "produce_platform";
  readonly ui_structure: HostArtifactStructure;
  readonly action_bindings: readonly JsonObject[];
  readonly runtime_requirements: HostArtifactRuntimeRequirements;
  readonly content_hash: string;
}

export interface ProduceAppResponse { readonly host_artifact: HostArtifact; }
export interface ProducePlatformResponse { readonly host_artifact: HostArtifact; }
