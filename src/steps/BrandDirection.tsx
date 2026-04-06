import { useState, useEffect } from 'react';
import { Palette, MessageSquare, Star, Layers, RefreshCw, ThumbsUp, ThumbsDown, ArrowRight, Loader2, Check, Image, CheckCircle2 } from 'lucide-react';
import { PolarButton, Card, aiGen } from '../shared';
import type { BriefData } from '../types';

const KW_ICONS: Record<string, string> = { Innovative: '⚡', Trustworthy: '🛡', Bold: '🔥', Minimalist: '○', Playful: '😊', Professional: '💼', Elegant: '★', 'Tech-forward': '💻', 'Human-centric': '🫂', Sustainable: '🌿', Fast: '⚡', Secure: '🔒', Accessible: '♿', Premium: '👑', Disruptive: '⚡', Authentic: '✓', Empowering: '🚀', Precise: '🎯', Global: '🌍', Collaborative: '🤝' };

// ── Keywords ───────────────────────────────────────────────────────────────────
export function KeywordSelection({ brief, onDone }: { brief: BriefData; onDone: (kw: string[]) => void }) {
  const base = ['Innovative','Trustworthy','Bold','Minimalist','Playful','Professional','Disruptive','Elegant','Tech-forward','Human-centric','Sustainable','Fast','Secure','Accessible','Premium','Authentic','Empowering','Precise','Global','Collaborative'];
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [all, setAll] = useState(base);
  const [sel, setSel] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    aiGen(`For company "${brief.companyName}" solving "${brief.problemStatement}", recommend 5 brand keywords from: ${base.join(', ')}. JSON array.`, true)
      .then(r => { if (!cancelled) setAiRecs(JSON.parse(r)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    setLoading(true);
    return () => { cancelled = true; };
  }, []);

  const tog = (k: string) => { if (sel.includes(k)) setSel(p => p.filter(s => s !== k)); else if (sel.length < 7) setSel(p => [...p, k]); };
  const addCustom = () => { if (!custom || all.includes(custom)) return; setAll(p => [...p, custom]); if (sel.length < 7) setSel(p => [...p, custom]); setCustom(''); };

  return (
    <Card title="Brand Keyword Selection" icon={Palette}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Select 6–7 keywords (<span className="font-bold text-[#EC008C]">{sel.length}/7</span>)</p>
          {loading && <Loader2 size={14} className="animate-spin text-[#EC008C]" />}
        </div>
        <div className="flex flex-wrap gap-2">
          {all.map(k => (
            <button key={k} onClick={() => tog(k)}
              className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all border ${sel.includes(k) ? 'bg-[#EC008C] text-white border-[#EC008C] shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-[#EC008C]/30'}`}>
              {k}
              {aiRecs.includes(k) && !sel.includes(k) && <span className="absolute -top-1.5 -right-1 text-[9px] text-[#EC008C] font-black">✦</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder="Add custom keyword…"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#EC008C]/30" />
          <button onClick={addCustom} className="px-4 py-2 bg-[#010C83]/5 text-[#010C83] rounded-xl text-xs font-bold hover:bg-[#010C83]/10 transition-all">Add</button>
        </div>
        {aiRecs.length > 0 && <p className="text-[10px] text-gray-400"><span className="text-[#EC008C] font-black">✦</span> = AI recommended</p>}
        <PolarButton disabled={sel.length < 6} onClick={() => onDone(sel)} className="w-full">Lock Keywords <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}

// ── Brand Messages ─────────────────────────────────────────────────────────────
export function BrandMessages({ brief, onDone }: { brief: BriefData; onDone: (msgs: BriefData['brandMessages']) => void }) {
  type Msg = { keyword: string; message: string; approved: boolean; alts: string[]; rating: 'up' | 'down' | '' };
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    aiGen(`For brand "${brief.companyName}", write one brand manifesto message per keyword: ${brief.keywords.join(', ')}. Bold, specific. JSON array of {keyword, message}.`, true)
      .then(r => { if (!cancelled) setItems(JSON.parse(r).map((d: any) => ({ ...d, approved: false, alts: [], rating: '' }))); })
      .catch(() => { if (!cancelled) setItems(brief.keywords.map(k => ({ keyword: k, message: `We believe ${k.toLowerCase()} is the foundation of everything we build.`, approved: false, alts: [], rating: '' }))); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const getAlts = async (i: number) => {
    try {
      const raw = await aiGen(`Write 2 alternative brand messages for keyword "${items[i].keyword}". Different from: "${items[i].message}". JSON array of 2 strings.`, true);
      setItems(p => p.map((m, idx) => idx === i ? { ...m, alts: JSON.parse(raw) } : m));
    } catch { setItems(p => p.map((m, idx) => idx === i ? { ...m, alts: ['Alternative A', 'Alternative B'] } : m)); }
  };

  const rate = (i: number, r: 'up' | 'down') => setItems(p => p.map((m, idx) => idx === i ? { ...m, rating: r, approved: r === 'up' } : m));
  const useAlt = (i: number, alt: string) => setItems(p => p.map((m, idx) => idx === i ? { ...m, message: alt, alts: [] } : m));

  return (
    <Card title="Brand Messages" icon={MessageSquare}>
      <div className="space-y-4">
        {loading ? <div className="flex items-center gap-3 p-4 text-sm text-gray-400"><Loader2 size={18} className="animate-spin text-[#EC008C]" /> Generating messages…</div> : (
          <>
            {items.map((m, i) => (
              <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${m.approved ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC008C]">{KW_ICONS[m.keyword] || '•'} {m.keyword}</span>
                  {m.approved && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={10} /> Approved</span>}
                </div>
                <p className="text-sm text-gray-700 italic mb-3">"{m.message}"</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => rate(i, 'up')} className={`p-1.5 rounded-lg transition-all ${m.rating === 'up' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><ThumbsUp size={13} /></button>
                  <button onClick={() => rate(i, 'down')} className={`p-1.5 rounded-lg transition-all ${m.rating === 'down' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><ThumbsDown size={13} /></button>
                  <button onClick={() => getAlts(i)} className="ml-auto text-[11px] font-bold text-[#010C83] hover:underline flex items-center gap-1"><RefreshCw size={11} /> 2 alternatives</button>
                </div>
                {m.alts.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {m.alts.map((a, j) => <button key={j} onClick={() => useAlt(i, a)} className="w-full text-left p-2.5 rounded-lg bg-gray-50 text-xs text-gray-600 hover:bg-[#EC008C]/5 transition-colors border border-gray-100">"{a}"</button>)}
                  </div>
                )}
              </div>
            ))}
            <PolarButton disabled={items.filter(m => m.approved).length === 0} onClick={() => onDone(items.filter(m => m.approved))} className="w-full">
              Approve Messages ({items.filter(m => m.approved).length}) <ArrowRight size={16} />
            </PolarButton>
          </>
        )}
      </div>
    </Card>
  );
}

// ── Value Picker ───────────────────────────────────────────────────────────────
export function ValuePicker({ brief, onDone }: { brief: BriefData; onDone: (vals: string[]) => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const msgs = brief.brandMessages.length > 0 ? brief.brandMessages : brief.keywords.map(k => ({ keyword: k, message: `We believe in ${k.toLowerCase()}.`, approved: true }));

  const tog = (k: string) => { if (sel.includes(k)) setSel(p => p.filter(s => s !== k)); else if (sel.length < 2) setSel(p => [...p, k]); };

  return (
    <Card title="Pick 2 Core Values" icon={Star}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Pick the 2 values that will anchor your visual direction.</p>
        {msgs.slice(0, 8).map((m, i) => (
          <button key={i} onClick={() => tog(m.keyword)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${sel.includes(m.keyword) ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EC008C]">{m.keyword}</span>
              {sel.includes(m.keyword) && <div className="w-5 h-5 rounded-full bg-[#EC008C] flex items-center justify-center"><Check size={11} className="text-white" /></div>}
            </div>
            <p className="text-sm text-gray-600 italic mt-1">"{m.message}"</p>
          </button>
        ))}
        <p className="text-[10px] text-gray-400 text-center">{sel.length}/2 selected</p>
        <PolarButton disabled={sel.length !== 2} onClick={() => onDone(sel)} className="w-full">Set Core Values <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}

// ── Visual Direction ───────────────────────────────────────────────────────────
const VD_OPTIONS = {
  shape: [['Organic','Natural, fluid'],['Geometric','Precise, structured'],['Sharp','Angular, bold'],['Rounded','Soft, approachable'],['Abstract','Conceptual'],['Flowing','Continuous, smooth']],
  color: [['Vibrant','High-energy'],['Muted','Subtle, calm'],['Monochrome','Single-hue'],['Gradient','Dynamic, blending'],['Pastel','Light, airy'],['Neon','Electric, futuristic']],
  motion: [['Fluid','Graceful'],['Snappy','Quick, precise'],['Static','Still, grounded'],['Dynamic','Active'],['Bouncy','Playful'],['Smooth','Consistent']],
  style: [['Minimal','Clean, essential'],['Complex','Detailed, layered'],['Retro','Nostalgic'],['Futuristic','Tech, advanced'],['Hand-drawn','Personal'],['Corporate','Formal']],
};

export function VisualDirectionForm({ step, brief, onDone }: { step: 'v1' | 'v2'; brief: BriefData; onDone: (d: any) => void }) {
  const valueName = step === 'v1' ? (brief.selectedValues[0] || 'Value 1') : (brief.selectedValues[1] || 'Value 2');
  const [form, setForm] = useState({ shape: 'Organic', color: 'Vibrant', motion: 'Fluid', style: 'Minimal' });
  const [imgUploaded, setImgUploaded] = useState(false);

  return (
    <Card title={`Visual Direction: ${valueName}`} icon={Layers}>
      <div className="space-y-5">
        {Object.entries(VD_OPTIONS).map(([key, vals]) => (
          <div key={key}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{key}</p>
            <div className="grid grid-cols-3 gap-2">
              {vals.map(([name, desc]) => {
                const sel = form[key as keyof typeof form] === name;
                return (
                  <button key={name} onClick={() => setForm(p => ({ ...p, [key]: name }))}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${sel ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    {sel && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EC008C] rounded-full flex items-center justify-center"><Check size={9} className="text-white" /></div>}
                    <span className={`text-xs font-bold block mb-0.5 ${sel ? 'text-[#EC008C]' : 'text-[#010C83]'}`}>{name}</span>
                    <span className="text-[10px] text-gray-400">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div onClick={() => setImgUploaded(true)}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${imgUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-[#EC008C]/30 hover:bg-[#EC008C]/5'}`}>
          {imgUploaded ? <p className="text-xs text-green-600 font-bold flex items-center justify-center gap-2"><CheckCircle2 size={14} /> Image uploaded</p> : <><Image size={18} className="mx-auto mb-1 text-gray-300" /><p className="text-xs text-gray-400">Upload reference image (optional)</p></>}
        </div>
        {step === 'v2' && brief.visualDirection.value1.shape && (
          <div className="p-4 bg-[#FFF0F8]/50 rounded-xl border border-[#EC008C]/10">
            <p className="text-[10px] font-bold text-[#EC008C] uppercase tracking-widest mb-3">Combined Preview</p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              {(['value1', 'value2'] as const).map((v, vi) => {
                const d = brief.visualDirection[v];
                return (
                  <div key={v} className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-bold text-[#010C83] mb-1">{d.valueName || `Value ${vi + 1}`}</p>
                    {Object.entries(d).filter(([k]) => k !== 'valueName').map(([k, val]) => <p key={k} className="text-gray-400 capitalize">{k}: {val as string}</p>)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <PolarButton onClick={() => onDone(form)} className="w-full h-12">Confirm {valueName} Direction <ArrowRight size={16} /></PolarButton>
      </div>
    </Card>
  );
}
