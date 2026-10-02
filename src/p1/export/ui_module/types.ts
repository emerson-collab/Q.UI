export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type SemanticKind = "PLAIN_VALUE" | "BUSINESS_REFERENCE" | "TEMPORAL";
export type VariabilityClass = "GENERAL" | "INSTANCE";
export type ControlKind =
  | "SELECT_INPUT"
  | "REFERENCE_INPUT"
  | "TEMPORAL_INPUT"
  | "TEXT_INPUT"
  | "NUMBER_INPUT"
  | "BOOLEAN_INPUT"
  | "COLLECTION_INPUT"
  | "STRUCTURED_INPUT";
export type ViewKind = "VALUE_VIEW" | "COLLECTION_VIEW" | "STRUCTURED_VIEW";

export interface FieldSemantics {
  semantic_kind: SemanticKind;
  variability_class: VariabilityClass;
  instance_variable_ref?: string | null;
  [key: string]: JsonValue | undefined;
}

export interface UiModuleProjectionInput {
  source_capability_contract_ref: string;
  source_capability_contract_hash: string;
  source_external_provider_surface_ref: string;
  source_external_provider_surface_hash: string;
  source_capability_semantic_projection: Record<string, unknown>;
}

export interface ResolveUiModuleRequest {
  source_capability_ref: string;
  projection_ref: string;
  projection_input: UiModuleProjectionInput;
}

export interface UiReferenceInputBinding {
  source_reference_semantics: Record<string, unknown>;
  reference_owner_mode: "SELF" | "DECLARED_DEPENDENCY" | "EXTERNAL_OPAQUE";
  reference_owner_ref: string | null;
  local_dependency_ref: string | null;
  resolution_mode: "ENUMERABLE_LOOKUP" | "EXACT_READ" | "OPAQUE_MANUAL";
  selection_cardinality: "ONE" | "MANY";
  manual_entry_allowed: boolean;
  identity_field_path: string[] | null;
  display_field_paths: string[][] | null;
  read_operation_ref: string | null;
  read_interface_ref: string | null;
  read_request_identity_field_path: string[] | null;
  read_result_object_path: string[] | null;
  lookup_operation_ref: string | null;
  lookup_interface_ref: string | null;
  lookup_request_input_template: Record<string, unknown> | null;
  lookup_result_collection_path: string[] | null;
}

export interface UiTemporalInputBinding {
  source_temporal_semantics: Record<string, unknown>;
  temporal_kind: "DATE" | "TIME" | "DATE_TIME" | "DURATION" | "RANGE";
  json_schema_format: "date" | "time" | "date-time" | "duration" | null;
  range_start_path: string[] | null;
  range_end_path: string[] | null;
  range_endpoint_kind: "DATE" | "TIME" | "DATE_TIME" | null;
}

export interface UiRequestControlBinding {
  source_operation_ref: string;
  source_request_contract_ref: string;
  source_field_path: string[];
  source_field_schema: Record<string, unknown>;
  control_kind: ControlKind;
  required: boolean;
  field_order: number;
  reference_binding: UiReferenceInputBinding | null;
  temporal_binding: UiTemporalInputBinding | null;
  variability_class: VariabilityClass;
  instance_variable_ref: string | null;
}

export interface UiResponseViewBinding {
  source_operation_ref: string;
  source_response_contract_ref: string;
  source_field_path: string[];
  source_field_schema: Record<string, unknown>;
  view_kind: ViewKind;
  field_order: number;
}

export interface UiInterfaceProjection {
  source_operation_ref: string;
  source_interface_ref: string;
  source_request_contract_ref: string;
  source_response_contract_ref: string;
  source_outcome_contract_ref: string;
  source_stable_error_contract_ref: string;
  request_controls: UiRequestControlBinding[];
  response_views: UiResponseViewBinding[];
  executable: boolean;
}

export interface UiOperationProjection {
  source_operation_ref: string;
  interface_projections: UiInterfaceProjection[];
  executable_interface_refs: string[];
}

export interface UiSemanticCoverage {
  source_operation_refs: string[];
  projected_operation_refs: string[];
  source_interface_refs: string[];
  projected_interface_refs: string[];
  source_provider_interface_refs: string[];
  bound_action_interface_refs: string[];
  status: "COMPLETE";
}

export interface UiSemanticModel {
  semantic_model_version: "Q_UI_MODULE_SEMANTIC_MODEL_V6";
  operation_projections: UiOperationProjection[];
  coverage: UiSemanticCoverage;
}

export interface UiActionBinding {
  source_capability_ref: string;
  source_capability_contract_ref: string;
  source_capability_contract_hash: string;
  source_external_provider_surface_ref: string;
  source_external_provider_surface_hash: string;
  source_operation_ref: string;
  source_interface_ref: string;
  source_request_contract_ref: string;
  source_response_contract_ref: string;
  source_outcome_contract_ref: string;
  source_stable_error_contract_ref: string;
  request_controls: UiRequestControlBinding[];
  response_views: UiResponseViewBinding[];
  executable: true;
}

export interface UiStateBinding {
  source_operation_ref: string | null;
  source_state_path: string[];
  source_state_semantics: Record<string, unknown>;
}

export interface UiPermissionBinding {
  source_operation_ref: string | null;
  source_permission_path: string[];
  source_permission_semantics: Record<string, unknown>;
}

