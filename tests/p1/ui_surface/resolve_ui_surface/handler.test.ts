import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { StableRuntimeError } from "../../../../src/p0/runtime_contract.ts";
import { handler } from "../../../../src/p1/ui_surface/resolve_ui_surface/handler.ts";
function stable(v:any):any{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o:any={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o;}return v;}
function sha(v:any){return`sha256:${createHash('sha256').update(JSON.stringify(stable(v))).digest('hex')}`;}
function unresolvedSurface(){const body:any={ui_surface_ref:"surface:1",presentation_context_kind:"APPLICATION",presentation_context_ref:"app-context:1",presentation_context_provider_contract_ref:"Q.APP.CONTRACT.CAPABILITY.APPLICATION_PRESENTATION@V0109",ui_module_refs:["module:a"],regions:[{region_ref:"region:1"}],slots:[{slot_ref:"slot:1",ui_module_ref:"module:a"}],navigation_projection:[{presentation_context_ref:"app-context:1"}],interaction_bindings:[],resolved_target_context:null};return{...body,content_hash:sha(body)};}

test("resolve_ui_surface V0112 adds exact target context and preserves lineage",async()=>{const source=unresolvedSurface();const result:any=await handler({ui_surface_ref:"surface:1",resolution_input:{ui_surface_artifact:source,target_context:{device_class:"desktop",accessibility_profile:"default"}}});assert.equal(result.ui_surface_artifact.ui_surface_ref,"surface:1");assert.deepEqual(result.ui_surface_artifact.ui_module_refs,["module:a"]);assert.deepEqual(result.ui_surface_artifact.resolved_target_context,{device_class:"desktop",accessibility_profile:"default"});assert.match(result.ui_surface_artifact.content_hash,/^sha256:[0-9a-f]{64}$/);assert.notEqual(result.ui_surface_artifact.content_hash,source.content_hash);});

test("resolve_ui_surface rejects a second target resolution",async()=>{const source:any=unresolvedSurface();const body={...source};delete body.content_hash;body.resolved_target_context={device_class:"desktop"};source.resolved_target_context=body.resolved_target_context;source.content_hash=sha(body);await assert.rejects(()=>handler({ui_surface_ref:"surface:1",resolution_input:{ui_surface_artifact:source,target_context:{device_class:"mobile"}}}),(e:unknown)=>e instanceof StableRuntimeError&&e.code==="UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED");});

test("resolve_ui_surface rejects tampered source hash",async()=>{const source:any=unresolvedSurface();source.regions=[];await assert.rejects(()=>handler({ui_surface_ref:"surface:1",resolution_input:{ui_surface_artifact:source,target_context:{device_class:"desktop"}}}),(e:unknown)=>e instanceof StableRuntimeError&&e.code==="UI_SURFACE_CONTEXT_EQUIVALENCE_CLOSURE_FAILED");});
