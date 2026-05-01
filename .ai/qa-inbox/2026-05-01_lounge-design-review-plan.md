# Creator Lounge Design Review Plan QA Input

- Date: 2026-05-01
- Mode: Team Mode planning
- Source meeting: `/Users/zen/Project/plumlabs-context/_meetings/2026-04-29-크리에이터-라운지-디자인-리뷰.md`
- Target Figma canvas: `t0SK7XaNqw8qIY3PpZw4s7/14332:285690` (`[리뷰 완료] Feed and Lounge`)

## Evidence

- Target node is a canvas, not a single frame.
- Relevant current screens inspected:
  - `26360:54933` Creator Case `Discover Lounge Screen`, 375x6026
  - `25830:40998` Consumer `My Lounge Screen`, 375x3216
  - `24025:20532` Consumer `Challenge List Screen`
  - `25972:55974` Consumer `Creator Lounge Chatting List Screen`
  - `24112:14273` Creator Case `Creator Lounge Chatting List Screen`
  - `24112:14086` Creator Case `Creator Lounge Home Screen`
- `Discover Lounge Screen` already moves toward vertical creator exposure, ranking, categories, and repeated creator cards, but many repeated cards/sections are local frames rather than CDS instances.
- `Challenge List Screen` has category chips and list content, but not the full shared search/sort/pin toolbar decided in D4, nor an explicit Challenge Ranking treatment from D3.
- `Creator Lounge Chatting List Screen` still shows challenge thumbnails as conversation previews, conflicting with D8.
- `My Lounge Screen` empty-state guidance is still visually large and lacks a dedicated favorite lounge access pattern from D5.
- D7 is scoped to Lounge Discover empty-state handling. Do not treat the `My Lounge Screen` empty state as the D7 target unless a later evidence pass explicitly links that frame to the discover empty-state flow.

## Meeting Decision Map

| Decision | Summary | Plan Handling |
|---|---|---|
| D1 | Discovery top banner/explanation should shrink; hooking creator content should lead. | Wave 1 |
| D2 | Today's Lounge should favor vertical multi-creator exposure; horizontal use needs visible affordance. | Wave 1 |
| D3 | Add Creator Ranking and Challenge Ranking; ranking criteria are not yet defined. | Wave 1 for Creator Ranking; Wave 3 for Challenge Ranking in `24025:20532` |
| D4 | Challenge List and ChallengeTalk need shared search, sort, and favorite/pin tools. | Wave 3 |
| D5 | My tab needs favorite lounge access for users with many joined lounges. | Wave 2 |
| D6 | Lounge activity/dynamic expression is deferred until signal format is defined. | Backlog, no direct edit |
| D7 | Discover empty lounge state should shrink guidance and strengthen curation exposure. | Wave 1 if a discover empty-state frame is present; otherwise blocker/backlog |
| D8 | Chat preview should use grouped user profiles, not challenge thumbnails. | Wave 4 |
| D9 | Updates/comment visibility is deferred to Updates Detail work. | Backlog, no direct edit |
| D10 | Paywall should use white/simple background and emphasize selected state only. | Out of current canvas/screen scope unless paywall frames are explicitly selected |
| D11 | INVITE+ entry needs a separate special design; naming is provisional. | Out of current canvas/screen scope unless invite frames are explicitly selected |
| D12 | CP recharge model is confirmed; implementation details remain for later usability pass. | Out of current canvas/screen scope; no CP UI invention |
| D13 | Creator grade badge is deferred; only badge-area exploration is allowed later. | Backlog, no badge policy invention |

## Proposed Implementation Waves

1. **Wave 0: Preflight**
   - Confirm Figma write path availability.
   - Snapshot/export affected screens to `exports/2026-05-01_lounge-design-review/before/`.
   - Build a component candidate map from the current product file plus CDS library.
   - If no Figma write path is available, stop before mutation and report the blocker.

2. **Wave 1: Discover Tab**
   - Keep one strong featured creator module, reduce non-hooking explanatory/banner weight.
   - Preserve vertical creator exposure as the default direction for Today's Lounge.
   - Add/clarify Creator Ranking in Discover without inventing ranking algorithms.
   - Handle D7 only on a discover empty-state surface. If no discover empty-state frame is found in the current canvas, record a blocker/backlog item instead of modifying the My tab as a substitute.
   - Keep category-specific lists eligible for horizontal scrolling only when affordance is visible.
   - Use existing CDS instances first: `Spotlight Creator Card`, `Profile Card`, `Popular Lounge Card`, `Lounge Card`, `Content Header`, `Button`, `Badge`, `TabsList`, `Navbar`, `TabBar`.
   - End checkpoint: screenshot export to `exports/2026-05-01_lounge-design-review/wave-1/`; if visual structure regresses or D1-D3 Creator Ranking/D7 discover empty-state handling is not visible or explicitly blocked, revert this wave before continuing.

3. **Wave 2: My Tab**
   - Add Favorite Lounges entry/section for fast access.
   - If My tab empty guidance is adjusted, label it as My-tab information hierarchy work, not D7 discover empty-state handling.
   - Prioritize curated/favorite lounge access immediately below the My tab state.
   - End checkpoint: screenshot export to `exports/2026-05-01_lounge-design-review/wave-2/`; if D5 is not visible, revert this wave before continuing.

