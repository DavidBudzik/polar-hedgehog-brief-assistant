import { Check } from 'lucide-react';

const LOGO_STYLES = [
  { label: 'Wordmark',     preview: '𝗔𝗯𝗰',   desc: 'Pure typography' },
  { label: 'Lettermark',  preview: 'AB',     desc: 'Monogram / initials' },
  { label: 'Pictorial',   preview: '⬟',      desc: 'Symbol / icon only' },
  { label: 'Abstract',    preview: '◈',      desc: 'Non-literal mark' },
  { label: 'Mascot',      preview: '🦊',     desc: 'Character-based' },
  { label: 'Emblem',      preview: '⬡',      desc: 'Badge / seal style' },
  { label: 'Combination', preview: '◆ Abc',  desc: 'Icon + text' },
  { label: 'Geometric',   preview: '△▷',     desc: 'Shape-driven' },
];

export function LogoStyleGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (label: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {LOGO_STYLES.map(({ label, preview, desc }) => {
        const sel = value === label;
        return (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={`relative p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              sel ? 'border-[#EC008C] bg-[#EC008C]/5' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {sel && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-[#EC008C] rounded-full flex items-center justify-center">
                <Check size={9} className="text-white" />
              </div>
            )}
            <div className="text-xl font-mono text-gray-400 mb-2">{preview}</div>
            <p className={`text-xs font-bold ${sel ? 'text-[#EC008C]' : 'text-[#010C83]'}`} style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>{desc}</p>
          </button>
        );
      })}
    </div>
  );
}
