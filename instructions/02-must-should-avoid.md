# Must / Should / Avoid (v2)

## Must

- Must prioritize problem alignment over feature count
- Must define one primary user persona
- Must build one strong core workflow
- Must keep AI meaningful and context-aware
- Must keep AI behind the backend when secrets or abuse risk exist
- Must validate all external input
- Must enforce quality with CI
- Must isolate business logic from UI — Code Quality is the named gap this
  cycle; this is the single highest-leverage rule for closing it
- Must provide a deterministic fallback when AI fails
- Must document architecture, testing, security, accessibility, and performance
  — in exactly the 8 docs listed in `01`, not more
- Must include `JUDGE_EVIDENCE.md`
- Must make the submission easy for judges to evaluate quickly

## Should

- Should use strict typing everywhere practical
- Should use pure functions for core calculations and decision logic
- Should lazy-load heavy dependencies like charts or maps
- Should set a hard coverage gate at `>=90%` for core logic — kept high
  deliberately; Testing is rubric-low but a missed coverage gate is an easy,
  visible miss that costs credibility on Code Quality too
- Should include at least one end-to-end test
- Should include at least one automated accessibility test
- Should use secure headers
- Should store only anonymous or minimal user data
- Should document fallback and failure-handling behavior clearly
- Should keep README short, concrete, and evidence-linked

## Avoid

- Avoid client-side AI key exposure
- Avoid direct browser calls to paid AI APIs
- Avoid generic chatbot behavior with weak problem relevance
- Avoid broad feature sprawl
- Avoid giant unstructured files
- Avoid duplicated logic across frontend and backend
- Avoid skipping validation because the UI already validates
- Avoid relying on visuals alone to impress judges
- Avoid claiming performance, security, or accessibility without proof
- Avoid a submission that works only when third-party services behave perfectly
- Avoid writing more than the 8 evidence docs in `01` — extra docs dilute
  judge attention and cost time you don't have this cycle

## Tradeoff Rule

When forced to choose:

- Choose stronger alignment over more features
- Choose cleaner architecture over faster hacks — this is the tradeoff that
  matters most this cycle given Code Quality is the named gap
- Choose safer backend mediation over frontend convenience
- Choose explicit proof over hidden quality
- Choose a complete narrow workflow over a broad unfinished platform
