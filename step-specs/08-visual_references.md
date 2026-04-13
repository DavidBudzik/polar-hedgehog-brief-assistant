# Step: Visual References
**BriefStep key:** `visual_references`

---

## Purpose
Captures tangible visual inspirations and hard aesthetic boundaries to guide the design team.

## Sub-steps

### Reference Brands
- User enters brands they admire or dislike.
- For each brand, they specify what they **like** and **dislike** about it.
- Optional: screenshots or logos captured for context.

### Logo Style
- Visual selection of preferred logo styles:
  - Wordmark
  - Lettermark
  - Pictorial
  - Abstract
  - Combination Mark
  - Emblem
- Option to remain "open to recommendations".

### Color Palette
- Select an overarching color approach (e.g. monochromatic, complementary, earthy).
- Rate specific color swatches: **Like** / **Dislike**.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `referenceBrands` | `Array<{ name, url, likes[], dislikes[] }>` | |
| `referenceScreenshots` | `Record<string, string>` | Keyed by brand name/URL |
| `logoStyle` | string | Selected style name |
| `logoOpenToRecommendations` | boolean | |
| `colorPaletteRatings` | `Array<{ paletteName, swatches[], rating }>` | `'like' \| 'skip' \| ''` |

## Current logic
- Reference brand screenshots captured via AI or manual URL.
- Logo styles shown as visual tiles — single selection.
- Color palettes shown as swatches — rated one-by-one.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
