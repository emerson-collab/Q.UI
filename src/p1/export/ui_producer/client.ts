import { public_contracts } from "./contracts.ts";
import type {
  ProduceAppRequest,
  ProduceAppResponse,
  ProducePlatformRequest,
  ProducePlatformResponse,
} from "./types.ts";

export interface P1OperationInvoker {
  invoke(operation_ref: string, input: unknown): Promise<unknown>;
}

export class UiProducerClient {
  constructor(private readonly invoker: P1OperationInvoker) {}

  async produce_app(input: ProduceAppRequest): Promise<ProduceAppResponse> {
    return await this.invoker.invoke(public_contracts.operations.produce_app.operation_ref, input) as ProduceAppResponse;
  }

  async produce_platform(input: ProducePlatformRequest): Promise<ProducePlatformResponse> {
    return await this.invoker.invoke(public_contracts.operations.produce_platform.operation_ref, input) as ProducePlatformResponse;
  }
}

export function create_client(invoker: P1OperationInvoker): UiProducerClient {
  return new UiProducerClient(invoker);
}
