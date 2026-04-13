import { X } from 'lucide-react';

function getDomain(url: string): string {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', ''); }
  catch { return url; }
}

const GRADIENT_COLORS = [
  'from-blue-500 to-indigo-600', 'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600', 'from-cyan-500 to-sky-600',
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return GRADIENT_COLORS[h % GRADIENT_COLORS.length];
}

interface ScreenshotCardProps {
  name: string;
  url: string;
  meta?: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode;
}

export function ScreenshotCard({ name, url, meta, onRemove, onClick, active, children }: ScreenshotCardProps) {
  const domain = getDomain(url);
  const grad = hashColor(domain || name);
  const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${active ? 'border-[#EC008C]/30' : 'border-gray-100'}`}>
      {/* Header — gradient card */}
      <div
        className={`h-20 bg-gradient-to-br ${grad} relative flex items-center justify-center cursor-pointer`}
        onClick={onClick}
      >
        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            className="w-10 h-10 rounded-lg bg-white/20 p-1 shadow-md"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-black/10" />
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {/* Body */}
      <div className="px-4 py-3 bg-gray-50 cursor-pointer" onClick={onClick}>
        <p className="text-sm font-bold text-[#010C83]" style={{ fontFamily: 'var(--font-display)' }}>{name}</p>
        {url && <p className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>{domain}</p>}
        {meta}
      </div>
      {children && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
