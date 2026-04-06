import { useState } from 'react';
import { Sparkles, ArrowRight, Briefcase } from 'lucide-react';
import { PolarButton, Card } from '../shared';
import type { BriefData } from '../types';

export function KickoffSetup({ onDone }: { onDone: (data: Pick<BriefData, 'companyName' | 'projectType' | 'projectDate'>) => void }) {
  const types = ['Branding', 'Rebranding', 'Brand Refresh', 'Sub-brand'];
  const [form, setForm] = useState({ companyName: '', projectType: 'Branding', projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) });

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-lg flex items-center justify-center shadow-md shadow-[#EC008C]/20">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="text-sm font-black text-[#010C83] tracking-tight">POLAR</span>
        </div>
        <h2 className="text-2xl font-black text-[#010C83] tracking-tight mb-1.5">Configure Brief</h2>
        <p className="text-gray-400 text-sm">Set up the client brief before sending.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-7 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="companyName" className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">
            Company Name
          </label>
          <input
            id="companyName"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            placeholder="Acme Corp"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#EC008C]/40 focus:bg-white focus:ring-2 focus:ring-[#EC008C]/8 transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Project Type</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, projectType: t }))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  form.projectType === t
                    ? 'bg-gradient-to-r from-[#EC008C] to-[#d4007e] text-white border-transparent shadow-md shadow-[#EC008C]/20'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectDate" className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 block">Date</label>
          <input
            id="projectDate"
            value={form.projectDate}
            onChange={e => setForm(f => ({ ...f, projectDate: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#EC008C]/40 focus:bg-white focus:ring-2 focus:ring-[#EC008C]/8 transition-all duration-200"
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
        <div className="w-14 h-14 bg-gradient-to-br from-[#EC008C] to-[#c4006e] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#EC008C]/25">
          <Sparkles size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-[#010C83] tracking-tight mb-1.5">Welcome to your<br />Polar Brief</h2>
        <p className="text-gray-400 text-sm">Please confirm your project details to get started.</p>
      </div>
      <Card title="Project Kickoff" icon={Briefcase}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-[#FFF0F8]/60 to-[#f8f4ff]/40 rounded-xl p-4 space-y-3 border border-[#EC008C]/8">
            {[['Company', brief.companyName], ['Project Type', brief.projectType], ['Date', brief.projectDate]].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</span>
                <span className="text-sm font-bold text-[#010C83]">{value}</span>
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
