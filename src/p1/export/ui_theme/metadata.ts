import * as c from "./contracts.ts";

export const capability_extraction_metadata = Object.freeze({
  capability_ref: c.CAPABILITY_REF,
  capability_id: c.CAPABILITY_ID,
  capability_version: c.CAPABILITY_VERSION,
  capability_contract_ref: c.CAPABILITY_CONTRACT_REF,
  capability_contract_hash: c.CAPABILITY_CONTRACT_HASH,
  stage_contract_ref: c.STAGE_CONTRACT_REF,
  stage_contract_hash: c.STAGE_CONTRACT_HASH,
  runtime_contract_ref: c.RUNTIME_CONTRACT_REF,
  runtime_contract_hash: c.RUNTIME_CONTRACT_HASH,
  extraction_mode: "PUBLICATION_ELIGIBLE",
  external_provider_surface_ref: c.EXTERNAL_PROVIDER_SURFACE_REF,
  external_provider_surface_hash: null,
  external_provider_surface_hash_resolution: "EXTERNAL_SURFACE_AND_CLOSURE_BINDING_AFTER_IMMUTABLE_SOURCE_FINALIZATION",
  public_operation_refs: Object.freeze([
    c.REGISTER_THEME_INSTANCE_OPERATION_REF, c.LIST_THEME_INSTANCES_OPERATION_REF,
    c.SET_THEME_SELECTION_OPERATION_REF, c.RESOLVE_SELECTED_THEME_OPERATION_REF,
  ]),
  public_interface_refs: Object.freeze([
    c.THEME_INSTANCE_REGISTRATION_INTERFACE_REF, c.THEME_INSTANCE_LIST_INTERFACE_REF,
    c.THEME_SELECTION_SET_INTERFACE_REF, c.SELECTED_THEME_RESOLUTION_INTERFACE_REF,
  ]),
  public_contract_refs: Object.freeze([
    c.REGISTER_THEME_INSTANCE_REQUEST_CONTRACT_REF, c.LIST_THEME_INSTANCES_REQUEST_CONTRACT_REF,
    c.SET_THEME_SELECTION_REQUEST_CONTRACT_REF, c.RESOLVE_SELECTED_THEME_REQUEST_CONTRACT_REF,
    c.REGISTER_THEME_INSTANCE_RESPONSE_CONTRACT_REF, c.LIST_THEME_INSTANCES_RESPONSE_CONTRACT_REF,
    c.SET_THEME_SELECTION_RESPONSE_CONTRACT_REF, c.RESOLVE_SELECTED_THEME_RESPONSE_CONTRACT_REF,
    c.REGISTER_THEME_INSTANCE_STABLE_ERROR_REF, c.LIST_THEME_INSTANCES_STABLE_ERROR_REF,
    c.SET_THEME_SELECTION_STABLE_ERROR_REF, c.RESOLVE_SELECTED_THEME_STABLE_ERROR_REF,
  ]),
  public_type_refs: Object.freeze([
    c.THEME_PHASE_SCHEMA_REF, c.SKELETON_THEME_MATERIAL_SCHEMA_REF, c.RENDER_THEME_MATERIAL_SCHEMA_REF,
    c.THEME_MATERIAL_SCHEMA_REF, c.THEME_INSTANCE_RECORD_SCHEMA_REF, c.THEME_SELECTION_RECORD_SCHEMA_REF,
    c.RESOLVED_SELECTED_THEME_SCHEMA_REF,
  ]),
  public_entry_ref: "src/p1/export/ui_theme/entry.ts#entry",
  metadata_ref: "src/p1/export/ui_theme/metadata.ts#capability_extraction_metadata",
  direct_handler_export_forbidden: true,
  p1_static_extraction_only: true,
} as const);
