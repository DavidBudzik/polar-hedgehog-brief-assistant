import { useState, useEffect, useRef } from 'react';
import { Target, Search, Upload, RefreshCw, ThumbsUp, ThumbsDown, Loader2, ArrowRight, Plus, Trash2, Flame, Zap, Sparkles, BarChart3, Check, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen, aiScanUrl, aiAnalyzeFile } from '../shared';
import type { BriefData } from '../types';

// ── Problem Statement ──────────────────────────────────────────────────────────
export function ProblemStatement({ brief, onDone }: { brief: BriefData; onDone: (d: { text: string; url: string; source: string }) => void }) {
  const [mode, setMode] = useState<'choose' | 'url' | 'upload' | 'review'>('choose');
  const [url, setUrl] = useState('');
  const [draft, setDraft] = useState('');
  const [alts, setAlts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [rating, setRating] = useState<'up' | 'down' | ''>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromUrl = async (targetUrl: string) => {
    setLoading(true);
    setLoadingMsg('Scanning website…');
    try {
      const t = await aiScanUrl(
        targetUrl,
        `You are a brand strategist. Based on the content of this website, write a 1–2 sentence Problem Statement describing the core pain point the company solves. Return ONLY the statement, no preamble.`
      );
      setDraft(t.trim());
      setMode('review');
    } catch {
      setDraft(`${brief.companyName} solves the challenge of [describe your problem].`);
      setMode('review');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const generateFromFile = async (file: File) => {
    setLoading(true);
    setLoadingMsg('Reading document…');
    try {
      const t = await aiAnalyzeFile(
        file,
        `You are a brand strategist for "${brief.companyName}". Based on this document, write a 1–2 sentence Problem Statement describing the core pain point the company solves. Return ONLY the statement, no preamble.`
      );
      setDraft(t.trim());
      setMode('review');
    } catch {
      setDraft(`${brief.companyName} solves the challenge of [describe your problem].`);
      setMode('review');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    generateFromFile(file);
  };

  const getAlts = async () => {
    setLoading(true);
    try {
      const raw = await aiGen(`Rewrite "${draft}" 3 different ways, keeping it to 1–2 sentences. Return as JSON array of 3 strings.`, true);
      setAlts(JSON.parse(raw));
    } catch { setAlts(['Alternative 1', 'Alternative 2', 'Alternative 3']); }
    finally { setLoading(false); }
  };

  if (mode === 'choose') return (
    <Card title="What & Why — Problem Statement" icon={Target}>
      <p className="text-sm text-gray-500 mb-5">Does <strong className="text-[#010C83]">{brief.companyName}</strong> have a website?</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('url')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-[#EC008C] bg-gradient-to-br from-[#EC008C]/5 to-[#EC008C]/10 text-[#EC008C] font-bold hover:from-[#EC008C]/10 hover:to-[#EC008C]/15 transition-all cursor-pointer">
          <Search size={28} /><span className="text-sm">Yes, scan my website</span>
        </button>
        <button onClick={() => setMode('upload')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
          <Upload size={28} /><span className="text-sm">No website yet</span>
        </button>
      </div>
    </Card>
  );

  if (mode === 'url') return (
    <Card title="Scan Website" icon={Search}>
      <p className="text-sm text-gray-500 mb-4">Enter your website URL — Gemini will read the page and extract the problem you solve.</p>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url && generateFromUrl(url)}
          placeholder="https://yourcompany.com"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EC008C]/40 focus:bg-white transition-all" />
        <PolarButton onClick={() => generateFromUrl(url)} disabled={!url || loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Scan
        </PolarButton>
      </div>
      {loading && (
        <div className="flex items-center gap-2 mt-3 text-xs text-[#EC008C]">
          <Loader2 size={12} className="animate-spin" /> {loadingMsg}
        </div>
      )}
    </Card>
  );

  if (mode === 'upload') return (
    <Card title="Upload Document" icon={Upload}>
      <p className="text-sm text-gray-500 mb-4">Upload a pitch deck, brief, or company document — Gemini will read it and extract the problem statement.</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${loading ? 'border-[#EC008C]/30 bg-[#EC008C]/5' : 'border-gray-200 hover:border-[#EC008C]/40 hover:bg-[#EC008C]/5'}`}>
        {loading
          ? <><Loader2 size={28} className="mx-auto mb-2 text-[#EC008C] animate-spin" /><p className="text-sm text-[#EC008C] font-medium">{loadingMsg}</p></>
          : uploadedFile
          ? <><FileText size={28} className="mx-auto mb-2 text-[#010C83]" /><p className="text-sm font-medium text-[#010C83]">{uploadedFile.name}</p><p className="text-xs text-gray-400 mt-1">Click to change file</p></>
          : <><Upload size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">Click to upload PDF, PPTX, DOCX, TXT</p><p className="text-xs text-gray-300 mt-1">Gemini reads your document directly</p></>
        }
      </div>
    </Card>
  );

  return (
    <Card title="Problem Statement — Review" icon={Target}>
      <div className="space-y-4">
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          className="w-full p-4 rounded-xl bg-[#FFF0F8]/40 border-2 border-transparent focus:border-[#EC008C]/20 focus:bg-white text-sm leading-relaxed transition-all resize-none"
          rows={4} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Rate:</span>
          {(['up', 'down'] as const).map(v => (
            <button key={v} onClick={() => setRating(v)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${rating === v ? (v === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500') : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              {v === 'up' ? <ThumbsUp size={15} /> : <ThumbsDown size={15} />}
            </button>
          ))}
          <button onClick={getAlts} disabled={loading} className="ml-auto text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Get 3 alternatives
          </button>
        </div>
        {alts.length > 0 && (
          <div className="space-y-2">
            {alts.map((a, i) => <button key={i} onClick={() => { setDraft(a); setAlts([]); }}
              className="w-full text-left p-3 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-[#EC008C]/5 transition-colors border border-gray-100 cursor-pointer">{a}</button>)}
          </div>
        )}
        <PolarButton className="w-full" disabled={!draft} onClick={() => onDone({ text: draft, url, source: url || uploadedFile?.name || `${brief.companyName} document` })}>
          Approve & Continue <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Solution Description ───────────────────────────────────────────────────────
export function SolutionDescription({ brief, onDone }: { brief: BriefData; onDone: (text: string) => void }) {
  const [draft, setDraft] = useState('');
  const [alts, setAlts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | ''>('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    aiGen(`For company "${brief.companyName}" with problem: "${brief.problemStatement}", write a 1-2 sentence Solution Description explaining how they solve it. Return ONLY the solution.`)
      .then(t => { if (!cancelled) setDraft(t.trim()); })
      .catch(() => { if (!cancelled) setDraft(`${brief.companyName} solves this by [describe your solution].`); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const getAlts = async () => {
    setLoading(true);
    try { const raw = await aiGen(`Rewrite "${draft}" 3 different ways. JSON array of 3 strings.`, true); setAlts(JSON.parse(raw)); }
    catch { setAlts(['Alternative 1', 'Alternative 2', 'Alternative 3']); }
    finally { setLoading(false); }
  };

  return (
    <Card title="How — Solution Description" icon={Zap}>
      <div className="space-y-4">
        {loading && !draft ? (
          <div className="flex items-center gap-3 text-sm text-gray-400 p-4"><Loader2 size={18} className="animate-spin text-[#EC008C]" /> Generating from your source…</div>
        ) : (
          <>
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#FFF0F8]/40 border-2 border-transparent focus:border-[#EC008C]/20 focus:bg-white text-sm leading-relaxed transition-all resize-none"
              rows={4} />
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Rate:</span>
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => setRating(v)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${rating === v ? (v === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500') : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {v === 'up' ? <ThumbsUp size={15} /> : <ThumbsDown size={15} />}
                </button>
              ))}
              <button onClick={getAlts} disabled={loading} className="ml-auto text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Get 3 alternatives
              </button>
            </div>
            {alts.length > 0 && alts.map((a, i) => <button key={i} onClick={() => { setDraft(a); setAlts([]); }}
              className="w-full text-left p-3 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-[#EC008C]/5 transition-colors border border-gray-100 cursor-pointer">{a}</button>)}
            <PolarButton className="w-full" disabled={!draft} onClick={() => onDone(draft)}>Approve & Continue <ArrowRight size={16} /></PolarButton>
          </>
        )}
      </div>
    </Card>
  );
}

// ── Competitors ────────────────────────────────────────────────────────────────
export function CompetitorEntry({ onDone }: { onDone: (comps: BriefData['competitors']) => void }) {
  const [name, setName] = useState(''); const [url, setUrl] = useState('');
  const [cat, setCat] = useState<'similar' | 'different'>('similar');
  const [tags, setTags] = useState<string[]>([]);
  const [comps, setComps] = useState<BriefData['competitors']>([]);
  const [loading, setLoading] = useState(false);
  const simTags = ['Same ICP', 'Same pricing', 'Same tech'];
  const diffTags = ['Better UX', 'Niche focus', 'Different pricing'];

  const add = async () => {
    if (!name) return;
    setLoading(true);
    let tagline = '';
    try { const r = await aiGen(`For brand "${name}", return JSON: {"tagline":"one-line tagline max 8 words"}`, true); tagline = JSON.parse(r).tagline || ''; } catch {}
    setComps(p => [...p, { name, url, tagline, tags: tags.length ? tags : [cat === 'similar' ? 'Same ICP' : 'Better UX'], tagCategory: cat }]);
    setName(''); setUrl(''); setTags([]); setLoading(false);
  };

  const tog = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <Card title="Competitor Entry" icon={BarChart3}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['similar', 'different'] as const).map(c => (
            <button key={c} onClick={() => { setCat(c); setTags([]); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${cat === c ? 'border-[#EC008C] bg-[#EC008C] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
              {c === 'similar' ? '⚡ Similar' : '🔀 Different'}
            </button>
          ))}
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Competitor name"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/40 transition-all" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/40 transition-all" />
        <div className="flex flex-wrap gap-2">
          {(cat === 'similar' ? simTags : diffTags).map(t => (
            <button key={t} onClick={() => tog(t)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-2 transition-all cursor-pointer ${tags.includes(t) ? 'bg-[#EC008C] text-white border-[#EC008C]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{t}</button>
          ))}
        </div>
        <PolarButton onClick={add} disabled={!name || loading} className="w-full">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Fetching tagline…</> : <><Plus size={14} /> Add Competitor</>}
        </PolarButton>
        {comps.map((c, i) => (
          <div key={i} className="flex items-start justify-between p-3 bg-[#FFF0F8]/50 rounded-xl border border-[#EC008C]/10">
            <div>
              <p className="text-sm font-bold text-[#010C83]">{c.name}</p>
              {c.tagline && <p className="text-[11px] text-gray-400 italic">{c.tagline}</p>}
            </div>
            <div className="flex gap-1 flex-wrap max-w-[120px] justify-end">
              {c.tags.map(t => <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.tagCategory === 'similar' ? 'bg-[#010C83]/10 text-[#010C83]' : 'bg-[#EC008C]/10 text-[#EC008C]'}`}>{t}</span>)}
            </div>
          </div>
        ))}
        <PolarButton disabled={comps.length < 1} onClick={() => onDone(comps)} className="w-full">
          Continue ({comps.length} added) <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── UVP ───────────────────────────────────────────────────────────────────────
export function UVPRating({ brief, onDone }: { brief: BriefData; onDone: (uvps: string[]) => void }) {
  const [uvps, setUvps] = useState<Array<{ text: string; rating: 'fire' | 'ok' | 'remove' | '' }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const comps = brief.competitors.map(c => c.name).join(', ') || 'various competitors';
    aiGen(`Brand strategist. Company: "${brief.companyName}". Problem: "${brief.problemStatement}". Competitors: ${comps}. Generate 4 bold UVP sentences. JSON array of 4 strings.`, true)
      .then(r => { if (!cancelled) setUvps(JSON.parse(r).map((t: string) => ({ text: t, rating: '' as const }))); })
      .catch(() => { if (!cancelled) setUvps([
        { text: `${brief.companyName} is the only platform built specifically for this problem.`, rating: '' },
        { text: 'We deliver results 10x faster than the industry standard.', rating: '' },
        { text: 'Unlike competitors, we prioritise human experience at every touchpoint.', rating: '' },
        { text: 'Our approach combines cutting-edge technology with deep domain expertise.', rating: '' },
      ]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rate = (i: number, r: 'fire' | 'ok' | 'remove') => setUvps(p => p.map((u, idx) => idx === i ? { ...u, rating: r } : u));

  return (
    <Card title="Unique Value Proposition" icon={Flame}>
      <div className="space-y-4">
        {loading ? <div className="flex items-center gap-3 p-4 text-sm text-gray-400"><Loader2 size={18} className="animate-spin text-[#EC008C]" /> Analysing competitive gaps…</div> : (
          <>
            {uvps.map((u, i) => (
              <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${u.rating === 'remove' ? 'opacity-40 border-red-100 bg-red-50' : 'border-gray-100 bg-white'}`}>
                <p className="text-sm font-medium text-gray-700 leading-relaxed mb-3">"{u.text}"</p>
                <div className="flex gap-2">
                  {([['fire', '🔥', 'Love it'], ['ok', '😐', 'OK'], ['remove', '❌', 'Remove']] as const).map(([r, emoji, label]) => (
                    <button key={r} onClick={() => rate(i, r)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${u.rating === r ? 'border-[#EC008C] bg-[#EC008C]/10' : 'border-gray-100 hover:border-gray-200'}`}>
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <PolarButton disabled={uvps.every(u => u.rating === '')} onClick={() => onDone(uvps.filter(u => u.rating !== 'remove').map(u => u.text))} className="w-full">
              Lock UVPs <ArrowRight size={16} />
            </PolarButton>
          </>
        )}
      </div>
    </Card>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
export function FeatureBuilder({ brief, onDone }: { brief: BriefData; onDone: (f: BriefData['features']) => void }) {
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
