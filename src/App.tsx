import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { GeminiAssistant } from './GeminiAssistant';
import { SettingsButton } from './Settings';
import { PolarButton } from './shared';
import { BRIEF_STORAGE_KEY, INITIAL_BRIEF, STEPS_ORDER } from './types';
import type { BriefData, BriefStep } from './types';

// ── Brief persistence ──────────────────────────────────────────────────────────

type PersistedBrief = { brief: BriefData; step: BriefStep; completed: BriefStep[] };

function loadPersisted(): PersistedBrief | null {
  try {
    const raw = localStorage.getItem(BRIEF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBrief;
    if (!STEPS_ORDER.includes(parsed.step)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Steps
import { CompanySetup } from './steps/Setup';
import { ProblemSolution, MarketPosition, Product } from './steps/Discovery';
import { BrandAudit } from './steps/BrandAudit';
import { BrandVoice, BrandValuesDirection } from './steps/BrandDirection';
import { VisualReferences, SummaryReview } from './steps/VisualPrefs';

// ── Studio concept: navigation rail + breadcrumb ───────────────────────────────

const SECTION_LABELS: Record<BriefStep, string> = {
  setup: '',
  problem_solution: 'Discovery',
  market_position: 'Discovery',
  product: 'Discovery',
  brand_audit: 'Brand Audit',
  brand_voice: 'Brand Direction',
  brand_values_direction: 'Brand Direction',
  visual_references: 'Visual Preferences',
  summary: 'Visual Preferences',
};

const STEP_LABELS: Record<BriefStep, string> = {
  setup: 'Setup',
  problem_solution: 'Problem & Solution',
  market_position: 'Market & Competitors',
  product: 'Product Features',
  brand_audit: 'Brand Audit',
  brand_voice: 'Voice & Keywords',
  brand_values_direction: 'Values & Direction',
  visual_references: 'Visual References',
  summary: 'Summary',
};

const NAV_STEPS: { step: BriefStep; label: string; num: string }[] = [
  { step: 'problem_solution', label: 'Problem & Solution', num: '01' },
  { step: 'market_position', label: 'Market & Competitors', num: '02' },
  { step: 'product', label: 'Product Features', num: '03' },
  { step: 'brand_audit', label: 'Brand Audit', num: '04' },
  { step: 'brand_voice', label: 'Voice & Keywords', num: '05' },
  { step: 'brand_values_direction', label: 'Values & Direction', num: '06' },
  { step: 'visual_references', label: 'Visual References', num: '07' },
  { step: 'summary', label: 'Summary', num: '08' },
];

function NavRail({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  return (
    <div
      className="w-[220px] flex-shrink-0 flex flex-col"
      style={{ background: '#010C83' }}
    >
      {/* Logo */}
      <div
        className="px-6 pt-7 pb-5 flex items-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <img src="/logo-light.svg" alt="Polar Hedgehog" className="h-6 w-auto" />
      </div>

      {/* Step list */}
      <nav className="flex-1 py-5 px-3 flex flex-col overflow-y-auto">
        <p
          className="px-3 mb-4 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-sans)' }}
        >
          Brief
        </p>
        <div className="flex flex-col gap-0.5">
          {NAV_STEPS.map(({ step: s, label, num }) => {
            const isActive = s === step;
            const isDone = completed.has(s);
            return (
              <div
                key={s}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#EC008C' : 'transparent'}`,
                }}
              >
                <span
                  className="text-[10px] font-bold flex-shrink-0 w-[18px] text-center tabular-nums"
                  style={{
                    color: isActive ? '#EC008C' : isDone ? 'rgba(74,222,128,0.55)' : 'rgba(255,255,255,0.18)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {isDone && !isActive ? '✓' : num}
                </span>
                <span
                  className="text-[11px] font-medium leading-tight"
                  style={{
                    color: isActive ? 'white' : isDone ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.3)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-4 pb-5 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SettingsButton />
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: BriefStep }) {
  const clientSteps: BriefStep[] = STEPS_ORDER.filter(s => s !== 'setup');
  const idx = clientSteps.indexOf(step);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / clientSteps.length) * 100);
  return (
    <div className="h-[2px] w-full" style={{ background: 'rgba(1,12,131,0.06)' }}>
      <motion.div
        className="h-full"
        style={{ background: 'linear-gradient(90deg, #EC008C, #f542a8)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

function BreadcrumbBar({
  step, brief, completed, aiOpen, onAiToggle,
}: {
  step: BriefStep; brief: BriefData; completed: Set<BriefStep>; aiOpen: boolean; onAiToggle: () => void;
}) {
  const clientSteps = STEPS_ORDER.filter(s => s !== 'setup');
  const done = Math.max(0, completed.size - 1);
  const total = clientSteps.length;
  const pct = Math.round((done / total) * 100);
  const section = SECTION_LABELS[step];
  const stepName = STEP_LABELS[step];

  return (
    <div
      className="h-16 pl-8 pr-6 flex items-center justify-between"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(1,12,131,0.05)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
          {section && (
            <>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(1,12,131,0.3)' }}>
                {section}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(1,12,131,0.18)' }}>›</span>
            </>
          )}
          <span className="text-[11px] font-semibold" style={{ color: '#010C83' }}>{stepName}</span>
        </div>

        {brief.companyName && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(1,12,131,0.04)',
              color: 'rgba(1,12,131,0.4)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {brief.companyName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(1,12,131,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #EC008C, #f542a8)' }}
          />
        </div>
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
          {done}<span style={{ color: 'rgba(1,12,131,0.2)' }}>/{total}</span>
        </span>
        <button
          onClick={onAiToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
          style={{
            background: aiOpen ? '#EC008C' : 'rgba(236,0,140,0.08)',
            color: aiOpen ? 'white' : '#EC008C',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <Sparkles size={12} /> AI
        </button>
      </div>
    </div>
  );
}

function SubmittedScreen({ brief, onRestart }: { brief: BriefData; onRestart: () => void }) {
  return (
    <div className="p-8 text-center space-y-8 max-w-sm w-full">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mx-auto"
      >
        <img src="/logo-dark.svg" alt="Polar Hedgehog" className="h-7 w-auto mx-auto mb-8" />
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #EC008C, #c4006e)', boxShadow: '0 20px 50px rgba(236,0,140,0.28)' }}
        >
          <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
        </div>
      </motion.div>
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Brief Submitted!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(1,12,131,0.55)' }}>
          Thank you, <strong style={{ color: '#010C83' }}>{brief.companyName}</strong>. The Polar Hedgehog team will review your brief and be in touch shortly.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-4" style={{ borderTop: '1px solid rgba(1,12,131,0.07)' }}>
        {[
          ['Keywords', `${brief.keywords.length} selected`],
          ['Messages', `${brief.brandMessages.length} approved`],
          ['Competitors', `${brief.competitors.length} mapped`],
          ['References', `${brief.referenceBrands.length} added`],
        ].map(([k, v]) => (
          <div key={k} className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-0.5" style={{ color: 'rgba(1,12,131,0.4)' }}>{k}</p>
            <p className="text-sm font-bold" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>{v}</p>
          </div>
        ))}
      </div>
      <div className="pt-4">
        <PolarButton
          variant="outline"
          onClick={onRestart}
          className="w-full"
          style={{ borderColor: 'rgba(1,12,131,0.1)', color: '#010C83' }}
        >
          <RefreshCw size={14} className="mr-1.5" /> Start New Brief
        </PolarButton>
      </div>
    </div>
  );
}

export default function App() {
  const [brief, setBrief] = useState<BriefData>(() => loadPersisted()?.brief ?? INITIAL_BRIEF);
  const [step, setStep] = useState<BriefStep>(() => loadPersisted()?.step ?? 'setup');
  const [completed, setCompleted] = useState<Set<BriefStep>>(
    () => new Set(loadPersisted()?.completed ?? [])
  );
  const [submitted, setSubmitted] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (submitted) return;
    try {
      localStorage.setItem(
        BRIEF_STORAGE_KEY,
        JSON.stringify({ brief, step, completed: [...completed] } satisfies PersistedBrief)
      );
    } catch { /* non-fatal */ }
  }, [brief, step, completed, submitted]);

  useEffect(() => {
    if (submitted) {
      try { localStorage.removeItem(BRIEF_STORAGE_KEY); } catch { /* noop */ }
    }
  }, [submitted]);

  const markDone = (s: BriefStep) => setCompleted(p => new Set([...p, s]));
  const next = (s: BriefStep) => {
    markDone(s);
    const idx = STEPS_ORDER.indexOf(s);
    if (idx + 1 < STEPS_ORDER.length) setStep(STEPS_ORDER[idx + 1]);
  };
  const upd = (patch: Partial<BriefData>) => setBrief(p => ({ ...p, ...patch }));

  // ── Setup screen (no rail) ────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 relative"
        style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 45%, #FDF0F8 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(236,0,140,0.06) 0%, transparent 60%)' }}
        />
        {/* Decorative number */}
        <div
          className="absolute top-0 left-8 select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(120px, 18vw, 200px)', fontWeight: 800, color: '#010C83', opacity: 0.035, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}
        >
          01
        </div>
        <div className="absolute top-4 right-4">
          <SettingsButton />
        </div>
        <CompanySetup onDone={data => { upd(data); next('setup'); }} />
      </div>
    );
  }

  // ── Submitted screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 40%, #FDF0F8 100%)' }}
      >
        <SubmittedScreen brief={brief} onRestart={() => window.location.reload()} />
      </div>
    );
  }

  // ── Main layout (Studio) ──────────────────────────────────────────────────
  const clientSteps = STEPS_ORDER.filter(s => s !== 'setup');
  const stepIdx = clientSteps.indexOf(step);
  const stepNum = String(Math.max(0, stepIdx) + 1).padStart(2, '0');
  const isFirst = stepIdx <= 0;
  const isLast = stepIdx >= clientSteps.length - 1;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 45%, #FDF0F8 100%)' }}>
      <NavRail step={step} completed={completed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar step={step} />
        <BreadcrumbBar
          step={step}
          brief={brief}
          completed={completed}
          aiOpen={aiOpen}
          onAiToggle={() => setAiOpen(o => !o)}
        />

        <div className="flex-1 overflow-y-auto relative" style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 45%, #FDF0F8 100%)' }}>
          {/* Decorative step number */}
          <div
            className="absolute top-4 left-6 select-none pointer-events-none leading-none"
            style={{
              fontSize: '200px',
              fontWeight: 800,
              color: '#010C83',
              opacity: 0.04,
              letterSpacing: '-0.05em',
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
            }}
          >
            {stepNum}
          </div>

          <div className="max-w-[780px] mx-auto px-10 py-14 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {step === 'problem_solution' && (
                  <ProblemSolution brief={brief} onDone={d => { upd(d); next('problem_solution'); }} />
                )}
                {step === 'market_position' && (
                  <MarketPosition brief={brief} onDone={d => { upd(d); next('market_position'); }} />
                )}
                {step === 'product' && (
                  <Product brief={brief} onDone={features => { upd({ features }); next('product'); }} />
                )}
                {step === 'brand_audit' && (
                  <BrandAudit brief={brief} onDone={d => { upd(d); next('brand_audit'); }} />
                )}
                {step === 'brand_voice' && (
                  <BrandVoice brief={brief} onDone={d => { upd(d); next('brand_voice'); }} />
                )}
                {step === 'brand_values_direction' && (
                  <BrandValuesDirection brief={brief} onDone={d => { upd(d); next('brand_values_direction'); }} />
                )}
                {step === 'visual_references' && (
                  <VisualReferences brief={brief} onDone={d => { upd(d); next('visual_references'); }} />
                )}
                {step === 'summary' && (
                  <SummaryReview brief={brief} onDone={() => { markDone('summary'); setSubmitted(true); }} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div
          className="px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(1,12,131,0.05)' }}
        >
          <button
            onClick={() => { if (!isFirst) setStep(clientSteps[stepIdx - 1]); }}
            disabled={isFirst}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: 'var(--font-sans)',
              color: isFirst ? 'rgba(1,12,131,0.2)' : 'rgba(1,12,131,0.6)',
              background: isFirst ? 'transparent' : 'rgba(1,12,131,0.05)',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              opacity: isFirst ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => { if (!isLast) setStep(clientSteps[stepIdx + 1]); }}
            disabled={isLast}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: 'var(--font-sans)',
              color: isLast ? 'rgba(1,12,131,0.2)' : '#010C83',
              background: isLast ? 'transparent' : 'rgba(1,12,131,0.08)',
              cursor: isLast ? 'not-allowed' : 'pointer',
              opacity: isLast ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>

      <GeminiAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
