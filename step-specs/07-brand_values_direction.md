# Step: Brand Values & Direction
**BriefStep key:** `brand_values_direction`

---

## Purpose
Locks in the brand's core values and translates them into two distinct visual creative directions.

## Sub-steps

### Core Values (Value Picker)
- Selection of primary core values that guide the brand (e.g. "integrity", "community", "innovation").

### Visual Direction 1
- A form detailing a creative direction tied to one selected value.
- Attributes captured:
  - Shape: Organic vs Geometric
  - Color: Vibrant vs Muted
  - Motion: Dynamic vs Static
  - Style: Illustrative vs Photographic

### Visual Direction 2
- Same form as Visual Direction 1 but for a second selected value/direction.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `selectedValues` | `string[]` | Chosen core values |
| `visualDirection.value1` | `{ valueName, moodLiked, moodSkipped }` | Direction 1 |
| `visualDirection.value2` | `{ valueName, moodLiked, moodSkipped }` | Direction 2 |

## Current logic
- Values are pre-defined options (pulled from constants).
- Visual direction forms are tied to one selected value each.
- Mood boards use liked/skipped arrays (same pattern as Brand Audit sliders).

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
