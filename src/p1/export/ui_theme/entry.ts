import { create_ui_theme_client } from "./client.ts";
import * as c from "./contracts.ts";
import { capability_extraction_metadata } from "./metadata.ts";

export { create_ui_theme_client } from "./client.ts";
export type { UIThemeClient, UIThemeInterfaceInvoker, UIThemeInterfaceRef, UIThemeRequest } from "./client.ts";
export * from "./contracts.ts";
export { capability_extraction_metadata } from "./metadata.ts";
export type * from "./types.ts";

export const entry = Object.freeze({
  capability_ref: c.CAPABILITY_REF,
  capability_contract_ref: c.CAPABILITY_CONTRACT_REF,
  capability_contract_hash: c.CAPABILITY_CONTRACT_HASH,
  interface_refs: Object.freeze([
    c.THEME_INSTANCE_REGISTRATION_INTERFACE_REF,
    c.THEME_INSTANCE_LIST_INTERFACE_REF,
    c.THEME_SELECTION_SET_INTERFACE_REF,
    c.SELECTED_THEME_RESOLUTION_INTERFACE_REF,
  ]),
  create_client: create_ui_theme_client,
  metadata: capability_extraction_metadata,
} as const);
