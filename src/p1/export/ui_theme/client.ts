import { public_contracts } from "./contracts.ts";
import type { ResolveUiThemeRequest } from "./types.ts";

export interface P1OperationInvoker {
  invoke(operation_ref: string, input: unknown): Promise<unknown>;
}

export class UiThemeClient {
  constructor(private readonly invoker: P1OperationInvoker) {}

  async resolve_ui_theme(input: ResolveUiThemeRequest): Promise<unknown> {
    return await this.invoker.invoke(public_contracts.operations.resolve_ui_theme.operation_ref, input);
  }
}

export function create_client(invoker: P1OperationInvoker): UiThemeClient {
  return new UiThemeClient(invoker);
}
