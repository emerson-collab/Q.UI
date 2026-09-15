import type { ResolveUiThemeRequest, ResolveUiThemeResponse } from "./types.ts";
import { is_resolve_ui_theme_response } from "./contracts.ts";
export interface CapabilityTransport{invoke(operation_ref:string,input:unknown):unknown|Promise<unknown>}
export class CapabilityClient{constructor(private readonly transport:CapabilityTransport){}
  async resolve_ui_theme(input:ResolveUiThemeRequest):Promise<ResolveUiThemeResponse>{const out=await this.transport.invoke("Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme",input);if(!is_resolve_ui_theme_response(out))throw new TypeError("provider response violates resolve_ui_theme response contract");return out}
}
