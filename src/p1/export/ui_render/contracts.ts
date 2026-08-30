export const public_contracts = Object.freeze({
  "artifact_contracts": {
    "ui_render_artifact": {
      "required_fields": [
        "render_artifact_ref",
        "ui_surface_ref",
        "renderer_provider_ref",
        "theme_ref",
        "target_profile_ref",
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
  "capability_contract_hash": "sha256:7df1c6af476a19960751980fc1f9a86a3fd637d946e9c1946498ae4928546002",
  "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105",
  "capability_ref": "Q.UI.CAPABILITY.UI_RENDER@V0105",
  "capability_version": "V0105",
  "dependencies": {
    "ui_surface": {
      "classification": "INTRA_DOMAIN_CAPABILITY_DEPENDENCY",
      "cross_domain_realization_required": false,
      "provider_capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0105",
      "provider_capability_ref": "Q.UI.CAPABILITY.UI_SURFACE@V0105"
    }
  },
  "interfaces": {
    "ui_render_execution_invoke": {
      "dynamic_mount": [
        "render_input",
        "ui_render_artifact",
        "outcome_type",
        "stable_error",
        "evidence_ref",
        "receipt_ref"
      ],
      "interface_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/interfaces/ui_render_execution_invoke",
      "kind": "CALL_INVOKE",
      "kind_code": "M1",
      "method_ref": "execute_ui_render",
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/operations/execute_ui_render",
      "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/type_closure/outcome_contracts/call_outcome",
      "owner_capability_ref": "Q.UI.CAPABILITY.UI_RENDER@V0105",
      "path": [
        "ui_render_ref",
        "ui_surface_ref",
        "trace_id",
        "request_id"
      ],
      "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/operations/execute_ui_render/request_contract",
      "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/operations/execute_ui_render/response_contract",
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/stable_errors/execute_ui_render",
      "static_mount": [
        "ui_render_contract_ref",
        "renderer_provider_ref",
        "theme_ref",
        "target_profile_ref",
        "device_profile_ref",
        "accessibility_profile_ref"
      ],
      "surface": "CALL"
    }
  },
  "operations": {
    "execute_ui_render": {
      "operation_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/operations/execute_ui_render",
      "request_contract": {
        "business_semantics": {
          "missing_theme_binding": "FAIL_CLOSED",
          "requires": [
            "resolved_ui_surface_artifact",
            "exact Q.Theme theme_binding_artifact/ref/hash",
            "target renderer context"
          ]
        },
        "required_fields": [
          "ui_render_ref",
          "ui_surface_ref",
          "render_input",
          "trace_id",
          "request_id"
        ]
      },
      "response_contract": {
        "business_semantics": {
          "produces": [
            "ui_render_artifact",
            "framework_lineage",
            "theme_lineage",
            "target_binding"
          ]
        },
        "required_fields": [
          "outcome_type",
          "ui_render_artifact",
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
          "theme binding missing or invalid",
          "renderer unavailable",
          "target/theme incompatibility"
        ]
      },
      "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0105#/stable_errors/execute_ui_render"
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
