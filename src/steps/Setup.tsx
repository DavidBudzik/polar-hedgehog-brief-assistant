import React, { useState } from 'react';
import { ArrowRight, Globe, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PolarButton, aiScanUrl } from '../shared';
import type { BriefData } from '../types';

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none';
const inputStyle: React.CSSProperties = {
  background: 'rgba(1,12,131,0.03)',
  border: '1px solid rgba(1,12,131,0.12)',
  color: '#010C83',
  fontFamily: 'var(--font-sans)',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(1,12,131,0.45)',
  fontFamily: 'var(--font-sans)',
};

const BRIEF_STEPS = [
  'Problem & Solution',
  'Market & Competitors',
  'Product Features',
  'Brand Audit',
  'Voice & Keywords',
  'Values & Direction',
  'Visual References',
];

export function CompanySetup({ onDone }: {
  onDone: (data: Pick<BriefData, 'companyName' | 'projectType' | 'projectDate' | 'websiteUrl' | 'scanSource'>) => void;
}) {
  const types = ['Branding', 'Rebranding', 'Brand Refresh', 'Sub-brand'];
  const [form, setForm] = useState({
    companyName: '',
    websiteUrl: '',
    projectType: 'Branding',
    projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  });
  const [phase, setPhase] = useState<'form' | 'confirm'>('form');
  const [summary, setSummary] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [faviconFailed, setFaviconFailed] = useState(false);

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

  if (phase === 'confirm') {
    return (
      <AnimatePresence mode="wait">
      <motion.div
        key="confirm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
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

        {/* Scan card — only shown when a URL was provided */}
        {form.websiteUrl && (
          <div
            className="bg-white rounded-2xl p-5 mb-5"
            style={{ boxShadow: '0 4px 24px rgba(25,28,33,0.06), 0 1px 8px rgba(1,12,131,0.04)' }}
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

        {/* Steps preview */}
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 4px 24px rgba(25,28,33,0.06), 0 1px 8px rgba(1,12,131,0.04)' }}>
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
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <img src="/logo-dark.svg" alt="Polar Hedgehog" className="h-6 w-auto mb-7" />
        <h2 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Let's set up your brief
        </h2>
        <p className="text-sm" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          A few quick details to get started.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 space-y-5" style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}>
        <div className="space-y-1.5">
          <label htmlFor="companyName" style={labelStyle}>Company Name</label>
          <input
            id="companyName"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            placeholder="Acme Corp"
            className={inputClass}
            style={{ ...inputStyle, ...(form.companyName ? { borderColor: 'rgba(1,12,131,0.25)' } : {}) }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="websiteUrl" style={labelStyle}>
            Website URL{' '}
            <span style={{ color: 'rgba(1,12,131,0.28)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              (optional — AI will scan it)
            </span>
          </label>
          <input
            id="websiteUrl"
            value={form.websiteUrl}
            onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
            placeholder="https://acmecorp.com"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Project Type</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, projectType: t }))}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  ...(form.projectType === t
                    ? { background: 'linear-gradient(135deg, #EC008C, #d4007e)', color: 'white', boxShadow: '0 3px 10px rgba(236,0,140,0.25)' }
                    : { background: 'white', color: 'rgba(1,12,131,0.55)', border: '1px solid rgba(1,12,131,0.12)' }),
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectDate" style={labelStyle}>Date</label>
          <input
            id="projectDate"
            value={form.projectDate}
            onChange={e => setForm(f => ({ ...f, projectDate: e.target.value }))}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <PolarButton
          className="w-full h-11 text-sm mt-1"
          disabled={!form.companyName.trim()}
          onClick={() => setPhase('confirm')}
        >
          Start Brief <ArrowRight size={15} />
        </PolarButton>
      </div>
    </div>
  );
}
