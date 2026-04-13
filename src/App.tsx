import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { GeminiAssistant } from './GeminiAssistant';
import { SettingsButton } from './Settings';
import { INITIAL_BRIEF, STEPS_ORDER } from './types';
import type { BriefData, BriefStep } from './types';

// Steps
import { CompanySetup } from './steps/Setup';
import { ProblemSolution, MarketPosition, Product } from './steps/Discovery';
import { BrandAudit } from './steps/BrandAudit';
import { BrandVoice, BrandValuesDirection } from './steps/BrandDirection';
import { VisualReferences, SummaryReview } from './steps/VisualPrefs';

// ── Sidebar nav ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Discovery',
    steps: [
      { id: 'problem_solution' as BriefStep, label: 'Problem & Solution' },
      { id: 'market_position' as BriefStep, label: 'Market & Competitors' },
      { id: 'product' as BriefStep, label: 'Product Features' },
    ],
  },
  {
    label: 'Brand Audit',
    steps: [
      { id: 'brand_audit' as BriefStep, label: 'Brand Audit' },
    ],
  },
  {
    label: 'Brand Direction',
    steps: [
      { id: 'brand_voice' as BriefStep, label: 'Voice & Keywords' },
      { id: 'brand_values_direction' as BriefStep, label: 'Values & Direction' },
    ],
  },
  {
    label: 'Visual Preferences',
    steps: [
      { id: 'visual_references' as BriefStep, label: 'Visual References' },
      { id: 'summary' as BriefStep, label: 'Summary' },
    ],
  },
];

