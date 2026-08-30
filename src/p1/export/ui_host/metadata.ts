export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash": "sha256:bd442fc64b9a62092e944f439364220bc23df0dc30434243f8b3b63b3b2de3cf",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_HOST@V0105",
  "capability_version": "V0105",
  "dependency_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105",
    "Q.UI.CAPABILITY.UI_RENDER@V0105",
    "Q.WORKFLOW.CAPABILITY.WORKFLOW@V0101",
    "Q.WORKFLOW.OPERATION.EXECUTE_WORKFLOW@V0101",
    "Q.WORKFLOW.INTERFACE.WORKFLOW_EXECUTION_INVOKE@V0101"
  ],
  "direct_handler_export_forbidden": true,
  "public_entry_ref": "src/p1/export/ui_host/entry.ts#entry",
  "metadata_ref": "src/p1/export/ui_host/metadata.ts#capability_extraction_metadata",
  "mode": "PUBLICATION_ELIGIBLE",
  "public_interface_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/interfaces/ui_host_activation_invoke",
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/interfaces/ui_host_deactivation_invoke"
  ],
  "public_operation_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/activate_ui_host",
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/deactivate_ui_host"
  ],
  "public_type_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/type_closure/artifact_contracts/ui_host_result",
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/type_closure/artifact_contracts/ui_render_artifact",
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/type_closure/outcome_contracts/call_outcome"
  ],
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/activate_ui_host",
    "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/deactivate_ui_host"
  ],
  "p1_static_extraction_only": true
} as const);