4. **Wave 3: Challenge List Ranking + ChallengeTalk Tooling**
   - Add/clarify Challenge Ranking in `24025:20532` without inventing ranking algorithms, scoring formulas, or metric labels beyond rank/order presentation.
   - Add shared toolbar pattern: search, sort, favorite/pin.
   - Apply consistently to `Challenge List Screen` and `Creator Lounge Chatting List Screen`.
   - Use CDS controls where possible: Input/Search, Button/Icon, Select Menu/Dropdown, Badge/Notification Badge, Lucide/Icon Scaler.
   - End checkpoint: screenshot export to `exports/2026-05-01_lounge-design-review/wave-3/` for `24025:20532`, `25972:55974`, and `24112:14273`; Challenge Ranking must be visible in Challenge List and both target list screens must show the same tool pattern, otherwise stop and repair before Wave 4.

5. **Wave 4: Chat Preview Format**
   - Replace challenge thumbnail preview with grouped user avatars.
   - Keep unread/new markers and timestamps, but make the card read as a group conversation.
   - Preserve row touch target >=44px.
   - End checkpoint: screenshot export to `exports/2026-05-01_lounge-design-review/wave-4/` for `25972:55974` and `24112:14273`; `Chat Preview Format` QA confirms avatar group is the primary identity and row bounds/touch targets pass.

6. **Wave 5: Componentization Rules**
   - Reuse existing CDS components if fit is sufficient.
   - Extend existing CDS components when the pattern is repeated and belongs to an existing context group.
   - Create a new CDS composed component only if no existing component fits and the pattern has 3+ expected uses.
   - If a CDS component is created/extended, replace the original use sites before calling the task complete.
   - This is not a late-only cleanup wave. During Waves 1-4, if a new or extended CDS component is needed, pause the current wave before mutation, run Creation Gate, perform the component mutation, collect Completion Evidence and use-site replacement, then continue the current wave.
   - Any CDS creation/extension must follow `.claude/rules/component-contract.md` Creation Gate with a `CreationDecision` record:
     - `sourceUnitNodeId`
     - `candidateComponents`
     - `componentGroupNodeId`
     - `componentGroupPath`
     - `placementReason`
     - `decision`
     - `decisionReason`
     - `rejectedOptions`
     - `variantExplosionRisk`
     - `exceptions`
   - Blocker records go to `reviews/2026-05-01_lounge-design-review.md` under `## Blockers` with:
     - `pattern`
     - `sourceNodeIds`
     - `reason`
     - `blockedAction`
     - `requiredUserAction`
     - `revisitCondition`

7. **Wave 6: QA**
   - Export before/after screenshots.
   - Check CDS coverage, local frames, naming, layout, token binding, touch target, and visual regressions.
   - Record exceptions for intentionally local/one-off editorial frames.
   - Enforce `.claude/rules/naming-policy.md`: Title Case spacing, no `Container`/`Wrapper`/wrapper `Content`, no auto-generated `Frame *`, no slash in layer names, Lucide icon consistency.
   - For any created/extended CDS component, require `.claude/rules/component-contract.md` Completion Evidence:
     - `sourceScreenshot`
     - `componentScreenshot`
     - `visualDiffSummary`
     - `propertyIntegrity`
     - `propertyReferenceMatrix`
     - `instanceOverrideProbe`
     - `useSiteReplacement`
     - `layoutContract`
     - `tokenBindingSummary`
     - `responsiveProbe`
     - `longTextProbe`
     - `boundsCheck`
   - Final screenshot exports go to `exports/2026-05-01_lounge-design-review/after/`.
   - Final review report goes to `reviews/2026-05-01_lounge-design-review.md`.

## Execution Order and Failure Handling

- Figma mutations must run sequentially: Wave 1 -> QA checkpoint -> Wave 2 -> QA checkpoint -> Wave 3 -> QA checkpoint -> Wave 4 -> QA checkpoint -> Wave 5 only if still needed -> Wave 6 final QA.
- Component creation/extension gates can interrupt any wave before the component mutation; they must complete before the wave resumes.
- Do not parallelize Figma write calls.
- If any wave fails a checkpoint, stop further waves, restore the affected screen from the before/wave snapshot or reverse the last mutation batch, then rerun that wave's QA.
- If an imported CDS component cannot be used because publish/update is missing, record it as a blocker instead of replacing it with a detached local approximation.
- Do not edit paywall, INVITE+, CP, Updates Detail/comment visibility, or creator grade badge surfaces in this canvas unless those frames are explicitly added to scope later.

## Gates

- G1: Every implemented change maps to a meeting decision D1-D13 or is marked as a non-applied/backlog item.
- G2: No new ranking metric, paid tier logic, grade badge policy, or CP policy detail is invented.
- G3: CDS instance coverage improves or a blocker is recorded for every repeated local UI pattern.
- G4: Challenge list and ChallengeTalk both receive the same shared tool pattern if Wave 3 is executed.
- G5: Chat preview no longer uses challenge thumbnails as the primary conversation identity if Wave 4 is executed.
- G6: Figma write operations are sequential, snapshot-backed, and verified with screenshot exports.

## Team Recommendation

Proceed in waves, starting with `Discover Lounge Screen` and `My Lounge Screen`, then apply Challenge Ranking, shared toolbar, and chat preview changes to the related list screens. Do not redesign paywall, INVITE+, CP, or grade badge surfaces in this target canvas unless those frames are explicitly selected later; keep them out of current canvas scope.
