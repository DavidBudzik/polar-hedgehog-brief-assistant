# Step: Market Position
**BriefStep key:** `market_position`

---

## Purpose
Maps the competitive landscape and articulates what makes the brand uniquely valuable.

## Sub-steps

### Competitors
- **Manual Entry with AI Tagline:** User enters competitor name/URL → AI fetches or generates a one-line tagline.
- **Categorization:** Each competitor tagged as:
  - `similar` — Same ICP
  - `different` — Niche focus, Better UX, etc.

### Unique Value Proposition (UVP)
- **AI Generation:** Analyzes Problem Statement + Competitors → generates 4 bold UVP statements.
- **Rating System:** Each UVP rated as:
  - 🔥 Love it
  - 😐 OK
  - ❌ Remove

## Data collected
| Field | Type | Notes |
|---|---|---|
| `competitors` | `Array<{ name, url, tagline, tags, tagCategory }>` | |
| `competitorScreenshots` | `Record<string, string>` | Keyed by competitor name/URL |
| `uvp` | `string[]` | Approved/loved UVPs |

## Current logic
- Competitors added one at a time; AI generates tagline per entry.
- UVP generation is triggered after competitors are entered.
- Only "Love it" or "OK" UVPs carried forward.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
