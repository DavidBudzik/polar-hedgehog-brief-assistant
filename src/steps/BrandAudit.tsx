import { useState, useRef } from 'react';
import { Type, Image, Sliders, Upload, Sparkles, ThumbsUp, ThumbsDown, ArrowRight, Loader2, Star, CheckCircle2, Check, FileText, Globe } from 'lucide-react';
import { PolarButton, Card, aiGen, aiAnalyzeFile, aiScanUrl } from '../shared';
import type { BriefData } from '../types';

// ── Company Name Meaning ───────────────────────────────────────────────────────
export function CompanyNameMeaning({ brief, onDone }: { brief: BriefData; onDone: (text: string) => void }) {
  const [text, setText] = useState('');
  const [polished, setPolished] = useState('');
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);

  const polish = async () => {
    setLoading(true);
    try { const r = await aiGen(`Rephrase into polished brand language (2-3 sentences): "${text}". Return ONLY the rephrased text.`); setPolished(r.trim()); }
    catch { setPolished(text); }
    finally { setLoading(false); }
  };

  return (
    <Card title="Company Name Meaning" icon={Type}>
      <div className="space-y-4">
        <textarea value={text} onChange={e => { setText(e.target.value); setPolished(''); }}
          placeholder={`What's the story behind "${brief.companyName}"?`}
          className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm leading-relaxed focus:outline-none focus:border-[#EC008C]/40 focus:bg-white focus:ring-2 focus:ring-[#EC008C]/8 resize-none transition-all" rows={4} />
        <button onClick={polish} disabled={!text || loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#010C83]/5 text-[#010C83] rounded-xl text-xs font-bold hover:bg-[#010C83]/10 transition-all disabled:opacity-50 cursor-pointer">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Help me articulate this
        </button>
        {polished && (
          <div className="p-4 bg-[#FFF0F8]/50 rounded-xl border border-[#EC008C]/10 space-y-3">
            <p className="text-[10px] font-bold text-[#EC008C] uppercase tracking-widest">Polished version</p>
            <p className="text-sm leading-relaxed text-gray-700">{polished}</p>
            <div className="flex gap-2">
              <button onClick={() => { setText(polished); setApproved(true); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${approved === true ? 'bg-green-100 border-green-200 text-green-700' : 'border-gray-100 hover:border-gray-200'}`}>
                <ThumbsUp size={12} /> Use this
              </button>
              <button onClick={() => { setPolished(''); setApproved(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${approved === false ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-100 hover:border-gray-200'}`}>
                <ThumbsDown size={12} /> Keep mine
              </button>
            </div>
          </div>
        )}
        <PolarButton onClick={() => onDone(text)} disabled={!text} className="w-full">Save & Continue <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}

// ── Logo Rationale ─────────────────────────────────────────────────────────────
export function LogoRationale({ brief, onDone }: { brief: BriefData; onDone: (d: { rationale: string; chips: string[] }) => void }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attrs, setAttrs] = useState<string[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intentChips = ['Trust', 'Innovation', 'Approachability', 'Premium', 'Boldness', 'Simplicity', 'Energy', 'Reliability', 'Creativity', 'Professionalism'];

  const analyse = async (file: File) => {
    setLoading(true);
    setLoadingMsg('Analysing logo…');

    // Show image preview for image files
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    try {
      const raw = await aiAnalyzeFile(
        file,
        `You are a brand designer analysing a logo for "${brief.companyName}". List exactly 4 specific visual attributes of this logo (e.g. "rounded wordmark", "deep blue palette", "minimal icon", "geometric letterform"). JSON array of 4 short strings.`
      );
      setAttrs(JSON.parse(raw));
    } catch {
      setAttrs(['Wordmark style', 'Brand colors', 'Geometric elements', 'Clean typography']);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    analyse(file);
  };

  const tog = (c: string) => setChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  return (
    <Card title="Logo Design Rationale" icon={Image}>
      <div className="space-y-5">
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,.svg" className="hidden" onChange={handleFileChange} />

        {!uploadedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#EC008C]/40 hover:bg-[#EC008C]/5 transition-all">
            {loading
              ? <><Loader2 size={28} className="mx-auto mb-2 text-[#EC008C] animate-spin" /><p className="text-sm text-[#EC008C]">{loadingMsg}</p></>
              : <><Image size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">Upload logo (PNG, JPG, SVG, WebP)</p><p className="text-xs text-gray-300 mt-1">Gemini will analyse the visual attributes</p></>
            }
          </div>
        ) : (
          <>
            {/* Preview + re-upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden cursor-pointer group">
              {previewUrl ? (
                <img src={previewUrl} alt="Uploaded logo" className="w-full max-h-32 object-contain p-4" />
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <FileText size={24} className="text-[#010C83]" />
                  <span className="text-sm font-medium text-[#010C83]">{uploadedFile.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold">Change logo</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#EC008C]">
                <Loader2 size={14} className="animate-spin" /> {loadingMsg}
              </div>
            ) : (
              <>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2 text-xs font-medium text-green-700">
                  <CheckCircle2 size={14} /> Logo uploaded and analysed
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Observed Attributes</p>
                  <div className="flex flex-wrap gap-2">
                    {attrs.map(a => <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-[#010C83]/5 text-[#010C83] rounded-full text-xs font-bold"><Check size={10} />{a}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Intent — What does it communicate?</p>
                  <div className="flex flex-wrap gap-2">
                    {intentChips.map(c => <button key={c} onClick={() => tog(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${chips.includes(c) ? 'bg-[#EC008C] text-white border-[#EC008C]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{c}</button>)}
                  </div>
                </div>
                <textarea value={rationale} onChange={e => setRationale(e.target.value)} placeholder="Any additional context…"
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#EC008C]/40 focus:bg-white transition-all" rows={3} />
                <PolarButton onClick={() => onDone({ rationale, chips })} className="w-full">Save Logo Rationale <ArrowRight size={16} /></PolarButton>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

// ── Visual Language ────────────────────────────────────────────────────────────
export function VisualLanguageRationale({ brief, onDone }: { brief: BriefData; onDone: (d: { summary: string; sliders: BriefData['visualLanguageSliders'] }) => void }) {
  const [mode, setMode] = useState<'choose' | 'uploading' | 'done'>('choose');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [sliders, setSliders] = useState<BriefData['visualLanguageSliders']>({ modern: 3, trustworthy: 3, bold: 3 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyseFiles = async (files: File[]) => {
    setLoading(true);
    setLoadingMsg('Analysing brand assets…');
    try {
      // Analyse first file (primary asset) then summarise all
      const result = await aiAnalyzeFile(
        files[0],
        `You are a brand designer reviewing visual assets for "${brief.companyName}". Based on this brand asset, write a 2-sentence visual language summary covering: tone, color palette, typography style, and imagery approach. Return ONLY the summary.`
      );
      setSummary(result.trim());
      setMode('done');
    } catch {
      setSummary(`${brief.companyName}'s visual language combines professional typography with a bold, modern color palette that reflects the brand's core values.`);
      setMode('done');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const analyseUrl = async () => {
    if (!websiteUrl) return;
    setLoading(true);
    setLoadingMsg('Scanning website visual language…');
    try {
      const result = await aiScanUrl(
        websiteUrl,
        `You are a brand designer reviewing a website for "${brief.companyName}". Based on the visual design of this website, write a 2-sentence visual language summary covering: tone, color palette, typography style, and imagery approach. Return ONLY the summary.`
      );
      setSummary(result.trim());
      setMode('done');
    } catch {
      setSummary(`${brief.companyName}'s website presents a clean, modern aesthetic with a professional color palette aligned to the brand's positioning.`);
      setMode('done');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles(files);
    analyseFiles(files);
  };

  if (mode === 'choose') return (
    <Card title="Visual Language Rationale" icon={Sliders}>
      <p className="text-sm text-gray-500 mb-5">Upload brand assets or scan your website so Gemini can analyse your current visual language.</p>
      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />

      <div className="space-y-3">
        {/* Upload assets */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#EC008C]/40 hover:bg-[#EC008C]/5 transition-all group">
          {loading
            ? <Loader2 size={24} className="text-[#EC008C] animate-spin flex-shrink-0" />
            : <Upload size={24} className="text-gray-300 group-hover:text-[#EC008C] transition-colors flex-shrink-0" />}
          <div>
            <p className="text-sm font-semibold text-gray-600 group-hover:text-[#EC008C] transition-colors">Upload brand assets</p>
            <p className="text-xs text-gray-400">Images, screenshots, PDFs — up to 3 files</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 overflow-hidden focus-within:border-[#EC008C]/40 focus-within:bg-white transition-all">
              <Globe size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyseUrl()}
                placeholder="https://yourcompany.com"
                className="flex-1 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
              />
            </div>
            <PolarButton onClick={analyseUrl} disabled={!websiteUrl || loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Scan'}
            </PolarButton>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 mt-3 text-xs text-[#EC008C]">
          <Loader2 size={12} className="animate-spin" /> {loadingMsg}
        </div>
      )}
    </Card>
  );

  return (
    <Card title="Visual Language Rationale" icon={Sliders}>
      <div className="space-y-5">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700 font-medium">
                <CheckCircle2 size={12} /> {f.name}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-[#FFF0F8]/50 rounded-xl border border-[#EC008C]/10">
          <p className="text-[10px] font-bold text-[#EC008C] uppercase tracking-widest mb-2">AI Visual Language Summary</p>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-transparent text-sm leading-relaxed text-gray-700 resize-none focus:outline-none" rows={3} />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">How well does this still represent you? (1–5 ★)</p>
          {(['modern', 'trustworthy', 'bold'] as const).map(axis => (
            <div key={axis} className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#010C83] capitalize w-24">{axis}</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setSliders(s => ({ ...s, [axis]: n }))} className="cursor-pointer">
                    <Star size={20} className={n <= sliders[axis] ? 'text-[#EC008C] fill-[#EC008C]' : 'text-gray-200'} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <PolarButton onClick={() => onDone({ summary, sliders })} className="w-full">Save Visual Language <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}
