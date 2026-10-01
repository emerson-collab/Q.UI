import assert from "node:assert/strict";
import test from "node:test";

import {
  projectQGateGithubThemeIdentity,
  Q_GATE_THEME_SOURCE,
} from "../../../tools/ui_theme/materialize_q_gate_github_theme.ts";

test("Q.Gate GitHub Theme identity projects from exact P1 Capability identity", () => {
  assert.deepEqual(Q_GATE_THEME_SOURCE, {
    capability_ref: "Q.SS.STD.P1.CONTRACT.GATE_CAPABILITY@V0170",
    capability_id: "gate",
    capability_version: "V0170",
    theme_variant: "github",
  });

  assert.deepEqual(projectQGateGithubThemeIdentity(), {
    skeleton: {
      instance_id: "gate_github_skeleton",
      instance_version: "V0170",
      theme_instance_ref: "gate_github_skeleton@V0170",
      theme_phase: "SKELETON",
    },
    render: {
      instance_id: "gate_github_render",
      instance_version: "V0170",
      theme_instance_ref: "gate_github_render@V0170",
      theme_phase: "RENDER",
    },
  });
});
