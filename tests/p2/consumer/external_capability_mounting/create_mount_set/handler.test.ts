import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  handler,
  P2StableError,
  STAGE_CONTRACT_REF,
  persist_created_mount_set_with_owner,
} from "#q/p2/consumer/external_capability_mounting/create_mount_set/handler.ts";

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

test("create_mount_set produces canonical immutable INACTIVE member set and exact read-back",async()=>{
  const mountB=retainedMount("Q.B.CONTRACT.CAPABILITY.B@V0100","b");
  const mountA=retainedMount("Q.A.CONTRACT.CAPABILITY.A@V0100","c");
  const response=await handler(baseRequest({receiving_domain_ref,mounts:[mountB,mountA]}));
  const set=response.runtime_result.mount_set as Record<string,any>;
  assert.equal(set.status,"INACTIVE");
  assert.deepEqual(set.members.map((x:any)=>x.provider_capability_contract_ref),[
    "Q.A.CONTRACT.CAPABILITY.A@V0100",
    "Q.B.CONTRACT.CAPABILITY.B@V0100",
  ]);

  const mounts=new Map([[mountA.mount_hash,mountA],[mountB.mount_hash,mountB]]);
  const sets=new Map<string,Record<string,unknown>>();
  await persist_created_mount_set_with_owner(set,[mountB,mountA],{
    async read_mount_record({mount_hash}){return mounts.get(mount_hash);},
    async persist_mount_set_record({mount_set_hash,mount_set}){sets.set(mount_set_hash,mount_set as Record<string,unknown>);},
    async read_mount_set_record({mount_set_hash}){return sets.get(mount_set_hash);},
  });
  assert.equal(sets.size,1);
});

test("create_mount_set rejects duplicate Provider Capability members",async()=>{
  const a=retainedMount("Q.A.CONTRACT.CAPABILITY.A@V0100","d");
  const b={...retainedMount("Q.A.CONTRACT.CAPABILITY.A@V0100","e")};
  await assert.rejects(
    ()=>handler(baseRequest({receiving_domain_ref,mounts:[a,b]})),
    (e:unknown)=>e instanceof P2StableError&&e.code==="P2_MOUNT_SET_DUPLICATE_PROVIDER_CAPABILITY",
  );
});
