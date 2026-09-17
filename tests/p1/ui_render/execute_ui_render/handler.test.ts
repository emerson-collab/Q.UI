import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { handler } from "../../../../src/p1/ui_render/execute_ui_render/handler.ts";
function stable(v:any):any{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o:any={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o;}return v;}
function sha(v:any){return`sha256:${createHash('sha256').update(JSON.stringify(stable(v))).digest('hex')}`;}
function surface(){const body:any={ui_surface_ref:"surface:1",presentation_context_kind:"APPLICATION",presentation_context_ref:"app-context:1",presentation_context_provider_contract_ref:"Q.APP.CONTRACT.CAPABILITY.APPLICATION_PRESENTATION@V0110",ui_module_refs:["module:a"],regions:[],slots:[],navigation_projection:[],interaction_bindings:[],resolved_target_context:{device_class:"desktop"}};return{...body,content_hash:sha(body)};}
function theme(){const body:any={effective_theme_ref:"theme:1",bindings:[{framework_role_ref:"root",theme_ref:"theme:1",appearance_variant_ref:null,visual_profile_ref:"profile:1",visual_profile:{color:{},typography:{},spacing:{},radius_and_shape:{},border_and_elevation:{},iconography_appearance:{},visual_density:{},surface_appearance:{},component_appearance:{},visual_motion_treatment:{},appearance_variants:{},accessibility_visual_requirements:{}}}]};return{...body,content_hash:sha(body)};}
const call=(s:any=surface(),t:any=theme(),renderer_provider_ref="renderer:web")=>handler({ui_render_ref:"render:1",ui_surface_ref:"surface:1",render_input:{ui_surface_artifact:s,theme_binding_artifact:t,renderer_provider_ref,target_profile_ref:"target:web"},trace_id:"trace-1",request_id:"request-1"}) as Promise<any>;

test("execute_ui_render V0112 preserves exact Surface and Theme hashes in a governed response",async()=>{const s=surface(),t=theme();const r:any=await call(s,t);assert.equal(r.outcome_type,"response");assert.equal(r.ui_render_artifact.theme_ref,"theme:1");assert.equal(r.ui_render_artifact.ui_surface_hash,s.content_hash);assert.equal(r.ui_render_artifact.theme_binding_hash,t.content_hash);assert.match(r.ui_render_artifact.content_hash,/^sha256:[0-9a-f]{64}$/);assert.match(r.receipt_ref,/^sha256:[0-9a-f]{64}$/);assert.match(r.evidence_ref,/^sha256:[0-9a-f]{64}$/);assert.equal(r.trace_id,"trace-1");assert.equal(r.request_id,"request-1");});

test("execute_ui_render returns stable_error for unresolved Surface",async()=>{const s:any=surface();const body={...s};delete body.content_hash;body.resolved_target_context=null;s.resolved_target_context=null;s.content_hash=sha(body);const r:any=await call(s,theme());assert.equal(r.outcome_type,"stable_error");assert.equal(r.stable_error.case,"target/theme incompatibility");});

test("execute_ui_render returns stable_error for tampered Theme binding",async()=>{const t:any=theme();t.bindings=[];const r:any=await call(surface(),t);assert.equal(r.outcome_type,"stable_error");assert.equal(r.stable_error.case,"theme binding missing or invalid");});

test("execute_ui_render returns stable_error when renderer is unavailable",async()=>{const r:any=await call(surface(),theme(),"");assert.equal(r.outcome_type,"stable_error");assert.equal(r.stable_error.case,"renderer unavailable");});
