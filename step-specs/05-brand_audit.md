# Step: Brand Audit
**BriefStep key:** `brand_audit`

---

## Purpose
Reviews the existing brand elements and captures the rationale behind them.

## Sub-steps

### Company Name Meaning
- Text entry explaining the origin or meaning of the company's name.

### Logo Rationale
- Captures the story behind the current logo.
- Includes chips/tags to highlight specific rationale attributes (e.g. "minimalist", "heritage", "symbol-driven").

### Visual Language Rationale
- Text summary of the existing visual language.
- Adjustable sliders rating the brand on scales:
  - Modern ↔ Classic
  - Trustworthy ↔ Edgy
  - Bold ↔ Subtle

## Data collected
| Field | Type | Notes |
|---|---|---|
| `companyNameMeaning` | string | |
| `logoRationale` | string | |
| `logoRationaleChips` | `string[]` | Selected attribute chips |
| `visualLanguageMood` | `{ liked: string[]; skipped: string[] }` | Slider/mood state |

## Current logic
- Entirely manual (no AI calls).
- Chips are pre-defined options user selects from.
- Sliders are stored as liked/skipped mood strings.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
