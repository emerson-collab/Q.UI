import {
  LIST_THEME_INSTANCES_OPERATION_REF,
  RESOLVE_SELECTED_THEME_OPERATION_REF,
  SELECTED_THEME_RESOLUTION_INTERFACE_REF,
  SET_THEME_SELECTION_OPERATION_REF,
  THEME_INSTANCE_LIST_INTERFACE_REF,
  THEME_INSTANCE_REGISTRATION_INTERFACE_REF,
  THEME_SELECTION_SET_INTERFACE_REF,
} from "./contracts.ts";
import type {
  ListThemeInstancesRequest,
  RegisterThemeInstanceRequest,
  ResolveSelectedThemeRequest,
  SetThemeSelectionRequest,
} from "./types.ts";

export type UIThemeInterfaceRef =
  | typeof THEME_INSTANCE_REGISTRATION_INTERFACE_REF
  | typeof THEME_INSTANCE_LIST_INTERFACE_REF
  | typeof THEME_SELECTION_SET_INTERFACE_REF
  | typeof SELECTED_THEME_RESOLUTION_INTERFACE_REF;
export type UIThemeRequest = RegisterThemeInstanceRequest | ListThemeInstancesRequest | SetThemeSelectionRequest | ResolveSelectedThemeRequest;
export type UIThemeInterfaceInvoker<TOutcome = unknown> = (interface_ref: UIThemeInterfaceRef, input: UIThemeRequest) => Promise<TOutcome>;

export interface UIThemeClient<TOutcome = unknown> {
  register_theme_instance(input: RegisterThemeInstanceRequest): Promise<TOutcome>;
  list_theme_instances(input: ListThemeInstancesRequest): Promise<TOutcome>;
  set_theme_selection(input: SetThemeSelectionRequest): Promise<TOutcome>;
  resolve_selected_theme(input: ResolveSelectedThemeRequest): Promise<TOutcome>;
}

export function create_ui_theme_client<TOutcome = unknown>(invoke: UIThemeInterfaceInvoker<TOutcome>): UIThemeClient<TOutcome> {
  return Object.freeze({
    register_theme_instance: (input: RegisterThemeInstanceRequest) => invoke(THEME_INSTANCE_REGISTRATION_INTERFACE_REF, input),
    list_theme_instances: (input: ListThemeInstancesRequest) => invoke(THEME_INSTANCE_LIST_INTERFACE_REF, input),
    set_theme_selection: (input: SetThemeSelectionRequest) => invoke(THEME_SELECTION_SET_INTERFACE_REF, input),
    resolve_selected_theme: (input: ResolveSelectedThemeRequest) => invoke(SELECTED_THEME_RESOLUTION_INTERFACE_REF, input),
  });
}

void LIST_THEME_INSTANCES_OPERATION_REF;
void SET_THEME_SELECTION_OPERATION_REF;
void RESOLVE_SELECTED_THEME_OPERATION_REF;
