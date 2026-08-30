export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash": "sha256:d886a090c8e5f13db8328e78dc21ccce423fbeed7b2e58176798638776e8cdcb",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_MODULE@V0105",
  "capability_version": "V0105",
  "dependency_refs": [],
  "direct_handler_export_forbidden": true,
  "public_entry_ref": "src/p1/export/ui_module/entry.ts#entry",
  "metadata_ref": "src/p1/export/ui_module/metadata.ts#capability_extraction_metadata",
  "mode": "PUBLICATION_ELIGIBLE",
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105#/interfaces/ui_module_resolution_invoke"
  ],
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105#/operations/resolve_ui_module"
  ],
  "public_type_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105#/type_closure/artifact_contracts/ui_module_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105#/type_closure/outcome_contracts/call_outcome"
  ],
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105#/stable_errors/resolve_ui_module"
  ],
  "p1_static_extraction_only": true
} as const);
