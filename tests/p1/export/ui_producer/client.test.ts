import test from "node:test";
import assert from "node:assert/strict";
import { create_client } from "../../../../src/p1/export/ui_producer/client.ts";

class RecordingInvoker {
  readonly calls: Array<{ operation_ref: string; input: unknown }> = [];
  async invoke(operation_ref: string, input: unknown): Promise<unknown> {
    this.calls.push({ operation_ref, input });
    return { host_artifact: { host_artifact_ref: "opaque" } };
  }
}

test("ui_producer client routes only through declared Operation refs", async () => {
  const invoker = new RecordingInvoker();
  const client = create_client(invoker);
  const appInput = { ui_module_artifact_ref: "m1", ui_module_artifact: {} } as const;
  const platformInput = { ui_module_artifact_ref: "m2", ui_module_artifact: {} } as const;

  await client.produce_app(appInput);
  await client.produce_platform(platformInput);

  assert.deepEqual(invoker.calls, [
    { operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_app", input: appInput },
    { operation_ref: "Q.UI.CONTRACT.CAPABILITY.UI_PRODUCER@V0107#/operations/produce_platform", input: platformInput },
  ]);
});
