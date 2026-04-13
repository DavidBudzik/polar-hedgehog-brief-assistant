# Kickoff Confirmation Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a confirmation screen between the setup form and the main brief that echoes company info, lets the user trigger an AI site scan, shows upcoming steps, and then hands off to the brief.

**Architecture:** `CompanySetup` in `Setup.tsx` gains a `phase` state (`'form' | 'confirm'`). When the user clicks "Start Brief" the phase flips to `'confirm'` and a confirmation view renders in place. No changes to `App.tsx`, `types.ts`, or `STEPS_ORDER`. The scan and summary state live inside the component.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion (`motion/react`), lucide-react, `aiScanUrl` from `src/shared.tsx`

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/steps/Setup.tsx` | All changes — new state, new imports, confirmation view JSX |

No other files are touched.

---

### Task 1: Add phase/scan state and wire the form → confirm transition

**Files:**
- Modify: `src/steps/Setup.tsx`

- [ ] **Step 1.1: Add new imports**

Replace the existing import block at the top of `src/steps/Setup.tsx`:

```tsx
import React, { useState } from 'react';
import { ArrowRight, Globe, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PolarButton, aiScanUrl } from '../shared';
import type { BriefData } from '../types';
```

- [ ] **Step 1.2: Add the constants and state to `CompanySetup`**

Add the `BRIEF_STEPS` constant just before the `CompanySetup` function, and add the four new state variables inside it.

Add above the function:

```tsx
const BRIEF_STEPS = [
  'Problem & Solution',
  'Market & Competitors',
  'Product Features',
  'Brand Audit',
  'Voice & Keywords',
  'Values & Direction',
  'Visual References',
];
```

Add inside `CompanySetup`, after the existing `form` state:

```tsx
const [phase, setPhase] = useState<'form' | 'confirm'>('form');
const [summary, setSummary] = useState('');
const [scanState, setScanState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
const [faviconFailed, setFaviconFailed] = useState(false);
```

- [ ] **Step 1.3: Change the "Start Brief" button to transition to confirm**

Find the `PolarButton` at the bottom of the form card in `CompanySetup`. Replace:

```tsx
        <PolarButton
          className="w-full h-11 text-sm mt-1"
          disabled={!form.companyName.trim()}
          onClick={() => onDone({ ...form, scanSource: form.websiteUrl || '' })}
        >
          Start Brief <ArrowRight size={15} />
        </PolarButton>
```

With:

```tsx
        <PolarButton
          className="w-full h-11 text-sm mt-1"
          disabled={!form.companyName.trim()}
          onClick={() => setPhase('confirm')}
        >
          Start Brief <ArrowRight size={15} />
        </PolarButton>
```

- [ ] **Step 1.4: Verify types compile**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
npm run lint
```

Expected: no errors. (If you see "motion is not defined" or "Globe is not defined", check the import step.)

- [ ] **Step 1.5: Commit**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
git add src/steps/Setup.tsx
git commit -m "feat: add phase state and wire form→confirm transition in CompanySetup"
```

---

### Task 2: Build the confirmation screen layout (header + steps list + navigation)

**Files:**
- Modify: `src/steps/Setup.tsx`

- [ ] **Step 2.1: Add the confirmation view before the form's `return` statement**

Inside `CompanySetup`, add this block immediately before the existing `return (` (the form view). This renders when `phase === 'confirm'`:

```tsx
  if (phase === 'confirm') {
    return (
      <motion.div
        key="confirm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm mx-auto"
      >
        {/* Header: favicon + company name + URL */}
        <div className="flex items-center gap-4 mb-6">
          {form.websiteUrl && !faviconFailed ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${form.websiteUrl}&sz=64`}
              alt=""
              className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
              style={{ background: 'rgba(1,12,131,0.05)', border: '1px solid rgba(1,12,131,0.08)' }}
              onError={() => setFaviconFailed(true)}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(1,12,131,0.06)', border: '1px solid rgba(1,12,131,0.08)' }}
            >
              <Globe size={22} style={{ color: 'rgba(1,12,131,0.35)' }} />
            </div>
          )}
          <div className="min-w-0">
            <h2
              className="text-xl font-black tracking-tight truncate"
              style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}
            >
              {form.companyName}
            </h2>
            {form.websiteUrl && (
              <p
                className="text-xs truncate"
                style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}
              >
                {form.websiteUrl.replace(/^https?:\/\//, '')}
              </p>
            )}
          </div>
        </div>

        {/* Steps preview */}
        <div
          className="bg-white rounded-2xl p-5 mb-5"
          style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 2px 16px rgba(1,12,131,0.05)' }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: 'rgba(1,12,131,0.35)', fontFamily: 'var(--font-sans)' }}
          >
            What's next in your brief
          </p>
          <div className="space-y-2">
            {BRIEF_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="text-[10px] font-bold w-4 text-center flex-shrink-0"
                  style={{ color: 'rgba(1,12,131,0.25)', fontFamily: 'var(--font-sans)' }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'rgba(1,12,131,0.6)', fontFamily: 'var(--font-sans)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <PolarButton
            variant="secondary"
            onClick={() => { setPhase('form'); setScanState('idle'); setSummary(''); setFaviconFailed(false); }}
            className="flex-1"
          >
            ← Back
          </PolarButton>
          <PolarButton
            onClick={() => onDone({ ...form, scanSource: form.websiteUrl || '' })}
            className="flex-1"
          >
            Begin Brief <ArrowRight size={15} />
          </PolarButton>
        </div>
      </motion.div>
    );
  }
```

- [ ] **Step 2.2: Verify types compile**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
npm run lint
```

Expected: no errors.

- [ ] **Step 2.3: Smoke test in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Fill in a company name, click "Start Brief". You should see:
- The confirmation screen with the company name in the header
- The "What's next" steps list (7 items, numbered)
- "← Back" and "Begin Brief" buttons
- Clicking "← Back" returns to the form with your data intact
- Clicking "Begin Brief" advances to the first brief step

- [ ] **Step 2.4: Commit**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
git add src/steps/Setup.tsx
git commit -m "feat: add confirmation screen layout with company header, steps preview, and nav"
```

---

### Task 3: Add the scan card with all states

**Files:**
- Modify: `src/steps/Setup.tsx`

- [ ] **Step 3.1: Add the `scanSite` function**

Inside `CompanySetup`, after the state declarations, add:

```tsx
  const scanSite = async () => {
    setScanState('loading');
    try {
      const result = await aiScanUrl(
        form.websiteUrl,
        'You are a brand strategist. Based on this website, write a 2-3 sentence company overview that describes what the company does, who it serves, and what makes it distinctive. Return ONLY the overview, no labels or headers.',
      );
      setSummary(result.trim());
      setScanState('done');
    } catch {
      setScanState('error');
    }
  };
```

- [ ] **Step 3.2: Add the scan card to the confirmation view**

Inside the `phase === 'confirm'` JSX block, add the scan card **between the header and the steps preview** (i.e., after the closing `</div>` of the header block, before the steps card `<div>`):

```tsx
        {/* Scan card — only shown when a URL was provided */}
        {form.websiteUrl && (
          <div
            className="bg-white rounded-2xl p-5 mb-5"
            style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 2px 16px rgba(1,12,131,0.05)' }}
          >
            {scanState === 'idle' && (
              <PolarButton variant="outline" className="w-full" onClick={scanSite}>
                <Sparkles size={14} /> Scan my site
              </PolarButton>
            )}

            {scanState === 'loading' && (
              <div className="space-y-2.5">
                <div
                  className="flex items-center gap-2 text-xs mb-1"
                  style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}
                >
                  <Loader2 size={12} className="animate-spin" />
                  Scanning {form.websiteUrl.replace(/^https?:\/\//, '')}…
                </div>
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-full" />
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-4/5" />
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-3/5" />
              </div>
            )}

            {scanState === 'done' && (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(1,12,131,0.75)', fontFamily: 'var(--font-sans)' }}
                  >
                    {summary}
                  </p>
                  <button
                    onClick={scanSite}
                    className="text-[11px] font-semibold flex-shrink-0 cursor-pointer hover:underline"
                    style={{ color: 'rgba(1,12,131,0.3)', fontFamily: 'var(--font-sans)' }}
                  >
                    Re-scan
                  </button>
                </div>
              </div>
            )}

            {scanState === 'error' && (
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-xs"
                  style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}
                >
                  Couldn't reach the site — you can still proceed.
                </p>
                <button
                  onClick={scanSite}
                  className="text-xs font-semibold flex-shrink-0 cursor-pointer hover:underline"
                  style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 3.3: Verify types compile**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
npm run lint
```

Expected: no errors.

- [ ] **Step 3.4: Smoke test — with URL**

```bash
npm run dev
```

Open `http://localhost:3000`. Fill in a company name and a valid URL (e.g. `https://stripe.com`), click "Start Brief".

On the confirmation screen:
- Favicon appears in the header (or Globe icon if favicon fails)
- URL shown below company name (protocol stripped)
- Scan card is visible with "✦ Scan my site" button
- Clicking it shows the loading skeleton + "Scanning stripe.com…"
- After ~5–10 s a 2-3 sentence summary appears with a small "Re-scan" button
- "Re-scan" re-triggers and replaces the summary
- "Begin Brief" still works (advances to brief)

- [ ] **Step 3.5: Smoke test — without URL**

Fill in only the company name (leave URL blank), click "Start Brief".

On the confirmation screen:
- Globe icon shown in header
- No URL line below company name
- Scan card is **not visible** (hidden when no URL)
- Steps list and nav render normally

- [ ] **Step 3.6: Smoke test — error state**

Temporarily replace the fetch URL in `aiScanUrl` in `shared.tsx` with an intentionally broken URL (e.g. `https://r.jina.ai/thisisnotarealurl12345`) to force a failure, confirm the error message appears with "Try again". Revert the change immediately after testing.

Alternatively, test with `https://localhost:9999` which will fail instantly.

- [ ] **Step 3.7: Commit**

```bash
cd "/Users/davidbudzik/Desktop/claude-cowork-projects/Interactive brief/polar-hedgehog-brief-assistant"
git add src/steps/Setup.tsx
git commit -m "feat: add AI scan card to kickoff confirmation screen"
```

---

## Verification Checklist

Run through these manually after all tasks are complete:

- [ ] Form → confirm transition works; "← Back" preserves form data
- [ ] No URL entered: Globe icon, no scan card, Begin Brief calls onDone correctly
- [ ] URL entered: favicon shown (or Globe fallback on error), URL displayed, scan card shown
- [ ] Scan idle → loading → done flow works end-to-end
- [ ] Scan error state shows correct message + Try again
- [ ] Re-scan clears previous summary and fetches fresh one
- [ ] Begin Brief on confirmation screen advances to `problem_solution` step
- [ ] `problem_solution` step auto-scans because `brief.websiteUrl` is set (existing behaviour preserved)
- [ ] `npm run lint` passes with zero errors
