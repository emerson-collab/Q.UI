const PATH = Object.freeze(["capability_id", "operation_id", "trace_id", "request_id"] as const);
const STATIC_MOUNT = Object.freeze(["operation_contract", "dependency_contract_ref", "dependency_client_ref", "dependency_binding_ref"] as const);
const DYNAMIC_MOUNT = Object.freeze(["input", "runtime_context", "dependency_request", "outcome_type", "runtime_result", "stable_error", "execution_receipt", "evidence_ref"] as const);

export const public_contracts = Object.freeze({
  capability_ref: "Q.UI.CAPABILITY.UI_PRODUCER@V0107",
  capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107",
  operations: Object.freeze({
    produce_app: Object.freeze({
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app",
      operation_id: "produce_app",
      owner_capability_ref: "Q.UI.CAPABILITY.UI_PRODUCER@V0107",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_app_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_app_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/stable_error_contract",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/outcome_contracts/call_outcome",
      interface_refs: Object.freeze(["Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_app_invoke"] as const),
    }),
    produce_platform: Object.freeze({
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform",
      operation_id: "produce_platform",
      owner_capability_ref: "Q.UI.CAPABILITY.UI_PRODUCER@V0107",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_platform_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_platform_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/stable_error_contract",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/outcome_contracts/call_outcome",
      interface_refs: Object.freeze(["Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_platform_invoke"] as const),
    }),
  }),
  interfaces: Object.freeze({
    produce_app_invoke: Object.freeze({
      interface_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_app_invoke",
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app",
      surface: "CALL",
      kind_code: "M1",
      kind: "CALL_INVOKE",
      method_ref: "produce_app",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_app_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_app_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/stable_error_contract",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/outcome_contracts/call_outcome",
      path: PATH,
      static_mount: STATIC_MOUNT,
      dynamic_mount: DYNAMIC_MOUNT,
    }),
    produce_platform_invoke: Object.freeze({
      interface_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_platform_invoke",
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform",
      surface: "CALL",
      kind_code: "M1",
      kind: "CALL_INVOKE",
      method_ref: "produce_platform",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_platform_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/contracts/produce_platform_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/stable_error_contract",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/outcome_contracts/call_outcome",
      path: PATH,
      static_mount: STATIC_MOUNT,
      dynamic_mount: DYNAMIC_MOUNT,
    }),
  }),
  stable_error_contract: Object.freeze({
    contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/stable_error_contract",
    errors: Object.freeze({
      UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED: "The governed UI Module Artifact cannot be resolved.",
      UI_PRODUCER_THEME_INCOMPATIBLE: "The governed UI Theme Artifact is incompatible with the requested production context.",
      UI_PRODUCER_P2_MOUNT_INCOMPLETE: "A business-executing Host action lacks complete governed P2 mount lineage.",
      UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN: "Production would require prohibited business-semantic inference.",
    }),
    error_code_set: Object.freeze([
      "UI_PRODUCER_UI_MODULE_ARTIFACT_UNRESOLVED",
      "UI_PRODUCER_THEME_INCOMPATIBLE",
      "UI_PRODUCER_P2_MOUNT_INCOMPLETE",
      "UI_PRODUCER_BUSINESS_SEMANTIC_INFERENCE_FORBIDDEN",
    ] as const),
  }),
  public_type_refs: Object.freeze([
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/type_closure/schemas/ui_module_artifact_ref",
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/type_closure/schemas/ui_theme_artifact_ref",
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/type_closure/schemas/host_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@${CURRENT}#/type_closure/schemas/ui_module_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@${CURRENT}#/type_closure/schemas/ui_theme_artifact",
  ] as const),
  receiving_dependencies: Object.freeze({
    ui_module: Object.freeze({
      dependency_ref: "Q.UI.DEPENDENCY.UI_MODULE@V0100",
      exact_local_dependency_ref: "Q.UI.DEPENDENCY.UI_MODULE@V0100",
      p1_dependency_interface_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/interfaces/dependency_invoke",
      p2_realization_ref: "Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@V0124",
      target_capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@${CURRENT}",
      exact_receiving_operation_refs: Object.freeze([
        "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app",
        "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform",
      ] as const),
    }),
    ui_theme: Object.freeze({
      dependency_ref: "Q.UI.DEPENDENCY.UI_THEME@V0100",
      exact_local_dependency_ref: "Q.UI.DEPENDENCY.UI_THEME@V0100",
      p1_dependency_interface_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179#/interfaces/dependency_invoke",
      p2_realization_ref: "Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@V0124",
      target_capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_THEME@${CURRENT}",
      exact_receiving_operation_refs: Object.freeze([
        "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app",
        "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform",
      ] as const),
      optional: true,
    }),
  }),
} as const);
