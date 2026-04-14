# Test Suite Design

**Date:** 2026-04-14
**Scope:** AI pipeline validation for the Polar Hedgehog Brief Assistant
**Approach:** Option A — Vitest unit tests (mocked) + tsx smoke script (real API)

---

## Goals

1. Verify all AI helper functions behave correctly in isolation (CI-safe, no real API calls)
2. Verify the full AI pipeline works end-to-end with the live Gemini API (local dev)
3. Catch regressions in JSON parsing, model fallback logic, and file routing

---

## File Structure

```
src/__tests__/
  unit/
    extractJson.test.ts       — JSON parsing edge cases
    aiAnalyzeFile.test.ts     — image vs document routing
    modelFallback.test.ts     — 429/404 → fallback chain
    apiKeyResolution.test.ts  — localStorage > env precedence
    stepsOrder.test.ts        — STEPS_ORDER integrity + navigation logic
  smoke/
    pipeline.smoke.ts         — full AI chain, run with tsx

vitest.config.ts              — includes only src/__tests__/unit/**/*.test.ts
```

---

## Unit Tests

All unit tests mock `@google/genai` at the module level via `vi.mock`. No real API calls. Runs in CI with no API key required.

### `extractJson.test.ts`

Tests `extractJson` from `src/shared.tsx`:

| Case | Input | Expected |
|------|-------|----------|
| Valid JSON object | `'{"a":1}'` | `{ a: 1 }` |
| JSON in markdown code block | `` '```json\n{"a":1}\n```' `` | `{ a: 1 }` |
| JSON embedded in prose | `'Here: {"a":1} done'` | `{ a: 1 }` |
| Malformed JSON | `'{a:1}'` | `null` |
| Empty string | `''` | `null` |
| Nested object | `'{"a":{"b":2}}'` | `{ a: { b: 2 } }` |

### `aiAnalyzeFile.test.ts`

Tests `aiAnalyzeFile` routing in `src/shared.tsx`:

- `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/gif`, `image/svg+xml` → calls `aiAnalyzeImage` (inline base64 path)
- `application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` → calls `aiAnalyzeDocument` (Files API path)

### `modelFallback.test.ts`

Tests the `globalModelOverride` fallback chain in `aiGen`.

> **Note:** `globalModelOverride` is module-level state. Each test must call `vi.resetModules()` and re-import `shared.tsx` in a `beforeEach` to ensure a clean slate — otherwise fallback state bleeds between tests.


- First call throws 429 → retries with `gemini-2.0-flash`
- Second call throws 429 → retries with `gemini-flash-lite-latest`
- Third call throws 429 → re-throws (no more fallbacks)
- 404 triggers same chain as 429
- Non-429/404 error → throws immediately, no retry
- Successful call after fallback → returns response text

### `apiKeyResolution.test.ts`

Tests `getStoredApiKey` from `src/shared.tsx`:

- `localStorage` value present → returns localStorage value
- `localStorage` empty, `VITE_GEMINI_API_KEY` set → returns env value
- Both empty → returns `''`

### `stepsOrder.test.ts`

Tests `STEPS_ORDER` and navigation logic from `src/types.ts`:

- Array has exactly 9 steps
- No duplicate step names
- All `BriefStep` union members are present in the array
- First step is `'setup'`, last is `'summary'`
- Navigation: step at index N advances to index N+1
- Navigation: last step stays at last step (no overflow)

---

## Smoke Test

**File:** `src/__tests__/smoke/pipeline.smoke.ts`
**Run:** `npm run test:smoke`
**Requires:** `VITE_GEMINI_API_KEY` in `.env`
**Behavior:** Stops on first failure, exits with code 1

### Fixture

```ts
const FIXTURE = {
  companyName: 'Polar Hedgehog',
  websiteUrl: 'https://polarhedgehog.com',
  competitorUrl: 'https://99designs.com',
  problemStatement: '', // filled by stage 1
  keywords: [],         // filled by stage 3
}
```

### Stages

| # | Name | Function | Inputs | Outputs |
|---|------|----------|--------|---------|
| 1 | URL scan | `aiScanUrl` | `websiteUrl` | `problemStatement`, `solutionDescription` |
| 2 | Competitor scan | `aiScanUrl` | `competitorUrl` | competitor tags array |
| 3 | Keyword recs | `aiGen` (json) | `companyName`, `problemStatement` | `keywords[]` |
| 4 | Brand messages | `aiGen` (json) | `companyName`, `keywords` | `brandMessages[]` |
| 5 | Name meaning polish | `aiGen` | `companyName` | polished string |
| 6 | Logo style suggestions | `aiGen` (json) | `companyName` | logo suggestions array |
| 7 | Reference brand visual | `aiGen` (json) | brand name + URL | visual suggestions array |

### Output Format

```
Running AI pipeline smoke test...
Fixture: Polar Hedgehog (https://polarhedgehog.com)

✓ [1/7] URL scan — 1243ms
  problem: "Polar Hedgehog helps brand teams..."
✓ [2/7] Competitor scan — 987ms
  tags: ["Similar positioning", "Visual-first", ...]
✓ [3/7] Keyword recs — 654ms
  keywords: ["Bold", "Trustworthy", "Innovative", ...]
✗ [4/7] Brand messages — FAILED (429ms)
  Error: 429 Too Many Requests

1 stage(s) failed. Exiting.
```

### Validation per stage

Each stage validates:
1. Response is non-empty string
2. If JSON mode: `extractJson` returns non-null
3. If array expected: result has at least 1 item
4. Logs a preview of the actual output (first 80 chars)

---

## npm Scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:smoke": "tsx src/__tests__/smoke/pipeline.smoke.ts"
```

---

## Dependencies to Install

- `vitest` (devDependency)
- `@vitest/coverage-v8` (devDependency, optional — for coverage reports)

`tsx` is already installed.

---

## CI Behavior

- `npm test` runs unit tests only (mocked, no API key needed)
- `npm run test:smoke` is NOT run in CI — it's a local-only developer tool
- Add `npm test` to CI workflow; `test:smoke` runs before releases or after model changes
