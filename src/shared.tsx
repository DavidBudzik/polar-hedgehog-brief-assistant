import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';

export const PK = '#EC008C';
export const PB = '#010C83';

export const btn = (variant: 'primary' | 'secondary' | 'ghost' = 'primary', extra = '') =>
  `px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm
   ${variant === 'primary' ? `bg-[${PK}] text-white hover:opacity-90 shadow-md` :
     variant === 'secondary' ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' :
     'text-gray-500 hover:text-gray-800 hover:bg-gray-100'} ${extra}`;

export function PolarButton({ children, onClick, variant = 'primary', className = '', disabled = false, style }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; className?: string; disabled?: boolean; style?: React.CSSProperties;
}) {
  const base = 'px-6 py-2.5 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-sm select-none';

  const inlineStyles: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    ...(variant === 'primary' ? {
      background: 'linear-gradient(135deg, #EC008C 0%, #d4007e 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(236,0,140,0.28)',
    } : variant === 'secondary' ? {
      background: 'white',
      border: '1px solid rgba(1,12,131,0.14)',
      color: 'rgba(1,12,131,0.75)',
    } : variant === 'outline' ? {
      border: '1.5px solid #EC008C',
      color: '#EC008C',
      background: 'transparent',
    } : {
      color: 'rgba(1,12,131,0.5)',
      background: 'transparent',
    }),
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variant === 'primary' ? 'hover:-translate-y-px' : variant === 'secondary' ? 'hover:bg-gray-50' : variant === 'ghost' ? 'hover:bg-[rgba(1,12,131,0.05)]' : ''} ${disabled ? 'pointer-events-none' : ''} ${className}`}
      style={inlineStyles}
    >
      {children}
    </button>
  );
}

export function Card({ children, title, icon: _Icon }: { children: React.ReactNode; title: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full bg-white rounded-2xl p-8"
      style={{ boxShadow: '0 8px 48px rgba(25,28,33,0.07), 0 2px 12px rgba(1,12,131,0.04)' }}
    >
      {title && (
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-6" style={{ color: '#EC008C', fontFamily: 'var(--font-sans)' }}>
          {title}
        </p>
      )}
      {children}
    </motion.div>
  );
}

// ── API key resolution (localStorage > .env) ───────────────────────────────────
export const STORAGE_KEY = 'polar_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || 
         import.meta.env.VITE_GEMINI_API_KEY || 
         (window as any).process?.env?.GEMINI_API_KEY || 
         '';
}

// ── Core AI helper ─────────────────────────────────────────────────────────────
let globalModelOverride: string | null = null;

function getAI() {
  return new GoogleGenAI({ apiKey: getStoredApiKey() });
}

export function extractJson(text: string): any {
  // 1. Try raw text first (handles clean JSON mode responses — objects and arrays)
  try { return JSON.parse(text.trim()); } catch {}
  // 2. Try extracting a JSON array (e.g. AI wraps in markdown fence or prose)
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
  // 3. Try extracting a JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
  console.warn('[extractJson] failed to parse:', text.slice(0, 100));
  return null;
}

// Basic text generation
export async function aiGen(prompt: string, json = false): Promise<string> {
  const ai = getAI();
  const config: Record<string, unknown> = json ? { responseMimeType: 'application/json' } : {};
  const model = globalModelOverride || 'gemini-2.5-flash';
  
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config,
    });
    return res.text || '';
  } catch (err: any) {
    // If 429 or 404, try to downgrade to older/stable models
    if ((err.status === 429 || err.status === 404)) {
      if (!globalModelOverride || globalModelOverride === 'gemini-2.5-flash') {
        console.warn(`[aiGen] falling back from ${model} to gemini-2.0-flash`);
        globalModelOverride = 'gemini-2.0-flash';
        return aiGen(prompt, json);
      } else if (globalModelOverride === 'gemini-2.0-flash') {
        console.warn(`[aiGen] falling back from ${model} to gemini-flash-lite-latest`);
        globalModelOverride = 'gemini-flash-lite-latest';
        return aiGen(prompt, json);
      }
    }
    throw err;
  }
}

// ── URL scanning via Gemini Native Browsing ──────────────────────────────────
export async function aiScanUrl(url: string, prompt: string, json = false): Promise<string> {
  const ai = getAI();
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const model = globalModelOverride || 'gemini-2.5-flash';
  const config: Record<string, unknown> = json ? { responseMimeType: 'application/json' } : {};
  
  console.log('[aiScanUrl] scanning:', normalizedUrl, 'via', model);
  
  try {
    const finalPrompt = `Visit the website: ${normalizedUrl}\n\nTask: ${prompt}`;
    
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      config: {
        ...config,
        tools: [{ googleSearch: {} }]
      }
    });
    
    return res.text?.trim() || '';
  } catch (err: any) {
    if ((err.status === 429 || err.status === 404)) {
      if (!globalModelOverride || globalModelOverride === 'gemini-2.5-flash') {
        globalModelOverride = 'gemini-2.0-flash';
        return aiScanUrl(url, prompt, json);
      } else if (globalModelOverride === 'gemini-2.0-flash') {
        globalModelOverride = 'gemini-flash-lite-latest';
        return aiScanUrl(url, prompt, json);
      }
    }
    console.error('[aiScanUrl] failed:', err);
    return aiGen(`Based on the website ${normalizedUrl}, ${prompt}`, json);
  }
}
// ── Image analysis (logo, brand assets) ───────────────────────────────────────
// Converts a File to base64 and sends it as inline data to Gemini vision.
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:xxx;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function aiAnalyzeImage(file: File, prompt: string): Promise<string> {
  const ai = getAI();
  const base64 = await fileToBase64(file);
  const model = globalModelOverride || 'gemini-2.5-flash';
  
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType: file.type } },
          { text: prompt },
        ],
      }],
    });
    return res.text || '';
  } catch (err: any) {
    if ((err.status === 429 || err.status === 404)) {
      if (!globalModelOverride || globalModelOverride === 'gemini-2.5-flash') {
        globalModelOverride = 'gemini-2.0-flash';
        return aiAnalyzeImage(file, prompt);
      } else if (globalModelOverride === 'gemini-2.0-flash') {
        globalModelOverride = 'gemini-flash-lite-latest';
        return aiAnalyzeImage(file, prompt);
      }
    }
    throw err;
  }
}

// ── Document analysis (PDF, PPTX, DOCX) ───────────────────────────────────────
// Uploads a file to the Gemini Files API and sends it for analysis.
// The Files API handles large files (up to 2GB) and is needed for non-image formats.
export async function aiAnalyzeDocument(file: File, prompt: string): Promise<string> {
  const ai = getAI();

  // Upload to Files API
  // NOTE: Direct browser upload to Files API often fails due to CORS. 
  // If this fails, consider a server-side proxy or using smaller files via inlineData if possible.
  const uploadedFile = await ai.files.upload({
    file,
    config: { mimeType: file.type, displayName: file.name },
  });

  // Poll until file is ready (ACTIVE state)
  let fileState = uploadedFile;
  let attempts = 0;
  while (fileState.state === 'PROCESSING' && attempts < 20) {
    await new Promise(r => setTimeout(r, 1500));
    fileState = await ai.files.get({ name: fileState.name! });
    attempts++;
  }

  if (fileState.state !== 'ACTIVE') {
    throw new Error(
      `File processing did not complete (state: ${fileState.state ?? 'unknown'} after ${attempts} polls of ${file.name}).`
    );
  }

  const model = globalModelOverride || 'gemini-2.5-flash';
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { fileData: { fileUri: fileState.uri!, mimeType: file.type } },
          { text: prompt },
        ],
      }],
    });
    return res.text || '';
  } catch (err: any) {
    if ((err.status === 429 || err.status === 404)) {
      if (!globalModelOverride || globalModelOverride === 'gemini-2.5-flash') {
        globalModelOverride = 'gemini-2.0-flash';
        return aiAnalyzeDocument(file, prompt);
      } else if (globalModelOverride === 'gemini-2.0-flash') {
        globalModelOverride = 'gemini-flash-lite-latest';
        return aiAnalyzeDocument(file, prompt);
      }
    }
    throw err;
  }
}

// ── Smart file router ──────────────────────────────────────────────────────────
// Automatically picks the right analysis path based on file type.
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function aiAnalyzeFile(file: File, prompt: string): Promise<string> {
  if (IMAGE_TYPES.includes(file.type)) {
    return aiAnalyzeImage(file, prompt);
  }
  return aiAnalyzeDocument(file, prompt);
}
