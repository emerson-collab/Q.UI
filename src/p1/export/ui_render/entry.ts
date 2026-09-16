import { create_p1_capability_stage_extension } from "../../business_runtime/stage_extension_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { handler as executeUiRender, OPERATION_REF as EXECUTE_UI_RENDER_REF } from "../../ui_render/execute_ui_render/handler.ts";
import { create_client } from "./client.ts";
import { capability_extraction_metadata } from "./metadata.ts";
register_business_operation(EXECUTE_UI_RENDER_REF, executeUiRender);
export const stage_extension=create_p1_capability_stage_extension({implementation_ref:"Q.UI.CAPABILITY.UI_RENDER@V0112",provided_interface_refs:["Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0112#/interfaces/ui_render_execution_invoke"]});
export const entry=Object.freeze({capability_ref:"Q.UI.CAPABILITY.UI_RENDER@V0112",capability_contract_ref:"Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0112",metadata_ref:"src/p1/export/ui_render/metadata.ts#capability_extraction_metadata",client_ref:"src/p1/export/ui_render/client.ts#create_client",stage_extension,create_client,metadata:capability_extraction_metadata});
