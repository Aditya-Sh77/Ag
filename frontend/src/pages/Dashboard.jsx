import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';

export default function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routingMode, setRoutingMode] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConv = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
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

      const res = await api.post('/chat', payload);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.content,
        model_used: res.data.model_used,
        latency_ms: res.data.latency_ms,
        cost: res.data.cost
      }]);

      if (!activeConvId) {
        setActiveConvId(res.data.conversation_id);
        fetchConversations();
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Failed to route chat completion request through Gateway.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
