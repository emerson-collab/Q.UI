import { create_p1_capability_stage_extension } from "../../business_runtime/stage_extension_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { handler as produceApp, OPERATION_REF as PRODUCE_APP_REF } from "../../ui_producer/produce_app/handler.ts";
import { handler as producePlatform, OPERATION_REF as PRODUCE_PLATFORM_REF } from "../../ui_producer/produce_platform/handler.ts";
import { create_client } from "./client.ts";
import { capability_extraction_metadata } from "./metadata.ts";

register_business_operation(PRODUCE_APP_REF, produceApp);
register_business_operation(PRODUCE_PLATFORM_REF, producePlatform);

export const stage_extension = create_p1_capability_stage_extension({
  implementation_ref: "Q.UI.CAPABILITY.UI_PRODUCER@V0107",
  provided_interface_refs: [
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_app_invoke",
    "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/interfaces/produce_platform_invoke",
  ],
});

export const entry = Object.freeze({
  capability_ref: "Q.UI.CAPABILITY.UI_PRODUCER@V0107",
  capability_contract_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107",
  metadata_ref: "src/p1/export/ui_producer/metadata.ts#capability_extraction_metadata",
  client_ref: "src/p1/export/ui_producer/client.ts#create_client",
  stage_extension,
  create_client,
  metadata: capability_extraction_metadata,
});
