import test from "node:test";
import assert from "node:assert/strict";
import { handler as realizeHandler, persist_dependency_realization_with_owner } from "#q/p2/consumer/p1_dependency_realization/realize_dependency/handler.ts";
import { handler, P2StableError, STAGE_CONTRACT_REF } from "#q/p2/consumer/p1_dependency_realization/bind_operation_use/handler.ts";
const baseRequest=(input:Record<string,unknown>)=>({input,runtime_context:{stage_contract_ref:STAGE_CONTRACT_REF},trace_id:"trace-p2",request_id:"request-p2"});
import { createHash } from "node:crypto";
function stable(v:unknown):unknown{return Array.isArray(v)?v.map(stable):(v!==null&&typeof v==="object"?Object.fromEntries(Object.keys(v as Record<string,unknown>).sort().map(k=>[k,stable((v as Record<string,unknown>)[k])])):v);}
const sha=(v:unknown)=>`sha256:${createHash("sha256").update(JSON.stringify(stable(v)),"utf8").digest("hex")}`;
const resolverPayload={publication_hash:`sha256:${"b".repeat(64)}`,implementation_artifact_ref:"artifact://implementation",implementation_artifact_hash:`sha256:${"c".repeat(64)}`,entry_symbol_ref:"src/p1/export/example/entry.ts#entry",local_material_binding_ref:"src/p1/export/example/entry.ts#entry"};
const resolver_state={...resolverPayload,binding_hash:sha(resolverPayload),verified:true};
const selected_mount={mount_hash:`sha256:${"a".repeat(64)}`,verified_publication:{verified:true,capability_contract_ref:"Q.PROVIDER.CONTRACT.CAPABILITY.EXAMPLE@V0100"},resolver_state,implementation_binding_hash:sha(resolver_state)};
const activeMember={source_binding_kind:"ACTIVE_MOUNT_SET_MEMBER",active_mount_set_hash:`sha256:${"f".repeat(64)}`,provider_capability_contract_ref:"Q.PROVIDER.CONTRACT.CAPABILITY.EXAMPLE@V0100",selected_mount};
const receiving={exact_owner_capability_ref:"Q.RECEIVER.CAPABILITY.SEARCH@V0100",exact_receiving_operation_ref:"Q.RECEIVER.CONTRACT.CAPABILITY.SEARCH@V0100#/operations/run",exact_local_dependency_ref:"Q.RECEIVER.CONTRACT.CAPABILITY.SEARCH@V0100#/dependencies/provider_search"};


async function verifiedDurableRealization(){
 const rr=await realizeHandler(baseRequest({verified_provider_binding_or_governed_data_binding:activeMember,receiving_p1_binding:receiving}));
 const realization=rr.runtime_result.dependency_realization_binding as Record<string,unknown>;
 let stored:Record<string,unknown>|undefined;
 await persist_dependency_realization_with_owner("Q.RECEIVER.CONTRACT.DOMAIN@V0100",realization,{
  async persist_dependency_binding_record({binding}){stored=binding as Record<string,unknown>;},
  async read_dependency_binding_record(){return stored;},
 });
 return realization;
}

test("realize_dependency durable readback then bind_operation_use preserves exact predeclared P1 slot",async()=>{
 const realization=await verifiedDurableRealization();
 const br=await handler(baseRequest({dependency_realization_binding:realization,operation_use:{exact_receiving_operation_ref:receiving.exact_receiving_operation_ref,exact_local_dependency_ref:receiving.exact_local_dependency_ref}}));
 const b=br.runtime_result.operation_use_binding as Record<string,unknown>;
 assert.equal(b.provider_capability_reowned,false);
 assert.equal(b.p1_business_semantics_written,false);
 assert.match(String(b.operation_use_binding_hash),/^sha256:[0-9a-f]{64}$/);
});
test("bind_operation_use fails closed on tampered realization binding",async()=>{
 const realization=await verifiedDurableRealization();
 await assert.rejects(()=>handler(baseRequest({dependency_realization_binding:{...realization,exact_owner_capability_ref:"Q.TAMPERED.CAPABILITY.X@V0100"},operation_use:{exact_receiving_operation_ref:receiving.exact_receiving_operation_ref,exact_local_dependency_ref:receiving.exact_local_dependency_ref}})),(e:unknown)=>e instanceof P2StableError&&e.code==="P2_INTEGRITY_BINDING_INVALID");
});
test("bind_operation_use fails closed when operation use differs",async()=>{
 const realization=await verifiedDurableRealization();
 await assert.rejects(()=>handler(baseRequest({dependency_realization_binding:realization,operation_use:{exact_receiving_operation_ref:"other",exact_local_dependency_ref:"other"}})),(e:unknown)=>e instanceof P2StableError&&e.code==="P2_OPERATION_USE_BINDING_MISMATCH");
});
