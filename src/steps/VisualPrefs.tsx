import { useState } from 'react';
import { Globe, ArrowRight, Plus, Check, CheckCircle2, FileText, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PolarButton, aiGen, extractJson } from '../shared';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { LogoStyleGrid } from '../components/LogoStyleGrid';
import { ColorStripPicker } from '../components/ColorStripPicker';
import type { BriefData } from '../types';

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(1,12,131,0.45)',
  fontFamily: 'var(--font-sans)',
};

const LIKE_OPTIONS = ['Color palette', 'Typography', 'Logo mark', 'Motion/animation', 'Photography', 'Illustration', 'Overall feel', 'Simplicity', 'Boldness', 'Modernity'];
const DISLIKE_OPTIONS = ['Too corporate', 'Too playful', 'Too minimal', 'Too complex', 'Color clash', 'Dated feel', 'Lacks warmth', 'Overly technical', 'Generic', 'Too loud'];

type RefBrand = BriefData['referenceBrands'][0];

// ── VisualReferences ──────────────────────────────────────────────────────────

type VisualRefDone = Pick<BriefData, 'referenceBrands' | 'logoStyle' | 'logoOpenToRecommendations' | 'colorPaletteRatings'>;

export function VisualReferences({ brief, onDone }: { brief: BriefData; onDone: (d: VisualRefDone) => void }) {
  // — reference brands —
  const [brands, setBrands] = useState<RefBrand[]>(brief.referenceBrands ?? []);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [active, setActive] = useState<number | null>(null);
  const [addingBrand, setAddingBrand] = useState(false);

  // — logo style —
  const [logoStyle, setLogoStyle] = useState(brief.logoStyle ?? '');
  const [openToRec, setOpenToRec] = useState(brief.logoOpenToRecommendations ?? false);

  // — color palettes —
  const [paletteRatings, setPaletteRatings] = useState(brief.colorPaletteRatings ?? []);

  // ── brand helpers ──
  const addBrand = async () => {
    if (!newName.trim()) return;
    const nb: RefBrand = { name: newName.trim(), url: newUrl.trim(), likes: [], dislikes: [] };
    const currentBrands = [...brands, nb];
    setBrands(currentBrands);
    setActive(currentBrands.length - 1);
    setNewName(''); setNewUrl('');
    
    if (newUrl.trim()) {
      setAddingBrand(true);
      try {
        const raw = await aiGen(`For brand "${newName.trim()}" (${newUrl.trim()}), suggest 3 visual elements typically praised. JSON array of short strings (max 4 words each).`, true);
        const suggestions = extractJson(raw) || [];
        setBrands(p => p.map((b, i) => i === p.length - 1 ? { ...b, likes: suggestions } : b));
      } catch { /* ignore */ } finally { setAddingBrand(false); }
    }
  };

  const togLike = (i: number, opt: string) =>
    setBrands(p => p.map((b, idx) => idx === i ? { ...b, likes: b.likes.includes(opt) ? b.likes.filter(x => x !== opt) : [...b.likes, opt] } : b));

  const togDislike = (i: number, opt: string) =>
    setBrands(p => p.map((b, idx) => idx === i ? { ...b, dislikes: b.dislikes.includes(opt) ? b.dislikes.filter(x => x !== opt) : [...b.dislikes, opt] } : b));

  const removeBrand = (i: number) => {
    setBrands(p => p.filter((_, idx) => idx !== i));
    if (active === i) setActive(null);
  };

  const handleDone = () => {
    onDone({
      referenceBrands: brands,
      logoStyle,
      logoOpenToRecommendations: openToRec,
      colorPaletteRatings: paletteRatings,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-12">
      <div>
        <p style={{ ...labelStyle, color: '#EC008C' }}>Visual Preferences</p>
        <h2 className="text-2xl font-black tracking-tight mt-1"
          style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Show us what you love
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          Reference brands, logo direction, and color vibes.
        </p>
      </div>

      {/* ── Reference brands ── */}
      <div className="bg-white rounded-2xl p-7 space-y-5" style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}>
        <p style={labelStyle}>Reference Brands</p>
        <p className="text-xs" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
          Add brands you admire visually. Tell us what you like and dislike.
        </p>

        {brands.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {brands.map((b, i) => (
              <ScreenshotCard
                key={i}
                name={b.name}
                url={b.url}
                onRemove={() => removeBrand(i)}
                onClick={() => setActive(active === i ? null : i)}
                active={active === i}
                meta={
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(1,12,131,0.35)', fontFamily: 'var(--font-sans)' }}>
                    {b.likes.length} likes · {b.dislikes.length} dislikes
                  </p>
                }>
                {active === i && (
                  <div className="space-y-3">
                    <div>
                      <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <ThumbsUp size={10} /> What do you like?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {LIKE_OPTIONS.map(o => (
                          <button
                            key={o}
                            onClick={() => togLike(i, o)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                            style={{
                              fontFamily: 'var(--font-sans)',
                              ...(b.likes.includes(o)
                                ? { background: 'rgba(16,185,129,0.1)', color: '#065f46', border: '1px solid rgba(16,185,129,0.25)' }
                                : { background: 'white', color: 'rgba(1,12,131,0.5)', border: '1px solid rgba(1,12,131,0.1)' }
                              ),
                            }}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <ThumbsDown size={10} /> What don't you like?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {DISLIKE_OPTIONS.map(o => (
                          <button
                            key={o}
                            onClick={() => togDislike(i, o)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                            style={{
                              fontFamily: 'var(--font-sans)',
                              ...(b.dislikes.includes(o)
                                ? { background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }
                                : { background: 'white', color: 'rgba(1,12,131,0.5)', border: '1px solid rgba(1,12,131,0.1)' }
                              ),
                            }}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ScreenshotCard>
            ))}
          </div>
        )}

        {/* Add brand form */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBrand()}
              placeholder="Brand name"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
              style={{
                background: 'rgba(1,12,131,0.03)',
                border: '1px solid rgba(1,12,131,0.12)',
                color: '#010C83',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBrand()}
              placeholder="URL (optional)"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
              style={{
                background: 'rgba(1,12,131,0.03)',
                border: '1px solid rgba(1,12,131,0.12)',
                color: '#010C83',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
          <button
            onClick={addBrand}
            disabled={!newName.trim() || addingBrand}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            style={{ background: 'rgba(1,12,131,0.05)', color: '#010C83', fontFamily: 'var(--font-sans)' }}>
            {addingBrand ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Add Brand
          </button>
        </div>
      </div>

      {/* ── Logo style ── */}
      <div className="bg-white rounded-2xl p-7 space-y-5" style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}>
        <p style={labelStyle}>Logo Style Direction</p>
        <LogoStyleGrid value={logoStyle} onChange={setLogoStyle} />

        <button
          onClick={() => setOpenToRec(o => !o)}
          className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer"
          style={{
            border: openToRec ? '2px solid #EC008C' : '2px solid rgba(1,12,131,0.08)',
            background: openToRec ? 'rgba(236,0,140,0.04)' : 'white',
          }}>
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: openToRec ? '#EC008C' : '#010C83', fontFamily: 'var(--font-sans)' }}>
              Open to Polar's recommendation
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
              Let our team propose the best direction based on your brief
            </p>
          </div>
          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: openToRec ? '#EC008C' : 'transparent', borderColor: openToRec ? '#EC008C' : 'rgba(1,12,131,0.2)' }}>
            {openToRec && <Check size={10} className="text-white" />}
          </div>
        </button>
      </div>

      {/* ── Color palettes ── */}
      <div className="bg-white rounded-2xl p-7 space-y-5" style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}>
        <p style={labelStyle}>Color Palette Preferences</p>
        <ColorStripPicker value={paletteRatings} onChange={setPaletteRatings} />
      </div>

      <PolarButton
        className="w-full h-11 text-sm"
        onClick={handleDone}>
        Save & Continue <ArrowRight size={15} />
      </PolarButton>
    </div>
  );
}

// ── SummaryReview ──────────────────────────────────────────────────────────────

export function SummaryReview({ brief, onDone }: { brief: BriefData; onDone: () => void }) {
  const likedMoods = brief.visualLanguageMood?.liked ?? [];
  const likedPalettes = brief.colorPaletteRatings?.filter(r => r.rating === 'like').map(r => r.paletteName) ?? [];

  const sections = [
    {
      label: 'Discovery',
      items: [
        ['Company', brief.companyName],
        ['Project', brief.projectType],
        ['Problem', brief.problemStatement ? brief.problemStatement.slice(0, 70) + (brief.problemStatement.length > 70 ? '…' : '') : '—'],
        ['Solution', brief.solutionDescription ? brief.solutionDescription.slice(0, 70) + (brief.solutionDescription.length > 70 ? '…' : '') : '—'],
        ['Competitors', brief.competitors.length > 0 ? brief.competitors.map(c => c.name).join(', ') : '—'],
        ['Features', brief.features.length > 0 ? `${brief.features.length} defined` : '—'],
      ],
    },
    {
      label: 'Brand Audit',
      items: [
        ['Name meaning', brief.companyNameMeaning ? '✓ Captured' : '—'],
        ['Logo intent', brief.logoRationaleChips.length > 0 ? brief.logoRationaleChips.slice(0, 3).join(' · ') : '—'],
        ['Visual mood', likedMoods.length > 0 ? `${likedMoods.length} images liked` : '—'],
      ],
    },
    {
      label: 'Brand Direction',
      items: [
        ['Keywords', brief.keywords.length > 0 ? brief.keywords.slice(0, 5).join(' · ') : '—'],
        ['Messages', brief.brandMessages.length > 0 ? `${brief.brandMessages.length} approved` : '—'],
        ['Core values', brief.selectedValues.length > 0 ? brief.selectedValues.join(' + ') : '—'],
        ['Value 1 mood', brief.visualDirection.value1.moodLiked.length > 0 ? `${brief.visualDirection.value1.moodLiked.length} liked` : '—'],
        ['Value 2 mood', brief.visualDirection.value2.moodLiked.length > 0 ? `${brief.visualDirection.value2.moodLiked.length} liked` : '—'],
      ],
    },
    {
      label: 'Visual Preferences',
      items: [
        ['Reference brands', brief.referenceBrands.length > 0 ? brief.referenceBrands.map(b => b.name).join(', ') : '—'],
        ['Logo style', brief.logoStyle || (brief.logoOpenToRecommendations ? 'Open to recommendation' : '—')],
        ['Color palettes liked', likedPalettes.length > 0 ? likedPalettes.join(', ') : '—'],
      ],
    },
  ];

  return (
    <div className="w-full space-y-10">
      <div>
        <p style={{ ...labelStyle, color: '#EC008C' }}>Summary</p>
        <h2 className="text-2xl font-black tracking-tight mt-1"
          style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Your brief is ready
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          Review everything before submitting to Polar.
        </p>
      </div>

      {/* Completion badge */}
      <div className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{ background: 'rgba(16,185,129,0.06)', boxShadow: '0 4px 24px rgba(16,185,129,0.08)' }}>
        <CheckCircle2 size={18} style={{ color: '#059669' }} />
        <p className="text-sm font-bold" style={{ color: '#065f46', fontFamily: 'var(--font-sans)' }}>
          Brief complete — ready to share with Polar
        </p>
      </div>

      {/* Sections */}
      {sections.map(sec => (
        <div key={sec.label} className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}>
          <p className="mb-4" style={{ ...labelStyle, color: '#EC008C' }}>{sec.label}</p>
          {sec.items.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between py-3 gap-4"
              style={{ borderBottom: '1px solid rgba(1,12,131,0.04)' }}>
              <span className="text-xs flex-shrink-0" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
                {label}
              </span>
              <span className="text-xs font-semibold text-right" style={{ color: '#010C83', fontFamily: 'var(--font-sans)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      ))}

      <PolarButton onClick={onDone} className="w-full h-12 text-sm">
        Submit Brief to Polar <ArrowRight size={15} />
      </PolarButton>

      <p className="text-center text-xs pb-4" style={{ color: 'rgba(1,12,131,0.3)', fontFamily: 'var(--font-sans)' }}>
        By submitting you agree to our terms of service.
      </p>
    </div>
  );
}
