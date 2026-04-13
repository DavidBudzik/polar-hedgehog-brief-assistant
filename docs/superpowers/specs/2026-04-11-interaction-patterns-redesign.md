# Interaction Patterns Redesign
**Date:** 2026-04-11  
**Status:** Approved for implementation  
**Directions:** Visual-First Brand Steps (Direction 2) + Collapsed Smart Flow (Direction 3)

---

## Goals

1. Cut 19 linear steps to 9 richer moments by merging related questions and letting AI infer what it can.
2. Replace chips, sliders, and dropdowns in brand-identity steps with image-based curation (Unsplash mood boards + real brand screenshots).
3. Keep the same tech stack, linear wizard shape, Framer Motion transitions, and `BriefData` state model. No structural rewrite.

---

## What Is NOT Changing

- React 19 + Vite + Tailwind v4 + Framer Motion step transitions
- `PolarButton`, `Card`, `GeminiAssistant` floating panel
- AI integration via `aiGen`, `aiScanUrl`, `aiAnalyzeFile`, `aiAnalyzeImage` in `shared.tsx`
- `App.tsx` routing / sidebar / progress bar pattern
- Brand colors: pink `#EC008C`, blue `#010C83`

---

## Collapsed Step Map

| # | New Step | Replaces | Key Change |
|---|----------|----------|------------|
| 1 | **Company Setup** | Setup + Kickoff (1–2) | Merged into one screen; URL scan triggered here |
| 2 | **Problem + Solution** | Problem Statement + Solution Description (3–4) | Two outputs, one step; solution auto-generated from problem |
| 3 | **Market Position** | Competitor Entry + UVP Rating (5–6) | Competitors show live screenshots; UVP auto-derived, no separate step |
| 4 | **Product** | Feature Builder (7) | Unchanged; AI pre-fills from problem/solution context |
| 5 | **Brand Audit** | Name Meaning + Logo Rationale + Visual Language (8–10) | Visual language becomes 8-image Unsplash mood board instead of sliders |
| 6 | **Brand Voice** | Keyword Selection + Brand Messages (11–12) | Keywords still chips; selected keywords get paired Unsplash image confirmation; messages generated inline |
| 7 | **Brand Values + Direction** | Value Picker + Visual Direction v1 + v2 (13–15) | Values picker unchanged; visual direction attributes shown as Unsplash image examples instead of dropdowns |
| 8 | **Visual References** | Reference Brands + Logo Style + Color Palette (16–18) | Reference brands show auto-screenshots; logo style as image grid; color palette as real brand color strips |
| 9 | **Summary** | Summary (19) | Unchanged |

**Net change:** 19 → 9 steps (−53%). 5 steps eliminated via AI inference or merge.

---

## Visual Interaction Patterns

### Mood Board Component (`MoodBoard`)
Used in: Visual Language (Step 5), Brand Voice keyword confirmation (Step 6), Visual Direction (Step 7).

**Behavior:**
- Displays a grid of 8–12 images fetched from Unsplash by category query.
- First tap: **liked** (green border). Second tap: **skipped** (faded, grey border). Third tap: **neutral** (reset).
- On step completion, AI receives the list of liked/skipped image labels and generates a text descriptor (e.g., visual language paragraph, keyword list, direction statement).
- Falls back gracefully if Unsplash is unavailable: shows emoji placeholders with text labels (current chip behavior).

**Unsplash integration:**
- Use Unsplash Source API (`https://source.unsplash.com/featured/?{query}`) or Unsplash API with `VITE_UNSPLASH_ACCESS_KEY`.
- Each image category has a predefined search query (see constants below).
- Images loaded lazily; show skeleton while loading.

**Image categories (Unsplash queries per mood):**
```
timeless      → "classic architecture brand"
bold          → "bold graphic design"
premium       → "luxury product minimal"
playful       → "colorful playful illustration"
organic       → "natural texture organic"
trustworthy   → "professional clean corporate"
minimal       → "minimal white space design"
expressive    → "expressive art colorful"
innovative    → "technology futuristic design"
warm          → "warm cozy lifestyle brand"
```

### Screenshot Cards
Used in: Market Position (Step 3, competitors), Visual References (Step 8, reference brands).

**Behavior:**
- When user enters a URL and submits, call `/api/screenshot` (already stubbed in `api/screenshot.ts`) with the URL.
- Display result as a card with the screenshot image in the card header (height: ~80px, object-fit: cover).
- If screenshot fails or times out (>8s), show a placeholder gradient with the domain name.
- Cards are non-blocking: user can continue adding more competitors while screenshots load.

### Color Strip Picker
Used in: Visual References (Step 8, color palette).

