# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build
npm run lint       # Type-check with tsc --noEmit (no test suite)
npm run clean      # Remove dist/
```

## Environment Setup

Copy `.env.example` to `.env.local` and set `VITE_GEMINI_API_KEY`. At runtime the app also resolves the key from `localStorage` (key: `polar_gemini_api_key`) — localStorage takes precedence over the env var.

## Architecture

**Stack:** React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + Framer Motion (`motion/react`) + `@google/genai` SDK.

### Step-based brief flow

The entire app is a linear multi-step form. State lives in `App.tsx`:

- `BriefData` (defined in `src/types.ts`) — single flat object holding all collected answers
- `STEPS_ORDER` (also `src/types.ts`) — ordered array of 9 `BriefStep` string literals that determines navigation
- `completed: Set<BriefStep>` — tracks which steps are done (drives sidebar progress icons)
- `step: BriefStep` — the active step
- Brief state auto-persists to `localStorage` under `BRIEF_STORAGE_KEY = 'polar_brief_state_v1'`; bump the version suffix if `BriefData` shape changes incompatibly

Navigation: `next(currentStep)` marks the step done and advances to `STEPS_ORDER[idx + 1]`. Each step component receives `brief: BriefData` and an `onDone` callback that patches `BriefData` via `upd()` then calls `next()`.

Steps (in order): `setup` → `problem_solution` → `market_position` → `product` → `brand_audit` → `brand_voice` → `brand_values_direction` → `visual_references` → `summary`

### File layout

```
src/
  types.ts          — BriefData interface, INITIAL_BRIEF, BriefStep union, STEPS_ORDER, BRIEF_STORAGE_KEY
  shared.tsx        — PolarButton, Card, brand colors (PK/PB), all AI helpers (aiGen, aiScanUrl, aiAnalyzeImage, aiAnalyzeDocument, aiAnalyzeFile)
  App.tsx           — Root: Sidebar, ProgressBar, step routing, brief persistence
  GeminiAssistant.tsx — Floating chat panel (multi-model: fast/general/complex)
  Settings.tsx      — API key modal (reads/writes localStorage)
  constants/
    colorPalettes.ts — Palette definitions for ColorPaletteSelector
  components/
    MoodBoard.tsx       — Mood image grid used in brand direction steps
    ScreenshotCard.tsx  — Card for displaying competitor/reference brand screenshots
    ColorStripPicker.tsx — Color palette rating UI
    LogoStyleGrid.tsx   — Logo style selection grid
  ui/
    useAIError.tsx  — Hook for surfacing AI errors in the UI
  steps/
    Setup.tsx       — CompanySetup (pre-sidebar screen)
    Discovery.tsx   — ProblemSolution, MarketPosition, Product
    BrandAudit.tsx  — BrandAudit
    BrandDirection.tsx — BrandVoice, BrandValuesDirection
    VisualPrefs.tsx — VisualReferences, SummaryReview
```

### AI integration

All AI calls go through helpers in `shared.tsx` via `@google/genai`. Default model is `gemini-2.5-flash` with an automatic fallback chain on 429/404: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash-lite-latest` (stored in module-level `globalModelOverride`).

- `aiGen(prompt, json?)` — basic text generation
- `aiScanUrl(url, prompt)` — URL analysis using Gemini's `googleSearch` tool
- `aiAnalyzeImage(file, prompt)` — inline base64 image analysis
- `aiAnalyzeDocument(file, prompt)` — uploads to Gemini Files API (PDF/PPTX/DOCX), polls until `ACTIVE`
- `aiAnalyzeFile(file, prompt)` — smart router: images use inline, everything else uses Files API

The floating `GeminiAssistant` panel uses separate model selection: fast = `gemini-2.5-flash-lite`, general = `gemini-2.5-flash`, complex = `gemini-2.5-pro` (with `ThinkingLevel.HIGH`).

### Styling conventions

- Brand colors: pink `#EC008C` (PK — primary actions, accents), blue `#010C83` (PB — headings)
- Use `PolarButton` from `shared.tsx` for buttons (variants: `primary`, `secondary`, `outline`, `ghost`)
- Use the `Card` component from `shared.tsx` for step content wrappers
- Tailwind classes use arbitrary values (`bg-[#EC008C]`) for brand colors — no CSS custom properties
- Step transitions use `AnimatePresence` + `motion.div` with `mode="wait"` — keep this pattern for any new steps
