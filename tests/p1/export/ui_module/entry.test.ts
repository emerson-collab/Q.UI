import test from "node:test";
import assert from "node:assert/strict";
import { entry } from "../../../../src/p1/export/ui_module/entry.ts";
import { capability_extraction_metadata } from "../../../../src/p1/export/ui_module/metadata.ts";

const REQUEST: any = {
  "source_capability_ref": "Q.UI.CAPABILITY.PUBLIC_TEST@V0126",
  "projection_ref": "Q.UI.PUBLIC.TEST.PROJECTION@V0126",
  "projection_input": {
    "source_capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126",
    "source_capability_contract_hash": "sha256:3333333333333333333333333333333333333333333333333333333333333333",
    "source_external_provider_surface_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/external_provider_surface",
    "source_external_provider_surface_hash": "sha256:4444444444444444444444444444444444444444444444444444444444444444",
    "source_capability_semantic_projection": {
      "identity": {
        "capability_ref": "Q.UI.CAPABILITY.PUBLIC_TEST@V0126",
        "capability_id": "public_test",
        "capability_version": "V0126",
        "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126"
      },
      "ownership": {
        "stage_contract_ref": "LOCAL_STAGE",
        "runtime_contract_ref": "LOCAL_RUNTIME"
      },
      "operations": {
        "run": {
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/operations/run",
          "operation_id": "run",
          "interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/interfaces/run_invoke"
          ]
        }
      },
      "interfaces": {
        "run_invoke": {
          "interface_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/interfaces/run_invoke",
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/operations/run",
          "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_request",
          "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_response",
          "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/stable_errors/default",
          "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/outcomes/default"
        }
      },
      "contracts": {
        "run_request": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_request",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              }
            },
            "required": [
              "name"
            ]
          }
        },
        "run_response": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_response",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "ok": {
                "type": "boolean"
              }
            },
            "required": [
              "ok"
            ]
          }
        }
      },
      "type_closure": {
        "schemas": {}
      },
      "stable_errors": {
        "default": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/stable_errors/default",
          "error_code_set": [],
          "errors": {}
        }
      },
      "dependencies": {},
      "extraction": {
        "external_provider_surface_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/external_provider_surface"
      },
      "compatibility": {},
      "source_integrity": {},
      "persistence_requirements": {},
      "capability_rules": {
        "rule_count": 0,
        "rules": []
      },
      "external_provider_surface": {
        "mode": "PUBLICATION_ELIGIBLE",
        "provider_interface_refs": [
          "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/interfaces/run_invoke"
        ]
      },
      "interface_inventory": {
        "SPECIFICATION": {
          "specification_interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/interfaces/run_invoke"
          ]
        },
        "PAYLOAD": {
          "payload_contract_refs": [
            "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_request",
            "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/contracts/run_response",
            "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/stable_errors/default"
          ]
        },
        "INTERNAL": {
          "internal_interface_refs": []
        }
      },
      "operational_relations": {
        "mode": "NONE",
        "relations": [],
        "operation_dependency_bindings": []
      },
      "state_model": {
        "mode": "STATELESS",
        "state_machines": []
      },
      "permission_model": {
        "mode": "UNRESTRICTED",
        "actor_classes": [],
        "operation_permission_bindings": [
          {
            "permission_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/permission_model/operation_permission_bindings/run",
            "operation_ref": "Q.UI.CONTRACT.CAPABILITY.PUBLIC_TEST@V0126#/operations/run",
            "access_mode": "UNRESTRICTED",
            "actor_class_refs": [],
            "authorization_rule_refs": [],
            "denial_stable_error_code": null
          }
        ]
      },
      "rule_bindings": {
        "mode": "DECLARED",
        "binding_count": 0,
        "bindings": []
      },
      "instance_variability": {
        "mode": "NONE",
        "instance_variables": []
      }
    }
  }
};

test("PUBLIC_EXPORT_EXECUTABLE_SURFACE", async () => {
  const outcome = await entry(structuredClone(REQUEST));
  assert.equal(outcome.outcome_type, "response");
});

test("PUBLIC_EXPORT_EXACT_REF_BINDING", () => {
  assert.equal(typeof entry, "function");
  assert.equal(capability_extraction_metadata.public_entry_ref, "src/p1/export/ui_module/entry.ts#entry");
});
