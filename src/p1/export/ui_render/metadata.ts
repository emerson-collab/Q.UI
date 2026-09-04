export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash":"sha256:7b86844c4b1a07d3940d29a3aad42ab37f5777b8b603d203fa2f6da5d3b188d4",
  "capability_contract_ref":"Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106",
  "capability_ref":"Q.UI.CAPABILITY.UI_RENDER@V0106",
  "capability_version":"V0106",
  "dependency_refs":["Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106","Q.UI.CAPABILITY.UI_SURFACE@V0106","Q.THEME.CONTRACT.CAPABILITY.THEME_BINDING@V0104"],
  "direct_handler_export_forbidden":true,
  "metadata_ref":"src/p1/export/ui_render/metadata.ts#capability_extraction_metadata",
  "mode":"PUBLICATION_ELIGIBLE",
  "p1_static_extraction_only":true,
  "public_entry_ref":"src/p1/export/ui_render/entry.ts#entry",
  "public_interface_refs":["Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/interfaces/ui_render_execution_invoke"],
  "public_operation_refs":["Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/operations/execute_ui_render"],
  "public_type_refs":["Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/type_closure/artifact_contracts/ui_render_artifact","Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/type_closure/artifact_contracts/ui_surface_artifact","Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/type_closure/outcome_contracts/call_outcome"],
  "runtime_contract_ref":"Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs":["Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106#/stable_errors/execute_ui_render"]
} as const);
