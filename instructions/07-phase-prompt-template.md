# Phase Prompt Template (v2 — self-contained)

This is what Claude fills in and what you paste into Antigravity. Nothing
else goes into Antigravity alongside it — not `00-overview.md`, not the
rubric, not the must/should/avoid list. If a phase prompt needs those to make
sense, the phase prompt is under-specified; push Claude to make it complete
on its own.

```md
# Phase [X]: [Phase Name]

## Goal

[Describe the exact outcome of this phase in 2-4 sentences.]

## Why This Matters For The Rubric

- Problem Statement Alignment: [how this phase improves alignment]
- Code Quality: [how this phase improves structure/maintainability — be specific, this is the named gap]
- Security: [how this phase improves safety, if applicable]
- Efficiency: [how this phase improves resource usage, if applicable]
- Testing: [what validation should be added]
- Accessibility: [what accessible behavior should be included]

## Scope

In this phase, do:
- [task]
- [task]
- [task]

Do not do:
- [excluded task]
- [excluded task]

## Implementation Instructions

- [detailed instruction]
- [detailed instruction]
- [detailed instruction]

## Architecture Constraints

- Keep business logic out of large UI components and route handlers — it
  belongs in a domain/service layer with no UI or transport imports
- Validate all external inputs (request bodies, query params, env vars)
- Keep sensitive integrations on the backend
- Preserve a clear fallback path if external services fail
- No file exceeds ~300 lines without a stated reason in a comment
- No `any` without a comment explaining why

## Testing Expectations

- Add or update tests for [module/flow]
- Verify invalid input handling for [case]
- Verify fallback behavior for [case]
- Target: this phase's new core logic stays within the >=90% coverage gate

## Docs To Create Or Update

Only from this fixed set of 8 — name exactly which ones this phase touches:
- [ ] `SOLUTION_BRIEF.md`
- [ ] `ARCHITECTURE.md`
- [ ] `SECURITY.md`
- [ ] `PERFORMANCE_REPORT.md`
- [ ] `TESTING_STRATEGY.md`
- [ ] `ACCESSIBILITY_COMPLIANCE_REPORT.md`
- [ ] `README.md`
- [ ] `JUDGE_EVIDENCE.md`

## Files Likely To Change

- [path]
- [path]
- [path]

## Definition Of Done

- [clear measurable condition]
- [clear measurable condition]
- [clear measurable condition]

## After This Phase

Take this completed phase to Codex using `08` Prompt B or C, and to Claude
using `08` Prompt A. Review mode for `10`: [phase review / score review /
security review]. Time pressure: [low / medium / high].
```

## Minimal Short Version

Use this only if the full version above is genuinely too slow to produce —
prefer the full version when Code Quality risk is non-trivial in this phase.

```md
Implement Phase [X]: [Name].

Goal:
[goal]

Must do:
- [task]
- [task]
- [task]

Must not do:
- [excluded task]
- [excluded task]

Constraints:
- keep scope tight
- isolate business logic from UI and transport (no exceptions)
- keep sensitive integrations server-side
- no file over ~300 lines without a stated reason
- add tests where relevant, target >=90% coverage on new core logic
- update docs where relevant, only from the 8-doc set

Definition of done:
- [condition]
- [condition]
- [condition]
```
