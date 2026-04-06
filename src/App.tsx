import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { GeminiAssistant } from './GeminiAssistant';
import { SettingsButton } from './Settings';
import { INITIAL_BRIEF, STEPS_ORDER } from './types';
import type { BriefData, BriefStep } from './types';

// Steps
import { KickoffSetup, KickoffConfirmation } from './steps/Setup';
import { ProblemStatement, SolutionDescription, CompetitorEntry, UVPRating, FeatureBuilder } from './steps/Discovery';
import { CompanyNameMeaning, LogoRationale, VisualLanguageRationale } from './steps/BrandAudit';
import { KeywordSelection, BrandMessages, ValuePicker, VisualDirectionForm } from './steps/BrandDirection';
import { ReferenceBrands, LogoStyleSelector, ColorPaletteSelector, SummaryReview } from './steps/VisualPrefs';

// ── Sidebar nav ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Discovery',
    steps: [
      { id: 'problem_statement' as BriefStep, label: 'Problem Statement' },
      { id: 'solution_description' as BriefStep, label: 'Solution' },
      { id: 'competitors' as BriefStep, label: 'Competitors' },
      { id: 'uvp' as BriefStep, label: 'Unique Value Prop' },
      { id: 'features' as BriefStep, label: 'Features' },
    ],
  },
  {
    label: 'Brand Audit',
    steps: [
      { id: 'company_name_meaning' as BriefStep, label: 'Name Meaning' },
      { id: 'logo_rationale' as BriefStep, label: 'Logo Rationale' },
      { id: 'visual_language_rationale' as BriefStep, label: 'Visual Language' },
    ],
  },
  {
    label: 'Brand Direction',
    steps: [
      { id: 'keywords' as BriefStep, label: 'Keywords' },
      { id: 'brand_messages' as BriefStep, label: 'Brand Messages' },
      { id: 'value_picker' as BriefStep, label: 'Core Values' },
      { id: 'visual_direction_v1' as BriefStep, label: 'Visual Direction 1' },
      { id: 'visual_direction_v2' as BriefStep, label: 'Visual Direction 2' },
    ],
  },
  {
    label: 'Visual Preferences',
    steps: [
      { id: 'reference_brands' as BriefStep, label: 'Reference Brands' },
      { id: 'logo_style' as BriefStep, label: 'Logo Style' },
      { id: 'color_palette' as BriefStep, label: 'Color Palette' },
      { id: 'summary' as BriefStep, label: 'Summary' },
    ],
  },
];

