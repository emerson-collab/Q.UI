export const CAPABILITY_REF = "Q.UI.CAPABILITY.UI_THEME@V0118" as const;
export const CAPABILITY_ID = "ui_theme" as const;
export const CAPABILITY_VERSION = "V0118" as const;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118" as const;
export const CAPABILITY_CONTRACT_HASH = "sha256:2b8026d0b6d42c3854725a98855edec0da06eaf6191cb2438ea6c32b5055c337" as const;
export const STAGE_CONTRACT_REF = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0183" as const;
export const STAGE_CONTRACT_HASH = "sha256:2e8356492cf8c04c84c5f188d69ee2387395a84bcb59f739c1e60b7a3ff90530" as const;
export const RUNTIME_CONTRACT_REF = "Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134" as const;
export const RUNTIME_CONTRACT_HASH = "sha256:292c0919b471bfa1f725fae2c836571cbffe2bdb0900a70d6c0bbb9e4abb2340" as const;

export const REGISTER_THEME_INSTANCE_OPERATION_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/operations/register_theme_instance" as const;
export const LIST_THEME_INSTANCES_OPERATION_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/operations/list_theme_instances" as const;
export const SET_THEME_SELECTION_OPERATION_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/operations/set_theme_selection" as const;
export const RESOLVE_SELECTED_THEME_OPERATION_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/operations/resolve_selected_theme" as const;

export const THEME_INSTANCE_REGISTRATION_INTERFACE_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/interfaces/theme_instance_registration_invoke" as const;
export const THEME_INSTANCE_LIST_INTERFACE_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/interfaces/theme_instance_list_invoke" as const;
export const THEME_SELECTION_SET_INTERFACE_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/interfaces/theme_selection_set_invoke" as const;
export const SELECTED_THEME_RESOLUTION_INTERFACE_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/interfaces/selected_theme_resolution_invoke" as const;

export const REGISTER_THEME_INSTANCE_REQUEST_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/register_theme_instance_request_contract" as const;
export const REGISTER_THEME_INSTANCE_RESPONSE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/register_theme_instance_response_contract" as const;
export const LIST_THEME_INSTANCES_REQUEST_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/list_theme_instances_request_contract" as const;
export const LIST_THEME_INSTANCES_RESPONSE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/list_theme_instances_response_contract" as const;
export const SET_THEME_SELECTION_REQUEST_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/set_theme_selection_request_contract" as const;
export const SET_THEME_SELECTION_RESPONSE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/set_theme_selection_response_contract" as const;
export const RESOLVE_SELECTED_THEME_REQUEST_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/resolve_selected_theme_request_contract" as const;
export const RESOLVE_SELECTED_THEME_RESPONSE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/contracts/resolve_selected_theme_response_contract" as const;

export const REGISTER_THEME_INSTANCE_STABLE_ERROR_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/stable_errors/register_theme_instance" as const;
export const LIST_THEME_INSTANCES_STABLE_ERROR_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/stable_errors/list_theme_instances" as const;
export const SET_THEME_SELECTION_STABLE_ERROR_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/stable_errors/set_theme_selection" as const;
export const RESOLVE_SELECTED_THEME_STABLE_ERROR_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/stable_errors/resolve_selected_theme" as const;

export const THEME_PHASE_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/theme_phase" as const;
export const SKELETON_THEME_MATERIAL_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/skeleton_theme_material" as const;
export const RENDER_THEME_MATERIAL_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/render_theme_material" as const;
export const THEME_MATERIAL_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/theme_material" as const;
export const THEME_INSTANCE_RECORD_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/theme_instance_record" as const;
export const THEME_SELECTION_RECORD_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/theme_selection_record" as const;
export const RESOLVED_SELECTED_THEME_SCHEMA_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/type_closure/schemas/resolved_selected_theme" as const;
export const EXTERNAL_PROVIDER_SURFACE_REF = "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118#/external_provider_surface" as const;
export const OUTCOME_CONTRACT_REF = "Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0183#/outcome_contracts/call_outcome" as const;

