export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash":"sha256:337a3bbabd39b9a414cdbafa69b8ea2a0d53a3dd511927d11736d19afdfdd04d",
  "capability_contract_ref":"Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106",
  "capability_ref":"Q.UI.CAPABILITY.UI_SURFACE@V0106",
  "capability_version":"V0106",
  "dependency_refs":["Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106","Q.UI.CAPABILITY.UI_MODULE@V0106"],
  "direct_handler_export_forbidden":true,
  "metadata_ref":"src/p1/export/ui_surface/metadata.ts#capability_extraction_metadata",
  "mode":"PUBLICATION_ELIGIBLE",
  "p1_static_extraction_only":true,
  "public_entry_ref":"src/p1/export/ui_surface/entry.ts#entry",
  "public_interface_refs":["Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/interfaces/ui_surface_creation_invoke","Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/interfaces/ui_surface_resolution_invoke"],
  "public_operation_refs":["Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/operations/create_ui_surface","Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/operations/resolve_ui_surface"],
  "public_type_refs":["Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/type_closure/artifact_contracts/ui_surface_artifact","Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/type_closure/artifact_contracts/ui_module_artifact","Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/type_closure/outcome_contracts/call_outcome"],
  "runtime_contract_ref":"Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs":["Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/stable_errors/create_ui_surface","Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0106#/stable_errors/resolve_ui_surface"]
} as const);
