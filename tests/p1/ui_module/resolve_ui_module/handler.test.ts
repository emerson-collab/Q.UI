import test from "node:test";
import assert from "node:assert/strict";
import {
  resolve_ui_module,
  UiModuleBoundaryValidationError,
  __internal,
} from "../../../../src/p1/ui_module/resolve_ui_module/handler.ts";
import {
  CAPABILITY_CONTRACT_REF,
  resolveUiModuleResponseSchema,
  stableErrorEvaluationOrder,
  stableErrorMessages,
  uiModuleTypeSchemas,
} from "../../../../src/p1/export/ui_module/contracts.ts";

const BASE_REQUEST: any = {
  "source_capability_ref": "Q.UI.CAPABILITY.TEST_SOURCE@V0126",
  "projection_ref": "Q.UI.TEST.PROJECTION@V0126",
  "projection_input": {
    "source_capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126",
    "source_capability_contract_hash": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    "source_external_provider_surface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/external_provider_surface",
    "source_external_provider_surface_hash": "sha256:2222222222222222222222222222222222222222222222222222222222222222",
    "source_capability_semantic_projection": {
      "identity": {
        "capability_ref": "Q.UI.CAPABILITY.TEST_SOURCE@V0126",
        "capability_id": "test_source",
        "capability_version": "V0126",
        "capability_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126"
      },
      "ownership": {
        "stage_contract_ref": "LOCAL_STAGE",
        "runtime_contract_ref": "LOCAL_RUNTIME"
      },
      "operations": {
        "read_item": {
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/read_item",
          "operation_id": "read_item",
          "interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/read_item_invoke"
          ]
        },
        "lookup_items": {
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/lookup_items",
          "operation_id": "lookup_items",
          "interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/lookup_items_invoke"
          ]
        },
        "edit_item": {
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/edit_item",
          "operation_id": "edit_item",
          "interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/edit_item_invoke"
          ]
        }
      },
      "interfaces": {
        "read_item_invoke": {
          "interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/read_item_invoke",
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/read_item",
          "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_request",
          "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_response",
          "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/stable_errors/default",
          "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/outcomes/default"
        },
        "lookup_items_invoke": {
          "interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/lookup_items_invoke",
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/lookup_items",
          "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_request",
          "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_response",
          "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/stable_errors/default",
          "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/outcomes/default"
        },
        "edit_item_invoke": {
          "interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/edit_item_invoke",
          "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/edit_item",
          "request_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_request",
          "response_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_response",
          "stable_error_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/stable_errors/default",
          "outcome_contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/outcomes/default"
        }
      },
      "contracts": {
        "read_item_request": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_request",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "item_id": {
                "type": "string",
                "minLength": 1,
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              }
            },
            "required": [
              "item_id"
            ]
          }
        },
        "read_item_response": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_response",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "item": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  }
                },
                "required": [
                  "id",
                  "name"
                ]
              }
            },
            "required": [
              "item"
            ]
          }
        },
        "lookup_items_request": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_request",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "query": {
                "type": "string",
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              }
            },
            "required": [
              "query"
            ]
          }
        },
        "lookup_items_response": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_response",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "items": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "id": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "id",
                    "name"
                  ]
                }
              }
            },
            "required": [
              "items"
            ]
          }
        },
        "edit_item_request": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_request",
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
              },
              "status": {
                "type": "string",
                "enum": [
                  "OPEN",
                  "CLOSED"
                ],
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "count": {
                "type": "integer",
                "minimum": 0,
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "score": {
                "type": "number",
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "enabled": {
                "type": "boolean",
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "tags": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "settings": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "mode": {
                    "type": "string",
                    "x_q_field_semantics": {
                      "semantic_kind": "PLAIN_VALUE",
                      "variability_class": "GENERAL"
                    }
                  }
                },
                "required": [
                  "mode"
                ],
                "x_q_field_semantics": {
                  "semantic_kind": "PLAIN_VALUE",
                  "variability_class": "GENERAL"
                }
              },
              "owner_id": {
                "type": "string",
                "x_q_field_semantics": {
                  "semantic_kind": "BUSINESS_REFERENCE",
                  "variability_class": "GENERAL",
                  "reference_owner_mode": "SELF",
                  "reference_owner_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126",
                  "local_dependency_ref": null,
                  "resolution_mode": "EXACT_READ",
                  "selection_cardinality": "ONE",
                  "manual_entry_allowed": false,
                  "identity_field_path": [
                    "id"
                  ],
                  "display_field_paths": [
                    [
                      "name"
                    ]
                  ],
                  "read_operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/read_item",
                  "read_interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/read_item_invoke",
                  "read_request_identity_field_path": [
                    "item_id"
                  ],
                  "read_result_object_path": [
                    "item"
                  ],
                  "lookup_operation_ref": null,
                  "lookup_interface_ref": null,
                  "lookup_request_input_template": null,
                  "lookup_result_collection_path": null
                }
              },
              "candidate_id": {
                "type": "string",
                "x_q_field_semantics": {
                  "semantic_kind": "BUSINESS_REFERENCE",
                  "variability_class": "GENERAL",
                  "reference_owner_mode": "SELF",
                  "reference_owner_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126",
                  "local_dependency_ref": null,
                  "resolution_mode": "ENUMERABLE_LOOKUP",
                  "selection_cardinality": "ONE",
                  "manual_entry_allowed": false,
                  "identity_field_path": [
                    "id"
                  ],
                  "display_field_paths": [
                    [
                      "name"
                    ]
                  ],
                  "read_operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/read_item",
                  "read_interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/read_item_invoke",
                  "read_request_identity_field_path": [
                    "item_id"
                  ],
                  "read_result_object_path": [
                    "item"
                  ],
                  "lookup_operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/lookup_items",
                  "lookup_interface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/lookup_items_invoke",
                  "lookup_request_input_template": {
                    "query": ""
                  },
                  "lookup_result_collection_path": [
                    "items"
                  ]
                }
              },
              "when": {
                "type": "string",
                "format": "date-time",
                "x_q_field_semantics": {
                  "semantic_kind": "TEMPORAL",
                  "variability_class": "GENERAL",
                  "temporal_kind": "DATE_TIME",
                  "json_schema_format": "date-time",
                  "range_start_path": null,
                  "range_end_path": null,
                  "range_endpoint_kind": null
                }
              },
              "window": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "start": {
                    "type": "string",
                    "format": "date-time",
                    "x_q_field_semantics": {
                      "semantic_kind": "TEMPORAL",
                      "variability_class": "GENERAL",
                      "temporal_kind": "DATE_TIME",
                      "json_schema_format": "date-time",
                      "range_start_path": null,
                      "range_end_path": null,
                      "range_endpoint_kind": null
                    }
                  },
                  "end": {
                    "type": "string",
                    "format": "date-time",
                    "x_q_field_semantics": {
                      "semantic_kind": "TEMPORAL",
                      "variability_class": "GENERAL",
                      "temporal_kind": "DATE_TIME",
                      "json_schema_format": "date-time",
                      "range_start_path": null,
                      "range_end_path": null,
                      "range_endpoint_kind": null
                    }
                  }
                },
                "required": [
                  "start",
                  "end"
                ],
                "x_q_field_semantics": {
                  "semantic_kind": "TEMPORAL",
                  "variability_class": "GENERAL",
                  "temporal_kind": "RANGE",
                  "json_schema_format": null,
                  "range_start_path": [
                    "start"
                  ],
                  "range_end_path": [
                    "end"
                  ],
                  "range_endpoint_kind": "DATE_TIME"
                }
              },
              "external_code": {
                "type": "string",
                "x_q_field_semantics": {
                  "semantic_kind": "BUSINESS_REFERENCE",
                  "variability_class": "GENERAL",
                  "reference_owner_mode": "EXTERNAL_OPAQUE",
                  "reference_owner_ref": null,
                  "local_dependency_ref": null,
                  "resolution_mode": "OPAQUE_MANUAL",
                  "selection_cardinality": "ONE",
                  "manual_entry_allowed": true,
                  "identity_field_path": null,
                  "display_field_paths": null,
                  "read_operation_ref": null,
                  "read_interface_ref": null,
                  "read_request_identity_field_path": null,
                  "read_result_object_path": null,
                  "lookup_operation_ref": null,
                  "lookup_interface_ref": null,
                  "lookup_request_input_template": null,
                  "lookup_result_collection_path": null
                }
              }
            },
            "required": [
              "name",
              "owner_id",
              "when"
            ]
          }
        },
        "edit_item_response": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_response",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "item": {
                "type": "object",
                "additionalProperties": true
              },
              "updated": {
                "type": "boolean"
              }
            },
            "required": [
              "item",
              "updated"
            ]
          }
        }
      },
      "type_closure": {
        "schemas": {}
      },
      "stable_errors": {
        "default": {
          "contract_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/stable_errors/default",
          "error_code_set": [],
          "errors": {}
        }
      },
      "dependencies": {},
      "extraction": {
        "external_provider_surface_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/external_provider_surface"
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
          "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/edit_item_invoke"
        ]
      },
      "interface_inventory": {
        "SPECIFICATION": {
          "specification_interface_refs": [
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/read_item_invoke",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/lookup_items_invoke",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/edit_item_invoke"
          ]
        },
        "PAYLOAD": {
          "payload_contract_refs": [
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_request",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/read_item_response",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_request",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/lookup_items_response",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_request",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/contracts/edit_item_response",
            "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/stable_errors/default"
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
            "permission_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/permission_model/operation_permission_bindings/read_item",
            "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/read_item",
            "access_mode": "UNRESTRICTED",
            "actor_class_refs": [],
            "authorization_rule_refs": [],
            "denial_stable_error_code": null
          },
          {
            "permission_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/permission_model/operation_permission_bindings/lookup_items",
            "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/lookup_items",
            "access_mode": "UNRESTRICTED",
            "actor_class_refs": [],
            "authorization_rule_refs": [],
            "denial_stable_error_code": null
          },
          {
            "permission_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/permission_model/operation_permission_bindings/edit_item",
            "operation_ref": "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/operations/edit_item",
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

function requestFixture(): any {
  return structuredClone(BASE_REQUEST);
}

async function success(request = requestFixture()) {
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "response");
  if (outcome.outcome_type !== "response") throw new Error("expected response");
  return outcome.runtime_result.ui_module_artifact;
}

test("EXACT_OPERATION_INTERFACE_BINDING", async () => {
  const artifact = await success();
  assert.deepEqual(
    artifact.semantic_model.operation_projections.map((x) => x.source_operation_ref),
    Object.values(BASE_REQUEST.projection_input.source_capability_semantic_projection.operations).map((x: any) => x.operation_ref),
  );
  assert.deepEqual(
    artifact.semantic_model.operation_projections.flatMap((x) => x.interface_projections.map((y) => y.source_interface_ref)),
    Object.values(BASE_REQUEST.projection_input.source_capability_semantic_projection.interfaces).map((x: any) => x.interface_ref),
  );
});

test("PERMISSION_BINDING:UNRESTRICTED", async () => {
  const artifact = await success();
  assert.equal(artifact.logic_projection.permissions.length, 3);
  assert.ok(artifact.logic_projection.permissions.every((x) => x.source_access_mode === "UNRESTRICTED"));
});

test("REQUEST_SCHEMA_ACCEPTANCE", async () => {
  const outcome = await resolve_ui_module(requestFixture());
  assert.equal(outcome.outcome_type, "response");
});

test("REQUEST_SCHEMA_REJECTION", async () => {
  const request = requestFixture();
  delete request.projection_ref;
  await assert.rejects(
    () => resolve_ui_module(request),
    (error: unknown) => error instanceof UiModuleBoundaryValidationError,
  );
});

test("RESPONSE_SCHEMA_ACCEPTANCE", async () => {
  const artifact = await success();
  const schemaRoot: any = { type_closure: { schemas: uiModuleTypeSchemas } };
  const errors = __internal.validateSchema(
    { ui_module_artifact: artifact },
    resolveUiModuleResponseSchema as any,
    schemaRoot,
    CAPABILITY_CONTRACT_REF,
  );
  assert.deepEqual(errors, []);
});

test("RESPONSE_SCHEMA_REJECTION", () => {
  const schemaRoot: any = { type_closure: { schemas: uiModuleTypeSchemas } };
  const errors = __internal.validateSchema(
    { ui_module_artifact: {} },
    resolveUiModuleResponseSchema as any,
    schemaRoot,
    CAPABILITY_CONTRACT_REF,
  );
  assert.ok(errors.length > 0);
});

const RULE_TESTS: Array<[string, string]> = [
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-040:POSTCONDITION",
    "Q-UI-UI_MODULE-040"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-041:POSTCONDITION",
    "Q-UI-UI_MODULE-041"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-042:POSTCONDITION",
    "Q-UI-UI_MODULE-042"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-043:PRECONDITION",
    "Q-UI-UI_MODULE-043"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-044:POSTCONDITION",
    "Q-UI-UI_MODULE-044"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-045:POSTCONDITION",
    "Q-UI-UI_MODULE-045"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-046:POSTCONDITION",
    "Q-UI-UI_MODULE-046"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-049:POSTCONDITION",
    "Q-UI-UI_MODULE-049"
  ],
  [
    "RULE_ENFORCEMENT:Q-UI-UI_MODULE-051:POSTCONDITION",
    "Q-UI-UI_MODULE-051"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-001:PRECONDITION",
    "QUI-MOD-001"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-002:PRECONDITION",
    "QUI-MOD-002"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-003:PRECONDITION",
    "QUI-MOD-003"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-004:PRECONDITION",
    "QUI-MOD-004"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-006:POSTCONDITION",
    "QUI-MOD-006"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-007:PRECONDITION",
    "QUI-MOD-007"
  ],
  [
    "RULE_ENFORCEMENT:QUI-MOD-008:PRECONDITION",
    "QUI-MOD-008"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R009:POSTCONDITION",
    "UI_MODULE.R009"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R010:POSTCONDITION",
    "UI_MODULE.R010"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R011:POSTCONDITION",
    "UI_MODULE.R011"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R012:POSTCONDITION",
    "UI_MODULE.R012"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R013:POSTCONDITION",
    "UI_MODULE.R013"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R014:POSTCONDITION",
    "UI_MODULE.R014"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R015:POSTCONDITION",
    "UI_MODULE.R015"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R016:POSTCONDITION",
    "UI_MODULE.R016"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R017:POSTCONDITION",
    "UI_MODULE.R017"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R018:POSTCONDITION",
    "UI_MODULE.R018"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R019:POSTCONDITION",
    "UI_MODULE.R019"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R020:POSTCONDITION",
    "UI_MODULE.R020"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R021:POSTCONDITION",
    "UI_MODULE.R021"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R022:POSTCONDITION",
    "UI_MODULE.R022"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R023:PRECONDITION",
    "UI_MODULE.R023"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R024:PRECONDITION",
    "UI_MODULE.R024"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R025:PRECONDITION",
    "UI_MODULE.R025"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R026:PRECONDITION",
    "UI_MODULE.R026"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R027:PRECONDITION",
    "UI_MODULE.R027"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R028:PRECONDITION",
    "UI_MODULE.R028"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R029:PRECONDITION",
    "UI_MODULE.R029"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R030:POSTCONDITION",
    "UI_MODULE.R030"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R033:PRECONDITION",
    "UI_MODULE.R033"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R034:POSTCONDITION",
    "UI_MODULE.R034"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R035:POSTCONDITION",
    "UI_MODULE.R035"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R036:POSTCONDITION",
    "UI_MODULE.R036"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R037:POSTCONDITION",
    "UI_MODULE.R037"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R038:POSTCONDITION",
    "UI_MODULE.R038"
  ],
  [
    "RULE_ENFORCEMENT:UI_MODULE.R039:PRECONDITION",
    "UI_MODULE.R039"
  ]
];

for (const [testName, ruleId] of RULE_TESTS) {
  test(testName, async () => {
    const request = requestFixture();
    const artifact = await success(request);
    const source = request.projection_input.source_capability_semantic_projection;
    assert.equal(__internal.evaluateRule(ruleId, request, source, artifact), true);
  });
}

test("STABLE_ERROR_BINDING", () => {
  const failureCodes = Object.values(__internal.ruleFailureCode);
  for (const code of failureCodes) {
    assert.equal(typeof stableErrorMessages[code], "string");
    assert.ok(stableErrorMessages[code].length > 0);
    assert.ok(stableErrorEvaluationOrder.includes(code));
  }
});

// Additional adversarial coverage derived only from the Prompt Artifact semantics.
test("adversarial: missing x_q_field_semantics fails before payload mapping", async () => {
  const request = requestFixture();
  delete request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.owner_id.x_q_field_semantics;
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE");
});

test("adversarial: top-level presentation context is forbidden", async () => {
  const request = requestFixture();
  request.projection_input.source_capability_semantic_projection.theme = { token: "forbidden" };
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_PRESENTATION_CONTEXT_INPUT_FORBIDDEN");
});

test("adversarial: undeclared dependency reference fails closed", async () => {
  const request = requestFixture();
  const sem = request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.owner_id.x_q_field_semantics;
  sem.reference_owner_mode = "DECLARED_DEPENDENCY";
  sem.reference_owner_ref = "Q.UI.CONTRACT.CAPABILITY.MISSING@V0126";
  sem.local_dependency_ref = "Q.UI.TEST.DEPENDENCY.MISSING";
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_REFERENCE_BINDING_INVALID");
});

test("adversarial: reference read interface must resolve exactly", async () => {
  const request = requestFixture();
  const sem = request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.owner_id.x_q_field_semantics;
  sem.read_interface_ref = "Q.UI.CONTRACT.CAPABILITY.TEST_SOURCE@V0126#/interfaces/missing";
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_REFERENCE_BINDING_INVALID");
});

test("adversarial: temporal scalar format mismatch fails closed", async () => {
  const request = requestFixture();
  const sem = request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.when.x_q_field_semantics;
  sem.json_schema_format = "date";
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_TEMPORAL_BINDING_INVALID");
});

test("adversarial: range endpoints must be distinct", async () => {
  const request = requestFixture();
  const sem = request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.window.x_q_field_semantics;
  sem.range_end_path = ["start"];
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_TEMPORAL_BINDING_INVALID");
});

test("adversarial: only provider-surface interface gets executable action", async () => {
  const artifact = await success();
  assert.deepEqual(
    artifact.action_bindings.map((x) => x.source_interface_ref),
    [BASE_REQUEST.projection_input.source_capability_semantic_projection.interfaces.edit_item_invoke.interface_ref],
  );
});

test("adversarial: canonical object ordering uses Unicode code points", () => {
  const bmp = "\uE000";
  const astral = "\u{10000}";
  const value: any = {};
  value[astral] = 2;
  value[bmp] = 1;
  assert.equal(__internal.canonicalJson(value), `{"${bmp}":1,"${astral}":2}`);
});

test("adversarial: identical exact input produces identical artifact hash and ref", async () => {
  const a = await success();
  const b = await success();
  assert.equal(a.content_hash, b.content_hash);
  assert.equal(a.ui_module_ref, b.ui_module_ref);
  assert.equal(a.ui_module_ref, a.content_hash);
});

test("adversarial: BUSINESS_REFERENCE preserves exact declared binding", async () => {
  const artifact = await success();
  const edit = artifact.semantic_model.operation_projections.find((x) => x.source_operation_ref.endsWith("/edit_item"));
  assert.ok(edit);
  const owner = edit.interface_projections[0].request_controls.find((x) => x.source_field_path[0] === "owner_id");
  assert.ok(owner);
  assert.equal(owner.control_kind, "REFERENCE_INPUT");
  assert.equal(owner.reference_binding?.read_interface_ref, BASE_REQUEST.projection_input.source_capability_semantic_projection.interfaces.read_item_invoke.interface_ref);
  assert.deepEqual(owner.reference_binding?.identity_field_path, ["id"]);
});

test("adversarial: TEMPORAL range preserves exact endpoint material", async () => {
  const artifact = await success();
  const edit = artifact.semantic_model.operation_projections.find((x) => x.source_operation_ref.endsWith("/edit_item"));
  assert.ok(edit);
  const window = edit.interface_projections[0].request_controls.find((x) => x.source_field_path[0] === "window");
  assert.ok(window);
  assert.equal(window.control_kind, "TEMPORAL_INPUT");
  assert.deepEqual(window.temporal_binding?.range_start_path, ["start"]);
  assert.deepEqual(window.temporal_binding?.range_end_path, ["end"]);
  assert.equal(window.temporal_binding?.range_endpoint_kind, "DATE_TIME");
});

test("adversarial: StableError semantic order is honored when multiple defects coexist", async () => {
  const request = requestFixture();
  delete request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.name.x_q_field_semantics;
  request.projection_input.source_capability_semantic_projection.theme = { forbidden: true };
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_FIELD_SEMANTIC_COVERAGE_INCOMPLETE");
});

test("adversarial: nullable single non-null JSON type is accepted", async () => {
  const request = requestFixture();
  request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.name.type = ["string", "null"];
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "response");
});

