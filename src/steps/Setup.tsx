import React, { useState } from 'react';
import { Sparkles, ArrowRight, Briefcase } from 'lucide-react';
import { PolarButton, Card } from '../shared';
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

export function KickoffSetup({ onDone }: { onDone: (data: Pick<BriefData, 'companyName' | 'projectType' | 'projectDate' | 'websiteUrl'>) => void }) {
  const types = ['Branding', 'Rebranding', 'Brand Refresh', 'Sub-brand'];
  const [form, setForm] = useState({ companyName: '', websiteUrl: '', projectType: 'Branding', projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) });

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <img src="/logo-dark.svg" alt="Polar Hedgehog" className="h-6 w-auto mb-7" />
        <h2 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>Configure Brief</h2>
        <p className="text-sm" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>Set up the client brief before sending.</p>
      </div>

      <div className="bg-white rounded-2xl p-7 space-y-5" style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
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
          <label htmlFor="websiteUrl" style={labelStyle}>Website URL <span style={{ color: 'rgba(1,12,131,0.28)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
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

        <PolarButton className="w-full h-11 text-sm mt-1" disabled={!form.companyName.trim()} onClick={() => onDone(form)}>
          Send Brief to Client <ArrowRight size={15} />
        </PolarButton>
      </div>
    </div>
  );
}

export function KickoffConfirmation({ brief, onConfirm }: { brief: BriefData; onConfirm: () => void }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <img src="/logo-dark.svg" alt="Polar Hedgehog" className="h-6 w-auto mx-auto mb-7" />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #EC008C, #c4006e)', boxShadow: '0 12px 32px rgba(236,0,140,0.28)' }}>
          <Sparkles size={22} className="text-white" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Welcome to your<br />Polar Brief
        </h2>
        <p className="text-sm" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>Please confirm your project details to get started.</p>
      </div>
      <Card title="Project Kickoff" icon={Briefcase}>
        <div className="space-y-5">
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(1,12,131,0.03)', border: '1px solid rgba(1,12,131,0.07)' }}>
            {[['Company', brief.companyName], ['Website', brief.websiteUrl || 'N/A'], ['Project Type', brief.projectType], ['Date', brief.projectDate]].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>{value}</span>
              </div>
            ))}
          </div>
          <PolarButton className="w-full h-11" onClick={onConfirm}>
            Looks good, let's start <ArrowRight size={15} />
          </PolarButton>
        </div>
      </Card>
    </div>
  );
}
