import { useState, useRef } from 'react';
import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from "@google/genai";
import { Bot, Send, Upload, Sparkles, Loader2, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { getStoredApiKey } from './shared';

export const GeminiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      const contents: any = { parts: [{ text: message }] };
      if (imagePart) contents.parts.push(imagePart);

      const modelName = model === 'fast' ? 'gemini-3.1-flash-lite-preview' : 
                        model === 'general' ? 'gemini-3-flash-preview' : 'gemini-3.1-pro-preview';

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
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-polar-pink text-white">
            <h3 className="font-bold">Gemini Assistant</h3>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl ${m.role === 'user' ? 'bg-gray-100 ml-auto' : 'bg-polar-pink/10'}`}>
                <Markdown>{m.content}</Markdown>
              </div>
            ))}
            {isLoading && <Loader2 className="animate-spin text-polar-pink" />}
          </div>
          <div className="p-4 border-t flex gap-2">
            <select value={model} onChange={(e) => setModel(e.target.value as any)} className="text-xs border rounded-xl px-2">
              <option value="fast">Fast</option>
              <option value="general">General</option>
              <option value="complex">Complex</option>
            </select>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 text-sm"
              placeholder="Ask anything..."
            />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500"><Upload size={20}/></button>
            <button onClick={() => sendMessage(input)} className="p-2 bg-polar-pink text-white rounded-xl"><Send size={20}/></button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="p-4 bg-polar-pink text-white rounded-full shadow-lg">
          <Sparkles size={24} />
        </button>
      )}
    </div>
  );
};
