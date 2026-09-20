export const public_contracts = Object.freeze({
  capability_contract_hash: "sha256:107689009664b298b97dac8bc8d453181ef710d60c759bb0f3ed2374d21ed478",
  capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120",
  capability_ref: "Q.UI.CAPABILITY.UI_MODULE@V0120",
  capability_version: "V0120",
  runtime_contract_ref: "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  dependencies: Object.freeze({}),
  interfaces: Object.freeze({
    ui_module_resolution_invoke: Object.freeze({
      interface_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/interfaces/ui_module_resolution_invoke",
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/operations/resolve_ui_module",
      surface: "CALL",
      kind: "CALL_INVOKE",
      method_ref: "resolve_ui_module",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/contracts/resolve_ui_module_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/contracts/resolve_ui_module_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/stable_errors/resolve_ui_module",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0181#/outcome_contracts/call_outcome",
    }),
  }),
  operations: Object.freeze({
    resolve_ui_module: Object.freeze({
      operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/operations/resolve_ui_module",
      request_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/contracts/resolve_ui_module_request_contract",
      response_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/contracts/resolve_ui_module_response_contract",
      stable_error_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0120#/stable_errors/resolve_ui_module",
      outcome_contract_ref: "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0181#/outcome_contracts/call_outcome",
    }),
  }),
  outcome_contract: Object.freeze({
    allowed_values: Object.freeze(["response", "stable_error"]),
    discriminator: "outcome_type",
    exactly_one_variant: true,
  }),
} as const);

export const CAPABILITY_CONTRACT_REF = public_contracts.capability_contract_ref;
export const CAPABILITY_CONTRACT_HASH = public_contracts.capability_contract_hash;
export const CAPABILITY_REF = public_contracts.capability_ref;
export const RUNTIME_CONTRACT_REF = public_contracts.runtime_contract_ref;
