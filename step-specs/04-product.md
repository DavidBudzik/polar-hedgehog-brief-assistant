# Step: Product / Service Features
**BriefStep key:** `product`

---

## Purpose
Defines the key product or service features that will inform brand messaging and design.

## Sub-steps

### Features (Product/Service)
- **Generative Suggestions:** AI scans the problem space (using Problem Statement + Solution) → suggests 3 key features (Title + Description each).
- **Manual Definition:** User can edit AI suggestions or add features manually.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `features` | `Array<{ title: string; desc: string }>` | |

## Current logic
- AI generates 3 initial feature cards on load.
- Each card is editable inline.
- User can add more cards manually.
- No hard limit on number of features.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
