import test from "node:test";
import assert from "node:assert/strict";
import {
  handler,
  P2StableError,
  STAGE_CONTRACT_REF,
  persist_dependency_realization_with_owner,
} from "#q/p2/consumer/p1_dependency_realization/realize_dependency/handler.ts";
const baseRequest=(input:Record<string,unknown>)=>({input,runtime_context:{stage_contract_ref:STAGE_CONTRACT_REF},trace_id:"trace-p2",request_id:"request-p2"});
import { createHash } from "node:crypto";
function stable(v:unknown):unknown{return Array.isArray(v)?v.map(stable):(v!==null&&typeof v==="object"?Object.fromEntries(Object.keys(v as Record<string,unknown>).sort().map(k=>[k,stable((v as Record<string,unknown>)[k])])):v);}
const sha=(v:unknown)=>`sha256:${createHash("sha256").update(JSON.stringify(stable(v)),"utf8").digest("hex")}`;
const resolverPayload={publication_hash:`sha256:${"b".repeat(64)}`,implementation_artifact_ref:"artifact://implementation",implementation_artifact_hash:`sha256:${"c".repeat(64)}`,entry_symbol_ref:"src/p1/export/example/entry.ts#entry",local_material_binding_ref:"src/p1/export/example/entry.ts#entry"};
const resolver_state={...resolverPayload,binding_hash:sha(resolverPayload),verified:true};
const selected_mount={mount_hash:`sha256:${"a".repeat(64)}`,verified_publication:{verified:true,capability_contract_ref:"Q.PROVIDER.CONTRACT.CAPABILITY.EXAMPLE@V0100"},resolver_state,implementation_binding_hash:sha(resolver_state)};
const activeMember={source_binding_kind:"ACTIVE_MOUNT_SET_MEMBER",active_mount_set_hash:`sha256:${"f".repeat(64)}`,provider_capability_contract_ref:"Q.PROVIDER.CONTRACT.CAPABILITY.EXAMPLE@V0100",selected_mount};
const receiving={exact_owner_capability_ref:"Q.RECEIVER.CAPABILITY.SEARCH@V0100",exact_receiving_operation_ref:"Q.RECEIVER.CONTRACT.CAPABILITY.SEARCH@V0100#/operations/run",exact_local_dependency_ref:"Q.RECEIVER.CONTRACT.CAPABILITY.SEARCH@V0100#/dependencies/provider_search"};

const governedBinding={data_category:"STATIC",source_domain_identity:"Q.SOURCE.CONTRACT.DOMAIN@V0100",subject_identity:"subject-1",source_provenance:{revision_ref:"rev-1"},source_fact_authority:"Q.SOURCE.CONTRACT.DOMAIN@V0100",governed_access_binding:{authorization_ref:"auth-1"},integrity_binding:{profile_ref:"Q.INTEGRITY"},material_ref:"urn:q:material:1",content_hash:`sha256:${"d".repeat(64)}`,creates_evidence_or_gate_result:false};

test("realize_dependency accepts exact ACTIVE_MOUNT_SET_MEMBER after resolver verification",async()=>{
 const r=await handler(baseRequest({verified_provider_binding_or_governed_data_binding:activeMember,receiving_p1_binding:receiving}));
 const b=r.runtime_result.dependency_realization_binding as Record<string,unknown>;
 assert.equal(b.source_binding_kind,"ACTIVE_MOUNT_SET_MEMBER");
 assert.equal(b.exact_owner_capability_ref,receiving.exact_owner_capability_ref);
 assert.equal(b.exact_receiving_operation_ref,receiving.exact_receiving_operation_ref);
 assert.equal(b.creates_or_writes_p1_business_semantics,false);
 assert.match(String(b.binding_hash),/^sha256:[0-9a-f]{64}$/);
});

test("V0124 persists dependency realization under exact owner-and-operation-qualified durable key",async()=>{
 const r=await handler(baseRequest({verified_provider_binding_or_governed_data_binding:activeMember,receiving_p1_binding:receiving}));
 const binding=r.runtime_result.dependency_realization_binding as Record<string,unknown>;
 let persistedKey:Record<string,unknown>|undefined;
 let stored:Record<string,unknown>|undefined;
 await persist_dependency_realization_with_owner("Q.RECEIVER.CONTRACT.DOMAIN@V0100",binding,{
  async persist_dependency_binding_record(input){persistedKey={...input};stored=input.binding as Record<string,unknown>;},
  async read_dependency_binding_record(input){
    assert.equal(input.exact_owner_capability_ref,receiving.exact_owner_capability_ref);
    assert.equal(input.exact_receiving_operation_ref,receiving.exact_receiving_operation_ref);
    assert.equal(input.exact_local_dependency_ref,receiving.exact_local_dependency_ref);
    assert.equal(input.active_mount_set_hash,activeMember.active_mount_set_hash);
    return stored;
  },
 });
 assert.equal(persistedKey?.exact_owner_capability_ref,receiving.exact_owner_capability_ref);
 assert.equal(persistedKey?.exact_receiving_operation_ref,receiving.exact_receiving_operation_ref);
});

test("realize_dependency accepts governed-data consumption binding",async()=>{
 const r=await handler(baseRequest({verified_provider_binding_or_governed_data_binding:governedBinding,receiving_p1_binding:receiving}));
 assert.equal((r.runtime_result.dependency_realization_binding as Record<string,unknown>).source_binding_kind,"GOVERNED_DATA_CONSUMPTION_BINDING");
});
test("realize_dependency fails closed on unverified arbitrary binding",async()=>{
 await assert.rejects(()=>handler(baseRequest({verified_provider_binding_or_governed_data_binding:{kind:"ACTIVE_MOUNT",active:true},receiving_p1_binding:receiving})),(e:unknown)=>e instanceof P2StableError&&e.code==="P2_PROVIDER_BINDING_NOT_VERIFIED");
});
test("realize_dependency never creates P1 dependency semantics",async()=>{
 await assert.rejects(()=>handler(baseRequest({verified_provider_binding_or_governed_data_binding:activeMember,receiving_p1_binding:receiving,create_p1_dependency:true})),(e:unknown)=>e instanceof P2StableError&&e.code==="P2_P1_DEPENDENCY_CREATION_FORBIDDEN");
});
