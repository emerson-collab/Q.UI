import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { handler, OPERATION_REF, CAPABILITY_CONTRACT_REF } from "../../../../src/p1/ui_host/activate_ui_host/handler.ts";
import { registered_business_operation_refs } from "../../../../src/p1/business_runtime/business_operation_registry.ts";
function stable(v:any):any{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o:any={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o;}return v;}
function sha(v:any){return`sha256:${createHash('sha256').update(JSON.stringify(stable(v))).digest('hex')}`;}
function renderArtifact(){const body:any={render_artifact_ref:"Q.UI.RENDER@V0100",ui_surface_ref:"Q.UI.SURFACE@V0100",ui_surface_hash:`sha256:${"1".repeat(64)}`,renderer_provider_ref:"renderer:web",theme_ref:"theme:1",theme_binding_hash:`sha256:${"2".repeat(64)}`,target_profile_ref:"target:web"};return{...body,content_hash:sha(body)};}

test("activate_ui_host V0110 changes presentation lifecycle only", async () => {
  const result:any = await handler({ui_host_ref:"Q.UI.HOST@V0100",render_artifact_ref:"Q.UI.RENDER@V0100",activation_input:{host_instance_ref:"Q.UI.HOST.INSTANCE@V0100",host_binding:{route:"/"},ui_render_artifact:renderArtifact()},trace_id:"trace-1",request_id:"request-1"});
  assert.equal(CAPABILITY_CONTRACT_REF,"Q.UI.CONTRACT.CAPABILITY.UI_HOST@V0110");
  assert.equal(result.outcome_type,"response");
  assert.equal(result.ui_host_result.lifecycle_state,"active");
  assert.equal(result.ui_host_result.receipt_ref,result.receipt_ref);
  assert.ok(registered_business_operation_refs().includes(OPERATION_REF));
});

test("activate_ui_host fails closed on invalid host binding", async () => { const result:any=await handler({ui_host_ref:"Q.UI.HOST@V0100",render_artifact_ref:"Q.UI.RENDER@V0100",activation_input:{host_instance_ref:"Q.UI.HOST.INSTANCE@V0100",ui_render_artifact:renderArtifact()},trace_id:"trace-2",request_id:"request-2"});assert.equal(result.outcome_type,"stable_error");assert.equal(result.stable_error.case,"host binding invalid");});

test("activate_ui_host fails closed on incompatible render artifact", async () => { const artifact:any=renderArtifact();artifact.theme_ref="tampered";const result:any=await handler({ui_host_ref:"Q.UI.HOST@V0100",render_artifact_ref:"Q.UI.RENDER@V0100",activation_input:{host_instance_ref:"Q.UI.HOST.INSTANCE@V0100",host_binding:{},ui_render_artifact:artifact},trace_id:"trace-3",request_id:"request-3"});assert.equal(result.outcome_type,"stable_error");assert.equal(result.stable_error.case,"render artifact incompatible");});
