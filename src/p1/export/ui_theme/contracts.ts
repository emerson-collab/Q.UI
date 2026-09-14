export const public_contracts = Object.freeze({
  capability_ref: "Q.UI.CAPABILITY.UI_THEME@V0107",
  capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107",
  capability_contract_hash: "sha256:1a30c2802e7e334b399eed855bd8c41d5014b654334a9f01b97e0bec19cb1da8",
  capability_version: "V0107",
  stage_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179",
  runtime_contract_ref: "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  external_provider_surface_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/external_provider_surface",
  external_provider_surface_hash: null,
  external_provider_surface_hash_resolution: "EXTERNAL_SURFACE_AND_CLOSURE_BINDING_AFTER_IMMUTABLE_SOURCE_FINALIZATION",
  operations: {
    resolve_ui_theme: {
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/operations/resolve_ui_theme",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/contracts/resolve_ui_theme_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/contracts/resolve_ui_theme_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/stable_error_contract",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@${CURRENT}#/outcome_contracts/call_outcome",
    },
  },
  interfaces: {
    ui_theme_invoke: {
      interface_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/interfaces/ui_theme_invoke",
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/operations/resolve_ui_theme",
      surface: "CALL",
      kind_code: "M1",
      kind: "CALL_INVOKE",
      method_ref: "resolve_ui_theme",
    },
  },
  public_type_refs: ["Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0107#/type_closure/schemas/ui_theme_artifact"],
  stable_error_codes: [
    "UI_THEME_SELECTOR_UNRESOLVED",
    "UI_THEME_CONTEXT_INCOMPATIBLE",
    "UI_THEME_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN",
  ],
  dependency_refs: [
    "Q.SS.STD.META.CONTRACT.ARTIFACT@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.CONTRACT@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.CAPABILITY_CONTRACT@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.SYSTEM_OBJECT_NAMING.MIN@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.DIMENSION_INTERFACE_CLASSIFICATION@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.SURFACE_LAYER_MOUNT@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.FIELD_DICTIONARY@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.PAYLOAD_SCHEMA_BOUNDARY@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.STAGE_ARTIFACT_FILE_NAMING@${CURRENT}",
    "Q.SS.STD.META.CONTRACT.REPOSITORY_DIRECTORY_SKELETON@${CURRENT}",
    "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@${CURRENT}",
    "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@${CURRENT}",
    "Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@${CURRENT}",
  ],
  local_dependencies: [],
  external_dependencies: {},
} as const);

export const CAPABILITY_REF = public_contracts.capability_ref;
export const CAPABILITY_CONTRACT_REF = public_contracts.capability_contract_ref;
export const CAPABILITY_CONTRACT_HASH = public_contracts.capability_contract_hash;
export const RUNTIME_CONTRACT_REF = public_contracts.runtime_contract_ref;
