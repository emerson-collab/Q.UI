import assert from "node:assert/strict";
import test from "node:test";
import * as entryModule from "../../../../src/p1/export/ui_theme/entry.ts";

test("UI_THEME public entry is exact V0118 static extraction and does not export handlers",()=>{
  assert.equal(entryModule.CAPABILITY_CONTRACT_REF,"Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0118");
  assert.equal(entryModule.CAPABILITY_CONTRACT_HASH,"sha256:2b8026d0b6d42c3854725a98855edec0da06eaf6191cb2438ea6c32b5055c337");
  assert.equal(entryModule.entry.interface_refs.length,4);
  assert.equal("handler" in entryModule,false);
  assert.equal(entryModule.capability_extraction_metadata.public_operation_refs.length,4);
  assert.equal(entryModule.capability_extraction_metadata.public_interface_refs.length,4);
  assert.equal(entryModule.capability_extraction_metadata.public_type_refs.length,7);
});
