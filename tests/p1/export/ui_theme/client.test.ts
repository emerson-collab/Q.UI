import assert from "node:assert/strict";
import test from "node:test";
import { create_ui_theme_client } from "../../../../src/p1/export/ui_theme/client.ts";
import * as c from "../../../../src/p1/export/ui_theme/contracts.ts";

test("client invokes exactly the four declared provider interfaces",async()=>{
  const seen:string[]=[]; const client=create_ui_theme_client(async(ref)=>{seen.push(ref);return {ok:true};});
  const sk={material_kind:"SKELETON",role_presentation:{},navigation_treatment:{},arrangement_treatment:{},grouping_treatment:{},progressive_disclosure_treatment:{},responsive_treatment:{},density_treatment:{},interaction_presentation_treatment:{}} as const;
  await client.register_theme_instance({instance_id:"a",instance_version:"V1",theme_instance_ref:"r",theme_phase:"SKELETON",theme_name:"A",theme_material:sk});
  await client.list_theme_instances({});
  await client.set_theme_selection({subject_ref:"s",theme_phase:"SKELETON",selected_theme_instance_ref:"r"});
  await client.resolve_selected_theme({subject_ref:"s",theme_phase:"SKELETON"});
  assert.deepEqual(seen,[c.THEME_INSTANCE_REGISTRATION_INTERFACE_REF,c.THEME_INSTANCE_LIST_INTERFACE_REF,c.THEME_SELECTION_SET_INTERFACE_REF,c.SELECTED_THEME_RESOLUTION_INTERFACE_REF]);
});
