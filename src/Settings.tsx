import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Key, Eye, EyeOff, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { STORAGE_KEY, getStoredApiKey } from './shared';

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getStoredApiKey());
  }, []);

  const save = () => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEY, apiKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const isEnvKey = !localStorage.getItem(STORAGE_KEY) && !!process.env.GEMINI_API_KEY;
  const hasKey = !!apiKey.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FFF0F8] to-[#FFE4F5] rounded-xl text-[#EC008C]">
              <Settings size={17} />
            </div>
            <div>
              <h2 className="font-bold text-[#010C83] text-sm tracking-tight">App Settings</h2>
              <p className="text-[11px] text-gray-400">Manage your API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {/* API Key section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="apiKey" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
              <Key size={10} /> Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold text-[#EC008C] hover:underline cursor-pointer"
            >
              Get a key <ExternalLink size={9} />
            </a>
          </div>

          {isEnvKey && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Currently using key from environment. Enter a key below to override it.
              </p>
            </div>
          )}

          <div className="relative">
            <input
              id="apiKey"
              type={show ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-mono text-gray-800 placeholder:text-gray-300 placeholder:font-sans focus:outline-none focus:border-[#EC008C]/40 focus:bg-white focus:ring-2 focus:ring-[#EC008C]/8 transition-all"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your key is stored only in your browser's local storage — it never leaves your device.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white'
                : hasKey
                ? 'bg-gradient-to-r from-[#EC008C] to-[#d4007e] text-white shadow-md shadow-[#EC008C]/15 hover:shadow-lg hover:shadow-[#EC008C]/25 hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasKey}
          >
            {saved ? <><Check size={15} /> Saved!</> : 'Save Key'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const hasKey = !!getStoredApiKey();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Settings"
        className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer ${
          hasKey
            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            : 'text-[#EC008C] bg-[#EC008C]/10 hover:bg-[#EC008C]/15 animate-pulse'
        }`}
      >
        <Settings size={15} />
        {!hasKey && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EC008C] rounded-full border border-white" />
        )}
      </button>

      <AnimatePresence>
        {open && <SettingsModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
