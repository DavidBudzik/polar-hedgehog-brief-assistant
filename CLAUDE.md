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

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. At runtime the app also resolves the key from `localStorage` (key: `polar_gemini_api_key`) — localStorage takes precedence over the env var.

## Architecture

**Stack:** React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + Framer Motion (`motion/react`) + `@google/genai` SDK.

### Step-based brief flow

The entire app is a linear multi-step form. State lives in `App.tsx`:

- `BriefData` (defined in `src/types.ts`) — single flat object holding all collected answers
- `STEPS_ORDER` (also `src/types.ts`) — ordered array of all 19 `BriefStep` string literals that determines navigation
- `completed: Set<BriefStep>` — tracks which steps are done (drives sidebar progress icons)
- `step: BriefStep` — the active step

Navigation: `next(currentStep)` marks the step done and advances to `STEPS_ORDER[idx + 1]`. Each step component receives `brief: BriefData` and an `onDone` callback that patches `BriefData` via `upd()` then calls `next()`.

### File layout

```
src/
  types.ts          — BriefData interface, INITIAL_BRIEF, BriefStep union, STEPS_ORDER
  shared.tsx        — PolarButton, Card, brand colors (PK/PB), all AI helpers (aiGen, aiScanUrl, aiAnalyzeImage, aiAnalyzeDocument, aiAnalyzeFile)
  App.tsx           — Root: Sidebar, ProgressBar, step routing, SubmittedScreen
  GeminiAssistant.tsx — Floating chat panel (multi-model: fast/general/complex)
  Settings.tsx      — API key modal (reads/writes localStorage)
  steps/
    Setup.tsx       — KickoffSetup, KickoffConfirmation (pre-sidebar screens)
    Discovery.tsx   — ProblemStatement, SolutionDescription, CompetitorEntry, UVPRating, FeatureBuilder
    BrandAudit.tsx  — CompanyNameMeaning, LogoRationale, VisualLanguageRationale
    BrandDirection.tsx — KeywordSelection, BrandMessages, ValuePicker, VisualDirectionForm
    VisualPrefs.tsx — ReferenceBrands, LogoStyleSelector, ColorPaletteSelector, SummaryReview
```

### AI integration

All AI calls go through helpers in `shared.tsx` via `@google/genai`:

- `aiGen(prompt, json?)` — basic text generation with `gemini-2.0-flash`
- `aiScanUrl(url, prompt)` — URL fetch + analysis using Gemini's `urlContext` tool
- `aiAnalyzeImage(file, prompt)` — inline base64 image analysis
- `aiAnalyzeDocument(file, prompt)` — uploads to Gemini Files API (for PDFs/PPTX/DOCX), polls until `ACTIVE`
- `aiAnalyzeFile(file, prompt)` — smart router: images use inline, everything else uses Files API

The floating `GeminiAssistant` panel uses separate model selection (fast = `gemini-3.1-flash-lite-preview`, general = `gemini-3-flash-preview`, complex = `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH`).

### Styling conventions

- Brand colors: pink `#EC008C` (primary actions, accents), blue `#010C83` (headings)
- Use `PolarButton` from `shared.tsx` for buttons (variants: `primary`, `secondary`, `outline`, `ghost`)
- Use the `Card` component from `shared.tsx` for step content wrappers
- Tailwind classes use arbitrary values (`bg-[#EC008C]`) for brand colors — no CSS custom properties
- Step transitions use `AnimatePresence` + `motion.div` with `mode="wait"` — keep this pattern for any new steps
