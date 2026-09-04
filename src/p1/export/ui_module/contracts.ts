export const public_contracts = Object.freeze({
  "artifact_contracts": { "ui_module_artifact": { "required_fields": ["ui_module_ref","source_capability_ref","projection_ref","semantic_model","action_bindings","state_bindings","evidence_views","content_hash"] } },
  "capability_contract_hash": "sha256:2554f49d8e782fbe44a80b024c2d1fdc736d8058e8be8b0ef21feb51ba40be8b",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106",
  "capability_ref": "Q.UI.CAPABILITY.UI_MODULE@V0106",
  "capability_version": "V0106",
  "dependencies": {},
  "interfaces": {
    "ui_module_resolution_invoke": {
      "dynamic_mount": ["projection_input","ui_module_artifact","outcome_type","stable_error","evidence_ref","receipt_ref"],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/interfaces/ui_module_resolution_invoke",
      "kind": "CALL_INVOKE", "kind_code": "M1", "method_ref": "resolve_ui_module",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/operations/resolve_ui_module",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_MODULE@V0106",
      "path": ["source_capability_ref","projection_ref","trace_id","request_id"],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/operations/resolve_ui_module/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/operations/resolve_ui_module/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/stable_errors/resolve_ui_module",
      "static_mount": ["ui_module_contract_ref","source_contract_ref","source_operation_refs","source_interface_refs","source_permission_refs","source_state_refs","source_evidence_projection_refs"],
      "surface": "CALL"
    }
  },
  "operations": {
    "resolve_ui_module": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/operations/resolve_ui_module",
      "request_contract": {"business_semantics":{"requires":["exact framework artifact/ref/hash","exact source semantic lineage"],"theme_style_not_required_at_module_semantic_resolution":true},"required_fields":["source_capability_ref","projection_ref","projection_input","trace_id","request_id"]},
      "response_contract": {"business_semantics":{"produces":["ui_module_artifact","framework_lineage_projection"]},"required_fields":["outcome_type","ui_module_artifact","evidence_ref","receipt_ref","trace_id","request_id"]},
      "stable_error": {"required_fields":["outcome_type","stable_error","evidence_ref","trace_id","request_id"],"semantic_cases":["framework lineage unresolved","framework input invalid"]},
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0106#/stable_errors/resolve_ui_module"
    }
  },
  "outcome_contract": {"allowed_values":["response","stable_error"],"discriminator":"outcome_type","exactly_one_variant":true},
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134"
} as const);
export const CAPABILITY_CONTRACT_REF = public_contracts.capability_contract_ref;
export const CAPABILITY_CONTRACT_HASH = public_contracts.capability_contract_hash;
export const CAPABILITY_REF = public_contracts.capability_ref;
export const RUNTIME_CONTRACT_REF = public_contracts.runtime_contract_ref;
