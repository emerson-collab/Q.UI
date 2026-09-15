export function createClient(invoke: (interface_ref: string, input: unknown) => Promise<unknown>) {
  return {
    "resolve_ui_theme": (input: unknown) => invoke("Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/interfaces/ui_theme_invoke", input),
  } as const;
}