const plain = Object.freeze({ semantic_kind: "PLAIN_VALUE", variability_class: "GENERAL" } as const);
const obj = Object.freeze({ type: "object", additionalProperties: true } as const);

export const type_schema_projection = Object.freeze({
  theme_phase: { type: "string", enum: ["SKELETON", "RENDER"] },
  skeleton_theme_material: {
    type: "object", additionalProperties: false,
    properties: {
      material_kind: { const: "SKELETON" }, role_presentation: obj, navigation_treatment: obj,
      arrangement_treatment: obj, grouping_treatment: obj, progressive_disclosure_treatment: obj,
      responsive_treatment: obj, density_treatment: obj, interaction_presentation_treatment: obj,
    },
    required: ["material_kind","role_presentation","navigation_treatment","arrangement_treatment","grouping_treatment","progressive_disclosure_treatment","responsive_treatment","density_treatment","interaction_presentation_treatment"],
  },
  render_theme_material: {
    type: "object", additionalProperties: false,
    properties: {
      material_kind: { const: "RENDER" }, color: obj, typography: obj, spacing: obj, radius_and_shape: obj,
      border_and_elevation: obj, iconography_appearance: obj, visual_density: obj, surface_appearance: obj,
      component_appearance: obj, visual_motion_treatment: obj, appearance_variants: obj,
      accessibility_visual_requirements: obj,
    },
    required: ["material_kind","color","typography","spacing","radius_and_shape","border_and_elevation","iconography_appearance","visual_density","surface_appearance","component_appearance","visual_motion_treatment","appearance_variants","accessibility_visual_requirements"],
  },
  theme_material: { oneOf: [{ $ref: SKELETON_THEME_MATERIAL_SCHEMA_REF }, { $ref: RENDER_THEME_MATERIAL_SCHEMA_REF }] },
  theme_instance_record: {
    type: "object", additionalProperties: false,
    properties: {
      instance_id: { type: "string", minLength: 1 }, instance_version: { type: "string", minLength: 1 },
      theme_instance_ref: { type: "string", minLength: 1 }, theme_phase: { $ref: THEME_PHASE_SCHEMA_REF },
      theme_name: { type: "string", minLength: 1 }, theme_material: { $ref: THEME_MATERIAL_SCHEMA_REF },
      content_hash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
    },
    required: ["instance_id","instance_version","theme_instance_ref","theme_phase","theme_name","theme_material","content_hash"],
  },
  theme_selection_record: {
    type: "object", additionalProperties: false,
    properties: {
      subject_ref: { type: "string", minLength: 1 }, theme_phase: { $ref: THEME_PHASE_SCHEMA_REF },
      selected_theme_instance_ref: { type: "string", minLength: 1 },
      selected_theme_instance_hash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
      selection_source: { const: "MANUAL" }, selection_hash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
    },
    required: ["subject_ref","theme_phase","selected_theme_instance_ref","selected_theme_instance_hash","selection_source","selection_hash"],
  },
  resolved_selected_theme: {
    type: "object", additionalProperties: false,
    properties: { selection: { $ref: THEME_SELECTION_RECORD_SCHEMA_REF }, theme_instance: { $ref: THEME_INSTANCE_RECORD_SCHEMA_REF } },
    required: ["selection","theme_instance"],
  },
} as const);

