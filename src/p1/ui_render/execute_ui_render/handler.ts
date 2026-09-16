import { createHash } from "node:crypto";
import { StableRuntimeError, deep_freeze } from "../../../p0/runtime_contract.ts";

export type JsonObject = Readonly<Record<string, unknown>>;
export const CAPABILITY_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_RENDER@V0112" as const;
export const OPERATION_REF = `${CAPABILITY_CONTRACT_REF}#/operations/execute_ui_render` as const;
export const UI_SURFACE_CONTRACT_REF = "Q.UI.CONTRACT.CAPABILITY.UI_SURFACE@V0114" as const;
export const THEME_BINDING_CONTRACT_REF = "Q.THEME.CONTRACT.CAPABILITY.THEME_BINDING@V0107" as const;
const SHA256=/^sha256:[0-9a-f]{64}$/;
function isObject(v:unknown):v is Record<string,unknown>{return v!==null&&typeof v==="object"&&!Array.isArray(v)}
function obj(v:unknown,code:string,field:string):Record<string,unknown>{if(!isObject(v))throw new StableRuntimeError(code,`${field} must be object`);return v;}
function str(v:unknown,code:string,field:string):string{if(typeof v!=="string"||v.length===0)throw new StableRuntimeError(code,`${field} must be non-empty string`);return v;}
function stable(v:unknown):unknown{if(Array.isArray(v))return Object.freeze(v.map(stable));if(isObject(v)){const o:Record<string,unknown>={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return Object.freeze(o);}return v;}
function canonical(v:unknown):string{return JSON.stringify(stable(v));}
function sha(v:unknown):string{return`sha256:${createHash("sha256").update(canonical(v),"utf8").digest("hex")}`;}
function verifyHashBoundArtifact(value:unknown,code:string,field:string):Record<string,unknown>{const artifact=obj(value,code,field);const contentHash=str(artifact.content_hash,code,`${field}.content_hash`);if(!SHA256.test(contentHash))throw new StableRuntimeError(code,`${field}.content_hash must be sha256`);const body:Record<string,unknown>={};for(const[k,v]of Object.entries(artifact))if(k!=="content_hash")body[k]=v;if(sha(body)!==contentHash)throw new StableRuntimeError(code,`${field}.content_hash mismatch`);return artifact;}

export async function handler(input:unknown):Promise<Readonly<Record<string,unknown>>>{
  const request=obj(input,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","input");
  if(Object.keys(request).some((k)=>!["ui_render_ref","ui_surface_ref","render_input"].includes(k)))throw new StableRuntimeError("UI_RENDER_TARGET_THEME_INCOMPATIBLE","undeclared execute_ui_render input field");
  const ui_render_ref=str(request.ui_render_ref,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","ui_render_ref");
  const ui_surface_ref=str(request.ui_surface_ref,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","ui_surface_ref");
  const renderInput=obj(request.render_input,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","render_input");
  if(Object.keys(renderInput).some((k)=>!["ui_surface_artifact","theme_binding_artifact","renderer_provider_ref","target_profile_ref"].includes(k)))throw new StableRuntimeError("UI_RENDER_TARGET_THEME_INCOMPATIBLE","undeclared render_input field");
  const surface=verifyHashBoundArtifact(renderInput.ui_surface_artifact,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","render_input.ui_surface_artifact");
  if(surface.ui_surface_ref!==ui_surface_ref||!isObject(surface.resolved_target_context))throw new StableRuntimeError("UI_RENDER_TARGET_THEME_INCOMPATIBLE","Render requires the exact target-resolved UI Surface artifact");
  const theme=verifyHashBoundArtifact(renderInput.theme_binding_artifact,"UI_RENDER_THEME_BINDING_MISSING_OR_INVALID","render_input.theme_binding_artifact");
  const theme_ref=str(theme.effective_theme_ref,"UI_RENDER_THEME_BINDING_MISSING_OR_INVALID","theme_binding_artifact.effective_theme_ref");
  if(!Array.isArray(theme.bindings)||theme.bindings.length===0)throw new StableRuntimeError("UI_RENDER_THEME_BINDING_MISSING_OR_INVALID","Theme Binding must contain at least one exact framework binding");
  const renderer_provider_ref=str(renderInput.renderer_provider_ref,"UI_RENDER_RENDERER_UNAVAILABLE","renderer_provider_ref");
  const target_profile_ref=str(renderInput.target_profile_ref,"UI_RENDER_TARGET_THEME_INCOMPATIBLE","target_profile_ref");
  const body=deep_freeze({render_artifact_ref:ui_render_ref,ui_surface_ref,ui_surface_hash:surface.content_hash,renderer_provider_ref,theme_ref,theme_binding_hash:theme.content_hash,target_profile_ref});
  return deep_freeze({ui_render_artifact:deep_freeze({...body,content_hash:sha(body)})});
}
