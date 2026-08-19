import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { api } from '../services/api';

export default function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routingMode, setRoutingMode] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('[Dashboard] Failed to fetch conversations list:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConv = async (convId) => {
    setActiveConvId(convId);
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error(`[Dashboard] Failed to fetch messages for conversation ${convId}:`, err);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleSendMessage = async (content) => {
    const userMsg = { role: 'user', content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const payload = {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        model: selectedModel,
        routing_mode: routingMode,
        conversation_id: activeConvId,
      };

      const data = await api.sendMessage(payload);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        model_used: data.model_used,
        provider_used: data.provider_used,
        latency_ms: data.latency_ms,
        cost: data.cost,
        input_tokens: data.input_tokens,
        output_tokens: data.output_tokens
      }]);

      if (!activeConvId && data.conversation_id) {
        setActiveConvId(data.conversation_id);
        fetchConversations();
      }
    } catch (err) {
      console.error('[Dashboard] Chat completion request failed:', err);
      const errDetail = err.response?.data?.detail || err.message || 'Unknown network error';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Error Processing Request**\n\nFailed to route chat request through AI Gateway.\n\n\`\`\`text\n${errDetail}\n\`\`\``,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConv={handleSelectConv}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        routingMode={routingMode}
        setRoutingMode={setRoutingMode}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}