export interface UiEvidenceViewBinding {
  source_operation_ref: string | null;
  source_evidence_path: string[];
  source_evidence_semantics: unknown;
}

export interface UiOperationalRelationProjection {
  source_relation_ref: string;
  source_consumer_operation_ref: string;
  source_local_dependency_ref: string;
  source_provider_capability_contract_ref: string;
  source_provider_operation_ref: string;
  source_provider_interface_ref: string;
  source_relation_semantics: Record<string, unknown>;
}

export interface UiStateMachineProjection {
  source_state_machine_ref: string;
  source_subject_schema_ref: string;
  source_state_machine_semantics: Record<string, unknown>;
}

export interface UiStateTransitionProjection {
  source_state_machine_ref: string;
  source_transition_ref: string;
  source_operation_ref: string;
  source_transition_semantics: Record<string, unknown>;
}

export interface UiPermissionProjection {
  source_permission_ref: string;
  source_operation_ref: string;
  source_access_mode: "UNRESTRICTED" | "RESTRICTED";
  source_permission_semantics: Record<string, unknown>;
}

export interface UiActorClassProjection {
  source_actor_class_ref: string;
  source_identity_source_kind: "BUSINESS_REFERENCE" | "EXTERNAL_AUTHORITY";
  source_actor_class_semantics: Record<string, unknown>;
}

export interface UiRuleBindingProjection {
  source_rule_ref: string;
  source_enforcement_phase:
    | "REQUEST_VALIDATION"
    | "PRECONDITION"
    | "DEPENDENCY_PRECONDITION"
    | "AUTHORIZATION"
    | "STATE_GUARD"
    | "POSTCONDITION"
    | "EVIDENCE_ONLY"
    | "INFORMATIONAL";
  source_evaluation_realization_mode:
    | "OPERATION_ENFORCED"
    | "DEPENDENCY_DECISION"
    | "HUMAN_DECISION"
    | "INFORMATIONAL";
  source_rule_binding_semantics: Record<string, unknown>;
}

export interface UiLogicGraphProjection {
  operational_relations: UiOperationalRelationProjection[];
  state_machines: UiStateMachineProjection[];
  state_transitions: UiStateTransitionProjection[];
  permissions: UiPermissionProjection[];
  actor_classes: UiActorClassProjection[];
  rule_bindings: UiRuleBindingProjection[];
  status: "COMPLETE";
}

export interface SourceCapabilityLineage {
  source_capability_ref: string;
  source_capability_contract_ref: string;
  source_capability_contract_hash: string;
  source_external_provider_surface_ref: string;
  source_external_provider_surface_hash: string;
}

export interface UiModuleArtifact {
  ui_module_ref: string;
  source_capability_ref: string;
  projection_ref: string;
  source_lineage: SourceCapabilityLineage;
  source_semantic_snapshot: Record<string, unknown>;
  semantic_model: UiSemanticModel;
  action_bindings: UiActionBinding[];
  state_bindings: UiStateBinding[];
  permission_bindings: UiPermissionBinding[];
  evidence_views: UiEvidenceViewBinding[];
  logic_projection: UiLogicGraphProjection;
  content_hash: string;
}

export type UiModuleStableErrorCode =
  | "UI_MODULE_SOURCE_CAPABILITY_LINEAGE_UNRESOLVED"
  | "UI_MODULE_SOURCE_CAPABILITY_SEMANTIC_PROJECTION_INVALID"
  | "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS"
  | "UI_MODULE_OPERATION_COVERAGE_INCOMPLETE"
  | "UI_MODULE_INTERFACE_COVERAGE_INCOMPLETE"
  | "UI_MODULE_FIELD_COVERAGE_INCOMPLETE"
  | "UI_MODULE_ACTION_LINEAGE_INCOMPLETE"
  | "UI_MODULE_OUTPUT_GRAMMAR_INVALID"
  | "UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN"
  | "UI_MODULE_SOURCE_OPERATION_EXECUTION_FORBIDDEN"
  | "UI_MODULE_REFERENCE_SEMANTICS_AMBIGUOUS"
  | "UI_MODULE_TEMPORAL_SEMANTICS_AMBIGUOUS"
  | "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE"
  | "UI_MODULE_REFERENCE_BINDING_INVALID"
  | "UI_MODULE_TEMPORAL_BINDING_INVALID"
  | "UI_MODULE_OPERATIONAL_RELATION_PROJECTION_INVALID"
  | "UI_MODULE_STATE_MODEL_PROJECTION_INVALID"
  | "UI_MODULE_PERMISSION_MODEL_PROJECTION_INVALID"
  | "UI_MODULE_RULE_BINDING_PROJECTION_INVALID"
  | "UI_MODULE_LOGIC_GRAPH_COVERAGE_INCOMPLETE";

export interface UiModuleStableError {
  code: UiModuleStableErrorCode;
  message: string;
}

export type ResolveUiModuleOutcome =
  | {
      outcome_type: "response";
      runtime_result: { ui_module_artifact: UiModuleArtifact };
    }
  | {
      outcome_type: "stable_error";
      stable_error: UiModuleStableError;
    };

export type UiModuleEntry = (
  request: ResolveUiModuleRequest,
) => Promise<ResolveUiModuleOutcome>;
