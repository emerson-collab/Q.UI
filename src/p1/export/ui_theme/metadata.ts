export const capability_extraction_metadata = Object.freeze({
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109",
  "capability_contract_hash": "sha256:590e487297c89b1b91a838ac97eae4d309e80db9cc1502e7bbfba55f5560536f",
  "external_provider_surface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/external_provider_surface",
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme"
  ],
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke"
  ],
  "public_contract_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/contracts/resolve_ui_theme_request_contract",
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/contracts/resolve_ui_theme_response_contract",
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/stable_error_contract",
    "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@${CURRENT}#/outcome_contracts/call_outcome"
  ],
  "public_type_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_material",
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_selector",
    "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_artifact"
  ]
} as const);
