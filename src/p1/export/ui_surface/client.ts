import { public_contracts } from "./contracts.ts";
    import type { CreateUiSurfaceRequest, CreateUiSurfaceResponse, ResolveUiSurfaceRequest, ResolveUiSurfaceResponse } from "./types.ts";

    export interface P1OperationInvoker {
      invoke(operation_ref: string, input: unknown): Promise<unknown>;
    }

    export class UiSurfaceClient {
      constructor(private readonly invoker: P1OperationInvoker) {}


async create_ui_surface(input: CreateUiSurfaceRequest): Promise<CreateUiSurfaceResponse> {
  return await this.invoker.invoke(
    public_contracts.operations.create_ui_surface.operation_ref,
    input,
  ) as CreateUiSurfaceResponse;
}

async resolve_ui_surface(input: ResolveUiSurfaceRequest): Promise<ResolveUiSurfaceResponse> {
  return await this.invoker.invoke(
    public_contracts.operations.resolve_ui_surface.operation_ref,
    input,
  ) as ResolveUiSurfaceResponse;
}
    }

    export function create_client(invoker: P1OperationInvoker): UiSurfaceClient {
      return new UiSurfaceClient(invoker);
    }
