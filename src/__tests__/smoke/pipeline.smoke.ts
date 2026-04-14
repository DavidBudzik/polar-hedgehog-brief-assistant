// src/__tests__/smoke/pipeline.smoke.ts
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('\nMissing VITE_GEMINI_API_KEY in .env\n');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL = 'gemini-2.5-flash';

// ── Fixture ───────────────────────────────────────────────────────────────────
const FIXTURE = {
  companyName: 'Polar Hedgehog',
  websiteUrl: 'https://polarhedgehog.com',
  competitorUrl: 'https://99designs.com',
  problemStatement: '',   // filled by stage 1
  keywords: [] as string[], // filled by stage 3
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractJson(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function preview(value: any): string {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return str.slice(0, 80) + (str.length > 80 ? '…' : '');
}

async function genText(prompt: string): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  return res.text?.trim() || '';
}

async function genJson(prompt: string): Promise<any> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  });
  return extractJson(res.text || '');
}

async function scanUrl(url: string, prompt: string): Promise<any> {
  // Note: googleSearch tool + JSON response mode may not be supported together
  // by all models. Falls back to text extraction via extractJson.
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: `Visit: ${url}\n\n${prompt}` }] }],
    config: { tools: [{ googleSearch: {} }] },
  });
  return extractJson(res.text || '');
}

// ── Stage runner ──────────────────────────────────────────────────────────────
type StageResult = { ok: boolean; ms: number; value?: any; error?: string };

async function runStage(
  index: number,
  total: number,
  name: string,
  fn: () => Promise<any>,
  validate: (v: any) => string | null,
): Promise<StageResult> {
  const start = Date.now();
  try {
    const value = await fn();
    const ms = Date.now() - start;
    const err = validate(value);
    if (err) {
      console.log(`✗ [${index}/${total}] ${name} — INVALID (${ms}ms)`);
      console.log(`  Error: ${err}`);
      console.log(`  Got: ${preview(value)}`);
      return { ok: false, ms, error: err };
    }
    console.log(`✓ [${index}/${total}] ${name} — ${ms}ms`);
    console.log(`  ${preview(value)}`);
    return { ok: true, ms, value };
  } catch (err: any) {
    const ms = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`✗ [${index}/${total}] ${name} — FAILED (${ms}ms)`);
    console.log(`  Error: ${msg}`);
    return { ok: false, ms, error: msg };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nRunning AI pipeline smoke test...');
  console.log(`Fixture: ${FIXTURE.companyName} (${FIXTURE.websiteUrl})\n`);

  const TOTAL = 7;
  let failed = 0;

  // Stage 1: URL scan → problemStatement + solutionDescription
  const s1 = await runStage(1, TOTAL, 'URL scan', () =>
    scanUrl(
      FIXTURE.websiteUrl,
      `Brand strategist. Identify the core problem they solve and their solution. Return JSON: {"problem":"1-2 sentences","solution":"1-2 sentences"}`,
    ),
    v => {
      if (!v || typeof v !== 'object') return 'expected JSON object';
      if (!v.problem || typeof v.problem !== 'string') return 'missing "problem" string';
      if (!v.solution || typeof v.solution !== 'string') return 'missing "solution" string';
      return null;
    },
  );
  if (!s1.ok) { failed++; console.log('\nPipeline stopped at stage 1.\n'); process.exit(1); }
  FIXTURE.problemStatement = s1.value.problem;

  // Stage 2: Competitor scan → tags
  const s2 = await runStage(2, TOTAL, 'Competitor scan', () =>
    scanUrl(
      FIXTURE.competitorUrl,
      `Brand strategist. What makes this brand's visual identity distinctive? Return JSON array of 3-5 short tag strings.`,
    ),
    v => {
      if (!Array.isArray(v) || v.length === 0) return 'expected non-empty array';
      return null;
    },
  );
  if (!s2.ok) { failed++; console.log('\nPipeline stopped at stage 2.\n'); process.exit(1); }

  // Stage 3: Keyword recommendations → keywords[]
  const s3 = await runStage(3, TOTAL, 'Keyword recs', () =>
    genJson(
      `For company "${FIXTURE.companyName}" solving "${FIXTURE.problemStatement}", recommend 5 brand keywords from: Innovative, Trustworthy, Bold, Minimalist, Playful, Professional, Disruptive, Elegant, Tech-forward, Human-centric, Sustainable, Fast, Secure, Accessible, Premium, Authentic, Empowering, Precise, Global, Collaborative. Return a JSON array of 5 strings.`,
    ),
    v => {
      if (!Array.isArray(v) || v.length === 0) return 'expected non-empty array';
      return null;
    },
  );
  if (!s3.ok) { failed++; console.log('\nPipeline stopped at stage 3.\n'); process.exit(1); }
  FIXTURE.keywords = s3.value;

  // Stage 4: Brand messages → brandMessages[]
  const s4 = await runStage(4, TOTAL, 'Brand messages', () =>
    genJson(
      `For brand "${FIXTURE.companyName}", write one punchy brand manifesto message per keyword: ${FIXTURE.keywords.join(', ')}. Bold and specific. Return a JSON array of objects: {keyword, message}.`,
    ),
    v => {
      if (!Array.isArray(v) || v.length === 0) return 'expected non-empty array';
      if (!v[0].keyword || !v[0].message) return 'objects must have keyword and message fields';
      return null;
    },
  );
  if (!s4.ok) failed++;

  // Stage 5: Name meaning polish → polished string
  const s5 = await runStage(5, TOTAL, 'Name meaning polish', () =>
    genText(
      `Rephrase into polished brand language (2-3 sentences): "${FIXTURE.companyName} is a brand that combines precision with warmth." Return ONLY the rephrased text.`,
    ),
    v => {
      if (!v || typeof v !== 'string' || v.length < 10) return 'expected non-empty string';
      return null;
    },
  );
  if (!s5.ok) failed++;

  // Stage 6: Logo style suggestions → array
  const s6 = await runStage(6, TOTAL, 'Logo style suggestions', () =>
    genJson(
      `For brand "${FIXTURE.companyName}", suggest 3 logo style directions (e.g. wordmark, lettermark, abstract mark). Return a JSON array of objects: {style, rationale}.`,
    ),
    v => {
      if (!Array.isArray(v) || v.length === 0) return 'expected non-empty array';
      return null;
    },
  );
  if (!s6.ok) failed++;

  // Stage 7: Reference brand visual suggestions → array
  const s7 = await runStage(7, TOTAL, 'Reference brand visual', () =>
    genJson(
      `For brand "Stripe" (stripe.com), suggest 3 visual elements typically praised about their brand identity. Return a JSON array of short strings (max 4 words each).`,
    ),
    v => {
      if (!Array.isArray(v) || v.length === 0) return 'expected non-empty array';
      return null;
    },
  );
  if (!s7.ok) failed++;

  console.log('');
  if (failed === 0) {
    console.log(`✓ All ${TOTAL} stages passed.\n`);
    process.exit(0);
  } else {
    console.log(`✗ ${failed} stage(s) failed.\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nUnhandled error:', err);
  process.exit(1);
});
