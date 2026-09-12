export type JsonObject = Readonly<Record<string, unknown>>;

export interface PresentationContextEnvelope {
  readonly presentation_context_kind: "APPLICATION" | "PLATFORM";
  readonly provider_capability_contract_ref: string;
  readonly provider_capability_contract_hash: string;
  readonly provider_interface_ref: string;
  readonly provider_operation_ref: string;
  readonly presentation_context_ref: string;
  readonly presentation_context_hash: string;
  readonly presentation_context_artifact: JsonObject;
}

export interface UiModuleArtifact {
  readonly ui_module_ref: string;
  readonly source_capability_ref: string;
  readonly projection_ref: string;
  readonly semantic_model: JsonObject;
  readonly action_bindings: readonly JsonObject[];
  readonly state_bindings: readonly JsonObject[];
  readonly evidence_views: readonly unknown[];
  readonly content_hash: string;
}

export interface UiSurfaceArtifact {
  readonly ui_surface_ref: string;
  readonly presentation_context_kind: "APPLICATION" | "PLATFORM";
  readonly presentation_context_ref: string;
  readonly presentation_context_provider_contract_ref: string;
  readonly ui_module_refs: readonly string[];
  readonly regions: readonly JsonObject[];
  readonly slots: readonly JsonObject[];
  readonly navigation_projection: readonly JsonObject[];
  readonly interaction_bindings: readonly JsonObject[];
  readonly resolved_target_context: JsonObject | null;
  readonly content_hash: string;
}

export interface CreateUiSurfaceRequest {
  readonly ui_surface_ref: string;
  readonly surface_input: Readonly<{
    presentation_context: PresentationContextEnvelope;
    ui_module_artifacts: readonly UiModuleArtifact[];
  }>;
}
export interface CreateUiSurfaceResponse { readonly ui_surface_artifact: UiSurfaceArtifact; }

export interface ResolveUiSurfaceRequest {
  readonly ui_surface_ref: string;
  readonly resolution_input: Readonly<{
    ui_surface_artifact: UiSurfaceArtifact;
    target_context: JsonObject;
  }>;
}
export interface ResolveUiSurfaceResponse { readonly ui_surface_artifact: UiSurfaceArtifact; }
