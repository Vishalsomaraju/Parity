# `JUDGE_EVIDENCE.md` Template

Copy this into the repo root and replace placeholders with real file paths and proof.
This is evidence doc 8 of 8 — the map from the other 7 to the rubric (see `01`).

```md
# Judge Evidence

This document maps the submission directly to the evaluation rubric.

## 1. Problem Statement Alignment

### Evidence

- The target user is: [user]
- The core problem is: [problem]
- The main workflow is: [workflow]
- The product delivers: [outcome]
- The intelligent logic adapts based on: [context examples]

### Proof Locations

- `SOLUTION_BRIEF.md`
- `[relevant file path]`
- `[relevant file path]`

## 2. Code Quality

This is the named gap this cycle — give this section the most specific,
file-path-backed evidence in the document. Vague claims here cost more than
vague claims elsewhere.

### Evidence

- Architecture is separated into [layers] — name them explicitly
- Core business logic lives in [path] and contains zero UI or transport code
- Validation lives in [path]
- Types/schemas are defined once in [path] and shared, not duplicated
- UI and service concerns are separated cleanly — point to one concrete example
  of a component that does NOT contain business logic
- No file exceeds ~300 lines without a stated reason

### Proof Locations

- `ARCHITECTURE.md`
- `[relevant file path]`
- `[relevant file path]`
- `[relevant file path]`

## 3. Security

### Evidence

- Sensitive AI calls are handled server-side
- No secrets are exposed in the client
- Request bodies are validated
- Expensive endpoints are rate-limited
- Failure handling does not expose internals

### Proof Locations

- `SECURITY.md`
- `[relevant file path]`
- `[relevant file path]`

## 4. Efficiency

### Evidence

- Heavy dependencies are lazy-loaded where appropriate
- Expensive operations are minimized
- AI calls have timeout and fallback behavior
- Rendering and bundle strategy were considered deliberately

### Proof Locations

- `PERFORMANCE_REPORT.md`
- `[relevant file path]`
- `[relevant file path]`

## 5. Testing

### Evidence

- Core logic is covered by automated tests (`>=90%` gate enforced in CI)
- Invalid inputs are tested
- AI fallback behavior is tested
- Key UI flow is tested
- CI enforces coverage/build quality gates

### Proof Locations

- `TESTING_STRATEGY.md`
- `[test file path]`
- `[workflow file path]`
- `[ci workflow path]`

## 6. Accessibility

### Evidence

- Inputs are properly labeled
- Keyboard navigation is supported
- Dynamic updates are announced accessibly
- Charts have accessible alternatives
- Accessibility checks are automated

### Proof Locations

- `ACCESSIBILITY_COMPLIANCE_REPORT.md`
- `[component path]`
- `[test path]`

## Known Open Risks

List anything Claude and Codex review disagreed on and didn't fully resolve
(see tiebreak rule in `00-overview.md`). Don't hide unresolved disagreement —
an honest open-risk note reads better to a judge than a confident claim that
doesn't hold up.

- [risk, if any]

## Summary

This submission is designed to be:

- Strongly aligned to the challenge
- Maintainable and well-structured
- Safe in its use of AI and cloud services
- Efficient in resource usage
- Tested and validated
- Accessible and inclusive
```
