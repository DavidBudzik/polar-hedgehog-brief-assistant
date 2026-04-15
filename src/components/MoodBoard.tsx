import { useState, useEffect } from 'react';
import { Loader2, Check, Landmark, Flame, Gem, Palette, Leaf, Shield, Minus, Wand2, Zap, Sun, Image } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export interface MoodState {
  liked: string[];
  skipped: string[];
}

type IconComponent = React.ComponentType<LucideProps>;

interface ImageTile {
  label: string;
  url: string | null;
  icon: IconComponent;
}

const UNSPLASH_QUERIES: Record<string, { icon: IconComponent; query: string }> = {
  timeless:    { icon: Landmark, query: 'classic architecture brand' },
  bold:        { icon: Flame,    query: 'bold graphic design' },
  premium:     { icon: Gem,      query: 'luxury product minimal' },
  playful:     { icon: Palette,  query: 'colorful playful illustration' },
  organic:     { icon: Leaf,     query: 'natural texture organic' },
  trustworthy: { icon: Shield,   query: 'professional clean corporate' },
  minimal:     { icon: Minus,    query: 'minimal white space design' },
  expressive:  { icon: Wand2,    query: 'expressive art colorful' },
  innovative:  { icon: Zap,      query: 'technology futuristic design' },
  warm:        { icon: Sun,      query: 'warm cozy lifestyle brand' },
};

const DEFAULT_CATEGORIES = Object.keys(UNSPLASH_QUERIES);

async function fetchUnsplashImage(query: string, key: string): Promise<string> {
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=1&client_id=${key}`
  );
  if (!res.ok) throw new Error('Unsplash error');
  const data = await res.json();
  return data[0]?.urls?.small ?? '';
}

export function MoodBoard({
  categories = DEFAULT_CATEGORIES,
  value,
  onChange,
}: {
  categories?: string[];
  value: MoodState;
  onChange: (next: MoodState) => void;
}) {
  const key = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY ?? '';
  const [tiles, setTiles] = useState<ImageTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results: ImageTile[] = await Promise.all(
        categories.map(async (cat) => {
          const meta = UNSPLASH_QUERIES[cat] ?? { icon: Image, query: cat };
          if (!key) return { label: cat, url: null, icon: meta.icon };
          try {
            const url = await fetchUnsplashImage(meta.query, key);
            return { label: cat, url: url || null, icon: meta.icon };
          } catch {
            return { label: cat, url: null, icon: meta.icon };
          }
        })
      );
      if (!cancelled) { setTiles(results); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [categories.join(','), key]);

  const getState = (label: string): 'liked' | 'skipped' | 'neutral' => {
    if (value.liked.includes(label)) return 'liked';
    if (value.skipped.includes(label)) return 'skipped';
    return 'neutral';
  };

  const cycle = (label: string) => {
    const cur = getState(label);
    if (cur === 'neutral') {
      onChange({ liked: [...value.liked, label], skipped: value.skipped.filter(x => x !== label) });
    } else if (cur === 'liked') {
      onChange({ liked: value.liked.filter(x => x !== label), skipped: [...value.skipped, label] });
    } else {
      onChange({ liked: value.liked.filter(x => x !== label), skipped: value.skipped.filter(x => x !== label) });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin text-[#EC008C]" /> Loading mood board…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>
        Tap to like (green) · tap again to skip (grey) · tap again to reset
      </p>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((tile) => {
          const state = getState(tile.label);
          return (
            <button
              key={tile.label}
              onClick={() => cycle(tile.label)}
              className={`relative rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                state === 'liked'
                  ? 'border-green-400 ring-2 ring-green-200'
                  : state === 'skipped'
                  ? 'border-gray-200 opacity-40'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              {tile.url ? (
                <img src={tile.url} alt={tile.label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <tile.icon size={24} className="text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-1.5">
                <span className="text-white text-[9px] font-bold capitalize leading-none" style={{ fontFamily: 'var(--font-sans)' }}>
                  {tile.label}
                </span>
              </div>
              {state === 'liked' && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center z-10">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
