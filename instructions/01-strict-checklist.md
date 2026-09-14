# Strict Submission Checklist (v2)

Use this as a hard pre-submission checklist. Code Quality (B) is the most
granular section here on purpose — it's your named gap.

## A. Problem Alignment

- [ ] The target user is explicitly defined
- [ ] The user problem is stated in one sentence
- [ ] The app solves one primary workflow well
- [ ] The workflow clearly maps to the challenge
- [ ] The output is actionable, not just informative
- [ ] The AI or logic changes behavior based on user context
- [ ] The app still works if AI fails
- [ ] `SOLUTION_BRIEF.md` exists

## B. Code Quality — PRIORITY SECTION

### Architecture
- [ ] Architecture is separated into clear layers (UI / API / domain logic / data)
- [ ] Business logic is isolated from UI and transport code — no calculation or
      decision logic inside React components or route handlers
- [ ] Each layer has one clear responsibility; no layer reaches across another
      to touch a third layer's internals directly

### Typing & validation
- [ ] Type safety is enforced end-to-end (request → domain → response)
- [ ] There is no unnecessary `any` — if `any` exists, a comment explains why
- [ ] Validation exists at all input boundaries (API request bodies, form inputs,
      query params, env vars at startup)
- [ ] Schemas/types are defined once and shared, not duplicated frontend/backend

### Maintainability
- [ ] No file exceeds ~300 lines without a stated reason; large files are split
      by responsibility, not just by line count
- [ ] Naming is clear and consistent (no `data2`, `handleStuff`, `temp`)
- [ ] No dead code, commented-out blocks, or leftover scaffolding in the final repo
- [ ] No duplicated logic between frontend and backend (e.g. validation rules
      written twice)

### Evidence
- [ ] `ARCHITECTURE.md` exists and names the actual layer boundaries with real
      file paths — not placeholders

## C. Security

- [ ] No AI secret is exposed to the browser
- [ ] Sensitive APIs are called from the backend only
- [ ] Input validation exists on all server endpoints
- [ ] AI or write endpoints are rate-limited
- [ ] Secure headers are configured
- [ ] Errors do not leak secrets or internals
- [ ] Anonymous or minimal data storage is used
- [ ] `SECURITY.md` exists (covers both posture and architecture — see `04`)

## D. Efficiency

- [ ] Heavy dependencies are lazy-loaded where appropriate
- [ ] Bundle size was considered deliberately
- [ ] Expensive operations are minimized
- [ ] AI calls have timeout and fallback behavior
- [ ] Repeated expensive results are cached if helpful
- [ ] Rendering is not doing unnecessary work
- [ ] `PERFORMANCE_REPORT.md` exists

## E. Testing

- [ ] Core domain logic has strong unit coverage
- [ ] Coverage gate is enforced in CI at `>=90%` for core logic (see `02`)
- [ ] Invalid input cases are tested
- [ ] AI success path is tested
- [ ] AI fallback path is tested
- [ ] Key UI flow is tested
- [ ] At least one end-to-end path is tested
- [ ] At least one accessibility test exists
- [ ] `TESTING_STRATEGY.md` exists

## F. Accessibility

- [ ] All inputs have labels
- [ ] Groups use `fieldset` and `legend` where appropriate
- [ ] Keyboard navigation works
- [ ] Focus is visible
- [ ] Dynamic updates are announced accessibly
- [ ] Errors are announced accessibly
- [ ] Contrast is acceptable
- [ ] Motion respects reduced-motion preferences
- [ ] Charts have accessible alternatives
- [ ] `ACCESSIBILITY_COMPLIANCE_REPORT.md` exists

## G. CI And Build

- [ ] Lint runs in CI
- [ ] Typecheck runs in CI
- [ ] Backend tests run in CI
- [ ] Frontend tests run in CI
- [ ] Coverage threshold (`>=90%` core logic) is enforced
- [ ] Production build runs in CI
- [ ] Optional Docker health check runs in CI

## H. Judge Packaging

- [ ] `README.md` is concise and strong
- [ ] `JUDGE_EVIDENCE.md` maps repo evidence to the rubric
- [ ] Live demo link is included if available
- [ ] Setup steps are clear
- [ ] Key architectural and security choices are visible quickly

## I. Final Gate

Do not treat the submission as done unless all of these are true:

- [ ] The challenge fit is obvious within 60 seconds
- [ ] The app has one strong, complete workflow
- [ ] The codebase looks maintainable — a stranger could find the domain logic
      in under 30 seconds from the README
- [ ] The security posture looks responsible
- [ ] The repo contains proof, not just claims

## The 8 evidence docs (1:1 with rubric + brief + judge evidence)

No more, no fewer, unless you have a specific reason:

1. `SOLUTION_BRIEF.md` — Problem Alignment
2. `ARCHITECTURE.md` — Code Quality
3. `SECURITY.md` — Security (posture + architecture, merged)
4. `PERFORMANCE_REPORT.md` — Efficiency
5. `TESTING_STRATEGY.md` — Testing
6. `ACCESSIBILITY_COMPLIANCE_REPORT.md` — Accessibility
7. `README.md` — entry point
8. `JUDGE_EVIDENCE.md` — maps all of the above to the rubric
