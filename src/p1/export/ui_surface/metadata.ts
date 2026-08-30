export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash": "sha256:818dd6b155cf505362b2e648a1088bebd6448e841d83c6ae04e79cadac6eb203",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_SURFACE@V0105",
  "capability_version": "V0105",
  "dependency_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105",
    "Q.UI.CAPABILITY.UI_MODULE@V0105"
  ],
  "direct_handler_export_forbidden": true,
  "public_entry_ref": "src/p1/export/ui_surface/entry.ts#entry",
  "metadata_ref": "src/p1/export/ui_surface/metadata.ts#capability_extraction_metadata",
  "mode": "PUBLICATION_ELIGIBLE",
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/interfaces/ui_surface_creation_invoke",
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/interfaces/ui_surface_resolution_invoke"
  ],
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/create_ui_surface",
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/resolve_ui_surface"
  ],
  "public_type_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/type_closure/artifact_contracts/ui_surface_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/type_closure/artifact_contracts/ui_module_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/type_closure/outcome_contracts/call_outcome"
  ],
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/create_ui_surface",
    "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/resolve_ui_surface"
  ],
  "p1_static_extraction_only": true
} as const);
