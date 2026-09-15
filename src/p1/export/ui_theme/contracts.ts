export const CAPABILITY_REF = "Q.UI.CAPABILITY.UI_THEME@V0109" as const;
export const CAPABILITY_ID = "ui_theme" as const;
export const CAPABILITY_VERSION = "V0109" as const;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109" as const;
export const CAPABILITY_CONTRACT_HASH =
  "sha256:590e487297c89b1b91a838ac97eae4d309e80db9cc1502e7bbfba55f5560536f" as const;

export const STAGE_CONTRACT_REF = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179" as const;
export const STAGE_CONTRACT_HASH =
  "sha256:e1cba02867d8defe49ab7dd8330370789c5ea1bbaf0d618c7795b86e9455bff0" as const;
export const RUNTIME_CONTRACT_REF = "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134" as const;
export const RUNTIME_CONTRACT_HASH =
  "sha256:292c0919b471bfa1f725fae2c836571cbffe2bdb0900a70d6c0bbb9e4abb2340" as const;

export const RESOLVE_UI_THEME_OPERATION_REF =
  `${CAPABILITY_CONTRACT_REF}#/operations/resolve_ui_theme` as const;
export const UI_THEME_INTERFACE_REF =
  `${CAPABILITY_CONTRACT_REF}#/interfaces/ui_theme_invoke` as const;
export const REQUEST_CONTRACT_REF =
  `${CAPABILITY_CONTRACT_REF}#/contracts/resolve_ui_theme_request_contract` as const;
export const RESPONSE_CONTRACT_REF =
  `${CAPABILITY_CONTRACT_REF}#/contracts/resolve_ui_theme_response_contract` as const;
export const STABLE_ERROR_CONTRACT_REF =
  `${CAPABILITY_CONTRACT_REF}#/stable_error_contract` as const;
export const OUTCOME_CONTRACT_REF =
  `${STAGE_CONTRACT_REF}#/outcome_contracts/call_outcome` as const;
export const EXTERNAL_PROVIDER_SURFACE_REF =
  `${CAPABILITY_CONTRACT_REF}#/external_provider_surface` as const;

export const UI_THEME_MATERIAL_SCHEMA_REF =
  `${CAPABILITY_CONTRACT_REF}#/type_closure/schemas/ui_theme_material` as const;
export const UI_THEME_SELECTOR_SCHEMA_REF =
  `${CAPABILITY_CONTRACT_REF}#/type_closure/schemas/ui_theme_selector` as const;
export const UI_THEME_ARTIFACT_SCHEMA_REF =
  `${CAPABILITY_CONTRACT_REF}#/type_closure/schemas/ui_theme_artifact` as const;

export const resolve_ui_theme_request_contract = Object.freeze({
  contract_ref: REQUEST_CONTRACT_REF,
  schema_language: "JSON_SCHEMA_DRAFT_2020_12",
  payload_boundary: "input",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      theme_selector: { $ref: UI_THEME_SELECTOR_SCHEMA_REF },
      ui_context: { type: "object", additionalProperties: true },
      ui_module_artifact_ref: { type: "string", minLength: 1 },
    },
    required: ["theme_selector"],
  },
} as const);

export const resolve_ui_theme_response_contract = Object.freeze({
  contract_ref: RESPONSE_CONTRACT_REF,
  schema_language: "JSON_SCHEMA_DRAFT_2020_12",
  payload_boundary: "runtime_result",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      ui_theme_artifact: { $ref: UI_THEME_ARTIFACT_SCHEMA_REF },
    },
    required: ["ui_theme_artifact"],
  },
} as const);

export const stable_error_contract = Object.freeze({
  contract_ref: STABLE_ERROR_CONTRACT_REF,
  carrier_field: "stable_error",
  error_code_set: [
    "UI_THEME_SELECTOR_UNRESOLVED",
    "UI_THEME_CONTEXT_INCOMPATIBLE",
  ],
  errors: {
    UI_THEME_SELECTOR_UNRESOLVED:
      "The schema-valid self-contained theme selector fails Theme identity or Theme content-integrity resolution.",
    UI_THEME_CONTEXT_INCOMPATIBLE:
      "The schema-valid resolved theme is incompatible with the declared UI context constraints.",
  },
  trigger_contract: {
    UI_THEME_SELECTOR_UNRESOLVED:
      "theme_ref/theme_version tuple mismatch OR Theme content_hash mismatch after request schema conformance",
    UI_THEME_CONTEXT_INCOMPATIBLE:
      "selector resolves successfully AND nonempty context_constraints fail the exact compatibility predicate",
  },
  payload_schema_violation_is_not_ui_theme_stable_error: true,
  business_semantic_inference_violation_is_conformance_failure_not_runtime_stable_error: true,
  unknown_error_code_forbidden: true,
} as const);

export const type_schema_projection = Object.freeze({
  ui_theme_material: {
    type: "object",
    additionalProperties: false,
    properties: {
      theme_ref: { type: "string", minLength: 3, pattern: "^.+@V[0-9]{4}$" },
      theme_version: { type: "string", pattern: "^V[0-9]{4}$" },
      presentation_rules: { type: "object", additionalProperties: true },
      content_hash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
    },
    required: ["theme_ref", "theme_version", "presentation_rules", "content_hash"],
  },
  ui_theme_selector: {
    type: "object",
    additionalProperties: false,
    properties: {
      theme_material: { $ref: UI_THEME_MATERIAL_SCHEMA_REF },
      context_constraints: { type: "object", additionalProperties: true },
    },
    required: ["theme_material"],
  },
  ui_theme_artifact: {
    type: "object",
    additionalProperties: false,
    properties: {
      theme_ref: { type: "string", minLength: 3, pattern: "^.+@V[0-9]{4}$" },
      theme_version: { type: "string", pattern: "^V[0-9]{4}$" },
      presentation_rules: { type: "object", additionalProperties: true },
      content_hash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
      resolver_capability_ref: { type: "string", const: CAPABILITY_REF },
      resolver_operation_ref: { type: "string", const: RESOLVE_UI_THEME_OPERATION_REF },
    },
    required: [
      "theme_ref",
      "theme_version",
      "presentation_rules",
      "content_hash",
      "resolver_capability_ref",
      "resolver_operation_ref",
    ],
  },
} as const);
