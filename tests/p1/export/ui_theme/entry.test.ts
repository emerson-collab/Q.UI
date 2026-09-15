import test from "node:test";
import assert from "node:assert/strict";
import * as entry from "../../../../src/p1/export/ui_theme/entry.ts";
test("public entry exposes generated client/contracts/types metadata",()=>{assert.equal(typeof entry.CapabilityClient,"function");assert.ok(entry.capability_extraction_metadata)});
