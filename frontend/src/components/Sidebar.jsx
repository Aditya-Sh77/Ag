import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, LogOut, Cpu, Activity, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Sidebar({
  conversations,
  activeConvId,
  onSelectConv,
  onNewChat
}) {
  const { user, logout } = useAuth();
  const [providerStatuses, setProviderStatuses] = useState(null);

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      const data = await api.getProviderStatus();
      setProviderStatuses(data);
    } catch (err) {
      console.error('[Sidebar] Failed to fetch provider statuses:', err);
    }
  };

  return (
    <aside className="w-72 h-screen bg-slate-950/95 border-r border-slate-800/80 flex flex-col p-4 shadow-xl z-20 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight leading-tight">AgentFlow AI</h2>
          <span className="text-xs text-slate-400 font-medium">Multi-LLM Gateway</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onNewChat}
        className="w-full py-2.5 px-4 mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-150 active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        <span>New Chat</span>
      </button>

      {/* Provider Status Summary Widget */}
      <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold tracking-wider text-[10px] uppercase">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Model Availability
          </span>
          <button onClick={fetchProviderStatus} className="text-cyan-400 hover:underline text-[10px]">Refresh</button>
        </div>

        <div className="space-y-1.5">
          {providerStatuses ? (
            Object.entries(providerStatuses).slice(0, 4).map(([key, info]) => (
              <div key={key} className="flex items-center justify-between py-0.5">
                <span className="text-slate-300 font-medium text-[11px] truncate max-w-[120px]">
                  {info.name.split(' ')[0]} ({info.default_model.split('/')[0]})
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  info.configured
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${info.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {info.configured ? 'Ready' : 'Fallback'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-[11px] py-1 animate-pulse">Checking status...</div>
          )}
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
        Recent Chats
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-xs text-slate-500 p-3 italic">No previous chats</div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConv(conv.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate">{conv.title}</span>
              </button>
            );
          })
        )}
      </div>

      {/* User Profile Footer */}
      <div className="pt-3 mt-auto border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] font-bold text-cyan-400 tracking-wide uppercase">{user?.role || 'USER'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