function Sidebar({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  const currentIdx = STEPS_ORDER.indexOf(step);
  return (
    <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: '#010C83' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/logo-light.svg" alt="Polar Hedgehog" className="h-5 w-auto" />
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}>
          Brand Brief
        </p>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto min-h-0 sidebar-scroll">
        {NAV_SECTIONS.map(sec => (
          <div key={sec.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 mb-2" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-sans)' }}>
              {sec.label}
            </p>
            <div className="space-y-0.5">
              {sec.steps.map(s => {
                const sIdx = STEPS_ORDER.indexOf(s.id);
                const isDone = completed.has(s.id);
                const isCurrent = s.id === step;
                const isLocked = sIdx > currentIdx && !isDone;
                return (
                  <div key={s.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11.5px] font-medium transition-all duration-150 ${isCurrent
                      ? 'font-semibold'
                      : ''
                      }`}
                    style={{
                      background: isCurrent ? 'rgba(236,0,140,0.18)' : 'transparent',
                      color: isCurrent
                        ? '#EC008C'
                        : isDone
                          ? 'rgba(255,255,255,0.45)'
                          : isLocked
                            ? 'rgba(255,255,255,0.18)'
                            : 'rgba(255,255,255,0.62)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                    {isDone
                      ? <CheckCircle2 size={13} className="flex-shrink-0" style={{ color: '#4ade80' }} strokeWidth={2.5} />
                      : isCurrent
                        ? <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#EC008C', boxShadow: '0 0 6px #EC008C88' }} />
                        : <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />}
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar footer */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-sans)' }}>
          polarhedgehog.com
        </span>
        <SettingsButton />
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: BriefStep; completed?: Set<BriefStep> }) {
  const clientSteps: BriefStep[] = STEPS_ORDER.filter(s => s !== 'setup');
  const idx = clientSteps.indexOf(step);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / clientSteps.length) * 100);
  return (
    <div className="h-[3px] bg-gray-100 w-full">
      <motion.div
        className="h-full bg-gradient-to-r from-[#EC008C] to-[#f542a8]"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

function SubmittedScreen({ brief }: { brief: BriefData }) {
  return (
    <div className="p-8 text-center space-y-8 max-w-sm w-full">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mx-auto"
      >
        <img src="/logo-dark.svg" alt="Polar Hedgehog" className="h-7 w-auto mx-auto mb-8" />
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl" style={{ background: 'linear-gradient(135deg, #EC008C, #c4006e)', boxShadow: '0 20px 50px rgba(236,0,140,0.28)' }}>
          <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
        </div>
      </motion.div>
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>Brief Submitted!</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(1,12,131,0.55)' }}>
          Thank you, <strong style={{ color: '#010C83' }}>{brief.companyName}</strong>. The Polar Hedgehog team will review your brief and be in touch shortly.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ['Keywords', `${brief.keywords.length} selected`],
          ['Messages', `${brief.brandMessages.length} approved`],
          ['Competitors', `${brief.competitors.length} mapped`],
          ['References', `${brief.referenceBrands.length} added`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-2xl p-4 text-left" style={{ border: '1px solid rgba(1,12,131,0.07)', boxShadow: '0 2px 12px rgba(1,12,131,0.05)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-0.5" style={{ color: 'rgba(1,12,131,0.4)' }}>{k}</p>
            <p className="text-sm font-bold" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [brief, setBrief] = useState<BriefData>(INITIAL_BRIEF);
  const [step, setStep] = useState<BriefStep>('setup');
  const [completed, setCompleted] = useState<Set<BriefStep>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const markDone = (s: BriefStep) => setCompleted(p => new Set([...p, s]));
  const next = (s: BriefStep) => {
    markDone(s);
    const idx = STEPS_ORDER.indexOf(s);
    if (idx + 1 < STEPS_ORDER.length) setStep(STEPS_ORDER[idx + 1]);
  };
  const upd = (patch: Partial<BriefData>) => setBrief(p => ({ ...p, ...patch }));

  if (step === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 40%, #FDF0F8 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(236,0,140,0.06) 0%, transparent 60%)' }} />
        <div className="absolute top-4 right-4">
          <SettingsButton />
        </div>
        <CompanySetup onDone={data => { upd(data); next('setup'); }} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F7F8FF 0%, #EEF0FF 40%, #FDF0F8 100%)' }}>
        <SubmittedScreen brief={brief} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F7F8FF' }}>
      <Sidebar step={step} completed={completed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar step={step} />

        <div className="px-7 py-3.5 bg-white flex items-center justify-between" style={{ borderBottom: '1px solid rgba(1,12,131,0.06)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
              style={{
                background: aiOpen ? '#EC008C' : 'rgba(236,0,140,0.08)',
                color: aiOpen ? 'white' : '#EC008C',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} />
              AI
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(1,12,131,0.35)', fontFamily: 'var(--font-sans)' }}>{brief.companyName}</p>
              <p className="text-sm font-bold tracking-tight" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>{brief.projectType} Brief</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-28 rounded-full overflow-hidden" style={{ background: 'rgba(1,12,131,0.07)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((Math.max(0, completed.size - 2) / (STEPS_ORDER.length - 2)) * 100)}%`,
                  background: 'linear-gradient(90deg, #EC008C, #f542a8)',
                }}
              />
            </div>
            <span className="text-[11px] font-semibold" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
              {Math.max(0, completed.size - 2)}<span style={{ color: 'rgba(1,12,131,0.25)' }}>/{STEPS_ORDER.length - 2}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[520px] mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

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

        {/* Bottom Navigation */}
        <div className="px-6 py-4 bg-white flex items-center justify-between z-10 relative" style={{ borderTop: '1px solid rgba(1,12,131,0.06)' }}>
          {(() => {
            const clientSteps = STEPS_ORDER.filter(s => s !== 'setup');
            const idx = clientSteps.indexOf(step);
            const isFirst = idx <= 0;
            const isLast = idx >= clientSteps.length - 1;
            return (
              <>
                <button
                  onClick={() => { if (!isFirst) setStep(clientSteps[idx - 1]); }}
                  disabled={isFirst}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    border: '1px solid rgba(1,12,131,0.14)',
                    color: isFirst ? 'rgba(1,12,131,0.25)' : 'rgba(1,12,131,0.65)',
                    background: 'white',
                    opacity: isFirst ? 0.5 : 1,
                    cursor: isFirst ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => { if (!isLast) setStep(clientSteps[idx + 1]); }}
                  disabled={isLast}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    border: '1px solid rgba(1,12,131,0.2)',
                    color: isLast ? 'rgba(1,12,131,0.3)' : '#010C83',
                    background: isLast ? 'transparent' : 'rgba(1,12,131,0.04)',
                    opacity: isLast ? 0.5 : 1,
                    cursor: isLast ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </>
            );
          })()}
        </div>
      </div>

      <GeminiAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
