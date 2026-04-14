import { useState, useEffect, useRef } from 'react';
import { Target, Search, Upload, RefreshCw, Loader2, ArrowRight, Plus, Trash2, Flame, Zap, Sparkles, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen, aiScanUrl, aiAnalyzeFile, extractJson } from '../shared';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { ErrorBanner } from '../ui/useAIError';
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
  const [scanError, setScanError] = useState<string | null>(null);
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
    setScanError(null);
    setMode('review');
    try {
      const result = await aiScanUrl(targetUrl, 
        `Brand strategist. Based on this website, identify the core problem they solve and their solution.
         Return a JSON object: {"problem": "1-2 sentence problem statement", "solution": "1-2 sentence solution description"}`,
        true
      );
      
      const parsed = extractJson(result);
      if (parsed) {
        setProblem(parsed.problem || '');
        setSolution(parsed.solution || '');
      } else {
        setProblem(result.split('\n')[0] || '');
        setSolution(result.split('\n').slice(1).join(' ') || '');
      }
    } catch (e) {
      setScanError(e instanceof Error ? e.message : String(e));
      if (!problem) setProblem(`${brief.companyName} solves the challenge of [describe your problem].`);
      if (!solution) setSolution(`${brief.companyName} solves this by [describe your solution].`);
    } finally { setLoading(false); setLoadingMsg(''); }
  };

  const generateFromFile = async (file: File) => {
    setLoading(true);
    setLoadingMsg('Reading document…');
    setScanError(null);
    setMode('review');
    try {
      const result = await aiAnalyzeFile(file, 
        `Brand strategist for "${brief.companyName}". Identify the core problem they solve and their solution from this document.
         Return a JSON object: {"problem": "1-2 sentence problem statement", "solution": "1-2 sentence solution description"}`
      );
      
      const parsed = extractJson(result);
      if (parsed) {
        setProblem(parsed.problem || '');
        setSolution(parsed.solution || '');
      } else {
        setProblem(result.split('\n')[0] || '');
        setSolution(result.split('\n').slice(1).join(' ') || '');
      }
    } catch (e) {
      setScanError(e instanceof Error ? e.message : String(e));
      if (!problem) setProblem(`${brief.companyName} solves the challenge of [describe your problem].`);
      if (!solution) setSolution(`${brief.companyName} solves this by [describe your solution].`);
    } finally { setLoading(false); setLoadingMsg(''); }
  };

  const retryScan = () => {
    if (uploadedFile) generateFromFile(uploadedFile);
    else if (url) generateFromUrl(url);
  };

  const getAlts = async (which: 'problem' | 'solution') => {
    const draft = which === 'problem' ? problem : solution;
    setLoading(true);
    try {
      const raw = await aiGen(`Rewrite "${draft}" 3 ways, 1-2 sentences each. JSON array of 3 strings.`, true);
      const parsed = extractJson(raw);
      if (which === 'problem') setProblemAlts(parsed || []);
      else setSolutionAlts(parsed || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const inputStyle = {
    background: 'rgba(236,0,140,0.03)',
    border: '1.5px solid transparent',
    fontFamily: 'var(--font-sans)',
    color: '#010C83',
  };

  const AltList = ({ alts, onPick }: { alts: string[]; onPick: (a: string) => void }) =>
    alts.length > 0 ? (
      <div className="space-y-1.5 mt-2">
        {alts.map((a, i) => (
          <button key={i} onClick={() => onPick(a)}
            className="w-full text-left p-3 rounded-xl text-sm transition-colors cursor-pointer"
            style={{ background: 'rgba(1,12,131,0.03)', color: 'rgba(1,12,131,0.75)', fontFamily: 'var(--font-sans)', border: '1px solid rgba(1,12,131,0.08)' }}>
            {a}
          </button>
        ))}
      </div>
    ) : null;

  if (mode === 'choose') return (
    <Card title="Problem + Solution" icon={Target}>
      <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: 'var(--font-sans)' }}>
        How does <strong style={{ color: '#010C83' }}>{brief.companyName}</strong> help its customers?
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('url')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl font-bold cursor-pointer transition-all"
          style={{ border: '2px solid #EC008C', background: 'rgba(236,0,140,0.06)', color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
          <Search size={28} /><span className="text-sm">Scan website</span>
        </button>
        <button onClick={() => setMode('upload')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl font-bold cursor-pointer transition-all hover:bg-gray-50"
          style={{ border: '2px solid rgba(1,12,131,0.1)', color: 'rgba(1,12,131,0.5)', fontFamily: 'var(--font-sans)' }}>
          <Upload size={28} /><span className="text-sm">Upload doc</span>
        </button>
      </div>
    </Card>
  );

  if (mode === 'url') return (
    <Card title="Scan Website" icon={Search}>
      <p className="text-sm mb-4" style={{ color: 'rgba(1,12,131,0.5)', fontFamily: 'var(--font-sans)' }}>
        AI will extract both the problem and solution in one pass.
      </p>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && url && generateFromUrl(url)}
          placeholder="https://yourcompany.com"
          className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ background: 'rgba(1,12,131,0.03)', border: '1px solid rgba(1,12,131,0.12)', color: '#010C83', fontFamily: 'var(--font-sans)' }} />
        <PolarButton onClick={() => generateFromUrl(url)} disabled={!url || loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Scan
        </PolarButton>
      </div>
      {loading && <div className="flex items-center gap-2 mt-3 text-xs text-[#EC008C]"><Loader2 size={12} className="animate-spin" /> {loadingMsg}</div>}
    </Card>
  );

  if (mode === 'upload') return (
    <Card title="Upload Document" icon={Upload}>
      <p className="text-sm mb-4" style={{ color: 'rgba(1,12,131,0.5)', fontFamily: 'var(--font-sans)' }}>
        Upload a pitch deck or brief — AI reads and extracts both outputs.
      </p>
      <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc,.txt" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { setUploadedFile(f); generateFromFile(f); } }} />
      <div onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{ borderColor: loading ? 'rgba(236,0,140,0.3)' : 'rgba(1,12,131,0.1)' }}>
        {loading
          ? <><Loader2 size={28} className="mx-auto mb-2 text-[#EC008C] animate-spin" /><p className="text-sm text-[#EC008C]">{loadingMsg}</p></>
          : uploadedFile
          ? <><FileText size={28} className="mx-auto mb-2" style={{ color: '#010C83' }} /><p className="text-sm font-medium" style={{ color: '#010C83' }}>{uploadedFile.name}</p></>
          : <><Upload size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">Click to upload PDF, PPTX, DOCX, TXT</p></>}
      </div>
    </Card>
  );

  // review mode
  return (
    <Card title="Problem + Solution — Review" icon={Target}>
      <div className="space-y-5">
        {loading && !problem ? (
          <div className="flex items-center gap-3 p-4 text-sm text-gray-400">
            <Loader2 size={18} className="animate-spin text-[#EC008C]" /> {loadingMsg}
          </div>
        ) : (
          <>
            {scanError && (
              <ErrorBanner
                message={`Couldn't analyze source: ${scanError}. Showing a template you can edit, or retry.`}
                onRetry={retryScan}
                onDismiss={() => setScanError(null)}
              />
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}>
                Problem Statement
              </p>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
                className="w-full p-3 rounded-xl text-sm leading-relaxed resize-none focus:outline-none"
                style={{ ...inputStyle, background: 'rgba(236,0,140,0.03)' }} />
              <button onClick={() => getAlts('problem')} disabled={loading}
                className="mt-1 text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}>
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} 3 alternatives
              </button>
              <AltList alts={problemAlts} onPick={a => { setProblem(a); setProblemAlts([]); }} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}>
                Solution Description
              </p>
              <textarea value={solution} onChange={e => setSolution(e.target.value)} rows={3}
                className="w-full p-3 rounded-xl text-sm leading-relaxed resize-none focus:outline-none"
                style={{ ...inputStyle, background: 'rgba(236,0,140,0.03)' }} />
              <button onClick={() => getAlts('solution')} disabled={loading}
                className="mt-1 text-xs font-bold text-[#EC008C] hover:underline flex items-center gap-1 cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}>
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} 3 alternatives
              </button>
              <AltList alts={solutionAlts} onPick={a => { setSolution(a); setSolutionAlts([]); }} />
            </div>

            <PolarButton className="w-full" disabled={!problem || !solution}
              onClick={() => onDone({ problemStatement: problem, solutionDescription: solution, websiteUrl: url, scanSource: url || uploadedFile?.name || `${brief.companyName} document` })}>
              Approve & Continue <ArrowRight size={16} />
            </PolarButton>
          </>
        )}
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
  const [screenshots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uvpLoading, setUvpLoading] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const add = async () => {
    if (!name) return;
    setLoading(true);
    let tagline = '';
    try {
      const r = await aiGen(`For brand "${name}", return JSON: {"tagline":"one-line tagline max 8 words"}`, true);
      tagline = extractJson(r)?.tagline || '';
    } catch {}
    const newComp = { name, url: url.trim(), tagline, tags: [cat === 'similar' ? 'Same ICP' : 'Better UX'], tagCategory: cat };
    setComps(p => { const next = [...p, newComp]; setActive(next.length - 1); return next; });
    setName(''); setUrl(''); setLoading(false);
  };

  const handleDone = async () => {
    setUvpLoading(true);
    let uvp: string[] = [];
    try {
      const compList = comps.map(c => c.name).join(', ') || 'various competitors';
      const raw = await aiGen(
        `Brand: "${brief.companyName}". Problem: "${brief.problemStatement}". Competitors: ${compList}. Generate 4 bold UVP sentences. JSON array of 4 strings.`, true
      );
      uvp = extractJson(raw) || [];
    } catch {
      uvp = [`${brief.companyName} is the only platform built specifically for this challenge.`];
    } finally { setUvpLoading(false); }
    onDone({ competitors: comps, competitorScreenshots: screenshots, uvp });
  };

  const inputStyle = { background: 'rgba(1,12,131,0.03)', border: '1px solid rgba(1,12,131,0.12)', color: '#010C83', fontFamily: 'var(--font-sans)' };

  return (
    <Card title="Market Position" icon={Flame}>
      <div className="space-y-4">
        <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>
          Add your main competitors. AI will derive your UVP automatically when you continue.
        </p>

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
                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: c.tagCategory === 'similar' ? 'rgba(1,12,131,0.1)' : 'rgba(236,0,140,0.1)', color: c.tagCategory === 'similar' ? '#010C83' : '#EC008C', fontFamily: 'var(--font-sans)' }}>
                    {t}
                  </span>
                ))}
              </div>
            }
          />
        ))}

        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            {(['similar', 'different'] as const).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  ...(cat === c
                    ? { background: '#EC008C', color: 'white', border: '2px solid #EC008C' }
                    : { border: '2px solid rgba(1,12,131,0.1)', color: 'rgba(1,12,131,0.5)' }),
                }}>
                {c === 'similar' ? '⚡ Similar' : '🔀 Different'}
              </button>
            ))}
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Competitor name"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={inputStyle} />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={inputStyle} />
          <PolarButton variant="secondary" onClick={add} disabled={!name || loading} className="w-full">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : <><Plus size={14} /> Add Competitor</>}
          </PolarButton>
        </div>

        <PolarButton disabled={comps.length < 1 || uvpLoading} onClick={handleDone} className="w-full">
          {uvpLoading
            ? <><Loader2 size={16} className="animate-spin" /> Deriving UVPs…</>
            : <>Continue ({comps.length} added) <ArrowRight size={16} /></>}
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
      setFeatures(extractJson(raw) || []);
    } catch {} finally { setLoading(false); }
  };

  const up = (i: number, f: 'title' | 'desc', v: string) => setFeatures(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  return (
    <Card title="Main Product Features" icon={Zap}>
      <div className="space-y-3">
        <button onClick={suggest} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
          style={{ border: '2px dashed rgba(236,0,140,0.3)', color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Suggest Features
        </button>
        {features.map((f, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 group relative">
            <button onClick={() => setFeatures(p => p.filter((_, idx) => idx !== i))}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Trash2 size={14} />
            </button>
            <input value={f.title} onChange={e => up(i, 'title', e.target.value)} placeholder="Feature name"
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 mb-1"
              style={{ color: '#010C83', fontFamily: 'var(--font-display)' }} />
            <textarea value={f.desc} onChange={e => up(i, 'desc', e.target.value)} placeholder="One-line description"
              className="w-full text-xs bg-transparent border-none focus:ring-0 p-0 resize-none"
              style={{ color: 'rgba(1,12,131,0.5)', fontFamily: 'var(--font-sans)' }} rows={2} />
          </div>
        ))}
        <button onClick={() => setFeatures(p => [...p, { title: '', desc: '' }])}
          className="w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
          style={{ border: '2px dashed rgba(1,12,131,0.1)', color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
          <Plus size={14} /> Add Feature
        </button>
        <PolarButton onClick={() => onDone(features.filter(f => f.title))} disabled={!features.some(f => f.title)} className="w-full">
          Save Features <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}
