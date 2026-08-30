export const public_contracts = Object.freeze({
  "artifact_contracts": {
    "ui_module_artifact": {
      "required_fields": [
        "ui_module_ref",
        "source_capability_ref",
        "projection_ref",
        "semantic_model",
        "action_bindings",
        "state_bindings",
        "evidence_views",
        "content_hash"
      ]
    },
    "ui_surface_artifact": {
      "required_fields": [
        "ui_surface_ref",
        "ui_module_refs",
        "regions",
        "slots",
        "navigation_projection",
        "interaction_bindings",
        "content_hash"
      ]
    }
  },
  "capability_contract_hash": "sha256:818dd6b155cf505362b2e648a1088bebd6448e841d83c6ae04e79cadac6eb203",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_SURFACE@V0105",
  "capability_version": "V0105",
  "dependencies": {
    "ui_module": {
      "classification": "INTRA_DOMAIN_CAPABILITY_DEPENDENCY",
      "cross_domain_realization_required": false,
      "provider_capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0105",
      "provider_capability_ref": "Q.UI.CAPABILITY.UI_MODULE@V0105"
    }
  },
  "interfaces": {
    "ui_surface_creation_invoke": {
      "dynamic_mount": [
        "surface_input",
        "ui_surface_artifact",
        "outcome_type",
        "stable_error",
        "evidence_ref",
        "receipt_ref"
      ],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/interfaces/ui_surface_creation_invoke",
      "kind": "CALL_INVOKE",
      "kind_code": "M1",
      "method_ref": "create_ui_surface",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/create_ui_surface",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_SURFACE@V0105",
      "path": [
        "ui_surface_ref",
        "trace_id",
        "request_id"
      ],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/create_ui_surface/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/create_ui_surface/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/create_ui_surface",
      "static_mount": [
        "ui_surface_contract_ref",
        "ui_module_refs",
        "layout_profile_ref",
        "navigation_profile_ref",
        "interaction_policy_refs"
      ],
      "surface": "CALL"
    },
    "ui_surface_resolution_invoke": {
      "dynamic_mount": [
        "resolution_input",
        "ui_surface_artifact",
        "outcome_type",
        "stable_error",
        "evidence_ref",
        "receipt_ref"
      ],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/interfaces/ui_surface_resolution_invoke",
      "kind": "CALL_INVOKE",
      "kind_code": "M1",
      "method_ref": "resolve_ui_surface",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/resolve_ui_surface",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_SURFACE@V0105",
      "path": [
        "ui_surface_ref",
        "trace_id",
        "request_id"
      ],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/resolve_ui_surface/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/resolve_ui_surface/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/resolve_ui_surface",
      "static_mount": [
        "ui_surface_contract_ref",
        "surface_registry_ref",
        "compatibility_ref"
      ],
      "surface": "CALL"
    }
  },
  "operations": {
    "create_ui_surface": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/create_ui_surface",
      "request_contract": {
        "business_semantics": {
          "requires": [
            "ui_module_artifact refs",
            "exact framework relationships/region requirements"
          ]
        },
        "required_fields": [
          "ui_surface_ref",
          "surface_input",
          "trace_id",
          "request_id"
        ]
      },
      "response_contract": {
        "business_semantics": {
          "produces": [
            "ui_surface_artifact",
            "surface-to-framework binding"
          ]
        },
        "required_fields": [
          "outcome_type",
          "ui_surface_artifact",
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
          "framework/surface closure failed",
          "module lineage conflict"
        ]
      },
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/create_ui_surface"
    },
    "resolve_ui_surface": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/operations/resolve_ui_surface",
      "request_contract": {
        "business_semantics": {
          "requires": [
            "ui_surface_artifact",
            "target/device/accessibility context"
          ]
        },
        "required_fields": [
          "ui_surface_ref",
          "resolution_input",
          "trace_id",
          "request_id"
        ]
      },
      "response_contract": {
        "business_semantics": {
          "produces": [
            "resolved_ui_surface_artifact",
            "target_realization_lineage"
          ]
        },
        "required_fields": [
          "outcome_type",
          "ui_surface_artifact",
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
          "target unsupported",
          "framework equivalence closure failed"
        ]
      },
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105#/stable_errors/resolve_ui_surface"
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
