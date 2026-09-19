import { public_contracts } from "./contracts.ts";
import type { ResolveUiModuleRequest, ResolveUiModuleResponse } from "./types.ts";

export interface P1OperationInvoker {
  invoke(operation_ref: string, input: unknown): Promise<unknown>;
}

export class UiModuleClient {
  constructor(private readonly invoker: P1OperationInvoker) {}

  async resolve_ui_module(input: ResolveUiModuleRequest): Promise<ResolveUiModuleResponse> {
    return await this.invoker.invoke(
      public_contracts.operations.resolve_ui_module.operation_ref,
      input,
    ) as ResolveUiModuleResponse;
  }
}

export function create_client(invoker: P1OperationInvoker): UiModuleClient {
  return new UiModuleClient(invoker);
}
