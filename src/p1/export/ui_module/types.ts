export type JsonObject = Readonly<Record<string, unknown>>;

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

/**
 * Exact V0117 business input payload.
 *
 * trace_id/request_id and runtime outcome/evidence/receipt carriers are owned by the
 * P0/P1 framework and are intentionally absent from this owner-local payload type.
 */
export interface ResolveUiModuleRequest {
  readonly source_capability_ref: string;
  readonly projection_ref: string;
  readonly projection_input: JsonObject;
}

/** Exact V0117 runtime_result payload. */
export interface ResolveUiModuleResponse {
  readonly ui_module_artifact: UiModuleArtifact;
}
