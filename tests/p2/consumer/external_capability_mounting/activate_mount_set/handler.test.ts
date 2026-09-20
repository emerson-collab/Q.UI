import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  handler,
  STAGE_CONTRACT_REF,
  commit_active_mount_set_with_owner,
  recover_active_mount_set_with_owner,
} from "#q/p2/consumer/external_capability_mounting/activate_mount_set/handler.ts";

const baseRequest=(input:Record<string,unknown>)=>({
  input,
  runtime_context:{stage_contract_ref:STAGE_CONTRACT_REF},
  trace_id:"trace-p2",
  request_id:"request-p2",
});
function stable(v:unknown):unknown{return Array.isArray(v)?v.map(stable):(v!==null&&typeof v==="object"?Object.fromEntries(Object.keys(v as Record<string,unknown>).sort().map(k=>[k,stable((v as Record<string,unknown>)[k])])):v);}
const sha=(v:unknown)=>`sha256:${createHash("sha256").update(JSON.stringify(stable(v)),"utf8").digest("hex")}`;
const receiving_domain_ref="Q.RECEIVER.CONTRACT.DOMAIN@V0100";

function retainedMount(provider:string,seed:string){
  const publication_hash=`sha256:${seed.repeat(64).slice(0,64)}`;
  const resolver_state={publication_hash,verified:true};
  const implementation_binding_hash=sha(resolver_state);
  const mount_policy={};
  const mount_hash=sha({receiving_domain_ref,publication_hash,implementation_binding_hash,mount_policy});
  return {
    receiving_domain_ref,
    publication_hash,
    verified_publication:{
      verified:true,
      capability_contract_ref:provider,
      capability_contract_hash:`sha256:${"a".repeat(64)}`,
      publication_hash,
    },
    resolver_state,
    implementation_binding_hash,
    mount_policy,
    mount_hash,
    status:"INACTIVE",
  };
}

test("activate_mount_set verifies all retained members before atomic pointer switch and recovers",async()=>{
  const mountA=retainedMount("Q.A.CONTRACT.CAPABILITY.A@V0100","b");
  const mountB=retainedMount("Q.B.CONTRACT.CAPABILITY.B@V0100","c");
  const members=[
    {provider_capability_contract_ref:"Q.A.CONTRACT.CAPABILITY.A@V0100",mount_hash:mountA.mount_hash},
    {provider_capability_contract_ref:"Q.B.CONTRACT.CAPABILITY.B@V0100",mount_hash:mountB.mount_hash},
  ];
  const mount_set_hash=sha({receiving_domain_ref,members});
  const retained={receiving_domain_ref,members,mount_set_hash,status:"INACTIVE"};
  const response=await handler(baseRequest({mount_set:retained}));
  const active=response.runtime_result.active_mount_set as Record<string,unknown>;
  assert.equal(active.status,"ACTIVE");

  const mounts=new Map([[mountA.mount_hash,mountA],[mountB.mount_hash,mountB]]);
  const sets=new Map([[mount_set_hash,retained]]);
  const pointers=new Map<string,Record<string,unknown>>();
  let reverifications=0;
  const persistence={
    async read_mount_set_record({mount_set_hash}:{mount_set_hash:string}){return sets.get(mount_set_hash);},
    async read_mount_record({mount_hash}:{mount_hash:string}){return mounts.get(mount_hash);},
    async reverify_implementation_material(){reverifications+=1;},
    async read_active_mount_set_pointer({receiving_domain_ref}:{receiving_domain_ref:string}){return pointers.get(receiving_domain_ref);},
    async switch_active_mount_set_pointer({receiving_domain_ref,mount_set_hash}:{receiving_domain_ref:string;mount_set_hash:string}){pointers.set(receiving_domain_ref,{receiving_domain_ref,mount_set_hash,status:"ACTIVE"});},
  };
  await commit_active_mount_set_with_owner(active,persistence);
  assert.equal(reverifications,2);
  assert.equal(pointers.get(receiving_domain_ref)?.mount_set_hash,mount_set_hash);

  const recovered=await recover_active_mount_set_with_owner(receiving_domain_ref,persistence);
  assert.equal(recovered.status,"ACTIVE");
  assert.equal(recovered.mount_set_hash,mount_set_hash);
  assert.equal((recovered.member_mounts as unknown[]).length,2);
});
