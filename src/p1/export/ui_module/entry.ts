import { create_p1_capability_stage_extension } from "../../business_runtime/stage_extension_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { handler as resolveUiModule, OPERATION_REF as RESOLVE_UI_MODULE_REF } from "../../ui_module/resolve_ui_module/handler.ts";
import { create_client } from "./client.ts";
import { capability_extraction_metadata } from "./metadata.ts";

register_business_operation(RESOLVE_UI_MODULE_REF, resolveUiModule);

export const stage_extension = create_p1_capability_stage_extension({
  implementation_ref: "Q.UI.CAPABILITY.UI_MODULE@V0122",
  provided_interface_refs: [
    "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0122#/interfaces/ui_module_resolution_invoke",
  ],
});

export const entry = Object.freeze({
  capability_ref: "Q.UI.CAPABILITY.UI_MODULE@V0122",
  capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_MODULE@V0122",
  metadata_ref: "src/p1/export/ui_module/metadata.ts#capability_extraction_metadata",
  client_ref: "src/p1/export/ui_module/client.ts#create_client",
  stage_extension,
  create_client,
  metadata: capability_extraction_metadata,
});
