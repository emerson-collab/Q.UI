# Q.UI — P0-P4 Skeleton + UI Capability Overlays

Q.UI uses the current Q P0-P4 reusable implementation skeleton. UI Host, Module, Render, and Surface remain concrete P1 Capability overlays.

## Active-version rule

The latest version in each authoritative Contract folder is active. `${CURRENT}` is only a governed pre-materialization resolver; committed runtime/spec bindings use exact refs. Contract identity and physical DRT identity remain separate.

## Active reusable Contract bindings

- Repository Directory Skeleton: `Q.SS.STD.META.CONTRACT.REPOSITORY_DIRECTORY_SKELETON@V0136`
- P0 Runtime Core: `Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134`
- P1 Business Runtime: `Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0179`
- P2 Cross-Domain Realization: `Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@V0123`
- Q.Workflow Domain execution declaration: `Q.WORKFLOW.CONTRACT.DOMAIN@V0116`
- Q.Workflow Capability: `Q.WORKFLOW.CONTRACT.CAPABILITY.WORKFLOW@V0114`

## Physical DRT baseline

- P0 `V0134`
- P1 `V0175`
- P2 `V0119`
- P3 `V0145`
- P4 `V0141`

UI Capability contracts and exact hashes remain Q.UI-owned overlays. Skeleton replacement updates only reusable runtime/realization bindings. UI semantics and explicit Theme dependencies are not rewritten. Verification execution remains Q.Workflow-owned and final verdict authority remains Q.Gate-owned.
