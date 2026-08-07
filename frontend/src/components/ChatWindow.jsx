import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Zap, DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';

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

  return (
    <div style={styles.container}>
      {/* Control Bar */}
      <div style={styles.controlBar} className="glass-card">
        <div style={styles.controlGroup}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span style={styles.controlLabel}>Routing Strategy:</span>
          <select
            value={routingMode}
            onChange={(e) => setRoutingMode(e.target.value)}
            style={styles.selectInput}
          >
            <option value="manual">Manual (Specified Model)</option>
            <option value="auto">Automatic (Intent Intent Classifier)</option>
            <option value="cost">Cost Optimized (Lowest $)</option>
            <option value="fastest">Fastest (Lowest Latency)</option>
            <option value="balanced">Balanced (Quality + Speed + Cost)</option>
          </select>
        </div>

        {routingMode === 'manual' && (
          <div style={styles.controlGroup}>
            <span style={styles.controlLabel}>Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={styles.selectInput}
            >
              <option value="gpt-4o-mini">OpenAI gpt-4o-mini</option>
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
              <option value="llama3">Ollama Llama 3 (Local)</option>
            </select>
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.welcomeHero}>
            <div style={styles.heroIcon}>
              <Bot size={36} color="#6366f1" />
            </div>
            <h1 style={styles.heroTitle}>Enterprise AI Gateway Control Plane</h1>
            <p style={styles.heroSub}>
              Select a routing strategy or ask any question. Requests will be standard-normalized and routed across providers with real-time telemetry tracking.
            </p>
            <div style={styles.badgeContainer}>
              <div style={styles.featureBadge}>
                <Zap size={14} color="#06b6d4" /> <span style={{ marginLeft: 6 }}>Failover Resiliency</span>
              </div>
              <div style={styles.featureBadge}>
                <DollarSign size={14} color="#10b981" /> <span style={{ marginLeft: 6 }}>Token Cost Optimization</span>
              </div>
              <div style={styles.featureBadge}>
                <Clock size={14} color="#a855f7" /> <span style={{ marginLeft: 6 }}>Low Latency Tracking</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.msgWrapper,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.msgBubble,
                  ...(msg.role === 'user' ? styles.userBubble : styles.botBubble),
                }}
              >
                <div style={styles.msgHeader}>
                  {msg.role === 'user' ? (
                    <>
                      <span style={styles.msgRole}>You</span>
                      <UserIcon size={14} color="#fff" />
                    </>
                  ) : (
                    <>
                      <Bot size={14} color="var(--accent-secondary)" />
                      <span style={styles.msgRole}>AI Gateway ({msg.model_used || selectedModel})</span>
                    </>
                  )}
                </div>
                <div style={styles.msgContent}>{msg.content}</div>
                {msg.role === 'assistant' && msg.latency_ms && (
                  <div style={styles.metaFooter}>
                    <span>{msg.latency_ms}ms</span>
                    <span>•</span>
                    <span>${(msg.cost || 0).toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ ...styles.msgWrapper, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.msgBubble, ...styles.botBubble }}>
              <div style={styles.msgHeader}>
                <Bot size={14} color="var(--accent-secondary)" />
                <span style={styles.msgRole}>Routing Request...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="streaming-dot"></span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Executing provider adapter handshake...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <div style={styles.inputContainer} className="glass-card">
          <input
            type="text"
            placeholder="Type a message or prompt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.chatInput}
          />
          <button type="submit" disabled={loading || !input.trim()} style={styles.sendBtn} className="btn-gradient">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-dark)',
    padding: '16px 24px',
    position: 'relative',
  },
  controlBar: {
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '16px',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  selectInput: {
    background: 'rgba(15, 21, 33, 0.9)',
    border: '1px solid var(--border-subtle)',
    color: '#fff',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    outline: 'none',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingRight: '8px',
  },
  welcomeHero: {
    margin: 'auto',
    textAlign: 'center',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '10px',
  },
  heroSub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureBadge: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
  },
  msgWrapper: {
    display: 'flex',
    width: '100%',
  },
  msgBubble: {
    maxWidth: '75%',
    padding: '14px 18px',
    borderRadius: '16px',
    fontSize: '14.5px',
    lineHeight: 1.5,
  },
  userBubble: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  botBubble: {
    background: 'rgba(24, 32, 50, 0.9)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-main)',
    borderBottomLeftRadius: '4px',
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  msgRole: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  msgContent: {
    whiteSpace: 'pre-wrap',
  },
  metaFooter: {
    marginTop: '8px',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  inputForm: {
    marginTop: '16px',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 6px 6px 16px',
    borderRadius: '14px',
  },
  chatInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14.5px',
    outline: 'none',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
  },
};
