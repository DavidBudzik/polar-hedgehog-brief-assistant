import { useState } from 'react';
import { Globe, Layers, Palette, ArrowRight, Check, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { PolarButton, Card, aiGen } from '../shared';
import type { BriefData } from '../types';

// ── Reference Brands ───────────────────────────────────────────────────────────
type RefBrand = { name: string; url: string; likes: string[]; dislikes: string[] };
const LIKE_OPTIONS = ['Color palette','Typography','Logo mark','Motion/animation','Photography','Illustration','Overall feel','Simplicity','Boldness','Modernity'];
const DISLIKE_OPTIONS = ['Too corporate','Too playful','Too minimal','Too complex','Color clash','Dated feel','Lacks warmth','Overly technical','Generic','Too loud'];

export function ReferenceBrands({ brief, onDone }: { brief: BriefData; onDone: (brands: RefBrand[]) => void }) {
  const [brands, setBrands] = useState<RefBrand[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [active, setActive] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const addBrand = async () => {
    if (!name.trim()) return;
    const nb: RefBrand = { name: name.trim(), url: url.trim(), likes: [], dislikes: [] };
    setBrands(p => { const next = [...p, nb]; setActive(next.length - 1); return next; });
    setName(''); setUrl('');
    if (url.trim()) {
      setLoading(true);
      try {
        const raw = await aiGen(`For brand "${name.trim()}" (${url.trim()}), suggest 3 visual elements that are typically praised. JSON array of short strings (max 4 words each).`, true);
        const suggestions: string[] = JSON.parse(raw);
        setBrands(p => p.map((b, i) => i === p.length - 1 ? { ...b, likes: suggestions } : b));
      } catch { /* ignore */ } finally { setLoading(false); }
    }
  };

  const togLike = (i: number, opt: string) => setBrands(p => p.map((b, idx) => idx === i ? { ...b, likes: b.likes.includes(opt) ? b.likes.filter(x => x !== opt) : [...b.likes, opt] } : b));
  const togDislike = (i: number, opt: string) => setBrands(p => p.map((b, idx) => idx === i ? { ...b, dislikes: b.dislikes.includes(opt) ? b.dislikes.filter(x => x !== opt) : [...b.dislikes, opt] } : b));
  const remove = (i: number) => { setBrands(p => p.filter((_, idx) => idx !== i)); if (active === i) setActive(null); };

  return (
    <Card title="Reference Brands" icon={Globe}>
      <div className="space-y-5">
        <p className="text-xs text-gray-400">Add brands you admire visually. Tell us what you like and dislike about each.</p>

        {brands.map((b, i) => (
          <div key={i} className={`rounded-2xl border-2 transition-all overflow-hidden ${active === i ? 'border-[#EC008C]/30' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setActive(active === i ? null : i)}>
              <div>
                <p className="text-sm font-bold text-[#010C83]">{b.name}</p>
                {b.url && <p className="text-[10px] text-gray-400">{b.url}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">{b.likes.length} likes · {b.dislikes.length} dislikes</span>
                <button onClick={e => { e.stopPropagation(); remove(i); }} className="text-gray-300 hover:text-red-400 text-xs font-bold ml-1">✕</button>
              </div>
            </div>
            {active === i && (
              <div className="px-4 py-3 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ThumbsUp size={10} /> What do you like?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIKE_OPTIONS.map(o => (
                      <button key={o} onClick={() => togLike(i, o)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${b.likes.includes(o) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ThumbsDown size={10} /> What don't you like?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DISLIKE_OPTIONS.map(o => (
                      <button key={o} onClick={() => togDislike(i, o)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${b.dislikes.includes(o) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="space-y-2">
          <div className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} placeholder="Brand name"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/30" />
            <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} placeholder="Website (optional)"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EC008C]/30" />
          </div>
          <button onClick={addBrand} disabled={!name.trim() || loading}
            className="w-full py-2 bg-[#010C83]/5 text-[#010C83] rounded-xl text-xs font-bold hover:bg-[#010C83]/10 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={12} className="animate-spin" /> : '+'} Add Brand
          </button>
        </div>

        <PolarButton disabled={brands.length === 0} onClick={() => onDone(brands)} className="w-full">
          Save References ({brands.length}) <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Logo Style ─────────────────────────────────────────────────────────────────
const LOGO_STYLES = [
  ['Wordmark', 'Pure typography', '𝗔𝗯𝗰'],
  ['Lettermark', 'Monogram / initials', 'AB'],
  ['Symbol + Wordmark', 'Icon paired with text', '◆ Abc'],
  ['Symbol only', 'Abstract mark or icon', '◆'],
  ['Emblem', 'Badge / seal style', '⬡'],
  ['Combination mark', 'Flexible system', '◆ + Abc'],
];

export function LogoStyleSelector({ brief, onDone }: { brief: BriefData; onDone: (style: string, open: boolean) => void }) {
  const [sel, setSel] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Card title="Logo Style Direction" icon={Layers}>
      <div className="space-y-4">
        <p className="text-xs text-gray-400">Which logo format resonates most with your brand vision?</p>
        <div className="grid grid-cols-2 gap-2">
          {LOGO_STYLES.map(([name, desc, preview]) => {
            const isS = sel === name;
            return (
              <button key={name} onClick={() => setSel(name)}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isS ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                {isS && <div className="absolute top-2 right-2 w-4 h-4 bg-[#EC008C] rounded-full flex items-center justify-center"><Check size={9} className="text-white" /></div>}
                <div className="text-lg font-mono text-gray-400 mb-2">{preview}</div>
                <p className={`text-xs font-bold ${isS ? 'text-[#EC008C]' : 'text-[#010C83]'}`}>{name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${open ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 hover:border-gray-200'}`}>
          <div className="text-left">
            <p className={`text-xs font-bold ${open ? 'text-[#EC008C]' : 'text-gray-600'}`}>Open to Polar's recommendation</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Let our team propose the best direction based on your brief</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${open ? 'bg-[#EC008C] border-[#EC008C]' : 'border-gray-300'}`}>
            {open && <Check size={10} className="text-white" />}
          </div>
        </button>
        <PolarButton disabled={!sel && !open} onClick={() => onDone(sel, open)} className="w-full">
          Confirm Logo Direction <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Color Palette ──────────────────────────────────────────────────────────────
const COLOR_APPROACHES = [
  ['Monochromatic', 'Single hue with varying tones', '#010C83'],
  ['Complementary', 'Two opposite hues for contrast', '#EC008C'],
  ['Analogous', 'Harmonious adjacent hues', '#00C853'],
  ['Triadic', 'Three evenly-spaced hues', '#FF6D00'],
  ['Neutral + Accent', 'Minimal with one bold pop', '#757575'],
  ['Brand-matched', 'Extend existing brand colors', '#5C6BC0'],
];

const SWATCH_PAIRS: Array<{ color: string; label: string }> = [
  { color: '#010C83', label: 'Deep Navy' }, { color: '#EC008C', label: 'Magenta' },
  { color: '#00B4D8', label: 'Cyan' }, { color: '#06D6A0', label: 'Mint' },
  { color: '#FFB703', label: 'Amber' }, { color: '#E63946', label: 'Red' },
  { color: '#7209B7', label: 'Violet' }, { color: '#F4A261', label: 'Warm' },
  { color: '#2D6A4F', label: 'Forest' }, { color: '#1B1B1B', label: 'Obsidian' },
  { color: '#F8F9FA', label: 'Off-white' }, { color: '#ADB5BD', label: 'Cool Gray' },
];

export function ColorPaletteSelector({ brief, onDone }: { brief: BriefData; onDone: (approach: string, ratings: BriefData['colorSwatchRatings']) => void }) {
  const [approach, setApproach] = useState('');
  const [ratings, setRatings] = useState<BriefData['colorSwatchRatings']>(SWATCH_PAIRS.map(s => ({ ...s, rating: '' })));

  const rate = (i: number, r: 'like' | 'dislike') =>
    setRatings(p => p.map((s, idx) => idx === i ? { ...s, rating: s.rating === r ? '' : r } : s));

  const liked = ratings.filter(r => r.rating === 'like').length;
  const disliked = ratings.filter(r => r.rating === 'dislike').length;

  return (
    <Card title="Color Palette Preferences" icon={Palette}>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Color Approach</p>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_APPROACHES.map(([name, desc, hex]) => {
              const isS = approach === name;
              return (
                <button key={name} onClick={() => setApproach(name)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${isS ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm" style={{ background: hex }} />
                  <div>
                    <p className={`text-xs font-bold ${isS ? 'text-[#EC008C]' : 'text-[#010C83]'}`}>{name}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </div>
                  {isS && <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#EC008C] rounded-full flex items-center justify-center"><Check size={8} className="text-white" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color Reactions</p>
            <p className="text-[10px] text-gray-400">{liked} ♥ · {disliked} ✕</p>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Quick-react to each color — like or dislike helps us understand your palette direction.</p>
          <div className="grid grid-cols-4 gap-2">
            {ratings.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-full h-12 rounded-xl shadow-sm" style={{ background: s.color }} />
                <p className="text-[10px] text-gray-400 text-center leading-tight">{s.label}</p>
                <div className="flex gap-1">
                  <button onClick={() => rate(i, 'like')}
                    className={`p-1 rounded-lg transition-all ${s.rating === 'like' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    <ThumbsUp size={10} />
                  </button>
                  <button onClick={() => rate(i, 'dislike')}
                    className={`p-1 rounded-lg transition-all ${s.rating === 'dislike' ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    <ThumbsDown size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PolarButton disabled={!approach} onClick={() => onDone(approach, ratings)} className="w-full">
          Confirm Color Preferences <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}

// ── Summary Review ─────────────────────────────────────────────────────────────
export function SummaryReview({ brief, onDone }: { brief: BriefData; onDone: () => void }) {
  const sections = [
    {
      label: 'Discovery',
      items: [
        ['Company', brief.companyName],
        ['Project', brief.projectType],
        ['Problem', brief.problemStatement ? brief.problemStatement.slice(0, 80) + (brief.problemStatement.length > 80 ? '…' : '') : '—'],
        ['Solution', brief.solutionDescription ? brief.solutionDescription.slice(0, 80) + (brief.solutionDescription.length > 80 ? '…' : '') : '—'],
        ['Competitors', brief.competitors.length > 0 ? brief.competitors.map(c => c.name).join(', ') : '—'],
        ['Features', brief.features.length > 0 ? `${brief.features.length} defined` : '—'],
      ],
    },
    {
      label: 'Brand Audit',
      items: [
        ['Name meaning', brief.companyNameMeaning ? '✓ Captured' : '—'],
        ['Logo rationale', brief.logoRationaleChips.length > 0 ? brief.logoRationaleChips.slice(0, 3).join(' · ') : '—'],
        ['Visual language', brief.visualLanguageRationale ? '✓ Summarised' : '—'],
        ['Modernity', `${brief.visualLanguageSliders.modern}/5`],
        ['Trustworthy', `${brief.visualLanguageSliders.trustworthy}/5`],
        ['Boldness', `${brief.visualLanguageSliders.bold}/5`],
      ],
    },
    {
      label: 'Brand Direction',
      items: [
        ['Keywords', brief.keywords.length > 0 ? brief.keywords.slice(0, 5).join(' · ') : '—'],
        ['Messages', `${brief.brandMessages.length} approved`],
        ['Core values', brief.selectedValues.length > 0 ? brief.selectedValues.join(' + ') : '—'],
        ['Value 1 direction', brief.visualDirection.value1.shape ? `${brief.visualDirection.value1.shape} · ${brief.visualDirection.value1.color}` : '—'],
        ['Value 2 direction', brief.visualDirection.value2.shape ? `${brief.visualDirection.value2.shape} · ${brief.visualDirection.value2.color}` : '—'],
      ],
    },
    {
      label: 'Visual Preferences',
      items: [
        ['Reference brands', brief.referenceBrands.length > 0 ? brief.referenceBrands.map(b => b.name).join(', ') : '—'],
        ['Logo style', brief.logoStyle || (brief.logoOpenToRecommendations ? 'Open to recommendation' : '—')],
        ['Color approach', brief.colorPaletteApproach || '—'],
        ['Color likes', `${brief.colorSwatchRatings.filter(r => r.rating === 'like').length} colors liked`],
      ],
    },
  ];

  return (
    <Card title="Brief Summary" icon={FileText}>
      <div className="space-y-5">
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle2 size={16} className="text-green-600" />
          <p className="text-xs font-bold text-green-700">Brief complete — ready to share with Polar</p>
        </div>

        {sections.map(sec => (
          <div key={sec.label}>
            <p className="text-[10px] font-bold text-[#EC008C] uppercase tracking-widest mb-2">{sec.label}</p>
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 border border-gray-100">
              {sec.items.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between px-4 py-2.5 gap-3">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{label}</span>
                  <span className="text-[11px] font-medium text-[#010C83] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <PolarButton onClick={onDone} className="w-full h-12">
          Submit Brief to Polar <ArrowRight size={16} />
        </PolarButton>
      </div>
    </Card>
  );
}
