import assert from "node:assert/strict";
import test from "node:test";
import type { ThemeInstanceRecord,ThemeSelectionRecord,ThemePhase } from "../../../../src/p1/export/ui_theme/types.ts";
import { install_ui_theme_persistence,type UIThemePersistence,type ThemeInstanceRegistrationResult } from "../../../../src/p1/ui_theme/register_theme_instance/handler.ts";
import { handler as register } from "../../../../src/p1/ui_theme/register_theme_instance/handler.ts";
import { handler } from "../../../../src/p1/ui_theme/set_theme_selection/handler.ts";

class Store implements UIThemePersistence {
  readonly byRef=new Map<string,ThemeInstanceRecord>(); readonly byId=new Map<string,ThemeInstanceRecord>(); readonly selections=new Map<string,ThemeSelectionRecord>(); failList=false;
  reset(){this.byRef.clear();this.byId.clear();this.selections.clear();this.failList=false;}
  async register_theme_instance(record: ThemeInstanceRecord): Promise<ThemeInstanceRegistrationResult> {
    const byRef=this.byRef.get(record.theme_instance_ref), key=record.instance_id+"\u0000"+record.instance_version, byId=this.byId.get(key);
    if(byRef){if(byRef.instance_id===record.instance_id&&byRef.instance_version===record.instance_version&&byRef.content_hash===record.content_hash)return {kind:"EXISTING",record:byRef};return {kind:"REF_CONFLICT",record:byRef};}
    if(byId){if(byId.theme_instance_ref===record.theme_instance_ref&&byId.content_hash===record.content_hash)return {kind:"EXISTING",record:byId};return {kind:"IDENTITY_CONFLICT",record:byId};}
    this.byRef.set(record.theme_instance_ref,record);this.byId.set(key,record);return {kind:"REGISTERED",record};
  }
  async list_theme_instances(){if(this.failList)throw new Error("db");return [...this.byRef.values()];}
  async get_theme_instance_by_ref(ref:string){return this.byRef.get(ref)??null;}
  async set_theme_selection(s:ThemeSelectionRecord){this.selections.set(s.subject_ref+"\u0000"+s.theme_phase,s);}
  async get_theme_selection(subject:string,phase:ThemePhase){return this.selections.get(subject+"\u0000"+phase)??null;}
}

const skeletonMaterial = {material_kind:"SKELETON",role_presentation:{},navigation_treatment:{},arrangement_treatment:{},grouping_treatment:{},progressive_disclosure_treatment:{},responsive_treatment:{},density_treatment:{},interaction_presentation_treatment:{}} as const;
const store=new Store();install_ui_theme_persistence(store);test.beforeEach(()=>store.reset());
test("set persists exact MANUAL selection key and selected ref/hash",async()=>{const reg=await register({instance_id:"a",instance_version:"V1",theme_instance_ref:"ref",theme_phase:"SKELETON",theme_name:"A",theme_material:skeletonMaterial});const out=await handler({subject_ref:"app:1",theme_phase:"SKELETON",selected_theme_instance_ref:"ref"});assert.equal(out.theme_selection.selection_source,"MANUAL");assert.equal(out.theme_selection.selected_theme_instance_hash,reg.theme_instance.content_hash);assert.deepEqual(await store.get_theme_selection("app:1","SKELETON"),out.theme_selection);});
test("missing instance and phase mismatch produce exact stable errors",async()=>{await assert.rejects(()=>handler({subject_ref:"a",theme_phase:"SKELETON",selected_theme_instance_ref:"missing"}),e=>(e as any).code==="UI_THEME_INSTANCE_NOT_FOUND");await register({instance_id:"a",instance_version:"V1",theme_instance_ref:"ref",theme_phase:"SKELETON",theme_name:"A",theme_material:skeletonMaterial});await assert.rejects(()=>handler({subject_ref:"a",theme_phase:"RENDER",selected_theme_instance_ref:"ref"}),e=>(e as any).code==="UI_THEME_SELECTION_PHASE_MISMATCH");});
test("request schema rejects extra fields",async()=>{await assert.rejects(()=>handler({subject_ref:"a",theme_phase:"SKELETON",selected_theme_instance_ref:"r",extra:true}),TypeError);});
