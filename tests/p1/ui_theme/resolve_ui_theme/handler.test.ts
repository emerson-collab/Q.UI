import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  registered_business_operation_refs,
  resolve_business_operation,
} from "../../../../src/p1/business_runtime/business_operation_registry.ts";
import {
  RESOLVE_UI_THEME_OPERATION_REF,
} from "../../../../src/p1/export/ui_theme/contracts.ts";
import {
  handler,
} from "../../../../src/p1/ui_theme/resolve_ui_theme/handler.ts";

type J = null | boolean | number | string | J[] | { [key: string]: J };

function canonical(value: J): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key]!)}`)
    .join(",")}}`;
}

function hashMaterial(
  theme_ref: string,
  theme_version: string,
  presentation_rules: { [key: string]: J },
): string {
  const subject = { theme_ref, theme_version, presentation_rules };
  return `sha256:${createHash("sha256")
    .update(canonical(subject), "utf8")
    .digest("hex")}`;
}

function request(
  presentation_rules: { [key: string]: J } = {
    typography: { weight: 600, family: "Inter" },
    spacing: [4, 8, 16],
  },
) {
  const theme_ref = "q.ui.theme.sample@V0109";
  const theme_version = "V0109";
  return {
    theme_selector: {
      theme_material: {
        theme_ref,
        theme_version,
        presentation_rules,
        content_hash: hashMaterial(theme_ref, theme_version, presentation_rules),
      },
    },
  };
}

test("resolve_ui_theme registers the exact Operation", () => {
  assert.ok(registered_business_operation_refs().includes(RESOLVE_UI_THEME_OPERATION_REF));
  assert.equal(resolve_business_operation(RESOLVE_UI_THEME_OPERATION_REF), handler);
});

test("resolve_ui_theme deterministically returns the exact governed Theme projection", async () => {
  const input = request();
  const a = await handler(input);
  const b = await handler(input);

  assert.deepEqual(a, b);
  assert.deepEqual(a.ui_theme_artifact, {
    theme_ref: input.theme_selector.theme_material.theme_ref,
    theme_version: input.theme_selector.theme_material.theme_version,
    presentation_rules: input.theme_selector.theme_material.presentation_rules,
    content_hash: input.theme_selector.theme_material.content_hash,
    resolver_capability_ref: "Q.UI.CAPABILITY.UI_THEME@V0109",
    resolver_operation_ref:
      "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme",
  });
  assert.equal(Object.isFrozen(a), true);
  assert.equal(Object.isFrozen(a.ui_theme_artifact), true);
  assert.equal(Object.isFrozen(a.ui_theme_artifact.presentation_rules), true);
});

test("presentation_rules are copied without freezing or mutating caller input", async () => {
  const presentation_rules: { [key: string]: J } = { density: "compact" };
  const input = request(presentation_rules);
  const result = await handler(input);

  assert.equal(Object.isFrozen(presentation_rules), false);
  assert.notEqual(result.ui_theme_artifact.presentation_rules, presentation_rules);
  presentation_rules.density = "comfortable";
  assert.equal(result.ui_theme_artifact.presentation_rules.density, "compact");
});

test("final @ suffix identity mismatch returns only UI_THEME_SELECTOR_UNRESOLVED", async () => {
  const input = request();
  input.theme_selector.theme_material.theme_version = "V0110";
  input.theme_selector.theme_material.content_hash = hashMaterial(
    input.theme_selector.theme_material.theme_ref,
    input.theme_selector.theme_material.theme_version,
    input.theme_selector.theme_material.presentation_rules,
  );

  await assert.rejects(
    () => handler(input),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, "UI_THEME_SELECTOR_UNRESOLVED");
      return true;
    },
  );
});

test("content hash mismatch returns only UI_THEME_SELECTOR_UNRESOLVED", async () => {
  const input = request();
  input.theme_selector.theme_material.content_hash =
    "sha256:0000000000000000000000000000000000000000000000000000000000000000";

  await assert.rejects(
    () => handler(input),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, "UI_THEME_SELECTOR_UNRESOLVED");
      return true;
    },
  );
});

test("empty constraints are compatible without ui_context", async () => {
  const input = request();
  Object.assign(input.theme_selector, { context_constraints: {} });
  await assert.doesNotReject(() => handler(input));
});

test("nonempty constraints use top-level RFC8785 equality and ignore extra ui_context keys", async () => {
  const input = request();
  Object.assign(input.theme_selector, {
    context_constraints: {
      locale: "en-US",
      viewport: { width: 1440, bands: [1, 2, 3] },
    },
  });
  Object.assign(input, {
    ui_context: {
      ignored_extra: true,
      viewport: { bands: [1, 2, 3], width: 1440 },
      locale: "en-US",
    },
  });

  await assert.doesNotReject(() => handler(input));
});

test("context mismatch returns only UI_THEME_CONTEXT_INCOMPATIBLE after selector resolution", async () => {
  const input = request();
  Object.assign(input.theme_selector, {
    context_constraints: { locale: "en-US" },
  });
  Object.assign(input, { ui_context: { locale: "zh-CN" } });

  await assert.rejects(
    () => handler(input),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, "UI_THEME_CONTEXT_INCOMPATIBLE");
      return true;
    },
  );
});

test("ui_module_artifact_ref is opaque and nonselecting", async () => {
  const input = request();
  const without = await handler(input);
  const withCorrelation = await handler({
    ...input,
    ui_module_artifact_ref: "opaque:ui-module:123",
  });

  assert.deepEqual(withCorrelation, without);
});

test("JSON object key insertion order does not change governed Theme content hash", async () => {
  const left = request({
    palette: { background: "white", foreground: "black" },
  });
  const rightRules: { [key: string]: J } = {};
  rightRules.palette = { foreground: "black", background: "white" };
  const right = request(rightRules);

  assert.equal(
    left.theme_selector.theme_material.content_hash,
    right.theme_selector.theme_material.content_hash,
  );
  assert.deepEqual(await handler(left), await handler(right));
});

test("payload schema violations are not remapped to a UI_THEME StableError", async () => {
  await assert.rejects(
    () => handler({ theme_selector: {} }),
    (error: unknown) => {
      assert.equal(error instanceof TypeError, true);
      assert.equal("code" in (error as object), false);
      return true;
    },
  );

  await assert.rejects(
    () => handler({ ...request(), undeclared: true }),
    (error: unknown) => error instanceof TypeError,
  );
});

test("non-JSON-safe request material fails closed at the payload boundary", async () => {
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  const cycleInput = request();
  cycleInput.theme_selector.theme_material.presentation_rules =
    cyclic as unknown as { [key: string]: J };

  await assert.rejects(() => handler(cycleInput), TypeError);

  const accessorRules: Record<string, unknown> = {};
  Object.defineProperty(accessorRules, "bad", {
    enumerable: true,
    get() {
      return "value";
    },
  });
  const accessorInput = request();
  accessorInput.theme_selector.theme_material.presentation_rules =
    accessorRules as unknown as { [key: string]: J };
  await assert.rejects(() => handler(accessorInput), TypeError);

  const numberInput = request();
  numberInput.theme_selector.theme_material.presentation_rules =
    { bad: Number.POSITIVE_INFINITY } as unknown as { [key: string]: J };
  await assert.rejects(() => handler(numberInput), TypeError);
});
