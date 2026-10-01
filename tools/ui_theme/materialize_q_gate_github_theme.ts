import type {
  RenderThemeMaterial,
  SkeletonThemeMaterial,
  ThemePhase,
} from "../../src/p1/export/ui_theme/types.ts";
import type {
  UIThemeClient,
} from "../../src/p1/export/ui_theme/client.ts";

/**
 * Owner-local deterministic projection for the concrete
 * Q.Gate GitHub-like Theme materialization.
 *
 * Source authority:
 *   Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170
 *
 * Projection:
 *   instance_id      := <capability_id>_<theme_variant>_<theme_phase_lower>
 *   instance_version := <capability_version>
 *   theme_instance_ref := <instance_id>@<instance_version>
 *
 * This is a concrete Q.Gate Theme projection rule, not a Q-wide naming standard.
 */
export const Q_GATE_THEME_SOURCE = Object.freeze({
  capability_ref: "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
  capability_id: "gate",
  capability_version: "V0170",
  theme_variant: "github",
} as const);

export interface ProjectedThemeInstanceIdentity {
  readonly instance_id: string;
  readonly instance_version: string;
  readonly theme_instance_ref: string;
  readonly theme_phase: ThemePhase;
}

export interface ProjectedQGateGithubThemeIdentity {
  readonly skeleton: ProjectedThemeInstanceIdentity;
  readonly render: ProjectedThemeInstanceIdentity;
}

function lowerSnakePart(value: string, field: string): string {
  if (!/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value)) {
    throw new Error(`${field} must be lower_snake_case`);
  }
  return value;
}

function exactVersion(value: string): string {
  if (!/^V[0-9]{4}$/.test(value)) {
    throw new Error("capability_version must match Vdddd");
  }
  return value;
}

function projectPhaseIdentity(
  phase: ThemePhase,
): ProjectedThemeInstanceIdentity {
  const capabilityId = lowerSnakePart(
    Q_GATE_THEME_SOURCE.capability_id,
    "capability_id",
  );
  const variant = lowerSnakePart(
    Q_GATE_THEME_SOURCE.theme_variant,
    "theme_variant",
  );
  const version = exactVersion(
    Q_GATE_THEME_SOURCE.capability_version,
  );
  const phasePart = phase.toLowerCase();

  const instance_id = `${capabilityId}_${variant}_${phasePart}`;
  const instance_version = version;
  const theme_instance_ref = `${instance_id}@${instance_version}`;

  return Object.freeze({
    instance_id,
    instance_version,
    theme_instance_ref,
    theme_phase: phase,
  });
}

export function projectQGateGithubThemeIdentity():
  ProjectedQGateGithubThemeIdentity {
  return Object.freeze({
    skeleton: projectPhaseIdentity("SKELETON"),
    render: projectPhaseIdentity("RENDER"),
  });
}

export const Q_GATE_GITHUB_SKELETON: SkeletonThemeMaterial =
  Object.freeze({
    material_kind: "SKELETON",

    role_presentation: Object.freeze({
      app_header: Object.freeze({
        treatment: "compact_product_header",
        behavior: "fixed_primary_context",
        emphasis: "gate_subject_status_and_actions",
      }),
      app_navigation: Object.freeze({
        treatment: "repository_sidebar",
        behavior: "persistent_on_wide_collapsible_on_narrow",
        selection_emphasis: "muted_fill_plus_weight",
      }),
      app_workspace: Object.freeze({
        treatment: "content_first_workspace",
        behavior: "main_content_with_contextual_secondary",
        primary_priority: "high",
      }),
      app_auxiliary: Object.freeze({
        treatment: "context_panel",
        behavior: "visible_only_when_contextually_required",
      }),
      app_overlay: Object.freeze({
        treatment: "popover_dialog_layer",
        behavior: "non_destructive_overlay",
      }),
    }),

    navigation_treatment: Object.freeze({
      primary_style: "github_repository_navigation",
      row_density: "compact",
      section_dividers: "subtle",
      nested_items: "indented",
      selected_state: "muted_fill",
      overflow: "menu",
    }),

    arrangement_treatment: Object.freeze({
      workspace_model: "main_plus_context",
      primary_alignment: "content_first",
      max_content_width: 1280,
      wide_layout: "two_column_when_secondary_present",
      medium_layout: "main_plus_collapsible_secondary",
      narrow_layout: "single_column_stack",
    }),

    grouping_treatment: Object.freeze({
      primary_group_style: "flat_sections",
      secondary_group_style: "subtle_bordered_sections",
      panel_usage: "selective",
      metadata_grouping: "compact_inline",
      section_heading_weight: 600,
    }),

    progressive_disclosure_treatment: Object.freeze({
      secondary_actions: "overflow_menu",
      advanced_filters: "collapsible",
      evidence_detail: "expandable_details",
      rule_detail: "drilldown_panel",
      destructive_actions: "separate_from_primary",
    }),

    responsive_treatment: Object.freeze({
      wide: Object.freeze({
        navigation: "persistent",
        auxiliary: "contextual",
        workspace_secondary: "visible_when_populated",
      }),
      medium: Object.freeze({
        navigation: "collapsible",
        auxiliary: "drawer",
        workspace_secondary: "stack_or_drawer",
      }),
      narrow: Object.freeze({
        navigation: "drawer",
        auxiliary: "sheet",
        workspace_secondary: "stack",
        header_actions: "overflow",
      }),
    }),

    density_treatment: Object.freeze({
      default_density: "compact",
      navigation_row_height: 32,
      control_height: 32,
      table_row_height: 36,
      section_gap: 24,
      content_gap: 16,
    }),

    interaction_presentation_treatment: Object.freeze({
      hover: "subtle_background_change",
      selected: "muted_fill_plus_weight",
      focus: "visible_focus_ring",
      pressed: "slightly_darker_surface",
      disabled: "reduced_contrast_without_hiding_state",
      evidence_expand: "inline_details",
      rule_drilldown: "context_panel",
    }),
  });