test("adversarial: ambiguous multi-non-null JSON type fails closed", async () => {
  const request = requestFixture();
  request.projection_input.source_capability_semantic_projection.contracts.edit_item_request.schema.properties.name.type = ["string", "number"];
  const outcome = await resolve_ui_module(request);
  assert.equal(outcome.outcome_type, "stable_error");
  if (outcome.outcome_type !== "stable_error") throw new Error("expected stable_error");
  assert.equal(outcome.stable_error.code, "UI_MODULE_PAYLOAD_SCHEMA_MAPPING_AMBIGUOUS");
});

test("adversarial: response view mapping covers scalar collection and structured shapes", async () => {
  const request = requestFixture();
  const props = request.projection_input.source_capability_semantic_projection.contracts.edit_item_response.schema.properties;
  props.label = { type: "string" };
  props.count = { type: "integer" };
  props.score = { type: "number" };
  props.tags = { type: "array", items: { type: "string" } };
  const artifact = await success(request);
  const edit = artifact.semantic_model.operation_projections.find((x) => x.source_operation_ref.endsWith("/edit_item"));
  assert.ok(edit);
  const views = Object.fromEntries(edit.interface_projections[0].response_views.map((v) => [v.source_field_path[0], v.view_kind]));
  assert.equal(views.item, "STRUCTURED_VIEW");
  assert.equal(views.updated, "VALUE_VIEW");
  assert.equal(views.label, "VALUE_VIEW");
  assert.equal(views.count, "VALUE_VIEW");
  assert.equal(views.score, "VALUE_VIEW");
  assert.equal(views.tags, "COLLECTION_VIEW");
});

