# Step: Summary & Submission
**BriefStep key:** `summary`

---

## Purpose
Presents a final overview of the complete brief and triggers submission.

## Sub-steps

### Summary Review
- Displays all collected data: keywords, messages, competitors, UVPs, references, values, and visual directions.
- User reviews and confirms before submitting.

### Submission
- Final submit action.
- Success screen: "Brief Submitted!" with a statistical breakdown of brief components.

## Data collected
- No new data collected on this step — read-only display of `BriefData`.

## Current logic
- Summary renders all fields from `BriefData` in a structured layout.
- Submit triggers the `SubmittedScreen` component in `App.tsx`.
- No backend persistence wired yet (Phase 5 in roadmap).

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