export const Q_GATE_GITHUB_RENDER: RenderThemeMaterial =
  Object.freeze({
    material_kind: "RENDER",

    color: Object.freeze({
      light: Object.freeze({
        canvas: "#ffffff",
        canvas_subtle: "#f6f8fa",
        canvas_inset: "#f6f8fa",
        text_primary: "#1f2328",
        text_secondary: "#656d76",
        text_muted: "#8c959f",
        border_default: "#d0d7de",
        border_muted: "#d8dee4",
        accent: "#0969da",
        accent_hover: "#0860ca",
        success: "#1a7f37",
        warning: "#9a6700",
        danger: "#cf222e",
        gate_pass: "#1a7f37",
        gate_fail: "#cf222e",
        gate_environment_failure: "#9a6700",
      }),
      dark: Object.freeze({
        canvas: "#0d1117",
        canvas_subtle: "#161b22",
        canvas_inset: "#010409",
        text_primary: "#e6edf3",
        text_secondary: "#8d96a0",
        text_muted: "#6e7681",
        border_default: "#30363d",
        border_muted: "#21262d",
        accent: "#2f81f7",
        accent_hover: "#58a6ff",
        success: "#3fb950",
        warning: "#d29922",
        danger: "#f85149",
        gate_pass: "#3fb950",
        gate_fail: "#f85149",
        gate_environment_failure: "#d29922",
      }),
    }),

    typography: Object.freeze({
      ui_font_stack:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono_font_stack:
        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      base_font_size: 14,
      small_font_size: 12,
      body_line_height: 1.5,
      heading_weight: 600,
      body_weight: 400,
      control_weight: 500,
    }),

    spacing: Object.freeze({
      base_unit: 4,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      control_inline_padding: 12,
      control_block_padding: 6,
    }),

    radius_and_shape: Object.freeze({
      control_radius: 6,
      panel_radius: 6,
      dialog_radius: 8,
      pill_radius: 9999,
      shape_language: "restrained_rounded_rectangles",
    }),

    border_and_elevation: Object.freeze({
      border_width: 1,
      border_style: "solid",
      elevation_policy: "border_first_shadow_second",
      popover_shadow: "0 8px 24px rgba(140,149,159,0.20)",
      dialog_shadow: "0 16px 32px rgba(27,31,36,0.20)",
    }),

    iconography_appearance: Object.freeze({
      default_size: 16,
      small_size: 14,
      large_size: 20,
      style: "simple_system_icons",
      stroke_weight: "medium",
      decorative_usage: "minimal",
    }),

    visual_density: Object.freeze({
      default: "compact",
      navigation: "compact",
      forms: "compact",
      tables: "compact",
      evidence_tables: "compact",
      dialogs: "comfortable",
      touch_target_minimum: 32,
    }),

    surface_appearance: Object.freeze({
      header: "canvas_with_bottom_border",
      navigation: "subtle_canvas",
      workspace: "canvas",
      auxiliary: "subtle_canvas_with_border",
      overlay: "canvas_with_border_and_shadow",
      code_surface: "subtle_canvas_monospace",
      evidence_surface: "inset_bordered_surface",
      verdict_surface: "bordered_status_panel",
    }),

    component_appearance: Object.freeze({
      button_primary: Object.freeze({
        background: "accent",
        text: "#ffffff",
        weight: 500,
      }),
      button_secondary: Object.freeze({
        background: "canvas_subtle",
        text: "text_primary",
        border: "border_default",
      }),
      input: Object.freeze({
        background: "canvas",
        border: "border_default",
        focus_border: "accent",
        focus_ring: "accent_translucent",
      }),
      tabs: Object.freeze({
        inactive: "transparent",
        active_indicator: "accent",
        active_weight: 600,
      }),
      table: Object.freeze({
        header_background: "canvas_subtle",
        row_divider: "border_muted",
        hover_background: "canvas_subtle",
      }),
      gate_status_badge: Object.freeze({
        PASS: "success_pill",
        FAIL: "danger_pill",
        ENVIRONMENT_FAILURE: "warning_pill",
      }),
      rule_status: Object.freeze({
        pass: "success_icon_plus_text",
        fail: "danger_icon_plus_text",
        skipped: "muted_icon_plus_text",
      }),
      evidence_ref: Object.freeze({
        treatment: "monospace_link",
        truncation: "middle_when_long",
      }),
      code: Object.freeze({
        font: "mono_font_stack",
        background: "canvas_subtle",
        border: "border_muted",
      }),
      dropdown: Object.freeze({
        background: "canvas",
        border: "border_default",
        shadow: "popover",
      }),
      dialog: Object.freeze({
        background: "canvas",
        border: "border_default",
        shadow: "dialog",
      }),
    }),

    visual_motion_treatment: Object.freeze({
      duration_fast_ms: 80,
      duration_standard_ms: 160,
      easing: "ease-out",
      large_motion: "avoid",
      layout_animation: "minimal",
      reduced_motion: "disable_nonessential_motion",
    }),

    appearance_variants: Object.freeze({
      default: "light",
      supported: Object.freeze(["light", "dark"]),
      high_contrast: "token_override_without_structure_change",
    }),

    accessibility_visual_requirements: Object.freeze({
      focus_indicator: "always_visible_for_keyboard_navigation",
      focus_ring_width: 2,
      focus_ring_offset: 2,
      body_text_contrast_target: "WCAG_AA",
      large_text_contrast_target: "WCAG_AA",
      color_is_not_sole_state_signal: true,
      gate_verdict_requires_text_label: true,
      reduced_motion_supported: true,
      disabled_state_remains_legible: true,
    }),
  });

