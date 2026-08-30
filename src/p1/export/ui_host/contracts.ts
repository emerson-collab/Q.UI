export const public_contracts = Object.freeze({
  "artifact_contracts": {
    "ui_host_result": {
      "required_fields": [
        "ui_host_ref",
        "host_instance_ref",
        "render_artifact_ref",
        "lifecycle_state",
        "receipt_ref"
      ]
    },
    "ui_render_artifact": {
      "required_fields": [
        "render_artifact_ref",
        "ui_surface_ref",
        "renderer_provider_ref",
        "theme_ref",
        "target_profile_ref",
        "content_hash"
      ]
    }
  },
  "capability_contract_hash": "sha256:bd442fc64b9a62092e944f439364220bc23df0dc30434243f8b3b63b3b2de3cf",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_HOST@V0105",
  "capability_version": "V0105",
  "dependencies": {
    "q_workflow": {
      "allowed_operation_ref": "Q.WORKFLOW.OPERATION.EXECUTE_WORKFLOW@V0101",
      "classification": "CROSS_DOMAIN_CAPABILITY_DEPENDENCY",
      "direct_provider_implementation_forbidden": true,
      "exact_interface_ref": "Q.WORKFLOW.INTERFACE.WORKFLOW_EXECUTION_INVOKE@V0101",
      "provider_capability_ref": "Q.WORKFLOW.CAPABILITY.WORKFLOW@V0101",
      "provider_domain_ref": "Q.WORKFLOW.CONTRACT.DOMAIN@${CURRENT}",
      "realization_owner": "Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@${CURRENT}"
    },
    "ui_render": {
      "classification": "INTRA_DOMAIN_CAPABILITY_DEPENDENCY",
      "cross_domain_realization_required": false,
      "provider_capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105",
      "provider_capability_ref": "Q.UI.CAPABILITY.UI_RENDER@V0105"
    }
  },
  "interfaces": {
    "ui_host_activation_invoke": {
      "dynamic_mount": [
        "activation_input",
        "ui_host_result",
        "outcome_type",
        "stable_error",
        "evidence_ref",
        "receipt_ref"
      ],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/interfaces/ui_host_activation_invoke",
      "kind": "CALL_INVOKE",
      "kind_code": "M1",
      "method_ref": "activate_ui_host",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/activate_ui_host",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_HOST@V0105",
      "path": [
        "ui_host_ref",
        "render_artifact_ref",
        "trace_id",
        "request_id"
      ],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/activate_ui_host/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/activate_ui_host/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/activate_ui_host",
      "static_mount": [
        "ui_host_contract_ref",
        "host_provider_ref",
        "host_binding_ref",
        "route_profile_ref",
        "lifecycle_policy_refs"
      ],
      "surface": "CALL"
    },
    "ui_host_deactivation_invoke": {
      "dynamic_mount": [
        "deactivation_input",
        "ui_host_result",
        "outcome_type",
        "stable_error",
        "evidence_ref",
        "receipt_ref"
      ],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/interfaces/ui_host_deactivation_invoke",
      "kind": "CALL_INVOKE",
      "kind_code": "M1",
      "method_ref": "deactivate_ui_host",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/deactivate_ui_host",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_HOST@V0105",
      "path": [
        "ui_host_ref",
        "host_instance_ref",
        "trace_id",
        "request_id"
      ],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/deactivate_ui_host/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/deactivate_ui_host/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/deactivate_ui_host",
      "static_mount": [
        "ui_host_contract_ref",
        "host_provider_ref",
        "host_binding_ref",
        "lifecycle_policy_refs"
      ],
      "surface": "CALL"
    }
  },
  "operations": {
    "activate_ui_host": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/activate_ui_host",
      "request_contract": {
        "business_semantics": {
          "requires": [
            "ui_render_artifact",
            "host binding",
            "route/session context when applicable"
          ]
        },
        "required_fields": [
          "ui_host_ref",
          "render_artifact_ref",
          "activation_input",
          "trace_id",
          "request_id"
        ]
      },
      "response_contract": {
        "business_semantics": {
          "produces": [
            "active_host_binding",
            "ui_host_result",
            "receipt/evidence refs when governed"
          ]
        },
        "required_fields": [
          "outcome_type",
          "ui_host_result",
          "evidence_ref",
          "receipt_ref",
          "trace_id",
          "request_id"
        ]
      },
      "stable_error": {
        "required_fields": [
          "outcome_type",
          "stable_error",
          "evidence_ref",
          "trace_id",
          "request_id"
        ],
        "semantic_cases": [
          "host binding invalid",
          "render artifact incompatible",
          "activation precondition failed"
        ]
      },
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/activate_ui_host"
    },
    "deactivate_ui_host": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/operations/deactivate_ui_host",
      "request_contract": {
        "business_semantics": {
          "requires": [
            "exact active host identity/binding"
          ]
        },
        "required_fields": [
          "ui_host_ref",
          "host_instance_ref",
          "deactivation_input",
          "trace_id",
          "request_id"
        ]
      },
      "response_contract": {
        "business_semantics": {
          "produces": [
            "deactivation_result",
            "receipt/evidence refs when governed"
          ]
        },
        "required_fields": [
          "outcome_type",
          "ui_host_result",
          "evidence_ref",
          "receipt_ref",
          "trace_id",
          "request_id"
        ]
      },
      "stable_error": {
        "required_fields": [
          "outcome_type",
          "stable_error",
          "evidence_ref",
          "trace_id",
          "request_id"
        ],
        "semantic_cases": [
          "host not active",
          "host identity unresolved"
        ]
      },
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0105#/stable_errors/deactivate_ui_host"
    }
  },
  "outcome_contract": {
    "allowed_values": [
      "response",
      "stable_error"
    ],
    "discriminator": "outcome_type",
    "exactly_one_variant": true
  },
  "runtime_contract_ref": "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134"
} as const);
    export const CAPABILITY_CONTRACT_REF = public_contracts.capability_contract_ref;
    export const CAPABILITY_CONTRACT_HASH = public_contracts.capability_contract_hash;
    export const CAPABILITY_REF = public_contracts.capability_ref;
    export const RUNTIME_CONTRACT_REF = public_contracts.runtime_contract_ref;
