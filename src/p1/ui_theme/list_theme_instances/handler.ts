import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { LIST_THEME_INSTANCES_OPERATION_REF } from "../../export/ui_theme/contracts.ts";
import type { ListThemeInstancesRequest, ListThemeInstancesResponse, ThemeInstanceRecord } from "../../export/ui_theme/types.ts";
import { clone_json_value, is_json_object, require_ui_theme_persistence, schema_violation, validate_theme_instance_record, validate_theme_phase } from "../register_theme_instance/handler.ts";

const MESSAGE="The owner-local Theme Instance registry cannot be read or verified under the configured persistence realization.";
function validate_request(input: unknown): ListThemeInstancesRequest {
  const v=clone_json_value(input); if (!is_json_object(v)) schema_violation();
  const keys=Object.keys(v); if (keys.some(k=>k!=="theme_phase")) schema_violation();
  if (!("theme_phase" in v) || v.theme_phase===null) return v.theme_phase===null?{theme_phase:null}:{};
  return {theme_phase:validate_theme_phase(v.theme_phase!)};
}
function compare_codepoints(a:string,b:string):number {
  const aa=Array.from(a),bb=Array.from(b),n=Math.min(aa.length,bb.length);
  for(let i=0;i<n;i+=1){const ac=aa[i]!.codePointAt(0)!,bc=bb[i]!.codePointAt(0)!;if(ac!==bc)return ac-bc;} return aa.length-bb.length;
}
export async function handler(input: unknown): Promise<ListThemeInstancesResponse> {
  const request=validate_request(input);
  try {
    const rows=await require_ui_theme_persistence().list_theme_instances();
    const verified: ThemeInstanceRecord[] = rows.map(validate_theme_instance_record);
    const filtered=request.theme_phase===undefined||request.theme_phase===null?verified:verified.filter(x=>x.theme_phase===request.theme_phase);
    filtered.sort((a,b)=>compare_codepoints(a.theme_instance_ref,b.theme_instance_ref));
    return deep_freeze({theme_instances:filtered});
  } catch (error) {
    if (error instanceof TypeError || !(error instanceof StableRuntimeError)) throw new StableRuntimeError("UI_THEME_REGISTRY_READ_FAILED",MESSAGE,undefined,{cause:error instanceof Error?error:undefined});
    throw error;
  }
}
register_business_operation(LIST_THEME_INSTANCES_OPERATION_REF,handler);
export default handler;
