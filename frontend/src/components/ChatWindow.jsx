import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User as UserIcon, Zap, DollarSign, Clock, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';

export default function ChatWindow({
  messages,
  onSendMessage,
  loading,
  routingMode,
  setRoutingMode,
  selectedModel,
  setSelectedModel
}) {
  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-950 p-4 md:p-6 relative overflow-hidden">
      {/* Strategy & Model Selection Control Bar */}
      <div className="glass-card p-3 md:px-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-4 border border-slate-800 shadow-lg">
        {/* Routing Mode Selector */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">Routing Mode:</span>
          <select
            value={routingMode}
            onChange={(e) => setRoutingMode(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-white rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="manual">Manual (Choose Provider & Model)</option>
            <option value="auto">Auto Intent Routing (Smart Classifier)</option>
            <option value="fastest">Fastest (Groq Low-Latency LPU Engine)</option>
            <option value="cost">Cost Optimized (Lowest Cost / Free Tier)</option>
            <option value="balanced">Balanced (Quality + Speed)</option>
          </select>
        </div>

        {/* Model Selection Dropdown (in Manual mode) */}
        {routingMode === 'manual' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-cyan-300 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:border-cyan-500 transition-colors"
            >
              <optgroup label="Groq LPU (Ultra Fast)">
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Groq)</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Groq)</option>
                <option value="gemma2-9b-it">Gemma 2 9B (Groq)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Groq)</option>
              </optgroup>
              <optgroup label="Google Gemini">
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </optgroup>
              <optgroup label="OpenAI (GPT)">
                <option value="gpt-4o-mini">GPT-4o-mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </optgroup>
              <optgroup label="OpenRouter (Free Tier Models)">
                <option value="deepseek/deepseek-r1:free">DeepSeek R1 (Free)</option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
              </optgroup>
              <optgroup label="Optional Providers">
                <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                <option value="llama3">Ollama Llama 3 (Local)</option>
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="my-auto py-12 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/10">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">AgentFlow Enterprise Gateway</h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Connect seamlessly to **Groq**, **Google Gemini**, **OpenAI GPT**, or **OpenRouter**. Requests are standard-normalized with real-time telemetry metrics.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Ultra-Fast Groq LPUs
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Zero-Cost Gemini/Free Tiers
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Automatic Failover Security
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      {isUser ? (
                        <>
                          <UserIcon className="w-3.5 h-3.5 text-white/80" />
                          <span className="font-semibold text-white/90">You</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold text-cyan-300">
                            {msg.provider_used ? msg.provider_used.toUpperCase() : 'AI GATEWAY'} • {msg.model_used || selectedModel}
                          </span>
                        </>
                      )}
                    </div>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy text"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Assistant Telemetry Footer */}
                  {!isUser && msg.latency_ms && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> {msg.latency_ms} ms
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> ${ (msg.cost || 0).toFixed(6) }
                      </span>
                      {msg.input_tokens !== undefined && (
                        <>
                          <span>•</span>
                          <span>In: {msg.input_tokens} / Out: {msg.output_tokens}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex w-full justify-start">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-xs p-4 max-w-[75%]">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-400">
                <Bot className="w-3.5 h-3.5" />
                <span>Routing to Optimal Provider...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Executing multi-LLM provider response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="glass-card p-1.5 pl-4 rounded-xl flex items-center gap-2 border border-slate-800 shadow-xl focus-within:border-indigo-500/80 transition-all">
          <input
            type="text"
            placeholder="Type your message or prompt here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none border-none py-2"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
