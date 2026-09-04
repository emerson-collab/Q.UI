export const capability_extraction_metadata = Object.freeze({
  "capability_contract_hash": "sha256:d6944d54adec80d56aadc46a03ebd607c77ca2591c74e92b0adb5419c0e1be61",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106",
  "capability_ref": "Q.UI.CAPABILITY.UI_HOST@V0106",
  "capability_version": "V0106",
  "dependency_refs": [
    "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0106",
    "Q.UI.CAPABILITY.UI_RENDER@V0106",
    "Q.WORKFLOW.CONTRACT.CAPABILITY.WORKFLOW@${CURRENT}",
    "Q.WORKFLOW.CONTRACT.CAPABILITY.WORKFLOW@${CURRENT}#/operations/execute_workflow",
    "Q.WORKFLOW.CONTRACT.CAPABILITY.WORKFLOW@${CURRENT}#/interfaces/workflow_execution_invoke"
  ],
  "direct_handler_export_forbidden": true,
  "metadata_ref": "src/p1/export/ui_host/metadata.ts#capability_extraction_metadata",
  "mode": "PUBLICATION_ELIGIBLE",
  "p1_static_extraction_only": true,
  "public_entry_ref": "src/p1/export/ui_host/entry.ts#entry",
  "public_interface_refs": ["Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/interfaces/ui_host_activation_invoke","Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/interfaces/ui_host_deactivation_invoke"],
  "public_operation_refs": ["Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/operations/activate_ui_host","Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/operations/deactivate_ui_host"],
  "public_type_refs": ["Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/type_closure/artifact_contracts/ui_host_result","Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/type_closure/artifact_contracts/ui_render_artifact","Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/type_closure/outcome_contracts/call_outcome"],
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134",
  "stable_error_refs": ["Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/stable_errors/activate_ui_host","Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0106#/stable_errors/deactivate_ui_host"]
} as const);
