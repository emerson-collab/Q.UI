export const capability_extraction_metadata = {
  "capability_ref": "Q.UI.CAPABILITY.UI_MODULE@V0126",
  "capability_id": "ui_module",
  "capability_version": "V0126",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126",
  "extraction_mode": "PUBLICATION_ELIGIBLE",
  "public_entry_ref": "src/p1/export/ui_module/entry.ts#entry",
  "metadata_ref": "src/p1/export/ui_module/metadata.ts#capability_extraction_metadata",
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/operations/resolve_ui_module"
  ],
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/interfaces/ui_module_resolution_invoke"
  ],
  "public_contract_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/contracts/resolve_ui_module_request_contract",
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/contracts/resolve_ui_module_response_contract",
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/stable_errors/resolve_ui_module",
    "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@${CURRENT}#/outcome_contracts/call_outcome"
  ],
  "stable_error_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0126#/stable_errors/resolve_ui_module"
  ],
  "semantic_model_version": "Q_UI_MODULE_SEMANTIC_MODEL_V6"
} as const;
