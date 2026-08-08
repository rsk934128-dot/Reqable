import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Code,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TrafficItem } from '../types/reqable';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrafficItem: TrafficItem | null;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  selectedTrafficItem,
}) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; code?: string }[]
  >([
    {
      role: 'ai',
      text: 'Hello! I am Reqable AI Copilot, powered by Gemini. I can diagnose 500 server errors, audit security headers, generate Postman test scripts, or draft MITM rewrite rules from intercepted traffic.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trafficItem: selectedTrafficItem || {
            method: 'GET',
            url: 'https://httpbin.org/get',
            responseStatus: 200,
            durationMs: 120,
            requestHeaders: {},
            requestBody: '',
            responseHeaders: {},
            responseBody: '{"status": "ok"}',
          },
          question: userText,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.analysis || 'Analysis complete.',
        },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Error connecting to Gemini AI assistant.' },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg text-white">
            <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-xs">Reqable AI Copilot</h3>
            <p className="text-[10px] text-slate-400">Gemini 2.5 Flash Traffic Intelligence</p>
          </div>
        </div>

        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Traffic Context Banner */}
      {selectedTrafficItem && (
        <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
          <span className="truncate max-w-[240px]">
            Context: <strong className="text-sky-400">{selectedTrafficItem.method}</strong> {selectedTrafficItem.url}
          </span>
          <span className="text-emerald-400 font-bold">{selectedTrafficItem.responseStatus}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={`ai-msg-${idx}-${m.role}`}
            className={`p-3 rounded-xl border ${
              m.role === 'user'
                ? 'bg-sky-950/60 border-sky-800/80 text-sky-100 ml-4'
                : 'bg-slate-950 border-slate-800 text-slate-200 mr-4'
            }`}
          >
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              {m.role === 'user' ? 'You' : 'Reqable Copilot'}
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
          </div>
        ))}
        {isThinking && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span>Gemini is analyzing traffic payload...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Copilot about this request or security..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isThinking}
          className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
