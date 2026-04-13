# Interaction Patterns Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the 19-step brief flow into 9 richer steps by merging related questions, replacing sliders/dropdowns with visual-first interactions (MoodBoard, ScreenshotCard, ColorStripPicker, LogoStyleGrid), and adding Unsplash mood board curation.

**Architecture:** Keep the same linear wizard shape, `App.tsx` routing, `BriefData` state, Framer Motion transitions, and AI helpers. Only the step components and type definitions change. New shared components live in `src/components/`. No structural rewrite.

**Tech Stack:** React 19 + Vite 6 + TypeScript + Tailwind v4 + Framer Motion + `@google/genai`. New: Unsplash API (`VITE_UNSPLASH_ACCESS_KEY`) with emoji-placeholder fallback.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/types.ts` | Update BriefData, BriefStep union, STEPS_ORDER |
| Create | `src/constants/colorPalettes.ts` | Curated 8 palette constants |
| Create | `src/components/MoodBoard.tsx` | Unsplash image grid, like/skip state, AI synthesis |
| Create | `src/components/ScreenshotCard.tsx` | Domain card with favicon + gradient fallback |
| Create | `src/components/ColorStripPicker.tsx` | Horizontal 5-swatch palette strips with like/skip |
| Create | `src/components/LogoStyleGrid.tsx` | 8-option logo style grid (styled text/symbol previews) |
| Modify | `src/steps/Setup.tsx` | Merge KickoffSetup + KickoffConfirmation → CompanySetup |
| Modify | `src/steps/Discovery.tsx` | ProblemSolution (merged), MarketPosition (merged + ScreenshotCard), Product (renamed FeatureBuilder) |
| Modify | `src/steps/BrandAudit.tsx` | Single BrandAudit component; replace sliders with MoodBoard |
| Modify | `src/steps/BrandDirection.tsx` | BrandVoice (keywords + messages merged), BrandValuesDirection (values + MoodBoard direction) |
| Modify | `src/steps/VisualPrefs.tsx` | VisualReferences (all 3 merged: ScreenshotCard + LogoStyleGrid + ColorStripPicker) + SummaryReview updated |
| Modify | `src/App.tsx` | New 9-step routing, updated sidebar NAV_SECTIONS, updated counters |
| Modify | `.env.example` | Add VITE_UNSPLASH_ACCESS_KEY |

---

## Task 1: Update types.ts

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Replace BriefData, BriefStep, STEPS_ORDER**

Replace the entire contents of `src/types.ts` with:

```typescript
export interface BriefData {
  companyName: string;
  projectType: string;
  projectDate: string;
  websiteUrl: string;
  scanSource: string;
  problemStatement: string;
  solutionDescription: string;
  competitors: Array<{ name: string; url: string; tagline: string; tags: string[]; tagCategory: 'similar' | 'different' }>;
  competitorScreenshots: Record<string, string>;
  uvp: string[];
  features: Array<{ title: string; desc: string }>;
  companyNameMeaning: string;
  logoRationale: string;
  logoRationaleChips: string[];
  visualLanguageMood: { liked: string[]; skipped: string[] };
  keywords: string[];
  keywordImages: Record<string, string>;
  brandMessages: Array<{ keyword: string; message: string; approved: boolean }>;
  selectedValues: string[];
  visualDirection: {
    value1: { valueName: string; moodLiked: string[]; moodSkipped: string[] };
    value2: { valueName: string; moodLiked: string[]; moodSkipped: string[] };
  };
  referenceBrands: Array<{ name: string; url: string; likes: string[]; dislikes: string[] }>;
  referenceScreenshots: Record<string, string>;
  logoStyle: string;
  logoOpenToRecommendations: boolean;
  colorPaletteRatings: Array<{ paletteName: string; swatches: string[]; rating: 'like' | 'skip' | '' }>;
}

export const INITIAL_BRIEF: BriefData = {
  companyName: '',
  projectType: 'Branding',
  projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  websiteUrl: '',
  scanSource: '',
  problemStatement: '',
  solutionDescription: '',
  competitors: [],
  competitorScreenshots: {},
  uvp: [],
  features: [],
  companyNameMeaning: '',
  logoRationale: '',
  logoRationaleChips: [],
  visualLanguageMood: { liked: [], skipped: [] },
  keywords: [],
  keywordImages: {},
  brandMessages: [],
  selectedValues: [],
  visualDirection: {
    value1: { valueName: '', moodLiked: [], moodSkipped: [] },
    value2: { valueName: '', moodLiked: [], moodSkipped: [] },
  },
  referenceBrands: [],
  referenceScreenshots: {},
  logoStyle: '',
  logoOpenToRecommendations: false,
  colorPaletteRatings: [],
};

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

export const STEPS_ORDER: BriefStep[] = [
  'setup',
  'problem_solution',
  'market_position',
  'product',
  'brand_audit',
  'brand_voice',
  'brand_values_direction',
  'visual_references',
  'summary',
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "polar-hedgehog-brief-assistant" && npm run lint 2>&1 | head -40
```

Expected: errors about missing components (we haven't updated App.tsx yet) — that's fine. No syntax errors in types.ts itself.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "refactor: update BriefData + collapse to 9 BriefStep literals"
```

---

## Task 2: Color palettes constant

**Files:**
- Create: `src/constants/colorPalettes.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/constants/colorPalettes.ts
export interface ColorPalette {
  name: string;
  swatches: string[]; // 5 hex values, dark → light
}

export const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Deep Blue',      swatches: ['#0F172A', '#1E40AF', '#3B82F6', '#93C5FD', '#F8FAFC'] },
  { name: 'Luxury Neutral', swatches: ['#1A1A1A', '#C9A96E', '#E8D5B7', '#F5F0E8', '#FAFAF8'] },
  { name: 'Forest Green',   swatches: ['#14532D', '#166534', '#4ADE80', '#BBF7D0', '#F0FDF4'] },
  { name: 'Vibrant Coral',  swatches: ['#7F1D1D', '#EF4444', '#FB923C', '#FED7AA', '#FFFBEB'] },
  { name: 'Tech Purple',    swatches: ['#1E1B4B', '#4F46E5', '#818CF8', '#C7D2FE', '#EFF6FF'] },
  { name: 'Bold Pink',      swatches: ['#831843', '#EC008C', '#F472B6', '#FBCFE8', '#FFF0F8'] },
  { name: 'Earthy Warm',    swatches: ['#451A03', '#92400E', '#D97706', '#FDE68A', '#FFFBEB'] },
  { name: 'Sage + Stone',   swatches: ['#1C1917', '#57534E', '#A8A29E', '#E7E5E4', '#FAFAF9'] },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/colorPalettes.ts
git commit -m "feat: add curated color palette constants"
```

---

## Task 3: MoodBoard shared component

**Files:**
- Create: `src/components/MoodBoard.tsx`

- [ ] **Step 1: Create MoodBoard**

The component fetches 8 images from Unsplash by query. Each tap cycles: neutral → liked (green border) → skipped (faded grey) → neutral. Falls back to emoji+label tiles if no Unsplash key.

```typescript
// src/components/MoodBoard.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface MoodState {
  liked: string[];
  skipped: string[];
}

interface ImageTile {
  label: string;
  url: string | null; // null = use emoji fallback
  emoji: string;
}

const UNSPLASH_QUERIES: Record<string, { emoji: string; query: string }> = {
  timeless:     { emoji: '🏛', query: 'classic architecture brand' },
  bold:         { emoji: '🔥', query: 'bold graphic design' },
  premium:      { emoji: '💎', query: 'luxury product minimal' },
  playful:      { emoji: '🎨', query: 'colorful playful illustration' },
  organic:      { emoji: '🌿', query: 'natural texture organic' },
  trustworthy:  { emoji: '🛡', query: 'professional clean corporate' },
  minimal:      { emoji: '◻️', query: 'minimal white space design' },
  expressive:   { emoji: '🎭', query: 'expressive art colorful' },
  innovative:   { emoji: '⚡', query: 'technology futuristic design' },
  warm:         { emoji: '☀️', query: 'warm cozy lifestyle brand' },
};

// Default category set used when no custom categories provided
const DEFAULT_CATEGORIES = Object.keys(UNSPLASH_QUERIES);

async function fetchUnsplashImages(query: string, key: string): Promise<string> {
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=1&client_id=${key}`
  );
  if (!res.ok) throw new Error('Unsplash error');
  const data = await res.json();
  return data[0]?.urls?.small ?? '';
}