/**
 * Materializes both Q.Gate Theme phases.
 *
 * subject_ref remains explicit because UI_THEME treats it as an opaque
 * selection subject and does not infer subject ownership/type.
 */
export async function materializeQGateGithubTheme(
  client: UIThemeClient,
  subject_ref: string,
): Promise<{
  readonly identity: ProjectedQGateGithubThemeIdentity;
  readonly skeleton_registration: unknown;
  readonly render_registration: unknown;
  readonly skeleton_selection: unknown;
  readonly render_selection: unknown;
  readonly resolved_skeleton: unknown;
  readonly resolved_render: unknown;
}> {
  if (subject_ref.trim().length === 0) {
    throw new Error("subject_ref must be an explicit nonempty value");
  }

  const identity = projectQGateGithubThemeIdentity();

  const skeleton_registration =
    await client.register_theme_instance({
      instance_id: identity.skeleton.instance_id,
      instance_version: identity.skeleton.instance_version,
      theme_instance_ref: identity.skeleton.theme_instance_ref,
      theme_phase: "SKELETON",
      theme_name: "Q.Gate GitHub-like Skeleton",
      theme_material: Q_GATE_GITHUB_SKELETON,
    });

  const render_registration =
    await client.register_theme_instance({
      instance_id: identity.render.instance_id,
      instance_version: identity.render.instance_version,
      theme_instance_ref: identity.render.theme_instance_ref,
      theme_phase: "RENDER",
      theme_name: "Q.Gate GitHub-like Render",
      theme_material: Q_GATE_GITHUB_RENDER,
    });

  const skeleton_selection =
    await client.set_theme_selection({
      subject_ref,
      theme_phase: "SKELETON",
      selected_theme_instance_ref:
        identity.skeleton.theme_instance_ref,
    });

  const render_selection =
    await client.set_theme_selection({
      subject_ref,
      theme_phase: "RENDER",
      selected_theme_instance_ref:
        identity.render.theme_instance_ref,
    });

  const resolved_skeleton =
    await client.resolve_selected_theme({
      subject_ref,
      theme_phase: "SKELETON",
    });

  const resolved_render =
    await client.resolve_selected_theme({
      subject_ref,
      theme_phase: "RENDER",
    });

  return Object.freeze({
    identity,
    skeleton_registration,
    render_registration,
    skeleton_selection,
    render_selection,
    resolved_skeleton,
    resolved_render,
  });
}
