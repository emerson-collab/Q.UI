# Q.UI — P0-P4 Skeleton + UI Capability Overlays

Q.UI uses the current Q P0-P4 reusable implementation skeleton. UI Host, Module, Render, and Surface remain concrete P1 Capability overlays.

## Active-version rule

The latest version in each authoritative Contract folder is active. `${CURRENT}` is only a governed pre-materialization resolver; committed runtime/spec bindings use exact refs. Contract identity and physical DRT identity remain separate.

## Active reusable Contract bindings

- Repository Directory Skeleton: `Q.SS.STD.META.CONTRACT.REPOSITORY_DIRECTORY_SKELETON@V0145`
- P0 Runtime Core: `Q.SS.STD.P0.CONTRACT.RUNTIME_CORE@V0134`
- P1 Business Runtime: `Q.SS.STD.P1.CONTRACT.BUSINESS_RUNTIME@V0183`
- P2 Cross-Domain Realization: `Q.SS.STD.P2.CONTRACT.CROSS_DOMAIN_REALIZATION@V0125`
- Q.Workflow Domain execution declaration: `Q.WORKFLOW.CONTRACT.DOMAIN@V0116`
- Q.Workflow Capability: `Q.WORKFLOW.CONTRACT.CAPABILITY.WORKFLOW@V0114`

## Physical DRT baseline

- P0 `V0134`
- P1 `V0183`
- P2 `V0125`
- P3 `V0145`
- P4 `V0141`

UI Capability contracts and exact hashes remain Q.UI-owned overlays. Skeleton replacement updates only reusable runtime/realization bindings. UI semantics and explicit Theme dependencies are not rewritten. Verification execution remains Q.Workflow-owned and final verdict authority remains Q.Gate-owned.

## P2 mount/dependency separation

Mount-only P2 realization, restart recovery, and mounted execution are independent of a receiving-P1 dependency declaration. Declared P1 dependency realization remains a separate optional closure over an already ACTIVE mount. UI Capability semantics remain Q.UI-owned P1 overlays; reusable realization/runtime support follows the canonical Skeleton.