export function MoodBoard({
  categories = DEFAULT_CATEGORIES,
  value,
  onChange,
}: {
  categories?: string[];
  value: MoodState;
  onChange: (next: MoodState) => void;
}) {
  const key = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY ?? '';
  const [tiles, setTiles] = useState<ImageTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results: ImageTile[] = await Promise.all(
        categories.map(async (cat) => {
          const meta = UNSPLASH_QUERIES[cat] ?? { emoji: '🖼', query: cat };
          if (!key) return { label: cat, url: null, emoji: meta.emoji };
          try {
            const url = await fetchUnsplashImages(meta.query, key);
            return { label: cat, url: url || null, emoji: meta.emoji };
          } catch {
            return { label: cat, url: null, emoji: meta.emoji };
          }
        })
      );
      if (!cancelled) { setTiles(results); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [categories.join(','), key]);

  const getState = (label: string): 'liked' | 'skipped' | 'neutral' => {
    if (value.liked.includes(label)) return 'liked';
    if (value.skipped.includes(label)) return 'skipped';
    return 'neutral';
  };

  const cycle = (label: string) => {
    const cur = getState(label);
    if (cur === 'neutral') {
      onChange({ liked: [...value.liked, label], skipped: value.skipped.filter(x => x !== label) });
    } else if (cur === 'liked') {
      onChange({ liked: value.liked.filter(x => x !== label), skipped: [...value.skipped, label] });
    } else {
      onChange({ liked: value.liked.filter(x => x !== label), skipped: value.skipped.filter(x => x !== label) });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin text-[#EC008C]" /> Loading mood board…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400">Tap to like (green) · tap again to skip (grey) · tap again to reset</p>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((tile) => {
          const state = getState(tile.label);
          return (
            <button
              key={tile.label}
              onClick={() => cycle(tile.label)}
              className={`relative rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                state === 'liked'
                  ? 'border-green-400 ring-2 ring-green-200'
                  : state === 'skipped'
                  ? 'border-gray-200 opacity-40'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              {tile.url ? (
                <img src={tile.url} alt={tile.label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-2xl">
                  {tile.emoji}
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-1.5">
                <span className="text-white text-[9px] font-bold capitalize leading-none">{tile.label}</span>
              </div>
              {state === 'liked' && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MoodBoard.tsx
git commit -m "feat: add MoodBoard component with Unsplash fetch + emoji fallback"
```

---

## Task 4: ScreenshotCard shared component

**Files:**
- Create: `src/components/ScreenshotCard.tsx`

- [ ] **Step 1: Create ScreenshotCard**

Shows a card with domain favicon + gradient. No real Puppeteer call — uses graceful fallback since no screenshot server is wired. Non-blocking.

```typescript
// src/components/ScreenshotCard.tsx
import { useState } from 'react';
import { X } from 'lucide-react';

function getDomain(url: string): string {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', ''); }
  catch { return url; }
}

const GRADIENT_COLORS = [
  'from-blue-500 to-indigo-600', 'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600', 'from-cyan-500 to-sky-600',
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return GRADIENT_COLORS[h % GRADIENT_COLORS.length];
}

interface ScreenshotCardProps {
  name: string;
  url: string;
  meta?: React.ReactNode; // chips / tags below name
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode; // expanded content
}

export function ScreenshotCard({ name, url, meta, onRemove, onClick, active, children }: ScreenshotCardProps) {
  const domain = getDomain(url);
  const grad = hashColor(domain);
  const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${active ? 'border-[#EC008C]/30' : 'border-gray-100'}`}>
      {/* Header — screenshot area */}
      <div
        className={`h-20 bg-gradient-to-br ${grad} relative flex items-center justify-center cursor-pointer`}
        onClick={onClick}
      >
        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            className="w-10 h-10 rounded-lg bg-white/20 p-1 shadow-md"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-black/10" />
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {/* Body */}
      <div className="px-4 py-3 bg-gray-50 cursor-pointer" onClick={onClick}>
        <p className="text-sm font-bold text-[#010C83]">{name}</p>
        {url && <p className="text-[10px] text-gray-400">{domain}</p>}
        {meta}
      </div>
      {children && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScreenshotCard.tsx
git commit -m "feat: add ScreenshotCard component with favicon + gradient fallback"
```

---

## Task 5: ColorStripPicker and LogoStyleGrid

**Files:**
- Create: `src/components/ColorStripPicker.tsx`
- Create: `src/components/LogoStyleGrid.tsx`

- [ ] **Step 1: Create ColorStripPicker**

```typescript
// src/components/ColorStripPicker.tsx
import { COLOR_PALETTES } from '../constants/colorPalettes';
import type { BriefData } from '../types';

export type PaletteRating = BriefData['colorPaletteRatings'][0];

export function ColorStripPicker({
  value,
  onChange,
}: {
  value: PaletteRating[];
  onChange: (next: PaletteRating[]) => void;
}) {
  // Initialize from COLOR_PALETTES if value is empty
  const ratings: PaletteRating[] =
    value.length === COLOR_PALETTES.length
      ? value
      : COLOR_PALETTES.map(p => ({ paletteName: p.name, swatches: p.swatches, rating: '' }));

  const cycle = (i: number) => {
    const cur = ratings[i].rating;
    const next: PaletteRating['rating'] = cur === '' ? 'like' : cur === 'like' ? 'skip' : '';
    onChange(ratings.map((r, idx) => idx === i ? { ...r, rating: next } : r));
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400">Tap to like · tap again to skip · tap again to reset</p>
      {ratings.map((p, i) => (
        <button
          key={p.paletteName}
          onClick={() => cycle(i)}
          className={`w-full flex items-center gap-3 rounded-xl p-2 border-2 transition-all cursor-pointer ${
            p.rating === 'like' ? 'border-green-400 bg-green-50' :
            p.rating === 'skip' ? 'border-gray-100 opacity-40' :
            'border-gray-100 hover:border-gray-200'
          }`}
        >
          {/* 5-swatch strip */}
          <div className="flex flex-1 h-8 rounded-lg overflow-hidden shadow-sm">
            {p.swatches.map((hex, j) => (
              <div key={j} className="flex-1" style={{ background: hex }} />
            ))}
          </div>
          <div className="flex items-center justify-between w-32">
            <span className="text-xs font-bold text-[#010C83]">{p.paletteName}</span>
            <span className="text-[10px] font-bold">
              {p.rating === 'like' ? '✓' : p.rating === 'skip' ? '–' : ''}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create LogoStyleGrid**

```typescript
// src/components/LogoStyleGrid.tsx
import { Check } from 'lucide-react';

const LOGO_STYLES = [
  { label: 'Wordmark',     preview: '𝗔𝗯𝗰', desc: 'Pure typography' },
  { label: 'Lettermark',  preview: 'AB',  desc: 'Monogram / initials' },
  { label: 'Pictorial',   preview: '⬟',   desc: 'Symbol / icon only' },
  { label: 'Abstract',    preview: '◈',   desc: 'Non-literal mark' },
  { label: 'Mascot',      preview: '🦊',  desc: 'Character-based' },
  { label: 'Emblem',      preview: '⬡',   desc: 'Badge / seal style' },
  { label: 'Combination', preview: '◆ Abc', desc: 'Icon + text' },
  { label: 'Geometric',   preview: '△▷',  desc: 'Shape-driven' },
];

export function LogoStyleGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (label: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {LOGO_STYLES.map(({ label, preview, desc }) => {
        const sel = value === label;
        return (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={`relative p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              sel ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {sel && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-[#EC008C] rounded-full flex items-center justify-center">
                <Check size={9} className="text-white" />
              </div>
            )}
            <div className="text-xl font-mono text-gray-400 mb-2">{preview}</div>
            <p className={`text-xs font-bold ${sel ? 'text-[#EC008C]' : 'text-[#010C83]'}`}>{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ColorStripPicker.tsx src/components/LogoStyleGrid.tsx
git commit -m "feat: add ColorStripPicker and LogoStyleGrid components"
```

---

## Task 6: Rewrite Setup.tsx — single CompanySetup

**Files:**
- Modify: `src/steps/Setup.tsx`

- [ ] **Step 1: Replace Setup.tsx**

```typescript
// src/steps/Setup.tsx
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PolarButton } from '../shared';
import type { BriefData } from '../types';

const PROJECT_TYPES = ['Branding', 'Rebranding', 'Brand Refresh', 'Sub-brand'];

export function CompanySetup({
  onDone,
}: {
  onDone: (data: Pick<BriefData, 'companyName' | 'projectType' | 'projectDate' | 'websiteUrl'>) => void;
}) {
  const [form, setForm] = useState({
    companyName: '',
    websiteUrl: '',
    projectType: 'Branding',
    projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: 'radial-gradient(ellipse at 60% 0%, #fce7f3 0%, #fdf2f8 40%, #f8f7ff 100%)' }}>
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-lg flex items-center justify-center shadow-md shadow-[#EC008C]/20">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span className="text-sm font-black text-[#010C83] tracking-tight">POLAR</span>
          </div>
          <h2 className="text-2xl font-black text-[#010C83] tracking-tight mb-1.5">Let's set up your brief</h2>
          <p className="text-gray-400 text-sm">A few quick details to get started.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-7 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Company Name</label>
            <input
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              placeholder="Acme Corp"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#EC008C]/40 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Website URL <span className="text-gray-300 normal-case font-normal">(optional — AI will scan it)</span></label>
            <input
              value={form.websiteUrl}
              onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
              placeholder="https://acmecorp.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#EC008C]/40 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Project Type</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, projectType: t }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    form.projectType === t
                      ? 'bg-gradient-to-r from-[#EC008C] to-[#d4007e] text-white border-transparent shadow-md shadow-[#EC008C]/20'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Date</label>
            <input
              value={form.projectDate}
              onChange={e => setForm(f => ({ ...f, projectDate: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#EC008C]/40 focus:bg-white transition-all"
            />
          </div>

          <PolarButton className="w-full h-11 text-sm mt-1" disabled={!form.companyName.trim()} onClick={() => onDone(form)}>
            Start Brief <ArrowRight size={15} />
          </PolarButton>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/steps/Setup.tsx
git commit -m "refactor: merge KickoffSetup+Confirmation into single CompanySetup"
```

---

## Task 7: Rewrite Discovery.tsx — ProblemSolution + MarketPosition + Product

**Files:**
- Modify: `src/steps/Discovery.tsx`

- [ ] **Step 1: Replace Discovery.tsx**

```typescript
// src/steps/Discovery.tsx
import { useState, useEffect, useRef } from 'react';
import { Target, Search, Upload, RefreshCw, ThumbsUp, ThumbsDown, Loader2, ArrowRight, Plus, Trash2, Flame, Zap, Sparkles, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen, aiScanUrl, aiAnalyzeFile } from '../shared';
import { ScreenshotCard } from '../components/ScreenshotCard';
import type { BriefData } from '../types';

// ── Problem + Solution (merged) ───────────────────────────────────────────────
export function ProblemSolution({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: { problemStatement: string; solutionDescription: string; websiteUrl: string; scanSource: string }) => void;
}) {
  const [mode, setMode] = useState<'choose' | 'url' | 'upload' | 'review'>('choose');
  const [url, setUrl] = useState(brief.websiteUrl || '');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [problemAlts, setProblemAlts] = useState<string[]>([]);
  const [solutionAlts, setSolutionAlts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brief.websiteUrl && mode === 'choose' && !problem) {
      setUrl(brief.websiteUrl);
      generateFromUrl(brief.websiteUrl);
    }
  }, [brief.websiteUrl]);

  const generateFromUrl = async (targetUrl: string) => {
    setLoading(true);
    setLoadingMsg('Scanning website…');
    try {
      const [p, s] = await Promise.all([
        aiScanUrl(targetUrl, `Brand strategist. Based on this website, write a 1-2 sentence Problem Statement. Return ONLY the statement.`),
        aiScanUrl(targetUrl, `Brand strategist. Based on this website, write a 1-2 sentence Solution Description of how they solve the problem. Return ONLY the solution.`),
      ]);
      setProblem(p.trim());
      setSolution(s.trim());
      setMode('review');
    } catch {
      setProblem(`${brief.companyName} solves the challenge of [describe your problem].`);
      setSolution(`${brief.companyName} solves this by [describe your solution].`);
      setMode('review');
    } finally { setLoading(false); setLoadingMsg(''); }
  };

  const generateFromFile = async (file: File) => {
    setLoading(true);
    setLoadingMsg('Reading document…');
    try {
      const [p, s] = await Promise.all([
        aiAnalyzeFile(file, `Brand strategist for "${brief.companyName}". Write a 1-2 sentence Problem Statement. Return ONLY the statement.`),
        aiAnalyzeFile(file, `Brand strategist for "${brief.companyName}". Write a 1-2 sentence Solution Description. Return ONLY the solution.`),
      ]);
      setProblem(p.trim());
      setSolution(s.trim());
      setMode('review');
    } catch {
      setProblem(`${brief.companyName} solves the challenge of [describe your problem].`);
      setSolution(`${brief.companyName} solves this by [describe your solution].`);
      setMode('review');
    } finally { setLoading(false); setLoadingMsg(''); }
  };

  const getAlts = async (which: 'problem' | 'solution') => {
    const draft = which === 'problem' ? problem : solution;
    setLoading(true);
    try {
      const raw = await aiGen(`Rewrite "${draft}" 3 ways, 1-2 sentences each. JSON array of 3 strings.`, true);
      if (which === 'problem') setProblemAlts(JSON.parse(raw));
      else setSolutionAlts(JSON.parse(raw));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  if (mode === 'choose') return (
    <Card title="Problem + Solution" icon={Target}>
      <p className="text-sm text-gray-500 mb-5">How does <strong className="text-[#010C83]">{brief.companyName}</strong> help its customers?</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('url')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-[#EC008C] bg-gradient-to-br from-[#EC008C]/5 to-[#EC008C]/10 text-[#EC008C] font-bold hover:from-[#EC008C]/10 transition-all cursor-pointer">
          <Search size={28} /><span className="text-sm">Scan website</span>
        </button>
        <button onClick={() => setMode('upload')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
          <Upload size={28} /><span className="text-sm">Upload doc</span>
        </button>
      </div>
    </Card>
  );

  if (mode === 'url') return (
    <Card title="Scan Website" icon={Search}>
      <p className="text-sm text-gray-500 mb-4">AI will extract both the problem and solution in one pass.</p>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && url && generateFromUrl(url)}
          placeholder="https://yourcompany.com"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EC008C]/40 transition-all" />
        <PolarButton onClick={() => generateFromUrl(url)} disabled={!url || loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Scan
        </PolarButton>
      </div>
      {loading && <div className="flex items-center gap-2 mt-3 text-xs text-[#EC008C]"><Loader2 size={12} className="animate-spin" /> {loadingMsg}</div>}
    </Card>
  );

  if (mode === 'upload') return (
    <Card title="Upload Document" icon={Upload}>
      <p className="text-sm text-gray-500 mb-4">Upload a pitch deck or brief — AI reads and extracts both outputs.</p>
      <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc,.txt" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { setUploadedFile(f); generateFromFile(f); } }} />
      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${loading ? 'border-[#EC008C]/30 bg-[#EC008C]/5' : 'border-gray-200 hover:border-[#EC008C]/40 hover:bg-[#EC008C]/5'}`}>
        {loading
          ? <><Loader2 size={28} className="mx-auto mb-2 text-[#EC008C] animate-spin" /><p className="text-sm text-[#EC008C]">{loadingMsg}</p></>
          : uploadedFile
          ? <><FileText size={28} className="mx-auto mb-2 text-[#010C83]" /><p className="text-sm font-medium text-[#010C83]">{uploadedFile.name}</p></>
          : <><Upload size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">Click to upload PDF, PPTX, DOCX, TXT</p></>}
      </div>
    </Card>
  );

  // review mode
  const AltList = ({ alts, onPick }: { alts: string[]; onPick: (a: string) => void }) => (
    alts.length > 0 ? (
      <div className="space-y-1.5 mt-2">
        {alts.map((a, i) => (
          <button key={i} onClick={() => onPick(a)}
            className="w-full text-left p-3 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-[#EC008C]/5 transition-colors border border-gray-100 cursor-pointer">{a}</button>
        ))}
      </div>
    ) : null
  );

  return (
    <Card title="Problem + Solution — Review" icon={Target}>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Problem Statement</p>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
            className="w-full p-3 rounded-xl bg-[#FFF0F8]/40 border-2 border-transparent focus:border-[#EC008C]/20 text-sm leading-relaxed resize-none transition-all" />
          <button onClick={() => getAlts('problem')} disabled={loading}
            className="mt-1 text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} 3 alternatives
          </button>
          <AltList alts={problemAlts} onPick={a => { setProblem(a); setProblemAlts([]); }} />
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Solution Description</p>
          <textarea value={solution} onChange={e => setSolution(e.target.value)} rows={3}
            className="w-full p-3 rounded-xl bg-[#FFF0F8]/40 border-2 border-transparent focus:border-[#EC008C]/20 text-sm leading-relaxed resize-none transition-all" />
          <button onClick={() => getAlts('solution')} disabled={loading}
            className="mt-1 text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} 3 alternatives
          </button>
          <AltList alts={solutionAlts} onPick={a => { setSolution(a); setSolutionAlts([]); }} />
        </div>

        <PolarButton className="w-full" disabled={!problem || !solution}
          onClick={() => onDone({ problemStatement: problem, solutionDescription: solution, websiteUrl: url, scanSource: url || uploadedFile?.name || `${brief.companyName} document` })}>
          Approve & Continue <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Market Position (Competitors + UVP merged) ────────────────────────────────
export function MarketPosition({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: { competitors: BriefData['competitors']; competitorScreenshots: Record<string, string>; uvp: string[] }) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState<'similar' | 'different'>('similar');
  const [comps, setComps] = useState<BriefData['competitors']>([]);
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uvpLoading, setUvpLoading] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const simTags = ['Same ICP', 'Same pricing', 'Same tech'];
  const diffTags = ['Better UX', 'Niche focus', 'Different pricing'];

  const add = async () => {
    if (!name) return;
    setLoading(true);
    let tagline = '';
    const entryUrl = url.trim();
    try {
      const r = await aiGen(`For brand "${name}", return JSON: {"tagline":"one-line tagline max 8 words"}`, true);
      tagline = JSON.parse(r).tagline || '';
    } catch {}
    const newComp = { name, url: entryUrl, tagline, tags: [cat === 'similar' ? 'Same ICP' : 'Better UX'], tagCategory: cat };
    setComps(p => { const next = [...p, newComp]; setActive(next.length - 1); return next; });
    setName(''); setUrl(''); setLoading(false);
    // Non-blocking screenshot placeholder (just store domain as key)
    if (entryUrl) {
      setScreenshots(s => ({ ...s, [entryUrl]: 'pending' }));
    }
  };

  const generateUVP = async (): Promise<string[]> => {
    setUvpLoading(true);
    try {
      const compList = comps.map(c => c.name).join(', ') || 'various competitors';
      const raw = await aiGen(
        `Brand: "${brief.companyName}". Problem: "${brief.problemStatement}". Competitors: ${compList}. Generate 4 bold UVP sentences. JSON array of 4 strings.`, true
      );
      return JSON.parse(raw);
    } catch {
      return [`${brief.companyName} is the only platform built specifically for this challenge.`];
    } finally { setUvpLoading(false); }
  };

  const handleDone = async () => {
    const uvp = await generateUVP();
    onDone({ competitors: comps, competitorScreenshots: screenshots, uvp });
  };

  return (
    <Card title="Market Position" icon={Flame}>
      <div className="space-y-4">
        <p className="text-xs text-gray-400">Add your main competitors. AI will derive your UVP automatically when you continue.</p>

        {comps.map((c, i) => (
          <ScreenshotCard
            key={i}
            name={c.name}
            url={c.url}
            active={active === i}
            onClick={() => setActive(active === i ? null : i)}
            onRemove={() => { setComps(p => p.filter((_, idx) => idx !== i)); if (active === i) setActive(null); }}
            meta={
              <div className="flex gap-1 mt-1 flex-wrap">
                {c.tags.map(t => (
                  <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.tagCategory === 'similar' ? 'bg-[#010C83]/10 text-[#010C83]' : 'bg-[#EC008C]/10 text-[#EC008C]'}`}>{t}</span>
                ))}
              </div>
            }
          />
        ))}

        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            {(['similar', 'different'] as const).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${cat === c ? 'border-[#EC008C] bg-[#EC008C] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                {c === 'similar' ? '⚡ Similar' : '🔀 Different'}
              </button>
            ))}
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Competitor name"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/40 transition-all" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/40 transition-all" />
          <PolarButton variant="secondary" onClick={add} disabled={!name || loading} className="w-full">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : <><Plus size={14} /> Add Competitor</>}
          </PolarButton>
        </div>

        <PolarButton disabled={comps.length < 1 || uvpLoading} onClick={handleDone} className="w-full">
          {uvpLoading ? <><Loader2 size={16} className="animate-spin" /> Deriving UVPs…</> : <>Continue ({comps.length} added) <ArrowRight size={16} /></>}
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Product (FeatureBuilder renamed) ─────────────────────────────────────────
export function Product({ brief, onDone }: { brief: BriefData; onDone: (f: BriefData['features']) => void }) {
  const [features, setFeatures] = useState<BriefData['features']>([{ title: '', desc: '' }, { title: '', desc: '' }]);
  const [loading, setLoading] = useState(false);

  const suggest = async () => {
    setLoading(true);
    try {
      const raw = await aiGen(`For "${brief.companyName}" solving "${brief.problemStatement}", suggest 3 key product features. JSON array of {title, desc}.`, true);
      setFeatures(JSON.parse(raw));
    } catch {} finally { setLoading(false); }
  };

  const up = (i: number, f: 'title' | 'desc', v: string) => setFeatures(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  return (
    <Card title="Main Product Features" icon={Zap}>
      <div className="space-y-3">
        <button onClick={suggest} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#EC008C]/30 rounded-xl text-xs font-bold text-[#EC008C] hover:bg-[#EC008C]/5 transition-all cursor-pointer disabled:opacity-40">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Suggest Features
        </button>
        {features.map((f, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 group relative">
            <button onClick={() => setFeatures(p => p.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={14} /></button>
            <input value={f.title} onChange={e => up(i, 'title', e.target.value)} placeholder="Feature name" className="w-full text-sm font-bold text-[#010C83] bg-transparent border-none focus:ring-0 p-0 mb-1" />
            <textarea value={f.desc} onChange={e => up(i, 'desc', e.target.value)} placeholder="One-line description" className="w-full text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 resize-none" rows={2} />
          </div>
        ))}
        <button onClick={() => setFeatures(p => [...p, { title: '', desc: '' }])}
          className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-[#EC008C] hover:border-[#EC008C]/30 transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer">
          <Plus size={14} /> Add Feature
        </button>
        <PolarButton onClick={() => onDone(features.filter(f => f.title))} disabled={!features.some(f => f.title)} className="w-full">
          Save Features <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/steps/Discovery.tsx
git commit -m "refactor: merge Discovery steps into ProblemSolution + MarketPosition + Product"
```

---

## Task 8: Rewrite BrandAudit.tsx — single merged component

**Files:**
- Modify: `src/steps/BrandAudit.tsx`

- [ ] **Step 1: Replace BrandAudit.tsx**

```typescript
// src/steps/BrandAudit.tsx
import { useState, useRef } from 'react';
import { Type, Image, ArrowRight, Loader2, CheckCircle2, Check, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen, aiAnalyzeFile } from '../shared';
import { MoodBoard } from '../components/MoodBoard';
import type { BriefData, MoodState } from '../types';

// Re-export type for MoodBoard
export type { MoodState };

const LOGO_INTENT_CHIPS = ['Trust', 'Innovation', 'Approachability', 'Premium', 'Boldness', 'Simplicity', 'Energy', 'Reliability', 'Creativity', 'Professionalism'];
const VISUAL_MOOD_CATEGORIES = ['timeless', 'bold', 'premium', 'playful', 'organic', 'trustworthy', 'minimal', 'expressive'];

export function BrandAudit({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: {
    companyNameMeaning: string;
    logoRationale: string;
    logoRationaleChips: string[];
    visualLanguageMood: BriefData['visualLanguageMood'];
  }) => void;
}) {
  // Name meaning
  const [nameMeaning, setNameMeaning] = useState('');
  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoAttrs, setLogoAttrs] = useState<string[]>([]);
  const [logoChips, setLogoChips] = useState<string[]>([]);
  const [logoRationale, setLogoRationale] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  // Visual mood
  const [mood, setMood] = useState<BriefData['visualLanguageMood']>({ liked: [], skipped: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyseLogoFile = async (file: File) => {
    setLogoLoading(true);
    if (file.type.startsWith('image/')) setLogoPreview(URL.createObjectURL(file));
    try {
      const raw = await aiAnalyzeFile(file, `Brand designer analysing a logo for "${brief.companyName}". List exactly 4 specific visual attributes. JSON array of 4 short strings.`);
      setLogoAttrs(JSON.parse(raw));
    } catch {
      setLogoAttrs(['Wordmark style', 'Brand colors', 'Geometric elements', 'Clean typography']);
    } finally { setLogoLoading(false); }
  };

  const togChip = (c: string) => setLogoChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const canContinue = nameMeaning.trim().length > 0 && mood.liked.length > 0;

  return (
    <Card title="Brand Audit" icon={Type}>
      <div className="space-y-7">
        {/* Section 1: Name meaning */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Company Name Meaning</p>
          <textarea
            value={nameMeaning}
            onChange={e => setNameMeaning(e.target.value)}
            placeholder={`What's the story behind "${brief.companyName}"?`}
            rows={3}
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm leading-relaxed focus:outline-none focus:border-[#EC008C]/40 resize-none transition-all"
          />
        </div>

        {/* Section 2: Logo */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Logo Rationale <span className="text-gray-300 font-normal normal-case">(optional)</span></p>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); analyseLogoFile(f); } }} />
          {!logoFile ? (
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#EC008C]/40 hover:bg-[#EC008C]/5 transition-all">
              <Image size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Upload logo (PNG, JPG, SVG)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div onClick={() => fileInputRef.current?.click()} className="relative rounded-xl border border-gray-100 bg-gray-50 overflow-hidden cursor-pointer group">
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className="w-full max-h-24 object-contain p-3" />
                  : <div className="flex items-center gap-2 p-3"><FileText size={20} className="text-[#010C83]" /><span className="text-sm">{logoFile.name}</span></div>}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
              </div>
              {logoLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#EC008C]"><Loader2 size={14} className="animate-spin" /> Analysing…</div>
              ) : logoAttrs.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {logoAttrs.map(a => <span key={a} className="flex items-center gap-1 px-3 py-1 bg-[#010C83]/5 text-[#010C83] rounded-full text-xs font-bold"><Check size={10} />{a}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOGO_INTENT_CHIPS.map(c => (
                      <button key={c} onClick={() => togChip(c)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${logoChips.includes(c) ? 'bg-[#EC008C] text-white border-[#EC008C]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{c}</button>
                    ))}
                  </div>
                  <textarea value={logoRationale} onChange={e => setLogoRationale(e.target.value)} placeholder="Any additional context…" rows={2}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#EC008C]/40 transition-all" />
                </>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Visual Language Mood Board */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Visual Language — Mood Board</p>
          <p className="text-xs text-gray-400 mb-3">Which moods reflect your brand's current visual language?</p>
          <MoodBoard categories={VISUAL_MOOD_CATEGORIES} value={mood} onChange={setMood} />
        </div>

        <PolarButton className="w-full" disabled={!canContinue}
          onClick={() => onDone({ companyNameMeaning: nameMeaning, logoRationale, logoRationaleChips: logoChips, visualLanguageMood: mood })}>
          Save Brand Audit <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}
```

**Note:** `MoodState` is not exported from types.ts — remove the re-export line from BrandAudit.tsx. BriefData already has `visualLanguageMood: { liked: string[]; skipped: string[] }`.

- [ ] **Step 2: Commit**

```bash
git add src/steps/BrandAudit.tsx
git commit -m "refactor: merge Brand Audit into single component with MoodBoard"
```

---

## Task 9: Rewrite BrandDirection.tsx — BrandVoice + BrandValuesDirection

**Files:**
- Modify: `src/steps/BrandDirection.tsx`

- [ ] **Step 1: Replace BrandDirection.tsx**

```typescript
// src/steps/BrandDirection.tsx
import { useState, useEffect } from 'react';
import { Palette, MessageSquare, Star, Layers, RefreshCw, ThumbsUp, ThumbsDown, ArrowRight, Loader2, Check } from 'lucide-react';
import { PolarButton, Card, aiGen } from '../shared';
import { MoodBoard } from '../components/MoodBoard';
import type { BriefData } from '../types';

const KW_ICONS: Record<string, string> = { Innovative: '⚡', Trustworthy: '🛡', Bold: '🔥', Minimalist: '○', Playful: '😊', Professional: '💼', Elegant: '★', 'Tech-forward': '💻', 'Human-centric': '🫂', Sustainable: '🌿', Fast: '⚡', Secure: '🔒', Accessible: '♿', Premium: '👑', Disruptive: '💥', Authentic: '✓', Empowering: '🚀', Precise: '🎯', Global: '🌍', Collaborative: '🤝' };
const BASE_KW = ['Innovative','Trustworthy','Bold','Minimalist','Playful','Professional','Disruptive','Elegant','Tech-forward','Human-centric','Sustainable','Fast','Secure','Accessible','Premium','Authentic','Empowering','Precise','Global','Collaborative'];
const DIRECTION_CATEGORIES = ['timeless', 'bold', 'premium', 'playful', 'organic', 'minimal', 'expressive', 'innovative', 'warm', 'trustworthy'];

// ── Brand Voice (Keywords + Messages merged) ──────────────────────────────────
export function BrandVoice({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: { keywords: string[]; brandMessages: BriefData['brandMessages'] }) => void;
}) {
  const [all, setAll] = useState(BASE_KW);
  const [sel, setSel] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [kwLoading, setKwLoading] = useState(true);

  type Msg = { keyword: string; message: string; approved: boolean; alts: string[]; rating: 'up' | 'down' | '' };
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [phase, setPhase] = useState<'keywords' | 'messages'>('keywords');

  useEffect(() => {
    let cancelled = false;
    aiGen(`For company "${brief.companyName}" solving "${brief.problemStatement}", recommend 5 brand keywords from: ${BASE_KW.join(', ')}. JSON array.`, true)
      .then(r => { if (!cancelled) setAiRecs(JSON.parse(r)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setKwLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const togKw = (k: string) => {
    if (sel.includes(k)) setSel(p => p.filter(s => s !== k));
    else if (sel.length < 7) setSel(p => [...p, k]);
  };
  const addCustom = () => {
    if (!custom || all.includes(custom)) return;
    setAll(p => [...p, custom]);
    if (sel.length < 7) setSel(p => [...p, custom]);
    setCustom('');
  };

  const generateMessages = async () => {
    setMsgsLoading(true);
    setPhase('messages');
    try {
      const raw = await aiGen(`For brand "${brief.companyName}", write one brand manifesto message per keyword: ${sel.join(', ')}. Bold, specific. JSON array of {keyword, message}.`, true);
      setMsgs(JSON.parse(raw).map((d: any) => ({ ...d, approved: false, alts: [], rating: '' })));
    } catch {
      setMsgs(sel.map(k => ({ keyword: k, message: `We believe ${k.toLowerCase()} is the foundation of everything we build.`, approved: false, alts: [], rating: '' })));
    } finally { setMsgsLoading(false); }
  };

  const getAlts = async (i: number) => {
    try {
      const raw = await aiGen(`Write 2 alternative brand messages for keyword "${msgs[i].keyword}". JSON array of 2 strings.`, true);
      setMsgs(p => p.map((m, idx) => idx === i ? { ...m, alts: JSON.parse(raw) } : m));
    } catch {}
  };
  const rate = (i: number, r: 'up' | 'down') => setMsgs(p => p.map((m, idx) => idx === i ? { ...m, rating: r, approved: r === 'up' } : m));
  const useAlt = (i: number, alt: string) => setMsgs(p => p.map((m, idx) => idx === i ? { ...m, message: alt, alts: [] } : m));

  if (phase === 'keywords') return (
    <Card title="Brand Voice — Keywords" icon={Palette}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Select 6–7 keywords (<span className="font-bold text-[#EC008C]">{sel.length}/7</span>)</p>
          {kwLoading && <Loader2 size={14} className="animate-spin text-[#EC008C]" />}
        </div>
        <div className="flex flex-wrap gap-2">
          {all.map(k => (
            <button key={k} onClick={() => togKw(k)}
              className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all border cursor-pointer ${sel.includes(k) ? 'bg-[#EC008C] text-white border-[#EC008C] shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-[#EC008C]/30'}`}>
              {k}
              {aiRecs.includes(k) && !sel.includes(k) && <span className="absolute -top-1.5 -right-1 text-[9px] text-[#EC008C] font-black">✦</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder="Add custom keyword…"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#EC008C]/30" />
          <button onClick={addCustom} className="px-4 py-2 bg-[#010C83]/5 text-[#010C83] rounded-xl text-xs font-bold hover:bg-[#010C83]/10 transition-all cursor-pointer">Add</button>
        </div>
        {aiRecs.length > 0 && <p className="text-[10px] text-gray-400"><span className="text-[#EC008C] font-black">✦</span> = AI recommended</p>}
        <PolarButton disabled={sel.length < 6} onClick={generateMessages} className="w-full">
          {msgsLoading ? <><Loader2 size={14} className="animate-spin" /> Generating messages…</> : <>Generate Brand Messages <ArrowRight size={16} /></>}
        </PolarButton>
      </div>
    </Card>
  );

  return (
    <Card title="Brand Voice — Messages" icon={MessageSquare}>
      <div className="space-y-4">
        {msgsLoading ? (
          <div className="flex items-center gap-3 p-4 text-sm text-gray-400"><Loader2 size={18} className="animate-spin text-[#EC008C]" /> Generating…</div>
        ) : (
          <>
            {msgs.map((m, i) => (
              <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${m.approved ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC008C]">{KW_ICONS[m.keyword] || '•'} {m.keyword}</span>
                  {m.approved && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={10} /> Approved</span>}
                </div>
                <p className="text-sm text-gray-700 italic mb-3">"{m.message}"</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => rate(i, 'up')} className={`p-1.5 rounded-lg transition-all cursor-pointer ${m.rating === 'up' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><ThumbsUp size={13} /></button>
                  <button onClick={() => rate(i, 'down')} className={`p-1.5 rounded-lg transition-all cursor-pointer ${m.rating === 'down' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><ThumbsDown size={13} /></button>
                  <button onClick={() => getAlts(i)} className="ml-auto text-[11px] font-bold text-[#010C83] hover:underline flex items-center gap-1 cursor-pointer"><RefreshCw size={11} /> 2 alternatives</button>
                </div>
                {m.alts.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {m.alts.map((a, j) => <button key={j} onClick={() => useAlt(i, a)} className="w-full text-left p-2.5 rounded-lg bg-gray-50 text-xs text-gray-600 hover:bg-[#EC008C]/5 transition-colors border border-gray-100 cursor-pointer">"{a}"</button>)}
                  </div>
                )}
              </div>
            ))}
            <PolarButton disabled={msgs.filter(m => m.approved).length === 0}
              onClick={() => onDone({ keywords: sel, brandMessages: msgs.filter(m => m.approved) })} className="w-full">
              Approve Messages ({msgs.filter(m => m.approved).length}) <ArrowRight size={16} />
            </PolarButton>
          </>
        )}
      </div>
    </Card>
  );
}

// ── Brand Values + Direction (merged) ─────────────────────────────────────────
export function BrandValuesDirection({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: { selectedValues: string[]; visualDirection: BriefData['visualDirection'] }) => void;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const [v1mood, setV1mood] = useState<BriefData['visualDirection']['value1']>({ valueName: '', moodLiked: [], moodSkipped: [] });
  const [v2mood, setV2mood] = useState<BriefData['visualDirection']['value2']>({ valueName: '', moodLiked: [], moodSkipped: [] });
  const [phase, setPhase] = useState<'values' | 'direction1' | 'direction2'>('values');

  const msgs = brief.brandMessages.length > 0 ? brief.brandMessages : brief.keywords.map(k => ({ keyword: k, message: `We believe in ${k.toLowerCase()}.`, approved: true }));
  const togVal = (k: string) => { if (sel.includes(k)) setSel(p => p.filter(s => s !== k)); else if (sel.length < 2) setSel(p => [...p, k]); };

  if (phase === 'values') return (
    <Card title="Core Values" icon={Star}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Pick 2 values that will anchor your visual directions.</p>
        {msgs.slice(0, 8).map((m, i) => (
          <button key={i} onClick={() => togVal(m.keyword)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${sel.includes(m.keyword) ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EC008C]">{m.keyword}</span>
              {sel.includes(m.keyword) && <div className="w-5 h-5 rounded-full bg-[#EC008C] flex items-center justify-center"><Check size={11} className="text-white" /></div>}
            </div>
            <p className="text-sm text-gray-600 italic mt-1">"{m.message}"</p>
          </button>
        ))}
        <p className="text-[10px] text-gray-400 text-center">{sel.length}/2 selected</p>
        <PolarButton disabled={sel.length !== 2}
          onClick={() => { setV1mood(p => ({ ...p, valueName: sel[0] })); setV2mood(p => ({ ...p, valueName: sel[1] })); setPhase('direction1'); }}
          className="w-full">Set Core Values <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );

  if (phase === 'direction1') return (
    <Card title={`Visual Direction: ${sel[0]}`} icon={Layers}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Which moods capture the visual feeling of <strong className="text-[#010C83]">{sel[0]}</strong>?</p>
        <MoodBoard
          categories={DIRECTION_CATEGORIES}
          value={{ liked: v1mood.moodLiked, skipped: v1mood.moodSkipped }}
          onChange={m => setV1mood(p => ({ ...p, moodLiked: m.liked, moodSkipped: m.skipped }))}
        />
        <PolarButton disabled={v1mood.moodLiked.length === 0}
          onClick={() => setPhase('direction2')} className="w-full">
          Continue to {sel[1]} Direction <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );

  return (
    <Card title={`Visual Direction: ${sel[1]}`} icon={Layers}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Which moods capture the visual feeling of <strong className="text-[#010C83]">{sel[1]}</strong>?</p>
        <MoodBoard
          categories={DIRECTION_CATEGORIES}
          value={{ liked: v2mood.moodLiked, skipped: v2mood.moodSkipped }}
          onChange={m => setV2mood(p => ({ ...p, moodLiked: m.liked, moodSkipped: m.skipped }))}
        />
        <PolarButton disabled={v2mood.moodLiked.length === 0}
          onClick={() => onDone({ selectedValues: sel, visualDirection: { value1: v1mood, value2: v2mood } })} className="w-full">
          Confirm Directions <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/steps/BrandDirection.tsx
git commit -m "refactor: merge Brand Direction into BrandVoice + BrandValuesDirection with MoodBoard"
```

---

## Task 10: Rewrite VisualPrefs.tsx — single VisualReferences + updated SummaryReview

**Files:**
- Modify: `src/steps/VisualPrefs.tsx`

- [ ] **Step 1: Replace VisualPrefs.tsx**

```typescript
// src/steps/VisualPrefs.tsx
import { useState } from 'react';
import { Globe, Layers, Palette, ArrowRight, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen } from '../shared';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { LogoStyleGrid } from '../components/LogoStyleGrid';
import { ColorStripPicker } from '../components/ColorStripPicker';
import type { BriefData } from '../types';

// ── Visual References (Reference Brands + Logo Style + Color Palette merged) ──
const LIKE_OPTIONS = ['Color palette','Typography','Logo mark','Motion/animation','Photography','Illustration','Overall feel','Simplicity','Boldness','Modernity'];
const DISLIKE_OPTIONS = ['Too corporate','Too playful','Too minimal','Too complex','Color clash','Dated feel','Lacks warmth','Overly technical','Generic','Too loud'];

export function VisualReferences({
  brief,
  onDone,
}: {
  brief: BriefData;
  onDone: (d: {
    referenceBrands: BriefData['referenceBrands'];
    referenceScreenshots: Record<string, string>;
    logoStyle: string;
    logoOpenToRecommendations: boolean;
    colorPaletteRatings: BriefData['colorPaletteRatings'];
  }) => void;
}) {
  // Reference brands
  const [brands, setBrands] = useState<BriefData['referenceBrands']>([]);
  const [refScreenshots] = useState<Record<string, string>>({});
  const [brandName, setBrandName] = useState('');
  const [brandUrl, setBrandUrl] = useState('');
  const [activeB, setActiveB] = useState<number | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  // Logo
  const [logoStyle, setLogoStyle] = useState('');
  const [logoOpen, setLogoOpen] = useState(false);
  // Color
  const [colorRatings, setColorRatings] = useState<BriefData['colorPaletteRatings']>([]);

  const addBrand = async () => {
    if (!brandName.trim()) return;
    const nb = { name: brandName.trim(), url: brandUrl.trim(), likes: [], dislikes: [] };
    setBrands(p => { const next = [...p, nb]; setActiveB(next.length - 1); return next; });
    setBrandName(''); setBrandUrl('');
    if (brandUrl.trim()) {
      setBrandLoading(true);
      try {
        const raw = await aiGen(`For brand "${brandName.trim()}" (${brandUrl.trim()}), suggest 3 visual elements typically praised. JSON array of short strings (max 4 words each).`, true);
        const suggestions: string[] = JSON.parse(raw);
        setBrands(p => p.map((b, i) => i === p.length - 1 ? { ...b, likes: suggestions } : b));
      } catch {} finally { setBrandLoading(false); }
    }
  };

  const togLike = (i: number, opt: string) => setBrands(p => p.map((b, idx) => idx === i ? { ...b, likes: b.likes.includes(opt) ? b.likes.filter(x => x !== opt) : [...b.likes, opt] } : b));
  const togDislike = (i: number, opt: string) => setBrands(p => p.map((b, idx) => idx === i ? { ...b, dislikes: b.dislikes.includes(opt) ? b.dislikes.filter(x => x !== opt) : [...b.dislikes, opt] } : b));
  const removeBrand = (i: number) => { setBrands(p => p.filter((_, idx) => idx !== i)); if (activeB === i) setActiveB(null); };

  const canContinue = brands.length > 0 && (logoStyle || logoOpen) && colorRatings.filter(r => r.rating === 'like').length > 0;

  return (
    <Card title="Visual References" icon={Globe}>
      <div className="space-y-7">

        {/* Reference Brands */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reference Brands</p>
          <p className="text-xs text-gray-400 mb-3">Brands you admire — tell us what you like and dislike.</p>
          {brands.map((b, i) => (
            <ScreenshotCard key={i} name={b.name} url={b.url}
              active={activeB === i}
              onClick={() => setActiveB(activeB === i ? null : i)}
              onRemove={() => removeBrand(i)}
              meta={<p className="text-[10px] text-gray-400 mt-0.5">{b.likes.length} likes · {b.dislikes.length} dislikes</p>}
            >
              {activeB === i && (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ThumbsUp size={10} /> What do you like?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LIKE_OPTIONS.map(o => <button key={o} onClick={() => togLike(i, o)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${b.likes.includes(o) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{o}</button>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ThumbsDown size={10} /> What don't you like?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DISLIKE_OPTIONS.map(o => <button key={o} onClick={() => togDislike(i, o)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${b.dislikes.includes(o) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{o}</button>)}
                    </div>
                  </div>
                </div>
              )}
            </ScreenshotCard>
          ))}
          <div className="space-y-2 mt-3">
            <div className="flex gap-2">
              <input value={brandName} onChange={e => setBrandName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} placeholder="Brand name"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/30" />
              <input value={brandUrl} onChange={e => setBrandUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} placeholder="Website (optional)"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/30" />
            </div>
            <button onClick={addBrand} disabled={!brandName.trim() || brandLoading}
              className="w-full py-2 bg-[#010C83]/5 text-[#010C83] rounded-xl text-xs font-bold hover:bg-[#010C83]/10 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer">
              {brandLoading ? <Loader2 size={12} className="animate-spin" /> : '+'} Add Brand
            </button>
          </div>
        </div>

        {/* Logo Style */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Logo Style Direction</p>
          <LogoStyleGrid value={logoStyle} onChange={setLogoStyle} />
          <button onClick={() => setLogoOpen(o => !o)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all mt-2 cursor-pointer ${logoOpen ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 hover:border-gray-200'}`}>
            <div className="text-left">
              <p className={`text-xs font-bold ${logoOpen ? 'text-[#EC008C]' : 'text-gray-600'}`}>Open to Polar's recommendation</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Let our team propose the best direction</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${logoOpen ? 'bg-[#EC008C] border-[#EC008C]' : 'border-gray-300'}`}>
              {logoOpen && <span className="text-white text-[9px] font-black">✓</span>}
            </div>
          </button>
        </div>

        {/* Color Palettes */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Color Palette</p>
          <ColorStripPicker value={colorRatings} onChange={setColorRatings} />
        </div>

        <PolarButton disabled={!canContinue}
          onClick={() => onDone({ referenceBrands: brands, referenceScreenshots: refScreenshots, logoStyle, logoOpenToRecommendations: logoOpen, colorPaletteRatings: colorRatings })}
          className="w-full">
          Save Visual Preferences <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Summary Review ─────────────────────────────────────────────────────────────
export function SummaryReview({ brief, onDone }: { brief: BriefData; onDone: () => void }) {
  const likedPalettes = brief.colorPaletteRatings.filter(r => r.rating === 'like').map(r => r.paletteName).join(', ') || '—';

  const sections = [
    {
      label: 'Discovery',
      items: [
        ['Company', brief.companyName],
        ['Project', brief.projectType],
        ['Problem', brief.problemStatement ? brief.problemStatement.slice(0, 80) + (brief.problemStatement.length > 80 ? '…' : '') : '—'],
        ['Solution', brief.solutionDescription ? brief.solutionDescription.slice(0, 80) + (brief.solutionDescription.length > 80 ? '…' : '') : '—'],
        ['Competitors', brief.competitors.length > 0 ? brief.competitors.map(c => c.name).join(', ') : '—'],
        ['Features', brief.features.length > 0 ? `${brief.features.length} defined` : '—'],
      ],
    },
    {
      label: 'Brand Audit',
      items: [
        ['Name meaning', brief.companyNameMeaning ? '✓ Captured' : '—'],
        ['Logo intent', brief.logoRationaleChips.length > 0 ? brief.logoRationaleChips.slice(0, 3).join(' · ') : '—'],
        ['Visual mood (liked)', brief.visualLanguageMood.liked.join(', ') || '—'],
      ],
    },
    {
      label: 'Brand Direction',
      items: [
        ['Keywords', brief.keywords.length > 0 ? brief.keywords.slice(0, 5).join(' · ') : '—'],
        ['Messages', `${brief.brandMessages.length} approved`],
        ['Core values', brief.selectedValues.length > 0 ? brief.selectedValues.join(' + ') : '—'],
        ['Value 1 mood', brief.visualDirection.value1.moodLiked.join(', ') || '—'],
        ['Value 2 mood', brief.visualDirection.value2.moodLiked.join(', ') || '—'],
      ],
    },
    {
      label: 'Visual Preferences',
      items: [
        ['Reference brands', brief.referenceBrands.length > 0 ? brief.referenceBrands.map(b => b.name).join(', ') : '—'],
        ['Logo style', brief.logoStyle || (brief.logoOpenToRecommendations ? 'Open to recommendation' : '—')],
        ['Palettes liked', likedPalettes],
      ],
    },
  ];

  return (
    <Card title="Brief Summary" icon={FileText}>
      <div className="space-y-5">
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle2 size={16} className="text-green-600" />
          <p className="text-xs font-bold text-green-700">Brief complete — ready to share with Polar</p>
        </div>
        {sections.map(sec => (
          <div key={sec.label}>
            <p className="text-[10px] font-bold text-[#EC008C] uppercase tracking-widest mb-2">{sec.label}</p>
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 border border-gray-100">
              {sec.items.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between px-4 py-2.5 gap-3">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{label}</span>
                  <span className="text-[11px] font-medium text-[#010C83] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <PolarButton onClick={onDone} className="w-full h-12">Submit Brief to Polar <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/steps/VisualPrefs.tsx
git commit -m "refactor: merge Visual Prefs into VisualReferences with ScreenshotCard+LogoStyleGrid+ColorStripPicker"
```

---

## Task 11: Rewrite App.tsx — 9-step routing + updated sidebar

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx**

Replace imports and routing. Key changes: new step names, updated `NAV_SECTIONS`, remove `kickoff` case, use `CompanySetup`.

```typescript
// src/App.tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { GeminiAssistant } from './GeminiAssistant';
import { SettingsButton } from './Settings';
import { INITIAL_BRIEF, STEPS_ORDER } from './types';
import type { BriefData, BriefStep } from './types';

import { CompanySetup } from './steps/Setup';
import { ProblemSolution, MarketPosition, Product } from './steps/Discovery';
import { BrandAudit } from './steps/BrandAudit';
import { BrandVoice, BrandValuesDirection } from './steps/BrandDirection';
import { VisualReferences, SummaryReview } from './steps/VisualPrefs';

const NAV_SECTIONS = [
  {
    label: 'Discovery',
    steps: [
      { id: 'problem_solution' as BriefStep, label: 'Problem + Solution' },
      { id: 'market_position' as BriefStep, label: 'Market Position' },
      { id: 'product' as BriefStep, label: 'Product' },
    ],
  },
  {
    label: 'Brand',
    steps: [
      { id: 'brand_audit' as BriefStep, label: 'Brand Audit' },
      { id: 'brand_voice' as BriefStep, label: 'Brand Voice' },
      { id: 'brand_values_direction' as BriefStep, label: 'Values + Direction' },
    ],
  },
  {
    label: 'Visual',
    steps: [
      { id: 'visual_references' as BriefStep, label: 'Visual References' },
      { id: 'summary' as BriefStep, label: 'Summary' },
    ],
  },
];

function Sidebar({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  const currentIdx = STEPS_ORDER.indexOf(step);
  return (
    <div className="w-60 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-lg flex items-center justify-center shadow-md shadow-[#EC008C]/20">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <div>
            <p className="text-sm font-black text-[#010C83] tracking-tight">POLAR</p>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Brand Brief</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto min-h-0">
        {NAV_SECTIONS.map(sec => (
          <div key={sec.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-300 px-2 mb-1.5">{sec.label}</p>
            <div className="space-y-0.5">
              {sec.steps.map(s => {
                const sIdx = STEPS_ORDER.indexOf(s.id);
                const isDone = completed.has(s.id);
                const isCurrent = s.id === step;
                const isLocked = sIdx > currentIdx && !isDone;
                return (
                  <div key={s.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11.5px] font-medium transition-all duration-150 ${
                      isCurrent ? 'bg-gradient-to-r from-[#EC008C]/12 to-[#EC008C]/5 text-[#EC008C] font-semibold'
                      : isDone ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-default'
                      : isLocked ? 'text-gray-200 cursor-default'
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {isDone
                      ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                      : isCurrent
                      ? <div className="w-1.5 h-1.5 rounded-full bg-[#EC008C] flex-shrink-0 shadow-sm shadow-[#EC008C]/50" />
                      : <div className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-300 font-medium">Polar Brief</span>
        <SettingsButton />
      </div>
    </div>
  );
}

function ProgressBar({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  const clientSteps = STEPS_ORDER.filter(s => s !== 'setup');
  const idx = clientSteps.indexOf(step);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / clientSteps.length) * 100);
  return (
    <div className="h-[3px] bg-gray-100 w-full">
      <motion.div className="h-full bg-gradient-to-r from-[#EC008C] to-[#f542a8]"
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} />
    </div>
  );
}

function SubmittedScreen({ brief }: { brief: BriefData }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at 50% 0%, #fce7f3 0%, #fdf2f8 50%, #f8f7ff 100%)' }}>
      <div className="text-center space-y-7 max-w-sm w-full">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#EC008C]/25">
          <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-[#010C83] tracking-tight mb-2">Brief Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">Thank you, <strong className="text-[#010C83]">{brief.companyName}</strong>. The Polar team will review your brief shortly.</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            ['Keywords', `${brief.keywords.length} selected`],
            ['Messages', `${brief.brandMessages.length} approved`],
            ['Competitors', `${brief.competitors.length} mapped`],
            ['References', `${brief.referenceBrands.length} added`],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white shadow-sm text-left">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{k}</p>
              <p className="text-sm font-bold text-[#010C83] mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [brief, setBrief] = useState<BriefData>(INITIAL_BRIEF);
  const [step, setStep] = useState<BriefStep>('setup');
  const [completed, setCompleted] = useState<Set<BriefStep>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const markDone = (s: BriefStep) => setCompleted(p => new Set([...p, s]));
  const next = (s: BriefStep) => {
    markDone(s);
    const idx = STEPS_ORDER.indexOf(s);
    if (idx + 1 < STEPS_ORDER.length) setStep(STEPS_ORDER[idx + 1]);
  };
  const upd = (patch: Partial<BriefData>) => setBrief(p => ({ ...p, ...patch }));

  if (step === 'setup') {
    return <CompanySetup onDone={data => { upd(data); next('setup'); }} />;
  }

  if (submitted) {
    return <div className="min-h-screen bg-[#FFF8FC]"><SubmittedScreen brief={brief} /></div>;
  }

  const clientSteps = STEPS_ORDER.filter(s => s !== 'setup');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f9f6fe' }}>
      <Sidebar step={step} completed={completed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar step={step} completed={completed} />

        <div className="px-7 py-3.5 border-b border-gray-100/80 bg-white/95 backdrop-blur-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.12em]">{brief.companyName}</p>
            <p className="text-sm font-bold text-[#010C83] tracking-tight">{brief.projectType} Brief</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#EC008C] to-[#f542a8] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((Math.max(0, completed.size - 1) / clientSteps.length) * 100)}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              {Math.max(0, completed.size - 1)}<span className="text-gray-300">/{clientSteps.length}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[520px] mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                {step === 'problem_solution' && (
                  <ProblemSolution brief={brief} onDone={d => {
                    upd({ problemStatement: d.problemStatement, solutionDescription: d.solutionDescription, websiteUrl: d.websiteUrl, scanSource: d.scanSource });
                    next('problem_solution');
                  }} />
                )}
                {step === 'market_position' && (
                  <MarketPosition brief={brief} onDone={d => {
                    upd({ competitors: d.competitors, competitorScreenshots: d.competitorScreenshots, uvp: d.uvp });
                    next('market_position');
                  }} />
                )}
                {step === 'product' && (
                  <Product brief={brief} onDone={features => { upd({ features }); next('product'); }} />
                )}
                {step === 'brand_audit' && (
                  <BrandAudit brief={brief} onDone={d => {
                    upd({ companyNameMeaning: d.companyNameMeaning, logoRationale: d.logoRationale, logoRationaleChips: d.logoRationaleChips, visualLanguageMood: d.visualLanguageMood });
                    next('brand_audit');
                  }} />
                )}
                {step === 'brand_voice' && (
                  <BrandVoice brief={brief} onDone={d => { upd({ keywords: d.keywords, brandMessages: d.brandMessages }); next('brand_voice'); }} />
                )}
                {step === 'brand_values_direction' && (
                  <BrandValuesDirection brief={brief} onDone={d => { upd({ selectedValues: d.selectedValues, visualDirection: d.visualDirection }); next('brand_values_direction'); }} />
                )}
                {step === 'visual_references' && (
                  <VisualReferences brief={brief} onDone={d => {
                    upd({ referenceBrands: d.referenceBrands, referenceScreenshots: d.referenceScreenshots, logoStyle: d.logoStyle, logoOpenToRecommendations: d.logoOpenToRecommendations, colorPaletteRatings: d.colorPaletteRatings });
                    next('visual_references');
                  }} />
                )}
                {step === 'summary' && (
                  <SummaryReview brief={brief} onDone={() => { markDone('summary'); setSubmitted(true); }} />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="px-6 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 relative">
          <button
            onClick={() => {
              const idx = clientSteps.indexOf(step);
              if (idx > 0) setStep(clientSteps[idx - 1]);
            }}
            disabled={clientSteps.indexOf(step) <= 0}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              clientSteps.indexOf(step) <= 0 ? 'opacity-40 cursor-not-allowed text-gray-400' : 'text-gray-600 hover:bg-gray-50 border border-gray-200 cursor-pointer'
            }`}>
            Previous
          </button>
          <button
            onClick={() => {
              const idx = clientSteps.indexOf(step);
              if (idx < clientSteps.length - 1) setStep(clientSteps[idx + 1]);
            }}
            disabled={clientSteps.indexOf(step) >= clientSteps.length - 1}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              clientSteps.indexOf(step) >= clientSteps.length - 1 ? 'opacity-40 cursor-not-allowed text-gray-400 border border-gray-100' : 'text-[#010C83] hover:bg-[#010C83]/5 border border-[#010C83]/20 cursor-pointer'
            }`}>
            Next
          </button>
        </div>
      </div>
      <GeminiAssistant />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: update App.tsx to 9-step routing + new sidebar NAV_SECTIONS"
```

---

## Task 12: Fix BrandAudit.tsx import issue + update .env.example

**Files:**
- Modify: `src/steps/BrandAudit.tsx` (remove stray re-export)
- Modify: `.env.example`

- [ ] **Step 1: Remove the `export type { MoodState }` line from BrandAudit.tsx**

The `MoodState` type from `MoodBoard.tsx` is not exported from `types.ts`. Remove the re-export line added during Task 8. The BriefData type already defines `visualLanguageMood` directly.

- [ ] **Step 2: Update .env.example**

Add to `.env.example`:
```
# Unsplash API key for mood board images (optional — falls back to emoji tiles)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

- [ ] **Step 3: Run lint to verify**

```bash
cd "polar-hedgehog-brief-assistant" && npm run lint 2>&1 | head -30
```

Expected: Zero type errors.

- [ ] **Step 4: Commit**

```bash
git add src/steps/BrandAudit.tsx .env.example
git commit -m "fix: remove stray MoodState re-export; add VITE_UNSPLASH_ACCESS_KEY to env.example"
```

---

## Task 13: Verify end-to-end

- [ ] **Step 1: Start dev server**

```bash
cd "polar-hedgehog-brief-assistant" && npm run dev
```

- [ ] **Step 2: Walk the full flow**

Open `http://localhost:3000` and verify:

1. **Setup screen** loads (CompanySetup) — enter company name, proceed
2. **Problem + Solution** — scan website or upload, review both outputs, continue
3. **Market Position** — add 1+ competitor, ScreenshotCard renders with gradient/favicon, continue (watch for UVP spinner)
4. **Product** — AI suggest works, save features
5. **Brand Audit** — name meaning textarea, optional logo upload, MoodBoard loads (emoji tiles if no Unsplash key)
6. **Brand Voice** — keywords phase, then messages phase, approve 1+
7. **Brand Values + Direction** — pick 2 values, MoodBoard for each direction
8. **Visual References** — add 1+ brand (ScreenshotCard visible), pick logo style (LogoStyleGrid renders), like 1+ palette strip (ColorStripPicker visible)
9. **Summary** — displays `visualLanguageMood.liked`, `colorPaletteRatings` likes, submits

- [ ] **Step 3: Check sidebar**

Sidebar shows 3 sections (Discovery / Brand / Visual) with 8 steps. Progress bar advances correctly.

- [ ] **Step 4: Commit if all passes**

```bash
git add -A && git commit -m "chore: verified 9-step flow end-to-end"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task |
|------------------|------|
| 19→9 step collapse | Tasks 1, 11 |
| CompanySetup (merged) | Task 6 |
| Problem+Solution merged | Task 7 |
| MarketPosition (Competitors+UVP, ScreenshotCard) | Task 7 |
| Product (FeatureBuilder renamed) | Task 7 |
| BrandAudit (merged, MoodBoard replaces sliders) | Task 8 |
| BrandVoice (Keywords+Messages) | Task 9 |
| BrandValuesDirection (Values+MoodBoard direction) | Task 9 |
| VisualReferences (3 merged + ScreenshotCard+LogoStyleGrid+ColorStripPicker) | Task 10 |
| MoodBoard component | Task 3 |
| ScreenshotCard component | Task 4 |
| ColorStripPicker component | Task 5 |
| LogoStyleGrid component | Task 5 |
| Color palettes constant | Task 2 |
| BriefData/BriefStep type changes | Task 1 |
| Unsplash env var | Task 12 |
| SummaryReview updated for new fields | Task 10 |
| App.tsx routing updated | Task 11 |

**No placeholders detected in plan.**

**Type consistency:** `visualLanguageMood`, `colorPaletteRatings`, `competitorScreenshots`, `referenceScreenshots`, `keywordImages` — all defined in Task 1 types.ts and consumed consistently across tasks.
