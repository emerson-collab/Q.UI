export type JsonObject = Readonly<Record<string, unknown>>;

export interface UiRenderArtifact {
  readonly render_artifact_ref: string;
  readonly ui_surface_ref: string;
  readonly ui_surface_hash: string;
  readonly renderer_provider_ref: string;
  readonly theme_ref: string;
  readonly theme_binding_hash: string;
  readonly target_profile_ref: string;
  readonly content_hash: string;
}
export interface UiSurfaceArtifact extends JsonObject {
  readonly ui_surface_ref: string;
  readonly resolved_target_context: JsonObject;
  readonly content_hash: string;
}
export interface ThemeBindingArtifact extends JsonObject {
  readonly effective_theme_ref: string;
  readonly bindings: readonly JsonObject[];
  readonly content_hash: string;
}
export interface ExecuteUiRenderRequest {
  readonly ui_render_ref: string;
  readonly ui_surface_ref: string;
  readonly render_input: Readonly<{
    ui_surface_artifact: UiSurfaceArtifact;
    theme_binding_artifact: ThemeBindingArtifact;
    renderer_provider_ref: string;
    target_profile_ref: string;
  }>;
}
export interface ExecuteUiRenderResponse { readonly ui_render_artifact: UiRenderArtifact; }
