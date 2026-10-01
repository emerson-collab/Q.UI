import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";
import { register_business_operation } from "../../business_runtime/business_operation_registry.ts";
import { RESOLVE_SELECTED_THEME_OPERATION_REF } from "../../export/ui_theme/contracts.ts";
import type { ResolveSelectedThemeRequest, ResolveSelectedThemeResponse } from "../../export/ui_theme/types.ts";
import { clone_json_value, is_json_object, require_ui_theme_persistence, schema_violation, validate_theme_instance_record, validate_theme_phase, validate_theme_selection_record } from "../register_theme_instance/handler.ts";

const NO_SELECTION="No manual Theme Selection exists for the exact subject_ref and theme_phase key.";
const BAD_INSTANCE="The stored Theme Selection points to a Theme Instance whose exact ref/hash cannot be resolved and verified.";
function validate_request(input: unknown): ResolveSelectedThemeRequest {
  const v=clone_json_value(input); if (!is_json_object(v)) schema_violation();
  const required=["subject_ref","theme_phase"];
  if (Object.keys(v).some(k=>!required.includes(k)) || required.some(k=>!(k in v))) schema_violation();
  if (typeof v.subject_ref!=="string"||v.subject_ref.length<1) schema_violation();
  return {subject_ref:v.subject_ref,theme_phase:validate_theme_phase(v.theme_phase!)};
}
export async function handler(input: unknown): Promise<ResolveSelectedThemeResponse> {
  const request=validate_request(input), store=require_ui_theme_persistence();
  const rawSelection=await store.get_theme_selection(request.subject_ref,request.theme_phase);
  if (rawSelection===null) throw new StableRuntimeError("UI_THEME_SELECTION_UNRESOLVED",NO_SELECTION);
  let selection;
  try { selection=validate_theme_selection_record(rawSelection); } catch { throw new StableRuntimeError("UI_THEME_SELECTION_UNRESOLVED",NO_SELECTION); }
  if (selection.subject_ref!==request.subject_ref||selection.theme_phase!==request.theme_phase) throw new StableRuntimeError("UI_THEME_SELECTION_UNRESOLVED",NO_SELECTION);
  const rawInstance=await store.get_theme_instance_by_ref(selection.selected_theme_instance_ref);
  if (rawInstance===null) throw new StableRuntimeError("UI_THEME_SELECTED_INSTANCE_UNRESOLVED",BAD_INSTANCE);
  let instance;
  try { instance=validate_theme_instance_record(rawInstance); } catch { throw new StableRuntimeError("UI_THEME_SELECTED_INSTANCE_UNRESOLVED",BAD_INSTANCE); }
  if (instance.content_hash!==selection.selected_theme_instance_hash||instance.theme_phase!==selection.theme_phase) throw new StableRuntimeError("UI_THEME_SELECTED_INSTANCE_UNRESOLVED",BAD_INSTANCE);
  return deep_freeze({resolved_theme:{selection,theme_instance:instance}});
}
register_business_operation(RESOLVE_SELECTED_THEME_OPERATION_REF,handler);
export default handler;
