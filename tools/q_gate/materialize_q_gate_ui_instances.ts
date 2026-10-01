import type { UIThemeClient } from "../../src/p1/export/ui_theme/client.ts";
import {
  materializeQGateGithubTheme,
  projectQGateGithubThemeIdentity,
} from "../ui_theme/materialize_q_gate_github_theme.ts";
import {
  materializeUiSurfaceInstance,
  type SourceP1CapabilityIdentity as SurfaceSourceIdentity,
  type StaticInstanceWriter as SurfaceInstanceWriter,
} from "../ui_surface/materialize_p1_capability_ui_surface_instance.ts";
import {
  materializeUiRenderInstance,
  type SourceP1CapabilityIdentity as RenderSourceIdentity,
  type StaticInstanceWriter as RenderInstanceWriter,
} from "../ui_render/materialize_p1_capability_ui_render_instance.ts";

export const Q_GATE_UI_SOURCE = Object.freeze({
  source_p1_capability_contract_ref:
    "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
  source_capability_id: "gate",
  source_capability_version: "V0170",
} as const satisfies SurfaceSourceIdentity & RenderSourceIdentity);

export const Q_GATE_PRESENTATION_SUBJECT_REF =
  Q_GATE_UI_SOURCE.source_p1_capability_contract_ref;

export const Q_GATE_THEME_INSTANCE_BINDINGS = Object.freeze({
  skeleton: Object.freeze({
    theme_instance_ref: "gate_github_skeleton@V0170",
    content_hash:
      "sha256:617857ff1abba03e4727c1815c22b5191340c03ac561f6050db39aa191f8cf4d",
    static_path:
      "instances/ui_theme/gate_github_skeleton/V0170/theme_instance.json",
  }),
  render: Object.freeze({
    theme_instance_ref: "gate_github_render@V0170",
    content_hash:
      "sha256:f8a6b551487a748c375130e3c87175ae439314fbfaa841dd21bcb0735541e993",
    static_path:
      "instances/ui_theme/gate_github_render/V0170/theme_instance.json",
  }),
} as const);

export interface QGateGovernedUiArtifactVerifier {
  verifyResolvedSurfaceArtifact(artifact: unknown): boolean | Promise<boolean>;
  verifyRenderArtifact(artifact: unknown): boolean | Promise<boolean>;
}

export type QGateUiInstanceWriter =
  SurfaceInstanceWriter & RenderInstanceWriter;

export class QGateUiProjectionError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "QGateUiProjectionError";
    this.code = code;
  }
}

function fail(code: string, message: string): never {
  throw new QGateUiProjectionError(code, message);
}

function objectValue(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("Q_GATE_UI_ARTIFACT_INVALID", "artifact must be an object");
  }
  return value as Record<string, unknown>;
}

/**
 * Concrete Q.Gate UI projection.
 *
 * The Theme identity and subject are fully frozen here. Surface/Render artifacts
 * remain governed inputs because UI_SURFACE/UI_RENDER artifacts must first be
 * produced by their exact operations and verified under their own hash contracts.
 */
export async function materializeQGateUiInstances(
  themeClient: UIThemeClient<unknown>,
  resolvedSurfaceArtifact: unknown,
  renderArtifact: unknown,
  artifactVerifier: QGateGovernedUiArtifactVerifier,
  sourceIdentityVerifier: {
    verifyExactSourceIdentity(
      identity: Readonly<typeof Q_GATE_UI_SOURCE>,
    ): boolean | Promise<boolean>;
  },
  writer: QGateUiInstanceWriter,
): Promise<Readonly<{
  theme_identity: ReturnType<typeof projectQGateGithubThemeIdentity>;
  surface_instance_path: string;
  render_instance_path: string;
}>> {
  const theme_identity = projectQGateGithubThemeIdentity();
  if (
    theme_identity.skeleton.theme_instance_ref
      !== Q_GATE_THEME_INSTANCE_BINDINGS.skeleton.theme_instance_ref
    || theme_identity.render.theme_instance_ref
      !== Q_GATE_THEME_INSTANCE_BINDINGS.render.theme_instance_ref
  ) {
    fail("Q_GATE_UI_THEME_IDENTITY_MISMATCH", "Q.Gate Theme identity drift");
  }

  await materializeQGateGithubTheme(
    themeClient,
    Q_GATE_PRESENTATION_SUBJECT_REF,
  );

  if (!(await artifactVerifier.verifyResolvedSurfaceArtifact(
    resolvedSurfaceArtifact,
  ))) {
    fail(
      "Q_GATE_UI_SURFACE_ARTIFACT_UNVERIFIED",
      "resolved Surface Artifact did not verify under UI_SURFACE authority",
    );
  }

  const surface = objectValue(resolvedSurfaceArtifact);
  if (surface.theme_subject_ref !== Q_GATE_PRESENTATION_SUBJECT_REF) {
    fail(
      "Q_GATE_UI_SURFACE_SUBJECT_MISMATCH",
      "Surface theme_subject_ref must equal the exact Q.Gate presentation subject",
    );
  }

  const surfaceInstance = await materializeUiSurfaceInstance(
    Q_GATE_UI_SOURCE,
    resolvedSurfaceArtifact,
    sourceIdentityVerifier,
    writer,
  );

  if (!(await artifactVerifier.verifyRenderArtifact(renderArtifact))) {
    fail(
      "Q_GATE_UI_RENDER_ARTIFACT_UNVERIFIED",
      "Render Artifact did not verify under UI_RENDER authority",
    );
  }

  const renderValue = objectValue(renderArtifact);
  if (
    renderValue.ui_surface_ref !== surfaceInstance.record.ui_surface_ref
    || renderValue.ui_surface_hash !== surfaceInstance.record.ui_surface_hash
  ) {
    fail(
      "Q_GATE_UI_RENDER_SURFACE_LINEAGE_MISMATCH",
      "Render Artifact must bind the exact Q.Gate Surface ref/hash",
    );
  }
  if (
    renderValue.theme_ref !== Q_GATE_THEME_INSTANCE_BINDINGS.render.theme_instance_ref
    || renderValue.theme_hash !== Q_GATE_THEME_INSTANCE_BINDINGS.render.content_hash
  ) {
    fail(
      "Q_GATE_UI_RENDER_THEME_LINEAGE_MISMATCH",
      "Render Artifact must bind the exact Q.Gate GitHub RENDER Theme ref/hash",
    );
  }

  const surfaceTarget = objectValue(surface.resolved_target_context);
  if (renderValue.target_profile_ref !== surfaceTarget.target_profile_ref) {
    fail(
      "Q_GATE_UI_RENDER_TARGET_MISMATCH",
      "Render target_profile_ref must equal the resolved Surface target profile",
    );
  }

  const renderInstance = await materializeUiRenderInstance(
    Q_GATE_UI_SOURCE,
    renderArtifact,
    sourceIdentityVerifier,
    writer,
  );

  return Object.freeze({
    theme_identity,
    surface_instance_path: surfaceInstance.relative_path,
    render_instance_path: renderInstance.relative_path,
  });
}
