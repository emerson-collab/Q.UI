import { create_ui_theme_client } from "./client.ts";
import {
  CAPABILITY_CONTRACT_HASH,
  CAPABILITY_CONTRACT_REF,
  CAPABILITY_REF,
  UI_THEME_INTERFACE_REF,
} from "./contracts.ts";
import { capability_extraction_metadata } from "./metadata.ts";

export { create_ui_theme_client } from "./client.ts";
export type {
  UIThemeClient,
  UIThemeInterfaceInvoker,
} from "./client.ts";
export {
  CAPABILITY_CONTRACT_HASH,
  CAPABILITY_CONTRACT_REF,
  CAPABILITY_ID,
  CAPABILITY_REF,
  CAPABILITY_VERSION,
  EXTERNAL_PROVIDER_SURFACE_REF,
  OUTCOME_CONTRACT_REF,
  REQUEST_CONTRACT_REF,
  RESOLVE_UI_THEME_OPERATION_REF,
  RESPONSE_CONTRACT_REF,
  RUNTIME_CONTRACT_HASH,
  RUNTIME_CONTRACT_REF,
  STABLE_ERROR_CONTRACT_REF,
  STAGE_CONTRACT_HASH,
  STAGE_CONTRACT_REF,
  UI_THEME_ARTIFACT_SCHEMA_REF,
  UI_THEME_INTERFACE_REF,
  UI_THEME_MATERIAL_SCHEMA_REF,
  UI_THEME_SELECTOR_SCHEMA_REF,
  resolve_ui_theme_request_contract,
  resolve_ui_theme_response_contract,
  stable_error_contract,
  type_schema_projection,
} from "./contracts.ts";
export { capability_extraction_metadata } from "./metadata.ts";
export type {
  JsonObject,
  JsonPrimitive,
  JsonValue,
  ResolveUIThemeRequest,
  ResolveUIThemeResponse,
  UIThemeArtifact,
  UIThemeMaterial,
  UIThemeSelector,
  UIThemeStableError,
  UIThemeStableErrorCode,
} from "./types.ts";

export const entry = Object.freeze({
  capability_ref: CAPABILITY_REF,
  capability_contract_ref: CAPABILITY_CONTRACT_REF,
  capability_contract_hash: CAPABILITY_CONTRACT_HASH,
  interface_refs: Object.freeze([UI_THEME_INTERFACE_REF]),
  create_client: create_ui_theme_client,
  metadata: capability_extraction_metadata,
} as const);
