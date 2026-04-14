import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PolarButton, aiGen, extractJson } from '../shared';
import { MoodBoard } from '../components/MoodBoard';
import { ErrorBanner } from '../ui/useAIError';
import type { BriefData } from '../types';

const BASE_KEYWORDS = [
  'Innovative', 'Trustworthy', 'Bold', 'Minimalist', 'Playful', 'Professional',
  'Disruptive', 'Elegant', 'Tech-forward', 'Human-centric', 'Sustainable',
  'Fast', 'Secure', 'Accessible', 'Premium', 'Authentic', 'Empowering',
  'Precise', 'Global', 'Collaborative',
];

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(1,12,131,0.45)',
  fontFamily: 'var(--font-sans)',
};

// ── BrandVoice ────────────────────────────────────────────────────────────────

type BrandVoiceDone = Pick<BriefData, 'keywords' | 'brandMessages'>;

export function BrandVoice({ brief, onDone }: { brief: BriefData; onDone: (d: BrandVoiceDone) => void }) {
  const [all, setAll] = useState(BASE_KEYWORDS);
  const [sel, setSel] = useState<string[]>(brief.keywords.length ? brief.keywords : []);
  const [custom, setCustom] = useState('');
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // messages state
  type Msg = { keyword: string; message: string; approved: boolean; alts: string[]; rating: 'up' | 'down' | '' };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [generatingMsgs, setGeneratingMsgs] = useState(false);
  const [phase, setPhase] = useState<'keywords' | 'messages'>('keywords');
  const [aiError, setAiError] = useState<string | null>(null);

  // ── keyword helpers ──
  useEffect(() => {
    if (!brief.problemStatement) return;
    setLoadingRecs(true);
    aiGen(
      `For company "${brief.companyName}" solving "${brief.problemStatement}", recommend 5 brand keywords from: ${BASE_KEYWORDS.join(', ')}. Return a JSON array of 5 strings.`,
      true
    )
      .then(r => setAiRecs(extractJson(r) || []))
      .catch(e => setAiError(`Couldn't load keyword recommendations: ${e instanceof Error ? e.message : String(e)}`))
      .finally(() => setLoadingRecs(false));
  }, []);

  const tog = (k: string) => {
    if (sel.includes(k)) setSel(p => p.filter(s => s !== k));
    else if (sel.length < 7) setSel(p => [...p, k]);
  };

  const addCustom = () => {
    if (!custom || all.includes(custom)) return;
    setAll(p => [...p, custom]);
    if (sel.length < 7) setSel(p => [...p, custom]);
    setCustom('');
  };

  // ── message helpers ──
  const generateMessages = async () => {
    setGeneratingMsgs(true);
    setAiError(null);
    setPhase('messages');
    try {
      const raw = await aiGen(
        `For brand "${brief.companyName}", write one punchy brand manifesto message per keyword: ${sel.join(', ')}. Bold and specific. Return a JSON array of objects: {keyword, message}.`,
        true
      );
      const parsed = extractJson(raw) || [];
      setMessages(parsed.map((d: { keyword: string; message: string }) => ({
        ...d, approved: false, alts: [], rating: '' as const,
      })));
    } catch (e) {
      setAiError(`Couldn't generate messages: ${e instanceof Error ? e.message : String(e)}. Showing placeholders you can edit.`);
      setMessages(sel.map(k => ({ keyword: k, message: `We believe ${k.toLowerCase()} is the foundation of everything we build.`, approved: false, alts: [], rating: '' as const })));
    } finally {
      setGeneratingMsgs(false);
    }
  };

  const getAlts = async (i: number) => {
    setAiError(null);
    try {
      const raw = await aiGen(
        `Write 2 alternative brand messages for keyword "${messages[i].keyword}". Different from: "${messages[i].message}". JSON array of 2 strings.`,
        true
      );
      setMessages(p => p.map((m, idx) => idx === i ? { ...m, alts: extractJson(raw) || [] } : m));
    } catch (e) {
      setAiError(`Couldn't generate alternatives: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const rateMsg = (i: number, r: 'up' | 'down') =>
    setMessages(p => p.map((m, idx) => idx === i ? { ...m, rating: r, approved: r === 'up' } : m));

  const useAlt = (i: number, alt: string) =>
    setMessages(p => p.map((m, idx) => idx === i ? { ...m, message: alt, alts: [] } : m));

  const handleDone = () => {
    onDone({
      keywords: sel,
      brandMessages: messages.filter(m => m.approved),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <p style={{ ...labelStyle, color: '#EC008C' }}>Brand Voice</p>
        <h2 className="text-2xl font-black tracking-tight mt-1"
          style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          Define your keywords
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          Pick 6–7 brand keywords, then approve messages.
        </p>
      </div>

      {aiError && (
        <ErrorBanner
          message={aiError}
          onRetry={phase === 'messages' ? generateMessages : undefined}
          onDismiss={() => setAiError(null)}
        />
      )}

      {/* Keywords panel */}
      <div className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
        <div className="flex items-center justify-between">
          <p style={labelStyle}>
            Keywords{' '}
            <span style={{ ...labelStyle, color: '#EC008C', letterSpacing: 0 }}>
              {sel.length}/7
            </span>
          </p>
          {loadingRecs && <Loader2 size={13} className="animate-spin" style={{ color: '#EC008C' }} />}
        </div>

        <div className="flex flex-wrap gap-2">
          {all.map(k => {
            const selected = sel.includes(k);
            const recommended = aiRecs.includes(k) && !selected;
            return (
              <button
                key={k}
                onClick={() => tog(k)}
                className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  ...(selected
                    ? { background: 'linear-gradient(135deg, #EC008C, #d4007e)', color: 'white', boxShadow: '0 2px 8px rgba(236,0,140,0.25)' }
                    : { background: 'white', color: 'rgba(1,12,131,0.55)', border: '1px solid rgba(1,12,131,0.12)' }
                  ),
                }}>
                {k}
                {recommended && (
                  <span className="absolute -top-1.5 -right-1 text-[9px] font-black" style={{ color: '#EC008C' }}>✦</span>
                )}
              </button>
            );
          })}
        </div>

        {aiRecs.length > 0 && (
          <p className="text-[10px]" style={{ color: 'rgba(1,12,131,0.35)', fontFamily: 'var(--font-sans)' }}>
            <span style={{ color: '#EC008C' }}>✦</span> AI recommended
          </p>
        )}

        <div className="flex gap-2">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Add custom keyword…"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
            style={{
              background: 'rgba(1,12,131,0.03)',
              border: '1px solid rgba(1,12,131,0.12)',
              color: '#010C83',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={addCustom}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: 'rgba(1,12,131,0.05)', color: '#010C83', fontFamily: 'var(--font-sans)' }}>
            Add
          </button>
        </div>

        {phase === 'keywords' && (
          <PolarButton
            disabled={sel.length < 6}
            onClick={generateMessages}
            className="w-full h-10 text-sm">
            Generate Messages <ArrowRight size={14} />
          </PolarButton>
        )}
      </div>

      {/* Messages panel */}
      {phase === 'messages' && (
        <div className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
          <p style={labelStyle}>Brand messages — approve the ones you like</p>

          {generatingMsgs ? (
            <div className="flex items-center gap-2 py-4 text-sm" style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
              <Loader2 size={15} className="animate-spin" /> Generating messages…
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className="rounded-2xl p-4 transition-all"
                  style={{
                    border: m.approved ? '2px solid rgba(16,185,129,0.3)' : '2px solid rgba(1,12,131,0.06)',
                    background: m.approved ? 'rgba(16,185,129,0.04)' : 'white',
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
                      {m.keyword}
                    </span>
                    {m.approved && (
                      <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#065f46', fontFamily: 'var(--font-sans)' }}>
                        <Check size={10} /> Approved
                      </span>
                    )}
                  </div>
                  <p className="text-sm italic leading-relaxed mb-3" style={{ color: '#374151', fontFamily: 'var(--font-sans)' }}>
                    "{m.message}"
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rateMsg(i, 'up')}
                      className="p-1.5 rounded-lg transition-all cursor-pointer"
                      style={{
                        background: m.rating === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)',
                        color: m.rating === 'up' ? '#065f46' : 'rgba(1,12,131,0.35)',
                      }}>
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      onClick={() => rateMsg(i, 'down')}
                      className="p-1.5 rounded-lg transition-all cursor-pointer"
                      style={{
                        background: m.rating === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)',
                        color: m.rating === 'down' ? '#dc2626' : 'rgba(1,12,131,0.35)',
                      }}>
                      <ThumbsDown size={13} />
                    </button>
                    <button
                      onClick={() => getAlts(i)}
                      className="ml-auto flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                      style={{ color: '#010C83', fontFamily: 'var(--font-sans)' }}>
                      <RefreshCw size={11} /> 2 alternatives
                    </button>
                  </div>
                  {m.alts.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {m.alts.map((a, j) => (
                        <button
                          key={j}
                          onClick={() => useAlt(i, a)}
                          className="w-full text-left rounded-lg px-3 py-2.5 text-xs transition-all cursor-pointer"
                          style={{
                            background: 'rgba(1,12,131,0.03)',
                            border: '1px solid rgba(1,12,131,0.08)',
                            color: '#374151',
                            fontFamily: 'var(--font-sans)',
                          }}>
                          "{a}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <PolarButton
                disabled={messages.filter(m => m.approved).length === 0}
                onClick={handleDone}
                className="w-full h-11 text-sm">
                Approve Messages ({messages.filter(m => m.approved).length}) <ArrowRight size={14} />
              </PolarButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── BrandValuesDirection ──────────────────────────────────────────────────────

type ValuesDirectionDone = Pick<BriefData, 'selectedValues' | 'visualDirection'>;

export function BrandValuesDirection({ brief, onDone }: { brief: BriefData; onDone: (d: ValuesDirectionDone) => void }) {
  const keywords = brief.keywords.length ? brief.keywords : BASE_KEYWORDS.slice(0, 8);
  const msgs = brief.brandMessages;

  const [selVals, setSelVals] = useState<string[]>(brief.selectedValues.length ? brief.selectedValues : []);
  const [phase, setPhase] = useState<'pick' | 'mood1' | 'mood2'>('pick');
  const [mood1, setMood1] = useState<BriefData['visualLanguageMood']>(
    brief.visualDirection.value1.moodLiked.length
      ? { liked: brief.visualDirection.value1.moodLiked, skipped: brief.visualDirection.value1.moodSkipped }
      : { liked: [], skipped: [] }
  );
  const [mood2, setMood2] = useState<BriefData['visualLanguageMood']>(
    brief.visualDirection.value2.moodLiked.length
      ? { liked: brief.visualDirection.value2.moodLiked, skipped: brief.visualDirection.value2.moodSkipped }
      : { liked: [], skipped: [] }
  );

  const togVal = (k: string) => {
    if (selVals.includes(k)) setSelVals(p => p.filter(s => s !== k));
    else if (selVals.length < 2) setSelVals(p => [...p, k]);
  };

  const handleDone = () => {
    onDone({
      selectedValues: selVals,
      visualDirection: {
        value1: { valueName: selVals[0] || '', moodLiked: mood1.liked, moodSkipped: mood1.skipped },
        value2: { valueName: selVals[1] || '', moodLiked: mood2.liked, moodSkipped: mood2.skipped },
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <p style={{ ...labelStyle, color: '#EC008C' }}>Brand Values</p>
        <h2 className="text-2xl font-black tracking-tight mt-1"
          style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>
          {phase === 'pick' ? 'Pick 2 core values' : phase === 'mood1' ? `Visual direction: ${selVals[0]}` : `Visual direction: ${selVals[1]}`}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>
          {phase === 'pick'
            ? 'These will anchor your visual direction.'
            : 'Like images that feel right for this value.'}
        </p>
      </div>

      {/* Phase: pick values */}
      {phase === 'pick' && (
        <div className="bg-white rounded-2xl p-6 space-y-3"
          style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
          {keywords.slice(0, 10).map(k => {
            const msg = msgs.find(m => m.keyword === k);
            const selected = selVals.includes(k);
            return (
              <button
                key={k}
                onClick={() => togVal(k)}
                className="w-full text-left rounded-2xl p-4 transition-all cursor-pointer"
                style={{
                  border: selected ? '2px solid #EC008C' : '2px solid rgba(1,12,131,0.06)',
                  background: selected ? 'rgba(236,0,140,0.04)' : 'white',
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
                    {k}
                  </span>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#EC008C' }}>
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </div>
                {msg && (
                  <p className="text-xs italic mt-1.5 leading-relaxed" style={{ color: 'rgba(55,65,81,0.75)', fontFamily: 'var(--font-sans)' }}>
                    "{msg.message}"
                  </p>
                )}
              </button>
            );
          })}
          <p className="text-center text-xs" style={{ color: 'rgba(1,12,131,0.35)', fontFamily: 'var(--font-sans)' }}>
            {selVals.length}/2 selected
          </p>
          <PolarButton
            disabled={selVals.length !== 2}
            onClick={() => setPhase('mood1')}
            className="w-full h-11 text-sm">
            Set Visual Direction <ArrowRight size={14} />
          </PolarButton>
        </div>
      )}

      {/* Phase: mood for value 1 */}
      {phase === 'mood1' && (
        <div className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
            Like images that feel right for "{selVals[0]}" · skip ones that don't
          </p>
          <MoodBoard
            categories={[selVals[0].toLowerCase(), 'brand', 'design', 'identity']}
            value={mood1}
            onChange={setMood1}
          />
          <PolarButton
            onClick={() => setPhase('mood2')}
            className="w-full h-11 text-sm">
            Next: {selVals[1]} <ArrowRight size={14} />
          </PolarButton>
        </div>
      )}

      {/* Phase: mood for value 2 */}
      {phase === 'mood2' && (
        <div className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: '1px solid rgba(1,12,131,0.08)', boxShadow: '0 4px 24px rgba(1,12,131,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(1,12,131,0.4)', fontFamily: 'var(--font-sans)' }}>
            Like images that feel right for "{selVals[1]}" · skip ones that don't
          </p>
          <MoodBoard
            categories={[selVals[1].toLowerCase(), 'brand', 'design', 'identity']}
            value={mood2}
            onChange={setMood2}
          />
          <PolarButton
            onClick={handleDone}
            className="w-full h-11 text-sm">
            Save & Continue <ArrowRight size={14} />
          </PolarButton>
        </div>
      )}
    </div>
  );
}
