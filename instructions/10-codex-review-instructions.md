# Codex Review Instructions (v2)

Use this file when giving the repo or folder to Codex for review during the
PromptWars sprint.

The goal of Codex is not just to review code correctness. The goal is to
review for **score maximization** under the competition rubric, with extra
weight on Code Quality since that's the named gap this cycle.

## Codex Role

Codex should act as:
- rubric reviewer
- architecture reviewer
- security reviewer
- score-maximization advisor
- final polish advisor

Codex should review the repo as if:
- submission time matters
- score decay matters
- feature creep is dangerous
- the app needs to impress judges quickly

Codex should optimize for:
- highest-score-per-hour improvements
- early detection of point-losing mistakes
- practical, high-leverage recommendations

---

## Rubric To Review Against

1. Problem Statement Alignment `(high)`
2. Code Quality `(high — named gap, apply extra scrutiny)`
3. Security `(mid)`
4. Efficiency `(mid)`
5. Testing `(low)`
6. Accessibility `(low)`

Codex should not treat all categories equally. If time is limited, prioritize
findings that affect problem alignment, code quality, and security — in that
order, with code quality getting first claim on review time among the three
given it's the stated gap.

---

## What Codex Must Review

### 1. Problem Statement Alignment

Review whether the product clearly solves the challenge, whether the target
user is obvious, whether the main workflow is focused and complete, whether
the AI or intelligent logic is meaningful, whether the output is actionable,
whether there is feature creep, whether any implemented feature feels
off-problem or low-value.

Codex should identify: weak alignment, unnecessary features, unclear
workflow decisions, generic AI behavior, parts that may confuse judges.

### 2. Code Quality — review this first and most thoroughly

Review folder structure, separation of concerns, domain logic location,
validation boundaries, file size and maintainability, clarity of naming, use
of typing, duplication, architectural consistency.

Codex should identify, with file paths, not generalities:
- mixed concerns (business logic inside components or route handlers)
- large unmaintainable files (over ~300 lines without a stated reason)
- logic leaking into UI
- unclear module boundaries
- poor abstractions
- unnecessary complexity
- unjustified `any` usage
- duplicated logic between frontend and backend

If Code Quality looks fine, say specifically why — point to the file that
demonstrates clean separation, don't just clear the category.

### 3. Security

Review frontend secret exposure, backend mediation for AI and paid APIs,
input validation coverage, rate limiting on sensitive endpoints, secure
headers, storage of personal data, leakage in logs or error responses,
unsafe assumptions around auth or trust boundaries.

Codex should identify: any client-exposed secret risk, direct browser
AI/API usage when it should be server-side, weak validation, missing rate
limits, risky third-party integration behavior.

### 4. Efficiency

Review heavy dependencies, lazy loading opportunities, rendering
inefficiencies, excessive data fetching, large bundle risks, AI
timeout/fallback strategy, blocking work in main request paths, duplicate
expensive computations.

Codex should identify: high-cost low-value features, unnecessary
rerenders, missed lazy loading, inefficient request flow, avoidable latency
risks.

### 5. Testing

Review core logic coverage, presence of fallback tests, validation tests,
key workflow tests, CI test enforcement, coverage gates (target `>=90%` on
core logic).

Codex should identify: untested critical logic, untested fallback paths,
missing integration tests, weak or misleading coverage setups.

### 6. Accessibility

Review labels, keyboard flow, focus visibility, semantic structure,
announcements for dynamic updates, accessible chart alternatives, contrast
and motion considerations.

Codex should identify: missing semantic support, inaccessible dynamic
behavior, inaccessible visualizations, easy high-impact accessibility fixes.

---

## What Codex Should Output

1. Strongest aspects — what is already helping score
2. Highest-risk issues — what is likely losing points
3. Highest-leverage improvements — changes that most improve score quickly
4. Lower-priority findings — **report these too, just ranked lower; do not
   omit them entirely.** This replaces the old instruction to "avoid
   low-value nitpicks," which conflicted with "be blunt about weak areas."
   The resolution: blunt and complete, but ordered by impact.
5. Submission readiness — ready for next phase or final submission?

Rank issues by severity, score impact, and implementation cost — explicitly,
not just in prose order.

---

## Review Modes

### Mode A: Phase Review
After each major build phase. Focus on whether the phase achieved its goal,
what is still weak, what must be fixed before the next phase.

### Mode B: Score Review
Score maximization advice. Focus on what is costing points, what gives the
best score increase now, what to skip under time pressure.

### Mode C: Security Review
After AI integrations, auth, storage, or API work. Focus on secrets,
validation, rate limiting, backend/frontend trust boundaries.

### Mode D: Final Review
Before submission. Focus on whether the repo feels top-tier, whether
documentation proves the claims, whether any major category still feels
undercooked — specifically confirm whether Code Quality, the named gap,
actually closed.

---

## How To Ask Codex For Review

```md
Phase completed: [phase number and name]

Goal of this phase:
[brief description]

Review mode:
[phase review / score review / security review / final review]

Time pressure:
[low / medium / high]

Please review this repo/folder for:
- rubric alignment
- score improvement
- code quality (named gap — file-path-specific findings only)
- security
- missing tests/docs (check against the 8-doc set, don't suggest new ones)

Tell me:
1. what is strong
2. what is weak — tag by score-impact, report everything
3. what is risky
4. what likely loses points
5. the exact highest-leverage changes to make next
6. what is lower priority but still worth knowing (don't drop it, just rank it last)
```

---

## Time-Pressure Rules For Codex

If time pressure is high:
- still report every finding, but lead with the top 5 by impact
- prefer structural/rubric/security findings at the top of the list
- explicitly name what's being deprioritized and why — not silently dropped

If time pressure is low:
- give deeper architectural and documentation feedback
- surface medium-priority improvements with the same specificity as high-priority ones

---

## Special Instructions For Codex

Codex should:
- be blunt about weak areas, with no exception for Code Quality specifically
- report every finding and rank by impact — never omit a finding for being low-value
- prioritize practical improvements over theoretical perfection
- look for evidence gaps as well as code gaps
- review docs, CI, tests, and architecture, not just source code
- assume the repo is being judged quickly by humans

Codex should not:
- recommend broad rewrites unless truly necessary
- encourage extra features that weaken focus
- suggest evidence docs outside the fixed 8-doc set in `01`

---

## If Claude's review and Codex's review disagree

See the tiebreak rule in `00-overview.md`:
- Codex wins on implementation cost / timeline feasibility
- Claude wins on rubric-alignment / scope-fit calls
- On Code Quality specifically: re-ask Codex with Claude's exact finding
  quoted, force a direct yes/no, don't average the two opinions
- Anything still unresolved goes into `JUDGE_EVIDENCE.md`'s "Known Open
  Risks" section rather than disappearing

---

## Final Review Standard

Before final submission, Codex should answer:

1. Does the product clearly solve the challenge?
2. Does the codebase look maintainable and intentional? Has Code Quality —
   the named gap — actually closed, with specific evidence?
3. Does the security posture look responsible?
4. Is the AI usage meaningful and graceful under failure?
5. Is there enough proof for judges in the 8 evidence docs and CI?
6. What are the top remaining point-losing weaknesses — all of them, ranked,
   not just the top one or two?

If any of those answers are weak, Codex should say so clearly and recommend
the fastest meaningful fixes.
