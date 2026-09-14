# Antigravity Submission System (v2 — PromptWars)

This system has three tiers. Know which tier you're in before using any file.

## Tier 1 — Strategy (Claude-side)

You give Claude the problem statement + `06-starting-prompts.md`. Claude reads
`01` through `05` to generate phase-by-phase prompts. You do not paste `01-05`
into Antigravity — they are Claude's instructions for producing good phases,
not Antigravity's instructions for building.

Files: `01`, `02`, `03`, `04`, `05`, `06`

## Tier 2 — Build (Antigravity-side)

Each phase prompt Claude generates (using the `07` template) is **self-contained**.
Paste only that single phase prompt into Antigravity — never the meta-files.
A phase prompt that needs `00-overview.md`'s philosophy restated inside it to
make sense is a badly-scoped phase prompt; fix the prompt, don't paste more files.

Files: `07` (template Claude uses; output of template goes to Antigravity)

## Tier 3 — Review (Your-side)

After each phase, you run review with Codex using `08` and `10`. At the end,
final audit with `09`.

Files: `08`, `09`, `10`

---

## Primary scoring priority (PromptWars rubric)

1. Problem Statement Alignment
2. Code Quality — **your named gap this cycle; weighted heaviest in checklists below**
3. Security
4. Efficiency
5. Testing
6. Accessibility

## Core rule

Build for the rubric first, then for feature breadth. Code Quality gets the
most granular checklist in this system on purpose — it's not equal-weighted
with the others in practice even though it's rubric item #2, because it's
your stated weak point.

## The three layers judges see

1. **Product behavior** — clear user problem, focused workflow, context-aware AI
2. **Code structure** — clean architecture, strong validation, typed boundaries
3. **Judge evidence** — docs, CI, tests, security explanation, accessibility proof, performance proof

## Non-negotiable principles

- One primary user
- One strong workflow
- AI must be meaningful, must fail gracefully
- No secrets exposed in the frontend
- Validation at every external boundary
- CI must enforce quality
- Docs must map directly to the rubric — 8 docs, 1:1 with rubric items + brief + judge evidence (see `04`)

## Claude vs. Codex tiebreak (Tier 3)

When Claude's phase review (`08` Prompt A) and Codex's review (`10`) disagree:

- **Codex wins on implementation cost and timeline feasibility** — Codex is
  closer to the actual code and the clock.
- **Claude wins on rubric-alignment and scope-fit calls** — whether a feature
  serves Problem Alignment or is drift.
- **If they disagree on Code Quality specifically** (your named gap): do not
  average or split the difference. Re-run `10` Mode C (Security Review) is
  wrong here — instead re-ask Codex with the specific Claude finding quoted,
  and force a direct yes/no on whether it's a real issue. Don't let an
  unresolved Code Quality disagreement carry into the next phase silently.
- Log any unresolved disagreement in `JUDGE_EVIDENCE.md` as a known risk
  rather than letting it disappear because you read one review after the other.