function Sidebar({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  const currentIdx = STEPS_ORDER.indexOf(step);
  return (
    <div className="w-60 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto flex flex-col">
      {/* Logo */}
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

      {/* Nav */}
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
                      isCurrent
                        ? 'bg-gradient-to-r from-[#EC008C]/12 to-[#EC008C]/5 text-[#EC008C] font-semibold'
                        : isDone
                        ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-default'
                        : isLocked
                        ? 'text-gray-200 cursor-default'
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

      {/* Sidebar footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-300 font-medium">Polar Brief</span>
        <SettingsButton />
      </div>
    </div>
  );
}

function ProgressBar({ step, completed }: { step: BriefStep; completed: Set<BriefStep> }) {
  const clientSteps: BriefStep[] = STEPS_ORDER.filter(s => s !== 'setup' && s !== 'kickoff');
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
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at 50% 0%, #fce7f3 0%, #fdf2f8 50%, #f8f7ff 100%)' }}>
      <div className="text-center space-y-7 max-w-sm w-full">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#EC008C]/25"
        >
          <CheckCircle2 size={34} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-[#010C83] tracking-tight mb-2">Brief Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">Thank you, <strong className="text-[#010C83]">{brief.companyName}</strong>. The Polar team will review your brief and be in touch shortly.</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            ['Keywords', `${brief.keywords.length} selected`],
            ['Messages', `${brief.brandMessages.length} approved`],
            ['Competitors', `${brief.competitors.length} mapped`],
            ['Reference Brands', `${brief.referenceBrands.length} added`],
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
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: 'radial-gradient(ellipse at 60% 0%, #fce7f3 0%, #fdf2f8 40%, #f8f7ff 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(1,12,131,0.04)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-4 right-4">
          <SettingsButton />
        </div>
        <KickoffSetup onDone={data => { upd(data); next('setup'); }} />
      </div>
    );
  }

  if (step === 'kickoff') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: 'radial-gradient(ellipse at 60% 0%, #fce7f3 0%, #fdf2f8 40%, #f8f7ff 100%)' }}>
        <div className="absolute top-4 right-4">
          <SettingsButton />
        </div>
        <KickoffConfirmation brief={brief} onConfirm={() => next('kickoff')} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF8FC] flex items-center justify-center">
        <SubmittedScreen brief={brief} />
      </div>
    );
  }

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
              <div
                className="h-full bg-gradient-to-r from-[#EC008C] to-[#f542a8] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((Math.max(0, completed.size - 2) / (STEPS_ORDER.length - 2)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              {Math.max(0, completed.size - 2)}<span className="text-gray-300">/{STEPS_ORDER.length - 2}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[520px] mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                {step === 'problem_statement' && (
                  <ProblemStatement brief={brief} onDone={d => { upd({ problemStatement: d.text, websiteUrl: d.url, scanSource: d.source }); next('problem_statement'); }} />
                )}
                {step === 'solution_description' && (
                  <SolutionDescription brief={brief} onDone={text => { upd({ solutionDescription: text }); next('solution_description'); }} />
                )}
                {step === 'competitors' && (
                  <CompetitorEntry onDone={comps => { upd({ competitors: comps }); next('competitors'); }} />
                )}
                {step === 'uvp' && (
                  <UVPRating brief={brief} onDone={uvps => { upd({ uvp: uvps }); next('uvp'); }} />
                )}
                {step === 'features' && (
                  <FeatureBuilder brief={brief} onDone={features => { upd({ features }); next('features'); }} />
                )}
                {step === 'company_name_meaning' && (
                  <CompanyNameMeaning brief={brief} onDone={text => { upd({ companyNameMeaning: text }); next('company_name_meaning'); }} />
                )}
                {step === 'logo_rationale' && (
                  <LogoRationale brief={brief} onDone={d => { upd({ logoRationale: d.rationale, logoRationaleChips: d.chips }); next('logo_rationale'); }} />
                )}
                {step === 'visual_language_rationale' && (
                  <VisualLanguageRationale brief={brief} onDone={d => { upd({ visualLanguageRationale: d.summary, visualLanguageSliders: d.sliders }); next('visual_language_rationale'); }} />
                )}
                {step === 'keywords' && (
                  <KeywordSelection brief={brief} onDone={kw => { upd({ keywords: kw }); next('keywords'); }} />
                )}
                {step === 'brand_messages' && (
                  <BrandMessages brief={brief} onDone={msgs => { upd({ brandMessages: msgs }); next('brand_messages'); }} />
                )}
                {step === 'value_picker' && (
                  <ValuePicker brief={brief} onDone={vals => { upd({ selectedValues: vals }); next('value_picker'); }} />
                )}
                {step === 'visual_direction_v1' && (
                  <VisualDirectionForm step="v1" brief={brief} onDone={form => {
                    upd({ visualDirection: { ...brief.visualDirection, value1: { valueName: brief.selectedValues[0] || 'Value 1', ...form } } });
                    next('visual_direction_v1');
                  }} />
                )}
                {step === 'visual_direction_v2' && (
                  <VisualDirectionForm step="v2" brief={brief} onDone={form => {
                    upd({ visualDirection: { ...brief.visualDirection, value2: { valueName: brief.selectedValues[1] || 'Value 2', ...form } } });
                    next('visual_direction_v2');
                  }} />
                )}
                {step === 'reference_brands' && (
                  <ReferenceBrands brief={brief} onDone={brands => { upd({ referenceBrands: brands }); next('reference_brands'); }} />
                )}
                {step === 'logo_style' && (
                  <LogoStyleSelector brief={brief} onDone={(style, open) => { upd({ logoStyle: style, logoOpenToRecommendations: open }); next('logo_style'); }} />
                )}
                {step === 'color_palette' && (
                  <ColorPaletteSelector brief={brief} onDone={(approach, ratings) => { upd({ colorPaletteApproach: approach, colorSwatchRatings: ratings }); next('color_palette'); }} />
                )}
                {step === 'summary' && (
                  <SummaryReview brief={brief} onDone={() => { markDone('summary'); setSubmitted(true); }} />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GeminiAssistant />
    </div>
  );
}