**Behavior:**
- Replace generated individual swatches with full palette strips (5 swatches wide).
- Source: curate 8–12 archetypal brand palettes as static constants (no API needed — these don't change often).
- First tap: **liked** (green outline). Second tap: **skipped** (faded). Third tap: neutral.
- AI receives liked palette names and infers color direction.

**Curated palettes (static constants file `src/constants/colorPalettes.ts`):**
```
Deep Blue       #0F172A / #1E40AF / #3B82F6 / #93C5FD / #F8FAFC
Luxury Neutral  #1A1A1A / #C9A96E / #E8D5B7 / #F5F0E8 / #FAFAF8
Forest Green    #14532D / #166534 / #4ADE80 / #BBF7D0 / #F0FDF4
Vibrant Coral   #7F1D1D / #EF4444 / #FB923C / #FED7AA / #FFFBEB
Tech Purple     #1E1B4B / #4F46E5 / #818CF8 / #C7D2FE / #EFF6FF
Bold Pink       #831843 / #EC008C / #F472B6 / #FBCFE8 / #FFF0F8
Earthy Warm     #451A03 / #92400E / #D97706 / #FDE68A / #FFFBEB
Sage + Stone    #1C1917 / #57534E / #A8A29E / #E7E5E4 / #FAFAF9
```

### Logo Style Image Grid
Used in: Visual References (Step 8).

**Behavior:**
- Replace current illustrated option cards with a grid of 8 example logo images (static assets bundled in `public/logo-examples/`).
- User picks **1** that resonates (single selection — matches existing `logoStyle: string` field). Selection stores the style label, not the image path.
- Logo style labels remain the same as current: Wordmark, Lettermark, Abstract, Mascot, Emblem, Combination, Icon, Geometric.

---

## Data Model Changes (`src/types.ts`)

### `BriefData` changes

```typescript
// REMOVE these fields:
colorPaletteApproach: string    // replaced by colorPaletteRatings

// KEEP but change how it's populated:
uvp: string[]                   // kept in BriefData for Summary display, but no longer a user-edited step.
                                // AI derives it at end of Market Position step via aiGen() and stores it here.

// CHANGE these fields:
visualLanguageSliders: { modern: number; trustworthy: number; bold: number }
  → visualLanguageMood: { liked: string[]; skipped: string[] }  // mood board label selections

visualDirection: { value1: { valueName, shape, color, motion, style }; value2: {...} }
  → visualDirection: { value1: { valueName: string; moodLiked: string[]; moodSkipped: string[] }; value2: { valueName: string; moodLiked: string[]; moodSkipped: string[] } }

colorSwatchRatings: Array<{ color: string; label: string; rating: 'like' | 'dislike' | '' }>
  → colorPaletteRatings: Array<{ paletteName: string; swatches: string[]; rating: 'like' | 'skip' | '' }>

// ADD these fields:
competitorScreenshots: Record<string, string>  // url → base64 or object URL
referenceScreenshots: Record<string, string>   // url → base64 or object URL
keywordImages: Record<string, string>          // keyword → Unsplash image URL
```

Also update the `BriefStep` union type — remove old literals, add new ones:

```typescript
export type BriefStep =
  | 'setup'
  | 'problem_solution'
  | 'market_position'
  | 'product'
  | 'brand_audit'
  | 'brand_voice'
  | 'brand_values_direction'
  | 'visual_references'
  | 'summary';
```

### `STEPS_ORDER` changes

```typescript
export const STEPS_ORDER: BriefStep[] = [
  'setup',
  'problem_solution',        // merged (was: problem_statement + solution_description)
  'market_position',         // merged (was: competitors + uvp)
  'product',                 // unchanged (was: features)
  'brand_audit',             // merged (was: company_name_meaning + logo_rationale + visual_language_rationale)
  'brand_voice',             // merged (was: keywords + brand_messages)
  'brand_values_direction',  // merged (was: value_picker + visual_direction_v1 + visual_direction_v2)
  'visual_references',       // merged (was: reference_brands + logo_style + color_palette)
  'summary',
];
```

---

## New / Modified Components

### New shared components (`src/components/` or inline in step files)
- `MoodBoard` — image grid with like/skip state, Unsplash fetch, AI synthesis on complete
- `ScreenshotCard` — card that fetches + displays a screenshot with fallback placeholder
- `ColorStripPicker` — horizontal palette strip with like/skip toggle
- `LogoStyleGrid` — 8-image grid for logo style selection

### Modified step files

| File | Action |
|------|--------|
| `src/steps/Setup.tsx` | Merge `KickoffSetup` + `KickoffConfirmation` into single `CompanySetup` component |
| `src/steps/Discovery.tsx` | Merge `ProblemStatement` + `SolutionDescription` into `ProblemSolution`; merge `CompetitorEntry` + `UVPRating` into `MarketPosition` with `ScreenshotCard`; keep `FeatureBuilder` as `Product` |
| `src/steps/BrandAudit.tsx` | Merge all three into `BrandAudit`; replace slider JSX with `MoodBoard` |
| `src/steps/BrandDirection.tsx` | Merge `KeywordSelection` + `BrandMessages` into `BrandVoice`; merge `ValuePicker` + both `VisualDirectionForm` into `BrandValuesDirection` with `MoodBoard` for direction attributes |
| `src/steps/VisualPrefs.tsx` | Merge all three into `VisualReferences`; add `ScreenshotCard` for reference brands, `LogoStyleGrid`, `ColorStripPicker` |

---

## API / Environment

### Unsplash
- Add `VITE_UNSPLASH_ACCESS_KEY` to `.env.local` (`.env.example` to be updated).
- Fetch via `https://api.unsplash.com/photos/random?query={query}&count=8&client_id={key}`.
- Fallback: if key absent, use emoji + label placeholders (existing chip behavior).

### Screenshot
- `api/screenshot.ts` stub already exists. Wire it to Puppeteer in the same `vite.config.ts` proxy setup.
- Return base64 PNG. Store in `competitorScreenshots` / `referenceScreenshots` in `BriefData`.

---

## Out of Scope

- Conversational/chat step model (Direction 1) — not in this spec.
- Voice input.
- Backend persistence / Supabase wiring.
- Export format changes.
- Any new steps beyond the 9 defined above.