export const request_contracts = Object.freeze({
  register_theme_instance: {
    contract_ref: REGISTER_THEME_INSTANCE_REQUEST_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "input",
    schema: { type: "object", additionalProperties: false, properties: {
      instance_id: { type: "string", minLength: 1, x_q_field_semantics: plain },
      instance_version: { type: "string", minLength: 1, x_q_field_semantics: plain },
      theme_instance_ref: { type: "string", minLength: 1, x_q_field_semantics: plain },
      theme_phase: { $ref: THEME_PHASE_SCHEMA_REF, x_q_field_semantics: plain },
      theme_name: { type: "string", minLength: 1, x_q_field_semantics: plain },
      theme_material: { $ref: THEME_MATERIAL_SCHEMA_REF, x_q_field_semantics: plain },
    }, required: ["instance_id","instance_version","theme_instance_ref","theme_phase","theme_name","theme_material"] },
  },
  list_theme_instances: {
    contract_ref: LIST_THEME_INSTANCES_REQUEST_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "input",
    schema: { type: "object", additionalProperties: false, properties: { theme_phase: { oneOf: [{type:"null"},{ $ref: THEME_PHASE_SCHEMA_REF }], x_q_field_semantics: plain } }, required: [] },
  },
  set_theme_selection: {
    contract_ref: SET_THEME_SELECTION_REQUEST_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "input",
    schema: { type: "object", additionalProperties: false, properties: {
      subject_ref: { type: "string", minLength: 1, x_q_field_semantics: plain },
      theme_phase: { $ref: THEME_PHASE_SCHEMA_REF, x_q_field_semantics: plain },
      selected_theme_instance_ref: { type: "string", minLength: 1, x_q_field_semantics: plain },
    }, required: ["subject_ref","theme_phase","selected_theme_instance_ref"] },
  },
  resolve_selected_theme: {
    contract_ref: RESOLVE_SELECTED_THEME_REQUEST_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "input",
    schema: { type: "object", additionalProperties: false, properties: {
      subject_ref: { type: "string", minLength: 1, x_q_field_semantics: plain }, theme_phase: { $ref: THEME_PHASE_SCHEMA_REF, x_q_field_semantics: plain },
    }, required: ["subject_ref","theme_phase"] },
  },
} as const);

export const response_contracts = Object.freeze({
  register_theme_instance: { contract_ref: REGISTER_THEME_INSTANCE_RESPONSE_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "runtime_result", schema: { type:"object",additionalProperties:false,properties:{theme_instance:{$ref:THEME_INSTANCE_RECORD_SCHEMA_REF}},required:["theme_instance"] } },
  list_theme_instances: { contract_ref: LIST_THEME_INSTANCES_RESPONSE_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "runtime_result", schema: { type:"object",additionalProperties:false,properties:{theme_instances:{type:"array",items:{$ref:THEME_INSTANCE_RECORD_SCHEMA_REF},minItems:0}},required:["theme_instances"] } },
  set_theme_selection: { contract_ref: SET_THEME_SELECTION_RESPONSE_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "runtime_result", schema: { type:"object",additionalProperties:false,properties:{theme_selection:{$ref:THEME_SELECTION_RECORD_SCHEMA_REF}},required:["theme_selection"] } },
  resolve_selected_theme: { contract_ref: RESOLVE_SELECTED_THEME_RESPONSE_CONTRACT_REF, schema_language: "JSON_SCHEMA_DRAFT_2020_12", payload_boundary: "runtime_result", schema: { type:"object",additionalProperties:false,properties:{resolved_theme:{$ref:RESOLVED_SELECTED_THEME_SCHEMA_REF}},required:["resolved_theme"] } },
} as const);

export const stable_error_contracts = Object.freeze({
  register_theme_instance: { contract_ref: REGISTER_THEME_INSTANCE_STABLE_ERROR_REF, error_code_set: ["UI_THEME_INSTANCE_PHASE_MATERIAL_MISMATCH","UI_THEME_INSTANCE_REF_CONFLICT","UI_THEME_INSTANCE_IDENTITY_CONFLICT"] },
  list_theme_instances: { contract_ref: LIST_THEME_INSTANCES_STABLE_ERROR_REF, error_code_set: ["UI_THEME_REGISTRY_READ_FAILED"] },
  set_theme_selection: { contract_ref: SET_THEME_SELECTION_STABLE_ERROR_REF, error_code_set: ["UI_THEME_INSTANCE_NOT_FOUND","UI_THEME_SELECTION_PHASE_MISMATCH"] },
  resolve_selected_theme: { contract_ref: RESOLVE_SELECTED_THEME_STABLE_ERROR_REF, error_code_set: ["UI_THEME_SELECTION_UNRESOLVED","UI_THEME_SELECTED_INSTANCE_UNRESOLVED"] },
} as const);
