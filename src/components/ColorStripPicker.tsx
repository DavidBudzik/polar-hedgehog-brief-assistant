import { COLOR_PALETTES } from '../constants/colorPalettes';
import type { BriefData } from '../types';

export type PaletteRating = BriefData['colorPaletteRatings'][0];

export function ColorStripPicker({
  value,
  onChange,
}: {
  value: PaletteRating[];
  onChange: (next: PaletteRating[]) => void;
}) {
  const ratings: PaletteRating[] =
    value.length === COLOR_PALETTES.length
      ? value
      : COLOR_PALETTES.map(p => ({ paletteName: p.name, swatches: p.swatches, rating: '' }));

  const cycle = (i: number) => {
    const cur = ratings[i].rating;
    const next: PaletteRating['rating'] = cur === '' ? 'like' : cur === 'like' ? 'skip' : '';
    onChange(ratings.map((r, idx) => idx === i ? { ...r, rating: next } : r));
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>
        Tap to like · tap again to skip · tap again to reset
      </p>
      {ratings.map((p, i) => (
        <button
          key={p.paletteName}
          onClick={() => cycle(i)}
          className={`w-full flex items-center gap-3 rounded-xl p-2 border-2 transition-all cursor-pointer ${
            p.rating === 'like' ? 'border-green-400 bg-green-50' :
            p.rating === 'skip' ? 'border-gray-100 opacity-40' :
            'border-gray-100 hover:border-gray-200'
          }`}
        >
          {/* 5-swatch strip */}
          <div className="flex flex-1 h-8 rounded-lg overflow-hidden shadow-sm">
            {p.swatches.map((hex, j) => (
              <div key={j} className="flex-1" style={{ background: hex }} />
            ))}
          </div>
          <div className="flex items-center justify-between w-36">
            <span className="text-xs font-bold text-[#010C83]" style={{ fontFamily: 'var(--font-display)' }}>{p.paletteName}</span>
            <span className="text-[10px] font-bold text-gray-400">
              {p.rating === 'like' ? '✓' : p.rating === 'skip' ? '–' : ''}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
