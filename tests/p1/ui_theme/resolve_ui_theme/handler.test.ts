import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../../../../src/p1/ui_theme/resolve_ui_theme/handler.ts";

const HASH = `sha256:${"a".repeat(64)}`;

function selector() {
  return {
    theme_ref: "Q.UI.THEME.CORE@V0100",
    theme_version: "V0100",
    presentation_rules: { density: "compact", spacing: [4, 8, 12] },
    content_hash: HASH,
  };
}

test("resolve_ui_theme projects an exact governed UI Theme Artifact without mutating caller input", async () => {
  const themeSelector = selector();
  const input = { theme_selector: themeSelector, ui_context: { viewport: "desktop" }, ui_module_artifact_ref: "Q.UI.MODULE@V0100" };
  const before = structuredClone(input);
  const result = await handler(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result, {
    kind: "response",
    response: { ui_theme_artifact: themeSelector },
  });
  if (result.kind === "response") {
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.response), true);
    assert.equal(Object.isFrozen(result.response.ui_theme_artifact), true);
    assert.equal(Object.isFrozen(result.response.ui_theme_artifact.presentation_rules), true);
  }
});

test("resolve_ui_theme is deterministic for the same governed selector", async () => {
  const first = await handler({ theme_selector: selector() });
  const second = await handler({ theme_selector: selector() });
  assert.deepEqual(first, second);
});

test("resolve_ui_theme fails closed when the selector cannot resolve the declared artifact closure", async () => {
  const result = await handler({ theme_selector: { theme_ref: "Q.UI.THEME.CORE@V0100" } });
  assert.deepEqual(result, {
    kind: "stable_error",
    stable_error: {
      code: "UI_THEME_SELECTOR_UNRESOLVED",
      message: "The governed theme selector cannot be resolved.",
    },
  });
});

test("resolve_ui_theme rejects incompatible non-object UI context without inventing compatibility semantics", async () => {
  const result = await handler({ theme_selector: selector(), ui_context: "desktop" });
  assert.deepEqual(result, {
    kind: "stable_error",
    stable_error: {
      code: "UI_THEME_CONTEXT_INCOMPATIBLE",
      message: "The governed UI context is incompatible with the resolved theme.",
    },
  });
});

test("resolve_ui_theme rejects non-JSON-safe selector material", async () => {
  const cyclic: Record<string, unknown> = selector();
  cyclic.self = cyclic;
  const result = await handler({ theme_selector: cyclic });
  assert.equal(result.kind, "stable_error");
  if (result.kind === "stable_error") assert.equal(result.stable_error.code, "UI_THEME_SELECTOR_UNRESOLVED");
});
