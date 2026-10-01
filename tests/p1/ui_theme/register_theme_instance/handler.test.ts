import assert from "node:assert/strict";
import test from "node:test";
import { registered_business_operation_refs, resolve_business_operation } from "../../../../src/p1/business_runtime/business_operation_registry.ts";
import { REGISTER_THEME_INSTANCE_OPERATION_REF } from "../../../../src/p1/export/ui_theme/contracts.ts";
import type { ThemeInstanceRecord,ThemeSelectionRecord,ThemePhase } from "../../../../src/p1/export/ui_theme/types.ts";
import { handler,install_ui_theme_persistence,type UIThemePersistence,type ThemeInstanceRegistrationResult } from "../../../../src/p1/ui_theme/register_theme_instance/handler.ts";

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
const store=new Store();install_ui_theme_persistence(store);
test.beforeEach(()=>store.reset());
test("register operation is exact-bound",()=>{assert.ok(registered_business_operation_refs().includes(REGISTER_THEME_INSTANCE_OPERATION_REF));assert.equal(resolve_business_operation(REGISTER_THEME_INSTANCE_OPERATION_REF),handler);});
test("register creates immutable exact identity record and is idempotent",async()=>{const input={instance_id:"github-light-skeleton",instance_version:"V0100",theme_instance_ref:"app.github-like.skeleton.v1",theme_phase:"SKELETON" as const,theme_name:"GitHub-like",theme_material:skeletonMaterial};const a=await handler(input),b=await handler(input);assert.deepEqual(a,b);assert.match(a.theme_instance.content_hash,/^sha256:/);assert.equal(Object.isFrozen(a.theme_instance),true);});
test("phase mismatch is stable error",async()=>{await assert.rejects(()=>handler({instance_id:"x",instance_version:"V0100",theme_instance_ref:"x",theme_phase:"RENDER",theme_name:"x",theme_material:skeletonMaterial}),e=>(e as any).code==="UI_THEME_INSTANCE_PHASE_MATERIAL_MISMATCH");});
test("same ref different content fails closed",async()=>{const base={instance_id:"x",instance_version:"V0100",theme_instance_ref:"ref",theme_phase:"SKELETON" as const,theme_name:"A",theme_material:skeletonMaterial};await handler(base);await assert.rejects(()=>handler({...base,theme_name:"B"}),e=>(e as any).code==="UI_THEME_INSTANCE_REF_CONFLICT");});
test("same identity different ref fails closed",async()=>{await handler({instance_id:"x",instance_version:"V0100",theme_instance_ref:"ref-a",theme_phase:"SKELETON",theme_name:"A",theme_material:skeletonMaterial});await assert.rejects(()=>handler({instance_id:"x",instance_version:"V0100",theme_instance_ref:"ref-b",theme_phase:"SKELETON",theme_name:"A",theme_material:skeletonMaterial}),e=>(e as any).code==="UI_THEME_INSTANCE_IDENTITY_CONFLICT");});
test("request schema rejects missing and extra fields",async()=>{await assert.rejects(()=>handler({}),TypeError);await assert.rejects(()=>handler({instance_id:"x",instance_version:"V0100",theme_instance_ref:"r",theme_phase:"SKELETON",theme_name:"x",theme_material:skeletonMaterial,extra:true}),TypeError);});
