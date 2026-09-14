# Final Judge Audit Prompt (v2)

Use this at the end, before submission. Same rule as `08`: every finding gets
reported and tagged by score-impact, none get silently dropped.

## Prompt A: Final Claude Judge Simulation

```md
Pretend you are a competition judge reviewing this repo quickly.

Evaluate it against:
1. Problem Statement Alignment
2. Code Quality (this was the named gap going in — assess whether it actually closed)
3. Security
4. Efficiency
5. Testing
6. Accessibility

Return:
1. what is immediately impressive
2. what is unclear
3. what looks risky
4. what likely loses points — tag each as high/medium/low impact, report all of them
5. what evidence is missing or weak
6. the top 5 changes most likely to improve the score before submission
7. whether the repo feels stronger or weaker than a top-tier submission
8. specifically: does Code Quality read as fixed, or still the weak link?

Be realistic and strategic, not polite.
```

## Prompt B: Final Codex Review Request

Use this with Codex before submission.

```md
This is the final pre-submission review.

Please audit the repo like a competition judge and score-maximization reviewer.

Focus on:
- Problem Statement Alignment
- Code Quality (named gap going in — confirm whether it's actually closed, with file paths)
- Security
- Efficiency
- Testing
- Accessibility

Tell me:
1. the strongest parts
2. the weakest parts — tag each by score-impact, report all, don't filter for brevity
3. what still looks under-evidenced
4. what changes give the biggest score increase now
5. what not to waste time on (name it explicitly, don't just leave it out)
6. whether it is submission-ready
```

## Prompt C: Last 2-Hour Triage Prompt

Use this when time decay is severe and only final fixes matter.

```md
We have very limited time before submission.

Review the project and return only:
1. the top 5 fixes worth doing in the next 2 hours
2. the top 3 things to leave alone
3. the top documentation gaps to patch fast (check against the 8-doc set in `01` — don't suggest new docs)
4. the highest-risk issue that could cost score
5. the fastest path to a stronger submission
```

## Prompt D: Submission Readiness Check

```md
Is this submission ready?

Answer with:
1. yes or no
2. the top reasons why
3. the top blockers if no
4. the minimum remaining fixes before submission
5. any unresolved disagreement between Claude review and Codex review that's
   still sitting in JUDGE_EVIDENCE.md's "Known Open Risks" — should it block submission?
```
