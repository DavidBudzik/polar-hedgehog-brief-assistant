import { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Upload, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { PolarButton, aiGen, aiAnalyzeFile } from '../shared';
import { MoodBoard } from '../components/MoodBoard';
import type { BriefData } from '../types';

const VISUAL_MOOD_CATEGORIES = [
  'timeless', 'bold', 'premium', 'playful',
  'organic', 'trustworthy', 'minimal', 'expressive',
];

const INTENT_CHIPS = [
  'Trust', 'Innovation', 'Approachability', 'Premium',
  'Boldness', 'Simplicity', 'Energy', 'Reliability', 'Creativity', 'Professionalism',
];

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(1,12,131,0.45)',
  fontFamily: 'var(--font-sans)',
};

type DonePayload = Pick<BriefData,
  'companyNameMeaning' | 'logoRationale' | 'logoRationaleChips' | 'visualLanguageMood'
>;

export function BrandAudit({ brief, onDone }: { brief: BriefData; onDone: (d: DonePayload) => void }) {
  // — Name meaning —
  const [nameMeaning, setNameMeaning] = useState(brief.companyNameMeaning || '');
  const [polished, setPolished] = useState('');
  const [polishing, setPolishing] = useState(false);

  // — Logo —
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attrs, setAttrs] = useState<string[]>([]);
  const [chips, setChips] = useState<string[]>(brief.logoRationaleChips || []);
  const [logoRationale, setLogoRationale] = useState(brief.logoRationale || '');
  const [analysing, setAnalysing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // — Mood —
  const [mood, setMood] = useState<BriefData['visualLanguageMood']>(
    brief.visualLanguageMood ?? { liked: [], skipped: [] }
  );

  // ── helpers ──────────────────────────────────────────────────────────────────

  const polish = async () => {
    if (!nameMeaning) return;
    setPolishing(true);
    try {
      const r = await aiGen(
        `Rephrase into polished brand language (2-3 sentences): "${nameMeaning}". Return ONLY the rephrased text.`
      );
      setPolished(r.trim());
    } catch {
      setPolished(nameMeaning);
    } finally {
      setPolishing(false);
    }
  };

  const analyse = async (file: File) => {
    setAnalysing(true);
    if (file.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(file));
    try {
      const raw = await aiAnalyzeFile(
        file,
        `You are a brand designer analysing a logo for "${brief.companyName}". List exactly 4 specific visual attributes of this logo (e.g. "rounded wordmark", "deep blue palette", "minimal icon", "geometric letterform"). Return a JSON array of 4 short strings.`
      );
      setAttrs(JSON.parse(raw));
    } catch {
      setAttrs(['Wordmark style', 'Brand colors', 'Geometric elements', 'Clean typography']);
    } finally {
      setAnalysing(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    analyse(f);
  };

  const tog = (c: string) => setChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleDone = () => {
    onDone({
      companyNameMeaning: polished || nameMeaning,
      logoRationale,
      logoRationaleChips: chips,
      visualLanguageMood: mood,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">

      {/* ── Section header ── */}
      <div>
        <p style={{ ...labelStyle, color: '#EC008C' }}>Brand Audit</p>
        <h2 className="text-2xl font-black tracking-tight mt-1"
          style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Tell us about your brand
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          Name story, existing logo, and visual direction.
        </p>
      </div>

      {/* ── Company name meaning ── */}
      <div className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
        <p style={{ ...labelStyle }}>
          What's the story behind "{brief.companyName}"?
        </p>
        <textarea
          value={nameMeaning}
          onChange={e => { setNameMeaning(e.target.value); setPolished(''); }}
          placeholder="Origin, meaning, founder decision…"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
          style={{
            background: 'rgba(1,12,131,0.03)',
            border: '1px solid rgba(1,12,131,0.12)',
            color: '#010C83',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button
          onClick={polish}
          disabled={!nameMeaning || polishing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          style={{ background: 'rgba(1,12,131,0.05)', color: '#010C83', fontFamily: 'var(--font-sans)' }}>
          {polishing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Help me articulate this
        </button>
        {polished && (
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(236,0,140,0.04)', border: '1px solid rgba(236,0,140,0.12)' }}>
            <p style={{ ...labelStyle, color: '#EC008C' }}>Polished version</p>
            <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: 'var(--font-sans)' }}>
              {polished}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setNameMeaning(polished); setPolished(''); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'var(--font-sans)' }}>
                ✓ Use this
              </button>
              <button
                onClick={() => setPolished('')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{ background: 'white', color: 'rgba(1,12,131,0.45)', border: '1px solid rgba(1,12,131,0.12)', fontFamily: 'var(--font-sans)' }}>
                Keep mine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Logo upload ── */}
      <div className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
        <div className="flex items-center justify-between">
          <p style={labelStyle}>Existing Logo</p>
          <span style={{ ...labelStyle, color: 'rgba(1,12,131,0.28)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            optional
          </span>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFile}
        />

        {!logoFile ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{ border: '2px dashed rgba(1,12,131,0.12)' }}>
            <Upload size={24} className="mx-auto mb-2" style={{ color: 'rgba(1,12,131,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
              Upload PNG, JPG, SVG, or WebP
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(1,12,131,0.25)', fontFamily: 'var(--font-sans)' }}>
              Gemini will analyse the visual attributes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative rounded-xl overflow-hidden cursor-pointer group"
              style={{ border: '1px solid rgba(1,12,131,0.08)', background: 'rgba(1,12,131,0.02)' }}>
              {previewUrl
                ? <img src={previewUrl} alt="Logo" className="w-full max-h-28 object-contain p-4" />
                : <div className="p-4 text-sm font-medium" style={{ color: '#010C83', fontFamily: 'var(--font-sans)' }}>{logoFile.name}</div>
              }
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold">Change logo</span>
              </div>
            </div>

            {analysing ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
                <Loader2 size={13} className="animate-spin" /> Analysing logo…
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#065f46', fontFamily: 'var(--font-sans)' }}>
                  <CheckCircle2 size={13} /> Logo analysed
                </div>

                {attrs.length > 0 && (
                  <div>
                    <p style={labelStyle} className="mb-2">Observed attributes</p>
                    <div className="flex flex-wrap gap-2">
                      {attrs.map(a => (
                        <span key={a} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(1,12,131,0.05)', color: '#010C83', fontFamily: 'var(--font-sans)' }}>
                          <Check size={10} />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p style={labelStyle} className="mb-2">Intent — what does it communicate?</p>
                  <div className="flex flex-wrap gap-2">
                    {INTENT_CHIPS.map(c => (
                      <button
                        key={c}
                        onClick={() => tog(c)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          ...(chips.includes(c)
                            ? { background: 'linear-gradient(135deg, #EC008C, #d4007e)', color: 'white', boxShadow: '0 2px 8px rgba(236,0,140,0.25)' }
                            : { background: 'white', color: 'rgba(1,12,131,0.55)', border: '1px solid rgba(1,12,131,0.12)' }
                          ),
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={logoRationale}
                  onChange={e => setLogoRationale(e.target.value)}
                  placeholder="Any additional context about the logo…"
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
                  style={{
                    background: 'rgba(1,12,131,0.03)',
                    border: '1px solid rgba(1,12,131,0.12)',
                    color: '#010C83',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Visual mood ── */}
      <div className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
        <div>
          <p style={labelStyle}>Visual Direction</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
            Like images that feel right · skip ones that don't
          </p>
        </div>
        <MoodBoard
          categories={VISUAL_MOOD_CATEGORIES}
          value={mood}
          onChange={setMood}
        />
      </div>

      <PolarButton
        className="w-full h-11 text-sm"
        disabled={!nameMeaning.trim()}
        onClick={handleDone}>
        Save & Continue <ArrowRight size={15} />
      </PolarButton>
    </div>
  );
}
