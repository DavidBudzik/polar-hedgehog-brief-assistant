import { useState, useRef } from 'react';
import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from "@google/genai";
import { Send, Upload, Sparkles, Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { getStoredApiKey } from './shared';

export const GeminiAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [model, setModel] = useState<'fast' | 'general' | 'complex'>('general');

  const sendMessage = async (message: string, imagePart?: any) => {
    const ai = new GoogleGenAI({ apiKey: getStoredApiKey() });
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');

    try {
      const parts: any[] = [{ text: message }];
      if (imagePart) parts.push(imagePart);
      const contents = [{ role: 'user', parts }];

      const modelName = model === 'fast'    ? 'gemini-flash-lite-latest'
                      : model === 'general' ? 'gemini-flash-latest'
                      :                        'gemini-pro-latest';

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          thinkingConfig: model === 'complex' ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          tools: [{ googleSearch: {} }]
        }
      });
      setMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
    } catch (error) {
      console.error(error);
      const detail = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: `__error__:${detail}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLast = () => {
    // Find the last user message and resend it, dropping any trailing error reply.
    const lastUserIdx = [...messages].map(m => m.role).lastIndexOf('user');
    if (lastUserIdx < 0) return;
    const lastUser = messages[lastUserIdx];
    setMessages(prev => prev.slice(0, lastUserIdx));
    sendMessage(lastUser.content);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      sendMessage('Analyze this image', { inlineData: { data: base64.split(',')[1], mimeType: file.type } });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-[56px] right-4 z-50 w-96 h-[520px] flex flex-col rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 8px 40px rgba(1,12,131,0.16)', border: '1px solid rgba(1,12,131,0.1)', background: 'white' }}>
      {/* Header */}
      <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: '#010C83', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236,0,140,0.25)' }}>
            <Sparkles size={14} style={{ color: '#EC008C' }} />
          </div>
          <div>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>AI Assistant</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}>Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'fast' | 'general' | 'complex')}
            className="text-[10px] rounded-lg px-2 py-1 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-sans)' }}
          >
            <option value="fast">Fast</option>
            <option value="general">General</option>
            <option value="complex">Complex</option>
          </select>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F7F8FF' }}>
        {messages.length === 0 && (
          <div className="text-center pt-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(236,0,140,0.1)' }}>
              <Sparkles size={18} style={{ color: '#EC008C' }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: '#010C83', fontFamily: 'var(--font-display)' }}>Ask me anything</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(1,12,131,0.45)', fontFamily: 'var(--font-sans)' }}>About your brand, brief, or strategy.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isError = m.role === 'model' && m.content.startsWith('__error__:');
          const isLastMessage = i === messages.length - 1;
          if (isError) {
            const detail = m.content.slice('__error__:'.length);
            return (
              <div key={i} className="mr-6 p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontFamily: 'var(--font-sans)',
                }}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#dc2626' }}>
                      Request failed
                    </p>
                    <p className="text-xs leading-relaxed break-words" style={{ color: 'rgba(1,12,131,0.75)' }}>
                      {detail}
                    </p>
                    {isLastMessage && (
                      <button onClick={retryLast}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold cursor-pointer hover:underline"
                        style={{ color: '#EC008C' }}>
                        <RefreshCw size={11} /> Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`p-3 rounded-xl text-sm ${m.role === 'user' ? 'ml-6' : 'mr-6'}`}
              style={{
                background: m.role === 'user' ? '#010C83' : 'white',
                color: m.role === 'user' ? 'white' : '#010C83',
                border: m.role === 'model' ? '1px solid rgba(1,12,131,0.08)' : 'none',
                fontFamily: 'var(--font-sans)',
              }}>
              <Markdown>{m.content}</Markdown>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 mr-6">
            <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid rgba(1,12,131,0.08)' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: '#EC008C' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 bg-white" style={{ borderTop: '1px solid rgba(1,12,131,0.07)' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && input.trim()) { e.preventDefault(); sendMessage(input); } }}
          className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
          placeholder="Ask anything..."
          style={{ background: 'rgba(1,12,131,0.04)', border: '1px solid rgba(1,12,131,0.1)', color: '#010C83', fontFamily: 'var(--font-sans)' }}
        />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl transition-colors" style={{ color: 'rgba(1,12,131,0.4)' }}>
          <Upload size={16} />
        </button>
        <button
          onClick={() => { if (input.trim()) sendMessage(input); }}
          className="p-2 rounded-xl transition-colors"
          style={{ background: input.trim() ? '#EC008C' : 'rgba(1,12,131,0.08)', color: input.trim() ? 'white' : 'rgba(1,12,131,0.3)' }}
        >
          <Send size={16} />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
      </div>
    </div>
  );
};
