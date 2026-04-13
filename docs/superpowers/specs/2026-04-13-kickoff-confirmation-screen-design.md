# Kickoff Confirmation Screen — Design Spec

**Date:** 2026-04-13  
**Status:** Approved  
**File:** `src/steps/Setup.tsx`

---

## Context

The Setup step now captures an optional website URL alongside the company name. Once captured, downstream steps (Problem & Solution, Solution Description) automatically scan that URL via `aiScanUrl`. The confirmation screen is a logical second half of the kickoff flow: it echoes back what was entered, lets the user optionally scan their site for a quick AI company overview, previews the steps ahead, and then hands off to the main brief.

---

## Architecture

### Approach
Option A: internal phase state inside `CompanySetup`. No changes to `App.tsx`, `types.ts`, or `STEPS_ORDER`.

### State added to `CompanySetup`
```ts
const [phase, setPhase] = useState<'form' | 'confirm'>('form');
const [summary, setSummary] = useState('');
const [scanState, setScanState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
```

### Flow
1. User fills form → clicks "Start Brief" → `phase` becomes `'confirm'`
2. Confirmation screen renders (no scan yet)
3. User optionally clicks "Scan my site" → `aiScanUrl` called → summary displayed
4. User clicks "Begin Brief" → original `onDone` called with form data
5. "← Back" on confirmation returns to `'form'` phase

---

## Screen Layout

Same centered gradient background as the form (no sidebar). Replaces the form card.

```
[favicon or Globe icon]  Acme Corp
                         acmecorp.com

┌─────────────────────────────────────────┐
│  [✦ Scan my site]          (outline btn)│
│                                         │
│  (skeleton loader while scanning)       │
│  ─ after scan ─                         │
│  "Acme Corp helps growing teams track   │
│   work without the noise..."            │
└─────────────────────────────────────────┘

  What's next in your brief
  ─────────────────────────
  ① Problem & Solution
  ② Market & Competitors
  ③ Product Features
  ④ Brand Audit
  ⑤ Voice & Keywords
  ⑥ Values & Direction
  ⑦ Visual References

  [← Back]          [Begin Brief →]
```

---

## Component Details

### Favicon
- Source: `https://www.google.com/s2/favicons?domain=${url}&sz=64` — pass the full URL directly (Google's API accepts both full URLs and bare domains)
- Fallback: lucide-react `Globe` icon (same size/color treatment) if no URL was provided or favicon fails to load (`onError` on `<img>`)

### Layout wrapper
The confirmation screen renders inside the same parent `div` in `App.tsx` as the form (centered gradient background). It should include the `<SettingsButton />` in the top-right corner for consistency with the form screen.

### Scan section
- **No URL entered:** section hidden entirely
- **URL present, idle:** single "✦ Scan my site" button (outline/secondary variant, full width)
- **Loading:** skeleton loader (2 lines, `animate-pulse`) + "Scanning acmecorp.com…" caption in pink
- **Done:** summary text in a styled box; smaller "Re-scan" ghost button in the top-right corner
- **Error:** soft message "Couldn't reach the site — you can still proceed" in muted text; "Try again" ghost button

**Prompt used for scan:**
```
You are a brand strategist. Based on this website, write a 2-3 sentence company overview that describes what the company does, who it serves, and what makes it distinctive. Return ONLY the overview, no labels or headers.
```

### Steps list
Static — hardcoded display names matching NAV_SECTIONS order:
1. Problem & Solution
2. Market & Competitors
3. Product Features
4. Brand Audit
5. Voice & Keywords
6. Values & Direction
7. Visual References

Rendered as a numbered list with small muted text, consistent with existing typography conventions.

---

## Styling Conventions
- Brand colors: `#EC008C` (pink/primary), `#010C83` (blue/headings)
- Use `PolarButton` from `shared.tsx` for all buttons
- Animate card entry with `motion.div` (same `initial/animate` pattern as existing cards)
- Skeleton pulses use `bg-gray-100 animate-pulse rounded`
- No new CSS — Tailwind arbitrary values and inline styles only

---

## Error Handling
- Favicon `<img>` uses `onError` to fall back to the `Globe` icon
- `aiScanUrl` failures caught in try/catch; sets `scanState` to `'error'`; user can still proceed without a summary
- All async operations use `try/catch/finally` with loading state cleanup

---

## Out of Scope
- Persisting the AI summary into `BriefData` (it's display-only on this screen)
- Caching the scan result between sessions
- Animations between form → confirm transition (simple opacity/y entry is sufficient)
