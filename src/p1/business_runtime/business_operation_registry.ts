import { StableRuntimeError, deep_freeze, exact_ref } from "../../p0/runtime_contract.ts";

export type BusinessOperationHandler = (input: unknown) => unknown | Promise<unknown>;

export interface BusinessRegistryEntry {
  readonly object_ref: string;
  readonly object_contract: unknown;
  readonly registry_rule: unknown;
}

export type BusinessEventKind = "EVENT_PUBLISH" | "EVENT_CONSUME";
export type BusinessEventMethodRef = "publish_business_event" | "consume_business_event";

export interface BusinessEventInterfaceBinding {
  readonly capability_contract_ref: string;
  readonly interface_ref: string;
  readonly operation_ref: string;
  readonly surface: "EVENT";
  readonly kind: BusinessEventKind;
  readonly method_ref: BusinessEventMethodRef;
}

export interface BusinessEventFrameworkRequest {
  readonly subject_ref: string;
  readonly input: unknown;
  readonly runtime_context: unknown;
  readonly trace_id: string;
  readonly request_id: string;
}

export interface BusinessEventTransport {
  publish(
    binding: BusinessEventInterfaceBinding,
    request: BusinessEventFrameworkRequest,
    operation_result: unknown,
  ): void | Promise<void>;
}

const operations = new Map<string, BusinessOperationHandler>();
const business_objects = new Map<string, BusinessRegistryEntry>();
const event_interfaces = new Map<string, BusinessEventInterfaceBinding>();

export function register_business_operation(operation_ref: string, handler: BusinessOperationHandler): void {
  const existing = operations.get(operation_ref);
  if (existing !== undefined && existing !== handler) {
    throw new StableRuntimeError("P1_OPERATION_DUPLICATE", "Operation ref already has a different handler");
  }
  operations.set(operation_ref, handler);
}

export function resolve_business_operation(operation_ref: string): BusinessOperationHandler {
  const handler = operations.get(operation_ref);
  if (handler === undefined) throw new StableRuntimeError("P1_OPERATION_NOT_REGISTERED", "Operation ref is not registered");
  return handler;
}

export function registered_business_operation_refs(): readonly string[] {
  return deep_freeze([...operations.keys()].sort());
}

function assert_event_binding(binding: BusinessEventInterfaceBinding): void {
  if (
    !exact_ref(binding.capability_contract_ref)
    || !exact_ref(binding.interface_ref)
    || !exact_ref(binding.operation_ref)
  ) {
    throw new StableRuntimeError("P1_EVENT_BINDING_INVALID", "EVENT binding refs must be exact versioned refs");
  }
  if (!binding.interface_ref.startsWith(`${binding.capability_contract_ref}#/interfaces/`)) {
    throw new StableRuntimeError("P1_EVENT_BINDING_INVALID", "EVENT Interface must be an exact member of its Capability Contract");
  }
  if (!binding.operation_ref.startsWith(`${binding.capability_contract_ref}#/operations/`)) {
    throw new StableRuntimeError("P1_EVENT_BINDING_INVALID", "EVENT Operation must be an exact member of its Capability Contract");
  }
  if (binding.surface !== "EVENT") {
    throw new StableRuntimeError("P1_EVENT_BINDING_INVALID", "EVENT binding surface must be EVENT");
  }
  const expectedMethod = binding.kind === "EVENT_PUBLISH"
    ? "publish_business_event"
    : binding.kind === "EVENT_CONSUME"
      ? "consume_business_event"
      : null;
  if (expectedMethod === null || binding.method_ref !== expectedMethod) {
    throw new StableRuntimeError("P1_EVENT_BINDING_INVALID", "EVENT kind and framework method_ref do not match");
  }
  resolve_business_operation(binding.operation_ref);
}

function same_event_binding(a: BusinessEventInterfaceBinding, b: BusinessEventInterfaceBinding): boolean {
  return a.capability_contract_ref === b.capability_contract_ref
    && a.interface_ref === b.interface_ref
    && a.operation_ref === b.operation_ref
    && a.surface === b.surface
    && a.kind === b.kind
    && a.method_ref === b.method_ref;
}

export function register_business_event_interface(binding: BusinessEventInterfaceBinding): void {
  assert_event_binding(binding);
  const frozen = deep_freeze({ ...binding });
  const existing = event_interfaces.get(binding.interface_ref);
  if (existing !== undefined && !same_event_binding(existing, frozen)) {
    throw new StableRuntimeError("P1_EVENT_BINDING_CONFLICT", "EVENT Interface ref already has a different exact binding");
  }
  event_interfaces.set(binding.interface_ref, frozen);
}

export function resolve_business_event_interface(
  interface_ref: string,
  expected_kind: BusinessEventKind,
): BusinessEventInterfaceBinding {
  const binding = event_interfaces.get(interface_ref);
  if (binding === undefined || binding.kind !== expected_kind) {
    throw new StableRuntimeError("P1_EVENT_BINDING_NOT_REGISTERED", "Exact EVENT Interface binding is not registered for this kind");
  }
  assert_event_binding(binding);
  return binding;
}

function assert_event_request(request: BusinessEventFrameworkRequest): void {
  for (const [field, value] of [
    ["subject_ref", request.subject_ref],
    ["trace_id", request.trace_id],
    ["request_id", request.request_id],
  ] as const) {
    if (typeof value !== "string" || value.length === 0) {
      throw new StableRuntimeError("P1_EVENT_REQUEST_INVALID", `${field} must be a non-empty string`);
    }
  }
  if (request.runtime_context === null || typeof request.runtime_context !== "object") {
    throw new StableRuntimeError("P1_EVENT_REQUEST_INVALID", "runtime_context must be an object");
  }
}

export async function consume_business_event(
  interface_ref: string,
  request: BusinessEventFrameworkRequest,
): Promise<unknown> {
  assert_event_request(request);
  const binding = resolve_business_event_interface(interface_ref, "EVENT_CONSUME");
  const operation = resolve_business_operation(binding.operation_ref);
  return await operation(request.input);
}

export async function publish_business_event(
  interface_ref: string,
  request: BusinessEventFrameworkRequest,
  transport: BusinessEventTransport,
): Promise<unknown> {
  assert_event_request(request);
  const binding = resolve_business_event_interface(interface_ref, "EVENT_PUBLISH");
  const operation = resolve_business_operation(binding.operation_ref);
  const operation_result = await operation(request.input);
  await transport.publish(binding, request, operation_result);
  return operation_result;
}

/**
 * P1 V0181 REGISTRY realization.
 * The registry stores only exact static object_contract + registry_rule material.
 */
export function register_business_object(
  object_ref: string,
  object_contract: unknown,
  registry_rule: unknown,
): BusinessRegistryEntry {
  const existing = business_objects.get(object_ref);
  if (existing !== undefined) {
    if (existing.object_contract !== object_contract || existing.registry_rule !== registry_rule) {
      throw new Error("Business registry object ref already has different static registry material");
    }
    return existing;
  }
  const entry = deep_freeze({ object_ref, object_contract, registry_rule } satisfies BusinessRegistryEntry);
  business_objects.set(object_ref, entry);
  return entry;
}

export function resolve_business_object(resolution_key: string): BusinessRegistryEntry {
  const entry = business_objects.get(resolution_key);
  if (entry === undefined) throw new Error("Business registry resolution key is not registered");
  return entry;
}

export function lookup_business_object(lookup_query: string): BusinessRegistryEntry | undefined {
  return business_objects.get(lookup_query);
}
