import test from "node:test";
import assert from "node:assert/strict";
import { CapabilityClient } from "../../../../src/p1/export/ui_theme/client.ts";
test("typed client rejects a response outside the exact response contract",async()=>{const client=new CapabilityClient({async invoke(){return null}});await assert.rejects(()=>client.resolve_ui_theme({} as never),TypeError)});