test("adversarial: non-empty logic graph is projected losslessly", async () => {
  const request = requestFixture();
  const source = request.projection_input.source_capability_semantic_projection;
  const ref = source.identity.capability_contract_ref;
  source.dependencies = {
    catalog: {
      local_dependency_ref: `${ref}#/dependencies/catalog`,
      provider_capability_contract_ref: `${ref}#/embedded_provider`,
    },
  };
  source.operational_relations = {
    mode: "DECLARED",
    relations: [{
      relation_ref: `${ref}#/operational_relations/relations/catalog`,
      consumer_operation_ref: source.operations.edit_item.operation_ref,
      local_dependency_ref: `${ref}#/dependencies/catalog`,
      provider_capability_contract_ref: `${ref}#/embedded_provider`,
      provider_operation_ref: source.operations.read_item.operation_ref,
      provider_interface_ref: source.interfaces.read_item_invoke.interface_ref,
      connection_mode: "CALL",
      request_mapping: [],
      response_mapping: [],
      invocation_mode: "SINGLE",
      response_aggregation: "SINGLE",
    }],
    operation_dependency_bindings: [],
  };
  source.state_model = {
    mode: "STATEFUL",
    state_machines: [{
      state_machine_ref: `${ref}#/state_model/state_machines/item`,
      subject_schema_ref: source.contracts.edit_item_response.contract_ref,
      subject_identity_field_path: ["item", "id"],
      state_field_path: ["item", "status"],
      initial_state: "OPEN",
      allowed_business_states: ["OPEN", "CLOSED"],
      operation_state_bindings: [{
        operation_ref: source.operations.edit_item.operation_ref,
        availability_mode: "STATE_GUARDED",
        allowed_states: ["OPEN"],
      }],
      transitions: [{
        transition_ref: `${ref}#/state_model/state_machines/item/transitions/close`,
        operation_ref: source.operations.edit_item.operation_ref,
        from_states: ["OPEN"],
        to_state: "CLOSED",
      }],
    }],
  };
  source.permission_model = {
    mode: "DECLARED",
    actor_classes: [{
      actor_class_ref: `${ref}#/permission_model/actor_classes/editor`,
      identity_source_kind: "EXTERNAL_AUTHORITY",
      external_authority_ref: "Q.UI.AUTHORITY.TEST_EDITOR@V0126",
    }],
    operation_permission_bindings: [
      {
        permission_ref: `${ref}#/permission_model/operation_permission_bindings/read_item`,
        operation_ref: source.operations.read_item.operation_ref,
        access_mode: "UNRESTRICTED",
        actor_class_refs: [],
        authorization_rule_refs: [],
        denial_stable_error_code: null,
      },
      {
        permission_ref: `${ref}#/permission_model/operation_permission_bindings/lookup_items`,
        operation_ref: source.operations.lookup_items.operation_ref,
        access_mode: "UNRESTRICTED",
        actor_class_refs: [],
        authorization_rule_refs: [],
        denial_stable_error_code: null,
      },
      {
        permission_ref: `${ref}#/permission_model/operation_permission_bindings/edit_item`,
        operation_ref: source.operations.edit_item.operation_ref,
        access_mode: "RESTRICTED",
        actor_class_refs: [`${ref}#/permission_model/actor_classes/editor`],
        authorization_rule_refs: [`${ref}#/capability_rules/rule/ALLOW_EDITOR`],
        denial_stable_error_code: "SOURCE_DENIED",
      },
    ],
  };
  source.capability_rules = {
    rule_count: 1,
    rules: [{
      rule_id: "ALLOW_EDITOR",
      rule_ref: `${ref}#/capability_rules/rule/ALLOW_EDITOR`,
      rule_version: "V0126",
      sequence: 1,
      assertion: "Editor authorization is source-owned.",
      status: "active",
    }],
  };
  source.rule_bindings = {
    mode: "DECLARED",
    binding_count: 1,
    bindings: [{
      rule_ref: `${ref}#/capability_rules/rule/ALLOW_EDITOR`,
      enforcement_phase: "AUTHORIZATION",
      evaluation_realization_mode: "OPERATION_ENFORCED",
      target_operation_refs: [source.operations.edit_item.operation_ref],
      target_field_bindings: [],
      target_transition_refs: [],
      target_operational_relation_refs: [],
      target_permission_refs: [`${ref}#/permission_model/operation_permission_bindings/edit_item`],
      decision_operational_relation_ref: null,
      decision_consumer_binding_key: null,
      human_decision_actor_class_refs: [],
      human_decision_field_binding: null,
      human_allow_values: [],
      human_deny_values: [],
      failure_stable_error_code: "SOURCE_DENIED",
    }],
  };

  const artifact = await success(request);
  assert.equal(artifact.logic_projection.operational_relations.length, 1);
  assert.equal(artifact.logic_projection.state_machines.length, 1);
  assert.equal(artifact.logic_projection.state_transitions.length, 1);
  assert.equal(artifact.logic_projection.actor_classes.length, 1);
  assert.equal(artifact.logic_projection.permissions.length, 3);
  assert.equal(artifact.logic_projection.rule_bindings.length, 1);
  assert.deepEqual(
    artifact.logic_projection.operational_relations[0].source_relation_semantics,
    source.operational_relations.relations[0],
  );
  assert.deepEqual(
    artifact.logic_projection.rule_bindings[0].source_rule_binding_semantics,
    source.rule_bindings.bindings[0],
  );
});
