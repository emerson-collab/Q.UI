import assert from "node:assert/strict";
import test from "node:test";
import * as entry from "../../../../src/p1/export/ui_theme/entry.ts";

test("PUBLICATION_ELIGIBLE entry is closed", () => { assert.ok(entry); });
