export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash": "sha256:7df1c6af476a19960751980fc1f9a86a3fd637d946e9c1946498ae4928546002",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_RENDER@V0105",
  "capability_version": "V0105",
  "dependency_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105",
    "Q.UI.CAPABILITY.UI_SURFACE@V0105"
  ],
  "direct_handler_export_forbidden": true,
  "public_entry_ref": "src/p1/export/ui_render/entry.ts#entry",
  "metadata_ref": "src/p1/export/ui_render/metadata.ts#capability_extraction_metadata",
  "mode": "PUBLICATION_ELIGIBLE",
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/interfaces/ui_render_execution_invoke"
  ],
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/operations/execute_ui_render"
  ],
  "public_type_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/type_closure/artifact_contracts/ui_render_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/type_closure/artifact_contracts/ui_surface_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/type_closure/outcome_contracts/call_outcome"
  ],
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/stable_errors/execute_ui_render"
  ],
  "p1_static_extraction_only": true
} as const);
