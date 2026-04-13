# Step: Setup & Kickoff
**BriefStep key:** `setup`

---

## Purpose
Captures the foundational project information and establishes the tone before the brief begins.

## Sub-steps
1. **Setup** — Collects Company Name, Project Type, and Project Date.
2. **Kickoff** — A confirmation screen bridging setup with the brief questions. Sets the tone.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `companyName` | string | |
| `projectType` | string | Default: `"Branding"` |
| `projectDate` | string | Default: today's date (formatted) |

## Current logic
- Displayed before the sidebar appears (pre-sidebar screens).
- No AI calls on this step.
- Kickoff is a static confirmation — user clicks to proceed.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
