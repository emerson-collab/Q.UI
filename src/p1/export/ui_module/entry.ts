import { resolve_ui_module } from "../../ui_module/resolve_ui_module/handler.ts";
import type { ResolveUiModuleRequest, ResolveUiModuleOutcome } from "./types.ts";

export async function entry(request: ResolveUiModuleRequest): Promise<ResolveUiModuleOutcome> {
  return resolve_ui_module(request);
}
