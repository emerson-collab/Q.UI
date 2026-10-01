import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { SET_THEME_SELECTION_OPERATION_REF } from "../../export/ui_theme/contracts.ts";
import type { SetThemeSelectionRequest, SetThemeSelectionResponse, ThemeSelectionRecord } from "../../export/ui_theme/types.ts";
import { clone_json_value, is_json_object, require_ui_theme_persistence, schema_violation, theme_selection_hash, validate_theme_instance_record, validate_theme_phase } from "../register_theme_instance/handler.ts";

const NOT_FOUND="The selected Theme Instance ref does not resolve to one exact registered Theme Instance.";
const PHASE="The selected Theme Instance phase does not equal the requested Theme Selection phase.";
function validate_request(input: unknown): SetThemeSelectionRequest {
  const v=clone_json_value(input); if (!is_json_object(v)) schema_violation();
  const required=["subject_ref","theme_phase","selected_theme_instance_ref"];
  if (Object.keys(v).some(k=>!required.includes(k)) || required.some(k=>!(k in v))) schema_violation();
  if (typeof v.subject_ref!=="string"||v.subject_ref.length<1||typeof v.selected_theme_instance_ref!=="string"||v.selected_theme_instance_ref.length<1) schema_violation();
  return {subject_ref:v.subject_ref,theme_phase:validate_theme_phase(v.theme_phase!),selected_theme_instance_ref:v.selected_theme_instance_ref};
}
export async function handler(input: unknown): Promise<SetThemeSelectionResponse> {
  const request=validate_request(input), store=require_ui_theme_persistence();
  const raw=await store.get_theme_instance_by_ref(request.selected_theme_instance_ref);
  if (raw===null) throw new StableRuntimeError("UI_THEME_INSTANCE_NOT_FOUND",NOT_FOUND);
  let instance;
  try { instance=validate_theme_instance_record(raw); } catch { throw new StableRuntimeError("UI_THEME_INSTANCE_NOT_FOUND",NOT_FOUND); }
  if (instance.theme_phase!==request.theme_phase) throw new StableRuntimeError("UI_THEME_SELECTION_PHASE_MISMATCH",PHASE);
  const partial={subject_ref:request.subject_ref,theme_phase:request.theme_phase,selected_theme_instance_ref:instance.theme_instance_ref,selected_theme_instance_hash:instance.content_hash,selection_source:"MANUAL" as const};
  const selection=deep_freeze({...partial,selection_hash:theme_selection_hash(partial)} satisfies ThemeSelectionRecord);
  await store.set_theme_selection(selection);
  return deep_freeze({theme_selection:selection});
}
register_business_operation(SET_THEME_SELECTION_OPERATION_REF,handler);
export default handler;
