# Step: Problem & Solution
**BriefStep key:** `problem_solution`

---

## Purpose
Defines the core problem the company solves and how it solves it.

## Sub-steps

### Problem Statement
- **AI Website Scan:** User inputs their website URL → AI scans and formulates the problem.
- **Document Upload:** User uploads PDF / PPTX / DOCX → AI extracts the problem.
- **AI Refinement:** Generates a 1–2 sentence draft. User can rate (thumbs up/down) or generate 3 alternatives.

### Solution Description
- **Context-Aware Generation:** AI auto-generates a solution based on the confirmed Problem Statement.
- **Rating & Alternatives:** Same thumbs up/down + alternatives pattern as Problem Statement.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `websiteUrl` | string | Optional — used for AI scan |
| `scanSource` | string | Tracks how data was sourced |
| `problemStatement` | string | |
| `solutionDescription` | string | |

## Current logic
- If `websiteUrl` provided → `aiScanUrl()` is called.
- If document uploaded → `aiAnalyzeFile()` is called.
- Fallback: manual text entry.
- Solution is generated after Problem Statement is confirmed.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
