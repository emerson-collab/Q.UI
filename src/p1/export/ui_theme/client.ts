import {
  UI_THEME_INTERFACE_REF,
} from "./contracts.ts";
import type {
  ResolveUIThemeRequest,
} from "./types.ts";

export type UIThemeInterfaceInvoker<TOutcome = unknown> = (
  interface_ref: typeof UI_THEME_INTERFACE_REF,
  input: ResolveUIThemeRequest,
) => Promise<TOutcome>;

export interface UIThemeClient<TOutcome = unknown> {
  resolve_ui_theme(input: ResolveUIThemeRequest): Promise<TOutcome>;
}

export function create_ui_theme_client<TOutcome = unknown>(
  invoke: UIThemeInterfaceInvoker<TOutcome>,
): UIThemeClient<TOutcome> {
  return Object.freeze({
    resolve_ui_theme(input: ResolveUIThemeRequest): Promise<TOutcome> {
      return invoke(UI_THEME_INTERFACE_REF, input);
    },
  });
}
