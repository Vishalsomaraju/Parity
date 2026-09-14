# Starting Prompts (v2)

Use Prompt A at the very beginning of PromptWars. Paste it to Claude along
with the full problem statement — this is the file you actually hand Claude.

## Prompt A: Main Claude Strategist Prompt

```md
You are acting as a competition submission strategist for PromptWars.

I will give you a problem statement. Your job is to help me maximize score on this rubric:

1. Problem Statement Alignment (high)
2. Code Quality (high) — this is my named gap this cycle, weight your output toward it
3. Security (mid)
4. Efficiency (mid)
5. Testing (low)
6. Accessibility (low)

I will paste each phase prompt you generate directly into Antigravity, one at
a time. Each phase prompt must be self-contained — Antigravity will not see
this message, the rubric, or any other context beyond the single phase prompt.
Do not assume Antigravity remembers anything from earlier phases except what's
in the repo itself.

Do not jump into broad feature ideation.

First, analyze the problem and return:
1. the root user problem
2. the best narrow product direction
3. what features should be included
4. what features should be excluded
5. how AI should be used meaningfully
6. the best architecture direction — be specific about where business logic
   will live and how it stays isolated from UI, since Code Quality is the gap
7. the main scoring risks

Then create phase-by-phase build prompts for the builder agent, using the
self-contained phase template format (goal, scope, do/don't, architecture
constraints, testing expectations, docs to create/update, definition of done).

Each phase prompt must:
- have a clear goal
- be scoped tightly
- improve rubric score
- avoid feature creep
- include code quality, security, testing, and docs expectations where relevant
- be pasteable into Antigravity with zero additional context required

Also include, for each phase:
- what success looks like
- which of the 8 evidence docs (SOLUTION_BRIEF, ARCHITECTURE, SECURITY,
  PERFORMANCE_REPORT, TESTING_STRATEGY, ACCESSIBILITY_COMPLIANCE_REPORT,
  README, JUDGE_EVIDENCE) should exist or update after this phase
- what I should ask Codex to review after each phase

Important constraints:
- Prefer one strong workflow over many weak ones
- Prefer depth over breadth
- Avoid generic chatbot behavior unless central to the problem
- Keep sensitive AI usage on the backend when secrets, abuse risk, or cost are involved
- Never expose secrets in the frontend
- Keep business logic testable and maintainable — isolated from UI and transport
- Build evidence docs as part of the solution, not at the very end
- Do not generate more than the 8 evidence docs total across all phases

Problem statement:
[PASTE FULL PROBLEM STATEMENT HERE]
```

## Prompt B: Scope Discipline Prompt

Use this after Claude suggests directions, before the first phase prompt is generated.

```md
Now narrow the solution further.

Return:
1. the single best product direction
2. the exact workflow we should prioritize
3. the top 3 must-have features
4. the top 5 things we should intentionally NOT build
5. why this narrower scope will score higher
```

## Prompt C: Repo Planning Prompt

Use this before implementation begins.

```md
Design the repo and delivery plan for this submission.

Return:
1. frontend/backend split
2. folder structure
3. domain logic boundaries — be explicit, this is where Code Quality is won or lost
4. validation strategy
5. AI integration and fallback strategy
6. security model
7. testing plan (target: >=90% core logic coverage)
8. CI plan
9. which of the 8 evidence docs map to which phase
10. likely scoring risks if implementation is rushed
```

## Prompt D: Fast-Track Prompt For Time Pressure

Use this when submission time decay matters a lot.

```md
We are optimizing for highest score in the shortest time.

Return:
1. the highest-score-per-hour product direction
2. the minimum scope needed to score strongly
3. what should be deferred entirely
4. the most important architecture/security choices to lock early
5. the minimum docs and tests required to appear strong to judges — note
   which of the 8 evidence docs can be thin vs. which (ARCHITECTURE.md,
   given Code Quality is the named gap) need real depth
```
