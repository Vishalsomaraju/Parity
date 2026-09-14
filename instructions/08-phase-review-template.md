# Phase Review Template (v2)

Use these prompts when sending a completed phase for review. All review
output should follow one rule that resolves a tension in the old version of
this system: **report every finding, but tag it by score-impact. Never
silently omit a finding — deprioritize it in ordering, not in visibility.**
This applies to both Claude review (Prompt A) and Codex review (`10`).

## Prompt A: Claude Review Prompt

Use this with Claude after a phase completes.

```md
Here is what the builder completed for Phase [X]: [Phase Name].

Review it against this rubric:
1. Problem Statement Alignment
2. Code Quality (named gap this cycle — apply extra scrutiny here)
3. Security
4. Efficiency
5. Testing
6. Accessibility

Return:
- what is strong
- what is weak — tag each weak item as high/medium/low score-impact, don't omit low-impact items, just rank them lower
- what is missing
- what likely loses points
- what should be improved before the next phase
- what the next phase should focus on

Be harsh, strategic, and score-oriented. Do not soften Code Quality findings
specifically — that's the category we're trying to fix.
```

## Prompt B: Codex Review Request Template

Use this when bringing the repo/folder to Codex.

```md
Phase completed: [phase number and name]

Goal of the phase:
[brief goal]

Please review this repo/folder for:
- score improvement
- code quality (named gap this cycle — be specific with file paths)
- security
- rubric fit
- missing docs/tests

Tell me:
1. what is strong
2. what is weak — tag each as high/medium/low score-impact
3. what is risky
4. what likely loses points
5. the exact highest-leverage changes to make next
```

## Prompt C: Fast Review Under Time Pressure

Use this when you need the most important fixes only.

```md
Review this phase quickly for maximum score impact.

Only tell me:
1. the top 5 highest-leverage fixes
2. the top 3 risks
3. what to deliberately defer for now (name it, don't just skip mentioning it)
4. whether I should move to the next phase or fix things first
```

## Prompt D: Scope Drift Check

Use this after any phase that felt too broad.

```md
Review the current project and tell me:
1. where scope drift has started
2. which features are hurting score efficiency
3. what should be cut or deferred
4. how to refocus on the highest-scoring path
```

## If Claude and Codex disagree

See the tiebreak rule in `00-overview.md`. Don't resolve disagreement by
defaulting to whichever review you read most recently — that's how silent
unresolved risk slips into a final submission. Log it in `JUDGE_EVIDENCE.md`
under "Known Open Risks" if it isn't resolved before the next phase starts.
