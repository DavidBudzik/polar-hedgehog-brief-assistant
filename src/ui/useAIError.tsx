import { useState, useCallback } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

// Small hook to centralize AI-call error surfacing for step components.
// Wrap any async AI call — on failure the banner can show the real message
// and offer a retry, instead of silently falling back to template text.
export function useAIError() {
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      setError(null);
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, []);

  const clear = useCallback(() => setError(null), []);

  return { error, setError, clear, wrap };
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="flex items-start gap-2.5 p-3 rounded-xl"
      style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        fontFamily: 'var(--font-sans)',
      }}
      role="alert"
    >
      <AlertCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#dc2626' }}>
          AI request failed
        </p>
        <p className="text-xs leading-relaxed break-words" style={{ color: 'rgba(1,12,131,0.75)' }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold cursor-pointer hover:underline"
            style={{ color: '#EC008C' }}
          >
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'rgba(1,12,131,0.4)' }}
          aria-label="Dismiss error"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
