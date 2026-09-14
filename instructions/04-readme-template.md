# `README.md` Template

Copy this into the repo root and customize it. This is evidence doc 7 of 8 (see `01`).

```md
# [Project Name]

> [One-sentence value proposition.]

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](#)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](#)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-brightgreen)](#)
[![Security](https://img.shields.io/badge/security-server--side%20AI-blue)](#)

## Live Demo

[Add deployed URL here]

## Challenge Alignment

This submission is built for **[challenge name]** and helps **[target user]** solve **[core problem]** through a focused workflow that lets them **[outcome]**.

## Core Workflow

1. User provides [input]
2. System validates and processes the data
3. Core logic computes [result]
4. AI or decision layer generates [personalized output]
5. User receives [actionable result]

## Why The Solution Is Intelligent

- Uses user-specific context such as [examples]
- Changes recommendations based on [examples]
- Falls back gracefully if AI is unavailable

## Architecture Summary

The project is organized into clear layers:

- `frontend/`: UI, user flows, accessible components
- `backend/`: APIs, validation, AI orchestration, repositories
- `domain/`: pure business rules and calculations, isolated from UI and transport

See: `ARCHITECTURE.md` (covers structure, layering, and code quality standards)

## Security Summary

- All AI calls are server-side
- No sensitive API keys are exposed to the client
- All inbound requests are validated
- Expensive or abusable endpoints are rate-limited
- Graceful fallback exists when external services fail

See: `SECURITY.md` (covers posture and architecture)

## Testing Summary

- Core logic has strong automated test coverage (`>=90%` gate enforced in CI)
- Key UI flows are tested
- AI fallback behavior is tested
- CI enforces quality gates for lint, typecheck, tests, coverage, and build

See: `TESTING_STRATEGY.md`

## Accessibility Summary

- Semantic form structure
- Keyboard support
- Visible focus states
- Dynamic content announcements
- Accessible chart alternatives
- Reduced motion support

See: `ACCESSIBILITY_COMPLIANCE_REPORT.md`

## Performance Summary

- Heavy dependencies are lazy-loaded where appropriate
- Expensive operations are minimized
- AI calls use timeout and fallback behavior
- Bundle/resource usage is deliberate

See: `PERFORMANCE_REPORT.md`

## Tech Stack

Frontend:
- [framework]
- [language]
- [UI / chart / state / validation libraries]

Backend:
- [framework]
- [language]
- [validation / storage / AI integration libraries]

Infrastructure:
- [hosting]
- [CI]
- [cloud services]

## Local Setup

```bash
# clone
git clone [repo-url]
cd [repo-name]

# backend
[backend setup commands]

# frontend
[frontend setup commands]
```

## Evidence Docs

8 docs total, each mapped to one rubric item (see `01` for the full mapping):

- `SOLUTION_BRIEF.md` — Problem Alignment
- `ARCHITECTURE.md` — Code Quality
- `SECURITY.md` — Security
- `PERFORMANCE_REPORT.md` — Efficiency
- `TESTING_STRATEGY.md` — Testing
- `ACCESSIBILITY_COMPLIANCE_REPORT.md` — Accessibility
- `README.md` — this file
- `JUDGE_EVIDENCE.md` — maps all of the above to the rubric directly

## License

[license]
```
