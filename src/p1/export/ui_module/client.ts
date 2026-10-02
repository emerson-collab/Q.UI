import type { ResolveUiModuleRequest, ResolveUiModuleOutcome, UiModuleEntry } from "./types.ts";

export interface UiModuleClient {
  resolve_ui_module(request: ResolveUiModuleRequest): Promise<ResolveUiModuleOutcome>;
}

export function createUiModuleClient(invoke: UiModuleEntry): UiModuleClient {
  return {
    resolve_ui_module(request) {
      return invoke(request);
    },
  };
}
