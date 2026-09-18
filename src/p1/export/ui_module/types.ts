export type JsonObject = Readonly<Record<string, unknown>>;

export interface StableErrorOutcome {
  readonly outcome_type: "stable_error";
  readonly stable_error: Readonly<{ case: string }>;
  readonly evidence_ref: string;
  readonly trace_id: string;
  readonly request_id: string;
}

export interface UiModuleArtifact {
  readonly ui_module_ref: string;
  readonly source_capability_ref: string;
  readonly projection_ref: string;
  readonly source_lineage: JsonObject;
  readonly source_semantic_snapshot: JsonObject;
  readonly semantic_model: JsonObject;
  readonly action_bindings: readonly JsonObject[];
  readonly state_bindings: readonly JsonObject[];
  readonly permission_bindings: readonly JsonObject[];
  readonly evidence_views: readonly JsonObject[];
  readonly logic_projection: JsonObject;
  readonly content_hash: string;
}

export interface ResolveUiModuleRequest {
  readonly source_capability_ref: string;
  readonly projection_ref: string;
  readonly projection_input: JsonObject;
  readonly trace_id: string;
  readonly request_id: string;
}

export interface ResolveUiModuleResponse {
  readonly outcome_type: "response";
  readonly ui_module_artifact: UiModuleArtifact;
  readonly evidence_ref: string;
  readonly receipt_ref: string;
  readonly trace_id: string;
  readonly request_id: string;
}

export type ResolveUiModuleOutcome = ResolveUiModuleResponse | StableErrorOutcome;
