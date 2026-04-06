import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';

export const PK = '#EC008C';
export const PB = '#010C83';

export const btn = (variant: 'primary' | 'secondary' | 'ghost' = 'primary', extra = '') =>
  `px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm
   ${variant === 'primary' ? `bg-[${PK}] text-white hover:opacity-90 shadow-md` :
     variant === 'secondary' ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' :
     'text-gray-500 hover:text-gray-800 hover:bg-gray-100'} ${extra}`;

export function PolarButton({ children, onClick, variant = 'primary', className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; className?: string; disabled?: boolean;
}) {
  const base = 'px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-sm cursor-pointer select-none';
  const styles = {
    primary: `bg-gradient-to-r from-[#EC008C] to-[#d4007e] text-white hover:shadow-lg hover:shadow-[#EC008C]/25 hover:-translate-y-0.5 shadow-md shadow-[#EC008C]/15`,
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm',
    outline: 'border-2 border-[#EC008C] text-[#EC008C] hover:bg-[#EC008C]/5 hover:shadow-sm',
    ghost: 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${styles[variant]} ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, title, icon: Icon }: { children: React.ReactNode; title: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white border border-gray-100/80 rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] w-full ring-1 ring-black/[0.03]"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-[#FFF0F8] to-[#FFE4F5] rounded-xl text-[#EC008C] shadow-sm">
          <Icon size={17} />
        </div>
        <h3 className="font-bold text-[#010C83] text-sm tracking-[-0.01em]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ── API key resolution (localStorage > .env) ───────────────────────────────────
export const STORAGE_KEY = 'polar_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || process.env.GEMINI_API_KEY || '';
}

// ── Core AI helper ─────────────────────────────────────────────────────────────
function getAI() {
  return new GoogleGenAI({ apiKey: getStoredApiKey() });
}

// Basic text generation
export async function aiGen(prompt: string, json = false): Promise<string> {
  const ai = getAI();
  const config: Record<string, unknown> = json ? { responseMimeType: 'application/json' } : {};
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config,
  });
  return res.text || '';
}

// ── URL scanning via Gemini urlContext tool ────────────────────────────────────
// Gemini 2.0 Flash can fetch and read any public URL natively.
export async function aiScanUrl(url: string, prompt: string): Promise<string> {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [{ text: `${prompt}\n\nWebsite URL: ${url}` }],
    }],
    config: {
      tools: [{ urlContext: {} }],
    },
  });
  return res.text || '';
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
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: base64, mimeType: file.type } },
        { text: prompt },
      ],
    }],
  });
  return res.text || '';
}

// ── Document analysis (PDF, PPTX, DOCX) ───────────────────────────────────────
// Uploads a file to the Gemini Files API and sends it for analysis.
// The Files API handles large files (up to 2GB) and is needed for non-image formats.
export async function aiAnalyzeDocument(file: File, prompt: string): Promise<string> {
  const ai = getAI();

  // Upload to Files API
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
    throw new Error('File processing failed or timed out');
  }

  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [
        { fileData: { fileUri: fileState.uri!, mimeType: file.type } },
        { text: prompt },
      ],
    }],
  });
  return res.text || '';
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
