# Step: Brand Voice
**BriefStep key:** `brand_voice`

---

## Purpose
Aligns the brand's tone, messaging, and verbal identity going forward.

## Sub-steps

### Keywords
- User selects overarching keywords defining the brand's intended tone and personality (e.g. "bold", "approachable", "innovative").

### Brand Messages
- AI evaluates specific brand messages based on the selected keywords.
- User approves or rejects each message.

## Data collected
| Field | Type | Notes |
|---|---|---|
| `keywords` | `string[]` | Selected brand keywords |
| `keywordImages` | `Record<string, string>` | Visual associations per keyword |
| `brandMessages` | `Array<{ keyword: string; message: string; approved: boolean }>` | |

## Current logic
- Keyword list is pre-defined (pulled from constants).
- Brand messages are AI-generated based on selected keywords.
- Each message tied to a keyword; user approves/rejects per message.

---

## Refinement notes
> _Add your logic changes, open questions, or redesign ideas here._
